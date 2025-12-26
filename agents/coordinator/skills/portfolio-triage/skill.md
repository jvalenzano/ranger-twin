# Portfolio Triage

## Description
Prioritizes fire incidents in the RANGER portfolio for BAER (Burned Area Emergency
Response) assessment and resource allocation. Uses a weighted scoring formula based
on fire phase, severity, and size to produce a ranked list with confidence scores
and reasoning chains. This is the Coordinator's primary tool for helping field teams
understand which fires need attention first.

## Triggers
When should the agent invoke this skill?
- User asks to prioritize fires in portfolio
- User requests BAER triage or prioritization
- Query mentions "which fires need attention first"
- Request for fire ranking or priority ordering
- Multi-fire comparison or resource allocation questions
- Questions about where to deploy BAER teams
- Portfolio summary requests with urgency context

## Instructions
Step-by-step reasoning for the agent:
1. **Load Portfolio Data**: Retrieve fire data from the provided input or fixtures
   - Each fire must have: id, name, severity, acres, phase
   - Validate required fields are present
2. **Calculate Triage Scores**: For each fire, compute:
   - Severity Weight: critical=4, high=3, moderate=2, low=1
   - Normalized Acres: acres/10000, capped at 50 (for 500k+ acre fires)
   - Phase Multiplier: active=2.0, baer_assessment=1.75, baer_implementation=1.25, in_restoration=1.0
   - **Score = Severity Weight × Normalized Acres × Phase Multiplier**
3. **Rank Fires**: Sort by triage score in descending order (highest priority first)
4. **Generate Reasoning**: For each fire, create a human-readable explanation of its score
5. **Calculate Confidence**: Based on data completeness and recency
   - All fields present: 0.92 (high confidence for fixture data)
   - Missing fields: reduce confidence proportionally

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fires | array | Yes | Array of fire objects with id, name, severity, acres, phase |
| top_n | number | No | Number of top-priority fires to return (default: all) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| ranked_fires | array | Fires sorted by triage score (highest first) |
| reasoning_chain | array | Step-by-step explanation of each fire's ranking |
| confidence | number | Overall confidence in the ranking (0-1) |
| summary | string | Brief portfolio overview for briefings |

## Resources
- `resources/phase-weights.json` - Phase multiplier configuration with descriptions
- `resources/severity-weights.json` - Severity weight configuration

## Scripts
- `scripts/calculate_priority.py` - Python implementation of triage algorithm
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fires": [...], "top_n": 5}`
  - Returns: `{"ranked_fires": [...], "reasoning_chain": [...], "confidence": 0.92}`

## Examples

### Example 1: Two-Fire Comparison
**Input:**
```json
{
  "fires": [
    {
      "id": "cedar-creek-2022",
      "name": "Cedar Creek Fire",
      "severity": "high",
      "acres": 127341,
      "phase": "baer_implementation"
    },
    {
      "id": "bootleg-2021",
      "name": "Bootleg Fire",
      "severity": "high",
      "acres": 413765,
      "phase": "in_restoration"
    }
  ]
}
```

**Output:**
```json
{
  "ranked_fires": [
    {
      "id": "bootleg-2021",
      "name": "Bootleg Fire",
      "triage_score": 150.0,
      "severity_weight": 3,
      "acres_normalized": 50.0,
      "phase_multiplier": 1.0,
      "reasoning": "Bootleg Fire: 3 (high severity) x 50.0 (normalized acres, capped) x 1.0 (in_restoration) = 150.0"
    },
    {
      "id": "cedar-creek-2022",
      "name": "Cedar Creek Fire",
      "triage_score": 47.8,
      "severity_weight": 3,
      "acres_normalized": 12.73,
      "phase_multiplier": 1.25,
      "reasoning": "Cedar Creek Fire: 3 (high severity) x 12.73 (normalized acres) x 1.25 (baer_implementation) = 47.8"
    }
  ],
  "reasoning_chain": [
    "Bootleg Fire: 3 (high severity) x 50.0 (normalized acres, capped) x 1.0 (in_restoration) = 150.0",
    "Cedar Creek Fire: 3 (high severity) x 12.73 (normalized acres) x 1.25 (baer_implementation) = 47.8"
  ],
  "confidence": 0.92,
  "summary": "2 fires analyzed. Bootleg Fire ranks highest due to massive size (413k acres) despite being in restoration phase."
}
```

