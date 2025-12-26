"""
RANGER Skill Runtime - Skill Loader

Provides utilities for discovering, loading, and validating skills.
Skills follow the structure defined in docs/specs/skill-format.md.

Phase 2 Implementation:
- Basic skill discovery and loading
- Skill metadata parsing from skill.md
- Script execution support
"""

import importlib.util
import sys
from pathlib import Path
from typing import Any


class SkillMetadata:
    """Parsed skill metadata from skill.md."""

    def __init__(
        self,
        name: str,
        description: str,
        triggers: list[str],
        inputs: list[dict],
        outputs: list[dict],
        path: Path,
    ):
        self.name = name
        self.description = description
        self.triggers = triggers
        self.inputs = inputs
        self.outputs = outputs
        self.path = path
        self.scripts_dir = path / "scripts"
        self.resources_dir = path / "resources"
        self.tests_dir = path / "tests"

    @property
    def has_scripts(self) -> bool:
        """Check if skill has executable scripts."""
        return self.scripts_dir.exists() and any(self.scripts_dir.glob("*.py"))

    @property
    def has_resources(self) -> bool:
        """Check if skill has resource files."""
        return self.resources_dir.exists() and any(self.resources_dir.glob("*.json"))

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "name": self.name,
            "description": self.description,
            "triggers": self.triggers,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "path": str(self.path),
            "has_scripts": self.has_scripts,
            "has_resources": self.has_resources,
        }


def parse_skill_md(skill_md_path: Path) -> SkillMetadata:
    """
    Parse skill.md to extract metadata.

    Args:
        skill_md_path: Path to skill.md file

    Returns:
        SkillMetadata object

    Raises:
        FileNotFoundError: If skill.md doesn't exist
        ValueError: If required sections are missing
    """
    if not skill_md_path.exists():
        raise FileNotFoundError(f"skill.md not found: {skill_md_path}")

    content = skill_md_path.read_text()
    skill_dir = skill_md_path.parent

    # Extract skill name from first heading
    name = ""
    for line in content.split("\n"):
        if line.startswith("# "):
            name = line[2:].strip()
            break

    if not name:
        raise ValueError("skill.md must have a title (# Skill Name)")

    # Extract description (content after ## Description)
    description = _extract_section(content, "Description")

    # Extract triggers (bullet points after ## Triggers)
    triggers_text = _extract_section(content, "Triggers")
    triggers = [
        line.strip().lstrip("- ")
        for line in triggers_text.split("\n")
        if line.strip().startswith("-")
    ]

    # Extract inputs table
    inputs = _parse_table(content, "Inputs")

    # Extract outputs table
    outputs = _parse_table(content, "Outputs")

    return SkillMetadata(
        name=name,
        description=description,
        triggers=triggers,
        inputs=inputs,
        outputs=outputs,
        path=skill_dir,
    )


def _extract_section(content: str, section_name: str) -> str:
    """Extract content between a section heading and the next heading."""
    lines = content.split("\n")
    in_section = False
    section_lines = []

    for line in lines:
        if line.startswith(f"## {section_name}"):
            in_section = True
            continue
        if in_section:
            if line.startswith("## "):
                break
            section_lines.append(line)

    return "\n".join(section_lines).strip()


def _parse_table(content: str, section_name: str) -> list[dict]:
    """Parse a markdown table in a section."""
    section = _extract_section(content, section_name)
    lines = [l.strip() for l in section.split("\n") if l.strip().startswith("|")]

    if len(lines) < 2:
        return []

    # First line is header
    headers = [h.strip() for h in lines[0].split("|") if h.strip()]

    # Skip separator line (second line with dashes)
    rows = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))

    return rows


def discover_skills(search_paths: list[str | Path]) -> list[SkillMetadata]:
    """
    Discover skills in the given paths.

    Args:
        search_paths: Directories to search for skills

    Returns:
        List of SkillMetadata for discovered skills
    """
    skills = []

    for path in search_paths:
        path = Path(path)
        if not path.exists():
            continue

        # Look for skill.md files
        for skill_md in path.rglob("skill.md"):
            # Skip template
            if "_template" in str(skill_md):
                continue
            try:
                metadata = parse_skill_md(skill_md)
                skills.append(metadata)
            except (ValueError, FileNotFoundError) as e:
                # Log warning but continue discovery
                print(f"Warning: Could not parse {skill_md}: {e}")

    return skills


def load_skill_script(skill_path: Path, script_name: str) -> Any:
    """
    Load a Python script from a skill's scripts directory.

    Args:
        skill_path: Path to skill directory
        script_name: Name of script (with or without .py extension)

    Returns:
        Loaded module

    Raises:
        FileNotFoundError: If script doesn't exist
        ImportError: If script can't be loaded
    """
    if not script_name.endswith(".py"):
        script_name = f"{script_name}.py"

    script_path = skill_path / "scripts" / script_name

    if not script_path.exists():
        raise FileNotFoundError(f"Script not found: {script_path}")

    # Load module dynamically
    spec = importlib.util.spec_from_file_location(
        f"skill_script_{script_path.stem}",
        script_path
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load script: {script_path}")

    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)

    return module


def execute_skill(
    skill_path: Path,
    script_name: str,
    inputs: dict,
    entry_point: str = "execute",
) -> dict:
    """
    Execute a skill script with given inputs.

    Args:
        skill_path: Path to skill directory
        script_name: Name of script to execute
        inputs: Input parameters for the script
        entry_point: Function name to call (default: "execute")

    Returns:
        Result dictionary from script execution

    Raises:
        FileNotFoundError: If script doesn't exist
        AttributeError: If entry point function not found
    """
    module = load_skill_script(skill_path, script_name)

    if not hasattr(module, entry_point):
        raise AttributeError(
            f"Script {script_name} has no '{entry_point}' function"
        )

    execute_fn = getattr(module, entry_point)
    return execute_fn(inputs)
