# RAG Integration Tests

Integration tests for RANGER's Vertex AI RAG knowledge base system.

## Prerequisites

### 1. Environment Setup

```bash
# Install pytest
pip install pytest pytest-asyncio

# Set environment variables
export GOOGLE_API_KEY=your_api_key_here
export GOOGLE_CLOUD_PROJECT=ranger-twin-dev
export GOOGLE_CLOUD_LOCATION=europe-west3  # Required for RAG
```

### 2. RAG Infrastructure

Ensure the knowledge base infrastructure is set up:

```bash
# 1. Download documents
cd knowledge/scripts
python 1_download_documents.py

# 2. Sync to GCS
python 2_sync_to_gcs.py

# 3. Create corpora
python 3_create_corpora.py

# 4. Import documents
python 4_import_documents.py

# 5. Verify health
python 5_verify_corpora.py
```

All 4 corpora should be HEALTHY before running integration tests.

## Running Tests

### Run All Tests

```bash
# From repository root
pytest tests/integration/test_rag_integration.py -v
```

### Run Specific Agent Tests

```bash
# NEPA Advisor tests only
pytest tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG -v

# Burn Analyst tests only
pytest tests/integration/test_rag_integration.py::TestBurnAnalystRAG -v

# Cruising Assistant tests only
pytest tests/integration/test_rag_integration.py::TestCruisingAssistantRAG -v

# Trail Assessor tests only
pytest tests/integration/test_rag_integration.py::TestTrailAssessorRAG -v
```

### Run Specific Test

```bash
# Test NEPA migration
pytest tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_advisor_vertex_rag_migration -v

# Test relevance scores across all agents
pytest tests/integration/test_rag_integration.py::TestRAGCrossAgent::test_relevance_scores -v
```

### Run with Output

```bash
# Show print statements and detailed output
pytest tests/integration/test_rag_integration.py -v -s

# Show detailed traceback on failures
pytest tests/integration/test_rag_integration.py -v --tb=long
```

## Test Coverage

### Test Classes

| Class | Focus | Tests |
|-------|-------|-------|
| `TestNEPAAdvisorRAG` | NEPA Advisor migration from File Search to Vertex RAG | 6 tests |
| `TestBurnAnalystRAG` | Burn severity knowledge base queries | 3 tests |
| `TestCruisingAssistantRAG` | Timber salvage knowledge base queries | 2 tests |
| `TestTrailAssessorRAG` | Trail infrastructure knowledge base queries | 2 tests |
| `TestRAGCrossAgent` | Cross-agent functionality and relevance | 2 tests |
| `TestRAGErrorHandling` | Error handling and edge cases | 3 tests |
| `TestRAGPerformance` | Query performance and concurrency | 2 tests |

**Total: 20 integration tests**

### Key Test Scenarios

1. **Backward Compatibility**: NEPA Advisor maintains same function signature after migration
2. **Multi-Query**: Each agent handles multiple sequential queries
3. **Parameter Control**: `max_chunks`/`top_k` parameters work correctly
4. **Answer Generation**: Gemini generates answers from retrieved contexts
5. **Relevance Scoring**: Top results have reasonable relevance scores (> 0.3)
6. **Health Checks**: Corpus health verification works
7. **Error Handling**: Graceful handling of empty queries, long queries, missing configs
8. **Performance**: Queries complete within 30 seconds
9. **Concurrency**: Multiple agents can query simultaneously

## Expected Results

### Successful Test Run

