# RANGER Frontend - Cloud Run Deployment

This directory contains the RANGER Command Console, a React-based tactical interface for post-fire forest recovery operations.

## Quick Start (Local Development)

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Cloud Run Deployment (Phase 0)

The frontend can be deployed to Cloud Run with Basic Auth for demo access control.

### Prerequisites

1. **gcloud CLI** installed and authenticated
2. **Docker** (for local testing only)
3. Access to `ranger-twin-dev` GCP project

### Deploy to Cloud Run

```bash
# From project root
./scripts/deploy-frontend.sh

# Or with a custom password
./scripts/deploy-frontend.sh --password "YourSecurePassword"

# Dry run (see what would be deployed)
./scripts/deploy-frontend.sh --dry-run
```

### Test Locally First

```bash
# Build and run container locally
./scripts/test-frontend-local.sh

# Access at http://localhost:8080
# Username: ranger
# Password: TestLocal123
```

### What Gets Deployed

- **Docker Image**: nginx serving the React build
- **Basic Auth**: Username `ranger`, password set at deploy time
- **Health Check**: `/health` endpoint (no auth required)
- **Cloud Run Config**: 256MB RAM, 1 CPU, 0-3 instances

### Demo Access

After deployment, share these credentials with your team:

```
URL: https://ranger-console-xxx.us-central1.run.app
Username: ranger
Password: [set during deployment]
```

### Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: Node.js → nginx |
| `nginx.conf` | SPA routing, Basic Auth, security headers |
| `.dockerignore` | Excludes node_modules, .env files, etc. |

### Architecture

```
Browser
  │
  ▼ HTTPS + Basic Auth
┌─────────────────────┐
│  Cloud Run          │
│  (ranger-console)   │
│  nginx:alpine       │
└─────────┬───────────┘
          │ API calls
          ▼
┌─────────────────────┐
│  Cloud Run          │
│ (ranger-coordinator)│
│  FastAPI + ADK      │
└─────────────────────┘
```

### Environment Variables (Build Time)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ADK_URL` | Backend API URL | Cloud Run coordinator URL |
| `VITE_MAPTILER_API_KEY` | MapTiler API key | From .env.local |
| `DEMO_PASSWORD` | Basic Auth password | `changeme` |

### Upgrading to Phase 1 (Google Auth)

When ready for real authentication:

1. Enable Identity Platform in GCP
2. Add Firebase Auth SDK to React app
3. Remove Basic Auth from nginx.conf
4. Add token validation to backend

The Dockerfile and Cloud Run setup stay the same.
