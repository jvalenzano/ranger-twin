# RANGER System Architecture & Wireframe

**Purpose**: This document provides a comprehensive system map showing how user journeys translate to UI components, backend services, and data integrations.

> **Phase 1 Note:** This document describes the complete RANGER architecture. For Phase 1, data sources are simulated per `DATA-SIMULATION-STRATEGY.md`. Agent tools shown (e.g., `calculate_dnbr`, `process_trail_video`) receive static fixture data in Phase 1, not live API calls. The interfaces remain the same; only the data source changes.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RANGER COMMAND CONSOLE (Frontend)               │
│                                                                      │
│  ┌──────────┐  ┌──────────────────────────────┐  ┌──────────────┐  │
│  │Lifecycle │  │   3D Map Viewport            │  │Agent Synapse │  │
│  │   Rail   │  │   (Leaflet + Tactical        │  │    Panel     │  │
│  │          │  │    Overlays)                 │  │              │  │
│  │ 🛡️ IMPACT│  │                              │  │ Reasoning    │  │
│  │ 🔧 DAMAGE│  │  • Markers (GeoJSON)         │  │ Chain        │  │
│  │ 🌲 TIMBER│  │  • Severity Zones            │  │              │  │
│  │ 📋 COMPLY│  │  • Trail Overlays            │  │ Citations    │  │
│  │          │  │  • Nerve Filaments           │  │              │  │
│  │          │  │                              │  │ Suggested    │  │
│  │          │  │                              │  │ Actions      │  │
│  └──────────┘  └──────────────────────────────┘  └──────────────┘  │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           │ WebSocket (Real-time events)
                           │ REST API (Queries)
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                           │
│                                                                      │
│  • /api/query (POST) - User queries to agents                       │
│  • /api/events (WebSocket) - AgentBriefingEvent stream              │
│  • /api/export/{format} (GET) - Legacy format downloads             │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌───────────────────┐
│ RECOVERY          │              │ REDIS SESSION     │
│ COORDINATOR       │◄────────────►│ STATE STORE       │
│ (Root LlmAgent)   │              │                   │
│                   │              │ • active_fire     │
│ • Gemini 2.0 Flash│              │ • events[]        │
│ • ADK Coordinator │              │ • priorities[]    │
│ • Dispatcher      │              │ • spatial_focus   │
└─────────┬─────────┘              └───────────────────┘
          │
          │ transfer_to_agent()
          │
    ┌─────┴─────┬─────────┬─────────┐
    │           │         │         │
    ▼           ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ BURN   │ │ TRAIL  │ │CRUISING│ │ NEPA   │
│ANALYST │ │ASSESSOR│ │ASSIST. │ │ADVISOR │
│        │ │        │ │        │ │        │
│Gemini  │ │Gemini  │ │Gemini  │ │Gemini  │
│2.0 Flash│ │2.0 Flash│ │2.0 Flash│ │2.0 Flash│
└────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
     │          │          │          │
     │          │          │          │
     │ Tools    │ Tools    │ Tools    │ Tools
     │          │          │          │
     ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│                                                             │
│ **Phase 1: Simulated via fixtures**                        │
│ • Google Earth Engine (Sentinel-2, RAVG, MTBS)             │
│ • NIFC Fire Perimeters (GeoJSON API)                       │
│ • USGS 3DEP (DEM/Terrain)                                  │
│ • FSM/FSH RAG (Vector DB - Pinecone/Chroma)                │
│ • Species Database (PostgreSQL)                            │
│                                                             │
│ **Available in Phase 1:**                                   │
│ • Legacy Export Templates (FSVeg XML, TRACS CSV)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Map

### 1. Lifecycle Rail (Left Sidebar)

**Component**: `LifecycleRail.tsx`

