"""
Pytest configuration for skill-runtime tests.
"""

import sys
from pathlib import Path

# Add skill_runtime to path
RUNTIME_DIR = Path(__file__).parent.parent / "skill_runtime"
if str(RUNTIME_DIR.parent) not in sys.path:
    sys.path.insert(0, str(RUNTIME_DIR.parent))
