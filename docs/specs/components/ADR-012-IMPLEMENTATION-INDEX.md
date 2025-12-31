# ADR-012 Mission Control UI: Implementation Guide

**ADR:** [ADR-012-mission-control-ui.md](../../adr/ADR-012-mission-control-ui.md)  
**Branch:** `feature/adr-012-mission-control-ui`  
**Start Date:** 2025-12-30  
**Target Completion:** 2025-01-24 (4 weeks)

---

## Overview

This implementation guide breaks ADR-012 (Mission Control UI) into four weekly sprints. Each week builds on the previous, progressively adding functionality from static UI components to live ADK agent integration.

---

## Implementation Schedule

| Week | Focus | Status | Key Deliverables |
|------|-------|--------|------------------|
| [Week 1](./WEEK-1-IMPLEMENTATION.md) | Foundation | ✅ Complete | BriefingStrip, PhaseFilterChips, hooks |
| [Week 2](./WEEK-2-IMPLEMENTATION.md) | UI Structure | ✅ Complete | IncidentRail enhancement, AgentChat (mock) |
| [Week 3](./WEEK-3-IMPLEMENTATION.md) | ADK Integration | ✅ Complete | Live agent communication, SSE streaming |
| [Week 4](./WEEK-4-IMPLEMENTATION.md) | Polish | ✅ Complete | Proof Layer, Field Mode, accessibility |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BriefingStrip                          │ ← Week 1
│  [Hotspots: 24] [Fires: 2R] [Acres: 541K] [FIRMS: 2m ago]  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────┬───────────────────────┬───────────────────┐
│   IncidentRail  │     NationalMap       │    AgentChat      │
│   ────────────  │                       │    ──────────     │
│   PhaseFilters  │                       │    Messages       │ ← Week 2
│   ● Active (0)  │        [Map]          │    ProofLayer     │ ← Week 3-4
│   ● Rehab (2)   │                       │    Citations      │
│   ● Monitor (0) │                       │    ──────────     │
│   ● Closed (0)  │                       │    [Input field]  │
│   ────────────  │                       │                   │
│   Cedar Creek   │                       │                   │
│   Decker Fire   │                       │                   │
└─────────────────┴───────────────────────┴───────────────────┘
```

---

## Component Specs

Detailed specifications for each component:

- [BriefingStrip.spec.md](./BriefingStrip.spec.md)
- [PhaseFilterChips.spec.md](./PhaseFilterChips.spec.md)
- [AgentChat.spec.md](./AgentChat.spec.md) *(Week 2)*
- [ProofLayerPanel.spec.md](./ProofLayerPanel.spec.md) *(Week 4)*

---

## Design Assets

- [High-Fidelity Mockup](../../designs/mockups/ranger-cc-ui-mockup.png)
- [Field Mode Concept](../../designs/mockups/field-mode-concept.png)

---

## Key Technical Decisions

### State Management
- **Zustand** for global state (phase filters, active incident, chat messages)
- **React Query** deprecated in favor of Zustand for fire statistics
- Session state synced with ADK session

### Styling
- **CSS Variables** via `field-mode.css` for theming
- **Tailwind** for utility classes
- **Field Mode** toggle for high-contrast outdoor use

### Agent Integration
- **ADK API Server** at `/run_sse` for streaming responses
- **SSE** (Server-Sent Events) for real-time token streaming
- **Proof Layer** metadata extracted from agent events

---

## Testing Strategy

Each week includes a test checklist. Full integration testing after Week 4:

1. **Unit Tests**: Component rendering, hook behavior
2. **Integration Tests**: ADK communication, state sync
3. **E2E Tests**: Full user flows (Playwright)
4. **Accessibility**: axe-core, keyboard navigation
5. **Responsive**: Mobile, tablet, desktop viewports

---

## Git Workflow

```bash
# Week 1-4 work happens on feature branch
git checkout feature/adr-012-mission-control-ui

# Weekly commits follow conventional format
git commit -m "feat(mission): add BriefingStrip with portfolio metrics"
git commit -m "feat(mission): add AgentChat with ADK integration"

# After Week 4, squash merge to main
git checkout main
git merge --squash feature/adr-012-mission-control-ui
git commit -m "feat: implement Mission Control UI (ADR-012)"
git tag -a v0.2.0 -m "ADR-012 Mission Control UI"
```

---

## Dependencies

### NPM Packages (if needed)
```json
{
  "dependencies": {
    "zustand": "^4.x",
    "date-fns": "^3.x"
  }
}
```

### Backend Requirements
- ADK API Server running on port 8000
- Recovery Coordinator agent deployed
- FIRMS/NIFC data services accessible

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ADK API changes | Pin ADK version, mock service for testing |
| SSE browser support | Fallback to polling for older browsers |
| Large reasoning chains | Virtualized list, pagination |
| Mobile performance | Lazy load ProofLayer, reduce animations |

---

## Success Metrics

After merge to main:
- [ ] All 4 weeks complete with passing tests
- [ ] Lighthouse performance score ≥80
- [ ] Lighthouse accessibility score ≥90
- [ ] Demo to stakeholders successful
- [ ] No critical bugs in first week of use

---

## Contact

**Implementation Lead:** Claude Code  
**Architecture Review:** CTO (Jason)  
**Design Review:** TBD
