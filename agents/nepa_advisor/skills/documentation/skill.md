# Documentation

## Description
Generates documentation checklists and template selection based on NEPA pathway. Identifies required specialist reports, consultation documentation, and administrative record components for Categorical Exclusions, Environmental Assessments, and Environmental Impact Statements.

## Triggers
When should the agent invoke this skill?
- User asks about required documentation
- Query mentions "checklist", "templates", or "paperwork"
- Request for specialist reports or studies needed
- Questions about what to include in Decision Memo, FONSI, or ROD
- Documentation completeness verification requests
- Template selection for NEPA pathway

## Instructions
Step-by-step reasoning for the agent:
1. **Identify Pathway**: Determine which NEPA pathway (CE/EA/EIS)
2. **Load Requirements**: Get documentation requirements for pathway
   - CE: Decision Memo, EC screening, project file
   - EA: EA document, FONSI, public comments, specialist reports
   - EIS: Draft EIS, Final EIS, ROD, NOI, public comments, alternatives analysis
3. **Identify Specialist Reports**: Match action type to required studies
   - Wildlife biology (for listed species)
   - Archaeology (for cultural resources)
   - Hydrology (for watershed impacts)
   - Silviculture (for timber actions)
   - Soils (for erosion concerns)
4. **Select Templates**: Choose appropriate template and FSH reference
   - FSH 1909.15 Chapter 70 for template guidance
   - Decision Memo template for CE
   - EA/FONSI template for EA
   - EIS template per 40 CFR 1502
5. **Build Checklist**: Create comprehensive documentation checklist

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier |
| pathway | string | Yes | NEPA pathway (CE, EA, EIS) |
| action_type | string | Yes | Type of action (for specialist report determination) |
| project_context | object | No | Additional context (species, consultations, etc.) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The fire identifier |
| pathway | string | NEPA pathway |
| template_name | string | Recommended template |
| template_reference | string | FSH or CFR reference |
| documentation_checklist | array | Required documents with descriptions |
| specialist_reports | array | Required specialist studies |
| consultation_requirements | array | Agency consultations needed |
| reasoning_chain | array | Step-by-step checklist development |
| confidence | number | Checklist completeness confidence (0-1) |
| data_sources | array | Regulatory sources |
| recommendations | array | Documentation workflow suggestions |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, confirm the NEPA pathway from user input or pathway-decision skill
2. Then, load baseline documentation requirements for that pathway
3. Next, identify specialist reports based on action type and project context
4. Then, add consultation requirements (ESA, NHPA, etc.) from project context
5. Finally, select appropriate template and build complete checklist

## Resources
- `resources/documentation-requirements.json` - Required docs by pathway
- `resources/templates.json` - Template sections and FSH references
- `resources/specialist-reports.json` - Specialist report requirements by discipline

## Scripts
- `scripts/generate_checklist.py` - Python implementation
  - Functions:
    - `get_documentation_requirements(pathway: str) -> list`
    - `identify_specialist_reports(action_type: str, project_context: dict) -> list`
    - `select_template(pathway: str) -> tuple[str, str]`
    - `execute(inputs: dict) -> dict`

## Examples

