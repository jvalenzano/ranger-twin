"""
NEPA Regulatory Knowledge Base Tool (Vertex AI RAG).

Provides RAG capabilities using Vertex AI RAG Engine to query
FSM/FSH regulatory documents.

MIGRATION NOTE: Migrated from File Search API to Vertex AI RAG Engine (ADR-010).
Legacy File Search configuration files have been removed.

Usage:
    from file_search import consult_mandatory_nepa_standards

    result = consult_mandatory_nepa_standards(
        query="What are the categorical exclusion requirements for timber salvage?",
        max_chunks=5
    )
"""

import json
import os
import re
from pathlib import Path
from typing import Any

# Lazy import to avoid loading at module level
_vertexai_initialized = False
_corpus_resource_id = None


def _get_vertexai_client():
    """Initialize Vertex AI client (lazy)."""
    global _vertexai_initialized
    if not _vertexai_initialized:
        try:
            import vertexai
            project = os.environ.get("GOOGLE_CLOUD_PROJECT", "ranger-twin-dev")
            # Use us-central1 for GenerativeModel (gemini-2.0-flash available)
            # RAG corpus is in europe-west3 but can be accessed cross-region
            location = "us-central1"
            vertexai.init(project=project, location=location)
            _vertexai_initialized = True
        except ImportError:
            raise ImportError(
                "google-cloud-aiplatform package not installed. "
                "Run: pip install google-cloud-aiplatform"
            )


def _extract_reasoning_steps(text: str) -> list[str]:
    """
    Extract reasoning steps from LLM response.

    Looks for REASONING: section with bullet points or numbered steps.

    Args:
        text: LLM response text

    Returns:
        List of 3-7 reasoning steps (empty list if not found)
    """
    # Look for REASONING: section until next section or end
    match = re.search(r'REASONING:\s*(.+?)(?:CONFIDENCE:|$)', text, re.DOTALL | re.IGNORECASE)

    if not match:
        return []

    reasoning_text = match.group(1).strip()

    # Extract bullet points or numbered items
    steps = []

    # Try bullet format first (- or *)
    bullet_steps = re.findall(r'[-*]\s*(?:Step \d+:\s*)?(.+?)(?=\n[-*]|\n\n|$)', reasoning_text, re.DOTALL)
    if bullet_steps:
        steps = [s.strip() for s in bullet_steps if s.strip()]
    else:
        # Try numbered format (1., 2., etc.)
        numbered_steps = re.findall(r'\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)', reasoning_text, re.DOTALL)
        if numbered_steps:
            steps = [s.strip() for s in numbered_steps if s.strip()]

    # Clean up steps: remove extra whitespace, limit length
    cleaned_steps = []
    for step in steps[:7]:  # Max 7 steps
        # Remove newlines within step, collapse whitespace
        cleaned = re.sub(r'\s+', ' ', step.strip())
        if 10 <= len(cleaned) <= 500:  # Reasonable step length
            cleaned_steps.append(cleaned)

    return cleaned_steps


def _extract_confidence_score(text: str) -> float:
    """
    Extract confidence score from LLM response.

    Looks for CONFIDENCE: 0.XX format.

    Args:
        text: LLM response text

    Returns:
        Float between 0.0 and 1.0 (default 0.75 if not found)
    """
    match = re.search(r'CONFIDENCE:\s*(0?\.\d+|1\.0)', text, re.IGNORECASE)

    if match:
        score = float(match.group(1))
        # Validate range
        return max(0.0, min(1.0, score))

    # Default confidence if not found
    return 0.75


def _get_corpus_resource_id() -> str:
    """Load corpus resource ID from .vertex_rag_config.json."""
    global _corpus_resource_id

    if _corpus_resource_id is None:
        config_path = Path(__file__).parent / "data" / ".vertex_rag_config.json"

        if not config_path.exists():
            raise FileNotFoundError(
                f"Vertex RAG corpus not configured at {config_path}. "
                f"Run: python knowledge/scripts/3_create_corpora.py"
            )

        with open(config_path) as f:
            config = json.load(f)

        _corpus_resource_id = config["corpus_resource_id"]

    return _corpus_resource_id


