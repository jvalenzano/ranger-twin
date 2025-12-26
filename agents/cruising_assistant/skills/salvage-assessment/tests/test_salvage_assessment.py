"""
Tests for Salvage Assessment skill.

Tests cover:
- skill.md structure and content
- Resource files
- Time calculation logic
- Deterioration stage assessment
- Salvage window calculation
- Grade impact assessment
- Viability scoring
- Full salvage assessment execution
- Edge cases and error handling
"""

import json
import sys
from datetime import datetime
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
            "# Salvage Assessment",
            "## Description",
            "## Triggers",
            "## Instructions",
            "## Inputs",
            "## Outputs",
            "## Reasoning Chain",
        ]

        for section in required_sections:
            assert section in content

    def test_skill_inputs_defined(self):
        """Inputs section should define required inputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        assert "fire_id" in content
        assert "fire_date" in content
        assert "plots" in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "priority_plots",
            "viability_score",
            "deterioration_summary",
            "reasoning_chain",
        ]

        for output in expected_outputs:
            assert output in content


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_deterioration_models_exists(self):
        """Deterioration models resource should exist."""
        models = RESOURCES_DIR / "deterioration-models.json"
        assert models.exists()

    def test_deterioration_models_valid_json(self):
        """Deterioration models should be valid JSON."""
        models = RESOURCES_DIR / "deterioration-models.json"
        with open(models) as f:
            data = json.load(f)

        assert "blue_stain_onset" in data
        assert "PSME" in data["blue_stain_onset"]

    def test_market_factors_exists(self):
        """Market factors resource should exist."""
        factors = RESOURCES_DIR / "market-factors.json"
        assert factors.exists()

    def test_market_factors_valid_json(self):
        """Market factors should be valid JSON."""
        factors = RESOURCES_DIR / "market-factors.json"
        with open(factors) as f:
            data = json.load(f)

        assert "price_per_mbf_2023" in data

    def test_viability_criteria_exists(self):
        """Viability criteria resource should exist."""
        criteria = RESOURCES_DIR / "viability-criteria.json"
        assert criteria.exists()

    def test_viability_criteria_valid_json(self):
        """Viability criteria should be valid JSON."""
        criteria = RESOURCES_DIR / "viability-criteria.json"
        with open(criteria) as f:
            data = json.load(f)

        assert "scoring_weights" in data
        assert "urgency_thresholds" in data

    def test_all_species_have_deterioration_data(self):
        """All major species should have deterioration data."""
        models = RESOURCES_DIR / "deterioration-models.json"
        with open(models) as f:
            data = json.load(f)

        major_species = ["PSME", "TSHE", "THPL", "PIPO", "PICO"]
        for species in major_species:
            assert species in data["blue_stain_onset"]


# =============================================================================
# Time Calculation Tests
# =============================================================================

class TestTimeCalculation:
    """Test time since fire calculation."""

    @pytest.fixture
    def calculate_months_since_fire(self):
        """Import time calculation function."""
        from assess_salvage import calculate_months_since_fire
        return calculate_months_since_fire

    def test_same_date_zero_months(self, calculate_months_since_fire):
        """Same date should return zero months."""
        months = calculate_months_since_fire("2022-09-15", "2022-09-15")
        assert months == 0

    def test_one_month_later(self, calculate_months_since_fire):
        """One month later should return approximately 1."""
        months = calculate_months_since_fire("2022-09-15", "2022-10-15")
        assert 0.9 <= months <= 1.1

    def test_six_months_later(self, calculate_months_since_fire):
        """Six months later should return approximately 6."""
        months = calculate_months_since_fire("2022-09-15", "2023-03-15")
        assert 5.5 <= months <= 6.5

    def test_one_year_later(self, calculate_months_since_fire):
        """One year later should return approximately 12."""
        months = calculate_months_since_fire("2022-09-15", "2023-09-15")
        assert 11.5 <= months <= 12.5

    def test_negative_time_returns_zero(self, calculate_months_since_fire):
        """Future fire date should return zero (not negative)."""
        months = calculate_months_since_fire("2023-09-15", "2022-09-15")
        assert months == 0


# =============================================================================
# Deterioration Stage Tests
# =============================================================================

class TestDeteriorationStage:
    """Test deterioration stage assessment."""

    @pytest.fixture
    def assess_deterioration_stage(self):
        """Import deterioration assessment function."""
        from assess_salvage import assess_deterioration_stage
        return assess_deterioration_stage

    def test_psme_early_stage(self, assess_deterioration_stage):
        """Douglas-fir at 3 months should be early stage."""
        stage, reasoning = assess_deterioration_stage("PSME", 3.0, "HIGH")
        assert stage == "early"
        assert "PSME" in reasoning

    def test_psme_moderate_stage(self, assess_deterioration_stage):
        """Douglas-fir at 12 months should be moderate stage."""
        stage, reasoning = assess_deterioration_stage("PSME", 12.0, "HIGH")
        assert stage == "moderate"

    def test_tshe_faster_deterioration(self, assess_deterioration_stage):
        """Hemlock should deteriorate faster than Douglas-fir."""
        psme_stage, _ = assess_deterioration_stage("PSME", 6.0, "HIGH")
        tshe_stage, _ = assess_deterioration_stage("TSHE", 6.0, "HIGH")

        # At 6 months, hemlock should be further along
        stage_order = ["early", "moderate", "advanced", "severe"]
        psme_idx = stage_order.index(psme_stage)
        tshe_idx = stage_order.index(tshe_stage)
        assert tshe_idx >= psme_idx

    def test_thpl_slow_deterioration(self, assess_deterioration_stage):
        """Cedar should deteriorate slower than Douglas-fir."""
        psme_stage, _ = assess_deterioration_stage("PSME", 18.0, "HIGH")
        thpl_stage, _ = assess_deterioration_stage("THPL", 18.0, "HIGH")

        # At 18 months, cedar should be less advanced
        stage_order = ["early", "moderate", "advanced", "severe"]
        psme_idx = stage_order.index(psme_stage)
        thpl_idx = stage_order.index(thpl_stage)
        assert thpl_idx <= psme_idx

    def test_high_severity_accelerates(self, assess_deterioration_stage):
        """High burn severity should accelerate deterioration."""
        stage_mod, _ = assess_deterioration_stage("PSME", 8.0, "MODERATE")
        stage_high, _ = assess_deterioration_stage("PSME", 8.0, "HIGH")

        # Same species/time but higher severity should be more advanced
        # (or same if already moderate)
        stage_order = ["early", "moderate", "advanced", "severe"]
        assert stage_order.index(stage_high) >= stage_order.index(stage_mod)


# =============================================================================
# Salvage Window Tests
# =============================================================================

class TestSalvageWindow:
    """Test salvage window calculation."""

    @pytest.fixture
    def calculate_salvage_window(self):
        """Import salvage window function."""
        from assess_salvage import calculate_salvage_window
        return calculate_salvage_window

    def test_psme_premium_window(self, calculate_salvage_window):
        """Douglas-fir premium window at 3 months."""
        window = calculate_salvage_window("PSME", 3.0, "premium")
        assert window["months_remaining"] > 10
        assert not window["expired"]

    def test_window_decreases_over_time(self, calculate_salvage_window):
        """Salvage window should decrease as time passes."""
        window_3mo = calculate_salvage_window("PSME", 3.0, "premium")
        window_12mo = calculate_salvage_window("PSME", 12.0, "premium")
        assert window_12mo["months_remaining"] < window_3mo["months_remaining"]

    def test_window_expires(self, calculate_salvage_window):
        """Salvage window should eventually expire."""
        window = calculate_salvage_window("PSME", 30.0, "premium")
        assert window["expired"] or window["months_remaining"] == 0

    def test_commercial_longer_than_premium(self, calculate_salvage_window):
        """Commercial window should be longer than premium."""
        premium = calculate_salvage_window("PSME", 6.0, "premium")
        commercial = calculate_salvage_window("PSME", 6.0, "commercial")
        assert commercial["max_months"] > premium["max_months"]

    def test_cedar_longest_window(self, calculate_salvage_window):
        """Western redcedar should have longest salvage window."""
        psme_window = calculate_salvage_window("PSME", 12.0, "premium")
        thpl_window = calculate_salvage_window("THPL", 12.0, "premium")
        assert thpl_window["months_remaining"] > psme_window["months_remaining"]


# =============================================================================
# Grade Impact Tests
# =============================================================================

class TestGradeImpact:
    """Test grade degradation assessment."""

    @pytest.fixture
    def assess_grade_impact(self):
        """Import grade impact function."""
        from assess_salvage import assess_grade_impact
        return assess_grade_impact

    def test_early_stage_no_downgrade(self, assess_grade_impact):
        """Early deterioration should not downgrade grade."""
        new_grade, loss = assess_grade_impact("2S", "early", 90)
        assert new_grade == "2S"
        assert loss == 0

    def test_moderate_stage_one_grade(self, assess_grade_impact):
        """Moderate deterioration should drop one grade."""
        new_grade, loss = assess_grade_impact("2S", "moderate", 90)
        assert new_grade == "3S"
        assert loss > 0

    def test_advanced_stage_two_grades(self, assess_grade_impact):
        """Advanced deterioration should drop two grades."""
        new_grade, loss = assess_grade_impact("2S", "advanced", 90)
        assert new_grade == "4S"

    def test_severe_always_4s(self, assess_grade_impact):
        """Severe deterioration should always result in 4S."""
        new_grade, loss = assess_grade_impact("1S", "severe", 90)
        assert new_grade == "4S"

    def test_high_mortality_additional_drop(self, assess_grade_impact):
        """High mortality should cause additional grade drop."""
        grade_low_mort, _ = assess_grade_impact("2S", "moderate", 75)
        grade_high_mort, _ = assess_grade_impact("2S", "moderate", 100)

        # High mortality should be same or worse
        grade_order = ["1S", "2S", "3S", "4S"]
        assert grade_order.index(grade_high_mort) >= grade_order.index(grade_low_mort)


# =============================================================================
# Viability Scoring Tests
# =============================================================================

class TestViabilityScoring:
    """Test viability score calculation."""

    @pytest.fixture
    def calculate_viability_score(self):
        """Import viability scoring function."""
        from assess_salvage import calculate_viability_score
        return calculate_viability_score

    def test_perfect_conditions_high_score(self, calculate_viability_score):
        """Perfect conditions should score very high."""
        score, breakdown = calculate_viability_score("early", "excellent", "high", 50.0)
        assert score >= 90
        assert len(breakdown) == 4

    def test_poor_conditions_low_score(self, calculate_viability_score):
        """Poor conditions should score low."""
        score, breakdown = calculate_viability_score("severe", "difficult", "low", 5.0)
        assert score <= 30

    def test_early_better_than_advanced(self, calculate_viability_score):
        """Early stage should score higher than advanced."""
        score_early, _ = calculate_viability_score("early", "good", "moderate", 25.0)
        score_advanced, _ = calculate_viability_score("advanced", "good", "moderate", 25.0)
        assert score_early > score_advanced

    def test_good_access_better_than_difficult(self, calculate_viability_score):
        """Good access should score higher than difficult."""
        score_good, _ = calculate_viability_score("moderate", "good", "moderate", 25.0)
        score_difficult, _ = calculate_viability_score("moderate", "difficult", "moderate", 25.0)
        assert score_good > score_difficult

    def test_high_volume_better_than_low(self, calculate_viability_score):
        """High volume should score higher than low volume."""
        score_high, _ = calculate_viability_score("moderate", "moderate", "moderate", 45.0)
        score_low, _ = calculate_viability_score("moderate", "moderate", "moderate", 8.0)
        assert score_high > score_low

    def test_score_in_valid_range(self, calculate_viability_score):
        """Score should be between 0 and 100."""
        score, _ = calculate_viability_score("moderate", "moderate", "moderate", 20.0)
        assert 0 <= score <= 100


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from assess_salvage import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_with_cedar_creek(self, execute):
        """Execute should work with Cedar Creek fixture."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["months_since_fire"] > 5
        assert result["plots_assessed"] > 0
        assert len(result["priority_plots"]) > 0

    def test_execute_returns_priority_plots(self, execute):
        """Execute should return priority-ranked plots."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        plots = result["priority_plots"]
        assert len(plots) > 0
        # Should be sorted by viability score
        for i in range(len(plots) - 1):
            assert plots[i]["viability_score"] >= plots[i + 1]["viability_score"]

    def test_execute_returns_urgency_levels(self, execute):
        """Execute should assign urgency levels."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        plots = result["priority_plots"]
        urgency_levels = set(p["urgency"] for p in plots)
        valid_levels = {"IMMEDIATE", "HIGH", "MODERATE", "LOW", "NOT_VIABLE"}
        assert urgency_levels.issubset(valid_levels)

    def test_execute_returns_deterioration_summary(self, execute):
        """Execute should summarize deterioration by species."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        summary = result["deterioration_summary"]
        assert len(summary) > 0
        for species, data in summary.items():
            assert "stage" in data
            assert "months_to_blue_stain" in data

    def test_execute_returns_salvage_window(self, execute):
        """Execute should return salvage window timelines."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        window = result["salvage_window"]
        assert "premium" in window
        assert "commercial" in window
        assert window["premium"]["months_remaining"] >= 0

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide operational recommendations."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        recommendations = result["recommendations"]
        assert len(recommendations) > 0

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should document reasoning steps."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2023-03-01",
        })

        reasoning = result["reasoning_chain"]
        assert len(reasoning) > 0
        assert any("months elapsed" in r for r in reasoning)


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with realistic scenarios."""

    def test_early_salvage_high_viability(self):
        """Recent fire should have high viability scores."""
        from assess_salvage import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2022-09-15",
            "assessment_date": "2022-12-01",  # 2.5 months
        })

        # Early assessment should have high priority plots
        high_priority = [p for p in result["priority_plots"] if p["urgency"] in ["IMMEDIATE", "HIGH"]]
        assert len(high_priority) > 0

    def test_late_salvage_low_viability(self):
        """Old fire should have lower viability scores."""
        from assess_salvage import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2020-09-15",  # 2.5 years ago
            "assessment_date": "2023-03-01",
        })

        # Late assessment should have lower scores
        avg_score = sum(p["viability_score"] for p in result["priority_plots"]) / len(result["priority_plots"])
        assert avg_score < 70  # Significantly degraded


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from assess_salvage import execute
        return execute

    def test_fire_today(self, execute):
        """Fire contained today should work."""
        today = datetime.now().strftime("%Y-%m-%d")
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": today,
            "assessment_date": today,
        })
        assert result["months_since_fire"] == 0

    def test_very_old_fire(self, execute):
        """Very old fire should show expired windows."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "fire_date": "2018-09-15",  # 4+ years ago
            "assessment_date": "2023-03-01",
        })
        assert result["months_since_fire"] > 48
        # Premium window should be expired for most species
        window = result["salvage_window"]["premium"]
        assert window["months_remaining"] == 0 or window["months_remaining"] < 5
