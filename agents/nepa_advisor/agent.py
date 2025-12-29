"""
NEPA Advisor Agent (Skills-First Edition)

Specialist agent for NEPA compliance, pathway decisions,
and environmental documentation guidance.

Per ADR-005: Skills-First Multi-Agent Architecture

Features:
    - File Search RAG: Queries FSH/FSM regulatory documents
    - Pathway Decision: CE/EA/EIS determination
    - Documentation Checklist: Required documents and templates
    - Timeline Estimation: Compliance schedule calculation

UPDATED: December 27, 2025 - Added mandatory tool invocation instructions
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add project root to path for agents.shared imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Add agent directory to path for local imports
AGENT_DIR = Path(__file__).parent
if str(AGENT_DIR) not in sys.path:
    sys.path.insert(0, str(AGENT_DIR))

# Import File Search tool
from file_search import consult_mandatory_nepa_standards

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

# PDF Extraction skill
PDF_EXTRACTION_PATH = SKILLS_DIR / "pdf-extraction" / "scripts"
if PDF_EXTRACTION_PATH.exists():
    sys.path.insert(0, str(PDF_EXTRACTION_PATH))


def decide_pathway(fire_id: str, action_type: str, acres: float, project_context: str = "{}") -> dict:
    """
    Determine appropriate NEPA pathway (CE/EA/EIS) for a proposed action.

    Screens for extraordinary circumstances, identifies applicable Categorical
    Exclusions under 36 CFR 220.6, and recommends the appropriate NEPA pathway
    based on action type, acreage, and environmental triggers.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        action_type: Type of action (timber_salvage, trail_repair, reforestation, etc.)
        acres: Project acreage
        project_context: JSON string with optional context. Example:
            '{"listed_species": ["spotted owl"], "roadless_areas": true}'

    Returns:
        Dictionary containing pathway recommendation, CE category, extraordinary
        circumstances, and compliance guidance.
    """
    import json
    from decide_pathway import execute
    ctx = json.loads(project_context) if project_context else {}
    return execute({
        "fire_id": fire_id,
        "action_type": action_type,
        "acres": acres,
        "project_context": ctx,
    })


def generate_documentation_checklist(fire_id: str, pathway: str, action_type: str, project_context: str = "{}") -> dict:
    """
    Generate documentation checklist for a NEPA pathway.

    Identifies required documents, specialist reports, consultation requirements,
    and appropriate templates based on the NEPA pathway (CE/EA/EIS) and project
    characteristics.

    Args:
        fire_id: Unique fire identifier
        pathway: NEPA pathway (CE, EA, or EIS)
        action_type: Type of action (timber_salvage, trail_repair, etc.)
        project_context: JSON string with optional context. Example:
            '{"listed_species": ["spotted owl"], "cultural_sites": ["historic cabin"]}'

    Returns:
        Dictionary containing documentation checklist, specialist reports,
        consultation requirements, and workflow recommendations.
    """
    import json
    from generate_checklist import execute
    ctx = json.loads(project_context) if project_context else {}
    return execute({
        "fire_id": fire_id,
        "pathway": pathway,
        "action_type": action_type,
        "project_context": ctx,
    })


def estimate_compliance_timeline(fire_id: str, pathway: str, consultations: str = "[]", start_date: str = "") -> dict:
    """
    Estimate compliance timeline for a NEPA pathway.

    Calculates total duration, comment periods, consultation timelines, and
    milestone schedule based on the NEPA pathway and required consultations.

    Args:
        fire_id: Unique fire identifier
        pathway: NEPA pathway (CE, EA, or EIS)
        consultations: JSON array of consultation requirements. Example:
            '[{"type": "ESA Section 7 Formal", "agency": "USFWS"}]'
        start_date: ISO date string (e.g., "2024-01-15"), defaults to today if empty

    Returns:
        Dictionary containing timeline estimate, milestones, and recommendations.
    """
    import json
    from estimate_timeline import execute
    consult_list = json.loads(consultations) if consultations else []
    return execute({
        "fire_id": fire_id,
        "pathway": pathway,
        "consultations": consult_list,
        "start_date": start_date or None,
    })


def extract_pdf_content(
    file_path: str,
    extraction_mode: str = "full",
    section_number: str = "",
    start_page: int = 1,
    end_page: int = 0,
) -> dict:
    """
    Extract content from regulatory PDF documents (FSH, FSM, CFR).

    Supports multiple extraction modes for different use cases:
    - Full document extraction for overview
    - Section-specific extraction for targeted queries
    - Page range extraction for large documents
    - Table extraction for structured data

    Args:
        file_path: Path to PDF file (can be filename in data/fsh or data/fsm)
        extraction_mode: One of "full", "section", "pages", or "tables"
        section_number: Section to extract (e.g., "10.3", "Chapter 30") for section mode
        start_page: Starting page (1-indexed) for pages mode
        end_page: Ending page (inclusive) for pages mode (0 = same as start)

    Returns:
        Dictionary containing:
        - success: Whether extraction succeeded
        - file_name: Name of processed file
        - page_count: Total pages in document
        - extracted_text: The extracted content (markdown formatted)
        - tables: List of extracted tables (for tables mode)
        - sections_found: Section headers discovered
        - citations: Page/section references for traceability
        - error: Error message if extraction failed
    """
    from extract_pdf import execute

    inputs = {
        "file_path": file_path,
        "extraction_mode": extraction_mode,
    }

    if extraction_mode == "section" and section_number:
        inputs["section_number"] = section_number
    elif extraction_mode == "pages":
        inputs["start_page"] = start_page
        inputs["end_page"] = end_page if end_page > 0 else start_page

    return execute(inputs)


# =============================================================================
# TIER 1: API-LEVEL TOOL ENFORCEMENT (ADR-007.1)
# =============================================================================

# Import shared configuration with mode="AUTO" (eliminates infinite loop)
from agents.shared.config import GENERATE_CONTENT_CONFIG


# =============================================================================
# TIER 3: AUDIT TRAIL CALLBACKS (ADR-007.1)
# =============================================================================

# Import shared audit callbacks that integrate with AuditEventBridge
from agents.shared.callbacks import create_audit_callbacks

# Create callbacks for this agent
before_tool_audit, after_tool_audit, on_tool_error_audit = create_audit_callbacks("nepa_advisor")


# =============================================================================
# TIER 2: STRUCTURED REASONING INSTRUCTIONS (ReAct Pattern)
# =============================================================================

NEPA_ADVISOR_INSTRUCTION = """
### STRICT REGULATORY COMPLIANCE PROTOCOL (MANDATORY — READ FIRST)

