# ADR-011: RAG Authentication Pattern (Pattern A: Two-Step with ADC)

**Status:** Accepted
**Date:** 2025-12-28
**Decision Makers:** jvalenzano - Digital Twin Team
**Category:** AI/ML
**Supersedes:** None

---

## Context

RANGER's 4 specialist agents (NEPA Advisor, Burn Analyst, Cruising Assistant, Trail Assessor) require RAG capabilities to query domain-specific knowledge bases in Vertex AI RAG Engine. The initial implementation used `google.genai.Client(api_key=...)` for answer generation, which failed with `401 UNAUTHENTICATED` errors in GCP environments requiring Application Default Credentials (ADC).

Two RAG + Gemini generation patterns were evaluated:

**Pattern A: Two-Step RAG with ADC**
- Explicit `rag.retrieval_query()` → manual prompt assembly → `GenerativeModel.generate_content()`
- Uses `vertexai.generative_models.GenerativeModel` with ADC authentication
- Full control over prompt engineering and response parsing

**Pattern B: Tool-Based RAG with Automatic Grounding**
- `Tool.from_retrieval()` bound to GenerativeModel for automatic grounding
- Google's recommended pattern per documentation
- Theoretically simpler integration

## Decision

**Adopt Pattern A (Two-Step RAG with ADC) for all specialist agents.**

All RAG query functions (`consult_mandatory_nepa_standards`, `query_burn_severity_knowledge`, `query_timber_salvage_knowledge`, `query_trail_infrastructure_knowledge`) now use:

```python
from vertexai.generative_models import GenerativeModel

model = GenerativeModel("gemini-2.0-flash-001")
response = model.generate_content(prompt, generation_config={...})
```

**Regional Configuration:**
- RAG corpus location: `europe-west3` (where corpora were created)
- Model location: `us-central1` (where gemini-2.0-flash-001 is available)
- Cross-region access validated and working

## Rationale

### Pattern A Advantages (Validated in Spike)

1. **Production-Ready Stability**: 4/4 test queries succeeded, 100% reasoning extraction success
2. **Proof Layer Compatibility**: Full support for structured reasoning chains, confidence scores, and citations
3. **Cross-Region Validation**: Corpus in europe-west3 accessed by model in us-central1 without errors
4. **Debugging Transparency**: Explicit retrieval step provides visibility into chunk relevance and context quality
5. **Prompt Control**: Domain-specific prompts optimized per agent (NEPA regulations, burn severity, timber cruising, trail infrastructure)

### Pattern B Limitations (Spike Findings)

1. **SDK API Instability**: `type object 'preview_grounding' has no attribute 'VertexRagStore'` blocked implementation
2. **Unknown Grounding Metadata**: Unclear if `grounding_chunks` expose text/URIs needed for Proof Layer citations
3. **Limited Control**: Automatic grounding reduces ability to tune prompt engineering per domain

## Consequences

### Positive

- ✅ **ADC Authentication Working**: All 4 agents tested successfully with Application Default Credentials
- ✅ **Proof Layer Transparency**: Reasoning chains (3-7 steps), confidence scores (0.0-1.0), and citations extracted reliably
- ✅ **Cross-Region Compatibility**: Validated corpus in europe-west3 accessible from us-central1 model
- ✅ **Maintainability**: Consistent pattern across all agents, easier to debug and enhance
- ✅ **Regional Flexibility**: Can choose optimal model region independent of corpus location

### Negative

- ⚠️ **More Code**: Two-step pattern requires manual prompt assembly and parsing (mitigated by shared utility functions)
- ⚠️ **Deprecation Warning**: `vertexai.generative_models` shows deprecation notice for June 2026 (18-month runway)

### Mitigations

| Risk | Mitigation |
|------|------------|
| API deprecation by June 2026 | Monitor Google Cloud release notes; 18-month migration window available |
| Pattern B becomes stable | Re-evaluate if Google resolves SDK issues and provides grounding metadata access |

## Alternatives Considered

| Alternative | Verdict | Rationale |
|-------------|---------|-----------|
| **Pattern B: Tool-Based RAG** | Rejected | SDK API structure mismatch (`VertexRagStore` not found), unknown grounding metadata availability, blocked implementation |
| **API Key Authentication** | Rejected | Fails in GCP environments, security anti-pattern, not compatible with ADC |
| **Separate Regions for Each Agent** | Rejected | Unnecessary complexity, cross-region access validated working |

## References

- [Technical Spike Results](../../../agents/nepa_advisor/spike/spike_results.json) (deleted post-implementation)
- [Vertex AI RAG Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/rag-api)
- [ADR-006: Google-Only LLM Strategy](./ADR-006-google-only-llm-strategy.md) - Reinforces decision to use Gemini models
- [ADR-010: Vertex RAG Migration](./ADR-010-vertex-rag-migration.md) - Migration from File Search to Vertex RAG
- [Proof Layer Design Spec](../specs/PROOF-LAYER-DESIGN.md) - Reasoning transparency requirements
- [CLAUDE.md Knowledge Base Section](../../CLAUDE.md#knowledge-base-infrastructure-vertex-ai-rag) - RAG usage guide
- **Corpus IDs**:
    - NEPA: 2305843009213693952
    - Burn: 4611686018427387904
    - Timber: 1152921504606846976
    - Trail: 8070450532247928832

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-28 | Pattern A adopted for all 4 specialist agents | Spike validated production-readiness, Proof Layer compatibility, cross-region access; Pattern B blocked by SDK issues |
