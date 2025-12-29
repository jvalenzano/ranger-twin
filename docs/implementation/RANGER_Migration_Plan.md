# RANGER Federal RAG Deployment: Region Migration & Parameterization Plan

**Document Version:** 1.0  
**Date:** December 28, 2025  
**Status:** Strategic Guidance (Ready for Implementation)  
**Target Audience:** Tech lead, cloud architects, RANGER development team

---

## Executive Summary

RANGER is currently deployed to `europe-west3` (Frankfurt) for demo purposes, but this region is **unsuitable for production federal workloads** due to data residency and FedRAMP compliance constraints. This plan provides a concrete, parameterized approach to:

1. Maintain `europe-west3` as a **safe, non-sensitive demo environment** (weeks 0–6)
2. Develop and validate against **US Preview regions** (`us-west1`) **in parallel** (weeks 1–4)
3. **Request allowlist access** to US GA regions (`us-central1`, `us-east4`) **immediately** (week 0)
4. **Execute zero-downtime migration** once US region is approved (weeks 4–6+)
5. **Minimize rework** through region-parameterized infrastructure

---

## Part 1: Region Selection & Allowlist Strategy

### Recommended Path

**Short-term (Weeks 0–6, Demo):**
- Keep `europe-west3` for **non-sensitive, demo-grade content only**
- Begin development/validation against `us-west1` (Preview) **in parallel**
- File allowlist request for `us-central1` (preferred) or `us-east4` (fallback)

**Medium-term (Weeks 4–8, Pre-prod):**
- Once `us-central1` allowlisted → migrate to that region for production setup
- `us-west1` becomes staging/validation environment
- EU region decommissioned for RANGER (used only if allowlist delayed beyond week 8)

**Production (Post-ATO):**
- `us-central1` is home region (or `us-east4` if Central is capacity-constrained)
- FedRAMP boundary explicitly lists US region(s)
- All operational data (NEPA, BAER, timber cruising records) in US only

### Why `us-central1` over `us-east4`?

- **Geography:** Iowa (us-central1) is closer to USDA Forest Service HQ (USDA East Building, Washington DC) than Virginia (us-east4)
- **Latency:** ~70ms us-central1 to DC vs ~20ms us-east4 to DC (marginal difference)
- **Capacity:** us-central1 typically handles midwest-heavy workloads; us-east4 more heavily subscribed
- **Precedent:** More federal/gov-cloud projects running in us-central1 historically

**Fallback:** us-east4 is equally FedRAMP-eligible; use if allowlist approval for us-central1 is slow.

### Allowlist Request Process & Timeline

**Action: Email allowlist request immediately (Week 0)**

Send to: `vertex-ai-rag-engine-support@google.com`

**Email template:**

```
Subject: Vertex AI RAG Engine Allowlist Request - US Federal Workload (RANGER, USDA Forest Service)

Dear Vertex AI RAG Engine Support Team,

We are requesting allowlist access to Vertex AI RAG Engine in us-central1 (and optionally us-east4) 
for a federal AI system (RANGER) in support of U.S. Forest Service post-fire recovery operations.

PROJECT DETAILS:
- Project ID: ranger-twin-dev
- Organization: TechTrend, Inc. (Google Cloud Partner)
- Customer Agency: U.S. Department of Agriculture, Forest Service
- Use Case: Retrieval-augmented generation over federal regulatory documents (NEPA, BAER, timber cruising)
- Expected Scale: ~20 source documents, ~500k-1M tokens indexed, <100 queries/day in demo, scaling to 1000+ in production
- Timeline: Demo deadline Q1 2026, production ATO by Q2 2026
- FedRAMP Status: Building toward FedRAMP High alignment (USDA is sponsor)

ARCHITECTURE:
- Vertex AI RAG Engine for document retrieval (4 corpora: NEPA, burn severity, timber salvage, trail infrastructure)
- Gemini 2.0 Flash for grounded answer generation
- ADK agents for specialized domain tasks (burn analyst, trail assessor, etc.)
- Cloud Run service mesh (co-located in target region)

RATIONALE FOR US CENTRAL1:
- Data residency requirement: all operational data must be in US per USDA/FedRAMP boundary
- Currently staging in europe-west3 for demo only; production must move to US region
- Requesting us-central1 as primary, us-east4 as fallback

REQUEST:
- Allowlist ranger-twin-dev project for Vertex AI RAG Engine in us-central1
- Confirm timeline for approval (target: within 2-3 weeks if possible)
- Confirm any quota/capacity implications for expected scale

Thank you,
[Your Name / Tech Lead Title]
[Google Cloud Partner Account Team: include if you have assigned account manager]
```

