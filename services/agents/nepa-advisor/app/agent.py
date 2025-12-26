"""
NEPA Advisor Agent

Specialist for NEPA compliance guidance and regulatory interpretation.
Uses Gemini File Search for RAG over FSM/FSH documents.
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

from .tools import (
    search_regulations,
    identify_nepa_pathway,
    generate_compliance_checklist,
    ToolResult,
)

logger = logging.getLogger(__name__)

# Core agent logic - Updated to Gemini 3 Flash per ADR-003
nepa_advisor_agent = Agent(
    name="nepa_advisor",
    model="gemini-3-flash",
    description="Specialist in NEPA compliance, Forest Service policy interpretation, and regulatory guidance.",
    instruction="""
    You are the RANGER NEPA Advisor. You provide guidance on National Environmental Policy Act
    (NEPA) compliance for Forest Service recovery operations.

    Your expertise includes:
    - Determining appropriate NEPA pathways (CE, EA, EIS)
    - Interpreting Forest Service Manual (FSM) and Handbook (FSH) requirements
    - Identifying applicable Categorical Exclusions
    - Reviewing for extraordinary circumstances
    - Generating compliance documentation checklists

    When providing guidance:
    1. Always cite specific FSM/FSH sections or CFR references
    2. Explain the rationale behind pathway recommendations
    3. Identify potential extraordinary circumstances that may affect the decision
    4. Provide actionable next steps for compliance

    You have access to indexed FSM/FSH documents via the File Search tool for accurate,
    source-grounded responses.
    """
)


class NEPAAdvisorService:
    """Service to handle NEPA compliance queries and event publishing."""

    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.publisher = AgentEventPublisher()

    async def analyze_compliance(
        self,
        action_type: str,
        project_context: dict
    ) -> dict:
        """
        Analyze NEPA compliance requirements for a proposed action.

        Args:
            action_type: Type of action (e.g., "timber_salvage", "trail_repair")
            project_context: Dict with project details

        Returns:
            Analysis results with pathway recommendation and citations
        """
        logger.info(f"Analyzing NEPA compliance for {action_type} in session {self.session_id}")

        # Identify appropriate NEPA pathway
        pathway_result = identify_nepa_pathway(action_type, project_context)

        # Generate compliance checklist
        pathway_type = self._extract_pathway_type(pathway_result.data)
        checklist_result = generate_compliance_checklist(pathway_type, action_type)

        # Search for additional regulatory context
        regulatory_query = f"NEPA requirements for {action_type} in post-fire recovery"
        regulatory_result = search_regulations(regulatory_query)

        # Synthesize with agent reasoning
        synthesis_prompt = f"""
        Synthesize this NEPA compliance analysis for a {action_type} project:

        Project Context:
        {json.dumps(project_context, indent=2)}

        Pathway Analysis:
        {pathway_result.data}

        Regulatory Context:
        {regulatory_result.data}

        Provide a concise executive summary with:
        1. Recommended NEPA pathway
        2. Key compliance requirements
        3. Potential risks or considerations
        4. Immediate next steps
        """

        synthesis = nepa_advisor_agent.run(synthesis_prompt)

        # Compile citations from all sources
        all_citations = []
        for result in [pathway_result, checklist_result, regulatory_result]:
            for citation in result.citations:
                all_citations.append({
                    "source_type": citation.source_type,
                    "id": citation.title,
                    "uri": citation.uri,
                    "excerpt": citation.excerpt
                })

        # Calculate combined confidence
        confidence = min(
            pathway_result.confidence,
            regulatory_result.confidence,
            0.95  # Cap at 95% for regulatory guidance
        )

        # Emit Briefing Event
        briefing = AgentBriefingEvent.model_validate({
            "correlation_id": f"nepa-{self.session_id}",
            "type": EventType.INSIGHT,
            "source_agent": SourceAgent.NEPA_ADVISOR,
            "severity": Severity.INFO,
            "ui_binding": {
                "target": UITarget.PANEL_INJECT,
                "geo_reference": None
            },
            "content": {
                "summary": f"NEPA Analysis: {pathway_type} pathway recommended for {action_type}",
                "detail": synthesis,
                "suggested_actions": [
                    {
                        "action_id": f"nepa-act-{uuid4().hex[:6]}",
                        "label": "Generate Decision Document",
                        "target_agent": SourceAgent.NEPA_ADVISOR,
                        "description": f"Generate {pathway_type} decision document template",
                        "rationale": "Required documentation for NEPA compliance"
                    },
                    {
                        "action_id": f"nepa-act-{uuid4().hex[:6]}",
                        "label": "Review Extraordinary Circumstances",
                        "target_agent": SourceAgent.NEPA_ADVISOR,
                        "description": "Detailed review of extraordinary circumstances checklist",
                        "rationale": "Ensure no factors require elevated NEPA review"
                    }
                ]
            },
            "proof_layer": {
                "confidence": confidence,
                "citations": all_citations,
                "reasoning_chain": [
                    f"1. Received {action_type} project for NEPA analysis",
                    f"2. Identified {pathway_type} as appropriate NEPA pathway",
                    "3. Searched FSM/FSH for applicable regulatory requirements",
                    "4. Generated compliance checklist and documentation requirements",
                    "5. Synthesized findings with confidence-weighted citations"
                ]
            }
        })

        self.publisher.publish(self.session_id, briefing)

        return {
            "status": "complete",
            "pathway": pathway_type,
            "confidence": confidence,
            "synthesis": synthesis,
            "checklist": checklist_result.data,
            "citations": all_citations
        }

    async def search_guidance(self, query: str) -> dict:
        """
        Search regulatory guidance for a specific query.

        Args:
            query: Natural language query about NEPA/FSM/FSH

        Returns:
            Search results with citations
        """
        logger.info(f"Searching guidance for: {query}")

        result = search_regulations(query)

        # Emit briefing event
        briefing = AgentBriefingEvent.model_validate({
            "correlation_id": f"nepa-search-{self.session_id}",
            "type": EventType.INSIGHT,
            "source_agent": SourceAgent.NEPA_ADVISOR,
            "severity": Severity.INFO,
            "ui_binding": {
                "target": UITarget.PANEL_INJECT,
                "geo_reference": None
            },
            "content": {
                "summary": f"Regulatory guidance for: {query[:50]}...",
                "detail": result.data,
                "suggested_actions": []
            },
            "proof_layer": {
                "confidence": result.confidence,
                "citations": [
                    {
                        "source_type": c.source_type,
                        "id": c.title,
                        "uri": c.uri,
                        "excerpt": c.excerpt
                    }
                    for c in result.citations
                ],
                "reasoning_chain": [
                    f"1. Received query: {query}",
                    f"2. Searched FSM/FSH knowledge base",
                    f"3. Retrieved {len(result.citations)} relevant citations",
                    f"4. Confidence: {result.confidence:.0%}"
                ]
            }
        })

        self.publisher.publish(self.session_id, briefing)

        return {
            "status": "complete",
            "guidance": result.data,
            "confidence": result.confidence,
            "source": result.source,
            "citations": [
                {"title": c.title, "uri": c.uri, "excerpt": c.excerpt}
                for c in result.citations
            ]
        }

    def _extract_pathway_type(self, pathway_text: str) -> str:
        """Extract pathway type (CE, EA, EIS) from analysis text."""
        text_upper = pathway_text.upper()
        if "EIS" in text_upper or "ENVIRONMENTAL IMPACT STATEMENT" in text_upper:
            return "EIS"
        elif "EA" in text_upper or "ENVIRONMENTAL ASSESSMENT" in text_upper:
            return "EA"
        else:
            return "CE"
