# RANGER Documentation Cleanup Guide

**Purpose:** Eliminate documentation debt and align all docs with the "Nerve Center" vision established in DATA-SIMULATION-STRATEGY.md.

---

## The Problem

Over several days of ideation, we accumulated documentation that reflects two competing visions:

- **Vision A (Correct):** RANGER is a nerve center that orchestrates agents using simulated data
- **Vision B (Legacy):** RANGER builds CV models, field capture apps, and satellite pipelines

This guide provides prompts to systematically clean up each document.

---

## Cleanup Principles

1. **Remove timelines** — No "6-week sprint" or "Week 1-6" schedules. This is a proof of concept.
2. **Remove tech stack details** — Focus on what, not how. ADRs can stay but shouldn't dominate.
3. **Clarify simulation vs. future** — Every capability should be tagged as Phase 1 (simulated) or Future.
4. **Remove CV/ML pipeline details** — We're not building YOLOv8 damage detection or Whisper transcription.
5. **Emphasize orchestration** — The value is cross-agent coordination, not individual agent capabilities.

---

## Document-by-Document Prompts

### Priority 1: Core Strategy Documents

#### `docs/PROJECT-BRIEF.md`
**Issue:** Contains detailed 6-week sprint plan, tech stack tables, and CV pipeline descriptions.

**Prompt:**
```
Read docs/PROJECT-BRIEF.md and docs/DATA-SIMULATION-STRATEGY.md.

Update PROJECT-BRIEF.md to:
1. Remove Section 6 (Six-Week Sprint Plan) entirely
2. Remove detailed tech stack tables in Section 4 (keep a brief "we use open source" statement)
3. Update agent descriptions (Section 3) to distinguish Phase 1 simulation from future vision
4. Remove references to building CV models, Whisper pipelines, or satellite processing
5. Add a prominent reference to DATA-SIMULATION-STRATEGY.md in Section 1
6. Keep the vision statement, brand architecture, and agent roles intact

The document should focus on WHAT we're building and WHY, not detailed HOW or WHEN.
```

#### `docs/STRATEGIC-REFRAME.md`
**Issue:** Good strategic content but includes "Next Session Execution Plan" with specific tasks.

**Prompt:**
```
Read docs/STRATEGIC-REFRAME.md and docs/DATA-SIMULATION-STRATEGY.md.

Update STRATEGIC-REFRAME.md to:
1. Remove the "Next Session Execution Plan" section (lines 305-364)
2. Remove the "Warm Handoff Prompt" section
3. Remove "Commits Made This Session" and "Files Modified" sections
4. Keep the strategic insights about "one console, multiple views"
5. Update the "What We Actually Need to Build vs. Integrate" table to reference simulation strategy
6. This should be a clean strategic document, not a session log
```

#### `docs/SPRINT-FOCUS.md`
**Issue:** Still emphasizes "Field Capture" as P1, which contradicts nerve center positioning.

**Prompt:**
```
Read docs/SPRINT-FOCUS.md and docs/DATA-SIMULATION-STRATEGY.md.

Rewrite SPRINT-FOCUS.md to reflect the simulation strategy:
1. P0 should be Recovery Coordinator + Command Console (unchanged)
2. P1 should be "Agent Orchestration Demo" - the cross-agent cascade with simulated data
3. P2 should be "Reasoning Transparency UX" - proof layer, citations, reasoning chains
4. Remove references to "Field Capture Innovation" as our moat
5. The moat is ORCHESTRATION, not perception

Keep it brief - this should be <50 lines.
```

---

### Priority 2: Agent Specifications

#### `docs/agents/BURN-ANALYST-SPEC.md`
**Issue:** Describes satellite imagery pipelines, dNBR calculations, and imagery sourcing as if we're building them.

**Prompt:**
```
Read docs/agents/BURN-ANALYST-SPEC.md and docs/DATA-SIMULATION-STRATEGY.md.

Update BURN-ANALYST-SPEC.md to:
1. Add a "Phase 1 Scope" section at the top clearly stating this agent receives SIMULATED burn severity data
2. Move all satellite/dNBR/GEE content to a "Future Vision" section at the bottom
3. Remove the "6-Week Development Plan" table
4. Remove "Risk Register" and "Activation Decision Framework" (this isn't a backup anymore)
5. Keep the AgentBriefingEvent Strategy section - that's the real value
6. Focus on what the agent DOES with data, not how data is acquired
```

