# Documentation Refactor: Anti-Gravity Handoff

**Date:** December 25, 2025
**Purpose:** Methodically clean and align all RANGER documentation with Skills-First architecture
**Goal:** Dry, clean repo with single sources of truth

---

## Context

RANGER has undergone a strategic architectural shift. Two new documents now govern all development:

1. **ADR-005: Skills-First Multi-Agent Architecture** (`docs/adr/ADR-005-skills-first-architecture.md`)
   - Establishes Skills as portable domain expertise packages
   - Multi-Agent + Skills hybrid model
   - Three-tier skills taxonomy: Foundation → Agency → Application
   - USDA GenAI Strategy alignment language

2. **IMPLEMENTATION-ROADMAP.md** (`docs/IMPLEMENTATION-ROADMAP.md`)
   - Single north star for implementation
   - 13-week phased plan to MVP
   - Supersedes all previous sprint plans
   - Defines the four-layer stack: UI → Agent Pipeline → Skills Library → MCP Connectivity

**Your mission:** Align all documentation with these north stars. Archive obsolete content. Result: a focused, coherent documentation set.

---

## Priority Files to Update

### TIER 1: Critical Updates (Do First)

| File | Action | What to Change |
|------|--------|----------------|
| `docs/README.md` | UPDATE | Add ADR-005 to Architecture Decisions section; add IMPLEMENTATION-ROADMAP.md as north star; note that PROGRESS.md is archived |
| `docs/GLOSSARY.md` | UPDATE | Add Skills-First terms: "Skill", "Skill Package", "Skills Library", "Foundation Skills", "MCP Server", "Progressive Disclosure", "Agent Pipeline" |
| `docs/architecture/README.md` | UPDATE | Elevate ADR-005 as primary architecture decision; reorganize to show four-layer stack |
| `docs/implementation/PHASE2-AI-INTEGRATION.md` | REWRITE | Rename to "Skills Library Development" and align with IMPLEMENTATION-ROADMAP Phase 1-4 |

### TIER 2: Consolidation (Do Second)

| Files | Action | Result |
|-------|--------|--------|
| `docs/features/_MISSION-CONTROL.md` + `docs/planning/_!_DASHBOARD_REDESIGN.md` | MERGE | Single `docs/features/MISSION-CONTROL.md` with 4-phase model, triage explainability |
| `docs/features/FORENSIC-POPUP-TRIGGER.md` | DELETE | Superseded by SITE-ANALYSIS-ADDENDUM.md |
| `docs/features/INTEL-PROBE-UX-REVIEW-REQUEST.md` | DELETE | Dated review request, no ongoing value |

### TIER 3: Archive (Do Third)

Move these to `docs/archive/` with appropriate subdirectories:

| File | Archive To | Reason |
|------|------------|--------|
| `PROGRESS.md` (root) | `docs/archive/session-logs/` | Historical session journal; superseded by IMPLEMENTATION-ROADMAP |
| `docs/implementation/MILESTONE1-LIVING-MAP.md` | `docs/archive/milestones/` | Completed milestone |
| `docs/implementation/PHASE1-STATIC-DEMO.md` | `docs/archive/phase1/` | Phase 1 complete |
| `docs/architecture/MAP-SIMPLIFICATION-AUDIT.md` | `docs/archive/technical-audits/` | Historical technical deep-dive |
| `docs/features/UX-REVIEW-SUMMARY.md` | `docs/archive/ux-reviews/` | Historical meeting summary |
| `docs/brand/UX-PRODUCT-REVIEW.md` | `docs/archive/ux-reviews/` | Historical meeting notes |
| `docs/research/Strategic Architecture Review.md` | `docs/archive/research/` | Insights incorporated into ADR-005 |
| `docs/research/_!_Claude Agents and Skills.md` | `docs/archive/research/` | Research superseded by ADR-005 |
| `docs/audit/AUDIT-PROMPT.md` | `docs/archive/audits/` | Historical |
| `docs/audit/CLEANUP-REPORT.md` | `docs/archive/audits/` | Historical |
| `docs/audit/DOCUMENTATION-CLEANUP.md` | `docs/archive/audits/` | Superseded by this refactor |
| `docs/VALIDATION-TEST-PLAN.md` | `docs/archive/testing/` | Historical test spec |
| `docs/WORKFLOW-TEST-PLAN.md` | `docs/archive/testing/` | Historical test checklist |
| `docs/assets/SYSTEM-ARCHITECTURE-WIREFRAME.md` | `docs/archive/design-history/` | Historical wireframe descriptions |
| `docs/assets/mockup-iterations/` (entire folder) | `docs/archive/design-history/mockups/` | Historical design iterations |

