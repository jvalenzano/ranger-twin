# RANGER Data Ingestion Adapters

**Status:** Architectural Specification
**Version:** 1.0.0
**Last Updated:** 2025-12-21
**Purpose:** Define the adapter pattern for normalizing external data sources into RANGER's internal schema

> [!IMPORTANT]
> **Phase Context:** This document specifies Phase 2+ architecture for real data integration.
> 
> **Phase 1 Reality:** All adapters return fixture data from `data/fixtures/cedar-creek/`.
> The adapter *interfaces* are implemented, but they load static JSON instead of calling
> external APIs.
> 
> **See:** [`DATA-SIMULATION-STRATEGY.md`](../DATA-SIMULATION-STRATEGY.md) for the authoritative Phase 1 scope.

---

## 1. Overview

RANGER is repositioning as a **nerve center** that orchestrates post-fire forest recovery by integrating data from existing USFS field applications and third-party data sources. Rather than building custom sensors, RANGER consumes outputs from:

- **InciWeb** - Public fire information system
- **IRWIN** - Integrated Reporting of Wildland-Fire Information
- **Survey123** - Esri's field data collection platform
- **ArcGIS Collector** - Mobile field mapping
- **Satellite platforms** - Sentinel-2, Landsat, MODIS

Data ingestion adapters serve as **translation layers** that normalize diverse external formats into RANGER's internal schema, ensuring the multi-agent system receives consistent, well-structured inputs.

### Key Principles

1. **Separation of Concerns:** Adapters handle format translation; agents handle reasoning
2. **Data Tier Awareness:** All ingested data is tagged with confidence and tier classification
3. **Provenance Tracking:** Every data point retains source metadata for citation chains
4. **Graceful Degradation:** Adapters fail safely and report data quality issues
5. **Phase 1 Reality:** Initial implementation uses simulated data; adapters provide the interface for future real integration

---

### Design Philosophy: "Nerve Center, Not Sensors"

> RANGER's value comes from orchestrating intelligence, not from building sensors or replicating existing visualization tools.

This foundational principle shapes every architectural decision:

**What RANGER Does:**
- Orchestrates multi-agent workflows for post-fire recovery decisions
- Provides AI-powered contextual briefings with confidence scoring
- Coordinates crew assignments and resource allocation
- Exports to legacy USFS systems (TRACS, FSVeg)
- Links out to authoritative external tools for specialized visualizations

**What RANGER Does NOT Do:**
- Build custom satellite imagery pipelines (use NASA FIRMS, Sentinel Hub)
- Replicate complex fire mapping tools (link to NASA FIRMS instead)
- Operate field sensors (consume from Survey123, Collector, IRWIN)
- Store authoritative fire perimeter data (adapter from InciWeb)

**Practical Application:**

| Instead of Building... | RANGER Integrates... |
|------------------------|---------------------|
| Real-time fire hotspot visualization | [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/usfs/map/) deep links |
| Satellite imagery processing | Google Earth Engine, Sentinel Hub APIs |
| Field data collection forms | Survey123, ArcGIS Collector webhooks |
| Fire incident databases | InciWeb, IRWIN adapters |
| Historical fire perimeters | NIFC, MTBS data services |

**Why This Matters:**

1. **Focus development effort** on unique value: agentic workflows, reasoning transparency, decision support
2. **Leverage domain expertise** of specialized systems maintained by NASA, USFS, NOAA
3. **Reduce maintenance burden** by not duplicating functionality
4. **Ensure data authority** by linking to official sources rather than caching copies
5. **Ship faster** by composing existing tools rather than building from scratch

The adapter pattern (Section 3) implements this philosophy—each adapter acts as a translation layer, normalizing diverse external formats into RANGER's Common Data Schema for agent consumption, while deep links in the UI connect users to authoritative visualization tools.

---

## 2. Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL DATA SOURCES                          │
├─────────────┬─────────────┬─────────────┬─────────────┬──────────────┤
│   InciWeb   │    IRWIN    │  Survey123  │  Collector  │  Sentinel-2  │
│   (REST)    │   (REST)    │   (REST)    │  (FeatureS) │   (GEE/S3)   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬───────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ADAPTER LAYER (packages/adapters)             │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤
│ InciWeb      │ IRWIN        │ Survey123    │ Collector    │Satellite│
│ Adapter      │ Adapter      │ Adapter      │ Adapter      │Adapter  │
│              │              │              │              │         │
│ - Auth       │ - Auth       │ - OAuth      │ - Token      │- API Key│
│ - Parse HTML │ - Parse JSON │ - Parse JSON │ - Parse GDB  │- Parse  │
│ - Map fields │ - Map fields │ - Map fields │ - Map fields │  COG    │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴────┬────┘
       │              │              │              │            │
       └──────────────┴──────────────┴──────────────┴────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │  COMMON DATA SCHEMA (CDS)     │
                    │  - RangerSpatialFeature       │
                    │  - RangerObservation          │
                    │  - RangerMediaReference       │
                    │  - RangerProvenanceMetadata   │
                    └────────────┬───────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────────┐
                    │   API GATEWAY (port 8000)     │
                    │   /api/v1/ingest/             │
                    │   - Validation                │
                    │   - Deduplication             │
                    │   - Redis storage             │
                    └────────────┬───────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────────┐
                    │      AGENT CONSUMPTION        │
                    │  - BurnAnalyst                │
                    │  - TrailAssessor              │
                    │  - CruisingAssistant          │
                    │  - NEPAAdvisor                │
                    └───────────────────────────────┘
