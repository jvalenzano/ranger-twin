#!/usr/bin/env python3
"""
Setup Gemini File Search Store for NEPA Advisor.

Creates and populates a Gemini File Search store with FSM/FSH
regulatory documents for the NEPA Advisor's RAG capabilities.

Prerequisites:
    - GOOGLE_API_KEY environment variable set
    - Documents in data/fsh/ and data/fsm/
    - google-genai package installed (pip install google-genai)

Usage:
    cd agents/nepa-advisor
    python scripts/setup_file_search.py

Output:
    - Creates a File Search store named "RANGER-NEPA-FSM-FSH-v1"
    - Indexes all documents in data/fsm/ and data/fsh/
    - Saves store config to data/.file_search_store.json
"""

import json
import os
import sys
import time
from pathlib import Path

# Check for google-genai package
try:
    from google import genai
except ImportError:
    print("ERROR: google-genai package not installed")
    print("Install with: pip install google-genai")
    sys.exit(1)


def get_data_dir() -> Path:
    """Get the data directory path."""
    script_dir = Path(__file__).parent
    return script_dir.parent / "data"


def get_client() -> genai.Client:
    """Initialize Gemini client with API key."""
    api_key = os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        print("ERROR: GOOGLE_API_KEY environment variable not set")
        sys.exit(1)

    print("Initializing Gemini client...")
    return genai.Client(api_key=api_key)


def find_documents(data_dir: Path) -> list[Path]:
    """Find all documents to index (PDF, DOCX, DOC)."""
    extensions = {".pdf", ".docx", ".doc"}
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


def list_existing_stores(client: genai.Client) -> list:
    """List existing File Search stores."""
    try:
        stores = list(client.file_search_stores.list())
        return stores
    except Exception as e:
        print(f"WARNING: Could not list stores: {e}")
        return []


def find_existing_store(client: genai.Client, display_name: str) -> str | None:
    """Find existing store by display name."""
    stores = list_existing_stores(client)
    for store in stores:
        if hasattr(store, 'display_name') and store.display_name == display_name:
            return store.name
    return None


def create_store(client: genai.Client, display_name: str) -> str:
    """Create a new File Search store."""
    print(f"Creating File Search store: {display_name}")

    store = client.file_search_stores.create(
        config={"display_name": display_name}
    )

    print(f"  Store created: {store.name}")
    return store.name


def upload_document(client: genai.Client, store_name: str, file_path: Path) -> bool:
    """Upload and index a document to the File Search store."""
    print(f"  Uploading: {file_path.name}")

    try:
        # Upload file to store with chunking config for regulatory docs
        operation = client.file_search_stores.upload_to_file_search_store(
            file_search_store_name=store_name,
            file=str(file_path),
            config={
                "display_name": file_path.stem,
                "chunking_config": {
                    "white_space_config": {
                        "max_tokens_per_chunk": 512,  # Larger chunks for regulatory context
                        "max_overlap_tokens": 64
                    }
                }
            }
        )

        # Wait for indexing to complete
        max_wait = 180  # 3 minutes max per document
        wait_time = 0

        while not operation.done and wait_time < max_wait:
            time.sleep(5)
            wait_time += 5
            operation = client.operations.get(operation)
            if wait_time % 15 == 0:
                print(f"    Indexing... ({wait_time}s)")

        if operation.done:
            print(f"    Indexed successfully ({wait_time}s)")
            return True
        else:
            print(f"    WARNING: Indexing timed out after {max_wait}s")
            return False

    except Exception as e:
        print(f"    ERROR: {type(e).__name__} - {e}")
        return False


def save_store_config(store_name: str, output_path: Path, documents: list[Path]):
    """Save store configuration for runtime use."""
    config = {
        "store_name": store_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "description": "RANGER NEPA Advisor FSM/FSH Knowledge Base",
        "documents": [str(d.name) for d in documents],
        "model_requirement": "gemini-2.5-flash or gemini-2.5-pro"
    }

    with open(output_path, "w") as f:
        json.dump(config, f, indent=2)

    print(f"Store config saved to: {output_path}")


def main():
    """Create and populate File Search store."""
    print("=" * 60)
    print("RANGER NEPA Advisor - File Search Store Setup")
    print("=" * 60)
    print()

    # Initialize
    data_dir = get_data_dir()
    store_display_name = "RANGER-NEPA-FSM-FSH-v1"
    config_path = data_dir / ".file_search_store.json"

    # Find documents
    print("Scanning for documents...")
    documents = find_documents(data_dir)

    if not documents:
        print("ERROR: No documents found in data directory")
        print(f"Expected documents in: {data_dir}")
        sys.exit(1)

    print(f"Found {len(documents)} documents:")
    for doc in documents:
        print(f"  - {doc.relative_to(data_dir)}")
    print()

    # Initialize client
    client = get_client()
    print()

    # Check for existing store
    print("Checking for existing store...")
    existing_store = find_existing_store(client, store_display_name)

    if existing_store:
        print(f"Found existing store: {existing_store}")
        print("To recreate, delete the store first via the API or Google AI Studio")
        print()

        # Save config anyway
        save_store_config(existing_store, config_path, documents)
        print()
        print("=" * 60)
        print("Store already exists - config updated")
        print("=" * 60)
        return

    # Create new store
    print("Creating new File Search store...")
    try:
        store_name = create_store(client, store_display_name)
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
        if upload_document(client, store_name, doc_path):
            success_count += 1
        else:
            failure_count += 1
    print()

    # Save configuration
    save_store_config(store_name, config_path, documents)
    print()

    # Summary
    print("=" * 60)
    print("Setup Summary")
    print("=" * 60)
    print(f"  Store Name: {store_name}")
    print(f"  Documents indexed: {success_count}")
    print(f"  Failed: {failure_count}")
    print()

    if failure_count > 0:
        print("WARNING: Some documents failed to index")
        print("The NEPA Advisor will work with available documents")
        print()

    print("Setup complete!")
    print()
    print("Next steps:")
    print("  1. The NEPA Advisor agent will automatically use this store")
    print("  2. Test with: cd agents && adk run nepa-advisor")
    print()
    print("=" * 60)
    print("Store name for manual testing:")
    print(f'NEPA_STORE_NAME = "{store_name}"')
    print("=" * 60)


if __name__ == "__main__":
    main()
