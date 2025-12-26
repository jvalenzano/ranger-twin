"""
Tests for Recreation Priority skill.

Tests cover:
- skill.md structure and content
- Usage score calculation
- Access score calculation
- Cost-effectiveness calculation
- Quick win identification
- Resource allocation
- Fixture data loading
- Full prioritization execution
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
            "# Recreation Priority",
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
        assert "budget" in content, "budget input should be documented"
        assert "include_quick_wins" in content, "include_quick_wins input should be documented"

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "priority_ranking",
            "quick_wins",
            "resource_allocation",
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

    def test_priority_weights_exists(self):
        """Priority weights resource should exist."""
        weights = RESOURCES_DIR / "priority-weights.json"
        assert weights.exists(), "priority-weights.json should exist"

    def test_priority_weights_valid_json(self):
        """Priority weights should be valid JSON."""
        weights = RESOURCES_DIR / "priority-weights.json"
        with open(weights) as f:
            data = json.load(f)

        assert "priority_factors" in data
        assert "quick_win_thresholds" in data

    def test_priority_factors_complete(self):
        """All priority factors should be defined."""
        weights = RESOURCES_DIR / "priority-weights.json"
        with open(weights) as f:
            data = json.load(f)

        factors = data["priority_factors"]
        expected_factors = ["usage", "access", "cost_effectiveness", "strategic_value"]

        for factor in expected_factors:
            assert factor in factors, f"{factor} should be defined"
            assert "weight" in factors[factor]


# =============================================================================
# Usage Score Tests
# =============================================================================

class TestUsageScore:
    """Test usage score calculation logic."""

    @pytest.fixture
    def calculate_usage_score(self):
        """Import usage score function."""
        from prioritize_trails import calculate_usage_score
        return calculate_usage_score

    def test_rank_1_high_score(self, calculate_usage_score):
        """Priority rank 1 should produce high score."""
        trail = {"priority_rank": 1, "total_miles": 10, "trail_class": "3"}
        score, _ = calculate_usage_score(trail)
        assert score > 70

    def test_rank_5_low_score(self, calculate_usage_score):
        """Priority rank 5 should produce lower score."""
        trail = {"priority_rank": 5, "total_miles": 10, "trail_class": "3"}
        score, _ = calculate_usage_score(trail)
        assert score < 50

    def test_longer_trail_higher_score(self, calculate_usage_score):
        """Longer trails should score higher."""
        short_trail = {"priority_rank": 3, "total_miles": 2, "trail_class": "3"}
        long_trail = {"priority_rank": 3, "total_miles": 20, "trail_class": "3"}

        short_score, _ = calculate_usage_score(short_trail)
        long_score, _ = calculate_usage_score(long_trail)

        assert long_score > short_score

    def test_usage_score_includes_reasoning(self, calculate_usage_score):
        """Usage score should include reasoning string."""
        trail = {"priority_rank": 1, "total_miles": 10, "trail_class": "2"}
        score, reasoning = calculate_usage_score(trail)
        assert "rank" in reasoning.lower()
        assert "mi" in reasoning.lower()


# =============================================================================
# Access Score Tests
# =============================================================================

class TestAccessScore:
    """Test access score calculation logic."""

    @pytest.fixture
    def calculate_access_score(self):
        """Import access score function."""
        from prioritize_trails import calculate_access_score
        return calculate_access_score

    def test_wilderness_gateway_increases_score(self, calculate_access_score):
        """Wilderness gateway should increase access score."""
        trail = {
            "trail_name": "Waldo Lake Trail",
            "priority_rationale": "Primary recreation access"
        }
        score, _ = calculate_access_score(trail)
        assert score >= 30

    def test_lake_destination_increases_score(self, calculate_access_score):
        """Lake destination should increase access score."""
        trail = {
            "trail_name": "Bobby Lake Trail",
            "priority_rationale": "Popular destination"
        }
        score, _ = calculate_access_score(trail)
        assert score > 0

    def test_economic_value_increases_score(self, calculate_access_score):
        """Economic value (salvage) should increase score."""
        trail = {
            "trail_name": "Test Trail",
            "priority_rationale": "Access route for timber salvage operations"
        }
        score, _ = calculate_access_score(trail)
        assert score >= 20

    def test_access_score_capped_at_100(self, calculate_access_score):
        """Access score should not exceed 100."""
        trail = {
            "trail_name": "Waldo Lake Wilderness Trail",
            "total_miles": 25,
            "priority_rationale": "Primary wilderness access and salvage route"
        }
        score, _ = calculate_access_score(trail)
        assert score <= 100


# =============================================================================
# Cost-Effectiveness Tests
# =============================================================================

class TestCostEffectiveness:
    """Test cost-effectiveness calculation logic."""

    @pytest.fixture
    def calculate_cost_effectiveness(self):
        """Import cost-effectiveness function."""
        from prioritize_trails import calculate_cost_effectiveness
        return calculate_cost_effectiveness

    def test_low_cost_per_mile_excellent(self, calculate_cost_effectiveness):
        """Low cost per mile should score excellent."""
        trail = {"total_estimated_cost": 10000, "total_miles": 10}  # $1K/mile
        score, reasoning = calculate_cost_effectiveness(trail)
        assert score == 100
        assert "excellent" in reasoning

    def test_moderate_cost_per_mile_good(self, calculate_cost_effectiveness):
        """Moderate cost per mile should score good."""
        trail = {"total_estimated_cost": 100000, "total_miles": 10}  # $10K/mile
        score, reasoning = calculate_cost_effectiveness(trail)
        assert score == 75
        assert "good" in reasoning

    def test_high_cost_per_mile_poor(self, calculate_cost_effectiveness):
        """High cost per mile should score poor."""
        trail = {"total_estimated_cost": 500000, "total_miles": 10}  # $50K/mile
        score, _ = calculate_cost_effectiveness(trail)
        assert score == 25


# =============================================================================
# Quick Win Tests
# =============================================================================

class TestQuickWins:
    """Test quick win identification logic."""

    @pytest.fixture
    def identify_quick_wins(self):
        """Import quick win function."""
        from prioritize_trails import identify_quick_wins
        return identify_quick_wins

    def test_low_cost_high_usage_is_quick_win(self, identify_quick_wins):
        """Low cost + high usage should be quick win."""
        trails = [
            {
                "trail_id": "test-1",
                "trail_name": "Test Trail",
                "total_estimated_cost": 5000,
                "total_crew_days": 5,
                "_usage_score": 70,
                "_priority_score": 75,
            }
        ]
        quick_wins = identify_quick_wins(trails)
        assert len(quick_wins) == 1

    def test_high_cost_not_quick_win(self, identify_quick_wins):
        """High cost should not be quick win."""
        trails = [
            {
                "trail_id": "test-1",
                "trail_name": "Test Trail",
                "total_estimated_cost": 50000,  # Too expensive
                "total_crew_days": 5,
                "_usage_score": 70,
                "_priority_score": 75,
            }
        ]
        quick_wins = identify_quick_wins(trails)
        assert len(quick_wins) == 0

    def test_low_usage_not_quick_win(self, identify_quick_wins):
        """Low usage should not be quick win."""
        trails = [
            {
                "trail_id": "test-1",
                "trail_name": "Test Trail",
                "total_estimated_cost": 5000,
                "total_crew_days": 5,
                "_usage_score": 40,  # Too low
                "_priority_score": 50,
            }
        ]
        quick_wins = identify_quick_wins(trails)
        assert len(quick_wins) == 0

    def test_quick_wins_sorted_by_priority(self, identify_quick_wins):
        """Quick wins should be sorted by priority score."""
        trails = [
            {
                "trail_id": "test-1",
                "total_estimated_cost": 5000,
                "_usage_score": 70,
                "_priority_score": 70,
            },
            {
                "trail_id": "test-2",
                "total_estimated_cost": 8000,
                "_usage_score": 75,
                "_priority_score": 80,
            },
        ]
        quick_wins = identify_quick_wins(trails)
        assert len(quick_wins) == 2
        assert quick_wins[0]["priority_score"] > quick_wins[1]["priority_score"]


# =============================================================================
# Resource Allocation Tests
# =============================================================================

class TestResourceAllocation:
    """Test budget allocation logic."""

    @pytest.fixture
    def allocate_resources(self):
        """Import allocation function."""
        from prioritize_trails import allocate_resources
        return allocate_resources

    def test_allocate_within_budget(self, allocate_resources):
        """Should fund trails within budget."""
        trails = [
            {
                "trail_id": "test-1",
                "trail_name": "Test 1",
                "total_estimated_cost": 50000,
                "_priority_score": 90,
            },
            {
                "trail_id": "test-2",
                "trail_name": "Test 2",
                "total_estimated_cost": 80000,
                "_priority_score": 85,
            },
        ]
        result = allocate_resources(trails, 100000)

        assert len(result["funded_trails"]) == 1  # Only first trail fits
        assert result["total_allocated"] == 50000
        assert len(result["deferred_trails"]) == 1

    def test_allocate_multiple_trails(self, allocate_resources):
        """Should fund multiple trails if budget allows."""
        trails = [
            {
                "trail_id": "test-1",
                "total_estimated_cost": 30000,
                "_priority_score": 90,
            },
            {
                "trail_id": "test-2",
                "total_estimated_cost": 40000,
                "_priority_score": 85,
            },
        ]
        result = allocate_resources(trails, 100000)

        assert len(result["funded_trails"]) == 2
        assert result["total_allocated"] == 70000
        assert result["remaining_budget"] == 30000

    def test_no_budget_returns_empty(self, allocate_resources):
        """No budget should return empty dict."""
        trails = [{"total_estimated_cost": 50000}]
        result = allocate_resources(trails, None)
        assert result == {}

    def test_deferred_shows_shortfall(self, allocate_resources):
        """Deferred trails should show shortfall amount."""
        trails = [
            {
                "trail_id": "test-1",
                "total_estimated_cost": 150000,
                "_priority_score": 90,
            },
        ]
        result = allocate_resources(trails, 100000)

        assert len(result["deferred_trails"]) == 1
        assert result["deferred_trails"][0]["shortfall"] == 50000  # 150000 - 100000 budget


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from prioritize_trails import execute
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
        assert result["total_trails"] == 5
        assert "priority_ranking" in result
        assert "reasoning_chain" in result
        assert result["confidence"] >= 0.85

    def test_execute_returns_priority_ranking(self, execute):
        """Execute should return priority ranking."""
        result = execute({"fire_id": "cedar-creek-2022"})

        ranking = result["priority_ranking"]
        assert len(ranking) == 5
        assert all("priority_score" in r for r in ranking)
        assert all("rank" in r for r in ranking)

    def test_execute_ranking_sorted(self, execute):
        """Priority ranking should be sorted by score."""
        result = execute({"fire_id": "cedar-creek-2022"})

        ranking = result["priority_ranking"]
        scores = [r["priority_score"] for r in ranking]

        # Should be descending
        assert scores == sorted(scores, reverse=True)

    def test_execute_with_quick_wins(self, execute):
        """Execute should identify cost-effective trails (quick wins)."""
        result = execute({"fire_id": "cedar-creek-2022"})

        # Quick wins are trails with high cost_effectiveness (100)
        quick_wins = [t for t in result["priority_ranking"] if t.get("cost_effectiveness", 0) == 100]
        assert len(quick_wins) > 0  # Should have at least Timpanogas and Charlton

    def test_execute_has_ranking(self, execute):
        """Execute should return priority ranking."""
        result = execute({"fire_id": "cedar-creek-2022"})

        assert "priority_ranking" in result
        assert len(result["priority_ranking"]) > 0

    def test_execute_with_budget(self, execute):
        """Execute should allocate budget."""
        result = execute({"fire_id": "cedar-creek-2022", "budget": 200000})

        assert "budget" in result
        assert "resource_allocation" in result
        allocation = result["resource_allocation"]
        assert "funded_trails" in allocation
        assert "deferred_trails" in allocation

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


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with fixture data."""

    def test_waldo_lake_high_priority(self):
        """Waldo Lake should be high priority (rank 1 in fixture)."""
        from prioritize_trails import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        ranking = result["priority_ranking"]

        waldo = next((r for r in ranking if "waldo-lake" in r["trail_id"]), None)
        assert waldo is not None
        assert waldo["rank"] <= 2  # Should be top 2

    def test_timpanogas_quick_win(self):
        """Timpanogas should be a cost-effective quick win."""
        from prioritize_trails import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        ranking = result["priority_ranking"]

        timpanogas = next((t for t in ranking if "timpanogas" in t["trail_id"]), None)
        assert timpanogas is not None
        assert timpanogas["total_cost"] < 15000  # Low cost
        assert timpanogas["cost_effectiveness"] == 100  # High cost-effectiveness

    def test_budget_200k_allocation(self):
        """$200K budget should fund specific trails."""
        from prioritize_trails import execute

        result = execute({"fire_id": "cedar-creek-2022", "budget": 200000})
        allocation = result["resource_allocation"]

        # Should be able to fund at least 2 trails
        assert len(allocation["funded_trails"]) >= 2
        assert allocation["total_allocated"] <= 200000

    def test_hills_creek_expensive(self):
        """Hills Creek should be expensive (potentially deferred)."""
        from prioritize_trails import execute

        result = execute({"fire_id": "cedar-creek-2022", "budget": 100000})
        allocation = result["resource_allocation"]

        # Hills Creek is $238K, should be deferred on $100K budget
        deferred_ids = [t["trail_id"] for t in allocation.get("deferred_trails", [])]
        assert "hills-creek-3510" in deferred_ids


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from prioritize_trails import execute
        return execute

    def test_zero_budget(self, execute):
        """Zero budget should defer all trails."""
        result = execute({"fire_id": "cedar-creek-2022", "budget": 0})
        allocation = result["resource_allocation"]

        assert len(allocation["funded_trails"]) == 0
        assert len(allocation["deferred_trails"]) == 5

    def test_unlimited_budget(self, execute):
        """Very large budget should fund all trails."""
        result = execute({"fire_id": "cedar-creek-2022", "budget": 10000000})
        allocation = result["resource_allocation"]

        assert len(allocation["funded_trails"]) == 5
        assert len(allocation["deferred_trails"]) == 0
