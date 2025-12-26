"""
Tests for Portfolio Triage skill.

Validates:
- Skill structure matches skill-format.md specification
- Calculation accuracy matches mission.ts
- Phase/severity values are consistent with TypeScript
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
        assert "fires" in content, "Should have fires input"
        assert "top_n" in content, "Should have top_n input"

    def test_skill_md_has_outputs_table(self):
        """Outputs section should use proper table format."""
        skill_path = SKILL_ROOT / "skill.md"
        content = skill_path.read_text()
        assert "| Output | Type | Description |" in content
        assert "ranked_fires" in content
        assert "reasoning_chain" in content
        assert "confidence" in content

    def test_skill_md_has_examples(self):
        """Skill should have usage examples."""
        skill_path = SKILL_ROOT / "skill.md"
        content = skill_path.read_text()
        assert "## Examples" in content
        assert "```json" in content, "Should have JSON examples"


class TestResources:
    """Tests for resource configuration files."""

    def test_phase_weights_exists(self):
        """Phase weights resource should exist and be valid JSON."""
        path = SKILL_ROOT / "resources" / "phase-weights.json"
        assert path.exists(), "phase-weights.json should exist"
        data = json.loads(path.read_text())
        assert "active" in data
        assert "baer_assessment" in data
        assert "baer_implementation" in data
        assert "in_restoration" in data

    def test_phase_weights_values(self):
        """Phase weights should match mission.ts PHASE_MULTIPLIERS."""
        path = SKILL_ROOT / "resources" / "phase-weights.json"
        data = json.loads(path.read_text())

        # Must match mission.ts:247-252 exactly
        assert data["active"]["multiplier"] == 2.0
        assert data["baer_assessment"]["multiplier"] == 1.75
        assert data["baer_implementation"]["multiplier"] == 1.25
        assert data["in_restoration"]["multiplier"] == 1.0

    def test_severity_weights_exists(self):
        """Severity weights resource should exist and be valid JSON."""
        path = SKILL_ROOT / "resources" / "severity-weights.json"
        assert path.exists(), "severity-weights.json should exist"
        data = json.loads(path.read_text())
        assert "critical" in data
        assert "high" in data
        assert "moderate" in data
        assert "low" in data

    def test_severity_weights_values(self):
        """Severity weights should match mission.ts SEVERITY_DISPLAY.weight."""
        path = SKILL_ROOT / "resources" / "severity-weights.json"
        data = json.loads(path.read_text())

        # Must match mission.ts:214-222 exactly
        assert data["critical"]["weight"] == 4
        assert data["high"]["weight"] == 3
        assert data["moderate"]["weight"] == 2
        assert data["low"]["weight"] == 1


class TestCalculatePriority:
    """Tests for the triage calculation script."""

    def test_script_imports(self):
        """Script should be importable."""
        from calculate_priority import execute
        assert callable(execute)

    def test_calculate_triage_score_basic(self):
        """Should calculate correct triage score for known inputs."""
        from calculate_priority import calculate_triage_score

        # High severity, 100k acres, active fire
        # Expected: 3 × 10 × 2.0 = 60.0
        score, components = calculate_triage_score(
            severity="high",
            acres=100000,
            phase="active"
        )

        assert score == 60.0
        assert components["severity_weight"] == 3
        assert components["acres_normalized"] == 10.0
        assert components["phase_multiplier"] == 2.0

    def test_acres_cap_at_500k(self):
        """Normalized acres should cap at 50 (500k acres)."""
        from calculate_priority import calculate_triage_score

        score, components = calculate_triage_score(
            severity="moderate",
            acres=1000000,  # 1 million acres
            phase="in_restoration"
        )

        # Should cap at 50, not 100
        assert components["acres_normalized"] == 50.0
        # 2 × 50 × 1.0 = 100
        assert score == 100.0

    def test_execute_with_empty_fires(self):
        """Should handle empty fires list gracefully."""
        from calculate_priority import execute

        result = execute({"fires": []})

        assert result["ranked_fires"] == []
        assert result["confidence"] == 0.0
        assert "No fires" in result["summary"]

    def test_execute_with_fixture_data(self):
        """Should correctly process and rank fixture fire data."""
        from calculate_priority import execute

        result = execute({
            "fires": [
                {"id": "fire-1", "name": "Test Fire 1", "severity": "high", "acres": 50000, "phase": "active"},
                {"id": "fire-2", "name": "Test Fire 2", "severity": "moderate", "acres": 100000, "phase": "in_restoration"},
            ]
        })

        assert "ranked_fires" in result
        assert len(result["ranked_fires"]) == 2

        # Active fire with higher severity should rank first despite smaller size
        # Fire 1: 3 × 5 × 2.0 = 30
        # Fire 2: 2 × 10 × 1.0 = 20
        assert result["ranked_fires"][0]["id"] == "fire-1"
        assert result["ranked_fires"][0]["triage_score"] == 30.0
        assert result["ranked_fires"][1]["id"] == "fire-2"
        assert result["ranked_fires"][1]["triage_score"] == 20.0

    def test_ranking_order(self):
        """Fires should be ranked highest score first."""
        from calculate_priority import execute

        result = execute({
            "fires": [
                {"id": "low", "name": "Low Priority", "severity": "low", "acres": 10000, "phase": "in_restoration"},
                {"id": "high", "name": "High Priority", "severity": "critical", "acres": 50000, "phase": "active"},
                {"id": "medium", "name": "Medium Priority", "severity": "moderate", "acres": 30000, "phase": "baer_assessment"},
            ]
        })

        scores = [f["triage_score"] for f in result["ranked_fires"]]
        assert scores == sorted(scores, reverse=True), "Should be sorted highest first"

    def test_top_n_filter(self):
        """Should limit results when top_n is specified."""
        from calculate_priority import execute

        result = execute({
            "fires": [
                {"id": f"fire-{i}", "name": f"Fire {i}", "severity": "moderate", "acres": 10000, "phase": "active"}
                for i in range(10)
            ],
            "top_n": 3
        })

        assert len(result["ranked_fires"]) == 3
        # reasoning_chain should still contain all fires for context
        assert len(result["reasoning_chain"]) == 10

    def test_confidence_present(self):
        """Result should include confidence score."""
        from calculate_priority import execute

        result = execute({
            "fires": [
                {"id": "test", "name": "Test Fire", "severity": "high", "acres": 50000, "phase": "active"}
            ]
        })

        assert "confidence" in result
        assert 0 <= result["confidence"] <= 1
        assert result["confidence"] == 0.92  # High confidence for complete data

    def test_reasoning_chain_format(self):
        """Reasoning chain should explain each score calculation."""
        from calculate_priority import execute

        result = execute({
            "fires": [
                {"id": "cedar", "name": "Cedar Creek", "severity": "high", "acres": 127341, "phase": "baer_implementation"}
            ]
        })

        assert len(result["reasoning_chain"]) == 1
        reasoning = result["reasoning_chain"][0]
        assert "Cedar Creek" in reasoning
        assert "high severity" in reasoning
        assert "baer_implementation" in reasoning


class TestPhaseMultipliers:
    """Tests ensuring phase multipliers match TypeScript mission.ts."""

    @pytest.mark.parametrize("phase,expected", [
        ("active", 2.0),
        ("baer_assessment", 1.75),
        ("baer_implementation", 1.25),
        ("in_restoration", 1.0),
    ])
    def test_phase_multipliers_match_typescript(self, phase, expected):
        """Phase multipliers should match mission.ts PHASE_MULTIPLIERS."""
        from calculate_priority import PHASE_MULTIPLIERS
        assert PHASE_MULTIPLIERS[phase] == expected


class TestSeverityWeights:
    """Tests ensuring severity weights match TypeScript mission.ts."""

    @pytest.mark.parametrize("severity,expected", [
        ("critical", 4),
        ("high", 3),
        ("moderate", 2),
        ("low", 1),
    ])
    def test_severity_weights_match_typescript(self, severity, expected):
        """Severity weights should match SEVERITY_DISPLAY.weight in mission.ts."""
        from calculate_priority import SEVERITY_WEIGHTS
        assert SEVERITY_WEIGHTS[severity] == expected


class TestExamples:
    """Tests validating example files."""

    def test_example_file_exists(self):
        """Example file should exist."""
        path = SKILL_ROOT / "examples" / "cedar-creek-triage.json"
        assert path.exists(), "cedar-creek-triage.json should exist"

    def test_example_file_valid_json(self):
        """Example file should be valid JSON."""
        path = SKILL_ROOT / "examples" / "cedar-creek-triage.json"
        data = json.loads(path.read_text())
        assert "input" in data
        assert "expected_output" in data
        assert "fires" in data["input"]

    def test_example_matches_execution(self):
        """Running execute on example input should match expected output."""
        from calculate_priority import execute

        path = SKILL_ROOT / "examples" / "cedar-creek-triage.json"
        data = json.loads(path.read_text())

        result = execute(data["input"])

        # Compare key fields
        assert len(result["ranked_fires"]) == len(data["expected_output"]["ranked_fires"])
        assert result["confidence"] == data["expected_output"]["confidence"]

        # Verify ordering matches
        result_ids = [f["id"] for f in result["ranked_fires"]]
        expected_ids = [f["id"] for f in data["expected_output"]["ranked_fires"]]
        assert result_ids == expected_ids
