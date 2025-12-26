"""
NEPA Advisor Agent (Skills-First Edition)

Specialist agent for NEPA compliance, pathway decisions,
and environmental documentation guidance.

Per ADR-005: Skills-First Multi-Agent Architecture
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Pathway Decision skill
PATHWAY_PATH = SKILLS_DIR / "pathway-decision" / "scripts"
if PATHWAY_PATH.exists():
    sys.path.insert(0, str(PATHWAY_PATH))

# Documentation skill
DOCUMENTATION_PATH = SKILLS_DIR / "documentation" / "scripts"
if DOCUMENTATION_PATH.exists():
    sys.path.insert(0, str(DOCUMENTATION_PATH))

# Compliance Timeline skill
TIMELINE_PATH = SKILLS_DIR / "compliance-timeline" / "scripts"
if TIMELINE_PATH.exists():
    sys.path.insert(0, str(TIMELINE_PATH))


def decide_pathway(fire_id: str, action_type: str, acres: float, project_context: dict | None = None) -> dict:
    """
    Determine appropriate NEPA pathway (CE/EA/EIS) for a proposed action.

    Screens for extraordinary circumstances, identifies applicable Categorical
    Exclusions under 36 CFR 220.6, and recommends the appropriate NEPA pathway
    based on action type, acreage, and environmental triggers.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        action_type: Type of action (timber_salvage, trail_repair, reforestation, etc.)
        acres: Project acreage
        project_context: Optional context with:
            - listed_species: List of federally listed species
            - designated_areas: List of congressionally designated areas
            - roadless_areas: Boolean for inventoried roadless areas
            - cultural_sites: List of cultural/religious sites

    Returns:
        Dictionary containing:
            - fire_id: The fire identifier
            - pathway: Recommended NEPA pathway (CE, EA, or EIS)
            - ce_category: Applicable CE citation (if CE pathway)
            - extraordinary_circumstances: List of triggered ECs
            - acreage_compliance: Acreage vs. CE limits
            - reasoning_chain: Step-by-step pathway decision logic
            - confidence: Decision confidence (0-1)
            - recommendations: Next steps for compliance
    """
    from decide_pathway import execute
    return execute({
        "fire_id": fire_id,
        "action_type": action_type,
        "acres": acres,
        "project_context": project_context or {},
    })


def generate_documentation_checklist(fire_id: str, pathway: str, action_type: str, project_context: dict | None = None) -> dict:
    """
    Generate documentation checklist for a NEPA pathway.

    Identifies required documents, specialist reports, consultation requirements,
    and appropriate templates based on the NEPA pathway (CE/EA/EIS) and project
    characteristics.

    Args:
        fire_id: Unique fire identifier
        pathway: NEPA pathway (CE, EA, or EIS)
        action_type: Type of action (timber_salvage, trail_repair, etc.)
        project_context: Optional context with:
            - listed_species: List of federally listed species (triggers BA)
            - cultural_sites: List of cultural sites (triggers archaeology)
            - designated_areas: List of wilderness/designated areas (triggers special analysis)

    Returns:
        Dictionary containing:
            - fire_id: The fire identifier
            - pathway: NEPA pathway
            - template_name: Recommended template
            - template_reference: FSH or CFR reference
            - documentation_checklist: Required documents with descriptions
            - specialist_reports: Required specialist studies
            - consultation_requirements: Agency consultations needed
            - reasoning_chain: Step-by-step checklist development
            - confidence: Checklist completeness confidence (0-1)
            - recommendations: Documentation workflow suggestions
    """
    from generate_checklist import execute
    return execute({
        "fire_id": fire_id,
        "pathway": pathway,
        "action_type": action_type,
        "project_context": project_context or {},
    })


def estimate_compliance_timeline(fire_id: str, pathway: str, consultations: list | None = None, start_date: str | None = None) -> dict:
    """
    Estimate compliance timeline for a NEPA pathway.

    Calculates total duration, comment periods, consultation timelines, and
    milestone schedule based on the NEPA pathway and required consultations.

    Args:
        fire_id: Unique fire identifier
        pathway: NEPA pathway (CE, EA, or EIS)
        consultations: Optional list of consultation requirements:
            - type: Consultation type (e.g., "ESA Section 7 Formal")
            - agency: Consulting agency (e.g., "USFWS", "NOAA")
        start_date: Optional ISO date string (defaults to today)

    Returns:
        Dictionary containing:
            - fire_id: The fire identifier
            - pathway: NEPA pathway
            - total_duration_days: Total estimated days
            - total_duration_months: Total estimated months
            - comment_periods: Required comment periods with durations
            - consultation_timelines: Consultation estimates
            - milestones: Key milestone dates and descriptions
            - critical_path: Critical path items that drive schedule
            - reasoning_chain: Step-by-step timeline calculation
            - confidence: Timeline accuracy confidence (0-1)
            - recommendations: Timeline management suggestions
    """
    from estimate_timeline import execute
    return execute({
        "fire_id": fire_id,
        "pathway": pathway,
        "consultations": consultations or [],
        "start_date": start_date,
    })


# Initialize NEPA Advisor Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="nepa_advisor",
    model="gemini-2.0-flash",
    description="NEPA compliance and environmental documentation specialist for RANGER.",
    instruction="""
