# RAG Pipeline Diagram Generation Prompts

**To be appended to:** `docs/assets/diagrams/developer/PLANNED-DIAGRAMS.md`

---

## 5. The Knowledge Pipeline (RAG Architecture)

**File:** `rag-knowledge-pipeline.png`
**Priority:** P1 (Critical for dev onboarding and architecture reviews)
**Location:** `docs/assets/diagrams/developer/`

### Purpose

Explains how domain knowledge flows from authoritative federal sources through Vertex AI RAG Engine to agent responses. This is the "how does the AI know that?" diagram for developers.

### Key Concepts to Visualize

1. **Corpus-per-Agent Design** — Each specialist has its own isolated knowledge base
2. **5-Step Pipeline** — Download → Sync → Create → Import → Verify
3. **GCS as Staging Layer** — Documents live in Cloud Storage before RAG indexing
4. **Proof Layer Integration** — RAG results surface as citation chips in UI

### Generation Prompt

```
Create a technical whiteboard diagram titled "The Knowledge Pipeline: From Federal Docs to Agent Intelligence"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk-drawn lines in white and cream. Hand-lettered labels. Use emerald green (#10B981) for data flow arrows, amber (#F59E0B) for processing stages, cyan (#06B6D4) for cloud services. Engineering blueprint aesthetic with slight hand-drawn imperfection.

Layout: Left-to-right flow with five distinct processing stages, plus a bottom section showing the agent-corpus mapping.

═══════════════════════════════════════════════════════════════════════════════
TOP BANNER — "DOCUMENT PROVENANCE CHAIN"
═══════════════════════════════════════════════════════════════════════════════

Subtitle: "Every citation traceable to authoritative federal source"

═══════════════════════════════════════════════════════════════════════════════
STAGE 1 (Far Left) — "AUTHORITATIVE SOURCES"
═══════════════════════════════════════════════════════════════════════════════

Stack of official source badges with agency seals:

┌─────────────────────────────────┐
│  🏛️ OFFICIAL FEDERAL SOURCES   │
├─────────────────────────────────┤
│  [USFS Shield] FS Directives    │
│  FSM • FSH • GTR Publications   │
├─────────────────────────────────┤
│  [eCFR Logo] Code of Federal    │
│  Regulations (7 CFR, 36 CFR)    │
├─────────────────────────────────┤
│  [USGS Logo] MTBS Portal        │
│  Burn Severity Classification   │
├─────────────────────────────────┤
│  [NRCS Logo] Technical Notes    │
│  Post-Fire Hydrology            │
└─────────────────────────────────┘

Document count badge: "16 Documents (Tier 1)"
Annotation: "Not scraped • Official publications only"

Arrow pointing RIGHT labeled "1_download_documents.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 2 — "LOCAL STAGING"
═══════════════════════════════════════════════════════════════════════════════

Folder structure visualization:

┌─────────────────────────────────┐
│  📁 knowledge/local/            │
├─────────────────────────────────┤
│  ├─ 📁 nepa/                    │
│  │   └─ 3 PDFs                  │
│  ├─ 📁 burn_severity/           │
│  │   └─ 6 PDFs                  │
│  ├─ 📁 timber_salvage/          │
│  │   └─ 3 PDFs                  │
│  └─ 📁 trail_infrastructure/    │
│      └─ 4 PDFs                  │
└─────────────────────────────────┘

File icon showing: "manifest.yaml"
Annotation: "Single source of truth • 16 docs inventoried"

Arrow pointing RIGHT labeled "2_sync_to_gcs.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 3 — "CLOUD STORAGE"
═══════════════════════════════════════════════════════════════════════════════

Google Cloud Storage bucket visualization:

┌─────────────────────────────────┐
│  ☁️ gs://ranger-knowledge-base-eu/ │
│  Region: europe-west3 (Frankfurt)  │
├─────────────────────────────────┤
│  📦 nepa/                       │
│  📦 burn_severity/              │
│  📦 timber_salvage/             │
│  📦 trail_infrastructure/       │
└─────────────────────────────────┘

Badge: "~$0.20/month storage"
Annotation: "Persistent • Versioned • Auditable"

Arrow pointing RIGHT labeled "3_create_corpora.py + 4_import_documents.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 4 — "VERTEX AI RAG ENGINE"
═══════════════════════════════════════════════════════════════════════════════

Central processing engine visualization (hexagonal or cylindrical):

┌─────────────────────────────────┐
│  🧠 VERTEX AI RAG ENGINE        │
│  ─────────────────────────────  │
│  Embedding: text-embedding-005  │
│  Chunks: 512 tokens             │
│  Overlap: 100 tokens            │
├─────────────────────────────────┤
│  4 CORPORA:                     │
│  ┌───────────────────────────┐  │
│  │ ranger-nepa-regulations   │  │
│  │ ranger-burn-severity      │  │
│  │ ranger-timber-salvage     │  │
│  │ ranger-trail-infrastructure│ │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Badge: "FedRAMP High (via Vertex AI)"
Annotation: "Semantic search • Relevance scoring"

Arrow pointing RIGHT labeled "rag_query.py tool calls"

═══════════════════════════════════════════════════════════════════════════════
STAGE 5 (Far Right) — "AGENT RESPONSE + PROOF LAYER"
═══════════════════════════════════════════════════════════════════════════════

Agent briefing card with embedded citations:

┌─────────────────────────────────────────┐
│  📋 NEPA ADVISOR BRIEFING               │
│  ─────────────────────────────────────  │
│  "This action qualifies for a           │
│  Categorical Exclusion under            │
│  FSH 1909.15 Chapter 30..."             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  PROOF LAYER                    │    │
│  │  Confidence: 94% ████████░░     │    │
│  │  ─────────────────────────────  │    │
│  │  Citations:                     │    │
│  │  [FSH] 1909.15-Ch30 §30.3      │    │
│  │  [CFR] 7 CFR 1b.3(a)(3)        │    │
│  │  ─────────────────────────────  │    │
│  │  Click citation → View source   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

Annotation: "Every claim traceable • Auditor-ready"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM SECTION — "CORPUS-TO-AGENT MAPPING"
═══════════════════════════════════════════════════════════════════════════════

Four-column mapping table with agent icons:

| Agent | Corpus | Documents | Domain Expertise |
|-------|--------|-----------|------------------|
| 📋 NEPA Advisor | ranger-nepa-regulations | 3 | CE/EA/EIS pathways, FSM/FSH |
| 🔥 Burn Analyst | ranger-burn-severity | 6 | MTBS, BAER, soil severity |
| 🌲 Cruising Assistant | ranger-timber-salvage | 3 | FSVeg, appraisal, deterioration |
| 🥾 Trail Assessor | ranger-trail-infrastructure | 4 | FSTAG, TMOs, accessibility |

Annotation below table: "Each agent queries ONLY its corpus • No cross-contamination • Domain isolation"

═══════════════════════════════════════════════════════════════════════════════
CORNER ANNOTATIONS (handwritten chalk style)
═══════════════════════════════════════════════════════════════════════════════

Top-left: "ADR-010: Vertex RAG Migration"
Top-right: "Region: europe-west3 (GA for RAG Engine)"
Bottom-left: "Pipeline: 5 idempotent scripts"
Bottom-right: "Total: 16 docs • 4 corpora • 1 source of truth"

═══════════════════════════════════════════════════════════════════════════════
KEY INSIGHT CALLOUT (prominent chalk box, center-bottom)
═══════════════════════════════════════════════════════════════════════════════

"🎯 THE KNOWLEDGE PRINCIPLE:
Agents are reasoning engines, not knowledge stores.
Domain expertise lives in RAG corpora.
Every insight cites its source.
Auditors can trace any claim to the original federal document."

--ar 16:9
```

