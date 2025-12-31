# Shared Agent Utilities

Common utilities and helpers shared across all RANGER agents.

## Overview

This module provides shared functionality that all agents need, avoiding code duplication and ensuring consistent behavior.

## Modules

| Module | Purpose |
|--------|---------|
| `audit_bridge.py` | Audit trail and callback handling |
| `callbacks.py` | ADK callback implementations |
| `config.py` | Shared configuration management |
| `fire_utils.py` | Fire-related utility functions |
| `mcp_client.py` | MCP client for data connectivity |
| `validation.py` | Input/output validation helpers |

## Usage

```python
from agents._shared.config import get_model_config
from agents._shared.callbacks import create_audit_callback
from agents._shared.fire_utils import parse_fire_id
from agents._shared.mcp_client import MCPClient
```

## Testing

```bash
pytest agents/_shared/tests/ -v
```

## References

- **Architecture:** ADR-005 (Skills-First)
- **Audit Bridge:** `AUDIT_BRIDGE_DELIVERY.md`
