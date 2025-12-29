# GCP Architecture Triage Recommendations

**Status:** Draft / Recommendation Only
**Date:** December 28, 2025

## Summary
The current `docs/architecture/GCP-ARCHITECTURE.md` is overly verbose (1000+ lines) and contains generic Google Cloud documentation that duplicates official sources. This adds maintenance burden.

## Recommendations

### 1. Retention (Keep specific RANGER decisions)
- **Section 7: Recommended Architecture** - This is the core value.
- **Section 5.2: Gemini API for Document Processing** - Contains project-specific cost analysis for NEPA.
- **Section 6: Federal/Government Considerations** - Critical FedRAMP context for our deployment.
- **Section 2.1: Serverless-First for Seasonal Workloads** - Core cost strategy.

### 2. Externalization (Link to official docs)
- **Section 1 (Services Overview):** Replace with links to GCP product pages (Earth Engine, BigQuery GIS).
- **Section 3 (Open Source on GCP):** Simplify to a decision matrix; remove generic deployment snippets.
- **Section 4 (Data Pipelines):** Keep high-level patterns; remove generic code samples (e.g., generic Cloud Workflow YAML).
- **Pricing Tables:** Remove generic pricing (it rots quickly). Link to official pricing pages. Keep only the *comparative analysis* specific to RANGER.

### 3. Action Plan
1. Create `docs/architecture/GCP-ARCHITECTURE-v2.md` with streamlined content.
2. Review v2 against v1 to ensure no RANGER-specific context is lost.
3. Replace v1 with v2.

---
**Verification:**
This document serves as the triage plan requested in the hygiene audit execution.
