"""
Tests for CSV Insight skill.

Tests skill structure and analysis functionality.
"""

import json
from pathlib import Path

import pytest


# Skill paths
SKILL_DIR = Path(__file__).parent.parent
SKILL_MD = SKILL_DIR / "skill.md"
SCRIPTS_DIR = SKILL_DIR / "scripts"
RESOURCES_DIR = SKILL_DIR / "resources"
DATA_DIR = SKILL_DIR / "data"


class TestSkillStructure:
    """Test skill.md structure and required sections."""

    def test_skill_md_exists(self):
        """Skill definition file should exist."""
        assert SKILL_MD.exists(), "skill.md not found"

    def test_skill_md_has_required_sections(self):
        """Skill definition should have all required sections."""
        content = SKILL_MD.read_text()
        required_sections = [
            "# CSV Insight",
            "## Description",
            "## Triggers",
            "## Instructions",
            "## Inputs",
            "## Outputs",
            "## Reasoning Chain",
            "## Examples",
        ]
        for section in required_sections:
            assert section in content, f"Missing section: {section}"

    def test_skill_inputs_defined(self):
        """Inputs section should define required inputs."""
        content = SKILL_MD.read_text()
        assert "file_path" in content
        assert "analysis_type" in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        content = SKILL_MD.read_text()
        assert "success" in content
        assert "summary" in content
        assert "insights" in content

    def test_scripts_directory_exists(self):
        """Scripts directory should exist."""
        assert SCRIPTS_DIR.exists()

    def test_main_script_exists(self):
        """Main analysis script should exist."""
        assert (SCRIPTS_DIR / "analyze_csv.py").exists()

    def test_resources_directory_exists(self):
        """Resources directory should exist."""
        assert RESOURCES_DIR.exists()

    def test_sample_data_exists(self):
        """Sample cruise data should exist."""
        assert (DATA_DIR / "sample-cruise.csv").exists()


class TestResourceFiles:
    """Test resource files are valid JSON."""

    def test_column_mappings_valid_json(self):
        """Column mappings should be valid JSON."""
        mapping_file = RESOURCES_DIR / "column-mappings.json"
        assert mapping_file.exists()
        data = json.loads(mapping_file.read_text())
        assert "species_columns" in data
        assert "species_codes" in data
        assert "PSME" in data["species_codes"]

    def test_valid_ranges_valid_json(self):
        """Valid ranges should be valid JSON."""
        ranges_file = RESOURCES_DIR / "valid-ranges.json"
        assert ranges_file.exists()
        data = json.loads(ranges_file.read_text())
        assert "dbh" in data
        assert "height" in data
        assert data["dbh"]["min"] < data["dbh"]["max"]


class TestAnalyzeCsvModule:
    """Test the analyze_csv module can be imported."""

    def test_module_imports(self):
        """Analyze CSV module should import without errors."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            import analyze_csv
            assert hasattr(analyze_csv, "execute")
            assert hasattr(analyze_csv, "load_csv")
            assert hasattr(analyze_csv, "summarize_numeric")
            assert hasattr(analyze_csv, "analyze_species")
            assert hasattr(analyze_csv, "check_quality")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_execute_with_missing_file(self):
        """Execute should handle missing files gracefully."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": "/nonexistent/file.csv"
            })
            assert result["success"] is False
            assert "error" in result
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_execute_with_no_path(self):
        """Execute should error when no file_path provided."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({})
            assert result["success"] is False
            assert "No file_path" in result.get("error", "")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))


class TestSampleDataAnalysis:
    """Test analysis with sample cruise data."""

    def test_analyze_sample_cruise_data(self):
        """Should successfully analyze sample cruise CSV."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": str(DATA_DIR / "sample-cruise.csv")
            })
            assert result["success"] is True
            assert result["row_count"] == 26
            assert result["column_count"] == 7
            assert "species_breakdown" in result
            assert "insights" in result
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_species_breakdown(self):
        """Should correctly identify species distribution."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": str(DATA_DIR / "sample-cruise.csv")
            })
            species = result.get("species_breakdown", {}).get("by_species", {})
            assert "PSME" in species  # Douglas-fir
            assert "TSHE" in species  # Western hemlock
            assert "THPL" in species  # Western redcedar
            # PSME should be dominant
            assert species["PSME"]["percentage"] > 50
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_numeric_summaries(self):
        """Should calculate numeric statistics correctly."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": str(DATA_DIR / "sample-cruise.csv")
            })
            summary = result.get("summary", {})
            assert "dbh" in summary
            assert "height" in summary
            assert summary["dbh"]["min"] > 0
            assert summary["dbh"]["max"] < 100
            assert summary["dbh"]["mean"] > 0
        finally:
            sys.path.remove(str(SCRIPTS_DIR))


class TestQualityChecks:
    """Test data quality checking functionality."""

    def test_quality_score_calculated(self):
        """Quality score should be calculated."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": str(DATA_DIR / "sample-cruise.csv")
            })
            assert "quality_score" in result
            assert 0 <= result["quality_score"] <= 1
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_insights_generated(self):
        """Should generate insights from analysis."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from analyze_csv import execute
            result = execute({
                "file_path": str(DATA_DIR / "sample-cruise.csv")
            })
            insights = result.get("insights", [])
            assert len(insights) > 0
            # Should mention record count
            assert any("26" in i or "record" in i.lower() for i in insights)
        finally:
            sys.path.remove(str(SCRIPTS_DIR))
