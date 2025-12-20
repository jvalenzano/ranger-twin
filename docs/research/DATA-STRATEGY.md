# Data Curation Strategy: The "Golden Thread"

## Executive Summary

To ensure a cohesive user journey across the USDA Forest Service AI Demo Portfolio, we will curate a unified synthetic dataset centered on a **single narrative event**: the aftermath of a major wildfire in the Pacific Northwest.

This approach creates a "Golden Thread" that connects all agents through a **Shared Recovery Session**. Instead of disjointed data silos, the audience will see **Agentic Synthesis**: the **Burn Analyst** identifies risk, which informs the **Trail Assessor's** priorities, which creates the baseline for the **Cruising Assistant's** salvage plan, all overseen by the **Recovery Coordinator**.

## The Selected Scenario: Cedar Creek Fire Recovery

We will ground our data curation in the **Cedar Creek Fire (2022)** in the Willamette National Forest (Oregon).

**Why this location?**
- **Geography:** Quintessential PNW landscape (dense conifer forests, mountain trails).
- **Relevance:** Impacted high-value recreation areas (Waldo Lake, Pacific Crest Trail) and timber resources.
- **Data Availability:** Well-documented by satellites (Sentinel-2), extensive trail networks, and classic Douglas Fir/Hemlock stands.

---

## Application-Specific Data Plan

### 1. Burn Analyst (The Trigger Event)
**Role:** Post-fire burn severity assessment.

*   **Dataset Requirements:**
    *   **Location:** Willamette National Forest (Near Waldo Lake).
    *   **Imagery:** Sentinel-2 Satellite Imagery (L1C/L2A).
        *   *Pre-Fire:* August 2022 (Clear, smoke-free).
        *   *Post-Fire:* October 2022 (Post-containment).
    *   **Ancillary Data:**
        *   Fire Perimeter (GeoJSON from NIFC).
        *   DEM (USGS 3DEP) for slope analysis.
    *   **Synthetic Augmentation:** None needed; real satellite data is sufficient and best for "wow" factor.

### 2. Trail Assessor (The Response)
**Role:** Assessing damage to recreational infrastructure in the burn area.

*   **Dataset Requirements:**
    *   **Location:** A simulated 2-mile segment of the Pacific Crest Trail (or "Waldo Lake Trail").
    *   **Input Data:** 3-4 Mobile Video Clips (1-2 mins each).
    *   **Content to Curate/Film:**
        *   *Clip A (Erosion):* Trail tread washed out (simulated or real stock footage).
        *   *Clip B (Obstruction):* Downed log crossing the trail (very common in PNW).
        *   *Clip C (Burn Damage):* Scorched signpost or bridge railing.
    *   **Metadata:** GPS tracks (GPX files) generated to overlay exactly on the satellite map from Burn Analyst.

### 3. Cruising Assistant (The Recovery)
**Role:** Cruising timber for salvage sales or green-tree retention surveys.

*   **Dataset Requirements:**
    *   **Review:** "Salvage Sale Unit 12" (Adjacent to burn perimeter).
    *   **Input Data:** 2-3 Mobile Video Clips + Audio Narration.
    *   **Content to Curate/Film:**
        *   *Visual:* Eye-level POV walking through a Douglas Fir / Western Hemlock stand.
        *   *Audio:* Voice actor narrating: "Plot 1, tree 1, Douglas Fir, DBH 24 inches, slight fire scar, merchantable."
    *   **Key Species:** Douglas Fir (*Pseudotsuga menziesii*), Western Hemlock (*Tsuga heterophylla*).

### 4. NEPA Advisor (The Decision)
**Role:** Ensuring the recovery project complies with environmental regulations.

*   **Dataset Requirements:**
    *   **Document:** A synthetic "Cedar Creek Restoration Project Environmental Assessment (EA)".
    *   **Content to Write:**
        *   ~5-page PDF document describing the actions proposed in Step 2 (Trail repair) and Step 3 (Salvage logging).
        *   *Deliberate "Flaw":* Include a paragraph about "harvesting within 50 feet of a Class I stream" to trigger a regulatory flag during the demo.
    *   **Reference Corpus:** Standard FSM/FSH and NEPA library (already planned).

---

## Action Plan: Data Acquisition

| App | Asset | Source Strategy | Owner |
|-----|-------|-----------------|-------|
| **Burn Analyst** | Sentinel-2 Imagery | Download from Copernicus Open Access Hub (or Google Earth Engine). | TBD |
| **Trail Assessor** | Trail Videos | **Option A:** Film locally in WA/OR forests. <br>**Option B:** Purchase stock footage of "hiking POV" and "trail damage". | TBD |
| **Cruising Assistant** | Tree Videos | **Option A:** Film locally. <br>**Option B:** Stock footage of "Pacific Northwest Forest". | TBD |
| **Cruising Assistant** | Audio Narration | Record in-house using script. | Jason |
| **NEPA Advisor** | Draft EA | Write synthetic document using Gemini (prompt: "Write a USFS Environmental Assessment for..."). | Jason |
| **Common** | GIS/GPS Data | Create a master QGIS project to generate matching GPX tracks and perimeters. | TBD |

---

## Production Integration

For a detailed mapping of how these synthetic data elements translate to real-world production sources and APIs, please refer to the **[Production Data Integration Plan](DATA-INTEGRATION-PLAN.md)**.