### TIER 4: Minor Updates (Do Last)

| File | Action | What to Change |
|------|--------|----------------|
| `docs/architecture/FIELD-AI-STRATEGY.md` | UPDATE | Add note: "Phase 2+ vision. See ADR-005 for how Skills Library powers field agents." |
| `docs/architecture/GCP-DEPLOYMENT.md` | REVIEW | Verify Terraform patterns align with Cloud Run agent orchestration from IMPLEMENTATION-ROADMAP |
| `docs/architecture/OPEN-SOURCE-INVENTORY.md` | UPDATE | Add Google ADK, Skills runtime dependencies, testing frameworks |
| `docs/workshop/WORKSHOP-DEMO-ALIGNMENT.md` | UPDATE | Map workshop vision to Skills-First architecture layers |
| `docs/QA-VALIDATION-MANUAL.md` | UPDATE | Refresh for 4-phase model and current feature set |

---

## Files to DELETE (Not Archive)

| File | Reason |
|------|--------|
| `docs/features/FORENSIC-POPUP-TRIGGER.md` | Duplicate of SITE-ANALYSIS-ADDENDUM |
| `docs/features/INTEL-PROBE-UX-REVIEW-REQUEST.md` | Dated review request |
| `docs/archive/ai-studio-artifacts/` (entire folder) | Outdated design artifacts, no longer referenced |

---

## Archive Directory Structure

Create this structure in `docs/archive/`:

```
docs/archive/
├── README.md                    # Explain what's archived and why
├── session-logs/
│   └── PROGRESS-2025.md         # Renamed from root PROGRESS.md
├── milestones/
│   └── MILESTONE1-LIVING-MAP.md
├── phase1/
│   ├── PHASE1-STATIC-DEMO.md
│   ├── DATA-SIMULATION-STRATEGY.md  # Already here
│   ├── RANGER-DEMO-MANIFESTO.md     # Already here
│   └── SPRINT-FOCUS.md              # Already here
├── technical-audits/
│   └── MAP-SIMPLIFICATION-AUDIT.md
├── ux-reviews/
│   ├── UX-REVIEW-SUMMARY.md
│   └── UX-PRODUCT-REVIEW.md
├── research/
│   ├── Strategic-Architecture-Review.md
│   └── Claude-Agents-and-Skills.md
├── audits/
│   ├── AUDIT-PROMPT.md
│   ├── CLEANUP-REPORT.md
│   └── DOCUMENTATION-CLEANUP.md
├── testing/
│   ├── VALIDATION-TEST-PLAN.md
│   └── WORKFLOW-TEST-PLAN.md
└── design-history/
    ├── SYSTEM-ARCHITECTURE-WIREFRAME.md
    └── mockups/
        └── (all PNGs from mockup-iterations/)
```

---

## Key Terminology to Add to GLOSSARY.md

