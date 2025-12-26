# RANGER Proof Layer: Design Specification

> [!IMPORTANT]
> **Standard:** This specification is aligned with **[UX-VISION.md](../architecture/UX-VISION.md)** and **[BRIEFING-UX-SPEC.md](../architecture/BRIEFING-UX-SPEC.md)**. It formalizes the visual language for agentic transparency under the Skills-First architecture.

## 1. Overview
The **Proof Layer** is the UI's specialized transparent surface. Its purpose is to solve the "Black Box AI" problem by providing a human-auditable trail of every logic step and data citation that led to an agent's insight.

## 2. Visual Aesthetic: "Tactical Transparency"
Following the **Tactical Futurism** theme, the Proof Layer uses:
- **Glassmorphism:** Layered `backdrop-blur-md` panels with `bg-slate-900/40` backgrounds.
- **Monospace Typography:** `JetBrains Mono` or `Roboto Mono` for all data citations and raw metric outputs to emphasize precision.
- **Micro-Animations:** Subtle vertical height transitions when the `ReasoningAccordion` expands.

## 3. Core Components

### 3.1. Reasoning Chain (ReasoningAccordion)
Renders the `proof_layer.reasoning_chain` from the `AgentBriefingEvent`.

- **Visual Style:** A vertical "stepper" line with circular nodes.
- **Node States:**
  - **Completed (Brand Accented):** A solid `#10B981` circle for steps that have successfully executed.
  - **Active (Pulse):** A pulsing stroke circle representing the current step being processed.
- **Interactions:** "Show Reasoning" toggle at the bottom of every Insight Card.

### 3.2. Citation Chips
Renders citations for federal data sources found in `proof_layer.citations`.

| Source Type | Visual Cue | Hover Preview (Tooltip) |
|-------------|------------|------------------------|
| **Satellite** | `[S-2]` Icon | Thumbnail of the sentinel-2 dNBR layer. |
| **Directive** | `[FSM]` Icon | Snippet text: "FSM 2020.1: Recovery Standards..." |
| **Legacy** | `[IRWIN]` Icon | JSON Key-Value pair from the source fixture. |

### 3.3. Confidence Indicators
A visual representation of the `proof_layer.confidence` floating-point value.

| Range | UI Color | Label Style |
|-------|----------|-------------|
| **0.90 - 1.0** | `--color-ranger-primary` (#10B981) | Solid, high-contrast |
| **0.60 - 0.89** | `--color-ranger-warning` (#F59E0B) | Subtle pulse, italic |
| **< 0.60** | `--color-ranger-severe` (#EF4444) | Strong pulse, warning icon |

## 4. Skill Attribution
Since agents are now modularized as **Skills**, the UI must attribute specific insights to specific skills.

- **Skill Badge:** Displayed in the header of the Insight Card (e.g., `[Skill: Burn Analysis]`).
- **Logic Link:** Expanding the Reasoning Chain should link to the `skill.md` definition when clicked by authorized users (USFS Admins/Auditors).

## 5. Implementation Rules
1. **Never hide citations:** If a skill provides an insight, the source must be cited.
2. **Standardize date formats:** All citation timestamps must use ISO 8601 (YYYY-MM-DD) for consistency across different federal agencies.
3. **No Pulse on Idle:** Only use pulsing animations for active processing states (Stage 2 decision: remove distracting constant pulses).

---
*Created: December 2025*
