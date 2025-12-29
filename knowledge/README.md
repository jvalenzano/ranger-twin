# RANGER Knowledge Base

This directory manages the document corpus for RANGER's multi-agent RAG system using Vertex AI RAG Engine.

## Architecture

Documents flow through this pipeline:

```
manifest.yaml → 1_download → local/ → 2_sync → GCS → 3_create_corpora → 4_import → Vertex AI RAG
```

## Quick Start

```bash
# 1. Download documents (some require manual download)
cd knowledge/scripts
python 1_download_documents.py

# 2. Manually download any flagged documents to knowledge/local/{corpus}/

# 3. Sync to GCS
python 2_sync_to_gcs.py

# 4. Create Vertex AI RAG corpora
python 3_create_corpora.py

# 5. Import documents into corpora
python 4_import_documents.py

# 6. Verify corpus health
python 5_verify_corpora.py
```

## Corpora

| Corpus | Primary Agent | GCS Bucket | Description |
|--------|--------------|------------|-------------|
| **nepa** | NEPA Advisor | `ranger-twin-knowledge-nepa` | 36 CFR 220, FSH 1909.15, CEQ guidance (8 docs) |
| **burn_severity** | Burn Analyst | `ranger-twin-knowledge-burn-severity` | BAER, MTBS, soil severity, debris flow (13 docs) |
| **timber_salvage** | Cruising Assistant | `ranger-twin-knowledge-timber-salvage` | FSH 2409.12, appraisal, deterioration (9 docs) |
| **trail_infrastructure** | Trail Assessor | `ranger-twin-knowledge-trail-infrastructure` | FSTAG, TMOs, accessibility (5 docs) |

**Total:** 35 documents across 4 corpora

## Document Tiers

- **Tier 1 (Essential):** 14 documents - Required for baseline agent performance
- **Tier 2 (High Value):** 12 documents - Improves complex scenario handling
- **Tier 3 (Nice-to-Have):** 9 documents - Reference for edge cases

## Adding New Documents

1. Add entry to `manifest.yaml` under appropriate corpus
2. If automated download supported, run `python 1_download_documents.py`
3. If manual download required, place PDF in `knowledge/local/{corpus}/`
4. Run `python 2_sync_to_gcs.py`
5. Run `python 4_import_documents.py --corpus {corpus_name}`
6. Verify with `python 5_verify_corpora.py`

## Download Methods

- **direct**: Direct PDF download via requests
- **fs_directive**: FS Handbook/Manual (.doc/.docx) - requires LibreOffice conversion
- **ecfr**: eCFR portal - requires manual PDF export
- **manual**: Manual download required - see notes in manifest

## Prerequisites

- **Python 3.10+** with dependencies: `google-cloud-aiplatform`, `google-cloud-storage`, `pyyaml`, `requests`
- **LibreOffice** (for .doc→PDF conversion): `brew install libreoffice` (macOS)
- **GCP Authentication**: `gcloud auth application-default login`
- **GCP Project**: `ranger-twin-dev` in `us-east4`

## Troubleshooting

### Download Failures

**Problem:** `soffice: command not found`
- **Fix:** Install LibreOffice: `brew install libreoffice` (macOS) or `apt-get install libreoffice` (Linux)

**Problem:** HTTP 404 on source URL
- **Fix:** Check `manifest.yaml` for updated URL, or manually download and place in `knowledge/local/{corpus}/`

### GCS Sync Failures

**Problem:** `Permission denied` when creating buckets
- **Fix:** Verify GCP authentication: `gcloud auth application-default login`
- **Fix:** Check IAM roles include `roles/storage.admin`

**Problem:** `gsutil: command not found`
- **Fix:** Install gcloud SDK: https://cloud.google.com/sdk/docs/install

### Corpus Creation Failures

**Problem:** `429 Too Many Requests` when creating corpora
- **Fix:** Corpora are created sequentially, but check GCP quota limits
- **Fix:** Wait a few minutes and retry

**Problem:** `Corpus already exists`
- **Fix:** This is expected - script will skip creation and save existing corpus ID

### Document Import Failures

**Problem:** `Rate limit exceeded` during import
- **Fix:** Reduce `max_embedding_requests_per_min` in `4_import_documents.py` (default: 800)
- **Fix:** Import per corpus rather than all at once

**Problem:** `File not found in GCS`
- **Fix:** Verify sync completed: `gsutil ls gs://ranger-twin-knowledge-{corpus}/`
- **Fix:** Re-run `python 2_sync_to_gcs.py`

## File Structure

```
knowledge/
├── manifest.yaml          # Document registry (35 docs)
├── README.md             # This file
├── local/                # Downloaded PDFs (gitignored)
│   ├── nepa/
│   ├── burn_severity/
│   ├── timber_salvage/
│   └── trail_infrastructure/
└── scripts/
    ├── 1_download_documents.py
    ├── 2_sync_to_gcs.py
    ├── 3_create_corpora.py
    ├── 4_import_documents.py
    └── 5_verify_corpora.py
```

## Configuration

- **GCP Project:** `ranger-twin-dev`
- **GCP Location:** `us-east4`
- **Embedding Model:** `text-embedding-005`
- **Chunking:** 512 tokens per chunk, 100 token overlap

## Validation

Run the verification script to check corpus health:

```bash
python 5_verify_corpora.py
```

Expected output:
- All 4 corpora show `ACTIVE` status
- Test queries return relevant results
- Document counts match manifest

## References

- **Document Framework:** `docs/research/RANGER_doc_framework.md`
- **Implementation Plan:** `.claude/plans/witty-tinkering-knuth.md`
- **Vertex AI RAG Docs:** https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/rag-api