from agents._shared.rag_client import is_rag_available
from agents.nepa_advisor.skills.template_lookup import lookup_template


def consult_mandatory_nepa_standards(
    topic: str,
    max_chunks: int = 5,
    include_citations: bool = True
) -> dict[str, Any]:
    """
    [MANDATORY PREREQUISITE] Retrieves official FSM/FSH regulatory criteria.
    
    Graceful Fallback Mode: If Vertex RAG is unavailable (demo phase), 
    this tool falls back to embedded regulatory templates.

    MUST be called BEFORE requesting ANY clarifying details from the user.
    ...
    """
    # 1. Check for RAG availability
    if not is_rag_available():
        import logging
        logger = logging.getLogger(__name__)
        logger.info("[RAG-OFFLINE] Defaulting to embedded templates for NEPA Advisor")
        
        # Fallback to embedded knowledge
        fallback_result = lookup_template(topic)
        
        return {
            "query": topic,
            "answer": fallback_result.get("content", ""),
            "citations": fallback_result.get("citations", []),
            "chunks_retrieved": 0,
            "reasoning_chain": [
                "RAG system is offline (Demo Phase)",
                "Retrieved embedded regulatory guidance from FSH 1909.15"
            ],
            "confidence": 0.85,
            "status": "success",
            "source": "embedded_knowledge"  # Flag for Proof Layer
        }

    try:
        from vertexai.preview import rag
        from vertexai.preview.rag.utils.resources import RagRetrievalConfig

        # Initialize clients
        _get_vertexai_client()
        corpus_id = _get_corpus_resource_id()

        # Query Vertex RAG
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=corpus_id)],
            text=topic,
            rag_retrieval_config=RagRetrievalConfig(top_k=min(max_chunks, 10))
        )

        # Extract contexts and citations
        contexts = []
        citations = []

        for ctx in response.contexts.contexts:
            contexts.append({
                "text": ctx.text,
                "distance": ctx.distance,
                "relevance": 1.0 - ctx.distance
            })

            # Extract source URI if available
            if include_citations:
                source_uri = getattr(ctx, 'source_uri', None)
                if source_uri:
                    citations.append({
                        "source": source_uri,
                        "text": ctx.text[:200] + "..." if len(ctx.text) > 200 else ctx.text,
                        "relevance": 1.0 - ctx.distance
                    })

        # Generate answer using Gemini with ADC (Pattern A from spike)
        answer = ""
        reasoning_chain = []
        confidence = 0.75

        if contexts:
            try:
                from vertexai.generative_models import GenerativeModel

                # Combine contexts for generation
                context_text = "\n\n".join([
                    f"[Context {i+1}]\n{ctx['text']}"
                    for i, ctx in enumerate(contexts[:max_chunks])
                ])

                # Enhanced prompt for structured reasoning extraction
                prompt = f"""You are a NEPA compliance advisor analyzing Forest Service regulatory documents.

Retrieved FSM/FSH Documents:
{context_text}

Question: {topic}

Format your response EXACTLY as follows:

ANSWER: [Provide a clear, accurate answer based ONLY on the regulatory documents above. Cite specific FSM/FSH sections when possible. If the documents don't contain relevant information, state this clearly.]

REASONING:
- Step 1: [First logical step in your analysis]
- Step 2: [Second logical step]
- Step 3: [Third logical step]
[Continue with additional steps as needed, up to 7 total]

CONFIDENCE: [Provide a confidence score between 0.0 and 1.0 based on the relevance and completeness of the retrieved documents]"""

                # Use GenerativeModel with ADC (no API key needed)
                model = GenerativeModel("gemini-2.0-flash-001")

                gen_response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.2,  # Lower temperature for factual accuracy
                        "max_output_tokens": 1024
                    }
                )

                response_text = gen_response.text if gen_response.text else ""

                # Extract ANSWER section
                answer_match = re.search(r'ANSWER:\s*(.+?)(?=\n\nREASONING:|\nREASONING:|$)',
                                        response_text, re.DOTALL)
                if answer_match:
                    answer = answer_match.group(1).strip()
                else:
                    answer = response_text  # Fallback to full text

                # Extract reasoning steps
                reasoning_chain = _extract_reasoning_steps(response_text)

                # Extract confidence score
                confidence = _extract_confidence_score(response_text)

            except Exception as gen_error:
                # If generation fails, return contexts without answer
                answer = f"[Generation failed: {gen_error}. Contexts retrieved successfully.]"
                reasoning_chain = []
                confidence = 0.5

        else:
            answer = "No relevant regulatory documents found for this query."
            reasoning_chain = []
            confidence = 0.0

        return {
            "query": topic,
            "answer": answer,
            "contexts": contexts,
            "citations": citations,
            "chunks_retrieved": len(contexts),
            "reasoning_chain": reasoning_chain,  # NEW: For Proof Layer
            "confidence": confidence,  # NEW: For Proof Layer
            "status": "success"
        }

    except FileNotFoundError as e:
        return {
            "query": topic,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
            "reasoning_chain": [],
            "confidence": 0.0,
            "status": "error",
            "error": str(e)
        }
    except Exception as e:
        return {
            "query": topic,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
            "reasoning_chain": [],
            "confidence": 0.0,
            "status": "error",
            "error": f"{type(e).__name__}: {e}"
        }


