"""
RAG Query Tool Template for RANGER Agents

This template provides a reusable pattern for querying Vertex AI RAG corpora.
Copy this file to each agent directory and customize the docstrings.

Usage in agent.py:
    from rag_query import query_knowledge_base

    def consult_domain_standards(topic: str, max_chunks: int = 5) -> dict:
        '''Query domain-specific knowledge base.'''
        return query_knowledge_base(query=topic, top_k=max_chunks)

ADK Compatibility:
    - Uses only simple parameter types (str, int) - REQUIRED for ADK
    - Returns dict (complex return types are allowed)
    - No list[dict] or dict parameters (causes Gemini API errors)
"""

import json
import os
from pathlib import Path
from typing import Any

try:
    import vertexai
    from vertexai.preview import rag
    from google import genai
    from google.genai import types
except ImportError as e:
    raise ImportError(
        f"Required package not installed: {e}. "
        "Install: pip install google-cloud-aiplatform google-genai"
    )


# Global state (lazy initialization)
_vertexai_initialized = False
_genai_client = None
_corpus_resource_id = None


def _get_vertexai_client():
    """Initialize Vertex AI client (lazy)."""
    global _vertexai_initialized
    if not _vertexai_initialized:
        project = os.environ.get("GOOGLE_CLOUD_PROJECT", "ranger-twin-dev")
        location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-east4")
        vertexai.init(project=project, location=location)
        _vertexai_initialized = True


def _get_genai_client():
    """Get or create Gemini client (lazy)."""
    global _genai_client
    if _genai_client is None:
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY environment variable not set. "
                "Required for Gemini generation."
            )
        _genai_client = genai.Client(api_key=api_key)
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


def query_knowledge_base(
    query: str,
    top_k: int = 5,
    include_answer: bool = True
) -> dict[str, Any]:
    """
    Query domain-specific knowledge base using Vertex AI RAG.

    **IMPORTANT**: This function uses simple parameter types (str, int, bool)
    for ADK compatibility. Do NOT change to list[dict] or dict parameters.

    Args:
        query: Natural language query about domain expertise
        top_k: Number of document chunks to retrieve (1-10)
        include_answer: If True, generate answer using Gemini (recommended)

    Returns:
        Dictionary containing:
            - query (str): Original query
            - answer (str): Generated answer (if include_answer=True)
            - contexts (list[dict]): Retrieved document chunks with text and relevance
            - citations (list[dict]): Source citations with URIs
            - chunks_retrieved (int): Number of chunks returned
            - status (str): "success" or "error"
            - error (str): Error message (only if status="error")

    Example:
        >>> result = query_knowledge_base("What are the CE criteria?", top_k=3)
        >>> print(result["answer"])
        >>> for citation in result["citations"]:
        ...     print(f"Source: {citation['source']}")
    """
    try:
        # Initialize clients
        _get_vertexai_client()
        corpus_id = _get_corpus_resource_id()

        # Query Vertex RAG
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=corpus_id)],
            text=query,
            similarity_top_k=min(top_k, 10)  # Max 10
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
            source_uri = getattr(ctx, 'source_uri', None)
            if source_uri:
                citations.append({
                    "source": source_uri,
                    "relevance": 1.0 - ctx.distance
                })

        # Generate answer using Gemini (if requested)
        answer = ""
        if include_answer and contexts:
            try:
                # Combine contexts for generation
                context_text = "\n\n".join([
                    f"[Context {i+1}]\n{ctx['text']}"
                    for i, ctx in enumerate(contexts[:top_k])
                ])

                # Generate answer
                client = _get_genai_client()
                prompt = f"""Based on the following regulatory and technical documents, answer this question. Cite specific sections when possible.

Context:
{context_text}

Question: {query}

Provide a clear, concise answer based on the context provided."""

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
                # If generation fails, return context without answer
                answer = f"[Generation failed: {gen_error}]"

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
