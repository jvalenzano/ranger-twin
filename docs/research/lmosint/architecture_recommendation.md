# LMOSINT Architecture Recommendation

> **Agent 5: Technical Feasibility & Architecture Analyst**
> **Date:** 2026-03-08
> **Status:** Research Deliverable
> **Grounded In:** RANGER codebase review (agents/, services/, infrastructure/terraform/, docs/adr/)

---

## Executive Summary

LMOSINT (Land Management Open Source Intelligence) can and should be built as an **extension of the existing RANGER platform**, not as a separate system. The RANGER codebase exhibits deliberate architectural separation between agents, skills, and data connectivity (MCP servers) that was designed for exactly this kind of domain expansion. The Skills-First architecture (ADR-005) explicitly anticipates multi-domain growth, and the AgentTool orchestration pattern supports adding new specialist agents without modifying the coordinator's core logic.

**Key findings:**

1. **Extension, not rebuild.** RANGER's architecture supports LMOSINT as 3 new agents + 1 new MCP server + 3 new skills. Zero changes to existing agents required.
2. **Signal Registry MCP server** is the critical new component -- a normalized, time-decaying signal store that wraps 7 Tier 1 data sources behind standard MCP tools.
3. **Build estimate:** 18-24 person-weeks for MVP (Signal Registry + 3 specialist skills + alerting layer + integration testing).
4. **GCP cost increment:** $180-420/month above current RANGER baseline ($2,160-5,040/year).
5. **FedRAMP impact:** Minimal. All Tier 1 sources are publicly classified. No PII ingestion. GCP FedRAMP High inheritance covers the compute layer.

---

## 1. Extension vs. Separate Platform

### Recommendation: Extend RANGER

After reviewing every agent definition, the MCP server implementation, the Terraform deployment model, and the ADR decisions, extending RANGER is the correct path. Here is the evidence:

### 1.1 ADK Agent Scaling Characteristics

The coordinator pattern in `/home/user/ranger-twin/agents/coordinator/agent.py` uses `AgentTool` wrappers to call specialists:

```python
burn_analyst_tool = AgentTool(agent=burn_analyst)
trail_assessor_tool = AgentTool(agent=trail_assessor)
# ... adding more is trivial:
weather_intel_tool = AgentTool(agent=weather_intel)
```

The coordinator's `tools=[]` list accepts arbitrary additions. The Gemini 2.0 Flash model handles tool routing via its instruction prompt, which already demonstrates the pattern of domain-based routing:

```
- **burn_analyst**: Call for burn severity, fire impact...
- **trail_assessor**: Call for trail damage, infrastructure impacts...
```

Adding three more routing rules (weather intelligence, hydrology risk, air quality) is a prompt extension, not an architecture change.

**Scaling concern:** Google ADK routes through a single Gemini call. With 8 specialists (4 existing + 3 new + coordinator), the tool description context grows but remains well within Gemini 2.0 Flash's 1M token window. Each `AgentTool` description is ~100-200 tokens. At 8 tools, that is 800-1,600 tokens of tool context -- negligible.

**Cold start concern:** All agents are bundled into the single `ranger-coordinator` Cloud Run service (ADR-005, "Hybrid approach"). Adding 3 agents adds ~50-100ms to import time. With Cloud Run min_instances=0, cold starts already take 3-5 seconds; this increment is immaterial.

### 1.2 Skills Portability Across Domains

The RANGER skills format is domain-agnostic by design. Every skill follows the same structure:

```
skill-name/
  skill.md          # Triggers, instructions, reasoning chain
  scripts/           # Python execute() function
  resources/         # Reference data, thresholds
  examples/          # Few-shot examples
```

The `assess_severity.py` script in `/home/user/ranger-twin/agents/burn_analyst/skills/soil-burn-severity/scripts/` demonstrates the pattern: a pure `execute(inputs: dict) -> dict` function that loads fixture data, applies domain logic, and returns structured output with `confidence`, `reasoning_chain`, and `data_sources` fields.

This pattern transfers directly to weather intelligence (apply fire weather thresholds), hydrology risk (apply debris flow probability models), and air quality monitoring (apply AQI breakpoints). The skill contract (inputs -> deterministic output with proof layer) is domain-independent.

### 1.3 MCP Server Architecture Extensibility

The existing MCP fixtures server (`/home/user/ranger-twin/services/mcp-fixtures/server.py`) demonstrates the pattern:

- `Server("ranger-fixtures")` with `@mcp_server.list_tools()` and `@mcp_server.call_tool()` decorators
- Tools return `list[TextContent]` with JSON-serialized data
- Health check via Starlette for Cloud Run deployment
- stdio transport for local development, HTTP for production

A Signal Registry MCP server follows the identical pattern. The MCP Python SDK (`from mcp.server import Server`) is already a dependency. The Terraform module for Cloud Run services (`/home/user/ranger-twin/infrastructure/terraform/modules/cloud-run-service`) is parameterized -- adding a new service requires one `module` block in `main.tf`.

### 1.4 Cloud Run Deployment Model

The Terraform at `/home/user/ranger-twin/infrastructure/terraform/main.tf` shows:
- IAM baseline module creates service accounts per service
- Each Cloud Run service is a parameterized module call
- Scale-to-zero (min_instances=0) for cost efficiency
- Environment variables for service discovery (e.g., `MCP_FIXTURES_URL`)

Adding `ranger-signal-registry` as a new Cloud Run service:
```hcl
module "cloud_run_signal_registry" {
  source           = "./modules/cloud-run-service"
  service_name     = "${local.service_prefix}-signal-registry"
  image            = "${module.artifact_registry.repository_url}/${local.service_prefix}-signal-registry:${var.image_tag}"
  # ... same pattern as mcp-fixtures
}
```

