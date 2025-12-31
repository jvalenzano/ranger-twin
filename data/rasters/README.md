# Raster Data

This folder is reserved for satellite imagery and raster data for future phases.

## Current Status: Empty (Phase 1)

Phase 1 uses MapTiler's hosted satellite and terrain tiles via API. No local rasters are required.

## Future Use (Phase 2+)

This folder will contain:
- Landsat imagery (pre/post fire comparisons)
- Sentinel-2 imagery (higher resolution)
- VIIRS thermal hotspots
- dNBR (differenced Normalized Burn Ratio) rasters
- Digital Elevation Models (DEMs)

## Data Sources

| Raster Type | Source | Resolution |
|-------------|--------|------------|
| Satellite Imagery | Landsat 8/9, Sentinel-2 | 10-30m |
| Thermal/Hotspots | VIIRS, MODIS | 375m-1km |
| Burn Severity | MTBS dNBR | 30m |
| Elevation | USGS 3DEP | 10m |

## Notes

In production, raster data would be:
- Processed in cloud (AWS/GCP)
- Served as Cloud Optimized GeoTIFFs (COG)
- Tiled and cached via MapTiler or similar

This folder is for local development and offline analysis only.

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **3DEP** | 3D Elevation Program | USGS high-resolution topographic data |
| **COG** | Cloud Optimized GeoTIFF | GeoTIFF optimized for cloud storage |
| **DEM** | Digital Elevation Model | 3D terrain representation |
| **dNBR** | Differenced Normalized Burn Ratio | Burn severity index |
| **MODIS** | Moderate Resolution Imaging Spectroradiometer | NASA satellite instrument |
| **MTBS** | Monitoring Trends in Burn Severity | Fire severity mapping program |
| **VIIRS** | Visible Infrared Imaging Radiometer Suite | Satellite thermal sensor |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