```

---

## 3. Adapter Interface

All adapters implement the `BaseDataAdapter` abstract class, ensuring consistent behavior across sources.

### Python Abstract Base Class

**Location:** `packages/adapters/ranger_adapters/base.py`

```python
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum
from pydantic import BaseModel

class DataTier(str, Enum):
    """Data quality tier classification from AGENT-MESSAGING-PROTOCOL.md"""
    TIER_1 = "1"  # 90%+ confidence - Direct use, no hedging
    TIER_2 = "2"  # 70-85% confidence - Caution-flagged
    TIER_3 = "3"  # <70% confidence - Demo only, synthetic

class AdapterStatus(str, Enum):
    """Adapter operational status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    FAILED = "failed"

class ProvenanceMetadata(BaseModel):
    """Provenance tracking for citations and confidence ledger"""
    source_system: str  # "InciWeb", "IRWIN", "Survey123", etc.
    source_id: str  # External record ID
    source_uri: Optional[str] = None  # Direct link if available
    ingestion_timestamp: datetime
    data_timestamp: datetime  # When the data was created at source
    data_tier: DataTier
    confidence: float  # 0.0-1.0
    notes: Optional[str] = None

class BaseDataAdapter(ABC):
    """
    Abstract base class for all RANGER data ingestion adapters.

    Responsibilities:
    - Authenticate with external system
    - Fetch raw data
    - Transform to Common Data Schema
    - Tag with provenance metadata
    - Report health status
    """

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize adapter with configuration.

        Args:
            config: Dictionary containing credentials, endpoints, etc.
        """
        self.config = config
        self.status = AdapterStatus.HEALTHY
        self.last_sync: Optional[datetime] = None
        self.error_count = 0

    @abstractmethod
    async def authenticate(self) -> bool:
        """
        Authenticate with the external system.

        Returns:
            bool: True if authentication succeeded, False otherwise
        """
        pass

    @abstractmethod
    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch raw data from the external system.

        Args:
            filters: Optional query filters (fire_id, date_range, etc.)

        Returns:
            List of raw records in their native format

        Raises:
            AdapterFetchError: If the fetch operation fails
        """
        pass

    @abstractmethod
    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[BaseModel]:
        """
        Transform raw data to Common Data Schema models.

        Args:
            raw_data: List of raw records from fetch_raw()

        Returns:
            List of CDS model instances (RangerSpatialFeature, RangerObservation, etc.)

        Raises:
            AdapterTransformError: If transformation fails
        """
        pass

    @abstractmethod
    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        """
        Extract provenance metadata from a raw record.

        Args:
            raw_record: Single raw record

        Returns:
            ProvenanceMetadata with source tracking and confidence tier
        """
        pass

    async def ingest(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Full ingestion pipeline: authenticate → fetch → transform → tag.

        This is the primary method called by the API Gateway.

        Args:
            filters: Optional query filters

        Returns:
            Dictionary with ingestion results:
            {
                "adapter": str,
                "status": str,
                "records_fetched": int,
                "records_transformed": int,
                "errors": List[str],
                "duration_seconds": float
            }
        """
        start_time = datetime.now()
        results = {
            "adapter": self.__class__.__name__,
            "status": "success",
            "records_fetched": 0,
            "records_transformed": 0,
            "errors": [],
            "duration_seconds": 0.0
        }

        try:
            # Authenticate
            if not await self.authenticate():
                raise AdapterAuthError(f"{self.__class__.__name__} authentication failed")

            # Fetch
            raw_data = await self.fetch_raw(filters)
            results["records_fetched"] = len(raw_data)

            # Transform
            transformed = await self.transform_to_cds(raw_data)
            results["records_transformed"] = len(transformed)

            # Update status
            self.last_sync = datetime.now()
            self.status = AdapterStatus.HEALTHY

        except Exception as e:
            self.error_count += 1
            self.status = AdapterStatus.FAILED if self.error_count > 3 else AdapterStatus.DEGRADED
            results["status"] = "error"
            results["errors"].append(str(e))

        finally:
            results["duration_seconds"] = (datetime.now() - start_time).total_seconds()

        return results

    def health_check(self) -> Dict[str, Any]:
        """
        Report adapter health status.

        Returns:
            Dictionary with health metrics
        """
        return {
            "adapter": self.__class__.__name__,
            "status": self.status.value,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "error_count": self.error_count
        }


class AdapterError(Exception):
    """Base exception for adapter errors"""
    pass

class AdapterAuthError(AdapterError):
    """Authentication failure"""
    pass

class AdapterFetchError(AdapterError):
    """Data fetch failure"""
    pass

class AdapterTransformError(AdapterError):
    """Data transformation failure"""
    pass
```

---

## 4. Common Data Schema (CDS)

The Common Data Schema normalizes all external data into consistent internal models. These models are designed to support the `AgentBriefingEvent` proof layer and enable cross-agent synthesis.

**Location:** `packages/twin-core/twin_core/models/cds.py`

### Core Models

```python
from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from geojson_pydantic import Feature, Point, LineString, Polygon

class RangerProvenanceMetadata(BaseModel):
    """Provenance tracking for all ingested data"""
    source_system: str  # "InciWeb", "IRWIN", "Survey123", etc.
    source_id: str  # External record ID
    source_uri: Optional[str] = None
    ingestion_timestamp: datetime
    data_timestamp: datetime
    data_tier: Literal["1", "2", "3"]
    confidence: float = Field(ge=0.0, le=1.0)
    notes: Optional[str] = None


