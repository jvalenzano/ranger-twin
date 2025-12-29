#!/usr/bin/env python3
"""
Sync downloaded documents from local cache to GCS.

Uses SINGLE GCS bucket (ranger-knowledge-base) with corpus subfolders:
- gs://ranger-knowledge-base/nepa/
- gs://ranger-knowledge-base/burn_severity/
- gs://ranger-knowledge-base/timber_salvage/
- gs://ranger-knowledge-base/trail_infrastructure/

Usage:
    python 2_sync_to_gcs.py                 # Sync all corpora
    python 2_sync_to_gcs.py --corpus nepa   # Sync only NEPA corpus
    python 2_sync_to_gcs.py --dry-run       # Preview sync without uploading
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

import yaml


# Paths
SCRIPT_DIR = Path(__file__).parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
MANIFEST_PATH = KNOWLEDGE_DIR / "manifest.yaml"
LOCAL_DIR = KNOWLEDGE_DIR / "local"


def load_manifest() -> dict:
    """Load the document manifest."""
    if not MANIFEST_PATH.exists():
        print(f"❌ ERROR: Manifest not found at {MANIFEST_PATH}")
        sys.exit(1)

    with open(MANIFEST_PATH) as f:
        return yaml.safe_load(f)


def check_gsutil() -> bool:
    """Check if gsutil is installed and authenticated."""
    try:
        result = subprocess.run(
            ["gsutil", "version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode != 0:
            return False

        # Check authentication
        auth_result = subprocess.run(
            ["gcloud", "auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if not auth_result.stdout.strip():
            print("❌ ERROR: No active GCP authentication found")
            print("   Run: gcloud auth application-default login")
            return False

        return True

    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def bucket_exists(bucket_name: str, project: str) -> bool:
    """Check if GCS bucket exists."""
    try:
        result = subprocess.run(
            ["gsutil", "ls", "-b", f"gs://{bucket_name}"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        return False


def create_bucket(bucket_name: str, location: str, project: str) -> bool:
    """Create GCS bucket if it doesn't exist."""
    print(f"  📦 CREATING BUCKET: gs://{bucket_name}/")
    print(f"     Location: {location}")
    print(f"     Project: {project}")

    try:
        result = subprocess.run([
            "gsutil", "mb",
            "-p", project,
            "-l", location,
            "-c", "STANDARD",
            f"gs://{bucket_name}/"
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            print(f"  ✅ BUCKET CREATED: gs://{bucket_name}/")
            return True
        else:
            print(f"  ❌ BUCKET CREATION FAILED: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print(f"  ❌ BUCKET CREATION TIMEOUT")
        return False
    except Exception as e:
        print(f"  ❌ BUCKET CREATION ERROR: {e}")
        return False


def sync_corpus_to_gcs(
    corpus_id: str,
    gcs_bucket: str,
    gcs_path: str,
    local_dir: Path,
    dry_run: bool = False
) -> dict:
    """
    Sync a single corpus to GCS subfolder.

    Args:
        corpus_id: Corpus identifier (e.g., 'nepa')
        gcs_bucket: GCS bucket name (e.g., 'ranger-knowledge-base')
        gcs_path: Subfolder path in bucket (e.g., 'nepa/')
        local_dir: Local directory containing corpus files
        dry_run: If True, preview sync without uploading

    Returns:
        Dict with sync statistics
    """
    corpus_local_dir = local_dir / corpus_id
    gcs_uri = f"gs://{gcs_bucket}/{gcs_path}"

    # Check if local directory exists
    if not corpus_local_dir.exists():
        print(f"  ⚠ SKIP: {corpus_id} (local directory not found)")
        return {"status": "skipped", "files": 0, "bytes": 0}

    # Count local files
    local_files = list(corpus_local_dir.glob("*.pdf"))
    if not local_files:
        print(f"  ⚠ SKIP: {corpus_id} (no PDF files found)")
        return {"status": "skipped", "files": 0, "bytes": 0}

    print(f"  🔄 SYNC: {corpus_id}")
    print(f"     Local:  {corpus_local_dir}")
    print(f"     GCS:    {gcs_uri}")
    print(f"     Files:  {len(local_files)} PDFs")

    if dry_run:
        print(f"     [DRY RUN - No files uploaded]")
        return {"status": "dry_run", "files": len(local_files), "bytes": 0}

    # Sync using gsutil rsync
    try:
        cmd = [
            "gsutil", "-m", "rsync",
            "-r",  # Recursive
            "-d",  # Delete remote files not in source
            str(corpus_local_dir),
            gcs_uri
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes max
        )

        if result.returncode == 0:
            # Count uploaded files from output
            output_lines = result.stdout.strip().split('\n') if result.stdout else []
            uploaded = sum(1 for line in output_lines if 'Copying' in line or 'Uploading' in line)

            print(f"  ✅ SYNCED: {corpus_id} ({uploaded} files uploaded)")
            return {"status": "success", "files": uploaded, "bytes": 0}
        else:
            print(f"  ❌ SYNC FAILED: {corpus_id}")
            print(f"     Error: {result.stderr}")
            return {"status": "failed", "files": 0, "bytes": 0}

    except subprocess.TimeoutExpired:
        print(f"  ❌ SYNC TIMEOUT: {corpus_id} (took longer than 5 minutes)")
        return {"status": "timeout", "files": 0, "bytes": 0}
    except Exception as e:
        print(f"  ❌ SYNC ERROR: {corpus_id} - {e}")
        return {"status": "error", "files": 0, "bytes": 0}


def main():
    parser = argparse.ArgumentParser(
        description="Sync RANGER knowledge base documents to GCS"
    )
    parser.add_argument(
        "--corpus",
        type=str,
        choices=["nepa", "burn_severity", "timber_salvage", "trail_infrastructure"],
        help="Only sync specific corpus"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview sync without uploading files"
    )
    args = parser.parse_args()

    # Load manifest
    manifest = load_manifest()
    project = manifest["project"]
    location = manifest["location"]
    gcs_bucket = manifest["gcs_bucket"]

    print("=" * 70)
    print("RANGER Knowledge Base GCS Sync")
    print("=" * 70)
    print(f"Project:  {project}")
    print(f"Location: {location}")
    print(f"Bucket:   gs://{gcs_bucket}/")

    if args.corpus:
        print(f"Filter:   {args.corpus} corpus only")
    if args.dry_run:
        print(f"Mode:     DRY RUN (preview only)")

    print("=" * 70)
    print()

    # Check prerequisites
    print("[PREREQUISITES]")
    if not check_gsutil():
        print("❌ ERROR: gsutil not found or not authenticated")
        print("   Install: https://cloud.google.com/sdk/docs/install")
        print("   Authenticate: gcloud auth application-default login")
        sys.exit(1)
    print("✅ gsutil installed and authenticated")
    print()

    # Check/create bucket
    print("[BUCKET CHECK]")
    if bucket_exists(gcs_bucket, project):
        print(f"✅ BUCKET EXISTS: gs://{gcs_bucket}/")
    else:
        print(f"⚠ BUCKET NOT FOUND: gs://{gcs_bucket}/")
        if not args.dry_run:
            if not create_bucket(gcs_bucket, location, project):
                print("❌ ERROR: Failed to create bucket")
                sys.exit(1)
        else:
            print("   [DRY RUN - Skipping bucket creation]")
    print()

    # Sync corpora
    print("[SYNCING CORPORA]")
    stats = {
        "success": 0,
        "skipped": 0,
        "failed": 0,
        "total": 0,
        "files": 0
    }

    for corpus in manifest["corpora"]:
        corpus_id = corpus["id"]
        gcs_path = corpus["gcs_path"]

        # Apply filter
        if args.corpus and corpus_id != args.corpus:
            continue

        stats["total"] += 1

        # Sync corpus
        result = sync_corpus_to_gcs(
            corpus_id=corpus_id,
            gcs_bucket=gcs_bucket,
            gcs_path=gcs_path,
            local_dir=LOCAL_DIR,
            dry_run=args.dry_run
        )

        stats[result["status"]] += 1
        stats["files"] += result["files"]

    print()

    # Summary
    print("=" * 70)
    print("Sync Summary:")
    print(f"  Total Corpora: {stats['total']}")
    print(f"  ✅ Success: {stats.get('success', 0)}")
    print(f"  ✓ Skipped: {stats.get('skipped', 0)}")
    print(f"  ❌ Failed: {stats.get('failed', 0)}")
    print(f"  📄 Files Synced: {stats['files']}")
    print("=" * 70)

    if args.dry_run:
        print()
        print("⚠ DRY RUN COMPLETE - No files were uploaded")
        print("  Run without --dry-run to perform actual sync")
        print()

    if stats.get("failed", 0) > 0:
        print()
        print("❌ FAILURES:")
        print(f"  {stats['failed']} corpus/corpora failed to sync.")
        print("  Check error messages above and retry.")
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()
