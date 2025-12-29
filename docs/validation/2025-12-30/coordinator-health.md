# Phase 1: Health Baseline Report (2025-12-30)

## Service Health Checks

| Service | Endpoint | Status | Service Name | ADK Version |
|---------|----------|--------|--------------|-------------|
| Coordinator | [Health](https://ranger-coordinator-fqd6rb7jba-uw.a.run.app/health) | ✅ Healthy | `ranger-orchestrator` | `1.21.0` |
| MCP Fixtures | [Health](https://ranger-mcp-fixtures-fqd6rb7jba-uw.a.run.app/health) | ✅ Healthy | `ranger-mcp-fixtures` | N/A |

### MCP Tools Loaded
- `get_fire_context`
- `mtbs_classify`
- `assess_trails`
- `get_timber_plots`

## SSE Endpoint Validation

- **Command**: `curl -N -X POST https://ranger-coordinator-fqd6rb7jba-uw.a.run.app/run_sse ...`
- **Result**: ❌ FAILED
- **Error**: `403 PERMISSION_DENIED. {'error': {'code': 403, 'message': 'Your API key was reported as leaked. Please use another API key.', 'status': 'PERMISSION_DENIED'}}`

> [!CAUTION]
> **CRITICAL ISSUE**: The production API key for the Coordinator appears to be revoked due to a leak. This prevents the Coordinator from processing any messages.

## Next Steps
- Document issue in `docs/validation/2025-12-30/issues.md`
- Identify which API key is leaked (Google API Key)
- Escalate/Fix if possible (check `.env` or secret management if accessible)
