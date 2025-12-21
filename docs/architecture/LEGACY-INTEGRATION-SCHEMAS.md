# RANGER: Legacy Integration Schemas

**Status:** Authoritative
**Phase 1 Scope:** These export formats are **real deliverables**, validated against simulated inputs.

---

## Overview

This document defines the data structures required to ensure RANGER as a "Digital Wrapper" can export data compatible with USFS legacy systems.

### Phase 1 Validation Strategy

While Phase 1 uses **simulated input data** (see `DATA-SIMULATION-STRATEGY.md`), the **export logic is production-ready**. Each agent produces real, standards-compliant exports that would integrate with actual legacy systems:

| Agent | Export Format | Validation Approach |
|-------|---------------|---------------------|
| Cruising Assistant | FSVeg XML | Generated from simulated plot data; schema-validated against FSVeg spec |
| Trail Assessor | TRACS CSV | Generated from simulated damage inventory; format matches TRACS import requirements |
| Burn Analyst | BAER GeoJSON | Generated from simulated burn severity polygons; GeoJSON spec compliant |

**What's Real:** Export formatting, schema validation, file generation
**What's Simulated:** The upstream data sources that feed these exports

---

## 1. FSVeg (Timber Inventory)

The `Cruising Assistant` must export plot data compatible with the **Forest Service Vegetation (FSVeg)** system.

**Phase 1 Input Source:** Simulated plot data from `data/fixtures/cedar-creek/` (see DATA-SIMULATION-STRATEGY.md, Cruising Assistant section).

### FSVeg XML Stub (Simplified)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<FSVegExport>
  <CruiseID>CEDAR_CREEK_SALVAGE_01</CruiseID>
  <PlotRecord>
    <PlotID>47-ALPHA</PlotID>
    <GPS_Coordinates>
      <Lat>43.8923</Lat>
      <Lon>-122.1245</Lon>
    </GPS_Coordinates>
    <TreeData>
      <TreeNum>1</TreeNum>
      <SpeciesCode>PSME</SpeciesCode> <!-- Douglas Fir -->
      <DBH>24.5</DBH>
      <Mortality>80</Mortality>
      <SalvageValue>1200.00</SalvageValue>
    </TreeData>
    <TreeData>
      <TreeNum>2</TreeNum>
      <SpeciesCode>THPL</SpeciesCode> <!-- Western Red Cedar -->
      <DBH>18.2</DBH>
      <Mortality>40</Mortality>
      <SalvageValue>650.00</SalvageValue>
    </TreeData>
  </PlotRecord>
</FSVegExport>
```

## 2. TRACS (Trail Assessment)

The `Trail Assessor` must export damage inventory data compatible with the **TRACS (Trail Assessment and Conditioning surveys)** methodology.

**Phase 1 Input Source:** Simulated damage point data from `data/fixtures/cedar-creek/` (see DATA-SIMULATION-STRATEGY.md, Trail Assessor section).

### TRACS CSV Schema
| Column | Description | Sample Value |
|--------|-------------|--------------|
| `TRAIL_ID` | National Trail ID | 3536.002 |
| `MILEPOST` | Distance from start | 2.34 |
| `DAMAGE_CAT` | Damage category | WASHOUT |
| `SEVERITY` | TRACS severity code (1-5) | 4 |
| `EST_LABOR` | Estimated hours for repair | 120 |
| `EST_MATERIAL` | Estimated cost of materials | 8000 |
| `PHOTO_ID` | Reference thumb in RANGER | https://storage.gcp... |

## 3. Burn Severity (BAER Implementation)

While BAER uses RAVG/dNBR, RANGER must provide a GeoJSON export of sectors for integration with local district planners.

**Phase 1 Input Source:** Simulated burn severity polygons from `data/fixtures/cedar-creek/` (see DATA-SIMULATION-STRATEGY.md, Burn Analyst section).

### BAER Sector GeoJSON
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "sector_id": "NW-4",
        "severity": "HIGH",
        "risk_factor": "EROSION",
        "recommended_action": "SLOPE_STABILIZATION"
      },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```