**Expected timeline:** 2–4 weeks based on capacity and your Google account team priority. Federal/FedRAMP workloads typically expedited.

**Parallel action:** Loop in your **Google Cloud federal account team** (PSO, solutions architect assigned to ranger-twin-dev) to escalate; they can often accelerate allowlist requests.

---

## Part 2: Codebase Parameterization Strategy

### Goal

Make region a **single, swappable config value** so you can migrate from `europe-west3` → `us-west1` → `us-central1` with **zero code changes**.

### Current State

```
knowledge/manifest.yaml
├── project: ranger-twin-dev
├── location: europe-west3        ← HARDCODED
├── gcs_bucket: gs://ranger-knowledge-base-eu/
└── corpora:
    ├── nepa: {id: 2305843009213693952, ...}
    ├── burn_severity: {id: 4611686018427387904, ...}
    ...
```

Every corpus ID is tied to `europe-west3`. Corpus IDs are **not portable** across regions.

### Target State

```
knowledge/manifest.yaml
├── environments:
│   ├── demo:           {region: europe-west3, bucket: ranger-knowledge-base-eu, ...}
│   ├── staging:        {region: us-west1, bucket: ranger-knowledge-base-west, ...}
│   ├── prod:           {region: us-central1, bucket: ranger-knowledge-base-central, ...}
└── corpora:
    ├── nepa: {display_name: "NEPA Regulations", gcs_path: "nepa/", ...}
    ├── burn_severity: {...}
    ...
```

Corpus IDs are **generated dynamically** per environment at deploy time.

---

## Part 3: Implementation—Infrastructure Parameterization

### 3.1 Enhanced `manifest.yaml` (Multi-Environment Support)

**File: `knowledge/manifest.yaml`**

```yaml
project_id: ranger-twin-dev

# Multi-environment configuration
environments:
  demo:
    region: europe-west3
    gcs_bucket: ranger-knowledge-base-eu
    description: "Demo environment with non-sensitive test data"
    rag_config:
      embedding_model: text-embedding-005
      chunk_size: 512
      chunk_overlap: 100
  
  staging:
    region: us-west1
    gcs_bucket: ranger-knowledge-base-west
    description: "Staging environment (Preview region) for pre-prod validation"
    rag_config:
      embedding_model: text-embedding-005
      chunk_size: 512
      chunk_overlap: 100
  
  prod:
    region: us-central1
    gcs_bucket: ranger-knowledge-base-central
    description: "Production environment (allowlisted, FedRAMP-aligned)"
    rag_config:
      embedding_model: text-embedding-005
      chunk_size: 512
      chunk_overlap: 100
    fedramp_compliant: true

# Corpus templates (environment-agnostic)
corpora:
  nepa:
    display_name: "NEPA Regulations & Forest Service Handbook"
    description: "40 CFR Part 1500, FSH 1900.12, etc."
    gcs_path: nepa/
    documents:
      - source_url: "https://www.fs.fed.us/emc/nfma/includes/fsh1909.13.pdf"
        file_name: "FSH_1909.13_Pre-Decisional_Processes.pdf"
        tier: 1
      - source_url: "https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P100NN6Z.TXT"
        file_name: "40_CFR_1500_1508.pdf"
        tier: 1

  burn_severity:
    display_name: "Burn Severity & Post-Fire Recovery"
    description: "BAER protocols, MTBS data standards, debris flow analysis"
    gcs_path: burn_severity/
    documents:
      - source_url: "https://www.fs.fed.us/geology/hazards/rapid_risk_assessment.html"
        file_name: "BAER_Handbook_2025.pdf"
        tier: 1

  timber_salvage:
    display_name: "Timber Salvage & Cruise Methodology"
    description: "Cruise instructions, timber stand improvement, economic recovery"
    gcs_path: timber_salvage/
    documents:
      - source_url: "https://www.fs.fed.us/forestmanagement/harvest.html"
        file_name: "Timber_Cruise_Instructions_v3.pdf"
        tier: 1

  trail_infrastructure:
    display_name: "Trail & Infrastructure Assessment"
    description: "FSTAG standards, accessibility guidelines, post-fire prioritization"
    gcs_path: trail_infrastructure/
    documents:
      - source_url: "https://www.fstag.org/pdfs/FSTAG_Standards.pdf"
        file_name: "FSTAG_Standards_v2.pdf"
        tier: 1
```

