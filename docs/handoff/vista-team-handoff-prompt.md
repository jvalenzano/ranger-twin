# Vista Team Handoff: Lessons and Assets from Ranger Twin

> **From:** Jason Valenzano, CTO
> **Date:** 2026-03-08
> **Context:** Ranger Twin is being sunset as a standalone project. Its purpose — proving multi-agent coordination over USFS data — has been fulfilled. Vista is now the primary vehicle. This document transfers everything the Vista team needs from Ranger Twin's research, reconnaissance, and architectural learnings.

---

## Why This Handoff Matters

Ranger Twin spent significant cycles doing work that Vista would otherwise repeat from scratch: identifying which federal data sources actually respond, what their schemas look like, what auth they require, what rate limits they impose, and how to structure fixture data that mirrors real federal systems. Vista's Phase 2 PRD calls for static pre-processed data layers across fire perimeters, burn severity, hydrology, wind, and road access. Ranger Twin already probed every one of those sources live and documented the results.

The goal here is not to transplant Ranger Twin's architecture into Vista. The projects have different output modalities — Ranger Twin produces text-based reasoning; Vista produces a cinematic 4D visual experience. But the **data layer is identical**. Fire perimeters are fire perimeters whether you're rendering them on a CesiumJS globe or feeding them to a Gemini agent. The schemas, endpoints, field mappings, and access patterns transfer directly.

---

## Part 1: Data Source Intelligence (Transfer Directly)

### Live API Reconnaissance (Completed 2026-03-08)

A team of 5 specialist reconnaissance agents probed 12 public data endpoints live and documented every field, response time, and schema. This is the most operationally valuable asset for Vista's Phase 3 data engineering.

**Primary document:** `ranger-twin/docs/investigation/data-source-reconnaissance-report.md`

Summary of what was confirmed operational:

| Source | Status | Auth | Response Time | What Vista Gets |
|--------|--------|------|---------------|-----------------|
| **NIFC Open Data** | OPERATIONAL | None | 282-409ms | Fire perimeters as GeoJSON polygons. 120 fields including `poly_IncidentName`, `poly_GISAcres`, `attr_PercentContained`, `attr_FireDiscoveryDateTime`. Perimeters for Dixie Fire and Hermits Peak are in here. |
| **MTBS** | OPERATIONAL | None | 526ms | 84 layers (1984-2024). Burn severity with **per-fire dNBR thresholds** — Cedar Creek, Dixie, and Hermits Peak all have custom thresholds calibrated to their specific Landsat imagery. Critical for Vista's severity color-coding. |
| **NASA FIRMS** | AUTH WALL | Free API key | 1640ms | Active fire hotspot detections from VIIRS (375m) and MODIS (1km). CSV with lat/lon, brightness (Kelvin), confidence, FRP. This is how Vista animates fire progression between NIFC perimeter snapshots. |
| **USGS 3DEP** | OPERATIONAL | None | 806ms | Elevation data. Query any point: `identify?geometry={x,y}`. Vista needs this for terrain-aware rendering and slope/aspect overlays. |
| **USGS NHD** | OPERATIONAL | None | — | 13 hydrology layers: flowlines, waterbodies, flow direction. Vista's Scenario #2 (watershed recovery) needs these for the Gallinas River and North Fork Feather River. |
| **OpenStreetMap/Overpass** | OPERATIONAL | None | 596ms | Trails, forest roads, campgrounds, shelters. USFS facilities tagged with `operator: "USFS"`. Vista's road/trail access layer starts here. |

**Field-level schemas** for all sources are documented in the reconnaissance report, including exact field names, types, and sample values. When Vista's Phase 3 builds data adapters, the schema mapping is already done.

### Comprehensive API Research (Pre-Reconnaissance)

Two additional research documents provide broader context:

- **`ranger-twin/docs/research/PUBLIC-API-INVENTORY.md`** — Deep-dive on 5 sources with tested Python integration code, rate limit documentation, and storage architecture recommendations. Includes a phased integration priority (NIFC first, then FIRMS, then MTBS, then InciWeb/IRWIN).

- **`ranger-twin/docs/research/APIs_AND_DATASETS.md`** — Broader survey mapping ~15 data sources to specific use cases. Includes Sentinel-2, Landsat, USGS TNM, GovInfo/Federal Register, and Data.gov catalogs. Maps each source to which Ranger Twin agent consumed it — Vista can use this mapping to understand which data sources serve which domain.

### Integration Roadmap

**`ranger-twin/docs/INTEGRATION-ROADMAP.md`** defines the phased transition from fixtures to live data:

- Phase 1: Static JSON fixtures (completed in Ranger Twin)
- Phase 2A: Replace fire perimeter + active fire fixtures with NIFC and FIRMS live APIs (15-min polling)
- Phase 2B: USFS stakeholder interviews
- Phase 2C: ArcGIS integration (Survey123, Collector) for field data
- Phase 2D: MTBS historical data integration

Vista's Phase 3 data strategy should reference this roadmap. The phases are different (Vista is building a visual prototype, not an agent system), but the data source sequencing — NIFC first, FIRMS second, MTBS third — is the right order regardless of the consuming application.

---

## Part 2: LMOSINT Research (Strategic Context)

A 5-agent research team produced a comprehensive opportunity brief analyzing the market gap for cross-domain land management intelligence. While LMOSINT was scoped as a Ranger Twin extension, several findings are directly relevant to Vista's positioning and stakeholder conversations.

**Primary document:** `ranger-twin/docs/research/lmosint/lmosint_opportunity_brief.md`

### What Vista Should Take From LMOSINT

**1. The 30-source signal catalog.** Agent 2 cataloged 30 machine-readable federal data sources across fire, weather, hydrology, air quality, ecology, incident management, and regulatory domains — all publicly accessible. The machine-readable version (`signal_catalog.json`) includes API endpoints, formats, update frequencies, and auth requirements. Vista's data engineering team should use this as a source menu.

**2. The "8-Minute Reality."** Forest Supervisors spend 1-3 hours manually synthesizing 5-8 disconnected systems to produce a 10-minute briefing. Vista's Scenario #1 (Dixie Fire 48-Hour Replay) targets exactly this pain point. The LMOSINT research validates the user need with GAO reports, academic papers, and the EPIC Innovation Report (April 2025). When Vista needs to justify its existence to stakeholders, this evidence base is ready.

**3. The competitive landscape.** Agent 4 profiled 8 commercial vendors (Esri, Palantir, Technosylva, Vibrant Planet, Pano AI, etc.) and confirmed that no incumbent offers cross-domain, cross-temporal intelligence synthesis. Vista's concept validation already identified this gap ("no tool assembles fire, water, access, and communities into a single narrative"), but the LMOSINT research backs it with market data, contract values, and FedRAMP analysis.

**4. The signal fusion patterns.** LMOSINT identified four cross-domain fusion patterns that map directly to Vista scenarios:
   - **Post-Fire Cascade Risk** (burn severity + debris flow + streamflow + precipitation) → Vista Scenario #2
   - **Fire-Weather Correlation** (fire detections + RAWS + Red Flag Warnings + HRRR wind) → Vista Scenario #1
   - **Smoke Impact Intelligence** (fire locations + AQI + wind forecasts) → potential Vista enhancement
   - **Recovery Vegetation Monitoring** (NDVI + Landsat + MTBS + FIA) → Vista Scenario #4

