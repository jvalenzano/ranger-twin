# RANGER Strategic Product Roadmap

> **Single Source of Truth for Product Strategy**
>
> **Version:** 1.0  
> **Created:** December 30, 2025  
> **Owner:** CTO / Product Leadership  
> **Audience:** Program Managers, Product Owners, Technical Leads, Senior Developers
>
> **Related Documents:**
> - [`_!_IMPLEMENTATION-ROADMAP.md`](./docs/_!_IMPLEMENTATION-ROADMAP.md) — Technical execution details
> - [`_!_PRODUCT-SUMMARY.md`](./docs/_!_PRODUCT-SUMMARY.md) — Vision and positioning
> - [`ADR-005-skills-first-architecture.md`](./docs/adr/ADR-005-skills-first-architecture.md) — Architectural mandate

---

## Executive Summary

This roadmap defines RANGER's product strategy based on comprehensive practitioner research. It answers three questions:

1. **What problem are we actually solving?**
2. **In what sequence should we build features?**
3. **Why does the sequence matter?**

**The Core Strategic Insight:**

Our original hypothesis was "Forest Supervisors need briefing documents faster." The research reveals this is a symptom, not the disease. The actual problem:

> **Post-fire recovery coordination is systematically failing because information is trapped in agency silos, programs are designed for fires 10x smaller than today's mega-fires, and the same specialists are simultaneously needed for suppression, assessment, NEPA compliance, and implementation—all while making funding decisions they know are based on incomplete data.**

Document preparation burden is real, but it's a downstream effect of coordination collapse at scale.

**Strategic Repositioning:**

| Before | After |
|--------|-------|
| RANGER is a document automation tool | RANGER is an intelligence layer for inter-agency coordination under uncertainty |
| Value proposition: "Save time writing reports" | Value proposition: "Compress weeks of coordination into hours of unified situational awareness" |
| Demo climax: Generated briefing document | Demo climax: Cross-jurisdictional synthesis → then generated briefing as proof |

---

## The Trust Hierarchy: Why Sequence Matters

The research is unambiguous: forestry professionals will reject AI that appears to replace their judgment. The "black box" problem is the #1 adoption barrier. Federal AI governance law *requires* transparent reasoning.

**Adoption follows this pattern:**

```
Trust in Data → Trust in AI → Trust in Recommendations → Behavior Change
```

If users don't trust the basic data display (filtered counts, visual consistency), they'll never trust AI recommendations. If they don't trust AI reasoning transparency, they'll never act on optimization suggestions.

**This means our roadmap must follow a specific sequence:**

| Phase | Focus | Risk Level | Adoption Unlock |
|-------|-------|------------|-----------------|
| **Phase 1: Earn Trust** | Low-risk, high-visibility wins | Low | "This AI shows its work and saves me time" |
| **Phase 2: Extend Value** | Coordination intelligence | Medium | "This solves problems I couldn't solve alone" |
| **Phase 3: Transform Operations** | Multi-agency platform | High | "This is how we do post-fire recovery now" |

**Violating this sequence is catastrophic.** Leading with high-stakes decision support before trust is established would cause one confident-sounding but factually wrong recommendation to poison AI adoption across the agency for years.

---

## Phase 1: Earn Trust (Foundation)

**Timeline:** Months 1-6  
**Risk Level:** Low  
**Success Metric:** 80% pilot user adoption with >4.0/5.0 satisfaction scores

### P1.1: Transparent Reasoning Infrastructure

**Priority:** CRITICAL — Foundation for everything else

**What:**
- Every RANGER output includes confidence scores (0-100%)
- Expandable logic chains showing reasoning steps
- Data source citations with specific references
- Regulatory citations (FSM/FSH/36 CFR sections)
- Explicit acknowledgment of data gaps and uncertainty

**Why First:**
This isn't a feature—it's the minimum trust threshold for federal AI deployment. The research shows foresters explicitly want to understand "how and why" AI reaches conclusions. The Federal AI Governance Act legally requires it. Our Proof Layer architecture already embeds this philosophy; Phase 1 operationalizes it as the foundation.

