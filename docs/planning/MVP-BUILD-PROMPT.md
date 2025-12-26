# RANGER MVP Autonomous Build Prompt

**Purpose:** This prompt initiates a planning mode session to build RANGER to MVP using parallel subagents.

**Context:** Phases 0-2 are complete. The Coordinator agent and Burn Analyst specialist are operational with 168+ passing tests. The patterns are established and ready for replication.

---

## Starting Context

Read the following files to understand the current state:

1. `docs/_!_IMPLEMENTATION-ROADMAP.md` - Master roadmap with phases 0-2 complete
2. `docs/specs/SKILL-RUNTIME-SPEC.md` - **Authoritative Skill Runtime Standard**
3. `agents/burn-analyst/agent.py` - Reference implementation for specialist agents
3. `agents/burn-analyst/skills/soil-burn-severity/` - Reference skill implementation
4. `agents/coordinator/implementation.py` - CoordinatorService with routing
5. `packages/skill-runtime/skill_runtime/testing.py` - MCPMockProvider pattern
6. `data/fixtures/cedar-creek/` - Fixture data patterns

---

## Objective

Build RANGER to MVP by completing Phases 3-5:

| Phase | Focus | Parallelizable |
|-------|-------|----------------|
| **Phase 3A** | Trail Assessor agent (3 skills) | YES - Independent |
| **Phase 3B** | Cruising Assistant agent (3 skills) | YES - Independent |
| **Phase 3C** | NEPA Advisor agent (3 skills) | YES - Independent |
| **Phase 4** | Foundation Skills + MCP Servers | PARTIAL - Can start early |
| **Phase 5** | Integration Testing + Production | NO - Depends on all |

---

## Subagent Build Strategy

### Wave 1: Parallel Specialist Builds (3 subagents)

Launch **three parallel subagents** to build the remaining specialists:

#### Subagent 1: Trail Assessor
```
Task: Build Trail Assessor agent with 3 skills following Burn Analyst pattern

Skills to implement:
1. Damage Classification Skill
   - Type I-IV damage definitions
   - Bridge/culvert assessment
   - Hazard tree identification
   - ~35 tests

2. Closure Decision Skill
   - Risk-based closure criteria
   - Seasonal considerations
   - Public safety factors
   - ~30 tests

3. Recreation Priority Skill
   - Trail prioritization factors
   - Resource allocation model
   - Cost-benefit analysis
   - ~30 tests

Reference files:
- agents/burn-analyst/agent.py (agent structure)
- agents/burn-analyst/skills/soil-burn-severity/ (skill structure)
- data/fixtures/cedar-creek/trail-damage.json (fixture data)

Expected output:
- agents/trail-assessor/agent.py with 3 tools
- 3 skill directories with ~95 total tests
- Integration with CoordinatorService routing
```

#### Subagent 2: Cruising Assistant
```
Task: Build Cruising Assistant agent with 3 skills following Burn Analyst pattern

Skills to implement:
1. Cruise Methodology Skill
   - Standard cruise protocols (point, line, strip)
   - Plot selection criteria
   - Sampling intensity calculations
   - ~35 tests

2. Volume Estimation Skill
   - Board foot calculations
   - Species-specific volume tables
   - Defect deduction logic
   - ~35 tests

3. Salvage Assessment Skill
   - Timber viability criteria
   - Market value factors
   - Deterioration timelines
   - ~30 tests

Reference files:
- agents/burn-analyst/agent.py (agent structure)
- data/fixtures/cedar-creek/timber-plots.json (fixture data)

Expected output:
- agents/cruising-assistant/agent.py with 3 tools
- 3 skill directories with ~100 total tests
- Integration with CoordinatorService routing
```

#### Subagent 3: NEPA Advisor
```
Task: Build NEPA Advisor agent with 3 skills following Burn Analyst pattern

Skills to implement:
1. Pathway Decision Skill
   - CE vs EA vs EIS decision logic
   - Extraordinary circumstances screening
   - Categorical exclusion criteria
   - ~40 tests

2. Documentation Skill
   - Required documentation checklist
   - Timeline estimation
   - Template selection
   - ~30 tests

3. Compliance Timeline Skill
   - Public comment periods
   - Agency consultation requirements
   - Milestone tracking
   - ~25 tests

Reference files:
- agents/burn-analyst/agent.py (agent structure)
- NEPA regulations (can search for reference)

Expected output:
- agents/nepa-advisor/agent.py with 3 tools
- 3 skill directories with ~95 total tests
- Integration with CoordinatorService routing
```

### Wave 2: Foundation & MCP (2 subagents, after Wave 1 starts)

