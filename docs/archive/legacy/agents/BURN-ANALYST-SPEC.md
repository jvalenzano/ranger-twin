# Burn Analyst - Agent Specification

> *Formerly "FireSight Lite" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** Phase 1 (Simulation)
**Port:** 8001
**Priority:** P1 (Sub-agent)
**Developer:** TBD
**Architecture:** [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md)

---

## The "Wow" Pitch

> Within 48 hours of a wildfire being contained, the Burn Analyst analyzes satellite imagery to map burn severity across the entire fire perimeter. A BAER team that used to spend two weeks on aerial surveys and ground-truthing gets a draft severity map on day one—complete with suggested treatment priorities and a pre-populated BAER report template.

---

## Phase 1 Scope

**The Burn Analyst is a synthesis and reasoning engine, not a data acquisition pipeline.**

For Phase 1, this agent receives **simulated burn severity data** derived from real MTBS (Monitoring Trends in Burn Severity) analysis for the Cedar Creek Fire. The focus is on demonstrating:

- **Cross-agent orchestration**: Triggering downstream agents (Trail Assessor, Cruising Assistant) based on burn severity patterns
- **Reasoning transparency**: Showing how burn severity data combines with terrain analysis to generate treatment priorities
- **AgentBriefingEvent mastery**: Emitting well-structured events with confidence scores, citations, and suggested actions
- **BAER workflow integration**: Generating draft report sections and prioritized action lists

### What the Agent Receives (Simulated)

Static GeoJSON files containing:
- Fire perimeter geometry
- Burn severity classifications (unburned/low/moderate/high) per sector
- Acreage totals per severity class
- Slope and terrain metadata
- Timestamp metadata (derived from real MTBS data)

**Example Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "sectors": [
    {"id": "NW-4", "severity": "HIGH", "acres": 18340, "slope_avg": 38},
    {"id": "NE-2", "severity": "MODERATE", "acres": 12500, "slope_avg": 22}
  ],
  "imagery_date": "2022-09-15",
  "source": "MTBS"
}
```

### What the Agent Produces (Real)

- **AgentBriefingEvents** with confidence scoring, citations, and reasoning chains
- **Treatment priority rankings** using Gemini to synthesize severity + terrain + risk factors
- **Cross-agent trigger recommendations** (e.g., "High-severity zone intersects Waldo Lake Trail → request Trail Assessor verification")
- **Draft BAER report sections** with AI-generated narrative
- **GeoJSON severity maps** with standard BAER symbology

### What Is NOT in Phase 1

- ❌ Live Sentinel-2 or Landsat imagery acquisition
- ❌ dNBR (differenced Normalized Burn Ratio) calculation
- ❌ Google Earth Engine integration
- ❌ Computer vision model training or inference
- ❌ Cloud cover detection or image quality assessment
- ❌ Change detection across multiple time periods

**The value proposition is agent orchestration and reasoning transparency, not satellite image processing.**

---

## Core Purpose

The Burn Analyst is a **post-fire damage assessment accelerator** that uses satellite imagery analysis and generative AI to streamline Burned Area Emergency Response (BAER) team workflows. It transforms satellite data into actionable severity maps and draft reports, compressing weeks of assessment into days.

**Problem Solved:** After major wildfires, BAER teams have 7 days to complete initial assessments that inform emergency stabilization treatments. Current workflows rely on helicopter surveys, manual GIS analysis, and extensive ground-truthing. Teams are overwhelmed, especially during active fire seasons when multiple fires compete for limited BAER resources.

**Value Proposition:** Give every BAER team a "first draft" assessment within 48 hours of containment, letting specialists focus on validation and treatment planning instead of data compilation.

---


## Key Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Burn Severity Classification** | Analyze satellite imagery to classify unburned/low/moderate/high severity | P0 (Core) |
| 2 | **Perimeter Mapping** | Automatically delineate fire perimeter from imagery | P0 (Core) |
| 3 | **Severity Map Generation** | Create GIS-ready severity maps with standard symbology | P0 (Core) |
| 4 | **Treatment Priority Suggestions** | AI-generated recommendations based on severity + terrain | P1 (Important) |
| 5 | **BAER Report Draft** | Pre-populated report template with findings | P1 (Important) |
| 6 | **Change Detection** | Compare pre/post-fire imagery to quantify damage | P2 (Nice-to-Have) |

---

## Target Users

| Persona | Role | Pain Point | How Burn Analyst Helps |
|---------|------|------------|---------------------|
| **BAER Team Lead** | Coordinates assessment | 7-day deadline pressure | Draft assessment on day 1 |
| **GIS Specialist** | Creates severity maps | Manual classification is tedious | Automated first-pass classification |
| **Soil Scientist** | Assesses erosion risk | Limited time for ground-truthing | Prioritized areas for field visits |
| **Hydrologist** | Evaluates watershed impacts | Needs severity data for models | Faster data availability |

---

## Technical Architecture (Phase 1)

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Static    │────▶│  Fixture    │────▶│   Gemini    │────▶│ AgentBriefing│
│  GeoJSON    │     │   Tools     │     │  Synthesis  │     │   Events    │
│  Fixtures   │     │  (ADK)      │     │  + Routing  │     │ + Outputs   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ MTBS-derived       │ ToolResult         │ Real reasoning     │ Events, Maps
     │ burn severity      │ with confidence    │ chains             │ Reports
```

