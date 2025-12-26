"""
Tests for Chat API endpoint.

Validates:
- Routing to correct agents via Delegation skill
- Response format matches frontend contract
- Error handling
"""

import sys
from pathlib import Path

import pytest

# Add agents to path for skill imports
PROJECT_ROOT = Path(__file__).parents[3]
AGENTS_DIR = PROJECT_ROOT / "agents"
sys.path.insert(0, str(AGENTS_DIR))

COORDINATOR_SKILLS = AGENTS_DIR / "coordinator" / "skills"
DELEGATION_SCRIPTS = COORDINATOR_SKILLS / "delegation" / "scripts"
sys.path.insert(0, str(DELEGATION_SCRIPTS))


class TestChatRouting:
    """Tests for query routing through chat endpoint."""

    def test_burn_query_routes_to_burn_analyst(self):
        """Burn severity queries should route to burn-analyst."""
        from route_query import execute as route_query

        result = route_query({"query": "What is the soil burn severity?"})
        assert result["target_agent"] == "burn-analyst"
        assert result["confidence"] >= 0.5

    def test_trail_query_routes_to_trail_assessor(self):
        """Trail queries should route to trail-assessor."""
        from route_query import execute as route_query

        result = route_query({"query": "Which trails are closed?"})
        assert result["target_agent"] == "trail-assessor"
        assert result["confidence"] >= 0.5

    def test_timber_query_routes_to_cruising_assistant(self):
        """Timber queries should route to cruising-assistant."""
        from route_query import execute as route_query

        result = route_query({"query": "How much timber can we salvage?"})
        assert result["target_agent"] == "cruising-assistant"

    def test_nepa_query_routes_to_nepa_advisor(self):
        """NEPA queries should route to nepa-advisor."""
        from route_query import execute as route_query

        result = route_query({"query": "Do we need an EIS?"})
        assert result["target_agent"] == "nepa-advisor"

    def test_greeting_routes_to_coordinator(self):
        """Greetings should route to coordinator."""
        from route_query import execute as route_query

        result = route_query({"query": "Hello, what can you help me with?"})
        assert result["target_agent"] == "coordinator"

    def test_portfolio_query_routes_to_coordinator(self):
        """Portfolio queries should route to coordinator."""
        from route_query import execute as route_query

        result = route_query({"query": "Which fires need the most attention?"})
        assert result["target_agent"] == "coordinator"


class TestResponseFormat:
    """Tests for API response format."""

    def test_routing_result_has_required_fields(self):
        """Routing result should have all fields for API response."""
        from route_query import execute as route_query

        result = route_query({"query": "test query"})

        assert "target_agent" in result
        assert "confidence" in result
        assert "reasoning" in result
        assert "matched_keywords" in result
        assert "fallback_agents" in result
        assert "requires_synthesis" in result

    def test_confidence_is_valid(self):
        """Confidence should be between 0 and 1."""
        from route_query import execute as route_query

        result = route_query({"query": "burn severity analysis"})
        assert 0 <= result["confidence"] <= 1


class TestAgentRoleMapping:
    """Tests for agent role string mapping."""

    def test_all_agent_roles_valid(self):
        """All routing targets should be valid agent roles."""
        from route_query import execute as route_query

        valid_agents = {
            "coordinator",
            "burn-analyst",
            "trail-assessor",
            "cruising-assistant",
            "nepa-advisor",
        }

        queries = [
            "burn severity",
            "trail closures",
            "timber salvage",
            "NEPA compliance",
            "hello",
        ]

        for query in queries:
            result = route_query({"query": query})
            assert result["target_agent"] in valid_agents, f"Invalid agent for '{query}'"