class RangerSpatialFeature(BaseModel):
    """
    Normalized spatial data (points, lines, polygons).

    Used for: Fire perimeters, burn severity zones, trail segments,
    timber plot locations, infrastructure damage points.
    """
    feature_id: str  # Internal RANGER UUID
    feature_type: str  # "fire_perimeter", "burn_sector", "trail_segment", etc.
    geometry: Feature  # GeoJSON Feature with geometry and properties
    attributes: Dict[str, Any]  # Domain-specific attributes
    provenance: RangerProvenanceMetadata

    # Temporal bounds (when does this feature exist?)
    valid_from: datetime
    valid_to: Optional[datetime] = None  # None = still valid

    # Spatial metadata
    coordinate_system: str = "EPSG:4326"  # Default to WGS84
    accuracy_meters: Optional[float] = None


class RangerObservation(BaseModel):
    """
    Normalized field observations and measurements.

    Used for: Field notes, tree measurements, damage assessments,
    photo annotations, audio transcriptions.
    """
    observation_id: str  # Internal RANGER UUID
    observation_type: str  # "field_note", "tree_measurement", "damage_assessment", etc.
    observer: Optional[str] = None  # Who made the observation?
    location: Optional[Point] = None  # Where was the observation made?
    timestamp: datetime  # When was the observation made?

    # Observation content
    content: Dict[str, Any]  # Structured observation data
    free_text: Optional[str] = None  # Unstructured notes

    # Linked features
    related_features: List[str] = []  # List of RangerSpatialFeature IDs

    provenance: RangerProvenanceMetadata


class RangerMediaReference(BaseModel):
    """
    Normalized media file references.

    Used for: Photos, videos, audio recordings, PDFs, satellite imagery.
    """
    media_id: str  # Internal RANGER UUID
    media_type: Literal["photo", "video", "audio", "document", "raster"]
    mime_type: str  # "image/jpeg", "audio/m4a", etc.

    # Storage location
    storage_uri: str  # S3, GCS, local file path, or external URL
    thumbnail_uri: Optional[str] = None

    # Spatial/temporal context
    location: Optional[Point] = None
    timestamp: datetime

    # Metadata
    file_size_bytes: Optional[int] = None
    duration_seconds: Optional[float] = None  # For audio/video
    dimensions: Optional[Dict[str, int]] = None  # {"width": 1920, "height": 1080}

    # Linked observations/features
    related_observations: List[str] = []
    related_features: List[str] = []

    provenance: RangerProvenanceMetadata


class RangerTemporalEvent(BaseModel):
    """
    Normalized temporal events and status changes.

    Used for: Fire discovery, containment, project milestones,
    work order completion, regulatory deadlines.
    """
    event_id: str  # Internal RANGER UUID
    event_type: str  # "fire_discovery", "containment", "work_order_complete", etc.
    event_timestamp: datetime
    event_description: str

    # Event attributes
    attributes: Dict[str, Any]

    # Linked entities
    related_features: List[str] = []
    related_observations: List[str] = []

    provenance: RangerProvenanceMetadata
```

### Domain-Specific Extensions

```python
class BurnSeverityFeature(RangerSpatialFeature):
    """Extended model for burn severity data"""
    feature_type: Literal["burn_sector"] = "burn_sector"

    # Required attributes (validated)
    severity: Literal["UNBURNED", "LOW", "MODERATE", "HIGH"]
    severity_class: int = Field(ge=1, le=4)
    acres: float
    dnbr_mean: Optional[float] = None  # dNBR value if available


class TrailDamageObservation(RangerObservation):
    """Extended model for trail damage assessments"""
    observation_type: Literal["trail_damage"] = "trail_damage"

    # Required content fields
    damage_type: Literal["BRIDGE_FAILURE", "DEBRIS_FLOW", "HAZARD_TREES", "TREAD_EROSION", "SIGNAGE"]
    severity: int = Field(ge=1, le=5)
    estimated_cost: float
    crew_days: int


class TimberPlotObservation(RangerObservation):
    """Extended model for timber cruise data"""
    observation_type: Literal["timber_plot"] = "timber_plot"

    # Required content fields
    plot_id: str
    trees: List[Dict[str, Any]]  # List of tree measurements
    plot_acres: float
