"""
NEPA Advisor Tools

Tools for searching regulatory content and identifying NEPA pathways
using Gemini File Search for RAG over FSM/FSH documents.
"""

import json
import logging
import os
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# Try to import google-genai for File Search
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai not available; using fallback mode")


@dataclass
class Citation:
    """A citation from a source document."""
    source_type: str
    title: str
    uri: str = ""
    excerpt: str = ""


@dataclass
class ToolResult:
    """Standard result format for NEPA Advisor tools."""
    data: str
    confidence: float
    source: str
    citations: list[Citation] = field(default_factory=list)
    reasoning: str = ""


def get_store_config() -> Optional[dict]:
    """Load File Search store configuration."""
    # Config stored in data/ directory (see scripts/setup_file_search.py)
    config_path = Path(__file__).parent.parent / "data" / ".nepa_store_config.json"

    if not config_path.exists():
        logger.warning(f"Store config not found: {config_path}")
        return None

    try:
        with open(config_path) as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load store config: {e}")
        return None


def get_genai_client():
    """Get Gemini client for File Search."""
    if not GENAI_AVAILABLE:
        return None

    return genai.Client(
        vertexai=True,
        project=os.environ.get("GOOGLE_CLOUD_PROJECT", "ranger-twin-dev"),
        location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
    )


def search_regulations(query: str) -> ToolResult:
    """
    Search FSM/FSH/CFR for relevant regulatory guidance.

    Uses Gemini File Search Tool with indexed USFS documents.
    Falls back to hardcoded responses if File Search is not configured.

    Args:
        query: Natural language query about NEPA requirements

    Returns:
        ToolResult with regulatory guidance and citations
    """
    logger.info(f"Searching regulations for: {query}")

    # Try File Search first
    config = get_store_config()
    client = get_genai_client()

    if config and client and GENAI_AVAILABLE:
        try:
            return _search_with_file_search(client, config["store_name"], query)
        except Exception as e:
            logger.error(f"File Search failed: {e}")
            logger.info("Falling back to embedded knowledge")

    # Fallback to embedded knowledge
    return _search_fallback(query)


