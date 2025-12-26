# Compliance Timeline

## Description
Estimates compliance timelines for NEPA pathways including comment periods, consultation durations, and process milestones. Provides realistic timeline projections based on regulatory requirements and typical agency processing times for Categorical Exclusions, Environmental Assessments, and Environmental Impact Statements.

## Triggers
When should the agent invoke this skill?
- User asks about timeline or schedule
- Query mentions "how long", "when", or "deadline"
- Request for process duration estimates
- Questions about comment periods
- Milestone planning or scheduling requests
- Consultation timeline questions

## Instructions
Step-by-step reasoning for the agent:
1. **Identify Pathway**: Determine NEPA pathway (CE/EA/EIS)
2. **Calculate Comment Periods**: Add regulatory comment periods
   - EA: 30-day public comment minimum
   - EIS: 45-day scoping, 45-day Draft EIS comment, 30-day wait after Final EIS
3. **Estimate Consultations**: Add consultation durations
   - ESA Section 7 Informal: 30-60 days
   - ESA Section 7 Formal: 90-135 days (+ 60 days for BiOp)
   - NHPA Section 106: 30-180 days depending on complexity
4. **Build Milestone Schedule**: Create timeline with key dates
   - Start from project initiation or user-provided date
   - Add sequential milestones with dependencies
   - Include preparation time, review time, decision time
5. **Apply Pathway Benchmarks**: Use typical durations
   - CE: 2-4 weeks
   - EA: 6-12 months
   - EIS: 18-24 months

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier |
| pathway | string | Yes | NEPA pathway (CE, EA, EIS) |
| consultations | array | No | Required consultations (ESA, NHPA, etc.) |
| start_date | string | No | Project start date (ISO format, defaults to today) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The fire identifier |
| pathway | string | NEPA pathway |
| total_duration_days | number | Total estimated days |
| total_duration_months | number | Total estimated months |
| comment_periods | array | Required comment periods with durations |
| consultation_timelines | array | Consultation estimates |
| milestones | array | Key milestone dates and descriptions |
| critical_path | array | Critical path items that drive schedule |
| reasoning_chain | array | Step-by-step timeline calculation |
| confidence | number | Timeline accuracy confidence (0-1) |
| data_sources | array | Regulatory sources |
| recommendations | array | Timeline management suggestions |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the NEPA pathway and load baseline timeline
2. Then, calculate mandatory comment periods for the pathway
3. Next, estimate consultation durations based on project requirements
4. Then, build sequential milestone schedule accounting for dependencies
5. Finally, calculate total duration and identify critical path

## Resources
- `resources/timelines.json` - Base durations and milestones by pathway
- `resources/consultation-requirements.json` - ESA Section 7, NHPA Section 106 details

## Scripts
- `scripts/estimate_timeline.py` - Python implementation
  - Functions:
    - `calculate_comment_periods(pathway: str) -> list`
    - `estimate_consultation_duration(consultation_type: str) -> dict`
    - `build_milestone_schedule(pathway: str, consultations: list, start_date: str) -> list`
    - `execute(inputs: dict) -> dict`

## Examples

