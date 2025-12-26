# MCP Specification: IRWIN Wrapper (v1.0)

> [!IMPORTANT]
> **Standard:** This specification is aligned with the **[Strategic Intelligence Report](../research/STRATEGIC-INTELLIGENCE-REPORT.md)** and **[ADR-005](../adr/ADR-005-skills-first-architecture.md)**. 

## 1. Overview
The **MCP-IRWIN Server** is a domain-specific wrapper around the federal IRWIN (Interagency Real-time Incident-related Data Sharing) service. It provides the **Recovery Coordinator** with authoritative, real-time metadata for all wildland fire incidents.

## 2. Technical Strategy: "Wrap & Normalize"
IRWIN exposes a large, interagency-governed schema. RANGER's MCP server will expose a subset of these fields normalized into the **RANGER Common Data Schema (CDS)**.

### Field Mappings

| RANGER CDS Field | IRWIN Original Field | Description |
|------------------|----------------------|-------------|
| `incident_id` | `IrwinID` | Global UUID for the incident. |
| `name` | `IncidentName` | Official agency fire name. |
| `status` | `IncidentStatusValue` | Active, Contained, Out. |
| `priority` | `IncidentPriorityValue` | 1-5 triage priority. |
| `owner_agency` | `POOProtectingAgency` | Protecting agency code (e.g., USFS, BLM). |
| `location` | `Point` (lat/long) | Origin coordinates. |
| `discovery_date`| `FireDiscoveryDateTime` | ISO 8601 timestamp. |

## 3. Server Capabilities (Tools)

### `get_incident_summaries`
- **Output:** List of active fires within a specific Geographic Area (GACC).
- **Use Case:** Populating the Mission Control fire list.

### `get_incident_detail`
- **Input:** `incident_id`
- **Output:** Detailed metadata for a single incident.
- **Use Case:** Populating the Tactical View sidebar.

### `query_incidents`
- **Input:** `bounding_box`, `min_priority`
- **Output:** GeoJSON of incidents matching filters.

## 4. Polling & Sync Strategy
- **Refresh Frequency:** 60 seconds (aligned with IRWIN's standard lag).
- **Caching:** Local SQLite via the MCP Data Ops server to reduce upstream API load.
- **Triggers:** If an incident status changes to "Contained," the MCP server emits a `STATUS_CHANGE` event to the Recovery Coordinator to trigger a BAER Triage skill.

## 5. Security & Authentication
- **Access Level:** Requires USFS IRWIN Read-Only credentials.
- **Transport:** TLS 1.3 required for all upstream calls.
- **PII:** All Personal Identifiable Information (Incident Commander phone numbers, etc.) is filtered at the MCP layer and **never** enters the RANGER ADK context.

---
*Created: December 2025*
