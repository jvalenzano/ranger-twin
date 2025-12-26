# Skills Library Development

**Version:** 1.0
**Date:** December 25, 2025
**Status:** Planning (Phase 0)
**North Star:** [ADR-005](../adr/ADR-005-skills-first-architecture.md): Skills-First Architecture

---

## Objective

Develop a library of portable, versioned domain expertise packages ("Skills") that power the RANGER multi-agent system. This ensures domain logic is decoupled from agent orchestration and is reusable across different USDA agencies and applications.

---

## Core Taxonomy (ADR-005)

| Tier | Category | Description |
|------|----------|-------------|
| **Tier 1** | **Foundation Skills** | Cross-agency reusable logic (NEPA, GIS, Geospatial Analysis, Document Generation) |
| **Tier 2** | **Agency Skills** | USFS-specific shared logic (BAER Assessment, Fire Terminology, MTBS Classification) |
| **Tier 3** | **Application Skills** | Specialized logic for specific agents or workflows (Soil Burn Assessment, Trail Damage Triage) |

---

## Implementation Roadmap (13-Week Alignment)

### Phase 0: Specification & Scaffolding (Week 1)
- **Goal:** Establish the "Contract" for skills.
- **Deliverables:**
    - `docs/specs/skill-format.md`: Specification for `skill.md` and resource structure.
    - `skills/foundation/_template/`: A boilerplate skill folder.
    - `packages/skill-runtime/`: Utilities for loading and validating skills.

### Phase 1: Orchestration Skills (Weeks 2-3)
- **Coordinator Agent focus:**
    - **Delegation Skill:** Advanced routing logic using semantic similarity and rule-based overrides.
    - **Portfolio Triage Skill:** Cross-incident prioritization using the RANGER Triage Index.
    - **User Interaction Skill:** persona management, follow-up generation, and briefing formatting.

### Phase 2: Primary Specialist - Burn Analyst (Weeks 4-5)
- **Goal:** Prove domain depth with the first specialist.
- **Skills:**
    - **MTBS Classification:** Translating dNBR results into standard severity classes.
    - **Soil Burn Severity:** Assessing immediate post-fire soil health indicators.
    - **Boundary Mapping:** Fire perimeter delineation and quality control.

### Phase 3: Domain Specialist Roster (Weeks 6-9)
- **Trail Assessor:** Infrastructure damage classification (I-IV), Closure decision logic.
- **Cruising Assistant:** Multi-modal timber volume estimation, Salvage viability scoring.
- **NEPA Advisor:** regulatory compliance library (RAG over FSM/FSH), Pathway selection logic.

### Phase 4: Shared Services & MCP (Weeks 10-11)
- **Goal:** Drive efficiency through reuse and real data.
- **Actions:**
    - Extract common logic into `foundation/` (e.g., Geospatial Analysis).
    - Implement MCP Connectivity to replace fixture data with live feeds (NIFC, FIRMS).

---

## Skill Architecture Specification

Every skill package must reside in a dedicated folder:

```
skills/[tier]/[skill-name]/
├── skill.md          # Core instruction set for the LLM
├── config.yaml       # Metadata: version, author, dependencies, trigger keywords
├── tools/            # Python scripts for deterministic operations
│   └── analysis.py
├── resources/        # Static data: thresholds, templates, reference tables
│   └── thresholds.json
└── tests/            # Skill-level unit tests
    └── test_logic.py
```

### The `skill.md` Contract
The `skill.md` file is the "brain" of the skill. It must include:
1. **Role:** Specific persona the agent adopts when using this skill.
2. **Context:** What information the skill handles (inputs).
3. **Logic:** Step-by-step reasoning or rules to apply.
4. **Output Format:** Strict adherence to `AgentBriefingEvent` schema.

---

## Verification & Quality Controls

Aligned with the **USDA GenAI Roadmap**, every skill must pass a "GenAI Evaluation Lab" (Phase 4):
- **Accuracy:** >90% on domain-specific test sets.
- **Explainability:** Must provide a `reasoning_chain` in every response.
- **Safety:** Must adhere to USFS data privacy and security guidelines.

---

**Document Owner:** RANGER Development Team
**Last Updated:** December 25, 2025
**See Also:** [IMPLEMENTATION-ROADMAP.md](../IMPLEMENTATION-ROADMAP.md)
