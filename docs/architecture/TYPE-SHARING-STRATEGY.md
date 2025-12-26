# Type Sharing Strategy

This document describes how types are shared between the Python backend and TypeScript frontend.

## Overview

RANGER uses **Pydantic as the source of truth** for shared API types. TypeScript definitions are auto-generated to ensure consistency.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Python (Source of Truth)                                   │
│  packages/agent-common/agent_common/types/briefing.py       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ datamodel-code-generator
┌─────────────────────────────────────────────────────────────┐
│  TypeScript (Generated)                                     │
│  apps/command-console/src/types/generated/briefing.generated.ts │
└─────────────────────────────────────────────────────────────┘
```

## Shared Types

These types are shared between frontend and backend:

| Type | Purpose |
|------|---------|
| `AgentBriefingEvent` | Main agent communication contract |
| `EventType` | Alert, insight, action_required, status_update |
| `Severity` | Info, warning, critical |
| `UITarget` | Map highlight, rail pulse, panel inject, modal interrupt |
| `SourceAgent` | 5 agent identifiers |
| `ProofLayer` | Citations, confidence ledger, reasoning chain |
| `GeoReference` | GeoJSON geometry for map rendering |

## Frontend-Only Types

These types are NOT shared (frontend-specific):

| Type | Location | Purpose |
|------|----------|---------|
| `FireContext` | `src/types/fire.ts` | UI state for fire selection |
| `NationalFire` | `src/types/mission.ts` | Mission control fire data |
| `OnboardingState` | `src/types/fire.ts` | Demo tour state |

## Regenerating Types

When Pydantic models change:

```bash
cd apps/command-console
npm run generate:types
```

Or directly:

```bash
cd packages/agent-common
pip install -e ".[codegen]"
python scripts/generate-types.py
```

## Adding New Shared Types

1. Define the Pydantic model in `packages/agent-common/agent_common/types/`
2. Export from `agent_common/__init__.py`
3. Run `npm run generate:types`
4. Import from `src/types/generated/` in frontend code

## Migration Strategy

Current frontend types in `src/types/briefing.ts` were manually created.
Migration path:
1. Generated types available in `src/types/generated/briefing.generated.ts`
2. Gradually update imports to use generated types
3. Remove manual types once fully migrated
