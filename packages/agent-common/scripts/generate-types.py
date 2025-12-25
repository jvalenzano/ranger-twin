#!/usr/bin/env python3
"""Generate TypeScript types from Pydantic models.

This script generates TypeScript type definitions from the agent-common
Pydantic models, ensuring frontend and backend types stay in sync.

Usage:
    python scripts/generate-types.py

Output:
    apps/command-console/src/types/generated/briefing.generated.ts
"""
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PACKAGE_ROOT = SCRIPT_DIR.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent
OUTPUT_DIR = REPO_ROOT / "apps" / "command-console" / "src" / "types" / "generated"
OUTPUT_FILE = OUTPUT_DIR / "briefing.generated.ts"
INPUT_FILE = PACKAGE_ROOT / "agent_common" / "types" / "briefing.py"


def generate_types():
    """Generate TypeScript types from Pydantic models."""
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Run datamodel-code-generator
    cmd = [
        sys.executable, "-m", "datamodel_code_generator",
        "--input", str(INPUT_FILE),
        "--input-file-type", "python",
        "--output", str(OUTPUT_FILE),
        "--output-model-type", "typescript",
        "--target-python-version", "3.11",
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Generated: {OUTPUT_FILE}")
    except subprocess.CalledProcessError as e:
        print(f"Error generating types: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print("Error: datamodel-code-generator not installed.")
        print("Install with: pip install 'datamodel-code-generator[http]'")
        sys.exit(1)

    # Add header comment
    if OUTPUT_FILE.exists():
        content = OUTPUT_FILE.read_text()
        header = f'''/**
 * AUTO-GENERATED TypeScript types from Pydantic models.
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:types
 *
 * Source: packages/agent-common/agent_common/types/briefing.py
 * Generated: {datetime.now().isoformat()}
 */

'''
        OUTPUT_FILE.write_text(header + content)
        print(f"Added generation header to {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_types()