### Example 1: CE Timeline
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "CE",
  "consultations": [],
  "start_date": "2024-01-15"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "CE",
  "total_duration_days": 21,
  "total_duration_months": 0.7,
  "comment_periods": [],
  "consultation_timelines": [],
  "milestones": [
    {
      "milestone": "Project Initiation",
      "date": "2024-01-15",
      "duration_days": 0,
      "description": "Begin CE documentation"
    },
    {
      "milestone": "EC Screening Complete",
      "date": "2024-01-18",
      "duration_days": 3,
      "description": "Complete extraordinary circumstances screening"
    },
    {
      "milestone": "Specialist Input Received",
      "date": "2024-01-25",
      "duration_days": 7,
      "description": "Gather specialist reports and technical input"
    },
    {
      "milestone": "Decision Memo Draft",
      "date": "2024-01-29",
      "duration_days": 4,
      "description": "Draft Decision Memo"
    },
    {
      "milestone": "Decision Memo Signed",
      "date": "2024-02-05",
      "duration_days": 7,
      "description": "Review and sign Decision Memo"
    }
  ],
  "critical_path": [
    "Specialist input availability",
    "Decision Memo review and signature"
  ],
  "reasoning_chain": [
    "NEPA pathway: CE",
    "Base CE duration: 2-4 weeks (using 3 weeks estimate)",
    "No public comment period required for CE",
    "No consultations required",
    "Milestone 1: Project Initiation (Day 0)",
    "Milestone 2: EC Screening (Day 3)",
    "Milestone 3: Specialist Input (Day 10)",
    "Milestone 4: Decision Memo Draft (Day 14)",
    "Milestone 5: Decision Memo Signed (Day 21)",
    "Total duration: 21 days (0.7 months)"
  ],
  "confidence": 0.85,
  "data_sources": ["FSH 1909.15", "36 CFR 220.6"],
  "recommendations": [
    "Expedite specialist input to maintain 3-week timeline",
    "Pre-coordinate with decision maker for quick signature",
    "Complete EC screening early to avoid delays"
  ]
}
```

### Example 2: EA Timeline with ESA Consultation
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EA",
  "consultations": [
    {
      "type": "ESA Section 7 Formal",
      "agency": "USFWS"
    }
  ],
  "start_date": "2024-01-15"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EA",
  "total_duration_days": 270,
  "total_duration_months": 9,
  "comment_periods": [
    {
      "period": "Public Scoping",
      "duration_days": 30,
      "required": true,
      "regulation": "40 CFR 1501.9"
    },
    {
      "period": "EA Public Comment",
      "duration_days": 30,
      "required": true,
      "regulation": "FSH 1909.15"
    }
  ],
  "consultation_timelines": [
    {
      "consultation_type": "ESA Section 7 Formal",
      "agency": "USFWS",
      "duration_days": 135,
      "phases": [
        {"phase": "Biological Assessment preparation", "days": 60},
        {"phase": "Formal consultation", "days": 90},
        {"phase": "Biological Opinion issuance", "days": 45}
      ]
    }
  ],
  "milestones": [
    {
      "milestone": "Project Initiation",
      "date": "2024-01-15",
      "duration_days": 0
    },
    {
      "milestone": "Public Scoping Notice",
      "date": "2024-01-22",
      "duration_days": 7
    },
    {
      "milestone": "Scoping Period Ends",
      "date": "2024-02-21",
      "duration_days": 30
    },
    {
      "milestone": "Biological Assessment Complete",
      "date": "2024-04-21",
      "duration_days": 60
    },
    {
      "milestone": "Initiate Formal Consultation",
      "date": "2024-04-22",
      "duration_days": 1
    },
    {
      "milestone": "Draft EA Complete",
      "date": "2024-06-20",
      "duration_days": 60
    },
    {
      "milestone": "Biological Opinion Received",
      "date": "2024-08-04",
      "duration_days": 135
    },
    {
      "milestone": "EA Public Comment Period Ends",
      "date": "2024-07-20",
      "duration_days": 30
    },
    {
      "milestone": "Final EA Complete",
      "date": "2024-08-19",
      "duration_days": 15
    },
    {
      "milestone": "FONSI Signed",
      "date": "2024-10-11",
      "duration_days": 14
    }
  ],
  "critical_path": [
    "ESA Section 7 formal consultation (135 days)",
    "Biological Assessment preparation (60 days)",
    "Public comment periods (60 days total)"
  ],
  "reasoning_chain": [
    "NEPA pathway: EA",
    "Base EA duration: 6-12 months (using 9 months with consultation)",
    "Public scoping period: 30 days required",
    "EA public comment period: 30 days required",
    "ESA Section 7 Formal consultation: 135 days (60 BA + 90 consultation + 45 BiOp)",
    "Consultation is on critical path - drives overall timeline",
    "Total duration: 270 days (9 months)"
  ],
  "confidence": 0.80,
  "data_sources": ["FSH 1909.15", "40 CFR 1501", "ESA Section 7"],
  "recommendations": [
    "Initiate Biological Assessment immediately - consultation is critical path",
    "Begin BA preparation during scoping to save time",
    "Coordinate early with USFWS to expedite formal consultation",
    "Consider requesting 60-day extension if BiOp is delayed"
  ]
}
```

