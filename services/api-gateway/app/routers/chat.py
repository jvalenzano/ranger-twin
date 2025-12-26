"""
Chat Router for API Gateway

Routes user queries to the Recovery Coordinator agent via Google ADK.
Implements Skills-First architecture per ADR-005.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Add agents to Python path for skill imports
AGENTS_DIR = Path(__file__).parents[4] / "agents"
sys.path.insert(0, str(AGENTS_DIR))

# Import skill scripts directly (ADK is for interactive use, we use skills directly)
COORDINATOR_SKILLS = AGENTS_DIR / "coordinator" / "skills"
TRIAGE_SCRIPTS = COORDINATOR_SKILLS / "portfolio-triage" / "scripts"
DELEGATION_SCRIPTS = COORDINATOR_SKILLS / "delegation" / "scripts"

if TRIAGE_SCRIPTS.exists():
    sys.path.insert(0, str(TRIAGE_SCRIPTS))
if DELEGATION_SCRIPTS.exists():
    sys.path.insert(0, str(DELEGATION_SCRIPTS))

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Request/Response Models ---

AgentRole = Literal[
    "recovery-coordinator",
    "burn-analyst",
    "trail-assessor",
    "cruising-assistant",
    "nepa-advisor",
]


class ChatRequest(BaseModel):
    """Chat request from frontend."""
    session_id: str = Field(description="Session identifier for context")
    query: str = Field(description="User's natural language query")
    fire_context: dict | None = Field(
        default=None,
        description="Optional fire context (name, acres, phase, etc.)"
    )


class Citation(BaseModel):
    """Source citation for response."""
    source: str
    reference: str
    url: str | None = None


class AgentResponse(BaseModel):
    """Structured agent response matching frontend contract."""
    agent_role: AgentRole = Field(alias="agentRole")
    summary: str
    reasoning: list[str]
    confidence: int = Field(ge=0, le=100)
    citations: list[Citation] = []
    recommendations: list[str] | None = None
    cascade_to: list[AgentRole] | None = Field(default=None, alias="cascadeTo")

    class Config:
        populate_by_name = True


class ChatResponse(BaseModel):
    """Chat response wrapper matching frontend QueryResponse."""
    success: bool
    response: AgentResponse | None = None
    error: str | None = None
    processing_time_ms: int | None = Field(default=None, alias="processingTimeMs")
    provider: str = "RANGER ADK Coordinator"

    class Config:
        populate_by_name = True


# --- Agent Role Mapping ---

AGENT_ROLE_MAP = {
    "coordinator": "recovery-coordinator",
    "burn-analyst": "burn-analyst",
    "trail-assessor": "trail-assessor",
    "cruising-assistant": "cruising-assistant",
    "nepa-advisor": "nepa-advisor",
}


def route_to_agent_role(target_agent: str) -> AgentRole:
    """Map delegation target to API agent role."""
    return AGENT_ROLE_MAP.get(target_agent, "recovery-coordinator")


# --- Endpoint ---

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a user query through the RANGER Coordinator.

    Uses explicit tool injection per ADR-005 and SKILL-RUNTIME-SPEC.
    In production, tools come from real MCP servers.
    In development/testing, tools come from MCPMockProvider.
    """
    import time
    from agents.coordinator.implementation import CoordinatorService
    from skill_runtime.mocking import MCPMockProvider

    start_time = time.time()

    try:
        # Fire metadata fixtures for portfolio triage
        FIRE_FIXTURES = {
            "cedar-creek": {
                "name": "Cedar Creek Fire",
                "acres": 127831,
                "containment": 100,
                "severity": "high",
                "phase": "baer_assessment"
            },
            "bootleg": {
                "name": "Bootleg Fire",
                "acres": 413765,
                "containment": 100,
                "severity": "critical",
                "phase": "in_restoration"
            },
            "mosquito": {
                "name": "Mosquito Fire",
                "acres": 76788,
                "containment": 97,
                "severity": "moderate",
                "phase": "baer_implementation"
            },
            "double-creek": {
                "name": "Double Creek Fire",
                "acres": 173394,
                "containment": 85,
                "severity": "high",
                "phase": "active"
            }
        }

        # Setup mock provider with handler for dynamic fire_id lookup
        mock = MCPMockProvider()
        mock.register(
            "mcp-nifc",
            "get_incident_metadata",
            handler=lambda fire_id, **kw: FIRE_FIXTURES.get(fire_id)
        )

        # Initialize Service with injected tools
        service = CoordinatorService(tools=mock.get_tool_context())

        # Execute Logic
        result = await service.handle_message(
            query=request.query,
            context={
                "session_id": request.session_id,
                "fire_context": request.fire_context
            }
        )
        
        # Map result to API contract
        response = AgentResponse(
            agentRole=result.get("agent_role", "recovery-coordinator"),
            summary=result.get("summary", ""),
            reasoning=result.get("reasoning", []),
            confidence=result.get("confidence", 80),
            citations=result.get("citations", []),
            cascadeTo=result.get("cascade_to")
        )

        processing_time = int((time.time() - start_time) * 1000)

        return ChatResponse(
            success=True,
            response=response,
            processingTimeMs=processing_time,
            provider="RANGER Coordinator Service (Phase 1)",
        )

    except Exception as e:
        logger.exception("Chat processing error")
        return ChatResponse(
            success=False,
            error=str(e),
            provider="RANGER Coordinator Service",
        )


