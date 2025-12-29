# MCP Server Readiness Checklist

> **Last Updated:** December 27, 2025
> **Audit Scope:** All MCP servers across `/mcp/` and `/services/`
> **Purpose:** Verify health checks, tool contracts, and deployment readiness

---

## 1. Executive Summary

### Overall Status

| Metric | Status | Score |
|--------|--------|-------|
| **Production-Ready Servers** | 1/4 | 25% |
| **Health Checks Implemented** | 1/4 | 25% |
| **Tool Contracts Verified** | 1/4 | 25% |
| **Deployment Configs Complete** | 1/4 | 25% |
| **Overall Deployment Readiness** | ⚠️ Partial | **25%** |

### Critical Gaps

1. ⚠️ **NIFC Server**: Specification exists but not implemented (placeholder only)
2. ❌ **Weather Server**: Not found - no specification or implementation
3. ❌ **GIS Server**: Not found - no specification or implementation
4. ✅ **Fixtures Server**: Production-ready (Phase 4 active)

### Deployment Status

- **Ready for Production**: MCP Fixtures Server (`/services/mcp-fixtures/`)
- **Needs Implementation**: NIFC Server (`/mcp/nifc/`)
- **Needs Clarification**: Weather, GIS servers (requirements unclear)

---

## 2. Server Inventory

| Server | Location | Status | Health Check | Tool Contract | Deployment | Last Verified |
|--------|----------|--------|--------------|---------------|------------|---------------|
| **Fixtures** | `/services/mcp-fixtures/` | ✅ Production | ✅ Complete | ✅ Verified | ✅ Complete | 2025-12-27 |
| **NIFC** | `/mcp/nifc/` | 📋 Placeholder | ❌ None | 📋 Spec Only | ❌ None | 2025-12-27 |
| **Weather** | N/A | ❌ Not Found | ❌ N/A | ❌ N/A | ❌ N/A | 2025-12-27 |
| **GIS** | N/A | ❌ Not Found | ❌ N/A | ❌ N/A | ❌ N/A | 2025-12-27 |

---

## 3. MCP Fixtures Server (Production-Ready) ✅

### 3.1 Implementation Details

**Location:** `/services/mcp-fixtures/`
**Status:** ✅ Production-ready (Phase 4 active)
**Purpose:** Serves Cedar Creek fixture data to ADK agents via MCP protocol
**Technology:** Python 3.11, FastAPI/Starlette, MCP 1.25.0+, SSE transport

### 3.2 Health Check Endpoints ✅

#### Primary Health Check
```bash
# Endpoint: GET /health
# Response: 200 OK with JSON status
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ranger-mcp-fixtures",
  "fixtures_loaded": {
    "incident": true,
    "burn_severity": true,
    "trail_damage": true,
    "timber_plots": true
  }
}
```

#### Root Health Check
```bash
# Endpoint: GET /
# Response: Same as /health
curl http://localhost:8080/
```

#### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:8080/health || exit 1
```

**Verification Status:** ✅ Complete
- Health check endpoints exist
- Returns JSON with service status
- Docker HEALTHCHECK configured
- 30-second interval, 3-second timeout

### 3.3 Tool Interface Contract ✅

The server exposes 4 MCP tools matching agent expectations:

#### Tool 1: `get_fire_context`

**Purpose:** Get fire metadata and summary statistics
**Used By:** Burn Analyst, Coordinator
**File:** `services/mcp-fixtures/server.py:54-67`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fire_id": {
      "type": "string",
      "description": "Fire identifier (e.g., 'cedar-creek' or 'cedar-creek-2022')"
    }
  },
  "required": ["fire_id"]
}
```

**Response Format:**
```json
{
  "fire_id": "cedar-creek",
  "name": "Cedar Creek Fire",
  "discovery_date": "2022-08-04",
  "containment_date": "2022-09-17",
  "acres": 93245,
  "severity": "high",
  "phase": "in_restoration",
  "forest": "Gifford Pinchot National Forest",
  "state": "WA",
  "coordinates": {"lat": 46.123, "lon": -121.456},
  "summary": "...",
  "baer_status": "completed",
  "source": "RANGER-Fixtures",
  "confidence": 0.95
}
```

**Verification:** ✅ Complete
- Parameter types: Primitives only (Gemini API compliant)
- Fire ID normalization implemented (accepts variations)
- Returns TextContent with JSON-serialized data
- Includes confidence score and source attribution

