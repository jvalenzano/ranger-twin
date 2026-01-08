## Anti-Gravity Implementation Prompt: RAG Graceful Fallback Pattern

**Date:** January 2, 2026  
**Priority:** P1 - Cost Optimization & Demo Resilience  
**Branch:** `feature/rag-graceful-fallback`

---

### Context

We just deleted 4 orphaned RAG corpora in europe-west3 that were costing ~$14/month in Cloud Spanner charges. The us-west1 RAG corpora are empty. Rather than recreating them for demo phase, we're implementing a "Graceful Fallback" pattern that makes agents RAG-resilient.

**Key Insight:** Vertex AI RAG Engine auto-provisions Cloud Spanner (~$7/month per region). For Phase 1 demo with Cedar Creek fixture data, this is unnecessary cost. Agents should work perfectly with embedded knowledge from `data/templates/` and `data/fixtures/`.

---

### Objectives

1. Implement startup-time RAG health check (not per-query)
2. Add graceful fallback to Skills/fixtures when RAG unavailable
3. Ensure Proof Layer citations work in fallback mode
4. Update documentation to reflect Phase 1 RAG strategy
5. Create re-enablement script for Phase 2 transition

---

### Pre-Flight Validation

Before making changes, verify current state:

```bash
# Confirm europe-west3 corpora are gone
curl -X GET \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://europe-west3-aiplatform.googleapis.com/v1beta1/projects/ranger-twin-dev/locations/europe-west3/ragCorpora"
# Expected: {}

# Confirm us-west1 corpora are empty
curl -X GET \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://us-west1-aiplatform.googleapis.com/v1beta1/projects/ranger-twin-dev/locations/us-west1/ragCorpora"
# Expected: {}

# Verify fixture/template data exists
ls -la data/templates/
ls -la data/fixtures/
```

---

### Implementation Tasks

#### Task 1: Create Shared RAG Client with Health Check

**File:** `agents/_shared/rag_client.py`

```python
"""
RAG Client with Graceful Fallback Pattern

Checks corpus health at import time and provides fallback to embedded knowledge.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Module-level flag set at startup
_RAG_AVAILABLE: Optional[bool] = None
_RAG_CONFIG: Optional[Dict[str, Any]] = None


def _check_corpus_health() -> bool:
    """
    Check if RAG corpus is available and healthy.
    Called once at module import, not per-query.
    """
    config_path = Path(__file__).parent.parent / ".vertex_rag_config.json"
    
    if not config_path.exists():
        logger.warning("[RAG-OFFLINE] No .vertex_rag_config.json found")
        return False
    
    try:
        with open(config_path) as f:
            config = json.load(f)
        
        # Check if explicitly disabled
        if not config.get("enabled", True):
            logger.info("[RAG-OFFLINE] RAG explicitly disabled in config")
            return False
        
        # TODO: Add actual corpus health ping if needed
        # For now, assume if config exists and enabled=True, RAG is available
        global _RAG_CONFIG
        _RAG_CONFIG = config
        return config.get("healthy", False)
        
    except Exception as e:
        logger.warning(f"[RAG-OFFLINE] Failed to load RAG config: {e}")
        return False


def is_rag_available() -> bool:
    """Check if RAG is available (cached result from startup)."""
    global _RAG_AVAILABLE
    if _RAG_AVAILABLE is None:
        _RAG_AVAILABLE = _check_corpus_health()
        if not _RAG_AVAILABLE:
            logger.info("[RAG-OFFLINE] Using embedded knowledge for demo phase")
    return _RAG_AVAILABLE


def get_rag_config() -> Optional[Dict[str, Any]]:
    """Get RAG configuration if available."""
    is_rag_available()  # Ensure check has run
    return _RAG_CONFIG


# Run health check on import
is_rag_available()
```

---

#### Task 2: Update Agent RAG Tools with Fallback Pattern

**Files to modify:**
- `agents/nepa_advisor/tools/file_search.py`
- `agents/burn_analyst/tools/rag_query.py`
- `agents/cruising_assistant/tools/rag_query.py`
- `agents/trail_assessor/tools/rag_query.py`

**Pattern to implement in each:**