---

## 6. The Federal Knowledge Base (Stakeholder View)

**File:** `federal-knowledge-base.png`
**Priority:** P1 (Critical for stakeholder demos and trust-building)
**Location:** `docs/assets/diagrams/stakeholder/`

### Purpose

Builds trust with USFS leadership and procurement officers by showing that RANGER's knowledge comes from authoritative federal sources—not "AI training data" or "scraped websites." This is the "can we trust this?" diagram for non-technical stakeholders.

### Key Messages to Convey

1. **Authoritative Sources Only** — FSM, FSH, CFR, GTR publications
2. **Domain Isolation** — Each specialist has curated expertise
3. **Transparent Citations** — Every claim links to verifiable source
4. **Federal Compliance Ready** — FedRAMP path, audit trail

### Generation Prompt

```
Create a stakeholder presentation diagram titled "The Federal Knowledge Base: Authoritative Intelligence"

Style: Professional dark presentation slide with tactical futurism aesthetic. Dark slate background (#0F172A) with subtle grid pattern. Clean sans-serif typography (not handwritten). Use RANGER brand colors: emerald (#10B981) for positive/trust elements, amber (#F59E0B) for highlights, slate grays for structure. Government/military briefing aesthetic—serious, trustworthy, precise.

Layout: Center-focused radial design with four domain quadrants, surrounded by source badges and trust indicators.

═══════════════════════════════════════════════════════════════════════════════
HEADER
═══════════════════════════════════════════════════════════════════════════════

Title: "RANGER KNOWLEDGE BASE"
Subtitle: "Authoritative Federal Sources • Transparent Citations • Auditable Trail"

Small RANGER logo (top-left), USDA Forest Service shield (top-right)

═══════════════════════════════════════════════════════════════════════════════
CENTER — "KNOWLEDGE DOMAINS" (Radial/Quadrant Layout)
═══════════════════════════════════════════════════════════════════════════════

Four domain quadrants arranged around a central hub, each with distinct color tint:

CENTRAL HUB:
- Hexagon shape
- Label: "Vertex AI RAG Engine"
- Badge: "FedRAMP High Path"
- Icon: Brain with document nodes

QUADRANT 1 (Top-Left, Purple tint) — NEPA COMPLIANCE:
┌─────────────────────────────────┐
│  📋 NEPA ADVISOR KNOWLEDGE      │
│  ─────────────────────────────  │
│  3 Documents                    │
│                                 │
│  📄 7 CFR Part 1b               │
│     USDA NEPA Procedures        │
│                                 │
│  📄 FSH 1909.15 Chapter 30      │
│     Categorical Exclusions      │
│                                 │
│  📄 FSM 1950                    │
│     Environmental Policy        │
│                                 │
│  ✓ CE/EA/EIS pathway decisions  │
│  ✓ Compliance timeline guidance │
└─────────────────────────────────┘

QUADRANT 2 (Top-Right, Orange tint) — BURN SEVERITY:
┌─────────────────────────────────┐
│  🔥 BURN ANALYST KNOWLEDGE      │
│  ─────────────────────────────  │
│  6 Documents                    │
│                                 │
│  📄 FSM 2500-2523 (BAER)        │
│     Emergency Response          │
│                                 │
│  📄 RMRS-GTR-243                │
│     Soil Burn Severity Guide    │
│                                 │
│  📄 MTBS Classification         │
│     Severity Mapping Protocol   │
│                                 │
│  + 3 more (hydrology, debris)   │
│                                 │
│  ✓ dNBR analysis guidance       │
│  ✓ BAER assessment protocols    │
└─────────────────────────────────┘

QUADRANT 3 (Bottom-Left, Green tint) — TIMBER SALVAGE:
┌─────────────────────────────────┐
│  🌲 CRUISING ASSISTANT KNOWLEDGE│
│  ─────────────────────────────  │
│  3 Documents                    │
│                                 │
│  📄 FSH 2409.12                 │
│     Timber Cruising Handbook    │
│                                 │
│  📄 FSH 2409.15                 │
│     Timber Sale Administration  │
│                                 │
│  📄 36 CFR Part 223             │
│     Appraisal & Pricing         │
│                                 │
│  ✓ Volume estimation methods    │
│  ✓ Salvage sale procedures      │
└─────────────────────────────────┘

QUADRANT 4 (Bottom-Right, Blue tint) — TRAIL INFRASTRUCTURE:
┌─────────────────────────────────┐
│  🥾 TRAIL ASSESSOR KNOWLEDGE    │
│  ─────────────────────────────  │
│  4 Documents                    │
│                                 │
│  📄 FSTAG                       │
│     Trail Accessibility Guide   │
│                                 │
│  📄 Trail Fundamentals (TMOs)   │
│     Management Objectives       │
│                                 │
│  📄 ABA Outdoor Standards       │
│     Accessibility Requirements  │
│                                 │
│  📄 Post-Fire Bridge Assessment │
│     Structural Evaluation       │
│                                 │
│  ✓ TRACS damage classification  │
│  ✓ Closure decision support     │
└─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
LEFT SIDEBAR — "AUTHORITATIVE SOURCES"
═══════════════════════════════════════════════════════════════════════════════

Vertical stack of official source badges with agency seals:

┌─────────────────────────────────┐
│  🏛️ SOURCE AUTHORITIES          │
├─────────────────────────────────┤
│  [USFS Shield]                  │
│  Forest Service Directives      │
│  FSM • FSH • Research Stations  │
├─────────────────────────────────┤
│  [Federal Register]             │
│  Code of Federal Regulations    │
│  7 CFR • 36 CFR                 │
├─────────────────────────────────┤
│  [USGS Logo]                    │
│  Monitoring Trends in           │
│  Burn Severity (MTBS)           │
├─────────────────────────────────┤
│  [NRCS Logo]                    │
│  Natural Resources              │
│  Conservation Service           │
└─────────────────────────────────┘

Caption: "Official publications only • No web scraping"

═══════════════════════════════════════════════════════════════════════════════
RIGHT SIDEBAR — "THE TRUST CHAIN"
═══════════════════════════════════════════════════════════════════════════════

Vertical flow showing citation transparency:

┌─────────────────────────────────┐
│  🔗 CITATION TRANSPARENCY       │
├─────────────────────────────────┤
│                                 │
│  ① Agent makes claim:           │
│     "Qualifies for CE under     │
│      FSH 1909.15 §30.3"         │
│            ↓                    │
│  ② Citation chip rendered:      │
│     [FSH 1909.15-Ch30]          │
│            ↓                    │
│  ③ User clicks chip:            │
│     → Opens source PDF          │
│     → Highlights relevant       │
│       passage                   │
│            ↓                    │
│  ④ Auditor verifies:            │
│     ✓ Claim matches source      │
│     ✓ Source is authoritative   │
│     ✓ Chain is unbroken         │
│                                 │
└─────────────────────────────────┘

Caption: "Every insight auditable"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM SECTION — "TRUST INDICATORS"
═══════════════════════════════════════════════════════════════════════════════

Three trust badges in a horizontal row:

BADGE 1:
┌───────────────────┐
│  ✓ AUTHORITATIVE  │
│  ───────────────  │
│  16 Federal Docs  │
│  Official Sources │
│  Only             │
└───────────────────┘

BADGE 2:
┌───────────────────┐
│  ✓ TRANSPARENT    │
│  ───────────────  │
│  Every Claim      │
│  Cites Source     │
│  Click to Verify  │
└───────────────────┘

BADGE 3:
┌───────────────────┐
│  ✓ AUDITABLE      │
│  ───────────────  │
│  Full Provenance  │
│  FedRAMP Path     │
│  IG-Ready         │
└───────────────────┘

═══════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════

Left: "RANGER • Agentic OS for Forest Recovery"
Center: "16 Documents • 4 Domains • 1 Source of Truth"
Right: "jvalenzano"

═══════════════════════════════════════════════════════════════════════════════
KEY MESSAGE CALLOUT (bottom center, above footer)
═══════════════════════════════════════════════════════════════════════════════

Prominent box with emerald border:

"RANGER doesn't make things up.
Every recommendation traces to authoritative federal guidance.
Click any citation to verify the source."

--ar 16:9
```