**Success Criteria:**
- [ ] Every agent response includes proof_layer object
- [ ] Reasoning chains are expandable in UI
- [ ] Citations link to actual source documents
- [ ] Confidence scores reflect data quality tiers
- [ ] Data gaps are explicitly surfaced

**Technical Reference:** Proof Layer already implemented in agent responses. UI expansion in `apps/command-console/`.

---

### P1.2: Document Generation with Regulatory Synthesis

**Priority:** HIGH — First "wow" deliverable

**What:**
- Auto-generate first drafts of Decision Memos, Executive Summaries, BAER reports
- Conform to required federal formats (not custom templates)
- Link every recommendation to specific FSM/FSH/36 CFR sections
- Auto-redact sensitive 2500-8 procurement data for public summaries
- Generate both confidential and interagency-shareable versions

**Why This Matters:**
The 7-day BAER funding request deadline with multiple report versions is a documented pain point. Teams must create separate public summaries and confidential forms—essentially writing the same content twice. We compress that while demonstrating regulatory expertise.

**Success Criteria:**
- [ ] Generated documents conform to FS-2500-8 format
- [ ] 50%+ reduction in document preparation time (measured)
- [ ] <1% error rate in generated content
- [ ] Every recommendation cites specific regulatory authority
- [ ] Public version auto-redacts procurement-sensitive data

**Critical Caveat:** Time savings must be substantial. If review/editing overhead negates the savings, we've lost credibility. The bar is high because this is our first trust-building deliverable.

**Technical Reference:** NEPA Advisor agent + new Document Generation skill. Template structures in `agents/nepa_advisor/data/templates/`.

---

### P1.3: Data Quality Flagging System

**Priority:** HIGH — Differentiator that builds trust

**What:**
- AI layer that systematically identifies data quality issues
- Flags: missing high-elevation assessment data, burn severity maps generated pre-snowmelt, treatment recommendations extrapolating beyond training data confidence
- Surfaces the "DataDebt" problem explicitly
- Quantifies uncertainty instead of hiding it

**Why This Matters:**
The research introduces "DataDebt"—accumulated poor-quality data that fundamentally limits AI usefulness. This is the #2 AI adoption concern after black-box reasoning. The winter assessment problem (Line Officers signing funding requests knowing they have incomplete data) is real and documented.

**Strategic Rationale:**
Counterintuitively powerful. Instead of pretending our AI is omniscient, we build a system that *explicitly acknowledges what it doesn't know*. This builds trust precisely because it demonstrates epistemic humility—the opposite of the "confident AI that's wrong" failure mode practitioners fear.

**Success Criteria:**
- [ ] Data quality flags appear in agent responses
- [ ] Missing data is explicitly called out (not silently ignored)
- [ ] Confidence scores degrade appropriately with data gaps
- [ ] Users can see *why* confidence is low
- [ ] Historical data limitations are surfaced (e.g., "No assessment data above 8,000ft due to snow cover")

**Technical Reference:** New skill across agents. Integrate with existing confidence scoring in proof_layer.

---

### P1.4: Co-Development Infrastructure

**Priority:** HIGH — Process feature, not product feature

**What:**
- Embedded partnerships with 2-3 pilot forests (different regions, fire types)
- Weekly iteration cycles incorporating practitioner feedback
- Video testimonials from Line Officers and BAER Team Leaders
- Meeting notes from practitioner design sessions
- Documented evidence that practitioners shaped every decision

**Why This Matters:**
The research is emphatic: "The biggest thing was partnership buy-in." Technology imposed top-down without co-development gets rejected regardless of capability.

**Strategic Rationale:**
This isn't a feature in the product sense—it's a feature of our *process* that becomes a competitive moat. By Phase 2, we have documented evidence that practitioners shaped every decision. That's the difference between "the Forest Service's AI initiative" and "some tech company's product we're piloting."