def _search_with_file_search(client, store_name: str, query: str) -> ToolResult:
    """Execute search using Gemini File Search."""
    # Use gemini-2.5-flash until gemini-3-flash is GA (currently in preview as gemini-3-flash-preview)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""Based on the Forest Service Manual and Handbook,
        answer this regulatory question: {query}

        Include specific section numbers and direct quotes where applicable.
        Be concise but thorough.""",
        config=types.GenerateContentConfig(
            tools=[types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[store_name]
                )
            )]
        )
    )

    # Extract citations from grounding metadata
    citations = []
    grounding = response.candidates[0].grounding_metadata
    if grounding:
        for chunk in grounding.grounding_chunks:
            citations.append(Citation(
                source_type="FSM/FSH",
                title=chunk.retrieved_context.title,
                uri=chunk.retrieved_context.uri or "",
                excerpt=chunk.retrieved_context.text[:500] if chunk.retrieved_context.text else ""
            ))

    return ToolResult(
        data=response.text,
        confidence=0.92,
        source="USFS Forest Service Manual/Handbook (File Search)",
        citations=citations,
        reasoning="Retrieved from indexed FSM/FSH regulatory documents via Gemini File Search"
    )


def _search_fallback(query: str) -> ToolResult:
    """Fallback search using embedded knowledge."""
    query_lower = query.lower()

    # Embedded knowledge for common NEPA queries
    if "categorical exclusion" in query_lower or "ce" in query_lower:
        return ToolResult(
            data="""Categorical Exclusions (CEs) are categories of actions that normally do not
            individually or cumulatively have a significant effect on the human environment
            and therefore do not require preparation of an EA or EIS.

            Key CEs for post-fire recovery under 36 CFR 220.6(e):
            - (e)(6): Timber stand improvement activities
            - (e)(13): Post-fire rehabilitation activities
            - (e)(14): Repair and maintenance of roads, trails, and facilities

            Documentation requirements:
            - Project file with decision memo
            - Scoping record (if applicable)
            - Specialist reports as needed
            - Extraordinary circumstances review (FSH 1909.15, Chapter 30)""",
            confidence=0.85,
            source="Embedded FSM/FSH knowledge (File Search not configured)",
            citations=[
                Citation(
                    source_type="CFR",
                    title="36 CFR 220.6(e) - Categorical Exclusions",
                    uri="https://www.ecfr.gov/current/title-36/chapter-II/part-220",
                    excerpt="Categories of actions for which neither an EA nor an EIS is required"
                )
            ],
            reasoning="Using embedded regulatory knowledge; configure File Search for full RAG capability"
        )

    elif "salvage" in query_lower or "timber" in query_lower:
        return ToolResult(
            data="""Timber salvage operations following fire typically require NEPA review.

            Common pathways:
            1. Categorical Exclusion (CE) - For smaller salvage operations meeting 36 CFR 220.6(e)(6) criteria
            2. Environmental Assessment (EA) - Most common for moderate salvage sales
            3. Environmental Impact Statement (EIS) - Required for large or controversial operations

            Key considerations:
            - Size of affected area
            - Presence of sensitive species or habitat
            - Cumulative effects with other projects
            - Public controversy level
            - Consistency with Forest Plan

            Reference: FSH 2409.18 (Timber Sale Preparation Handbook)""",
            confidence=0.82,
            source="Embedded FSM/FSH knowledge (File Search not configured)",
            citations=[
                Citation(
                    source_type="FSH",
                    title="FSH 2409.18 - Timber Sale Preparation Handbook",
                    uri="https://www.fs.usda.gov/im/directives/fsh/2409.18/",
                    excerpt="Guidance for timber sale preparation and NEPA compliance"
                )
            ],
            reasoning="Using embedded regulatory knowledge; configure File Search for full RAG capability"
        )

    else:
        return ToolResult(
            data="""For specific NEPA guidance, please configure the File Search knowledge base
            by running the setup scripts in services/agents/nepa-advisor/scripts/.

            General NEPA process:
            1. Determine if action is covered by a Categorical Exclusion
            2. If not, prepare Environmental Assessment (EA)
            3. If significant impacts found, prepare Environmental Impact Statement (EIS)

            Key references:
            - FSM 1950: Environmental Policy and Procedures
            - FSH 1909.15: NEPA Handbook
            - 36 CFR 220: USFS NEPA Procedures (now incorporated into FSM 1950)""",
            confidence=0.70,
            source="Embedded FSM/FSH knowledge (limited)",
            citations=[
                Citation(
                    source_type="FSM",
                    title="FSM 1950 - Environmental Policy and Procedures",
                    uri="https://www.fs.usda.gov/im/directives/fsm/1900/",
                    excerpt="Forest Service environmental policy framework"
                )
            ],
            reasoning="Generic response; configure File Search for query-specific guidance"
        )


def identify_nepa_pathway(action_type: str, project_context: dict) -> ToolResult:
    """
    Identify the appropriate NEPA pathway (CE, EA, or EIS) for a proposed action.

    Args:
        action_type: Type of action (e.g., "timber_salvage", "trail_repair")
        project_context: Dict with project details (acres, location, species, etc.)

    Returns:
        ToolResult with recommended NEPA pathway and requirements
    """
    logger.info(f"Identifying NEPA pathway for: {action_type}")

    config = get_store_config()
    client = get_genai_client()

    if config and client and GENAI_AVAILABLE:
        try:
            return _identify_pathway_with_file_search(
                client, config["store_name"], action_type, project_context
            )
        except Exception as e:
            logger.error(f"File Search failed: {e}")

    # Fallback to rule-based logic
    return _identify_pathway_fallback(action_type, project_context)


def _identify_pathway_with_file_search(
    client,
    store_name: str,
    action_type: str,
    project_context: dict
) -> ToolResult:
    """Identify NEPA pathway using File Search."""
    query = f"""
    For a {action_type} project with the following context:
    {json.dumps(project_context, indent=2)}

    1. What is the appropriate NEPA pathway (Categorical Exclusion, EA, or EIS)?
    2. If CE, which specific category under 36 CFR 220.6 or FSM 1950 applies?
    3. What documentation is required?
    4. Are there any extraordinary circumstances that might require additional review?

    Cite specific FSM/FSH sections and regulatory provisions.
    """

    # Use gemini-2.5-flash until gemini-3-flash is GA
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=query,
        config=types.GenerateContentConfig(
            tools=[types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[store_name]
                )
            )]
        )
    )

    # Extract citations
    citations = []
    grounding = response.candidates[0].grounding_metadata
    if grounding:
        for chunk in grounding.grounding_chunks:
            citations.append(Citation(
                source_type="FSM/FSH/CFR",
                title=chunk.retrieved_context.title,
                uri=chunk.retrieved_context.uri or "",
                excerpt=chunk.retrieved_context.text[:500] if chunk.retrieved_context.text else ""
            ))

    return ToolResult(
        data=response.text,
        confidence=0.88,
        source="USFS NEPA Procedures (FSM 1950, FSH 1909.15)",
        citations=citations,
        reasoning=f"NEPA pathway analysis for {action_type} based on FSM 1950, FSH 1909.15"
    )


def _identify_pathway_fallback(action_type: str, project_context: dict) -> ToolResult:
    """Fallback NEPA pathway identification using rules."""
    acres = project_context.get("acres", 0)
    has_sensitive_species = project_context.get("sensitive_species", False)
    is_controversial = project_context.get("controversial", False)

    # Simple decision tree
    if is_controversial or acres > 10000:
        pathway = "EIS"
        rationale = "Large scale or controversial project requires EIS"
        confidence = 0.75
    elif has_sensitive_species or acres > 1000:
        pathway = "EA"
        rationale = "Moderate impacts require Environmental Assessment"
        confidence = 0.78
    else:
        pathway = "CE"
        rationale = "Project may qualify for Categorical Exclusion"
        confidence = 0.72

    action_ce_map = {
        "timber_salvage": "36 CFR 220.6(e)(6) - Timber stand improvement",
        "trail_repair": "36 CFR 220.6(e)(14) - Repair and maintenance of trails",
        "erosion_control": "36 CFR 220.6(e)(13) - Post-fire rehabilitation",
        "hazard_tree_removal": "36 CFR 220.6(e)(6) - Timber stand improvement",
    }

    applicable_ce = action_ce_map.get(action_type, "Review FSM 1950 for applicable categories")

    return ToolResult(
        data=f"""Recommended NEPA Pathway: {pathway}

