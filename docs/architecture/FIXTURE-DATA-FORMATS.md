# RANGER: Fixture Data Formats

**Status:** Authoritative Reference
**Phase:** 1 (Simulation)
**Purpose:** Comprehensive documentation of all fixture data schemas used in RANGER Phase 1

---

## Overview

This document catalogs the complete set of fixture data formats used in the RANGER system during Phase 1. These fixtures simulate the outputs of upstream data systems (satellite imagery processing, field capture apps, etc.) to enable development and demonstration of the core orchestration capabilities.

**Key Principle:** While the *input data is simulated*, the *agent reasoning and export formats are production-ready*.

For the authoritative scope document defining what is simulated vs. real, see [`DATA-SIMULATION-STRATEGY.md`](../DATA-SIMULATION-STRATEGY.md).

---

## Fixture Inventory

All fixture files are located in two primary locations:

### Backend Fixtures (`/data/fixtures/cedar-creek/`)

| File | Format | Size | Used By | Purpose |
|------|--------|------|---------|---------|
| `burn-severity.json` | JSON | 5.9 KB | Burn Analyst | MTBS-style burn severity polygons with 8 sectors |
| `trail-damage.json` | JSON | 9.1 KB | Trail Assessor | Simulated damage inventory for 5 trails, 16 damage points |
| `timber-plots.json` | JSON | 11 KB | Cruising Assistant | FSVeg-compatible cruise data for 6 plots |
| `briefing-events.json` | JSON | 18 KB | All agents | Pre-composed AgentBriefingEvent payloads for demo cascade |

### Frontend Fixtures (`/apps/command-console/public/fixtures/`)

| File | Format | Size | Used By | Purpose |
|------|--------|------|---------|---------|
| `cedar-creek-geojson.json` | GeoJSON | 13 KB | Map components | Combined GeoJSON with fire perimeter, burn severity, trail damage, and timber plots |
| `briefing-events.json` | JSON | 18 KB | Demo tour | Same as backend version, loaded for cascade demos |

---

## 1. Burn Severity Data

### File: `burn-severity.json`

**Purpose:** Simulates output from MTBS (Monitoring Trends in Burn Severity) satellite imagery processing.

**Real-world equivalent:** MTBS GeoJSON exports with dNBR classifications

**Agent consumer:** Burn Analyst

### Schema Structure

```json
{
  "fire_id": "string",
  "fire_name": "string",
  "discovery_date": "ISO-8601 date",
  "containment_date": "ISO-8601 date",
  "total_acres": "number",
  "forest": "string",
  "state": "string",
  "imagery_date": "ISO-8601 date",
  "source": "string (MTBS|SIMULATION)",
  "sectors": [
    {
      "id": "string (sector identifier)",
      "name": "string (human-readable name)",
      "severity": "HIGH | MODERATE | LOW",
      "severity_class": "number (1-4, MTBS standard)",
      "acres": "number",
      "hectares": "number",
      "slope_avg": "number (degrees)",
      "slope_max": "number (degrees)",
      "aspect_dominant": "string (N|NE|E|SE|S|SW|W|NW)",
      "elevation_min": "number (feet)",
      "elevation_max": "number (feet)",
      "dnbr_mean": "number (0-1, dNBR index)",
      "geometry": {
        "type": "Polygon",
        "coordinates": "GeoJSON coordinate array"
      },
      "priority_notes": "string (narrative context)"
    }
  ],
  "summary": {
    "high_severity_acres": "number",
    "moderate_severity_acres": "number",
    "low_severity_acres": "number",
    "high_severity_pct": "number",
    "moderate_severity_pct": "number",
    "low_severity_pct": "number"
  }
}
```

### Sample Data Excerpt

```json
{
  "fire_id": "cedar-creek-2022",
  "fire_name": "Cedar Creek Fire",
  "total_acres": 127341,
  "sectors": [
    {
      "id": "SW-1",
      "name": "Hills Creek Drainage",
      "severity": "HIGH",
      "severity_class": 4,
      "acres": 21500,
      "slope_avg": 45,
      "dnbr_mean": 0.76,
      "priority_notes": "Highest priority salvage. Commercial timber value."
    }
  ],
  "summary": {
    "high_severity_acres": 81041,
    "high_severity_pct": 63.6
  }
}
```

