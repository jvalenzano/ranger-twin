"""
Tests for PDF Extraction skill.

Tests skill structure and extraction functionality.
"""

import json
from pathlib import Path

import pytest


# Skill paths
SKILL_DIR = Path(__file__).parent.parent
SKILL_MD = SKILL_DIR / "skill.md"
SCRIPTS_DIR = SKILL_DIR / "scripts"
RESOURCES_DIR = SKILL_DIR / "resources"


class TestSkillStructure:
    """Test skill.md structure and required sections."""

    def test_skill_md_exists(self):
        """Skill definition file should exist."""
        assert SKILL_MD.exists(), "skill.md not found"

    def test_skill_md_has_required_sections(self):
        """Skill definition should have all required sections."""
        content = SKILL_MD.read_text()
        required_sections = [
            "# PDF Extraction",
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
        assert "extraction_mode" in content

    def test_skill_outputs_defined(self):
        """Outputs section should define expected outputs."""
        content = SKILL_MD.read_text()
        assert "success" in content
        assert "extracted_text" in content
        assert "tables" in content

    def test_scripts_directory_exists(self):
        """Scripts directory should exist."""
        assert SCRIPTS_DIR.exists()

    def test_main_script_exists(self):
        """Main extraction script should exist."""
        assert (SCRIPTS_DIR / "extract_pdf.py").exists()

    def test_resources_directory_exists(self):
        """Resources directory should exist."""
        assert RESOURCES_DIR.exists()


class TestResourceFiles:
    """Test resource files are valid JSON."""

    def test_fsh_patterns_valid_json(self):
        """FSH patterns should be valid JSON."""
        fsh_file = RESOURCES_DIR / "fsh-section-patterns.json"
        assert fsh_file.exists()
        data = json.loads(fsh_file.read_text())
        assert "patterns" in data
        assert "chapter" in data["patterns"]

    def test_fsm_patterns_valid_json(self):
        """FSM patterns should be valid JSON."""
        fsm_file = RESOURCES_DIR / "fsm-section-patterns.json"
        assert fsm_file.exists()
        data = json.loads(fsm_file.read_text())
        assert "patterns" in data
        assert "section" in data["patterns"]


class TestExtractPdfModule:
    """Test the extract_pdf module can be imported."""

    def test_module_imports(self):
        """Extract PDF module should import without errors."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            import extract_pdf
            assert hasattr(extract_pdf, "execute")
            assert hasattr(extract_pdf, "extract_full_text")
            assert hasattr(extract_pdf, "extract_section")
            assert hasattr(extract_pdf, "extract_pages")
            assert hasattr(extract_pdf, "extract_tables")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_execute_with_missing_file(self):
        """Execute should handle missing files gracefully."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import execute
            result = execute({
                "file_path": "/nonexistent/file.pdf",
                "extraction_mode": "full"
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
            from extract_pdf import execute
            result = execute({})
            assert result["success"] is False
            assert "No file_path" in result.get("error", "")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_execute_with_invalid_mode(self):
        """Execute should error on invalid extraction mode."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import execute
            result = execute({
                "file_path": "test.pdf",
                "extraction_mode": "invalid_mode"
            })
            assert result["success"] is False
            assert "Unknown extraction_mode" in result.get("error", "")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_section_mode_requires_section_number(self):
        """Section mode should require section_number parameter."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import execute
            result = execute({
                "file_path": "test.pdf",
                "extraction_mode": "section"
            })
            assert result["success"] is False
            assert "section_number required" in result.get("error", "")
        finally:
            sys.path.remove(str(SCRIPTS_DIR))


class TestTableToMarkdown:
    """Test table conversion to markdown."""

    def test_simple_table_conversion(self):
        """Simple table should convert to markdown correctly."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import _table_to_markdown

            table = [
                ["Header 1", "Header 2"],
                ["Row 1 Col 1", "Row 1 Col 2"],
                ["Row 2 Col 1", "Row 2 Col 2"],
            ]

            md = _table_to_markdown(table)
            assert "| Header 1 | Header 2 |" in md
            assert "|---|---|" in md
            assert "| Row 1 Col 1 | Row 1 Col 2 |" in md
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_empty_table_returns_empty(self):
        """Empty table should return empty string."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import _table_to_markdown
            assert _table_to_markdown([]) == ""
            assert _table_to_markdown(None) == ""
        finally:
            sys.path.remove(str(SCRIPTS_DIR))

    def test_table_with_none_cells(self):
        """Table with None cells should handle gracefully."""
        import sys
        sys.path.insert(0, str(SCRIPTS_DIR))
        try:
            from extract_pdf import _table_to_markdown
            table = [
                ["Header", None],
                [None, "Value"],
            ]
            md = _table_to_markdown(table)
            assert "| Header |  |" in md
            assert "|  | Value |" in md
        finally:
            sys.path.remove(str(SCRIPTS_DIR))