---

## Narrative Sections (for DIAGRAM-NARRATIVES.md)

### Narrative: The Knowledge Pipeline (RAG Architecture)

**File:** `rag-knowledge-pipeline.png`

**One-Sentence Summary:** Shows how authoritative federal documents flow through a 5-step pipeline into Vertex AI RAG Engine, enabling agents to cite specific sources in every response.

#### The Story This Diagram Tells

This is the "how does the AI actually know federal regulations?" diagram. It directly addresses the concern that AI systems "hallucinate" or "make things up" by showing the complete provenance chain from official source to agent response.

The **five-stage pipeline** traces the document journey:

1. **Authoritative Sources** — Official federal publications only. FSM directives, FSH handbooks, CFR regulations, GTR research publications. No web scraping, no Wikipedia, no "AI training data." Each document has a verifiable publication date and agency attribution.

2. **Local Staging** — Documents download to `knowledge/local/` organized by corpus. The `manifest.yaml` file serves as the single source of truth, tracking all 16 documents with their source URLs, download methods, and tier classifications.

3. **Cloud Storage** — Documents sync to Google Cloud Storage (`gs://ranger-knowledge-base-eu/`) in the europe-west3 region. This provides persistent, versioned, auditable storage with ~$0.20/month cost.

4. **Vertex AI RAG Engine** — The indexing magic happens here. Documents are chunked (512 tokens with 100 overlap), embedded using `text-embedding-005`, and stored in four isolated corpora. Semantic search enables retrieval by meaning, not just keywords.

