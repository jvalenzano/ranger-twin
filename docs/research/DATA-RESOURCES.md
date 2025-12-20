# Week 2 Data Resources: Cedar Creek Fire Scenario

To support our "Golden Thread" strategy, this resource list focuses on the specific real-world data sources needed to build the **Cedar Creek Fire (2022)** demo scenario.

## 1. FireSight Lite (The Event)
**Target:** Post-fire burn severity assessment in the Waldo Lake area.

### Fire Information & Perimeters
*   **[InciWeb: Cedar Creek Fire](https://inciweb.nwcg.gov/incident-information/orwif-cedar-creek-fire)** - Official incident page with timeline, maps, and updates.
*   **[NIFC Open Data (WIGS)](https://data-nifc.opendata.arcgis.com/)** - Source for the official "Wildfire Interagency Geospatial Services" fire perimeter. Search for "Cedar Creek 2022".
*   **[Oregon Explorer: Wildfire Risk](https://tools.oregonexplorer.info/OE_HtmlViewer/index.html?viewer=wildfire)** - Local state data on fire history and risk layers.

### Satellite Imagery & Terrain
*   **[Sentinel Hub EO Browser](https://apps.sentinel-hub.com/eo-browser/)** - Best tool to quickly visualize and download Sentinel-2 L2A imagery. Search for `43.7N, 122.0W` in **August 2022 (Pre)** and **October 2022 (Post)**.
*   **[USGS 3DEP (The National Map)](https://apps.nationalmap.gov/downloader/)** - Source for 1/3 arc-second (10m) DEMs used for slope/aspect analysis.
*   **[CIRA Satellite Library: Cedar Creek](https://satlib.cira.colostate.edu/event/cedar-creek-fire/)** - Curated GOES and VIIRS imagery specific to this event.

---

## 2. TrailScan AI (The Response)
**Target:** Assessing damage to the Pacific Crest Trail (PCT) near Waldo Lake.

### Trail Data
*   **[PCTA Trail Closures Map](https://closures.pcta.org)** - Historical closure data showing exactly where the fire closed the PCT.
*   **[USFS Enterprise Data Warehouse (EDW)](https://data.fs.usda.gov/geodata/edw/datasets.php)** - Download the official **"National Forest System Trails"** feature class (Shapefile/GeoDB).
*   **[Interactive Visitor Map](https://www.fs.usda.gov/ivm/)** - Visual reference for the Waldo Lake trail network.

### Damage References (For Synthetic Video Generation)
*   **[PCTA: Wildfire Impacts](https://www.pcta.org/discover-the-trail/backcountry-basics/fire/burn-area-safety/)** - Reference images for "hazard trees" and "tread erosion" common in burn areas.
*   **[Burned Area Emergency Response (BAER) Catalog](https://www.fs.usda.gov/naturalresources/watershed/baer/index.shtml)** - Photos and descriptions of typical post-fire infrastructure damage.

---

## 3. TimberScribe (The Recovery)
**Target:** Salvage timber cruise in Douglas Fir / Western Hemlock stands.

### Forest Inventory Data
*   **[USFS FIA DataMart](https://apps.fs.usda.gov/fia/datamart/)** - Forest Inventory and Analysis data. Great for finding typical "Trees Per Acre" and "Basal Area" stats for Willamette NF.
*   **[FSVeg Data Dictionary](https://www.fs.usda.gov/nrm/fsveg/)** - definitive guide for the schema TimberScribe must match (Species Codes, Defect Codes).
*   **[FScruiser Software](https://www.fs.usda.gov/forestmanagement/products/measurement/cruising/fscruiser/index.php)** - The current production software we are modernizing; useful for understanding the current UI/workflow.

### Biological References
*   **[Silvics of North America: Douglas-fir](https://www.srs.fs.usda.gov/pubs/misc/ag_654/volume_1/pseudotsuga/menziesii.htm)** - Reference for bark patterns and growth habits (for prompting image generation).
*   **[Western Hemlock Identification](https://www.srs.fs.usda.gov/pubs/misc/ag_654/volume_1/tsuga/heterophylla.htm)** - Key visual differentiators for the model.

---

## 4. PolicyPilot (The Decision)
**Target:** Regulatory compliance for the restoration project.

### Regulatory Corpus
*   **[USFS Directives System](https://www.fs.usda.gov/about-agency/regs-policies)** - The source of truth for **FSM** (Forest Service Manual) and **FSH** (Forest Service Handbook).
*   **[NEPA.gov](https://ceq.doe.gov/)** - Text of the National Environmental Policy Act and CEQ regulations.

### Project Documents (PALS)
*   **[USFS PALS (Planning, Appeals, and Litigation System)](https://cara.fs2c.usda.gov/Public//Home)** - Searchable database of real EAs/EISs.
    *   *Tip:* Search PALS for **"Willamette National Forest"** and **"Fire Salvage"** to find real examples of Environmental Assessments to use as templates for our synthetic "Cedar Creek EA".