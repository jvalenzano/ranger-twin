# Stakeholder Diagram Prompts (v2.0)

> **Updated:** December 28, 2025  
> **Aligned With:** ADR-007.1 Three-Layer Tool Invocation Strategy  
> **Master Reference:** [_RANGER-DIAGRAM-PROMPTS-v2.md](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md)

**Purpose:** Value communication for USFS, partners, investors, and **auditors**.  
**Audience:** Non-technical stakeholders, federal compliance reviewers.  
**Aesthetic:** Tactical Whiteboard (Dark slate blue #0F172A).

---

## 🆕 What's New in v2.0

| Change | Rationale |
|--------|-----------|
| Added **Federal Compliance Overview** | Auditor-ready executive slide |
| **Confidence Ledger** now has 4 pillars | Added validation as trust component |
| **Value Loop** shows validation checkpoint | Accuracy with current architecture |
| Enhanced **federal compliance language** | FedRAMP audit readiness |

---

## Diagram Index

| # | Diagram | File | Priority | Status |
|---|---------|------|----------|--------|
| 0 | Federal Compliance Overview | `federal-compliance-overview.png` | P0 | 🆕 NEW |
| 1 | Cedar Creek Context | `cedar-creek-context.png` | P0 | ✅ Unchanged |
| 2 | RANGER Value Loop | `ranger-value-loop.png` | P0 | ✏️ Updated |
| 3 | Recovery Chain (Personas) | `recovery-chain-personas.png` | P0 | ✅ Unchanged |
| 4 | Legacy Bridge | `legacy-bridge.png` | P0 | ✅ Unchanged |
| 5 | Confidence Ledger | `confidence-ledger.png` | P1 | ✏️ Updated |
| 6 | Maria's 8-Minute Morning | `marias-morning.png` | P1 | ✏️ Updated |

---

## Quick Reference Prompts

For complete, detailed prompts, see the [master prompts file](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md#track-2-stakeholder-diagrams).

Below are condensed versions for quick generation:

---

### 0. Federal Compliance Overview (NEW - P0)

**File:** `federal-compliance-overview.png`  
**Question It Answers:** "Is this system compliant with federal AI requirements?"

```
Create an executive compliance diagram titled "RANGER: Federal AI Compliance Architecture" on deep slate blue (#0F172A).

Three interconnected components:
1. TRANSPARENCY - Every AI decision explained, reasoning chains visible
2. AUDITABILITY - Every tool call logged, immutable timestamps
3. RELIABILITY - 99% tool invocation, three-layer enforcement

Include:
- FedRAMP High Compatible badge
- USDA GenAI Strategy Compliant badge
- Q&A format answering auditor questions
- Compliance checklist with green checkmarks

Key tagline: "RANGER uses AI responsibly, transparently, and defensibly."

--ar 16:9
```

---

### 1. Cedar Creek Context (P0) - Unchanged

**File:** `cedar-creek-context.png`

```
Tactical briefing infographic: "CEDAR CREEK FIRE • WILLAMETTE NATIONAL FOREST • 2022"

Key elements:
- 127,311 ACRES • $58M • 2,000+ EVACUATED
- Bird's-eye view of Waldo Lake with mosaic burn patterns
- Timeline: AUG 1 → SEPT 8: EAST WINDS → SEPT 11: 86,000 acres → NOV 22: CONTAINED
- Four domain icons: 🔥 BURN | 🥾 TRAIL | 🌲 TIMBER | 📋 NEPA

Style: Military tactical briefing, emergency operations center mood.

--ar 16:9
```

---

### 2. RANGER Value Loop (P0) - Updated

**File:** `ranger-value-loop.png`

```
Elegant circular flow diagram titled "RANGER: The Value Loop"

Five nodes (clockwise):
1. USER QUESTION - "What's the recovery status?"
2. COORDINATED ANALYSIS - Four specialists in parallel
3. VALIDATED - Shield with checkmark, "Tool invocation verified" (NEW)
4. UNIFIED BRIEFING - Synthesized, cited, transparent, verified
5. INFORMED DECISION - Human decides with full context

Key differentiators (4 boxes):
- Coordinated, Not Siloed
- Transparent, Not Black Box
- Validated, Not Assumed (NEW)
- Augments, Not Replaces

Tagline: "Seconds of unified, validated intelligence."

--ar 16:9
```

---

### 3. Recovery Chain (Personas) (P0) - Unchanged

**File:** `recovery-chain-personas.png`

```
Persona workflow diagram: "The Cedar Creek Recovery Chain: Four Personas, One Mission"

Circular flow:
- Sarah Chen (FMO) → 🔥 Burn → Triggers trail priority
- Marcus Rodriguez (Rec Tech) → 🥾 Trail → Informs timber routes
- Elena Vasquez (Cruiser) → 🌲 Timber → Triggers compliance
- Dr. James Park (NEPA) → 📋 NEPA → Refines scope → Back to Sarah

Center: "correlation_id: cedar-creek-001" - Shared context

Before/After: 4 silos → 1 coordinated recovery

--ar 16:9
```

---

### 4. Legacy Bridge (P0) - Unchanged

**File:** `legacy-bridge.png`

```
Integration diagram: "The Legacy Bridge: From AI Insight to 1999-Era Systems"

Three zones:
- LEFT: Modern RANGER (sleek AI briefing card, JSON)
- CENTER: The Bridge (literal bridge, "Schema Transformer", gears)
- RIGHT: Legacy Systems (retro terminals: TRACS CSV, FSVeg XML)

Benefits:
- No Rip and Replace
- Audit Compliance
- Training Continuity

Tagline: "Making legacy systems smarter, not replacing them."

--ar 16:9
```

---

### 5. Confidence Ledger (P1) - Updated

**File:** `confidence-ledger.png`

```
Trust architecture diagram: "The Confidence Ledger: Four Pillars of Federal AI Trust"

Top: Black Box AI (red X) vs RANGER Briefing (green check)

FOUR pillars (expanded from three):
1. CONFIDENCE SCORE - Gauge at 87%, derived from data quality + model certainty
2. CITATION CHAIN - [TRACS] [Video] [FSM] chips, click to verify
3. REASONING CHAIN - Step-by-step logic, numbered flow
4. VALIDATION STATUS (NEW) - Shield with "✓ VALIDATED", three-layer enforcement

Bottom: Immutable Audit Log timeline with timestamps

Tagline: "Every insight defensible—and now, verified."

--ar 16:9
```

---

### 6. Maria's 8-Minute Morning (P1) - Updated

**File:** `marias-morning.png`

```
Before/After workflow: "Maria's 8-Minute Reality"

LEFT (Before - red):
6:00 AM: 14 systems, 2+ hours, no validation
Bottom stats: Low confidence, Unknown blind spots

RIGHT (After - emerald):
6:30 AM: Single interface, 15 minutes
Includes: "✓ Validated" badges, "All insights verified"
Bottom stats: High confidence, Every insight validated

Four key questions:
1. What's going sideways? → AI surfaces anomalies
2. Where's the risk? → Ranked with reasoning
3. What do I tell Washington? → Summary with citations
4. Can I defend this? (NEW) → Every insight validated and logged

Tagline: "8 minutes back, confidence to use them, audit trail to prove it."

--ar 16:9
```

---

## Generation Tips

1. **Use Nano Banana Pro** in Google AI Studio
2. **Set aspect ratio to 16:9** before generating
3. **Edit, don't re-roll** - if 80% correct, ask for specific changes
4. **Emphasize federal compliance** - FedRAMP badges, audit language
5. **Include validation elements** - shields, checkmarks, "verified" badges

---

## Related Documents

- [Master Prompts File (v2)](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md)
- [ADR-007.1: Three-Layer Enforcement](../../adr/ADR-007.1-tool-invocation-strategy.md)
- [PROOF-LAYER-DESIGN.md](../../specs/PROOF-LAYER-DESIGN.md)

---

**Last Updated:** December 28, 2025  
**Version:** 2.0
