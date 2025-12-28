# RANGER Domain Quick Reference Card

> Print this or keep it open while testing/demoing

---

## The 8-Minute Reality

Forest Supervisors have **8 minutes** before briefing calls. They need:
1. "What's going sideways?" (3-5 fires needing escalation)
2. "What changed overnight?" (delta is more important than current state)
3. "What do I tell Washington?" (30-second summary)

---

## The 5 Agents

| Agent | Emoji | Does What | Key Metric |
|-------|-------|-----------|------------|
| **Recovery Coordinator** | 🧠 | Orchestrates, synthesizes | ROI calculation |
| **Burn Analyst** | 🔥 | Severity assessment | dNBR values |
| **Trail Assessor** | 🥾 | Infrastructure damage | Repair cost ($) |
| **Cruising Assistant** | 🌲 | Timber salvage value | MBF volume |
| **NEPA Advisor** | ⚖️ | Regulatory compliance | CE vs EA pathway |

---

## Fire Severity Scale

| Level | dNBR Range | Color | Meaning |
|-------|------------|-------|---------|
| **Low** | 0.1-0.25 | 🟢 Green | Understory burn, trees survive |
| **Moderate** | 0.25-0.5 | 🟡 Yellow | Mixed, some mortality |
| **High** | 0.5-0.7 | 🟠 Orange | Most trees dead |
| **Very High** | >0.7 | 🔴 Red | Complete stand replacement |

---

## Key Acronyms (Alphabetical)

| Acronym | Full Name | Used For |
|---------|-----------|----------|
| **BAER** | Burned Area Emergency Response | 7-day post-containment assessment |
| **BAF** | Basal Area Factor | Timber cruise sampling |
| **CE** | Categorical Exclusion | NEPA fast-track (<250 acres) |
| **CFR** | Code of Federal Regulations | Legal authority (e.g., 36 CFR 220) |
| **dNBR** | differenced Normalized Burn Ratio | Satellite burn severity metric |
| **EA** | Environmental Assessment | NEPA standard analysis |
| **FSH** | Forest Service Handbook | Procedures & how-to |
| **FSM** | Forest Service Manual | Policy directives |
| **FSVeg** | Field Sampled Vegetation | Timber database |
| **MBF** | Thousand Board Feet | Timber volume unit |
| **MTBS** | Monitoring Trends in Burn Severity | Satellite classification |
| **NEPA** | National Environmental Policy Act | Environmental review law |
| **NIFC** | National Interagency Fire Center | Fire data hub |
| **TRACS** | Trail Assessment & Condition Survey | Trail database |

---

## Cedar Creek Fire Facts

- **Year:** 2022
- **Size:** 127,341 acres
- **Location:** Willamette NF, Oregon
- **High Severity:** ~64% (81,000 acres)
- **Trail Damage:** $447K repairs needed
- **Salvage Value:** $13.9M timber
- **Key Dependency:** $120K bridge unlocks $13.9M

---

## Demo Script Highlights

**Opening Query:**
> "Give me a recovery briefing for Cedar Creek"

**Expected Response Flow:**
1. Burn Analyst: "63.6% high severity, 81,000 acres"
2. Trail Assessor: "3 bridges destroyed, $447K needed"
3. Cruising Assistant: "$13.9M salvage, 18-month window"
4. NEPA Advisor: "CE for 250 acres, EA for remainder"
5. Coordinator: "27:1 ROI on bridge investment"

**Wow Moment:**
> The $120K Hills Creek bridge repair unlocks $13.9M in timber salvage. That's a **27:1 return on investment.**

---

## Trust Hierarchy

```
Trust in Data       → "Is this number correct?"
     ↓
Trust in AI         → "Is the analysis sound?"
     ↓
Trust in Recs       → "Should I follow this advice?"
     ↓
Behavior Change     → Actually implementing AI guidance
```

**Fix trust in data first. Add AI magic second.**

---

## Quick Terminology Fixes

| Don't Say | Say Instead |
|-----------|-------------|
| "The fire burned" | "The fire exhibited X severity" |
| "Trail is broken" | "Trail has Class 3 damage" |
| "Cut down trees" | "Salvage timber" |
| "Get permission" | "Complete NEPA pathway" |
| "High priority" | "Triage score indicates..." |

---

## Stakeholder Personas

| Persona | Concerns | RANGER Delivers |
|---------|----------|-----------------|
| **Forest Supervisor** | "What needs attention?" | Portfolio triage view |
| **District Ranger** | "What do crews do today?" | Tactical recommendations |
| **Regional Forester** | "What do I tell Washington?" | Synthesis summaries |
| **Field Crew Lead** | "Is this area safe?" | Hazard assessments |

---

## When Things Go Wrong

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Blank map | MapTiler API issue | Check VITE_MAPTILER_API_KEY |
| No chat response | Backend down | Check Cloud Run logs |
| "Unauthorized" | Bad credentials | ranger / CedarCreek2025! |
| CORS error | Backend config | Check ALLOW_ORIGINS env var |

---

**Keep Learning:**
- `docs/_!_PRODUCT-SUMMARY.md` - Full product context
- `docs/adr/ADR-005-skills-first-architecture.md` - Why skills matter
- `docs/specs/PROOF-LAYER-DESIGN.md` - Transparency requirements
