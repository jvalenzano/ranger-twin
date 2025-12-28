# Bootleg Fire Fixture Data

**Fire:** Bootleg Fire (2021)
**Location:** Fremont-Winema National Forest, Oregon
**Size:** 413,717 acres
**Purpose:** Secondary test fire for RANGER multi-incident testing

---

## Files

| File | Description | Used By |
|------|-------------|---------|
| `burn-severity.json` | MTBS-style burn severity polygons | Burn Analyst |
| `trail-damage.json` | Simulated damage inventory for trails | Trail Assessor |
| `timber-plots.json` | FSVeg-compatible cruise data | Cruising Assistant |
| `briefing-events.json` | Pre-composed AgentBriefingEvent payloads | All agents |

---

## Data Sources

This is **simulated data** based on patterns from the Bootleg Fire:

- Burn severity classifications derived from actual MTBS data
- Trail names and locations reflect Fremont-Winema NF infrastructure
- Timber species and mortality patterns reflect typical post-fire conditions
- Cost estimates use Region 6 standard rates

**None of this data should be used for actual decision-making.**

---

## Purpose

The Bootleg Fire fixture provides:

1. **Multi-incident testing** - Validates portfolio triage with multiple fires
2. **Scale testing** - Larger fire (413K acres vs Cedar Creek's 127K)
3. **Different forest** - Tests generalization beyond Willamette NF

---

## Schema Alignment

All files follow the same schemas as Cedar Creek fixtures:

- `burn-severity.json` → GeoJSON FeatureCollection (MTBS format)
- `trail-damage.json` → TRACS damage inventory schema
- `timber-plots.json` → FSVeg Common Stand Exam format
- `briefing-events.json` → AgentBriefingEvent protocol

See `data/fixtures/cedar-creek/README.md` for detailed schema documentation.

---

**Last Updated:** 2025-12-28
**Architecture Alignment:** ADR-005 (Skills-First), ADR-009 (Fixture-First)
