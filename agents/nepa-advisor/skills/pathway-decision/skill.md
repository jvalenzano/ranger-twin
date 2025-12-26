# Pathway Decision

## Description
Determines the appropriate NEPA pathway (Categorical Exclusion, Environmental Assessment, or Environmental Impact Statement) based on project scope, action type, and extraordinary circumstances. Screens for triggers that elevate review requirements and identifies applicable CE categories under 36 CFR 220.6.

## Triggers
When should the agent invoke this skill?
- User asks about NEPA pathway or compliance level
- Query mentions "CE", "EA", or "EIS"
- Request for environmental review requirements
- Questions about extraordinary circumstances
- Project scoping or pathway determination requests
- Questions about 36 CFR 220.6 applicability

## Instructions
Step-by-step reasoning for the agent:
1. **Screen Extraordinary Circumstances**: Evaluate project context for EC triggers
   - Check for federally listed species presence
   - Identify congressionally designated areas
   - Assess inventoried roadless areas
   - Check for cultural/religious sites
   - Evaluate flood plains and wetlands
2. **Identify Action Type**: Classify the proposed action
   - Timber salvage, hazard tree removal
   - Trail repair, road maintenance
   - Reforestation, revegetation
   - Emergency stabilization
3. **Check CE Applicability**: Match action to 36 CFR 220.6 categories
   - 36 CFR 220.6(e)(6): Timber Stand Improvement (<=4200 acres)
   - 36 CFR 220.6(e)(13): Post-Fire Rehabilitation (<=4200 acres)
   - 36 CFR 220.6(e)(14): Trail Maintenance (no acreage limit)
   - 36 CFR 220.6(d)(4): Emergency Fire Suppression Activities
4. **Apply Pathway Thresholds**: Determine final pathway
   - CE if: Matches CE category, within acreage limits, no ECs triggered
   - EA if: Uncertain significance, moderate impacts, or ECs present
   - EIS if: Significant environmental effects expected
5. **Document Reasoning**: Build chain explaining pathway selection

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier |
| action_type | string | Yes | Type of action (timber_salvage, trail_repair, reforestation, etc.) |
| acres | number | Yes | Project acreage |
| project_context | object | No | Additional context (species, designated areas, etc.) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| pathway | string | Recommended NEPA pathway (CE, EA, EIS) |
| ce_category | string | Applicable CE citation (if CE pathway) |
| extraordinary_circumstances | array | List of triggered ECs |
| acreage_compliance | object | Acreage vs. CE limits |
| reasoning_chain | array | Step-by-step pathway decision logic |
| confidence | number | Decision confidence (0-1) |
| data_sources | array | Regulatory sources used |
| recommendations | array | Next steps for compliance |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, screen for extraordinary circumstances that trigger EA review
2. Then, identify the action type and match to CE categories
3. Next, verify acreage is within CE limits (4200 acres for most post-fire actions)
4. Then, evaluate whether any ECs or thresholds require EA/EIS
5. Finally, recommend pathway with citations and compliance steps

## Resources
- `resources/ce-categories.json` - 36 CFR 220.6 Categorical Exclusion categories
- `resources/extraordinary-circumstances.json` - EC screening criteria

## Scripts
- `scripts/decide_pathway.py` - Python implementation of pathway decision
  - Functions:
    - `screen_extraordinary_circumstances(project_context: dict) -> tuple[str, list, list]`
    - `identify_applicable_ce(action_type: str, acres: float) -> tuple[str | None, str]`
    - `evaluate_pathway_thresholds(action_type: str, acres: float, ec_status: str) -> str`
    - `execute(inputs: dict) -> dict`

## Examples

