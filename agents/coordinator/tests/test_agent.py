"""Basic tests for Coordinator agent."""

import pytest


def test_agent_module_imports():
    """Agent module should be importable."""
    from agents.coordinator import agent
    assert agent is not None


def test_root_agent_exists():
    """Root agent should be properly initialized."""
    from agents.coordinator.agent import root_agent
    assert root_agent is not None
    assert root_agent.name == "coordinator"


def test_agent_has_instruction():
    """Agent should have non-empty instruction."""
    from agents.coordinator.agent import root_agent
    assert root_agent.instruction is not None
    assert len(root_agent.instruction) > 0


def test_agent_has_description():
    """Agent should have a description."""
    from agents.coordinator.agent import root_agent
    assert root_agent.description is not None
    assert "orchestrator" in root_agent.description.lower()


def test_agent_uses_correct_model():
    """Agent should use gemini-2.0-flash model."""
    from agents.coordinator.agent import root_agent
    assert root_agent.model == "gemini-2.0-flash"