**Verdict: No architectural barriers to extension.** The RANGER codebase was designed for this.

---

## 2. Signal Registry MCP Server Design

### 2.1 Concept

The Signal Registry is the LMOSINT infrastructure layer. It normalizes heterogeneous data sources into a common signal model, stores them with temporal metadata, and applies confidence decay so that stale signals lose weight automatically. It is an MCP server, not an agent -- it provides data, not intelligence. The intelligence comes from the agents that query it.

### 2.2 MCP Tool Interface

```python
@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="poll_feeds",
            description="Poll one or more signal sources for new data. "
                        "Returns normalized signals with freshness metadata.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sources_json": {
                        "type": "string",
                        "description": "JSON array of source IDs to poll. "
                            "Valid: 'firms', 'nws_alerts', 'raws', 'usgs_water', "
                            "'airnow', 'purpleair', 'nifc'. "
                            "Example: '[\"firms\", \"nws_alerts\"]'"
                    },
                    "bbox": {
                        "type": "string",
                        "description": "Bounding box as 'west,south,east,north'. "
                            "Example: '-121.8,43.5,-121.0,44.2'"
                    },
                    "hours_back": {
                        "type": "integer",
                        "description": "How many hours of history to fetch (default: 24)"
                    }
                },
                "required": ["sources_json", "bbox"]
            }
        ),
        Tool(
            name="classify_signal",
            description="Classify a raw observation into a normalized LMOSINT signal "
                        "with domain, severity, confidence, and decay parameters.",
            inputSchema={
                "type": "object",
                "properties": {
                    "observation_json": {
                        "type": "string",
                        "description": "JSON object with raw observation data"
                    },
                    "source_id": {
                        "type": "string",
                        "description": "Source identifier (e.g., 'firms', 'raws')"
                    }
                },
                "required": ["observation_json", "source_id"]
            }
        ),
        Tool(
            name="get_active_signals",
            description="Retrieve active (non-expired) signals for a geographic area, "
                        "with confidence values adjusted for temporal decay.",
            inputSchema={
                "type": "object",
                "properties": {
                    "bbox": {
                        "type": "string",
                        "description": "Bounding box as 'west,south,east,north'"
                    },
                    "domains_json": {
                        "type": "string",
                        "description": "JSON array of signal domains to filter. "
                            "Valid: 'fire', 'weather', 'hydrology', 'air_quality', "
                            "'debris_flow'. Default: all domains. "
                            "Example: '[\"fire\", \"weather\"]'"
                    },
                    "min_confidence": {
                        "type": "number",
                        "description": "Minimum confidence threshold after decay (0-1, default: 0.1)"
                    }
                },
                "required": ["bbox"]
            }
        ),
        Tool(
            name="get_signal_history",
            description="Retrieve historical signal timeline for a location, "
                        "including expired signals. Used for trend analysis.",
            inputSchema={
                "type": "object",
                "properties": {
                    "bbox": {
                        "type": "string",
                        "description": "Bounding box as 'west,south,east,north'"
                    },
                    "domain": {
                        "type": "string",
                        "description": "Signal domain filter"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "ISO 8601 start time (default: 7 days ago)"
                    },
                    "end_time": {
                        "type": "string",
                        "description": "ISO 8601 end time (default: now)"
                    }
                },
                "required": ["bbox"]
            }
        ),
    ]
```

**Critical design note:** All parameters use primitive types (strings, numbers, booleans) per the ADK constraint documented in CLAUDE.md. Complex structures are passed as JSON strings. This is a hard constraint from Gemini's tool calling -- violating it causes 400 errors.

### 2.3 Normalized Signal Data Model

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class SignalDomain(str, Enum):
    FIRE = "fire"
    WEATHER = "weather"
    HYDROLOGY = "hydrology"
    AIR_QUALITY = "air_quality"
    DEBRIS_FLOW = "debris_flow"
    VEGETATION = "vegetation"


class SignalSeverity(str, Enum):
    INFO = "info"           # Informational, no action needed
    WATCH = "watch"         # Elevated conditions, monitor
    WARNING = "warning"     # Conditions warrant preparation
    CRITICAL = "critical"   # Immediate action required


@dataclass
class Signal:
    """Normalized LMOSINT signal -- the atomic unit of intelligence."""

    # Identity
    signal_id: str                          # UUID
    source_id: str                          # e.g., "firms", "raws", "nws_alerts"
    domain: SignalDomain

    # Content
    title: str                              # Human-readable summary
    description: str                        # Detail text
    severity: SignalSeverity
    raw_value: float                        # Source-native measurement
    raw_unit: str                           # Unit of raw_value (e.g., "FRP_MW", "mph", "ug/m3")

    # Geospatial
    latitude: float
    longitude: float
    bbox: Optional[tuple[float, float, float, float]] = None  # For polygon signals

    # Temporal
    observed_at: datetime                   # When the source observed this
    ingested_at: datetime = field(          # When Signal Registry received it
        default_factory=lambda: datetime.now()
    )
    expires_at: Optional[datetime] = None   # Hard expiration (source-specific)

    # Confidence & Decay
    initial_confidence: float = 1.0         # Confidence at observation time (0-1)
    decay_rate_hours: float = 6.0           # Half-life in hours (domain-specific)

    # Provenance
    source_url: Optional[str] = None        # Direct link to source data
    retrieval_method: str = "api_poll"       # "api_poll", "push_webhook", "manual"

    def current_confidence(self, at_time: Optional[datetime] = None) -> float:
        """
        Calculate confidence at a given time using exponential decay.

        confidence(t) = initial_confidence * 0.5^(hours_elapsed / decay_rate_hours)

        This means:
        - FIRMS signal (decay_rate=6h): at T+6h -> 50%, T+12h -> 25%, T+24h -> 6.25%
        - RAWS signal (decay_rate=1h): at T+1h -> 50%, T+2h -> 25%, T+6h -> 1.6%
        - NWS Alert (decay_rate=24h): at T+24h -> 50%, T+48h -> 25%
        - USGS Water (decay_rate=2h): at T+2h -> 50%, T+6h -> 12.5%
        """
        import math
        now = at_time or datetime.utcnow()
        hours_elapsed = (now - self.observed_at).total_seconds() / 3600.0
        if hours_elapsed < 0:
            return self.initial_confidence
        return self.initial_confidence * math.pow(0.5, hours_elapsed / self.decay_rate_hours)

    def is_active(self, at_time: Optional[datetime] = None, min_confidence: float = 0.05) -> bool:
        """Signal is active if above minimum confidence and not hard-expired."""
        now = at_time or datetime.utcnow()
        if self.expires_at and now > self.expires_at:
            return False
        return self.current_confidence(now) >= min_confidence