```

---

## 5. Adapter Specifications

### 5.1 InciWebAdapter

**Purpose:** Ingest fire information from the InciWeb public fire information system

**Data Source:** https://inciweb.nwcg.gov/
**Authentication:** None (public API)
**Sync Strategy:** Polling (hourly)
**Data Tier:** Tier 1 (90%+ confidence - official USFS data)

**Implementation Stub:**

```python
class InciWebAdapter(BaseDataAdapter):
    """
    Adapter for InciWeb fire information system.

    Ingests: Fire perimeters, containment status, incident metadata
    Output: RangerSpatialFeature (fire_perimeter), RangerTemporalEvent
    """

    async def authenticate(self) -> bool:
        # Public API, no auth needed
        return True

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch fire incidents from InciWeb REST API.

        Filters:
            - fire_name: str
            - state: str
            - start_date: datetime
            - end_date: datetime
        """
        # Example endpoint: https://inciweb.nwcg.gov/feeds/json/active/
        pass

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[RangerSpatialFeature]:
        """
        Transform InciWeb JSON to RangerSpatialFeature.

        Mapping:
            raw["IncidentName"] → feature.attributes["fire_name"]
            raw["PercentContained"] → feature.attributes["containment_pct"]
            raw["FireDiscoveryDateTime"] → feature.valid_from
        """
        pass

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="InciWeb",
            source_id=raw_record["IncidentID"],
            source_uri=f"https://inciweb.nwcg.gov/incident/{raw_record['IncidentID']}/",
            data_tier=DataTier.TIER_1,
            confidence=0.95,
            notes="Official USFS incident data"
        )
```

---

### 5.2 IRWINAdapter

**Purpose:** Ingest wildfire incident data from IRWIN (Integrated Reporting of Wildland-Fire Information)

**Data Source:** https://irwin.doi.gov/
**Authentication:** API Key (provided by USFS)
**Sync Strategy:** Polling (every 15 minutes during active fires)
**Data Tier:** Tier 1 (90%+ confidence - authoritative federal data)

**Implementation Stub:**

```python
class IRWINAdapter(BaseDataAdapter):
    """
    Adapter for IRWIN incident reporting system.

    Ingests: Fire discovery, containment updates, resource assignments
    Output: RangerTemporalEvent, RangerSpatialFeature
    """

    async def authenticate(self) -> bool:
        """Validate API key with IRWIN endpoint"""
        # POST to https://irwin.doi.gov/api/auth
        pass

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch incidents from IRWIN REST API.

        Filters:
            - irwin_id: str
            - state: str
            - start_date: datetime
            - end_date: datetime
        """
        # GET https://irwin.doi.gov/api/incidents
        pass

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[BaseModel]:
        """
        Transform IRWIN JSON to CDS models.

        Creates:
            - RangerTemporalEvent for discovery, containment milestones
            - RangerSpatialFeature for fire perimeters (if geometry provided)
        """
        pass

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="IRWIN",
            source_id=raw_record["irwinID"],
            source_uri=f"https://irwin.doi.gov/incident/{raw_record['irwinID']}",
            data_tier=DataTier.TIER_1,
            confidence=0.98,
            notes="Authoritative federal wildfire data"
        )
```

---

### 5.3 Survey123Adapter

**Purpose:** Ingest field survey data from Esri Survey123

**Data Source:** ArcGIS Online Feature Service
**Authentication:** OAuth 2.0 (ArcGIS Online)
**Sync Strategy:** Webhook (real-time) + Polling fallback (every 30 minutes)
**Data Tier:** Tier 1 for GPS coordinates (95%), Tier 2 for user-entered data (75%)

**Implementation Stub:**

```python
class Survey123Adapter(BaseDataAdapter):
    """
    Adapter for Esri Survey123 field data collection.

    Ingests: Field observations, photos, damage assessments
    Output: RangerObservation, RangerMediaReference
    """

    async def authenticate(self) -> bool:
        """OAuth 2.0 flow with ArcGIS Online"""
        # Follow ArcGIS OAuth pattern: https://developers.arcgis.com/documentation/mapping-apis-and-services/security/
        pass

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch survey responses from Feature Service.

        Filters:
            - survey_id: str (specific survey form)
            - submitted_after: datetime
            - bbox: List[float] (spatial filter)
        """
        # Query Feature Service REST endpoint
        pass

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[BaseModel]:
        """
        Transform Survey123 responses to CDS models.

        Creates:
            - RangerObservation for each survey response
            - RangerMediaReference for attached photos

        Confidence assignment:
            - GPS coordinates: 0.95 (Tier 1)
            - User-entered text: 0.75 (Tier 2, human error)
            - Photo metadata: 0.90 (Tier 1)
        """
        pass

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="Survey123",
            source_id=raw_record["objectId"],
            source_uri=raw_record.get("surveyLink"),
            data_tier=DataTier.TIER_2,  # User-entered data
            confidence=0.75,
            notes="Field crew submission, GPS-verified location"
        )
```

---

### 5.4 CollectorAdapter

**Purpose:** Ingest field-collected spatial features from ArcGIS Collector

**Data Source:** ArcGIS Online Feature Service
**Authentication:** OAuth 2.0 (ArcGIS Online)
**Sync Strategy:** Webhook + Polling fallback (every 30 minutes)
**Data Tier:** Tier 1 (95% confidence - GPS-verified spatial data)

**Implementation Stub:**

```python
class CollectorAdapter(BaseDataAdapter):
    """
    Adapter for ArcGIS Collector mobile field mapping.

    Ingests: Trail segments, damage points, timber plot boundaries
    Output: RangerSpatialFeature, RangerObservation
    """

    async def authenticate(self) -> bool:
        """OAuth 2.0 flow with ArcGIS Online (shared with Survey123Adapter)"""
        pass

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch features from Collector Feature Service.

        Filters:
            - layer_id: str
            - collected_after: datetime
            - bbox: List[float]
        """
        pass

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[RangerSpatialFeature]:
        """
        Transform Collector features to RangerSpatialFeature.

        Preserves:
            - Original geometry (point, line, polygon)
            - Attribute schema from feature layer
            - GPS accuracy metadata
        """
        pass

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="ArcGIS Collector",
            source_id=str(raw_record["objectId"]),
            source_uri=raw_record.get("featureUrl"),
            data_tier=DataTier.TIER_1,
            confidence=0.95,
            notes=f"GPS accuracy: {raw_record.get('accuracy_meters', 'unknown')}m"
        )
