# RANGER Documentation Audit & Alignment Plan

**Status:** IN PROGRESS
**Standard:** ADR-005 (Skills-First / Google ADK)
**Objective:** Align all repository documentation with the Skills-First architecture, archiving legacy content and amending transitional documents to prevent "architectural drift."

---

## 📋 Audit Protocol (The "Pro" Standard)

For every folder and file audited, follow this workflow:

1.  **Analyze**: Search for legacy references (FastAPI-orchestrated agents, LangChain, old agency names).
2.  **Categorize**:
    *   `[ACTIVE]`: fully aligned with ADR-005.
    *   `[AMENDED]`: historically valuable but needs an alert box at the top.
    *   `[ARCHIVE]`: no longer relevant; move to `docs/archive/`.
3.  **Action**: 
    *   Move files to `/docs/archive/` if needed.
    *   Add `[!IMPORTANT]`/`[!WARNING]` alert boxes to amended files.
    *   Update technical references to point to `agents/`, `skills/`, and `mcp/`.

---

## 🗺️ Audit Roadmap

### Stage 1: The Strategic Core (High-Level)
*Focus: Root `docs/` files*
- [ ] `docs/_!_PRODUCT-SUMMARY.md`
- [ ] `docs/PROJECT-BRIEF.md`
- [ ] `docs/STRATEGIC-REFRAME.md`
- [ ] `docs/README.md`
- [ ] `docs/GLOSSARY.md`

### Stage 2: System Architecture (The Piping)
*Focus: `docs/architecture/`*
- [ ] `AGENT-MESSAGING-PROTOCOL.md` (Update for ADK events)
- [ ] `GCP-ARCHITECTURE.md` (Label as Infra-only)
- [ ] Audit and move legacy diagrams to `docs/archive/design-history/`

### Stage 3: Feature Specifications (The "What")
*Focus: `docs/features/` & `docs/specs/`*
- [ ] Ensure all feature specs refer to **Skills** instead of **FastAPI services**.
- [ ] Prioritize specs for: Map Legend, IR View, Site Analysis.

### Stage 4: Onboarding & Research (The "How")
*Focus: `docs/onboarding/`, `docs/research/`, `docs/workshop/`*
- [ ] Update onboarding to be "Skill-First".
- [ ] Prune research folder to remove obsolete tech evaluations.

---

## 📈 Audit Progress Log

| Date | Stage | Action Taken | Result |
|------|-------|--------------|--------|
| Dec 25 | ADR Cleanup | Audited `docs/adr/`. Archived ADR-003. Amended ADR-001. | ADRs now point to ADR-005 as source of truth. |
| Dec 25 | Planning | Created this Audit Plan. | Framework established. |

---

## 🔗 Reference Links
- [ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)
- [Implementation Roadmap](../_!_IMPLEMENTATION-ROADMAP.md)
- [Strategic Intelligence Report](../research/STRATEGIC-INTELLIGENCE-REPORT.md)
