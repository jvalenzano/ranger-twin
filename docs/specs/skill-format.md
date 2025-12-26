# Skill Format Specification (v1.0)

**Status:** Active
**Last Updated:** December 25, 2025
**Owner:** RANGER Team

---

## Overview

A **Skill** in RANGER is a portable unit of domain expertise. It combines natural language
instructions, executable tools, and reference data to enable agents to perform specialized tasks.

This specification defines the canonical format for all RANGER skills, ensuring consistency,
testability, and reusability across agents and applications.

---

## Directory Structure

```
skill-name/
├── skill.md              # Core instructions (Required)
├── scripts/              # Executable tools (Optional)
│   └── tool.py
├── resources/            # Reference data (Optional)
│   └── thresholds.json
├── examples/             # Few-shot examples (Optional)
│   ├── input.json
│   └── output.json
└── tests/                # Verification suite (Required)
    ├── __init__.py
    └── test_skill.py
```

### File Descriptions

| File/Directory | Required | Purpose |
|----------------|----------|---------|
| `skill.md` | Yes | Core skill definition with instructions, inputs, outputs |
| `tests/` | Yes | Test suite to verify skill behavior |
| `scripts/` | No | Python or bash scripts the agent can execute |
| `resources/` | No | Reference data (JSON, CSV, thresholds) |
| `examples/` | No | Few-shot examples for in-context learning |

---

## skill.md Schema

The `skill.md` file must contain the following sections in order:

### 1. Title (Required)
```markdown
# [Skill Name]
```
- Use Title Case for display name
- Use kebab-case for folder name (e.g., `mtbs-classification`)

### 2. Description (Required)
```markdown
## Description
Brief (1-3 sentences) explanation of what this skill does and its domain context.
```

### 3. Triggers (Required)
```markdown
## Triggers
When should the agent invoke this skill?
- Condition 1
- Condition 2
- Condition 3
```
List specific conditions that should activate this skill. Be precise to avoid
conflicts with other skills.

### 4. Instructions (Required)
```markdown
## Instructions
Detailed instructions for the agent on how to execute this skill.
```

### 5. Inputs (Required)
```markdown
## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| param_name | string | Yes | Description |
```

### 6. Outputs (Required)
```markdown
## Outputs
| Output | Type | Description |
|--------|------|-------------|
| result_name | string | Description |
```

### 7. Reasoning Chain (Required)
```markdown
## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, [Action]
2. Then, [Evaluation]
3. Finally, [Output]
```
Provide clear, numbered steps the LLM should follow. Include decision points
and branching logic if applicable. This is critical for the "Proof Layer" in the UI.

### 8. Resources (Optional)
```markdown
## Resources
- `thresholds.json` - Classification thresholds
- `decision-tree.json` - Decision logic
```
List any reference data files in the `resources/` directory.

### 8. Scripts (Optional)
```markdown
## Scripts
- `calculate.py` - Performs calculation X
```
List any executable scripts in the `scripts/` directory.

### 9. Examples (Recommended)
```markdown
## Examples

### Example 1: [Scenario Name]
**Input:**
\`\`\`json
{ "param": "value" }
\`\`\`

**Output:**
\`\`\`json
{ "result": "value" }
\`\`\`
```
Provide 2-3 examples for few-shot learning. Use realistic, domain-appropriate data.

### 10. References (Optional)
```markdown
## References
- [Document Name](url)
- Standard Protocol v1.2
```

---

## Implementation Guidelines

### Portability
- Skills should not depend on agent-specific code
- Use relative paths for resources and scripts
- Avoid hardcoded URLs, API keys, or credentials
- Skills must work across different agents that support the skill

### Granularity
- One skill = one specific domain task
- If a skill does multiple things, split it into separate skills
- **Good:** "MTBS Classification", "Soil Burn Severity"
- **Bad:** "Fire Analysis" (too broad)

### Auditability
- All decision logic must be explicitly stated in `skill.md`
- No hidden logic in scripts without documentation
- Include reasoning chains in instructions
- Document data sources and thresholds

### Testability
- Every skill must have at least one test in `tests/`
- Tests should verify skill.md structure and content
- Include edge case tests where applicable
- Test files should be discoverable by pytest

---

## Skill Taxonomy

Skills are organized into three tiers based on reusability:

### Foundation Skills (`skills/foundation/`)
Cross-agency, cross-domain skills reusable across USDA:
- NEPA Compliance
- Geospatial Analysis
- Document Generation
- Federal Reporting
- Greeting (example skill)

### Agency Skills (`skills/forest-service/`)
Agency-specific but shared across applications:
- Fire Terminology
- BAER Protocols
- TRACS Integration
- FSVeg Standards

### Agent Skills (`agents/[name]/skills/`)
Agent-specific skills not intended for broad sharing:
- Delegation (coordinator)
- Soil Burn Severity (burn-analyst)
- Cruise Methodology (cruising-assistant)

---

## Versioning

Skills are versioned through their parent package:
- `0.1.0` - Initial implementation (Phase 0)
- `0.2.0` - Feature additions
- `1.0.0` - Production-ready

Breaking changes require major version bump.

---

## Loading Behavior

Skills use progressive disclosure for efficiency:

1. **Discovery Phase** (Agent Init)
   - Skill folders are scanned
   - Only metadata extracted (name, description, triggers)
   - Full content NOT loaded

2. **Invocation Phase** (Query Processing)
   - When triggers match, full skill.md is loaded
   - Resources and scripts loaded on-demand
   - Examples provided for few-shot context

3. **Execution Phase** (If scripts exist)
   - Scripts executed in sandboxed environment
   - Results returned to agent context

---

## Script Execution

Scripts in `scripts/` directory:

### Requirements
- Must be Python 3.11+ compatible
- Must have clear input/output interface
- Must handle errors gracefully
- Must not access network without explicit permission

### Interface Pattern
```python
def execute(inputs: dict) -> dict:
    """
    Execute the skill script.

    Args:
        inputs: Dictionary matching skill Inputs specification

    Returns:
        Dictionary matching skill Outputs specification
    """
    # Implementation
    return {"result": value}
```

---

## Testing Requirements

### Minimum Test Coverage
```python
def test_skill_md_exists():
    """Skill definition file should exist."""

def test_skill_md_has_required_sections():
    """Skill definition should have all required sections."""

def test_skill_inputs_defined():
    """Inputs section should define at least one input."""

def test_skill_outputs_defined():
    """Outputs section should define at least one output."""
```

### Running Tests
```bash
cd /path/to/ranger
pytest skills/ -v
```

---

## Example: Complete Skill

See `skills/foundation/greeting/` for a complete working example that
demonstrates all required sections and testing patterns.

---

## References

- ADR-005: Skills-First Multi-Agent Architecture
- RANGER Implementation Roadmap
- Google ADK Documentation