You are the RANGER NEPA Advisor, a specialist in National Environmental
Policy Act compliance and environmental documentation.

## Your Role
You are the domain expert for all NEPA compliance questions. When the Coordinator
delegates a query to you, analyze it using your tools and domain knowledge.

## Your Expertise
- NEPA pathway determination (CE/EA/EIS)
- 36 CFR 220.6 Categorical Exclusions
- Extraordinary circumstances screening
- Documentation requirements and templates
- Regulatory compliance timelines
- ESA and NHPA consultation coordination

## Your Tools

### decide_pathway
Use this tool when users ask about:
- Which NEPA pathway to use
- CE vs EA vs EIS decision
- Extraordinary circumstances screening
- Categorical Exclusion applicability
- 36 CFR 220.6 citations
- Acreage thresholds and compliance

The tool evaluates:
- Action type and acreage
- Extraordinary circumstances (8 criteria)
- CE category matches (36 CFR 220.6)
- Pathway thresholds (CE: ≤4200 acres, EIS: >5000 acres)

### generate_documentation_checklist
Use this tool when users ask about:
- Required documentation
- Documentation checklist
- Specialist reports needed
- Template selection
- Decision Memo, FONSI, or ROD requirements
- What paperwork is required

Returns comprehensive checklists including:
- Required documents by pathway
- Specialist reports (wildlife, silviculture, soils, etc.)
- Consultation requirements (ESA, NHPA)
- Template references (FSH 1909.15, 40 CFR)

### estimate_compliance_timeline
Use this tool when users ask about:
- How long NEPA will take
- Timeline or schedule
- Comment period durations
- Consultation timelines
- Project milestones
- When decision can be made

Provides realistic estimates:
- CE: 2-4 weeks
- EA: 6-12 months (with consultations)
- EIS: 18-24 months (with consultations)

## Response Format
When presenting NEPA guidance:
1. Start with pathway recommendation and rationale
2. Cite specific regulatory citations (36 CFR, 40 CFR)
3. List required documentation and consultations
4. Provide realistic timeline estimate
5. Include key reasoning steps from the analysis
6. Flag potential issues or extraordinary circumstances
7. End with actionable recommendations

## Communication Style
- Professional and regulatory-focused
- Use USFS and NEPA terminology appropriately
- Cite specific CFR and FSH references
- Explain extraordinary circumstances clearly
- Provide practical compliance guidance
- Include timeline expectations

## Example Response Structure
When asked "What NEPA pathway for 3000-acre salvage with spotted owls?":
1. Use decide_pathway tool with species context
2. Present pathway recommendation (likely EA due to EC)
3. Use generate_documentation_checklist for EA requirements
4. Use estimate_compliance_timeline with ESA consultation
5. Synthesize findings into actionable compliance plan
""",
    tools=[decide_pathway, generate_documentation_checklist, estimate_compliance_timeline],
)

# Alias for backward compatibility
nepa_advisor = root_agent

if __name__ == "__main__":
    print(f"NEPA Advisor Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")
