# RANGER Demo Access

## URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://ranger-console-1058891520442.us-central1.run.app |
| **Backend** | https://ranger-coordinator-1058891520442.us-central1.run.app |

## Demo Credentials

- **Username:** ranger
- **Password:** CedarCreek2025!

## Quick Test

1. Open the frontend URL
2. Enter credentials when prompted
3. In the chat, try: "Give me a recovery briefing for Cedar Creek"

## Health Check

```bash
curl https://ranger-console-1058891520442.us-central1.run.app/health
```

Expected: `{"status":"healthy","service":"ranger-console"}`

## Deployed

**Date:** December 27, 2025
**Revision:** ranger-console-00003-hkk
**Platform:** Cloud Run (Google Cloud Platform)
**Region:** us-central1
**Project:** ranger-twin-dev

## Technical Details

- **Frontend**: React 18.3 + Vite 6.0 + Tailwind CSS
- **Authentication**: HTTP Basic Auth via nginx
- **Backend API**: Google ADK orchestrator with Gemini 2.0 Flash
- **Map**: MapLibre GL + MapTiler
- **Resources**: 256MB RAM, 1 CPU, 0-3 instances

## Notes

- Frontend and backend CORS are configured for cross-origin requests
- Health endpoint (`/health`) bypasses authentication for Cloud Run health checks
- Password is baked into the Docker image at build time
- Frontend environment variables (VITE_ADK_URL, VITE_MAPTILER_API_KEY) are compiled into the build
