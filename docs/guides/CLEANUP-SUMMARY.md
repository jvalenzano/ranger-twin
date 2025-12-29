# Documentation Cleanup Summary

**Date:** December 27-28, 2025  
**Action:** Consolidated scattered planning/warmup/handoff documents into single operational document

---

## Update: December 28, 2025 - RAG Documentation Cleanup

**Actions Taken:**

1. **ADR-003 marked as SUPERSEDED** → `docs/archive/ADR-003-gemini-3-flash-file-search.md`
   - Added warning banner clarifying it's superseded by ADR-010
   - File Search API approach replaced by Vertex AI RAG Engine

2. **ADR-010 date inconsistency fixed** → `docs/adr/ADR-010-vertex-rag-migration.md`
   - Corrected "2025-01-28" to "2025-12-28" in migration section

3. **GCP-DEPLOYMENT.md updated** → `docs/architecture/GCP-DEPLOYMENT.md`
   - Added regional split note: Cloud Run in us-central1, Vertex RAG in europe-west3
   - Updated last modified date

4. **knowledge/manifest.yaml header updated**
   - Corrected bucket reference from `ranger-knowledge-base` to `ranger-knowledge-base-eu`
   - Added europe-west3 region documentation
   - Added ADR-010 reference for migration rationale

5. **Pending Deletion: Legacy GCS Bucket**
   - **Bucket:** `gs://ranger-knowledge-base/` (us-central1)
   - **Status:** Awaiting RAG validation in europe-west3
   - **Delete after:** Claude Code confirms all 4 corpora operational
   - **Command:** `gsutil rm -r gs://ranger-knowledge-base/`

---

## New Canonical Document

**Location:** `docs/operations/DEPLOYMENT-READINESS-PLAN.md`

This is now the **Single Source of Truth** for getting RANGER from current state to working deployment. It includes:

1. **Honest assessment** of what works vs. what's broken
2. **Root cause analysis** of why agents respond generically
3. **Step-by-step implementation plan** (Phases A-E)
4. **Success criteria** for demo readiness
5. **Commands reference** for local development

---

## Documents to Archive

Run the cleanup script to archive these superseded documents:

```bash
cd /Users/jvalenzano/Projects/ranger-twin
chmod +x docs/cleanup-stale-docs.sh
./docs/cleanup-stale-docs.sh
```

**Files that will be archived:**

| File | Reason |
|------|--------|
| `_!_WARMUP-NEXT-SESSION.md` | Stale session handoff from Dec 26 |
| `_!_HANDOFF-TO-CLAUDE.md` | References old branch, outdated |
| `WARMUP-PHASE-2.md` | Historical, Phase 2 complete |
| `WARMUP-PHASE-2-BURN-ANALYST.md` | Historical |
| `WARMUP-PHASE-2-COMPLETION.md` | Historical |
| `WARMUP-PHASE-4.md` | Superseded by new plan |
| `WARMUP-PHASE-4-EXECUTION.md` | Superseded by new plan |
| `ADK-SESSION-WARMUP.md` | Superseded by new plan |

---

## Documents to Manually Update

### 1. `docs/_!_IMPLEMENTATION-ROADMAP.md`

**Current Issue:** Claims Phase 4 "COMPLETED" but agents don't invoke tools.

**Required Changes:**
- Update Phase 4 status to "IN PROGRESS" 
- Update Phase 5 status to "BLOCKED"
- Add link to `operations/DEPLOYMENT-READINESS-PLAN.md`
- Remove or update the "Production URLs" section (they exist but don't work correctly)

### 2. `docs/specs/_!_PHASE4-MCP-INTEGRATION-PLAN.md`

**Current Issue:** Header says "✅ FULLY COMPLETED" but MCP isn't connected.

**Required Changes:**
- Remove "FULLY COMPLETED" claim
- Change status to "PARTIAL - See operations/DEPLOYMENT-READINESS-PLAN.md"
- Keep as reference for MCP architecture decisions

---

## Documents to Keep (Still Accurate)

| Document | Purpose |
|----------|---------|
| `PRODUCT-SUMMARY.md` | Vision and product positioning |
| `ADR-005-skills-first-architecture.md` | Architectural decisions |
| `ADR-006-google-only-llm-strategy.md` | LLM strategy |
| `PROOF-LAYER-DESIGN.md` | UI transparency spec |
| `PROTOCOL-AGENT-COMMUNICATION.md` | Event schema |
| `LOCAL-DEVELOPMENT-GUIDE.md` | Onboarding |

---

## Documentation Structure After Cleanup

```
docs/
├── operations/
│   └── DEPLOYMENT-READINESS-PLAN.md  ← NEW CANONICAL DOCUMENT
├── PRODUCT-SUMMARY.md             ← Vision (keep)
├── _!_IMPLEMENTATION-ROADMAP.md      ← Update status
├── adr/
│   ├── ADR-005-skills-first-architecture.md
│   └── ADR-006-google-only-llm-strategy.md
├── specs/
│   ├── PROOF-LAYER-DESIGN.md
│   └── PROTOCOL-AGENT-COMMUNICATION.md
├── archive/
│   └── pre-deployment-cleanup-2025-12-27/
│       ├── _!_WARMUP-NEXT-SESSION.md
│       ├── _!_HANDOFF-TO-CLAUDE.md
│       ├── WARMUP-PHASE-*.md
│       └── ADK-SESSION-WARMUP.md
└── planning/                          ← Mostly historical now
```

---

## Next Steps

1. **Run cleanup script** to archive stale documents
2. **Update IMPLEMENTATION-ROADMAP.md** with accurate status
3. **Follow DEPLOYMENT-READINESS-PLAN.md** Phase A to prove tools work
4. **Test locally** before touching Cloud Run

---

## The Key Insight

The documentation claimed "Phase 4 complete" but the reality is:

- **Infrastructure exists** ✅
- **Agent routing works** ✅
- **Tool invocation works** ❌ ← This is the gap

The new plan focuses specifically on closing this gap.
