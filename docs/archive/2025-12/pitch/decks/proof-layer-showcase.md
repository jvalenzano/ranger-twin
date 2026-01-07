# RANGER Pitch Deck: Proof Layer Showcase

> **Audience:** Technical stakeholders, compliance officers, IT architecture reviewers  
> **Duration:** 15 minutes (10 slides + appendix)  
> **Last Updated:** December 28, 2025  
> **Status:** Draft - Pending screenshot capture after JSON export enhancement

---

## Slide Overview

| Slide # | Title | Purpose | Visual Element |
|---------|-------|---------|----------------|
| 1 | The Black Box Problem | Set up the pain point | Split screen: opaque AI vs. transparent AI |
| 2 | RANGER's Proof Layer | Introduce the solution | Architecture diagram with Proof Layer highlighted |
| 3-6 | Agent Showcase (4 slides) | Demo each specialist | Annotated chat screenshots with reasoning chains |
| 7 | Multi-Agent Orchestration | Show coordination | Sequence diagram + synthesized briefing |
| 8 | Federal Audit Trail | Compliance angle | Citation chips + FSM/FSH references |
| 9 | The Difference | Before/after comparison | Side-by-side: traditional AI vs. RANGER |
| 10 | Call to Action | Next steps | Pilot program invitation |

---

## Slide 1: The Black Box Problem

**Headline:** *"AI recommendations without explanation aren't recommendations—they're guesses."*

**Visual:** Split screen
- Left: Black box with "?" → "High Priority" output (no context)
- Right: Quote from fictional Forest Supervisor: *"I can't defend a decision to Washington if I don't understand how it was made."*

**Speaker Notes:**
> Federal decision-makers face a trust gap. Commercial AI tools provide answers but not reasoning. When the Inspector General asks "why did you prioritize Sector NW-4?"—you need more than "the AI said so."

---

## Slide 2: RANGER's Proof Layer

**Headline:** *"Every insight comes with its receipt."*

**Visual:** The three-layer stack diagram with the Proof Layer called out:

```
┌─────────────────────────────────────┐
│  PROOF LAYER                        │
│  • Reasoning Chain (step-by-step)   │
│  • Citations (FSM, MTBS, IRWIN)     │
│  • Confidence Score (data quality)  │
├─────────────────────────────────────┤
│  SKILLS LAYER - Domain Expertise    │
├─────────────────────────────────────┤
│  AGENTS LAYER - Orchestration       │
├─────────────────────────────────────┤
│  MODELS LAYER - Gemini 2.0 Flash    │
└─────────────────────────────────────┘
```

**Speaker Notes:**
> RANGER doesn't just give you answers—it shows you how it got there. Every agent response includes the reasoning chain, source citations, and a confidence score based on data quality. This is auditable AI.

---

## Slide 3: Burn Analyst in Action

**Headline:** *"42% high severity—here's how we know."*

**Visual:** Annotated screenshot of Burn Analyst response with callouts:

```
┌─────────────────────────────────────────────────────────┐
│ 🔥 BURN ANALYST                                         │
│                                                         │
│ "Cedar Creek shows 42% high severity burn across       │
│  18,340 acres, with 35% moderate and 23% low."         │
│                                                         │
│ ┌─ Confidence: 92% ─────────────────────────────────┐  │
│ │ ✓ MTBS classification data (2022-09-15)           │  │
│ │ ✓ Sentinel-2 imagery verified                      │  │
│ │ ✓ dNBR values within expected range               │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ▼ View reasoning (4 steps)                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 1. Retrieved fire perimeter from MTBS             │◄─┼── Step 1
│ │ 2. Calculated zonal statistics for dNBR           │◄─┼── Step 2
│ │ 3. Applied USFS severity thresholds               │◄─┼── Step 3
│ │ 4. Cross-referenced with pre-fire vegetation      │◄─┼── Step 4
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Citations: [MTBS-2022] [S2-dNBR] [FSM-2520]            │
└─────────────────────────────────────────────────────────┘
```

**Callout Annotations:**
- Arrow to "92%": *"Confidence based on data freshness and source authority"*
- Arrow to reasoning steps: *"Expandable logic trail—every step auditable"*
- Arrow to citations: *"Click to view source data"*

**Speaker Notes:**
> When the Burn Analyst says 42% high severity, you can see exactly how it calculated that. Step 1: pull the perimeter. Step 2: run the math. Step 3: apply your agency's own thresholds. Step 4: validate. This isn't a black box—it's a transparent calculation you can defend.

**Screenshot Needed:** `screenshots/burn-analyst-reasoning-chain.png`

---

## Slide 4: Trail Assessor in Action

**Headline:** *"5 trails, 15 damage points—prioritized by safety."*

**Visual:** Annotated screenshot format:

```
┌─────────────────────────────────────────────────────────┐
│ 🥾 TRAIL ASSESSOR                                       │
│                                                         │
│ "Cedar Creek fire damaged 5 trails with 15 total       │
│  damage points. Ridge Trail has 4 critical washouts."  │
│                                                         │
│ Priority Ranking:                                       │
│ 1. Ridge Trail (4 critical) - Closure recommended      │
│ 2. Valley Loop (3 moderate) - Repair within 30 days    │
│ 3. Summit Access (2 minor) - Monitor only              │
│                                                         │
│ ▼ View reasoning (3 steps)                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 1. Queried trail damage fixture for Cedar Creek   │  │
│ │ 2. Classified damage by TRACS severity codes      │  │
│ │ 3. Ranked by public safety exposure metric        │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Citations: [TRACS-CC-2024] [FSM-2350.3]                │
└─────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> The Trail Assessor doesn't just count damage points—it prioritizes by safety. Ridge Trail has critical washouts; it gets recommended for closure. Valley Loop can wait 30 days. This is the kind of triage logic your field crews need at 6 AM.

**Screenshot Needed:** `screenshots/trail-assessor-reasoning-chain.png`

---

## Slide 5: Cruising Assistant in Action

**Headline:** *"Salvage window: 18 months. Here's the math."*

**Visual:** Annotated screenshot with timber-specific callouts:

```
┌─────────────────────────────────────────────────────────┐
│ 🪵 CRUISING ASSISTANT                                   │
│                                                         │
│ "Cedar Creek has viable salvage in Sectors NW-2 and    │
│  NW-4. Estimated volume: 2.4 MMBF. Window: 18 months." │
│                                                         │
│ ┌─ Salvage Assessment ──────────────────────────────┐  │
│ │ Species Mix: 60% Ponderosa, 30% Douglas-fir       │  │
│ │ Decay Rate: Moderate (18-month viability)         │  │
│ │ Access: Road network intact in NW sectors         │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ▼ View reasoning (4 steps)                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 1. Retrieved timber stand data from FSVeg         │  │
│ │ 2. Applied species-specific decay curves          │  │
│ │ 3. Calculated volume using regional coefficients  │  │
│ │ 4. Assessed road access for haul feasibility      │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Citations: [FSVeg-CC] [R6-Decay-Curves] [FSM-2430]     │
└─────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> Timber salvage decisions have real budget implications. The Cruising Assistant shows you the decay curve math—Ponderosa has 18 months before the wood degrades past salvage value. That's not a guess; that's your regional coefficients applied to actual stand data.

**Screenshot Needed:** `screenshots/cruising-assistant-reasoning-chain.png`

---

## Slide 6: NEPA Advisor in Action

**Headline:** *"Categorical Exclusion applies—FSM 1950.41(b)(3) cited."*

**Visual:** Annotated screenshot emphasizing regulatory citations:

```
┌─────────────────────────────────────────────────────────┐
│ ⚖️ NEPA ADVISOR                                         │
│                                                         │
│ "Based on project scope (<250 acres) and standard      │
│  practices, a Categorical Exclusion is appropriate     │
│  under FSM 1950.41(b)(3)."                             │
│                                                         │
│ ┌─ Compliance Pathway ──────────────────────────────┐  │
│ │ Pathway: Categorical Exclusion (CE)               │  │
│ │ Authority: FSM 1950.41(b)(3) - Salvage Operations │  │
│ │ Documentation: CE Checklist + Decision Memo       │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ▼ View reasoning (3 steps)                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 1. Searched FSM/FSH for salvage CE thresholds     │  │
│ │ 2. Confirmed project within 250-acre CE limit     │  │
│ │ 3. Verified no extraordinary circumstances apply  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Citations: [FSM-1950.41] [FSH-1909.15-31.2] [40-CFR]   │
└─────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> NEPA compliance is where federal projects live or die. The NEPA Advisor doesn't just say "use a CE"—it cites the specific Forest Service Manual section that authorizes it. When OGC reviews this decision, the citation is right there. That's 8 hours of attorney time you just saved.

**Screenshot Needed:** `screenshots/nepa-advisor-reasoning-chain.png`

---

## Slide 7: Multi-Agent Orchestration

**Headline:** *"One question. Four specialists. Unified briefing."*

**Visual:** Sequence diagram showing coordination:

```
User Query: "Give me a recovery briefing for Cedar Creek"
                    │
                    ▼
        ┌───────────────────────┐
        │ RECOVERY COORDINATOR  │
        │   (Orchestration)     │
        └───────────┬───────────┘
                    │
    ┌───────────────┼───────────────┬───────────────┐
    ▼               ▼               ▼               ▼
┌───────┐     ┌───────────┐   ┌──────────┐   ┌──────────┐
│ BURN  │     │   TRAIL   │   │ CRUISING │   │   NEPA   │
│ANALYST│     │ ASSESSOR  │   │ASSISTANT │   │ ADVISOR  │
└───┬───┘     └─────┬─────┘   └────┬─────┘   └────┬─────┘
    │               │              │              │
    ▼               ▼              ▼              ▼
  42% high      5 trails        2.4 MMBF         CE
  severity      damaged         salvage       pathway
    │               │              │              │
    └───────────────┴──────────────┴──────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  SYNTHESIZED BRIEFING │
        │  Confidence: 88%      │
        │  Citations: 12        │
        │  Reasoning: 14 steps  │
        └───────────────────────┘
