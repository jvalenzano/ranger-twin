# ADR-006: Google-Only LLM Strategy for Phase 1

**Status:** Accepted
**Date:** 2025-12-26
**Decision Makers:** TechTrend Federal - Digital Twin Team
**Category:** API Infrastructure & Simplification
**Supersedes:** ADR-004 (OpenRouter integration only; Site Analysis feature remains valid)

---

## Context

RANGER initially adopted a hybrid LLM strategy with two providers:
- **OpenRouter** — General chat and Site Analysis (rate limit relief)
- **Google Gemini** — ADK agents and Managed RAG/File Search

This dual-provider approach was introduced in ADR-004 to address Google API rate limits during development. However, as the architecture matured, we discovered:

1. **ADK Requires Gemini** — Google ADK agents are tightly coupled to the Gemini runtime. OpenRouter cannot be substituted.
2. **Managed RAG is Google-Only** — File Search (for NEPA knowledge base) is a Google-proprietary service.
3. **Complexity Without Value** — Maintaining two API keys, two billing relationships, and routing logic added overhead without clear Phase 1 benefit.

---

## Decision

**Simplify to Google Gemini as the sole LLM provider for Phase 1.**

All LLM calls now route through the Google Gemini API:
- ADK Agents (Coordinator, Burn Analyst, Trail Assessor, etc.)
- Frontend Site Analysis and Chat
- NEPA Managed RAG / File Search

---

## Rationale

| Factor | Dual-Provider (Before) | Google-Only (After) |
|--------|------------------------|---------------------|
| **API Keys** | 2 (Google + OpenRouter) | 1 (Google) |
| **Billing** | 2 vendor relationships | 1 vendor relationship |
| **Routing Logic** | Complex fallback chains | Simple direct calls |
| **ADK Compatibility** | OpenRouter not usable | Native support |
| **Managed RAG** | Google-only anyway | Native support |
| **Rate Limits** | OpenRouter more generous | Sufficient for Phase 1 |

**Key Insight:** Since ADK and Managed RAG both require Google API, adding OpenRouter only helped for frontend chat—a minor use case that doesn't justify the added complexity.

---

## Implementation

### Environment Configuration

**Root `.env` (shared across all agents):**
```bash
GOOGLE_API_KEY=AIzaSy...
```

**Frontend `.env.local`:**
```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_MAPTILER_API_KEY=lxf...
```

### Code Changes

1. **`aiBriefingService.ts`** — Removed OpenRouter fallback chain; all queries route to Google Gemini API directly.
2. **`.env.example` files** — Simplified to Google-only configuration.
3. **`verify-openrouter.js`** — Removed (no longer needed).

---

## Consequences

### Positive

1. **Reduced Complexity** — One provider, one API key, one billing relationship
2. **Consistent Behavior** — All LLM calls use the same backend
3. **Easier Onboarding** — New developers configure one key
4. **Lower Cognitive Load** — No routing decisions or fallback chains

### Negative

1. **Single Point of Failure** — No provider fallback if Google has issues
2. **Less Model Flexibility** — Cannot easily switch to Claude/GPT-4 for specific tasks
3. **Rate Limits** — Google's limits apply to all traffic

### Mitigations

| Risk | Mitigation |
|------|------------|
| Google outage | Simulation mode fallback exists in frontend |
| Rate limits | Sufficient for Phase 1 demo scale; upgrade to paid tier if needed |
| Model quality issues | Gemini 2.0 Flash is capable; revisit in Phase 2 if needed |

---

## Future Considerations

OpenRouter (or multi-provider routing) may be reconsidered in Phase 2+ if:
- We need Claude's reasoning for specific analysis tasks
- We want to A/B test model quality across providers
- Google reliability becomes an issue at scale
- Cost optimization across providers becomes important

For now, simplicity wins.

---

## References

- [ADR-004: Site Analysis & OpenRouter](./ADR-004-site-analysis-openrouter.md) — Superseded (OpenRouter parts only)
- [ADR-005: Skills-First Architecture](./ADR-005-skills-first-architecture.md) — ADK dependency on Gemini
- [Google File Search Blog](https://blog.google/technology/developers/file-search-gemini-api/) — Managed RAG feature

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-26 | Google-only strategy accepted | Simplification; ADK/RAG require Gemini anyway |
| 2025-12-26 | ADR-004 marked superseded | OpenRouter integration removed; Site Analysis feature preserved |