def _generate_coordinator_response(query: str, routing: dict) -> str:
    """Generate coordinator response based on query type."""
    lower_query = query.lower()

    if any(word in lower_query for word in ["hello", "hi", "hey", "help"]):
        return """Welcome to RANGER Recovery Coordinator. I can help with:

**Burn Analysis** - Severity mapping, dNBR assessment, soil impacts
**Trail Assessment** - Damage inventory, bridge status, hazard trees
**Timber Salvage** - Plot prioritization, volume estimates, value assessment
**NEPA Compliance** - Pathway selection, timeline planning, documentation

What aspect of the recovery would you like to explore?"""

    if any(word in lower_query for word in ["portfolio", "prioritize", "fires", "triage"]):
        return """To prioritize your fire portfolio, I can calculate triage scores based on:

- **Severity**: Critical (4x), High (3x), Moderate (2x), Low (1x)
- **Size**: Normalized acres (capped at 500k)
- **Phase**: Active (2.0x), BAER Assessment (1.75x), Implementation (1.25x), Restoration (1.0x)

Please provide fire data or ask about a specific fire to get started."""

    # Default coordinator response
    return f"""I've analyzed your query and determined it should be handled by the Coordinator.

Query: "{query}"
Routing confidence: {routing['confidence']:.0%}

How can I assist you further?"""


def _generate_specialist_placeholder(agent: str, query: str) -> str:
    """Generate placeholder response for specialist agents."""
    agent_descriptions = {
        "burn-analyst": "Fire severity analysis, MTBS classification, soil burn severity assessment",
        "trail-assessor": "Trail damage assessment, recreation closures, infrastructure evaluation",
        "cruising-assistant": "Timber inventory, salvage estimation, FSVeg data management",
        "nepa-advisor": "NEPA compliance, environmental documentation, regulatory pathways",
    }

    desc = agent_descriptions.get(agent, "Specialist analysis")
    return f"""Your query has been routed to the **{agent.replace('-', ' ').title()}**.

Specialization: {desc}

The specialist agent will analyze your query:
"{query}"

[In Phase 2, this will invoke the full specialist agent with domain-specific skills and data access.]"""


def _get_recommendations(agent: str) -> list[str] | None:
    """Get contextual recommendations based on agent."""
    recs = {
        "coordinator": [
            "Ask about specific fires in your portfolio",
            "Request a triage prioritization",
        ],
        "burn-analyst": [
            "View burn severity map",
            "Review dNBR classification",
        ],
        "trail-assessor": [
            "Check trail closure status",
            "Review hazard tree inventory",
        ],
        "cruising-assistant": [
            "View timber plot summary",
            "Review salvage priority rankings",
        ],
        "nepa-advisor": [
            "Check CE eligibility",
            "Review compliance timeline",
        ],
    }
    return recs.get(agent)