### Example 3: EIS Timeline with Multiple Consultations
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EIS",
  "consultations": [
    {
      "type": "ESA Section 7 Formal",
      "agency": "USFWS"
    },
    {
      "type": "ESA Section 7 Formal",
      "agency": "NOAA"
    },
    {
      "type": "NHPA Section 106",
      "agency": "SHPO"
    }
  ],
  "start_date": "2024-01-15"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "pathway": "EIS",
  "total_duration_days": 730,
  "total_duration_months": 24,
  "comment_periods": [
    {
      "period": "Scoping Period",
      "duration_days": 45,
      "required": true,
      "regulation": "40 CFR 1501.9"
    },
    {
      "period": "Draft EIS Comment",
      "duration_days": 45,
      "required": true,
      "regulation": "40 CFR 1503"
    },
    {
      "period": "Final EIS Wait Period",
      "duration_days": 30,
      "required": true,
      "regulation": "40 CFR 1506.10"
    }
  ],
  "consultation_timelines": [
    {
      "consultation_type": "ESA Section 7 Formal",
      "agency": "USFWS",
      "duration_days": 195,
      "phases": [
        {"phase": "Biological Assessment", "days": 90},
        {"phase": "Formal consultation", "days": 90},
        {"phase": "Biological Opinion", "days": 60}
      ]
    },
    {
      "consultation_type": "ESA Section 7 Formal",
      "agency": "NOAA",
      "duration_days": 195,
      "phases": [
        {"phase": "Biological Assessment", "days": 90},
        {"phase": "Formal consultation", "days": 90},
        {"phase": "Biological Opinion", "days": 60}
      ]
    },
    {
      "consultation_type": "NHPA Section 106",
      "agency": "SHPO",
      "duration_days": 120,
      "phases": [
        {"phase": "Cultural survey", "days": 45},
        {"phase": "SHPO consultation", "days": 60},
        {"phase": "MOA or PA development", "days": 30}
      ]
    }
  ],
  "milestones": [
    {
      "milestone": "Notice of Intent Published",
      "date": "2024-01-15",
      "duration_days": 0
    },
    {
      "milestone": "Scoping Period Ends",
      "date": "2024-03-01",
      "duration_days": 45
    },
    {
      "milestone": "Biological Assessments Complete",
      "date": "2024-05-30",
      "duration_days": 90
    },
    {
      "milestone": "Cultural Survey Complete",
      "date": "2024-05-15",
      "duration_days": 45
    },
    {
      "milestone": "Draft EIS Complete",
      "date": "2024-09-27",
      "duration_days": 120
    },
    {
      "milestone": "Draft EIS Comment Period Ends",
      "date": "2024-11-11",
      "duration_days": 45
    },
    {
      "milestone": "Biological Opinions Received",
      "date": "2025-01-10",
      "duration_days": 195
    },
    {
      "milestone": "NHPA Consultation Complete",
      "date": "2024-09-13",
      "duration_days": 120
    },
    {
      "milestone": "Final EIS Published",
      "date": "2025-04-10",
      "duration_days": 90
    },
    {
      "milestone": "Wait Period Ends",
      "date": "2025-05-10",
      "duration_days": 30
    },
    {
      "milestone": "Record of Decision Signed",
      "date": "2026-01-15",
      "duration_days": 60
    }
  ],
  "critical_path": [
    "ESA Section 7 formal consultations (195 days each)",
    "Draft EIS preparation (120 days)",
    "Public comment periods (120 days total)",
    "Final EIS preparation (90 days)"
  ],
  "reasoning_chain": [
    "NEPA pathway: EIS",
    "Base EIS duration: 18-24 months (using 24 months with multiple consultations)",
    "Scoping period: 45 days required",
    "Draft EIS comment: 45 days required",
    "Final EIS wait: 30 days required",
    "Dual ESA consultations can run in parallel: 195 days each",
    "NHPA Section 106: 120 days",
    "Multiple consultations extend timeline to 24 months",
    "Total duration: 730 days (24 months)"
  ],
  "confidence": 0.75,
  "data_sources": ["40 CFR 1502", "FSH 1909.15", "ESA Section 7", "NHPA Section 106"],
  "recommendations": [
    "Initiate all consultations immediately after scoping",
    "Run ESA consultations in parallel to save time",
    "Allow 24+ months for full EIS process with multiple consultations",
    "Build in contingency time for consultation delays",
    "Coordinate early and often with all consulting agencies"
  ]
}
```

## References
- 40 CFR Parts 1500-1508 - CEQ NEPA Regulations (comment periods)
- Forest Service Handbook 1909.15 - NEPA timeline guidance
- ESA Section 7 Consultation Handbook - Consultation timelines
- NHPA Section 106 Regulations - 36 CFR Part 800
