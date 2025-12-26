"""Basic tests for Trail Assessor agent."""

import importlib.util
from pathlib import Path

import pytest


# Load agent module directly from file path to avoid sys.path pollution
AGENT_DIR = Path(__file__).parent.parent
AGENT_FILE = AGENT_DIR / "agent.py"


def load_agent_module():
    """Load the agent module directly from file."""
    spec = importlib.util.spec_from_file_location("trail_assessor_agent", AGENT_FILE)
    agent_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(agent_module)
    return agent_module


@pytest.fixture
def agent_module():
    """Fixture providing the loaded agent module."""
    return load_agent_module()


def test_agent_module_imports(agent_module):
    """Agent module should be importable."""
    assert agent_module is not None


def test_root_agent_exists(agent_module):
    """Root agent should be properly initialized."""
    assert hasattr(agent_module, 'root_agent')
    assert agent_module.root_agent is not None
    assert agent_module.root_agent.name == "trail_assessor"


def test_agent_has_instruction(agent_module):
    """Agent should have non-empty instruction."""
    assert agent_module.root_agent.instruction is not None
    assert len(agent_module.root_agent.instruction) > 0


def test_agent_uses_correct_model(agent_module):
    """Agent should use gemini-2.0-flash model."""
    assert agent_module.root_agent.model == "gemini-2.0-flash"
