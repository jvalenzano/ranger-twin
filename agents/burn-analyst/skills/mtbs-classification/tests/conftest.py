"""
Pytest configuration for MTBS Classification skill tests.

Sets up path imports to allow tests to run independently
of the parent agent package.
"""

import sys
from pathlib import Path

# Add scripts directory to path before any tests run
SKILL_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = SKILL_DIR / "scripts"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))