### Core Components (Phase 1)

| Component | Technology | Notes |
|-----------|------------|-------|
| **Data Source** | Static GeoJSON fixtures | MTBS data for Cedar Creek |
| **Fixture Tools** | ADK ToolCallingAgent | Returns fixture data via standard ToolResult |
| **AI Analysis** | Gemini 2.0 Flash | Real synthesis and reasoning |
| **Terrain Data** | Pre-computed slope metadata | Included in GeoJSON fixtures |
| **GIS Output** | GeoJSON | Standard BAER format |
| **Report Generation** | Gemini + Document templates | BAER report sections |
| **Event Output** | AgentBriefingEvent JSON | Cross-agent triggers |

### Production System Mapping

| Fixture Data | Production Systems (Phase 2) |
|--------------|------------------------------|
| `burn-severity.json` | MTBS, RAVG, Sentinel-2, Landsat |

### Burn Severity Classification

| Class | MTBS Criteria | Visual Indicators | Treatment Priority |
|-------|---------------|-------------------|-------------------|
| **Unburned** | Minimal impact | Green vegetation | None |
| **Low** | Light surface burn | Scorched understory, green canopy | Low |
| **Moderate** | Partial canopy loss | Mixed mortality, partial canopy loss | Medium |
| **High** | Complete mortality | Complete canopy loss, white ash | High |

*MTBS = Monitoring Trends in Burn Severity (USGS program)*

### API Endpoints (Phase 1)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/agents/burn-analyst/query` | POST | Agent query interface (unified pattern) |
| `/api/v1/agents/burn-analyst/severity-map` | GET | Retrieve severity map (GeoJSON) |
| `/api/v1/agents/burn-analyst/briefing` | GET | Generate BAER briefing sections |

---

## Tools (ADK ToolCallingAgent)

All tools follow the standard interface pattern from [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md).

### query_burn_severity

Query burn severity data for a fire perimeter.

```python
from typing import TypedDict
from packages.twin_core.models import ToolResult

class BurnSeverityParams(TypedDict):
    fire_id: str
    bbox: tuple[float, float, float, float]  # (min_lng, min_lat, max_lng, max_lat)
    source: str  # "mtbs" | "dnbr" | "ndvi"

def query_burn_severity(params: BurnSeverityParams) -> ToolResult:
    """
    Phase 1: Returns fixture data from data/fixtures/
    Phase 2: Calls real MTBS/RAVG APIs (same interface)
    """
    return ToolResult(
        data=geojson_feature_collection,
        confidence=0.85,
        source="MTBS (simulated)",
        reasoning="Burn severity derived from dNBR classification"
    )
```

### calculate_severity_stats

Compute area statistics by severity class for a polygon.

```python
class SeverityStatsParams(TypedDict):
    polygon: dict  # GeoJSON Polygon
    fire_id: str

def calculate_severity_stats(params: SeverityStatsParams) -> ToolResult:
    """Calculate acreage by severity class (unburned/low/moderate/high)."""
```

