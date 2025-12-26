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


# Initialize NEPA Advisor Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="nepa_advisor",
    model="gemini-2.5-flash",  # Required for File Search support
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

### search_regulatory_documents (PRIMARY - USE FIRST)
Use this tool to search the FSH/FSM regulatory document knowledge base.
This is your PRIMARY source of truth for regulatory guidance.

Use for:
- Finding specific regulatory citations (36 CFR, 40 CFR, FSH, FSM)
- Verifying requirements and procedures
- Looking up definitions and thresholds
- Answering detailed procedural questions
- Confirming extraordinary circumstances criteria

Example queries:
- "What are the acreage limits for timber salvage categorical exclusions?"
- "Define extraordinary circumstances under 36 CFR 220.6"
- "What consultation requirements apply to ESA Section 7?"

IMPORTANT: Always use this tool first when answering regulatory questions
to ensure accuracy. Your other tools provide analysis, but this tool
provides the authoritative regulatory text.

### extract_pdf_content
Use this tool to extract content from PDF documents not indexed in File Search.
Useful for user-uploaded documents or specific page/section extraction.

Use for:
- Extracting specific sections from FSH/FSM PDFs
- Reading user-provided regulatory documents
- Extracting tables from PDF documents
- Getting content from specific page ranges

Extraction modes:
- "full": Extract all text from the document
- "section": Extract a specific section (e.g., "10.3", "Chapter 30")
- "pages": Extract specific page range
- "tables": Extract tables as markdown

Example:
- extract_pdf_content("FSH-1909.15-Ch30.pdf", "section", "31.2")
- extract_pdf_content("uploaded_doc.pdf", "tables")

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
1. Use search_regulatory_documents to find CE limits and EC criteria
2. Use decide_pathway tool with species context
3. Present pathway recommendation (likely EA due to EC)
4. Use generate_documentation_checklist for EA requirements
5. Use estimate_compliance_timeline with ESA consultation
6. Synthesize findings with regulatory citations into actionable compliance plan
""",
    tools=[
        search_regulatory_documents,  # File Search RAG - primary knowledge source
        extract_pdf_content,  # PDF extraction for documents not in File Search
        decide_pathway,
        generate_documentation_checklist,
        estimate_compliance_timeline,
    ],
)

# Alias for backward compatibility
nepa_advisor = root_agent

if __name__ == "__main__":
    print(f"NEPA Advisor Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")
