"""Basic tests for Trail Assessor agent."""

import pytest


def test_agent_module_imports():
    """Agent module should be importable."""
    from agents.trail_assessor import agent
    assert agent is not None


def test_root_agent_exists():
    """Root agent should be properly initialized."""
    from agents.trail_assessor.agent import root_agent
    assert root_agent is not None
    assert root_agent.name == "trail-assessor"


def test_agent_has_instruction():
    """Agent should have non-empty instruction."""
    from agents.trail_assessor.agent import root_agent
    assert root_agent.instruction is not None
    assert len(root_agent.instruction) > 0


def test_agent_uses_correct_model():
    """Agent should use gemini-2.0-flash model."""
    from agents.trail_assessor.agent import root_agent
    assert root_agent.model == "gemini-2.0-flash"
