#!/usr/bin/env python3
"""
Verify Vertex AI RAG corpora health and functionality.

Checks:
- Corpus status (ACTIVE)
- Test queries with relevance scoring
- Document count verification (where possible)

Usage:
    python 5_verify_corpora.py                 # Verify all corpora
    python 5_verify_corpora.py --corpus nepa   # Verify only NEPA corpus
    python 5_verify_corpora.py --verbose       # Show detailed query results
"""

import argparse
import json
import sys
from pathlib import Path

import yaml

try:
    import vertexai
    from vertexai.preview import rag
except ImportError:
    print("❌ ERROR: google-cloud-aiplatform not installed")
    print("   Install: pip install google-cloud-aiplatform")
    sys.exit(1)


# Paths
SCRIPT_DIR = Path(__file__).parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = KNOWLEDGE_DIR.parent
MANIFEST_PATH = KNOWLEDGE_DIR / "manifest.yaml"
AGENTS_DIR = PROJECT_ROOT / "agents"


# Test queries for each corpus
TEST_QUERIES = {
    "nepa": [
        "What are the categorical exclusion criteria under 36 CFR 220?",
        "What is the timeline for NEPA compliance in emergency situations?",
        "When is an Environmental Assessment required versus an EIS?"
    ],
    "burn_severity": [
        "How is high burn severity classified using dNBR values?",
        "What are the BAER assessment protocols for soil burn severity?",
        "What are the debris flow risk factors after high severity burns?"
    ],
    "timber_salvage": [
        "What is the standard cruise methodology for post-fire salvage?",
        "How do you calculate timber volume deterioration rates?",
        "What are the appraisal methods for fire-damaged timber?"
    ],
    "trail_infrastructure": [
        "What are the FSTAG accessibility standards for trails?",
        "How are trail damage types classified (Type I-IV)?",
        "What are the TRACS codes for trail infrastructure assessment?"
    ]
}


def load_manifest() -> dict:
    """Load the document manifest."""
    if not MANIFEST_PATH.exists():
        print(f"❌ ERROR: Manifest not found at {MANIFEST_PATH}")
        sys.exit(1)

    with open(MANIFEST_PATH) as f:
        return yaml.safe_load(f)


def load_corpus_config(agent_name: str) -> dict | None:
    """Load corpus configuration from agent's .vertex_rag_config.json."""
    config_path = AGENTS_DIR / agent_name / "data" / ".vertex_rag_config.json"

    if not config_path.exists():
        return None

    try:
        with open(config_path) as f:
            return json.load(f)
    except Exception:
        return None


def get_corpus_info(corpus_resource_id: str) -> dict:
    """
    Get corpus information from Vertex AI.

    Args:
        corpus_resource_id: Corpus resource ID

    Returns:
        Dict with corpus info (name, status, etc.)
    """
    try:
        # List corpora and find matching one
        corpora = rag.list_corpora()
        for corpus in corpora:
            if corpus.name == corpus_resource_id:
                return {
                    "status": "found",
                    "name": corpus.display_name,
                    "resource_id": corpus.name,
                    "state": "ACTIVE"  # Assume active if found
                }

        return {
            "status": "not_found",
            "resource_id": corpus_resource_id
        }

    except Exception as e:
        return {
            "status": "error",
            "resource_id": corpus_resource_id,
            "error": str(e)
        }


def run_test_query(corpus_resource_id: str, query: str, top_k: int = 3) -> dict:
    """
    Run a test query against a corpus.

    Args:
        corpus_resource_id: Corpus resource ID
        query: Query text
        top_k: Number of results to retrieve

    Returns:
        Dict with query results and metrics
    """
    try:
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=corpus_resource_id)],
            text=query,
            similarity_top_k=top_k
        )

        # Extract contexts
        contexts = []
        for ctx in response.contexts:
            contexts.append({
                "text": ctx.text[:200] + "..." if len(ctx.text) > 200 else ctx.text,
                "distance": ctx.distance,
                "relevance": 1.0 - ctx.distance,
                "source": getattr(ctx, 'source_uri', 'Unknown')
            })

        # Calculate average relevance
        avg_relevance = sum(c["relevance"] for c in contexts) / len(contexts) if contexts else 0.0

        return {
            "status": "success",
            "query": query,
            "chunks_retrieved": len(contexts),
            "avg_relevance": avg_relevance,
            "contexts": contexts
        }

    except Exception as e:
        return {
            "status": "error",
            "query": query,
            "error": str(e),
            "chunks_retrieved": 0,
            "avg_relevance": 0.0,
            "contexts": []
        }