### Key Fields

- **dnbr_mean**: Differenced Normalized Burn Ratio (0-1 scale, higher = more severe)
- **severity_class**: MTBS standard (1=Unburned, 2=Low, 3=Moderate, 4=High)
- **slope_avg/slope_max**: Critical for erosion risk assessment
- **aspect_dominant**: Influences regeneration potential and fire behavior

### Alignment with USFS Standards

- Schema mirrors MTBS GeoJSON export structure
- Severity classes follow USFS/USGS MTBS methodology
- dNBR thresholds align with Region 6 standards:
  - HIGH: dNBR > 0.66
  - MODERATE: dNBR 0.44 - 0.66
  - LOW: dNBR 0.1 - 0.44

---

## 2. Trail Damage Inventory

### File: `trail-damage.json`

**Purpose:** Simulates output from field damage assessment (as if processed from video/photos by CV system).

**Real-world equivalent:** TRACS (Trail Assessment and Condition Surveys) field data

**Agent consumer:** Trail Assessor

### Schema Structure

```json
{
  "fire_id": "string",
  "assessment_date": "ISO-8601 date",
  "assessor": "string",
  "source": "string",
  "trails": [
    {
      "trail_id": "string (USFS trail ID)",
      "trail_name": "string",
      "trail_class": "string (1-5, difficulty rating)",
      "total_miles": "number",
      "jurisdiction": "string",
      "current_status": "OPEN | CLOSED | RESTRICTED",
      "damage_points": [
        {
          "damage_id": "string (unique ID)",
          "milepost": "number",
          "type": "BRIDGE_FAILURE | DEBRIS_FLOW | HAZARD_TREES | TREAD_EROSION | SIGNAGE",
          "severity": "number (1-5)",
          "description": "string",
          "coords": "[lon, lat]",
          "photo_ref": "string (filename or URL)",
          "estimated_cost": "number (USD)",
          "work_type": "REPLACEMENT | REROUTE | CLEARING | REPAIR",
          "crew_days": "number"
        }
      ],
      "total_estimated_cost": "number (USD)",
      "priority_rank": "number (1=highest)",
      "priority_rationale": "string"
    }
  ],
  "summary": {
    "total_trails_assessed": "number",
    "total_damage_points": "number",
    "total_estimated_cost": "number",
    "total_crew_days": "number",
    "bridges_destroyed": "number",
    "trails_requiring_reroute": "number",
    "severity_breakdown": {
      "critical": "number",
      "major": "number",
      "moderate": "number",
      "minor": "number"
    }
  }
}
```

### Sample Data Excerpt

```json
{
  "trails": [
    {
      "trail_id": "waldo-lake-3536",
      "trail_name": "Waldo Lake Trail #3536",
      "trail_class": "3",
      "total_miles": 21.8,
      "current_status": "CLOSED",
      "damage_points": [
        {
          "damage_id": "WL-001",
          "milepost": 2.3,
          "type": "BRIDGE_FAILURE",
          "severity": 5,
          "description": "Complete loss of 40ft timber bridge crossing North Fork.",
          "coords": [-122.0412, 43.7234],
          "estimated_cost": 85000,
          "work_type": "REPLACEMENT",
          "crew_days": 21
        }
      ],
      "total_estimated_cost": 133500,
      "priority_rank": 1
    }
  ]
}
```

### Key Fields

- **damage_id**: Unique identifier for damage point (e.g., "WL-001", "HC-002")
- **type**: Standardized damage categories matching TRACS methodology
- **severity**: 1-5 scale (5 = critical/impassable)
- **work_type**: Maps to TRACS work categories for budget allocation
- **crew_days**: Labor estimate for district planning

### Alignment with USFS Standards

