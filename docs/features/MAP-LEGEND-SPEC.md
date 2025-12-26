# RANGER Map Legend: Interactive Layer Control

> [!IMPORTANT]
> **Standard:** This document is aligned with **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)**. The legend reflects the current recovery phase, which determines the active **Skills** and data visualizations.

## 1. Executive Summary
The **Interactive Map Legend** is a collapsible sidebar component that provides situational awareness and control over the TwinView map layers. It is "Phase-Aware," meaning it highlights the most relevant data layers for the active recovery stage (Impact, Damage, Timber, or Compliance).

## 2. Visual Design
- **Location:** Collapsible sidebar (Right or Bottom-Right).
- **Aesthetic:** Dark mode, glassmorphism, translucency.
- **Color Logic:** Direct mapping from the 4-phase color system:
    - **Impact (Red):** Burn severity, dNBR.
    - **Damage (Amber):** Trail hazards, infrastructure failure.
    - **Timber (Emerald):** Salvage plots, MBF data.
    - **Compliance (Purple):** NEPA units, cultural resource buffers.

## 3. Core Features
### Active Layer Filtering
- Toggles to enable/disable specific geospatial layers.
- "Show All" vs. "Phase Focus" toggles.

### Dynamic Interaction
- Hovering over a legend item highlights the corresponding features on the map.
- Clicking a legend item zooms and centers the map to the extent of that layer's data.

### Accessibility
- High-contrast color markers.
- Screen reader labels for all toggle states.
- Glove-friendly touch targets (min-height: 44px).

## 4. Technical Implementation
- **Store:** `mapLayerStore.ts` tracks visibility states.
- **Component:** `MapLegend.tsx` (React).
- **Data Source:** MapLibre layers defined in `mapConfig.ts`.

---
*Last Updated: December 2025*