```markdown
## Skills-First Architecture (ADR-005)

| Term | Definition |
|------|------------|
| **Skill** | Organized folder containing domain expertise (skill.md + scripts + resources) |
| **Skill Package** | A complete, versioned skill ready for deployment |
| **Skills Library** | Collection of all skills, organized by tier |
| **Foundation Skills** | Cross-agency reusable skills (NEPA, geospatial, docs) |
| **Agency Skills** | Agency-specific shared skills (USFS fire terminology) |
| **Application Skills** | Single-application skills (BAER assessment) |
| **Progressive Disclosure** | Only skill metadata loaded until invoked |
| **Agent Pipeline** | Google ADK orchestration layer (Coordinator + Specialists) |
| **MCP Server** | Model Context Protocol server for data connectivity |
| **MCP Connectivity** | Data integration layer separate from expertise layer |
| **skill.md** | Core instruction file in every skill folder |
```

---

## USDA GenAI Alignment Language

When updating docs, use this terminology to align with USDA leadership:

| Our Term | USDA GenAI Roadmap Term |
|----------|------------------------|
| Skills Library | Enterprise Skills and Capabilities |
| Coordinator Agent | GenAI Operations Orchestration |
| Foundation Skills | Cross-Mission-Area Shared Services |
| Agent + Skills Testing | GenAI Evaluation Lab |
| skill.md Governance | Explainability and Transparency Controls |
| RANGER | Innovation Incubator Proof-of-Concept |

---

## Verification Checklist

After completing all updates, verify:

- [ ] `docs/README.md` references ADR-005 and IMPLEMENTATION-ROADMAP.md
- [ ] GLOSSARY.md has all Skills-First terms
- [ ] No `_!_` prefixes remain on active documents (rename or archive)
- [ ] `docs/archive/` has clear subdirectory organization
- [ ] `docs/archive/README.md` exists explaining archive purpose
- [ ] No duplicate feature specifications remain
- [ ] `docs/features/MISSION-CONTROL.md` is single consolidated doc
- [ ] All agent specs in `docs/agents/` still reference current architecture
- [ ] No broken internal links (grep for `.md` references)

---

## Files to NOT Touch

These are accurate and should remain unchanged:

- All files in `docs/adr/` (Architecture Decision Records)
- `docs/_!_PRODUCT-SUMMARY.md` (Single rallying document)
- `docs/PROJECT-BRIEF.md` (Foundational vision)
- `docs/STRATEGIC-REFRAME.md` (Conceptual foundation)
- `docs/INTEGRATION-ROADMAP.md` (Phase 2 API planning)
- `docs/onboarding/LOCAL-DEVELOPMENT-GUIDE.md` (Developer setup)
- All files in `docs/agents/` (Agent specifications)
- `docs/architecture/AGENTIC-ARCHITECTURE.md` (Technical reference)
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` (Active contract)
- `docs/architecture/BRIEFING-UX-SPEC.md` (UI rendering spec)
- `docs/architecture/FIXTURE-DATA-FORMATS.md` (Test data schema)
- `docs/brand/BRAND-ARCHITECTURE.md` (Naming conventions)
- `docs/brand/STAKEHOLDER-MESSAGING.md` (Communications)
- `docs/workshop/` folder (Strategic workshop outputs)

---

## Completion Criteria

The refactor is complete when:

1. **Single sources of truth** — ADR-005 and IMPLEMENTATION-ROADMAP.md are clearly the north stars
2. **No orphaned docs** — Every document either referenced from README.md or archived
3. **Clean archive** — Historical content organized, not deleted, with clear README
4. **Aligned terminology** — Glossary updated, docs use consistent Skills-First language
5. **No duplicates** — Feature specs consolidated
6. **Dry repo** — No `_!_` prefixes, no dated review requests, no obsolete artifacts

---

## Estimated Effort

| Tier | Task Count | Time Estimate |
|------|------------|---------------|
| Tier 1: Critical Updates | 4 files | 1-2 hours |
| Tier 2: Consolidation | 3 operations | 30 minutes |
| Tier 3: Archive | 17 files | 1 hour |
| Tier 4: Minor Updates | 5 files | 1 hour |
| Verification | Checklist | 30 minutes |
| **Total** | | **4-5 hours** |

---

**Document Owner:** RANGER Team
**Handoff Date:** December 25, 2025
**Expected Completion:** Before Phase 0 kickoff
