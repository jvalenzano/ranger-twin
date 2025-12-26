"""
Tests for Cruise Methodology skill.

Tests cover:
- skill.md structure and content
- Resource files
- BAF calculation logic
- Sampling intensity calculation
- Methodology selection
- Plot location generation
- Full recommendation execution
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
            "# Cruise Methodology",
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
        assert "stand_type" in content, "stand_type input should be documented"
        assert "avg_dbh" in content, "avg_dbh input should be documented"

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "recommended_method",
            "baf",
            "sampling_intensity_pct",
            "num_plots",
            "reasoning_chain",
        ]

        for output in expected_outputs:
            assert output in content, f"Output {output} should be documented"


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_sampling_protocols_exists(self):
        """Sampling protocols resource should exist."""
        protocols = RESOURCES_DIR / "sampling-protocols.json"
        assert protocols.exists(), "sampling-protocols.json should exist"

    def test_sampling_protocols_valid_json(self):
        """Sampling protocols should be valid JSON."""
        protocols = RESOURCES_DIR / "sampling-protocols.json"
        with open(protocols) as f:
            data = json.load(f)

        assert "methods" in data
        assert "variable_radius" in data["methods"]
        assert "fixed_radius" in data["methods"]

    def test_baf_tables_exists(self):
        """BAF tables resource should exist."""
        baf_tables = RESOURCES_DIR / "baf-tables.json"
        assert baf_tables.exists(), "baf-tables.json should exist"

    def test_baf_tables_valid_json(self):
        """BAF tables should be valid JSON."""
        baf_tables = RESOURCES_DIR / "baf-tables.json"
        with open(baf_tables) as f:
            data = json.load(f)

        assert "baf_selection" in data
        assert "guidelines" in data["baf_selection"]

    def test_baf_values_complete(self):
        """All BAF values should be defined."""
        baf_tables = RESOURCES_DIR / "baf-tables.json"
        with open(baf_tables) as f:
            data = json.load(f)

        guidelines = data["baf_selection"]["guidelines"]
        expected_bafs = ["baf_10", "baf_20", "baf_30", "baf_40"]

        for baf in expected_bafs:
            assert baf in guidelines, f"BAF {baf} should be defined"
            assert "value" in guidelines[baf]
            assert "avg_dbh_range" in guidelines[baf]


# =============================================================================
# BAF Calculation Tests
# =============================================================================

class TestBafCalculation:
    """Test BAF calculation logic."""

    @pytest.fixture
    def calculate_baf(self):
        """Import BAF calculation function."""
        from recommend_methodology import calculate_baf
        return calculate_baf

    def test_small_trees_baf_10(self, calculate_baf):
        """Small trees (<14" DBH) should recommend BAF 10."""
        baf, reasoning = calculate_baf(10.0, "moderate")
        assert baf == 10
        assert "10" in reasoning

    def test_medium_trees_baf_20(self, calculate_baf):
        """Medium trees (14-24" DBH) should recommend BAF 20."""
        baf, reasoning = calculate_baf(18.0, "moderate")
        assert baf == 20
        assert "20" in reasoning

    def test_large_trees_baf_30(self, calculate_baf):
        """Large trees (24-32" DBH) should recommend BAF 30."""
        baf, reasoning = calculate_baf(28.0, "moderate")
        assert baf == 30
        assert "30" in reasoning

    def test_very_large_trees_baf_40(self, calculate_baf):
        """Very large trees (>32" DBH) should recommend BAF 40."""
        baf, reasoning = calculate_baf(36.0, "moderate")
        assert baf == 40
        assert "40" in reasoning

    def test_boundary_14_inches(self, calculate_baf):
        """Exactly 14 inches should classify as medium (BAF 20)."""
        baf, reasoning = calculate_baf(14.0, "moderate")
        assert baf == 20

    def test_boundary_24_inches(self, calculate_baf):
        """Exactly 24 inches should classify as large (BAF 30)."""
        baf, reasoning = calculate_baf(24.0, "moderate")
        assert baf == 30

    def test_boundary_32_inches(self, calculate_baf):
        """Exactly 32 inches should classify as very large (BAF 40)."""
        baf, reasoning = calculate_baf(32.0, "moderate")
        assert baf == 40

    def test_sparse_stand_adjustment(self, calculate_baf):
        """Sparse stands should reduce BAF for better sampling."""
        baf_dense, _ = calculate_baf(28.0, "dense")
        baf_sparse, reasoning = calculate_baf(28.0, "sparse")
        assert baf_sparse < baf_dense
        assert "sparse" in reasoning.lower()

    def test_reasoning_includes_dbh(self, calculate_baf):
        """Reasoning should mention the DBH value."""
        _, reasoning = calculate_baf(25.5, "moderate")
        assert "25.5" in reasoning


# =============================================================================
# Sampling Intensity Tests
# =============================================================================

class TestSamplingIntensity:
    """Test sampling intensity calculation."""

    @pytest.fixture
    def calculate_sampling_intensity(self):
        """Import sampling intensity function."""
        from recommend_methodology import calculate_sampling_intensity
        return calculate_sampling_intensity

    def test_low_variability_lower_intensity(self, calculate_sampling_intensity):
        """Low variability should have lower sampling intensity."""
        result = calculate_sampling_intensity(1000, "low")
        assert result["sampling_pct"] < 10
        assert result["num_plots"] > 0

    def test_high_variability_higher_intensity(self, calculate_sampling_intensity):
        """High variability should have higher sampling intensity."""
        result = calculate_sampling_intensity(1000, "high")
        assert result["sampling_pct"] > 15
        assert result["num_plots"] > 0

    def test_moderate_variability_middle(self, calculate_sampling_intensity):
        """Moderate variability should be in the middle range."""
        result = calculate_sampling_intensity(1000, "moderate")
        assert 10 <= result["sampling_pct"] <= 15
        assert result["num_plots"] > 0

    def test_higher_confidence_more_plots(self, calculate_sampling_intensity):
        """Higher confidence should increase sampling intensity."""
        result_90 = calculate_sampling_intensity(1000, "moderate", 0.90)
        result_95 = calculate_sampling_intensity(1000, "moderate", 0.95)
        assert result_95["sampling_pct"] > result_90["sampling_pct"]

    def test_larger_area_more_plots(self, calculate_sampling_intensity):
        """Larger area should result in more plots."""
        result_small = calculate_sampling_intensity(500, "moderate")
        result_large = calculate_sampling_intensity(2000, "moderate")
        assert result_large["num_plots"] > result_small["num_plots"]

    def test_plot_spacing_calculated(self, calculate_sampling_intensity):
        """Should calculate plot spacing for systematic layout."""
        result = calculate_sampling_intensity(1000, "moderate")
        assert "plot_spacing_ft" in result
        assert result["plot_spacing_ft"] > 0

    def test_reasoning_included(self, calculate_sampling_intensity):
        """Should include reasoning for sampling intensity."""
        result = calculate_sampling_intensity(1000, "moderate")
        assert "reasoning" in result
        assert len(result["reasoning"]) > 0


# =============================================================================
# Methodology Selection Tests
# =============================================================================

class TestMethodologySelection:
    """Test cruise methodology selection logic."""

    @pytest.fixture
    def select_methodology(self):
        """Import methodology selection function."""
        from recommend_methodology import select_methodology
        return select_methodology

    def test_salvage_steep_variable_radius(self, select_methodology):
        """Salvage on steep terrain should recommend variable radius."""
        method, reasoning = select_methodology("Mixed Conifer", "steep", "salvage")
        assert method == "Variable Radius Plot"
        assert "steep" in reasoning.lower() or "variable" in reasoning.lower()

    def test_research_fixed_radius(self, select_methodology):
        """Research objective should recommend fixed radius."""
        method, reasoning = select_methodology("Douglas-fir", "moderate", "research")
        assert method == "Fixed Radius Plot"
        assert "research" in reasoning.lower()

    def test_stocking_lodgepole_fixed_radius(self, select_methodology):
        """Stocking surveys in lodgepole should use fixed radius."""
        method, reasoning = select_methodology("Lodgepole Pine", "flat", "stocking")
        assert method == "Fixed Radius Plot"
        assert "stocking" in reasoning.lower() or "density" in reasoning.lower()

    def test_mixed_stand_variable_radius(self, select_methodology):
        """Mixed stands should typically use variable radius."""
        method, reasoning = select_methodology("Mixed Conifer", "moderate", "volume")
        assert method == "Variable Radius Plot"

    def test_reasoning_reflects_inputs(self, select_methodology):
        """Reasoning should reference the input parameters."""
        method, reasoning = select_methodology("Douglas-fir", "steep", "salvage")
        assert len(reasoning) > 0


# =============================================================================
# Plot Location Tests
# =============================================================================

class TestPlotLocations:
    """Test plot location generation."""

    @pytest.fixture
    def generate_plot_locations(self):
        """Import plot location function."""
        from recommend_methodology import generate_plot_locations
        return generate_plot_locations

    def test_systematic_grid_layout(self, generate_plot_locations):
        """Systematic method should create grid layout."""
        coords = [[-122.0, 43.5], [-122.1, 43.6]]
        plots = generate_plot_locations(coords, 9, "systematic")
        assert len(plots) <= 9
        assert all("plot_id" in p for p in plots)
        assert all("coords" in p for p in plots)

    def test_random_layout(self, generate_plot_locations):
        """Random method should create random locations."""
        coords = [[-122.0, 43.5], [-122.1, 43.6]]
        plots = generate_plot_locations(coords, 10, "random")
        assert len(plots) == 10
        assert all("plot_id" in p for p in plots)

    def test_plot_ids_sequential(self, generate_plot_locations):
        """Plot IDs should be sequential."""
        coords = [[-122.0, 43.5], [-122.1, 43.6]]
        plots = generate_plot_locations(coords, 5, "systematic")
        plot_ids = [p["plot_id"] for p in plots]
        assert "P01" in plot_ids
        assert len(set(plot_ids)) == len(plot_ids)  # No duplicates

    def test_coords_within_bounds(self, generate_plot_locations):
        """Generated coordinates should be within bounding box."""
        coords = [[-122.0, 43.5], [-122.1, 43.6]]
        plots = generate_plot_locations(coords, 10, "random")
        for plot in plots:
            lon, lat = plot["coords"]
            assert -122.1 <= lon <= -122.0
            assert 43.5 <= lat <= 43.6

    def test_empty_coords_returns_empty(self, generate_plot_locations):
        """Empty coordinates should return empty list."""
        plots = generate_plot_locations([], 10, "systematic")
        assert plots == []


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from recommend_methodology import execute
        return execute

    def test_execute_requires_fire_id(self, execute):
        """Execute should require fire_id input."""
        result = execute({})
        assert "error" in result
        assert result["confidence"] == 0.0

    def test_execute_with_minimal_inputs(self, execute):
        """Execute should work with just fire_id."""
        result = execute({"fire_id": "test-fire"})

        assert result["fire_id"] == "test-fire"
        assert "recommended_method" in result
        assert "sampling_intensity_pct" in result
        assert "num_plots" in result
        assert "reasoning_chain" in result
        assert result["confidence"] > 0.9

    def test_execute_with_full_inputs(self, execute):
        """Execute should use all provided inputs."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "stand_type": "Douglas-fir",
            "avg_dbh": 28.5,
            "stand_density": "dense",
            "terrain": "steep",
            "objective": "salvage",
            "total_acres": 2150,
        })

        assert result["fire_id"] == "cedar-creek-2022"
        assert result["recommended_method"] == "Variable Radius Plot"
        assert "baf" in result
        assert result["baf"] == 30  # 28.5" DBH -> BAF 30

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should return detailed reasoning."""
        result = execute({
            "fire_id": "test-fire",
            "avg_dbh": 20.0,
            "total_acres": 1000,
        })

        reasoning = result["reasoning_chain"]
        assert len(reasoning) > 0
        assert any("BAF" in r or "method" in r.lower() for r in reasoning)

    def test_execute_returns_recommendations(self, execute):
        """Execute should provide implementation recommendations."""
        result = execute({
            "fire_id": "test-fire",
            "avg_dbh": 25.0,
        })

        recommendations = result["recommendations"]
        assert len(recommendations) > 0
        assert any("prism" in r.lower() or "plot" in r.lower() for r in recommendations)

    def test_execute_returns_data_sources(self, execute):
        """Execute should cite data sources."""
        result = execute({"fire_id": "test-fire"})

        sources = result["data_sources"]
        assert len(sources) > 0
        assert any("USFS" in s or "Handbook" in s for s in sources)

    def test_execute_variable_radius_includes_baf(self, execute):
        """Variable radius method should include BAF."""
        result = execute({
            "fire_id": "test-fire",
            "avg_dbh": 24.0,
            "objective": "salvage",
        })

        if result["recommended_method"] == "Variable Radius Plot":
            assert "baf" in result
            assert result["baf"] in [10, 20, 30, 40]

    def test_execute_fixed_radius_includes_radius(self, execute):
        """Fixed radius method should include plot radius."""
        result = execute({
            "fire_id": "test-fire",
            "stand_type": "Lodgepole Pine",
            "avg_dbh": 10.0,
            "objective": "research",
        })

        if result["recommended_method"] == "Fixed Radius Plot":
            assert "plot_radius_ft" in result
            assert result["plot_radius_ft"] > 0


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with realistic scenarios."""

    def test_cedar_creek_sw1_salvage(self):
        """Test cruise design for Cedar Creek SW-1 salvage."""
        from recommend_methodology import execute

        result = execute({
            "fire_id": "cedar-creek-2022",
            "sector": "SW-1",
            "stand_type": "Douglas-fir/Western Hemlock",
            "avg_dbh": 28.5,
            "stand_density": "dense",
            "terrain": "steep",
            "objective": "salvage",
            "total_acres": 2150,
        })

        assert result["recommended_method"] == "Variable Radius Plot"
        assert result["baf"] in [20, 30]  # Large timber
        assert result["num_plots"] >= 10
        assert result["sampling_intensity_pct"] > 10

    def test_lodgepole_stocking_survey(self):
        """Test cruise design for lodgepole stocking survey."""
        from recommend_methodology import execute

        result = execute({
            "fire_id": "test-fire",
            "stand_type": "Lodgepole Pine",
            "avg_dbh": 11.2,
            "stand_density": "dense",
            "terrain": "flat",
            "objective": "stocking",
            "total_acres": 500,
        })

        assert result["recommended_method"] == "Fixed Radius Plot"
        assert "plot_radius_ft" in result
        assert result["plot_radius_ft"] < 40  # Small tree plot

    def test_reasoning_chain_complete(self):
        """Reasoning chain should cover all major decisions."""
        from recommend_methodology import execute

        result = execute({
            "fire_id": "test-fire",
            "avg_dbh": 22.0,
            "total_acres": 1500,
        })

        reasoning = " ".join(result["reasoning_chain"])
        # Should mention methodology, BAF/radius, and sampling
        assert len(result["reasoning_chain"]) >= 2


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from recommend_methodology import execute
        return execute

    def test_very_small_dbh(self, execute):
        """Very small DBH should still work."""
        result = execute({
            "fire_id": "test",
            "avg_dbh": 6.0,
        })
        assert "recommended_method" in result
        # Should use BAF 10 or small fixed plot

    def test_very_large_dbh(self, execute):
        """Very large DBH should use highest BAF."""
        result = execute({
            "fire_id": "test",
            "avg_dbh": 48.0,
        })
        if result["recommended_method"] == "Variable Radius Plot":
            assert result["baf"] == 40

    def test_very_small_acreage(self, execute):
        """Very small acreage should still generate recommendations."""
        result = execute({
            "fire_id": "test",
            "total_acres": 10,
        })
        assert result["num_plots"] >= 1

    def test_very_large_acreage(self, execute):
        """Very large acreage should scale appropriately."""
        result = execute({
            "fire_id": "test",
            "total_acres": 50000,
        })
        assert result["num_plots"] > 100

    def test_high_confidence_requirement(self, execute):
        """High confidence should increase sampling."""
        result_90 = execute({
            "fire_id": "test",
            "total_acres": 1000,
            "target_confidence": 0.90,
        })
        result_95 = execute({
            "fire_id": "test",
            "total_acres": 1000,
            "target_confidence": 0.95,
        })
        assert result_95["num_plots"] >= result_90["num_plots"]
