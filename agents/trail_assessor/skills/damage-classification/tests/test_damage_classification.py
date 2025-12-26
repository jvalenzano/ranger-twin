"""
Tests for Damage Classification skill.

Tests cover:
- skill.md structure and content
- Damage type classification (Type I-IV)
- Infrastructure assessment
- Hazard zone identification
- Fixture data loading
- Full classification execution
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
            "# Damage Classification",
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

        assert "fire_id" in content, "fire_id input should be documented"
        assert "trail_id" in content, "trail_id input should be documented"
        assert "damage_points" in content, "damage_points input should be documented"

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "type_summary",
            "infrastructure_issues",
            "hazard_zones",
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

    def test_damage_type_matrix_exists(self):
        """Damage type matrix resource should exist."""
        matrix = RESOURCES_DIR / "damage-type-matrix.json"
        assert matrix.exists(), "damage-type-matrix.json should exist"

    def test_damage_type_matrix_valid_json(self):
        """Damage type matrix should be valid JSON."""
        matrix = RESOURCES_DIR / "damage-type-matrix.json"
        with open(matrix) as f:
            data = json.load(f)

        assert "damage_types" in data
        assert "infrastructure_types" in data

    def test_damage_types_complete(self):
        """All damage types (I-IV) should be defined."""
        matrix = RESOURCES_DIR / "damage-type-matrix.json"
        with open(matrix) as f:
            data = json.load(f)

        types = data["damage_types"]
        expected_types = ["TYPE_I", "TYPE_II", "TYPE_III", "TYPE_IV"]

        for dtype in expected_types:
            assert dtype in types, f"{dtype} should be defined"
            assert "severity_range" in types[dtype]
            assert "description" in types[dtype]


# =============================================================================
# Classification Tests
# =============================================================================

class TestDamageClassification:
    """Test damage type classification logic."""

    @pytest.fixture
    def classify_damage_point(self):
        """Import classification function."""
        from classify_damage import classify_damage_point
        return classify_damage_point

    def test_type_i_classification_severity_1(self, classify_damage_point):
        """Severity 1 should classify as TYPE I."""
        damage = {"damage_id": "TEST-1", "type": "SIGNAGE", "severity": 1}
        damage_type, _, _ = classify_damage_point(damage)
        assert damage_type == "TYPE_I"

    def test_type_i_classification_severity_2(self, classify_damage_point):
        """Severity 2 should classify as TYPE I."""
        damage = {"damage_id": "TEST-2", "type": "TREAD_EROSION", "severity": 2}
        damage_type, _, _ = classify_damage_point(damage)
        assert damage_type == "TYPE_I"

    def test_type_ii_classification_severity_3(self, classify_damage_point):
        """Severity 3 should classify as TYPE II."""
        damage = {"damage_id": "TEST-3", "type": "HAZARD_TREES", "severity": 3}
        damage_type, _, _ = classify_damage_point(damage)
        assert damage_type == "TYPE_II"

    def test_type_iii_classification_severity_4(self, classify_damage_point):
        """Severity 4 should classify as TYPE III."""
        damage = {"damage_id": "TEST-4", "type": "DEBRIS_FLOW", "severity": 4}
        damage_type, _, _ = classify_damage_point(damage)
        assert damage_type == "TYPE_III"

    def test_type_iv_classification_severity_5(self, classify_damage_point):
        """Severity 5 should classify as TYPE IV."""
        damage = {"damage_id": "TEST-5", "type": "BRIDGE_FAILURE", "severity": 5}
        damage_type, _, _ = classify_damage_point(damage)
        assert damage_type == "TYPE_IV"

    def test_classification_returns_reasoning(self, classify_damage_point):
        """Classification should include reasoning string."""
        damage = {"damage_id": "TEST-1", "type": "SIGNAGE", "severity": 1}
        _, _, reasoning = classify_damage_point(damage)
        assert "TEST-1" in reasoning
        assert "TYPE_I" in reasoning
        assert "Severity 1" in reasoning

    def test_bridge_failure_adds_context(self, classify_damage_point):
        """Bridge failures should have additional context."""
        damage = {"damage_id": "BR-1", "type": "BRIDGE_FAILURE", "severity": 5}
        _, _, reasoning = classify_damage_point(damage)
        assert "Bridge failure" in reasoning or "replacement" in reasoning.lower()

    def test_classified_damage_includes_type(self, classify_damage_point):
        """Classified damage should include damage_type field."""
        damage = {"damage_id": "TEST-1", "severity": 3}
        _, classified, _ = classify_damage_point(damage)
        assert "damage_type" in classified
        assert classified["damage_type"] == "TYPE_II"


# =============================================================================
# Infrastructure Assessment Tests
# =============================================================================

class TestInfrastructureAssessment:
    """Test infrastructure damage assessment logic."""

    @pytest.fixture
    def assess_infrastructure(self):
        """Import infrastructure assessment function."""
        from classify_damage import assess_infrastructure
        return assess_infrastructure

    def test_bridge_failure_is_infrastructure(self, assess_infrastructure):
        """Bridge failures should be flagged as infrastructure."""
        damage = {
            "damage_id": "BR-1",
            "trail_id": "test-trail",
            "trail_name": "Test Trail",
            "type": "BRIDGE_FAILURE",
            "severity": 5,
            "estimated_cost": 85000,
            "description": "Bridge destroyed",
        }
        result = assess_infrastructure(damage)
        assert result is not None
        assert result["type"] == "BRIDGE_FAILURE"
        assert result["damage_id"] == "BR-1"

    def test_culvert_damage_is_infrastructure(self, assess_infrastructure):
        """Culvert damage should be flagged as infrastructure."""
        damage = {
            "damage_id": "CV-1",
            "type": "CULVERT_DAMAGE",
            "severity": 4,
            "estimated_cost": 20000,
        }
        result = assess_infrastructure(damage)
        assert result is not None

    def test_signage_not_infrastructure(self, assess_infrastructure):
        """Signage damage should not be infrastructure."""
        damage = {
            "damage_id": "SG-1",
            "type": "SIGNAGE",
            "severity": 1,
        }
        result = assess_infrastructure(damage)
        assert result is None

    def test_tread_erosion_not_infrastructure(self, assess_infrastructure):
        """Tread erosion should not be infrastructure."""
        damage = {
            "damage_id": "TE-1",
            "type": "TREAD_EROSION",
            "severity": 3,
        }
        result = assess_infrastructure(damage)
        assert result is None


# =============================================================================
# Hazard Zone Tests
# =============================================================================

class TestHazardZoneIdentification:
    """Test hazard zone identification logic."""

    @pytest.fixture
    def identify_hazard_zone(self):
        """Import hazard zone function."""
        from classify_damage import identify_hazard_zone
        return identify_hazard_zone

    def test_three_high_severity_points_is_hazard(self, identify_hazard_zone):
        """3+ damage points with avg severity >= 4 should be hazard zone."""
        trail = {
            "trail_id": "test-1",
            "trail_name": "Test Trail",
            "total_estimated_cost": 100000,
            "damage_points": [
                {"severity": 4},
                {"severity": 4},
                {"severity": 5},
            ],
        }
        result = identify_hazard_zone(trail)
        assert result is not None
        assert result["damage_count"] == 3
        assert result["avg_severity"] >= 4.0

    def test_two_damage_points_not_hazard(self, identify_hazard_zone):
        """Less than 3 damage points should not be hazard zone."""
        trail = {
            "trail_id": "test-1",
            "damage_points": [
                {"severity": 5},
                {"severity": 5},
            ],
        }
        result = identify_hazard_zone(trail)
        assert result is None

    def test_low_severity_average_not_hazard(self, identify_hazard_zone):
        """Average severity < 4 should not be hazard zone."""
        trail = {
            "trail_id": "test-1",
            "damage_points": [
                {"severity": 2},
                {"severity": 3},
                {"severity": 3},
            ],
        }
        result = identify_hazard_zone(trail)
        assert result is None

    def test_hazard_zone_includes_cost(self, identify_hazard_zone):
        """Hazard zone should include total cost."""
        trail = {
            "trail_id": "test-1",
            "trail_name": "Test",
            "total_estimated_cost": 238000,
            "damage_points": [
                {"severity": 5},
                {"severity": 5},
                {"severity": 4},
                {"severity": 4},
            ],
        }
        result = identify_hazard_zone(trail)
        assert result is not None
        assert result["total_cost"] == 238000


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from classify_damage import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_with_cedar_creek(self, execute):
        """Execute should work with Cedar Creek fixture."""
        result = execute({"fire_id": "cedar-creek-2022"})

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["trails_assessed"] == 5
        assert result["total_damage_points"] == 15
        assert "type_summary" in result
        assert "reasoning_chain" in result
        assert result["confidence"] >= 0.85

    def test_execute_returns_type_summary(self, execute):
        """Execute should return type summary with counts and costs."""
        result = execute({"fire_id": "cedar-creek-2022"})

        type_summary = result["type_summary"]
        assert "TYPE_IV" in type_summary
        assert type_summary["TYPE_IV"]["count"] > 0
        assert type_summary["TYPE_IV"]["total_cost"] > 0

    def test_execute_identifies_infrastructure(self, execute):
        """Execute should identify infrastructure issues."""
        result = execute({"fire_id": "cedar-creek-2022"})

        infrastructure = result["infrastructure_issues"]
        assert len(infrastructure) > 0
        # Should have 3 bridge failures in Cedar Creek
        bridge_failures = [i for i in infrastructure if "BRIDGE" in i["type"]]
        assert len(bridge_failures) == 3

    def test_execute_identifies_hazard_zones(self, execute):
        """Execute should identify hazard zones."""
        result = execute({"fire_id": "cedar-creek-2022"})

        hazard_zones = result["hazard_zones"]
        assert len(hazard_zones) > 0
        # Hills Creek should be a hazard zone (4 damage points, avg 4.25)
        hills_creek = next((h for h in hazard_zones if "hills-creek" in h["trail_id"]), None)
        assert hills_creek is not None

    def test_execute_with_single_trail(self, execute):
        """Execute should filter by trail_id."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "trail_id": "waldo-lake-3536",
        })

        assert result["trails_assessed"] == 1
        assert result["total_damage_points"] == 4

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide recommendations."""
        result = execute({"fire_id": "cedar-creek-2022"})

        recommendations = result["recommendations"]
        assert len(recommendations) > 0

    def test_execute_unknown_fire(self, execute):
        """Execute should handle unknown fire IDs."""
        result = execute({"fire_id": "nonexistent-fire"})

        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_with_custom_damage_points(self, execute):
        """Execute should accept custom damage point data."""
        custom_damage = [
            {
                "damage_id": "CUSTOM-1",
                "trail_id": "test",
                "type": "BRIDGE_FAILURE",
                "severity": 5,
                "estimated_cost": 50000,
            }
        ]

        result = execute({
            "fire_id": "test-fire",
            "damage_points": custom_damage,
        })

        assert result["fire_id"] == "test-fire"
        assert result["total_damage_points"] == 1
        assert result["type_summary"]["TYPE_IV"]["count"] == 1


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with fixture data."""

    def test_cedar_creek_type_iv_count(self):
        """Cedar Creek should have 4 TYPE IV damage points."""
        from classify_damage import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        assert result["type_summary"]["TYPE_IV"]["count"] == 4

    def test_cedar_creek_total_cost(self):
        """Cedar Creek total cost should match fixture."""
        from classify_damage import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        type_summary = result["type_summary"]

        total_cost = sum(t["total_cost"] for t in type_summary.values())
        assert total_cost == 446800  # From fixture summary

    def test_waldo_lake_has_bridge_failure(self):
        """Waldo Lake should have WL-001 bridge failure."""
        from classify_damage import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "trail_id": "waldo-lake-3536",
        })

        damage_points = result["damage_points"]
        wl001 = next((d for d in damage_points if d["damage_id"] == "WL-001"), None)
        assert wl001 is not None
        assert wl001["damage_type"] == "TYPE_IV"

    def test_timpanogas_low_severity(self):
        """Timpanogas Trail should have mostly TYPE I damage."""
        from classify_damage import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "trail_id": "timpanogas-3527",
        })

        type_summary = result["type_summary"]
        assert "TYPE_I" in type_summary
        assert type_summary["TYPE_I"]["count"] == 2


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from classify_damage import execute
        return execute

    def test_severity_zero(self, execute):
        """Severity 0 should classify as TYPE I."""
        result = execute({
            "fire_id": "test",
            "damage_points": [{"damage_id": "T1", "severity": 0, "estimated_cost": 100}],
        })
        assert result["damage_points"][0]["damage_type"] == "TYPE_I"

    def test_severity_boundary_2_to_3(self, execute):
        """Severity 2 vs 3 should be TYPE I vs TYPE II."""
        result = execute({
            "fire_id": "test",
            "damage_points": [
                {"damage_id": "T1", "severity": 2, "estimated_cost": 100},
                {"damage_id": "T2", "severity": 3, "estimated_cost": 100},
            ],
        })
        assert result["damage_points"][0]["damage_type"] == "TYPE_I"
        assert result["damage_points"][1]["damage_type"] == "TYPE_II"

    def test_severity_boundary_3_to_4(self, execute):
        """Severity 3 vs 4 should be TYPE II vs TYPE III."""
        result = execute({
            "fire_id": "test",
            "damage_points": [
                {"damage_id": "T1", "severity": 3, "estimated_cost": 100},
                {"damage_id": "T2", "severity": 4, "estimated_cost": 100},
            ],
        })
        assert result["damage_points"][0]["damage_type"] == "TYPE_II"
        assert result["damage_points"][1]["damage_type"] == "TYPE_III"

    def test_severity_boundary_4_to_5(self, execute):
        """Severity 4 vs 5 should be TYPE III vs TYPE IV."""
        result = execute({
            "fire_id": "test",
            "damage_points": [
                {"damage_id": "T1", "severity": 4, "estimated_cost": 100},
                {"damage_id": "T2", "severity": 5, "estimated_cost": 100},
            ],
        })
        assert result["damage_points"][0]["damage_type"] == "TYPE_III"
        assert result["damage_points"][1]["damage_type"] == "TYPE_IV"

    def test_missing_cost_field(self, execute):
        """Missing estimated_cost should not cause errors."""
        result = execute({
            "fire_id": "test",
            "damage_points": [{"damage_id": "T1", "severity": 3}],
        })
        assert result["total_damage_points"] == 1
        assert result["type_summary"]["TYPE_II"]["total_cost"] == 0

    def test_empty_damage_points_list(self, execute):
        """Empty damage points list should return empty results."""
        result = execute({
            "fire_id": "test",
            "damage_points": [],
        })
        assert result["total_damage_points"] == 0
        assert len(result["damage_points"]) == 0
