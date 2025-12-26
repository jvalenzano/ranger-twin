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

## 4. Connection Lifecycle

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
