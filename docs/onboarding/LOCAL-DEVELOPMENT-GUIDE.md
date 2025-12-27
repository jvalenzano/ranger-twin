# 🛠️ RANGER Local Development & Testing Guide

This guide provides comprehensive instructions for developers to set up, run, and validate the RANGER platform on a local machine.

---

## 🏗️ Essential Tech Stack

Before you begin, ensure you have the following installed:

*   **Node.js**: `20.x` or higher
*   **pnpm**: `8.12.x` or higher (Workspace-enabled)
*   **Python**: `3.11` or higher
*   **Docker & Docker Compose**: For multi-agent orchestration
*   **GCP CLI**: For access to Vertex AI (Gemini reasoning)

---

## 🚀 Getting Started

### 1. Repository Setup
Clone the repository and install frontend dependencies:
```bash
pnpm install
```

### 2. Environment Configuration
Copy the environment template and fill in your secrets (GCP project ID, etc.):
```bash
cp .env.example .env
```

### 3. Python Service Setup
Initialize the shared packages in editable mode to ensure agent services can resolve dependencies:
```bash
pip install -e packages/twin-core
pip install -e packages/agent-common
```

---

## 🖥️ Running the Application

### Option A: Full Multi-Agent Stack (Docker) - Recommended
Runs the entire ecosystem including Postgres (PostGIS), Redis, the API Gateway, and all 5 AI Agents.
```bash
docker-compose up -d
```
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **API Specs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Frontend Only (Simulated Data)
Best for UI/UX work and Onboarding Tour testing without needing the full backend.
```bash
# Start Command Console (Desktop)
pnpm console:dev

# Start Field Companion (Mobile)
pnpm field:dev
```

### Option C: Individual Service Development
If you are working on a specific agent (e.g., Burn Analyst):
```bash
cd services/agents/burn-analyst
uvicorn burn_analyst.main:app --reload --port 8001
```

---

## ✅ Verification Procedures

### 1. Manual Validation: The Onboarding "Cascade"
Verifying the onboarding tour is critical to ensure the multi-agent narrative remains coherent.
1.  Open **Command Console** ([http://localhost:5173](http://localhost:5173)).
2.  Click **"Run Demo"** in the top header.
3.  **Validate Step 3 (Trail Damage):** Ensure the map switches to Terrain mode and displays the trail damage points (Red: Bridges, Yellow: Hazard Trees, Amber: Erosion).
4.  **Validate Sidebar Sync:** As you progress through the tour, ensure the left lifecycle rail automatically updates (IMPACT → DAMAGE → TIMBER → COMPLIANCE).
5.  **Validate Step 7:** Ensure the narrative card is positioned in the top-right and shows the "Finish Tour" CTA.

### 2. Automated Tests
Run unified tests across the workspace:
```bash
# Run all tests (Frontend & Backend)
pnpm test

# Frontend TypeScript Validation
pnpm -r run typecheck

# Backend Python Tests
pytest
```

---

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **API Connectivity** | Ensure the API Gateway is running on port 8000. Verify with `curl http://localhost:8000/health`. |
| **Docker Build Failure** | Check if Docker Desktop is running. Try `docker-compose build --no-cache`. |
| **Missing Fixtures** | Check `apps/command-console/public/fixtures/`. These must exist for the simulated tour. |
| **Python Imports** | Ensure you ran the `pip install -e` commands for `twin-core` and `agent-common`. |

---

## 📖 Related Documentation
*   [README.md](../../README.md) - Project Overview
*   [DEMO-TOUR-WALKTHROUGH.md](../../docs/implementation/DEMO-TOUR-WALKTHROUGH.md) - Deep dive into tour mechanics
*   [ADK-OPERATIONS-RUNBOOK.md](../../docs/runbooks/ADK-OPERATIONS-RUNBOOK.md) - **Read before touching agents**
*   [BRAND-ARCHITECTURE.md](../../docs/brand/BRAND-ARCHITECTURE.md) - Naming and style guidelines
