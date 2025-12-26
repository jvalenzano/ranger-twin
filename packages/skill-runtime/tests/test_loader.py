"""
Tests for skill loader functionality.

Verifies skill discovery, metadata parsing, and script execution.
"""

import sys
from pathlib import Path

import pytest

from skill_runtime.loader import (
    SkillMetadata,
    discover_skills,
    execute_skill,
    load_skill_script,
    parse_skill_md,
)


# Path to test fixtures
SKILLS_ROOT = Path(__file__).parent.parent.parent.parent / "skills"
TEMPLATE_SKILL = SKILLS_ROOT / "foundation" / "_template"
GREETING_SKILL = SKILLS_ROOT / "foundation" / "greeting"


class TestParseSkillMd:
    """Test skill.md parsing."""

    def test_parse_template_skill(self):
        """Can parse the template skill.md."""
        if not (TEMPLATE_SKILL / "skill.md").exists():
            pytest.skip("Template skill not found")

        metadata = parse_skill_md(TEMPLATE_SKILL / "skill.md")

        assert metadata.name == "Echo Skill"
        assert "demonstration" in metadata.description.lower()
        assert len(metadata.triggers) > 0
        assert len(metadata.inputs) > 0
        assert len(metadata.outputs) > 0

    def test_parse_greeting_skill(self):
        """Can parse the greeting skill.md."""
        if not (GREETING_SKILL / "skill.md").exists():
            pytest.skip("Greeting skill not found")

        metadata = parse_skill_md(GREETING_SKILL / "skill.md")

        assert metadata.name == "Greeting Skill"
        assert metadata.path == GREETING_SKILL

    def test_parse_nonexistent_file(self):
        """Raises FileNotFoundError for missing skill.md."""
        with pytest.raises(FileNotFoundError):
            parse_skill_md(Path("/nonexistent/skill.md"))

    def test_metadata_has_scripts_property(self):
        """Metadata reports whether skill has scripts."""
        if not (TEMPLATE_SKILL / "skill.md").exists():
            pytest.skip("Template skill not found")

        metadata = parse_skill_md(TEMPLATE_SKILL / "skill.md")

        # Template skill should have scripts
        if (TEMPLATE_SKILL / "scripts").exists():
            assert metadata.has_scripts is True

    def test_metadata_to_dict(self):
        """Metadata can be converted to dict."""
        if not (TEMPLATE_SKILL / "skill.md").exists():
            pytest.skip("Template skill not found")

        metadata = parse_skill_md(TEMPLATE_SKILL / "skill.md")
        data = metadata.to_dict()

        assert "name" in data
        assert "description" in data
        assert "path" in data
        assert "has_scripts" in data


class TestDiscoverSkills:
    """Test skill discovery."""

    def test_discover_foundation_skills(self):
        """Can discover skills in foundation directory."""
        foundation_path = SKILLS_ROOT / "foundation"
        if not foundation_path.exists():
            pytest.skip("Foundation skills directory not found")

        skills = discover_skills([foundation_path])

        # Should find greeting skill (template is skipped)
        skill_names = [s.name for s in skills]
        assert "Greeting Skill" in skill_names

    def test_discover_skips_template(self):
        """Discovery skips _template directory."""
        foundation_path = SKILLS_ROOT / "foundation"
        if not foundation_path.exists():
            pytest.skip("Foundation skills directory not found")

        skills = discover_skills([foundation_path])

        # Template should not be in results
        for skill in skills:
            assert "_template" not in str(skill.path)

    def test_discover_handles_missing_path(self):
        """Discovery handles nonexistent paths gracefully."""
        skills = discover_skills(["/nonexistent/path"])
        assert skills == []

    def test_discover_multiple_paths(self):
        """Can discover from multiple paths."""
        paths = [
            SKILLS_ROOT / "foundation",
            SKILLS_ROOT / "forest-service",
        ]

        skills = discover_skills(paths)
        # Should find at least the greeting skill
        assert len(skills) >= 1


class TestLoadSkillScript:
    """Test script loading."""

    def test_load_echo_script(self):
        """Can load the echo script from template."""
        if not (TEMPLATE_SKILL / "scripts" / "echo.py").exists():
            pytest.skip("Echo script not found")

        module = load_skill_script(TEMPLATE_SKILL, "echo")

        assert hasattr(module, "execute")
        assert callable(module.execute)

    def test_load_with_py_extension(self):
        """Can load script with .py extension."""
        if not (TEMPLATE_SKILL / "scripts" / "echo.py").exists():
            pytest.skip("Echo script not found")

        module = load_skill_script(TEMPLATE_SKILL, "echo.py")
        assert hasattr(module, "execute")

    def test_load_nonexistent_script(self):
        """Raises FileNotFoundError for missing script."""
        with pytest.raises(FileNotFoundError):
            load_skill_script(TEMPLATE_SKILL, "nonexistent")


class TestExecuteSkill:
    """Test skill execution."""

    def test_execute_echo_skill(self):
        """Can execute the echo skill."""
        if not (TEMPLATE_SKILL / "scripts" / "echo.py").exists():
            pytest.skip("Echo script not found")

        result = execute_skill(
            TEMPLATE_SKILL,
            "echo",
            {"message": "Hello, RANGER!"}
        )

        assert result["echo"] == "Hello, RANGER!"
        assert "metadata" in result
        assert "reasoning_chain" in result

    def test_execute_echo_with_uppercase(self):
        """Echo skill respects uppercase option."""
        if not (TEMPLATE_SKILL / "scripts" / "echo.py").exists():
            pytest.skip("Echo script not found")

        result = execute_skill(
            TEMPLATE_SKILL,
            "echo",
            {"message": "test", "uppercase": True}
        )

        assert result["echo"] == "TEST"
        assert result["metadata"]["transformed"] is True

    def test_execute_missing_entry_point(self):
        """Raises AttributeError if entry point not found."""
        if not (TEMPLATE_SKILL / "scripts" / "echo.py").exists():
            pytest.skip("Echo script not found")

        with pytest.raises(AttributeError, match="nonexistent"):
            execute_skill(
                TEMPLATE_SKILL,
                "echo",
                {},
                entry_point="nonexistent"
            )


class TestIntegration:
    """Integration tests with real skills."""

    def test_discover_parse_execute_flow(self):
        """Full flow: discover -> parse -> execute."""
        foundation_path = SKILLS_ROOT / "foundation"
        if not foundation_path.exists():
            pytest.skip("Foundation skills not found")

        # Discover
        skills = discover_skills([foundation_path])
        assert len(skills) >= 1

        # Find template manually for execution test
        template_md = TEMPLATE_SKILL / "skill.md"
        if not template_md.exists():
            pytest.skip("Template skill not found")

        # Parse
        metadata = parse_skill_md(template_md)
        assert metadata.name == "Echo Skill"

        # Execute (if scripts exist)
        if metadata.has_scripts:
            result = execute_skill(
                metadata.path,
                "echo",
                {"message": "Integration test"}
            )
            assert result["echo"] == "Integration test"
