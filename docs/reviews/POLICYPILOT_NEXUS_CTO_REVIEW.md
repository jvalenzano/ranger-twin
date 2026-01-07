# CTO Technical Review: PolicyPilot Nexus

**Document:** POLICYPILOT_NEXUS v2.0
**Author:** Vladislav Myakota, Sr. Postgres Developer
**Reviewer:** CTO, RANGER Project
**Review Date:** 2026-01-07
**Verdict:** **CONDITIONAL APPROVAL** — Requires architectural modifications before integration

---

## Executive Assessment

Vlad has done impressive work here. This is the most thoughtful proposal I've seen from the team—12 agents, proper MCP abstraction, A2A integration, regional sharding, self-learning loops. He clearly understands where federal AI is heading.

**However, the proposal has three architectural violations that must be resolved before we can proceed.**

---

## Critical Issues

### 1. ADR-006 VIOLATION: Multi-LLM Strategy

**The Problem:**  
The LiteLLM gateway routing to Gemini + Claude + GPT-4o + Llama + Mistral directly contradicts our Google-only LLM mandate.

| Source | Statement |
|--------|-----------|
| ADR-006 | "All LLM calls use Google Gemini API directly" |
| PolicyPilot | "Ensemble voting with 3-LLM consensus" |

**Why this matters:**  
Every additional LLM provider expands our FedRAMP attack surface. We've already fought this battle—consolidating to Vertex AI with ADC authentication eliminated the API key sprawl that was creating security audit findings. Vlad's "ensemble verification for 99% citation accuracy" reintroduces exactly what we removed.

**The Fix:**  
The 99% citation accuracy goal is achievable *without* multi-vendor LLMs. Use Gemini 2.0 Pro with structured outputs + deterministic verification against the source graph. If Gemini says "FSM 2520.3 requires X," we can verify that claim programmatically against the Spanner graph—no need for Claude or GPT-4 to "vote."

**Effort:** ~2 weeks to refactor the Citation Agent


### 2. ADR-005 VIOLATION: Agent Proliferation vs. Skills-First

**The Problem:**  
12 agents across 5 levels is **agent-centric design**, not Skills-First architecture.

Look at Level 2 "Domain Specialists":

| Current (Agent) | Should Be (Skill) |
|-----------------|-------------------|
| Retrieval Agent | `retrieval` skill |
| Citation Agent | `citation_verification` skill |
| Regional Agent | `regional_routing` skill |
| Conflict Agent | `conflict_detection` skill |

These aren't "agents" in the ADR-005 sense—they're domain logic that should be packaged as portable skills. The value isn't in the agent; it's in the expertise encapsulated in the skill.md.

**Why this matters:**  
When BLM wants regulatory intelligence for their land management guidance, we should be able to hand them the `citation_verification` skill package—not ask them to adopt our entire 12-agent orchestration hierarchy.

**The Fix:**  
Collapse to 4 agents maximum:

1. **PolicyPilot Coordinator** (L1 orchestration)
2. **Regulatory Intelligence Agent** (consumes skills: retrieval, citation, regional, conflict)
3. **Multimodal Processor** (transcription is legitimately agent-scoped—long-running async)
4. **RANGER Gateway** (A2A provider)

Extract domain logic into `/skills/` packages following our standard:

```
skills/
├── citation_verification/
│   ├── skill.md
│   ├── tools.py
│   └── tests/
├── regional_routing/
│   ├── skill.md
│   └── ...
├── conflict_detection/
│   ├── skill.md
│   └── ...
└── regulatory_retrieval/
    ├── skill.md
    └── ...
```

**Effort:** ~3 weeks to refactor agent hierarchy


### 3. Cost Model: Incomplete but Directionally Correct

**The Problem:**  
$83,600 over 3 years is cloud infrastructure only. This omits:

- Developer labor (5 months @ ~$15K/month loaded = $75K minimum)
- Ongoing maintenance (20% of dev cost annually)
- Integration testing with RANGER
- Security review and ATO preparation

**Reality check:**  
True 3-year TCO is closer to **$250-300K** including labor. The ROI math still works ($1M+ annual benefit), but the executive summary understates the real investment required.

**The Fix:**  
Revise financial summary to include labor costs. The ROI remains compelling; we just need honest numbers for budget planning.

---

## What Vlad Got Right

### MCP Abstraction (Excellent)

The 4-server MCP architecture is exactly what we want:

