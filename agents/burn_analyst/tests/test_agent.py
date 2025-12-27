"""Basic tests for Burn Analyst agent."""

import importlib.util
import sys
from pathlib import Path

import pytest

# Path to agent module
AGENT_DIR = Path(__file__).parent.parent
AGENT_PATH = AGENT_DIR / "agent.py"


def load_agent_module():
    """Load agent module dynamically to handle hyphenated directory."""
    spec = importlib.util.spec_from_file_location("burn_analyst_agent", AGENT_PATH)
    module = importlib.util.module_from_spec(spec)

    # Add skills path for nested imports
    skills_path = AGENT_DIR / "skills" / "soil-burn-severity" / "scripts"
    if str(skills_path) not in sys.path:
        sys.path.insert(0, str(skills_path))

    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def agent_module():
    """Fixture to load the agent module once per test module."""
    return load_agent_module()


def test_agent_module_imports(agent_module):
    """Agent module should be importable."""
    assert agent_module is not None


def test_root_agent_exists(agent_module):
    """Root agent should be properly initialized."""
    root_agent = agent_module.root_agent
    assert root_agent is not None
    assert root_agent.name == "burn_analyst"


def test_agent_has_instruction(agent_module):
    """Agent should have non-empty instruction."""
    root_agent = agent_module.root_agent
    assert root_agent.instruction is not None
    assert len(root_agent.instruction) > 0


def test_agent_uses_correct_model(agent_module):
    """Agent should use gemini-2.0-flash model."""
    root_agent = agent_module.root_agent
    assert root_agent.model == "gemini-2.0-flash"


def test_agent_has_assess_severity_tool(agent_module):
    """Agent should have the assess_severity tool."""
    root_agent = agent_module.root_agent
    # Handle both function tools and McpToolset objects
    tool_names = [t.__name__ for t in root_agent.tools if hasattr(t, '__name__')]
    assert "assess_severity" in tool_names


def test_assess_severity_tool_works(agent_module):
    """The assess_severity tool should execute correctly."""
    assess_severity = agent_module.assess_severity
    result = assess_severity(fire_id="cedar-creek-2022")

    assert result["fire_id"] == "cedar-creek-2022"
    assert result["fire_name"] == "Cedar Creek Fire"
    assert result["confidence"] > 0.9
    assert "severity_breakdown" in result
    assert "high" in result["severity_breakdown"]
