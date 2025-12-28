"""
Tests for Documentation skill.

Tests cover:
- skill.md structure and content
- Documentation requirements resources
- Template selection
- Specialist report identification
- Consultation requirements
- Full checklist generation
- Edge cases and error handling
"""

import json
import sys
from pathlib import Path

import pytest


# Path to skill directory
SKILL_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = SKILL_DIR / "scripts"
RESOURCES_DIR = SKILL_DIR / "resources"

# Add scripts directory to path for imports
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


# =============================================================================
# Skill Structure Tests
# =============================================================================

class TestSkillStructure:
    """Test skill.md structure and required sections."""

    def test_skill_md_exists(self):
        """Skill definition file should exist."""
        skill_md = SKILL_DIR / "skill.md"
        assert skill_md.exists()

    def test_skill_md_has_required_sections(self):
        """Skill definition should have all required sections."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        required_sections = [
            "# Documentation",
            "## Description",
            "## Triggers",
            "## Instructions",
            "## Inputs",
            "## Outputs",
        ]

        for section in required_sections:
            assert section in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "documentation_checklist",
            "specialist_reports",
            "template_name",
            "consultation_requirements",
        ]

        for output in expected_outputs:
            assert output in content


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_documentation_requirements_exists(self):
        """Documentation requirements resource should exist."""
        doc_req = RESOURCES_DIR / "documentation-requirements.json"
        assert doc_req.exists()

    def test_documentation_requirements_valid_json(self):
        """Documentation requirements should be valid JSON."""
        doc_req = RESOURCES_DIR / "documentation-requirements.json"
        with open(doc_req) as f:
            data = json.load(f)

        assert "CE" in data
        assert "EA" in data
        assert "EIS" in data

    def test_ce_requirements_complete(self):
        """CE requirements should include Decision Memo."""
        doc_req = RESOURCES_DIR / "documentation-requirements.json"
        with open(doc_req) as f:
            data = json.load(f)

        ce = data["CE"]
        assert ce["decision_document"] == "Decision Memo"
        assert "required_documents" in ce
        assert any(d["document"] == "Decision Memo" for d in ce["required_documents"])

    def test_ea_requirements_complete(self):
        """EA requirements should include EA and FONSI."""
        doc_req = RESOURCES_DIR / "documentation-requirements.json"
        with open(doc_req) as f:
            data = json.load(f)

        ea = data["EA"]
        assert "FONSI" in ea["decision_document"]
        docs = [d["document"] for d in ea["required_documents"]]
        assert "Environmental Assessment" in docs
        assert any("FONSI" in d for d in docs)

    def test_eis_requirements_complete(self):
        """EIS requirements should include NOI, Draft/Final EIS, ROD."""
        doc_req = RESOURCES_DIR / "documentation-requirements.json"
        with open(doc_req) as f:
            data = json.load(f)

        eis = data["EIS"]
        assert "ROD" in eis["decision_document"]
        docs = [d["document"] for d in eis["required_documents"]]
        assert any("NOI" in d for d in docs)
        assert "Draft EIS" in docs
        assert "Final EIS" in docs
        assert any("ROD" in d for d in docs)

    def test_templates_exists(self):
        """Templates resource should exist."""
        templates = RESOURCES_DIR / "templates.json"
        assert templates.exists()

    def test_templates_valid_json(self):
        """Templates should be valid JSON."""
        templates = RESOURCES_DIR / "templates.json"
        with open(templates) as f:
            data = json.load(f)

        assert "CE" in data
        assert "EA" in data
        assert "EIS" in data

    def test_ce_template_has_sections(self):
        """CE template should define sections."""
        templates = RESOURCES_DIR / "templates.json"
        with open(templates) as f:
            data = json.load(f)

        ce = data["CE"]
        assert "sections" in ce
        assert "Background" in ce["sections"]
        assert "Decision" in ce["sections"]

    def test_specialist_reports_exists(self):
        """Specialist reports resource should exist."""
        reports = RESOURCES_DIR / "specialist-reports.json"
        assert reports.exists()

    def test_specialist_reports_valid_json(self):
        """Specialist reports should be valid JSON."""
        reports = RESOURCES_DIR / "specialist-reports.json"
        with open(reports) as f:
            data = json.load(f)

        assert "disciplines" in data
        assert "action_type_mapping" in data

    def test_action_type_mapping_complete(self):
        """Action type mapping should include common actions."""
        reports = RESOURCES_DIR / "specialist-reports.json"
        with open(reports) as f:
            data = json.load(f)

        mapping = data["action_type_mapping"]
        assert "timber_salvage" in mapping
        assert "trail_repair" in mapping
        assert "reforestation" in mapping


# =============================================================================
# Template Selection Tests
# =============================================================================

class TestTemplateSelection:
    """Test template selection logic."""

    @pytest.fixture
    def select_template(self):
        """Import template selection function."""
        from generate_checklist import select_template
        return select_template

    def test_ce_template_selection(self, select_template):
        """CE pathway should select Decision Memo template."""
        name, ref = select_template("CE")

        assert "Decision Memo" in name
        assert "FSH 1909.15" in ref

    def test_ea_template_selection(self, select_template):
        """EA pathway should select EA template."""
        name, ref = select_template("EA")

        assert "Environmental Assessment" in name
        assert "FSH 1909.15" in ref

    def test_eis_template_selection(self, select_template):
        """EIS pathway should select EIS template."""
        name, ref = select_template("EIS")

        assert "Environmental Impact Statement" in name
        assert "40 CFR 1502" in ref or "FSH 1909.15" in ref


# =============================================================================
# Specialist Report Identification Tests
# =============================================================================

class TestSpecialistReports:
    """Test specialist report identification."""

    @pytest.fixture
    def identify_reports(self):
        """Import specialist report function."""
        from generate_checklist import identify_specialist_reports
        return identify_specialist_reports

    def test_timber_salvage_requires_silviculture(self, identify_reports):
        """Timber salvage should require silviculture report."""
        reports = identify_reports("timber_salvage", {})

        disciplines = [r["discipline"] for r in reports]
        assert "Silviculture" in disciplines

    def test_trail_repair_requires_engineering(self, identify_reports):
        """Trail repair should require engineering report."""
        reports = identify_reports("trail_repair", {})

        disciplines = [r["discipline"] for r in reports]
        assert "Engineering" in disciplines

    def test_listed_species_triggers_wildlife_ba(self, identify_reports):
        """Listed species should trigger Wildlife Biology BA."""
        context = {
            "listed_species": ["Northern Spotted Owl"]
        }
        reports = identify_reports("timber_salvage", context)

        wildlife_reports = [r for r in reports if r["discipline"] == "Wildlife Biology"]
        assert len(wildlife_reports) > 0
        assert wildlife_reports[0]["report_type"] == "Biological Assessment"

    def test_cultural_sites_trigger_archaeology(self, identify_reports):
        """Cultural sites should trigger archaeology report."""
        context = {
            "cultural_sites": ["Sacred Site"]
        }
        reports = identify_reports("road_construction", context)

        disciplines = [r["discipline"] for r in reports]
        assert "Archaeology" in disciplines

    def test_wilderness_triggers_recreation(self, identify_reports):
        """Wilderness areas should trigger recreation analysis."""
        context = {
            "designated_areas": ["Waldo Lake Wilderness"]
        }
        reports = identify_reports("timber_salvage", context)

        rec_reports = [r for r in reports if r["discipline"] == "Recreation"]
        assert len(rec_reports) > 0
        assert "Wilderness" in rec_reports[0]["report_type"]

    def test_aquatic_species_trigger_fisheries(self, identify_reports):
        """Aquatic species should trigger fisheries report."""
        context = {
            "listed_species": ["Bull Trout"]
        }
        reports = identify_reports("road_construction", context)

        disciplines = [r["discipline"] for r in reports]
        assert "Fisheries Biology" in disciplines


# =============================================================================
# Consultation Identification Tests
# =============================================================================

class TestConsultations:
    """Test consultation requirement identification."""

    @pytest.fixture
    def identify_consultations(self):
        """Import consultation function."""
        from generate_checklist import identify_consultations
        return identify_consultations

    def test_no_triggers_no_consultations(self, identify_consultations):
        """Empty context should require no consultations."""
        consults = identify_consultations({})

        assert len(consults) == 0

    def test_listed_species_triggers_esa(self, identify_consultations):
        """Listed species should trigger ESA consultation."""
        context = {
            "listed_species": ["Northern Spotted Owl"]
        }
        consults = identify_consultations(context)

        assert len(consults) > 0
        assert any("ESA Section 7" in c["consultation_type"] for c in consults)

    def test_aquatic_species_trigger_noaa(self, identify_consultations):
        """Aquatic species should trigger NOAA consultation."""
        context = {
            "listed_species": ["Bull Trout"]
        }
        consults = identify_consultations(context)

        agencies = [c["agency"] for c in consults]
        assert "NOAA Fisheries" in agencies

    def test_cultural_sites_trigger_nhpa(self, identify_consultations):
        """Cultural sites should trigger NHPA consultation."""
        context = {
            "cultural_sites": ["Historic Site"]
        }
        consults = identify_consultations(context)

        assert any("NHPA Section 106" in c["consultation_type"] for c in consults)

    def test_multiple_species_multiple_consultations(self, identify_consultations):
        """Multiple species should trigger multiple consultations."""
        context = {
            "listed_species": ["Northern Spotted Owl", "Bull Trout"]
        }
        consults = identify_consultations(context)

        # Should have both USFWS and NOAA
        assert len(consults) == 2


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from generate_checklist import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result

    def test_execute_requires_pathway(self, execute):
        """Execute should require pathway input."""
        result = execute({"fire_id": "test-fire"})
        assert "error" in result
        assert "pathway" in result["error"]

    def test_execute_requires_action_type(self, execute):
        """Execute should require action_type input."""
        result = execute({
            "fire_id": "test-fire",
            "pathway": "CE"
        })
        assert "error" in result
        assert "action_type" in result["error"]

    def test_execute_validates_pathway(self, execute):
        """Execute should validate pathway is CE, EA, or EIS."""
        result = execute({
            "fire_id": "test",
            "pathway": "INVALID",
            "action_type": "trail_repair"
        })
        assert "error" in result
        assert "Invalid pathway" in result["error"]

    def test_execute_ce_trail_repair(self, execute):
        """Execute should generate CE checklist for trail repair."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "pathway": "CE",
            "action_type": "trail_repair",
            "project_context": {}
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["pathway"] == "CE"
        assert "Decision Memo" in result["template_name"]
        assert len(result["documentation_checklist"]) > 0
        assert any(d["document"] == "Decision Memo" for d in result["documentation_checklist"])

    def test_execute_ea_timber_salvage(self, execute):
        """Execute should generate EA checklist for timber salvage."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "pathway": "EA",
            "action_type": "timber_salvage",
            "project_context": {
                "listed_species": ["Northern Spotted Owl"]
            }
        })

        assert result["pathway"] == "EA"
        assert "Environmental Assessment" in result["template_name"]
        assert any(d["document"] == "Environmental Assessment" for d in result["documentation_checklist"])
        assert len(result["specialist_reports"]) > 0
        assert len(result["consultation_requirements"]) > 0

    def test_execute_eis_large_project(self, execute):
        """Execute should generate EIS checklist."""
        result = execute({
            "fire_id": "test",
            "pathway": "EIS",
            "action_type": "timber_salvage",
            "project_context": {
                "listed_species": ["Northern Spotted Owl", "Bull Trout"]
            }
        })

        assert result["pathway"] == "EIS"
        docs = [d["document"] for d in result["documentation_checklist"]]
        assert any("NOI" in d for d in docs)
        assert "Draft EIS" in docs
        assert "Final EIS" in docs

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should return reasoning chain."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "action_type": "trail_repair",
            "project_context": {}
        })

        assert "reasoning_chain" in result
        assert len(result["reasoning_chain"]) > 0

    def test_execute_returns_recommendations(self, execute):
        """Execute should return recommendations."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "action_type": "timber_salvage",
            "project_context": {}
        })

        assert "recommendations" in result
        assert len(result["recommendations"]) > 0

    def test_execute_ce_recommendations_mention_ec_screening(self, execute):
        """CE recommendations should mention EC screening."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "action_type": "trail_repair",
            "project_context": {}
        })

        assert any("EC screening" in r or "extraordinary circumstances" in r.lower() for r in result["recommendations"])

    def test_execute_ea_recommendations_mention_alternatives(self, execute):
        """EA recommendations should mention alternatives."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "action_type": "timber_salvage",
            "project_context": {}
        })

        assert any("alternative" in r.lower() for r in result["recommendations"])

    def test_execute_eis_recommendations_mention_noi(self, execute):
        """EIS recommendations should mention NOI."""
        result = execute({
            "fire_id": "test",
            "pathway": "EIS",
            "action_type": "timber_salvage",
            "project_context": {}
        })

        assert any("NOI" in r or "Notice of Intent" in r for r in result["recommendations"])


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with realistic scenarios."""

    @pytest.fixture
    def execute(self):
        from generate_checklist import execute
        return execute

    def test_complex_ea_scenario(self, execute):
        """Complex EA with multiple specialist reports and consultations."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "pathway": "EA",
            "action_type": "timber_salvage",
            "project_context": {
                "listed_species": ["Northern Spotted Owl"],
                "designated_areas": ["Waldo Lake Wilderness"],
                "cultural_sites": []
            }
        })

        # Should have wildlife BA
        assert any(r["report_type"] == "Biological Assessment" for r in result["specialist_reports"])
        # Should have wilderness analysis
        assert any("Wilderness" in r["report_type"] for r in result["specialist_reports"])
        # Should have ESA consultation
        assert len(result["consultation_requirements"]) > 0

    def test_minimal_ce_scenario(self, execute):
        """Minimal CE with no special requirements."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "action_type": "trail_repair",
            "project_context": {}
        })

        assert result["pathway"] == "CE"
        assert len(result["consultation_requirements"]) == 0
        # Should still have engineering report
        assert any(r["discipline"] == "Engineering" for r in result["specialist_reports"])


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from generate_checklist import execute
        return execute

    def test_empty_project_context(self, execute):
        """Empty project context should work."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "action_type": "trail_repair",
            "project_context": {}
        })

        assert "error" not in result
        assert result["pathway"] == "CE"

    def test_unknown_action_type(self, execute):
        """Unknown action type should still return checklist."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "action_type": "unknown_action",
            "project_context": {}
        })

        # Should still return documentation requirements
        assert len(result["documentation_checklist"]) > 0

    def test_multiple_listed_species(self, execute):
        """Multiple listed species should all be captured."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "action_type": "timber_salvage",
            "project_context": {
                "listed_species": ["Northern Spotted Owl", "Bull Trout", "Oregon Spotted Frog"]
            }
        })

        # Should have multiple consultations
        assert len(result["consultation_requirements"]) >= 2
