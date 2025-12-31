# Week 4 Implementation: Proof Layer Expansion & Polish

**Status:** ✅ COMPLETE
**Branch:** `feature/adr-012-mission-control-ui`
**Prerequisite:** Week 3 Complete (Live ADK integration)
**Completed:** 2024-12-31

---

## Objectives

1. Build expandable Proof Layer UI for reasoning transparency
2. Add source citations with clickable links
3. Implement Field Mode toggle
4. Polish animations, accessibility, and responsive behavior
5. Prepare for merge to main

---

## Deliverables

### 1. ProofLayerPanel Component

**File:** `src/components/mission/ProofLayerPanel.tsx` (new)

**Requirements:**
- Expandable panel showing agent reasoning chain
- Displays when user clicks confidence badge on agent message
- Sections: Confidence Score, Sources, Reasoning Chain
- Collapsible reasoning steps with timestamps
- Citation chips link to source documents

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Proof Layer                              [✕]    │
├─────────────────────────────────────────────────┤
│ Confidence: 87%  ████████░░                     │
│                                                 │
│ Sources:                                        │
│ [MTBS 2024] [FSH 2509.13] [Cedar Creek BAER]   │
│                                                 │
│ Reasoning Chain:                                │
│ ┌─────────────────────────────────────────────┐│
│ │ 1. Recovery Coordinator delegated to        ││
│ │    Burn Analyst for severity assessment     ││
│ │    ↳ 14:32:01                              ││
│ ├─────────────────────────────────────────────┤│
│ │ 2. Burn Analyst queried MTBS raster for    ││
│ │    Cedar Creek perimeter                    ││
│ │    ↳ Tool: get_burn_severity               ││
│ │    ↳ 14:32:03                              ││
│ ├─────────────────────────────────────────────┤│
│ │ 3. Classification: High severity (dNBR >   ││
│ │    0.66) across 45% of burn area           ││
│ │    ↳ Citation: MTBS_2024_CedarCreek        ││
│ │    ↳ 14:32:05                              ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface ProofLayerPanelProps {
  proofLayer: ProofLayer;
  onClose: () => void;
  isOpen: boolean;
}

interface ProofLayer {
  confidence: number;
  sources: Source[];
  reasoning_chain: ReasoningStep[];
}

interface Source {
  id: string;
  name: string;
  type: 'regulation' | 'data' | 'document';
  url?: string;
}

interface ReasoningStep {
  step: number;
  agent: string;
  action: string;
  tool?: string;
  result?: string;
  timestamp: string;
  citation?: string;
}
```

### 2. Citation Chips

**File:** `src/components/mission/CitationChip.tsx` (new)

**Requirements:**
- Compact chip showing source name
- Color-coded by type (regulation=blue, data=green, document=amber)
- Hover shows full citation
- Click opens source (if URL available) or copies citation

### 3. Field Mode Toggle

**File:** `src/components/mission/FieldModeToggle.tsx` (new)

**Requirements:**
- Toggle switch in BriefingStrip or header
- Applies `.field-mode` class to root element
- Persists preference to localStorage
- High-contrast mode for outdoor/bright conditions

**Field Mode Changes:**
- Increases contrast ratios
- Enlarges touch targets (44px → 52px)
- Simplifies animations (reduce motion)
- Bold typography

### 4. AgentChat Enhancements

**File:** `src/components/mission/AgentChat.tsx` (modify)

**Requirements:**
- Clicking confidence badge opens ProofLayerPanel
- Citation chips inline in agent messages
- Smooth scroll to new messages
- "New messages" indicator when scrolled up
- Keyboard navigation (Enter to send, Escape to clear)

### 5. Accessibility & Polish

**Requirements across all components:**
- ARIA labels for interactive elements
- Focus management in modals/panels
- Reduced motion support (`prefers-reduced-motion`)
- Screen reader announcements for new messages
- Color contrast meets WCAG AA (4.5:1 minimum)

### 6. Responsive Refinements

**Requirements:**
- Mobile: AgentChat as bottom sheet (swipe to expand)
- Tablet: Side-by-side layout with collapsible panels
- Desktop: Full three-column layout
- ProofLayerPanel as overlay on mobile, sidebar on desktop

---

## Test Checklist

| Component | Test | Expected |
|-----------|------|----------|
| ProofLayerPanel | Opens on badge click | Panel slides in with content |
| ProofLayerPanel | Reasoning steps | Shows all steps with timestamps |
| ProofLayerPanel | Close button | Panel closes, focus returns |
| CitationChip | Hover | Shows full citation tooltip |
| CitationChip | Click with URL | Opens link in new tab |
| CitationChip | Click without URL | Copies citation to clipboard |
| FieldModeToggle | Toggle on | Applies high-contrast styles |
| FieldModeToggle | Persists | Preference survives refresh |
| AgentChat | Badge click | Opens ProofLayerPanel |
| AgentChat | Inline citations | Chips render in message |
| AgentChat | Keyboard nav | Enter sends, Escape clears |
| Accessibility | Screen reader | Announces new messages |
| Accessibility | Focus trap | Modal traps focus correctly |
| Responsive | Mobile chat | Bottom sheet behavior |
| Responsive | Tablet layout | Panels collapse correctly |

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `components/mission/ProofLayerPanel.tsx` | Expandable reasoning display |
| `components/mission/CitationChip.tsx` | Source citation chip |
| `components/mission/FieldModeToggle.tsx` | High-contrast mode toggle |
| `hooks/useFieldMode.ts` | Field mode state with persistence |

### Modified Files

| File | Changes |
|------|---------|
| `components/mission/AgentChat.tsx` | ProofLayer integration, citations |
| `components/mission/BriefingStrip.tsx` | Field mode toggle placement |
| `styles/field-mode.css` | Complete high-contrast styles |

---

## Claude Code Prompt

```
Week 4 Implementation - Proof Layer Expansion & Polish

