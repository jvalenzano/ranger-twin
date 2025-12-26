"""
Pytest configuration for Coordinator tests.

Sets up Python paths for importing agents and packages.
"""

import sys
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parents[3]

# Add agents directory to path
AGENTS_DIR = PROJECT_ROOT / "agents"
if str(AGENTS_DIR) not in sys.path:
    sys.path.insert(0, str(AGENTS_DIR))

# Add packages to path
PACKAGES_DIR = PROJECT_ROOT / "packages"
SKILL_RUNTIME_DIR = PACKAGES_DIR / "skill-runtime"
if str(SKILL_RUNTIME_DIR) not in sys.path:
    sys.path.insert(0, str(SKILL_RUNTIME_DIR))
