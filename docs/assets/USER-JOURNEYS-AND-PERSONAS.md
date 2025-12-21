# RANGER User Journeys & Personas

**Purpose**: This document maps real USFS stakeholder roles to the four lifecycle workflows in RANGER, showing how the "Agentic OS" transforms their daily work.

---

## Phase 1 Scope Note

**These user journeys describe the full vision for RANGER.** In Phase 1, we demonstrate these workflows using **simulated data** to prove the orchestration value (see `DATA-SIMULATION-STRATEGY.md`).

| Capability | Phase 1 Status | Notes |
|------------|----------------|-------|
| **Multi-agent coordination** | Real | Recovery Coordinator orchestrates all agents with correlation IDs |
| **Reasoning transparency** | Real | All agents use Gemini to generate briefings with visible logic chains |
| **Legacy system export** | Real | TRACS CSV and FSVeg XML are generated and validated |
| **Field capture apps** | Future Vision | Mobile video, voice transcription described below are not built in Phase 1 |
| **Computer vision processing** | Future Vision | Trail damage detection, species ID from bark texture are simulated |
| **Real-time satellite pulls** | Future Vision | Burn severity data uses static GeoJSON derived from MTBS |

**What Phase 1 Proves:** The personas below interact with the same UI, ask the same questions, and receive the same agent-generated insights—but the underlying data comes from static fixtures, not live sensors. This validates that the "Nervous System" UX and cross-agent coordination create value independent of the data source.

---

## The Narrative: Cedar Creek Fire Recovery (2022)

All user journeys are grounded in the **Cedar Creek Fire** (Willamette National Forest, Oregon), which burned 13,000 acres near Waldo Lake and the Pacific Crest Trail. This is our "frozen-in-time" proof-of-concept scenario.

---

## The Four Lifecycle Workflows

| Workflow | Rail Icon | Agent | Primary Persona | Data Sources |
|----------|-----------|-------|-----------------|--------------|
| **IMPACT** | 🛡️ Shield | Burn Analyst | Fire Management Officer | Sentinel-2, RAVG, MTBS |
| **DAMAGE** | 🔧 Wrench | Trail Assessor | Recreation Technician | TRACS, Mobile Video, GPX |
| **TIMBER** | 🌲 Tree | Cruising Assistant | Timber Cruiser | FSVeg, Voice Notes, Species DB |
| **COMPLIANCE** | 📋 Clipboard | NEPA Advisor | Environmental Coordinator | FSM/FSH, Draft EAs, Section 106 |

---

## Persona 1: Sarah Chen - Fire Management Officer (IMPACT)

### Role & Responsibilities
Sarah is a **Fire Management Officer (FMO)** for the McKenzie River Ranger District. Three weeks after the Cedar Creek Fire is contained, she needs to brief the District Ranger on burn severity and downstream recovery priorities.

### The Old Way (Pre-RANGER)
1. Download Sentinel-2 imagery from Copernicus Hub (requires GIS expertise)
2. Calculate dNBR in QGIS or ArcGIS (2-3 hours)
3. Manually classify severity zones
4. Email static PDF maps to the District Ranger
5. **No connection to trail damage or timber impacts**

### The RANGER Way
1. **Opens RANGER Command Console** → Clicks the **IMPACT** rail icon (🛡️ Shield)
2. **Asks the Burn Analyst**: *"Show me burn severity for Cedar Creek Fire near Waldo Lake"*
3. **Agent Response** (30 seconds):
   - 3D map with color-coded severity zones (Low/Moderate/High)
   - **Reasoning Chain** visible:
     - ✓ SENSOR DATA: "Sentinel-2 dNBR calculated from Aug 2022 (pre-fire) vs. Oct 2022 (post-fire)"
     - ✓ ANALYSIS: "Sector 4 shows dNBR > 0.6 (High Severity) intersecting Pacific Crest Trail"
     - ✓ PROTOCOL: "Recommend immediate trail assessment for erosion risk"
   - **Suggested Action**: `[Trigger Trail Assessment]`

4. **Sarah clicks the action button** → The **Recovery Coordinator** emits an `AgentBriefingEvent` with:
   - `parent_event_id`: Sarah's burn severity query
   - `correlation_id`: `cedar-creek-recovery-001`
   - `ui_binding.target`: `rail_pulse` (the DAMAGE icon starts glowing yellow)