### 3.2 Environment-Aware Config Loader

**File: `knowledge/config.py`**

```python
import os
import yaml
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class RagConfig:
    embedding_model: str
    chunk_size: int
    chunk_overlap: int

@dataclass
class EnvironmentConfig:
    environment_name: str
    region: str
    gcs_bucket: str
    description: str
    rag_config: RagConfig
    fedramp_compliant: bool = False

class ManifestLoader:
    def __init__(self, manifest_path: str = "knowledge/manifest.yaml"):
        with open(manifest_path, 'r') as f:
            self.manifest = yaml.safe_load(f)
        self.project_id = self.manifest['project_id']
    
    def get_environment(self, env_name: str = None) -> EnvironmentConfig:
        """Load environment config from manifest or from RANGER_ENV variable."""
        
        # Priority: explicit arg > env var > default
        if env_name is None:
            env_name = os.getenv('RANGER_ENV', 'demo')
        
        if env_name not in self.manifest['environments']:
            raise ValueError(f"Environment '{env_name}' not found in manifest. "
                           f"Available: {list(self.manifest['environments'].keys())}")
        
        env_data = self.manifest['environments'][env_name]
        rag_config = RagConfig(
            embedding_model=env_data['rag_config']['embedding_model'],
            chunk_size=env_data['rag_config']['chunk_size'],
            chunk_overlap=env_data['rag_config']['chunk_overlap']
        )
        
        return EnvironmentConfig(
            environment_name=env_name,
            region=env_data['region'],
            gcs_bucket=env_data['gcs_bucket'],
            description=env_data['description'],
            rag_config=rag_config,
            fedramp_compliant=env_data.get('fedramp_compliant', False)
        )
    
    def get_corpus_template(self, corpus_name: str) -> Dict[str, Any]:
        """Get corpus template (region-agnostic, IDs filled at deploy time)."""
        if corpus_name not in self.manifest['corpora']:
            raise ValueError(f"Corpus '{corpus_name}' not found")
        return self.manifest['corpora'][corpus_name]
    
    def list_corpora(self) -> list:
        return list(self.manifest['corpora'].keys())
```

### 3.3 Environment Variable Setup

**File: `.env.demo`**

```bash
export RANGER_ENV=demo
export GCP_PROJECT=ranger-twin-dev
export PYTHONPATH="${PWD}:${PYTHONPATH}"
```

**File: `.env.staging`**

```bash
export RANGER_ENV=staging
export GCP_PROJECT=ranger-twin-dev
export PYTHONPATH="${PWD}:${PYTHONPATH}"
```

**File: `.env.prod`**

```bash
export RANGER_ENV=prod
export GCP_PROJECT=ranger-twin-dev
export PYTHONPATH="${PWD}:${PYTHONPATH}"
```