#### Tool 2: `mtbs_classify`

**Purpose:** Get MTBS burn severity classification
**Used By:** Burn Analyst
**File:** `services/mcp-fixtures/server.py:68-85`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fire_id": {"type": "string", "description": "Fire identifier"},
    "include_sectors": {
      "type": "boolean",
      "description": "Include detailed sector-level data (default: true)"
    }
  },
  "required": ["fire_id"]
}
```

**Response Format:**
```json
{
  "fire_id": "cedar-creek",
  "fire_name": "Cedar Creek Fire",
  "total_acres": 93245,
  "imagery_date": "2022-09-20",
  "source": "MTBS",
  "summary": "...",
  "confidence": 0.94,
  "mtbs_id": "cc_2025_001",
  "sectors": [
    {
      "id": "sector-1",
      "name": "North Ridge",
      "severity": 4,
      "severity_class": "High",
      "acres": 12450,
      "dnbr_mean": 450,
      "priority_notes": "Requires erosion control"
    }
  ]
}
```

**Verification:** ✅ Complete
- Optional parameter handling (include_sectors)
- Sector-level data filtering
- MTBS-specific fields included

#### Tool 3: `assess_trails`

**Purpose:** Get trail damage assessment data
**Used By:** Trail Assessor
**File:** `services/mcp-fixtures/server.py:86-103`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fire_id": {"type": "string", "description": "Fire identifier"},
    "trail_id": {
      "type": "string",
      "description": "Specific trail to assess (optional, returns all if not specified)"
    }
  },
  "required": ["fire_id"]
}
```

**Response Format:**
```json
{
  "fire_id": "cedar-creek",
  "assessment_date": "2022-09-25",
  "source": "RANGER-Fixtures",
  "summary": "...",
  "confidence": 0.92,
  "trails": [
    {
      "trail_id": "trail-001",
      "trail_name": "Pacific Crest Trail",
      "damage_points": [...],
      "estimated_cost": 150000,
      "priority": "high"
    }
  ]
}
```

**Verification:** ✅ Complete
- Optional filtering by trail_id
- Returns all trails if trail_id not specified
- Error handling for unknown trail_id

#### Tool 4: `get_timber_plots`

**Purpose:** Get timber cruise plot data for salvage assessment
**Used By:** Cruising Assistant
**File:** `services/mcp-fixtures/server.py:104-117`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fire_id": {"type": "string", "description": "Fire identifier"}
  },
  "required": ["fire_id"]
}
```

**Response Format:**
```json
{
  "fire_id": "cedar-creek",
  "source": "RANGER-Fixtures",
  "confidence": 0.88,
  "plots": [
    {
      "plot_id": "plot-001",
      "coordinates": {"lat": 46.123, "lon": -121.456},
      "species_data": [...],
      "volume_mbf": 12.5
    }
  ]
}
```

**Verification:** ✅ Complete

### 3.4 Transport Protocol ✅

**Protocol:** SSE (Server-Sent Events) over HTTP
**Endpoint:** `/sse`
**Supported Methods:**
- `GET /sse` - SSE connection initialization
- `POST /sse` - MCP message handling
- `POST /messages` - Alternative message endpoint

**Implementation:** `services/mcp-fixtures/server.py:231-277`

**Verification:** ✅ Complete
- SSE transport configured via `SseServerTransport`
- Dual HTTP routes (GET for connection, POST for messages)
- MCP client POSTs to `/sse` endpoint

### 3.5 Agent Integration ✅

**Client Factory:** `agents/shared/mcp_client.py`

**Integration Pattern:**
```python
from agents.shared.mcp_client import get_burn_analyst_toolset

# In agent.py
MCP_TOOLSET = get_burn_analyst_toolset()

tools=[
    *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
    # ... other tools
]
```

**Agent-Specific Toolsets:**
| Agent | Toolset Function | Tools Exposed |
|-------|------------------|---------------|
| Burn Analyst | `get_burn_analyst_toolset()` | `get_fire_context`, `mtbs_classify` |
| Trail Assessor | `get_trail_assessor_toolset()` | `assess_trails` |
| Cruising Assistant | `get_cruising_assistant_toolset()` | `get_timber_plots` |
| Coordinator | `get_coordinator_toolset()` | All tools (no filter) |

**Connection Parameters:**
- URL: `http://localhost:8080/sse` (configurable via `MCP_FIXTURES_URL`)
- Read timeout: 30 seconds
- Tool name prefix: `mcp_` (e.g., `mcp_get_fire_context`)

