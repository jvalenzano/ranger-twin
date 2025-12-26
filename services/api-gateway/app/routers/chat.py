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

    Uses Skills-First architecture:
    1. Delegation skill routes query to appropriate specialist
    2. Skills generate structured responses with reasoning chains
    3. Returns response matching frontend AgentResponse contract
    """
    import time
    start_time = time.time()

    try:
        # Import delegation skill
        from route_query import execute as route_query

        # Step 1: Route the query to determine target agent
        routing_result = route_query({
            "query": request.query,
            "context": {
                "session_id": request.session_id,
                "fire": request.fire_context,
            }
        })

        target_agent = routing_result["target_agent"]
        confidence = int(routing_result["confidence"] * 100)
        reasoning = [routing_result["reasoning"]]

        # Step 2: Handle based on target agent
        if target_agent == "coordinator":
            # Check if this is a portfolio triage query
            if routing_result.get("matched_keywords"):
                triage_keywords = {"portfolio", "prioritize", "priority", "triage", "fires", "which fire"}
                if any(kw in triage_keywords for kw in routing_result["matched_keywords"]):
                    # This is a portfolio query - would invoke portfolio_triage skill
                    # For now, return routing info as the coordinator would handle it
                    summary = _generate_coordinator_response(request.query, routing_result)
                    reasoning.append("Portfolio-level query handled by Coordinator")
                else:
                    # General coordinator query (greetings, help, etc.)
                    summary = _generate_coordinator_response(request.query, routing_result)
            else:
                summary = _generate_coordinator_response(request.query, routing_result)

            agent_role = "recovery-coordinator"

        elif routing_result.get("requires_synthesis"):
            # Multi-specialist query - coordinator synthesizes
            synthesis_agents = routing_result.get("synthesis_agents", [])
            summary = (
                f"This query spans multiple domains: {', '.join(synthesis_agents)}. "
                f"I'll coordinate responses from each specialist to give you a complete picture."
            )
            reasoning.append(f"Synthesis required from: {', '.join(synthesis_agents)}")
            agent_role = "recovery-coordinator"

        else:
            # Delegate to specialist (placeholder - would invoke specialist agent)
            summary = _generate_specialist_placeholder(target_agent, request.query)
            agent_role = route_to_agent_role(target_agent)
            reasoning.append(f"Query delegated to {target_agent}")

        # Build response
        processing_time = int((time.time() - start_time) * 1000)

        return ChatResponse(
            success=True,
            response=AgentResponse(
                agentRole=agent_role,
                summary=summary,
                reasoning=reasoning,
                confidence=confidence,
                citations=[],
                recommendations=_get_recommendations(target_agent),
            ),
            processingTimeMs=processing_time,
            provider="RANGER ADK Coordinator",
        )

    except ImportError as e:
        logger.error(f"Failed to import skill: {e}")
        return ChatResponse(
            success=False,
            error=f"Skill import error: {str(e)}",
            provider="RANGER ADK Coordinator",
        )
    except Exception as e:
        logger.exception("Chat processing error")
        return ChatResponse(
            success=False,
            error=str(e),
            provider="RANGER ADK Coordinator",
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