**Usage:**

```bash
# Development (demo)
source .env.demo
python knowledge/scripts/5_verify_corpora.py

# Pre-prod validation (staging)
source .env.staging
python knowledge/scripts/5_verify_corpora.py

# Production
source .env.prod
python knowledge/scripts/5_verify_corpora.py
```

---

## Part 4: Implementation—Knowledge Ingestion Pipeline (Region-Aware)

### 4.1 Refactored `2_sync_to_gcs.py`

**File: `knowledge/scripts/2_sync_to_gcs.py`**

```python
#!/usr/bin/env python3
"""
Sync documents from manifest sources to region-specific GCS bucket.
Uses RANGER_ENV to determine target region and bucket.
"""

import os
import sys
import yaml
import logging
from pathlib import Path
from google.cloud import storage

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import ManifestLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GcsSync:
    def __init__(self):
        loader = ManifestLoader()
        self.project_id = loader.project_id
        self.env_config = loader.get_environment()  # Reads RANGER_ENV
        self.storage_client = storage.Client(project=self.project_id)
        self.bucket = self.storage_client.bucket(self.env_config.gcs_bucket)
        
        logger.info(f"Initialized GCS sync for environment: {self.env_config.environment_name}")
        logger.info(f"Target region: {self.env_config.region}")
        logger.info(f"Target bucket: gs://{self.env_config.gcs_bucket}/")
    
    def ensure_bucket_exists(self):
        """Create GCS bucket if it doesn't exist."""
        if not self.bucket.exists():
            logger.info(f"Creating bucket {self.bucket.name} in region {self.env_config.region}...")
            self.bucket.location = self.env_config.region
            self.bucket.create()
        else:
            logger.info(f"Bucket {self.bucket.name} already exists")
    
    def sync_corpus(self, corpus_name: str, local_dir: Path):
        """Upload all PDFs from local_dir to gs://{bucket}/{corpus_name}/"""
        
        corpus_gcs_prefix = f"gs://{self.bucket.name}/{corpus_name}/"
        logger.info(f"Syncing {corpus_name} from {local_dir} → {corpus_gcs_prefix}")
        
        if not local_dir.exists():
            logger.warning(f"Local directory {local_dir} does not exist, skipping")
            return
        
        pdf_count = 0
        for pdf_file in local_dir.glob("*.pdf"):
            blob_name = f"{corpus_name}/{pdf_file.name}"
            blob = self.bucket.blob(blob_name)
            
            logger.info(f"  Uploading {pdf_file.name}...")
            blob.upload_from_filename(str(pdf_file))
            pdf_count += 1
        
        logger.info(f"  Synced {pdf_count} PDFs to {corpus_gcs_prefix}")
    
    def sync_all_corpora(self, docs_dir: Path = Path("knowledge/docs")):
        """Sync all corpora from local docs/ directory."""
        
        loader = ManifestLoader()
        corpus_names = loader.list_corpora()
        
        self.ensure_bucket_exists()
        
        for corpus_name in corpus_names:
            corpus_dir = docs_dir / corpus_name
            self.sync_corpus(corpus_name, corpus_dir)
        
        logger.info(f"Sync complete for environment '{self.env_config.environment_name}'")

if __name__ == "__main__":
    syncer = GcsSync()
    syncer.sync_all_corpora()
```

### 4.2 Refactored `3_create_corpora.py`

**File: `knowledge/scripts/3_create_corpora.py`**

