"""
Tests for Soil Burn Severity skill.

Tests cover:
- skill.md structure and content
- dNBR classification thresholds
- Erosion risk assessment
- Fixture data loading
- Full assessment execution
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
            "# Soil Burn Severity",
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
        assert "sectors" in content, "sectors input should be documented"

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "severity_breakdown",
            "reasoning_chain",
            "confidence",
            "priority_sectors",
        ]

        for output in expected_outputs:
            assert output in content, f"Output {output} should be documented"


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_severity_indicators_exists(self):
        """Severity indicators resource should exist."""
        indicators = RESOURCES_DIR / "severity-indicators.json"
        assert indicators.exists(), "severity-indicators.json should exist"

    def test_severity_indicators_valid_json(self):
        """Severity indicators should be valid JSON."""
        indicators = RESOURCES_DIR / "severity-indicators.json"
        with open(indicators) as f:
            data = json.load(f)

        assert "dnbr_thresholds" in data
        assert "field_indicators" in data

    def test_dnbr_thresholds_complete(self):
        """All severity levels should have thresholds defined."""
        indicators = RESOURCES_DIR / "severity-indicators.json"
        with open(indicators) as f:
            data = json.load(f)

        thresholds = data["dnbr_thresholds"]
        expected_levels = ["unburned", "low", "moderate", "high"]

        for level in expected_levels:
            assert level in thresholds, f"Threshold for {level} should be defined"
            assert "min" in thresholds[level] or thresholds[level].get("min") is None
            assert "max" in thresholds[level] or thresholds[level].get("max") is None


# =============================================================================
# Classification Tests
# =============================================================================

class TestSeverityClassification:
    """Test dNBR severity classification logic."""

    @pytest.fixture
    def classify_severity(self):
        """Import classification function."""
        from assess_severity import classify_severity
        return classify_severity

    def test_unburned_classification(self, classify_severity):
        """dNBR < 0.1 should classify as UNBURNED."""
        severity, cls, _ = classify_severity(0.05)
        assert severity == "UNBURNED"
        assert cls == 1

    def test_low_severity_classification(self, classify_severity):
        """dNBR 0.1-0.27 should classify as LOW."""
        severity, cls, _ = classify_severity(0.15)
        assert severity == "LOW"
        assert cls == 2

    def test_low_severity_boundary(self, classify_severity):
        """dNBR exactly 0.1 should classify as LOW."""
        severity, cls, _ = classify_severity(0.1)
        assert severity == "LOW"
        assert cls == 2

    def test_moderate_severity_classification(self, classify_severity):
        """dNBR 0.27-0.66 should classify as MODERATE."""
        severity, cls, _ = classify_severity(0.45)
        assert severity == "MODERATE"
        assert cls == 3

    def test_moderate_severity_boundary(self, classify_severity):
        """dNBR exactly 0.27 should classify as MODERATE."""
        severity, cls, _ = classify_severity(0.27)
        assert severity == "MODERATE"
        assert cls == 3

    def test_high_severity_classification(self, classify_severity):
        """dNBR >= 0.66 should classify as HIGH."""
        severity, cls, _ = classify_severity(0.75)
        assert severity == "HIGH"
        assert cls == 4

    def test_high_severity_boundary(self, classify_severity):
        """dNBR exactly 0.66 should classify as HIGH."""
        severity, cls, _ = classify_severity(0.66)
        assert severity == "HIGH"
        assert cls == 4

    def test_extreme_high_severity(self, classify_severity):
        """Very high dNBR should classify as HIGH."""
        severity, cls, _ = classify_severity(0.95)
        assert severity == "HIGH"
        assert cls == 4

    def test_reasoning_included(self, classify_severity):
        """Classification should include reasoning string."""
        _, _, reasoning = classify_severity(0.45)
        assert "0.45" in reasoning
        assert "MODERATE" in reasoning


# =============================================================================
# Erosion Risk Tests
# =============================================================================

class TestErosionRisk:
    """Test erosion risk assessment logic."""

    @pytest.fixture
    def assess_erosion_risk(self):
        """Import erosion risk function."""
        from assess_severity import assess_erosion_risk
        return assess_erosion_risk

    def test_high_severity_steep_slope_critical(self, assess_erosion_risk):
        """HIGH severity + steep slope (>=30) should be CRITICAL."""
        risk = assess_erosion_risk("HIGH", 45)
        assert risk == "CRITICAL"

    def test_high_severity_moderate_slope_high(self, assess_erosion_risk):
        """HIGH severity + moderate slope (15-30) should be HIGH."""
        risk = assess_erosion_risk("HIGH", 20)
        assert risk == "HIGH"

    def test_high_severity_low_slope_moderate(self, assess_erosion_risk):
        """HIGH severity + low slope (<15) should be MODERATE."""
        risk = assess_erosion_risk("HIGH", 10)
        assert risk == "MODERATE"

    def test_moderate_severity_steep_slope_high(self, assess_erosion_risk):
        """MODERATE severity + steep slope should be HIGH."""
        risk = assess_erosion_risk("MODERATE", 35)
        assert risk == "HIGH"

    def test_low_severity_any_slope_low(self, assess_erosion_risk):
        """LOW severity should be LOW risk regardless of slope."""
        risk = assess_erosion_risk("LOW", 50)
        assert risk == "LOW"

    def test_no_slope_data_high_severity(self, assess_erosion_risk):
        """HIGH severity without slope data should be HIGH risk."""
        risk = assess_erosion_risk("HIGH", None)
        assert risk == "HIGH"

    def test_no_slope_data_moderate_severity(self, assess_erosion_risk):
        """MODERATE severity without slope data should be MODERATE risk."""
        risk = assess_erosion_risk("MODERATE", None)
        assert risk == "MODERATE"


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from assess_severity import execute
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
        assert result["fire_name"] == "Cedar Creek Fire"
        assert result["total_acres"] == 127341
        assert "severity_breakdown" in result
        assert "reasoning_chain" in result
        assert result["confidence"] > 0.9

    def test_execute_returns_severity_breakdown(self, execute):
        """Execute should return severity breakdown with percentages."""
        result = execute({"fire_id": "cedar-creek-2022"})

        breakdown = result["severity_breakdown"]
        assert "high" in breakdown
        assert breakdown["high"]["acres"] > 0
        assert breakdown["high"]["percentage"] > 0

    def test_execute_returns_priority_sectors(self, execute):
        """Execute should identify priority sectors."""
        result = execute({"fire_id": "cedar-creek-2022"})

        priority = result["priority_sectors"]
        assert len(priority) > 0
        assert all("severity" in s for s in priority)
        assert all("concern" in s for s in priority)

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide BAER recommendations."""
        result = execute({"fire_id": "cedar-creek-2022"})

        recommendations = result["recommendations"]
        assert len(recommendations) > 0
        assert any("BAER" in r or "Deploy" in r for r in recommendations)

    def test_execute_returns_data_sources(self, execute):
        """Execute should cite data sources."""
        result = execute({"fire_id": "cedar-creek-2022"})

        sources = result["data_sources"]
        assert "MTBS" in sources
        assert any("Imagery" in s for s in sources)

    def test_execute_with_custom_sectors(self, execute):
        """Execute should accept custom sector data."""
        custom_sectors = [
            {
                "id": "TEST-1",
                "name": "Test Sector",
                "dnbr_mean": 0.75,
                "acres": 1000,
                "slope_avg": 25,
            }
        ]

        result = execute({
            "fire_id": "test-fire",
            "sectors": custom_sectors,
        })

        assert result["fire_id"] == "test-fire"
        assert len(result["sectors"]) == 1
        assert result["sectors"][0]["severity"] == "HIGH"

    def test_execute_unknown_fire(self, execute):
        """Execute should handle unknown fire IDs."""
        result = execute({"fire_id": "nonexistent-fire"})

        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_sectors_sorted_by_severity(self, execute):
        """Execute should return sectors sorted by severity."""
        result = execute({"fire_id": "cedar-creek-2022"})

        sectors = result["sectors"]
        # First sectors should be HIGH
        assert sectors[0]["severity"] == "HIGH"

        # Verify descending order
        prev_class = 5
        for sector in sectors:
            assert sector["severity_class"] <= prev_class
            prev_class = sector["severity_class"]


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with fixture data."""

    def test_cedar_creek_high_severity_count(self):
        """Cedar Creek should have 4 HIGH severity sectors."""
        from assess_severity import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        breakdown = result["severity_breakdown"]

        assert breakdown["high"]["sector_count"] == 4

    def test_cedar_creek_percentages_sum_to_100(self):
        """Severity percentages should sum to approximately 100."""
        from assess_severity import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        breakdown = result["severity_breakdown"]

        total_pct = sum(v["percentage"] for v in breakdown.values())
        assert abs(total_pct - 100.0) < 1.0  # Allow for rounding

    def test_core1_is_priority_sector(self):
        """CORE-1 (Central Fire Origin) should be a priority sector."""
        from assess_severity import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        priority_ids = [s["id"] for s in result["priority_sectors"]]

        assert "CORE-1" in priority_ids

    def test_reasoning_chain_has_all_sectors(self):
        """Reasoning chain should mention all 8 sectors."""
        from assess_severity import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        chain = " ".join(result["reasoning_chain"])

        expected_sectors = ["CORE-1", "SW-1", "NW-1", "NW-2", "SE-1", "NE-1", "NE-2", "SW-2"]
        for sector_id in expected_sectors:
            assert sector_id in chain, f"Sector {sector_id} should be in reasoning"


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from assess_severity import execute
        return execute

    def test_zero_dnbr(self, execute):
        """Zero dNBR should classify as UNBURNED."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "dnbr_mean": 0, "acres": 100}],
        })
        assert result["sectors"][0]["severity"] == "UNBURNED"

    def test_negative_dnbr(self, execute):
        """Negative dNBR should classify as UNBURNED."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "dnbr_mean": -0.1, "acres": 100}],
        })
        assert result["sectors"][0]["severity"] == "UNBURNED"

    def test_very_high_dnbr(self, execute):
        """Very high dNBR (>1.0) should classify as HIGH."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "dnbr_mean": 1.2, "acres": 100}],
        })
        assert result["sectors"][0]["severity"] == "HIGH"

    def test_empty_sectors_list(self, execute):
        """Empty sectors list with fire_id should return empty results."""
        result = execute({
            "fire_id": "test",
            "sectors": [],
        })
        assert result["sectors"] == []
        assert result["total_acres"] == 0

    def test_missing_sector_fields(self, execute):
        """Sectors with missing optional fields should still work."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "dnbr_mean": 0.5, "acres": 100}],
        })
        assert result["sectors"][0]["severity"] == "MODERATE"