- Follows TRACS damage classification system (FSH 2309.18)
- Cost estimates based on Region 6 maintenance cost standards
- Trail class ratings follow USFS Trail Fundamentals (1-5 scale)
- Work types align with TRACS work order categories

### Export Format

Trail Assessor generates **TRACS CSV** from this data:

| Column | Description |
|--------|-------------|
| TRAIL_ID | National Trail ID |
| MILEPOST | Distance from trailhead |
| DAMAGE_CAT | Damage category code |
| SEVERITY | 1-5 scale |
| EST_LABOR | Crew-days |
| EST_MATERIAL | Material cost (USD) |
| PHOTO_ID | Reference to photo in system |

---

## 3. Timber Cruise Data

### File: `timber-plots.json`

**Purpose:** Simulates output from field timber cruising (as if transcribed/structured from narrated plot data).

**Real-world equivalent:** FSVeg Common Stand Exam field data

**Agent consumer:** Cruising Assistant

### Schema Structure

```json
{
  "fire_id": "string",
  "cruise_id": "string",
  "cruise_date": "ISO-8601 date",
  "cruiser": "string",
  "source": "string",
  "methodology": "string (e.g., 'Variable Radius Plot - BAF 20')",
  "plots": [
    {
      "plot_id": "string",
      "sector": "string (corresponds to burn severity sector)",
      "coords": "[lon, lat]",
      "elevation": "number (feet)",
      "slope_pct": "number",
      "aspect": "string",
      "stand_type": "string (species composition)",
      "pre_fire_density": "Dense | Moderate | Sparse",
      "trees": [
        {
          "tag": "number (tree number)",
          "species": "string (4-letter USFS code, e.g., PSME)",
          "species_name": "string (common name)",
          "dbh": "number (diameter at breast height, inches)",
          "height": "number (feet)",
          "mortality_pct": "number (0-100)",
          "grade": "string (sawlog grade, e.g., '1S', '2S')",
          "defect_pct": "number (0-100)",
          "salvage_value": "number (USD per tree)"
        }
      ],
      "plot_summary": {
        "basal_area": "number (sq ft per acre)",
        "trees_per_acre": "number",
        "mbf_per_acre": "number (thousand board feet)",
        "salvage_value_per_acre": "number (USD)",
        "avg_mortality": "number (percent)"
      },
      "access_notes": "string",
      "priority": "HIGHEST | HIGH | MEDIUM | LOW",
      "time_sensitivity": "string"
    }
  ],
  "summary": {
    "total_plots": "number",
    "total_trees_sampled": "number",
    "avg_mbf_per_acre": "number",
    "avg_salvage_value_per_acre": "number",
    "estimated_salvage_area_acres": "number",
    "estimated_total_mbf": "number",
    "estimated_total_value": "number (USD)",
    "priority_breakdown": {
      "highest": "number",
      "high": "number",
      "medium": "number",
      "low": "number"
    },
    "species_distribution": {
      "PSME": "number (percent)",
      "THPL": "number",
      "PICO": "number"
    }
  },
  "recommendations": ["string array"]
}
```

### Sample Data Excerpt

```json
{
  "plots": [
    {
      "plot_id": "52-FOXTROT",
      "sector": "SW-1",
      "coords": [-122.1278, 43.6478],
      "elevation": 3200,
      "slope_pct": 52,
      "stand_type": "Douglas-fir/Western Redcedar",
      "trees": [
        {
          "tag": 1,
          "species": "PSME",
          "species_name": "Douglas-fir",
          "dbh": 36.8,
          "height": 172,
          "mortality_pct": 100,
          "grade": "1S",
          "defect_pct": 8,
          "salvage_value": 1045
        }
      ],
      "plot_summary": {
        "basal_area": 245,
        "mbf_per_acre": 48.2,
        "salvage_value_per_acre": 3225
      },
      "priority": "HIGHEST",
      "time_sensitivity": "Premium large diameter timber. Extract immediately to preserve grade."
    }
  ],
  "summary": {
    "estimated_total_mbf": 230350,
    "estimated_total_value": 13897500
  }
}
```

