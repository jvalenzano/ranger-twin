# Cloud Run Deployment Fixes - December 27, 2025

## Issues Identified

From the console logs of the Cloud Run deployment, three issues were identified:

### 1. MapTiler 403 Forbidden (CRITICAL)

**Symptom:** Map tiles failing to load with 403 errors. URL shows `key=get_your_own_key`.

**Root Cause:** `gcloud run deploy --source` with `--set-build-env-vars` does NOT pass values as Docker `ARG`s. The Dockerfile expected build arguments, but Cloud Build was setting environment variables that Docker didn't read.

**Fix:** Created `cloudbuild.yaml` to use explicit `--build-arg` flags and updated `deploy-frontend.sh` to use `gcloud builds submit --config cloudbuild.yaml`.

### 2. NIFC API "Invalid query parameters" (HIGH)

**Symptom:** Multiple errors showing `NIFC API error: Cannot perform query. Invalid query parameters`, causing fallback to demo fires only.

**Root Cause:** The ArcGIS query included `geometryType: 'esriGeometryEnvelope'` without a corresponding `geometry` parameter. Newer ArcGIS servers reject this combination.

**Fix:** Removed `geometryType` from the query parameters in `nifcService.ts`.

### 3. DevExtreme Tooltip Console Spam (LOW)

**Symptom:** 78+ warnings for `Unknown tooltip ID: "ui-sort-filter"`.

**Root Cause:** A component is requesting a tooltip ID that doesn't exist in the registry.

**Fix:** Added deduplication to only warn once per unknown ID, reducing console noise.

## Files Modified

1. **`apps/command-console/Dockerfile`** - Clarified that `--build-arg` is required
2. **`apps/command-console/cloudbuild.yaml`** - NEW: Cloud Build configuration for proper build args
3. **`scripts/deploy-frontend.sh`** - Updated to use `gcloud builds submit --config`
4. **`apps/command-console/src/services/nifcService.ts`** - Removed invalid `geometryType` parameter
5. **`apps/command-console/src/config/tooltips/dx/index.ts`** - Deduplicated warnings

## Deployment Instructions

After these fixes, redeploy using:

```bash
cd /Users/jvalenzano/Projects/ranger-twin
./scripts/deploy-frontend.sh
```

Or with explicit MapTiler key:

```bash
VITE_MAPTILER_API_KEY=lxfnA21IbZC0utlR0bj3 ./scripts/deploy-frontend.sh
```

## Verification

After deployment, the console should show:
- ✅ MapTiler tiles loading successfully (no 403 errors)
- ✅ NIFC fires loading from real API (not just demo fires)
- ✅ Single tooltip warning (not 78+ repeated warnings)

## Architecture Note

These fixes maintain alignment with ADR-005 (Skills-First Architecture). The NIFC data flow is currently frontend-direct (Phase 1 simplification), but should eventually route through MCP servers for proper data provenance in the Proof Layer.