```

---

### 5.5 SatelliteAdapter

**Purpose:** Ingest processed satellite imagery products (burn severity, NDVI, etc.)

**Data Source:** Google Earth Engine, NASA EOSDIS, Copernicus Open Access Hub
**Authentication:** API Key (GEE), OAuth (Copernicus)
**Sync Strategy:** Batch import (daily or on-demand)
**Data Tier:** Tier 1 for imagery (95%), Tier 2 for derived products (80%)

**Implementation Stub:**

```python
class SatelliteAdapter(BaseDataAdapter):
    """
    Adapter for satellite imagery products.

    Ingests: Burn severity rasters, NDVI time series, land cover change
    Output: RangerSpatialFeature (rasterized to polygons), RangerMediaReference (COG links)
    """

    async def authenticate(self) -> bool:
        """Authenticate with Earth Engine or Copernicus"""
        # Example: ee.Initialize() for Google Earth Engine
        pass

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Fetch imagery products from satellite platform.

        Filters:
            - bbox: List[float]
            - start_date: datetime
            - end_date: datetime
            - product_type: str ("burn_severity", "ndvi", etc.)
            - cloud_cover_max: float
        """
        pass

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[BaseModel]:
        """
        Transform satellite products to CDS models.

        Options:
            1. Store raster as RangerMediaReference (COG link)
            2. Vectorize burn severity zones → RangerSpatialFeature polygons
            3. Extract zonal statistics → RangerObservation

        Confidence assignment:
            - Raw imagery: 0.95 (Tier 1)
            - dNBR burn severity: 0.85 (Tier 2, derived product)
            - ML-inferred classes: 0.70 (Tier 2-3, model uncertainty)
        """
        pass

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="Sentinel-2",
            source_id=raw_record["scene_id"],
            source_uri=raw_record["download_url"],
            data_tier=DataTier.TIER_1,
            confidence=0.95,
            notes=f"Cloud cover: {raw_record['cloud_cover_pct']}%"
        )
```

---

## 6. Authentication Patterns

### 6.1 API Key Authentication

**Used by:** InciWeb (if required), IRWIN, Satellite platforms

```python
class APIKeyAuth:
    """Simple API key header authentication"""

    def __init__(self, api_key: str, header_name: str = "X-API-Key"):
        self.api_key = api_key
        self.header_name = header_name

    def get_headers(self) -> Dict[str, str]:
        return {self.header_name: self.api_key}

# Usage in adapter
async def authenticate(self) -> bool:
    auth = APIKeyAuth(self.config["api_key"])
    response = await httpx.get(
        f"{self.config['base_url']}/health",
        headers=auth.get_headers()
    )
    return response.status_code == 200
```

---

### 6.2 OAuth 2.0 Authentication

**Used by:** Survey123, Collector (ArcGIS Online)

```python
class OAuth2Auth:
    """OAuth 2.0 client credentials or authorization code flow"""

    def __init__(self, client_id: str, client_secret: str, token_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.access_token: Optional[str] = None
        self.token_expires: Optional[datetime] = None

    async def get_token(self) -> str:
        """Fetch or refresh access token"""
        if self.access_token and self.token_expires and datetime.now() < self.token_expires:
            return self.access_token

        # Request new token
        response = await httpx.post(
            self.token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
        )
        data = response.json()
        self.access_token = data["access_token"]
        self.token_expires = datetime.now() + timedelta(seconds=data["expires_in"])
        return self.access_token

    async def get_headers(self) -> Dict[str, str]:
        token = await self.get_token()
        return {"Authorization": f"Bearer {token}"}

# Usage in adapter
async def authenticate(self) -> bool:
    self.oauth = OAuth2Auth(
        client_id=self.config["client_id"],
        client_secret=self.config["client_secret"],
        token_url=self.config["token_url"]
    )
    try:
        await self.oauth.get_token()
        return True
    except Exception:
        return False
```

---

### 6.3 Session-Based Authentication

**Used by:** Legacy USFS systems (TRACS, FSVeg export endpoints)

```python
class SessionAuth:
    """Session cookie-based authentication"""

    def __init__(self, login_url: str, username: str, password: str):
        self.login_url = login_url
        self.username = username
        self.password = password
        self.session = httpx.AsyncClient()

    async def login(self) -> bool:
        """Establish session with login credentials"""
        response = await self.session.post(
            self.login_url,
            data={"username": self.username, "password": self.password}
        )
        return response.status_code == 200 and "session" in response.cookies

# Usage in adapter
async def authenticate(self) -> bool:
    self.auth = SessionAuth(
        login_url=self.config["login_url"],
        username=self.config["username"],
        password=self.config["password"]
    )
    return await self.auth.login()
```

---

## 7. Sync Strategies

### 7.1 Polling (Time-Based)

**Best for:** APIs without webhook support, batch processing

```python
class PollingStrategy:
    """Time-based polling with configurable intervals"""

    def __init__(self, adapter: BaseDataAdapter, interval_seconds: int):
        self.adapter = adapter
        self.interval = interval_seconds
        self.running = False

    async def start(self):
        """Start polling loop"""
        self.running = True
        while self.running:
            try:
                await self.adapter.ingest()
            except Exception as e:
                logger.error(f"Polling error: {e}")

            await asyncio.sleep(self.interval)

    def stop(self):
        """Stop polling loop"""
        self.running = False

# Usage
strategy = PollingStrategy(irwin_adapter, interval_seconds=900)  # 15 minutes
asyncio.create_task(strategy.start())
```

---

### 7.2 Webhook (Event-Driven)

**Best for:** Survey123, Collector, real-time field updates

```python
from fastapi import FastAPI, Request

class WebhookStrategy:
    """Event-driven ingestion via webhooks"""

    def __init__(self, adapter: BaseDataAdapter, webhook_secret: str):
        self.adapter = adapter
        self.secret = webhook_secret

    def register_webhook_endpoint(self, app: FastAPI, path: str):
        """Register webhook endpoint with API Gateway"""

        @app.post(path)
        async def webhook_receiver(request: Request):
            # Verify webhook signature
            signature = request.headers.get("X-Webhook-Signature")
            if not self._verify_signature(signature, await request.body()):
                return {"error": "Invalid signature"}, 403

            # Parse webhook payload
            payload = await request.json()

            # Trigger adapter ingestion
            result = await self.adapter.ingest(filters={"record_id": payload["id"]})
            return result

    def _verify_signature(self, signature: str, body: bytes) -> bool:
        """Verify HMAC signature from webhook provider"""
        import hmac
        import hashlib
        expected = hmac.new(self.secret.encode(), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected)

# Usage in API Gateway
webhook = WebhookStrategy(survey123_adapter, webhook_secret=config["webhook_secret"])
webhook.register_webhook_endpoint(app, path="/webhooks/survey123")
```

---

### 7.3 Batch Import (On-Demand)

**Best for:** Historical data migration, satellite imagery processing

```python
class BatchImportStrategy:
    """Manual or scheduled batch import"""

    def __init__(self, adapter: BaseDataAdapter):
        self.adapter = adapter

    async def import_batch(
        self,
        filters: Dict[str, Any],
        batch_size: int = 100,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Import large dataset in batches.

        Args:
            filters: Query filters for the batch
            batch_size: Records per batch
            progress_callback: Optional function to report progress

        Returns:
            Aggregated ingestion results
        """
        offset = 0
        total_results = {
            "records_fetched": 0,
            "records_transformed": 0,
            "errors": []
        }

        while True:
            batch_filters = {**filters, "limit": batch_size, "offset": offset}
            result = await self.adapter.ingest(batch_filters)

            # Aggregate results
            total_results["records_fetched"] += result["records_fetched"]
            total_results["records_transformed"] += result["records_transformed"]
            total_results["errors"].extend(result["errors"])

            if progress_callback:
                progress_callback(total_results)

            # Stop if no more records
            if result["records_fetched"] < batch_size:
                break

            offset += batch_size

        return total_results