**Success Criteria:**
- [ ] 2+ pilot forests actively engaged
- [ ] Weekly feedback incorporated into sprints
- [ ] 3+ video testimonials from Line Officers
- [ ] Design session documentation in repo
- [ ] Practitioner names on changelog/credits

**Operational Note:** This requires dedicated customer success/partnership capacity, not just developer time.

---

## Phase 2: Extend Value (Coordination Intelligence)

**Timeline:** Months 6-12  
**Risk Level:** Medium  
**Prerequisite:** Phase 1 trust established with documented pilot success
**Success Metric:** Measurable coordination time reduction, IPIC engagement

### P2.1: Inter-Agency Coordination Dashboard

**Priority:** CRITICAL — Addresses dominant pain point

**What:**
- Real-time shared situational awareness across Forest Service, NRCS, FEMA, EPA
- Identify overlaps, gaps, and conflicting priorities across federal/state/private lands
- Flag when BAER and EWP assessments are duplicating effort
- Surface coordination gaps that no single agency can see
- Track jurisdictional handoffs and decision dependencies

**Why This Matters:**
The research documents this as the **dominant pain point**. The Colorado fires revealed "tremendous policy tensions" between agencies, causing 6+ month delays in critical stabilization work. One interviewee called it "the most frustrating series of conversations I've ever been in."

**Strategic Rationale:**
This is where RANGER becomes indispensable rather than merely useful. We're not automating documents anymore—we're solving a systemic coordination failure that no amount of human effort can fix because the information is trapped in agency silos. The newly formed Interagency Post-fire Integration Council (IPIC) needs exactly this capability.

**Success Criteria:**
- [ ] Multi-agency view showing all recovery activities on single map
- [ ] Overlap detection: "BAER and EWP both assessing Sector NW-4"
- [ ] Gap detection: "No agency addressing debris flow risk in Sector SE-2"
- [ ] Timeline conflicts surfaced: "NRCS funding arrives 6 weeks after BAER deadline"
- [ ] IPIC pilot engagement secured

**Technical Reference:** New MCP connectivity to NRCS, FEMA data sources. Extension of Recovery Coordinator synthesis capabilities.

---

### P2.2: Implementation Capacity Matching

**Priority:** HIGH — Addresses staffing crisis

**What:**
- Real-time matching of available BAER specialists (by qualification: BAES, BADO, READ, REAC) to recovery needs
- Track specialist location, availability, travel constraints
- Historical performance data (which teams completed on-time? highest treatment effectiveness?)
- Connect people who need help with people who can provide it

**Why This Matters:**
The research documents a staffing crisis. The same specialists serve as Resource Advisors during active suppression, BAER assessment team members, BAR request formulators, and NEPA reviewers—simultaneously. Line Officer guidance explicitly warns about "staff capacity and burn-out during busy fire seasons."

**Strategic Rationale:**
High-value but lower-risk than decision optimization because it's *facilitative* rather than *prescriptive*. We're connecting people, not replacing judgment. Aligns with federal "talent-exchange program" vision in America's AI Action Plan.

**Success Criteria:**
- [ ] Specialist database with real-time availability
- [ ] Qualification matching (which specialists are BAES-certified?)
- [ ] Geographic optimization (minimize travel time)
- [ ] Capacity alerts: "Region 6 has 0 available hydrologists for next 2 weeks"
- [ ] Matchmaking suggestions reviewed and accepted by users

**Technical Reference:** New specialist tracking module. Integration with incident management systems.

---

### P2.3: Constrained Recovery Optimization

**Priority:** HIGH — Highest value, requires trust foundation

**What:**
- Budget allocation scenarios with transparent trade-off analysis
- "If we only have funding for 3 trail repairs, which maximize public safety given these constraints?"
- Multi-objective optimization with explicit constraint visualization
- Defensible allocation recommendations with full reasoning chains

