# Skills Library

Portable expertise packages for RANGER agents.

## Overview

Skills are the value layer in RANGER's architecture. While agents are orchestration (commoditized), Skills encode domain expertise that makes RANGER uniquely valuable for forest recovery.

Each Skill is a portable, testable, versionable package containing:
- `skill.md` - Instructions, triggers, decision logic
- `scripts/` - Executable tools (Python, bash)
- `resources/` - Reference data, decision trees
- `examples/` - Few-shot examples for the LLM
- `tests/` - Skill validation tests

## Directory Structure

```
skills/
├── foundation/            # Cross-agency skills (USDA-wide)
│   ├── _template/         #   Skill authoring template
│   │   ├── skill.md       #     Template instructions
│   │   ├── scripts/       #     Example scripts
│   │   └── resources/     #     Example resources
│   └── greeting/          #   Example skill (hello world)
│
└── forest-service/        # USFS-specific skills (planned)
    └── README.md          #   Planned skills list
```

## Three-Tier Taxonomy

| Tier | Scope | Location | Examples |
|------|-------|----------|----------|
| **Foundation** | Cross-agency, cross-domain | `skills/foundation/` | NEPA compliance, geospatial analysis |
| **Agency** | Agency-specific but shared | `skills/forest-service/` | USFS fire terminology, BAER protocol |
| **Application** | Single agent | `agents/{name}/skills/` | Specific analysis logic |

## Creating a New Skill

1. Copy the template:
   ```bash
   cp -r skills/foundation/_template skills/foundation/my-skill
   ```

2. Edit `skill.md` with your expertise:
   - Description
   - Triggers (when to invoke)
   - Instructions (step-by-step logic)
   - Inputs/Outputs

3. Add tests:
   ```bash
   pytest skills/foundation/my-skill/tests/ -v
   ```

4. Register with agent:
   ```python
   from skills.foundation.my_skill import skill
   agent.register_skill(skill)
   ```

## Skill Format Specification

See `docs/specs/skill-format.md` for the complete specification.

### Minimal `skill.md` Template

```markdown
# [Skill Name]

## Description
Brief description of what this skill does.

## Triggers
When should the agent invoke this skill?
- User asks about X
- Task involves Y

## Instructions
Step-by-step instructions for the agent.

1. First, do X
2. Then, evaluate Y
3. Finally, produce Z

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | NIFC fire identifier |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| result | object | Analysis result |
```

## Why Skills-First?

From ADR-005:

> In AI, the "Operating System" (Agents) will be commoditized. The "Applications" (Skills) are where the value lives. Every line of code must contribute to skill portability.

Skills provide:
- **Auditability** - Versioned in Git, full lineage
- **Testability** - Unit test individual skills
- **Reusability** - Import skill folders across agents
- **Governance** - Explicit decision logic in `skill.md`

## References

- [ADR-005](../docs/adr/ADR-005-skills-first-architecture.md) — Skills-First Architecture
- **Skill Format:** `docs/specs/skill-format.md`
- **Example Skill:** `skills/foundation/greeting/`

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **BAER** | Burned Area Emergency Response | USFS post-fire emergency program |
| **LLM** | Large Language Model | AI model trained on text (e.g., Gemini) |
| **NEPA** | National Environmental Policy Act | Federal environmental assessment law |
| **USFS** | United States Forest Service | Federal agency managing national forests |

→ **[Full Glossary](../docs/GLOSSARY.md)**
