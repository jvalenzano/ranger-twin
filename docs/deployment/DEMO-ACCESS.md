# RANGER Demo Access

> **Last Updated:** December 27, 2025

## URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://ranger-console-fqd6rb7jba-uc.a.run.app |
| **Backend** | https://ranger-coordinator-fqd6rb7jba-uc.a.run.app |

## Demo Credentials

- **Username:** `ranger`
- **Password:** `RangerDemo2025!`

## Quick Test

1. Open the frontend URL
2. Enter credentials when prompted
3. In the chat, try: "Give me a recovery briefing for Cedar Creek"

## Health Check

```bash
# Frontend
curl -u ranger:RangerDemo2025! https://ranger-console-fqd6rb7jba-uc.a.run.app/health

# Backend
curl https://ranger-coordinator-fqd6rb7jba-uc.a.run.app/health
```

## Deployment Details

| Property | Value |
|----------|-------|
| **Date** | December 27, 2025 |
| **Platform** | Cloud Run (Google Cloud Platform) |
| **Region** | us-central1 |
| **Project** | ranger-twin-dev |

## Architecture

| Component | Technology |
|-----------|------------|
| Frontend | React 18.3 + Vite 6.0 + Tailwind CSS |
| Authentication | HTTP Basic Auth |
| Backend | Google ADK + Gemini 2.0 Flash |
| Data | Fixture-First (real federal data bundled) |
| Map | MapLibre GL + MapTiler |

## What's Deployed

Per our architecture decisions:

- **ADR-008 (AgentTool Pattern):** All agents in single `ranger-coordinator` service
- **ADR-009 (Fixture-First):** Real MTBS/IRWIN/TRACS data bundled in Docker images
- **ADR-006 (Google-Only):** Gemini 2.0 Flash via Vertex AI

## Known Limitations (Demo Phase)

- Sessions are in-memory (lost on container restart)
- Only Cedar Creek and Bootleg fires have fixture data
- No persistent user authentication (Basic Auth only)

## Redeployment

```bash
# Frontend
cd /Users/jvalenzano/Projects/ranger-twin
./scripts/deploy-frontend.sh

# Backend
gcloud run deploy ranger-coordinator \
  --source . \
  --region us-central1 \
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=TRUE,ALLOW_ORIGINS=https://ranger-console-fqd6rb7jba-uc.a.run.app"
```

## Documentation

- [ADR-009: Fixture-First Development](../adr/ADR-009-fixture-first-development.md)
- [DEMO-DATA-REFERENCE.md](../DEMO-DATA-REFERENCE.md)
- [GCP-DEPLOYMENT.md](../architecture/GCP-DEPLOYMENT.md)
