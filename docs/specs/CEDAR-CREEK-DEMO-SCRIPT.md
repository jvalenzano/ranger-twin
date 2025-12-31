# Cedar Creek Fire Demo Script

> **Status:** Draft for Review  
> **Duration:** 5-7 minutes  
> **Audience:** USFS stakeholders, leadership, potential pilot regions  
> **Prerequisites:** ADR-012 Weeks 1-4 complete, Recovery Coordinator operational

---

## Demo Overview

This script demonstrates RANGER's core value proposition: **compressing weeks of disconnected analysis into minutes of unified intelligence** through multi-agent coordination and transparent reasoning.

**Key Messages:**
1. Natural language access to complex recovery data
2. Multi-agent specialization with clear attribution
3. Proof Layer transparency builds trust
4. Cross-domain synthesis creates new insights

---

## Pre-Demo Setup

### Technical Checklist
- [ ] Command Console loaded at demo URL
- [ ] Recovery Coordinator API healthy (test ping)
- [ ] **Execute each demo query ONCE to warm caches**
- [ ] **Verify response time <10s for warm queries**
- [ ] Cedar Creek Fire visible in IncidentRail
- [ ] **Cedar Creek is FIRST in list (pre-sort if needed)**
- [ ] Browser dev tools closed
- [ ] Screen resolution: 1920x1080 (or projector resolution)
- [ ] **Backup demo video queued in separate tab**
- [ ] **Cloud Run min-instances=1 confirmed**
- [ ] Backup: Screenshots of expected responses

### Data State
- [ ] Cedar Creek Fire in "Active Recovery" phase
- [ ] MTBS burn severity data loaded (if ADR-013 complete)
- [ ] Mock/fixture data for trail damage and timber estimates

### Browser State
- [ ] Fresh session (clear localStorage if needed)
- [ ] No other tabs open
- [ ] Bookmarks bar hidden

---

## Demo Script

> ⚠️ **Timing Note:** Agent responses may take 10-30 seconds for complex queries.
> Script timing assumes warm cache. If cold start occurs, pivot to backup video.
> Pre-warm all queries 5 minutes before stakeholders arrive.

### Opening (30 seconds)

**[Screen: Mission Control with BriefingStrip visible]**

> "This is RANGER—the Recovery and Assessment Network for Geospatial Emergency Response. What you're looking at is Mission Control, designed for the reality of forest recovery: the 8-minute briefing window.
>
> Regional Forester Maria has 8 minutes before her call with Washington. She needs to know: What's going sideways? Where's the resource pressure? What do I tell leadership?
>
> Let's show you how RANGER answers those questions."

---

### Interaction 1: Status Overview (60 seconds)

**[Click on Cedar Creek Fire in IncidentRail]**

> "Cedar Creek Fire, Oregon, 2022. 127,000 acres, currently in active recovery phase."

**[Type in AgentChat]:**
> `What is the current recovery status of Cedar Creek?`

**[Wait for response — expect Recovery Coordinator to respond]**

> "Notice the response comes from the Recovery Coordinator—RANGER's orchestration agent. It's synthesizing information across multiple domains."

**[Point to agent attribution in message]**

> "The Coordinator delegated to specialists. See how it references the Burn Analyst's severity assessment and the Trail Assessor's damage report. This isn't one AI making things up—it's a coordinated team with clear attribution."

---

### Interaction 2: Proof Layer Deep Dive (90 seconds)

**[Click on confidence badge in the agent response]**

> "This confidence score—let's say 0.85—isn't arbitrary. Click it."

**[ProofLayerPanel opens]**

> "This is the Proof Layer. Every insight RANGER provides comes with a reasoning chain. You can see:
> - Which agent made each assessment
> - What data sources were consulted
> - The actual citations from federal regulations and satellite data
>
> This is how we build trust in AI for federal use. No black boxes. Every conclusion traceable to its source."

**[Point to specific citation chip]**

> "This citation links directly to the FSM regulation that informed the NEPA pathway recommendation. Click it, and you're reading the actual source document."

**[Close ProofLayerPanel]**

---

### Interaction 2.5: Demonstrating AI Limits (60 seconds)

**[Type intentionally ambiguous query]:**
> `Should we allow grazing in the burned area next spring?`

**[Wait for response — expect hedged answer with low confidence]**

> "Notice the confidence score is lower here—0.52. RANGER knows this question requires judgment beyond its data.
>
> See how it responds: It provides the relevant regulations and data points, but explicitly flags this for human review. It even suggests connecting with the Range Management Specialist.
>
> This is critical for federal AI: the system knows what it doesn't know."

**[Point to the "Flagged for Review" indicator if present]**

---

### Interaction 3: Cross-Domain Synthesis (90 seconds)

**[Type in AgentChat]:**
> `Which areas have high burn severity AND trail access issues that could delay timber salvage?`

**[Wait for response — expect multi-agent coordination]**

> "This question requires three specialists to coordinate:
> - Burn Analyst identifies high-severity zones
> - Trail Assessor flags access restrictions
> - Cruising Assistant factors in timber salvage priorities
>
> Watch the response."

**[Response arrives]**

> "The Recovery Coordinator synthesized all three perspectives into a unified answer. This analysis would normally take your team days of cross-referencing different systems. RANGER does it in seconds.
>
> And critically—look at the Proof Layer. You can see exactly how each specialist contributed, what data they used, and where their assessments overlap or conflict."

---

### Interaction 4: Actionable Output (60 seconds)

