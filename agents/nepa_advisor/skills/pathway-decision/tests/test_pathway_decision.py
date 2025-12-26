"""
Tests for Pathway Decision skill.

Tests cover:
- skill.md structure and content
- CE categories and EC criteria resources
- Extraordinary circumstances screening
- CE identification logic
- Pathway threshold evaluation
- Full pathway decision execution
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
        assert skill_md.exists(), "skill.md should exist"

    def test_skill_md_has_required_sections(self):
        """Skill definition should have all required sections."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        required_sections = [
            "# Pathway Decision",
            "## Description",
            "## Triggers",
            "## Instructions",
            "## Inputs",
            "## Outputs",
            "## Reasoning Chain",
        ]

        for section in required_sections:
            assert section in content, f"Missing required section: {section}"

    def test_skill_inputs_defined(self):
        """Inputs section should define required inputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        assert "fire_id" in content
        assert "action_type" in content
        assert "acres" in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "pathway",
            "ce_category",
            "extraordinary_circumstances",
            "reasoning_chain",
            "confidence",
        ]

        for output in expected_outputs:
            assert output in content, f"Output {output} should be documented"


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_ce_categories_exists(self):
        """CE categories resource should exist."""
        ce_file = RESOURCES_DIR / "ce-categories.json"
        assert ce_file.exists(), "ce-categories.json should exist"

    def test_ce_categories_valid_json(self):
        """CE categories should be valid JSON."""
        ce_file = RESOURCES_DIR / "ce-categories.json"
        with open(ce_file) as f:
            data = json.load(f)

        assert isinstance(data, dict)
        assert len(data) > 0

    def test_ce_categories_have_required_fields(self):
        """Each CE category should have required fields."""
        ce_file = RESOURCES_DIR / "ce-categories.json"
        with open(ce_file) as f:
            data = json.load(f)

        for key, ce in data.items():
            assert "citation" in ce, f"{key} should have citation"
            assert "name" in ce, f"{key} should have name"
            assert "applicable_actions" in ce, f"{key} should have applicable_actions"
            assert "acreage_limit" in ce, f"{key} should have acreage_limit"

    def test_ce_post_fire_rehabilitation_exists(self):
        """36 CFR 220.6(e)(13) Post-Fire Rehabilitation should exist."""
        ce_file = RESOURCES_DIR / "ce-categories.json"
        with open(ce_file) as f:
            data = json.load(f)

        ce_13 = data.get("36_CFR_220.6_e_13")
        assert ce_13 is not None
        assert ce_13["name"] == "Post-Fire Rehabilitation"
        assert ce_13["acreage_limit"] == 4200

    def test_ce_trail_maintenance_exists(self):
        """36 CFR 220.6(e)(14) Trail Maintenance should exist."""
        ce_file = RESOURCES_DIR / "ce-categories.json"
        with open(ce_file) as f:
            data = json.load(f)

        ce_14 = data.get("36_CFR_220.6_e_14")
        assert ce_14 is not None
        assert ce_14["name"] == "Trail Maintenance and Reconstruction"
        assert ce_14["acreage_limit"] is None  # No limit

    def test_extraordinary_circumstances_exists(self):
        """EC criteria resource should exist."""
        ec_file = RESOURCES_DIR / "extraordinary-circumstances.json"
        assert ec_file.exists(), "extraordinary-circumstances.json should exist"

    def test_extraordinary_circumstances_valid_json(self):
        """EC criteria should be valid JSON."""
        ec_file = RESOURCES_DIR / "extraordinary-circumstances.json"
        with open(ec_file) as f:
            data = json.load(f)

        assert "circumstances" in data
        assert isinstance(data["circumstances"], list)

    def test_ec_federally_listed_species_exists(self):
        """EC 01 (Federally Listed Species) should exist."""
        ec_file = RESOURCES_DIR / "extraordinary-circumstances.json"
        with open(ec_file) as f:
            data = json.load(f)

        ec_01 = next((c for c in data["circumstances"] if c["id"] == "ec_01"), None)
        assert ec_01 is not None
        assert ec_01["name"] == "Federally Listed Species"
        assert ec_01["triggers_ea"] is True

    def test_ec_congressionally_designated_areas_exists(self):
        """EC 03 (Congressionally Designated Areas) should exist."""
        ec_file = RESOURCES_DIR / "extraordinary-circumstances.json"
        with open(ec_file) as f:
            data = json.load(f)

        ec_03 = next((c for c in data["circumstances"] if c["id"] == "ec_03"), None)
        assert ec_03 is not None
        assert "Congressionally Designated Areas" in ec_03["name"]
        assert ec_03["triggers_ea"] is True


# =============================================================================
# EC Screening Tests
# =============================================================================

class TestExtraordinaryCircumstances:
    """Test EC screening logic."""

    @pytest.fixture
    def screen_ec(self):
        """Import EC screening function."""
        from decide_pathway import screen_extraordinary_circumstances
        return screen_extraordinary_circumstances

    def test_no_ecs_triggered(self, screen_ec):
        """Empty project context should trigger no ECs."""
        context = {
            "listed_species": [],
            "designated_areas": [],
            "roadless_areas": False,
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "CLEAR"
        assert len(triggered) == 0
        assert any("CLEAR" in r for r in reasoning)

    def test_listed_species_triggers_ec_01(self, screen_ec):
        """Federally listed species should trigger EC 01."""
        context = {
            "listed_species": ["Northern Spotted Owl"],
            "designated_areas": [],
            "roadless_areas": False,
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "TRIGGERED"
        assert len(triggered) == 1
        assert triggered[0]["id"] == "ec_01"
        assert "ESA Section 7" in triggered[0]["consultation_required"]

    def test_multiple_species_in_ec_notes(self, screen_ec):
        """Multiple species should be listed in EC notes."""
        context = {
            "listed_species": ["Northern Spotted Owl", "Bull Trout"],
            "designated_areas": [],
            "roadless_areas": False,
        }
        status, triggered, reasoning = screen_ec(context)

        assert len(triggered) == 1
        assert "Northern Spotted Owl" in triggered[0]["notes"]
        assert "Bull Trout" in triggered[0]["notes"]

    def test_designated_areas_triggers_ec_03(self, screen_ec):
        """Congressionally designated areas should trigger EC 03."""
        context = {
            "listed_species": [],
            "designated_areas": ["Waldo Lake Wilderness"],
            "roadless_areas": False,
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "TRIGGERED"
        assert any(ec["id"] == "ec_03" for ec in triggered)

    def test_roadless_areas_triggers_ec_04(self, screen_ec):
        """Inventoried roadless areas should trigger EC 04."""
        context = {
            "listed_species": [],
            "designated_areas": [],
            "roadless_areas": True,
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "TRIGGERED"
        assert any(ec["id"] == "ec_04" for ec in triggered)

    def test_cultural_sites_triggers_ec_06(self, screen_ec):
        """Cultural sites should trigger EC 06."""
        context = {
            "listed_species": [],
            "designated_areas": [],
            "roadless_areas": False,
            "cultural_sites": ["Sacred Mountain Site"],
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "TRIGGERED"
        assert any(ec["id"] == "ec_06" for ec in triggered)
        ec_06 = next(ec for ec in triggered if ec["id"] == "ec_06")
        assert "NHPA Section 106" in ec_06["consultation_required"]

    def test_wetlands_documented_not_triggered(self, screen_ec):
        """Wetlands should be documented but not trigger TRIGGERED status alone."""
        context = {
            "listed_species": [],
            "designated_areas": [],
            "roadless_areas": False,
            "wetlands": True,
        }
        status, triggered, reasoning = screen_ec(context)

        # Wetlands don't auto-trigger EA, but should be mentioned
        assert any("Wetlands" in r for r in reasoning)

    def test_multiple_ecs_all_captured(self, screen_ec):
        """Multiple ECs should all be captured."""
        context = {
            "listed_species": ["Northern Spotted Owl"],
            "designated_areas": ["Waldo Lake Wilderness"],
            "roadless_areas": True,
        }
        status, triggered, reasoning = screen_ec(context)

        assert status == "TRIGGERED"
        assert len(triggered) == 3
        ec_ids = [ec["id"] for ec in triggered]
        assert "ec_01" in ec_ids
        assert "ec_03" in ec_ids
        assert "ec_04" in ec_ids


# =============================================================================
# CE Identification Tests
# =============================================================================

class TestCEIdentification:
    """Test CE category identification."""

    @pytest.fixture
    def identify_ce(self):
        """Import CE identification function."""
        from decide_pathway import identify_applicable_ce
        return identify_applicable_ce

    def test_trail_repair_matches_ce_14(self, identify_ce):
        """Trail repair should match 36 CFR 220.6(e)(14)."""
        citation, reasoning = identify_ce("trail_repair", 50)

        assert citation == "36 CFR 220.6(e)(14)"
        assert "Trail Maintenance" in reasoning

    def test_timber_salvage_matches_ce_6_or_13(self, identify_ce):
        """Timber salvage should match CE 6 or 13."""
        citation, reasoning = identify_ce("timber_salvage", 3000)

        assert citation in ["36 CFR 220.6(e)(6)", "36 CFR 220.6(e)(13)"]

    def test_timber_salvage_under_limit(self, identify_ce):
        """Timber salvage under 4200 acres should have CE."""
        citation, reasoning = identify_ce("timber_salvage", 3000)

        assert citation is not None
        assert "220.6" in reasoning  # Should cite the CFR section

    def test_timber_salvage_over_limit(self, identify_ce):
        """Timber salvage over 4200 acres should not have CE."""
        citation, reasoning = identify_ce("timber_salvage", 5000)

        assert citation is None
        assert "exceeds limit" in reasoning.lower()

    def test_reforestation_matches_ce_13(self, identify_ce):
        """Reforestation should match CE 13."""
        citation, reasoning = identify_ce("reforestation", 2000)

        assert citation == "36 CFR 220.6(e)(13)"

    def test_unknown_action_no_match(self, identify_ce):
        """Unknown action type should return None."""
        citation, reasoning = identify_ce("unknown_action", 100)

        assert citation is None
        assert "No CE category" in reasoning

    def test_trail_repair_no_acreage_limit(self, identify_ce):
        """Trail repair should have no acreage limit."""
        # Should work even with large acreage
        citation, reasoning = identify_ce("trail_repair", 10000)

        assert citation == "36 CFR 220.6(e)(14)"


# =============================================================================
# Pathway Threshold Tests
# =============================================================================

class TestPathwayThresholds:
    """Test pathway determination logic."""

    @pytest.fixture
    def evaluate_pathway(self):
        """Import pathway evaluation function."""
        from decide_pathway import evaluate_pathway_thresholds
        return evaluate_pathway_thresholds

    def test_ce_with_clear_ecs_and_citation(self, evaluate_pathway):
        """CE should be selected when ECs are clear and CE citation exists."""
        pathway = evaluate_pathway(
            action_type="trail_repair",
            acres=50,
            ec_status="CLEAR",
            ce_citation="36 CFR 220.6(e)(14)"
        )

        assert pathway == "CE"

    def test_ea_with_triggered_ecs(self, evaluate_pathway):
        """EA should be selected when ECs are triggered."""
        pathway = evaluate_pathway(
            action_type="timber_salvage",
            acres=3000,
            ec_status="TRIGGERED",
            ce_citation="36 CFR 220.6(e)(13)"
        )

        assert pathway == "EA"

    def test_ea_with_no_ce_citation(self, evaluate_pathway):
        """EA should be selected when no CE citation exists."""
        pathway = evaluate_pathway(
            action_type="unknown_action",
            acres=1000,
            ec_status="CLEAR",
            ce_citation=None
        )

        assert pathway == "EA"

    def test_eis_with_large_acreage(self, evaluate_pathway):
        """EIS should be selected for large timber salvage (>5000 acres)."""
        pathway = evaluate_pathway(
            action_type="timber_salvage",
            acres=6000,
            ec_status="CLEAR",
            ce_citation=None
        )

        assert pathway == "EIS"

    def test_eis_with_ecs_and_large_acreage(self, evaluate_pathway):
        """EIS should be selected with ECs + acreage >4200."""
        pathway = evaluate_pathway(
            action_type="timber_salvage",
            acres=5000,
            ec_status="TRIGGERED",
            ce_citation=None
        )

        assert pathway == "EIS"


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from decide_pathway import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_requires_action_type(self, execute):
        """Execute should require action_type input."""
        result = execute({"fire_id": "test-fire"})
        assert "error" in result
        assert "action_type" in result["error"]

    def test_execute_requires_acres(self, execute):
        """Execute should require acres input."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "trail_repair"
        })
        assert "error" in result
        assert "acres" in result["error"]

    def test_execute_trail_repair_ce_pathway(self, execute):
        """Trail repair with no ECs should result in CE pathway."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "action_type": "trail_repair",
            "acres": 50,
            "project_context": {
                "listed_species": [],
                "designated_areas": [],
                "roadless_areas": False,
            }
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["pathway"] == "CE"
        assert result["ce_category"] == "36 CFR 220.6(e)(14)"
        assert len(result["extraordinary_circumstances"]) == 0
        assert result["confidence"] >= 0.9

    def test_execute_timber_salvage_with_ec_ea_pathway(self, execute):
        """Timber salvage with ECs should result in EA pathway."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "action_type": "timber_salvage",
            "acres": 3200,
            "project_context": {
                "listed_species": ["Northern Spotted Owl"],
                "designated_areas": ["Waldo Lake Wilderness"],
                "roadless_areas": False,
            }
        })

        assert result["pathway"] == "EA"
        assert len(result["extraordinary_circumstances"]) == 2
        assert any(ec["id"] == "ec_01" for ec in result["extraordinary_circumstances"])

    def test_execute_large_salvage_eis_pathway(self, execute):
        """Large-scale salvage should result in EIS pathway."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "action_type": "timber_salvage",
            "acres": 6500,
            "project_context": {
                "listed_species": ["Northern Spotted Owl"],
                "roadless_areas": True,
            }
        })

        assert result["pathway"] == "EIS"

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should return detailed reasoning chain."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "trail_repair",
            "acres": 100,
            "project_context": {}
        })

        assert "reasoning_chain" in result
        assert len(result["reasoning_chain"]) > 0
        assert any("Screening" in r for r in result["reasoning_chain"])

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide pathway-specific recommendations."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "trail_repair",
            "acres": 50,
            "project_context": {}
        })

        assert "recommendations" in result
        assert len(result["recommendations"]) > 0

    def test_execute_ce_recommendations_include_decision_memo(self, execute):
        """CE pathway should recommend Decision Memo."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "trail_repair",
            "acres": 50,
            "project_context": {}
        })

        assert any("Decision Memo" in r for r in result["recommendations"])

    def test_execute_ea_recommendations_include_scoping(self, execute):
        """EA pathway should recommend public scoping."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "timber_salvage",
            "acres": 3000,
            "project_context": {
                "listed_species": ["Northern Spotted Owl"]
            }
        })

        assert any("scoping" in r.lower() for r in result["recommendations"])

    def test_execute_eis_recommendations_include_noi(self, execute):
        """EIS pathway should recommend NOI publication."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "timber_salvage",
            "acres": 6000,
            "project_context": {}
        })

        assert any("NOI" in r or "Notice of Intent" in r for r in result["recommendations"])

    def test_execute_acreage_compliance_tracking(self, execute):
        """Execute should track acreage compliance."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "timber_salvage",
            "acres": 3000,
            "project_context": {}
        })

        assert "acreage_compliance" in result
        assert result["acreage_compliance"]["proposed_acres"] == 3000
        assert result["acreage_compliance"]["ce_limit"] == 4200
        assert result["acreage_compliance"]["compliant"] is True


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with realistic scenarios."""

    @pytest.fixture
    def execute(self):
        from decide_pathway import execute
        return execute

    def test_emergency_stabilization_scenario(self, execute):
        """Emergency stabilization should use CE 36 CFR 220.6(d)(4)."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "action_type": "emergency_stabilization",
            "acres": 500,
            "project_context": {}
        })

        assert result["pathway"] == "CE"
        assert "36 CFR 220.6(d)(4)" in result["ce_category"]

    def test_small_reforestation_ce_pathway(self, execute):
        """Small reforestation project should use CE."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "reforestation",
            "acres": 2000,
            "project_context": {}
        })

        assert result["pathway"] == "CE"
        assert "36 CFR 220.6(e)(13)" in result["ce_category"]

    def test_salvage_with_multiple_ecs_eis(self, execute):
        """Salvage with multiple ECs should require EIS."""
        result = execute({
            "fire_id": "test-fire",
            "action_type": "timber_salvage",
            "acres": 5000,
            "project_context": {
                "listed_species": ["Northern Spotted Owl", "Bull Trout"],
                "designated_areas": ["Wilderness"],
                "roadless_areas": True,
            }
        })

        assert result["pathway"] == "EIS"
        assert len(result["extraordinary_circumstances"]) >= 2


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from decide_pathway import execute
        return execute

    def test_exactly_4200_acres(self, execute):
        """Exactly 4200 acres should be compliant with CE limit."""
        result = execute({
            "fire_id": "test",
            "action_type": "timber_salvage",
            "acres": 4200,
            "project_context": {}
        })

        assert result["acreage_compliance"]["compliant"] is True

    def test_4201_acres_exceeds_limit(self, execute):
        """4201 acres should exceed CE limit."""
        result = execute({
            "fire_id": "test",
            "action_type": "timber_salvage",
            "acres": 4201,
            "project_context": {}
        })

        # Should still work, but trigger EA or EIS
        assert result["pathway"] in ["EA", "EIS"]

    def test_zero_acres(self, execute):
        """Zero acres should still process."""
        result = execute({
            "fire_id": "test",
            "action_type": "trail_repair",
            "acres": 0,
            "project_context": {}
        })

        assert "error" not in result
        assert result["pathway"] == "CE"

    def test_very_large_acres(self, execute):
        """Very large acreage should trigger EIS."""
        result = execute({
            "fire_id": "test",
            "action_type": "timber_salvage",
            "acres": 50000,
            "project_context": {}
        })

        assert result["pathway"] == "EIS"

    def test_empty_project_context(self, execute):
        """Empty project context should work (no ECs)."""
        result = execute({
            "fire_id": "test",
            "action_type": "trail_repair",
            "acres": 100,
            "project_context": {}
        })

        assert result["pathway"] == "CE"
        assert len(result["extraordinary_circumstances"]) == 0
