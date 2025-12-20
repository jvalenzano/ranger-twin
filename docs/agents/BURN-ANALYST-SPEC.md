# FireSight Lite - Application Brief

**Status:** ⚪ Concept (Backup)  
**Priority:** Alternative  
**Developer:** TBD  
**Sprint Target:** 6 weeks (if activated)

---

## The "Wow" Pitch

> Within 48 hours of a wildfire being contained, FireSight Lite analyzes satellite imagery to map burn severity across the entire fire perimeter. A BAER team that used to spend two weeks on aerial surveys and ground-truthing gets a draft severity map on day one—complete with suggested treatment priorities and a pre-populated BAER report template.

---

## Core Purpose

FireSight Lite is a **post-fire damage assessment accelerator** that uses satellite imagery analysis and generative AI to streamline Burned Area Emergency Response (BAER) team workflows. It transforms satellite data into actionable severity maps and draft reports, compressing weeks of assessment into days.

**Problem Solved:** After major wildfires, BAER teams have 7 days to complete initial assessments that inform emergency stabilization treatments. Current workflows rely on helicopter surveys, manual GIS analysis, and extensive ground-truthing. Teams are overwhelmed, especially during active fire seasons when multiple fires compete for limited BAER resources.

**Value Proposition:** Give every BAER team a "first draft" assessment within 48 hours of containment, letting specialists focus on validation and treatment planning instead of data compilation.

---

## Why This Is a Backup (Not Primary)

| Factor | Assessment | Impact |
|--------|------------|--------|
| **Market Competition** | High—Pano AI, Descartes Labs, others | TechTrend has no differentiation |
| **Data Sourcing** | Difficult—satellite imagery is expensive/complex | Major blocker for 6-week demo |
| **Technical Complexity** | High—requires CV expertise we may not have | Risk to timeline |
| **Demo Appeal** | Medium—less visually interactive than field apps | Harder to "wow" audience |

**Activation Criteria:** Consider FireSight Lite if:
- Primary apps encounter fatal technical blockers
- Client specifically requests fire-related capabilities
- Satellite imagery partnership emerges
- Fire season creates urgent BAER demand

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

| Persona | Role | Pain Point | How FireSight Helps |
|---------|------|------------|---------------------|
| **BAER Team Lead** | Coordinates assessment | 7-day deadline pressure | Draft assessment on day 1 |
| **GIS Specialist** | Creates severity maps | Manual classification is tedious | Automated first-pass classification |
| **Soil Scientist** | Assesses erosion risk | Limited time for ground-truthing | Prioritized areas for field visits |
| **Hydrologist** | Evaluates watershed impacts | Needs severity data for models | Faster data availability |

---

## Technical Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Satellite  │────▶│   Image     │────▶│  Gemini     │────▶│   BAER      │
│   Imagery   │     │ Processing  │     │  Analysis   │     │  Outputs    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ Sentinel-2/        │ Cloud-optimized    │ Severity           │ Maps, Reports
     │ Landsat/NAIP       │ GeoTIFF            │ Classification     │ GeoJSON
     │                    │                    │                    │
                    ┌─────────────┐
                    │   Terrain   │
                    │    Data     │
                    │  (DEM/Slope)│
                    └─────────────┘