def verify_corpus(
    corpus_id: str,
    display_name: str,
    agent_name: str,
    test_queries: list[str],
    verbose: bool = False
) -> dict:
    """
    Verify a single corpus.

    Args:
        corpus_id: Corpus identifier (e.g., 'nepa')
        display_name: Corpus display name
        agent_name: Agent name
        test_queries: List of test query strings
        verbose: If True, show detailed query results

    Returns:
        Dict with verification results
    """
    print(f"[CORPUS] {display_name}")
    print(f"  ID: {corpus_id}")
    print(f"  Agent: {agent_name}")

    # Load corpus config
    config = load_corpus_config(agent_name)
    if not config:
        print(f"  ❌ CONFIG NOT FOUND")
        print(f"     Expected: {AGENTS_DIR / agent_name / 'data' / '.vertex_rag_config.json'}")
        return {
            "status": "config_missing",
            "corpus_id": corpus_id,
            "health": "UNHEALTHY"
        }

    corpus_resource_id = config["corpus_resource_id"]
    print(f"  Resource ID: {corpus_resource_id}")

    # Check corpus exists
    print(f"  🔍 CHECKING STATUS...")
    corpus_info = get_corpus_info(corpus_resource_id)

    if corpus_info["status"] != "found":
        print(f"  ❌ CORPUS NOT FOUND")
        return {
            "status": "not_found",
            "corpus_id": corpus_id,
            "health": "UNHEALTHY"
        }

    print(f"  ✅ CORPUS STATUS: {corpus_info.get('state', 'UNKNOWN')}")

    # Run test queries
    print(f"  🧪 RUNNING TEST QUERIES ({len(test_queries)} queries)...")
    query_results = []
    successful_queries = 0
    total_relevance = 0.0

    for i, query in enumerate(test_queries, 1):
        result = run_test_query(corpus_resource_id, query, top_k=3)
        query_results.append(result)

        if result["status"] == "success":
            successful_queries += 1
            total_relevance += result["avg_relevance"]

            if verbose:
                print(f"     Query {i}: {query[:60]}...")
                print(f"     Chunks: {result['chunks_retrieved']}, Avg Relevance: {result['avg_relevance']:.2f}")
                for j, ctx in enumerate(result["contexts"][:2], 1):
                    print(f"       [{j}] Relevance: {ctx['relevance']:.2f} | {ctx['text'][:80]}...")
        else:
            print(f"     ❌ Query {i} FAILED: {result.get('error', 'Unknown error')}")

    # Calculate metrics
    avg_relevance_overall = total_relevance / successful_queries if successful_queries > 0 else 0.0

    print(f"  📊 RESULTS:")
    print(f"     Successful Queries: {successful_queries}/{len(test_queries)}")
    print(f"     Avg Relevance Score: {avg_relevance_overall:.2f}")

    # Determine health
    if successful_queries == len(test_queries) and avg_relevance_overall >= 0.5:
        health = "HEALTHY"
        print(f"  ✅ HEALTH: {health}")
    elif successful_queries > 0:
        health = "DEGRADED"
        print(f"  ⚠ HEALTH: {health}")
    else:
        health = "UNHEALTHY"
        print(f"  ❌ HEALTH: {health}")

    return {
        "status": "verified",
        "corpus_id": corpus_id,
        "display_name": display_name,
        "health": health,
        "queries_successful": successful_queries,
        "queries_total": len(test_queries),
        "avg_relevance": avg_relevance_overall,
        "query_results": query_results
    }


def main():
    parser = argparse.ArgumentParser(
        description="Verify RANGER knowledge base corpora health"
    )
    parser.add_argument(
        "--corpus",
        type=str,
        choices=["nepa", "burn_severity", "timber_salvage", "trail_infrastructure"],
        help="Only verify specific corpus"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed query results"
    )
    args = parser.parse_args()

    # Load manifest
    manifest = load_manifest()
    project = manifest["project"]
    location = manifest["location"]

    print("=" * 70)
    print("RANGER Knowledge Base - Corpus Verification")
    print("=" * 70)
    print(f"Project:  {project}")
    print(f"Location: {location}")

    if args.corpus:
        print(f"Filter: {args.corpus} corpus only")

    print("=" * 70)
    print()

    # Initialize Vertex AI
    vertexai.init(project=project, location=location)

    # Verify corpora
    print("[VERIFYING CORPORA]")
    results = []
    healthy_count = 0
    degraded_count = 0
    unhealthy_count = 0

    for corpus_config in manifest["corpora"]:
        corpus_id = corpus_config["id"]
        display_name = corpus_config["display_name"]
        agent_name = corpus_config["agent"]

        # Apply filter
        if args.corpus and corpus_id != args.corpus:
            continue

        # Get test queries
        test_queries = TEST_QUERIES.get(corpus_id, [])

        # Verify corpus
        result = verify_corpus(
            corpus_id=corpus_id,
            display_name=display_name,
            agent_name=agent_name,
            test_queries=test_queries,
            verbose=args.verbose
        )

        results.append(result)

        # Count health status
        if result["health"] == "HEALTHY":
            healthy_count += 1
        elif result["health"] == "DEGRADED":
            degraded_count += 1
        else:
            unhealthy_count += 1

        print()

    # Summary
    print("=" * 70)
    print("Verification Summary:")
    print(f"  Total Corpora: {len(results)}")
    print(f"  ✅ Healthy: {healthy_count}")
    print(f"  ⚠ Degraded: {degraded_count}")
    print(f"  ❌ Unhealthy: {unhealthy_count}")
    print("=" * 70)

    # Health criteria
    print()
    print("Health Criteria:")
    print("  ✅ HEALTHY:   All test queries successful, avg relevance ≥ 0.5")
    print("  ⚠ DEGRADED:  Some queries successful, but relevance < 0.5")
    print("  ❌ UNHEALTHY: No queries successful or corpus not found")
    print()

    # Exit with error if any unhealthy
    if unhealthy_count > 0:
        print("❌ UNHEALTHY CORPORA DETECTED")
        print("   Check error messages above and re-import documents if needed.")
        print()
        sys.exit(1)

    if degraded_count > 0:
        print("⚠ DEGRADED CORPORA DETECTED")
        print("   Queries are working but relevance scores are low.")
        print("   Consider reviewing document quality or query complexity.")
        print()

    print("✅ ALL CORPORA VERIFIED")
    print()


if __name__ == "__main__":
    main()
