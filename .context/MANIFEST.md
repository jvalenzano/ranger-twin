# Documentation Manifest - Authoritative Sources

> **Purpose:** Index of canonical documentation. If it's not here, verify before trusting.

## Tier 1: Architectural Truth (Must Read)

| Document | Location | Purpose |
|----------|----------|---------|
| Skills-First Architecture | `docs/adr/ADR-005-skills-first-architecture.md` | Core paradigm |
| Google-Only LLM | `docs/adr/ADR-006-google-only-llm-strategy.md` | API simplification |
| Tool Invocation | `docs/adr/ADR-007.1-tool-invocation-strategy.md` | Prevents infinite loops |
| Product Summary | `docs/PRODUCT-SUMMARY.md` | What RANGER is |

## Tier 2: Implementation Reference

| Category | Location | Contents |
|----------|----------|----------|
| ADRs | `docs/adr/` | All architecture decisions |
| Specs | `docs/specs/` | Technical specifications |
| Runbooks | `docs/runbooks/` | Operational procedures |
| Features | `docs/features/` | Feature specifications |

## Tier 3: Historical Context

| Category | Location | Use Case |
|----------|----------|----------|
| Archive | `docs/archive/` | Understanding past decisions |
| Research | `docs/research/` | Background investigation |
| Workshop | `docs/workshop/` | Presentation materials |

## Not Authoritative (Treat with Caution)

These locations may contain outdated content:

- Root-level `*-SUMMARY.md`, `*-REPORT.md` files (temporary artifacts)
- `docs/planning/` (may be stale)
- `docs/implementation/` (may reference old patterns)
- Any file with `_DRAFT`, `_OLD`, `_v1` suffix

## Quick Reference: "Where Is...?"

| Question | Answer |
|----------|--------|
| How do agents work? | `docs/adr/ADR-005-skills-first-architecture.md` |
| What's the current deployment? | `docs/deployment/` |
| How do I add a skill? | `docs/specs/skill-format.md` |
| What are the ADK gotchas? | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |
| What data do we have? | `docs/DEMO-DATA-REFERENCE.md` |
| What's the UI spec? | `docs/architecture/BRIEFING-UX-SPEC.md` |
| What are the agent interfaces? | `docs/specs/agent-interface.md` |

## Verification Rules

Before trusting any document:

1. **Check the date** - Modified >30 days ago? Verify against code.
2. **Check the manifest** - Is it listed here? If not, treat as possibly stale.
3. **Check cross-references** - Does it reference superseded ADRs?
4. **Check the archive** - Is there a newer version in a different location?

---

*Last validated: December 2025*
*Next validation: See GARDENING.md schedule*