Branch: feature/adr-012-mission-control-ui (continue from Week 3)

Read first:
- docs/specs/components/WEEK-4-IMPLEMENTATION.md
- docs/specs/PROOF-LAYER-DESIGN.md (Proof Layer spec)

Tasks:
1. Create ProofLayerPanel.tsx:
   - Expandable panel with confidence, sources, reasoning chain
   - Opens when clicking confidence badge in AgentChat
   - Reasoning steps show agent, action, tool, timestamp
   - Close button returns focus to chat

2. Create CitationChip.tsx:
   - Compact chip with source name
   - Color by type (regulation/data/document)
   - Hover tooltip, click to open URL or copy

3. Create FieldModeToggle.tsx:
   - Toggle applies .field-mode to document root
   - Persists to localStorage
   - Place in BriefingStrip

4. Enhance AgentChat.tsx:
   - Click confidence badge → open ProofLayerPanel
   - Render CitationChips inline in messages
   - Smooth scroll, keyboard navigation

5. Accessibility:
   - ARIA labels on all interactive elements
   - Focus management in ProofLayerPanel
   - Reduced motion support
   - WCAG AA color contrast

6. Responsive:
   - Mobile: AgentChat as bottom sheet
   - ProofLayerPanel as overlay on mobile

Reference:
- field-mode.css for CSS variables
- Existing panel patterns in codebase

Definition of Done:
- All test checklist items pass
- No accessibility violations (run axe)
- Works on mobile/tablet/desktop
- Ready for PR review
```

---

## Success Criteria

Week 4 is complete when:

- [x] ProofLayerPanel displays reasoning chain
- [x] CitationChips render with correct colors
- [x] CitationChips link or copy on click
- [x] FieldModeToggle works and persists
- [x] AgentChat integrates ProofLayer expansion
- [x] Keyboard navigation complete
- [x] Screen reader support tested
- [ ] Mobile bottom sheet works (deferred to polish phase)
- [x] No accessibility violations
- [x] All previous week features still work
- [x] Ready for PR to main

---

## Merge Checklist

Before merging `feature/adr-012-mission-control-ui` to `main`:

- [ ] All Week 1-4 tests passing
- [ ] No console errors or warnings
- [ ] Lighthouse accessibility score ≥90
- [ ] Mobile/tablet/desktop tested
- [ ] ADK integration tested with live backend
- [ ] Documentation updated (README, component docs)
- [ ] PR reviewed and approved
- [ ] Squash merge with descriptive commit message

---

## Post-Merge

After merging:
1. Tag release: `git tag -a v0.2.0 -m "ADR-012 Mission Control UI"`
2. Update CHANGELOG.md
3. Deploy to staging environment
4. Demo to stakeholders
5. Gather feedback for Phase 2 enhancements
