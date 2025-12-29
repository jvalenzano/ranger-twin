# Environment Setup & Authentication Troubleshooting

> **Target Audience:** Developers new to the RANGER project who encounter authentication or environment errors.

## The Problem

RANGER uses multiple Google Cloud services that require different authentication methods. When running tests or scripts outside the ADK web interface, you may encounter errors like:

```
GOOGLE_API_KEY environment variable not set
```

```
401 UNAUTHENTICATED. API keys are not supported by this API. Expected OAuth2 access token...
```

```
Could not automatically determine credentials
```

This guide explains why these errors occur and how to resolve them.

---

## Understanding RANGER's Authentication Model

RANGER uses **two different Google authentication methods** depending on the service:

| Service | Auth Method | How to Configure |
|---------|-------------|------------------|
| **ADK Agents** (Gemini via ADK) | Application Default Credentials (ADC) | `gcloud auth application-default login` |
| **Vertex AI RAG** (corpus queries) | Application Default Credentials (ADC) | `gcloud auth application-default login` |
| **Vertex AI Generation** | Application Default Credentials (ADC) | `gcloud auth application-default login` |
| **Frontend Chat** (direct Gemini API) | API Key | `GOOGLE_API_KEY` in `.env` |

**Key insight:** Most backend services use ADC (OAuth2), not API keys. The `GOOGLE_API_KEY` is primarily for the frontend React app.

---

## Quick Fix: Set Up ADC

For most development work, you need Application Default Credentials:

```bash
# One-time setup (opens browser for OAuth)
gcloud auth application-default login

# Set your project
gcloud config set project ranger-twin-dev

# Verify it worked
gcloud auth application-default print-access-token
```

This creates credentials at `~/.config/gcloud/application_default_credentials.json` that all Google Cloud SDKs automatically discover.

---

## Environment Variables Reference

### Required for All Development

```bash
# GCP Project configuration
export GOOGLE_CLOUD_PROJECT=ranger-twin-dev
export GOOGLE_CLOUD_LOCATION=europe-west3
```

### Required for Frontend Development

```bash
# Only needed for React app's direct Gemini calls
export VITE_GEMINI_API_KEY=AIza...
```

### Optional (ADC handles these automatically)

```bash
# These are NOT required if ADC is configured
# GOOGLE_API_KEY        <- Only for frontend
# GOOGLE_APPLICATION_CREDENTIALS  <- Only if using service account JSON
```

---

## Common Error Messages & Solutions

### Error: "GOOGLE_API_KEY environment variable not set"

**When:** Running RAG query scripts directly (not via ADK)

**Why:** The script expects an API key but should use ADC instead.

**Solution:** This is a code bug (see Known Issues below). As a workaround:
```bash
# Ensure ADC is configured
gcloud auth application-default login
```

### Error: "401 UNAUTHENTICATED. API keys are not supported by this API"

**When:** Calling Vertex AI services with an API key

**Why:** Vertex AI requires OAuth2/ADC, not consumer API keys.

**Solution:** Don't set `GOOGLE_API_KEY` for backend work. Use ADC:
```bash
gcloud auth application-default login
```

### Error: "Could not automatically determine credentials"

**When:** Any Google Cloud SDK call

**Why:** No ADC configured and no service account JSON found.

**Solution:**
```bash
# For local development
gcloud auth application-default login

# OR for production/CI (using service account)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Error: "Permission denied" or "403 Forbidden"

**When:** Accessing Vertex AI corpora or other GCP resources

**Why:** Your account doesn't have the required IAM roles.

**Solution:** Ask your GCP admin to grant:
- `roles/aiplatform.user` (for Vertex AI)
- `roles/storage.objectViewer` (for corpus documents)

---

## Testing Your Setup

### 1. Verify ADC is configured

```bash
gcloud auth application-default print-access-token
# Should print a long token string, not an error
```

### 2. Verify project is set

```bash
echo $GOOGLE_CLOUD_PROJECT
# Should print: ranger-twin-dev
```

### 3. Test Vertex AI access

```bash
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate

python -c "
import vertexai
vertexai.init(project='ranger-twin-dev', location='europe-west3')
print('Vertex AI initialized successfully')
"
```

### 4. Test RAG corpus access

```bash
python -c "
from vertexai.preview import rag
print('RAG module loaded successfully')
"
```

---

## ADK Web Interface vs. Direct Python

The **ADK web interface** (`adk web`) automatically loads `.env` files from the agent directory. This is why things "just work" in the ADK UI but fail in direct Python scripts.

**When running scripts directly**, you must either:

1. **Source the .env file:**
   ```bash
   set -a && source agents/nepa_advisor/.env && set +a
   ```

2. **Export variables manually:**
   ```bash
   export GOOGLE_CLOUD_PROJECT=ranger-twin-dev
   export GOOGLE_CLOUD_LOCATION=europe-west3
   ```

3. **Use a shell wrapper** (recommended for repeated testing):
   ```bash
   # Add to your ~/.zshrc or ~/.bashrc
   alias ranger-env='cd ~/Projects/ranger-twin && source .venv/bin/activate && set -a && source .env && set +a'
   ```

---

## Known Issues

### RAG Query Generation Auth Mismatch

**Status:** Bug identified, fix pending

**Files affected:**
- `agents/nepa_advisor/file_search.py`
- `agents/burn_analyst/rag_query.py`
- `agents/trail_assessor/rag_query.py`
- `agents/cruising_assistant/rag_query.py`

**Issue:** The `_get_genai_client()` function uses `genai.Client(api_key=...)` but should use Vertex AI's native `GenerativeModel` with ADC.

**Workaround:** RAG retrieval works; only the answer generation fails. The contexts and citations are still returned correctly.

**Tracking:** See `docs/adr/ADR-010-vertex-rag-migration.md` for migration status.

---

## Production vs. Development Auth

| Environment | Auth Method | Configuration |
|-------------|-------------|---------------|
| **Local development** | ADC (user credentials) | `gcloud auth application-default login` |
| **Cloud Run** | ADC (service account) | Automatic via GCP metadata server |
| **CI/CD** | Service account JSON | `GOOGLE_APPLICATION_CREDENTIALS` env var |

In production (Cloud Run), authentication is automatic—the service runs with an attached service account that has the necessary IAM roles.

---

## Getting Help

1. Check this guide first
2. Search existing issues in the repo
3. Ask in the team Slack channel
4. File an issue with:
   - The exact error message
   - The command you ran
   - Output of `gcloud auth list` and `echo $GOOGLE_CLOUD_PROJECT`

---

*Last updated: December 28, 2025*
