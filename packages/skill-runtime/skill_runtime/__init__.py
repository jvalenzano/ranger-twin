"""
RANGER Skill Runtime

Utilities for loading, parsing, and executing RANGER skills.
Provides testing infrastructure for deterministic skill validation.

Phase 2 Implementation (Hybrid Approach):
- MCPMockProvider for fixture injection in tests
- Basic skill discovery and loading
- Script execution support

Deferred to Phase 3:
- Full SkillTestHarness wrapper
- mcp.json registry integration
- AgentBriefingEvent wrapping
"""

__version__ = "0.2.0"

from .loader import (
    SkillMetadata,
    discover_skills,
    execute_skill,
    load_skill_script,
    parse_skill_md,
)
from .testing import (
    MCPMockProvider,
    SkillExecutionContext,
)

__all__ = [
    # Loader
    "SkillMetadata",
    "discover_skills",
    "execute_skill",
    "load_skill_script",
    "parse_skill_md",
    # Testing
    "MCPMockProvider",
    "SkillExecutionContext",
]
