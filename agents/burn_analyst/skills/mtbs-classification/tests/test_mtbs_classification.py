"""
Tests for MTBS Classification skill.

Tests cover:
- skill.md structure and content
- MTBS class threshold boundaries
- Classification logic
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
            "# MTBS Classification",
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
            "classification_summary",
            "sector_classifications",
            "dominant_class",
            "mtbs_metadata",
            "reasoning_chain",
        ]

        for output in expected_outputs:
            assert output in content, f"Output {output} should be documented"


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_mtbs_thresholds_exists(self):
        """MTBS thresholds resource should exist."""
        thresholds = RESOURCES_DIR / "mtbs-thresholds.json"
        assert thresholds.exists(), "mtbs-thresholds.json should exist"

    def test_mtbs_thresholds_valid_json(self):
        """MTBS thresholds should be valid JSON."""
        thresholds = RESOURCES_DIR / "mtbs-thresholds.json"
        with open(thresholds) as f:
            data = json.load(f)

        assert "mtbs_classes" in data
        assert "methodology" in data

    def test_all_mtbs_classes_defined(self):
        """All 4 MTBS classes should be defined."""
        thresholds = RESOURCES_DIR / "mtbs-thresholds.json"
        with open(thresholds) as f:
            data = json.load(f)

        classes = data["mtbs_classes"]
        for i in range(1, 5):
            key = f"class_{i}"
            assert key in classes, f"Class {i} should be defined"
            assert "label" in classes[key]
            assert "dnbr_min" in classes[key] or classes[key].get("dnbr_min") is None
            assert "dnbr_max" in classes[key] or classes[key].get("dnbr_max") is None


# =============================================================================
# Classification Tests
# =============================================================================

class TestClassification:
    """Test MTBS classification logic."""

    @pytest.fixture
    def classify_dnbr(self):
        """Import classification function."""
        from classify_mtbs import classify_dnbr
        return classify_dnbr

    def test_class_1_unburned(self, classify_dnbr):
        """dNBR < 0.1 should classify as Class 1 (Unburned)."""
        cls, label = classify_dnbr(0.05)
        assert cls == 1
        assert "Unburned" in label

    def test_class_2_low_severity(self, classify_dnbr):
        """dNBR 0.1-0.27 should classify as Class 2 (Low)."""
        cls, label = classify_dnbr(0.15)
        assert cls == 2
        assert "Low" in label

    def test_class_2_boundary(self, classify_dnbr):
        """dNBR exactly 0.1 should classify as Class 2."""
        cls, _ = classify_dnbr(0.1)
        assert cls == 2

    def test_class_3_moderate_severity(self, classify_dnbr):
        """dNBR 0.27-0.66 should classify as Class 3 (Moderate)."""
        cls, label = classify_dnbr(0.45)
        assert cls == 3
        assert "Moderate" in label

    def test_class_3_boundary(self, classify_dnbr):
        """dNBR exactly 0.27 should classify as Class 3."""
        cls, _ = classify_dnbr(0.27)
        assert cls == 3

    def test_class_4_high_severity(self, classify_dnbr):
        """dNBR >= 0.66 should classify as Class 4 (High)."""
        cls, label = classify_dnbr(0.75)
        assert cls == 4
        assert "High" in label

    def test_class_4_boundary(self, classify_dnbr):
        """dNBR exactly 0.66 should classify as Class 4."""
        cls, _ = classify_dnbr(0.66)
        assert cls == 4

    def test_extreme_high_dnbr(self, classify_dnbr):
        """Very high dNBR (>1.0) should still classify as Class 4."""
        cls, _ = classify_dnbr(1.2)
        assert cls == 4


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from classify_mtbs import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result

    def test_execute_with_cedar_creek(self, execute):
        """Execute should work with Cedar Creek fixture."""
        result = execute({"fire_id": "cedar-creek-2022"})

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["fire_name"] == "Cedar Creek Fire"
        assert result["total_acres"] == 127831
        assert "classification_summary" in result
        assert "sector_classifications" in result
        assert "reasoning_chain" in result

    def test_execute_returns_classification_summary(self, execute):
        """Execute should return classification summary by class."""
        result = execute({"fire_id": "cedar-creek-2022"})

        summary = result["classification_summary"]
        assert "class_4" in summary
        assert summary["class_4"]["label"] == "High Severity"
        assert summary["class_4"]["acres"] > 0
        assert summary["class_4"]["percentage"] > 0

    def test_execute_returns_sector_classifications(self, execute):
        """Execute should return sector-level classifications."""
        result = execute({"fire_id": "cedar-creek-2022"})

        classifications = result["sector_classifications"]
        assert len(classifications) == 8

        for sector in classifications:
            assert "id" in sector
            assert "mtbs_class" in sector
            assert "mtbs_label" in sector
            assert "dnbr_mean" in sector
            assert sector["mtbs_class"] in [1, 2, 3, 4]

    def test_execute_returns_dominant_class(self, execute):
        """Execute should identify dominant severity class."""
        result = execute({"fire_id": "cedar-creek-2022"})

        dominant = result["dominant_class"]
        assert dominant is not None
        assert dominant["class"] == 4
        assert dominant["label"] == "High Severity"
        assert dominant["percentage"] > 40  # Cedar Creek is 42% high severity

    def test_execute_returns_mtbs_metadata(self, execute):
        """Execute should include MTBS methodology metadata."""
        result = execute({"fire_id": "cedar-creek-2022"})

        metadata = result["mtbs_metadata"]
        assert metadata["source"] == "MTBS"
        assert metadata["thresholds"] == "Key & Benson (2006)"
        assert "classification_scheme" in metadata

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should document reasoning steps."""
        result = execute({"fire_id": "cedar-creek-2022"})

        chain = result["reasoning_chain"]
        assert len(chain) >= 2
        assert any("sector" in step.lower() for step in chain)
        assert any("class" in step.lower() for step in chain)

    def test_execute_with_custom_sectors(self, execute):
        """Execute should accept custom sector data."""
        custom_sectors = [
            {
                "id": "TEST-1",
                "name": "Test Sector",
                "dnbr_mean": 0.75,
                "acres": 1000,
            }
        ]

        result = execute({
            "fire_id": "test-fire",
            "sectors": custom_sectors,
        })

        assert result["fire_id"] == "test-fire"
        assert len(result["sector_classifications"]) == 1
        assert result["sector_classifications"][0]["mtbs_class"] == 4

    def test_execute_unknown_fire(self, execute):
        """Execute should handle unknown fire IDs."""
        result = execute({"fire_id": "nonexistent-fire"})
        assert "error" in result

    def test_sectors_sorted_by_class(self, execute):
        """Sectors should be sorted by class (highest first)."""
        result = execute({"fire_id": "cedar-creek-2022"})

        sectors = result["sector_classifications"]
        prev_class = 5
        for sector in sectors:
            assert sector["mtbs_class"] <= prev_class
            prev_class = sector["mtbs_class"]


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with fixture data."""

    def test_cedar_creek_class_counts(self):
        """Cedar Creek should have correct class distribution."""
        from classify_mtbs import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        summary = result["classification_summary"]

        assert summary["class_4"]["sector_count"] == 4
        assert summary["class_3"]["sector_count"] == 3
        assert summary["class_2"]["sector_count"] == 1

    def test_percentages_sum_to_100(self):
        """Class percentages should sum to approximately 100."""
        from classify_mtbs import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        summary = result["classification_summary"]

        total_pct = sum(v["percentage"] for v in summary.values())
        assert abs(total_pct - 100.0) < 1.0

    def test_core1_is_class_4(self):
        """CORE-1 should be classified as Class 4 (High Severity)."""
        from classify_mtbs import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        core1 = next(s for s in result["sector_classifications"] if s["id"] == "CORE-1")

        assert core1["mtbs_class"] == 4
        assert "High" in core1["mtbs_label"]

    def test_sw2_is_class_2(self):
        """SW-2 (Timpanogas) should be classified as Class 2 (Low Severity)."""
        from classify_mtbs import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        sw2 = next(s for s in result["sector_classifications"] if s["id"] == "SW-2")

        assert sw2["mtbs_class"] == 2
        assert "Low" in sw2["mtbs_label"]


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from classify_mtbs import execute
        return execute

    def test_zero_dnbr(self, execute):
        """Zero dNBR should classify as Class 1."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "dnbr_mean": 0, "acres": 100}],
        })
        assert result["sector_classifications"][0]["mtbs_class"] == 1

    def test_negative_dnbr(self, execute):
        """Negative dNBR should classify as Class 1."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "dnbr_mean": -0.1, "acres": 100}],
        })
        assert result["sector_classifications"][0]["mtbs_class"] == 1

    def test_empty_sectors_list(self, execute):
        """Empty sectors list should return empty results."""
        result = execute({
            "fire_id": "test",
            "sectors": [],
        })
        assert result["sector_classifications"] == []
        assert result["total_acres"] == 0
        assert result["dominant_class"] is None

    def test_include_class_map(self, execute):
        """include_class_map should include geometry in output."""
        result = execute({
            "fire_id": "test",
            "sectors": [{
                "id": "T1",
                "name": "Test",
                "dnbr_mean": 0.5,
                "acres": 100,
                "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
            }],
            "include_class_map": True,
        })
        assert "geometry" in result["sector_classifications"][0]

    def test_no_geometry_by_default(self, execute):
        """Geometry should not be included by default."""
        result = execute({
            "fire_id": "test",
            "sectors": [{
                "id": "T1",
                "name": "Test",
                "dnbr_mean": 0.5,
                "acres": 100,
                "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
            }],
        })
        assert "geometry" not in result["sector_classifications"][0]
