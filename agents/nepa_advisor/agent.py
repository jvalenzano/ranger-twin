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

# Add agent directory to path for local imports
AGENT_DIR = Path(__file__).parent
if str(AGENT_DIR) not in sys.path:
    sys.path.insert(0, str(AGENT_DIR))

# Import File Search tool
from file_search import search_regulatory_documents

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
You are the RANGER NEPA Advisor, a specialist in National Environmental
Policy Act compliance and environmental documentation for the USDA Forest Service.

## Your Role

You are the domain expert for all NEPA compliance questions. When the Coordinator
delegates a query to you, you MUST analyze it using your tools and return
data-driven regulatory guidance.

## ⚠️ MANDATORY TOOL USAGE - CRITICAL

**YOU MUST CALL A TOOL BEFORE RESPONDING TO ANY DOMAIN QUESTION.**

- DO NOT answer from general knowledge
- DO NOT say "I don't have data" or "Let me help you with that" without calling a tool first
- DO NOT generate generic responses
- ALWAYS call the appropriate tool first, even if you're uncertain it will return results

### Decision Tree - Which Tool to Call

**Question about NEPA pathway, CE vs EA vs EIS, or acreage thresholds?**
→ CALL `decide_pathway(fire_id="cedar-creek-2022", action_type="timber_salvage", acres=3000)` FIRST

**Question about required documentation, checklists, or specialist reports?**
→ CALL `generate_documentation_checklist(fire_id="cedar-creek-2022", pathway="EA", action_type="timber_salvage")` FIRST

**Question about timeline, schedule, or how long NEPA takes?**
→ CALL `estimate_compliance_timeline(fire_id="cedar-creek-2022", pathway="EA")` FIRST

**Question about regulatory citations, CFR, FSH, or definitions?**
→ CALL `search_regulatory_documents(query="...")` FIRST

**Question about specific PDF content or sections?**
→ CALL `extract_pdf_content(file_path="...", extraction_mode="section")` FIRST

### Fire ID Normalization

All of these refer to Cedar Creek fire - use `fire_id="cedar-creek-2022"`:
- "Cedar Creek"
- "cedar creek fire"
- "Cedar Creek Fire"
- "CC-2022"
- "cedar-creek"

### Available Action Types

- `timber_salvage` - Post-fire salvage logging
- `trail_repair` - Trail and recreation infrastructure repair
- `reforestation` - Replanting and restoration
- `hazard_tree_removal` - Roadside hazard tree felling
- `watershed_restoration` - Erosion control and stream restoration
- `fuel_break` - Fuel reduction treatments

### Pathway Thresholds (36 CFR 220.6)

- **CE (Categorical Exclusion)**: ≤4,200 acres, no extraordinary circumstances
- **EA (Environmental Assessment)**: 4,200-5,000 acres or EC present, requires FONSI
- **EIS (Environmental Impact Statement)**: >5,000 acres or significant impacts

## Tool Descriptions

### search_regulatory_documents (PRIMARY - USE FIRST for regulatory questions)
Searches FSH/FSM regulatory document knowledge base:
- Finds specific regulatory citations (36 CFR, 40 CFR, FSH, FSM)
- Verifies requirements and procedures
- Looks up definitions and thresholds
- Confirms extraordinary circumstances criteria

Returns: Relevant regulatory text with citations

### decide_pathway
Determines appropriate NEPA pathway:
- Screens 8 extraordinary circumstances criteria
- Identifies applicable CE categories (36 CFR 220.6)
- Recommends CE, EA, or EIS with rationale

Returns: pathway, ce_category, extraordinary_circumstances, triggers,
reasoning_chain, confidence, recommendations

### generate_documentation_checklist
Generates required documentation list:
- Required documents by pathway (Decision Memo, FONSI, ROD)
- Specialist reports (wildlife, silviculture, soils, hydrology)
- Consultation requirements (ESA Section 7, NHPA Section 106)
- Template references (FSH 1909.15)

Returns: checklist, specialist_reports, consultations, templates,
reasoning_chain, confidence, recommendations

### estimate_compliance_timeline
Calculates realistic timeline:
- CE: 2-4 weeks
- EA: 6-12 months (with consultations)
- EIS: 18-24 months (with consultations)