```

### 2.4 Confidence Decay Model

The decay model uses exponential half-life because different signal types become stale at fundamentally different rates:

| Source | Domain | Decay Half-Life | Rationale |
|--------|--------|-----------------|-----------|
| NASA FIRMS | fire | 6 hours | Satellite overpass every ~6h; thermal detections age quickly |
| Synoptic/RAWS | weather | 1 hour | Weather conditions change rapidly, especially during fire events |
| NWS Red Flag Warnings | weather | 24 hours | Alerts have explicit expiration, decay slowly before |
| HRRR Model | weather | 3 hours | Hourly model runs; forecast skill degrades with time |
| USGS Water Services | hydrology | 2 hours | 15-minute reporting, but stream conditions shift slowly |
| USGS Debris Flow | debris_flow | 168 hours (7 days) | Assessment-based, changes only with new precipitation events |
| AirNow | air_quality | 2 hours | Hourly AQI readings, moderate variability |
| PurpleAir | air_quality | 0.5 hours | 2-minute updates, hyper-local and volatile |
| NIFC Perimeters | fire | 12 hours | Updated 1-2x daily during active incidents |

**Why exponential decay (not linear)?** A 6-hour-old FIRMS detection is not "half wrong" -- it is increasingly uncertain whether conditions still match. Exponential decay models this uncertainty curve naturally. A signal at T+0 is 100% confident; at one half-life it is 50%; at two half-lives it is 25%. This maps well to operational reality: a Red Flag Warning from 12 hours ago is still quite relevant (71%), but a RAWS reading from 6 hours ago in rapidly changing fire weather is much less so (1.6%).

### 2.5 Storage Architecture

For MVP, use **Cloud Firestore** (already enabled in Terraform: `"firestore.googleapis.com"` is in the required APIs list):

```
Collection: signals/
  Document: {signal_id}
    Fields: all Signal dataclass fields
    Indexes:
      - domain + observed_at (descending) -- for domain-filtered queries
      - geo_hash + observed_at (descending) -- for spatial queries
      - source_id + observed_at (descending) -- for per-source queries

Collection: poll_state/
  Document: {source_id}
    Fields:
      - last_poll_time: datetime
      - last_poll_status: "success" | "error"
      - records_ingested: int
      - error_message: Optional[str]
```

**Why Firestore over Cloud SQL?** Firestore is already enabled in the project, scales to zero reads/writes, and the signal query pattern (geospatial bbox + time range + domain filter) maps well to compound indexes. Cloud SQL would add a $7-30/month always-on instance cost.

**Spatial indexing:** Use geohash encoding (6 characters = ~1.2km precision) for efficient bbox queries within Firestore. The `geohash` Python library is lightweight and well-proven.

### 2.6 Deployment Target

The Signal Registry deploys as a new Cloud Run service: `ranger-signal-registry`.

```
Cloud Run service: ranger-signal-registry
  Image: ranger-signal-registry:latest
  Transport: HTTP (Starlette) + MCP stdio (local dev)
  Min instances: 0 (scale to zero)
  Max instances: 10
  CPU: 1 vCPU
  Memory: 512 MiB
  Timeout: 300s
  Env vars:
    - FIRMS_API_KEY (Secret Manager)
    - SYNOPTIC_API_TOKEN (Secret Manager)
    - FIRESTORE_PROJECT (env var)
```

**Polling schedule:** Cloud Scheduler triggers poll_feeds every 15 minutes for Tier 1 sources. This costs $0.10/month for 3 jobs (96 invocations/day each).

---

## 3. New Specialist Skills

### 3.1 Weather Intelligence Skill

**Agent integration point:** New `weather_intel` agent, registered as `AgentTool` in coordinator.

**Directory structure:**
```
agents/weather_intel/
  agent.py
  skills/
    fire-weather-assessment/
      skill.md
      scripts/
        assess_fire_weather.py      # Core assessment logic
        correlate_raws_hrrr.py      # RAWS + HRRR fusion
      resources/
        fire_weather_thresholds.json  # Red Flag criteria by geographic zone
        beaufort_scale.json
      examples/
        red-flag-assessment.json
    red-flag-correlation/
      skill.md
      scripts/
        correlate_alerts.py
      resources/
        nws_zone_mapping.json
