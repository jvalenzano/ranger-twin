# RAG-02 Diagnosis: FSH 1909.15 CE Checklist Extraction

**Test**: RAG-02  
**Query**: "Show me the Categorical Exclusion checklist from FSH 1909.15"  
**Response**: "I am sorry, I am unable to extract the checklist at this time."  
**Status**: FAILED

---

## Root Cause Analysis

### Document Inventory

The FSH 1909.15 document exists:

| File | Location | Size | Format |
|------|----------|------|--------|
| FSH-1909.15-Ch30-Categorical-Exclusions.pdf | `agents/nepa_advisor/data/fsh/` | 163KB | PDF ✓ |
| FSH-1909.15-Ch10-Environmental-Analysis.docx | `agents/nepa_advisor/data/fsh/` | 465KB | DOCX |
| FSH-1909.15-Ch20-EIS-Documents.doc | `agents/nepa_advisor/data/fsh/` | 173KB | DOC |
| FSH-1909.15-Ch40-Environmental-Assessments.doc | `agents/nepa_advisor/data/fsh/` | 69KB | DOC |

The Chapter 30 (Categorical Exclusions) PDF exists and is correctly formatted.

### Likely Failure Points

1. **PDF Extraction Skill Issue**: The `pdf-extraction` skill may have encountered a parsing error on this specific document
2. **RAG Corpus Not Indexed**: The document may exist but not be indexed in the RAG corpus
3. **Query Mismatch**: The query asked for "checklist" but the document may be indexed under different terminology

### Evidence

From the test results:
- `tool_calls_count: 1` — A tool was invoked
- Response: Generic error message, not "document not found"
- This suggests extraction was attempted but failed during processing

### Recommended Fixes

1. **Validate PDF parsing**:
   ```bash
   cd agents/nepa_advisor/skills/pdf-extraction
   python scripts/extract_pdf.py --file ../data/fsh/FSH-1909.15-Ch30-Categorical-Exclusions.pdf
   ```

2. **Re-index corpus** if using managed RAG:
   ```bash
   # Refresh the NEPA corpus with updated documents
   ```

3. **Fallback**: The `documentation` skill has CE checklist data hardcoded in `templates.json` — consider adding graceful fallback

---

## Comparison with Passing Test

**RAG-01** (FSM 1950 emergency actions) **PASSED** because:
- FSM documents may be text-based or better-parsed PDFs
- The skill successfully retrieved "FSM 1950.41a" and "FSM 1950.41c"

The difference suggests document-specific parsing issues rather than systemic RAG failure.

---

## Status

- [x] Document inventory verified
- [x] Root cause identified: Likely PDF extraction failure on Ch30
- [ ] Manual PDF extraction test pending
- [ ] Fix pending
