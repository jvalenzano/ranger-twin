# TiTiler Service

> **Status:** Preparation Only (not yet deployed)
> **ADR Reference:** ADR-013 Phase 1F

## Architecture Decision: Stock Image

We use the **stock TiTiler image** from Development Seed without customization:

```
ghcr.io/developmentseed/titiler:latest
```

### Why Stock Image?

1. **Production-proven** at NASA, USGS, and federal agencies
2. **No customization needed** for our COG serving use case
3. **Regular security updates** from upstream maintainers
4. **Simpler operations** — no custom Dockerfile to maintain

### When Custom Image Needed

Only create a custom Dockerfile if:
- Custom algorithms for on-the-fly processing
- Additional dependencies for specialized colormaps
- Custom authentication middleware
- Performance tuning beyond environment variables

**Current assessment:** None of these apply for Cedar Creek demo.

---

## Deployment (When Ready)

```bash
# Pull official image
docker pull ghcr.io/developmentseed/titiler:latest

# Tag for Artifact Registry
docker tag ghcr.io/developmentseed/titiler:latest \
  us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest

# Deploy to Cloud Run
gcloud run deploy ranger-titiler \
  --image us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars="CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,GDAL_DISABLE_READDIR_ON_OPEN=EMPTY_DIR,GDAL_HTTP_MERGE_CONSECUTIVE_RANGES=YES"
```

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `CPL_VSIL_CURL_ALLOWED_EXTENSIONS` | `.tif` | Limit curl to GeoTIFF files |
| `GDAL_DISABLE_READDIR_ON_OPEN` | `EMPTY_DIR` | Skip directory listing (faster) |
| `GDAL_HTTP_MERGE_CONSECUTIVE_RANGES` | `YES` | Optimize HTTP range requests |

---

## Verification

After deployment, test with:

```bash
# Health check
curl https://ranger-titiler-xxxxx.run.app/healthz

# COG info
curl "https://ranger-titiler-xxxxx.run.app/cog/info?url=gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif"

# Tile request
curl "https://ranger-titiler-xxxxx.run.app/cog/tiles/10/168/362?url=gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif"
```

---

## Cost Estimate

| Resource | Estimate |
|----------|----------|
| Cloud Run (min-instances=0) | ~$5-15/month |
| Cloud Run (min-instances=1) | ~$20-30/month |
| Egress (tile serving) | ~$5-10/month |
| **Total** | **~$20-40/month** |

For demo, use `min-instances=0` to minimize cost. For stakeholder presentations, temporarily set `min-instances=1` to avoid cold starts.

---

**Document Owner:** RANGER Team
**Last Updated:** 2024-12-31