```

**Data sources:**
- Synoptic Data / MesoWest (RAWS stations) -- wind speed, RH, temperature, fuel moisture
- NOAA HRRR -- 3km gridded wind, temperature, humidity forecasts
- NWS Alerts API -- Red Flag Warnings, Fire Weather Watches

**Core logic in `assess_fire_weather.py`:**
```python
def execute(inputs: dict) -> dict:
    """
    Assess fire weather conditions for a geographic area.

    Fuses RAWS observations with HRRR forecasts to produce:
    - Current fire weather conditions (temperature, RH, wind, fuel moisture)
    - Red Flag Warning correlation (are warnings active? do observations support them?)
    - 24-hour forecast trajectory (improving, stable, or deteriorating)
    - Haines Index approximation (atmospheric stability + moisture)

    Returns standard RANGER skill output with confidence, reasoning_chain,
    data_sources, and recommendations.
    """
```

**Key fusion insight:** RAWS stations report actuals; HRRR provides forecasts. The skill compares them: if RAWS shows RH=12% and HRRR forecast was RH=18%, conditions are worse than predicted -- this is a high-value intelligence signal that no single source provides.

**Build effort:** 4-5 person-weeks
- Week 1: Synoptic/RAWS API client, data normalization, fixtures
- Week 2: HRRR data extraction (subset by bbox from S3/GCS Zarr), Haines Index calc
- Week 3: NWS Alerts API client, Red Flag Warning correlation logic
- Week 4: Fusion logic (RAWS vs HRRR divergence detection), agent.py + coordinator registration
- Week 5: Testing, edge cases, skill.md documentation, few-shot examples

### 3.2 Hydrology Risk Skill

**Agent integration point:** New `hydrology_analyst` agent, registered as `AgentTool` in coordinator.

**Directory structure:**
```
agents/hydrology_analyst/
  agent.py
  skills/
    post-fire-debris-flow/
      skill.md
      scripts/
        assess_debris_flow_risk.py    # USGS debris flow probability model
        correlate_streamflow.py       # USGS Water Services stream gauge analysis
      resources/
        debris_flow_probability_model.json  # Staley et al. (2017) parameters
        watershed_huc12_lookup.json
      examples/
        cedar-creek-debris-flow.json
    watershed-impact/
      skill.md
      scripts/
        assess_watershed.py
      resources/
        water_quality_thresholds.json
```

**Data sources:**
- USGS Post-Fire Debris Flow Assessments -- ArcGIS REST, public
- USGS Water Services (NWIS) -- Real-time streamflow, 15-minute intervals, no auth
- StreamStats (USGS) -- Watershed delineation and flow statistics

**Core logic in `assess_debris_flow_risk.py`:**
```python
def execute(inputs: dict) -> dict:
    """
    Assess post-fire debris flow risk for burned area watersheds.

    Combines:
    - Burn severity (from burn_analyst via signal registry or direct call)
    - USGS debris flow probability estimates (Staley et al. 2017)
    - Current streamflow conditions (USGS NWIS gauges)
    - Precipitation forecast (from weather_intel or signal registry)

    Key output: probability of debris flow given 15-min rainfall intensity
    P(DF) = f(burn_severity, slope, soil_KF, rainfall_intensity)

    Returns prioritized list of at-risk drainages with probability estimates,
    downstream values at risk, and recommended monitoring stations.
    """
```

**Cross-domain fusion:** This skill demonstrates LMOSINT's core value proposition. It takes burn severity data (from the existing Burn Analyst), combines it with USGS hydrological data and precipitation forecasts (from Weather Intel), and produces a risk assessment that no single agency system provides.

**Build effort:** 4-5 person-weeks
- Week 1: USGS Water Services API client (NWIS), streamflow data normalization
- Week 2: USGS Debris Flow Assessment integration (ArcGIS REST), probability model implementation
- Week 3: StreamStats API integration for watershed delineation
- Week 4: Cross-domain fusion (burn severity + precipitation forecast + slope -> debris flow probability)
- Week 5: Testing, fixtures, agent.py, coordinator registration, documentation

### 3.3 Air Quality Monitor Skill

**Agent integration point:** New `air_quality_monitor` agent, registered as `AgentTool` in coordinator.

**Directory structure:**
```
agents/air_quality_monitor/
  agent.py
  skills/
    smoke-impact-assessment/
      skill.md
      scripts/
        assess_smoke_impact.py        # AirNow + PurpleAir fusion
        estimate_plume_trajectory.py  # HRRR wind + FIRMS hotspot vector
      resources/
        aqi_breakpoints.json          # EPA AQI calculation tables
        health_advisory_thresholds.json
      examples/
        cedar-creek-smoke.json
```

**Data sources:**
- AirNow (EPA) -- Official AQI monitoring, hourly, simple REST
- PurpleAir -- Low-cost sensor network, 2-minute updates, JSON API
- NASA FIRMS -- Active fire locations for plume source identification
- HRRR -- Wind direction/speed for plume trajectory estimation

**Core logic in `assess_smoke_impact.py`:**
```python
def execute(inputs: dict) -> dict:
    """
    Assess smoke impact on communities and operations from active fires.

    Fuses:
    - AirNow regulatory-grade AQI readings (official, hourly)
    - PurpleAir sensor network (unofficial, granular, 2-min)
    - FIRMS hotspot locations (plume source identification)
    - HRRR wind vectors (plume trajectory estimation)

    Key insight: PurpleAir sensors are biased high but provide spatial density
    that AirNow lacks. Apply EPA correction factor (Barkjohn et al. 2021):
    AQI_corrected = 0.524 * PM2.5_raw - 0.0862 * RH + 5.75

    Returns: AQI contour map, affected populations, operational advisories,
    trajectory forecast, health advisory recommendations.
    """