Rationale: {rationale}

Project Details:
- Action Type: {action_type}
- Acres: {acres}
- Sensitive Species: {'Yes' if has_sensitive_species else 'No'}

{f'Potentially Applicable CE: {applicable_ce}' if pathway == 'CE' else ''}

Documentation Required:
- {'Decision Memo' if pathway == 'CE' else 'FONSI/ROD' if pathway == 'EA' else 'Record of Decision'}
- Project file with supporting analysis
- Specialist reports as needed
- Public involvement record {'(minimal)' if pathway == 'CE' else '(required)'}

Note: This is a preliminary assessment. Configure File Search for detailed regulatory guidance.""",
        confidence=confidence,
        source="Rule-based analysis (File Search not configured)",
        citations=[
            Citation(
                source_type="FSH",
                title="FSH 1909.15 - NEPA Handbook",
                uri="https://www.fs.usda.gov/im/directives/fsh/1909.15/",
                excerpt="Guidance for NEPA pathway determination"
            )
        ],
        reasoning=f"Rule-based pathway determination for {action_type}; configure File Search for enhanced analysis"
    )


def generate_compliance_checklist(pathway: str, action_type: str) -> ToolResult:
    """
    Generate a compliance checklist for the specified NEPA pathway.

    Args:
        pathway: NEPA pathway (CE, EA, or EIS)
        action_type: Type of proposed action

    Returns:
        ToolResult with compliance checklist
    """
    logger.info(f"Generating checklist for {pathway} - {action_type}")

    checklists = {
        "CE": """Categorical Exclusion Checklist:

[ ] Verify action fits within an established CE category
[ ] Document the specific CE category (cite FSM 1950 or 36 CFR 220.6)
[ ] Review for extraordinary circumstances (FSH 1909.15, Ch. 30.3)
    [ ] Federally listed species or critical habitat
    [ ] Flood plains, wetlands, or riparian areas
    [ ] Congressionally designated areas
    [ ] Inventoried roadless areas
    [ ] Research natural areas
    [ ] Native American religious or cultural sites
    [ ] Archaeological sites or historic properties
[ ] Prepare Decision Memo
[ ] Document project file
[ ] Implement project and monitor""",

        "EA": """Environmental Assessment Checklist:

[ ] Prepare Purpose and Need statement
[ ] Develop alternatives (including No Action)
[ ] Conduct environmental analysis
    [ ] Identify affected resources
    [ ] Analyze direct and indirect effects
    [ ] Analyze cumulative effects
[ ] Prepare specialist reports
[ ] Conduct public scoping (if needed)
[ ] Prepare Draft EA
[ ] Public comment period (typically 30 days)
[ ] Respond to comments
[ ] Prepare Final EA
[ ] Issue Finding of No Significant Impact (FONSI) or proceed to EIS
[ ] Document decision and implement""",

        "EIS": """Environmental Impact Statement Checklist:

[ ] Publish Notice of Intent (NOI) in Federal Register
[ ] Conduct public scoping
[ ] Identify significant issues and alternatives
[ ] Prepare Draft EIS
    [ ] Affected environment
    [ ] Environmental consequences
    [ ] Mitigation measures
[ ] EPA review and filing
[ ] Public comment period (minimum 45 days)
[ ] Prepare Final EIS
[ ] 30-day waiting period
[ ] Issue Record of Decision (ROD)
[ ] Implement decision and monitor"""
    }

    checklist = checklists.get(pathway.upper(), "Unknown pathway. Please specify CE, EA, or EIS.")

    return ToolResult(
        data=checklist,
        confidence=0.90,
        source="FSH 1909.15 NEPA Handbook",
        citations=[
            Citation(
                source_type="FSH",
                title="FSH 1909.15 - Environmental Analysis",
                uri="https://www.fs.usda.gov/im/directives/fsh/1909.15/",
                excerpt=f"Chapter {'30' if pathway == 'CE' else '40' if pathway == 'EA' else '20'}"
            )
        ],
        reasoning=f"Standard {pathway} compliance checklist from FSH 1909.15"
    )