```python
#!/usr/bin/env python3
"""
Create RAG corpora in environment-specific region.
Outputs corpus resource names to agent-specific .vertex_rag_config.json files.
"""

import os
import sys
import json
import logging
from pathlib import Path
import vertexai
from vertexai.preview import rag

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import ManifestLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CorpusManager:
    def __init__(self):
        loader = ManifestLoader()
        self.project_id = loader.project_id
        self.env_config = loader.get_environment()
        
        # Initialize Vertex AI with target region
        vertexai.init(project=self.project_id, location=self.env_config.region)
        logger.info(f"Initialized Vertex AI: project={self.project_id}, region={self.env_config.region}")
        
        self.loader = loader
        self.corpora_map = {}  # corpus_name -> corpus_resource_id
    
    def create_corpus(self, corpus_name: str) -> str:
        """Create a RAG corpus and return its resource ID."""
        
        corpus_template = self.loader.get_corpus_template(corpus_name)
        display_name = corpus_template['display_name']
        
        logger.info(f"Creating corpus '{corpus_name}' ({display_name})...")
        
        corpus = rag.create_corpus(display_name=display_name)
        corpus_resource_id = corpus.resource_name
        
        logger.info(f"  Created: {corpus_resource_id}")
        return corpus_resource_id
    
    def create_all_corpora(self) -> dict:
        """Create all corpora defined in manifest."""
        
        corpus_names = self.loader.list_corpora()
        
        for corpus_name in corpus_names:
            resource_id = self.create_corpus(corpus_name)
            self.corpora_map[corpus_name] = resource_id
        
        return self.corpora_map
    
    def save_agent_config(self, agent_name: str, corpus_name: str):
        """
        Save corpus resource ID to agent-specific config file.
        E.g., agents/burn_analyst/.vertex_rag_config.json
        """
        
        if corpus_name not in self.corpora_map:
            logger.warning(f"Corpus '{corpus_name}' not in corpora_map, skipping agent config")
            return
        
        agent_dir = Path(f"agents/{agent_name}")
        agent_dir.mkdir(parents=True, exist_ok=True)
        
        config_file = agent_dir / ".vertex_rag_config.json"
        config = {
            "environment": self.env_config.environment_name,
            "region": self.env_config.region,
            "project_id": self.project_id,
            "corpus_resource_id": self.corpora_map[corpus_name],
            "corpus_name": corpus_name
        }
        
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        logger.info(f"Saved agent config: {config_file}")
    
    def setup_agents(self):
        """
        Create agent config files mapping each agent to its corpus.
        This is customizable per deployment.
        """
        
        agent_corpus_mapping = {
            "coordinator": None,  # No RAG corpus for coordinator
            "burn_analyst": "burn_severity",
            "trail_assessor": "trail_infrastructure",
            "cruising_assistant": "timber_salvage",
            "nepa_advisor": "nepa"
        }
        
        for agent_name, corpus_name in agent_corpus_mapping.items():
            if corpus_name is not None:
                self.save_agent_config(agent_name, corpus_name)

if __name__ == "__main__":
    manager = CorpusManager()
    corpora = manager.create_all_corpora()
    manager.setup_agents()
    
    logger.info("\nCorpora created successfully:")
    for corpus_name, resource_id in corpora.items():
        logger.info(f"  {corpus_name}: {resource_id}")
```

### 4.3 Refactored `4_import_documents.py`

**File: `knowledge/scripts/4_import_documents.py`**

