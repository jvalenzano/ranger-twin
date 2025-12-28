# Packages

Shared libraries for the RANGER monorepo.

## Overview

This directory contains reusable packages that are shared across multiple applications and services. The monorepo uses `pnpm` workspaces for JavaScript/TypeScript packages and local `pip install -e` for Python packages.

## Directory Structure

```
packages/
├── agent-common/          # Common agent utilities (Python)
├── skill-runtime/         # Skill loading and execution (Python)
├── twin-core/             # Core types and interfaces (Python)
├── types/                 # TypeScript type definitions
└── ui-components/         # Shared React components
```

## Package Descriptions

### `agent-common/` (Python)

Shared utilities for ADK agents:
- Session state management helpers
- Logging and telemetry
- Common tool patterns

### `skill-runtime/` (Python)

Skill loading and execution engine:
- Skill discovery and registration
- `skill.md` parsing
- Skill invocation and result handling

### `twin-core/` (Python)

Core domain types and interfaces:
- `AgentBriefingEvent` schema
- Fire incident data models
- Assessment data structures

### `types/` (TypeScript)

TypeScript type definitions:
- API response types
- Event schemas
- Shared interfaces for frontend

### `ui-components/` (React)

Shared React components:
- Glassmorphism cards
- Status indicators
- Map components

## Usage

### Python Packages

```bash
# Install locally for development
pip install -e packages/skill-runtime
pip install -e packages/agent-common
pip install -e packages/twin-core
```

### TypeScript Packages

```bash
# pnpm workspace handles linking automatically
pnpm install

# Import in code
import { AgentBriefingEvent } from '@ranger/types';
import { GlassCard } from '@ranger/ui-components';
```

## Development

Each package follows the same structure:

```
package-name/
├── README.md              # Package documentation
├── pyproject.toml         # Python: dependencies and metadata
├── package.json           # TypeScript: dependencies and metadata
├── src/ or package_name/  # Source code
└── tests/                 # Package tests
```

## References

- **Monorepo Config:** `pnpm-workspace.yaml`
- **Architecture:** ADR-005 (Skills-First)
