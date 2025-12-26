# Skill Runtime

Utilities for loading, parsing, and executing RANGER skills.

## Status

**Phase:** Placeholder (Phase 0)
**Implementation:** Phase 1

## Purpose

The Skill Runtime package provides the infrastructure for:
- Discovering skills from configured directories
- Parsing skill.md files into structured data
- Loading skills with progressive disclosure
- Executing skill scripts in a sandboxed environment

## Planned Features

### Skill Discovery
```python
from skill_runtime import discover_skills

skills = discover_skills([
    "./skills",
    "../../skills/foundation"
])
```

### Skill Loading
```python
from skill_runtime import load_skill

skill = load_skill("mtbs-classification")
print(skill.triggers)
print(skill.instructions)
```

### Script Execution
```python
from skill_runtime import execute_script

result = execute_script(
    skill_name="mtbs-classification",
    script_name="classify.py",
    inputs={"dnbr": 0.45}
)
```

## Architecture

```
skill_runtime/
├── __init__.py
├── discovery.py      # Skill folder scanning
├── parser.py         # skill.md parsing
├── loader.py         # Progressive loading
├── executor.py       # Script sandbox
└── types.py          # Data structures
```

## Dependencies

- `pydantic>=2.0.0` - Data validation
- `markdown>=3.4.0` - Markdown parsing (future)

## References

- `docs/specs/skill-format.md` - Skill format specification
- ADR-005: Skills-First Multi-Agent Architecture
