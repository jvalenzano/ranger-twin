"""
Tests for Compliance Timeline skill.

Tests cover:
- skill.md structure
- Timeline resources
- Comment period calculation
- Consultation duration estimation
- Milestone schedule building
- Full timeline execution
- Edge cases
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
    """Test skill.md structure."""

    def test_skill_md_exists(self):
        """Skill definition file should exist."""
        skill_md = SKILL_DIR / "skill.md"
        assert skill_md.exists()

    def test_skill_md_has_required_sections(self):
        """Skill should have required sections."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        required_sections = [
            "# Compliance Timeline",
            "## Description",
            "## Triggers",
            "## Inputs",
            "## Outputs",
        ]

        for section in required_sections:
            assert section in content


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_timelines_exists(self):
        """Timelines resource should exist."""
        timelines = RESOURCES_DIR / "timelines.json"
        assert timelines.exists()

    def test_timelines_valid_json(self):
        """Timelines should be valid JSON."""
        timelines = RESOURCES_DIR / "timelines.json"
        with open(timelines) as f:
            data = json.load(f)

        assert "CE" in data
        assert "EA" in data
        assert "EIS" in data

    def test_ce_timeline_complete(self):
        """CE timeline should have duration and milestones."""
        timelines = RESOURCES_DIR / "timelines.json"
        with open(timelines) as f:
            data = json.load(f)

        ce = data["CE"]
        assert "base_duration_days" in ce
        assert "milestones" in ce
        assert ce["base_duration_days"] > 0

    def test_ea_timeline_has_comment_periods(self):
        """EA timeline should have comment periods."""
        timelines = RESOURCES_DIR / "timelines.json"
        with open(timelines) as f:
            data = json.load(f)

        ea = data["EA"]
        assert "comment_periods" in ea
        assert len(ea["comment_periods"]) >= 2  # Scoping + EA comment

    def test_eis_timeline_has_comment_periods(self):
        """EIS timeline should have comment periods."""
        timelines = RESOURCES_DIR / "timelines.json"
        with open(timelines) as f:
            data = json.load(f)

        eis = data["EIS"]
        assert "comment_periods" in eis
        assert len(eis["comment_periods"]) >= 3  # Scoping + DEIS + wait

    def test_consultation_requirements_exists(self):
        """Consultation requirements resource should exist."""
        consults = RESOURCES_DIR / "consultation-requirements.json"
        assert consults.exists()

    def test_esa_formal_consultation_defined(self):
        """ESA Section 7 Formal should be defined."""
        consults = RESOURCES_DIR / "consultation-requirements.json"
        with open(consults) as f:
            data = json.load(f)

        assert "ESA Section 7 Formal" in data
        esa = data["ESA Section 7 Formal"]
        assert "typical_duration_days" in esa
        assert esa["typical_duration_days"] > 0

    def test_nhpa_consultation_defined(self):
        """NHPA Section 106 should be defined."""
        consults = RESOURCES_DIR / "consultation-requirements.json"
        with open(consults) as f:
            data = json.load(f)

        assert "NHPA Section 106" in data


# =============================================================================
# Comment Period Tests
# =============================================================================

class TestCommentPeriods:
    """Test comment period calculation."""

    @pytest.fixture
    def calculate_comment_periods(self):
        """Import comment period function."""
        from estimate_timeline import calculate_comment_periods
        return calculate_comment_periods

    def test_ce_no_comment_periods(self, calculate_comment_periods):
        """CE should have no required comment periods."""
        periods = calculate_comment_periods("CE")
        assert len(periods) == 0

    def test_ea_has_comment_periods(self, calculate_comment_periods):
        """EA should have comment periods."""
        periods = calculate_comment_periods("EA")
        assert len(periods) >= 2

    def test_eis_has_comment_periods(self, calculate_comment_periods):
        """EIS should have comment periods."""
        periods = calculate_comment_periods("EIS")
        assert len(periods) >= 3


# =============================================================================
# Consultation Duration Tests
# =============================================================================

