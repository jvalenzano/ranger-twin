# Cedar Creek Fire Fixture Data

**Fire:** Cedar Creek Fire (2022)
**Location:** Willamette National Forest, Oregon
**Size:** 127,341 acres
**Purpose:** Phase 1 simulation data for RANGER demo

---

## Files

| File | Description | Used By |
|------|-------------|---------|
| `burn-severity.json` | MTBS-style burn severity polygons with 8 sectors | Burn Analyst |
| `trail-damage.json` | Simulated damage inventory for 5 trails, 16 damage points | Trail Assessor |
| `timber-plots.json` | FSVeg-compatible cruise data for 6 plots | Cruising Assistant |
| `briefing-events.json` | Pre-composed AgentBriefingEvent payloads for demo cascade | All agents |

---

## Data Sources

This is **simulated data** based on real patterns from the Cedar Creek Fire:

- Burn severity classifications derived from actual MTBS data
- Trail names and locations are real Willamette NF trails
- Timber species and mortality patterns reflect typical post-fire conditions
- Cost estimates use Region 6 standard rates

**None of this data should be used for actual decision-making.**

---

## Demo Narrative

The `briefing-events.json` file contains a complete cascade demonstrating:

1. **Burn Analyst** → Severity assessment triggers Trail Assessor
2. **Trail Assessor** → Damage inventory triggers Cruising Assistant
3. **Cruising Assistant** → Salvage analysis triggers NEPA Advisor
4. **NEPA Advisor** → Regulatory guidance feeds synthesis
5. **Recovery Coordinator** → Cross-agent synthesis with integrated ROI

See `docs/DATA-SIMULATION-STRATEGY.md` for the authoritative scope document.

---

## Usage

```javascript
// Load fixture data in frontend
import burnSeverity from '@/data/fixtures/cedar-creek/burn-severity.json';
import trailDamage from '@/data/fixtures/cedar-creek/trail-damage.json';
import timberPlots from '@/data/fixtures/cedar-creek/timber-plots.json';
import briefingEvents from '@/data/fixtures/cedar-creek/briefing-events.json';
```

---

## Schema Alignment

- `burn-severity.json` aligns with MTBS GeoJSON export format
- `trail-damage.json` aligns with TRACS damage inventory schema
- `timber-plots.json` aligns with FSVeg Common Stand Exam format
- `briefing-events.json` follows `AgentBriefingEvent` schema from `docs/architecture/AGENT-MESSAGING-PROTOCOL.md`
