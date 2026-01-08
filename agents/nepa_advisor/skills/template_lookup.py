"""
Template Lookup Skill for NEPA Advisor

Provides fast, reliable access to structured regulatory templates.
Falls back to RAG when template doesn't match query.

Per ADR-005: Skills-First Multi-Agent Architecture

UPDATED: January 2, 2026 - Enhanced embedded knowledge with specific regulatory thresholds
"""

import json
from pathlib import Path
from typing import Optional

# Template data location
TEMPLATES_DIR = Path(__file__).parent.parent / "data" / "templates"


def load_templates() -> dict:
    """Load all template JSON files from the templates directory."""
    templates = {}
    if TEMPLATES_DIR.exists():
        for template_file in TEMPLATES_DIR.glob("*.json"):
            with open(template_file) as f:
                data = json.load(f)
                templates.update(data)
    return templates


def lookup_ce_checklist(
    checklist_type: str = "",
    citation: str = "",
    post_fire_only: bool = False
) -> dict:
    """
    Look up Categorical Exclusion checklist information from FSH 1909.15.
    
    Use this FIRST before RAG search for CE-related queries.
    
    Args:
        checklist_type: Type of checklist - "d" (no docs required), 
                       "e" (docs required), or "ec" (extraordinary circumstances)
        citation: Specific CFR citation to look up (e.g., "36 CFR 220.6(e)(13)")
        post_fire_only: If True, filter to only post-fire applicable categories
    
    Returns:
        dict with checklist data and source citation:
        - status: "success", "not_found", or "error"
        - source: "FSH 1909.15 Chapter 30"
        - data: checklist content
        - fallback: guidance if template lookup fails
    
    Example:
        >>> lookup_ce_checklist(checklist_type="e", post_fire_only=True)
        >>> lookup_ce_checklist(citation="36 CFR 220.6(e)(13)")
    """
    templates = load_templates()
    ce_data = templates.get("categorical_exclusion_checklists", {})
    
    if not ce_data:
        return {
            "status": "error",
            "message": "CE checklist templates not loaded",
            "fallback": "Use RAG search for FSH 1909.15 Chapter 30"
        }
    
    result = {
        "status": "success",
        "source": ce_data.get("source", "FSH 1909.15"),
        "data": {}
    }
    
    checklists = ce_data.get("checklists", {})
    
    # Look up by specific citation
    if citation:
        citation_lower = citation.lower().replace(" ", "")
        for checklist_key, checklist_data in checklists.items():
            categories = checklist_data.get("categories", checklist_data.get("items", []))
            for cat in categories:
                cat_citation = cat.get("citation", "").lower().replace(" ", "")
                if citation_lower in cat_citation or cat_citation in citation_lower:
                    result["data"] = {
                        "checklist": checklist_data.get("title"),
                        "category": cat,
                        "documentation_required": checklist_data.get("documentation_required")
                    }
                    if checklist_data.get("decision_memo_template"):
                        result["data"]["decision_memo_template"] = checklist_data["decision_memo_template"]
                    return result
        
        # Citation not found in templates
        return {
            "status": "not_found",
            "message": f"Citation {citation} not in templates",
            "fallback": "Query RAG for specific citation details"
        }
    
    # Look up by checklist type
    if checklist_type:
        type_map = {
            "documentation_not_required": "36_cfr_220.6_d",
            "d": "36_cfr_220.6_d",
            "documentation_required": "36_cfr_220.6_e",
            "e": "36_cfr_220.6_e",
            "extraordinary_circumstances": "extraordinary_circumstances",
            "ec": "extraordinary_circumstances"
        }
        
        checklist_key = type_map.get(checklist_type.lower())
        if checklist_key and checklist_key in checklists:
            checklist_data = checklists[checklist_key].copy()
            
            # Filter for post-fire if requested
            if post_fire_only and "categories" in checklist_data:
                filtered_categories = [
                    cat for cat in checklist_data["categories"]
                    if cat.get("post_fire_applicable", False)
                ]
                checklist_data["categories"] = filtered_categories
            
            result["data"] = checklist_data
            return result
    
    # Return all checklists if no specific filter
    if post_fire_only:
        # Filter all checklists for post-fire applicable items
        filtered = {}
        for key, data in checklists.items():
            if "categories" in data:
                filtered_cats = [c for c in data["categories"] if c.get("post_fire_applicable")]
                if filtered_cats:
                    filtered[key] = {**data, "categories": filtered_cats}
            else:
                filtered[key] = data
        result["data"] = filtered
    else:
        result["data"] = checklists
    
    return result


