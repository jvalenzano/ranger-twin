"""
Tests for Delegation skill.

Validates:
- Skill structure matches skill-format.md specification
- Query routing accuracy for each specialist domain
- Multi-agent synthesis detection
- Confidence scoring
"""

import json
import sys
from pathlib import Path

import pytest

# Skill root directory
SKILL_ROOT = Path(__file__).parent.parent

# Add scripts to path for import
sys.path.insert(0, str(SKILL_ROOT / "scripts"))


class TestSkillStructure:
    """Tests for skill.md structure and content."""

    def test_skill_md_exists(self):
        """Skill definition file should exist."""
        skill_path = SKILL_ROOT / "skill.md"
        assert skill_path.exists(), "skill.md should exist"

    def test_skill_md_has_required_sections(self):
        """Skill definition should have all required sections per skill-format.md."""
        skill_path = SKILL_ROOT / "skill.md"
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

    def test_skill_md_has_inputs_table(self):
        """Inputs section should use proper table format."""
        skill_path = SKILL_ROOT / "skill.md"
        content = skill_path.read_text()
        assert "| Input | Type | Required | Description |" in content
        assert "query" in content, "Should have query input"

    def test_skill_md_has_outputs_table(self):
        """Outputs section should use proper table format."""
        skill_path = SKILL_ROOT / "skill.md"
        content = skill_path.read_text()
        assert "| Output | Type | Description |" in content
        assert "target_agent" in content
        assert "confidence" in content
        assert "reasoning" in content

    def test_skill_md_has_examples(self):
        """Skill should have usage examples."""
        skill_path = SKILL_ROOT / "skill.md"
        content = skill_path.read_text()
        assert "## Examples" in content
        assert "```json" in content, "Should have JSON examples"


class TestResources:
    """Tests for resource configuration files."""

    def test_routing_rules_exists(self):
        """Routing rules resource should exist and be valid JSON."""
        path = SKILL_ROOT / "resources" / "routing-rules.json"
        assert path.exists(), "routing-rules.json should exist"
        data = json.loads(path.read_text())

        # Should have all agents
        assert "burn-analyst" in data
        assert "trail-assessor" in data
        assert "cruising-assistant" in data
        assert "nepa-advisor" in data
        assert "coordinator" in data

    def test_routing_rules_have_keywords(self):
        """Each agent should have keywords defined."""
        path = SKILL_ROOT / "resources" / "routing-rules.json"
        data = json.loads(path.read_text())

        for agent, config in data.items():
            assert "keywords" in config, f"{agent} should have keywords"
            assert len(config["keywords"]) > 0, f"{agent} should have at least one keyword"

    def test_agent_capabilities_exists(self):
        """Agent capabilities resource should exist."""
        path = SKILL_ROOT / "resources" / "agent-capabilities.json"
        assert path.exists(), "agent-capabilities.json should exist"
        data = json.loads(path.read_text())

        # Should have all agents
        assert "coordinator" in data
        assert "burn-analyst" in data
        assert "trail-assessor" in data


class TestRouteQuery:
    """Tests for the query routing script."""

    def test_script_imports(self):
        """Script should be importable."""
        from route_query import execute
        assert callable(execute)

    def test_empty_query_routes_to_coordinator(self):
        """Empty queries should route to coordinator."""
        from route_query import execute

        result = execute({"query": ""})
        assert result["target_agent"] == "coordinator"
        assert result["confidence"] == 1.0

    def test_burn_query_routes_to_burn_analyst(self):
        """Burn-related queries should route to burn-analyst."""
        from route_query import execute

        result = execute({"query": "What is the soil burn severity?"})
        assert result["target_agent"] == "burn-analyst"
        assert result["confidence"] >= 0.5
        assert "burn" in " ".join(result["matched_keywords"]).lower()

    def test_trail_query_routes_to_trail_assessor(self):
        """Trail-related queries should route to trail-assessor."""
        from route_query import execute

        result = execute({"query": "Which trails are closed?"})
        assert result["target_agent"] == "trail-assessor"
        assert result["confidence"] >= 0.5

    def test_timber_query_routes_to_cruising_assistant(self):
        """Timber-related queries should route to cruising-assistant."""
        from route_query import execute

        result = execute({"query": "How much merchantable timber can we salvage?"})
        assert result["target_agent"] == "cruising-assistant"
        assert result["confidence"] >= 0.5

    def test_nepa_query_routes_to_nepa_advisor(self):
        """NEPA-related queries should route to nepa-advisor."""
        from route_query import execute

        result = execute({"query": "Do we need an EIS or categorical exclusion?"})
        assert result["target_agent"] == "nepa-advisor"
        assert result["confidence"] >= 0.5

    def test_portfolio_query_routes_to_coordinator(self):
        """Portfolio triage queries should route to coordinator."""
        from route_query import execute

        result = execute({"query": "Which fires need the most attention?"})
        assert result["target_agent"] == "coordinator"
        assert result["confidence"] >= 0.5

    def test_greeting_routes_to_coordinator(self):
        """Greetings should route to coordinator."""
        from route_query import execute

        result = execute({"query": "Hello, what can you help me with?"})
        assert result["target_agent"] == "coordinator"

    def test_multi_agent_query_detected(self):
        """Queries spanning multiple domains should require synthesis."""
        from route_query import execute

        result = execute({
            "query": "Give me burn damage, trail closures, and salvage estimates"
        })
        assert result["requires_synthesis"] == True
        assert result["target_agent"] == "coordinator"
        assert len(result["synthesis_agents"]) >= 2


