"""
File Search Tool for NEPA Advisor Agent.

Provides RAG capabilities using Google's File Search API to query
FSM/FSH regulatory documents.

Usage:
    from file_search import search_regulatory_documents

    result = search_regulatory_documents(
        query="What are the categorical exclusion requirements for timber salvage?",
        max_chunks=5
    )
"""

import json
import os
from pathlib import Path
from typing import Any

# Lazy import to avoid loading at module level
_client = None
_store_name = None


def _get_client():
    """Get or create Gemini client."""
    global _client
    if _client is None:
        try:
            from google import genai
            api_key = os.environ.get("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY environment variable not set")
            _client = genai.Client(api_key=api_key)
        except ImportError:
            raise ImportError("google-genai package not installed. Run: pip install google-genai")
    return _client


def _get_store_name() -> str:
    """Load store name from config file."""
    global _store_name
    if _store_name is None:
        config_path = Path(__file__).parent / "data" / ".file_search_store.json"
        if not config_path.exists():
            raise FileNotFoundError(
                f"File Search store not configured. Run: python scripts/setup_file_search.py\n"
                f"Expected config at: {config_path}"
            )
        with open(config_path) as f:
            config = json.load(f)
        _store_name = config["store_name"]
    return _store_name


def search_regulatory_documents(
    query: str,
    max_chunks: int = 5,
    include_citations: bool = True
) -> dict[str, Any]:
    """
    Search FSM/FSH regulatory documents using semantic search.

    Uses Google's File Search API to find relevant passages from the
    Forest Service Handbooks (FSH) and Manuals (FSM) indexed in the
    NEPA knowledge base.

    Args:
        query: Natural language query about NEPA, environmental analysis,
               categorical exclusions, or Forest Service procedures.
        max_chunks: Maximum number of document chunks to retrieve (1-10).
                   More chunks provide more context but use more tokens.
        include_citations: Whether to include source citations in results.

    Returns:
        Dictionary containing:
            - query: The original query
            - answer: Generated answer based on retrieved documents
            - citations: List of source citations (if include_citations=True)
            - chunks_retrieved: Number of document chunks used
            - status: "success" or "error"
            - error: Error message if status is "error"

    Example:
        >>> result = search_regulatory_documents(
        ...     "What size limits apply to categorical exclusions for salvage?"
        ... )
        >>> print(result["answer"])
        "According to FSH 1909.15 Chapter 30, categorical exclusions for
        timber salvage operations are limited to..."
    """
    try:
        from google.genai import types

        client = _get_client()
        store_name = _get_store_name()

        # Build the prompt for regulatory document search
        search_prompt = f"""Based on the Forest Service regulatory documents (FSH and FSM),
answer the following question. Cite specific handbook/manual sections when possible.

Question: {query}

Provide a clear, accurate answer based only on the regulatory documents.
If the documents don't contain relevant information, say so."""

        # Query with File Search tool
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=search_prompt,
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        file_search=types.FileSearch(
                            file_search_store_names=[store_name]
                        )
                    )
                ],
                temperature=0.2,  # Lower temperature for factual accuracy
            )
        )

        # Extract answer
        answer = response.text if response.text else "No answer generated."

        # Extract citations from grounding metadata
        citations = []
        if include_citations and hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                metadata = candidate.grounding_metadata
                # Extract grounding chunks if available
                if hasattr(metadata, 'grounding_chunks'):
                    for chunk in metadata.grounding_chunks[:max_chunks]:
                        citation = {}
                        if hasattr(chunk, 'retrieved_context'):
                            ctx = chunk.retrieved_context
                            if hasattr(ctx, 'title'):
                                citation['source'] = ctx.title
                            if hasattr(ctx, 'uri'):
                                citation['uri'] = ctx.uri
                        if hasattr(chunk, 'chunk') and hasattr(chunk.chunk, 'data'):
                            citation['text'] = chunk.chunk.data[:200] + "..."
                        if citation:
                            citations.append(citation)

                # Fallback to grounding supports
                if not citations and hasattr(metadata, 'grounding_supports'):
                    for support in metadata.grounding_supports[:max_chunks]:
                        citation = {}
                        if hasattr(support, 'segment') and hasattr(support.segment, 'text'):
                            citation['text'] = support.segment.text[:200]
                        if hasattr(support, 'grounding_chunk_indices'):
                            citation['chunk_indices'] = list(support.grounding_chunk_indices)
                        if citation:
                            citations.append(citation)

        return {
            "query": query,
            "answer": answer,
            "citations": citations,
            "chunks_retrieved": len(citations),
            "status": "success"
        }

    except FileNotFoundError as e:
        return {
            "query": query,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
            "status": "error",
            "error": str(e)
        }
    except Exception as e:
        return {
            "query": query,
            "answer": "",
            "citations": [],
            "chunks_retrieved": 0,
            "status": "error",
            "error": f"{type(e).__name__}: {e}"
        }


def get_store_info() -> dict[str, Any]:
    """
    Get information about the configured File Search store.

    Returns:
        Dictionary with store configuration details.
    """
    config_path = Path(__file__).parent / "data" / ".file_search_store.json"
    if not config_path.exists():
        return {
            "configured": False,
            "error": "File Search store not configured. Run setup_file_search.py"
        }

    with open(config_path) as f:
        config = json.load(f)

    return {
        "configured": True,
        "store_name": config.get("store_name"),
        "created_at": config.get("created_at"),
        "description": config.get("description"),
        "documents": config.get("documents", []),
        "model_requirement": config.get("model_requirement")
    }


# For testing
if __name__ == "__main__":
    print("File Search Store Info:")
    print("-" * 40)
    info = get_store_info()
    print(json.dumps(info, indent=2))

    if info.get("configured"):
        print()
        print("Testing search...")
        print("-" * 40)
        result = search_regulatory_documents(
            "What are the requirements for categorical exclusions?"
        )
        print(f"Status: {result['status']}")
        if result['status'] == 'success':
            print(f"Answer: {result['answer'][:500]}...")
            print(f"Citations: {len(result['citations'])}")
        else:
            print(f"Error: {result.get('error')}")
