"""Basic tests for NEPA Advisor agent."""

import importlib.util
from pathlib import Path

import pytest


# Load agent module directly from file path to avoid sys.path pollution
AGENT_DIR = Path(__file__).parent.parent
AGENT_FILE = AGENT_DIR / "agent.py"


def load_agent_module():
    """Load the agent module directly from file."""
    spec = importlib.util.spec_from_file_location("nepa_advisor_agent", AGENT_FILE)
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
    assert agent_module.root_agent.name == "nepa_advisor"


def test_agent_has_instruction(agent_module):
    """Agent should have non-empty instruction."""
    assert agent_module.root_agent.instruction is not None
    assert len(agent_module.root_agent.instruction) > 0


def test_agent_uses_correct_model(agent_module):
    """Agent should use gemini-2.5-flash model (required for File Search)."""
    assert agent_module.root_agent.model == "gemini-2.5-flash"


def test_agent_has_file_search_tool(agent_module):
    """Agent should have search_regulatory_documents tool for File Search RAG."""
    tool_names = [t.__name__ for t in agent_module.root_agent.tools]
    assert "search_regulatory_documents" in tool_names


def test_agent_has_all_required_tools(agent_module):
    """Agent should have all 4 required tools."""
    tool_names = [t.__name__ for t in agent_module.root_agent.tools]
    expected_tools = [
        "search_regulatory_documents",
        "decide_pathway",
        "generate_documentation_checklist",
        "estimate_compliance_timeline",
    ]
    for tool in expected_tools:
        assert tool in tool_names, f"Missing tool: {tool}"