```

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Imagery Source** | Sentinel-2, Landsat 8/9, NAIP | Free/low-cost options |
| **Image Processing** | Google Earth Engine or rasterio | Cloud-optimized GeoTIFF |
| **AI Analysis** | Gemini 1.5 Pro (Vision) | Multimodal image analysis |
| **Terrain Data** | USGS 3DEP, SRTM | Slope, aspect for treatment priority |
| **GIS Output** | GeoJSON, Cloud-Optimized GeoTIFF | Standard formats |
| **Report Generation** | Gemini + Document templates | BAER report format |
| **Web Interface** | React + Leaflet/MapLibre | Interactive map viewer |

### Burn Severity Classification

| Class | dNBR Range | Visual Indicators | Treatment Priority |
|-------|------------|-------------------|-------------------|
| **Unburned** | <0.1 | Green vegetation | None |
| **Low** | 0.1-0.27 | Scorched understory, green canopy | Low |
| **Moderate** | 0.27-0.66 | Mixed mortality, partial canopy loss | Medium |
| **High** | >0.66 | Complete canopy loss, white ash | High |

*dNBR = differenced Normalized Burn Ratio*

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/assessments` | POST | Create new fire assessment |
| `/api/v1/assessments/{id}/imagery` | POST | Upload/link satellite imagery |
| `/api/v1/assessments/{id}/analyze` | POST | Trigger AI analysis |
| `/api/v1/assessments/{id}/severity-map` | GET | Retrieve severity map (GeoJSON) |
| `/api/v1/assessments/{id}/report` | GET | Generate BAER report draft |

---

## Scope Constraints

### In Scope (MVP)
- ✅ Single-fire assessment workflow
- ✅ Sentinel-2 imagery (free, 10m resolution)
- ✅ 4-class burn severity classification
- ✅ Basic severity map generation
- ✅ Simple BAER report template population
- ✅ Web-based map viewer

### Out of Scope (Future)
- ❌ Real-time fire detection/monitoring
- ❌ Multi-temporal analysis (fire progression)
- ❌ High-resolution commercial imagery (Planet, Maxar)
- ❌ Integration with IFTDSS or other fire modeling systems
- ❌ Automated treatment cost estimation
- ❌ Mobile/offline capability

---

## 6-Week Development Plan

| Week | Focus | Key Deliverables | Success Criteria |
|------|-------|------------------|------------------|
| **1** | Imagery Pipeline | Sentinel-2 ingestion working | Can retrieve imagery for any fire perimeter |
| **2** | Severity Classification | dNBR calculation + AI enhancement | Reasonable severity map from test fire |
| **3** | Map Generation | GeoJSON output, web viewer | Interactive severity map in browser |
| **4** | Report Generation | BAER template + Gemini narrative | Draft report with AI-generated text |
| **5** | Treatment Priorities | Terrain integration, priority scoring | Prioritized treatment areas identified |
| **6** | Demo Prep | End-to-end polish, sample fires | Smooth demo with real fire examples |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Imagery sourcing complexity** | High | Critical | Use only free Sentinel-2; pre-download test data | Lead |
| **Classification accuracy** | High | High | Show confidence scores; emphasize "draft" nature | Dev |
| **Cloud cover in imagery** | High | Medium | Select fires with clear imagery; show limitation | Dev |
| **Competitive comparison** | Medium | High | Emphasize BAER workflow integration, not just CV | Lead |
| **GIS format compatibility** | Medium | Medium | Test with ArcGIS/QGIS early | Dev |
| **Processing time** | Medium | Medium | Async processing; set realistic expectations | Dev |

---

## Data Requirements

### Satellite Imagery Sources

| Source | Resolution | Revisit | Cost | Status |
|--------|------------|---------|------|--------|
| **Sentinel-2** | 10-20m | 5 days | Free | 🟢 Available via GEE |
| **Landsat 8/9** | 30m | 16 days | Free | 🟢 Available via GEE |
| **NAIP** | 1m | ~3 years | Free | 🔵 Limited temporal coverage |
| **Planet** | 3m | Daily | $$$ | ⚪ Not planned for MVP |
| **Maxar** | 0.5m | On-demand | $$$$ | ⚪ Not planned for MVP |

### Test Fire Data Needed

| Fire | Year | Size | Location | Why Use |
|------|------|------|----------|---------|
| **Bootleg Fire** | 2021 | 413K acres | OR | Large, well-documented |
| **Dixie Fire** | 2021 | 963K acres | CA | Largest single fire in CA history |
| **Hermits Peak** | 2022 | 341K acres | NM | Recent, prescribed burn origin |
| **Recent local fire** | 2024-25 | Any | PNW | Relevance to demo audience |

### Ancillary Data

