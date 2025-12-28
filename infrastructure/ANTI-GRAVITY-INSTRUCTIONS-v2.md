# Anti-Gravity: RANGER Development Environment Setup

**Context:** Jason wants to set up a proper local development environment for RANGER that includes:
- GCP project (`ranger-twin-dev`) for Gemini API access
- Local Postgres with PostGIS for spatial data
- ADK web server for multi-agent orchestration
- Command Console frontend with real NIFC API data
- Clean Docker environment

**Important Files Already Configured:**
- `apps/command-console/.env.local` — Already has MapTiler, Gemini, and FIRMS API keys
- `agents/coordinator/agent.py` — ADK coordinator is ready
- `infrastructure/docker/init-db.sql` — Database schema is ready

---

## Phase 0: Docker Cleanup (Optional but Recommended)

Jason has 38 orphaned containers from previous work. Clean them up to free ~900MB RAM:

```bash
# Stop all running containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove unused images (optional, frees disk space)
docker image prune -a

# Verify clean state
docker ps -a
```

---

## Phase 1: GCP Project Setup (gcloud CLI)

### 1.1 Verify gcloud is authenticated

```bash
# Check current auth status
gcloud auth list

# If not authenticated, run:
gcloud auth login

# Set up application default credentials (needed for ADK)
gcloud auth application-default login
```

### 1.2 Create the project

```bash
# Create new project
gcloud projects create ranger-twin-dev --name="RANGER Twin Dev"

# If that ID is taken, use:
gcloud projects create ranger-twin-dev-$(date +%s) --name="RANGER Twin Dev"
# Note the actual project ID that gets created

# Set as active project
gcloud config set project ranger-twin-dev
```

### 1.3 Link billing (required for APIs)

```bash
# List your billing accounts
gcloud billing accounts list

# Link billing (replace BILLING_ACCOUNT_ID with your actual ID)
gcloud billing projects link ranger-twin-dev --billing-account=BILLING_ACCOUNT_ID
```

If you only have one billing account, you can also do this in the Console UI:
https://console.cloud.google.com/billing/linkedaccount?project=ranger-twin-dev

### 1.4 Enable required APIs

```bash
# Enable all required APIs
gcloud services enable \
    aiplatform.googleapis.com \
    generativelanguage.googleapis.com \
    secretmanager.googleapis.com \
    --project=ranger-twin-dev

# Verify they're enabled
gcloud services list --enabled --project=ranger-twin-dev | grep -E "(aiplatform|generative|secret)"
```

### 1.5 Create a new API key for this project (optional)

Your existing Gemini API key in `.env.local` will continue to work. However, if you want a key tied to `ranger-twin-dev` for cleaner billing:

```bash
# Open AI Studio to create a key for the new project
open "https://aistudio.google.com/app/apikey"
```

Select `ranger-twin-dev` from the project dropdown and create a new key. Then update:
- `apps/command-console/.env.local` → `VITE_GEMINI_API_KEY`
- `agents/coordinator/.env` → `GOOGLE_API_KEY`

---

## Phase 2: Local Database Setup

### 2.1 Start Postgres with PostGIS

```bash
# Navigate to project root
cd /Users/jvalenzano/Projects/ranger-twin

# Run Postgres container with PostGIS
docker run -d \
    --name ranger-postgres \
    -e POSTGRES_USER=cedar_creek \
    -e POSTGRES_PASSWORD=localdev \
    -e POSTGRES_DB=cedar_creek_twin \
    -p 5432:5432 \
    -v ranger_postgres_data:/var/lib/postgresql/data \
    -v $(pwd)/infrastructure/docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql \
    postgis/postgis:16-3.4

# Verify it's running
docker ps | grep ranger-postgres

# Check logs (wait for "database system is ready to accept connections")
docker logs -f ranger-postgres
```

Press `Ctrl+C` to exit logs once you see it's ready.

### 2.2 Verify database initialized correctly

```bash
# Connect to the database
docker exec -it ranger-postgres psql -U cedar_creek -d cedar_creek_twin

# Once in psql, run:
\dt spatial.*
# Should show: fire_events, burn_severity, trails, damage_points, timber_plots

\dt agents.*
# Should show: queries

\dt documents.*
# Should show: chunks

# Check Cedar Creek seed data
SELECT * FROM spatial.fire_events;

# Exit psql
\q
```

---

## Phase 3: Agent Environment Setup

### 3.1 Create/verify Python virtual environment

```bash
cd /Users/jvalenzano/Projects/ranger-twin

# If venv doesn't exist or you want fresh:
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify ADK is installed
adk --version
```

### 3.2 Configure agent environment

```bash
# Create coordinator .env if it doesn't exist
cat > agents/coordinator/.env << 'EOF'
# Google AI API Key
GOOGLE_API_KEY=AIzaSyD4G7fV8UaNQp1Vs317R6NqCFQSuPAEnbI

# Database connection (for future use)
DATABASE_URL=postgresql://cedar_creek:localdev@localhost:5432/cedar_creek_twin
EOF
```

### 3.3 Test ADK agent locally

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents/coordinator

# Quick test - run agent directly
python agent.py
# Should output: Coordinator Agent 'coordinator' initialized...

