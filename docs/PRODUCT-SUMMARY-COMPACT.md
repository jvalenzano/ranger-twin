# RANGER: Product Summary (Compact)

**Version:** 1.0  
**Last Updated:** December 29, 2025  
**Purpose:** Quick reference for RANGER's core value proposition and architecture

---

## The One-Liner

> **RANGER is an AI-powered nerve center that coordinates post-fire forest recovery, compressing weeks of disconnected analysis into hours of unified intelligence.**

---

## What Is RANGER?

RANGER is an **Agentic Operating System for Natural Resource Recovery**—a multi-agent coordination platform where specialized AI agents (each enhanced by portable **Skills**) synthesize insights and present decision-makers with actionable briefings.

### The Digital Crew

| Agent | Domain Expertise (Skills) |
|-------|---------------------------|
| **Burn Analyst** | MTBS Classification, Soil Burn Severity, Boundary Mapping |
| **Trail Assessor** | Damage Classification, Closure Decision, Repair Prioritization |
| **Cruising Assistant** | Cruise Methodology, Volume Estimation, Salvage Assessment |
| **NEPA Advisor** | Pathway Decision (CE/EA/EIS), Documentation, RAG over FSM/FSH |
| **Recovery Coordinator** | Delegation, Portfolio Triage, Cross-Domain Synthesis |

**Key insight:** These agents don't just answer questions—they coordinate across domains the way a well-functioning team would.

---

## The Problem: The 8-Minute Reality

Regional Forester Maria has 8 minutes before her 6:40 AM briefing call with Washington. She needs to answer:

1. **"What's going sideways?"** — Which 3-5 fires need escalation in the next 72 hours?
2. **"Where's the resource pressure?"** — Are any districts getting overwhelmed?
3. **"What do I tell Washington?"** — A 30-second summary of regional recovery posture

### Current Reality (Without RANGER)

```
6:00 AM  — Ranger starts assembling briefing from 14 systems
8:00 AM  — Briefing ready (2+ hours, incomplete)
11:00 AM — Trail crew discovers conditions have changed
2:00 PM  — Timber sale delayed waiting for NEPA review
5:00 PM  — Erosion risk missed in morning briefing
```

### With RANGER

```
6:15 AM  — Recovery Coordinator runs automatically
6:17 AM  — Ranger sees unified briefing:
           🔴 CRITICAL: High-severity burn expanding erosion risk
           🟡 HIGH: Trail crew should reroute—debris flow detected
           🟢 COMPLIANT: Timber salvage pre-cleared, NEPA memo drafted
6:20 AM  — Ranger reviews AI reasoning, approves actions
6:30 AM  — Teams deploy with coordinated intelligence
```

**Result:**
- Decision latency: 2 hours → 5 minutes (24x faster)
- Decision quality: Guess → Integrated analysis
- Compliance time: 8 hours → 1 hour (with citations)

---

## Core Capabilities

### 1. Multi-Agent Orchestration

```
User: "Give me a recovery briefing for Cedar Creek"

Recovery Coordinator:
├── Tasks Burn Analyst: "Assess current severity status"
├── Tasks Trail Assessor: "Identify priority repairs"
├── Tasks Cruising Assistant: "Evaluate salvage opportunities"
└── Tasks NEPA Advisor: "Pre-screen compliance requirements"

Result: Unified briefing showing how burn severity affects trail priorities,
        which affects timber access, which triggers specific NEPA pathways.
```

### 2. Reasoning Transparency

Every AI output includes:
- **Confidence score** (0-100%) based on data quality
- **Source citations** (exact satellite date, regulation section)
- **Reasoning chain** (expandable logic showing how conclusion was reached)

### 3. Legacy System Compatibility

RANGER wraps existing USFS systems:

| Agent Output | Target System |
|--------------|---------------|
| Trail Assessor → TRACS CSV | Trail Condition Assessment System |
| Cruising Assistant → FSVeg XML | Field Sampled Vegetation database |
| NEPA Advisor → EA/CE templates | ePlanning / SOPA |

---

