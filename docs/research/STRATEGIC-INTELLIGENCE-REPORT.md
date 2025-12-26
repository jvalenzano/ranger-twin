# Strategic Intelligence Report: RANGER BAER Operations

**Date:** December 25, 2025
**Source:** Expert Panel Review (Domain + AI Specialists)
**Status:** Canonical Research for Phase 1-2 Execution

---

## Executive Summary
RANGER's Skills-First architecture on Google ADK and Gemini 2.0 Flash is well-positioned for productionizing BAER (Burned Area Emergency Response) workflows. However, the path to full operationalization depends on bridging critical gaps in federal data connectivity (IRWIN, FSVeg) and prioritizing high-impact stabilization protocols.

---

## 1. Critical Connectivity Gaps

The primary hurdle for RANGER's "Mission Control" effectiveness is the access to real-time, cross-agency fire data.

| Data Source | Status | Gap Impact |
|-------------|--------|------------|
| **IRWIN** | Missing MCP | **Critical.** IRWIN is the single source of truth for multi-agency incident reporting. Without it, RANGER lacks current fire status. |
| **FIRMS** | Missing MCP | **High.** Lack of MODIS/VIIRS hotshot data prevents real-time "Active" phase monitoring. |
| **MTBS/USGS Portal** | Missing MCP | **Medium.** Hinders automated comparisons between current dNBR and historical severity trends. |
| **FSVeg / TRACS** | Missing MCP | **High.** Essential for timber salvage value and recovery tracking. |

---

## 2. Buy vs. Build Policy

| Approach | Category | Example Systems |
|----------|----------|-----------------|
| **Leverage (Buy)** | Generic / Environmental | Cloud-based satellite imagery (Google Earth Engine), Global Weather (Open-Meteo). |
| **Wrap (Build)** | Domain / Compliance | NIFC REST APIs, IRWIN data fusion, USFS-internal DBs (FSVeg). |

**Note on Compliance:** The build approach for domain-specific data is **non-negotiable** for FedRAMP readiness to ensure local control and data provenance.

---

## 3. Domain Precision Roadmap (Skill Prioritization)

The expert panel recommends the following prioritization for the Skills Library:

1.  **BAER Triage (Highest ROI):** Automating the 7-day post-fire assessment window using IRWIN-fed incident data.
2.  **Soil Burn Severity (Immediate Impact):** Validating soil stabilization needs using dNBR satellite filters.
3.  **NEPA Compliance (Strategic Value):** High complexity but defines the legality of the entire recovery process.

---

## 4. Strategic Alignment Assessment

RANGER aligns with the **USDA GenAI Strategy** by:
- Enabling "factory-like" development (reusable skills across different fires).
- Reducing redundant data entry by integrating with the IRWIN ecosystem.
- Implementing the "enterprise capabilities" vision through portable ADK skills.

---

## 5. Recommended Actions

- **Tactical:** Prioritize the development of a thin MCP wrapper for **IRWIN** data.
- **Structural:** Shift the "Burn Analyst" focus specifically toward **Soil Burn Severity** as the first specialized validation skill.
- **Governance:** Ensure all `skill.md` files for BAER Triage include specific citations to USFS-standard protocols to satisfy audit requirements.