```python
from agents._shared.rag_client import is_rag_available
from agents._shared.template_lookup import lookup_template  # or appropriate skill

async def query_knowledge_base(
    query: str,
    incident_name: str = "Cedar Creek"
) -> dict:
    """
    Query domain knowledge with graceful RAG fallback.
    
    If RAG is unavailable, falls back to embedded templates/fixtures.
    Citations are preserved in both paths for Proof Layer compliance.
    """
    
    if is_rag_available():
        # Production path: Use Vertex AI RAG
        return await _query_vertex_rag(query)
    else:
        # Demo path: Use embedded knowledge
        logger.info(f"[RAG-OFFLINE] Corpus unavailable - using embedded knowledge for {incident_name}")
        return await _fallback_to_embedded(query)


async def _fallback_to_embedded(query: str) -> dict:
    """
    Fallback to template/fixture lookup.
    Must return same schema as RAG response for Proof Layer compatibility.
    """
    # Use existing template_lookup skill
    result = lookup_template(query)
    
    return {
        "answer": result.get("content", ""),
        "citations": result.get("citations", []),
        "source": "embedded_knowledge",  # Flag for Proof Layer
        "confidence": 0.85,  # Lower confidence for non-RAG
        "disclaimer": "Response generated from embedded demo knowledge. Production deployment will use full document retrieval."
    }
```

---

#### Task 3: Create RAG Configuration File

**File:** `agents/.vertex_rag_config.json`

```json
{
  "enabled": false,
  "healthy": false,
  "location": "us-west1",
  "project": "ranger-twin-dev",
  "corpora": {
    "nepa_regulations": null,
    "burn_severity": null,
    "timber_salvage": null,
    "trail_infrastructure": null
  },
  "phase": "demo",
  "notes": "RAG disabled for Phase 1 demo to avoid Spanner costs. Set enabled=true and populate corpora IDs for Phase 2."
}
```

---

#### Task 4: Create Re-enablement Script for Phase 2

**File:** `scripts/enable_rag.py`

```python
#!/usr/bin/env python3
"""
Enable Vertex AI RAG for Phase 2 Production

This script:
1. Creates RAG corpora in us-west1
2. Uploads documents from data/rag-documents/
3. Updates .vertex_rag_config.json
4. Validates corpus health

Usage:
    python scripts/enable_rag.py --project ranger-twin-dev --location us-west1
"""

import argparse
import json
import subprocess
from pathlib import Path

# Corpus definitions
CORPORA = [
    {
        "display_name": "ranger-nepa-regulations",
        "description": "NEPA compliance regulations, FSM/FSH, and eCFR references",
        "documents_path": "data/rag-documents/nepa/"
    },
    {
        "display_name": "ranger-burn-severity",
        "description": "MTBS protocols, dNBR analysis, BAER assessment guidance",
        "documents_path": "data/rag-documents/burn/"
    },
    {
        "display_name": "ranger-timber-salvage",
        "description": "FSVeg protocols, cruise methodology, volume estimation",
        "documents_path": "data/rag-documents/timber/"
    },
    {
        "display_name": "ranger-trail-infrastructure",
        "description": "TRACS codes, damage classification, trail standards",
        "documents_path": "data/rag-documents/trails/"
    }
]


def create_corpus(project: str, location: str, corpus_def: dict) -> str:
    """Create a RAG corpus and return its ID."""
    # TODO: Implement using Vertex AI SDK or REST API
    # curl -X POST ...
    pass


def upload_documents(corpus_id: str, documents_path: str):
    """Upload documents to a corpus."""
    # TODO: Implement document upload
    pass


def update_config(corpora_ids: dict):
    """Update .vertex_rag_config.json with new corpus IDs."""
    config_path = Path("agents/.vertex_rag_config.json")
    
    config = {
        "enabled": True,
        "healthy": True,
        "location": "us-west1",
        "project": "ranger-twin-dev",
        "corpora": corpora_ids,
        "phase": "pilot",
        "notes": "RAG enabled for Phase 2 pilot deployment."
    }
    
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Updated {config_path}")


def main():
    parser = argparse.ArgumentParser(description="Enable Vertex AI RAG")
    parser.add_argument("--project", required=True)
    parser.add_argument("--location", default="us-west1")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    
    print(f"🚀 Enabling RAG in {args.location}...")
    
    if args.dry_run:
        print("DRY RUN - No changes will be made")
        return
    
    # TODO: Implement full workflow
    print("⚠️  Script not yet implemented - see TODO comments")


if __name__ == "__main__":
    main()
```

---

#### Task 5: Update Documentation

**File:** `CLAUDE.md` - Update GCP Environment section:

