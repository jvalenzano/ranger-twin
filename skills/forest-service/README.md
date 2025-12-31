# Forest Service Skills

> **Status:** Planned. No skills implemented yet.

USFS-specific skills that are reusable across Forest Service applications but not appropriate for the cross-agency `foundation/` tier.

## Purpose

This directory will contain skills specific to USDA Forest Service operations, terminology, and workflows. These skills encode agency-specific expertise that may not be portable to other USDA agencies (NRCS, FSA, etc.).

## Planned Skills

| Skill | Purpose | Status |
|-------|---------|--------|
| `fire-terminology` | USFS fire management vocabulary and acronyms | Planned |
| `baer-protocol` | Burned Area Emergency Response procedures | Planned |
| `timber-cruising` | USFS timber inventory standards | Planned |
| `trail-standards` | USFS trail classification and maintenance | Planned |

## Skill Taxonomy

```
skills/
├── foundation/            # Cross-agency (USDA-wide) skills
│   ├── _template/         #   Skill authoring template
│   └── greeting/          #   Example skill
│
└── forest-service/        # ← You are here (USFS-specific)
    └── (planned skills)
```

## When to Use This Tier

Add a skill to `forest-service/` when:
- It encodes USFS-specific terminology or procedures
- It's useful across multiple RANGER agents
- It wouldn't be appropriate for other USDA agencies

Add a skill to `foundation/` instead when:
- It's domain-agnostic (NEPA, geospatial, federal reporting)
- It could be reused by NRCS, FSA, or other USDA agencies

Add a skill directly to an agent's `skills/` folder when:
- It's specific to a single agent's domain
- It's unlikely to be reused elsewhere

## References

- **Template:** `skills/foundation/_template/`
- **Skill Format:** `docs/specs/skill-format.md`
- [ADR-005](../../docs/adr/ADR-005-skills-first-architecture.md) — Skills-First Architecture

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **BAER** | Burned Area Emergency Response | USFS post-fire emergency program |
| **FSA** | Farm Service Agency | USDA agency for farm programs |
| **NRCS** | Natural Resources Conservation Service | USDA conservation agency |
| **USDA** | United States Department of Agriculture | Federal agriculture department |
| **USFS** | United States Forest Service | Federal agency managing national forests |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