# Usage
batch = BatchImportStrategy(satellite_adapter)
result = await batch.import_batch(
    filters={"start_date": "2022-08-01", "end_date": "2022-10-14"},
    batch_size=50
)
```

---

## 8. Error Handling

### 8.1 Retry Logic

```python
import asyncio
from functools import wraps

def retry_on_failure(max_attempts: int = 3, backoff_seconds: float = 2.0):
    """Decorator for automatic retry with exponential backoff"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            while attempt < max_attempts:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    attempt += 1
                    if attempt >= max_attempts:
                        raise

                    wait_time = backoff_seconds * (2 ** (attempt - 1))
                    logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)

        return wrapper
    return decorator

# Usage in adapter
@retry_on_failure(max_attempts=3, backoff_seconds=2.0)
async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    response = await httpx.get(self.config["endpoint"], params=filters)
    response.raise_for_status()
    return response.json()
```

---

### 8.2 Failure Modes

| Failure Mode | Detection | Recovery | User Impact |
|--------------|-----------|----------|-------------|
| **Authentication Failure** | HTTP 401/403 | Retry with fresh credentials | Adapter status: FAILED, agents use cached data |
| **Network Timeout** | Connection timeout | Retry with exponential backoff | Adapter status: DEGRADED, stale data warning |
| **Malformed Data** | Pydantic validation error | Skip record, log error | Partial ingestion, missing records flagged |
| **Rate Limiting** | HTTP 429 | Wait for retry-after header | Adapter status: DEGRADED, delayed sync |
| **Service Outage** | HTTP 503, DNS failure | Retry, alert operator | Adapter status: FAILED, use Phase 1 fixtures |
| **Data Schema Change** | Transformation error | Alert operator, pause adapter | Adapter status: FAILED, require schema update |

---

### 8.3 Error Reporting

```python
class AdapterErrorReport(BaseModel):
    """Structured error report for monitoring/alerting"""
    adapter_name: str
    error_type: str  # "auth", "network", "validation", "transformation"
    error_message: str
    timestamp: datetime
    affected_records: List[str]  # IDs of failed records
    recovery_attempted: bool
    recovery_succeeded: bool

async def report_error(self, error: Exception, context: Dict[str, Any]):
    """Send error report to monitoring system"""
    report = AdapterErrorReport(
        adapter_name=self.__class__.__name__,
        error_type=self._classify_error(error),
        error_message=str(error),
        timestamp=datetime.now(),
        affected_records=context.get("record_ids", []),
        recovery_attempted=False,
        recovery_succeeded=False
    )

    # Log to structured logging
    logger.error(report.json())

    # Send to monitoring (Sentry, CloudWatch, etc.)
    # await monitoring_client.send_error(report)
```

---

## 9. Integration with API Gateway

### 9.1 Ingestion Endpoint

**Location:** `services/api-gateway/app/routers/ingest.py`

```python
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional

router = APIRouter()

# Adapter registry
adapters = {
    "inciweb": InciWebAdapter(config=config["inciweb"]),
    "irwin": IRWINAdapter(config=config["irwin"]),
    "survey123": Survey123Adapter(config=config["survey123"]),
    "collector": CollectorAdapter(config=config["collector"]),
    "satellite": SatelliteAdapter(config=config["satellite"])
}

@router.post("/api/v1/ingest/{adapter_name}")
async def trigger_ingestion(
    adapter_name: str,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Trigger data ingestion for a specific adapter.

    Args:
        adapter_name: Name of the adapter ("inciweb", "irwin", etc.)
        filters: Optional query filters

    Returns:
        Ingestion results with record counts and errors
    """
    if adapter_name not in adapters:
        raise HTTPException(status_code=404, detail=f"Adapter '{adapter_name}' not found")

    adapter = adapters[adapter_name]
    result = await adapter.ingest(filters=filters)
    return result


