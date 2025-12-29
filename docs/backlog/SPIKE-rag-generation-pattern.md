# Technical Spike: RAG + Generation Architecture Pattern

**Type:** Technical Spike  
**Priority:** High (blocks production readiness)  
**Estimated Effort:** 4-6 hours  
**Created:** December 28, 2025  
**Status:** Ready for Development

---

## Context

During RAG validation, we discovered that our generation step uses `google.genai.Client(api_key=...)` which fails with `401 UNAUTHENTICATED` against Vertex AI endpoints. Research confirmed two viable patterns for RAG + Gemini integration:

### Pattern A: Two-Step (Current, with auth fix)

```python
# Step 1: Explicit retrieval
response = rag.retrieval_query(
    rag_resources=[...],
    text=query,
    rag_retrieval_config=RagRetrievalConfig(top_k=5)
)

# Step 2: Manual prompt assembly + generation
contexts = [ctx.text for ctx in response.contexts.contexts]
prompt = f"Based on these documents:\n{contexts}\n\nQuestion: {query}"

model = GenerativeModel("gemini-2.0-flash-001")
answer = model.generate_content(prompt)
```

**Pros:**
- Full control over prompt engineering
- Explicit visibility into retrieved contexts (Proof Layer alignment)
- Can implement custom relevance filtering between retrieval and generation
- Easier to debug and audit

**Cons:**
- More code to maintain
- Manual citation extraction
- Prompt engineering burden on us

### Pattern B: Tool-Based Retrieval (Google Recommended)

```python
# Bind RAG corpus to model as a tool
rag_tool = Tool.from_retrieval(
    retrieval=rag.Retrieval(
        source=rag.VertexRagStore(
            rag_resources=[...],
            rag_retrieval_config=RagRetrievalConfig(top_k=5),
        )
    )
)

model = GenerativeModel(
    model_name="gemini-2.0-flash-001",
    tools=[rag_tool],
)

# Model automatically retrieves and grounds response
response = model.generate_content(query)
# Grounding metadata available in response
```

**Pros:**
- Google's official recommended pattern
- Automatic grounding with citation metadata
- Less code, more maintainable
- Benefits from Google's ongoing optimizations
- Better integration with Gemini's reasoning

**Cons:**
- Less control over retrieval-to-generation flow
- Grounding metadata format may not match our Proof Layer schema
- Debugging is harder (retrieval happens inside the model call)
- Potential latency differences

---

## Spike Objectives

1. **Implement both patterns** for NEPA Advisor as a test case
2. **Evaluate against Proof Layer requirements:**
   - Can we extract reasoning chains from each pattern?
   - How do citations surface? Do they match our schema?
   - What confidence signals are available?
3. **Measure operational characteristics:**
   - Latency (end-to-end query time)
   - Token usage (cost implications)
   - Error handling (what fails, how gracefully?)
4. **Document findings** with concrete code examples
5. **Make architectural recommendation** with evidence

---

## Test Queries for Evaluation

| Query | Expected Behavior |
|-------|-------------------|
| "What are the categorical exclusion criteria for timber salvage under 36 CFR 220.6?" | Should cite FSH 1909.15 Chapter 30, specific acreage thresholds |
| "Does high-severity burn in riparian areas trigger extraordinary circumstances?" | Should cite FSM 1950, extraordinary circumstances checklist |
| "What documentation is required for a CE vs EA?" | Should cite both FSH chapters, compare requirements |
| "Summarize BAER team composition requirements" | Should cite BAER handbook, list required specialists |

---

## Proof Layer Compatibility Checklist

For each pattern, evaluate:

- [ ] Can we extract the retrieved chunks before/after generation?
- [ ] Are source URIs available for citation chips?
- [ ] Can we compute/extract confidence scores?
- [ ] Is the reasoning chain visible or reconstructable?
- [ ] Does the response format support our `AgentBriefingEvent` schema?
- [ ] Can we attribute insights to specific skills?

---

## Decision Criteria

| Criterion | Weight | Pattern A Wins If... | Pattern B Wins If... |
|-----------|--------|---------------------|---------------------|
| Proof Layer alignment | 30% | We need fine-grained control over citations | Grounding metadata is sufficient |
| Maintainability | 25% | Custom prompt engineering adds value | Less code = fewer bugs |
| Performance | 20% | Two-step is faster | Tool-based is faster |
| Future-proofing | 15% | Google deprecates tool pattern (unlikely) | Google optimizes tool pattern |
| Debugging | 10% | We have frequent RAG issues | RAG is stable |

---

## Deliverables

1. **Spike branch:** `spike/rag-generation-patterns`
2. **Comparison code:** Both patterns implemented for NEPA Advisor
3. **Evaluation report:** Markdown doc with findings, measurements, recommendation
4. **ADR draft:** If architectural change warranted, draft ADR-011

---

## References

- [Vertex AI RAG Engine Quickstart](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-quickstart)
- [Tool.from_retrieval() Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/retrieval-tool)
- [ADR-010: Vertex RAG Migration](../adr/ADR-010-vertex-rag-migration.md)
- [PROOF-LAYER-DESIGN.md](../specs/PROOF-LAYER-DESIGN.md)
- [Perplexity Research: RAG + Gemini Auth](internal session notes, Dec 28 2025)

---

## Open Questions

1. Does `Tool.from_retrieval()` support the `europe-west3` region, or only US regions?
2. Can we access raw retrieved chunks when using tool-based retrieval, or only the grounded response?
3. How does tool-based retrieval handle multi-corpus queries (e.g., NEPA + burn severity)?
4. What happens if retrieval returns no results—does generation still proceed?

---

*This spike should be completed before finalizing the RAG auth fix to ensure we implement the right pattern, not just the quick fix.*