class TestConsultationDuration:
    """Test consultation duration estimation."""

    @pytest.fixture
    def estimate_consultation(self):
        """Import consultation estimation function."""
        from estimate_timeline import estimate_consultation_duration
        return estimate_consultation_duration

    def test_esa_formal_duration(self, estimate_consultation):
        """ESA Section 7 Formal should return duration."""
        result = estimate_consultation("ESA Section 7 Formal")

        assert "duration_days" in result
        assert result["duration_days"] > 90  # At least 90 days

    def test_nhpa_duration(self, estimate_consultation):
        """NHPA Section 106 should return duration."""
        result = estimate_consultation("NHPA Section 106")

        assert "duration_days" in result
        assert result["duration_days"] > 0

    def test_unknown_consultation_default(self, estimate_consultation):
        """Unknown consultation should return default estimate."""
        result = estimate_consultation("Unknown Consultation Type")

        assert "duration_days" in result
        # Should provide some reasonable default
        assert result["duration_days"] > 0


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from estimate_timeline import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id."""
        result = execute({})
        assert "error" in result

    def test_execute_requires_pathway(self, execute):
        """Execute should require pathway."""
        result = execute({"fire_id": "test"})
        assert "error" in result
        assert "pathway" in result["error"]

    def test_execute_validates_pathway(self, execute):
        """Execute should validate pathway."""
        result = execute({
            "fire_id": "test",
            "pathway": "INVALID"
        })
        assert "error" in result
        assert "Invalid pathway" in result["error"]

    def test_execute_ce_timeline(self, execute):
        """Execute should generate CE timeline."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "pathway": "CE",
            "consultations": []
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["pathway"] == "CE"
        assert result["total_duration_days"] > 0
        assert result["total_duration_days"] < 60  # CE should be quick
        assert len(result["milestones"]) > 0

    def test_execute_ea_timeline(self, execute):
        """Execute should generate EA timeline."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "consultations": []
        })

        assert result["pathway"] == "EA"
        assert result["total_duration_days"] > 100  # EA takes months
        assert len(result["comment_periods"]) >= 2

    def test_execute_eis_timeline(self, execute):
        """Execute should generate EIS timeline."""
        result = execute({
            "fire_id": "test",
            "pathway": "EIS",
            "consultations": []
        })

        assert result["pathway"] == "EIS"
        assert result["total_duration_days"] > 400  # EIS is lengthy
        assert len(result["comment_periods"]) >= 3

    def test_execute_with_esa_consultation(self, execute):
        """Execute should incorporate ESA consultation."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "consultations": [
                {"type": "ESA Section 7 Formal", "agency": "USFWS"}
            ]
        })

        assert len(result["consultation_timelines"]) == 1
        assert result["consultation_timelines"][0]["agency"] == "USFWS"
        # Timeline should be extended for consultation
        assert result["total_duration_days"] > 180

    def test_execute_with_multiple_consultations(self, execute):
        """Execute should handle multiple consultations."""
        result = execute({
            "fire_id": "test",
            "pathway": "EIS",
            "consultations": [
                {"type": "ESA Section 7 Formal", "agency": "USFWS"},
                {"type": "NHPA Section 106", "agency": "SHPO"}
            ]
        })

        assert len(result["consultation_timelines"]) == 2

    def test_execute_returns_milestones(self, execute):
        """Execute should return milestones with dates."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "consultations": [],
            "start_date": "2024-01-15"
        })

        assert "milestones" in result
        assert len(result["milestones"]) > 0
        # Milestones should have dates
        assert all("date" in m for m in result["milestones"])

    def test_execute_returns_critical_path(self, execute):
        """Execute should return critical path."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "consultations": []
        })

        assert "critical_path" in result
        assert len(result["critical_path"]) > 0

    def test_execute_returns_recommendations(self, execute):
        """Execute should return recommendations."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "consultations": [
                {"type": "ESA Section 7 Formal", "agency": "USFWS"}
            ]
        })

        assert "recommendations" in result
        assert len(result["recommendations"]) > 0


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with realistic scenarios."""

    @pytest.fixture
    def execute(self):
        from estimate_timeline import execute
        return execute

    def test_complex_eis_scenario(self, execute):
        """Complex EIS with multiple consultations."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "pathway": "EIS",
            "consultations": [
                {"type": "ESA Section 7 Formal", "agency": "USFWS"},
                {"type": "ESA Section 7 Formal", "agency": "NOAA"},
                {"type": "NHPA Section 106", "agency": "SHPO"}
            ],
            "start_date": "2024-01-15"
        })

        # Should be lengthy
        assert result["total_duration_months"] >= 18
        # Should have all consultations
        assert len(result["consultation_timelines"]) == 3


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from estimate_timeline import execute
        return execute

    def test_no_start_date_uses_default(self, execute):
        """No start date should use current date."""
        result = execute({
            "fire_id": "test",
            "pathway": "CE",
            "consultations": []
        })

        # Should still have milestones with dates
        assert len(result["milestones"]) > 0

    def test_empty_consultations_list(self, execute):
        """Empty consultations list should work."""
        result = execute({
            "fire_id": "test",
            "pathway": "EA",
            "consultations": []
        })

        assert result["consultation_timelines"] == []
