# RANGER Demo: Data Architecture Quick Reference

> **Purpose:** Quick reference for articulating demo vs. production architecture to stakeholders.  
> **Full Documentation:** [ADR-009: Fixture-First Development Strategy](./adr/ADR-009-fixture-first-development.md)

---

## The 30-Second Explanation

> "This demonstration uses **real federal data** from the Cedar Creek Fire—MTBS satellite imagery, USFS field assessments, official TRACS codes. We've cached this data locally so the demo runs reliably without network dependencies. The **agent coordination you're seeing is real-time**—only the underlying data source is pre-loaded. Production deployment simply swaps local fixtures for live MCP connections to NIFC and IRWIN."

---

## What's Real vs. What's Demo Scaffolding

| Component | Demo State | Production State | What Changes |
|-----------|------------|------------------|--------------|
| **Agent Orchestration** | ✅ Real | ✅ Real | Nothing—identical code |
| **Reasoning Chains** | ✅ Real | ✅ Real | Nothing—same Proof Layer |
| **Domain Skills** | ✅ Real | ✅ Real | Nothing—same Python scripts |
| **Fire Data** | Cached (real MTBS/IRWIN data) | Live API | Data source only |
| **Conversation Memory** | Ephemeral (in-memory) | Persistent (Firestore) | Environment variable |
| **User Authentication** | Basic Auth | Google Identity | Configuration only |

**Key Point:** The agentic workflow—the core innovation—is identical between demo and production.

---

## Data Provenance (What We Can Cite)

| Data Type | Source | Date | Authenticity |
|-----------|--------|------|--------------|
| Burn Severity | MTBS (Monitoring Trends in Burn Severity) | Oct 2022 | Real dNBR satellite values |
| Fire Perimeter | NIFC/IRWIN | Aug 2022 | Real coordinates, acreage |
| Trail Damage | TRACS format spec | Nov 2022 | Real damage codes (D1-D5) |
| Timber Plots | FSVeg format spec | Nov 2022 | Real plot structure |
| NEPA Pathways | FSM/FSH Chapter 1950 | Current | Official USFS regulations |

**We are NOT using synthetic test data.** Fixtures are cached snapshots of real federal data sources.

---

## Common Stakeholder Questions

### "Is this real data?"

> "Yes. The Cedar Creek fixture data comes from MTBS satellite imagery captured October 2022 and USFS field assessments from November 2022. We cache it locally for demo reliability, but it's the same data format and values that production would receive from live APIs."

### "Why only two fires?"

> "The demo focuses on **depth of agent coordination**, not breadth of data. Cedar Creek and Bootleg have complete fixture data across all four specialist domains—burn severity, trail damage, timber inventory, and NEPA compliance. Production deployment connects to all fires in the NIFC system."

### "Will my conversations be saved?"

> "In the demo, conversations are ephemeral—they reset when you close the browser. Production deployment uses Firestore for persistent memory, so the system remembers context across sessions."

### "What would change for production?"

> "Three things: (1) Data flows through MCP servers to live federal APIs instead of local fixtures, (2) Sessions persist to Firestore instead of in-memory, (3) Authentication uses Google Identity instead of Basic Auth. The agent code—the reasoning, coordination, and skills—is identical."

---

## Architecture Comparison (Visual)

```
DEMO                                    PRODUCTION
────────────────────                    ────────────────────
                                        
┌─────────────────┐                     ┌─────────────────┐
│ Recovery        │                     │ Recovery        │
│ Coordinator     │                     │ Coordinator     │
│ (ADK)           │                     │ (ADK)           │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Specialist      │                     │ Specialist      │
│ Agents (4)      │  ◄── IDENTICAL ──►  │ Agents (4)      │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Skills Library  │                     │ Skills Library  │
│ (Python)        │  ◄── IDENTICAL ──►  │ (Python)        │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Local Fixtures  │                     │ MCP Servers     │
│ (JSON files)    │  ◄── DIFFERENT ──►  │ (Cloud Run)     │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Federal APIs    │
                                        │ NIFC │ IRWIN    │
                                        │ MTBS │ TRACS    │
                                        └─────────────────┘
```

---

## Demo Script: Opening Statement

> "RANGER demonstrates how AI agents coordinate post-fire recovery analysis. You're about to see the Recovery Coordinator orchestrate four specialist agents—Burn Analyst, Trail Assessor, Cruising Assistant, and NEPA Advisor—to produce an integrated briefing.
>
> The data is real—Cedar Creek MTBS imagery from October 2022, USFS field assessments from November 2022. We've cached it for demo reliability. The agent reasoning and coordination happens in real-time; only the data source is pre-loaded.
>
> Let me show you what happens when a Forest Supervisor asks for a recovery briefing..."

---

## What We're Proving (Demo Success Criteria)

| ✅ Proving | ❌ Not Proving |
|-----------|----------------|
| Agents coordinate across domains | We can process live satellite imagery |
| Reasoning is transparent and auditable | We can handle 1000 concurrent users |
| Cross-domain synthesis creates value | We can replace human expertise |
| Skills pattern is portable and testable | We can detect trail damage from video |
| Proof Layer citations work | We can run offline in the field |

---

## Phase Roadmap

| Phase | Data Source | Sessions | Auth | Timeline |
|-------|-------------|----------|------|----------|
| **0-1 (Demo)** | Local fixtures | In-memory | Basic Auth | Now |
| **2 (Pilot)** | MCP → Live APIs | Firestore | Google Identity | Q2 2026 |
| **3 (Production)** | MCP → Live APIs | Firestore | USDA eAuth | Q4 2026 |

**The agent code doesn't change between phases.** Only infrastructure configuration.

---

## Related Documentation

- [ADR-009: Fixture-First Development Strategy](./adr/ADR-009-fixture-first-development.md) — Full architectural rationale
- [ADR-005: Skills-First Architecture](./adr/ADR-005-skills-first-architecture.md) — MCP abstraction layer
- [PROOF-LAYER-DESIGN.md](./specs/PROOF-LAYER-DESIGN.md) — Citation and transparency requirements
- [PRODUCT-SUMMARY.md](./PRODUCT-SUMMARY.md) — Full product overview

---

**Last Updated:** December 27, 2025
