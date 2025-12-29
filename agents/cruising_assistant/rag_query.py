"""
Timber Salvage Knowledge Base Tool (Vertex AI RAG).

Provides RAG capabilities for timber cruising methodology, salvage assessment,
volume estimation, deterioration rates, and appraisal standards.

Usage:
    from rag_query import query_timber_salvage_knowledge

    result = query_timber_salvage_knowledge(
        query="What is the standard cruise methodology for post-fire salvage?",
        top_k=5
    )
"""

import json
import os
import re
from pathlib import Path
from typing import Any

# Lazy initialization
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
    """Extract reasoning steps from LLM response."""
    match = re.search(r'REASONING:\s*(.+?)(?:CONFIDENCE:|$)', text, re.DOTALL | re.IGNORECASE)
    if not match:
        return []

    reasoning_text = match.group(1).strip()
    steps = []

    bullet_steps = re.findall(r'[-*]\s*(?:Step \d+:\s*)?(.+?)(?=\n[-*]|\n\n|$)', reasoning_text, re.DOTALL)
    if bullet_steps:
        steps = [s.strip() for s in bullet_steps if s.strip()]
    else:
        numbered_steps = re.findall(r'\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)', reasoning_text, re.DOTALL)
        if numbered_steps:
            steps = [s.strip() for s in numbered_steps if s.strip()]

    cleaned_steps = []
    for step in steps[:7]:
        cleaned = re.sub(r'\s+', ' ', step.strip())
        if 10 <= len(cleaned) <= 500:
            cleaned_steps.append(cleaned)

    return cleaned_steps


def _extract_confidence_score(text: str) -> float:
    """Extract confidence score from LLM response."""
    match = re.search(r'CONFIDENCE:\s*(0?\.\d+|1\.0)', text, re.IGNORECASE)
    if match:
        score = float(match.group(1))
        return max(0.0, min(1.0, score))
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


def query_timber_salvage_knowledge(
    query: str,
    top_k: int = 5,
    include_answer: bool = True
) -> dict[str, Any]:
    """
    Query timber salvage knowledge base using Vertex AI RAG.

    Retrieves technical guidance on FSH 2409.12 cruising protocols, volume
    estimation methods, deterioration rates, salvage appraisal, and sampling.

    **ADK Compatible**: Uses only simple parameter types (str, int, bool).

    Args:
        query: Natural language query about timber salvage assessment
        top_k: Number of document chunks to retrieve (1-10)
        include_answer: If True, generate answer using Gemini (recommended)

    Returns:
        Dictionary containing:
            - query (str): Original query
            - answer (str): Generated answer (if include_answer=True)
            - contexts (list[dict]): Retrieved document chunks
            - citations (list[dict]): Source citations
            - chunks_retrieved (int): Number of chunks returned
            - status (str): "success" or "error"

    Example:
        >>> result = query_timber_salvage_knowledge(
        ...     "How do you calculate timber volume deterioration rates?"
        ... )
        >>> print(result["answer"])
    """
    try:
        from vertexai.preview import rag
        from vertexai.preview.rag.utils.resources import RagRetrievalConfig

        # Initialize clients
        _get_vertexai_client()
        corpus_id = _get_corpus_resource_id()

        # Query Vertex RAG
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=corpus_id)],
            text=query,
            rag_retrieval_config=RagRetrievalConfig(top_k=min(top_k, 10))
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

            source_uri = getattr(ctx, 'source_uri', None)
            if source_uri:
                citations.append({
                    "source": source_uri,
                    "relevance": 1.0 - ctx.distance
                })

        # Generate answer using Gemini with ADC (Pattern A)
        answer = ""
        reasoning_chain = []
        confidence = 0.75

        if include_answer and contexts:
            try:
                from vertexai.generative_models import GenerativeModel

                context_text = "\n\n".join([
                    f"[Context {i+1}]\n{ctx['text']}"
                    for i, ctx in enumerate(contexts[:top_k])
                ])

                prompt = f"""You are a timber cruising and salvage assessment specialist analyzing Forest Service technical documents.

Retrieved Technical Documents:
{context_text}

Question: {query}

Format your response EXACTLY as follows:

ANSWER: [Provide a clear, technical answer based on FSH 2409.12, appraisal handbooks, and protocols above. Cite specific methodologies, formulas, or standards when possible.]

REASONING:
- Step 1: [First logical step in your analysis]
- Step 2: [Second logical step]
- Step 3: [Third logical step]
[Continue with additional steps as needed, up to 7 total]

CONFIDENCE: [Provide a confidence score between 0.0 and 1.0 based on the relevance and completeness of the retrieved documents]"""

                model = GenerativeModel("gemini-2.0-flash-001")

                gen_response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.2,
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
                    answer = response_text

                # Extract reasoning and confidence
                reasoning_chain = _extract_reasoning_steps(response_text)
                confidence = _extract_confidence_score(response_text)

            except Exception as gen_error:
                answer = f"[Generation failed: {gen_error}. Contexts retrieved successfully.]"
                reasoning_chain = []
                confidence = 0.5
        else:
            answer = "No relevant timber salvage documents found for this query."
            reasoning_chain = []
            confidence = 0.0

        return {
            "query": query,
            "answer": answer,
            "contexts": contexts,
            "citations": citations,
            "chunks_retrieved": len(contexts),
            "reasoning_chain": reasoning_chain,  # NEW: For Proof Layer
            "confidence": confidence,  # NEW: For Proof Layer
            "status": "success"
        }

    except Exception as e:
        return {
            "query": query,
            "answer": "",
            "contexts": [],
            "citations": [],
            "chunks_retrieved": 0,
            "reasoning_chain": [],
            "confidence": 0.0,
            "status": "error",
            "error": f"{type(e).__name__}: {str(e)}"
        }