def get_store_info() -> dict[str, Any]:
    """
    Get information about the configured Vertex RAG corpus.

    MIGRATION NOTE: Returns corpus info instead of File Search store.
    Function name preserved for backward compatibility.

    Returns:
        Dictionary with corpus configuration details.
    """
    config_path = Path(__file__).parent / "data" / ".vertex_rag_config.json"
    if not config_path.exists():
        return {
            "configured": False,
            "error": "Vertex RAG corpus not configured. Run: python knowledge/scripts/3_create_corpora.py"
        }

    with open(config_path) as f:
        config = json.load(f)

    return {
        "configured": True,
        "corpus_resource_id": config.get("corpus_resource_id"),
        "created_at": config.get("created_at"),
        "version": config.get("version"),
        "backend": "vertex_rag"  # Indicate migration
    }


def verify_store_health() -> dict[str, Any]:
    """
    Verify Vertex RAG corpus is accessible and returning results.

    Tests the corpus with a known query to ensure it's operational.
    This should be called before deployment to validate the search functionality.

    Returns:
        Dictionary with health status and diagnostics:
            - healthy: True if corpus is operational, False otherwise
            - corpus_resource_id: ID of the configured corpus
            - answer_preview: Preview of search results (if healthy)
            - citations_count: Number of citations returned (if healthy)
            - error: Error message (if unhealthy)
    """
    try:
        # Test with a known regulatory query
        result = consult_mandatory_nepa_standards(
            topic="categorical exclusion timber salvage",
            max_chunks=2
        )

        if result["status"] != "success":
            return {
                "healthy": False,
                "error": result.get("error", "Unknown error"),
                "corpus_resource_id": _get_corpus_resource_id() if _corpus_resource_id else "Not loaded"
            }

        # Verify response has meaningful content
        if not result.get("answer") or len(result["answer"]) < 50:
            return {
                "healthy": False,
                "error": "Corpus returned empty or minimal response",
                "answer_length": len(result.get("answer", "")),
                "corpus_resource_id": _get_corpus_resource_id()
            }

        return {
            "healthy": True,
            "corpus_resource_id": _get_corpus_resource_id(),
            "answer_preview": result["answer"][:200] + "...",
            "citations_count": len(result.get("citations", []))
        }

    except Exception as e:
        return {
            "healthy": False,
            "error": f"{type(e).__name__}: {e}"
        }


# For testing
if __name__ == "__main__":
    print("Vertex RAG Corpus Info:")
    print("-" * 40)
    info = get_store_info()
    print(json.dumps(info, indent=2))

    if info.get("configured"):
        print()
        print("Testing search...")
        print("-" * 40)
        result = consult_mandatory_nepa_standards(
            topic="What are the requirements for categorical exclusions?"
        )
        print(f"Status: {result['status']}")
        if result['status'] == 'success':
            print(f"Answer: {result['answer'][:500]}...")
            print(f"Citations: {len(result['citations'])}")
        else:
            print(f"Error: {result.get('error')}")