**Verification:** ✅ Complete
- Agents use ADK-native `McpToolset`
- Tool filtering per agent role
- Graceful fallback if MCP unavailable
- Three-tier tool invocation enforcement (ADR-007)

### 3.6 Deployment Configuration ✅

#### Dockerfile

**Location:** `services/mcp-fixtures/Dockerfile`
**Base Image:** `python:3.11-slim`
**Build Context:** Project root

**Features:**
- Multi-stage build (optimized)
- Curl installed for health checks
- Fixture data copied from `data/fixtures/cedar-creek/`
- Health check configured (30s interval, 3s timeout)
- Port 8080 exposed

**Build Command:**
```bash
docker build -f services/mcp-fixtures/Dockerfile -t ranger-mcp-fixtures .
```

**Verification:** ✅ Complete

#### Cloud Build Configuration

**Location:** `services/mcp-fixtures/cloudbuild.yaml`
**Registry:** `gcr.io/$PROJECT_ID/ranger-mcp-fixtures`

**Verification:** ✅ Complete

#### Cloud Run Deployment

**Deployment Command:**
```bash
gcloud run deploy ranger-mcp-fixtures \
  --source . \
  --dockerfile services/mcp-fixtures/Dockerfile \
  --project ranger-twin-dev \
  --region us-central1
```

**Environment Variables:**
- `MCP_FIXTURES_URL` - Server endpoint (defaults to `http://localhost:8080/sse`)

**Verification:** ✅ Complete

#### Requirements

**Location:** `services/mcp-fixtures/requirements.txt`

```txt
mcp>=1.25.0
starlette>=0.41.0
uvicorn>=0.30.0
sse-starlette>=1.6.0
httpx>=0.25.0
```

**Verification:** ✅ Complete

### 3.7 Data Source ✅

**Fixture Data Location:** `data/fixtures/cedar-creek/`

**Pre-loaded Files:**
- `incident-metadata.json` - Fire metadata and summary
- `burn-severity.json` - MTBS classification data
- `trail-damage.json` - Trail assessment data
- `timber-plots.json` - Timber cruise plots

**Loading:** Data pre-loaded at server startup for performance

**Verification:** ✅ Complete

### 3.8 Error Handling ✅

**Fire ID Normalization:**
```python
# Accepts variations
if fire_id in ["cedar-creek", "cedar-creek-2022", "cc-2022", "cedar_creek"]:
    fire_id = "cedar-creek"
```

**Error Response Format:**
```json
{
  "error": "Unknown fire: invalid-fire-id",
  "available_fires": ["cedar-creek"]
}
```

**Verification:** ✅ Complete
- Structured error objects (not 500 status codes)
- Helpful error messages with suggestions
- Lists available resources

---

## 4. NIFC Server (Placeholder) 📋

### 4.1 Implementation Status

**Location:** `/mcp/nifc/`
**Status:** 📋 Placeholder (Phase 0)
**Implementation Target:** Phase 4
**Files:** README.md only (specification)

### 4.2 Specification Summary

**Purpose:** Provide fire incident data, perimeters, and status updates from NIFC APIs

**Planned Tools:**
1. `get_active_fires` - List active fire incidents
2. `get_fire_perimeter` - Get GeoJSON perimeter for fire
3. `get_fire_details` - Get detailed incident information

**Related Specifications:**
- `docs/specs/MCP-IRWIN-SPEC.md` (v1.0) - IRWIN wrapper specification
  - Field mappings from IRWIN to RANGER Common Data Schema
  - 60-second polling frequency
  - TLS 1.3 required
  - PII filtering at MCP layer

**Reference Implementation:**
- Frontend service: `apps/command-console/src/services/nifcService.ts`

### 4.3 Gap Analysis

| Component | Status | Required Action |
|-----------|--------|-----------------|
| **Server Implementation** | ❌ Missing | Implement MCP server in Python |
| **Health Check** | ❌ Missing | Add `/health` endpoint |
| **Tool Schemas** | 📋 Specified | Convert to JSON Schema format |
| **IRWIN Integration** | ❌ Missing | Implement NIFC API client |
| **SSE Transport** | ❌ Missing | Configure SSE at `/sse` endpoint |
| **Dockerfile** | ❌ Missing | Create deployment configuration |
| **Agent Integration** | ❌ Missing | Add to MCP client factory |