**[Type in AgentChat]:**
> `What NEPA pathway should we use for emergency trail repair on the north section?`

**[Wait for response — expect NEPA Advisor response]**

> "Now we're asking a compliance question. The NEPA Advisor specializes in regulatory pathways."

**[Response arrives with specific pathway recommendation]**

> "Notice it's not just giving an answer—it's citing the specific categorical exclusion or EA requirement, with the FSH reference. Your NEPA coordinator can verify this in minutes, not hours.
>
> That's the difference: RANGER doesn't replace your experts. It accelerates their work by 10x while maintaining the audit trail they need."

---

### Closing: Path Forward (90 seconds)

**[Screen: Implementation timeline graphic]**

> "Three questions you're thinking:
>
> **How much?** $6,000-9,000 per year for cloud infrastructure. Zero licensing fees. Compare that to $100K+ for commercial platforms.
>
> **How long?** 8-12 weeks from kickoff to pilot deployment for a single forest. The core system you just saw is already built.
>
> **Security?** We're building to FedRAMP Moderate standards from day one. All data stays in your GCP environment. Full audit trail for every AI decision.
>
> **What's next?** We're looking for a pilot forest to prove this in the field. 90-day pilot, no long-term commitment.
>
> Questions?"

---

## Backup Responses

If the live system fails, have these screenshots/responses ready:

### Backup 1: Status Response
```
Based on current assessments:

**Cedar Creek Fire Recovery Status:**
- Phase: Active Recovery (Day 45)
- Burn Severity: 35% high severity, 40% moderate, 25% low/unburned
- Trail System: 12 trails assessed, 4 require major repair
- Timber Impact: Estimated 45 MMBF salvage opportunity

**Priority Actions:**
1. Emergency erosion control on Moolack Ridge (high severity + steep slopes)
2. Trail 3547 closure extension pending debris removal
3. Timber salvage environmental review initiated

*Sources: MTBS 2022-08-15, TRACS Assessment 2022-09-01, FSVeg Inventory*
```

### Backup 2: Cross-Domain Response
```
Areas with HIGH burn severity AND trail access issues affecting timber salvage:

**Moolack Ridge Section (T15S R5E)**
- Burn Severity: High (Class 5)
- Trail 3547: CLOSED - debris flow damage
- Timber Access: BLOCKED until trail repair (~6 weeks)
- Salvage Impact: 8.2 MMBF inaccessible

**French Pete Creek (T16S R5E)**
- Burn Severity: High (Class 4-5)
- Trail 3551: RESTRICTED - bridge out
- Timber Access: LIMITED to helicopter only
- Salvage Impact: 5.1 MMBF at premium extraction cost

**Recommendation:** Prioritize Trail 3547 repair to unlock highest-value salvage unit.

*Cross-referenced: Burn Analyst (MTBS), Trail Assessor (TRACS), Cruising Assistant (FSVeg)*
```

---

## Anticipated Questions & Answers

### "How accurate is this?"
> "RANGER's accuracy is bounded by its source data. The Proof Layer shows you exactly what data informed each answer and its timestamp. If the MTBS data is from August and it's now December, you'll see that. We're not hiding uncertainty—we're surfacing it."

### "What if the AI is wrong?"
> "That's why we built the Proof Layer. Every claim has a citation. Your specialists can verify in minutes what would take hours to research from scratch. RANGER accelerates verification, it doesn't eliminate it."

### "Does this work offline / in the field?"
> "The current version requires connectivity. Field Mode provides high-contrast UI for outdoor conditions. Offline capability is on the roadmap for Phase 2."

### "How much does this cost?"
> "RANGER is built entirely on open-source tools with no licensing fees. Ongoing costs are cloud infrastructure—estimated $6,000-9,000 annually for a typical region. Compare that to $100K+ for commercial GIS platforms."

### "Can this work for other agencies / incident types?"
> "Absolutely. The architecture is fire-agnostic. The same Skills-First approach could support NRCS rangeland recovery, BLM post-fire grazing, or any domain where multiple specialists need to coordinate around geospatial data."

### "What data does it have access to?"
> "Currently: MTBS burn severity, NIFC perimeters, FIRMS hotspots, and your local trail/timber inventories. We connect via MCP—Model Context Protocol—which means adding new data sources is a configuration change, not a rebuild."

---

## Backup Video Protocol

**Record a complete demo run (5 minutes) the day before each stakeholder presentation.**

### Recording Checklist
- [ ] Screen capture at 1080p
- [ ] Voiceover matches script
- [ ] All four interactions shown
- [ ] Response times edited to ~3 seconds (showing "thinking..." indicator)
- [ ] No PII or real user data visible

### When to Switch to Video
- First response takes >30 seconds
- Agent returns an error
- Network connectivity issues
- Any technical difficulty that causes awkward silence

### Switch Script
> "Let me show you a recording we prepared that demonstrates the full flow. This is the exact same system—we recorded this yesterday."

**Never apologize for switching to video. Federal audiences expect backup plans.**

---

## Post-Demo Follow-Up

### Immediate Actions
- [ ] Send attendee list to sales/partnerships
- [ ] Share demo recording (if recorded)
- [ ] Schedule technical deep-dive for interested parties
- [ ] Document any questions we couldn't answer

### Materials to Share
- [ ] Link to this demo script (redacted version)
- [ ] Architecture overview (one-pager)
- [ ] Pilot program information
- [ ] Contact for technical questions

---

**Document Owner:** RANGER Product Team  
**Last Updated:** 2024-12-31  
**Status:** Draft for Review