5. **Agent Response + Proof Layer** — When an agent makes a claim, it cites the specific source. The Proof Layer renders these as clickable citation chips that link directly to the original document.

The **corpus-to-agent mapping** at the bottom is crucial for understanding domain isolation. The NEPA Advisor queries only NEPA regulations—it doesn't see timber cruising handbooks. This prevents cross-domain confusion and ensures each specialist stays in its lane.

#### Key Talking Points

- **5 idempotent scripts**: The pipeline is reproducible. Run the scripts, get the same corpora.
- **16 Tier 1 documents**: Essential federal guidance for baseline agent performance.
- **Corpus isolation**: Each agent has its own knowledge base. No cross-contamination.
- **FedRAMP path**: Vertex AI is FedRAMP High authorized. RAG inherits that compliance posture.
- **Audit trail**: Every citation traces back to the original PDF with specific section reference.

#### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| New developers | Understanding where agent knowledge comes from |
| Architecture reviewers | Evaluating the RAG implementation |
| Security/compliance | Verifying document provenance |
| Technical stakeholders | Deep-dive on the knowledge infrastructure |

---

### Narrative: The Federal Knowledge Base (Stakeholder View)

**File:** `federal-knowledge-base.png`

**One-Sentence Summary:** Demonstrates that RANGER's intelligence comes from authoritative federal sources with transparent citation chains, building trust with USFS leadership and procurement officers.