#### Subagent 4: Foundation Skills
```
Task: Extract reusable skills to skills/foundation/

Skills to extract:
1. Geospatial Analysis (from Burn Analyst boundary-mapping)
2. Document Generation (for reports across agents)
3. Federal Reporting (congressional report formatting)

Expected output:
- skills/foundation/geospatial-analysis/
- skills/foundation/document-generation/
- skills/foundation/federal-reporting/
- Update imports in agents to use foundation skills
```

#### Subagent 5: MCP Servers
```
Task: Build MCP server infrastructure in mcp/

Servers to build:
1. mcp/fixtures/ - Local fixture data server
2. mcp/nifc/ - Refactor existing NIFC service
3. mcp.json registry per agent

Expected output:
- mcp/fixtures/server.py
- mcp/nifc/server.py
- agents/*/mcp.json registries
- Integration tests
```

### Wave 3: Integration & Production (sequential, after Waves 1-2)

```
Task: End-to-end integration and production readiness

Steps:
1. Wire all specialists to Coordinator
2. Run full integration test suite
3. Performance optimization (<5s response time)
4. Error handling audit
5. Documentation update

Expected output:
- All agents wired to Coordinator
- Integration tests passing
- Performance benchmarks met
- Updated README and docs
```

---

## Skill Implementation Pattern

Each skill follows this structure (from Burn Analyst):

```
agents/{agent}/skills/{skill-name}/
├── skill.md                    # Triggers, inputs, outputs, examples
├── scripts/
│   └── {action}.py             # def execute(inputs: dict, tools: dict) -> dict
├── resources/
│   └── *.json                  # Reference data, thresholds
└── tests/
    ├── conftest.py             # Path setup
    └── test_{skill}.py         # 30-40 pytest tests
```

### Key Patterns to Follow:

1. **Explicit Tool Injection**: `def execute(inputs: dict, tools: dict) -> dict`. No global tool usage.
2. **Pure Functions**: functional core, imperative shell.
3. **Reasoning Chain**: Include `reasoning_chain` in output for proof layer
4. **Confidence Scores**: Return confidence based on data quality
5. **Fixture-Based Testing**: Use `data/fixtures/` for test data
6. **Tool Registration**: Register in agent.py with proper path setup

---

## Test Coverage Requirements

Per ADR-005, each skill requires >80% coverage:

| Skill Type | Minimum Tests | Focus Areas |
|------------|---------------|-------------|
| Classification | 35 | Edge cases, thresholds |
| Assessment | 30 | Validation, calculations |
| Decision | 30 | Logic paths, criteria |

---

## Coordination Points

### Dependencies
- Phase 3 agents are **independent** - can build in parallel
- Phase 4 can start **after Wave 1 agents have 1+ skill complete**
- Phase 5 requires **all agents operational**

### Integration Checkpoints
1. After each skill: Run skill tests, verify agent loads
2. After each agent: Verify Coordinator routes correctly
3. After Wave 1: Run full portfolio triage
4. After Wave 2: Verify MCP fixture loading
5. After Wave 3: Demo script runs 10/10

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Total tests | 500+ passing |
| Agents operational | 5/5 |
| Skills implemented | 12+ |
| Response time | <5 seconds |
| Test coverage | >80% per skill |

---

## Execution Commands

```bash
# Run all agent tests
pytest agents/ -v --override-ini="addopts="

# Run specific agent
pytest agents/trail-assessor/skills/ -v --override-ini="addopts="

# Run skill-runtime tests
pytest packages/skill-runtime/tests/ -v --override-ini="addopts="

# Verify Coordinator routing
pytest agents/coordinator/tests/test_coordinator_service.py -v
```

---

## Decision Points (Autonomous Handling)

When you encounter these, make the decision and document it:

1. **Skill scope unclear**: Match complexity to Burn Analyst skills (~30-40 tests)
2. **Missing fixture data**: Create minimal fixture in `data/fixtures/`
3. **Test failure**: Fix the test or implementation, don't skip
4. **Integration issue**: Check Coordinator routing keywords first
5. **Performance concern**: Defer optimization to Phase 5

---

## Begin Planning

Enter planning mode and:

1. Read the reference files listed above
2. Design the parallel execution strategy
3. Identify any blockers or missing fixtures
4. Create detailed implementation plan for Wave 1
5. Exit planning mode with approval to begin

The goal is maximum parallelization while maintaining quality. Use the Task tool with subagent_type='general-purpose' for the parallel builds.

**Remember:** You are working autonomously. Make decisions, document them, and keep building toward MVP.