def get_decision_memo_template() -> dict:
    """
    Get the CE decision memo template structure.
    
    Returns:
        dict with required sections and guidance for CE documentation.
    """
    templates = load_templates()
    ce_data = templates.get("categorical_exclusion_checklists", {})
    checklists = ce_data.get("checklists", {})
    
    e_checklist = checklists.get("36_cfr_220.6_e", {})
    memo_template = e_checklist.get("decision_memo_template", {})
    
    if memo_template:
        return {
            "status": "success",
            "source": "FSH 1909.15 Chapter 30",
            "template": memo_template
        }
    
    return {
        "status": "not_found",
        "fallback": "Query RAG for decision memo requirements"
    }


def get_extraordinary_circumstances_checklist() -> dict:
    """
    Get the extraordinary circumstances review checklist.
    
    This checklist must be reviewed before applying any Categorical Exclusion.
    
    Returns:
        dict with EC checklist items per 36 CFR 220.6(b)
    """
    return lookup_ce_checklist(checklist_type="extraordinary_circumstances")


def lookup_template(query: str) -> dict:
    """
    Standardized template lookup for NEPA Advisor.
    
    Enhanced to return specific regulatory thresholds based on query content.
    
    Args:
        query: Search query for regulatory knowledge.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],  # Must include source, citation_key
            "template_id": str
        }
    """
    query_lower = query.lower()
    
    # =========================================================================
    # ENHANCED EMBEDDED KNOWLEDGE: Specific regulatory thresholds
    # =========================================================================
    
    # Check for timber salvage / salvage-related queries
    if any(term in query_lower for term in ["timber salvage", "salvage", "dead", "dying trees"]):
        return {
            "content": """NEPA Categorical Exclusion Thresholds for Timber Salvage (Embedded Knowledge):

**36 CFR 220.6(e)(13) - Salvage of Dead/Dying Trees:**
- Acreage limit: 250 acres maximum
- Temporary road limit: 1/2 mile
- Requires: Decision Memo documenting CE application
- Extraordinary Circumstances review required

**36 CFR 220.6(e)(6) - Timber Stand Improvement:**
- Acreage limit: 4,200 acres maximum
- May include associated salvage activities
- Requires: Decision Memo

**36 CFR 220.6(e)(11) - Post-Fire Rehabilitation:**
- Acreage limit: 4,200 acres maximum
- Applies to fire recovery activities
- Note: May be restricted per Sierra Club v. Bosworth

**Pathway Decision Logic:**
- Salvage ≤250 acres with no ECs → CE under 36 CFR 220.6(e)(13)
- Salvage 250-4,200 acres → CE under 220.6(e)(6) or 220.6(e)(11)
- Salvage >4,200 acres → Requires EA or EIS
- Any extraordinary circumstances → Requires EA minimum

**Extraordinary Circumstances to Screen:**
1. Federally listed threatened/endangered species
2. Inventoried roadless areas
3. Congressionally designated areas (Wilderness, WSR, etc.)
4. Archaeological/historic sites (NHPA Section 106)
5. Flood plains, wetlands, municipal watersheds""",
            "citations": [
                {
                    "source": "36 CFR 220.6(e)(13)",
                    "citation_key": "CFR-220.6-e-13",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "36 CFR 220.6(e)(6)",
                    "citation_key": "CFR-220.6-e-6",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "FSH 1909.15 Chapter 30",
                    "citation_key": "FSH-1909.15-CH30",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "nepa-timber-salvage-thresholds"
        }
    
    # Check for trail repair / trail-related queries
    if any(term in query_lower for term in ["trail", "recreation", "repair"]):
        return {
            "content": """NEPA Categorical Exclusion Thresholds for Trail Work (Embedded Knowledge):

**36 CFR 220.6(d)(4) - Repair/Maintenance (No Documentation Required):**
- Trail maintenance, culvert cleaning, surface grading, vegetation pruning
- No acreage limit for routine maintenance
- No Decision Memo required

**36 CFR 220.6(e)(1) - Construction/Reconstruction of Trails:**
- Requires Decision Memo
- No acreage limit specified
- Extraordinary Circumstances review required

**36 CFR 220.6(e)(20) - Restoration/Rehabilitation of Trails:**
- Applies to fire-damaged trail restoration
- No acreage limit
- Excludes: National Recreation Trails, National Scenic Trails, Wilderness trails
- Requires: Decision Memo

**Pathway Decision Logic:**
- Routine maintenance → CE under 36 CFR 220.6(d)(4), no docs required
- Reconstruction/restoration → CE under 220.6(e)(1) or 220.6(e)(20)
- Work in Wilderness or designated areas → Requires EA minimum""",
            "citations": [
                {
                    "source": "36 CFR 220.6(d)(4)",
                    "citation_key": "CFR-220.6-d-4",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "36 CFR 220.6(e)(1)",
                    "citation_key": "CFR-220.6-e-1",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "FSH 1909.15 Chapter 30",
                    "citation_key": "FSH-1909.15-CH30",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "nepa-trail-thresholds"
        }
    
    # Check for reforestation queries
    if any(term in query_lower for term in ["reforestation", "replanting", "restoration"]):
        return {
            "content": """NEPA Categorical Exclusion Thresholds for Reforestation (Embedded Knowledge):

**36 CFR 220.6(e)(6) - Timber Stand Improvement:**
- Acreage limit: 4,200 acres maximum
- Includes reforestation, tree planting, habitat improvement
- Requires: Decision Memo

**36 CFR 220.6(e)(11) - Post-Fire Rehabilitation:**
- Acreage limit: 4,200 acres maximum
- Includes replanting, erosion control, watershed restoration
- Requires: Decision Memo
- Note: May be restricted per Sierra Club v. Bosworth

**Pathway Decision Logic:**
- Reforestation ≤4,200 acres with no ECs → CE under 36 CFR 220.6(e)(6)/(e)(11)
- Reforestation >4,200 acres → Requires EA or EIS""",
            "citations": [
                {
                    "source": "36 CFR 220.6(e)(6)",
                    "citation_key": "CFR-220.6-e-6",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "36 CFR 220.6(e)(11)",
                    "citation_key": "CFR-220.6-e-11",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "nepa-reforestation-thresholds"
        }
    
    # Check for hazard tree queries
    if any(term in query_lower for term in ["hazard tree", "hazard", "roadside"]):
        return {
            "content": """NEPA Categorical Exclusion Thresholds for Hazard Tree Removal (Embedded Knowledge):

**FSM 1950 - Hazard Tree Removal:**
- Acreage limit: 3,000 acres for hazard tree removal
- Applies to roadside hazard mitigation
- Requires: Decision Memo

**36 CFR 220.6(e)(13) - Salvage of Dead/Dying Trees:**
- Acreage limit: 250 acres + 1/2 mile temporary road
- Alternative authority for smaller projects

**Pathway Decision Logic:**
- Hazard tree removal ≤250 acres → CE under 36 CFR 220.6(e)(13)
- Hazard tree removal ≤3,000 acres → CE under FSM 1950
- Hazard tree removal >3,000 acres → Requires EA""",
            "citations": [
                {
                    "source": "FSM 1950",
                    "citation_key": "FSM-1950",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "36 CFR 220.6(e)(13)",
                    "citation_key": "CFR-220.6-e-13",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "nepa-hazard-tree-thresholds"
        }
    
    # =========================================================================
    # DEFAULT: General CE checklist overview
    # =========================================================================
    
    checklist_result = lookup_ce_checklist()
    
    # Map the checklist structure to the standardized output
    if checklist_result.get("status") == "success":
        data = checklist_result.get("data", {})
        source = checklist_result.get("source", "FSH 1909.15")
        
        # Build content summary with actual threshold details
        content = "NEPA Regulatory Guidance (Embedded Knowledge):\n\n"
        
        if isinstance(data, dict):
            for key, val in data.items():
                if isinstance(val, dict) and "title" in val:
                    content += f"- {val['title']}\n"
                    # Add category details for e-type CEs
                    if "categories" in val:
                        for cat in val["categories"]:
                            limit = cat.get("limit", "No limit specified")
                            content += f"  • {cat.get('citation', '')}: {cat.get('description', '')[:60]}... (Limit: {limit})\n"
        
        content += "\n**Key Thresholds:**\n"
        content += "- 36 CFR 220.6(e)(13): Salvage up to 250 acres\n"
        content += "- 36 CFR 220.6(e)(6): Timber stand improvement up to 4,200 acres\n"
        content += "- 36 CFR 220.6(e)(11): Post-fire rehabilitation up to 4,200 acres\n"
        content += "- FSM 1950: Hazard tree removal up to 3,000 acres\n"
        
        return {
            "content": content,
            "citations": [
                {
                    "source": source,
                    "citation_key": "FSH-1909.15-CH30",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "nepa-fsh-1909.15"
        }
        
    return {
        "content": "No specific NEPA template found for this query.",
        "citations": [],
        "template_id": "none"
    }
