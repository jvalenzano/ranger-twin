"""
Tests for template lookup fallback pattern.

Validates the Template-First with RAG Fallback pattern for CE queries.
"""

import pytest
import sys
from pathlib import Path

# Add skills directory to path
SKILLS_DIR = Path(__file__).parent.parent / "skills"
sys.path.insert(0, str(SKILLS_DIR))

from template_lookup import (
    lookup_ce_checklist,
    get_decision_memo_template,
    get_extraordinary_circumstances_checklist,
    load_templates
)


class TestTemplateLoading:
    """Test template data loading."""
    
    def test_load_templates(self):
        """Test that templates load successfully."""
        templates = load_templates()
        assert "categorical_exclusion_checklists" in templates
        
    def test_template_has_source(self):
        """Test that template has source citation."""
        templates = load_templates()
        ce_data = templates.get("categorical_exclusion_checklists", {})
        assert ce_data.get("source") == "FSH 1909.15 Chapter 30"


class TestCEChecklistLookup:
    """Test CE checklist lookup functionality."""
    
    def test_lookup_by_type_documentation_required(self):
        """Test looking up CE checklist by type 'e' (documentation required)."""
        result = lookup_ce_checklist(checklist_type="e")
        assert result["status"] == "success"
        assert "36 CFR 220.6(e)" in result["data"].get("title", "")
        assert result["data"].get("documentation_required") is True
        
    def test_lookup_by_type_no_documentation(self):
        """Test looking up CE checklist by type 'd' (no documentation)."""
        result = lookup_ce_checklist(checklist_type="d")
        assert result["status"] == "success"
        assert "36 CFR 220.6(d)" in result["data"].get("title", "")
        assert result["data"].get("documentation_required") is False
    
    def test_lookup_by_citation_salvage(self):
        """Test looking up specific CFR citation for salvage."""
        result = lookup_ce_checklist(citation="36 CFR 220.6(e)(13)")
        assert result["status"] == "success"
        assert "salvage" in result["data"]["category"]["description"].lower()
        assert result["data"]["category"]["limit"] == "250 acres + 1/2 mile temporary road"
        assert result["data"]["category"]["post_fire_applicable"] is True
    
    def test_lookup_by_citation_trail_repair(self):
        """Test looking up CE for trail construction."""
        result = lookup_ce_checklist(citation="36 CFR 220.6(e)(1)")
        assert result["status"] == "success"
        assert "trail" in result["data"]["category"]["description"].lower()
    
    def test_lookup_post_fire_filter(self):
        """Test filtering for post-fire applicable CEs."""
        result = lookup_ce_checklist(checklist_type="e", post_fire_only=True)
        assert result["status"] == "success"
        categories = result["data"].get("categories", [])
        assert len(categories) > 0
        assert all(cat.get("post_fire_applicable") for cat in categories)
    
    def test_lookup_all_checklists(self):
        """Test retrieving all checklists without filters."""
        result = lookup_ce_checklist()
        assert result["status"] == "success"
        assert "36_cfr_220.6_d" in result["data"]
        assert "36_cfr_220.6_e" in result["data"]
        assert "extraordinary_circumstances" in result["data"]
    
    def test_unknown_citation_returns_not_found(self):
        """Test that unknown citations trigger 'not_found' or fallback."""
        result = lookup_ce_checklist(citation="99 CFR 999.9")
        # Either returns not_found or success with fallback message
        assert result["status"] in ["not_found", "success"]
        if result["status"] == "not_found":
            assert "fallback" in result


class TestExtraordinaryCircumstances:
    """Test extraordinary circumstances checklist."""
    
    def test_get_ec_checklist(self):
        """Test EC checklist retrieval."""
        result = get_extraordinary_circumstances_checklist()
        assert result["status"] == "success"
        items = result["data"].get("items", [])
        assert len(items) >= 7  # Should have at least 7 EC items
    
    def test_ec_checklist_has_endangered_species(self):
        """Test that EC checklist includes endangered species consideration."""
        result = get_extraordinary_circumstances_checklist()
        items = result["data"].get("items", [])
        species_found = any("endangered" in item.get("resource", "").lower() for item in items)
        assert species_found
    
    def test_ec_checklist_has_citation(self):
        """Test that EC checklist has proper citation."""
        result = get_extraordinary_circumstances_checklist()
        assert "36 CFR 220.6(b)" in result["data"].get("citation", "")


class TestDecisionMemoTemplate:
    """Test decision memo template retrieval."""
    
    def test_get_decision_memo_template(self):
        """Test decision memo template retrieval."""
        result = get_decision_memo_template()
        assert result["status"] == "success"
        assert result["source"] == "FSH 1909.15 Chapter 30"
    
    def test_decision_memo_has_required_sections(self):
        """Test that decision memo template has required sections."""
        result = get_decision_memo_template()
        sections = result["template"].get("required_sections", [])
        assert "Extraordinary Circumstances Review" in sections
        assert "Purpose and Need" in sections
        assert "Proposed Action" in sections


class TestIntegrationScenarios:
    """Test realistic query scenarios."""
    
    def test_post_fire_trail_repair_query(self):
        """Simulate: 'Show me CE options for post-fire trail repair'"""
        result = lookup_ce_checklist(checklist_type="e", post_fire_only=True)
        assert result["status"] == "success"
        
        # Should find e(1) - trail construction and e(20) - restoration
        categories = result["data"].get("categories", [])
        ids = [cat["id"] for cat in categories]
        assert "e_1" in ids or "e_20" in ids
    
    def test_salvage_logging_checklist_query(self):
        """Simulate: 'What's the CE checklist for salvage logging?'"""
        result = lookup_ce_checklist(citation="36 CFR 220.6(e)(13)")
        assert result["status"] == "success"
        assert "250 acres" in result["data"]["category"]["limit"]
        
        # Also check for decision memo template
        memo = get_decision_memo_template()
        assert memo["status"] == "success"
    
    def test_fsh_1909_15_checklist_query(self):
        """Simulate RAG-02 test: 'Show me the Categorical Exclusion checklist from FSH 1909.15'"""
        result = lookup_ce_checklist(checklist_type="e")
        assert result["status"] == "success"
        assert result["source"] == "FSH 1909.15 Chapter 30"
        
        # This is the query that was failing - should now work with templates
        assert "decision_memo_template" in result["data"]
