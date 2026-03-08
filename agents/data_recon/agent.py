"""
Data Reconnaissance Coordinator Agent

Root orchestrator for the RANGER Data Recon team. Coordinates five
specialist recon agents to probe, document, and assess public wildfire
data sources for integration into the RANGER platform.

Specialist Team:
    - nifc_recon: NIFC Open Data (fire perimeters, ArcGIS REST)
    - firms_recon: NASA FIRMS (active fire detection, satellite sensors)
    - mtbs_recon: MTBS (historical burn severity, dNBR)
    - usgs_recon: USGS (3DEP elevation, NHD hydrology, boundaries)
    - osm_recon: OpenStreetMap (trails, roads, infrastructure via Overpass)

Per ADR-005: Skills-First Multi-Agent Architecture
Pattern: AgentTool wrappers (coordinator retains control)
"""

import sys
from pathlib import Path

from google.adk.agents import Agent
from google.adk.tools import AgentTool

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Add sub_agents to path for imports
SUB_AGENTS_DIR = Path(__file__).parent / "sub_agents"
if str(SUB_AGENTS_DIR) not in sys.path:
    sys.path.insert(0, str(SUB_AGENTS_DIR))

# Import specialist recon agents
from nifc_recon.agent import root_agent as nifc_recon
from firms_recon.agent import root_agent as firms_recon
from mtbs_recon.agent import root_agent as mtbs_recon
from usgs_recon.agent import root_agent as usgs_recon
from osm_recon.agent import root_agent as osm_recon

# Wrap specialists as AgentTools (coordinator retains control)
nifc_recon_tool = AgentTool(agent=nifc_recon)
firms_recon_tool = AgentTool(agent=firms_recon)
mtbs_recon_tool = AgentTool(agent=mtbs_recon)
usgs_recon_tool = AgentTool(agent=usgs_recon)
osm_recon_tool = AgentTool(agent=osm_recon)

# Import shared configuration
from agents._shared.config import GENERATE_CONTENT_CONFIG
from agents._shared.callbacks import create_audit_callbacks

before_cb, after_cb, error_cb = create_audit_callbacks("data_recon_coordinator")


# =============================================================================
# AGENT DEFINITION
# =============================================================================

DATA_RECON_INSTRUCTION = """
You are the RANGER Data Reconnaissance Coordinator, responsible for
orchestrating a team of specialist agents that probe public wildfire
data sources and document what's available for RANGER integration.

## Your Team

You coordinate five specialist reconnaissance agents:

1. **nifc_recon** - NIFC Open Data (National Interagency Fire Center)
   - Fire perimeters, boundaries, incident attributes
   - ArcGIS REST services (no auth required)
   - Updates every 5-15 minutes
   - PRIORITY: HIGH

2. **firms_recon** - NASA FIRMS (Fire Information for Resource Management)
   - Active fire hotspot detections from VIIRS/MODIS/Landsat
   - Free API key required
   - Near real-time (3 hour latency, <1 min for US)
   - PRIORITY: HIGH

3. **mtbs_recon** - MTBS (Monitoring Trends in Burn Severity)
   - Historical burn severity from Landsat (30m resolution)
   - dNBR classifications, fire perimeters since 1984
   - Annual updates (1-2 year lag)
   - PRIORITY: MEDIUM

4. **usgs_recon** - USGS Services
   - 3DEP elevation (DEM for slope/erosion risk)
   - NHD hydrology (watersheds for BAER)
   - Transportation (access roads)
   - Government boundaries (jurisdictions for NEPA)
   - PRIORITY: MEDIUM

5. **osm_recon** - OpenStreetMap / Overpass API
   - Trail network data
   - Forest roads and access routes
   - Infrastructure (bridges, trailheads, campgrounds)
   - PRIORITY: MEDIUM

## Reconnaissance Protocol

### Full Reconnaissance
When asked to run a "full recon" or "data source reconnaissance":
1. Call ALL FIVE specialists sequentially
2. Compile a unified intelligence report
3. Rank data sources by integration priority
4. Identify gaps and risks

### Targeted Reconnaissance
When asked about a specific data source:
1. Call the appropriate specialist
2. Report findings with integration recommendations

### Assessment Criteria

For each data source, evaluate:
- **Accessibility**: Auth requirements, rate limits, reliability
- **Data Quality**: Field completeness, update frequency, coverage
- **RANGER Relevance**: Which agents/skills benefit from this data
- **Integration Effort**: API complexity, data format, schema mapping
- **Cost**: Free vs. paid, infrastructure requirements

## Response Format

After gathering specialist reports, synthesize into:

### Data Source Intelligence Report

**1. High-Priority Sources (Immediate Integration)**
- Source name, status, key findings, recommended next steps

**2. Medium-Priority Sources (Phase 2)**
- Source name, status, key findings, planned approach

**3. Data Gaps & Risks**
- What data is missing or unreliable
- Workarounds and alternatives

**4. Integration Roadmap**
- Recommended order of implementation
- Dependencies between data sources
- Estimated effort for each integration

## Reference Area

All probes should use the Cedar Creek Fire (2022) area as the test region:
- Bounding Box (NIFC/FIRMS): -122.5,43.5,-121.5,44.5
- Bounding Box (Overpass): 43.5,-122.5,44.5,-121.5
- State: Oregon (OR)
- Forest: Willamette National Forest
"""

root_agent = Agent(
    name="data_recon_coordinator",
    model="gemini-2.0-flash",
    description="Root orchestrator for RANGER data source reconnaissance team.",
    instruction=DATA_RECON_INSTRUCTION,
    tools=[
        nifc_recon_tool,
        firms_recon_tool,
        mtbs_recon_tool,
        usgs_recon_tool,
        osm_recon_tool,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

# Alias for convenience
data_recon_coordinator = root_agent

if __name__ == "__main__":
    print(f"Data Recon Coordinator '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Team Members:")
    for tool in root_agent.tools:
        agent = tool.agent if hasattr(tool, 'agent') else None
        if agent:
            print(f"  - {agent.name}: {agent.description}")
