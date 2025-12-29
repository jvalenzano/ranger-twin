"""
Trail Infrastructure Knowledge Base Tool (Vertex AI RAG).

Provides RAG capabilities for FSTAG accessibility standards, trail damage
classification, TRACS codes, and recreation infrastructure assessment.

Usage:
    from rag_query import query_trail_infrastructure_knowledge

    result = query_trail_infrastructure_knowledge(
        query="What are the FSTAG accessibility standards for trail grades?",
        top_k=5
    )
"""

import json
import os
from pathlib import Path
from typing import Any

# Lazy initialization
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


def query_trail_infrastructure_knowledge(
    query: str,
    top_k: int = 5,
    include_answer: bool = True
) -> dict[str, Any]:
    """
    Query trail infrastructure knowledge base using Vertex AI RAG.

    Retrieves technical guidance on FSTAG standards, trail damage classification
    (Type I-IV), TRACS codes, recreation priority, and accessibility requirements.

    **ADK Compatible**: Uses only simple parameter types (str, int, bool).

    Args:
        query: Natural language query about trail infrastructure assessment
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
        >>> result = query_trail_infrastructure_knowledge(
        ...     "What are the damage classification criteria for Type III trail damage?"
        ... )
        >>> print(result["answer"])
    """
    try:
        from vertexai.preview import rag
        from vertexai.preview.rag.utils.resources import RagRetrievalConfig
        from google.genai import types

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

        # Generate answer using Gemini
        answer = ""
        if include_answer and contexts:
            try:
                client = _get_genai_client()

                context_text = "\n\n".join([
                    f"[Context {i+1}]\n{ctx['text']}"
                    for i, ctx in enumerate(contexts[:top_k])
                ])

                prompt = f"""Based on Forest Service trail infrastructure technical documents (FSTAG, TRACS, damage classification standards),
answer the following question. Cite specific standards, codes, or classification criteria when possible.

Context:
{context_text}

Question: {query}

Provide a clear, technical answer based on the Forest Service standards and protocols in the context."""

                gen_response = client.models.generate_content(
                    model="gemini-2.0-flash-001",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        max_output_tokens=1024
                    )
                )

                answer = gen_response.text if gen_response.text else "No answer generated."

            except Exception as gen_error:
                answer = f"[Generation failed: {gen_error}. Contexts retrieved successfully.]"
        else:
            answer = "No relevant trail infrastructure documents found for this query."

        return {
            "query": query,
            "answer": answer,
            "contexts": contexts,
            "citations": citations,
            "chunks_retrieved": len(contexts),
            "status": "success"
        }

    except Exception as e:
        return {
            "query": query,
            "answer": "",
            "contexts": [],
            "citations": [],
            "chunks_retrieved": 0,
            "status": "error",
            "error": f"{type(e).__name__}: {str(e)}"
        }