| MCP Server | Tools | Backend |
|------------|-------|---------|
| `spanner-graph-mcp` | graph_traversal, query_regional_shard, detect_conflicts, get_citation_chain | Spanner Enterprise |
| `vertex-vector-mcp` | semantic_search, find_similar_docs, get_embeddings | Vertex AI Vector Search |
| `gcs-documents-mcp` | retrieve_source_content, get_media_asset | Cloud Storage |
| `gemini-multimodal-mcp` | transcribe_video, transcribe_audio | Gemini 2.0 |

Database-agnostic tool interfaces mean we can swap Spanner for Neo4j Aura if Google's graph implementation proves immature—without touching agent code.

### A2A Integration (Excellent)

The `policypilot-mcp` external provider exposing tools to RANGER via A2A is the right pattern:

- `search_regulations` — Natural language regulatory search
- `get_citation` — Verified citation details
- `verify_compliance` — Check statements against regulations
- `traverse_graph` — Navigate regulatory relationships
- `search_multimodal` — Unified text/video/audio search

This makes PolicyPilot a first-class citizen in our distributed agent ecosystem.

### Proof Layer Compliance (Excellent)

Every response includes:

- `citation_id`
- `verification_tier` (1-4)
- `source_hash`
- `retrieval_timestamp`
- `verification_method`

This matches our transparency requirements exactly.

### Regional Sharding Strategy (Excellent)

R1-R10 routing with automatic comparison is genuinely innovative. This solves a real Forest Service pain point that RANGER's NEPA Advisor can't address today.

### Self-Learning Framework (Good with caveats)

The weekly improvement cycle is well-structured:

| Day | Activity |
|-----|----------|
| Monday | Export query logs, aggregate feedback, citation accuracy metrics |
| Tue-Wed | Pattern analysis, identify failure modes, cluster query patterns |
| Thursday | Deploy to staging, regression tests, validate accuracy |
| Friday | Deploy improvements, generate report |

However, "prompt tuning" and "re-embedding" need guardrails to ensure we're not degrading accuracy chasing engagement metrics.

---

## Integration Path with RANGER

If we fix the architectural violations, PolicyPilot Nexus becomes RANGER's regulatory intelligence backend:

```
RANGER Recovery Coordinator
    └── NEPA Advisor Agent
        └── [A2A] PolicyPilot RANGER Gateway
            ├── search_regulations
            ├── verify_compliance
            └── traverse_graph
```

The NEPA Advisor should consume PolicyPilot as an MCP tool provider, not embed regulatory search logic internally. This separation of concerns is exactly what Skills-First architecture demands.

---

## Recommendation

**Approve with modifications.** Assign Vlad to work with CTO on:

| Modification | Owner | Duration | Gate |
|--------------|-------|----------|------|
| Remove LiteLLM, Gemini-only | Vlad | 2 weeks | ADR-006 compliance |
| Refactor to 4 agents + skills | Vlad + Jason | 3 weeks | ADR-005 compliance |
| Revise cost model (include labor) | Vlad | 1 week | Budget accuracy |
| Integration design with RANGER | Jason | 2 weeks | A2A contract |

**Total runway:** 8 weeks pre-work before starting the 20-week implementation timeline.

**Revised Phase 1 start:** Week 9 from today (mid-March 2026)

---

## Final Verdict

Vlad has built something valuable here. The multimodal regulatory search, regional routing, and A2A integration solve real problems for the Forest Service. The architecture is 80% aligned with our standards—we just need to fix the LLM sprawl and collapse the agent hierarchy into portable skills.

This is a **GO** with the modifications above. PolicyPilot Nexus should become the regulatory intelligence skill library that RANGER consumes, and eventually the pattern we replicate for BLM, NPS, and EPA regulatory guidance.

**Next action:** Schedule architecture review with Vlad this week to walk through ADR-005 and ADR-006 constraints in detail.

---

## Appendix: Reference Documents

- [ADR-005: Skills-First Architecture](docs/adr/ADR-005-skills-first-architecture.md)
- [ADR-006: Google-Only LLM Strategy](docs/adr/ADR-006-google-only-llm-strategy.md)
- [MCP Registry Standard](docs/specs/MCP-REGISTRY-STANDARD.md)
- [Proof Layer Design](docs/specs/PROOF-LAYER-DESIGN.md)
- [RANGER Product Summary](docs/PRODUCT-SUMMARY.md)

---

**Document Classification:** Internal Technical Review  
**Distribution:** Jason Valenzano (AI Technical Lead), Vladislav Myakota (Sr. Developer), Ziaur Rahman (Stakeholder)