#### `docs/agents/TRAIL-ASSESSOR-SPEC.md`
**Issue:** Likely describes video processing, YOLOv8, and mobile field capture.

**Prompt:**
```
Read docs/agents/TRAIL-ASSESSOR-SPEC.md and docs/DATA-SIMULATION-STRATEGY.md.

Update TRAIL-ASSESSOR-SPEC.md to:
1. Add a "Phase 1 Scope" section stating this agent receives SIMULATED damage inventory JSON
2. Move all CV/video processing content to a "Future Vision" section
3. Remove any development timelines or sprint plans
4. Keep the focus on: receiving damage data → generating TRACS work orders → reasoning chains
5. The agent's value is SYNTHESIS and LEGACY EXPORT, not damage detection
```

#### `docs/agents/TIMBER-CRUISER-SPEC.md`
**Issue:** Likely describes Whisper transcription, species ID models, and mobile capture.

**Prompt:**
```
Read docs/agents/TIMBER-CRUISER-SPEC.md and docs/DATA-SIMULATION-STRATEGY.md.

Update TIMBER-CRUISER-SPEC.md to:
1. Add a "Phase 1 Scope" section stating this agent receives SIMULATED plot data JSON
2. Move all Whisper/species ID/mobile app content to a "Future Vision" section
3. Remove any development timelines
4. Keep the focus on: receiving plot data → generating FSVeg XML → salvage prioritization
5. The agent's value is FSVeg COMPATIBILITY and REASONING, not field transcription
```

#### `docs/agents/COMPLIANCE-ADVISOR-SPEC.md`
**Issue:** May describe complex RAG pipelines; needs Phase 1 scoping.

**Prompt:**
```
Read docs/agents/COMPLIANCE-ADVISOR-SPEC.md and docs/DATA-SIMULATION-STRATEGY.md.

Update COMPLIANCE-ADVISOR-SPEC.md to:
1. Add a "Phase 1 Scope" section - RAG over a LIMITED FSM/FSH corpus is acceptable for Phase 1
2. Clarify that the corpus may be incomplete and that's okay
3. Remove any complex PALS integration plans
4. Focus on: receiving project context → retrieving relevant regulations → generating citations
5. Keep AgentBriefingEvent patterns
```

#### `docs/agents/RECOVERY-COORDINATOR-SPEC.md`
**Issue:** This one is probably correct since it's about orchestration. Review for timeline references.

**Prompt:**
```
Read docs/agents/RECOVERY-COORDINATOR-SPEC.md and docs/DATA-SIMULATION-STRATEGY.md.

Update RECOVERY-COORDINATOR-SPEC.md to:
1. Remove any sprint timelines or development schedules
2. Ensure it references the simulation strategy
3. This is the CORE of Phase 1 - emphasize that this is where the real work happens
4. Keep all ADK patterns, routing logic, and AgentBriefingEvent content
```

---

### Priority 3: Architecture Documents

#### `docs/architecture/AGENT-MESSAGING-PROTOCOL.md`
**Status:** Likely correct. This is the technical keystone.

**Prompt:**
```
Read docs/architecture/AGENT-MESSAGING-PROTOCOL.md.

Verify this document:
1. Does not contain timelines or sprint references
2. Focuses on the AgentBriefingEvent contract
3. Is consistent with DATA-SIMULATION-STRATEGY.md

If clean, no changes needed.
```

#### `docs/architecture/UX-VISION.md`
**Issue:** May contain prototyping roadmaps or timeline references.

**Prompt:**
```
Read docs/architecture/UX-VISION.md.

Update to:
1. Remove any "Prototyping Roadmap" with timelines
2. Keep the design vision, mockup references, and component descriptions
3. Focus on the WHAT of the UI, not WHEN it gets built
```

#### `docs/architecture/GCP-ARCHITECTURE.md`
**Issue:** Detailed infrastructure that's not relevant to proof of concept.

**Prompt:**
```
Read docs/architecture/GCP-ARCHITECTURE.md.

Either:
A) Archive this to docs/archive/ - it's future infrastructure planning
B) Add a clear header: "This document describes FUTURE production architecture, not Phase 1 scope"

Phase 1 runs locally with Docker and doesn't need GCP details.
```

#### `docs/architecture/OPEN-SOURCE-INVENTORY.md`
**Issue:** Detailed tool inventory that may distract from mission focus.

