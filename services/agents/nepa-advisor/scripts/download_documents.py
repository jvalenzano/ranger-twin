#!/usr/bin/env python3
"""
Download FSM/FSH regulatory documents for NEPA Advisor RAG.

This script downloads the Forest Service Manual (FSM) and Forest Service Handbook (FSH)
documents needed for the NEPA Advisor's knowledge base.

Usage:
    python download_documents.py

Documents downloaded:
    - FSM 1950: Environmental Policy and Procedures (PDF)
    - FSH 1909.15 Chapter 30: Categorical Exclusions (PDF)
    - FSH 1909.15 Chapter 10: Environmental Analysis (DOCX)
    - FSH 1909.15 Chapter 20: EIS and Related Documents (DOC)
    - FSH 1909.15 Chapter 40: Environmental Assessments (DOC)

Note: The Gemini File Search Tool supports both PDF and DOCX formats natively.
"""

import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# Document URLs - verified from USFS directives site
DOCUMENTS = {
    "fsm": [
        {
            "name": "FSM-1950-Environmental-Policy.pdf",
            "url": "https://www.fs.usda.gov/emc/nepa/nepa_procedures/includes/1950.pdf",
            "description": "FSM 1950 - Environmental Policy and Procedures",
        },
    ],
    "fsh": [
        {
            "name": "FSH-1909.15-Ch30-Categorical-Exclusions.pdf",
            "url": "https://www.fs.fed.us/emc/nepa/includes/wo_1909_15_30.pdf",
            "description": "FSH 1909.15 Chapter 30 - Categorical Exclusions",
        },
        {
            "name": "FSH-1909.15-Ch10-Environmental-Analysis.docx",
            "url": "https://www.fs.usda.gov/im/directives/fsh/1909.15/wo_1909.15_10-Amend%202023-1.docx",
            "description": "FSH 1909.15 Chapter 10 - Environmental Analysis",
        },
        {
            "name": "FSH-1909.15-Ch20-EIS-Documents.doc",
            "url": "https://www.fs.usda.gov/im/directives/fsh/1909.15/wo_1909.15_20_Environmental%20Impact%20Statements%20and%20Related%20Documents.doc",
            "description": "FSH 1909.15 Chapter 20 - EIS and Related Documents",
        },
        {
            "name": "FSH-1909.15-Ch40-Environmental-Assessments.doc",
            "url": "https://www.fs.usda.gov/im/directives/fsh/1909.15/wo_1909.15_40_Environmental%20assessments%20and%20related%20documents.doc",
            "description": "FSH 1909.15 Chapter 40 - Environmental Assessments",
        },
        {
            "name": "FSH-2409.18-Ch80-Special-Forest-Products.pdf",
            "url": "https://www.fs.usda.gov/spf/tribalrelations/documents/handbooks/wo_2409-18_80.pdf",
            "description": "FSH 2409.18 Chapter 80 - Special Forest Products",
        },
    ],
}

# Additional reference documents
REFERENCE_DOCS = [
    {
        "name": "NEPA-Procedures-QA.pdf",
        "url": "https://www.fs.usda.gov/emc/nepa/nepa_procedures/includes/q_&_a_about_final_nepa_procedures.pdf",
        "description": "Q&A about Final NEPA Procedures",
        "folder": "fsh",
    },
]


def get_data_dir() -> Path:
    """Get the data directory path."""
    script_dir = Path(__file__).parent
    return script_dir.parent / "data"


def download_file(url: str, dest_path: Path, description: str) -> bool:
    """
    Download a file from URL to destination path.

    Args:
        url: Source URL
        dest_path: Destination file path
        description: Human-readable description for logging

    Returns:
        True if successful, False otherwise
    """
    print(f"  Downloading: {description}")
    print(f"    URL: {url}")
    print(f"    Destination: {dest_path}")

    try:
        # Create request with user agent (some servers block default urllib agent)
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) RANGER-NEPA-Downloader/1.0"
            }
        )

        with urllib.request.urlopen(request, timeout=60) as response:
            content = response.read()

            # Ensure parent directory exists
            dest_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file
            with open(dest_path, "wb") as f:
                f.write(content)

            size_kb = len(content) / 1024
            print(f"    Success: {size_kb:.1f} KB downloaded")
            return True

    except urllib.error.HTTPError as e:
        print(f"    ERROR: HTTP {e.code} - {e.reason}")
        return False
    except urllib.error.URLError as e:
        print(f"    ERROR: URL Error - {e.reason}")
        return False
    except Exception as e:
        print(f"    ERROR: {type(e).__name__} - {e}")
        return False


def main():
    """Download all regulatory documents."""
    print("=" * 60)
    print("RANGER NEPA Advisor - Document Downloader")
    print("=" * 60)
    print()

    data_dir = get_data_dir()
    print(f"Data directory: {data_dir}")
    print()

    # Track results
    success_count = 0
    failure_count = 0

    # Download FSM documents
    print("Downloading FSM (Forest Service Manual) documents...")
    print("-" * 40)
    for doc in DOCUMENTS["fsm"]:
        dest = data_dir / "fsm" / doc["name"]
        if download_file(doc["url"], dest, doc["description"]):
            success_count += 1
        else:
            failure_count += 1
        time.sleep(1)  # Be nice to the server
    print()

    # Download FSH documents
    print("Downloading FSH (Forest Service Handbook) documents...")
    print("-" * 40)
    for doc in DOCUMENTS["fsh"]:
        dest = data_dir / "fsh" / doc["name"]
        if download_file(doc["url"], dest, doc["description"]):
            success_count += 1
        else:
            failure_count += 1
        time.sleep(1)
    print()

    # Download reference documents
    print("Downloading reference documents...")
    print("-" * 40)
    for doc in REFERENCE_DOCS:
        dest = data_dir / doc["folder"] / doc["name"]
        if download_file(doc["url"], dest, doc["description"]):
            success_count += 1
        else:
            failure_count += 1
        time.sleep(1)
    print()

    # Summary
    print("=" * 60)
    print("Download Summary")
    print("=" * 60)
    print(f"  Successful: {success_count}")
    print(f"  Failed: {failure_count}")
    print()

    if failure_count > 0:
        print("Some downloads failed. This may be due to:")
        print("  - Network issues")
        print("  - Documents moved or renamed on USFS website")
        print("  - Server temporarily unavailable")
        print()
        print("You can manually download documents from:")
        print("  https://www.fs.usda.gov/im/directives/")
        print("  https://www.fs.fed.us/emc/nepa/nepa_procedures/")
        sys.exit(1)
    else:
        print("All documents downloaded successfully!")
        print()
        print("Next steps:")
        print("  1. Run the File Search store setup script:")
        print("     python scripts/setup_file_search.py")
        print("  2. The NEPA Advisor will use these documents for RAG")
        sys.exit(0)


if __name__ == "__main__":
    main()