```

**Build effort:** 3-4 person-weeks
- Week 1: AirNow API client, AQI breakpoint calculation, data normalization
- Week 2: PurpleAir API client, EPA correction factor, sensor fusion logic
- Week 3: FIRMS + HRRR integration for plume trajectory estimation
- Week 4: Agent.py, coordinator registration, testing, documentation

---

## 4. Build Effort Estimation

### 4.1 Detailed Breakdown

| Component | Effort (person-weeks) | Dependencies | Risk |
|-----------|----------------------|--------------|------|
| **Signal Registry MCP Server** | | | |
| -- Data model + Firestore schema | 1 | None | Low |
| -- Source adapters (7 Tier 1 sources) | 3 | API keys | Medium |
| -- Confidence decay engine | 0.5 | None | Low |
| -- MCP tool interface | 1 | MCP SDK | Low |
| -- Cloud Scheduler polling | 0.5 | GCP access | Low |
| -- Cloud Run deployment + Terraform | 1 | Terraform | Low |
| **Subtotal Signal Registry** | **7** | | |
| | | | |
| **Weather Intelligence Skill** | | | |
| -- Synoptic/RAWS client + fixtures | 1.5 | API token | Low |
| -- HRRR data extraction | 1 | S3/GCS access | Medium |
| -- NWS Alerts integration | 0.5 | None (no auth) | Low |
| -- Fusion logic + agent.py | 1 | Signal Registry | Low |
| -- Testing + documentation | 1 | None | Low |
| **Subtotal Weather Intel** | **5** | | |
| | | | |
| **Hydrology Risk Skill** | | | |
| -- USGS NWIS client | 1 | None (no auth) | Low |
| -- Debris Flow model implementation | 1.5 | Domain expertise | Medium |
| -- StreamStats integration | 1 | None | Medium |
| -- Cross-domain fusion | 1 | Burn Analyst, Weather Intel | Medium |
| -- Testing + documentation | 0.5 | None | Low |
| **Subtotal Hydrology** | **5** | | |
| | | | |
| **Air Quality Monitor Skill** | | | |
| -- AirNow + PurpleAir clients | 1 | API keys | Low |
| -- EPA correction factor | 0.5 | None | Low |
| -- Plume trajectory estimation | 1 | FIRMS, HRRR | Medium |
| -- Agent.py + testing | 1 | None | Low |
| **Subtotal Air Quality** | **3.5** | | |
| | | | |
| **Real-Time Alerting Layer** | | | |
| -- Alert rule engine (threshold-based) | 1 | Signal Registry | Low |
| -- Pub/Sub topic + Cloud Functions | 1 | GCP access | Low |
| -- UI notification integration | 1 | Command Console | Medium |
| **Subtotal Alerting** | **3** | | |
| | | | |
| **Integration Testing** | | | |
| -- End-to-end agent cascade tests | 1 | All components | Medium |
| -- Signal fusion scenario tests | 1 | Signal Registry | Low |
| -- Performance/load testing | 0.5 | GCP access | Low |
| -- Coordinator routing validation | 0.5 | All agents | Low |
| **Subtotal Integration Testing** | **3** | | |

### 4.2 Total MVP Effort

| Category | Person-Weeks |
|----------|-------------|
| Signal Registry MCP Server | 7 |
| Weather Intelligence Skill | 5 |
| Hydrology Risk Skill | 5 |
| Air Quality Monitor Skill | 3.5 |
| Real-Time Alerting Layer | 3 |
| Integration Testing | 3 |
| **Total** | **26.5** |
| **With 15% contingency** | **~30** |

**Calendar time (2 engineers):** 15-16 weeks (approximately 4 months).
**Calendar time (3 engineers):** 10-12 weeks (approximately 3 months).

### 4.3 Phased Delivery Recommendation

**Phase A (weeks 1-6): Signal Foundation**
- Signal Registry MCP server with 3 sources (FIRMS, NWS Alerts, RAWS)
- Weather Intelligence skill (first consumer of Signal Registry)
- Demonstrates end-to-end: source -> signal -> agent -> intelligence

**Phase B (weeks 7-12): Domain Expansion**
- Remaining 4 Signal Registry sources (USGS Water, Debris Flow, AirNow, PurpleAir)
- Hydrology Risk skill
- Air Quality Monitor skill

**Phase C (weeks 13-16): Integration & Hardening**
- Real-time alerting layer
- Full integration testing
- Coordinator prompt expansion for 7-agent routing
- Performance validation

---

## 5. GCP Cost Estimation

### 5.1 Monthly Cost for LMOSINT MVP

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| **Signal Registry Cloud Run** | $15-40 | Scale-to-zero; polling every 15 min = ~2,880 invocations/month |
| **Cloud Scheduler** | $0.30 | 3 scheduled jobs at $0.10/job/month |
| **Firestore** | $5-25 | Estimated 50K writes/day (signals), 200K reads/day (queries) |
| **Cloud Functions (alerting)** | $1-5 | Triggered by Pub/Sub, ~1K invocations/day |
| **Pub/Sub** | $1-3 | ~100K messages/month for alert distribution |
| **Secret Manager** | $0.50 | 3-4 API key secrets, ~10K access operations/month |
| **Gemini API (3 new agents)** | $50-150 | ~5K queries/month per agent at ~$0.01/query |
| **Cloud Logging (incremental)** | $5-10 | Additional agent/signal logs |
| **GCS (HRRR cache)** | $5-15 | Subset caching for HRRR GRIB2 files |
| **Coordinator Cloud Run (incremental)** | $10-30 | Increased memory/CPU for 7 agents vs 4 |
| **Network egress (API calls)** | $2-5 | Outbound to FIRMS, RAWS, NWS, USGS, AirNow |
| | | |
| **Total LMOSINT increment** | **$95-283** | |
| **With 50% buffer** | **$143-425** | |

### 5.2 Combined RANGER + LMOSINT Annual Cost

| Tier | Annual Cost | Description |
|------|-------------|-------------|
| Current RANGER (Phase 1) | $3,330-7,350 | Per existing estimate in CLAUDE.md |
| LMOSINT MVP increment | $1,716-5,100 | Signal Registry + 3 agents + alerting |
| **Combined total** | **$5,046-12,450** | |

**For comparison:** An Esri-based alternative would cost $100K+/year (per ADR-013). The combined RANGER+LMOSINT platform at $5K-12K/year is 10-20x cheaper.

### 5.3 Cost Optimization Levers

1. **Signal polling frequency.** Polling every 15 minutes vs every 5 minutes is a 3x cost reduction on Cloud Run invocations and Firestore writes. Start at 15 minutes; reduce if user feedback demands it.
2. **HRRR data subsetting.** Do not download full HRRR GRIB2 files (2.5 GB each). Use byte-range requests to extract only the variables needed (wind, temperature, RH) for the bbox of interest. This reduces GCS cache storage from ~60 GB/month to ~2 GB/month.
3. **Firestore TTL.** Set document TTL on signals collection to 30 days. Signals older than 30 days are auto-deleted, preventing unbounded storage growth.
4. **PurpleAir rate limiting.** PurpleAir has 10,000 points/request. Use geographic clustering to minimize API calls. Cache 10-minute snapshots in Firestore rather than polling per query.

---

## 6. FedRAMP Considerations

### 6.1 Data Classification

All Tier 1 LMOSINT data sources are **publicly classified**:

| Source | Classification | Auth Type | Data Sensitivity |
|--------|---------------|-----------|-----------------|
| NASA FIRMS | Public | Free API key | Public satellite imagery |
| NIFC Open Data | Public | None | Public incident data |
| NWS Alerts | Public | None | Public weather alerts |
| Synoptic/RAWS | Public | Free API token | Public weather observations |
| USGS Water Services | Public | None | Public streamflow data |
| USGS Debris Flow | Public | None | Public hazard assessments |
| AirNow | Public | Free API key | Public air quality data |
| PurpleAir | Public | Free API key | Public sensor readings |

**No PII is ingested.** Signal Registry stores environmental observations, not user data.

### 6.2 FedRAMP Boundary Analysis

The LMOSINT extension operates within the existing GCP FedRAMP High boundary:

- **Compute:** Cloud Run (FedRAMP High via GCP)
- **Storage:** Firestore (FedRAMP High via GCP)
- **Messaging:** Pub/Sub (FedRAMP High via GCP)
- **Scheduling:** Cloud Scheduler (FedRAMP High via GCP)
- **AI:** Vertex AI / Gemini (FedRAMP High via GCP)

**External API calls** (FIRMS, NWS, USGS, etc.) are **outbound only** -- the system calls them, they do not call back. This is a standard pattern in FedRAMP architectures and does not extend the authorization boundary.

### 6.3 Specific Compliance Requirements for Real-Time Public Data Ingestion

1. **Data provenance logging.** Every signal must record its source URL, retrieval timestamp, and source version/API version. The Signal data model includes these fields (`source_url`, `ingested_at`, `retrieval_method`). This satisfies NIST 800-53 AU-3 (Content of Audit Records).

2. **Data integrity validation.** Signals from each source should be validated against expected schemas before storage. Malformed responses from external APIs must be logged and rejected, not silently ingested. This satisfies NIST 800-53 SI-10 (Information Input Validation).

3. **API key management.** FIRMS, Synoptic, and PurpleAir API keys must be stored in Secret Manager (already used for GOOGLE_API_KEY and MAPTILER_API_KEY in the current Terraform). This satisfies NIST 800-53 IA-5 (Authenticator Management).

4. **Rate limiting and circuit breaking.** Outbound API calls must implement retry with exponential backoff and circuit breaker patterns. A failed external API must not cascade into system failures. This satisfies NIST 800-53 SC-5 (Denial of Service Protection) for the application layer.

5. **No CUI/FOUO data.** As long as LMOSINT only ingests publicly classified data, no additional NIST 800-171 controls are required. If future phases integrate WFDSS internal data or IRWIN full API (connected-system access), that would require re-evaluation of the authorization boundary.

6. **Phase alignment.** Per ADR-014, LMOSINT MVP operates under the same phase model:
   - **Phase 1 (Demo):** Signal Registry uses embedded fixtures for demonstration
   - **Phase 2 (Pilot):** Live API polling under Research Agreement
   - **Phase 3 (Production):** Full FedRAMP ATO required

---

## 7. Google Earth Engine Access

### 7.1 GEE API Patterns for Raster Signal Ingestion

Google Earth Engine provides programmatic access to petabytes of satellite imagery and geospatial datasets. Within GCP, GEE access follows these patterns:

**Authentication:** GEE uses Application Default Credentials (ADC) when running on GCP infrastructure, consistent with the RAG authentication pattern established in ADR-011. No separate API key needed.

```python
import ee