### Example 1: CE Documentation Checklist
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "CE",
  "action_type": "trail_repair",
  "project_context": {
    "listed_species": [],
    "cultural_sites": []
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "CE",
  "template_name": "Decision Memo for Categorical Exclusion",
  "template_reference": "FSH 1909.15 Chapter 70, Exhibit 01",
  "documentation_checklist": [
    {
      "document": "Decision Memo",
      "description": "Documents CE application and extraordinary circumstances screening",
      "required": true,
      "reference": "FSH 1909.15-70"
    },
    {
      "document": "Extraordinary Circumstances Screening",
      "description": "Evaluation of all eight EC criteria",
      "required": true,
      "reference": "FSH 1909.15-30"
    },
    {
      "document": "Project File",
      "description": "Administrative record with maps, specialist input, and supporting analysis",
      "required": true,
      "reference": "36 CFR 220.6"
    },
    {
      "document": "Public Notice (if applicable)",
      "description": "Scoping notice or project announcement",
      "required": false,
      "reference": "Local unit policy"
    }
  ],
  "specialist_reports": [
    {
      "discipline": "Engineering",
      "report_type": "Trail Assessment",
      "required": true,
      "rationale": "Trail repair action requires engineering assessment"
    },
    {
      "discipline": "Hydrology",
      "report_type": "Drainage Analysis",
      "required": false,
      "rationale": "May be needed if trail crosses streams"
    }
  ],
  "consultation_requirements": [],
  "reasoning_chain": [
    "NEPA pathway: CE",
    "Loading documentation requirements for Categorical Exclusion",
    "CE requires: Decision Memo, EC screening, project file",
    "Action type 'trail_repair' - Engineering specialist report required",
    "No listed species or cultural sites - no consultation requirements",
    "Template selected: Decision Memo for Categorical Exclusion (FSH 1909.15-70)"
  ],
  "confidence": 0.95,
  "data_sources": ["FSH 1909.15", "36 CFR 220.6"],
  "recommendations": [
    "Start with Decision Memo template from FSH 1909.15 Chapter 70",
    "Complete EC screening worksheet for all eight circumstances",
    "Obtain engineering assessment for trail condition and repair scope",
    "Compile project file with maps showing trail location and work areas"
  ]
}
```

### Example 2: EA Documentation Checklist
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EA",
  "action_type": "timber_salvage",
  "project_context": {
    "listed_species": ["Northern Spotted Owl"],
    "designated_areas": []
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EA",
  "template_name": "Environmental Assessment",
  "template_reference": "FSH 1909.15 Chapter 40",
  "documentation_checklist": [
    {
      "document": "Environmental Assessment",
      "description": "Analysis of proposed action and alternatives with environmental effects",
      "required": true,
      "reference": "40 CFR 1501.5"
    },
    {
      "document": "Finding of No Significant Impact (FONSI)",
      "description": "Decision document if EA determines no significant impact",
      "required": true,
      "reference": "40 CFR 1501.6"
    },
    {
      "document": "Public Scoping Documentation",
      "description": "Record of public involvement and comments received",
      "required": true,
      "reference": "FSH 1909.15-40"
    },
    {
      "document": "Alternatives Analysis",
      "description": "Comparison of action alternatives including no-action",
      "required": true,
      "reference": "40 CFR 1502.14"
    },
    {
      "document": "Specialist Reports",
      "description": "Technical analyses from interdisciplinary team",
      "required": true,
      "reference": "FSH 1909.15-40"
    },
    {
      "document": "Response to Comments",
      "description": "Responses to substantive public comments",
      "required": true,
      "reference": "40 CFR 1503.4"
    }
  ],
  "specialist_reports": [
    {
      "discipline": "Wildlife Biology",
      "report_type": "Biological Assessment",
      "required": true,
      "rationale": "Northern Spotted Owl present - ESA Section 7 consultation required"
    },
    {
      "discipline": "Silviculture",
      "report_type": "Timber Cruise and Silvics Report",
      "required": true,
      "rationale": "Timber salvage requires stand exam and silvicultural prescription"
    },
    {
      "discipline": "Soils",
      "report_type": "Soil Erosion and Compaction Analysis",
      "required": true,
      "rationale": "Post-fire soils vulnerable to compaction and erosion"
    },
    {
      "discipline": "Hydrology",
      "report_type": "Watershed Effects Analysis",
      "required": true,
      "rationale": "Timber harvest can affect watershed function"
    }
  ],
  "consultation_requirements": [
    {
      "agency": "U.S. Fish and Wildlife Service",
      "consultation_type": "ESA Section 7 Formal Consultation",
      "trigger": "Northern Spotted Owl presence",
      "documents_needed": ["Biological Assessment", "Species occurrence data"]
    }
  ],
  "reasoning_chain": [
    "NEPA pathway: EA",
    "Loading documentation requirements for Environmental Assessment",
    "EA requires: EA document, FONSI, scoping, alternatives, specialist reports, comment responses",
    "Action type 'timber_salvage' - Silviculture, Soils, Hydrology reports required",
    "Northern Spotted Owl present - Wildlife Biology BA required + ESA Section 7 consultation",
    "Template selected: Environmental Assessment (FSH 1909.15 Chapter 40)"
  ],
  "confidence": 0.93,
  "data_sources": ["FSH 1909.15", "40 CFR 1500-1508", "ESA Section 7"],
  "recommendations": [
    "Use EA template from FSH 1909.15 Chapter 40",
    "Initiate ESA Section 7 consultation with USFWS early in process",
    "Develop 2-3 action alternatives plus no-action alternative",
    "Conduct public scoping with 30-day comment period",
    "Coordinate with interdisciplinary team for specialist reports"
  ]
}
```