class TestRoutingConfidence:
    """Tests for confidence scoring."""

    def test_strong_match_high_confidence(self):
        """Strong keyword matches should have high confidence."""
        from route_query import execute

        result = execute({"query": "MTBS soil burn severity classification for high severity areas"})
        assert result["confidence"] >= 0.7

    def test_weak_match_lower_confidence(self):
        """Weak or ambiguous queries should have lower confidence."""
        from route_query import execute

        result = execute({"query": "tell me about the fire"})
        # Should still route but with moderate confidence
        assert result["confidence"] < 0.9

    def test_confidence_never_exceeds_one(self):
        """Confidence should never exceed 1.0."""
        from route_query import execute

        # Query with many matching keywords
        result = execute({
            "query": "MTBS burn severity soil burn classification high severity moderate severity fire damage"
        })
        assert result["confidence"] <= 1.0


class TestRoutingResult:
    """Tests for routing result structure."""

    def test_result_has_required_fields(self):
        """Routing result should have all required fields."""
        from route_query import execute

        result = execute({"query": "test query"})

        assert "target_agent" in result
        assert "confidence" in result
        assert "reasoning" in result
        assert "matched_keywords" in result
        assert "fallback_agents" in result
        assert "requires_synthesis" in result

    def test_result_types_correct(self):
        """Routing result fields should have correct types."""
        from route_query import execute

        result = execute({"query": "What is the burn severity?"})

        assert isinstance(result["target_agent"], str)
        assert isinstance(result["confidence"], float)
        assert isinstance(result["reasoning"], str)
        assert isinstance(result["matched_keywords"], list)
        assert isinstance(result["fallback_agents"], list)
        assert isinstance(result["requires_synthesis"], bool)

    def test_valid_agent_names(self):
        """Target agent should be a valid agent name."""
        from route_query import execute

        valid_agents = [
            "coordinator", "burn-analyst", "trail-assessor",
            "cruising-assistant", "nepa-advisor"
        ]

        queries = [
            "burn severity",
            "trail closure",
            "timber salvage",
            "NEPA compliance",
            "fire portfolio"
        ]

        for query in queries:
            result = execute({"query": query})
            assert result["target_agent"] in valid_agents


class TestExamples:
    """Tests validating example files."""

    def test_example_file_exists(self):
        """Example file should exist."""
        path = SKILL_ROOT / "examples" / "routing-examples.json"
        assert path.exists(), "routing-examples.json should exist"

    def test_example_file_valid_json(self):
        """Example file should be valid JSON."""
        path = SKILL_ROOT / "examples" / "routing-examples.json"
        data = json.loads(path.read_text())
        assert "examples" in data
        assert len(data["examples"]) > 0

    def test_examples_route_correctly(self):
        """Running route_query on examples should match expected targets."""
        from route_query import execute

        path = SKILL_ROOT / "examples" / "routing-examples.json"
        data = json.loads(path.read_text())

        for example in data["examples"]:
            result = execute(example["input"])
            expected = example["expected_output"]

            # Check target agent matches
            assert result["target_agent"] == expected["target_agent"], \
                f"Example '{example['name']}': expected {expected['target_agent']}, got {result['target_agent']}"

            # Check synthesis flag if specified
            if "requires_synthesis" in expected:
                assert result["requires_synthesis"] == expected["requires_synthesis"], \
                    f"Example '{example['name']}': synthesis mismatch"
