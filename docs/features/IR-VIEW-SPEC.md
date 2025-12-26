# RANGER IR View: Thermal Situational Awareness

> [!IMPORTANT]
> **Standard:** This document is aligned with **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)**. The IR view is calibrated for **Burn Analyst** skill workflows, providing baseline thermal context for fire severity assessment.

## 1. Executive Summary
The **Infrared (IR) View** provides thermal visualization of active and recently contained fire sites. By utilizing Short-Wave Infrared (SWIR) and Long-Wave Infrared (LWIR) satellite bands, it allows practitioners to identify hotspots, residual heat, and soil burn intensity through cloud cover and smoke.

## 2. Design Principles
- **No Pulse:** Animations are removed to preserve visual clarity for scientific analysis.
- **Harmonious Palette:** Uses a curated thermal gradient (Deep Blue → Amber → Burning White) that adheres to the RANGER design system.
- **Contextual Metadata:** The top bar displays relevant satellite data sources (e.g., Sentinel-2, Landsat 8/9, NASA FIRMS) rather than a redundant color key.

## 3. Visual Components
- **Thermal Heat Scale:** A qualitative scale showing relative heat intensity.
- **Hotspot Markers:** Precision dots representing VIPRS/MODIS detections.
- **Attribution:** Dynamic label showing "Last Satellite Pass: [TIMESTAMP]".

## 4. Technical Integration
- **Processing Layer:** Google Earth Engine or private tile server.
- **Agent Hook:** The `Burn Analyst` skill can trigger the IR view to explain its "High Severity" detection reasoning.
- **Toggle:** Accessible via the "Multimodal Controls" in the TwinView HUD.

---
*Last Updated: December 2025*
