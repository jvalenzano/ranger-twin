-- Cedar Creek Digital Twin - Database Initialization
-- This script runs on first PostgreSQL container startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector for RAG

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS spatial;      -- Geospatial data
CREATE SCHEMA IF NOT EXISTS agents;       -- Agent-related tables
CREATE SCHEMA IF NOT EXISTS documents;    -- RAG document storage

-- Set search path
SET search_path TO public, spatial, agents, documents;

-- =============================================================================
-- Spatial Schema - Geospatial Data
-- =============================================================================

-- Fire events
CREATE TABLE spatial.fire_events (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    containment_date DATE,
    total_acres NUMERIC(12, 2),
    forest VARCHAR(255),
    state CHAR(2),
    perimeter GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Burn severity polygons
CREATE TABLE spatial.burn_severity (
    id SERIAL PRIMARY KEY,
    fire_id VARCHAR(50) REFERENCES spatial.fire_events(id),
    severity_class VARCHAR(20) NOT NULL,  -- unburned, low, moderate, high
    dnbr_min NUMERIC(6, 3),
    dnbr_max NUMERIC(6, 3),
    acres NUMERIC(12, 2),
    geometry GEOMETRY(MultiPolygon, 4326),
    source_imagery VARCHAR(50),
    imagery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_burn_severity_fire ON spatial.burn_severity(fire_id);
CREATE INDEX idx_burn_severity_geom ON spatial.burn_severity USING GIST(geometry);

-- Trail network
CREATE TABLE spatial.trails (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    forest VARCHAR(255),
    district VARCHAR(255),
    total_miles NUMERIC(8, 2),
    geometry GEOMETRY(MultiLineString, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trails_geom ON spatial.trails USING GIST(geometry);

-- Trail damage points
CREATE TABLE spatial.damage_points (
    id VARCHAR(50) PRIMARY KEY,
    trail_id VARCHAR(50) REFERENCES spatial.trails(id),
    fire_id VARCHAR(50) REFERENCES spatial.fire_events(id),
    mile_marker NUMERIC(6, 2),
    damage_type VARCHAR(50) NOT NULL,  -- washout, debris_flow, bridge_failure, tread_erosion
    severity VARCHAR(20) NOT NULL,     -- minor, moderate, severe, critical
    description TEXT,
    estimated_repair_cost NUMERIC(12, 2),
    geometry GEOMETRY(Point, 4326),
    detected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_damage_trail ON spatial.damage_points(trail_id);
CREATE INDEX idx_damage_fire ON spatial.damage_points(fire_id);
CREATE INDEX idx_damage_geom ON spatial.damage_points USING GIST(geometry);

-- Timber plots
CREATE TABLE spatial.timber_plots (
    id VARCHAR(50) PRIMARY KEY,
    fire_id VARCHAR(50) REFERENCES spatial.fire_events(id),
    plot_number VARCHAR(20),
    unit_id VARCHAR(50),
    cruise_date DATE,
    geometry GEOMETRY(Point, 4326),
    data JSONB,  -- FSVeg-compatible plot data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plots_fire ON spatial.timber_plots(fire_id);
CREATE INDEX idx_plots_geom ON spatial.timber_plots USING GIST(geometry);

-- =============================================================================
-- Agents Schema - Agent Interaction Tracking
-- =============================================================================

-- Agent queries (for analytics and debugging)
CREATE TABLE agents.queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    context JSONB,
    answer TEXT,
    confidence NUMERIC(4, 3),
    sources JSONB,
    suggestions JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_agent ON agents.queries(agent_name);
CREATE INDEX idx_queries_created ON agents.queries(created_at);

-- =============================================================================
-- Documents Schema - RAG Document Storage
-- =============================================================================

-- Document chunks for RAG
CREATE TABLE documents.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL,  -- fsm, fsh, ea, etc.
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(768),  -- text-embedding-004 dimension
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_doc ON documents.chunks(document_id);
CREATE INDEX idx_chunks_type ON documents.chunks(document_type);
CREATE INDEX idx_chunks_embedding ON documents.chunks USING ivfflat (embedding vector_cosine_ops);

-- =============================================================================
-- Seed Data - Cedar Creek Fire
-- =============================================================================

INSERT INTO spatial.fire_events (id, name, start_date, containment_date, total_acres, forest, state)
VALUES (
    'cedar-creek-2022',
    'Cedar Creek Fire',
    '2022-08-01',
    '2022-10-15',
    127000,
    'Willamette National Forest',
    'OR'
);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA spatial TO cedar_creek;
GRANT ALL ON ALL TABLES IN SCHEMA agents TO cedar_creek;
GRANT ALL ON ALL TABLES IN SCHEMA documents TO cedar_creek;
GRANT ALL ON ALL SEQUENCES IN SCHEMA spatial TO cedar_creek;
GRANT ALL ON ALL SEQUENCES IN SCHEMA agents TO cedar_creek;
GRANT ALL ON ALL SEQUENCES IN SCHEMA documents TO cedar_creek;
