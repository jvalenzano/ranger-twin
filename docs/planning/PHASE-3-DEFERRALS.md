# Phase 3 Deferrals

This document tracks architectural work deferred from Phase 2 to Phase 3 per the Hybrid Approach decision.

## Decision Context

During Phase 2 sync review, gaps were identified between new architectural specs and the existing implementation. An expert consultation recommended the **Hybrid Approach (Option C)**: build lightweight infrastructure now while deferring full spec compliance to Phase 3.

**Date:** 2025-12-25
**Decision:** Hybrid Approach - Skills remain pure functions, Coordinator owns event wrapping

## What Was Built in Phase 2

### MCPMockProvider (`packages/skill-runtime/skill_runtime/testing.py`)

Lightweight mock infrastructure for fixture injection in skill tests:

- `MCPMockProvider` - Registers mock responses, tracks call history, supports assertions
- `SkillExecutionContext` - Execution context with MCP provider access
- 19 tests verifying mock registration, chaining, fixture loading, error simulation

### Skill Loader (`packages/skill-runtime/skill_runtime/loader.py`)

Skill discovery and execution utilities:

- `SkillMetadata` - Parsed skill.md metadata with validation
- `discover_skills()` - Multi-path skill discovery
- `load_skill_script()` / `execute_skill()` - Dynamic skill execution
- 16 tests verifying discovery, parsing, and execution flow

### Template Skill (`skills/foundation/_template/`)

Reference implementation demonstrating the skill contract:

- `skill.md` - Echo Skill with triggers, inputs, outputs
- `scripts/echo.py` - Pure function `execute(inputs) -> dict`
- `resources/config.json` - Skill configuration

## Deferred to Phase 3

### 1. Full SkillTestHarness (SKILL-RUNTIME-SPEC.md)

**Spec Location:** `docs/specs/SKILL-RUNTIME-SPEC.md`

The spec describes a comprehensive `SkillTestHarness` with:

```python
class SkillTestHarness:
    def load_skill(name: str) -> Skill
    def execute(skill: Skill, inputs: dict) -> SkillResult
    def with_mcp_mock(server: str, responses: dict) -> SkillTestHarness
    def with_fixtures(path: str) -> SkillTestHarness
    def assert_output_schema(result: SkillResult, schema: dict) -> None
```

**Deferred Because:** Current lightweight approach (loader + MCPMockProvider) provides sufficient testing capability for Phase 2 skills. Full harness adds complexity without immediate benefit.

**Phase 3 Work:**
- Implement `SkillTestHarness` class wrapping loader functions
- Add schema validation against `skill.md` output definitions
- Integrate with pytest fixtures pattern

### 2. MCP Registry (MCP-REGISTRY-STANDARD.md)

**Spec Location:** `docs/specs/MCP-REGISTRY-STANDARD.md`

The spec describes `mcp.json` registries per agent:

```json
{
  "registry_version": "1.0.0",
  "servers": {
    "mcp-nifc": {
      "transport": "stdio",
      "tools": {
        "get_active_incidents": {
          "inputs": {...},
          "outputs": {...}
        }
      }
    }
  }
}
```

**Deferred Because:** Phase 2 skills use fixture data directly. MCP registry becomes critical in Phase 3 when connecting to real data sources.

**Phase 3 Work:**
- Create `agents/burn-analyst/mcp.json` with tool signatures
- Implement registry loading in skill-runtime
- Auto-generate mock stubs from registry definitions
- Validate MCP calls against registered schemas

### 3. AgentBriefingEvent at Skill Level

**Spec Location:** `docs/specs/PROTOCOL-AGENT-COMMUNICATION.md`

The spec describes 7-state machine with structured events:

```python
class AgentBriefingEvent:
    event_type: str  # STATUS, INSIGHT, etc.
    source_agent: str
    proof_layer: ProofLayer
```

**Deferred Because:** Skills should remain pure functions returning domain data. The Coordinator agent owns event wrapping and state machine transitions.

**Phase 3 Work:**
- Implement event wrapping in Coordinator
- Add proof_layer extraction from skill reasoning_chain
- Stream STATUS events during delegation
- Package final output as INSIGHT/COMPLETE events

### 4. Skill-to-Skill Communication

**Not Yet Specified**

Skills currently operate independently. Phase 3 may require skills to compose (e.g., boundary-mapping calls mtbs-classification).

**Phase 3 Work:**
- Design skill composition pattern
- Consider DAG execution model
- Define inter-skill data contracts

## Migration Path

When implementing Phase 3 items:

1. **SkillTestHarness** - Wrap existing loader functions, don't rewrite
2. **mcp.json** - Start with burn-analyst, template from spec
3. **Event Wrapping** - Implement in Coordinator `agent.py`, not skills
4. **Skill Composition** - Evaluate need based on Phase 3 requirements

## Verification

Phase 2 implementation verified with:

```bash
# Skill-runtime tests (35 passing)
.venv/bin/pytest packages/skill-runtime/tests/ -v --override-ini="addopts="

# Burn Analyst skills (109 passing)
.venv/bin/pytest agents/burn-analyst/skills/soil-burn-severity/tests/ -v
.venv/bin/pytest agents/burn-analyst/skills/mtbs-classification/tests/ -v
.venv/bin/pytest agents/burn-analyst/skills/boundary-mapping/tests/ -v
```