### Example 3: EIS Documentation Checklist
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EIS",
  "action_type": "timber_salvage",
  "project_context": {
    "listed_species": ["Northern Spotted Owl", "Bull Trout"],
    "designated_areas": ["Waldo Lake Wilderness"]
  }
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EIS",
  "template_name": "Environmental Impact Statement",
  "template_reference": "40 CFR 1502, FSH 1909.15 Chapter 50",
  "documentation_checklist": [
    {
      "document": "Notice of Intent (NOI)",
      "description": "Federal Register notice announcing EIS preparation",
      "required": true,
      "reference": "40 CFR 1501.9"
    },
    {
      "document": "Draft EIS",
      "description": "Comprehensive analysis of environmental impacts and alternatives",
      "required": true,
      "reference": "40 CFR 1502"
    },
    {
      "document": "Final EIS",
      "description": "Revised EIS with responses to comments and any modifications",
      "required": true,
      "reference": "40 CFR 1503.4"
    },
    {
      "document": "Record of Decision (ROD)",
      "description": "Final decision document selecting alternative and mitigation measures",
      "required": true,
      "reference": "40 CFR 1505.2"
    },
    {
      "document": "Scoping Report",
      "description": "Summary of public scoping process and issues identified",
      "required": true,
      "reference": "40 CFR 1501.9"
    },
    {
      "document": "Alternatives Analysis",
      "description": "Detailed comparison of reasonable alternatives",
      "required": true,
      "reference": "40 CFR 1502.14"
    },
    {
      "document": "Public Comment Summary",
      "description": "Record of all comments received on Draft EIS",
      "required": true,
      "reference": "40 CFR 1503"
    }
  ],
  "specialist_reports": [
    {
      "discipline": "Wildlife Biology",
      "report_type": "Biological Assessment (Multi-species)",
      "required": true,
      "rationale": "Multiple federally listed species require comprehensive BA"
    },
    {
      "discipline": "Fisheries Biology",
      "report_type": "Aquatic Effects Analysis",
      "required": true,
      "rationale": "Bull Trout present - analyze impacts to aquatic habitat"
    },
    {
      "discipline": "Silviculture",
      "report_type": "Timber Cruise and Silvics Report",
      "required": true,
      "rationale": "Large-scale timber salvage requires detailed stand analysis"
    },
    {
      "discipline": "Soils",
      "report_type": "Soil Erosion and Compaction Analysis",
      "required": true,
      "rationale": "Post-fire soils assessment critical for large project"
    },
    {
      "discipline": "Hydrology",
      "report_type": "Cumulative Watershed Effects",
      "required": true,
      "rationale": "Large project requires cumulative effects analysis"
    },
    {
      "discipline": "Recreation",
      "report_type": "Wilderness Boundary Analysis",
      "required": true,
      "rationale": "Proximity to Waldo Lake Wilderness requires special analysis"
    }
  ],
  "consultation_requirements": [
    {
      "agency": "U.S. Fish and Wildlife Service",
      "consultation_type": "ESA Section 7 Formal Consultation",
      "trigger": "Northern Spotted Owl presence",
      "documents_needed": ["Biological Assessment", "Critical habitat analysis"]
    },
    {
      "agency": "NOAA Fisheries",
      "consultation_type": "ESA Section 7 Formal Consultation",
      "trigger": "Bull Trout presence",
      "documents_needed": ["Biological Assessment", "Aquatic effects analysis"]
    }
  ],
  "reasoning_chain": [
    "NEPA pathway: EIS",
    "Loading documentation requirements for Environmental Impact Statement",
    "EIS requires: NOI, Draft EIS, Final EIS, ROD, scoping, alternatives, comments",
    "Action type 'timber_salvage' (large-scale) - Multiple specialist reports required",
    "Multiple listed species - Wildlife and Fisheries BAs required + dual ESA consultations",
    "Wilderness proximity - Recreation specialist analysis required",
    "Template selected: Environmental Impact Statement (40 CFR 1502)"
  ],
  "confidence": 0.96,
  "data_sources": ["40 CFR 1502", "FSH 1909.15", "ESA Section 7"],
  "recommendations": [
    "Publish NOI in Federal Register to initiate EIS process",
    "Use EIS template from FSH 1909.15 Chapter 50 and 40 CFR 1502",
    "Conduct comprehensive scoping with minimum 45-day comment period",
    "Initiate ESA consultations with both USFWS and NOAA Fisheries early",
    "Develop robust alternatives analysis with minimum 4-5 alternatives",
    "Allow 18-24 months for full EIS process completion"
  ]
}
```

## References
- Forest Service Handbook 1909.15 - NEPA Handbook
- 40 CFR Parts 1500-1508 - CEQ NEPA Regulations
- 36 CFR Part 220 - Forest Service NEPA Procedures
- FSH 1909.15 Chapter 70 - Decision Memo Guidance