**Why This Matters:**
The research found **no equivalent tools exist** for post-fire recovery optimization. Pre-fire planning has ForSys, STARFire, RAPIDS. Post-fire decisions are experiential rather than model-driven. This is a genuine capability gap.

**Strategic Rationale:**
Highest-value feature in the roadmap, but also highest-risk. Only works after trust is established through Phase 1. Must be positioned correctly:
- ❌ Don't say: "What-if scenario planning" (sounds theoretical)
- ✅ Do say: "Constrained recovery optimization under real resource limits" (emphasizes decision support)

**Success Criteria:**
- [ ] Users can define constraints (budget, timeline, personnel)
- [ ] System generates ranked alternatives with trade-offs
- [ ] Every recommendation includes full reasoning chain
- [ ] Trade-off visualization shows what's sacrificed in each scenario
- [ ] Users report recommendations are "defensible to leadership"

**Technical Reference:** New optimization skill for Recovery Coordinator. Builds on existing portfolio triage scoring.

---

### P2.4: NEPA Timeline Prediction

**Priority:** MEDIUM — Supports existing NEPA Advisor

**What:**
- AI analysis of which treatments likely require EA vs. CE
- Historical NEPA timelines for similar projects on this forest
- Litigation risk assessment based on project type, location, advocacy group activity
- Recommended mitigation measures to reduce review time

**Why This Matters:**
Post-fire recovery projects requiring NEPA review face 3.6-4.7 year timelines, but BAER treatments must be completed within 1 year. This creates coordination paralysis driven by "fear of litigation."

**Strategic Rationale:**
Directly supports our NEPA Advisor agent while addressing a documented operational bottleneck. Helps Line Officers make informed risk calculations rather than defaulting to over-analysis.

**Success Criteria:**
- [ ] Pathway prediction accuracy >80%
- [ ] Timeline estimates within 20% of actual
- [ ] Litigation risk factors explicitly identified
- [ ] Mitigation recommendations cite successful precedents
- [ ] Users report reduced "fear of litigation" paralysis

**Technical Reference:** Extension of NEPA Advisor RAG with historical project data.

---

## Phase 3: Transform Operations (Platform)

**Timeline:** Months 12-24  
**Risk Level:** High  
**Prerequisite:** Phase 2 coordination intelligence proven with documented value
**Success Metric:** Multi-agency adoption, Congressional/OMB visibility

### P3.1: Secondary Disaster Prediction

**Priority:** HIGH — Addresses unfunded federal gap

**What:**
- AI modeling of debris flow probability based on burn severity, terrain, historical precipitation
- 2-year forecasting window for flooding risk from burn scars
- Automated alerts to local emergency management when risk thresholds exceeded
- Pre-positioning recommendations before flood season

**Why This Matters:**
The research documents that floods 2-3 years post-fire have **no federal funding program**. The Stafford Act doesn't cover secondary disasters from burn scars. Communities are blindsided.

**Strategic Rationale:**
Positions RANGER beyond current agency mandates—we're not just serving BAER assessments, we're extending federal recovery intelligence into an unfunded gap. This is the kind of capability that gets Congressional attention and budget requests.

**Success Criteria:**
- [ ] Debris flow risk model trained on historical data
- [ ] 2-year forecast accuracy validated against actual events
- [ ] Alert system integrated with local emergency management
- [ ] Pre-positioning recommendations generated 60+ days before risk windows
- [ ] Congressional/OMB briefing delivered on capability

**Technical Reference:** New predictive modeling capability. Integration with NWS precipitation forecasts.

---

### P3.2: Multi-Agency Recovery Operating System

**Priority:** CRITICAL — Endgame positioning

**What:**
- RANGER as the default platform for IPIC coordination
- Integration with IRWIN, NIFC, GEE, TRACS, FSVeg, ePlanning
- The nerve center where all post-fire recovery intelligence flows
- Portable skills that transfer across agencies without rebuilding

