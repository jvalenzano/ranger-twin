# Definition: Skill Categories

> [!IMPORTANT]
> **Standard:** This taxonomy is aligned with **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)** and the **[Skill Format Specification](../specs/skill-format.md)**.

## 1. Overview
In the Skills-First paradigm, a **Skill** is classified into one of three tiers based on its reusability and domain specificity. This classification determines its location in the [Skills Library](../specs/SKILLS-LIBRARY-INDEX.md).

## 2. Category Taxonomy

### 2.1. Foundation Skills
**Location:** `skills/foundation/`
**Reusability:** Universal across USDA agencies and RANGER workflows.
**Characteristics:**
- Agency-neutral logic.
- Focused on common AI utilities (RAG, geospatial, document manipulation).
- Minimal dependency on RANGER-specific data schemas.

**Examples:**
- `nepa-rag-retriever`: RAG logic over the Code of Federal Regulations.
- `geo-converter`: Utility for coordinate system transformation (NAD83 to WGS84).
- `federal-report-generator`: PDF styling for standard federal memos.

### 2.2. Agency Skills
**Location:** `skills/forest-service/`
**Reusability:** Shared across all RANGER agents, but specific to the US Forest Service domain.
**Characteristics:**
- Understands USFS terminology, handbook codes (FSM/FSH), and activity types.
- Operates on "Agency Context" (e.g., Regional boundaries, Forest Service specific GIS layers).

**Examples:**
- `dnbr-mapping`: Burn severity logic specific to USFS satellite analysis standards.
- `usfs-activity-norm`: Normalizing Survey123 field captures into USFS work orders.
- `triage-scoring-usfs`: Multi-factor prioritization specific to post-fire recovery.

### 2.3. Application Skills
**Location:** `agents/[agent-name]/skills/`
**Reusability:** Agent-specific; tailored to a single specialist's unique orchestration or domain logic.
**Characteristics:**
- Highly specialized logic not required by other agents.
- Often related to agent-specific tool invocation or custom reasoning chains.

**Examples:**
- `delegation`: The Recovery Coordinator's internal routing logic.
- `trail-closure-eval`: Trail Assessor specific logic for determining closure status.
- `timber-salvage-eval`: Cruising Assistant specific logic for board-foot math.

## 3. Decision Logic for Placement

| Question | Category |
|----------|----------|
| Is this logic useful for a DIFFERENT federal agency (e.g., NRCS)? | **Foundation** |
| Is this logic useful for multiple specialists in RANGER? | **Agency** |
| Is this logic only used by ONE specialist? | **Application** |

---
*Created: December 2025*