```
┌─────────────────┐
│  RANGER         │
│  🌲 Logo        │
├─────────────────┤
│                 │
│  [🛡️]  IMPACT   │ ← Persona: Sarah (FMO)
│                 │   Agent: Burn Analyst
│                 │   State: pulse (green/yellow/red)
├─────────────────┤
│                 │
│  [🔧]  DAMAGE   │ ← Persona: Marcus (Rec Tech)
│                 │   Agent: Trail Assessor
│                 │   State: pulse (triggered by IMPACT)
├─────────────────┤
│                 │
│  [🌲]  TIMBER   │ ← Persona: Elena (Timber Cruiser)
│                 │   Agent: Cruising Assistant
│                 │   State: pulse (triggered by DAMAGE)
├─────────────────┤
│                 │
│  [📋]  COMPLY   │ ← Persona: Dr. Park (Env Coord)
│                 │   Agent: NEPA Advisor
│                 │   State: pulse (triggered by TIMBER)
└─────────────────┘
```

**Props**:
```typescript
interface LifecycleRailProps {
  activeWorkflow: 'impact' | 'damage' | 'timber' | 'compliance';
  pulseStates: {
    impact: 'idle' | 'sensing' | 'action_required' | 'critical';
    damage: 'idle' | 'sensing' | 'action_required' | 'critical';
    timber: 'idle' | 'sensing' | 'action_required' | 'critical';
    compliance: 'idle' | 'sensing' | 'action_required' | 'critical';
  };
  onWorkflowClick: (workflow: string) => void;
}
```

**Data Source**: 
- `pulseStates` updated by WebSocket listening to `AgentBriefingEvent.ui_binding.target === 'rail_pulse'`

---

### 2. Map Viewport (Center)

**Component**: `MapViewport.tsx`

```
┌───────────────────────────────────────────────────────────┐
│  LAT/LONG: 43.8923°N, 122.1245°W    GRID_REF: T-884-ZULU │
├───────────────────────────────────────────────────────────┤
│                                                           │
│         [Leaflet Dark Basemap]                            │
│                                                           │
│              🔴 ← Tactical Marker (Pulsing)               │
│              │                                            │
│              │ Nerve Filament (SVG Path)                  │
│         ┌────┴────┐                                       │
│         │SEC-04   │ ← Popup Label                         │
│         │Bridge   │   (sector_id + coordinates)           │
│         └─────────┘                                       │
│                                                           │
│                                                           │
│   [Tactical Grid Overlay - opacity 0.03]                 │
│   [Vignette Effect]                                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface MapViewportProps {
  events: AgentBriefingEvent[]; // From WebSocket
  selectedEventId: string | null;
  onMarkerClick: (eventId: string) => void;
  center: [number, number]; // Updated by active workflow
  zoom: number;
}
```

**Data Sources**:
- **Basemap**: CartoDB Dark Matter tiles
- **Markers**: `AgentBriefingEvent.ui_binding.geo_reference` (GeoJSON)
- **Severity Zones**: Burn Analyst outputs (GeoJSON polygons)
- **Trail Overlays**: Trail Assessor GPX tracks converted to GeoJSON

---

### 3. Agent Synapse Panel (Right Sidebar)

**Component**: `AgentSynapsePanel.tsx`

```
┌─────────────────────────────────────────────────────────┐
│  🧠 AGENT SYNAPSE              1 ACTIVE SIGNALS         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Bridge Washout Alert              [CRITICAL]      │ │
│  │                                                    │ │
│  │ Critical structural failure detected at Sector 4  │ │
│  │ Bridge due to flash flood surge.                  │ │
│  │                                                    │ │
│  │ AGT-HYDRO-01 • 01:42 AM                           │ │
│  │                                                    │ │
│  │ ┌─ REASONING LOGIC ─────────────────────────────┐ │ │
│  │ │                                                │ │ │
│  │ │ 🔵 SENSOR DATA                                 │ │ │
│  │ │    Water level sensors at S4-Bridge recorded   │ │ │
│  │ │    +12ft surge in 15 mins.                     │ │ │
│  │ │    [View Sensor Log ↗]                         │ │ │
│  │ │                                                │ │ │
│  │ │ 🟡 ANALYSIS                                    │ │ │
│  │ │    Velocity exceeds pier shear strength        │ │ │
│  │ │    ratings. Satellite SAR confirms             │ │ │
│  │ │    displacement.                               │ │ │
│  │ │    [View SAR Imagery ↗]                        │ │ │
│  │ │                                                │ │ │
│  │ │ 🟢 PROTOCOL                                    │ │ │
│  │ │    Immediate route closure. Deploy drone for   │ │ │
│  │ │    structural scan.                            │ │ │
│  │ │    [FSM 7709.55 ↗]                             │ │ │
│  │ └────────────────────────────────────────────────┘ │ │
│  │                                                    │ │
│  │ SUGGESTED ACTIONS                                  │ │
│  │                                                    │ │
│  │ ▶ [Route Closure Authorization]                   │ │
│  │ ▶ [Deploy UAV Swarm]                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  [🔗 SHOW CORRELATION]  ← Trace parent events          │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface AgentSynapsePanelProps {
  selectedEvent: AgentBriefingEvent | null;
  onActionClick: (actionId: string) => void;
  onCitationClick: (citation: Citation) => void;
  onCorrelationView: () => void;
}
```