**Why This Matters:**
The 2023 Congressional commission called for "organizational restructuring, program enhancement, and inter-agency coordination." IPIC was formed in 2025 to address this. They need tools.

**Strategic Rationale:**
This is the endgame. RANGER isn't a Forest Service tool anymore—it's the inter-agency coordination platform for all wildfire recovery. The Skills-First architecture (ADR-005) was designed precisely for this moment: portable expertise packages that transfer across agencies without rebuilding the foundation.

**Success Criteria:**
- [ ] IPIC adopts RANGER as coordination platform
- [ ] Skills reused by NRCS, BLM, NPS without modification
- [ ] Single sign-on across participating agencies
- [ ] Audit trail meets IG requirements
- [ ] Congressional testimony references RANGER capabilities

**Technical Reference:** MCP integrations across agency boundaries. Skills-First portability validation.

---

## Explicitly Deprioritized Features

Based on research findings, these features are **not validated** as addressing documented practitioner pain points:

### Legacy System Export (TRACS CSV, FSVeg XML)

**Research Finding:** No documented pain for data re-entry between these systems. Interviews focused on coordination, funding, staffing—not system interoperability.

**Decision:** Implement only if pilot users specifically request. Do not lead with this feature in demos or marketing.

**Revisit Trigger:** If 3+ pilot users independently request this capability.

---

### Visual Before/After Comparisons

**Research Finding:** Remote sensing is already standard. BARC maps deliver burn severity information within a week. The question is whether interactive overlays add value beyond current GIS workflows.

**Decision:** User test with actual BAER teams before investing. May be redundant to existing capabilities.

**Revisit Trigger:** If pilot users report current BARC maps are insufficient and specify what's missing.

---

### Mobile Offline Field Companion

**Research Finding:** While field use is mentioned, the primary pain points are coordination and decision support at the leadership level, not field data capture.

**Decision:** Defer to post-MVP. Focus on the "nerve center" value proposition first.

**Revisit Trigger:** Phase 2 success creates demand for field extension.

---

## Features We Haven't Built But Should Consider

These emerged from research as potential high-value additions not in our original scope:

### DataDebt Remediation System (Research-Identified Gap)

**Problem:** Poor-quality data accumulation undermines all analysis. Agencies have "gaps in knowledge about how and why" data is being used.

**Opportunity:** Systematic data quality scoring and improvement recommendations. Addresses #2 AI adoption concern.

**Recommendation:** Integrate into P1.3 (Data Quality Flagging) as enhancement.

---

### Implementation Capacity Marketplace (Research-Identified Gap)

**Problem:** "Often difficult to find off-unit staff for implementation." Same specialists pulled in multiple directions.

**Opportunity:** Real-time matching beyond just specialists—include contractors, equipment, training resources.

**Recommendation:** Extend P2.2 based on pilot feedback.

---

### Secondary Disaster Funding Gap Alert (Research-Identified Gap)

**Problem:** No federal program covers floods 2-3 years post-fire. Communities have no warning.

**Opportunity:** Early warning system that could drive policy change.

**Recommendation:** Include in P3.1 as policy advocacy component.

---

## Success Metrics by Phase

### Phase 1 Metrics (Trust Building)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Pilot user adoption | 80% of eligible users | Active usage tracking |
| User satisfaction | >4.0/5.0 | Survey at 3 months |
| Document time savings | 50%+ reduction | Time study comparison |
| Error rate | <1% in generated content | QA review of outputs |
| Reasoning transparency rating | >4.0/5.0 | User survey on "I understand how it works" |

### Phase 2 Metrics (Coordination Value)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Coordination time reduction | 40%+ | Time study comparison |
| Inter-agency visibility | 3+ agencies using shared view | Usage tracking |
| Specialist matching success | >70% acceptance rate | User feedback |
| Optimization recommendations used | >50% | Decision tracking |
| IPIC engagement | Active pilot participation | Partnership documentation |