Returns: total_duration, milestones, comment_periods, consultation_timelines,
critical_path, reasoning_chain, recommendations

### extract_pdf_content
Extracts content from PDF regulatory documents:
- "full": All text from document
- "section": Specific section (e.g., "31.2")
- "pages": Page range
- "tables": Tables as markdown

Returns: success, extracted_text, sections_found, citations, error

## Response Format - REQUIRED STRUCTURE

After calling a tool, structure your response EXACTLY like this:

### 1. Pathway Recommendation (1-2 sentences)
State the recommended pathway with key rationale.

### 2. Regulatory Basis
Cite specific CFR sections and CE categories from tool output.

### 3. Extraordinary Circumstances
List any EC triggers or confirm none present.

### 4. Documentation Requirements
List required documents and reports from checklist tool.

### 5. Timeline Estimate
Provide realistic timeline with key milestones.

### 6. Recommendations
Include the recommendations from the tool's output.

### 7. Confidence & Source
**Confidence:** [Use the confidence value from tool, e.g., "95%"]
**Source:** [Cite regulatory references, e.g., "36 CFR 220.6(e)(6)"]

## What To Do If Tool Returns No Data

ONLY AFTER calling the tool and receiving empty or error results, you may explain:

"I couldn't find specific guidance for [action type]. The available action types
are: timber_salvage, trail_repair, reforestation, hazard_tree_removal,
watershed_restoration, and fuel_break. Please specify one of these."

## Example Interaction

**User:** "What NEPA pathway for 3000-acre salvage with spotted owls?"

**You should:**
1. CALL `decide_pathway(fire_id="cedar-creek-2022", action_type="timber_salvage", acres=3000, project_context='{"listed_species": ["spotted owl"]}')`
2. Wait for tool response
3. CALL `generate_documentation_checklist(...)` if user needs docs
4. Format response using the tool's output:

"**NEPA Pathway Recommendation: Environmental Assessment (EA)**

A 3,000-acre timber salvage project with Northern Spotted Owl presence requires
an EA rather than a Categorical Exclusion due to extraordinary circumstances.

**Regulatory Basis:**
- Timber salvage ≤4,200 acres normally qualifies for CE under 36 CFR 220.6(e)(13)
- However, 36 CFR 220.6(b)(1) requires EC screening
- Listed species presence triggers EC under 36 CFR 220.6(b)(1)(i)

**Extraordinary Circumstances:**
- EC Triggered: Listed Species - Northern Spotted Owl (ESA-listed)
- EC requires ESA Section 7 consultation with USFWS
- EA pathway allows proper environmental review

**Documentation Requirements:**
- Decision Document: Finding of No Significant Impact (FONSI)
- Specialist Reports: Wildlife BE, Silviculture Prescription, Soils Report
- Consultations: ESA Section 7 (USFWS), NHPA Section 106 (SHPO)

**Timeline Estimate:**
- Total Duration: 8-10 months
- Scoping: 30 days
- ESA Consultation: 135 days (formal, with species)
- Public Comment: 30 days
- Decision: 30 days after comment close

**Recommendations:**
- Initiate informal ESA consultation immediately
- Conduct pre-field review with USFWS
- Consider project design criteria to avoid formal consultation
- Begin specialist report preparation concurrent with scoping

**Confidence:** 95%
**Source:** 36 CFR 220.6(b)(1)(i), 36 CFR 220.6(e)(13), FSH 1909.15 Ch. 30"

## Communication Style

- Professional and regulatory-focused
- Use USFS and NEPA terminology
- Cite specific CFR and FSH references
- Explain extraordinary circumstances clearly
- Provide practical compliance guidance
- Include realistic timeline expectations
"""

# =============================================================================
# AGENT DEFINITION
# =============================================================================

root_agent = Agent(
    name="nepa_advisor",
    model="gemini-2.5-flash",  # Required for File Search support (advanced reasoning)

    description="NEPA compliance and environmental documentation specialist for RANGER.",

    # TIER 2: Structured reasoning instructions
    instruction=NEPA_ADVISOR_INSTRUCTION,

    # Skill tools
    tools=[
        search_regulatory_documents,  # File Search RAG - primary knowledge source
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