### Key Fields

- **species**: USFS 4-letter species codes (PSME = Douglas-fir, THPL = Western Redcedar, PICO = Lodgepole Pine)
- **dbh**: Diameter at Breast Height (4.5 feet), standard forestry measurement
- **mortality_pct**: Fire-caused mortality estimate
- **grade**: Sawlog quality (1S = premium sawlog, 4S = low quality/pulp)
- **mbf_per_acre**: Thousand Board Feet per acre (standard timber volume unit)
- **basal_area**: Cross-sectional area of tree stems (sq ft/acre)

### Alignment with USFS Standards

- Follows FSVeg Common Stand Exam field protocols (FSH 2409.12)
- Species codes match USFS Plants Database
- BAF 20 (Basal Area Factor) is standard variable radius plot methodology
- Salvage appraisal follows Region 6 appraisal standards
- Grade classifications align with Pacific Northwest log scaling standards

### Export Format

Cruising Assistant generates **FSVeg XML** from this data:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FSVegExport>
  <CruiseID>cedar-creek-salvage-2022-01</CruiseID>
  <PlotRecord>
    <PlotID>52-FOXTROT</PlotID>
    <GPS_Coordinates>
      <Lat>43.6478</Lat>
      <Lon>-122.1278</Lon>
    </GPS_Coordinates>
    <TreeData>
      <TreeNum>1</TreeNum>
      <SpeciesCode>PSME</SpeciesCode>
      <DBH>36.8</DBH>
      <Mortality>100</Mortality>
      <SalvageValue>1045.00</SalvageValue>
    </TreeData>
  </PlotRecord>
