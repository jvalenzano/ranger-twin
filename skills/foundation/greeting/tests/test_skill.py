"""Tests for the Greeting skill."""

import pytest
from pathlib import Path


def test_skill_md_exists():
    """Skill definition file should exist."""
    skill_path = Path(__file__).parent.parent / "skill.md"
    assert skill_path.exists(), "skill.md should exist"


def test_skill_md_has_required_sections():
    """Skill definition should have all required sections."""
    skill_path = Path(__file__).parent.parent / "skill.md"
    content = skill_path.read_text()

    required_sections = [
        "## Description",
        "## Triggers",
        "## Instructions",
        "## Inputs",
        "## Outputs",
    ]

    for section in required_sections:
        assert section in content, f"skill.md should contain {section}"


def test_skill_md_has_examples():
    """Skill definition should have examples for few-shot learning."""
    skill_path = Path(__file__).parent.parent / "skill.md"
    content = skill_path.read_text()

    assert "## Examples" in content, "skill.md should contain Examples section"
    assert "Example 1" in content, "skill.md should have at least one example"


def test_skill_inputs_table_format():
    """Inputs section should use proper table format."""
    skill_path = Path(__file__).parent.parent / "skill.md"
    content = skill_path.read_text()

    # Check for table header pattern
    assert "| Input | Type | Required | Description |" in content
    assert "user_message" in content, "Should have user_message input"


def test_skill_outputs_table_format():
    """Outputs section should use proper table format."""
    skill_path = Path(__file__).parent.parent / "skill.md"
    content = skill_path.read_text()

    # Check for table header pattern
    assert "| Output | Type | Description |" in content
    assert "greeting" in content, "Should have greeting output"