| Data | Source | Purpose |
|------|--------|---------|
| Fire perimeters | NIFC/GeoMAC | Define analysis area |
| DEM | USGS 3DEP | Slope/aspect for treatment priority |
| Streams/watersheds | NHD | Hydrologic risk assessment |
| Roads | TIGER | Access for treatment planning |

---

## Demo Script Outline

**Duration:** 8-10 minutes

1. **Setup** (1 min): Show FireSight interface, explain BAER challenge
2. **The Problem** (1 min): "BAER teams have 7 days, but assessment takes 14..."
3. **Fire Selection** (1 min): Select a recent fire from the map
4. **Analysis Trigger** (2 min): Show satellite imagery, trigger analysis
5. **Severity Map** (2 min): Display classified severity map, explain classes
6. **Treatment Priorities** (1 min): Show AI-recommended priority areas
7. **Report Generation** (1 min): Display draft BAER report with findings
8. **Q&A** (1 min): Address questions

**Key Demo Message:**
> "This isn't replacing BAER expertise—it's giving your specialists a head start. Instead of spending week one on data compilation, they can spend it on the decisions that matter."

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Severity classification agreement | >75% with official BAER maps | Comparison to MTBS data |
| Processing time | <4 hours for 100K acre fire | Instrumentation |
| Report completeness | All required BAER sections populated | Template validation |
| Demo completion | Smooth 10-min flow | Demo day |

---

## Competitive Landscape

### Direct Competitors

| Competitor | Strengths | Weaknesses | TechTrend Angle |
|------------|-----------|------------|-----------------|
| **Pano AI** | Real-time detection, camera networks | Detection focus, not BAER | We focus on post-fire assessment |
| **Descartes Labs** | Massive imagery archive, strong CV | Platform complexity, cost | We integrate with BAER workflow |
| **USFS RAVG** | Official, trusted | Slow (weeks), no AI narrative | We provide draft faster |
| **Technosylva** | Fire behavior modeling | Prediction focus | We focus on damage assessment |

### Differentiation Challenge

Unlike our other apps, FireSight Lite enters a **crowded market** with well-funded competitors. Our differentiation must be:

1. **BAER Workflow Integration** — Not just a map, but a report
2. **Speed to Draft** — 48 hours, not 2 weeks
3. **Federal Acquisition** — We're on contract vehicles, startups aren't
4. **Complement, Not Replace** — Position as tool for overwhelmed teams

---

## Open Questions

- [ ] Can we get sample BAER reports to match output format?
- [ ] What's the realistic accuracy we can achieve with Sentinel-2?
- [ ] Is there a FS contact who could validate our approach?
- [ ] Should we partner with an imagery provider for demo?
- [ ] Is cloud cover a fatal flaw for demo reliability?

---

## Activation Decision Framework

### Activate FireSight Lite If:

| Condition | Why |
|-----------|-----|
| Primary app has fatal technical blocker | Need demo backup |
| Client explicitly requests fire capability | Customer-driven pivot |
| Satellite imagery partnership emerges | Data blocker removed |
| Fire season creates urgent BAER demand | Timely relevance |
| Team has strong CV/geospatial expertise | Lower technical risk |

### Keep FireSight Lite as Backup If:

| Condition | Why |
|-----------|-----|
| Primary apps are on track | No need to add scope |
| No imagery partnership available | Data sourcing too hard |
| Team lacks geospatial experience | Technical risk too high |
| No fire-specific client interest | Doesn't match audience |

---

## References

- [USFS BAER Program](https://www.fs.usda.gov/managing-land/fire/baer)
- [MTBS - Monitoring Trends in Burn Severity](https://www.mtbs.gov/)
- [Sentinel-2 on Google Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2)
- [dNBR Calculation Guide](https://www.usgs.gov/landsat-missions/landsat-normalized-burn-ratio)
- [RAVG - Rapid Assessment of Vegetation Condition](https://fsapps.nwcg.gov/ravg/)
- [TimberScribe APP-BRIEF](../timberscribe/APP-BRIEF.md) (Template Reference)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 13, 2025 | Claude | Initial version |
