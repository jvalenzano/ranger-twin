# Claude Code: RANGER Phase 0 Deployment

## Mission

Deploy the RANGER Command Console frontend to Google Cloud Run with Basic Auth protection. This gets the demo off localhost and onto a shareable URL.

**Expected Outcome:** A public URL like `https://ranger-console-xxx.us-central1.run.app` that TechTrend team members can access with shared credentials.

---

## Context

- **Project:** `/Users/jvalenzano/Projects/ranger-twin`
- **Frontend:** `apps/command-console/` (React + Vite)
- **Backend:** Already deployed at `https://ranger-coordinator-1058891520442.us-central1.run.app`
- **GCP Project:** `ranger-twin-dev`
- **Region:** `us-central1`

The Dockerfile, nginx.conf, and deploy script have already been created. Your job is to execute the deployment and handle any issues.

---

## Pre-Flight Checklist

Before deploying, verify:

1. [ ] `gcloud` CLI is authenticated: `gcloud auth list`
2. [ ] Correct project is set: `gcloud config get-value project` (should be `ranger-twin-dev`)
3. [ ] Docker build works locally: `./scripts/test-frontend-local.sh`
4. [ ] All files exist:
   - `apps/command-console/Dockerfile`
   - `apps/command-console/nginx.conf`
   - `apps/command-console/.dockerignore`
   - `scripts/deploy-frontend.sh`

---

## Deployment Steps

### Step 1: Make Scripts Executable

```bash
chmod +x scripts/deploy-frontend.sh
chmod +x scripts/test-frontend-local.sh
```

### Step 2: Verify GCP Authentication

```bash
# Check current auth
gcloud auth list

# If needed, authenticate
gcloud auth login

# Set project
gcloud config set project ranger-twin-dev

# Verify
gcloud config get-value project
```

### Step 3: Deploy to Cloud Run

```bash
# Deploy with the chosen password
./scripts/deploy-frontend.sh --password "CedarCreek2025!"
```

**If the script fails**, you can deploy manually:

```bash
cd apps/command-console

gcloud run deploy ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --source . \
  --build-arg VITE_ADK_URL=https://ranger-coordinator-1058891520442.us-central1.run.app \
  --build-arg VITE_MAPTILER_API_KEY=lxfnA21IbZC0utlR0bj3 \
  --build-arg DEMO_PASSWORD="CedarCreek2025!" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3
```

### Step 4: Get the Deployed URL

```bash
gcloud run services describe ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --format 'value(status.url)'
```

### Step 5: Update Backend CORS

The backend needs to allow requests from the new frontend URL:

```bash
# Get the frontend URL first
FRONTEND_URL=$(gcloud run services describe ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --format 'value(status.url)')

echo "Frontend URL: $FRONTEND_URL"

# Update backend CORS
gcloud run services update ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1 \
  --update-env-vars "ALLOW_ORIGINS=$FRONTEND_URL,http://localhost:5173,http://localhost:3000"
```

### Step 6: Verify Deployment

```bash
# Health check (no auth required)
curl -s https://ranger-console-xxx.us-central1.run.app/health

# Test with auth (replace URL)
curl -s -u ranger:CedarCreek2025! https://ranger-console-xxx.us-central1.run.app/
```

---

## Troubleshooting

### Build Fails: "npm ci" errors

```bash
# Clear npm cache and retry
cd apps/command-console
rm -rf node_modules package-lock.json
npm install
npm run build  # Test build locally first
```

### CORS Errors in Browser

Check that the backend CORS is updated:

```bash
gcloud run services describe ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1 \
  --format 'value(spec.template.spec.containers[0].env)'
```

The `ALLOW_ORIGINS` should include the frontend URL.

### 401 Unauthorized (Basic Auth not working)

Verify the password file was created correctly:

```bash
# Check container logs
gcloud run services logs read ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --limit 50
```

### 502 Bad Gateway

Cloud Run is still starting. Wait 30 seconds and retry. Check logs:

```bash
gcloud run services logs read ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --limit 20
```

### API Calls Fail (Backend Connection)

Verify the `VITE_ADK_URL` was set correctly during build:

```bash
# Check what URL the frontend is using by viewing the built JS
# (The URL is baked in at build time)
```

---

## Success Criteria

Deployment is successful when:

1. [ ] `https://ranger-console-xxx.run.app/health` returns `{"status":"healthy"}`
2. [ ] Browser prompts for username/password when visiting the URL
3. [ ] Login with `ranger` / `CedarCreek2025!` shows the RANGER UI
4. [ ] Chat works: "What is the burn severity for Cedar Creek?" returns a response
5. [ ] No CORS errors in browser console

---

## Post-Deployment: Document the URLs

After successful deployment, create/update this file:

**`docs/deployment/DEMO-ACCESS.md`**

```markdown
# RANGER Demo Access

## URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://ranger-console-xxx.us-central1.run.app |
| **Backend** | https://ranger-coordinator-1058891520442.us-central1.run.app |
| **ADK Web UI** | http://localhost:8000 (local only) |

## Demo Credentials

- **Username:** ranger
- **Password:** CedarCreek2025!

## Quick Test

1. Open the frontend URL
2. Enter credentials when prompted
3. In the chat, try: "Give me a recovery briefing for Cedar Creek"

## Deployed: [DATE]
```

---

## Commit Changes

After successful deployment:

```bash
git add -A
git commit -m "feat(deploy): Phase 0 - Frontend deployed to Cloud Run with Basic Auth

- Deployed ranger-console to Cloud Run
- Basic Auth protection (username: ranger)
- Backend CORS updated for new frontend URL
- Health check endpoint at /health

URL: https://ranger-console-xxx.us-central1.run.app"

git push origin main
```

---

## If Everything Fails

Fall back to manual Docker build and push:

```bash
cd apps/command-console

# Build locally
docker build \
  --build-arg VITE_ADK_URL=https://ranger-coordinator-1058891520442.us-central1.run.app \
  --build-arg VITE_MAPTILER_API_KEY=lxfnA21IbZC0utlR0bj3 \
  --build-arg DEMO_PASSWORD="CedarCreek2025!" \
  -t gcr.io/ranger-twin-dev/ranger-console:latest \
  .

# Push to GCR
docker push gcr.io/ranger-twin-dev/ranger-console:latest

# Deploy from GCR
gcloud run deploy ranger-console \
  --project ranger-twin-dev \
  --region us-central1 \
  --image gcr.io/ranger-twin-dev/ranger-console:latest \
  --allow-unauthenticated \
  --port 8080
```

---

## Summary

**Goal:** Get `https://ranger-console-xxx.run.app` working with Basic Auth

**Password:** `CedarCreek2025!`

**Key Commands:**
```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh --password "CedarCreek2025!"
```

Report back with:
1. The deployed URL
2. Whether the health check passes
3. Whether the UI loads after auth
4. Whether chat/API calls work

Good luck! 🌲