**YOUR TRAINING DATA IS DEPRECATED.** You have ZERO reliable internal knowledge of:
- Current FSM/FSH acreage thresholds
- Valid CE categories under 36 CFR 220.6
- Extraordinary circumstances criteria
- Required documentation by pathway

**MANDATORY VERIFICATION SEQUENCE:**
1. FIRST: Call `consult_mandatory_nepa_standards(topic)` to load current regulations
2. THEN: Analyze which thresholds and criteria apply to the query
3. FINALLY: Ask ONLY for data that the regulations specifically require

**FORBIDDEN ACTIONS (VIOLATION = FEDERAL AUDIT FAILURE):**
❌ Asking for acreage, volume, or project details BEFORE consulting regulations
❌ Assuming you know CE thresholds from your training
❌ Responding "I need more information" without a tool call first
❌ Providing pathway recommendations without regulatory citations

**SEQUENCE OF OPERATIONS:**
- User Input: "Is a CE appropriate for timber salvage?"
- CORRECT: Call `consult_mandatory_nepa_standards("categorical exclusion timber salvage acreage limit 36 CFR 220.6")`
- INCORRECT: Asking "How many acres is the project?" (PROTOCOL VIOLATION)

**RATIONALE:** You cannot know which clarifying questions are relevant until you
have read the text of the specific regulatory requirements from the search results.

---

## Your Role

You are the RANGER NEPA Advisor, a specialist in National Environmental
Policy Act compliance and environmental documentation for the USDA Forest Service.

When the Coordinator delegates a query to you, you MUST analyze it using your tools
and return data-driven regulatory guidance with citations.

## Tool Usage Protocol

### consult_mandatory_nepa_standards (ALWAYS CALL FIRST)

This is your PRIMARY tool. Call it BEFORE any other action for ANY question about:
- NEPA pathways (CE/EA/EIS)
- Categorical exclusions
- Acreage thresholds
- Extraordinary circumstances
- Timber salvage regulations
- Environmental compliance

