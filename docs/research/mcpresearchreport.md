# MCP Research Report: RANGER Connectivity Strategy

**Version:** 1.0
**Date:** December 25, 2025
**Status:** Recommendations for Implementation

---

## Executive Summary

To support the Skills-First architecture of RANGER, we evaluated the existing Model Context Protocol (MCP) ecosystem. Our goal is to minimize custom development for generic data (weather, geospatial) while focusing our limited resources on high-value, domain-specific wrappers (NIFC, USFS-internal).

### Strategic Recommendation: Hybrid "Leverage & Wrap"
We should **leverage** existing MCP servers for industry-standard data and **wrap** specific federal APIs where no MCP currently exists.

---

## 1. Available MCP Servers (Leverage)

The following MCP servers already exist and can be integrated with minimal effort:

| Domain | Recommended MCP | Details |
|--------|-----------------|---------|
| **Geospatial** | **Google Earth Engine MCP** | Access to satellite imagery, dNBR calculations, and temporal analysis. |
| **GIS Services** | **ArcGIS Location Services** | Geocoding, elevation data, and find-nearby-place capabilities. |
| **Weather** | **Open-Meteo MCP** | Real-time weather, historical data, and forecasts (Global). |
| **Web Search** | **Firecrawl / Glama** | Enables agents to search for recent fire news or public bulletins. |
| **Data Ops** | **Filesystem / SQLite** | Core ADK capabilities for local state and fixture access. |

---

## 2. Gaps & Custom MCPs (Build)

The following domain-critical data sources lack public MCP servers and will require us to build "thin wrappers":

### A. NIFC Wildfire Data (`mcp/nifc`)
- **Data Source:** NIFC ArcGIS Online / Enterprise Geospatial Portal (EGP).
- **Function:** Real-time fire perimeters, incident metadata, and active hotshots.
- **Strategy:** Build a thin MCP server that wraps the NIFC REST APIs.

### B. Local Fixture Server (`mcp/fixtures`)
- **Data Source:** Local JSON fixtures (Cedar Creek, Bootleg).
- **Function:** Provides deterministic data for development and testing.
- **Strategy:** Build a simple MCP server that serves the `data/fixtures/` directory.

### C. USFS Domain Data (`mcp/forest-service`)
- **Data Source:** FSVeg, TRACS, and BAER databases.
- **Function:** Access to historical recovery records and internal reporting.
- **Strategy:** Long-term build; starts as manual exports in Phase 1.

---

## 3. Buy vs. Build Analysis

| Factor | Leveraging Existing (Buy/Leverage) | Building Custom (Wrap) |
|--------|------------------------------------|------------------------|
| **Speed** | **High** (Plug and play) | **Medium** (1-3 days per server) |
| **Maintenance** | **Low** (Community supported) | **High** (We own the code) |
| **Domain Depth** | **Low** (Generic data) | **High** (NIFC/FS specific) |
| **Reliability** | **Variable** (External dependency) | **High** (Local control) |

**Decision:**
- Use **Existing** for: Satellite, Weather, Maps.
- Use **Custom** for: Fire Perimeters, Recovery Workflows, Fixtures.

---

## 4. Implementation Path

1.  **Immediate (Phase 0-1):**
    -   Configure `agents/` to use official **FileSystem** and **Google Earth Engine** MCPs.
    -   Implement the `mcp/fixtures` server to unlock Phase 1 development.
2.  **Short-Term (Phase 2):**
    -   Implement the `mcp/nifc` wrapper to replace static fire data.
3.  **Mid-Term (Phase 3+):**
    -   Expand to `mcp/weather` using NOAA-specific alerts if Open-Meteo is insufficient.

---

## References

- [MCP Catalog (Glama)](https://glama.ai/mcp)
- [Awesome MCP Servers List](https://github.com/punkpeye/awesome-mcp-servers)
- [NIFC Open Data Portal](https://data-nifc.opendata.arcgis.com/)