### 4.4 Implementation Requirements

**To make NIFC server production-ready:**

1. **Create Server Implementation:**
   - File: `/services/mcp-nifc/server.py` (or `/mcp/nifc/server.py`)
   - Pattern: Follow `/services/mcp-fixtures/server.py` as template
   - Dependencies: mcp>=1.25.0, starlette, uvicorn, httpx (for NIFC API)

2. **Implement Health Check:**
   - Endpoint: `GET /health`
   - Check: NIFC API connectivity
   - Response: JSON with service status

3. **Define Tool Schemas:**
   - Convert planned tools to JSON Schema format
   - Follow Gemini API constraints (primitives only)
   - Add input validation

4. **NIFC API Integration:**
   - Endpoint: NIFC Open Data API
   - Authentication: API key (if required)
   - Rate limiting: Respect API limits
   - Error handling: Structured errors

5. **Configure SSE Transport:**
   - Endpoint: `/sse` (GET and POST)
   - Alternative: `/messages` (POST)

6. **Create Deployment Config:**
   - Dockerfile with health checks
   - Cloud Build configuration
   - Environment variables for API keys

7. **Add Agent Integration:**
   - Update `agents/shared/mcp_client.py`
   - Add toolset factory function
   - Update Coordinator to use NIFC tools

**Estimated Effort:** 2-3 days (following Fixtures server pattern)

---

## 5. Weather Server (Not Found) ❌

### 5.1 Current Status

**Location:** N/A (does not exist)
**Status:** ❌ Not Found
**Last Searched:** 2025-12-27

### 5.2 Search Results

- ❌ No directory found in `/mcp/` or `/services/`
- ❌ No README or specification found
- ❌ No references in agent code (`agents/` directory)
- ❌ No references in documentation (`docs/` directory)
- ❌ No environment variables configured
- ❌ No planned tools listed

### 5.3 Recommendations

**Before implementing Weather server, clarify requirements:**

1. **Use Case:** What weather data do agents need?
   - Historical weather for fire behavior analysis?
   - Forecast data for operational planning?
   - Climate data for long-term recovery?

2. **Data Source:** Which API/service?
   - NOAA Weather Service
   - Weather Underground
   - Custom weather station data
   - Satellite-based observations

3. **Agent Integration:** Which agents need weather data?
   - Burn Analyst (fire behavior modeling)?
   - Recovery Coordinator (planning timelines)?
   - NEPA Advisor (environmental analysis)?

4. **Priority:** Is this needed for Phase 4 or later?

**If needed, implementation would require:**
- Weather API integration
- MCP server following Fixtures server pattern
- Health check endpoint
- Tool schemas for weather queries
- Agent toolset factory
- Deployment configuration

**Estimated Effort:** 2-3 days (similar to NIFC server)

---

## 6. GIS Server (Not Found) ❌

### 6.1 Current Status

**Location:** N/A (does not exist)
**Status:** ❌ Not Found
**Last Searched:** 2025-12-27

### 6.2 Search Results

- ❌ No directory found in `/mcp/` or `/services/`
- ❌ No README or specification found
- ❌ No references in agent code (`agents/` directory)
- ❌ No references in documentation (`docs/` directory)
- ⚠️ Note: `docs/specs/MCP-REGISTRY-STANDARD.md` mentions "mcp-google-earth-engine" as example but not implemented

### 6.3 Recommendations

**Before implementing GIS server, clarify requirements:**

1. **Use Case:** What GIS capabilities do agents need?
   - Spatial analysis (buffers, intersections)?
   - Raster data access (satellite imagery, elevation)?
   - Vector data queries (roads, trails, boundaries)?
   - Geocoding/reverse geocoding?

2. **Data Source:** Which GIS service/platform?
   - Google Earth Engine
   - ArcGIS Online
   - USGS APIs
   - Custom GIS server (PostGIS, GeoServer)

3. **Agent Integration:** Which agents need GIS tools?
   - Burn Analyst (spatial burn severity analysis)?
   - Trail Assessor (proximity analysis)?
   - Recovery Coordinator (resource mapping)?