@router.get("/api/v1/ingest/health")
async def adapter_health() -> Dict[str, Any]:
    """
    Check health status of all adapters.

    Returns:
        Dictionary of adapter names → health status
    """
    health = {}
    for name, adapter in adapters.items():
        health[name] = adapter.health_check()
    return health
```

---

### 9.2 Data Storage

Ingested data flows to Redis for agent consumption:

```python
from app.services.redis_client import get_redis_client
import json

async def store_ingested_data(cds_objects: List[BaseModel], fire_id: str):
    """
    Store CDS objects in Redis for agent consumption.

    Args:
        cds_objects: List of Common Data Schema objects
        fire_id: Fire identifier for session routing
    """
    redis = await get_redis_client()

    for obj in cds_objects:
        # Determine Redis key based on object type
        if isinstance(obj, RangerSpatialFeature):
            key = f"ranger:fire:{fire_id}:features:{obj.feature_id}"
        elif isinstance(obj, RangerObservation):
            key = f"ranger:fire:{fire_id}:observations:{obj.observation_id}"
        elif isinstance(obj, RangerMediaReference):
            key = f"ranger:fire:{fire_id}:media:{obj.media_id}"

        # Store as JSON with TTL (30 days)
        await redis.setex(
            key,
            60 * 60 * 24 * 30,  # 30 days
            obj.json()
        )

        # Add to index set for querying
        await redis.sadd(
            f"ranger:fire:{fire_id}:all_records",
            key
        )