**5. The governance and market entry strategy.** LMOSINT recommended "Intelligence Layer, Not Platform Replacement" — don't compete with Esri or WFDSS, sit above them as a synthesis layer. Vista's "Demonstrate First, Govern Later" strategy (from the Phase 2 governance memo) is the same insight. The LMOSINT brief adds contract vehicle details (8(a) STARS III, sole-source up to $4.5M) and competitive threat analysis (Palantir's USDA beachhead) that inform Vista's go-to-market timing.

### Supporting LMOSINT Files

| File | What It Contains |
|------|-----------------|
| `lmosint_opportunity_brief.md` | Executive synthesis — the GO recommendation with full evidence chain |
| `agent1_open_source_landscape.md` | 50+ repo survey confirming no existing solution does cross-domain fusion |
| `agent2_signal_catalog.md` | Human-readable analysis of 30 data sources with ranking |
| `signal_catalog.json` | Machine-readable catalog (API endpoints, formats, auth, update frequency) |
| `agent3_user_workflow_intelligence.md` | Decision points, trust hierarchy, the "8-minute reality" |
| `agent4_competitive_landscape.md` | Incumbent profiles, contract landscape, entry strategy |
| `competitive_landscape.json` | Machine-readable vendor profiles and market data |
| `architecture_recommendation.md` | Signal Registry design, confidence decay model, build estimates |

All files located at: `ranger-twin/docs/research/lmosint/`

---

## Part 3: Fixture Design Patterns (Reuse the Schema)

Ranger Twin built fixture data for two fires (Cedar Creek 2022, Bootleg 2021) following real federal schemas. Vista needs to build fixtures for Dixie Fire and Hermits Peak. The schema work is done — Vista just needs different fire data in the same shapes.

### Fixture Schema Mapping

| Fixture File | Federal Source | Schema Standard | Vista Equivalent |
|-------------|---------------|-----------------|------------------|
| `incident-metadata.json` | IRWIN | IRWIN attributes (discovery date, containment %, cause, location, cost) | Fire metadata for Dixie and Hermits Peak |
| `burn-severity.json` | MTBS | dNBR values per sector with severity classification (Unburned/Low/Moderate/High) | Severity layer color-coding on globe |
| `trail-damage.json` | TRACS | TRACS damage codes, condition assessments, GPS coordinates | Road/trail status layer |
| `timber-plots.json` | FSVeg | Common Stand Exam format (species, DBH, volume, defect) | Not needed for Vista prototype |

**Location:** `ranger-twin/data/fixtures/cedar-creek/` and `ranger-twin/data/fixtures/bootleg/`

### Key Insight: dNBR Thresholds Are Per-Fire

The MTBS reconnaissance revealed that each fire record includes its own severity classification thresholds, calibrated to its specific Landsat imagery. Generic national thresholds will produce incorrect severity classes. When Vista builds the Dixie Fire and Hermits Peak severity layers, it must use the per-fire thresholds from MTBS, not hardcoded values.

### The Fixture-First Philosophy

**`ranger-twin/docs/DATA-SIMULATION-STRATEGY.md`** articulates why static fixtures are the right starting point:

> "RANGER is the nerve center, not the sensors."

For Vista, the equivalent: **Vista is the narrative lens, not the data pipeline.** The prototype proves that cross-domain, cross-temporal patterns are visible together on real terrain. It does not prove that live API polling works at scale. Static pre-processed data files (Vista PRD requirement P-8) are not a compromise — they're the correct architecture for a prototype whose value proposition is visual synthesis, not data freshness.

---

## Part 4: The Data Recon Agent Team (Reference Implementation)

The most recent work on Ranger Twin was building a multi-agent reconnaissance team that probes data sources autonomously. This isn't directly portable to Vista (Vista is a CesiumJS app, not an agent system), but the **pattern** is instructive for Vista's Phase 3 data engineering.

**Location:** `ranger-twin/agents/data_recon/`

```
agents/data_recon/
├── agent.py                          # Coordinator (routes to 5 specialists)
├── skills/api_probe/scripts/         # Shared HTTP probe utility
└── sub_agents/
    ├── nifc_recon/agent.py          # 4 tools: current fires, historical, metadata, hub
    ├── firms_recon/agent.py         # 3 tools: availability, area, capabilities
    ├── mtbs_recon/agent.py          # 4 tools: WMS, fields, query, downloads
    ├── usgs_recon/agent.py          # 5 tools: 3DEP, elevation, hydro, transport, boundaries
    └── osm_recon/agent.py           # 4 tools: status, trails, roads, infrastructure
```

20 tools across 5 specialists. Each specialist's `agent.py` contains the exact API endpoint URLs, query parameters, and expected response formats for its data source. If Vista's data engineering team needs to write fetch scripts for any of these sources, the agent files are working reference implementations.

---

## Part 5: What Ranger Twin Learned the Hard Way

### 1. IRWIN Is a Dead End for External Projects
IRWIN (Integrated Reporting of Wildfire Information) is the authoritative incident database, but it requires agency credentials with MFA. NIFC Open Data is the public proxy — same incidents, slightly different field names, no auth barrier. Vista should use NIFC, not IRWIN, for all fire incident data.

### 2. MTBS Has a 1-2 Year Lag
MTBS is invaluable for historical burn severity but publishes annually with a 1-2 year lag. For the Dixie Fire (2021) and Hermits Peak (2022), MTBS data exists. But for any fire more recent than ~2024, you need FIRMS hotspots or RAVG (Rapid Assessment of Vegetation condition after wildfire) as a proxy. Vista's historical scenarios are fine; just don't promise "current" severity data.

### 3. ArcGIS REST Services Paginate at 2,000 Features
NIFC limits query responses to 2,000 features. For national-scale queries, you need pagination or the bulk download API. For Vista's two landscapes (Dixie + Hermits Peak), single queries with spatial filters will stay well under the limit.

### 4. Overpass API Has Strict Rate Limits
2 concurrent requests maximum. Build in caching and don't hammer it during development. For Vista's static fixture approach, fetch once, cache forever.

### 5. The "Fixture-to-Live" Transition Is an Infrastructure Change, Not a Code Change
Ranger Twin's MCP abstraction proved this: the tool interface stays the same, only the backend swaps. Vista should design its data layer the same way — components consume a data interface, not a specific file path. When Vista eventually connects to live APIs, the rendering code doesn't change.

### 6. HRRR Wind Data Is the Hardest Layer
Vista's PRD flags HRRR as non-trivial (Q4 in the questions log). Ranger Twin confirmed this — GRIB2 processing requires specialized libraries (cfgrib, xarray) and the data volumes are significant (hourly 3km grids). The LMOSINT architecture recommendation suggests deferring HRRR to a later phase and using simpler NDFD forecasts initially. Vista's Phase 3 spike should validate this before committing.

### 7. Phase Discipline Prevents Wasted Cycles
Ranger Twin's biggest lesson wasn't technical — it was process. The project's pre-flight validation protocol (test assumptions before writing code) prevented multiple false starts where documentation described aspirational state, not actual runtime state. Vista's phase-gated lifecycle with human approval checkpoints is the right model. Don't skip it.

---

## Part 6: Where Vista and Ranger Twin Could Reconverge

The projects diverge on output modality (visual vs. reasoning) but could reconverge as complementary layers:

- **Vista shows.** The 4D globe renders cross-domain patterns visually — fire perimeters advancing toward watersheds, wind driving smoke over communities, roads closing as the fire front passes.

- **Ranger Twin explains.** The multi-agent system interprets those patterns — "Sector 7 shows high dNBR values (0.72) indicating complete vegetation removal. Combined with 35-degree slopes and the proximity of Salmon Creek, BAER emergency stabilization is recommended within 7 days."

A future integration: user scrubs Vista's timeline, sees a pattern, clicks a sector, and gets a Ranger Twin agent's analysis. Vista becomes the spatial front door; Ranger Twin becomes the reasoning engine behind it. This is the same relationship Vista's PRD describes between Vista and its companion ForestView apps — but with AI reasoning instead of domain-specific tools.

This is a Phase 4+ conversation. For now, the concrete value flows one direction: Ranger Twin's data reconnaissance feeds Vista's data engineering.

---

## Recommended Actions for the Vista Team

1. **Copy the data source research into Vista's repo.** The reconnaissance report, API inventory, and LMOSINT signal catalog are directly usable. Don't re-research what's already been probed live.

2. **Use Ranger Twin's fixture schemas as templates.** When building Dixie Fire and Hermits Peak fixture data, start from `ranger-twin/data/fixtures/cedar-creek/` and adapt. The MTBS severity schema, NIFC incident schema, and TRACS trail schema are already aligned with federal standards.

3. **Reference the LMOSINT competitive analysis in stakeholder conversations.** The market gap analysis, vendor profiles, and "8-minute reality" framing are ready-made talking points. They validate Vista's positioning without Vista having to commission its own market research.

4. **Design Vista's data layer for backend swappability.** Components should consume a data interface, not file paths. This is the lesson from Ranger Twin's MCP pattern — when the backend changes from static files to live APIs, the consuming code stays the same.

5. **Prioritize NIFC and MTBS data engineering first.** They're fully operational, require no auth, and serve Vista's two highest-priority data domains (fire perimeters and burn severity). FIRMS comes second (needs API key). HRRR wind comes last (needs a feasibility spike).

6. **Read the LMOSINT opportunity brief before Phase 3 planning.** Even though Vista isn't building an agent system, the brief's analysis of user pain points, competitive positioning, and federal budget dynamics informs Vista's product strategy and stakeholder pitch.

---

## File Index (Ranger Twin → Vista)

| Priority | File | Why Vista Needs It |
|----------|------|-------------------|
| **HIGH** | `docs/investigation/data-source-reconnaissance-report.md` | Live API probe results with field schemas, response times, and integration assessments for all 6 data sources |
| **HIGH** | `docs/research/PUBLIC-API-INVENTORY.md` | Tested integration code for NIFC, FIRMS, MTBS with rate limits and auth documentation |
| **HIGH** | `docs/research/lmosint/lmosint_opportunity_brief.md` | Market gap validation, competitive landscape, user pain points, "8-minute reality" framing |
| **HIGH** | `docs/research/lmosint/signal_catalog.json` | Machine-readable catalog of 30 federal data sources with endpoints and formats |
| **MEDIUM** | `docs/research/APIs_AND_DATASETS.md` | Broader data source survey (~15 sources) with domain mapping |
| **MEDIUM** | `docs/INTEGRATION-ROADMAP.md` | Phased fixture-to-live transition plan |
| **MEDIUM** | `docs/DATA-SIMULATION-STRATEGY.md` | Fixture-first philosophy and architecture rationale |
| **MEDIUM** | `data/fixtures/cedar-creek/*.json` | Reference fixture schemas (incident, severity, trail, timber) |
| **MEDIUM** | `docs/research/lmosint/agent3_user_workflow_intelligence.md` | USFS decision points, workflow analysis, trust hierarchy |
| **MEDIUM** | `docs/research/lmosint/agent4_competitive_landscape.md` | Vendor profiles (Esri, Palantir, Technosylva, Vibrant Planet) with contract data |
| **REFERENCE** | `agents/data_recon/sub_agents/*/agent.py` | Working API endpoint URLs and query patterns for all 6 data sources |
| **REFERENCE** | `docs/research/lmosint/architecture_recommendation.md` | Signal Registry design with confidence decay model (applicable to Vista's data freshness layer) |
| **REFERENCE** | `docs/research/lmosint/competitive_landscape.json` | Machine-readable vendor profiles for ongoing competitive monitoring |

---

*This handoff was prepared from the Ranger Twin codebase on 2026-03-08. All referenced documents are in the `ranger-twin` repository on branch `claude/data-source-reconnaissance-v5BEs` and `master`.*