</FSVegExport>
```

---

## 4. Agent Briefing Events

### File: `briefing-events.json`

**Purpose:** Pre-composed AgentBriefingEvent payloads demonstrating complete multi-agent cascade.

**Real-world equivalent:** Live events generated by agents during operation

**Agent consumer:** All agents (for demo/testing)

### Schema Structure

See full schema definition in [`AGENT-MESSAGING-PROTOCOL.md`](./AGENT-MESSAGING-PROTOCOL.md).

```json
{
  "metadata": {
    "fire_id": "string",
    "generated_at": "ISO-8601 timestamp",
    "source": "string",
    "schema_version": "string",
    "description": "string"
  },
  "events": [
    {
      "schema_version": "string (1.1.0)",
      "event_id": "string (UUID)",
      "parent_event_id": "string (UUID) | null",
      "correlation_id": "string (session ID)",
      "timestamp": "ISO-8601 timestamp",
      "type": "alert | insight | action_required | status_update",
      "source_agent": "burn_analyst | trail_assessor | cruising_assistant | nepa_advisor | recovery_coordinator",
      "severity": "info | warning | critical",
      "ui_binding": {
        "target": "map_highlight | rail_pulse | panel_inject | modal_interrupt",
        "geo_reference": "GeoJSON Feature | null"
      },
      "content": {
        "summary": "string",
        "detail": "string",
        "suggested_actions": [
          {
            "action_id": "string",
            "label": "string",
            "target_agent": "string",
            "description": "string",
            "rationale": "string"
          }
        ]
      },
      "proof_layer": {
        "confidence": "number (0-1)",
        "confidence_ledger": {
          "inputs": [
            {
              "source": "string",
              "confidence": "number (0-1)",
              "tier": "1 | 2 | 3",
              "notes": "string"
            }
          ],
          "analysis_confidence": "number (0-1)",
          "recommendation_confidence": "number (0-1)"
        },
        "citations": [
          {
            "source_type": "string",
            "id": "string",
            "uri": "string",
            "excerpt": "string"
          }
        ],
        "reasoning_chain": ["string array"]
      }
    }
  ],
  "demo_sequence": {
    "description": "string",
    "steps": [
      {
        "event_id": "string",
        "trigger": "string",
        "delay_ms": "number"
      }
    ]
  }
}
```

### Sample Event Structure

```json
{
  "event_id": "evt_burn_001",
  "type": "insight",
  "source_agent": "burn_analyst",
  "severity": "critical",
  "content": {
    "summary": "Cedar Creek Fire: Severe burn patterns detected across 81,000 acres (63.6% high severity).",
    "suggested_actions": [
      {
        "action_id": "act_001",
        "label": "Trigger Trail Assessment",
        "target_agent": "trail_assessor",
        "rationale": "Trail network intersects all high-severity sectors"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.92,
    "citations": [
      {
        "source_type": "MTBS",
        "uri": "https://mtbs.gov/viewer/",
        "excerpt": "Cedar Creek Fire burn severity mosaic, accessed 2022-10-01"
      }
    ],
    "reasoning_chain": [
      "Analyzing MTBS burn severity classification across fire perimeter",
      "dNBR values range from 0.22 (low) to 0.81 (high) across 8 sectors",
      "SW-1 and CORE-1 combine high severity (dNBR >0.7) with steep slopes (>35%)"
    ]
  }
}
```

### Key Components

**UI Binding:**
- `map_highlight`: Highlight geometry on 3D map
- `rail_pulse`: Pulse lifecycle rail item (Impact/Damage/Timber/Compliance)
- `panel_inject`: Insert content into agent-specific panel
- `modal_interrupt`: Show modal dialog requiring user attention

**Proof Layer:**
- `confidence`: Overall confidence score (0-1)
- `confidence_ledger`: Granular input confidence tracking by tier
- `citations`: Direct source references (URIs, excerpts)
- `reasoning_chain`: Step-by-step agent logic trail

**Event Chain:**
Events link via `parent_event_id` to form reasoning cascades:
```
evt_burn_001 (Burn Analyst)
  └─> evt_trail_001 (Trail Assessor)
       └─> evt_timber_001 (Cruising Assistant)
            └─> evt_nepa_001 (NEPA Advisor)
                 └─> evt_coordinator_001 (Recovery Coordinator synthesis)
```

### Demo Sequence

The `demo_sequence` object defines the recommended playback order for cascades:

```json
{
  "demo_sequence": {
    "steps": [
      {"event_id": "evt_burn_001", "trigger": "lifecycle_rail_click", "delay_ms": 0},
      {"event_id": "evt_trail_001", "trigger": "suggested_action", "delay_ms": 1500},
      {"event_id": "evt_timber_001", "trigger": "suggested_action", "delay_ms": 1500}
    ]
  }
}
```

---

## 5. Combined GeoJSON (Frontend)

### File: `cedar-creek-geojson.json`

**Purpose:** Unified GeoJSON file for map rendering in Command Console.

**Format:** GeoJSON FeatureCollections organized by layer type

### Schema Structure

```json
{
  "firePerimeter": {
    "type": "Feature",
    "properties": {
      "fire_id": "string",
      "fire_name": "string",
      "total_acres": "number",
      "containment_date": "ISO-8601 date"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": "GeoJSON coordinates"
    }
  },
  "burnSeverity": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": "string",
          "name": "string",
          "severity": "HIGH | MODERATE | LOW",
          "severity_class": "number (1-4)",
          "acres": "number",
          "dnbr_mean": "number"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": "GeoJSON coordinates"
        }
      }
    ]
  },
  "trailDamage": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "damage_id": "string",
          "trail_name": "string",
          "type": "string",
          "severity": "number (1-5)",
          "description": "string"
        },
        "geometry": {
          "type": "Point",
          "coordinates": "[lon, lat]"
        }
      }
    ]
  },
  "timberPlots": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "plot_id": "string",
          "sector": "string",
          "stand_type": "string",
          "priority": "string",
          "mbf_per_acre": "number",
          "salvage_value_per_acre": "number"
        },
        "geometry": {
          "type": "Point",
          "coordinates": "[lon, lat]"
        }
      }
    ]
  }
}
```

### Layer Types

1. **firePerimeter**: Single polygon feature for fire boundary
2. **burnSeverity**: Polygon features for each severity sector
3. **trailDamage**: Point features for each damage location
4. **timberPlots**: Point features for each cruise plot

### Map Rendering

This file is consumed by `CedarCreekMap.tsx` for:
- 3D terrain visualization with Cesium
- Layer toggling (severity zones, damage points, plots)
- Interactive feature selection
- Camera flyTo operations

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FIXTURE DATA FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  data/fixtures/cedar-creek/                                 │
│    ├─ burn-severity.json ──────> Burn Analyst Agent        │
│    ├─ trail-damage.json ───────> Trail Assessor Agent      │
│    ├─ timber-plots.json ───────> Cruising Assistant        │
│    └─ briefing-events.json ───> All Agents (demo mode)     │
│                                                             │
│  apps/command-console/public/fixtures/                      │
│    ├─ cedar-creek-geojson.json ─> Map Components           │
│    └─ briefing-events.json ─────> Demo Tour                │
│                                                             │
│                          ↓                                  │
│                                                             │
│              Agent Reasoning (Gemini 2.0)                   │
│                          ↓                                  │
│                                                             │
│              AgentBriefingEvent Emission                    │
│                          ↓                                  │
│                                                             │
│              Command Console UI Rendering                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2 Migration Strategy

### Adapter Pattern

When transitioning to live data sources in Phase 2, implement adapters that:

1. **Normalize upstream formats** to match these fixture schemas
2. **Preserve backward compatibility** with agent code
3. **Inject data quality metadata** (confidence scores, timestamps)

### Recommended Adapter Locations

```
services/
  adapters/
    mtbs-adapter/        # MTBS API → burn-severity.json schema
    tracs-adapter/       # TRACS database → trail-damage.json schema
    fsveg-adapter/       # FSVeg API → timber-plots.json schema
