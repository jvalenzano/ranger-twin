# RANGER Briefing UX Specification

**Status:** Authoritative
**Phase 1 Scope:** All behaviors described work with simulated data per `DATA-SIMULATION-STRATEGY.md`

This document defines how the "Agentic Interface" translates `AgentBriefingEvent` objects into a mission-critical tactical interface.

## 1. UI Target Rendering

| ui_target | Visual Behavior | Trigger Condition |
|-----------|-----------------|-------------------|
| `rail_pulse` | Lifecycle rail segment glows with a rhythmic pulse. **Yellow** for `action_required`, **Red** for critical `alert`. | Any event with a `source_agent` matching a lifecycle segment. |
| `map_highlight` | GeoJSON feature highlighted with a severity-colored outline (`--color-safe/warning/severe`). Displays a persistent tactical popup. | Event contains a `geo_reference`. |
| `panel_inject` | A glassmorphic "Insight Card" is injected into the top of the active agent panel. Includes direct links to `proof_layer` citations. | Event `type` is `insight` or `status_update`. |
| `modal_interrupt` | Full-screen glassmorphic takeover. Dims the background and requires user engagement via `suggested_actions`. | `severity` is `critical` AND `type` is `alert`. |

## 2. Reasoning Transparency (Proof Layer)

To prevent the "Black Box" problem and ensure federal trust, the UI must make the agent's logic visible.

### Reasoning Chain Visualization
- **Component:** `ReasoningAccordion`
- **Behavior:** Renders the `proof_layer.reasoning_chain` as a vertical stepper-style list.
- **Location:** At the bottom of every `panel_inject` or `modal_interrupt` card.
- **Default State:** Collapsed (labeled "Show Reasoning").

### Citation Drill-Down
- **Inline Preview:** Hovering over a citation link displays a small tooltip with the `excerpt` from the source.
- **Source Verification:** Clicking a citation:
  - **Satellite (Sentinel-2):** *(Phase 1: Static GeoJSON)* Toggles the map to the simulated burn severity layer referenced in the citation.
  - **Directives (FSM/FSH):** *(Real in Phase 1)* Opens a split-pane PDF viewer at the exact chapter/section.
  - **Legacy (TRACS/FSVeg):** *(Phase 1: Simulated fixtures)* Highlights the specific record in the data grid using fixture data.

## 3. Action Flow

Suggested actions are the bridge from "AI Insight" to "Human Execution."

1. **User Discovery:** User clicks a `rail_pulse` or sees a `panel_inject`.
2. **Review:** User reads the `summary` and optionally expands the `ReasoningAccordion`.
3. **Decision:** User interacts with a `suggested_action` button.
4. **Execution:**
   - **Internal Handoff:** If the action `target_agent` is another specialist, the `RecoveryCoordinator` emits a new event with a `parent_event_id` and the same `correlation_id`.
   - **External Export:** Triggers a download of a legacy-compatible stub (defined in `LEGACY-INTEGRATION-SCHEMAS.md`).
   - **Manual Override:** "Dismiss" or "Flag for Review" removes the priority from the `priorities` list.

## 4. Event Correlation (Mirror of the Mind)

The UI must allow users to trace the "why" across agents.

- **Linkage:** If an event has a `parent_event_id`, the UI provides a "Linked Insight" breadcrumb.
- **Trace View:** A dedicated "Briefing History" panel allows users to filter by `correlation_id` to see the entire cascade of logic from original burn severity to final NEPA advice.