```bash
$ pytest tests/integration/test_rag_integration.py -v

tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_advisor_vertex_rag_migration PASSED
tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_multiple_queries PASSED
tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_max_chunks_parameter PASSED
tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_store_info PASSED
tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_health_check PASSED
tests/integration/test_rag_integration.py::TestBurnAnalystRAG::test_burn_analyst_rag_query PASSED
tests/integration/test_rag_integration.py::TestBurnAnalystRAG::test_burn_analyst_multiple_queries PASSED
tests/integration/test_rag_integration.py::TestBurnAnalystRAG::test_burn_analyst_no_answer_mode PASSED
tests/integration/test_rag_integration.py::TestCruisingAssistantRAG::test_cruising_assistant_rag_query PASSED
tests/integration/test_rag_integration.py::TestCruisingAssistantRAG::test_cruising_assistant_multiple_queries PASSED
tests/integration/test_rag_integration.py::TestTrailAssessorRAG::test_trail_assessor_rag_query PASSED
tests/integration/test_rag_integration.py::TestTrailAssessorRAG::test_trail_assessor_multiple_queries PASSED
tests/integration/test_rag_integration.py::TestRAGCrossAgent::test_all_agents_have_rag_tools PASSED
tests/integration/test_rag_integration.py::TestRAGCrossAgent::test_relevance_scores PASSED

==================== 14 passed in 45.2s ====================
```

## Troubleshooting

### Test Failures

**Problem**: `FileNotFoundError: Vertex RAG corpus not configured`
- **Fix**: Run `python knowledge/scripts/3_create_corpora.py`
- **Verify**: Check that `.vertex_rag_config.json` exists in each agent's `data/` directory

**Problem**: `Query failed: No contexts retrieved`
- **Fix**: Run `python knowledge/scripts/4_import_documents.py`
- **Verify**: Run `python knowledge/scripts/5_verify_corpora.py` and ensure all corpora are HEALTHY

**Problem**: `ValueError: GOOGLE_API_KEY environment variable not set`
- **Fix**: `export GOOGLE_API_KEY=your_key_here`
- **Verify**: `echo $GOOGLE_API_KEY`

**Problem**: `Top relevance too low`
- **Fix**: Documents may not be imported correctly. Re-run import:
  ```bash
  python knowledge/scripts/4_import_documents.py --corpus <corpus_name>
  ```
- **Verify**: Check document count in GCS bucket: `gsutil ls gs://ranger-knowledge-base-eu/<corpus>/`

**Problem**: `Query took too long: XX.XXs`
- **Fix**: This may be a cold start issue. Retry the test.
- **Note**: First query after corpus creation can be slower due to initialization

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'rag_query'`
- **Fix**: Tests manipulate `sys.path` to import agent modules. Run from repository root:
  ```bash
  cd /Users/jvalenzano/Projects/ranger-twin
  pytest tests/integration/test_rag_integration.py -v
  ```

**Problem**: `ModuleNotFoundError: No module named 'vertexai'`
- **Fix**: Install dependencies:
  ```bash
  pip install google-cloud-aiplatform google-genai
  ```

## Continuous Integration

To run these tests in CI:

```yaml
# .github/workflows/test-rag.yml
name: RAG Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install pytest google-cloud-aiplatform google-genai
      - name: Run RAG tests
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          GOOGLE_CLOUD_PROJECT: ranger-twin-dev
        run: |
          pytest tests/integration/test_rag_integration.py -v
```

## Test Data

Test queries are defined in fixtures:

- **NEPA**: CE criteria, EA vs EIS, acreage thresholds
- **Burn Severity**: dNBR thresholds, BAER protocols, debris flow risk
- **Timber Salvage**: Cruise methodology, deterioration rates, appraisal
- **Trail Infrastructure**: FSTAG standards, damage classification, TRACS codes

These queries are designed to validate corpus coverage and relevance scoring.

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **BAER** | Burned Area Emergency Response | USFS post-fire emergency program |
| **CE** | Categorical Exclusion | NEPA category for minimal-impact actions |
| **CI** | Continuous Integration | Automated code testing and build |
| **dNBR** | Differenced Normalized Burn Ratio | Burn severity index from satellite imagery |
| **EA** | Environmental Assessment | NEPA environmental review document |
| **EIS** | Environmental Impact Statement | Full NEPA environmental analysis |
| **FSTAG** | Forest Service Trail Accessibility Guidelines | Trail accessibility standards |
| **GCS** | Google Cloud Storage | Cloud object storage service |
| **NEPA** | National Environmental Policy Act | Federal environmental assessment law |
| **RAG** | Retrieval-Augmented Generation | AI pattern combining retrieval + LLM |
| **TRACS** | Trail Assessment and Condition Survey | USFS trail inventory system |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