```python
#!/usr/bin/env python3
"""
Import documents from GCS into RAG corpora.
Reads corpus IDs from agent config files (generated by script 3).
Respects chunking config from manifest.
"""

import os
import sys
import json
import logging
from pathlib import Path
import vertexai
from vertexai.preview import rag
from google.api_core.operation import Operation

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import ManifestLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentImporter:
    def __init__(self):
        loader = ManifestLoader()
        self.project_id = loader.project_id
        self.env_config = loader.get_environment()
        
        vertexai.init(project=self.project_id, location=self.env_config.region)
        logger.info(f"Initialized for region: {self.env_config.region}")
        
        self.loader = loader
    
    def load_corpus_id_from_agent(self, agent_name: str) -> str:
        """Load corpus resource ID from agent config file."""
        
        config_file = Path(f"agents/{agent_name}/.vertex_rag_config.json")
        
        if not config_file.exists():
            raise FileNotFoundError(f"Agent config not found: {config_file}")
        
        with open(config_file, 'r') as f:
            config = json.load(f)
        
        return config['corpus_resource_id']
    
    def import_corpus_documents(self, corpus_name: str):
        """Import all documents for a corpus from GCS."""
        
        # Get corpus resource ID from agent config
        # (assumes agent name matches corpus name for simplicity)
        agent_name = {
            'nepa': 'nepa_advisor',
            'burn_severity': 'burn_analyst',
            'timber_salvage': 'cruising_assistant',
            'trail_infrastructure': 'trail_assessor'
        }[corpus_name]
        
        corpus_resource_id = self.load_corpus_id_from_agent(agent_name)
        
        # Build GCS URI for this corpus
        gcs_source_uri = f"gs://{self.env_config.gcs_bucket}/{corpus_name}/*.pdf"
        
        logger.info(f"Importing corpus '{corpus_name}'...")
        logger.info(f"  Resource ID: {corpus_resource_id}")
        logger.info(f"  GCS source: {gcs_source_uri}")
        
        # Configure chunking from manifest
        rag_config = self.env_config.rag_config
        
        # Import documents
        operation: Operation = rag.import_files(
            corpus_resource_id=corpus_resource_id,
            gcs_source_uris=[gcs_source_uri],
            rag_file_chunking_config=rag.RagFileChunkingConfig(
                chunk_size=rag_config.chunk_size,
                chunk_overlap=rag_config.chunk_overlap
            ),
            request_metadata={'max_embedding_requests_per_min': 100}
        )
        
        logger.info(f"Import operation started: {operation.name}")
        logger.info("Waiting for import to complete...")
        
        result = operation.result()
        logger.info(f"Import complete: {result}")
    
    def import_all_corpora(self):
        """Import documents for all corpora."""
        
        corpus_names = self.loader.list_corpora()
        
        for corpus_name in corpus_names:
            try:
                self.import_corpus_documents(corpus_name)
            except Exception as e:
                logger.error(f"Failed to import {corpus_name}: {e}")

if __name__ == "__main__":
    importer = DocumentImporter()
    importer.import_all_corpora()
```

### 4.4 Unified Script: `0_setup_environment.sh`

**File: `knowledge/scripts/0_setup_environment.sh`**

One-command setup for any environment:

```bash
#!/bin/bash
set -e

# Usage: ./0_setup_environment.sh demo|staging|prod

ENVIRONMENT=${1:-demo}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "RANGER RAG Setup: $ENVIRONMENT"
echo "=========================================="

# Load environment variables
source "$REPO_ROOT/.env.$ENVIRONMENT"

echo "Environment: $RANGER_ENV"
echo "Region: $(python3 -c "from config import ManifestLoader; print(ManifestLoader().get_environment().region)")"
echo ""

# Run setup pipeline
echo "[1/5] Downloading documents..."
python3 "$SCRIPT_DIR/1_download_documents.py"

echo "[2/5] Syncing to GCS..."
python3 "$SCRIPT_DIR/2_sync_to_gcs.py"

echo "[3/5] Creating corpora..."
python3 "$SCRIPT_DIR/3_create_corpora.py"

echo "[4/5] Importing documents..."
python3 "$SCRIPT_DIR/4_import_documents.py"

echo "[5/5] Verifying setup..."
python3 "$SCRIPT_DIR/5_verify_corpora.py"

echo ""
echo "=========================================="
echo "Setup complete for environment: $ENVIRONMENT"
echo "=========================================="
```

**Usage:**

```bash
# Demo
bash knowledge/scripts/0_setup_environment.sh demo

# Staging (us-west1 Preview)
bash knowledge/scripts/0_setup_environment.sh staging

# Production (us-central1, once allowlisted)
bash knowledge/scripts/0_setup_environment.sh prod
```

---

## Part 5: Agent Configuration (Region-Aware)

### 5.1 Agent Config Example

