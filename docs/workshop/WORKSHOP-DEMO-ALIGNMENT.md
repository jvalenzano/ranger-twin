# Workshop-to-Demo Alignment

**Purpose:** Map the production vision from the expert workshop to our Phase 1 portfolio demo implementation.

---

## Executive Summary

The December 2025 workshop describes a **$704K / 26-week / 8 FTE** production system for USFS fire recovery operations. Our demo is a **$0 / Phase 1 static** portfolio proof-of-concept.

**Both share the same architecture.** The demo proves the patterns; the workshop shows the scale.

---

## Architecture Alignment

| Architecture Element | Workshop Vision | Demo Implementation | Status |
|---------------------|-----------------|---------------------|--------|
| Multi-agent coordinator pattern | Vertex AI Agent Builder, Gemini 2.5 | Simulated with fixture data | ✅ Aligned |
| 4 specialist agents + coordinator | FireSight, TrailScan, TimberScribe, PolicyPilot, Coordinator | Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor, Recovery Coordinator | ✅ Aligned (names differ) |
| AgentBriefingEvent contract | Full schema with confidence ledger | Implemented in Python + TypeScript | ✅ Aligned |
| Reasoning transparency | Chain-of-thought visible in UI | `reasoning_chain` in ProofLayer | ✅ Aligned |
| Confidence Ledger | Per-input confidence with data tiers | Added to schema (v1.1.0) | ✅ Aligned |
| UI targets | map_highlight, rail_pulse, panel_inject, modal_interrupt | Implemented in BriefingObserver | ✅ Aligned |
| "Golden Thread" synthesis | Cross-agent narrative with correlation_id | `correlation_id` links events | ✅ Aligned |
| Tactical Futurism aesthetic | Dark mode, glassmorphism, military command center | Tailwind config, design tokens | ✅ Aligned |

---

## Agent Name Mapping

| Workshop Name | Demo Name | Workshop Description | Demo Description |
|--------------|-----------|---------------------|------------------|
| **FireSight** | **Burn Analyst** | "Thermal/burn-severity expert" | "Satellite burn severity assessment" |
| **TrailScan** | **Trail Assessor** | "Hazard/safety detection specialist" | "Trail damage detection and work order generation" |
| **TimberScribe** | **Cruising Assistant** | "Reforestation & ecological specialist" | "Multimodal timber inventory and salvage prioritization" |
| **PolicyPilot** | **NEPA Advisor** | "NEPA & compliance orchestrator" | "Environmental regulatory guidance and compliance support" |
| **Coordinator** | **Recovery Coordinator** | "Master orchestration agent" | "Multi-agent orchestration and cross-domain synthesis" |

**Decision:** Keep demo names (Burn Analyst, etc.) for accessibility. Workshop names (FireSight, etc.) are more "tactical" but less intuitive for general portfolio audience.

---

## Data Strategy Alignment

### Workshop Data Tiers

| Tier | Confidence | Workshop Usage | Demo Implementation |
|------|------------|----------------|---------------------|
| **Tier 1** | 90%+ | Sentinel-2, crew GPS, weather | Static fixture JSON (simulated as high-confidence) |
| **Tier 2** | 70-85% | Interpolated LiDAR, FIA extrapolation | Flagged in fixtures with `tier: 2` |
| **Tier 3** | <70% | ML-inferred, climate projections | Marked as demo-only in fixtures |

### Demo Fixture Files

| Workshop Data Source | Demo Fixture | Location |
|---------------------|--------------|----------|
| MTBS burn severity | `burn-severity.json` | `data/fixtures/cedar-creek/` |
| Trail damage inventory | `trail-damage.json` | `data/fixtures/cedar-creek/` |
| FSVeg cruise data | `timber-plots.json` | `data/fixtures/cedar-creek/` |
| AgentBriefingEvents | `briefing-events.json` | `data/fixtures/cedar-creek/` |

---

## UI/UX Alignment

### Layout Comparison

| Workshop Level | Demo Implementation | Status |
|---------------|---------------------|--------|
| Level 0: Command View | Main App layout with Status Ledger | ✅ Aligned |
| Level 1: Map View | MapLibre with terrain, layer toggles | ✅ Aligned |
| Level 2: Detail/Reasoning View | InsightCard with expandable reasoning | ✅ Aligned |
| Level 3: Agent Dashboard | Not in Phase 1 scope | ⏸️ Future |
| Level 4: Executive Layer | Not in Phase 1 scope | ⏸️ Future |

### Visual Language

