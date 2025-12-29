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
from pathlib import Path
from typing import Any

# Lazy import to avoid loading at module level
_vertexai_initialized = False
_genai_client = None
_corpus_resource_id = None


def _get_vertexai_client():
    """Initialize Vertex AI client (lazy)."""
    global _vertexai_initialized
    if not _vertexai_initialized:
        try:
            import vertexai
            project = os.environ.get("GOOGLE_CLOUD_PROJECT", "ranger-twin-dev")
            location = os.environ.get("GOOGLE_CLOUD_LOCATION", "europe-west3")
            vertexai.init(project=project, location=location)
            _vertexai_initialized = True
        except ImportError:
            raise ImportError(
                "google-cloud-aiplatform package not installed. "
                "Run: pip install google-cloud-aiplatform"
            )


def _get_genai_client():
    """Get or create Gemini client."""
    global _genai_client
    if _genai_client is None:
        try:
            from google import genai
            api_key = os.environ.get("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError(
                    "GOOGLE_API_KEY environment variable not set. "
                    "Required for Gemini generation."
                )
            _genai_client = genai.Client(api_key=api_key)
        except ImportError:
            raise ImportError("google-genai package not installed. Run: pip install google-genai")
    return _genai_client


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


def consult_mandatory_nepa_standards(
    topic: str,
    max_chunks: int = 5,
    include_citations: bool = True
) -> dict[str, Any]:
    """
    [MANDATORY PREREQUISITE] Retrieves official FSM/FSH regulatory criteria.

    MUST be called BEFORE requesting ANY clarifying details from the user.
    Returns current acreage thresholds, CE categories, extraordinary circumstances
    criteria, and the specific data points required for pathway determination.

    Without calling this first, you cannot know which questions to ask the user.
    Your internal training data on NEPA thresholds is DEPRECATED and unreliable.

    Uses Vertex AI RAG Engine to find relevant passages from the
    Forest Service Handbooks (FSH) and Manuals (FSM) indexed in the
    NEPA knowledge base corpus.

    Args:
        topic: The regulatory topic to retrieve (e.g., "categorical exclusion
               timber salvage acreage thresholds 36 CFR 220.6"). Frame your
               query to find the specific regulations that govern the user's question.
        max_chunks: Maximum number of document chunks to retrieve (1-10).
                   More chunks provide more context but use more tokens.
        include_citations: Whether to include source citations in results.

    Returns:
        Dictionary containing:
            - query: The original query topic
            - answer: Generated answer based on retrieved regulations
            - citations: List of FSM/FSH source citations (if include_citations=True)
            - chunks_retrieved: Number of document chunks used
            - status: "success" or "error"
            - error: Error message if status is "error"

    Example:
        >>> result = consult_mandatory_nepa_standards(
        ...     topic="categorical exclusion timber salvage acreage thresholds 36 CFR 220.6"
        ... )
        >>> print(result["answer"])
        "According to FSM 1950, categorical exclusions for hazard tree removal
        apply to projects up to 3,000 acres..."
    """
    try:
        from vertexai.preview import rag
        from google.genai import types

        # Initialize clients
        _get_vertexai_client()
        corpus_id = _get_corpus_resource_id()

        # Query Vertex RAG
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=corpus_id)],
            text=topic,
            similarity_top_k=min(max_chunks, 10)  # Max 10
        )

        # Extract contexts and citations
        contexts = []
        citations = []

        for ctx in response.contexts:
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

        # Generate answer using Gemini (RAG doesn't auto-generate like File Search)
        answer = ""
        if contexts:
            try:
                client = _get_genai_client()

                # Combine contexts for generation
                context_text = "\n\n".join([
                    f"[Context {i+1}]\n{ctx['text']}"
                    for i, ctx in enumerate(contexts[:max_chunks])
                ])

                # Build prompt for regulatory answer
                prompt = f"""Based on the Forest Service regulatory documents (FSH and FSM),
answer the following question. Cite specific handbook/manual sections when possible.

Context from Regulatory Documents:
{context_text}

Question: {topic}

Provide a clear, accurate answer based only on the regulatory documents above.
If the documents don't contain relevant information, say so."""

                # Generate answer
                gen_response = client.models.generate_content(
                    model="gemini-2.0-flash-001",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,  # Lower temperature for factual accuracy
                        max_output_tokens=1024
                    )
                )

                answer = gen_response.text if gen_response.text else "No answer generated."

            except Exception as gen_error:
                # If generation fails, return contexts without answer
                answer = f"[Generation failed: {gen_error}. Contexts retrieved successfully.]"

        else:
            answer = "No relevant regulatory documents found for this query."

        return {
            "query": topic,
            "answer": answer,
            "citations": citations,
            "chunks_retrieved": len(contexts),
            "status": "success"
        }

    except FileNotFoundError as e:
        return {
            "query": topic,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
            "status": "error",
            "error": str(e)
        }
    except Exception as e:
        return {
            "query": topic,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
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