Each agent loads its corpus ID from `.vertex_rag_config.json`, generated by script 3.

**File: `agents/burn_analyst/.vertex_rag_config.json`** (auto-generated)

```json
{
  "environment": "demo",
  "region": "europe-west3",
  "project_id": "ranger-twin-dev",
  "corpus_resource_id": "projects/1058891520442/locations/europe-west3/ragCorpora/4611686018427387904",
  "corpus_name": "burn_severity"
}
```

### 5.2 Agent Initialization (Example)

**File: `agents/burn_analyst/burn_analyst.py`** (excerpt)

```python
import json
import vertexai
from pathlib import Path
from vertexai.preview import rag

class BurnAnalystAgent:
    def __init__(self):
        # Load config (auto-generated by setup script)
        config_path = Path(__file__).parent / ".vertex_rag_config.json"
        with open(config_path) as f:
            self.config = json.load(f)
        
        # Initialize Vertex AI with config's region
        vertexai.init(
            project=self.config['project_id'],
            location=self.config['region']
        )
        
        self.corpus_resource_id = self.config['corpus_resource_id']
    
    def retrieve_and_answer(self, question: str) -> str:
        """Query RAG corpus and generate answer."""
        
        # Retrieval
        response = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=self.corpus_resource_id)],
            text=question,
            rag_retrieval_config=rag.RagRetrievalConfig(top_k=5)
        )
        
        # Generation (Gemini + retrieved context)
        # ... (as shown in previous guidance)
```

---

## Part 6: Migration Timeline & Critical Path

### Timeline Overview

```
Week 0 (Now)
├─ File RAG Engine allowlist request → vertex-ai-rag-engine-support@google.com
├─ Implement Python parameterization (Part 3–4)
└─ Finish demo setup in europe-west3

Week 1–2
├─ Test parameterized pipeline against europe-west3 (demo)
├─ Set up us-west1 (staging) environment
├─ Begin agent development against staging
└─ Follow up on allowlist request (email PSO if needed)

Week 3–4
├─ Conduct demo with Forest Service (europe-west3, non-operational data)
├─ Validate all agents against staging (us-west1)
└─ Prepare for allowlist approval (expected end of week 3 or week 4)

Week 5–6
├─ Once allowlisted: run `bash knowledge/scripts/0_setup_environment.sh prod`
├─ Migrate to us-central1 (all operational data)
├─ Update Cloud Run deployment to us-central1 region
├─ Conduct security/compliance audit (pre-ATO)
└─ Hand off to Forest Service for integration

Post Week 6
├─ ATO package development (system security plan, etc.)
└─ Production hardening (load testing, DR, monitoring)
```

### Critical Dependencies