### identify_hot_spots

Find high-severity clusters that exceed a threshold.

```python
class HotSpotParams(TypedDict):
    fire_id: str
    threshold: float  # Minimum cluster size in acres

def identify_hot_spots(params: HotSpotParams) -> ToolResult:
    """Identify contiguous high-severity zones for priority treatment."""
```

---

## Scope Constraints (Phase 1)

### In Scope
- ✅ Cedar Creek Fire as reference case
- ✅ Static GeoJSON burn severity fixtures
- ✅ 4-class burn severity classification (unburned/low/moderate/high)
- ✅ Gemini-powered synthesis and reasoning
- ✅ AgentBriefingEvent generation with confidence scoring
- ✅ Cross-agent trigger recommendations
- ✅ BAER report section drafting
- ✅ Treatment priority ranking based on severity + terrain

### Out of Scope (Phase 1)
- ❌ Live satellite imagery acquisition
- ❌ dNBR calculation or image processing
- ❌ Google Earth Engine integration
- ❌ Multi-temporal change detection
- ❌ Real-time fire monitoring

---

## AgentBriefingEvent Strategy

The Burn Analyst is the **trigger initiator** for most recovery workflows. As the first agent to process satellite imagery, it emits events that cascade through the agent hierarchy and drive downstream actions.

### Event Trigger Conditions

| Condition | Event Type | Severity | UI Target |
|-----------|------------|----------|-----------|
| High-severity burn > 10,000 acres detected | `alert` | `critical` | `modal_interrupt` |
| Sector severity classification complete | `insight` | `info` | `panel_inject` |
| High-severity burn intersects trail/road network | `action_required` | `warning` | `rail_pulse` |
| High-severity burn in salvageable timber stand | `action_required` | `info` | `rail_pulse` |
| Erosion risk Tier-1 (slope >30% + high burn) | `alert` | `warning` | `map_highlight` |
| dNBR processing batch complete | `status_update` | `info` | `panel_inject` |
| Imagery acquisition failed or cloudy | `alert` | `warning` | `panel_inject` |

### Cross-Agent Handoff Patterns

The Burn Analyst **requests** handoffs via the Recovery Coordinator (never routes directly):

| Trigger Condition | Target Agent | Handoff Description |
|-------------------|--------------|---------------------|
| High-severity intersects trail corridor | Trail Assessor | Field verification of trail condition |
| High-severity in merchantable timber | Cruising Assistant | Salvage inventory prioritization |
| Erosion risk Tier-1 in watershed | NEPA Advisor | BAER documentation requirements |
| Watershed boundary burn detected | Recovery Coordinator | Multi-agent watershed assessment |

### Confidence Scoring Formula

```
confidence = (image_quality * 0.35) + (dNBR_validity * 0.30) +
             (ground_truth * 0.20) + (algorithm * 0.15)
```

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Image quality | 35% | Cloud cover <10% = 1.0, <20% = 0.8, >20% = 0.5 |
| dNBR calculation validity | 30% | Pre/post image temporal proximity (<30 days = 1.0) |
| Ground truth validation | 20% | BAER field data available: validated = 1.0, not validated = 0.7 |
| Algorithm version | 15% | Using USGS standard thresholds = 1.0 |

### JSON Example: Critical Erosion Risk Alert

