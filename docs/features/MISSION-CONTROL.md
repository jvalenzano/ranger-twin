# Mission Control: Portfolio Triage Console

> [!IMPORTANT]
> **Standard:** This document is aligned with **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)**. Triage logic and explainability are orchestrated via the Skills Library.

**Status:** Implementation Ready
**Architecture Alignment:** ADR-005 (Skills-First)
**Primary North Star:** [IMPLEMENTATION-ROADMAP.md](../IMPLEMENTATION-ROADMAP.md)

---

## Executive Summary

Mission Control is the primary entry point for the RANGER platform. It transforms from a simple map viewer into a **decision-support tool for high-stress triage**, allowing users to manage a portfolio of 30-50 active fire incidents across multiple regions.

---

## The 4-Phase Operational Model

To align with USFS practitioner workflows, RANGER uses a 4-phase incident lifecycle:

| Phase | Code | Goal | Triage Multiplier |
|-------|------|------|-------------------|
| **Active** | ACT | Fire suppression and immediate life/safety | 2.0x |
| **BAER Assessment** | ASM | 7-day emergency stabilization assessment | 1.75x |
| **BAER Implementation** | IMP | Emergency stabilization treatments | 1.25x |
| **In Restoration** | RST | Long-term ecological recovery and monitoring | 1.0x |

---

## Triage Intelligence & Explainability

The **RANGER Triage Index** provides a weighted score to help practitioners prioritize their attention.

### Formula Breakdown
`Score = SeverityWeight × AcresNormalized × PhaseMultiplier`
- **SeverityWeight:** 1 (Low) to 4 (Critical)
- **AcresNormalized:** Capped at 500k acres (normalized to 50 index points)
- **PhaseMultiplier:** See above (ACT 2.0 to RST 1.0)

### UI Proof Layers
1. **Mini Breakdown Bar:** A stacked sparkline on every card showing the relative contribution of Severity, Size, and Phase.
2. **Delta Indicators:** ↑/↓ arrows showing score changes in the last 24h.
3. **Percentile Ranking:** "Top 5% of Portfolio" tooltip for high-priority incidents.
4. **Explainable Tooltip:** Hovering over any score shows a detailed factor breakdown.

---

## Key UI Components

### 1. Incident Rail (Left)
- **Portfolio Summary:** Count of fires by severity and phase.
- **Top Escalations Widget:** Surface top 5 incidents with the highest 24h score increase.
- **Smart Filter Feedback:** "Showing 12 of 47 fires" with active filter chips.
- **Vertical Scroll:** Smooth list of Incident Cards ranked by Triage Score.

### 2. Incident Card
- **Hierarchical First:** Leads with Triage Score + Delta + Mini Breakdown.
- **Compact Stats:** Acres, Containment, Region, and State.
- **Action:** Primary "[Enter →]" button for single-incident deep dive.

### 3. National Map (Right)
- **Smart Markers:** Circles colored by phase, sized by acreage.
- **Phase Glyphs:** Zoom > 7 shows phase icon (🔥, ⊕, 🌱) inside the marker.
- **Bidirectional Sync:** Hovering a card highlights the map marker; clicking a marker scrolls the list to the card.

---

## Feature Roadmap

### Milestone 1: Triage Foundations (CURRENT)
- [x] 4-phase model implementation
- [x] Triage score calculation
- [x] Incident card hierarchy redesign
- [x] Filter feedback system

### Milestone 2: Advanced Explainability
- [ ] Top Escalations widget
- [ ] 24h Delta tracking
- [ ] Percentile ranking
- [ ] Smart glyph map markers

---

**See Also:**
- [UX-VISION.md](../architecture/UX-VISION.md)
- [BRIEFING-UX-SPEC.md](../architecture/BRIEFING-UX-SPEC.md)