```

### Example Adapter Interface

```python
class MTBSAdapter:
    """
    Adapter to fetch live MTBS data and normalize to burn-severity.json schema.
    """
    def fetch_fire_severity(self, fire_id: str) -> dict:
        """
        Returns dict matching burn-severity.json schema.
        """
        # Fetch from MTBS API
        mtbs_data = self._fetch_from_mtbs_api(fire_id)

        # Transform to fixture schema
        normalized = self._normalize_to_schema(mtbs_data)

        # Add data quality metadata
        normalized['data_quality'] = {
            'source': 'MTBS_API',
            'confidence': 0.95,
            'tier': 1,
            'fetch_timestamp': datetime.now().isoformat()
        }

        return normalized
```

### Data Quality Enhancements

Phase 2 adapters should inject:

- **Confidence scores** based on data source reliability
- **Tier classification** (Tier 1 = authoritative, Tier 2 = modeled, Tier 3 = synthetic)
- **Provenance metadata** (fetch timestamp, API version, processing pipeline)
- **Data freshness indicators** (imagery date, field survey date)

---

## Real-World Data Source Mapping

| Fixture Type | Real Source | API/Format | Integration Complexity |
|--------------|-------------|------------|------------------------|
| Burn Severity | MTBS / RAVG | GeoJSON API | Low (public API, standard format) |
| Trail Damage | TRACS Database | SQL/CSV export | Medium (internal USFS database) |
| Timber Plots | FSVeg / NRM | XML/API | High (complex schema, authentication) |
| Fire Perimeter | NIFC / InciWeb | GeoJSON/KML | Low (public API) |

### USFS Data Standards References

- **MTBS**: [https://www.mtbs.gov/](https://www.mtbs.gov/)
- **TRACS**: FSH 2309.18 (Trail Assessment and Condition Survey Handbook)
- **FSVeg**: FSH 2409.12 (Common Stand Exam Field Guide)
- **NIFC Fire Perimeters**: [https://data-nifc.opendata.arcgis.com/](https://data-nifc.opendata.arcgis.com/)

---

## Validation and Testing

### Schema Validation

Each fixture file should be validated against its schema:

```bash
# Example: Validate burn-severity.json against schema
python -m packages.twin-core.validation.validate_fixture \
  --file data/fixtures/cedar-creek/burn-severity.json \
  --schema schemas/burn-severity-schema.json