```json
{
  "schema_version": "1.0.0",
  "event_id": "burn-evt-001",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T10:15:00Z",
  "type": "alert",
  "source_agent": "burn_analyst",
  "severity": "critical",
  "ui_binding": {
    "target": "modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-122.15, 43.70], [-122.10, 43.70], [-122.10, 43.75], [-122.15, 43.75], [-122.15, 43.70]]]
      },
      "properties": { "label": "Sector NW-4 - HIGH SEVERITY" }
    }
  },
  "content": {
    "summary": "CRITICAL: 18,340 acres of high-severity burn detected in Sector NW-4 with extreme erosion risk.",
    "detail": "Sentinel-2 imagery analysis (2022-09-15) indicates 42% high-severity burn classification in the northwest quadrant. Combined with 3DEP slope analysis (average 38%), this sector meets BAER Tier-1 erosion risk criteria. Debris flow probability: 78% given 10-year precipitation event.",
    "suggested_actions": [
      {
        "action_id": "burn-act-001",
        "label": "Initiate BAER Assessment",
        "target_agent": "recovery_coordinator",
        "description": "Trigger BAER team mobilization for Sector NW-4",
        "rationale": "BAER 7-day assessment window begins upon notification"
      },
      {
        "action_id": "burn-act-002",
        "label": "Generate BAER Map Package",
        "target_agent": "burn_analyst",
        "description": "Export GeoTIFF and GeoJSON for field teams",
        "rationale": "Standard BAER deliverable format for helicopter surveys"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.94,
    "citations": [
      {
        "source_type": "Sentinel-2",
        "id": "S2A_MSIL2A_20220915T185921_N0400_R099_T10TFQ",
        "uri": "gs://gcp-public-data-sentinel-2/tiles/10/T/FQ/S2A_MSIL2A_20220915T185921.SAFE",
        "excerpt": "Post-fire imagery, 10m resolution, <5% cloud cover"
      },
      {
        "source_type": "USGS-3DEP",
        "id": "USGS_3DEP_10m_n44w123",
        "uri": "https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/n44w123/",
        "excerpt": "10m DEM showing slope gradient 35-42% across burn area"
      },
      {
        "source_type": "MTBS",
        "id": "MTBS_OR_2022_CedarCreek",
        "uri": "https://mtbs.gov/direct-download/cedar-creek-2022",
        "excerpt": "Official fire perimeter, 127,000 acres, containment 2022-10-15"
      }
    ],
    "reasoning_chain": [
      "1. Acquired Sentinel-2 post-fire imagery (2022-09-15)",
      "2. Calculated dNBR using pre-fire baseline (2022-07-01)",
      "3. Applied USGS burn severity thresholds: dNBR >0.66 = High Severity",
      "4. Classified 18,340 acres (42% of NW quadrant) as high-severity",
      "5. Overlaid 3DEP slope analysis: average 38% gradient",
      "6. Applied BAER erosion probability model (Cannon et al. 2010)",
      "7. Calculated 78% debris flow probability at 10-year precipitation",
      "8. Concluded: BAER Tier-1 classification, immediate assessment required"
    ]
  }
}
```

### JSON Example: Trail Intersection Alert

```json
{
  "schema_version": "1.0.0",
  "event_id": "burn-evt-003",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T12:00:00Z",
  "type": "action_required",
  "source_agent": "burn_analyst",
  "severity": "warning",
  "ui_binding": {
    "target": "rail_pulse",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[-122.08, 43.72], [-122.10, 43.75]]
      },
      "properties": { "label": "High-Burn/Trail Intersection - Waldo Lake" }
    }
  },
  "content": {
    "summary": "High-severity burn zone intersects Waldo Lake Trail (3.2 miles). Trail Assessor verification recommended.",
    "detail": "Spatial analysis shows the Waldo Lake Trail (miles 4.2-7.4) passes through a high-severity burn zone. Ground conditions likely include heavy ash deposition, potential blowdown, and erosion features.",
    "suggested_actions": [
      {
        "action_id": "burn-act-003",
        "label": "Request Trail Assessment",
        "target_agent": "recovery_coordinator",
        "description": "Notify Recovery Coordinator to dispatch Trail Assessor",
        "rationale": "Cross-agent handoff required for field verification"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.89,
    "citations": [
      {
        "source_type": "Sentinel-2",
        "id": "S2A_MSIL2A_20220915T185921",
        "uri": "gs://ranger-imagery/cedar-creek/post-fire/nw-quadrant.tif",
        "excerpt": "High-severity classification for intersection zone"
      },
      {
        "source_type": "USFS-Trails",
        "id": "trail-3536-waldo",
        "uri": "https://data.fs.usda.gov/geodata/trails/willamette/waldo-lake.geojson",
        "excerpt": "Waldo Lake Trail geometry for spatial intersection"
      }
    ],
    "reasoning_chain": [
      "1. Detected high-severity burn in Sector NW-4",
      "2. Performed spatial intersection with trail network",
      "3. Identified 3.2-mile overlap with Waldo Lake Trail",
      "4. Determined field verification required before trail status decision",
      "5. Routing to Recovery Coordinator for Trail Assessor dispatch"
    ]
  }
}
```