# On Cloud Run (ADC automatically available via service account)
ee.Initialize(project='ranger-twin-dev')

# For local development
ee.Authenticate()
ee.Initialize(project='ranger-twin-dev')
```

**Relevant GEE datasets for LMOSINT:**

| Dataset | GEE ID | Update Frequency | LMOSINT Use |
|---------|--------|-------------------|-------------|
| MODIS NDVI | `MODIS/006/MOD13Q1` | 16-day | Vegetation recovery tracking |
| Landsat 8/9 | `LANDSAT/LC08/C02/T1_L2` | 16-day | Post-fire change detection |
| Sentinel-2 | `COPERNICUS/S2_SR_HARMONIZED` | 5-day | High-res vegetation monitoring |
| SRTM Elevation | `USGS/SRTMGL1_003` | Static | Slope calculation for debris flow |
| NLCD | `USGS/NLCD_RELEASES/2021_REL/NLCD` | Annual | Land cover classification |
| GRIDMET | `IDAHO_EPSCOR/GRIDMET` | Daily | Historical fire weather |

**Integration pattern for Cloud Run:**

```python
def get_ndvi_time_series(bbox: str, start_date: str, end_date: str) -> dict:
    """
    Extract NDVI time series from MODIS for a bounding box.

    Uses GEE server-side computation -- no large raster downloads.
    """
    import ee
    ee.Initialize(project='ranger-twin-dev')

    geometry = ee.Geometry.Rectangle(json.loads(bbox))

    collection = (ee.ImageCollection('MODIS/006/MOD13Q1')
        .filterBounds(geometry)
        .filterDate(start_date, end_date)
        .select('NDVI'))

    # Compute mean NDVI per image (server-side, returns small JSON)
    def compute_mean(image):
        mean = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geometry,
            scale=250
        )
        return image.set('mean_ndvi', mean.get('NDVI'))

    results = collection.map(compute_mean).aggregate_array('mean_ndvi').getInfo()
    dates = collection.aggregate_array('system:time_start').getInfo()

    return {
        "ndvi_series": [{"date": d, "ndvi": v} for d, v in zip(dates, results)],
        "bbox": bbox,
        "source": "GEE/MODIS/MOD13Q1",
        "confidence": 0.95
    }