```

### Test Data Quality

Fixture data must meet quality standards:

- **Completeness**: No null values in required fields
- **Consistency**: Cross-references between files must resolve (e.g., sector IDs)
- **Realism**: Values must fall within realistic ranges (e.g., 0 < dnbr_mean < 1)
- **Geospatial validity**: All coordinates must be valid WGS84 lon/lat pairs

### Sample Test Cases

```python
def test_burn_severity_schema():
    """Validate burn-severity.json matches expected schema."""
    with open('data/fixtures/cedar-creek/burn-severity.json') as f:
        data = json.load(f)

    assert 'fire_id' in data
    assert 'sectors' in data
    assert len(data['sectors']) > 0

    for sector in data['sectors']:
        assert 0 <= sector['dnbr_mean'] <= 1
        assert sector['severity'] in ['HIGH', 'MODERATE', 'LOW']
        assert 'geometry' in sector

def test_trail_damage_cost_estimates():
    """Ensure cost estimates are realistic."""
    with open('data/fixtures/cedar-creek/trail-damage.json') as f:
        data = json.load(f)

    for trail in data['trails']:
        for damage in trail['damage_points']:
            # Bridge replacements typically $25k-$150k
            if damage['type'] == 'BRIDGE_FAILURE':
                assert 25000 <= damage['estimated_cost'] <= 150000
```

---

## Appendix A: Species Code Reference

Common USFS 4-letter species codes used in timber fixtures:

| Code | Common Name | Scientific Name |
|------|-------------|-----------------|
| PSME | Douglas-fir | *Pseudotsuga menziesii* |
| THPL | Western Redcedar | *Thuja plicata* |
| PICO | Lodgepole Pine | *Pinus contorta* |
| TSHE | Western Hemlock | *Tsuga heterophylla* |
| TSME | Mountain Hemlock | *Tsuga mertensiana* |
| ABLA | Subalpine Fir | *Abies lasiocarpa* |
| ABGR | Grand Fir | *Abies grandis* |
| PIPO | Ponderosa Pine | *Pinus ponderosa* |

Full reference: [USFS Plants Database](https://www.fs.fed.us/database/feis/plants/)

---

## Appendix B: Confidence Tier Definitions

From `AGENT-MESSAGING-PROTOCOL.md`:

| Tier | Confidence Range | Usage | Example |
|------|------------------|-------|---------|
| **Tier 1** | 90%+ | Direct use, no hedging | Sentinel-2 imagery, crew GPS |
| **Tier 2** | 70-85% | Caution-flagged, human decision pending | Interpolated LiDAR, FIA extrapolation |
| **Tier 3** | <70% | Demo only, synthetic | ML-inferred canopy height, climate projections |

---

## Appendix C: File Size and Performance

| File | Size | Load Time (avg) | Recommended Cache Strategy |
|------|------|-----------------|---------------------------|
| burn-severity.json | 5.9 KB | <10ms | Session cache (Redis) |
| trail-damage.json | 9.1 KB | <10ms | Session cache (Redis) |
| timber-plots.json | 11 KB | <15ms | Session cache (Redis) |
| briefing-events.json | 18 KB | <20ms | Memory cache (demo mode) |
| cedar-creek-geojson.json | 13 KB | <15ms | Browser localStorage |

All fixtures are small enough to load synchronously without performance impact.

---

## Document Metadata

- **Last Updated:** 2024-12-21
- **Schema Version:** 1.1.0
- **Maintained By:** RANGER Development Team
- **Related Documents:**
  - [`DATA-SIMULATION-STRATEGY.md`](../DATA-SIMULATION-STRATEGY.md)
  - [`AGENT-MESSAGING-PROTOCOL.md`](./AGENT-MESSAGING-PROTOCOL.md)
  - [`LEGACY-INTEGRATION-SCHEMAS.md`](./LEGACY-INTEGRATION-SCHEMAS.md)
  - [`BRIEFING-UX-SPEC.md`](./BRIEFING-UX-SPEC.md)