## The Trust Hierarchy

Adoption follows this pattern:

```
Trust in Data → Trust in AI → Trust in Recommendations → Behavior Change
```

**Critical insight:** If users don't trust the basic data display (filtered counts, visual consistency), they'll never trust AI recommendations.

**What kills adoption:**
- Unexplained AI scores → Staff ignore them, revert to gut feel
- Missing data without explanation → "System is broken"
- Visual inconsistency → "Which color is correct?" erodes confidence
- Answering wrong questions → Season slider no one asked for

**Fix trust first. Add magic second.**

---

## Technical Foundation

### Architecture

```
Federal Data (IRWIN/NIFC)
  → MCP Connectivity Layer
  → Recovery Coordinator (ADK)
  → Specialist Skills (Burn/Trail/NEPA)
  → Command Console UI
```

### Key Decisions (from ADRs)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Agent framework | Google ADK | FedRAMP authorized, shared session state |
| LLM Provider | Vertex AI + ADC | IAM-based auth, no API keys in production |
| Data Connectivity | MCP Servers | Decentralized, standard protocol |
| Agent Architecture | Skills-First (ADR-005) | Portable, testable, versioned domain expertise |
| Frontend | React + Tailwind | Modern, responsive tactical UI |
| Database | PostGIS + pgvector | Spatial index + RAG storage |

### Cost Profile

- Fire season (May-Oct): $800-1,200/month
- Off-season (Nov-Apr): $100-200/month
- **Annual estimate: $6,000-9,000** (vs. Esri $100K+, Palantir $1M+)

---

## What Differentiates RANGER

### vs. Existing USFS Systems (RAVG, TRACS, FScruiser)

- **Integration:** Unified platform vs. siloed by domain
- **Interface:** Natural language vs. GIS expertise required
- **Reasoning:** AI synthesis vs. data retrieval only
- **Speed:** Hours vs. days to weeks

**We don't replace these systems—we make them talk to each other.**

### vs. Commercial Platforms (Esri, Palantir)

- **Licensing:** $0 (open source) vs. $100K-$1M+/year
- **Lock-in:** Open standards vs. proprietary formats
- **Federal readiness:** FedRAMP High from day one
- **Focus:** Forest recovery specific vs. general-purpose

**80% of budget goes to AI capabilities, 20% to application shell.**

---

## Current Phase: Demo (6 Weeks)

### What We're Proving

| We ARE Proving | We Are NOT Proving |
|----------------|-------------------|
| Multi-agent coordination works | We can process satellite imagery |
| Reasoning transparency builds trust | We can detect trail damage from video |
| Cross-domain synthesis creates value | We can run CV models at the edge |
| Legacy export compatibility | We can build offline mobile apps |

### Success Criteria

- Cross-agent cascade completes with correlation tracking
- Reasoning chains visible and expandable
- FSM/FSH citations link to actual sources
- TRACS CSV and FSVeg XML exports validate
- Demo runs in < 30 seconds end-to-end

---

## The Pitch (30 Seconds)

> "RANGER is the Forest Service's first integrated digital twin for post-fire recovery. It connects burn severity, trail damage, timber inventory, and NEPA compliance through a unified AI platform. Built entirely on open source tools with no licensing fees, it delivers analysis in hours that currently takes weeks. We're demonstrating with Cedar Creek Fire data—click 'Run Demo' and watch the Recovery Coordinator orchestrate four AI agents into a coordinated briefing."

---

## References

- [ADR-005: Skills-First Architecture](./adr/ADR-005-skills-first-architecture.md)
- [ADR-006: Vertex AI + ADC Authentication](./adr/ADR-006-google-only-llm-strategy.md)
- [MCP-REGISTRY-STANDARD.md](./specs/MCP-REGISTRY-STANDARD.md)
- [PROOF-LAYER-DESIGN.md](./specs/PROOF-LAYER-DESIGN.md)
- [Full Product Summary](./_!_PRODUCT-SUMMARY.md)

---

**Document Owner:** RANGER Product Team  
**Status:** Living document — update as we learn