# Interactive CLI test
adk run agent.py
# Type a test query like: "What fires need attention first?"
# Type 'exit' to quit
```

### 3.4 Start ADK Web Server (for multi-agent UI)

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents/coordinator

# Start the ADK web interface
adk web agent.py --port 8000

# This provides:
# - http://localhost:8000 — ADK web UI for testing
# - API endpoint that the Command Console can connect to
```

Keep this terminal running. Open a new terminal for the next phase.

---

## Phase 4: Command Console Setup

### 4.1 Install frontend dependencies

```bash
cd /Users/jvalenzano/Projects/ranger-twin/apps/command-console

# Install with pnpm (preferred) or npm
pnpm install
# or: npm install
```

### 4.2 Update environment for real NIFC data

Your `.env.local` already has the keys. Verify these settings:

```bash
# Check current .env.local
cat .env.local
```

If `VITE_USE_REAL_FIRE_DATA` is not present, add it:

```bash
echo "VITE_USE_REAL_FIRE_DATA=true" >> .env.local
```

### 4.3 Start the development server

```bash
cd /Users/jvalenzano/Projects/ranger-twin/apps/command-console

# Start Vite dev server
pnpm dev
# or: npm run dev
```

This will start on **http://localhost:3000** (per your vite.config.ts).

---

## Phase 5: Verify Everything Works

### 5.1 Check all services are running

Open three terminal windows/tabs:

| Terminal | Service | Command | URL |
|----------|---------|---------|-----|
| 1 | Postgres | `docker logs -f ranger-postgres` | localhost:5432 |
| 2 | ADK Coordinator | `adk web agent.py --port 8000` | localhost:8000 |
| 3 | Command Console | `pnpm dev` | localhost:3000 |

### 5.2 Test the Command Console

1. Open http://localhost:3000
2. You should see the Mission Control interface
3. The map should load (MapTiler key is configured)
4. Fire data should appear (NIFC API + FIRMS)

### 5.3 Test the ADK Coordinator

1. Open http://localhost:8000 (ADK's built-in web UI)
2. Try a query: "Which fires need immediate attention?"
3. You should see the `portfolio_triage` tool being called

### 5.4 Test Console → Agent Integration

1. In the Command Console, open the chat interface
2. Ask: "What fires are in critical condition?"
3. The request should proxy to localhost:8000 (ADK) and return a response

---

## Troubleshooting

### "Cannot connect to Postgres"
```bash
# Check if container is running
docker ps | grep ranger-postgres

# If not running, check why it stopped
docker logs ranger-postgres

# Restart it
docker start ranger-postgres
```

### "ADK command not found"
```bash
# Make sure venv is activated
source /Users/jvalenzano/Projects/ranger-twin/venv/bin/activate

# Reinstall ADK
pip install google-adk
```

### "Port 3000 already in use"
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 <PID>
```

### "Port 8000 already in use"
```bash
# Find what's using port 8000
lsof -i :8000

# Or use a different port for ADK
adk web agent.py --port 8001

# Then update vite.config.ts proxy target to 8001
```

### "Gemini API errors"
```bash
# Verify API key is set
echo $GOOGLE_API_KEY

# Test API directly
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

---

## Quick Reference: Daily Development Workflow

After initial setup, your daily workflow is:

```bash
# Terminal 1: Start Postgres (if not already running)
docker start ranger-postgres

# Terminal 2: Start ADK (from project root)
cd /Users/jvalenzano/Projects/ranger-twin
source venv/bin/activate
cd agents/coordinator
adk web agent.py --port 8000

# Terminal 3: Start Console (from project root)
cd /Users/jvalenzano/Projects/ranger-twin/apps/command-console
pnpm dev
```

Then open:
- http://localhost:3000 — Command Console
- http://localhost:8000 — ADK Web UI (for agent debugging)

---

## Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `agents/coordinator/.env` | Create/Update | Add GOOGLE_API_KEY |
| `apps/command-console/.env.local` | Update | Add VITE_USE_REAL_FIRE_DATA=true |

## GCP Resources Created

| Resource | Value | Purpose |
|----------|-------|---------|
| **Project ID** | `ranger-twin-dev` | Development environment |
| **Project Number** | `1058891520442` | GCP internal reference |
| API | Vertex AI | LLM calls (future) |
| API | Generative Language | Gemini API calls |
| API | Secret Manager | API key storage (future) |
| **Billing** | ✅ Enabled | December 26, 2025 |

---

## Verified Agent Status (December 26, 2025)

All 5 agents tested and operational:

| Agent | Model | Status | Test Result |
|-------|-------|--------|-------------|
| coordinator | gemini-2.0-flash | ✅ Working | Responds, asks for fire data |
| burn_analyst | gemini-2.0-flash | ✅ Working | Tool call successful, 92% confidence |
| trail_assessor | gemini-2.0-flash | ✅ Working | Tool call successful, 88% confidence |
| cruising_assistant | gemini-2.0-flash | ✅ Working | Responds, asks for plot data |
| nepa_advisor | gemini-2.5-flash | ✅ Working | Responds with clarifying questions |

---

*Generated: December 26, 2025*
*Updated: December 26, 2025 (billing enabled, agents verified)*
*For: Anti-Gravity IDE Session*
