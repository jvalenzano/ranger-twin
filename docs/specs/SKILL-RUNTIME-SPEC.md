# Specification: Skill Runtime & Test Harness (v1.0)

> [!IMPORTANT]
> **Requirement:** All Specialist Skills must pass the **Skill Runtime Test Suite** before being eligible for integration into the RANGER Coordinator.

## 1. Overview
The `skill-runtime` is a core Python package (`packages/skill-runtime`) that provides the execution environment for RANGER skills. It ensures that skills are testable in isolation from the full ADK agent stack.

## 2. The Isolation Mocking Engine (Explicit Injection)
To achieve the **>80% test coverage** mandated by ADR-005, the runtime provides an `MCPMockProvider` using the **Explicit Injection Pattern**. Global context managers are strictly prohibited.

```python
# test_burn_severity_skill.py
from skill_runtime.testing import MCPMockProvider
from skill_runtime.harness import SkillTestHarness

def test_severity_calculation():
    # 1. Setup Mock Provider
    mock = MCPMockProvider()
    mock.register("mcp-nifc", "get_incident_metadata", {
        "acres": 1200, 
        "containment": 45
    })
    
    # 2. Initialize Harness
    harness = SkillTestHarness(skill_path="skills/burn-analyst/severity")
    
    # 3. Execute with Explicit Tool Context
    # The skill receives 'tools' dict: {"get_incident_metadata": <lambda>}
    result = harness.execute(
        inputs={"fire_id": "cedar-creek"},
        tools=mock.get_tool_context() 
    )
    
    assert result.proof_layer.confidence > 0.9
    assert "MTBS Classification" in result.proof_layer.reasoning_chain
```

## 3. Deterministic Fixture Contracts
The runtime enforces that all tests utilize standardized fixtures located in `data/fixtures/`.
- **Golden Path**: Success scenario with complete data.
- **Missing Data**: Partial JSON from MCP to test fallback logic.
- **Edge Case**: Malformed or outlier data (e.g., 0-acre fire, negative burn values).

## 4. Validation Gates (The "Runtime Check")
When a skill is loaded, the runtime performs an immediate schema check:
1.  **Instruction Scan**: Validates `skill.md` presence and markdown structure.
2.  **Tool Check**: Verifies all referenced Python scripts in `scripts/` are executable.
3.  **Schema Alignment**: Ensures output Pydantic models match the `AgentBriefingEvent` contract.

## 5. Performance Monitoring
The runtime tracks telemetry for every execution:
- **Latent Time**: Time spent waiting for MCP/LLM.
- **Compute Time**: Local Python execution time.
- **Token Usage**: Estimated cost per invocation.

---
*Created: December 2025*
