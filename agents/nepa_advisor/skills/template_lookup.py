"""
Template Lookup Skill for NEPA Advisor

Provides fast, reliable access to structured regulatory templates.
Falls back to RAG when template doesn't match query.

Per ADR-005: Skills-First Multi-Agent Architecture
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
