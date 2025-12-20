# RANGER: Sprint Focus & Development Priorities

This document establishes the roadmap for the initial RANGER development sprint, focusing on foundational orchestration and novel field capture innovations.

## Strategic Priorities

| Priority | Component | Rationale |
|----------|-----------|-----------|
| **P0** | **Recovery Coordinator Agent** | Root orchestration required for all workflows and agent delegation. |
| **P0** | **Command Console UI Shell** | Shared infrastructure ("The Chrome") for all lifecycle views. |
| **P1** | **Trail Assessor Field Capture** | Novel innovation (video-to-work-order) with high visual demo impact. |
| **P1** | **Cruising Assistant Field Capture** | Multimodal AI innovation (voice + video) for timber inventory. |
| **P2** | **IMPACT View Integrations** | Aggregation of MTBS/RAVG data via MCP/API (aggregation, not competition). |
| **P3** | **COMPLIANCE View (NEPA Advisor)** | Later phase; focus on RAG for regulatory corpuses. |

## Why These Priorities?

1.  **Orchestration First:** The **Recovery Coordinator** is the "brain" that makes RANGER a unified platform instead of a collection of tools. Implementing the ADK-based routing is the highest risk and highest reward technical task.
2.  **Shared UI Utility:** The **Command Console** is the product. Building the shared shell allows us to quickly pivot between lifecycle views once the child agents are ready.
3.  **Field Innovation is the "Moat":** We aren't competing with existing satellite analysis (IMPACT); we're augmenting it with **Field Capture**. The Trail Assessor and Cruising Assistant provide the unique value that traditional BAER/Timber workflows lack.

## Key Principles

-   **Wrap, Don't Replace:** Integrate with MTBS, RAVG, and TRACS via MCP/API.
-   **Agent-First:** Favor agentic reasoning over hard-coded UI logic.
-   **Forest Floor to Washington:** Ensure data flows from field capture to the national-level console seamlessly.