**Data Source**:
- `AgentBriefingEvent` from WebSocket
- `proof_layer.reasoning_chain` for the accordion
- `proof_layer.citations` for inline links
- `content.suggested_actions` for action buttons

---

## Backend Service Map

### 1. Recovery Coordinator (Root Agent)

**Service**: `services/agents/recovery-coordinator/`

**Responsibilities**:
- Receives user queries from API Gateway
- Dispatches to appropriate sub-agent using ADK `transfer_to_agent()`
- Maintains Redis session state
- Emits synthesized `AgentBriefingEvent` objects

**Key Functions**:
```python
async def handle_query(query: str, session_id: str) -> AgentBriefingEvent:
    # 1. Determine intent (which agent to route to)
    # 2. Call sub-agent via ADK
    # 3. Synthesize response
    # 4. Update Redis state
    # 5. Emit AgentBriefingEvent
    pass

async def emit_cross_agent_trigger(
    parent_event_id: str,
    correlation_id: str,
    target_agent: str
) -> None:
    # Proactive handoff logic
    pass
```

**Data Sources**:
- Redis (session state)
- Sub-agent responses

---

### 2. Burn Analyst (Sub-Agent)

**Service**: `services/agents/burn-analyst/`

**Persona**: Sarah Chen (Fire Management Officer)

**Tools**:
```python
@tool
def calculate_dnbr(fire_id: str, pre_date: str, post_date: str) -> dict:
    """Calculate dNBR from Sentinel-2 imagery via Google Earth Engine

    Phase 1: Returns static fixture data from data/fixtures/cedar-creek/
    Future: Live GEE API integration
    """
    # Returns: severity zones (GeoJSON), confidence, metadata
    pass

@tool
def get_fire_perimeter(fire_id: str) -> dict:
    """Fetch fire perimeter from NIFC API

    Phase 1: Returns static GeoJSON fixture
    Future: Live NIFC API call
    """
    pass
```

**Output Example**:
```json
{
  "schema_version": "1.0.0",
  "event_id": "evt-001",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-001",
  "type": "insight",
  "source_agent": "burn_analyst",
  "severity": "warning",
  "ui_binding": {
    "target": "map_highlight",
    "geo_reference": {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [...] },
      "properties": { "label": "High Severity - Sector 4" }
    }
  },
  "content": {
    "summary": "Sector 4 shows dNBR > 0.6 (High Severity) intersecting Pacific Crest Trail",
    "detail": "Sentinel-2 analysis from Aug 2022 to Oct 2022 shows severe vegetation loss...",
    "suggested_actions": [
      {
        "action_id": "trigger-trail-assessment",
        "label": "Trigger Trail Assessment",
        "target_agent": "trail_assessor",
        "description": "Prioritize PCT segment for damage survey",
        "rationale": "High erosion risk due to burn severity"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.94,
    "citations": [
      {
        "source_type": "Sentinel-2",
        "id": "S2A_MSIL2A_20221015T185921",
        "uri": "https://earthengine.google.com/...",
        "excerpt": "dNBR: 0.67 (High Severity)"
      }
    ],
    "reasoning_chain": [
      "Calculated dNBR from pre-fire (Aug 2022) and post-fire (Oct 2022) imagery",
      "Identified Sector 4 with dNBR > 0.6",
      "Cross-referenced with trail layer - found PCT intersection",
      "Applied FSM 2520 severity classification"
    ]
  }
}
```

