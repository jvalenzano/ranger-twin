# RANGER Skills Library Index

> [!IMPORTANT]
> **Standard:** This index is aligned with **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)** and the **[Skill Format Specification](skill-format.md)**.

## Overview
This document tracks the specialized domain expertise (Skills) available to the RANGER Recovery Coordinator. Each skill is a portable package containing instructions, logic, and tools.

## Core Specialist Skills

| Skill | Category | Description | Implementation Status |
|-------|----------|-------------|-----------------------|
| **Burn Analysis** | Agency | Satellite-based burn severity (dNBR) and fire perimeter analysis. | `skills/forest-service/burn-analyst/` |
| **Trail Assessment** | Agency | Field damage detection, hazard identification, and repair costing. | `skills/forest-service/trail-assessor/` |
| **Timber Inventory** | Agency | Multimodal timber cruising, salvage volume estimation, and species ID. | `skills/forest-service/cruising-assistant/` |
| **NEPA Guidance** | Foundation | Regulatory compliance (CE/EA/EIS), FSM/FSH reference,, and directive advisory. | `skills/foundation/nepa-advisor/` |

## Foundation Skills

| Skill | Category | Description | Implementation Status |
|-------|----------|-------------|-----------------------|
| **Greeting** | Foundation | Standard multi-agent greeting and system orientation. | `skills/foundation/greeting/` |
| **Geospatial Tools** | Foundation | Coordinate conversion, bounding box logic, and spatial queries. | `skills/foundation/geospatial/` |

## Skill Development Pipeline
New skills must follow the `skill.md` template and inclusion criteria defined in [ADR-005](../adr/ADR-005-skills-first-architecture.md).

---
*Last Updated: December 2025*