### Data Sources Visible to Sarah
- **Sentinel-2 Imagery**: Direct link to GEE tile with acquisition date
- **RAVG Perimeter**: GeoJSON from NIFC
- **FSM 2520 (Fire Management)**: Citation for severity classification standards

---

## Persona 2: Marcus Rodriguez - Recreation Technician (DAMAGE)

### Role & Responsibilities
Marcus is a **Recreation Technician** responsible for maintaining 47 miles of trails in the Waldo Lake Wilderness. After Sarah's burn severity briefing, he receives a priority alert to assess the Pacific Crest Trail segment.

### The Old Way (Pre-RANGER)
1. Print paper TRACS forms (Trail Assessment and Condition Survey)
2. Hike the trail with a clipboard and camera
3. Manually sketch damage locations on a paper map
4. Return to office and transcribe notes into TRACS database (1999 software)
5. **No spatial link to the burn severity data**

### The RANGER Way
1. **Receives a notification** in RANGER: *"High-priority trail segment flagged by Burn Analyst"*
2. **Opens RANGER on mobile device** → The **DAMAGE** rail icon is pulsing yellow
3. **Clicks the rail icon** → Sees the map zoomed to Sector 4 with the trail highlighted
4. **Starts field capture mode**:
   - Records 3 video clips while walking the trail
   - GPS track is automatically captured
   - **Trail Assessor agent** processes video in real-time (offline-capable):
     - Detects: Bridge washout, downed log, scorched signpost
     - Generates: TRACS-compatible damage inventory

5. **Returns to office** → Opens RANGER desktop
   - **Reasoning Chain** shows:
     - ✓ VISUAL: "Computer Vision flagged yellow excavator in Zone B-Red (protected waterway buffer)"
     - ✓ COMPLIANCE: "Violates State Forestry Act Section 44.2 (Waterway Protection)"
     - ✓ ENFORCEMENT: "Issue immediate halt order and citation"
   - **Suggested Actions**:
     - `[Route Closure Authorization]` (generates TRACS work order)
     - `[Deploy UAV Swarm]` (for structural scan)

6. **Clicks "Route Closure Authorization"** → Exports a TRACS-compatible CSV that Marcus uploads to the legacy system

### Data Sources Visible to Marcus
- **Mobile Video Frames**: Timestamped thumbnails with damage detections
- **GPX Track**: Overlaid on the burn severity map from Sarah's analysis
- **TRACS Standards**: Citation to trail damage classification codes

---

## Persona 3: Elena Vasquez - Timber Cruiser (TIMBER)

### Role & Responsibilities
Elena is a **Timber Cruiser** tasked with surveying "Salvage Sale Unit 12" adjacent to the Cedar Creek burn perimeter. She needs to assess which fire-damaged trees are merchantable for salvage logging.

### The Old Way (Pre-RANGER)
1. Print FScruiser data sheets
2. Walk the unit with a DBH tape and clipboard
3. Manually record: Tree #, Species, DBH, Defect, Merchantability
4. Return to office and manually enter data into FScruiser (desktop software)
5. Export FSVeg XML for the timber sale contract
6. **No connection to NEPA compliance or trail access**

### The RANGER Way
1. **Opens RANGER** → Clicks the **TIMBER** rail icon (🌲 Tree)
2. **Sees the map** with "Salvage Sale Unit 12" highlighted (triggered by the burn severity analysis)
3. **Starts field capture mode** on mobile:
   - Records video while walking through the stand
   - Narrates: *"Plot 1, Tree 1, Douglas Fir, DBH 24 inches, slight fire scar, merchantable"*
   - **Cruising Assistant agent** processes:
     - Whisper transcription extracts structured data
     - Computer Vision confirms species from bark texture
     - Generates FSVeg-compatible XML in real-time

4. **Returns to office** → Opens RANGER desktop
   - **Reasoning Chain** shows:
     - ✓ METEO-AX: "Weather forecaster predicts heavy rain in 48 hours"
     - ✓ HYDRO-AX: "Stream gauge monitor shows rising water levels"
     - ✓ RANGER-CORE: "Forest Assessment System flags Unit 12 for erosion risk"
   - **Suggested Action**: `[Generate Citation]` (for unauthorized equipment in buffer zone)

5. **Clicks "Export FSVeg"** → Downloads XML file that she uploads to the timber sale database

