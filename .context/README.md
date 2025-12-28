# .context/ - Active Context Directory

This directory contains **authoritative context** for AI agents working on RANGER.

## Purpose

AI tools (Claude Code, Cursor, etc.) should read from this directory for current project state. Everything here is actively maintained and represents the **source of truth** for agent context.

## Contents

| File | Purpose | Token Budget |
|------|---------|--------------|
| `CLAUDE.md` | Core agent instructions (~1000 tokens) | 1000 |
| `architecture.md` | Current system architecture | 500 |
| `GARDENING.md` | Weekly maintenance checklist | 200 |
| `MANIFEST.md` | Index of authoritative docs | 300 |

**Total context budget:** ~2000 tokens (10% of typical session)

## Rules

1. **Keep it lean** - If a file exceeds its budget, split or summarize
2. **Keep it current** - Outdated content moves to `docs/archive/`
3. **Keep it authoritative** - No drafts, plans, or speculative content here
4. **Review weekly** - Friday gardening session validates this directory

## What Does NOT Belong Here

- Planning documents (use `docs/planning/`)
- Historical decisions (use `docs/adr/`)
- Implementation guides (use `docs/runbooks/`)
- Feature specs (use `docs/features/`)

---

*Created: December 2025*
*Last validated: See GARDENING.md for schedule*