```

**Speaker Notes:**
> This is what "agentic AI" actually means. One natural language question triggers four specialist agents, each with their own expertise and data sources. The Recovery Coordinator synthesizes their findings into a unified briefing—with combined confidence and full citation trail. This isn't chat; this is coordination.

---

## Slide 8: Federal Audit Trail

**Headline:** *"Every decision. Every source. Every step. Documented."*

**Visual:** JSON export sample (enhanced format):

```json
{
  "query": "Is a CE appropriate for Cedar Creek timber salvage?",
  "response": {
    "content": "Categorical Exclusion applies under FSM 1950.41(b)(3)",
    "confidence": 94,
    "agentRole": "nepa-advisor",
    "reasoningChain": [
      "1. Searched FSM 1950 for salvage CE thresholds",
      "2. Found 250-acre limit under 1950.41(b)(3)",
      "3. Project scope (180 acres) within threshold",
      "4. Checked extraordinary circumstances - none apply"
    ],
    "citations": [
      {"source": "FSM", "reference": "1950.41(b)(3)", "snippet": "Salvage..."},
      {"source": "FSH", "reference": "1909.15-31.2", "snippet": "CE procedures..."},
      {"source": "40 CFR", "reference": "1508.4", "snippet": "Definition of CE..."}
    ]
  },
  "timestamp": "2025-12-28T10:50:30.284Z",
  "sessionId": "7e6b4441-9728-4853-a1df-e1cf29af362b"
}
```

**Callout:** *"Export this JSON for any IG audit, FOIA request, or litigation hold."*

**Speaker Notes:**
> Federal context requires federal-grade auditability. Every RANGER session can be exported as structured JSON with the complete reasoning chain and citations. When the Inspector General asks how a decision was made three years from now, you have the receipt.

**Prerequisite:** JSON export enhancement (Task 1 from punch list) must be complete for this slide to show real data.

---

## Slide 9: The Difference

**Headline:** *"From black box to glass box."*

**Visual:** Side-by-side comparison table:

| Dimension | Traditional AI | RANGER |
|-----------|---------------|--------|
| **Output** | "High priority" | "High priority because..." |
| **Sources** | Unknown | Cited (FSM, MTBS, IRWIN) |
| **Logic** | Hidden | Expandable reasoning chain |
| **Confidence** | Implied | Explicit (0-100% with basis) |
| **Audit Trail** | None | Full JSON export |
| **Defensibility** | "AI said so" | "Here's the calculation" |

**Speaker Notes:**
> This is the fundamental difference. Traditional AI gives you an answer and asks you to trust it. RANGER gives you an answer, shows you how it got there, cites its sources, and lets you export the whole thing for your records. That's the difference between a guess and a decision.

---

## Slide 10: Join the Pilot

**Headline:** *"See RANGER in action on your fire."*

**Content:**
- **Phase 1 Pilot:** Select 3 regional offices
- **Timeline:** Q1 2026
- **Investment:** Zero licensing fees (open source)
- **Requirement:** One fire recovery incident as test case

**Call to Action:** *"Contact jvalenzano to schedule a demonstration with your incident data."*

**Footer:** *"Built for the Forest Service. By people who understand the mission."*

---

## Appendix A: Skills-First Architecture

**For:** Technical audiences wanting to understand the paradigm

Show the "Moving Up the Stack" diagram with RANGER positioning:
- Models (Gemini) = Processors
- Agents (ADK) = Operating Systems  
- Skills (RANGER Library) = **Applications—where value lives**

**Key Message:** We're building at the Skills layer, where value capture happens. The agent framework will be commoditized; the domain expertise won't.

---

## Appendix B: Technology Stack

| Layer | Technology | FedRAMP Status |
|-------|------------|----------------|
| LLM | Gemini 2.0 Flash | High (Vertex AI) |
| Agents | Google ADK | Authorized |
| Data | MCP Protocol | Open Standard |
| Hosting | Cloud Run | High |
| Frontend | React | N/A (client-side) |

---

## Appendix C: Data Sources

| Source | Authority | Update Frequency |
|--------|-----------|------------------|
| MTBS | USGS/USFS | Post-fire (30-90 days) |
| IRWIN | NIFC | Real-time |
| FSM/FSH | USFS | As amended |
| Sentinel-2 | ESA/NASA | 5-day revisit |

---

## Screenshot Capture Checklist

Before finalizing this deck, capture the following from production:

- [ ] `burn-analyst-reasoning-chain.png` - Full response with expanded accordion
- [ ] `trail-assessor-reasoning-chain.png` - Priority ranking visible
- [ ] `cruising-assistant-reasoning-chain.png` - Volume estimate with citations
- [ ] `nepa-advisor-reasoning-chain.png` - FSM citation visible
- [ ] `coordinator-briefing-synthesis.png` - Full 4-agent synthesis

**Capture Settings:**
- Browser: Chrome (for consistent rendering)
- Viewport: 1920x1080
- Theme: Dark mode enabled
- Accordions: Expanded

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-28 | 0.1 | Initial draft structure |