```

---

## 10. Phase 1 Implementation Path

### 10.1 Mock Adapters for Simulation

For Phase 1, adapters return simulated data from fixtures:

```python
class MockIRWINAdapter(BaseDataAdapter):
    """Phase 1: Returns fixture data instead of calling real IRWIN API"""

    async def authenticate(self) -> bool:
        # Always succeeds in simulation
        return True

    async def fetch_raw(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Load from fixture file"""
        import json
        fixture_path = "/data/fixtures/cedar-creek/burn-severity.json"
        with open(fixture_path, "r") as f:
            data = json.load(f)
        return [data]  # Return as single-item list

    async def transform_to_cds(self, raw_data: List[Dict[str, Any]]) -> List[RangerSpatialFeature]:
        """Transform fixture data to CDS"""
        features = []
        for sector in raw_data[0]["sectors"]:
            features.append(BurnSeverityFeature(
                feature_id=f"burn-{sector['id']}",
                feature_type="burn_sector",
                geometry=Feature(
                    type="Feature",
                    geometry=sector["geometry"],
                    properties={"name": sector["name"]}
                ),
                attributes={
                    "severity": sector["severity"],
                    "acres": sector["acres"],
                    "slope_avg": sector["slope_avg"]
                },
                severity=sector["severity"],
                severity_class=sector["severity_class"],
                acres=sector["acres"],
                dnbr_mean=sector.get("dnbr_mean"),
                valid_from=datetime.fromisoformat("2022-09-15"),
                provenance=self.get_provenance(sector)
            ))
        return features

    def get_provenance(self, raw_record: Dict[str, Any]) -> ProvenanceMetadata:
        return ProvenanceMetadata(
            source_system="IRWIN (simulated)",
            source_id=raw_record["id"],
            source_uri=None,
            ingestion_timestamp=datetime.now(),
            data_timestamp=datetime.fromisoformat("2022-09-15"),
            data_tier=DataTier.TIER_3,  # Simulated data
            confidence=1.0,  # Perfect fixture data
            notes="Phase 1 simulation - Cedar Creek fixture"
        )
```

---

### 10.2 Transition to Production

**Phase 1 → Phase 2 Migration:**

1. Implement real adapters alongside mock adapters
2. Add feature flag: `USE_REAL_ADAPTERS=false` (default) / `true`
3. Run side-by-side testing: Mock vs. Real adapters
4. Validate CDS output consistency
5. Flip feature flag when confidence is high
6. Deprecate mock adapters

**Configuration Management:**

```yaml
# config/adapters.yaml
adapters:
  irwin:
    enabled: true
    use_mock: true  # Phase 1: use fixtures
    config:
      api_key: ${IRWIN_API_KEY}
      base_url: "https://irwin.doi.gov/api"
    sync:
      strategy: "polling"
      interval_seconds: 900

  survey123:
    enabled: true
    use_mock: true  # Phase 1: use fixtures
    config:
      client_id: ${ARCGIS_CLIENT_ID}
      client_secret: ${ARCGIS_CLIENT_SECRET}
    sync:
      strategy: "webhook"
      webhook_secret: ${SURVEY123_WEBHOOK_SECRET}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

```python
import pytest
from datetime import datetime

@pytest.mark.asyncio
async def test_irwin_adapter_transform():
    """Test IRWIN adapter transforms raw data to CDS correctly"""
    adapter = MockIRWINAdapter(config={})

    raw_data = [{
        "id": "NW-1",
        "severity": "HIGH",
        "acres": 18340,
        "geometry": {...}
    }]

    result = await adapter.transform_to_cds(raw_data)

    assert len(result) == 1
    assert isinstance(result[0], BurnSeverityFeature)
    assert result[0].severity == "HIGH"
    assert result[0].acres == 18340
    assert result[0].provenance.data_tier == DataTier.TIER_3

@pytest.mark.asyncio
async def test_adapter_retry_logic():
    """Test retry decorator with network failures"""
    call_count = 0

    @retry_on_failure(max_attempts=3, backoff_seconds=0.1)
    async def flaky_function():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ConnectionError("Network error")
        return "success"

    result = await flaky_function()
    assert result == "success"
    assert call_count == 3
```

---

### 11.2 Integration Tests

```python
@pytest.mark.integration
@pytest.mark.asyncio
async def test_end_to_end_ingestion():
    """Test full ingestion pipeline: adapter → API Gateway → Redis → Agent"""

    # 1. Trigger ingestion
    adapter = MockIRWINAdapter(config={})
    result = await adapter.ingest()

    assert result["status"] == "success"
    assert result["records_transformed"] > 0

    # 2. Verify data in Redis
    redis = await get_redis_client()
    keys = await redis.keys("ranger:fire:cedar-creek-2022:features:*")
    assert len(keys) > 0

    # 3. Verify agent can consume data
    burn_analyst = BurnAnalyst()
    briefing = await burn_analyst.analyze(fire_id="cedar-creek-2022")
    assert briefing.event_type == "insight"
    assert briefing.proof_layer.confidence > 0.8
```

---

## 12. Monitoring and Observability

### 12.1 Metrics to Track

```python
from prometheus_client import Counter, Histogram, Gauge

# Adapter metrics
adapter_requests_total = Counter(
    "ranger_adapter_requests_total",
    "Total adapter ingestion requests",
    ["adapter_name", "status"]
)

adapter_records_processed = Counter(
    "ranger_adapter_records_processed",
    "Total records processed",
    ["adapter_name", "record_type"]
)

adapter_ingestion_duration_seconds = Histogram(
    "ranger_adapter_ingestion_duration_seconds",
    "Time spent in ingestion pipeline",
    ["adapter_name"]
)

adapter_health_status = Gauge(
    "ranger_adapter_health_status",
    "Adapter health (1=healthy, 0=degraded, -1=failed)",
    ["adapter_name"]
)
```

---

### 12.2 Logging Standards

```python
import structlog

logger = structlog.get_logger()

# Structured logging for all adapter events
logger.info(
    "adapter_ingestion_started",
    adapter=self.__class__.__name__,
    filters=filters,
    timestamp=datetime.now().isoformat()
)

logger.info(
    "adapter_ingestion_completed",
    adapter=self.__class__.__name__,
    records_fetched=result["records_fetched"],
    records_transformed=result["records_transformed"],
    duration_seconds=result["duration_seconds"],
    status=result["status"]
)

logger.error(
    "adapter_ingestion_failed",
    adapter=self.__class__.__name__,
    error_type="authentication",
    error_message=str(e),
    traceback=traceback.format_exc()
)
```

---

## 13. Future Enhancements

### 13.1 Stream Processing

For high-velocity data sources (real-time sensors, IoT devices):

```python
# Using Apache Kafka or AWS Kinesis
from kafka import KafkaConsumer

class StreamAdapter(BaseDataAdapter):
    """Consume real-time data streams"""

    async def start_consumer(self):
        consumer = KafkaConsumer(
            'ranger-field-updates',
            bootstrap_servers=['kafka:9092']
        )

        async for message in consumer:
            raw_record = json.loads(message.value)
            cds_object = await self.transform_to_cds([raw_record])
            await store_ingested_data(cds_object, fire_id=raw_record["fire_id"])
```

---

### 13.2 Data Quality Validation

```python
class DataQualityValidator:
    """Validate ingested data against quality rules"""

    def validate(self, cds_object: BaseModel) -> Dict[str, Any]:
        issues = []

        # Spatial validation
        if isinstance(cds_object, RangerSpatialFeature):
            if not self._is_valid_geometry(cds_object.geometry):
                issues.append("Invalid geometry")

        # Temporal validation
        if cds_object.data_timestamp > datetime.now():
            issues.append("Future timestamp")

        # Confidence threshold
        if cds_object.provenance.confidence < 0.5:
            issues.append("Low confidence data")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "recommended_tier": self._suggest_tier(issues)
        }
```

---

### 13.3 Schema Evolution

```python
class SchemaVersionManager:
    """Handle CDS schema changes over time"""

    def migrate(self, old_version: str, new_version: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Migrate data from old schema version to new"""
        migrations = {
            "1.0.0_to_1.1.0": self._migrate_1_0_to_1_1,
            "1.1.0_to_2.0.0": self._migrate_1_1_to_2_0
        }

        migration_key = f"{old_version}_to_{new_version}"
        if migration_key in migrations:
            return migrations[migration_key](data)

        raise ValueError(f"No migration path from {old_version} to {new_version}")
```

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-21 | Initial specification | Claude Code |

---

## References

- **AGENT-MESSAGING-PROTOCOL.md** - Agent communication contract, confidence ledger
- **DATA-SIMULATION-STRATEGY.md** - Phase 1 simulation boundaries
- **BRIEFING-UX-SPEC.md** - UI rendering of ingested data
- [Esri ArcGIS REST API Documentation](https://developers.arcgis.com/rest/)
- [Google Earth Engine Python API](https://developers.google.com/earth-engine/guides/python_install)
- [IRWIN API Documentation](https://irwin.doi.gov/api/docs)
