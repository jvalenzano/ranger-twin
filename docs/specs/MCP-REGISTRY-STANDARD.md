# Standard: MCP Registry (v1.0)

> [!IMPORTANT]
> **Standard:** This protocol enables **Discovery-at-Runtime** for RANGER skills, allowing them to bind to data sources without hardcoded endpoints.

## 1. Overview
The **MCP Registry** is a centralized manifest (`mcp.json`) located in the application root. It maps available MCP servers to their specific capabilities and transport protocols.

## 2. Manifest Schema: mcp.json

Every RANGER environment must provide an `mcp.json` file.

```json
{
  "version": "1.0",
  "servers": [
    {
      "id": "mcp-irwin",
      "transport": "stdio",
      "command": "python",
      "args": ["-m", "ranger.mcp.irwin"],
      "capabilities": ["incident:read", "incident:query"],
      "env": { "IRWIN_API_KEY": "..." }
    },
    {
      "id": "mcp-google-earth-engine",
      "transport": "sse",
      "url": "https://mcp.google.com/gee",
      "capabilities": ["raster:dnbr", "raster:ndvi"]
    }
  ]
}
```

## 3. Capability Negotiation Protocol

When a **Skill** is loaded into the ADK context, it performs a capability check:

1.  **Request:** Skill requests `gis:radius_query`.
2.  **Registry Lookup:** Recovery Coordinator scans `mcp.json` for a server with the matching capability.
3.  **Binding:** If found (e.g., `mcp-arcgis`), the Coordinator establishes the transport link and passes the server handle to the Skill's Tool context.
4.  **Fallback:** If no server provides the capability, the Skill remains in a `DEGRADED` state and notifies the user via an `AgentBriefingEvent`.

## 4. Tool Signature Standard

Every MCP tool must expose a JSON Schema compliant signature. This is critical for the **Coordinator** to perform accurate tool-calling.

### 4.1 Schema Template
```json
{
  "tool_name": "string",
  "description": "Clear USFS-aligned description of what this data provides",
  "parameters": {
    "type": "object",
    "properties": {
      "fire_id": { "type": "string", "description": "NIFC IRWIN ID" },
      "buffer_meters": { "type": "integer", "default": 500 }
    },
    "required": ["fire_id"]
  },
  "returns": {
    "type": "object",
    "properties": {
      "data": { "type": "array" },
      "provenance": { "type": "string" }
    }
  }
}
```

### 4.2 Error Handling Contract
MCP Servers must not return 500 status codes for data issues. Instead, return a structured error body:
- `error_code`: (e.g., `INCIDENT_NOT_FOUND`)
- `suggestion`: (e.g., "Verify the Fire ID against the IRWIN registry")
- `severity`: (WARNING/SEVERE)

## 5. Connection Lifecycle

| Phase | Description |
|-------|-------------|
| **Initialization** | Coordinator reads `mcp.json` and starts local `stdio` servers. |
| **Health Check** | Ping-pong check every 300s to ensure servers are alive. |
| **On-Demand Call** | Only when a Skill invokes the tool is the full payload sent. |
| **Graceful Exit** | Servers are SIGTERM'd when the ADK session terminates. |

## 5. Security: Gateway Isolation
Skills **never** communicate with MCP servers directly. All calls are proxied through the ADK's Tool invocation layer. 
- **Whitelisting:** Skills must declare required capabilities in their `skill.md` file.
- **Redaction:** The Registry can define "Redaction Rules" for sensitive fields (e.g., masking budget IDs from external MCP logs).

---
*Created: December 2025*
