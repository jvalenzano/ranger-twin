# Mission Control UI Component Specifications

**Related ADR:** [ADR-012: Mission Control UI Overhaul](../../adr/ADR-012-mission-control-ui-overhaul.md)  
**Status:** In Development  
**Created:** 2025-12-30  
**Mockup:** [High-Fidelity UI Mockup](../../designs/mockups/ranger-cc-ui-mockup.png)  

---

## Purpose

This directory contains detailed specifications for each UI component in the Mission Control interface redesign. These specs serve as:

1. **Source of Truth** — The contract between design intent and implementation
2. **Pre-Flight Validation** — AI coding agents must read specs before writing code
3. **Test Anchors** — Success criteria for unit and visual regression tests
4. **Parallel Work Enablement** — Self-contained specs allow concurrent development

---

## Component Index

| Component | Spec Status | Implementation | Priority |
|-----------|-------------|----------------|----------|
| [BriefingStrip](./BriefingStrip.spec.md) | ✅ Complete | 🔲 Pending | Week 1 |
| [PhaseFilterChips](./PhaseFilterChips.spec.md) | ✅ Complete | 🔲 Pending | Week 1 |
| [FieldModeToggle](./FieldModeToggle.spec.v2.md) | ✅ Complete (v2) | 🔲 Pending | Week 2 |
| [LayersPanel](./LayersPanel.spec.v2.md) | ✅ Complete (v2) | 🔲 Pending | Week 4 |
| [LayerToggle](./LayerToggle.spec.v2.md) | ✅ Complete (v2) | 🔲 Pending | Week 4 |
| [JurisdictionTooltip](./JurisdictionTooltip.spec.v2.md) | ✅ Complete (v2) | 🔲 Pending | Week 4 |

> **Note:** v2 specs were created from expert UX consultation review (2025-12-30). See [EXPERT-CONSULTATION-UX.md](./EXPERT-CONSULTATION-UX.md) for full critique.

### Implementation Guides

| Week | Guide | Status |
|------|-------|--------|
| 1 | [Week 1 Implementation Summary](./WEEK-1-IMPLEMENTATION.md) | ✅ Ready |

---

## Implementation Schedule

Based on expert-recommended sequencing from ADR-012:

```
Week 1: BriefingStrip + PhaseFilterChips
        └── UI wins with no data dependencies
        
Week 2: FieldModeToggle + responsive breakpoints
        └── Test on iPad, field device simulation
        
Week 3: PMTiles pipeline + basic USFS layer
        └── PAD-US validation against Deschutes/Rogue River-Siskiyou
        
Week 4: LayersPanel + LayerToggle + JurisdictionTooltip
        └── Full hover integration
        
Week 5: IncidentCard jurisdiction row + polish
        └── End-to-end testing
```

---

## Spec Template Structure

Each component spec follows this structure:

```markdown
# ComponentName Specification

## Overview
Brief description and user story

## Props Interface
TypeScript interface with JSDoc comments

## State Contract
- What it reads from stores
- What it writes to stores
- Local state requirements

## Visual States
- Default
- Hover
- Active/Selected
- Disabled
- Field Mode variant

## Behavior
- User interactions
- Animations/transitions
- Edge cases

## Accessibility
- Touch targets (48px minimum for field mode)
- Keyboard navigation
- Screen reader support
- Color contrast requirements

## Dependencies
- Hooks
- Stores
- Services
- Child components

## Test Scenarios
- Unit tests
- Integration tests
- Visual regression tests

## Implementation Notes
- Performance considerations
- Known constraints
- Future enhancements
```

---

## Conventions

### Naming
- Component files: `PascalCase.tsx`
- Spec files: `PascalCase.spec.md`
- Hook files: `useCamelCase.ts`

### State Management
- Global UI state → `missionStore.ts`
- Server state → React Query hooks
- Local ephemeral state → `useState`

### Styling
- Tailwind CSS utility classes
- Field mode overrides in `field-mode.css`
- Glass panel base styles in component library

### Testing
- Unit: Vitest + React Testing Library
- Visual: Chromatic (future)
- E2E: Playwright (future)

---

## Related Documentation

- [ADR-012: Mission Control UI Overhaul](../../adr/ADR-012-mission-control-ui-overhaul.md)
- [PRODUCT-SUMMARY-COMPACT.md](../../PRODUCT-SUMMARY-COMPACT.md) — The "8-minute reality"
- [ADR-005: Skills-First Architecture](../../adr/ADR-005-skills-first-architecture.md)
