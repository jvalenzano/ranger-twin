#!/usr/bin/env python3
"""
Import documents from GCS into Vertex AI RAG corpora.

Imports documents with chunking configuration:
- Chunk size: 512 tokens
- Chunk overlap: 100 tokens
- Rate limit: 800 embedding requests per minute

Usage:
    python 4_import_documents.py                 # Import all documents
    python 4_import_documents.py --tier 1        # Import only Tier 1
    python 4_import_documents.py --corpus nepa   # Import only NEPA corpus
"""

import argparse
import json
import os
import sys
import time
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
        print(f"  ⚠ WARNING: Corpus config not found for {agent_name}")
        print(f"     Expected: {config_path}")
        print(f"     Run: python 3_create_corpora.py")
        return None

    try:
        with open(config_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"  ❌ ERROR: Failed to load config for {agent_name}: {e}")
        return None


def get_corpus_documents(corpus_id: str, documents: list, tier_filter: int | None = None) -> list:
    """
    Get all documents for a corpus, optionally filtered by tier.

    Args:
        corpus_id: Corpus identifier (e.g., 'nepa')
        documents: List of all documents from manifest
        tier_filter: If set, only return documents of this tier

    Returns:
        List of documents for this corpus
    """
    corpus_docs = []
    for doc in documents:
        if doc["corpus"] == corpus_id:
            if tier_filter is None or doc.get("tier") == tier_filter:
                corpus_docs.append(doc)
    return corpus_docs


def import_documents_to_corpus(
    corpus_resource_id: str,
    gcs_bucket: str,
    gcs_path: str,
    documents: list,
    chunk_size: int,
    chunk_overlap: int,
    max_embedding_requests_per_min: int = 800
) -> dict:
    """
    Import documents from GCS into a Vertex RAG corpus.

    Args:
        corpus_resource_id: Vertex RAG corpus resource ID
        gcs_bucket: GCS bucket name (e.g., 'ranger-knowledge-base')
        gcs_path: Subfolder path in bucket (e.g., 'nepa/')
        documents: List of document metadata from manifest
        chunk_size: Tokens per chunk
        chunk_overlap: Overlap tokens
        max_embedding_requests_per_min: Rate limit for embeddings

    Returns:
        Dict with import statistics
    """
    if not documents:
        return {"status": "skipped", "files": 0, "message": "No documents to import"}

    # Build GCS URIs
    gcs_uris = []
    for doc in documents:
        uri = f"gs://{gcs_bucket}/{gcs_path}{doc['filename']}"
        gcs_uris.append(uri)

    print(f"     Documents: {len(gcs_uris)}")
    print(f"     Chunk Size: {chunk_size} tokens")
    print(f"     Chunk Overlap: {chunk_overlap} tokens")
    print(f"     Rate Limit: {max_embedding_requests_per_min} req/min")

    try:
        print(f"  🔄 IMPORTING...")

        # Import files to corpus
        response = rag.import_files(
            corpus_name=corpus_resource_id,
            paths=gcs_uris,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            max_embedding_requests_per_min=max_embedding_requests_per_min
        )

        print(f"  ⏳ PROCESSING: Import job started")
        print(f"     Operation: {response.operation.name if hasattr(response, 'operation') else 'N/A'}")

        # Poll for completion
        start_time = time.time()
        timeout = 600  # 10 minutes max
        poll_interval = 10  # Check every 10 seconds

        while True:
            elapsed = time.time() - start_time

            if elapsed > timeout:
                print(f"  ⚠ TIMEOUT: Import took longer than {timeout}s")
                return {
                    "status": "timeout",
                    "files": len(gcs_uris),
                    "message": "Import timeout - may still complete in background"
                }

            # Check if operation has an attribute indicating completion
            if hasattr(response, 'done') and callable(response.done):
                if response.done():
                    print(f"  ✅ IMPORT COMPLETE: {len(gcs_uris)} documents imported")
                    return {
                        "status": "success",
                        "files": len(gcs_uris),
                        "elapsed_seconds": int(elapsed)
                    }
            elif hasattr(response, 'operation'):
                # For LRO (Long Running Operation), check operation status
                if hasattr(response.operation, 'done') and response.operation.done:
                    print(f"  ✅ IMPORT COMPLETE: {len(gcs_uris)} documents imported")
                    return {
                        "status": "success",
                        "files": len(gcs_uris),
                        "elapsed_seconds": int(elapsed)
                    }

            # If no completion indicator, assume success after response received
            # (Some RAG API versions return synchronously)
            if elapsed < 5:  # Give it a few seconds to check
                time.sleep(poll_interval)
                print(f"     Polling... ({int(elapsed)}s elapsed)")
            else:
                print(f"  ✅ IMPORT INITIATED: {len(gcs_uris)} documents")
                print(f"     Note: Import may continue in background")
                return {
                    "status": "initiated",
                    "files": len(gcs_uris),
                    "elapsed_seconds": int(elapsed)
                }

    except Exception as e:
        error_msg = str(e)

        # Check for rate limiting
        if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
            print(f"  ⚠ RATE LIMITED: {error_msg}")
            return {
                "status": "rate_limited",
                "files": 0,
                "message": "Reduce max_embedding_requests_per_min or wait and retry"
            }

        # Check for file not found
        if "not found" in error_msg.lower() or "404" in error_msg:
            print(f"  ❌ IMPORT FAILED: Files not found in GCS")
            print(f"     Error: {error_msg}")
            return {
                "status": "not_found",
                "files": 0,
                "message": "Run python 2_sync_to_gcs.py first"
            }

        print(f"  ❌ IMPORT FAILED: {error_msg}")
        return {
            "status": "error",
            "files": 0,
            "message": error_msg
        }


