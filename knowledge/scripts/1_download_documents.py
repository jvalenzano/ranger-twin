#!/usr/bin/env python3
"""
Download documents from source URLs to local cache.

Handles multiple download tiers:
- TIER 1: Direct PDF download via requests
- TIER 2: FS Directives (.doc/.docx) → convert to PDF using LibreOffice
- TIER 3: eCFR portal → requires manual PDF export (flags for user)
- TIER 4: Manual download required → flags for user

Usage:
    python 1_download_documents.py                 # Download all documents
    python 1_download_documents.py --tier 1        # Download only Tier 1
    python 1_download_documents.py --corpus nepa   # Download only NEPA corpus
"""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List

import requests
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


def download_direct_pdf(doc: dict, corpus_dir: Path) -> bool:
    """Download direct PDF links."""
    url = doc["source_url"]
    output_path = corpus_dir / doc["filename"]

    if output_path.exists():
        print(f"  ✓ SKIP: {doc['title']} (already exists)")
        return True

    print(f"  ⬇ DOWNLOAD: {doc['title']}")
    print(f"    URL: {url}")

    try:
        response = requests.get(url, timeout=60, allow_redirects=True)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(response.content)

        print(f"    ✅ SUCCESS: Saved to {output_path.name}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"    ❌ FAILED: {e}")
        return False


def check_libreoffice() -> bool:
    """Check if LibreOffice is installed."""
    try:
        result = subprocess.run(
            ["soffice", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def convert_to_pdf(input_path: Path, output_dir: Path) -> bool:
    """Convert DOC/DOCX to PDF using LibreOffice."""
    try:
        print(f"    🔄 CONVERTING: {input_path.name} → PDF")

        result = subprocess.run([
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(output_dir),
            str(input_path)
        ], capture_output=True, text=True, timeout=120)

        if result.returncode == 0:
            # LibreOffice names output based on input filename
            converted_pdf = output_dir / f"{input_path.stem}.pdf"
            if converted_pdf.exists():
                print(f"    ✅ CONVERTED: {converted_pdf.name}")
                return True
            else:
                print(f"    ❌ CONVERSION FAILED: PDF not found")
                return False
        else:
            print(f"    ❌ CONVERSION FAILED: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print(f"    ❌ CONVERSION TIMEOUT: Took longer than 120s")
        return False
    except Exception as e:
        print(f"    ❌ CONVERSION ERROR: {e}")
        return False


def download_fs_directive(doc: dict, corpus_dir: Path) -> bool:
    """Download FS Directive .doc/.docx and convert to PDF."""
    url = doc["source_url"]
    final_output = corpus_dir / doc["filename"]

    if final_output.exists():
        print(f"  ✓ SKIP: {doc['title']} (already exists)")
        return True

    print(f"  ⬇ DOWNLOAD: {doc['title']}")
    print(f"    URL: {url}")

    # Check LibreOffice availability
    if not check_libreoffice():
        print(f"    ⚠ MANUAL REQUIRED: LibreOffice not installed")
        print(f"    Install: brew install libreoffice (macOS)")
        print(f"    Install: apt-get install libreoffice (Linux)")
        print(f"    Save to: {final_output}")
        return False

    # Download .doc/.docx
    temp_file = corpus_dir / f"temp_{Path(url).name}"

    try:
        response = requests.get(url, timeout=60, allow_redirects=True)
        response.raise_for_status()

        with open(temp_file, "wb") as f:
            f.write(response.content)

        print(f"    ✅ DOWNLOADED: {temp_file.name}")

        # Convert to PDF
        success = convert_to_pdf(temp_file, corpus_dir)

        if success:
            # Rename converted PDF to final filename
            converted_pdf = corpus_dir / f"{temp_file.stem}.pdf"
            if converted_pdf.exists() and converted_pdf != final_output:
                converted_pdf.rename(final_output)
                print(f"    ✅ RENAMED: {final_output.name}")

        # Cleanup temp file
        if temp_file.exists():
            temp_file.unlink()

        return success

    except requests.exceptions.RequestException as e:
        print(f"    ❌ DOWNLOAD FAILED: {e}")
        if temp_file.exists():
            temp_file.unlink()
        return False
    except Exception as e:
        print(f"    ❌ ERROR: {e}")
        if temp_file.exists():
            temp_file.unlink()
        return False


def flag_manual_download(doc: dict, corpus_dir: Path) -> bool:
    """Flag documents that require manual download."""
    output_path = corpus_dir / doc["filename"]

    if output_path.exists():
        print(f"  ✓ SKIP: {doc['title']} (already exists)")
        return True

    print(f"  ⚠ MANUAL REQUIRED: {doc['title']}")
    print(f"    URL: {doc['source_url']}")
    print(f"    Method: {doc.get('download_method', 'manual')}")

    if doc.get("notes"):
        print(f"    Notes: {doc['notes']}")

    print(f"    Save to: {output_path}")
    print()
    return False


def download_document(doc: dict, manifest: dict) -> tuple[str, bool]:
    """
    Download a single document based on its download method.

    Returns:
        Tuple of (status, success) where status is "success", "skipped", "manual", or "failed"
    """
    corpus_id = doc["corpus"]
    corpus_dir = LOCAL_DIR / corpus_id
    corpus_dir.mkdir(parents=True, exist_ok=True)

    download_method = doc.get("download_method", "manual")

    if download_method == "direct":
        success = download_direct_pdf(doc, corpus_dir)
        return ("success" if success else "failed", success)

    elif download_method == "fs_directive":
        success = download_fs_directive(doc, corpus_dir)
        return ("success" if success else "manual", success)

    elif download_method in ["manual", "ecfr", "usgs_portal", "nps_article",
                            "research_portal", "county_archive", "partner_org",
                            "access_board", "fs_forms", "market_data"]:
        # Check if already exists
        output_path = corpus_dir / doc["filename"]
        if output_path.exists():
            return ("skipped", True)

        flag_manual_download(doc, corpus_dir)
        return ("manual", False)

    else:
        print(f"  ❌ UNKNOWN METHOD: {download_method} for {doc['title']}")
        return ("failed", False)


def main():
    parser = argparse.ArgumentParser(
        description="Download RANGER knowledge base documents"
    )
    parser.add_argument(
        "--tier",
        type=int,
        choices=[1, 2, 3],
        help="Only download specific tier (1, 2, or 3)"
    )
    parser.add_argument(
        "--corpus",
        type=str,
        choices=["nepa", "burn_severity", "timber_salvage", "trail_infrastructure"],
        help="Only download specific corpus"
    )
    args = parser.parse_args()

    manifest = load_manifest()

    print("=" * 70)
    print("RANGER Knowledge Base Document Downloader")
    print("=" * 70)
    print(f"Project: {manifest['project']}")
    print(f"Location: {manifest['location']}")
    print(f"Total Documents: {len(manifest['documents'])}")

    if args.tier:
        print(f"Filter: Tier {args.tier} only")
    if args.corpus:
        print(f"Filter: {args.corpus} corpus only")

    print("=" * 70)
    print()

    # Statistics
    stats = {
        "success": 0,
        "skipped": 0,
        "manual": 0,
        "failed": 0,
        "total": 0
    }

    # Group documents by corpus for better organization
    docs_by_corpus = {}
    for doc in manifest["documents"]:
        # Apply filters
        if args.tier and doc.get("tier") != args.tier:
            continue
        if args.corpus and doc.get("corpus") != args.corpus:
            continue

        corpus = doc["corpus"]
        if corpus not in docs_by_corpus:
            docs_by_corpus[corpus] = []
        docs_by_corpus[corpus].append(doc)

    # Download documents corpus by corpus
    for corpus_name, docs in docs_by_corpus.items():
        # Get corpus display name
        corpus_config = next(
            (c for c in manifest["corpora"] if c["id"] == corpus_name),
            None
        )
        display_name = corpus_config["display_name"] if corpus_config else corpus_name

        print(f"[CORPUS] {display_name}")
        print(f"  Documents: {len(docs)}")
        print()

        for doc in docs:
            stats["total"] += 1
            status, success = download_document(doc, manifest)
            stats[status] += 1

            # Small delay to avoid overwhelming servers
            time.sleep(0.5)

        print()

    # Summary
    print("=" * 70)
    print("Download Summary:")
    print(f"  Total Processed: {stats['total']}")
    print(f"  ✅ Success: {stats['success']}")
    print(f"  ✓ Skipped (already exist): {stats['skipped']}")
    print(f"  ⚠ Manual Required: {stats['manual']}")
    print(f"  ❌ Failed: {stats['failed']}")
    print("=" * 70)

    if stats["manual"] > 0:
        print()
        print("⚠ NEXT STEPS:")
        print(f"  {stats['manual']} document(s) require manual download.")
        print("  See flagged items above for URLs and save locations.")
        print()

    if stats["failed"] > 0:
        print()
        print("❌ FAILURES:")
        print(f"  {stats['failed']} document(s) failed to download.")
        print("  Check error messages above and retry.")
        print()


if __name__ == "__main__":
    main()
