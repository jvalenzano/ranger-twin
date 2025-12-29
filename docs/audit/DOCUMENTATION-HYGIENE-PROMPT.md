# RANGER Documentation Hygiene Audit Prompt

**Purpose:** Comprehensive review for conciseness, deduplication, and technical debt cleanup.  
**Date:** December 28, 2025  
**For:** Anti-Gravity (IDE) or similar AI-assisted review tool

---

## Instructions for AI Assistant

You are reviewing the RANGER project documentation and codebase for hygiene issues. This is a federal AI project that tends to accumulate "architectural sediment" from rapid iteration. Your goal is to identify issues, NOT to make changes autonomously.

**Output Format:** Create a report with three sections:
1. **Critical Fixes** - Issues that could cause confusion or bugs
2. **Recommended Consolidation** - Documents that overlap significantly
3. **Technical Debt Items** - Stale code, configs, or references to clean up

**Safety Guardrails:**
- DO NOT modify any files in `agents/` without explicit approval
- DO NOT modify any files in `apps/command-console/src/` without explicit approval  
- DO NOT modify `main.py`, `Dockerfile`, or deployment scripts
- Focus on `docs/` and configuration files only for direct changes
- For code changes, report findings only

---

## Audit Areas

### 1. Documentation Verbosity & Duplication

**Check for:**
- Documents > 500 lines that could be split or summarized
- Multiple documents covering the same topic (consolidation candidates)
- Excessive preamble or context-setting that could be trimmed
- Redundant "Background" or "Context" sections across ADRs
- Documents that repeat information available elsewhere

**Known Large Documents to Review:**
- `docs/architecture/GCP-ARCHITECTURE.md` (~1200 lines) - Is this all necessary? Much may be reference material that could be externalized.
- `docs/_!_PRODUCT-SUMMARY.md` - Check for duplication with README.md
- `docs/archive/ADR-003-gemini-3-flash-file-search.md` - Already marked superseded, verify no active references

**Questions to Answer:**
- Can GCP-ARCHITECTURE.md be split into "GCP Reference" (external patterns) vs "RANGER GCP Config" (our specific choices)?
- Are there planning documents that are now stale and should be archived?

### 2. Regional Configuration Consistency

**Current State:**
- Cloud Run services: `us-central1`
- Vertex AI RAG Engine: `europe-west3` (migrated Dec 28, 2025)
- GCS Knowledge Bucket: `gs://ranger-knowledge-base-eu/` (europe-west3)
- Old bucket: `gs://ranger-knowledge-base/` (us-central1) - **TO BE DELETED**

**Check for stale references to:**
- `us-central1` in RAG-related code (should now be `europe-west3`)
- `ranger-knowledge-base` without `-eu` suffix (old bucket)
- `VERTEX_AI_LOCATION=us-central1` (should be `europe-west3` for RAG)
- Any hardcoded regions that should use environment variables

**Files to Check:**
```
agents/*/file_search.py
agents/*/.env.example
knowledge/scripts/*.py
knowledge/manifest.yaml
.env.example
docker-compose.yml
docs/adr/ADR-010-vertex-rag-migration.md (source of truth)
```

**Expected Findings:**
- The old `gs://ranger-knowledge-base/` bucket in us-central1 should be flagged for deletion
- Any code referencing it should be updated or removed

### 3. ADR Chain Integrity

**Verify:**
- ADR-003 is properly marked SUPERSEDED (should link to ADR-010)
- ADR-004 (OpenRouter) is properly marked as partially superseded by ADR-006
- No active code references superseded ADRs as authoritative
- ADR numbering is sequential with no gaps (we have 001, 002, 004-010)

**Question:** Is there an ADR-003 in the active `/docs/adr/` folder, or only in archive?

### 4. Stale Code & Configuration Artifacts

**Check for:**
- Python files with `file_search` in the name that use the old File Search API
- References to `gemini-3-flash` or `gemini-2.5-flash` (should be `gemini-2.0-flash`)
- Orphaned test files for removed features
- `.env` files committed to git (should only be `.env.example`)
- Unused dependencies in `requirements.txt` or `package.json`

**Specific Items:**
- `services/agents/nepa-advisor/scripts/setup_file_search.py` - Should be deleted (per ADR-010)
- Any `.file_search_store.json` or `.nepa_store_config.json` files - Should be deleted
- References to OpenRouter API keys

### 5. Documentation Structure Review

**Current Structure Issues:**
- `docs/` has 20+ subdirectories - is this necessary?
- Some docs use `_!_` prefix for importance - is this consistent?
- Archive structure: `docs/archive/` vs `docs/archive/2025-12/` - standardize?

**Recommend:**
- Which directories can be collapsed?
- Which archived documents are safe to delete entirely?
- Is the `.context/` folder up to date with current architecture?

### 6. README Consistency Check

**Verify:**
- Root README.md matches current project state
- Agent count (5), skill count (16), test count (606) are accurate
- Model references are consistent (`gemini-2.0-flash` everywhere)
- Quick start instructions actually work
- Links to documentation are not broken

### 7. Test Coverage Verification

**Questions:**
- Is the "606 tests" claim accurate? Run `pytest agents/ --collect-only | grep "test session starts"` 
- Are there tests for removed features that should be cleaned up?
- Are the knowledge base scripts tested?

---

## Output Template

```markdown
# RANGER Documentation Hygiene Report
**Generated:** [DATE]
**Auditor:** [YOUR NAME/TOOL]

## Executive Summary
[2-3 sentence summary of findings]

## Critical Fixes (P0)
| Issue | File | Action Required |
|-------|------|-----------------|
| ... | ... | ... |

## Recommended Consolidation (P1)
| Documents | Overlap | Recommendation |
|-----------|---------|----------------|
| ... | ... | ... |

## Technical Debt (P2)
| Item | Location | Notes |
|------|----------|-------|
| Old GCS bucket | gs://ranger-knowledge-base/ | Safe to delete after confirming no references |
| ... | ... | ... |

## Files Safe to Delete
- [ ] [file path] - [reason]
- [ ] ...

## Documentation to Archive
- [ ] [file path] - [reason]
- [ ] ...

## Questions for CTO
1. [Question about unclear decisions]
2. ...
```

---

## Reference: Known Good State

**Source of Truth Documents:**
- Architecture: `docs/adr/ADR-005-skills-first-architecture.md`
- LLM Strategy: `docs/adr/ADR-006-google-only-llm-strategy.md`
- RAG Infrastructure: `docs/adr/ADR-010-vertex-rag-migration.md`
- Tool Invocation: `docs/adr/ADR-007.1-tool-invocation-strategy.md`
- Product Vision: `docs/_!_PRODUCT-SUMMARY.md`

**Current Regional Configuration:**
| Resource | Region | Bucket/Service |
|----------|--------|----------------|
| Cloud Run (frontend) | us-central1 | ranger-console |
| Cloud Run (backend) | us-central1 | ranger-coordinator |
| Vertex AI RAG | europe-west3 | 4 corpora |
| GCS (knowledge) | europe-west3 | ranger-knowledge-base-eu |
| GCS (legacy) | us-central1 | ranger-knowledge-base (DELETE) |

---

## Execution Notes

1. **Do not execute cleanup automatically.** Report findings only.
2. **Preserve git history.** Use `git mv` for renames, not delete+create.
3. **Batch related changes.** Group documentation fixes into logical commits.
4. **Test after cleanup.** Run `pytest agents/ -v` after any code changes.

---

*This prompt was generated by CTO review on December 28, 2025.*
