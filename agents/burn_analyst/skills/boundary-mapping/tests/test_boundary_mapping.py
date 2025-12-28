"""
Tests for Boundary Mapping skill.

Tests cover:
- skill.md structure and content
- Geometry validation functions
- Perimeter and area calculations
- Coordinate validation
- Full boundary validation execution
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
            "# Boundary Mapping",
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
        assert "tolerance" in content, "tolerance input should be documented"

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        skill_md = SKILL_DIR / "skill.md"
        content = skill_md.read_text()

        expected_outputs = [
            "total_perimeter_km",
            "reported_acres",
            "calculated_acres",
            "geometry_issues",
            "validation_status",
            "reasoning_chain",
        ]

        for output in expected_outputs:
            assert output in content, f"Output {output} should be documented"


# =============================================================================
# Resources Tests
# =============================================================================

class TestResources:
    """Test resource files."""

    def test_geometry_standards_exists(self):
        """Geometry standards resource should exist."""
        standards = RESOURCES_DIR / "geometry-standards.json"
        assert standards.exists(), "geometry-standards.json should exist"

    def test_geometry_standards_valid_json(self):
        """Geometry standards should be valid JSON."""
        standards = RESOURCES_DIR / "geometry-standards.json"
        with open(standards) as f:
            data = json.load(f)

        assert "validation_thresholds" in data
        assert "coordinate_ranges" in data
        assert "geometry_issues" in data

    def test_validation_thresholds_defined(self):
        """Validation thresholds should be defined."""
        standards = RESOURCES_DIR / "geometry-standards.json"
        with open(standards) as f:
            data = json.load(f)

        thresholds = data["validation_thresholds"]
        assert "acreage_tolerance_pct" in thresholds
        assert "minimum_polygon_points" in thresholds


# =============================================================================
# Geometry Validation Tests
# =============================================================================

class TestGeometryValidation:
    """Test geometry validation functions."""

    @pytest.fixture
    def validate_polygon_closure(self):
        """Import closure validation function."""
        from validate_boundary import validate_polygon_closure
        return validate_polygon_closure

    @pytest.fixture
    def validate_coordinate_range(self):
        """Import coordinate range validation function."""
        from validate_boundary import validate_coordinate_range
        return validate_coordinate_range

    def test_closed_polygon_valid(self, validate_polygon_closure):
        """Closed polygon (first = last point) should pass."""
        coords = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
        assert validate_polygon_closure(coords) is True

    def test_unclosed_polygon_invalid(self, validate_polygon_closure):
        """Unclosed polygon should fail."""
        coords = [[0, 0], [1, 0], [1, 1], [0, 1]]
        assert validate_polygon_closure(coords) is False

    def test_too_few_points_invalid(self, validate_polygon_closure):
        """Polygon with less than 3 points should fail."""
        coords = [[0, 0], [1, 1]]
        assert validate_polygon_closure(coords) is False

    def test_valid_coordinates(self, validate_coordinate_range):
        """Valid WGS84 coordinates should pass."""
        coords = [[-122.0, 43.7], [-121.9, 43.8], [-122.0, 43.7]]
        is_valid, error = validate_coordinate_range(coords)
        assert is_valid is True
        assert error is None

    def test_invalid_longitude(self, validate_coordinate_range):
        """Longitude outside [-180, 180] should fail."""
        coords = [[-200.0, 43.7], [-121.9, 43.8]]
        is_valid, error = validate_coordinate_range(coords)
        assert is_valid is False
        assert "Longitude" in error

    def test_invalid_latitude(self, validate_coordinate_range):
        """Latitude outside [-90, 90] should fail."""
        coords = [[-122.0, 95.0], [-121.9, 43.8]]
        is_valid, error = validate_coordinate_range(coords)
        assert is_valid is False
        assert "Latitude" in error


# =============================================================================
# Calculation Tests
# =============================================================================

class TestCalculations:
    """Test perimeter and area calculation functions."""

    @pytest.fixture
    def calculate_perimeter(self):
        """Import perimeter calculation function."""
        from validate_boundary import calculate_polygon_perimeter
        return calculate_polygon_perimeter

    @pytest.fixture
    def calculate_area(self):
        """Import area calculation function."""
        from validate_boundary import calculate_polygon_area_acres
        return calculate_polygon_area_acres

    def test_perimeter_simple_square(self, calculate_perimeter):
        """Calculate perimeter of a small square."""
        # ~0.01 degree square near equator
        coords = [[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]]
        perimeter = calculate_perimeter(coords)
        # Should be roughly 4 * 1.1 km = 4.4 km
        assert 4.0 < perimeter < 5.0

    def test_perimeter_empty_polygon(self, calculate_perimeter):
        """Empty coordinate list should return 0."""
        perimeter = calculate_perimeter([])
        assert perimeter == 0.0

    def test_area_simple_square(self, calculate_area):
        """Calculate area of a small square."""
        # ~0.05 degree square (roughly 5.5 km x 5.5 km at mid-latitude)
        coords = [
            [-122.0, 43.7],
            [-121.95, 43.7],
            [-121.95, 43.75],
            [-122.0, 43.75],
            [-122.0, 43.7]
        ]
        area = calculate_area(coords)
        # Should be roughly 7,500 acres (30 sq km)
        assert 5000 < area < 15000

    def test_area_empty_polygon(self, calculate_area):
        """Empty coordinate list should return 0."""
        area = calculate_area([])
        assert area == 0.0


# =============================================================================
# Execute Function Tests
# =============================================================================

class TestExecute:
    """Test the main execute function."""

    @pytest.fixture
    def execute(self):
        """Import execute function."""
        from validate_boundary import execute
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
        assert "total_perimeter_km" in result
        assert "reported_acres" in result
        assert "calculated_acres" in result
        assert "validation_status" in result

    def test_execute_returns_sector_boundaries(self, execute):
        """Execute should return sector boundary statistics."""
        result = execute({"fire_id": "cedar-creek-2022"})

        boundaries = result["sector_boundaries"]
        assert len(boundaries) == 8

        for sector in boundaries:
            assert "id" in sector
            assert "perimeter_km" in sector
            assert "calculated_acres" in sector
            assert "is_valid" in sector

    def test_execute_returns_validation_status(self, execute):
        """Execute should return validation status."""
        result = execute({"fire_id": "cedar-creek-2022"})

        status = result["validation_status"]
        assert status in ["VALID", "WARNING", "INVALID"]

    def test_execute_returns_reasoning_chain(self, execute):
        """Execute should document reasoning steps."""
        result = execute({"fire_id": "cedar-creek-2022"})

        chain = result["reasoning_chain"]
        assert len(chain) >= 2
        assert any("sector" in step.lower() for step in chain)

    def test_execute_with_custom_sectors(self, execute):
        """Execute should accept custom sector data."""
        custom_sectors = [
            {
                "id": "TEST-1",
                "name": "Test Sector",
                "acres": 1000,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]]]
                }
            }
        ]

        result = execute({
            "fire_id": "test-fire",
            "sectors": custom_sectors,
        })

        assert result["fire_id"] == "test-fire"
        assert len(result["sector_boundaries"]) == 1
        assert result["sector_boundaries"][0]["is_valid"] is True

    def test_execute_unknown_fire(self, execute):
        """Execute should handle unknown fire IDs."""
        result = execute({"fire_id": "nonexistent-fire"})
        assert "error" in result

    def test_execute_with_custom_tolerance(self, execute):
        """Execute should respect custom tolerance."""
        result = execute({
            "fire_id": "cedar-creek-2022",
            "tolerance": 1.0
        })
        assert "validation_status" in result


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests with fixture data."""

    def test_cedar_creek_all_sectors_valid(self):
        """All Cedar Creek sectors should have valid geometry."""
        from validate_boundary import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        boundaries = result["sector_boundaries"]

        for sector in boundaries:
            assert sector["is_valid"] is True, f"Sector {sector['id']} should be valid"

    def test_cedar_creek_no_geometry_issues(self):
        """Cedar Creek should have no geometry issues."""
        from validate_boundary import execute

        result = execute({"fire_id": "cedar-creek-2022"})
        assert len(result["geometry_issues"]) == 0

    def test_cedar_creek_reasonable_acreage(self):
        """Calculated acreage should be positive and plausible."""
        from validate_boundary import execute

        result = execute({"fire_id": "cedar-creek-2022"})

        calculated = result["calculated_acres"]

        # Fixture uses simplified rectangular geometries, so exact match
        # is not expected. Just verify calculation produces reasonable values.
        assert calculated > 50000, "Calculated acres should be substantial"
        assert calculated < 150000, "Calculated acres should be plausible"

    def test_cedar_creek_perimeter_reasonable(self):
        """Total perimeter should be reasonable for fire size."""
        from validate_boundary import execute

        result = execute({"fire_id": "cedar-creek-2022"})

        perimeter = result["total_perimeter_km"]
        # ~127k acres, perimeter should be substantial
        assert perimeter > 100, "Perimeter should be > 100 km"
        assert perimeter < 500, "Perimeter should be < 500 km"


