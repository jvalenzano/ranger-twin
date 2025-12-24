#!/usr/bin/env python3
"""
Setup Gemini File Search Store for NEPA Advisor.

This script creates and populates a Gemini File Search store with FSM/FSH
regulatory documents for the NEPA Advisor's RAG capabilities.

Prerequisites:
    - Google Cloud credentials configured (GOOGLE_APPLICATION_CREDENTIALS or gcloud auth)
    - Documents downloaded via download_documents.py
    - google-genai package installed

Usage:
    python setup_file_search.py

Environment Variables:
    GOOGLE_API_KEY: Gemini API key (for AI Studio)
    GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON (for Vertex AI)

Output:
    - Creates a File Search store named "RANGER-NEPA-FSM-FSH-Knowledge-Base"
    - Indexes all documents in data/fsm/ and data/fsh/
    - Saves store ID to .nepa_store_id file for runtime use
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Optional

# Check for google-genai package
try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai package not installed")
    print("Install with: pip install google-genai")
    sys.exit(1)


def get_data_dir() -> Path:
    """Get the data directory path."""
    script_dir = Path(__file__).parent
    return script_dir.parent / "data"


def get_client() -> genai.Client:
    """
    Initialize Gemini client.

    Tries API key first, then falls back to application default credentials.
    """
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

    if api_key:
        print("Using API key authentication")
        return genai.Client(api_key=api_key)
    else:
        print("Using application default credentials")
        return genai.Client()


def find_documents(data_dir: Path) -> list[Path]:
    """
    Find all documents to index.

    Supports: PDF, DOCX, DOC, TXT, JSON
    """
    extensions = {".pdf", ".docx", ".doc", ".txt", ".json"}
    documents = []

    for subdir in ["fsm", "fsh"]:
        dir_path = data_dir / subdir
        if not dir_path.exists():
            print(f"WARNING: Directory not found: {dir_path}")
            continue

        for file_path in dir_path.iterdir():
            if file_path.suffix.lower() in extensions:
                documents.append(file_path)

    return sorted(documents)


def create_store(client: genai.Client, store_name: str) -> str:
    """
    Create a new File Search store.

    Args:
        client: Gemini client
        store_name: Display name for the store

    Returns:
        Store resource name (ID)
    """
    print(f"Creating File Search store: {store_name}")

    # Use config dict per google-genai 1.x API
    store = client.file_search_stores.create(
        config={"display_name": store_name}
    )

    print(f"  Store created: {store.name}")
    return store.name


def upload_document(
    client: genai.Client,
    store_name: str,
    file_path: Path
) -> bool:
    """
    Upload and index a document to the File Search store.

    Args:
        client: Gemini client
        store_name: Store resource name
        file_path: Path to document

    Returns:
        True if successful
    """
    print(f"  Uploading: {file_path.name}")

    try:
        # Upload file to store
        upload_op = client.file_search_stores.upload_to_file_search_store(
            file_search_store_name=store_name,
            file=str(file_path)
        )

        # Wait for indexing to complete
        max_wait = 120  # 2 minutes max
        wait_time = 0

        while not upload_op.done and wait_time < max_wait:
            time.sleep(5)
            wait_time += 5
            upload_op = client.operations.get(upload_op)
            print(f"    Indexing... ({wait_time}s)")

        if upload_op.done:
            print(f"    Indexed successfully")
            return True
        else:
            print(f"    WARNING: Indexing timed out after {max_wait}s")
            return False

    except Exception as e:
        print(f"    ERROR: {type(e).__name__} - {e}")
        return False


def save_store_id(store_name: str, output_path: Path):
    """Save store ID for runtime use."""
    config = {
        "store_name": store_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "description": "RANGER NEPA Advisor FSM/FSH Knowledge Base"
    }

    with open(output_path, "w") as f:
        json.dump(config, f, indent=2)

    print(f"Store ID saved to: {output_path}")


def main():
    """Create and populate File Search store."""
    print("=" * 60)
    print("RANGER NEPA Advisor - File Search Store Setup")
    print("=" * 60)
    print()

    # Initialize
    data_dir = get_data_dir()
    store_name = "RANGER-NEPA-FSM-FSH-Knowledge-Base"
    config_path = data_dir.parent / ".nepa_store_config.json"

    # Find documents
    print("Scanning for documents...")
    documents = find_documents(data_dir)

    if not documents:
        print("ERROR: No documents found in data directory")
        print(f"Expected documents in: {data_dir}")
        print()
        print("Run download_documents.py first:")
        print("  python scripts/download_documents.py")
        sys.exit(1)

    print(f"Found {len(documents)} documents:")
    for doc in documents:
        print(f"  - {doc.relative_to(data_dir)}")
    print()

    # Initialize client
    print("Initializing Gemini client...")
    try:
        client = get_client()
    except Exception as e:
        print(f"ERROR: Failed to initialize client: {e}")
        print()
        print("Ensure you have configured authentication:")
        print("  Option 1: Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable")
        print("  Option 2: Run 'gcloud auth application-default login'")
        sys.exit(1)
    print()

    # Create store
    print("Creating File Search store...")
    try:
        store_id = create_store(client, store_name)
    except Exception as e:
        print(f"ERROR: Failed to create store: {e}")
        sys.exit(1)
    print()

    # Upload documents
    print("Uploading and indexing documents...")
    print("-" * 40)
    success_count = 0
    failure_count = 0

    for doc_path in documents:
        if upload_document(client, store_id, doc_path):
            success_count += 1
        else:
            failure_count += 1
    print()

    # Save configuration
    save_store_id(store_id, config_path)
    print()

    # Summary
    print("=" * 60)
    print("Setup Summary")
    print("=" * 60)
    print(f"  Store ID: {store_id}")
    print(f"  Documents indexed: {success_count}")
    print(f"  Failed: {failure_count}")
    print()

    if failure_count > 0:
        print("WARNING: Some documents failed to index")
        print("The NEPA Advisor will work with available documents")

    print("Setup complete!")
    print()
    print("The NEPA Advisor can now use File Search for RAG.")
    print(f"Store configuration saved to: {config_path}")

    # Also print the store ID for manual use
    print()
    print("=" * 60)
    print("For manual testing, use this store ID in your code:")
    print(f'NEPA_STORE_NAME = "{store_id}"')
    print("=" * 60)


if __name__ == "__main__":
    main()