| Workshop Spec | Demo Implementation |
|--------------|---------------------|
| Dark mode primary | `--color-background: #0F172A` |
| Monospace for data (IBM Plex Mono) | `font-mono` Tailwind class |
| Sans-serif for narrative (Roboto) | `font-sans` Tailwind class |
| Critical red (#FF4444) | `--color-severe: #EF4444` |
| Warning amber (#FFA500) | `--color-warning: #F59E0B` |
| On-track teal (#00B4B4) | `--color-safe: #10B981` |
| Glassmorphic HUDs | `backdrop-blur-md` + translucent panels |

---

## Workflow Alignment

### Workshop "6-Minute Briefing"

```
6:15:00am → Coordinator activates
6:15:05am → Dispatch FireSight + TrailScan (parallel)
6:15:30am → FireSight output ready
6:15:45am → TrailScan output ready
6:16:00am → Dispatch TimberScribe (depends on FireSight)
6:16:30am → TimberScribe output ready
6:16:45am → Dispatch PolicyPilot (depends on all)
6:17:00am → PolicyPilot output ready
6:17:15am → Coordinator synthesizes "Golden Thread"
6:17:45am → Briefing ready for Sarah's review
```

### Demo Cascade Sequence

From `briefing-events.json`:
```
1. evt_burn_001     → Burn Analyst severity assessment
2. evt_trail_001    → Trail Assessor damage inventory (parent: burn)
3. evt_timber_001   → Cruising Assistant salvage analysis (parent: trail)
4. evt_nepa_001     → NEPA Advisor compliance guidance (parent: timber)
5. evt_coordinator_001 → Recovery Coordinator synthesis (correlates all)
```

**Status:** ✅ Same cascade pattern, same dependency chain

---

## Feature Gap Analysis

### Implemented in Demo

| Feature | Workshop Reference | Demo Location |
|---------|-------------------|---------------|
| Cross-agent cascade | Phase 3, "Coordinator Pattern" | `briefing-events.json` |
| Reasoning chains | Phase 1, "Black Box Problem" | `reasoning_chain` in ProofLayer |
| Confidence levels | Phase 2, "Confidence Ledger" | `confidence_ledger` in ProofLayer |
| Geographic context | Phase 4, "Map View" | `geo_reference` in UIBinding |
| Suggested actions | Phase 3, agent outputs | `suggested_actions` in EventContent |
| NEPA memo generation | Phase 3, PolicyPilot | evt_nepa_001 with citations |
| Legacy export formats | Phase 2, "TRACS/FSVeg" | `LEGACY-INTEGRATION-SCHEMAS.md` |

### Not in Demo (Future Vision)

| Feature | Workshop Reference | Why Excluded |
|---------|-------------------|--------------|
| Real-time 6am batch processing | Phase 2, "Daily batch" | Demo is static/simulated |
| Event-driven updates | Phase 2, "Wind forecast triggers" | No real-time data |
| Multi-region failover | Phase 4, "Resilience" | Portfolio demo, not production |
| USDA authentication | Phase 4, "Security" | No auth needed for demo |
| Offline field tablet caching | Phase 4, "Offline Resilience" | No mobile app in Phase 1 |
| $704K infrastructure | Executive summary | Demo is $0 |

---

## Confidence Ledger Integration

### Schema Enhancement

The workshop introduced the Confidence Ledger pattern. We've integrated it:

**Before (v1.0.0):**
```json
"proof_layer": {
  "confidence": 0.87,
  "citations": [...],
  "reasoning_chain": [...]
}
```

**After (v1.1.0):**
```json
"proof_layer": {
  "confidence": 0.87,
  "confidence_ledger": {
    "inputs": [
      {"source": "MTBS burn severity", "confidence": 0.95, "tier": 1},
      {"source": "LiDAR coverage", "confidence": 0.40, "tier": 3}
    ],
    "analysis_confidence": 0.82,
    "recommendation_confidence": 0.87
  },
  "citations": [...],
  "reasoning_chain": [...]
}
```

### Files Updated
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md`
- `packages/agent-common/agent_common/types/briefing.py`
- `apps/command-console/src/types/briefing.ts`

---

## Terminology Mapping

| Workshop Term | Demo Equivalent | Notes |
|--------------|-----------------|-------|
| "Golden Thread" | Cross-agent synthesis via `correlation_id` | Same concept |
| "Command Loop" | User interaction with Action Rail | Same pattern |
| "Art-Ideal Interface" | Tactical Futurism design system | Same aesthetic |
| "Confidence-weight outputs" | `confidence_ledger.inputs[].tier` | Implemented |
| "The 6-Minute Briefing" | Demo cascade in `briefing-events.json` | Simulated |

---

## Recommendation for Portfolio

When presenting the demo:

1. **Show the architecture alignment** — Workshop validates our patterns
2. **Reference "Golden Thread"** — Good term for cross-agent synthesis
3. **Highlight Confidence Ledger** — Differentiator for reasoning transparency
4. **Acknowledge scale difference** — Demo proves patterns; workshop shows production vision

If asked "what would production look like?", point to `docs/workshop/ranger_executive.md`.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial alignment document |
