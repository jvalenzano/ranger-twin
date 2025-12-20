# GCP Geospatial AI Platform Architecture
## Cost-Effective Architecture Patterns for Fire Recovery Digital Twin

**Document Version:** 1.0
**Date:** December 19, 2025
**Context:** USDA Forest Service Fire Recovery Digital Twin Platform
**Compliance:** FedRAMP High Required

---

## Executive Summary

This document provides specific Google Cloud Platform (GCP) architecture recommendations for building a cost-effective geospatial AI platform using open source components. The architecture is optimized for seasonal fire recovery workloads (intermittent processing patterns) while maintaining production quality and federal compliance requirements.

**Key Cost Optimization Strategy:** Leverage serverless patterns with scale-to-zero capabilities for seasonal workloads, combined with managed services during active fire seasons and open source alternatives where appropriate.

---

## 1. GCP Services for Geospatial AI

### 1.1 Google Earth Engine

**Status:** Free for research/non-commercial use (with verification requirements)

**Key Capabilities:**
- Access to 20+ petabytes of satellite imagery (Landsat, Sentinel-2, MODIS)
- Integrated with BigQuery via `ST_RegionStats()` function for raster analytics
- Available through BigQuery Analytics Hub (20+ Earth Engine datasets)

**Free Tier Eligibility (2025):**
- Available free for USDA Forest Service if used for research, environmental monitoring, or educational purposes
- **Critical Requirement:** All non-commercial projects must verify eligibility by September 26, 2025
- **Prohibited Uses Under Free Tier:**
  - Repeated production of data products for operational workloads
  - Fee-for-service activities or compensated work
  - Maintained datasets/apps for policy or management purposes

**Recommendation for Fire Recovery Platform:**
- **Phase 1 (Prototyping):** Use Earth Engine free tier for research/development
- **Phase 2 (Production):** Evaluate if operational fire recovery workloads require commercial licensing
- **Alternative:** Export Earth Engine datasets to Cloud Storage for processing with open source tools

**Cost Consideration:** Free tier includes standard quotas; additional quota "uplift" available for environmental/social impact projects upon application.