---

## Future Vision: Full Satellite Integration

The capabilities described below represent the **long-term vision** for the Burn Analyst when integrated with live satellite imagery pipelines. These are **not part of Phase 1**.

### Live Imagery Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sentinel-2 │────▶│  Google     │────▶│   dNBR      │────▶│  Gemini     │
│  Landsat    │     │  Earth      │     │ Calculation │     │  Analysis   │
│  NAIP       │     │  Engine     │     │  + Class.   │     │ + Synthesis │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Advanced Capabilities

| Feature | Description | Complexity | Timeframe |
|---------|-------------|------------|-----------|
| **Live Sentinel-2 Acquisition** | Pull imagery via GEE API for any fire perimeter | High | Phase 2+ |
| **dNBR Calculation** | Compute differenced Normalized Burn Ratio from pre/post imagery | Medium | Phase 2+ |
| **Cloud Cover Filtering** | Automatically select best imagery based on cloud percentage | Medium | Phase 2+ |
| **Multi-Temporal Analysis** | Track fire progression across multiple time periods | High | Phase 3+ |
| **High-Resolution Imagery** | Integrate commercial imagery (Planet, Maxar) for critical areas | Medium | Partnership-dependent |
| **Change Detection** | Compare vegetation indices over time to quantify damage | High | Phase 3+ |

### Satellite Imagery Sources (Future)

| Source | Resolution | Revisit | Cost | Use Case |
|--------|------------|---------|------|----------|
| **Sentinel-2** | 10-20m | 5 days | Free | Primary assessment layer |
| **Landsat 8/9** | 30m | 16 days | Free | Historical baseline, validation |
| **NAIP** | 1m | ~3 years | Free | Pre-fire conditions (when available) |
| **Planet** | 3m | Daily | $$$ | High-priority areas, validation |
| **Maxar** | 0.5m | On-demand | $$$$ | Critical infrastructure assessment |

### dNBR Classification Thresholds

| Class | dNBR Range | Calculation | Interpretation |
|-------|------------|-------------|----------------|
| **Unburned** | <0.1 | Minimal NBR change | No fire impact |
| **Low** | 0.1-0.27 | (NBR_pre - NBR_post) | Surface burn, canopy intact |
| **Moderate** | 0.27-0.66 | via Landsat bands 4,7 | Partial canopy mortality |
| **High** | >0.66 | or Sentinel-2 bands 8,12 | Complete mortality |

*NBR = Normalized Burn Ratio = (NIR - SWIR) / (NIR + SWIR)*

### Competitive Positioning (Future)

When competing with satellite imagery platforms:

| Competitor | Their Strength | Our Differentiation |
|------------|----------------|---------------------|
| **Pano AI** | Real-time detection via cameras | Post-fire assessment + BAER integration |
| **Descartes Labs** | Massive imagery archive, ML platform | Federal workflow integration, lower cost |
| **USFS RAVG** | Official, trusted, standardized | Faster turnaround, AI narrative generation |
| **Technosylva** | Fire behavior modeling | Damage assessment + cross-domain orchestration |

### References

- [USFS BAER Program](https://www.fs.usda.gov/managing-land/fire/baer)
- [MTBS - Monitoring Trends in Burn Severity](https://www.mtbs.gov/)
- [Sentinel-2 on Google Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2)
- [dNBR Calculation Guide](https://www.usgs.gov/landsat-missions/landsat-normalized-burn-ratio)
- [RAVG - Rapid Assessment of Vegetation Condition](https://fsapps.nwcg.gov/ravg/)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 13, 2025 | Claude | Initial version |
| 1.1 | Dec 20, 2025 | Claude | Added AgentBriefingEvent Strategy section |
| 2.0 | Dec 20, 2025 | Claude | Reframed for Phase 1 simulation scope, moved imagery pipeline to Future Vision |