```

**Critical constraint:** GEE performs computation server-side. The Cloud Run service sends a computation request to GEE servers and receives small JSON results -- it does not download raw raster data. This keeps Cloud Run memory and CPU usage minimal.

### 7.2 GEE Cost Model

GEE is free for research and non-commercial use. For commercial use on GCP:
- Earth Engine API is available through Vertex AI at no additional charge when running on GCP
- Compute costs are absorbed by GEE infrastructure (not billed to the GCP project)
- Only standard GCP egress charges apply for result data (negligible for JSON statistics)

### 7.3 GEE Integration Recommendation

**Do not include GEE in MVP.** GEE integration adds value for vegetation recovery monitoring (Recovery Vegetation Monitoring signal fusion opportunity from Agent 2), but this is a Phase 2 capability. The MVP should focus on real-time operational signals (fire weather, debris flow risk, air quality) that serve the "8-minute reality" use case identified by Agent 3.

**GEE pivot trigger:** When a pilot user asks "How is vegetation recovering in the Cedar Creek burn area?" and the system cannot answer, add GEE NDVI time series as a skill in the existing Burn Analyst agent.

---

## 8. Architecture Diagram: LMOSINT Extension

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RANGER + LMOSINT ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────┐              │
│  │              Recovery Coordinator (Root Agent)                 │              │
│  │  AgentTool wrappers for all specialists                       │              │
│  └──┬──────┬──────┬──────┬──────┬──────┬──────┬─────────────────┘              │
│     │      │      │      │      │      │      │                                 │
│     ▼      ▼      ▼      ▼      ▼      ▼      ▼                                │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐                     │
│  │Burn  ││Trail ││Cruis.││NEPA  ││Weath.││Hydro.││Air   │                     │
│  │Analy.││Asses.││Asst. ││Advis.││Intel ││Risk  ││Qual. │                     │
│  └──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘                     │
│     │       │       │       │       │       │       │                            │
│  [existing skills]  [existing skills]  [new skills -- same format]              │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           MCP CONNECTIVITY LAYER                                │
│                                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────────┐            │
│  │  MCP Fixtures     │  │  Signal Registry MCP Server [NEW]       │            │
│  │  (Cedar Creek)    │  │                                          │            │
│  │  4 tools          │  │  Tools: poll_feeds, classify_signal,     │            │
│  └──────────────────┘  │         get_active_signals,               │            │
│                         │         get_signal_history                │            │
│                         │                                          │            │
│                         │  Adapters:                                │            │
│                         │    FIRMS | RAWS | NWS | USGS | AirNow   │            │
│                         │    PurpleAir | NIFC                      │            │
│                         │                                          │            │
│                         │  Storage: Firestore (signals collection)  │            │
│                         │  Decay: Exponential half-life per source  │            │
│                         └──────────────────────────────────────────┘            │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         ALERTING LAYER [NEW]                                    │
│                                                                                 │
│  Cloud Scheduler ──► Signal Registry poll ──► Pub/Sub ──► Cloud Function       │
│                                                              │                  │
│                                                              ▼                  │
│                                                     Threshold Evaluation        │
│                                                     (Red Flag + AQI > 150      │
│                                                      + Streamflow anomaly)     │
│                                                              │                  │
│                                                              ▼                  │
│                                                     Command Console             │
│                                                     (push notification)         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                    EXTERNAL DATA SOURCES (all public, outbound-only)            │
│                                                                                 │
│  NASA FIRMS ─────── Synoptic/RAWS ─────── NWS Alerts ─────── USGS Water       │
│  NIFC Open Data ─── AirNow ──────── PurpleAir ─────── USGS Debris Flow        │
│                                                                                 │
│  [Phase 2: Google Earth Engine ─── Landsat ─── Sentinel-2 ─── MODIS NDVI]     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| External API reliability (FIRMS, RAWS down) | Medium | Medium | Circuit breaker pattern; Firestore cache provides last-known-good signals; graceful degradation in agent responses |
| HRRR data volume overwhelms Cloud Run memory | Medium | High | Byte-range subsetting; do NOT download full GRIB2 files; use Zarr format where available; set Cloud Run memory to 1 GiB for weather intel agent |
| Gemini routing degrades with 7+ tools | Low | High | Monitor tool routing accuracy; if <90%, split coordinator into domain sub-coordinators (fire ops coordinator, environmental coordinator) |
| PurpleAir API access terms change | Medium | Low | AirNow provides baseline AQI; PurpleAir is optional enhancement |
| Firestore costs exceed estimate | Low | Medium | Implement TTL; monitor daily; alert at $20/month |
| Confidence decay parameters wrong | High | Medium | Tunable per source; start with literature-based defaults; adjust based on operator feedback during pilot |
| Integration complexity delays delivery | Medium | Medium | Phased delivery (A/B/C) allows value delivery at each checkpoint; Phase A alone is viable for demo |

---

## 10. Conclusion: Build Recommendation

**Build LMOSINT as a RANGER extension.** The architecture supports it, the cost is marginal, and the competitive position (no incumbent offers AI-driven post-fire intelligence synthesis) justifies the investment.

**Key numbers:**
- **Build:** 26.5 person-weeks (30 with contingency), 3-4 months with 2-3 engineers
- **Run:** $95-425/month incremental GCP cost
- **Zero FedRAMP boundary changes** for public data ingestion
- **Zero changes to existing RANGER agents** -- purely additive

**The Signal Registry is the platform play.** The 3 specialist skills deliver immediate user value, but the Signal Registry creates a reusable data normalization layer that future skills and agents can consume without building new API integrations. This is the "factory" pattern that USDA's GenAI strategy calls for.

**Start with Phase A.** Signal Registry + Weather Intelligence skill demonstrates end-to-end LMOSINT capability in 6 weeks. If that works, Phases B and C follow naturally. If it does not, you have learned why for $15K in labor and $500 in GCP costs -- a low-risk bet.

---

## Appendix A: Coordinator Prompt Extension

The following instruction block would be added to the coordinator's `instruction` string to route to new LMOSINT agents:

```
- **weather_intel**: Call for fire weather conditions, RAWS observations, Red Flag Warnings,
  wind/humidity forecasts, Haines Index, fire weather correlation
  - Examples: "What's the fire weather forecast?", "Are there Red Flag Warnings?",
    "Current conditions at RAWS stations near Cedar Creek"