### Example 2: Active Fire Priority
**Input:**
```json
{
  "fires": [
    {
      "id": "mckay-2024",
      "name": "McKay Creek Fire",
      "severity": "critical",
      "acres": 25000,
      "phase": "active"
    },
    {
      "id": "cedar-creek-2022",
      "name": "Cedar Creek Fire",
      "severity": "high",
      "acres": 127341,
      "phase": "baer_implementation"
    }
  ],
  "top_n": 1
}
```

**Output:**
```json
{
  "ranked_fires": [
    {
      "id": "mckay-2024",
      "name": "McKay Creek Fire",
      "triage_score": 20.0,
      "severity_weight": 4,
      "acres_normalized": 2.5,
      "phase_multiplier": 2.0,
      "reasoning": "McKay Creek Fire: 4 (critical severity) x 2.5 (normalized acres) x 2.0 (active) = 20.0"
    }
  ],
  "reasoning_chain": [
    "McKay Creek Fire: 4 (critical severity) x 2.5 (normalized acres) x 2.0 (active) = 20.0",
    "Cedar Creek Fire: 3 (high severity) x 12.73 (normalized acres) x 1.25 (baer_implementation) = 47.8"
  ],
  "confidence": 0.92,
  "summary": "1 of 2 fires returned (top_n=1). McKay Creek Fire is actively burning with critical severity - immediate attention required."
}
```

### Example 3: BAER Assessment Window Priority
**Input:**
```json
{
  "fires": [
    {
      "id": "hermit-2024",
      "name": "Hermit Peak Fire",
      "severity": "high",
      "acres": 45000,
      "phase": "baer_assessment"
    },
    {
      "id": "bootleg-2021",
      "name": "Bootleg Fire",
      "severity": "high",
      "acres": 413765,
      "phase": "in_restoration"
    }
  ]
}
```

**Output:**
```json
{
  "ranked_fires": [
    {
      "id": "bootleg-2021",
      "name": "Bootleg Fire",
      "triage_score": 150.0,
      "severity_weight": 3,
      "acres_normalized": 50.0,
      "phase_multiplier": 1.0,
      "reasoning": "Bootleg Fire: 3 (high severity) x 50.0 (normalized acres, capped) x 1.0 (in_restoration) = 150.0"
    },
    {
      "id": "hermit-2024",
      "name": "Hermit Peak Fire",
      "triage_score": 23.6,
      "severity_weight": 3,
      "acres_normalized": 4.5,
      "phase_multiplier": 1.75,
      "reasoning": "Hermit Peak Fire: 3 (high severity) x 4.5 (normalized acres) x 1.75 (baer_assessment) = 23.6"
    }
  ],
  "reasoning_chain": [
    "Bootleg Fire: 3 (high severity) x 50.0 (normalized acres, capped) x 1.0 (in_restoration) = 150.0",
    "Hermit Peak Fire: 3 (high severity) x 4.5 (normalized acres) x 1.75 (baer_assessment) = 23.6"
  ],
  "confidence": 0.92,
  "summary": "2 fires analyzed. Note: Hermit Peak Fire is in 7-day BAER assessment window - time-critical for team deployment despite lower absolute score."
}
```

## References
- RANGER Phase Model: `apps/command-console/src/types/mission.ts`
- BAER Program Overview: https://www.fs.usda.gov/naturalresources/watershed/burnedareas.shtml
- USFS Burned Area Response Best Practices
