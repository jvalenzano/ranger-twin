# ADR-006: Google-Only LLM Strategy for Phase 1

**Status:** Accepted
**Date:** 2025-12-26
**Decision Makers:** TechTrend Federal - Digital Twin Team
**Category:** API Infrastructure & Simplification
**Supersedes:** ADR-004 (OpenRouter integration only; Site Analysis feature remains valid)

---

## Authentication Method Update (2025-12-29)

**Production Authentication:** Uses **Vertex AI with Application Default Credentials (ADC)**

- Cloud Run services authenticate via **IAM service account roles** (no API keys)
- Development uses `gcloud auth application-default login`
- All components (ADK agents, frontend proxies, RAG) use ADC

**Historical Context:** This ADR originally described moving from dual providers (OpenRouter + Google) to single provider (Google). The authentication method has evolved from API keys to ADC for better security, FedRAMP compliance, and GCP best practices.

**Environment Variables:**
```bash
# Vertex AI Configuration (uses Application Default Credentials)
GOOGLE_CLOUD_PROJECT=ranger-twin-dev
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=TRUE
# NO API KEYS REQUIRED - ADC handles authentication
```

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

**Standardize on Vertex AI with Application Default Credentials (ADC) as the sole authentication method for Phase 1.**

All LLM calls now route through the Google Vertex AI API using IAM-based authentication:
- **ADK Agents** (Coordinator, Burn Analyst, Trail Assessor, etc.) — Use ADC from Cloud Run service account
- **Frontend Site Analysis and Chat** — Proxy requests through backend (ADC)
- **NEPA Managed RAG / File Search** — Direct Vertex AI access via ADC

**API keys are not used in production environments.** This eliminates secret management overhead and aligns with federal security requirements.

---

## Rationale

| Factor | Dual-Provider (Before) | Google API Key (Intermediate) | **Vertex AI + ADC (Now)** |
|--------|------------------------|-------------------------------|---------------------------|
| **API Keys** | 2 (Google + OpenRouter) | 1 (Google) | **0 (IAM-based)** |
| **Billing** | 2 vendor relationships | 1 vendor relationship | **Project-based** |
| **Security** | Keys in env vars | Key in env var | **IAM / Service Account** |
| **ADK Compatibility** | No | Native | **Native** |
| **Managed RAG** | No | Native | **Native** |
| **FedRAMP Compliance** | Unclear | API key risk | **IAM audit trail** |

**Key Insights:**
1. Moving to ADC aligns with Google Cloud best practices and federal security requirements
2. Eliminates risk of API key leakage (no secrets in environment variables)
3. Standardizes authentication across all components (agents, frontend, backend)
4. Enables fine-grained IAM permissions for audit compliance

---

## Implementation

### Authentication Flow

**Development:**
```bash
# Developers authenticate once locally
gcloud auth application-default login

# ADK agents automatically pick up credentials
export GOOGLE_CLOUD_PROJECT=ranger-twin-dev
export GOOGLE_CLOUD_LOCATION=us-central1
export GOOGLE_GENAI_USE_VERTEXAI=TRUE
```

**Production (Cloud Run):**
```yaml
# Cloud Run service configuration
service:
  name: ranger-coordinator
  serviceAccount: ranger-adk-sa@ranger-twin-prod.iam.gserviceaccount.com
  
# IAM bindings
bindings:
  - role: roles/aiplatform.user
    members: ["serviceAccount:ranger-adk-sa@ranger-twin-prod.iam.gserviceaccount.com"]
```

**Frontend Proxy Pattern:**
```typescript
// Frontend never calls Vertex AI directly
// Requests proxy through backend with ADC
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: userQuery })
});

// Backend handler (ADK) uses ADC automatically
```

### Migration Steps from API Keys

1. ✅ **Removed** `GOOGLE_API_KEY` from all `.env` files
2. ✅ **Removed** `OPENROUTER_API_KEY` from all configurations
3. ✅ **Added** `GOOGLE_GENAI_USE_VERTEXAI=TRUE` flag
4. ✅ **Updated** `aiBriefingService.ts` to proxy through backend
5. ✅ **Removed** `verify-openrouter.js` validation script
6. ✅ **Configured** Cloud Run service accounts with Vertex AI permissions

---

## Consequences

### Positive

1. **Enhanced Security** — No API keys to leak, rotate, or manage
2. **Reduced Complexity** — One provider, zero secrets, IAM-based permissions
3. **Consistent Behavior** — All LLM calls use the same Vertex AI backend
4. **Easier Onboarding** — New developers run `gcloud auth` once
5. **Lower Cognitive Load** — No routing decisions or fallback chains
6. **FedRAMP Compliance** — IAM audit trails for all LLM API calls
7. **Cost Transparency** — All usage appears in single GCP project billing

### Negative

1. **Single Point of Failure** — No provider fallback if Google has issues
2. **Less Model Flexibility** — Cannot easily switch to Claude/GPT-4 for specific tasks
3. **Rate Limits** — Google's limits apply to all traffic
4. **GCP Lock-in** — Tighter coupling to Google Cloud infrastructure

### Mitigations

| Risk | Mitigation |
|------|------------|
| Google outage | Simulation mode fallback exists in frontend |
| Rate limits | Sufficient for Phase 1 demo scale; production tier supports higher QPS |
| Model quality issues | Gemini 2.0 Flash is capable; revisit in Phase 2 if needed |
| GCP lock-in | Skills-First architecture (ADR-005) keeps agent logic portable |

---

## Future Considerations

OpenRouter (or multi-provider routing) may be reconsidered in Phase 2+ if:
- We need Claude's reasoning for specific analysis tasks
- We want to A/B test model quality across providers
- Google reliability becomes an issue at scale
- Cost optimization across providers becomes important

**However:** Any multi-provider strategy must maintain ADC-equivalent security (no API keys in production).

For now, simplicity and security win.

---

## References

- [ADR-004: Site Analysis & OpenRouter](./ADR-004-site-analysis-openrouter.md) — Superseded (OpenRouter parts only)
- [ADR-005: Skills-First Architecture](./ADR-005-skills-first-architecture.md) — ADK dependency on Gemini
- [Google Vertex AI Authentication](https://cloud.google.com/vertex-ai/docs/authentication) — ADC documentation
- [Google ADK Documentation](https://google.github.io/adk-docs/) — Agent Development Kit
- [Google File Search Blog](https://blog.google/technology/developers/file-search-gemini-api/) — Managed RAG feature

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-26 | Google-only strategy accepted | Simplification; ADK/RAG require Gemini anyway |
| 2025-12-26 | ADR-004 marked superseded | OpenRouter integration removed; Site Analysis feature preserved |
| 2025-12-29 | Clarified ADC authentication method | Document now reflects production IAM-based auth (not API keys) |
