# RANGER Phase 2 Completion: MTBS Classification & Boundary Mapping

> Use this to continue Phase 2 in a new Claude Code session.

---

## Context for Claude Code

You are the tech lead for RANGER, an AI-powered post-fire forest recovery platform. The project uses a Skills-First architecture (ADR-005) with Google ADK agents.

---

## What Was Just Completed

**Commit:** `1aa6e19 feat: Phase 2 Burn Analyst agent with Soil Burn Severity skill`
**Branch:** `feature/burn-analyst-agent`

### Burn Analyst Agent — Now Functional

1. **Agent Implementation** (`agents/burn-analyst/agent.py`)
   - ADK Agent with `assess_severity` tool
   - Name: `burn_analyst` (underscore for Python identifier compliance)
   - Model: `gemini-2.0-flash`

2. **Soil Burn Severity Skill** (`agents/burn-analyst/skills/soil-burn-severity/`)
   - dNBR classification: UNBURNED (<0.1), LOW (0.1-0.27), MODERATE (0.27-0.66), HIGH (≥0.66)
   - Erosion risk assessment based on severity + slope
   - Cedar Creek fixture integration
   - BAER team recommendations
   - **47 tests passing**

3. **Delegation Routing** — Already wired in Coordinator
   - Queries with "burn severity", "soil burn", "dnbr", "mtbs" → `burn-analyst`

### Current Test Count
| Component | Tests |
|-----------|-------|
| Coordinator (Phase 1) | 60 |
| Burn Analyst (Phase 2) | 47 |
| **Total** | **107** |

---

## Remaining Phase 2 Tasks

Per `docs/_!_IMPLEMENTATION-ROADMAP.md`, two P1 skills remain:

### 1. MTBS Classification Skill (P1)

**Purpose:** Focused severity classification using MTBS (Monitoring Trends in Burn Severity) methodology.

**Note:** The Soil Burn Severity skill already includes dNBR classification logic. This skill should:
- Focus on the MTBS-specific classification protocol
- Provide sector-level severity class assignments
- Include MTBS data source citations
- Potentially be a lighter skill that calls shared classification logic

**Suggested structure:**
```
agents/burn-analyst/skills/mtbs-classification/
├── skill.md              # MTBS classification protocol
├── scripts/
│   └── classify_mtbs.py  # Classification logic (may reuse from soil-burn)
├── resources/
│   └── mtbs-thresholds.json
├── examples/
│   └── cedar-creek-mtbs.json
└── tests/
    └── test_mtbs_classification.py
```

### 2. Boundary Mapping Skill (P1)

**Purpose:** Fire perimeter validation and boundary analysis.

**Should include:**
- Validate fire perimeter geometry
- Calculate perimeter statistics (total perimeter, area)
- Identify boundary issues (gaps, overlaps)
- Compare reported vs. calculated acres

**Suggested structure:**
```
agents/burn-analyst/skills/boundary-mapping/
├── skill.md              # Perimeter validation rules
├── scripts/
│   └── validate_boundary.py
├── resources/
│   └── geometry-standards.json
├── examples/
│   └── cedar-creek-boundary.json
└── tests/
    └── test_boundary_mapping.py
```

---

## Implementation Guidance

### Follow Established Patterns

Use the Soil Burn Severity skill as your template:
- `skill.md` with all required sections (Description, Triggers, Instructions, Inputs, Outputs, Reasoning Chain)
- `scripts/` with `execute(inputs: dict) -> dict` entry point
- `tests/` with structure, classification, and integration tests
- Import path setup in `conftest.py`

### Agent Integration

After building each skill, add it to `agents/burn-analyst/agent.py`:

```python
# Add to path setup section
MTBS_PATH = SKILLS_DIR / "mtbs-classification" / "scripts"
if MTBS_PATH.exists():
    sys.path.insert(0, str(MTBS_PATH))

# Add tool function
def classify_mtbs(fire_id: str, ...) -> dict:
    """..."""
    from classify_mtbs import execute
    return execute({...})

# Add to Agent tools list
root_agent = Agent(
    ...
    tools=[assess_severity, classify_mtbs, validate_boundary],
)
```

### Test Commands

```bash
# Activate venv
source venv/bin/activate

# Run specific skill tests
python -m pytest agents/burn-analyst/skills/mtbs-classification/tests/ -v --override-ini="addopts=" --import-mode=importlib

# Run all burn-analyst tests
python -m pytest agents/burn-analyst/ -v --override-ini="addopts=" --import-mode=importlib

# Run all agent tests (coordinator + burn-analyst)
python -m pytest agents/coordinator/ agents/burn-analyst/ -v --override-ini="addopts=" --import-mode=importlib
```

---

## Cedar Creek Fixture Data

Available at `data/fixtures/cedar-creek/burn-severity.json`:

```json
{
  "fire_id": "cedar-creek-2022",
  "fire_name": "Cedar Creek Fire",
  "total_acres": 127341,
  "sectors": [
    {
      "id": "CORE-1",
      "name": "Central Fire Origin",
      "severity": "HIGH",
      "dnbr_mean": 0.81,
      "acres": 27001,
      "geometry": { "type": "Polygon", "coordinates": [...] }
    },
    // ... 7 more sectors
  ],
  "summary": {
    "high_severity_acres": 81041,
    "moderate_severity_acres": 37900,
    "low_severity_acres": 8400
  }
}
```

---

## Success Criteria (Phase 2 Complete)

- [x] Burn Analyst agent runs in ADK
- [x] Coordinator correctly delegates burn queries
- [x] Soil Burn Severity skill with 47 tests
- [ ] MTBS Classification skill with tests
- [ ] Boundary Mapping skill with tests
- [ ] All skills integrated into agent.py
- [ ] 60+ total Burn Analyst tests

---

## First Task

Build the MTBS Classification skill. Consider whether it should:
1. Be a separate classification engine, OR
2. Be a thin wrapper that leverages the existing `assess_severity` logic with MTBS-specific framing

Then build the lightweight Boundary Mapping skill.

Once both are complete, commit and Phase 2 is done.