4. **Priority:** Is this needed for Phase 4 or later?

**If needed, implementation would require:**
- GIS API integration (Google Earth Engine, ArcGIS, etc.)
- MCP server following Fixtures server pattern
- Health check endpoint
- Tool schemas for spatial queries
- Agent toolset factory
- Deployment configuration
- Potentially heavy dependencies (geospatial libraries)

**Estimated Effort:** 3-5 days (more complex due to GIS libraries)

---

## 7. Verification Procedures

### 7.1 Health Check Verification

#### Local Development

**Test Fixtures Server:**
```bash
# Terminal 1: Start server
cd services/mcp-fixtures
uvicorn server:app --host 0.0.0.0 --port 8080

# Terminal 2: Test health check
curl http://localhost:8080/health

# Expected: {"status": "healthy", "service": "ranger-mcp-fixtures", ...}
```

**Test Root Endpoint:**
```bash
curl http://localhost:8080/

# Expected: Same as /health
```

#### Docker Container

**Build and Test:**
```bash
# Build image
docker build -f services/mcp-fixtures/Dockerfile -t ranger-mcp-fixtures .

# Run container
docker run -p 8080:8080 ranger-mcp-fixtures

# Test health check
curl http://localhost:8080/health

# Check Docker health status
docker ps  # Look for "healthy" status
```

#### Cloud Run Deployment

**Deploy and Test:**
```bash
# Deploy to Cloud Run
gcloud run deploy ranger-mcp-fixtures \
  --source . \
  --dockerfile services/mcp-fixtures/Dockerfile \
  --project ranger-twin-dev \
  --region us-central1

# Get service URL
SERVICE_URL=$(gcloud run services describe ranger-mcp-fixtures \
  --project ranger-twin-dev \
  --region us-central1 \
  --format='value(status.url)')

# Test health check
curl $SERVICE_URL/health
```

### 7.2 Tool Availability Verification

#### Via MCP Client

**Test Tool Discovery:**
```bash
cd agents

# Test coordinator toolset (all tools)
python -c "
from shared.mcp_client import get_coordinator_toolset
toolset = get_coordinator_toolset()
print('MCP Toolset:', toolset)
"
```

**Expected Output:**
```
MCP Toolset: <McpToolset with 4 tools>
```

#### Via Agent Integration

**Test Burn Analyst MCP Tools:**
```bash
cd agents/burn_analyst

# Start agent in CLI mode
adk run burn_analyst

# In CLI, test MCP tool call:
> "Get fire context for cedar-creek"

# Expected: Agent calls mcp_get_fire_context tool
```

### 7.3 Agent Connectivity Verification

**Test End-to-End Flow:**

1. **Start MCP Fixtures Server:**
   ```bash
   cd services/mcp-fixtures
   uvicorn server:app --host 0.0.0.0 --port 8080
   ```

2. **Start ADK Orchestrator:**
   ```bash
   cd ../..  # Back to project root
   python main.py
   ```

3. **Send Test Query:**
   ```bash
   curl -X POST http://localhost:8000/api/query \
     -H "Content-Type: application/json" \
     -d '{"query": "What is the burn severity for Cedar Creek?", "fire_id": "cedar-creek"}'
   ```

4. **Verify:**
   - Orchestrator receives query
   - Delegates to Burn Analyst
   - Burn Analyst calls `mcp_mtbs_classify` tool
   - MCP Fixtures Server returns data
   - Agent processes and responds

### 7.4 Docker Build Verification

**Build All Images:**
```bash
# Build Fixtures server
docker build -f services/mcp-fixtures/Dockerfile -t ranger-mcp-fixtures .

# Build Orchestrator
docker build -f Dockerfile -t ranger-coordinator .

# Verify images
docker images | grep ranger
```

**Expected Output:**
```
ranger-coordinator      latest    abc123...
ranger-mcp-fixtures     latest    def456...
```

### 7.5 Cloud Run Deployment Verification

**Deploy Both Services:**
```bash
# Deploy MCP Fixtures Server
gcloud run deploy ranger-mcp-fixtures \
  --source . \
  --dockerfile services/mcp-fixtures/Dockerfile \
  --project ranger-twin-dev \
  --region us-central1

# Deploy Orchestrator
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1 \
  --cpu 2 \
  --memory 4Gi \
  --set-env-vars MCP_FIXTURES_URL=<FIXTURES_SERVICE_URL>/sse

# Verify deployments
gcloud run services list --project ranger-twin-dev
```

