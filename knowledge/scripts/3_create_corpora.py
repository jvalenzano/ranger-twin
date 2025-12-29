#!/usr/bin/env python3
"""
Create Vertex AI RAG corpora for RANGER knowledge base.

Creates 4 corpora with lowercase-hyphenated display names:
- ranger-nepa-regulations
- ranger-burn-severity
- ranger-timber-salvage
- ranger-trail-infrastructure

Saves corpus resource IDs to each agent's .vertex_rag_config.json file.

Usage:
    python 3_create_corpora.py                 # Create all corpora
    python 3_create_corpora.py --corpus nepa   # Create only NEPA corpus
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
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


def check_gcp_auth() -> bool:
    """Check if GCP authentication is set up."""
    # Check for GOOGLE_API_KEY (for ADK/Gemini)
    if "GOOGLE_API_KEY" in os.environ:
        return True

    # Check for application default credentials
    try:
        import subprocess
        result = subprocess.run(
            ["gcloud", "auth", "application-default", "print-access-token"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False


def create_corpus(
    project: str,
    location: str,
    display_name: str,
    description: str,
    embedding_model: str
) -> str | None:
    """
    Create a Vertex AI RAG corpus.

    Args:
        project: GCP project ID
        location: GCP location (e.g., 'us-east4')
        display_name: Corpus display name (e.g., 'ranger-nepa-regulations')
        description: Corpus description
        embedding_model: Embedding model name (e.g., 'text-embedding-005')

    Returns:
        Corpus resource ID (e.g., 'projects/.../locations/.../ragCorpora/...') or None if failed
    """
    try:
        print(f"  🔄 CREATING: {display_name}")
        print(f"     Description: {description}")
        print(f"     Embedding Model: {embedding_model}")

        # Initialize Vertex AI
        vertexai.init(project=project, location=location)

        # Create corpus
        corpus = rag.create_corpus(
            display_name=display_name,
            description=description,
            embedding_model_config=rag.EmbeddingModelConfig(
                publisher_model=f"publishers/google/models/{embedding_model}"
            )
        )

        print(f"  ✅ CORPUS CREATED: {display_name}")
        print(f"     Resource ID: {corpus.name}")
        return corpus.name

    except Exception as e:
        error_msg = str(e)

        # Check if corpus already exists
        if "already exists" in error_msg.lower() or "ALREADY_EXISTS" in error_msg:
            print(f"  ✓ CORPUS EXISTS: {display_name}")
            print(f"     (Already created - will fetch existing ID)")

            # Try to fetch existing corpus
            try:
                corpora = rag.list_corpora()
                for existing in corpora:
                    if existing.display_name == display_name:
                        print(f"     Resource ID: {existing.name}")
                        return existing.name

                print(f"  ⚠ WARNING: Could not fetch existing corpus ID")
                return None

            except Exception as fetch_error:
                print(f"  ❌ ERROR: Could not fetch existing corpus: {fetch_error}")
                return None
        else:
            print(f"  ❌ CORPUS CREATION FAILED: {display_name}")
            print(f"     Error: {error_msg}")
            return None


def save_corpus_config(agent_name: str, corpus_resource_id: str) -> bool:
    """
    Save corpus resource ID to agent's .vertex_rag_config.json.

    Args:
        agent_name: Agent directory name (e.g., 'nepa_advisor')
        corpus_resource_id: Vertex RAG corpus resource ID

    Returns:
        True if saved successfully, False otherwise
    """
    agent_dir = AGENTS_DIR / agent_name
    if not agent_dir.exists():
        print(f"  ⚠ WARNING: Agent directory not found: {agent_dir}")
        return False

    # Create data directory if it doesn't exist
    data_dir = agent_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    # Create config
    config_path = data_dir / ".vertex_rag_config.json"
    config = {
        "corpus_resource_id": corpus_resource_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "version": "1.0"
    }

    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)

        print(f"  💾 CONFIG SAVED: {agent_name}/data/.vertex_rag_config.json")
        return True

    except Exception as e:
        print(f"  ❌ CONFIG SAVE FAILED: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Create Vertex AI RAG corpora for RANGER knowledge base"
    )
    parser.add_argument(
        "--corpus",
        type=str,
        choices=["nepa", "burn_severity", "timber_salvage", "trail_infrastructure"],
        help="Only create specific corpus"
    )
    args = parser.parse_args()

    # Load manifest
    manifest = load_manifest()
    project = manifest["project"]
    location = manifest["location"]
    embedding_model = manifest["embedding_model"]

    print("=" * 70)
    print("RANGER Knowledge Base - Corpus Creation")
    print("=" * 70)
    print(f"Project:  {project}")
    print(f"Location: {location}")
    print(f"Embedding Model: {embedding_model}")
    print(f"Total Corpora: {len(manifest['corpora'])}")

    if args.corpus:
        print(f"Filter: {args.corpus} corpus only")

    print("=" * 70)
    print()

    # Check prerequisites
    print("[PREREQUISITES]")
    if not check_gcp_auth():
        print("❌ ERROR: GCP authentication not found")
        print("   Run: gcloud auth application-default login")
        print("   Or set: export GOOGLE_API_KEY=your_key_here")
        sys.exit(1)
    print("✅ GCP authentication configured")
    print()

    # Create corpora
    print("[CREATING CORPORA]")
    stats = {
        "success": 0,
        "exists": 0,
        "failed": 0,
        "total": 0
    }

    for corpus_config in manifest["corpora"]:
        corpus_id = corpus_config["id"]
        display_name = corpus_config["display_name"]
        description = corpus_config["description"]
        agent_name = corpus_config["agent"]

        # Apply filter
        if args.corpus and corpus_id != args.corpus:
            continue

        stats["total"] += 1

        print(f"[CORPUS] {display_name}")
        print(f"  ID: {corpus_id}")
        print(f"  Agent: {agent_name}")

        # Create corpus
        corpus_resource_id = create_corpus(
            project=project,
            location=location,
            display_name=display_name,
            description=description,
            embedding_model=embedding_model
        )

        if corpus_resource_id:
            # Save config to agent
            if save_corpus_config(agent_name, corpus_resource_id):
                if "already exists" in str(corpus_resource_id).lower():
                    stats["exists"] += 1
                else:
                    stats["success"] += 1
            else:
                print(f"  ⚠ WARNING: Corpus created but config save failed")
                stats["success"] += 1
        else:
            stats["failed"] += 1

        print()

        # Add delay between creations to avoid rate limiting
        if stats["total"] < len(manifest["corpora"]):
            time.sleep(2)

    # Summary
    print("=" * 70)
    print("Corpus Creation Summary:")
    print(f"  Total Processed: {stats['total']}")
    print(f"  ✅ Created: {stats['success']}")
    print(f"  ✓ Already Existed: {stats['exists']}")
    print(f"  ❌ Failed: {stats['failed']}")
    print("=" * 70)

    if stats["failed"] > 0:
        print()
        print("❌ FAILURES:")
        print(f"  {stats['failed']} corpus/corpora failed to create.")
        print("  Check error messages above and retry.")
        print()
        sys.exit(1)

    print()
    print("✅ NEXT STEPS:")
    print("  1. Verify corpora in GCP Console:")
    print("     https://console.cloud.google.com/vertex-ai/generative/rag")
    print("  2. Run document import:")
    print("     python 4_import_documents.py")
    print()


if __name__ == "__main__":
    main()