def main():
    parser = argparse.ArgumentParser(
        description="Import RANGER knowledge base documents to Vertex AI RAG"
    )
    parser.add_argument(
        "--tier",
        type=int,
        choices=[1, 2],
        help="Only import specific tier (1 or 2)"
    )
    parser.add_argument(
        "--corpus",
        type=str,
        choices=["nepa", "burn_severity", "timber_salvage", "trail_infrastructure"],
        help="Only import specific corpus"
    )
    args = parser.parse_args()

    # Load manifest
    manifest = load_manifest()
    project = manifest["project"]
    location = manifest["location"]
    gcs_bucket = manifest["gcs_bucket"]
    chunk_size = manifest["chunking_config"]["chunk_size"]
    chunk_overlap = manifest["chunking_config"]["chunk_overlap"]

    print("=" * 70)
    print("RANGER Knowledge Base - Document Import")
    print("=" * 70)
    print(f"Project:  {project}")
    print(f"Location: {location}")
    print(f"GCS Bucket: gs://{gcs_bucket}/")
    print(f"Chunking: {chunk_size} tokens (overlap: {chunk_overlap})")

    if args.tier:
        print(f"Filter: Tier {args.tier} only")
    if args.corpus:
        print(f"Filter: {args.corpus} corpus only")

    print("=" * 70)
    print()

    # Initialize Vertex AI
    vertexai.init(project=project, location=location)

    # Import documents corpus by corpus
    print("[IMPORTING DOCUMENTS]")
    stats = {
        "success": 0,
        "initiated": 0,
        "skipped": 0,
        "failed": 0,
        "total": 0,
        "files": 0
    }

    for corpus_config in manifest["corpora"]:
        corpus_id = corpus_config["id"]
        display_name = corpus_config["display_name"]
        agent_name = corpus_config["agent"]
        gcs_path = corpus_config["gcs_path"]

        # Apply filter
        if args.corpus and corpus_id != args.corpus:
            continue

        stats["total"] += 1

        print(f"[CORPUS] {display_name}")
        print(f"  ID: {corpus_id}")
        print(f"  Agent: {agent_name}")
        print(f"  GCS Path: gs://{gcs_bucket}/{gcs_path}")

        # Load corpus resource ID
        corpus_config_data = load_corpus_config(agent_name)
        if not corpus_config_data:
            print(f"  ❌ SKIPPED: Corpus not configured")
            stats["skipped"] += 1
            print()
            continue

        corpus_resource_id = corpus_config_data["corpus_resource_id"]
        print(f"  Corpus: {corpus_resource_id}")

        # Get documents for this corpus
        corpus_docs = get_corpus_documents(
            corpus_id=corpus_id,
            documents=manifest["documents"],
            tier_filter=args.tier
        )

        if not corpus_docs:
            print(f"  ✓ SKIPPED: No documents match filters")
            stats["skipped"] += 1
            print()
            continue

        # Import documents
        result = import_documents_to_corpus(
            corpus_resource_id=corpus_resource_id,
            gcs_bucket=gcs_bucket,
            gcs_path=gcs_path,
            documents=corpus_docs,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            max_embedding_requests_per_min=800
        )

        stats[result["status"]] += 1
        stats["files"] += result["files"]

        print()

        # Add delay between corpus imports to avoid rate limiting
        if stats["total"] < len(manifest["corpora"]):
            time.sleep(5)

    # Summary
    print("=" * 70)
    print("Import Summary:")
    print(f"  Total Corpora: {stats['total']}")
    print(f"  ✅ Success: {stats.get('success', 0)}")
    print(f"  🔄 Initiated: {stats.get('initiated', 0)}")
    print(f"  ✓ Skipped: {stats.get('skipped', 0)}")
    print(f"  ❌ Failed: {stats.get('failed', 0) + stats.get('rate_limited', 0) + stats.get('not_found', 0)}")
    print(f"  📄 Files Imported: {stats['files']}")
    print("=" * 70)

    if stats.get("failed", 0) > 0 or stats.get("rate_limited", 0) > 0:
        print()
        print("❌ FAILURES:")
        print(f"  Some imports failed. Check error messages above.")
        print()
        sys.exit(1)

    print()
    print("✅ NEXT STEPS:")
    print("  1. Verify corpora health:")
    print("     python 5_verify_corpora.py")
    print("  2. Test queries in GCP Console:")
    print("     https://console.cloud.google.com/vertex-ai/generative/rag")
    print()


if __name__ == "__main__":
    main()
