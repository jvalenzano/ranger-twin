"""
Recovery Coordinator Agent

The root orchestrator for the RANGER platform, using the Google ADK.
"""

import os
import logging
from typing import List, Optional

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

# Specialist agent placeholders for Phase 1
# These will be replaced by real agents as they are implemented

burn_analyst = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    description="Specialist in burn severity analysis and satellite imagery interpretation.",
    instruction="""
    You are the RANGER Burn Analyst. You process satellite imagery (Sentinel-2, Landsat) 
    to calculate dNBR and classify burn severity. You provide spatial insights 
    about fire impact on vegetation and hydrology.
    """
)

trail_assessor = Agent(
    name="trail_assessor",
    model="gemini-2.0-flash",
    description="Specialist in trail damage assessment and repair prioritization.",
    instruction="""
    You are the RANGER Trail Assessor. You process field damage reports (images, video, GPS)
    to classify trail damage, estimate repair costs, and identify visitor safety hazards.
    """
)

cruising_assistant = Agent(
    name="cruising_assistant",
    model="gemini-2.0-flash",
    description="Specialist in timber inventory and salvage sale preparation.",
    instruction="""
    You are the RANGER Cruising Assistant. You process timber cruise data to estimate 
    merchantable volume, assess salvage value, and generate FSVeg-compatible exports.
    """
)

nepa_advisor = Agent(
    name="nepa_advisor",
    model="gemini-2.0-flash",
    description="Specialist in NEPA compliance and Forest Service regulations.",
    instruction="""
    You are the RANGER NEPA Advisor. You provide guidance on environmental 
    compliance (CE, EA, EIS) and cite relevant sections of the FSM/FSH.
    """
)

# Root Recovery Coordinator
recovery_coordinator = Agent(
    name="recovery_coordinator",
    model="gemini-2.0-flash",
    description="Root orchestrator for RANGER. Synthesizes lifecycle insights.",
    instruction="""
    You are the RANGER Recovery Coordinator. Your job is to:
    1. Determine if a query should be handled by a specialist agent.
    2. Delegate specific tasks to the appropriate sub_agent.
    3. Synthesize responses when queries require information from multiple specialists.
    4. Provide high-level platform overviews and summaries.
    
    SPECIALISTS:
    - burn_analyst: Burn severity, satellite imagery, dNBR.
    - trail_assessor: Trail damage, field capture, work orders.
    - cruising_assistant: Timber inventory, species ID, cruising.
    - nepa_advisor: NEPA, compliance, regulations.
    
    Always maintain a professional, mission-focused tone. Provide grounding 
    for your summaries by referencing the source agents.
    """,
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor]
)


class CoordinatorService:
    """ Service to manage coordinator interactions and event publishing. """
    
    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.publisher = AgentEventPublisher()

    async def chat(self, user_query: str) -> str:
        """ Process a user query through the coordinator. """
        logger.info(f"Processing query for session {self.session_id}: {user_query}")
        
        # In a real ADK implementation, this would trigger the agent loop
        # For Phase 1, we simulate the synthesis and emit a briefing event
        
        response = recovery_coordinator.run(user_query)
        
        # After getting response, create a briefing event for the UI
        briefing = AgentBriefingEvent.model_validate({
            "correlation_id": "cedar-creek-recovery-2024-001", # Should be session-linked
            "type": EventType.INSIGHT,
            "source_agent": SourceAgent.RECOVERY_COORDINATOR,
            "severity": Severity.INFO,
            "ui_binding": {
                "target": UITarget.PANEL_INJECT,
            },
            "content": {
                "summary": f"Coordinator: {user_query[:50]}...",
                "detail": response,
                "suggested_actions": []
            },
            "proof_layer": {
                "confidence": 0.95,
                "reasoning_chain": [
                    "User query received",
                    "Coordinator evaluated delegation",
                    "Response synthesized from agent crew"
                ]
            }
        })
        
        self.publisher.publish(self.session_id, briefing)
        return response