# =============================================================================
# Edge Cases
# =============================================================================

class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.fixture
    def execute(self):
        from validate_boundary import execute
        return execute

    def test_empty_sectors_list(self, execute):
        """Empty sectors list should return INVALID status."""
        result = execute({
            "fire_id": "test",
            "sectors": [],
        })
        assert result["validation_status"] == "INVALID"
        assert result["total_perimeter_km"] == 0

    def test_sector_without_geometry(self, execute):
        """Sector without geometry should generate warning."""
        result = execute({
            "fire_id": "test",
            "sectors": [{"id": "T1", "name": "Test", "acres": 100}],
        })

        issues = result["geometry_issues"]
        assert len(issues) == 1
        assert issues[0]["issue_type"] == "MISSING_GEOMETRY"

    def test_unclosed_polygon(self, execute):
        """Unclosed polygon should generate error."""
        result = execute({
            "fire_id": "test",
            "sectors": [{
                "id": "T1",
                "name": "Test",
                "acres": 100,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1]]]  # Not closed
                }
            }],
        })

        issues = result["geometry_issues"]
        assert any(i["issue_type"] == "NOT_CLOSED" for i in issues)
        assert result["validation_status"] == "INVALID"

    def test_invalid_coordinates(self, execute):
        """Invalid coordinates should generate error."""
        result = execute({
            "fire_id": "test",
            "sectors": [{
                "id": "T1",
                "name": "Test",
                "acres": 100,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-200, 0], [1, 0], [1, 1], [-200, 0]]]  # Invalid lon
                }
            }],
        })

        issues = result["geometry_issues"]
        assert any(i["issue_type"] == "INVALID_COORDINATES" for i in issues)

    def test_very_small_polygon(self, execute):
        """Very small polygon should still calculate without error."""
        result = execute({
            "fire_id": "test",
            "sectors": [{
                "id": "T1",
                "name": "Test",
                "acres": 1,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]]
                }
            }],
        })

        # Very small polygon should calculate without error
        # 0.001 degree ~ 100m, so area ~ 1 hectare ~ 2.5 acres
        assert result["sector_boundaries"][0]["calculated_acres"] >= 0
        assert result["sector_boundaries"][0]["perimeter_km"] > 0
        assert result["sector_boundaries"][0]["is_valid"] is True