**Expected Output:**
```
SERVICE                 REGION        URL                                          LAST DEPLOYED
ranger-coordinator      us-central1   https://ranger-coordinator-...run.app       2025-12-27
ranger-mcp-fixtures     us-central1   https://ranger-mcp-fixtures-...run.app      2025-12-27
```

---

## 8. Deployment Checklist

Use this checklist before deploying any MCP server to production:

### 8.1 Pre-Deployment Checklist

**Health Checks:**
- [ ] Server has `GET /health` endpoint
- [ ] Health check returns JSON with service status
- [ ] Health check validates data sources/dependencies
- [ ] Dockerfile has HEALTHCHECK directive (30s interval recommended)
- [ ] Health check tested locally
- [ ] Health check tested in Docker container

**Tool Interface:**
- [ ] All tools listed in `list_tools()` handler
- [ ] Tool schemas use JSON Schema format
- [ ] Tool parameters use primitives only (Gemini API constraint)
- [ ] No `list[dict]`, `dict`, or complex types in parameters
- [ ] Tool descriptions are clear and USFS-aligned
- [ ] Response format is `[TextContent(type="text", text=json.dumps(...))]`
- [ ] Tool tested via MCP client

**Transport Protocol:**
- [ ] SSE transport configured at `/sse` endpoint
- [ ] Both GET (connection) and POST (messages) handlers exist
- [ ] Alternative `/messages` POST endpoint available
- [ ] SSE read timeout configured (30s recommended)

**Error Handling:**
- [ ] Server returns structured error objects (not 500 status codes)
- [ ] Error objects include: error_code, suggestion, severity
- [ ] Unknown resource errors provide helpful suggestions
- [ ] Input validation implemented
- [ ] Fire ID normalization implemented (if applicable)

**Deployment Configuration:**
- [ ] Dockerfile exists with multi-stage build
- [ ] Base image specified (python:3.11-slim recommended)
- [ ] Dependencies in requirements.txt
- [ ] Port 8080 exposed
- [ ] Health check in Dockerfile
- [ ] Cloud Build configuration exists (cloudbuild.yaml)
- [ ] Environment variables documented
- [ ] Build command tested locally

**Agent Integration:**
- [ ] MCP client factory function exists in `agents/shared/mcp_client.py`
- [ ] Toolset filtering per agent role
- [ ] Graceful fallback if MCP unavailable
- [ ] Environment variable for server URL (`MCP_<NAME>_URL`)
- [ ] Integration tested with at least one agent

**Documentation:**
- [ ] README with server purpose and tools
- [ ] API documentation for each tool
- [ ] Environment variables documented
- [ ] Deployment commands documented
- [ ] Testing procedures documented

**Testing:**
- [ ] Unit tests for tool handlers
- [ ] Integration tests with MCP client
- [ ] Health check test
- [ ] Docker build test
- [ ] End-to-end test with agent
- [ ] All tests pass

### 8.2 Post-Deployment Verification

**Cloud Run:**
- [ ] Service deployed successfully
- [ ] Health check passing in Cloud Run console
- [ ] Service URL accessible
- [ ] Logs show no errors
- [ ] Metrics show healthy resource usage
- [ ] Environment variables set correctly

**Integration:**
- [ ] Agents can connect to deployed service
- [ ] Tools callable from agents
- [ ] Response times acceptable (<2s for typical queries)
- [ ] No timeout errors
- [ ] SSE connection stable

**Monitoring:**
- [ ] Cloud Run logs configured
- [ ] Error alerts configured
- [ ] Uptime monitoring enabled
- [ ] Performance metrics tracked

---

## 9. Recommendations

### 9.1 Immediate Actions

1. **✅ MCP Fixtures Server: Production Ready**
   - Server is fully functional and verified
   - No immediate action required
   - Consider adding monitoring and alerting

2. **📋 NIFC Server: Implementation Needed**
   - High priority if active fire data integration required
   - Follow Fixtures server pattern for implementation
   - Estimated effort: 2-3 days
   - References available: `docs/specs/MCP-IRWIN-SPEC.md`, frontend `nifcService.ts`

