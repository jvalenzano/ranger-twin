"""
Tests for Volume Estimation skill.

Tests cover:
- skill.md structure and content
- Resource files
- Volume calculation logic
- Defect deduction
- Species aggregation
- Full volume estimation execution
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
            "# Volume Estimation",
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
        assert "trees" in content
        assert "log_rule" in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "total_volume_mbf",
            "species_breakdown",
            "reasoning_chain",
        ]

        for output in expected_outputs:
            assert output in content


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_volume_tables_exists(self):
        """Volume tables resource should exist."""
        tables = RESOURCES_DIR / "volume-tables.json"
        assert tables.exists()

    def test_volume_tables_valid_json(self):
        """Volume tables should be valid JSON."""
        tables = RESOURCES_DIR / "volume-tables.json"
        with open(tables) as f:
            data = json.load(f)

        assert "equations" in data
        assert "PSME" in data["equations"]

    def test_species_factors_exists(self):
        """Species factors resource should exist."""
        factors = RESOURCES_DIR / "species-factors.json"
        assert factors.exists()

    def test_species_factors_valid_json(self):
        """Species factors should be valid JSON."""
        factors = RESOURCES_DIR / "species-factors.json"
        with open(factors) as f:
            data = json.load(f)

        assert "fsveg_codes" in data

    def test_log_rules_exists(self):
        """Log rules resource should exist."""
        rules = RESOURCES_DIR / "log-rules.json"
        assert rules.exists()

    def test_log_rules_valid_json(self):
        """Log rules should be valid JSON."""
        rules = RESOURCES_DIR / "log-rules.json"
        with open(rules) as f:
            data = json.load(f)

        assert "rules" in data
        assert "scribner" in data["rules"]
        assert "conversion_table" in data

    def test_all_species_have_equations(self):
        """All FSVeg species should have volume equations."""
        factors = RESOURCES_DIR / "species-factors.json"
        tables = RESOURCES_DIR / "volume-tables.json"

        with open(factors) as f:
            factors_data = json.load(f)
        with open(tables) as f:
            tables_data = json.load(f)

        for species in factors_data["fsveg_codes"].keys():
            # Major species should have equations
            if species in ["PSME", "TSHE", "THPL", "PIPO", "PICO"]:
                assert species in tables_data["equations"]


# =============================================================================
# Volume Calculation Tests
# =============================================================================

class TestVolumeCalculation:
    """Test tree volume calculation logic."""

    @pytest.fixture
    def calculate_tree_volume(self):
        """Import volume calculation function."""
        from estimate_volume import calculate_tree_volume
        return calculate_tree_volume

    def test_douglas_fir_volume(self, calculate_tree_volume):
        """Douglas-fir volume calculation should use correct equation."""
        volume, reasoning = calculate_tree_volume("PSME", 28.0, 140.0, "scribner")
        assert volume > 0
        assert "PSME" in reasoning
        assert "28" in reasoning

    def test_larger_dbh_more_volume(self, calculate_tree_volume):
        """Larger DBH should produce more volume."""
        vol_small, _ = calculate_tree_volume("PSME", 20.0, 120.0)
        vol_large, _ = calculate_tree_volume("PSME", 30.0, 120.0)
        assert vol_large > vol_small

    def test_taller_tree_more_volume(self, calculate_tree_volume):
        """Taller tree should produce more volume."""
        vol_short, _ = calculate_tree_volume("PSME", 24.0, 100.0)
        vol_tall, _ = calculate_tree_volume("PSME", 24.0, 150.0)
        assert vol_tall > vol_short

    def test_scribner_log_rule(self, calculate_tree_volume):
        """Scribner log rule should work."""
        volume, _ = calculate_tree_volume("PSME", 28.0, 140.0, "scribner")
        assert volume > 1000  # Should be >1 MBF

    def test_doyle_log_rule_lower(self, calculate_tree_volume):
        """Doyle rule should give lower volume than Scribner."""
        vol_scribner, _ = calculate_tree_volume("PSME", 28.0, 140.0, "scribner")
        vol_doyle, _ = calculate_tree_volume("PSME", 28.0, 140.0, "doyle")
        assert vol_doyle < vol_scribner

    def test_international_log_rule_higher(self, calculate_tree_volume):
        """International rule should give higher volume than Scribner."""
        vol_scribner, _ = calculate_tree_volume("PSME", 28.0, 140.0, "scribner")
        vol_international, _ = calculate_tree_volume("PSME", 28.0, 140.0, "international")
        assert vol_international > vol_scribner

    def test_hemlock_volume(self, calculate_tree_volume):
        """Western hemlock volume calculation."""
        volume, reasoning = calculate_tree_volume("TSHE", 18.0, 95.0)
        assert volume > 0
        assert "TSHE" in reasoning

    def test_cedar_volume(self, calculate_tree_volume):
        """Western redcedar volume calculation."""
        volume, reasoning = calculate_tree_volume("THPL", 24.0, 115.0)
        assert volume > 0
        assert "THPL" in reasoning

    def test_unknown_species_defaults(self, calculate_tree_volume):
        """Unknown species should default to Douglas-fir equation."""
        volume, reasoning = calculate_tree_volume("UNKNOWN", 24.0, 120.0)
        assert volume > 0
        # Should still calculate volume


# =============================================================================
# Defect Deduction Tests
# =============================================================================

class TestDefectDeduction:
    """Test defect deduction logic."""

    @pytest.fixture
    def apply_defect_deduction(self):
        """Import defect deduction function."""
        from estimate_volume import apply_defect_deduction
        return apply_defect_deduction

    def test_zero_defect_no_reduction(self, apply_defect_deduction):
        """Zero defect should return full volume."""
        net, reasoning = apply_defect_deduction(1000, 0)
        assert net == 1000
        assert "0%" in reasoning

    def test_twenty_percent_defect(self, apply_defect_deduction):
        """20% defect should reduce volume by 20%."""
        net, reasoning = apply_defect_deduction(1000, 20)
        assert net == 800
        assert "20%" in reasoning

    def test_fifty_percent_defect(self, apply_defect_deduction):
        """50% defect should reduce volume by half."""
        net, reasoning = apply_defect_deduction(1000, 50)
        assert net == 500

    def test_negative_defect_treated_as_zero(self, apply_defect_deduction):
        """Negative defect should be treated as zero."""
        net, _ = apply_defect_deduction(1000, -10)
        assert net == 1000

    def test_over_100_defect_capped(self, apply_defect_deduction):
        """Defect over 100% should be capped at 100%."""
        net, _ = apply_defect_deduction(1000, 150)
        assert net == 0

    def test_reasoning_includes_values(self, apply_defect_deduction):
        """Reasoning should include gross and net values."""
        net, reasoning = apply_defect_deduction(1500, 25)
        assert "1.5" in reasoning  # 1500 BF = 1.5 MBF
        assert "25" in reasoning


# =============================================================================
# Species Aggregation Tests
# =============================================================================

class TestSpeciesAggregation:
    """Test species aggregation logic."""

    @pytest.fixture
    def aggregate_by_species(self):
        """Import aggregation function."""
        from estimate_volume import aggregate_by_species
        return aggregate_by_species

    def test_single_species(self, aggregate_by_species):
        """Single species should aggregate correctly."""
        trees = [
            {"species": "PSME", "dbh": 28.0, "net_bf": 1500},
            {"species": "PSME", "dbh": 24.0, "net_bf": 1200},
        ]
        result = aggregate_by_species(trees)
        assert "PSME" in result
        assert result["PSME"]["tree_count"] == 2
        assert result["PSME"]["volume_mbf"] == 2.7

    def test_multiple_species(self, aggregate_by_species):
        """Multiple species should be aggregated separately."""
        trees = [
            {"species": "PSME", "dbh": 28.0, "net_bf": 1500},
            {"species": "TSHE", "dbh": 18.0, "net_bf": 500},
        ]
        result = aggregate_by_species(trees)
        assert "PSME" in result
        assert "TSHE" in result
        assert result["PSME"]["tree_count"] == 1
        assert result["TSHE"]["tree_count"] == 1

    def test_percentages_sum_to_100(self, aggregate_by_species):
        """Species percentages should sum to approximately 100."""
        trees = [
            {"species": "PSME", "dbh": 28.0, "net_bf": 1500},
            {"species": "TSHE", "dbh": 18.0, "net_bf": 500},
            {"species": "THPL", "dbh": 24.0, "net_bf": 1000},
        ]
        result = aggregate_by_species(trees)
        total_pct = sum(s["percentage"] for s in result.values())
        assert abs(total_pct - 100.0) < 1.0

    def test_average_dbh_calculated(self, aggregate_by_species):
        """Average DBH should be calculated for each species."""
        trees = [
            {"species": "PSME", "dbh": 20.0, "net_bf": 1000},
            {"species": "PSME", "dbh": 30.0, "net_bf": 2000},
        ]
        result = aggregate_by_species(trees)
        assert result["PSME"]["avg_dbh"] == 25.0


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from estimate_volume import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_with_custom_trees(self, execute):
        """Execute should work with custom tree data."""
        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15},
                {"species": "PSME", "dbh": 24.0, "height": 130.0, "defect_pct": 20},
            ],
            "baf": 20,
        })

        assert result["fire_id"] == "test-fire"
        assert result["trees_analyzed"] == 2
        assert result["total_volume_mbf"] > 0
        assert "PSME" in result["species_breakdown"]

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should return detailed reasoning."""
        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15},
            ],
        })

        reasoning = result["reasoning_chain"]
        assert len(reasoning) > 0
        assert any("PSME" in r for r in reasoning)

    def test_execute_returns_species_breakdown(self, execute):
        """Execute should return species breakdown with percentages."""
        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15},
                {"species": "TSHE", "dbh": 18.0, "height": 95.0, "defect_pct": 30},
            ],
        })

        breakdown = result["species_breakdown"]
        assert "PSME" in breakdown
        assert "TSHE" in breakdown
        assert breakdown["PSME"]["percentage"] > 0
        assert breakdown["TSHE"]["percentage"] > 0

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide salvage recommendations."""
        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 30.0, "height": 150.0, "defect_pct": 10},
            ],
        })

        recommendations = result["recommendations"]
        assert len(recommendations) > 0

    def test_execute_returns_data_sources(self, execute):
        """Execute should cite data sources."""
        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15},
            ],
        })

        sources = result["data_sources"]
        assert len(sources) > 0
        assert any("PNW" in s or "equation" in s.lower() for s in sources)

    def test_execute_different_log_rules(self, execute):
        """Execute should respect log_rule parameter."""
        trees = [{"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15}]

        result_scribner = execute({
            "fire_id": "test",
            "trees": trees,
            "log_rule": "scribner",
        })

        result_doyle = execute({
            "fire_id": "test",
            "trees": trees,
            "log_rule": "doyle",
        })

        assert result_scribner["log_rule"] == "scribner"
        assert result_doyle["log_rule"] == "doyle"
        assert result_doyle["total_volume_mbf"] < result_scribner["total_volume_mbf"]

    def test_execute_without_defect(self, execute):
        """Execute should allow disabling defect deduction."""
        trees = [{"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 50}]

        result_with = execute({
            "fire_id": "test",
            "trees": trees,
            "include_defect": True,
        })

        result_without = execute({
            "fire_id": "test",
            "trees": trees,
            "include_defect": False,
        })

        assert result_without["total_volume_mbf"] > result_with["total_volume_mbf"]


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with Cedar Creek fixture."""

    def test_cedar_creek_plot_alpha(self):
        """Test volume estimation for Cedar Creek plot 47-ALPHA."""
        from estimate_volume import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "plot_id": "47-ALPHA",
            "baf": 20,
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["plot_id"] == "47-ALPHA"
        assert result["trees_analyzed"] == 6
        assert result["total_volume_mbf"] > 10  # Should be around 11 MBF per fixture
        assert "PSME" in result["species_breakdown"]

    def test_reasoning_chain_complete(self):
        """Reasoning chain should cover all trees."""
        from estimate_volume import execute

        result = execute({
            "fire_id": "test-fire",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 15},
                {"species": "TSHE", "dbh": 18.0, "height": 95.0, "defect_pct": 30},
            ],
        })

        reasoning = " ".join(result["reasoning_chain"])
        assert "Tree #1" in reasoning
        assert "Tree #2" in reasoning


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from estimate_volume import execute
        return execute

    def test_empty_trees_list(self, execute):
        """Empty trees list should return zero volume."""
        result = execute({
            "fire_id": "test",
            "trees": [],
        })
        assert result["total_volume_mbf"] == 0
        assert result["trees_analyzed"] == 0

    def test_very_small_tree(self, execute):
        """Very small tree should be skipped (non-merchantable)."""
        result = execute({
            "fire_id": "test",
            "trees": [
                {"species": "PSME", "dbh": 4.0, "height": 25.0, "defect_pct": 0},
            ],
        })
        assert result["trees_analyzed"] == 0

    def test_merchantable_minimum(self, execute):
        """Tree at merchantable minimum should be counted."""
        result = execute({
            "fire_id": "test",
            "trees": [
                {"species": "PSME", "dbh": 10.0, "height": 60.0, "defect_pct": 0},
            ],
        })
        assert result["trees_analyzed"] == 1
        assert result["total_volume_mbf"] > 0

    def test_very_large_tree(self, execute):
        """Very large tree should calculate correctly."""
        result = execute({
            "fire_id": "test",
            "trees": [
                {"species": "PSME", "dbh": 48.0, "height": 200.0, "defect_pct": 10},
            ],
        })
        assert result["total_volume_mbf"] > 5  # Should be substantial

    def test_100_percent_defect(self, execute):
        """100% defect should result in zero net volume."""
        result = execute({
            "fire_id": "test",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0, "defect_pct": 100},
            ],
        })
        # Tree should still be analyzed but contribute no volume
        assert result["trees_analyzed"] == 1
        assert result["total_volume_mbf"] == 0

    def test_missing_defect_uses_default(self, execute):
        """Missing defect should use default (20%)."""
        result = execute({
            "fire_id": "test",
            "trees": [
                {"species": "PSME", "dbh": 28.0, "height": 140.0},  # No defect_pct
            ],
        })
        assert result["trees_analyzed"] == 1
        assert result["total_volume_mbf"] > 0