**Prompt:**
```
Read docs/architecture/OPEN-SOURCE-INVENTORY.md.

Either:
A) Archive to docs/archive/
B) Trim to only tools we're ACTUALLY using in Phase 1 (React, MapLibre, FastAPI, Redis)

Remove detailed evaluations of tools we're not using yet.
```

---

### Priority 4: Research & Assets (Consider Archiving)

These documents were useful during ideation but may not help new team members:

#### Candidates for `docs/archive/`
```
docs/research/DATA-RESOURCES.md - Detailed data source research
docs/research/DATA-STRATEGY.md - Superseded by DATA-SIMULATION-STRATEGY.md
docs/research/MARKET-RESEARCH.md - Competitive analysis, not needed for dev
docs/assets/AI-STUDIO-*.md - Prototyping artifacts
docs/assets/MOCKUP-*.md - Session logs
docs/assets/VIBE-CODING-GUIDE.md - Process artifact
docs/assets/DESIGN-SPEC-HANDOFF.md - Process artifact
docs/NEXT-SESSION.md - Session planning, stale
```

**Prompt:**
```
Create docs/archive/ directory and move the following files there:
- docs/research/DATA-RESOURCES.md
- docs/research/DATA-STRATEGY.md
- docs/research/MARKET-RESEARCH.md
- docs/assets/AI-STUDIO-PROMPT.md
- docs/assets/AI-STUDIO-BUILD-PROMPT.md
- docs/assets/AI-STUDIO-SYSTEM-INSTRUCTIONS.md
- docs/assets/GOOGLE-AI-STUDIO-WORKFLOW.md
- docs/assets/MOCKUP-GENERATION.md
- docs/assets/MOCKUP-SESSION-LOG.md
- docs/assets/VIBE-CODING-GUIDE.md
- docs/assets/DESIGN-SPEC-HANDOFF.md
- docs/NEXT-SESSION.md

These are ideation artifacts. Keep them for reference but remove from active docs.
```

---

### Priority 5: Keep As-Is

These documents are correctly scoped:

- `docs/assets/USER-JOURNEYS-AND-PERSONAS.md` - Valuable context
- `docs/architecture/BRIEFING-UX-SPEC.md` - Technical UX patterns
- `docs/architecture/LEGACY-INTEGRATION-SCHEMAS.md` - Export formats
- `docs/brand/BRAND-ARCHITECTURE.md` - Naming conventions
- `docs/adr/ADR-002-brand-naming-strategy.md` - Decision record

---

## Post-Cleanup Validation

After running the prompts, the docs folder should contain:

```
docs/
├── PROJECT-BRIEF.md              # Vision and agent roles (no timelines)
├── STRATEGIC-REFRAME.md          # "One console, four views" positioning
├── DATA-SIMULATION-STRATEGY.md   # Authoritative simulation scope
├── SPRINT-FOCUS.md               # Priorities (orchestration-focused)
├── README.md                     # Navigation
├── agents/
│   ├── README.md
│   ├── RECOVERY-COORDINATOR-SPEC.md
│   ├── BURN-ANALYST-SPEC.md
│   ├── TRAIL-ASSESSOR-SPEC.md
│   ├── TIMBER-CRUISER-SPEC.md
│   └── COMPLIANCE-ADVISOR-SPEC.md
├── architecture/
│   ├── AGENT-MESSAGING-PROTOCOL.md
│   ├── BRIEFING-UX-SPEC.md
│   ├── LEGACY-INTEGRATION-SCHEMAS.md
│   └── UX-VISION.md
├── assets/
│   ├── USER-JOURNEYS-AND-PERSONAS.md
│   └── mockup-iterations/
├── brand/
│   ├── BRAND-ARCHITECTURE.md
│   └── STAKEHOLDER-MESSAGING.md
├── adr/
│   ├── ADR-001-tech-stack.md
│   └── ADR-002-brand-naming-strategy.md
├── audit/
│   ├── AUDIT-PROMPT.md
│   └── DOCUMENTATION-CLEANUP.md
└── archive/
    └── (ideation artifacts)
```

---

## Final Checklist

After cleanup, a new team member reading the docs should understand:

- [ ] RANGER is a nerve center that orchestrates AI agents
- [ ] Phase 1 uses simulated data to prove orchestration value
- [ ] The innovation is cross-agent coordination and reasoning transparency
- [ ] Field capture and CV are future capabilities, not Phase 1
- [ ] There are no timelines - this is a proof of concept
- [ ] The demo shows the Cedar Creek cascade with fake data and real reasoning