#### The Story This Diagram Tells

This is the "can we trust this AI?" diagram for non-technical stakeholders. When a Forest Supervisor sees RANGER recommend a Categorical Exclusion, they need to know that recommendation is grounded in actual Forest Service policy—not AI guesswork.

The **four-quadrant layout** shows domain expertise is organized and curated:

- **NEPA Compliance** (purple) — The NEPA Advisor knows 7 CFR Part 1b, FSH 1909.15 Chapter 30, and FSM 1950. It can determine CE/EA/EIS pathways because it has read the actual regulations.

- **Burn Severity** (orange) — The Burn Analyst knows BAER protocols, MTBS classification, soil burn severity indicators. It can interpret dNBR values because it has the RMRS-GTR-243 field guide.

- **Timber Salvage** (green) — The Cruising Assistant knows FSH 2409.12 cruising methodology, 36 CFR 223 appraisal rules. It can estimate board feet because it has the federal handbooks.

- **Trail Infrastructure** (blue) — The Trail Assessor knows FSTAG accessibility requirements, TRACS damage codes. It can recommend closures because it has the trail management standards.

The **Trust Chain** sidebar shows how citations work in practice: Agent makes claim → Citation chip rendered → User clicks → Source PDF opens → Auditor verifies. This isn't "trust me"—it's "here's my source, check it yourself."

The **three trust badges** at the bottom hit the key messages: Authoritative (official sources only), Transparent (every claim cites source), Auditable (full provenance, IG-ready).

#### Key Talking Points

- **"RANGER doesn't make things up"**: The knowledge base is curated federal documents, not AI training data.
- **Click to verify**: Every citation links to the original source. Stakeholders can check.
- **Domain isolation**: Each specialist knows its domain. The Burn Analyst doesn't give NEPA advice.
- **16 authoritative documents**: FSM, FSH, CFR, GTR publications from USFS, NRCS, USGS.
- **FedRAMP path**: Built on Google Cloud's FedRAMP High authorized infrastructure.

#### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| USFS leadership | Building trust in AI recommendations |
| Procurement officers | Demonstrating compliance readiness |
| Legal/compliance teams | Showing audit trail capability |
| Demo presentations | Explaining where knowledge comes from |
| Grant applications | Proving authoritative source methodology |

---

## Post-Generation Checklist

After generating each diagram:

- [ ] Save to correct directory (`developer/` or `stakeholder/`)
- [ ] Verify Git LFS tracks the file (`git lfs ls-files`)
- [ ] Add narrative section to `DIAGRAM-NARRATIVES.md`
- [ ] Update `knowledge/README.md` to reference diagram
- [ ] Test that diagram renders correctly in GitHub
- [ ] Consider adding to pitch deck slide set

---

*Prompts created: December 28, 2025*
*Aligned with: ADR-005 (Skills-First), ADR-010 (Vertex RAG Migration)*
*Document inventory: manifest.yaml (16 Tier 1 documents, 4 corpora)*