- **hydrology_analyst**: Call for post-fire debris flow risk, streamflow conditions,
  watershed impacts, flood potential, stream gauge readings
  - Examples: "What's the debris flow risk?", "Are streams showing elevated flow?",
    "Watershed impact assessment for Cedar Creek"

- **air_quality_monitor**: Call for smoke impact, AQI readings, plume trajectory,
  health advisories, PurpleAir sensor data
  - Examples: "What's the air quality near the fire?", "Where is the smoke headed?",
    "AQI advisory for nearby communities"
```

## Appendix B: Signal Registry Source Adapter Template

Each source adapter follows this interface:

```python
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

class SourceAdapter(ABC):
    """Base class for Signal Registry source adapters."""

    @property
    @abstractmethod
    def source_id(self) -> str:
        """Unique identifier for this source (e.g., 'firms', 'raws')."""
        ...

    @property
    @abstractmethod
    def default_decay_rate_hours(self) -> float:
        """Default confidence decay half-life in hours."""
        ...

    @abstractmethod
    async def poll(
        self,
        bbox: tuple[float, float, float, float],
        since: datetime,
    ) -> List[Signal]:
        """
        Poll source for new observations within bbox since given time.

        Returns list of normalized Signal objects.
        Must handle:
        - Network errors (retry with backoff, return empty on failure)
        - Rate limiting (respect source-specific limits)
        - Schema validation (reject malformed responses)
        """
        ...

    @abstractmethod
    def health_check(self) -> dict:
        """
        Check source availability.

        Returns dict with:
        - status: "healthy" | "degraded" | "unavailable"
        - last_successful_poll: datetime
        - error_message: Optional[str]
        """
        ...
```

Example implementation for FIRMS:

```python
class FIRMSAdapter(SourceAdapter):
    source_id = "firms"
    default_decay_rate_hours = 6.0

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    async def poll(self, bbox, since) -> List[Signal]:
        west, south, east, north = bbox
        days = max(1, int((datetime.utcnow() - since).total_seconds() / 86400) + 1)
        url = f"{self.base_url}/{self.api_key}/VIIRS_SNPP/{west},{south},{east},{north}/{days}"

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return []
                text = await resp.text()

        signals = []
        for row in csv.DictReader(text.strip().split('\n')):
            signals.append(Signal(
                signal_id=str(uuid4()),
                source_id="firms",
                domain=SignalDomain.FIRE,
                title=f"VIIRS thermal detection (FRP: {row['frp']} MW)",
                description=f"Confidence: {row['confidence']}%, "
                            f"Bright_ti4: {row['bright_ti4']}K",
                severity=self._classify_frp(float(row['frp'])),
                raw_value=float(row['frp']),
                raw_unit="FRP_MW",
                latitude=float(row['latitude']),
                longitude=float(row['longitude']),
                observed_at=datetime.strptime(
                    f"{row['acq_date']} {row['acq_time']}",
                    "%Y-%m-%d %H%M"
                ),
                initial_confidence=float(row['confidence']) / 100.0,
                decay_rate_hours=6.0,
                source_url=f"https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;l:fires_viirs_snpp;@{row['longitude']},{row['latitude']},12z",
            ))
        return signals

    def _classify_frp(self, frp: float) -> SignalSeverity:
        if frp > 100:
            return SignalSeverity.CRITICAL
        elif frp > 50:
            return SignalSeverity.WARNING
        elif frp > 10:
            return SignalSeverity.WATCH
        return SignalSeverity.INFO
```