### Example 1: CE Pathway - Post-Fire Trail Repair
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "action_type": "trail_repair",
  "acres": 50,
  "project_context": {
    "designated_areas": [],
    "listed_species": [],
    "roadless_areas": false
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "CE",
  "ce_category": "36 CFR 220.6(e)(14)",
  "ce_name": "Trail Maintenance",
  "extraordinary_circumstances": [],
  "acreage_compliance": {
    "proposed_acres": 50,
    "ce_limit": null,
    "compliant": true
  },
  "reasoning_chain": [
    "Screening for extraordinary circumstances",
    "No federally listed species identified",
    "No congressionally designated areas affected",
    "No inventoried roadless areas impacted",
    "EC Status: CLEAR - No extraordinary circumstances triggered",
    "Action type 'trail_repair' matches 36 CFR 220.6(e)(14) - Trail Maintenance",
    "Acreage: 50 acres (no limit for trail maintenance)",
    "Pathway determination: CE - No ECs, action matches CE category"
  ],
  "confidence": 0.95,
  "data_sources": ["36 CFR 220.6", "FSH 1909.15"],
  "recommendations": [
    "Prepare Decision Memo documenting CE application",
    "Document that no extraordinary circumstances apply",
    "Complete trail maintenance with standard mitigation measures"
  ]
}
```

### Example 2: EA Pathway - Timber Salvage with EC
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "action_type": "timber_salvage",
  "acres": 3200,
  "project_context": {
    "designated_areas": ["Waldo Lake Wilderness"],
    "listed_species": ["Northern Spotted Owl"],
    "roadless_areas": false
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EA",
  "ce_category": null,
  "extraordinary_circumstances": [
    {
      "id": "ec_01",
      "name": "Federally Listed Species",
      "triggered": true,
      "consultation_required": "ESA Section 7"
    },
    {
      "id": "ec_03",
      "name": "Congressionally Designated Areas",
      "triggered": true,
      "notes": "Waldo Lake Wilderness proximity"
    }
  ],
  "acreage_compliance": {
    "proposed_acres": 3200,
    "ce_limit": 4200,
    "compliant": true
  },
  "reasoning_chain": [
    "Screening for extraordinary circumstances",
    "EC TRIGGERED: Federally listed species present (Northern Spotted Owl) - ESA Section 7 consultation required",
    "EC TRIGGERED: Congressionally designated areas affected (Waldo Lake Wilderness)",
    "EC Status: TRIGGERED - EA required",
    "Action type 'timber_salvage' matches 36 CFR 220.6(e)(6) - Timber Stand Improvement",
    "Acreage: 3,200 acres (under 4,200 acre CE limit)",
    "Pathway determination: EA - Extraordinary circumstances override CE eligibility"
  ],
  "confidence": 0.93,
  "data_sources": ["36 CFR 220.6", "40 CFR 1508.4", "ESA Section 7"],
  "recommendations": [
    "Initiate ESA Section 7 consultation for Northern Spotted Owl",
    "Assess wilderness boundary impacts",
    "Prepare Environmental Assessment with public scoping",
    "Develop alternatives that minimize wilderness impacts"
  ]
}
```

### Example 3: EIS Pathway - Large-Scale Salvage
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "action_type": "timber_salvage",
  "acres": 6500,
  "project_context": {
    "designated_areas": [],
    "listed_species": ["Northern Spotted Owl", "Bull Trout"],
    "roadless_areas": true
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EIS",
  "ce_category": null,
  "extraordinary_circumstances": [
    {
      "id": "ec_01",
      "name": "Federally Listed Species",
      "triggered": true,
      "consultation_required": "ESA Section 7"
    },
    {
      "id": "ec_04",
      "name": "Inventoried Roadless Areas",
      "triggered": true
    }
  ],
  "acreage_compliance": {
    "proposed_acres": 6500,
    "ce_limit": 4200,
    "compliant": false
  },
  "reasoning_chain": [
    "Screening for extraordinary circumstances",
    "EC TRIGGERED: Multiple federally listed species present (Northern Spotted Owl, Bull Trout)",
    "EC TRIGGERED: Inventoried roadless areas affected",
    "EC Status: TRIGGERED - EA minimum required",
    "Action type 'timber_salvage' matches 36 CFR 220.6(e)(6) - Timber Stand Improvement",
    "Acreage: 6,500 acres (EXCEEDS 4,200 acre CE limit)",
    "Pathway determination: EIS - Acreage exceeds thresholds + multiple ECs + significant environmental effects expected"
  ],
  "confidence": 0.96,
  "data_sources": ["36 CFR 220.6", "40 CFR 1502", "FSH 1909.15"],
  "recommendations": [
    "Publish Notice of Intent (NOI) in Federal Register",
    "Conduct comprehensive scoping with public involvement",
    "Initiate ESA Section 7 consultation for all listed species",
    "Develop range of alternatives including no-action",
    "Prepare Draft EIS with full impact analysis"
  ]
}
```

## References
- 36 CFR Part 220 - National Environmental Policy Act (NEPA) Compliance
- 40 CFR Parts 1500-1508 - Council on Environmental Quality Regulations
- Forest Service Handbook 1909.15 - NEPA Handbook
- USFS NEPA Compliance: https://www.fs.usda.gov/emc/nepa/
