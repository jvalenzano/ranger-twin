# Recreation Priority

## Description
Prioritizes trail repairs using multi-factor analysis to optimize resource allocation and maximize
public benefit. Evaluates trails based on usage patterns, access value, cost-effectiveness, and
strategic importance to create a prioritized repair schedule. This is the Trail Assessor's primary
tool for budget planning and repair sequencing.

## Triggers
When should the agent invoke this skill?
- User asks about trail repair priorities or sequencing
- Query mentions budget allocation or resource planning
- Request for quick-win opportunities or low-hanging fruit
- Questions about trail ranking by importance
- Usage-based prioritization requests
- Cost-effectiveness analysis needed
- Multi-year repair planning discussions

## Instructions
Step-by-step reasoning for the agent:
1. **Load Trail Data**: Retrieve trail and damage data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Optionally apply budget constraint
   - Load from Cedar Creek fixtures or provided data
2. **Calculate Usage Score** (0-100): Evaluate visitor traffic and value
   - Priority rank from field assessment (inverse: rank 1 = highest)
   - Trail miles (longer = higher value)
   - Trail class (lower class = higher usage typically)
3. **Calculate Access Score** (0-100): Evaluate connectivity and alternatives
   - Wilderness gateway access
   - Connection to other trail systems
   - Unique destination value
   - Seasonal access window
4. **Calculate Cost-Effectiveness** (0-100): Balance cost vs. benefit
   - Repair cost per mile
   - Crew days required
   - Benefit-to-cost ratio
5. **Identify Quick Wins**: Low-cost, high-impact opportunities
   - Cost < $15,000
   - High usage score (>60)
   - Short timeline (<2 months)
6. **Allocate Resources**: If budget provided, optimize allocation
   - Sort by composite priority score
   - Fit trails within budget constraint
   - Identify budget shortfall and deferred trails
7. **Generate Reasoning Chain**: Document prioritization decisions

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| budget | number | No | Optional budget constraint in dollars (no limit if not provided) |
| include_quick_wins | boolean | No | Whether to identify quick-win opportunities (default: true) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| total_trails | number | Number of trails analyzed |
| priority_ranking | array | Trails ranked by composite priority score |
| quick_wins | array | Low-cost, high-impact opportunities |
| resource_allocation | object | Budget allocation if budget provided |
| factor_scores | object | Usage, access, and cost scores per trail |
| reasoning_chain | array | Step-by-step prioritization decisions |
| confidence | number | Assessment confidence (0-1) |
| data_sources | array | Sources used |
| recommendations | array | Repair sequencing recommendations |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the fire by ID and load trail damage data
2. Then, calculate usage, access, and cost-effectiveness scores for each trail
3. Next, compute composite priority score using weighted factors
4. Then, identify quick-win opportunities based on cost and impact
5. If budget provided, allocate resources optimally within constraints
6. Finally, generate sequenced repair recommendations

## Resources
- `resources/priority-weights.json` - Factor weights and quick-win thresholds

## Scripts
- `scripts/prioritize_trails.py` - Python implementation of trail prioritization
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022", "budget": 200000}`
  - Returns: Complete prioritization with rankings and budget allocation

## Examples

### Example 1: Full Prioritization
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "include_quick_wins": true
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "total_trails": 5,
  "priority_ranking": [
    {
      "rank": 1,
      "trail_id": "waldo-lake-3536",
      "trail_name": "Waldo Lake Trail #3536",
      "priority_score": 87.5,
      "usage_score": 95.0,
      "access_score": 85.0,
      "cost_effectiveness": 65.0,
      "total_cost": 133500,
      "rationale": "Primary recreation access. High visitor use. Critical for 2024 season."
    },
    {
      "rank": 2,
      "trail_id": "hills-creek-3510",
      "trail_name": "Hills Creek Trail #3510",
      "priority_score": 82.0,
      "usage_score": 80.0,
      "access_score": 90.0,
      "cost_effectiveness": 45.0,
      "total_cost": 238000,
      "rationale": "Access route for timber salvage. Economic recovery value."
    }
  ],
  "quick_wins": [
    {
      "trail_id": "timpanogas-3527",
      "trail_name": "Timpanogas Lake Trail #3527",
      "total_cost": 4800,
      "priority_score": 68.0,
      "estimated_timeline": "1 month",
      "rationale": "Minimal damage. Low cost. Quick reopening opportunity."
    },
    {
      "trail_id": "charlton-lake-3578",
      "trail_name": "Charlton Lake Trail #3578",
      "total_cost": 10500,
      "priority_score": 72.0,
      "estimated_timeline": "1-2 months",
      "rationale": "Moderate use. Can reopen quickly with minimal investment."
    }
  ],
  "reasoning_chain": [
    "Evaluating 5 trails for Cedar Creek Fire",
    "Waldo Lake Trail: Usage 95.0, Access 85.0, Cost-Eff 65.0 -> Priority 87.5",
    "Hills Creek Trail: Usage 80.0, Access 90.0, Cost-Eff 45.0 -> Priority 82.0",
    "Identified 2 quick wins: Timpanogas ($4.8K), Charlton ($10.5K)"
  ],
  "confidence": 0.85,
  "data_sources": ["Cedar Creek field assessment 2022-10-25"],
  "recommendations": [
    "Phase 1: Address quick wins (Timpanogas, Charlton) for early reopenings",
    "Phase 2: Prioritize Waldo Lake Trail (primary access, high use)",
    "Phase 3: Coordinate Hills Creek Trail repair with timber salvage operations"
  ]
}
```

### Example 2: Budget-Constrained Allocation
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "budget": 200000
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "total_trails": 5,
  "budget": 200000,
  "resource_allocation": {
    "funded_trails": [
      {
        "trail_id": "waldo-lake-3536",
        "trail_name": "Waldo Lake Trail #3536",
        "cost": 133500,
        "priority_score": 87.5
      },
      {
        "trail_id": "bobby-lake-3526",
        "trail_name": "Bobby Lake Trail #3526",
        "cost": 60000,
        "priority_score": 75.0
      }
    ],
    "total_allocated": 193500,
    "remaining_budget": 6500,
    "deferred_trails": [
      {
        "trail_id": "hills-creek-3510",
        "trail_name": "Hills Creek Trail #3510",
        "cost": 238000,
        "priority_score": 82.0,
        "shortfall": 231500
      }
    ]
  },
  "quick_wins": [
    {
      "trail_id": "timpanogas-3527",
      "total_cost": 4800,
      "status": "Can be funded with remaining budget"
    }
  ],
  "reasoning_chain": [
    "Budget: $200,000 available",
    "Rank 1: Waldo Lake ($133.5K) - Funded",
    "Rank 2: Bobby Lake ($60K) - Funded (Total: $193.5K)",
    "Rank 3: Hills Creek ($238K) - Deferred (exceeds budget)",
    "Quick win: Timpanogas ($4.8K) fits in remaining $6.5K"
  ],
  "recommendations": [
    "Fund Waldo Lake and Bobby Lake trails within $200K budget",
    "Use remaining $6.5K for Timpanogas quick win",
    "Seek additional $231.5K for Hills Creek Trail in next fiscal year"
  ]
}
```

## References
- USFS Recreation Priority Framework
- Trail Repair Cost Estimation Guidelines
- Cedar Creek Trail Damage Fixture: `data/fixtures/cedar-creek/trail-damage.json`
