"""
RANGER Skill Runtime - Mocking Utilities (Compatibility Module)

This module re-exports from testing.py for backward compatibility.
The canonical implementation is in testing.py.

See testing.py for full documentation and features.
"""

from .testing import MCPMockProvider, SkillExecutionContext

__all__ = ["MCPMockProvider", "SkillExecutionContext"]