### Phase 3 Metrics (Platform Transformation)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Multi-agency adoption | 3+ agencies | Active usage |
| Skills reuse | >50% transferred without modification | Code metrics |
| Congressional/OMB visibility | Briefing delivered | Documentation |
| Secondary disaster alerts | 2+ validated predictions | Outcome tracking |
| Audit compliance | IG approval | Formal review |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Trust failure in Phase 1** | Medium | Critical | Extensive co-development, transparent reasoning, conservative claims |
| **Confident wrong answer** | Medium | Critical | Mandatory confidence scoring, data quality flags, human-in-the-loop |
| **Inter-agency politics block Phase 2** | High | High | Start with willing partners, demonstrate value, let others opt-in |
| **Scope creep dilutes focus** | High | Medium | Strict adherence to this roadmap, parking lot for ideas |
| **Technical debt from AI-accelerated development** | High | Medium | Regular architectural hygiene, canonical documentation |
| **Pilot forest engagement stalls** | Medium | High | Multiple parallel pilots, flexible timeline, dedicated partnership capacity |

---

## Governance: How This Document Is Used

### For Program Managers
- Use Phase breakdown for quarterly planning
- Success metrics define what "done" means
- Deprioritized features list prevents scope creep

### For Product Owners
- Feature priorities are sequenced with rationale
- Success criteria define acceptance tests
- Technical references point to implementation details

### For Technical Leads
- Link each feature to existing architecture (ADR references)
- Identify skill development vs. infrastructure work
- Coordinate with `_!_IMPLEMENTATION-ROADMAP.md` for sprint planning

### For Senior Developers
- Features specify what, not how
- Technical references indicate where to start
- Success criteria guide testing strategy

### Document Updates
- **Owner:** CTO / Product Leadership
- **Review Cadence:** Monthly during active development, quarterly in maintenance
- **Update Triggers:** Major research findings, pivot decisions, phase transitions
- **Change Log:** Maintained at bottom of document

---

## The Demo Narrative: Bringing It Together

For stakeholder demonstrations, the narrative should follow this arc:

1. **Open with the problem** (2 min)
   - Show the coordination chaos: agencies working independently, duplicating effort
   - Maria has 8 minutes before her Washington call. She manages 47 fires.
   - "Where's my risk concentrated? What changed overnight? What do I tell leadership?"

2. **Show the intelligence synthesis** (5 min)
   - Recovery Coordinator identifies gaps and conflicts across jurisdictions
   - Multiple specialists contribute domain expertise
   - Real-time situational awareness that would take days to assemble manually

3. **Demonstrate transparent reasoning** (5 min)
   - Expand a recommendation to show the proof layer
   - Click through to source citations
   - Show confidence scores reflecting data quality

4. **Climax: The briefing document** (3 min)
   - Generate a formatted executive briefing
   - Show regulatory citations embedded throughout
   - "This would have taken 2 hours to write. You just watched it generated in 30 seconds."

5. **Close with the vision** (2 min)
   - "The document is proof the intelligence layer works."
   - "The intelligence layer is the actual value."
   - "What you just saw for one forest, imagine across all six regions."

**Total:** 15-20 minutes, leaving time for questions

---

## Appendix: Research Sources

This roadmap is grounded in comprehensive practitioner research including:

- 50+ interviews synthesized from Colorado Cameron Peak and East Troublesome fire recovery efforts
- Northern Arizona University forestry professional AI attitudes study (2025)
- Federal AI Governance and Transparency Act (H.R. 7532) requirements
- USDA AI Strategy FY 2025-2026
- Department of Interior AI Use Case Inventory (December 2024)
- BAER Line Officer Guidance (2025)
- GAO wildfire recovery coordination reports
- Interagency Post-fire Integration Council (IPIC) formation documentation

Full research synthesis available upon request.

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-30 | CTO | Initial strategic roadmap based on expert panel research |

---

**Document Status:** ACTIVE — Single Source of Product Strategy Truth  
**Next Review:** January 15, 2026 (post-pilot launch)