3. **❌ Weather Server: Clarify Requirements**
   - No specification or implementation exists
   - Action: Determine if weather data needed for Phase 4+
   - If needed: Define use cases, data sources, agent integration
   - Estimated effort: 2-3 days (if needed)

4. **❌ GIS Server: Clarify Requirements**
   - No specification or implementation exists
   - Action: Determine if GIS capabilities needed for Phase 4+
   - If needed: Define spatial analysis requirements, platform choice
   - Estimated effort: 3-5 days (if needed)

### 9.2 Standardization Opportunities

1. **MCP Server Template:**
   - Create template repository for new MCP servers
   - Include: boilerplate code, Dockerfile, tests, CI/CD
   - Reduces implementation time from 2-3 days to 1 day

2. **Health Check Format:**
   - Standardize health check response format across all servers
   - Include: service name, status, dependency checks, version

3. **Tool Schema Validation:**
   - Create schema validation utility to catch Gemini API constraint violations
   - Enforce primitives-only parameter types at development time

4. **Testing Framework:**
   - Create shared MCP server test harness
   - Include: health check tests, tool invocation tests, integration tests

5. **Documentation Template:**
   - Standardize MCP server README format
   - Include: purpose, tools, schemas, deployment, testing

### 9.3 Future Enhancements

1. **MCP Registry Implementation:**
   - Implement `mcp.json` manifest per `MCP-REGISTRY-STANDARD.md`
   - Enable discovery-at-runtime capability negotiation
   - Support multiple MCP servers dynamically

2. **Monitoring and Observability:**
   - Centralized logging for all MCP servers
   - Distributed tracing for tool calls
   - Performance metrics dashboard

3. **Security Enhancements:**
   - API key rotation for external services
   - Rate limiting per agent/tool
   - PII filtering at MCP layer (per IRWIN spec)
   - TLS 1.3 enforcement

4. **Performance Optimization:**
   - Caching layer for frequently requested data
   - Connection pooling for external APIs
   - Async tool execution where applicable

---

## 10. References

### Related Documentation

- **Architecture:**
  - `docs/adr/ADR-005-skills-first-architecture.md` - Skills-First Multi-Agent Architecture
  - `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` - Agent communication protocol
  - `docs/architecture/GCP-ARCHITECTURE.md` - Cloud architecture

- **Specifications:**
  - `docs/specs/MCP-REGISTRY-STANDARD.md` (v1.0) - Discovery-at-runtime protocol
  - `docs/specs/MCP-IRWIN-SPEC.md` (v1.0) - NIFC IRWIN wrapper specification
  - `docs/specs/skill-format.md` - Skill structure and metadata
  - `docs/specs/agent-interface.md` - Agent contracts and lifecycle

- **Operations:**
  - `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` - ADK patterns and anti-patterns
  - `docs/operations/DEPLOYMENT-READINESS-PLAN.md` - Deployment phases
  - `CLAUDE.md` - Project guidance (Phase 4: ADK Integration)

### Implementation References

- **Fixtures Server:**
  - Implementation: `services/mcp-fixtures/server.py`
  - Dockerfile: `services/mcp-fixtures/Dockerfile`
  - Cloud Build: `services/mcp-fixtures/cloudbuild.yaml`
  - Requirements: `services/mcp-fixtures/requirements.txt`

- **Agent Integration:**
  - MCP Client: `agents/shared/mcp_client.py`
  - Example Agent: `agents/burn_analyst/agent.py`
  - Tool Invocation: `docs/adr/ADR-007-tool-invocation-strategy.md`

- **Fixture Data:**
  - Location: `data/fixtures/cedar-creek/`
  - Files: `incident-metadata.json`, `burn-severity.json`, `trail-damage.json`, `timber-plots.json`

### External Resources

- **MCP Protocol:**
  - [Model Context Protocol](https://modelcontextprotocol.io/)
  - [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

- **NIFC Data:**
  - [NIFC Open Data](https://data-nifc.opendata.arcgis.com/)
  - [IRWIN API Documentation](https://www.firelab.org/project/irwin)

- **Google ADK:**
  - [Google ADK Documentation](https://ai.google.dev/adk)
  - [McpToolset Reference](https://ai.google.dev/adk/tools/mcp)

---

**Document Version:** 1.0
**Last Audit:** December 27, 2025
**Next Audit:** Before Phase 4 production deployment