### Data Sources Visible to Elena
- **Voice Transcription**: Timestamped audio clips with extracted data
- **Species Database**: Confidence scores for Douglas Fir vs. Western Hemlock
- **FSVeg Schema**: Direct mapping of her voice notes to XML fields

---

## Persona 4: Dr. James Park - Environmental Coordinator (COMPLIANCE)

### Role & Responsibilities
Dr. Park is an **Environmental Coordinator** responsible for ensuring all Cedar Creek recovery actions comply with NEPA, the Endangered Species Act, and cultural resource laws.

### The Old Way (Pre-RANGER)
1. Manually review trail repair plans (from Marcus)
2. Manually review salvage logging plans (from Elena)
3. Search through PDF copies of FSM/FSH manuals for relevant regulations
4. Draft a 50-page Environmental Assessment (EA) in Microsoft Word
5. **No automated compliance checking**

### The RANGER Way
1. **Opens RANGER** → Clicks the **COMPLIANCE** rail icon (📋 Clipboard)
2. **Sees a synthesis view** showing:
   - Trail repair actions (from Marcus)
   - Salvage logging units (from Elena)
   - Burn severity zones (from Sarah)
3. **Asks the NEPA Advisor**: *"Are there any compliance issues with the proposed salvage logging in Unit 12?"*
4. **Agent Response** (15 seconds):
   - **Reasoning Chain**:
     - ✓ VISUAL: "Computer Vision flagged yellow excavator in Zone B-Red"
     - ✓ COMPLIANCE: "Violates State Forestry Act Section 44.2 (Waterway Protection)"
     - ✓ ENFORCEMENT: "Issue immediate halt order"
   - **Citations**:
     - FSM 2520.5 (Watershed Protection)
     - Section 106 (Historic Trails near Pacific Crest Trail)
   - **Suggested Action**: `[Generate Draft EA Section]`

5. **Clicks the action** → Receives a pre-drafted EA section citing the relevant regulations

### Data Sources Visible to Dr. Park
- **FSM/FSH RAG**: Direct links to manual chapters with highlighted excerpts
- **Correlation Trace**: Shows how the compliance flag originated from Elena's timber cruise
- **Draft EA Template**: Auto-populated with project details from the other agents

---

## The "Correlation Trace" (Cross-Agent Memory)

All four personas are working on the **same recovery session** (`correlation_id: cedar-creek-recovery-001`). The UI shows this visually:

1. **Sarah (IMPACT)** identifies high severity → Triggers Marcus
2. **Marcus (DAMAGE)** flags trail closure → Informs Elena's access route
3. **Elena (TIMBER)** proposes salvage unit → Triggers Dr. Park's compliance check
4. **Dr. Park (COMPLIANCE)** identifies Section 106 issue → Loops back to Marcus for trail reroute

This is the **"Nervous System"** in action: the agents are not isolated tools; they are a coordinated crew with shared memory.

---

## Technical Implementation Notes

### Data Flow (Backend)
1. **Sarah's Query** → `BurnAnalyst` emits `AgentBriefingEvent` (type: `insight`, severity: `warning`)
2. **Recovery Coordinator** ingests event → Updates Redis session state
3. **UI observes Redis** → `DAMAGE` rail icon pulses yellow
4. **Marcus clicks rail** → `TrailAssessor` receives context from Coordinator
5. **Repeat for TIMBER and COMPLIANCE**

### UI Bindings
- **Rail Pulse**: Framer Motion animation tied to `AgentBriefingEvent.ui_binding.target`
- **Map Highlights**: GeoJSON from `AgentBriefingEvent.ui_binding.geo_reference`
- **Reasoning Chain**: Accordion component rendering `proof_layer.reasoning_chain`
- **Citations**: Inline links to `proof_layer.citations[].uri`

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to Briefing** | < 5 min (vs. 2-3 hours) | Sarah's burn severity query to actionable map |
| **Field Data Accuracy** | > 90% | Marcus's video-to-TRACS conversion vs. manual |
| **Legacy Export Fidelity** | 100% | Elena's FSVeg XML validates against USFS schema |
| **Compliance Detection** | > 95% | Dr. Park's NEPA flags vs. manual review |
| **Cross-Agent Handoffs** | 100% | All `correlation_id` traces complete without breaks |