**Data Sources**:
- **Phase 1**: Static GeoJSON fixtures derived from MTBS Cedar Creek data
- **Future**: Google Earth Engine (Sentinel-2), NIFC Fire Perimeters API, RAVG/MTBS (live)

---

### 3. Trail Assessor (Sub-Agent)

**Service**: `services/agents/trail-assessor/`

**Persona**: Marcus Rodriguez (Recreation Technician)

**Tools**:
```python
@tool
def process_trail_video(video_path: str, gps_track: str) -> dict:
    """Process mobile video for damage detection

    Phase 1: Receives simulated damage JSON (no video processing)
    Future: YOLOv8 for object detection from actual video
    """
    # Returns: damage inventory (TRACS-compatible)
    pass

@tool
def generate_tracs_export(damage_inventory: dict) -> str:
    """Generate TRACS CSV export

    Phase 1: Functional - generates real CSV from simulated data
    """
    pass
```

**Output Example**:
```json
{
  "event_id": "evt-002",
  "parent_event_id": "evt-001",
  "correlation_id": "cedar-creek-recovery-001",
  "type": "action_required",
  "source_agent": "trail_assessor",
  "severity": "critical",
  "ui_binding": {
    "target": "rail_pulse",
    "geo_reference": {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-122.1245, 43.8923] },
      "properties": { "label": "SEC-04-BRIDGE" }
    }
  },
  "content": {
    "summary": "Bridge washout detected at Sector 4 Bridge",
    "suggested_actions": [
      {
        "action_id": "route-closure",
        "label": "Route Closure Authorization",
        "target_agent": null,
        "description": "Generate TRACS work order for trail closure"
      }
    ]
  },
  "proof_layer": {
    "citations": [
      {
        "source_type": "Mobile Video",
        "id": "trail-vid-001",
        "uri": "gs://ranger-data/videos/trail-001.mp4",
        "excerpt": "Frame 145: Bridge deck missing"
      }
    ]
  }
}
```

**Data Sources**:
- **Phase 1**: Static JSON simulating detected damage (no actual video processing)
- **Future**: Mobile video uploads (Cloud Storage), GPX tracks (GPS data)
- **Available in Phase 1**: TRACS standards (CSV templates)

---

### 4. Cruising Assistant (Sub-Agent)

**Service**: `services/agents/cruising-assistant/`

**Persona**: Elena Vasquez (Timber Cruiser)

**Tools**:
```python
@tool
def transcribe_cruise_audio(audio_path: str) -> dict:
    """Transcribe voice notes using Whisper

    Phase 1: Receives simulated plot JSON (no audio transcription)
    Future: Whisper API for audio-to-text conversion
    """
    pass

@tool
def identify_species(image_path: str) -> dict:
    """Identify tree species from bark texture

    Phase 1: Species data included in simulated plot JSON
    Future: Computer vision for species identification
    """
    pass

@tool
def generate_fsveg_xml(cruise_data: dict) -> str:
    """Generate FSVeg-compatible XML

    Phase 1: Functional - generates real XML from simulated data
    """
    pass
```

**Data Sources**:
- **Phase 1**: Static JSON simulating timber plot data
- **Future**: Voice recordings (Cloud Storage), Species database (PostgreSQL)
- **Available in Phase 1**: FSVeg schema templates

---

### 5. NEPA Advisor (Sub-Agent)

**Service**: `services/agents/nepa-advisor/`

**Persona**: Dr. James Park (Environmental Coordinator)