- **Blocker:** RAG Engine allowlist approval (2–4 weeks, can parallelize with staging work)
- **Parallelizable:** Staging setup in us-west1 (doesn't require allowlist, uses Preview)
- **Path:** If allowlist takes >4 weeks, run production in us-west1 (Preview) with documented risk acceptance until us-central1 is ready

---

## Part 7: Data Migration: Europe-West3 → US Region

### Cross-Region GCS Replication

Once you're ready to move from EU to US (week 5+):

**Option A: Cloud Storage Transfer Service** (easiest)

```bash
# Create transfer job: gs://ranger-knowledge-base-eu/ → gs://ranger-knowledge-base-central/

gcloud transfer jobs create \
  --source-path=ranger-knowledge-base-eu \
  --destination-path=ranger-knowledge-base-central \
  --source-location=europe-west3 \
  --destination-location=us-central1 \
  --display-name="RANGER EU→US migration" \
  --no-delete-objects-from-source
```

**Option B: Scripted Copy** (most control)

```python
from google.cloud import storage

source_bucket = "ranger-knowledge-base-eu"
dest_bucket = "ranger-knowledge-base-central"

source_client = storage.Client()
dest_client = storage.Client()

for blob in source_client.list_blobs(source_bucket):
    source_bucket_ref = source_client.bucket(source_bucket)
    dest_bucket_ref = dest_client.bucket(dest_bucket)
    
    source_blob = source_bucket_ref.blob(blob.name)
    dest_blob = dest_bucket_ref.copy_blob(source_blob, dest_bucket_ref, blob.name)
    print(f"Copied {blob.name}")
```

### Document Re-Ingestion

After GCS files are copied:

1. Run script 3 to create new corpora in `us-central1`
2. Run script 4 to import from `gs://ranger-knowledge-base-central/`
3. Update agent configs to point to new corpus IDs (automatic via script 3)
4. Test agent retrieval against new corpora
5. Decommission EU corpora and GCS bucket

---

## Part 8: FedRAMP Compliance Checklist

- [ ] All operational data in US region (us-central1 or us-east4)
- [ ] eu-region demo environment documented as out-of-scope for ATO
- [ ] Google Cloud FedRAMP High boundary covers target region
- [ ] IAM roles follow least-privilege (service accounts per agent)
- [ ] Application Default Credentials (ADC) configured, no embedded API keys
- [ ] Encryption in transit (TLS enforced)
- [ ] Encryption at rest (Google-managed keys, upgrade to CMEK if required by ATO)
- [ ] Audit logging enabled (Cloud Logging, VPC Flow Logs)
- [ ] Vulnerability scanning configured (container images, dependencies)
- [ ] DLP (Data Loss Prevention) rules configured for sensitive patterns
- [ ] Network segmentation (VPC, firewall rules, no public IP for agents)
- [ ] Regional failover documented (backup corpora in secondary US region if needed)

---

## Part 9: Frequently Asked Questions

**Q: Why not use us-west1 (Preview) for production?**  
A: Preview regions have weaker SLAs, less operational hardening, and faster API churn. For USDA/FedRAMP, you want a GA or allowlist region with guaranteed stability.

**Q: What if allowlist approval takes >6 weeks?**  
A: Use us-west1 (Preview) for production with documented risk acceptance (noted in ATO as "interim" region). Migrate to us-central1 once allowlisted.

**Q: Can I use multi-region or dual-region GCS buckets?**  
A: Dual-region buckets must span two regions in the same continent (e.g., Frankfurt/London). You cannot have a bucket span EU and US. Use single-region buckets per environment and replicate via Transfer Service if needed.

**Q: Do corpus IDs change when I migrate regions?**  
A: Yes, corpus IDs are region-specific. You must re-create corpora in the new region and re-import documents. This is why parameterized ingestion is critical.

**Q: Can I test migration in advance?**  
A: Yes, run the entire pipeline in us-west1 (staging) first. Once you're comfortable with the process there, running it in us-central1 is identical.

**Q: What about disaster recovery across regions?**  
A: For production (post-ATO), consider replicating RAG corpora to a secondary US region (e.g., us-east4) using the parameterized pipeline and automated failover logic.

---

## Summary: Next Steps

1. **Week 0 (Now):**
   - [ ] Send allowlist email to `vertex-ai-rag-engine-support@google.com`
   - [ ] Pull this plan into your tech team (sync, review)
   - [ ] Start implementing parameterization (manifest.yaml, config.py, refactored scripts)

2. **Week 1–2:**
   - [ ] Test parameterized pipeline with demo environment (europe-west3)
   - [ ] Set up staging environment (us-west1)
   - [ ] Begin agent development and testing

3. **Week 3–4:**
   - [ ] Conduct Forest Service demo
   - [ ] Finalize staging validation
   - [ ] Follow up on allowlist approval

4. **Week 5–6 (Once Allowlisted):**
   - [ ] Migrate to us-central1
   - [ ] Hand off to Forest Service for integration testing
   - [ ] Begin ATO security assessment

---

**Document prepared for:** RANGER federal AI system (USDA Forest Service)  
**Infrastructure lead:** TechTrend, Inc.  
**Date prepared:** December 28, 2025
