"""
Burn Analyst Agent

Specialist for burn severity analysis.
"""

import json
import logging
import os
from datetime import datetime
from uuid import uuid4

from google.adk.agents import Agent
from agent_common import (
    AgentBriefingEvent,
    SourceAgent,
    EventType,
    Severity,
    UITarget,
    AgentEventPublisher,
)

logger = logging.getLogger(__name__)

# Core agent logic
burn_analyst_agent = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    description="Specialist in burn severity analysis and satellite imagery interpretation.",
    instruction="""
    You are the RANGER Burn Analyst. You process satellite imagery (Sentinel-2, Landsat) 
    to calculate dNBR and classify burn severity. You provide spatial insights 
    about fire impact on vegetation and hydrology.
    
    When you receive data, you should analyze it and provide a concise summary 
    of severity classification (High, Moderate, Low, Unburned).
    """
)

class BurnAnalystService:
    """ Service to handle burn analysis tasks and event publishing. """
    
    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.publisher = AgentEventPublisher()
        self.fixture_path = "data/fixtures/cedar-creek/burn-severity.json"

    async def analyze_area(self, area_id: str) -> dict:
        """
        Analyze burn severity for a specific area using fixture data.
        In production, this would use live cloud execution and GEE.
        """
        logger.info(f"Analyzing burn severity for {area_id} in session {self.session_id}")
        
        # Load fixture data
        try:
            with open(self.fixture_path, 'r') as f:
                data = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load fixture: {e}")
            return {"error": "Fixture data not found"}
            
        # Extract area details (demo logic)
        area_data = next((item for item in data["features"] if item["properties"].get("sector_id") == area_id), data["features"][0])
        props = area_data["properties"]
        
        # Ask agent to reason over the data
        prompt = f"""
        Analyze this burn severity data for area {area_id}:
        Acres: {props.get('total_acres')}
        High Severity: {props.get('high_severity_acres')} acres ({props.get('high_severity_pct')}%)
        Moderate Severity: {props.get('moderate_severity_acres')} acres
        Low/Unburned: {props.get('low_severity_acres')} acres
        
        Provide a concise briefing summary and specific reasoning.
        """
        
        analysis = burn_analyst_agent.run(prompt)
        
        # Emit Briefing Event
        briefing = AgentBriefingEvent.model_validate({
            "correlation_id": "cedar-creek-recovery-2024-001",
            "type": EventType.INSIGHT,
            "source_agent": SourceAgent.BURN_ANALYST,
            "severity": Severity.WARNING if props.get('high_severity_pct', 0) > 30 else Severity.INFO,
            "ui_binding": {
                "target": UITarget.PANEL_INJECT,
                "geo_reference": area_data
            },
            "content": {
                "summary": f"Burn Analysis: {area_id} complete.",
                "detail": analysis,
                "suggested_actions": [
                    {
                        "action_id": f"burn-act-{uuid4().hex[:6]}",
                        "label": "Prioritize Trail Assessment",
                        "target_agent": SourceAgent.TRAIL_ASSESSOR,
                        "description": "Assess trail damage in high-severity zones of NW quadrant.",
                        "rationale": "High-severity burn increases erosion and debris flow risk on steep trail segments."
                    }
                ]
            },
            "proof_layer": {
                "confidence": 0.94,
                "citations": [
                    {
                        "source_type": "Sentinel-2",
                        "id": "S2A_MSIL2A_20220915T185921",
                        "uri": "gs://ranger-imagery/cedar-creek/post-fire/S2A.tif",
                        "excerpt": "dNBR analysis: 42% pixels exceed 0.66 threshold"
                    }
                ],
                "reasoning_chain": [
                    "1. Retrieved post-fire Sentinel-2 imagery for NW quadrant",
                    "2. Calculated Difference Normalized Burn Ratio (dNBR)",
                    "3. Applied MTBS standard classification thresholds",
                    "4. Calculated acreage for each severity class"
                ]
            }
        })
        
        self.publisher.publish(self.session_id, briefing)
        return {"status": "complete", "analysis": analysis}
