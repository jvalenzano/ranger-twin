# twin-core

> Shared Python utilities for Project RANGER

## Overview

Core Python library providing shared utilities, data models, and helpers used across all backend services and agents.

## Installation

```bash
pip install -e packages/twin-core
```

## Structure

```
twin_core/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── fire.py              # Fire event models
│   ├── severity.py          # Burn severity models
│   ├── damage.py            # Trail damage models
│   ├── plot.py              # Timber plot models
│   └── geo.py               # Geospatial primitives
├── utils/
│   ├── __init__.py
│   ├── geo.py               # Geospatial utilities
│   ├── raster.py            # Raster I/O helpers
│   ├── vector.py            # Vector I/O helpers
│   └── logging.py           # Structured logging
├── clients/
│   ├── __init__.py
│   ├── vertex.py            # Vertex AI client
│   ├── storage.py           # Cloud Storage client
│   └── bigquery.py          # BigQuery client
└── config/
    ├── __init__.py
    └── settings.py          # Pydantic settings
```

## Key Models

### Fire Event

```python
from twin_core.models import FireEvent

fire = FireEvent(
    id="cedar-creek-2022",
    name="Cedar Creek Fire",
    start_date=date(2022, 8, 1),
    containment_date=date(2022, 10, 15),
    total_acres=127000,
    forest="Willamette National Forest",
    state="OR"
)
```

### Burn Severity

```python
from twin_core.models import BurnSeverity, SeverityClass

severity = BurnSeverity(
    fire_id="cedar-creek-2022",
    high_pct=42.1,
    moderate_pct=31.2,
    low_pct=26.7,
    unburned_pct=0.0
)
```

### Trail Damage

```python
from twin_core.models import DamagePoint, DamageType, DamageSeverity

damage = DamagePoint(
    id="rebel-creek-001",
    trail_id="rebel-creek",
    mile_marker=2.3,
    damage_type=DamageType.BRIDGE_WASHOUT,
    severity=DamageSeverity.CRITICAL,
    coordinates=(-122.1234, 44.5678),
    estimated_repair_cost=45000
)
```

## Utilities

### Geospatial

```python
from twin_core.utils.geo import (
    calculate_area,
    buffer_geometry,
    clip_raster_to_polygon
)
```

### Raster I/O

```python
from twin_core.utils.raster import (
    read_geotiff,
    write_cog,
    calculate_dnbr
)
```

## Configuration

Uses Pydantic Settings for environment-based configuration:

```python
from twin_core.config import settings

print(settings.gcp_project_id)
print(settings.vertex_ai_location)
print(settings.database_url)
```

## Development

```bash
# Install in editable mode
pip install -e .

# Run tests
pytest

# Format
black twin_core/
ruff check twin_core/
```