```markdown
## GCP Environment

| Resource | Location | Notes |
|----------|----------|-------|
| Cloud Run Services | us-west1 | Console, Coordinator, MCP-Fixtures |
| TiTiler Service | us-central1 | Geospatial tile server |
| RAG Corpora | N/A (Phase 1) | Disabled to avoid Spanner costs |
| GCS Bucket | us-west1 | ranger-twin-dev-assets |

### RAG Strategy (Phase 1)

Vertex AI RAG Engine auto-provisions Cloud Spanner (~$7/month per region). For demo phase, we use embedded fixtures from `data/templates/` and `data/fixtures/` to avoid standing infrastructure costs.

**Agents are RAG-resilient:** They check corpus availability at startup and gracefully fall back to embedded knowledge. Citations and Proof Layer functionality work in both modes.

**Phase Progression:**
| Phase | RAG Backend | Billing | Data Source |
|-------|-------------|---------|-------------|
| Phase 1 (Demo) | Embedded Fixtures | $0 | `data/templates/`, `data/fixtures/` |
| Phase 2 (Pilot) | Vertex AI Search | Pay-per-query | GCS Bucket |
| Phase 3 (Prod) | Vertex AI RAG | ~$28/month | FS Directives API |

To enable RAG for Phase 2: `python scripts/enable_rag.py --project ranger-twin-dev --location us-west1`
```

**File:** `knowledge/manifest.yaml` - Update to reflect current state:

```yaml
# Update location to us-west1 (was europe-west3)
location: "us-west1"

# Add status field
status: "offline"  # Phase 1 demo - no active corpora

# Update notes
notes: |
  RAG corpora decommissioned 2026-01-02 to eliminate Spanner costs.
  Phase 1 uses embedded fixtures via graceful fallback pattern.
  Re-enable with: python scripts/enable_rag.py
```

---

#### Task 6: Verify Proof Layer Citations in Fallback Mode

Ensure `data/templates/` files include proper citation metadata:

```yaml
# Example: data/templates/nepa/categorical_exclusion.yaml
id: ce-timber-salvage
title: Categorical Exclusion for Timber Salvage
source: "FSH 1909.15, Chapter 30, Section 31.2"
citation_key: "FSH-1909.15-31.2"
content: |
  Timber salvage operations may qualify for CE when...
```

The fallback function must map these to Proof Layer format:

```python
def _format_citation_for_proof_layer(template: dict) -> dict:
    return {
        "source": template.get("source", "Unknown"),
        "citation_key": template.get("citation_key", ""),
        "confidence": 0.85,
        "retrieval_method": "embedded_template"
    }
```

---

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/rag-graceful-fallback

# Commit 1: Shared RAG client
git add agents/_shared/rag_client.py agents/.vertex_rag_config.json
git commit -m "feat(rag): add shared RAG client with health check and fallback pattern"

# Commit 2: Update agent tools
git add agents/*/tools/*rag*.py agents/*/tools/file_search.py
git commit -m "feat(agents): implement graceful RAG fallback in all specialists"

# Commit 3: Re-enablement script
git add scripts/enable_rag.py
git commit -m "feat(scripts): add RAG re-enablement script for Phase 2"

# Commit 4: Documentation
git add CLAUDE.md knowledge/manifest.yaml
git commit -m "docs: update RAG strategy for Phase 1 demo (cost optimization)"

# Push and create PR
git push origin feature/rag-graceful-fallback
```

---

### Verification Checklist

- [ ] `agents/.vertex_rag_config.json` exists with `enabled: false`
- [ ] All 4 agent RAG tools use `is_rag_available()` check
- [ ] Fallback responses include citations for Proof Layer
- [ ] `scripts/enable_rag.py` created (skeleton is fine for now)
- [ ] CLAUDE.md updated with Phase 1 RAG strategy
- [ ] `knowledge/manifest.yaml` updated with `status: offline`
- [ ] Local test: Agent responds to domain query without RAG errors
- [ ] Local test: Proof Layer shows citations from embedded templates

---

### Success Criteria

1. **Zero RAG errors** when running agents locally or in Cloud Run
2. **Citations visible** in Proof Layer even in fallback mode
3. **$0 RAG costs** for Phase 1 demo period
4. **Clear path to Phase 2** via `enable_rag.py` script
5. **Documentation accurate** - no confusion about RAG state

---

### Questions to Answer During Implementation

1. **Where are the 16 federal documents** that were in europe-west3? Check `data/rag-documents/` or GCS bucket for backups.

2. **Do template files exist** in `data/templates/` for all 4 domains (NEPA, burn, timber, trails)?

3. **Is there an existing `template_lookup` skill** we can reuse, or does it need to be created?

Report findings before proceeding with implementation.