**References:**
- [Earth Engine in BigQuery](https://cloud.google.com/blog/products/data-analytics/earth-engine-raster-analytics-and-visualization-in-bigquery-geospatial)
- [Earth Engine Non-commercial Access](https://earthengine.google.com/noncommercial/)
- [Earth Engine Terms of Service](https://earthengine.google.com/terms/)

### 1.2 BigQuery GIS

**Capabilities:**
- Native `GEOGRAPHY` data type with 100+ spatial functions
- `ST_RegionStats()` for Earth Engine raster integration
- Map visualization in BigQuery Studio (preview)
- Serverless architecture - no cluster management

**Cost Model:**
- Storage: $0.02/GB/month (active), $0.01/GB/month (long-term)
- Queries: $6.25/TB processed (on-demand) or flat-rate slots
- Free operations: Loading, exporting, copying data

**Optimization Strategies:**
- Partition tables by date/geography to reduce query costs
- Use clustering on spatial columns for better performance
- Leverage free BigQuery Sandbox (10GB storage, 1TB/month queries) for testing
- Export frequently accessed datasets to Cloud Storage for processing

**Use Cases for Fire Recovery:**
- Joining fire perimeter polygons with satellite imagery statistics
- Analyzing burn severity over administrative boundaries
- Time-series analysis of vegetation recovery indices
- Generating reports/dashboards with geospatial visualizations

**References:**
- [BigQuery Geospatial Introduction](https://docs.cloud.google.com/bigquery/docs/geospatial-intro)
- [Earth Engine + BigQuery Integration](https://cloud.google.com/blog/products/data-analytics/earth-engine-raster-analytics-and-visualization-in-bigquery-geospatial)

### 1.3 Vertex AI

**Capabilities:**
- Custom model training and deployment
- Pre-trained models (Gemini, vision models)
- Batch prediction for large-scale inference
- AutoML for low-code model development
- **FedRAMP High Authorized** (critical for federal use)

**Pricing (2025):**
- Custom-trained models: ~$0.22/hour per node
- Spot VMs: 60-91% discount for interruptible workloads
- Gemini 2.5 Flash: $0.30 input / $2.50 output per 1M tokens
- Gemini 2.5 Pro: $1.25 input / $10 output per 1M tokens
- **Batch mode:** 50% discount for non-urgent processing (24hr turnaround)
- **Context caching:** Up to 90% savings for repeated document processing

**Cost Optimization for Fire Recovery:**
- Use Spot VMs for model training (fire severity classification, species ID)
- Deploy batch prediction for processing large imagery archives
- Use Gemini Flash (not Pro) for NEPA document processing to save 75% on costs
- Implement context caching for recurring document analysis
- Right-size machine types based on model requirements

**Self-Hosted Alternative:**
- Deploy open source models on Cloud Run or GKE
- Use TensorFlow Serving or TorchServe in containers
- Trade cost savings for increased operational complexity

**References:**
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- [Vertex AI Cost Optimization](https://www.pump.co/blog/google-vertex-ai-pricing)
- [Claude on Vertex AI FedRAMP High](https://www.anthropic.com/news/claude-on-google-cloud-fedramp-high)

### 1.4 Cloud Run

**Capabilities:**
- Serverless container platform (scale to zero)
- Supports long-running services and batch jobs
- GPU support for AI inference (new in 2025)
- 100ms billing granularity
- **Ideal for seasonal fire recovery workloads**

**Pricing:**
- CPU: $0.00002400/vCPU-second
- Memory: $0.00000250/GiB-second
- Requests: $0.40/million requests
- **Free tier:** 2M requests/month, 360,000 GiB-seconds

**Cost Optimization:**
- **80-96% cost reduction** vs. dedicated servers for variable traffic
- Automatic scale-to-zero when inactive (critical for seasonal workloads)
- Container image optimization (reduce cold start times)
- Use minimum instance count of 0 for non-critical services

**Use Cases for Fire Recovery:**
- GeoServer for WMS/WFS tile serving
- GDAL/OGR processing pipelines
- Species identification API (inference endpoint)
- Video processing pipelines (audio extraction, frame analysis)

**Cold Start Mitigation:**
- Keep container images small (<500MB)
- Use multi-stage Docker builds
- Pre-compile dependencies in custom base images
- GPU instances start in <5 seconds

**References:**
- [Cloud Run Overview](https://cloud.google.com/run)
- [Serverless Cost Optimization](https://ochk.cloud/blog/cost-effective-serverless-google-cloud-run)
- [Cloud Run GPUs for AI](https://www.infoq.com/news/2025/06/google-cloud-run-nvidia-gpu/)

### 1.5 Cloud Storage

**Capabilities:**
- Scalable object storage for imagery and vector data
- Multi-regional, regional, nearline, and coldline tiers
- Public datasets available (Landsat, Sentinel-2)
- Signed URLs for secure access

**Pricing (us-east4 region):**
- Standard: $0.020/GB/month
- Nearline (30-day minimum): $0.010/GB/month
- Coldline (90-day minimum): $0.004/GB/month
- Archive (365-day minimum): $0.0012/GB/month

**Optimization for Geospatial Data:**
- Store raw satellite imagery in Coldline/Archive
- Use Standard tier for active processing datasets
- Implement lifecycle policies to auto-transition older data
- Use Cloud CDN for frequently accessed tiles
- Leverage public Sentinel-2/Landsat buckets to avoid egress costs

**Public Datasets (Free Access):**
- Sentinel-2: `gs://gcp-public-data-sentinel-2/`
- Landsat: Full archive in Google Cloud Storage
- Direct access via Earth Engine, gsutil, or Cloud Storage API

**References:**
- [Cloud Storage Public Datasets - Sentinel-2](https://cloud.google.com/storage/docs/public-datasets/sentinel-2)
- [Sentinel-2 on Google Cloud](https://console.cloud.google.com/marketplace/product/esa-public-data/sentinel2)

---

## 2. Cost-Effective Architecture Patterns

### 2.1 Serverless-First for Seasonal Workloads

**Pattern:** Scale-to-zero serverless for fire recovery workloads that are active May-October

**Components:**
- Cloud Run services (API endpoints, processing pipelines)
- Cloud Functions (event-driven triggers)
- BigQuery (serverless analytics)
- Cloud Workflows (orchestration)

**Cost Savings:**
- **60-80% reduction** vs. always-on infrastructure
- Pay only during active fire season
- Automatic scaling during high-demand periods (major fires)

**Example Monthly Costs (Off-Season vs. Active Season):**
```
Off-Season (Nov-Apr): $50-100/month (minimal Cloud Storage fees only)
Active Season (May-Oct): $500-2,000/month (scales with fire activity)
```

### 2.2 Managed Services vs. Self-Hosted Decision Matrix

| Service | Managed (GCP) | Self-Hosted (Open Source) | Recommendation |
|---------|---------------|---------------------------|----------------|
| **Geospatial Database** | Cloud SQL PostgreSQL + PostGIS | PostGIS on Compute Engine | **Managed** - PostGIS 3.6.2 included, automated backups |
| **Map Server** | N/A | GeoServer on Cloud Run | **Self-Hosted** - Cost-effective for tile serving |
| **Raster Processing** | BigQuery + Earth Engine | GDAL on Cloud Run/Batch | **Hybrid** - Use EE for exploration, GDAL for production |
| **Vector Processing** | BigQuery GIS | Apache Sedona on Dataproc | **BigQuery** - Better for ad-hoc queries, Sedona for massive joins |
| **ML Inference** | Vertex AI | Custom containers on Cloud Run | **Cloud Run** - Lower cost for intermittent workloads |
| **Orchestration** | Cloud Workflows | Apache Airflow on GKE | **Workflows** - Serverless, pay-per-step pricing |

### 2.3 Batch Processing for Large-Scale Jobs

**Pattern:** Use Cloud Batch or Dataflow FlexRS for non-time-sensitive processing

**Cloud Batch:**
- Run containerized jobs at scale
- Use Spot VMs for 60-91% cost savings
- Ideal for GDAL/OGR processing pipelines

**Dataflow FlexRS:**
- 40% cheaper than standard Dataflow
- Uses preemptible VMs + standard VMs
- Best for batch ETL jobs with flexible timing

**Use Cases:**
- Reprocessing entire Sentinel-2 archive for burn severity
- Generating training datasets for ML models
- Historical analysis (2000-2025 fire recovery trends)

**References:**
- [Dataflow Cost Optimization](https://docs.cloud.google.com/dataflow/docs/optimize-costs)

---

## 3. Open Source Components on GCP

### 3.1 PostGIS on Cloud SQL

**Deployment:**
- Cloud SQL for PostgreSQL (all major versions)
- PostGIS 3.6.2 extension included
- pgRouting 3.6.2 for network analysis

**Pricing:**
- db-custom-2-7680 (2 vCPU, 7.5GB RAM): ~$80/month
- db-custom-4-15360 (4 vCPU, 15GB RAM): ~$160/month
- **High Availability:** 2x base cost
- Storage: $0.17/GB/month (SSD)

**Cost Optimization:**
- Use Cloud SQL Auth Proxy for secure connections (no public IP)
- Enable automatic storage increase (avoid over-provisioning)
- Schedule backups during low-usage periods
- Consider Read Replicas only if needed

**Alternative (Cost Savings):**
- Self-managed PostGIS on Compute Engine: ~50% cheaper
- Trade-off: Manual backups, patching, HA configuration

**References:**
- [Cloud SQL PostgreSQL PostGIS Support](https://cloud.google.com/blog/products/gcp/cloud-sql-for-postgresql-managed-postgresql-for-your-mobile-and-geospatial-applications-in-google-cloud)
- [Cloud SQL Extensions](https://cloud.google.com/sql/docs/postgres/extensions)

### 3.2 GeoServer on Cloud Run

**Deployment:**
```dockerfile
FROM docker.osgeo.org/geoserver:2.25.0
# Add custom configurations, extensions
# Connect to Cloud SQL PostGIS via Cloud SQL Proxy
```

**Architecture:**
- GeoServer container on Cloud Run
- PostGIS on Cloud SQL as data store
- Cloud Storage for GeoTIFF rasters
- Cloud CDN for tile caching

**Cost Model:**
- **Variable:** Scales with requests (fire activity)
- **Estimated:** $20-100/month for moderate usage
- **Scale-to-zero:** No costs during inactive periods

**Performance Optimization:**
- Pre-seed map tiles during batch processing
- Use GeoWebCache for tile caching
- Configure Cloud CDN in front of Cloud Run
- Use Cloud Storage for raster data (avoid PostGIS raster storage)

**References:**
- [GeoServer Docker Images](https://hub.docker.com/r/osgeolive/geoserver)

### 3.3 Apache Sedona on Dataproc

**Use Case:** Large-scale spatial joins and vector processing

**When to Use Sedona vs. BigQuery:**
- **BigQuery:** Ad-hoc queries, reporting, moderate-scale joins
- **Sedona:** Massive spatial joins (millions+ geometries), complex spatial operations

**Deployment:**
- Dataproc cluster with Sedona initialization actions
- Preemptible VMs for 80% cost savings
- Ephemeral clusters (shut down when not in use)

**Pricing Example (n1-standard-4, 3-node cluster):**
- Standard VMs: $0.19/hour/node = $0.57/hour cluster
- Preemptible VMs: ~$0.04/hour/node = $0.12/hour cluster

**Cost Optimization:**
- Use ephemeral clusters (create, process, destroy)
- Leverage Dataproc autoscaling
- Store data in Cloud Storage (Parquet with spatial partitioning)
- Use Spot VMs when possible

**Alternative:** Run Sedona jobs on Dataproc Serverless (no cluster management)

**References:**
- [Apache Sedona GitHub](https://github.com/apache/sedona)
- [Sedona vs. BigQuery Comparison](https://wherobots.com/blog/raster-spatial-joins-at-scale-google-earth-engine-bigquery-vs-apache-sedona-wherobots/)

### 3.4 GDAL/OGR Containerized Workflows

**Deployment Pattern:**
```yaml
# Cloud Run Job for GDAL processing
apiVersion: run.googleapis.com/v1
kind: Job
spec:
  template:
    spec:
      containers:
      - image: osgeo/gdal:alpine-normal-latest
        command: ["gdalwarp", "-t_srs", "EPSG:4326", "input.tif", "output.tif"]
      resources:
        limits:
          cpu: 4
          memory: 8Gi
```

**Use Cases:**
- Format conversion (GeoTIFF to COG)
- Reprojection and mosaicking
- Raster calculations (NDVI, burn severity indices)
- Extracting statistics over polygons

**Cost:**
- Cloud Run Jobs: Pay only during execution
- Typical GDAL job: $0.01-0.10 per run
- Batch processing 1000 scenes: $10-100

**Optimization:**
- Use Cloud-Optimized GeoTIFFs (COGs) for faster reads
- Process tiles in parallel via Cloud Run Jobs
- Store intermediate results in Cloud Storage

---

## 4. Data Pipeline Patterns

### 4.1 Ingesting Sentinel-2/Landsat Imagery

**Architecture:**

```
Sentinel-2 Public Bucket → Cloud Pub/Sub → Cloud Run → GDAL Processing → Cloud Storage (COG) → BigQuery GIS
                                     ↓
                              Metadata → BigQuery Catalog
```

**Implementation:**

1. **Access Public Data:**
   - Sentinel-2: `gs://gcp-public-data-sentinel-2/`
   - Landsat: Available in Cloud Storage
   - No egress fees when processing in same region

2. **Metadata Indexing:**
   - Use BigQuery to catalog available scenes
   - Query by date, cloud cover, fire perimeters
   - Example query:
     ```sql
     SELECT * FROM `esa-public-data.sentinel2.catalog`
     WHERE DATE(sensing_time) BETWEEN '2024-06-01' AND '2024-09-30'
       AND cloud_cover < 10
       AND ST_INTERSECTS(geometry, ST_GEOGFROMTEXT('POLYGON(...)'))
     ```

3. **Processing Pipeline:**
   - Trigger Cloud Run Job when new scene detected
   - GDAL: Clip to area of interest, calculate indices
   - Convert to COG for efficient cloud access
   - Store in Cloud Storage with organized structure:
     ```
     gs://fire-recovery/sentinel2/YYYY/MM/DD/tile_id/NDVI.tif
     ```

**Cost Optimization:**
- Process only necessary spectral bands
- Use Cloud Workflows to orchestrate multi-step pipelines
- Leverage Batch API for non-urgent processing (50% discount)

**References:**
- [Sentinel-2 Public Dataset](https://cloud.google.com/storage/docs/public-datasets/sentinel-2)
- [GitHub: Sentinel-2 Explorer](https://github.com/AlbughdadiM/sentinel2-explorer)

### 4.2 Processing Pipelines (Cloud Workflows vs. Dataflow)

**Decision Matrix:**

| Criteria | Cloud Workflows | Dataflow |
|----------|----------------|----------|
| **Complexity** | Simple orchestration (call APIs, trigger jobs) | Complex stream/batch processing, transformations |
| **Cost** | $0.00001/step (first 5,000 steps/month free) | $0.056/vCPU-hour + storage |
| **Use Case** | Trigger GDAL jobs, coordinate services | Process billions of records, real-time streaming |
| **Learning Curve** | YAML-based, easy to learn | Apache Beam programming model |

**Recommendation for Fire Recovery:**
- **Cloud Workflows:** Orchestrate imagery processing, trigger ML inference
- **Dataflow:** Only if processing >10TB data or requiring real-time streaming

**Example Cloud Workflow (YAML):**
```yaml
main:
  steps:
    - listScenes:
        call: googleapis.bigquery.v2.jobs.query
        args:
          projectId: ${sys.get_env("GOOGLE_CLOUD_PROJECT_ID")}
          body:
            query: "SELECT scene_id FROM sentinel2_catalog WHERE ..."
    - processScenes:
        for:
          value: scene
          in: ${listScenes.result}
          steps:
            - runGDAL:
                call: googleapis.run.v1.jobs.run
                args:
                  name: gdal-processing
                  container:
                    image: osgeo/gdal:latest
                    command: ["gdal_calc.py", "--scene=${scene}"]
```

### 4.3 Storing and Serving Geospatial Data

**Storage Strategy:**

| Data Type | Storage | Serving | Cost/TB/Month |
|-----------|---------|---------|---------------|
| **Raw Satellite Imagery** | Cloud Storage (Coldline) | On-demand access | $4 |
| **Processed Imagery (COG)** | Cloud Storage (Standard) | Cloud CDN + GeoServer | $20 |
| **Vector Data (Fire Perimeters)** | Cloud SQL PostGIS | GeoServer WFS/WMS | $80 (2vCPU instance) |
| **Analysis Results** | BigQuery | BigQuery API / Looker | $20 (active storage) |
| **Map Tiles (Pre-rendered)** | Cloud Storage + CDN | Direct HTTP | $20 + CDN fees |

**Serving Architecture:**

```
User Request → Cloud Load Balancer
                 ├─→ Cloud CDN (cached tiles)
                 ├─→ Cloud Run (GeoServer) → PostGIS (Cloud SQL)
                 └─→ Cloud Storage (static COGs)
```

**Cost Optimization:**
- Pre-render commonly requested map tiles
- Use Cloud CDN to cache 90%+ of requests
- Implement expiration policies for old data
- Use signed URLs for secure raster access

---

## 5. AI/ML on GCP

### 5.1 Vertex AI vs. Self-Hosted Inference

**Cost Comparison (1000 inferences/day, 30 days/month):**

| Deployment | Setup | Monthly Cost | Pros | Cons |
|------------|-------|--------------|------|------|
| **Vertex AI (Dedicated Endpoint)** | Low | $158 (n1-standard-2, 24/7) | Managed, autoscaling, monitoring | Always-on cost |
| **Vertex AI (Spot VMs)** | Low | $30-60 (60-91% savings) | Cheap, managed | May be preempted |
| **Cloud Run (Custom Container)** | Medium | $5-20 (scales to zero) | Pay-per-use, serverless | Cold starts, no GPU (unless new tier) |
| **GKE (Self-Managed)** | High | $50-150 (cluster + nodes) | Full control, multi-model | Operational overhead |

**Recommendation:**
- **Cloud Run + Custom Container:** Best for intermittent workloads (species ID, damage assessment)
- **Vertex AI Batch Prediction:** Best for processing large archives (historical imagery)
- **Vertex AI Endpoint (Spot VMs):** Best for moderate, consistent traffic with cost sensitivity

### 5.2 Gemini API for Document Processing (NEPA)

**Use Case:** Extract key information from NEPA environmental assessments

**Model Selection:**

| Model | Input Cost (1M tokens) | Output Cost (1M tokens) | Best For |
|-------|------------------------|-------------------------|----------|
| **Gemini 2.5 Flash** | $0.30 | $2.50 | General document processing |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | Complex analysis, high accuracy |
| **Batch Mode (50% off)** | $0.15-0.625 | $1.25-5.00 | Non-urgent, 24hr turnaround |

**Cost Optimization:**
- **Use Flash, not Pro:** 75% cost savings for most NEPA documents
- **Batch Processing:** 50% additional discount for non-urgent tasks
- **Context Caching:** Up to 90% savings for repeated document sections
- **Keep Prompts <200K tokens:** Pro models charge 2x above this threshold

**Example NEPA Document Processing Cost:**
```
Document: 50 pages = ~25,000 tokens input
Output: 2-page summary = ~1,000 tokens
Model: Gemini 2.5 Flash (Batch)

Cost per document:
Input:  25,000 tokens × $0.15/1M = $0.00375
Output:  1,000 tokens × $1.25/1M = $0.00125
Total: $0.005 per document

100 documents/month = $0.50/month
```

**References:**
- [Gemini API Pricing (2025)](https://ai.google.dev/gemini-api/docs/pricing)
- [LLM API Pricing Comparison](https://intuitionlabs.ai/articles/llm-api-pricing-comparison-2025)

### 5.3 Custom Model Training

**Use Cases:**
- Fire severity classification (burn severity mapping)
- Species identification from camera traps/drones
- Damaged tree detection in post-fire imagery

**Cost Optimization:**
- **Use AutoML:** Lower cost, minimal code for simple models
- **Spot VMs for Training:** 60-91% discount for preemptible compute
- **Pre-trained Models:** Fine-tune existing models rather than training from scratch
- **Transfer Learning:** Use ImageNet/satellite imagery pre-trained models

**Example Training Cost (Fire Severity Classification):**
```
Dataset: 10,000 labeled Sentinel-2 scenes
Training: 10 hours on n1-highmem-8 with Tesla T4 GPU

Compute: 10 hours × $2.48/hour = $24.80
GPU: 10 hours × $0.95/hour = $9.50
Total: $34.30

Using Spot VMs (80% discount): $6.86
```

### 5.4 Multimodal Processing (Video + Audio)

**Use Case:** Wildlife monitoring videos - extract audio, identify species

**Architecture:**
```
Cloud Storage (video) → Cloud Run Job → FFmpeg (audio extraction)
                                    ↓
                              Vertex AI Gemini → Species ID
                                    ↓
                              BigQuery (results)
```

**Cost Optimization:**
- Use Gemini 2.0 Flash for multimodal analysis
- Process videos in batch mode (50% discount)
- Store extracted audio in compressed format
- Use Cloud Run Jobs (pay-per-execution)

**Example Cost (100 videos/month, 5 min each):**
```
Cloud Run (FFmpeg extraction): 500 minutes × $0.00024/minute = $0.12
Gemini 2.0 Flash (multimodal): 100 videos × $0.05 = $5.00
Storage (videos + audio): 50GB × $0.02/GB = $1.00
Total: $6.12/month
```

---

## 6. Federal/Government Considerations

### 6.1 GCP FedRAMP Authorization Status (2025)

**FedRAMP High Authorized Services:**
- 150+ Google Cloud services have FedRAMP High P-ATO
- Includes: Vertex AI, BigQuery, Cloud Storage, Cloud Run, Cloud SQL
- **New in 2025:** Vertex AI Vector Search, Agent Assist, Looker Core

**Claude on Vertex AI:**
- **FedRAMP High + IL2 Authorized** (as of 2025)
- Enables federal agencies to use advanced AI for sensitive unclassified data
- Available through Vertex AI Model Garden

**FedRAMP 20x Initiative:**
- New assessment process launched in 2025
- Continuous compliance via automated validation
- Google Cloud Compliance Manager (public preview)
- Accelerates partner/customer authorization process

**Assured Workloads Requirement:**
- **MUST use Assured Workloads for FedRAMP High**
- Includes data residency controls and technical guardrails
- FedRAMP Moderate: Free tier
- FedRAMP High: Premium subscription required

**References:**
- [GCP FedRAMP Compliance](https://cloud.google.com/security/compliance/fedramp)
- [FedRAMP Implementation Guide](https://cloud.google.com/architecture/fedramp-implementation-guide)
- [Claude on Vertex AI FedRAMP](https://www.anthropic.com/news/claude-on-google-cloud-fedramp-high)
- [Google Cloud FedRAMP High Services](https://cloud.google.com/blog/topics/customers/google-cloud-platform-is-now-fedramp-high-authorized)

### 6.2 Data Residency Options

**US Regions for Federal Workloads:**
- `us-east4` (Northern Virginia) - Recommended for federal agencies
- `us-east1` (South Carolina)
- `us-central1` (Iowa)
- `us-west1` (Oregon)

**Assured Workloads Data Controls:**
- Resource location constraints (enforce US-only regions)
- Organization policy constraints (prevent accidental data export)
- Data residency compliance for FedRAMP High

**Implementation:**
```yaml
# Organization Policy Constraint
constraints/gcp.resourceLocations:
  listPolicy:
    allowedValues:
      - in:us-locations  # Restricts to US regions only
```

**BigQuery + Earth Engine Regional Support (2025):**
- US multi-region (default)
- EU multi-region (new in 2025)
- europe-west1 (Belgium) - new in 2025

**Recommendation:**
- Use `us-east4` for all USDA Forest Service workloads
- Configure Assured Workloads at organization level
- Implement VPC Service Controls for additional network isolation

**References:**
- [Assured Workloads Data Residency](https://cloud.google.com/assured-workloads/docs/data-residency)
- [Meet Data Residency Requirements](https://cloud.google.com/blog/products/identity-security/meet-data-residency-requirements-with-google-cloud)

### 6.3 Security and Compliance Patterns

**Encryption:**
- Default: Google-managed encryption keys (at rest + in transit)
- Enhanced: Customer-managed encryption keys (CMEK) via Cloud KMS
- Maximum: Customer-supplied encryption keys (CSEK)

**Network Security:**
- VPC Service Controls (perimeter around sensitive data)
- Private Google Access (no public IPs for VMs)
- Cloud SQL Auth Proxy (secure database connections)
- Identity-Aware Proxy (zero-trust access to web apps)

**Audit Logging:**
- Cloud Audit Logs (admin, data access, system events)
- 1-year retention requirement for FedRAMP High
- Export to Cloud Storage or BigQuery for long-term retention

**Identity and Access Management:**
- Federate with USDA Active Directory via Cloud Identity
- Enforce MFA for all administrative access
- Use service accounts with least-privilege IAM roles
- Implement Workload Identity for GKE workloads

**Compliance Monitoring:**
- Security Command Center (Premium tier)
- Policy Intelligence (IAM recommender)
- Cloud Asset Inventory (track resource changes)

---

## 7. Recommended Architecture (Fire Recovery Platform)

### 7.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USDA Forest Service                          │
│                   Fire Recovery Digital Twin Platform                │
│                          (FedRAMP High)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Data Ingestion Layer                          │
├─────────────────────────────────────────────────────────────────────┤
│  Sentinel-2/Landsat  │  Drone Imagery  │  Field Data  │  NEPA Docs  │
│  (Public Datasets)   │  (Cloud Storage)│  (CSV/GeoJSON│  (Cloud     │
│                      │                 │              │  Storage)   │
└──────────────┬───────────────┬──────────────┬────────────────┬──────┘
               │               │              │                │
               ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Processing Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  Cloud Run Jobs  │  Cloud Workflows  │  Dataflow FlexRS  │  Vertex AI│
│  (GDAL/OGR)      │  (Orchestration)  │  (Batch ETL)      │  (Gemini) │
│                  │                   │                   │           │
│  • Reproject     │  • Trigger jobs   │  • Massive joins  │  • NEPA   │
│  • Clip AOI      │  • Error handling │  • Aggregations   │  • Species│
│  • Calculate NDVI│  • Scheduling     │  • Deduplication  │  • Summary│
└──────────────┬───────────────┬──────────────┬────────────────┬──────┘
               │               │              │                │
               ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Storage Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Cloud Storage   │  Cloud SQL       │  BigQuery        │  Firestore  │
│  (COG Rasters)   │  (PostGIS)       │  (Analytics)     │  (Metadata) │
│                  │                  │                  │             │
│  • Sentinel-2    │  • Fire perims   │  • Burn severity │  • Scene    │
│  • Landsat       │  • Roads/trails  │    statistics    │    catalog  │
│  • Drone imagery │  • Species obs   │  • Time series   │  • Job logs │
└──────────────┬───────────────┬──────────────┬────────────────┬──────┘
               │               │              │                │
               ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Serving Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│  GeoServer       │  Cloud Run APIs  │  Looker Studio   │  Cloud CDN  │
│  (WMS/WFS)       │  (REST/GraphQL)  │  (Dashboards)    │  (Tiles)    │
│  on Cloud Run    │                  │                  │             │
└──────────────┬───────────────┬──────────────┬────────────────┬──────┘
               │               │              │                │
               ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       User Interface                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Field App       │  Web Portal      │  ArcGIS Pro      │  Jupyter    │
│  (Mobile)        │  (React)         │  (GIS Desktop)   │  (Analysis) │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   Cross-Cutting Concerns                             │
├─────────────────────────────────────────────────────────────────────┤
│  Assured Workloads (FedRAMP High) │ Cloud Monitoring & Logging      │
│  VPC Service Controls             │ Cloud Audit Logs (1yr retention)│
│  Identity-Aware Proxy             │ Security Command Center         │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component-Level Recommendations

| Component | Service | Configuration | Monthly Cost (Estimate) |
|-----------|---------|---------------|-------------------------|
| **Database** | Cloud SQL PostgreSQL + PostGIS | db-custom-4-15360, 100GB SSD, HA | $320 |
| **Map Server** | GeoServer on Cloud Run | 2 vCPU, 4GB RAM, min instances: 0 | $50-150 (variable) |
| **Raster Storage** | Cloud Storage Standard (10TB) | us-east4, lifecycle policies | $200 |
| **Vector Analytics** | BigQuery | 1TB queries/month, 500GB storage | $16.25 (queries) + $10 (storage) |
| **ML Inference** | Cloud Run (custom containers) | 4 vCPU, 8GB RAM, 1000 requests/day | $20-40 |
| **Document AI** | Gemini 2.5 Flash (Batch) | 100 documents/month, 25K tokens each | $0.50 |
| **Orchestration** | Cloud Workflows | 10,000 steps/month | Free tier |
| **CDN** | Cloud CDN | 1TB egress/month | $80 |
| **Monitoring** | Cloud Logging/Monitoring | Standard tier | $50 |
| **Assured Workloads** | FedRAMP High | Premium subscription | Included in project |
| **Total (Active Season)** | | | **~$800-950/month** |
| **Total (Off-Season)** | | | **~$100-200/month** (storage only) |

**Notes:**
- Costs assume moderate usage during active fire season (May-Oct)
- Off-season costs primarily Cloud Storage + minimal Cloud SQL
- Scaling factors: 2-3x costs during major fire events (auto-scaling)

### 7.3 Cost Optimization Checklist

**Infrastructure:**
- [ ] Enable autoscaling for all services (Cloud Run, Cloud SQL)
- [ ] Use Spot/Preemptible VMs for training and batch jobs
- [ ] Implement Cloud Storage lifecycle policies (Standard → Nearline → Coldline)
- [ ] Configure Cloud SQL automatic storage increase (avoid over-provisioning)
- [ ] Use Cloud CDN for all public-facing map services
- [ ] Set Cloud Run min instances to 0 for non-critical services

**Data Processing:**
- [ ] Use Cloud Workflows instead of always-on orchestration
- [ ] Leverage Dataflow FlexRS for batch ETL (40% savings)
- [ ] Process only necessary spectral bands from satellite imagery
- [ ] Implement incremental processing (avoid reprocessing entire archives)
- [ ] Use BigQuery partitioning/clustering to reduce query costs

**AI/ML:**
- [ ] Use Gemini 2.5 Flash instead of Pro for routine tasks
- [ ] Enable batch mode for non-urgent document processing (50% discount)
- [ ] Implement context caching for repeated NEPA document sections
- [ ] Use Vertex AI Batch Prediction for large-scale inference
- [ ] Deploy custom models on Cloud Run (not Vertex AI endpoints)

**Monitoring:**
- [ ] Set up billing alerts at $500, $750, $1000 thresholds
- [ ] Create Cloud Monitoring dashboards for cost tracking
- [ ] Review Cloud Billing export in BigQuery monthly
- [ ] Track cost per fire recovery project
- [ ] Monitor Cloud Storage class distribution

---

## 8. Migration Path from Prototype to Production

### Phase 1: Prototype (Months 1-3)
**Focus:** Proof of concept with minimal cost

**Architecture:**
- BigQuery Sandbox (free tier)
- Cloud Run free tier (2M requests/month)
- Cloud Storage (minimal, <100GB)
- Earth Engine non-commercial (free)
- Vertex AI (ad-hoc training, Spot VMs)

**Estimated Cost:** $50-100/month

### Phase 2: Pilot (Months 4-6)
**Focus:** Single fire recovery project

**Architecture:**
- Cloud SQL PostgreSQL + PostGIS (db-custom-2-7680)
- GeoServer on Cloud Run (scale to zero)
- BigQuery (pay-as-you-go)
- Sentinel-2/Landsat processing pipeline (Cloud Workflows + Cloud Run Jobs)
- Gemini Flash for NEPA document analysis

**Estimated Cost:** $300-500/month

### Phase 3: Production (Month 7+)
**Focus:** Multi-fire, regional deployment

**Architecture:**
- Cloud SQL HA (High Availability)
- Assured Workloads (FedRAMP High)
- VPC Service Controls
- Cloud CDN + GeoServer
- Automated monitoring and alerting
- Scheduled backups and disaster recovery

**Estimated Cost:** $800-1200/month (active season)

### Phase 4: Scale (Year 2+)
**Focus:** National deployment, historical analysis

**Architecture:**
- Multi-region deployment (us-east4 primary, us-central1 failover)
- BigQuery reserved slots (if query costs exceed $2000/month)
- Committed use discounts (CUDs) for Cloud SQL, Compute Engine
- Custom data pipelines optimized for specific fire types

**Estimated Cost:** $2000-5000/month

---

## 9. Alternative Architectures (Cost Comparison)

### 9.1 All Managed Services (High Cost, Low Ops)

**Stack:**
- BigQuery for all analytics
- Vertex AI for all ML workloads
- Cloud SQL High Availability
- Looker (not Looker Studio) for BI

**Monthly Cost:** $3000-5000
**Operational Effort:** Low
**Best For:** Large federal agencies with budget, minimal tech staff

### 9.2 Hybrid (Recommended)

**Stack:**
- BigQuery + PostGIS (complementary)
- Cloud Run + Vertex AI (serverless first)
- GeoServer (open source)
- Looker Studio (free tier)

**Monthly Cost:** $800-1200
**Operational Effort:** Medium
**Best For:** USDA Forest Service (balance of cost and capability)

### 9.3 Open Source Heavy (Low Cost, High Ops)

**Stack:**
- PostGIS on Compute Engine (self-managed)
- GeoServer on GKE
- Apache Sedona on Dataproc
- Custom ML inference servers

**Monthly Cost:** $400-700
**Operational Effort:** High
**Best For:** Organizations with strong DevOps teams, tight budgets

---

## 10. Key Takeaways and Recommendations

### 10.1 Cost-Effective Architecture Principles

1. **Serverless First:** Use Cloud Run, Cloud Functions, BigQuery for scale-to-zero capabilities
2. **Seasonal Scaling:** Design for 6-month active season (May-Oct), minimal off-season costs
3. **Open Source Where Appropriate:** GeoServer, GDAL, PostGIS for non-differentiated workloads
4. **Managed Where Critical:** Cloud SQL, BigQuery, Vertex AI for core capabilities
5. **Batch Processing:** Use FlexRS, Spot VMs, Batch mode for non-urgent tasks

### 10.2 Federal Compliance Non-Negotiables

1. **Use Assured Workloads:** Required for FedRAMP High authorization
2. **US-East4 Region:** Primary region for USDA federal workloads
3. **VPC Service Controls:** Network isolation for sensitive data
4. **1-Year Audit Logs:** Export Cloud Audit Logs to Cloud Storage
5. **CMEK Encryption:** Customer-managed keys for sensitive datasets

### 10.3 Recommended Architecture for Fire Recovery

**Core Components:**
- **Data Ingestion:** Sentinel-2/Landsat (public datasets) + drone imagery (Cloud Storage)
- **Processing:** Cloud Run Jobs (GDAL) + Cloud Workflows (orchestration)
- **Storage:** Cloud Storage (COG rasters) + Cloud SQL PostGIS (vectors) + BigQuery (analytics)
- **Serving:** GeoServer (Cloud Run) + Cloud CDN + Looker Studio
- **AI/ML:** Gemini 2.5 Flash (documents) + Custom models (Cloud Run)

**Estimated Total Cost:**
- **Active Season (May-Oct):** $800-1200/month
- **Off-Season (Nov-Apr):** $100-200/month
- **Annual Total:** ~$6000-9000/year

### 10.4 Next Steps

1. **Set Up Assured Workloads:** Register for FedRAMP High workspace
2. **Prototype with Free Tiers:** BigQuery Sandbox, Earth Engine non-commercial, Cloud Run free tier
3. **Process Sample Fire:** Test end-to-end workflow with single fire recovery project
4. **Validate Costs:** Monitor actual spend vs. estimates for 1-2 months
5. **Optimize and Scale:** Implement cost optimization checklist, expand to multiple fires

---

## Appendix: References

### Official Google Cloud Documentation
- [BigQuery Geospatial Introduction](https://docs.cloud.google.com/bigquery/docs/geospatial-intro)
- [Earth Engine in BigQuery](https://cloud.google.com/blog/products/data-analytics/earth-engine-raster-analytics-and-visualization-in-bigquery-geospatial)
- [Dataflow Cost Optimization](https://docs.cloud.google.com/dataflow/docs/optimize-costs)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- [Cloud Run Documentation](https://cloud.google.com/run)
- [Cloud SQL PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [GCP FedRAMP Compliance](https://cloud.google.com/security/compliance/fedramp)
- [Assured Workloads Data Residency](https://cloud.google.com/assured-workloads/docs/data-residency)

### Public Datasets
- [Sentinel-2 on Google Cloud](https://cloud.google.com/storage/docs/public-datasets/sentinel-2)
- [Earth Engine Data Catalog](https://developers.google.com/earth-engine/datasets/catalog/sentinel-2)
- [Landsat on Google Cloud](https://www.gearthblog.com/blog/archives/2016/10/landsat-sentinel-2-data-now-google-cloud.html)

### Third-Party Tools
- [Apache Sedona GitHub](https://github.com/apache/sedona)
- [GeoServer Docker Images](https://hub.docker.com/r/osgeolive/geoserver)
- [GDAL/OGR Documentation](https://gdal.org/)
- [PostGIS Documentation](https://postgis.net/)

### Cost Analysis & Comparisons
- [Vertex AI Cost Breakdown](https://www.pump.co/blog/google-vertex-ai-pricing)
- [Serverless Cost Optimization](https://ochk.cloud/blog/cost-effective-serverless-google-cloud-run)
- [Gemini API Pricing Guide](https://ai.google.dev/gemini-api/docs/pricing)
- [LLM API Pricing Comparison](https://intuitionlabs.ai/articles/llm-api-pricing-comparison-2025)

### Architecture Patterns
- [Choosing Query Engine for Geospatial](https://forrest.nyc/choosing-the-right-query-engine-for-cloud-native-geospatial-analytics/)
- [Raster Spatial Joins at Scale](https://wherobots.com/blog/raster-spatial-joins-at-scale-google-earth-engine-bigquery-vs-apache-sedona-wherobots/)
- [Serverless Architecture Patterns](https://americanchase.com/serverless-architecture-patterns/)

### Federal Compliance
- [FedRAMP Implementation Guide](https://cloud.google.com/architecture/fedramp-implementation-guide)
- [Claude on Vertex AI FedRAMP](https://www.anthropic.com/news/claude-on-google-cloud-fedramp-high)
- [Google Cloud FedRAMP High Services](https://cloud.google.com/blog/topics/customers/google-cloud-platform-is-now-fedramp-high-authorized)

---

**Document Status:** Draft for Review
**Next Review Date:** January 2026
**Owner:** Digital Twin Architecture Team
**Stakeholders:** USDA Forest Service IT, Fire Recovery Program Managers, Federal Compliance Office