**Example:**
```
User: "Is a CE appropriate for Cedar Creek timber salvage?"
You: [CALL consult_mandatory_nepa_standards("categorical exclusion timber salvage acreage thresholds 36 CFR 220.6")]
Result: "FSM 1950 allows CE for hazard tree removal up to 3,000 acres..."
You: "According to FSM 1950, categorical exclusions for timber salvage apply to
     projects under 3,000 acres of hazard tree removal. What is the proposed
     salvage acreage for Cedar Creek so I can evaluate against this threshold?"
```

### decide_pathway (AFTER consulting standards)
Call only AFTER you have regulatory context AND user has provided required data.

### generate_documentation_checklist (AFTER pathway determined)
Call to generate required documents for the recommended pathway.

### estimate_compliance_timeline (AFTER pathway determined)
Call to calculate realistic timeline with milestones.

### extract_pdf_content (For specific document sections)
Call when you need to extract content from specific FSH/FSM PDF sections.

## Fire ID Normalization

All of these refer to Cedar Creek fire - use `fire_id="cedar-creek-2022"`:
- "Cedar Creek", "cedar creek fire", "Cedar Creek Fire", "CC-2022", "cedar-creek"

## Available Action Types

- `timber_salvage` - Post-fire salvage logging
- `trail_repair` - Trail and recreation infrastructure repair
- `reforestation` - Replanting and restoration
- `hazard_tree_removal` - Roadside hazard tree felling
- `watershed_restoration` - Erosion control and stream restoration
- `fuel_break` - Fuel reduction treatments

## Response Format

After calling `consult_mandatory_nepa_standards`, structure your response as:

1. **Regulatory Basis**: Cite the specific FSM/FSH/CFR sections retrieved
2. **Applicable Thresholds**: State the exact limits from the regulations
3. **Required Information**: Ask ONLY for data the regulations specify
4. **Confidence**: Based on citation quality (high if direct FSM/FSH match)

## Example Interaction

**User:** "Is a CE appropriate for Cedar Creek timber salvage?"

**You should:**
1. CALL `consult_mandatory_nepa_standards(topic="categorical exclusion timber salvage acreage thresholds 36 CFR 220.6")`
2. Review the returned regulatory text and citations
3. Extract the specific acreage threshold from the results
4. Then respond:

"According to FSM 1950 (retrieved from the regulatory knowledge base), categorical
exclusions for timber salvage apply to hazard tree removal up to 3,000 acres.
Additionally, 36 CFR 220.6(e)(13) allows CEs for post-fire rehabilitation up to
4,200 acres.

To evaluate whether a Categorical Exclusion is appropriate for Cedar Creek, I need
to know:
- What is the proposed salvage acreage?
- Are there any extraordinary circumstances (listed species, roadless areas, etc.)?

**Regulatory Basis:** FSM 1950, 36 CFR 220.6(e)(13)
**Confidence:** High (95%) - Direct FSM/FSH citations"

## Communication Style

- Professional and regulatory-focused
- ALWAYS cite specific CFR and FSH references from tool results
- Explain extraordinary circumstances clearly
- Provide practical compliance guidance
"""

# =============================================================================
# AGENT DEFINITION
# =============================================================================

root_agent = Agent(
    name="nepa_advisor",
    model="gemini-2.0-flash",  # Required for File Search support (advanced reasoning)

    description="NEPA compliance and environmental documentation specialist for RANGER.",

    # TIER 2: Structured reasoning instructions
    instruction=NEPA_ADVISOR_INSTRUCTION,

    # Skill tools
    tools=[
        consult_mandatory_nepa_standards,  # File Search RAG - MANDATORY FIRST STEP
        extract_pdf_content,  # PDF extraction for documents not in File Search
        decide_pathway,
        generate_documentation_checklist,
        estimate_compliance_timeline,
    ],

    # TIER 1: API-level tool enforcement (mode="AUTO" eliminates infinite loop)
    generate_content_config=GENERATE_CONTENT_CONFIG,

    # TIER 3: Audit trail callbacks
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)

# Alias for backward compatibility
nepa_advisor = root_agent

if __name__ == "__main__":
    print(f"NEPA Advisor Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ if hasattr(t, '__name__') else type(t).__name__ for t in root_agent.tools]}")