**Tools**:
```python
@tool
def query_fsm_fsh(query: str) -> dict:
    """Query Forest Service Manual/Handbook via RAG

    Phase 1: Limited FSM/FSH corpus (select chapters only)
    Future: Complete FSM/FSH with PALS integration
    """
    # Uses Pinecone/Chroma vector DB
    pass

@tool
def check_compliance(action_plan: dict) -> dict:
    """Check proposed actions against regulations

    Phase 1: Basic rule checking against limited corpus
    Future: Comprehensive compliance checking
    """
    pass

@tool
def generate_ea_section(topic: str, context: dict) -> str:
    """Generate draft EA section

    Phase 1: Functional with limited regulatory references
    Future: Full EA generation with complete regulatory context
    """
    pass
```

**Data Sources**:
- **Phase 1**: Limited FSM/FSH corpus (select chapters for timber salvage, NEPA basics)
- **Future**: Complete FSM/FSH Vector DB (Pinecone), Section 106 database, PALS integration
- **Available in Phase 1**: Draft EA templates

---

## Data Flow: Complete User Journey

### Scenario: Sarah (FMO) → Marcus (Rec Tech)

```
1. Sarah opens RANGER
   ↓
2. Clicks IMPACT rail icon (🛡️)
   ↓
3. UI sends query to API Gateway:
   POST /api/query
   {
     "query": "Show burn severity for Cedar Creek",
     "session_id": "session-001",
     "agent": "burn_analyst"
   }
   ↓
4. API Gateway → Recovery Coordinator
   ↓
5. Recovery Coordinator → Burn Analyst (via ADK)
   ↓
6. Burn Analyst:
   - Calls calculate_dnbr() tool
   - Queries Google Earth Engine
   - Generates AgentBriefingEvent
   ↓
7. Recovery Coordinator:
   - Receives event
   - Updates Redis: ranger:session:001:events
   - Emits event via WebSocket
   ↓
8. UI receives event via WebSocket:
   - Map highlights Sector 4 (geo_reference)
   - Agent Synapse Panel shows reasoning chain
   - "Trigger Trail Assessment" button appears
   ↓
9. Sarah clicks "Trigger Trail Assessment"
   ↓
10. UI sends action to API Gateway:
    POST /api/action
    {
      "action_id": "trigger-trail-assessment",
      "parent_event_id": "evt-001",
      "correlation_id": "cedar-creek-recovery-001"
    }
    ↓
11. Recovery Coordinator:
    - Creates new event with parent_event_id
    - Updates Redis priorities
    - Emits event targeting DAMAGE rail
    ↓
12. UI receives event:
    - DAMAGE rail icon (🔧) pulses yellow
    - Marcus sees notification on mobile
    ↓
13. Marcus clicks DAMAGE rail
    - Map zooms to Sector 4
    - Trail segment highlighted
    - "Start Field Capture" button appears
```

---

## WebSocket Event Stream

**Endpoint**:
- **Phase 1**: `ws://localhost:8000/events` (local development)
- **Future**: `wss://api.ranger.usfs.gov/events` (production)

**Message Format**:
```json
{
  "type": "agent_briefing_event",
  "payload": { ...AgentBriefingEvent }
}
```

**UI Subscription**:
```typescript
// Phase 1: localhost, Future: production URL
const ws = new WebSocket('ws://localhost:8000/events');

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  
  if (type === 'agent_briefing_event') {
    // Update UI based on ui_binding.target
    switch (payload.ui_binding.target) {
      case 'rail_pulse':
        updateRailPulse(payload.source_agent, payload.severity);
        break;
      case 'map_highlight':
        addMapMarker(payload.ui_binding.geo_reference);
        break;
      case 'panel_inject':
        showAgentSynapse(payload);
        break;
    }
  }
};
```

---

## Success Metrics & Monitoring

| Metric | Target | Measurement Point |
|--------|--------|-------------------|
| **Event Latency** | < 2s | API Gateway → WebSocket → UI |
| **Agent Response Time** | < 30s | User query → AgentBriefingEvent |
| **Cross-Agent Handoff** | 100% | `parent_event_id` linkage verified |
| **Citation Accuracy** | > 95% | Manual review of `proof_layer.citations` |
| **Legacy Export Validity** | 100% | FSVeg XML / TRACS CSV schema validation |
