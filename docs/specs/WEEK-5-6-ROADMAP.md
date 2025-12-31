# RANGER Roadmap: Weeks 5-6 and Beyond

> **⚠️ Scope Notice:** This roadmap targets **demo readiness**, not production deployment.
> FedRAMP authorization requires 4-6 additional months beyond this timeline.
> See "FedRAMP Planning" section for production path.

> **Status:** Draft for Review  
> **Purpose:** Forward planning after ADR-012 and ADR-013 Phase 1 completion  
> **Planning Horizon:** 4-6 weeks post-current sprint

---

## Current State (End of Week 4)

### Completed
| ADR | Status | Deliverables |
|-----|--------|--------------|
| ADR-012 Week 1 | ✅ | BriefingStrip, PhaseFilterChips, hooks, field-mode.css |
| ADR-012 Week 2 | ✅ | IncidentRail enhanced, AgentChat foundation |
| ADR-012 Weeks 3-4 | 🔄 In Progress | ADK integration, ProofLayerPanel, citations |
| ADR-013 Phase 1 | 📋 Spec Ready | COG pipeline, BurnSeverityLayer |

### Demo-Ready Capabilities
- Multi-agent chat with Recovery Coordinator
- Proof Layer transparency (confidence, citations, reasoning)
- Phase-based incident filtering
- Data freshness indicators
- (Pending) Burn severity map overlay

---

## Week 5-6 Options

### Option A: ADR-013 Phase 2 — Vector Overlays

**Focus:** Add trail damage markers and treatment unit polygons to the map

**Deliverables:**
| Component | Description | Effort |
|-----------|-------------|--------|
| TrailDamageLayer.tsx | Point markers with damage classification | 4h |
| TreatmentUnitLayer.tsx | Polygon fill with phase-aware styling | 4h |
| PMTiles pipeline | Convert GeoJSON → PMTiles for trails | 2h |
| LayerControlPanel enhancement | Toggle each layer independently | 2h |
| Popup/tooltip on click | Show damage details on interaction | 3h |

**Total Effort:** ~15 hours

**Dependencies:**
- Sample trail damage GeoJSON (can use fixtures)
- Sample treatment unit polygons (from BAER data)

**Value:** Completes the "full picture" map visualization for demos

---

### Option B: Accessibility — TWO PHASES

**Phase B1: Demo-Critical (Week 5) — 12 hours**

| Task | Effort |
|------|--------|
| Color contrast fixes (axe/WAVE audit) | 4h |
| Keyboard navigation for chat flow | 4h |
| Focus management in AgentChat | 2h |
| Screen reader labels (BriefingStrip) | 2h |

**Phase B2: Section 508 Full (Week 7+) — 16 hours**

| Task | Effort |
|------|--------|
| JAWS/NVDA testing | 6h |
| Alt text for all map features | 4h |
| Accessible data table alternative | 4h |
| Accessible PDF export | 2h |

**Recommendation:** Complete B1 before demo, defer B2 to post-demo.

**Dependencies:** None (all frontend work)

**Value:** Required for FedRAMP and field deployment

---

### Option C: ADR-013 Phase 3 — MCP Geospatial Tools

**Focus:** Enable agents to query geospatial data programmatically

**Deliverables:**
| Tool | Description | Effort |
|------|-------------|--------|
| get_burn_severity_at_point | Query COG for severity at lat/lon | 4h |
| get_treatment_units_in_bounds | Return polygons within bbox | 4h |
| geospatial-mcp-server | FastMCP server wrapping tools | 6h |
| Agent integration | Wire tools to specialist agents | 4h |

**Total Effort:** ~18 hours

**Dependencies:**
- ADR-013 Phase 1 complete (COG deployed)
- Treatment unit data available

**Value:** Enables "show me high severity areas" → map highlights

---

### Option D: IRWIN Live Data Connector

**Focus:** Replace mock incident data with live IRWIN feed

> ⚠️ **Critical Dependency:** IRWIN API access requires GeoPlatform account
> (government email) and NWCG affiliation. Lead time: **2-4 weeks minimum**.
> Consider NIFC Open Data as fallback.

| Deliverable | Complexity | Effort |
|-------------|------------|--------|
| **IRWIN access request** | Administrative | 2-4 weeks |
| IRWIN MCP server | High | 12h |
| OR: NIFC Open Data connector | Medium | 6h |
| Incident sync service | Medium | 6h |
| Data normalization | Low | 4h |

**Total Effort:** ~24 hours (IF access granted) + 2-4 week access wait
**Fallback:** NIFC Open Data (public, no credentials needed)

**Value:** Demo with real, live incident data instead of fixtures

---

### Option E: Skill Portability Framework — DEFERRED

> **Decision:** Defer to Q2 2025.
>
> Anthropic's Agent Skills standard (Dec 2024) is emerging but not stable.
> ADK's tool/skill model may evolve. Wait for ecosystem maturity before investing
> 28+ hours in a portability framework that may need rework.
>
> **Alternative:** Document current skill patterns for future migration.

---

## Recommended Sequence

Based on demo value, dependencies, and effort:

### Week 5: Split Focus
| Track | Work | Owner |
|-------|------|-------|
| Frontend | ADR-012 Polish (accessibility subset) | Claude Code |
| Backend | ADR-013 Phase 2 (vector overlays) | Claude Code |
| Planning | ADR-014 IRWIN connector spec | CTO |

### Week 6: Integration
| Track | Work | Owner |
|-------|------|-------|
| Frontend | Mobile responsive + error states | Claude Code |
| Backend | ADR-013 Phase 3 (MCP tools) | Claude Code |
| Planning | ADR-015 Skill portability spec | CTO |

### Week 7+: Production Hardening
- Security audit
- Performance profiling
- Documentation sprint
- Pilot region onboarding prep

---

## FedRAMP Planning (Production Path)

> This roadmap targets demo readiness. Production deployment requires FedRAMP authorization.

### Timeline Reality Check

| Milestone | Demo Path | Production Path |
|-----------|-----------|-----------------|
| Core functionality | Week 4 ✅ | Week 4 |
| Stakeholder demo | Week 6 | Week 6 |
| Security documentation | — | Weeks 7-14 |
| 3PAO assessment | — | Weeks 15-20 |
| FedRAMP authorization | — | Week 24+ |

### FedRAMP Budget Requirements

| Item | Estimated Cost |
|------|----------------|
| FedRAMP consultant (3-month engagement) | $15,000-25,000 |
| 3PAO assessment | $50,000-150,000 |
| Remediation engineering | $20,000-50,000 |
| Continuous monitoring tooling | $5,000-10,000/year |
| **Total first-year** | **$90,000-235,000** |

### Week 6 Action Items (if pursuing FedRAMP)

- [ ] Engage FedRAMP consultant for scoping
- [ ] Define system boundary (what's in/out of authorization scope)
- [ ] Begin System Security Plan (SSP) outline
- [ ] Identify 3PAO candidates (6-month lead time typical)

---

## Demo Readiness Checklist (Week 6)

| Criterion | Target | Status |
|-----------|--------|--------|
| Agent response time (P95) | <15s warm | ⬜ |
| Cold start time | <60s | ⬜ |
| ProofLayer on all responses | 100% | ⬜ |
| Mobile responsive (tablet) | Basic support | ⬜ |
| WCAG AA (automated scan) | 0 critical | ⬜ |
| Backup demo video recorded | Yes | ⬜ |
| Demo script rehearsed | 3+ times | ⬜ |

**Rule:** 6/7 GREEN required to schedule stakeholder demo.

---

## Parking Lot (Future Consideration)

Items identified but not yet prioritized:

| Item | Description | Blocker |
|------|-------------|---------|
| Offline mode | PWA with local data sync | Requires caching architecture |
| Multi-region | Support multiple forests simultaneously | Scale testing needed |
| User authentication | Role-based access control | FedRAMP design required |
| Audit logging | Track all agent decisions for compliance | Storage/retention policy |
| Custom skills | User-authored skill upload | Security review required |
| Export to TRACS | Generate TRACS-compatible CSV | Schema mapping |
| Export to FSVeg | Generate FSVeg XML | Schema mapping |
| Satellite tasking | Request new imagery acquisition | External API integration |

---

## Decision Framework

When choosing next work, consider:

### Demo Value Matrix
| Work Item | Stakeholder Wow | Technical Foundation | Effort |
|-----------|-----------------|----------------------|--------|
| Vector overlays | ⭐⭐⭐ | ⭐⭐ | Low |
| MCP tools | ⭐⭐ | ⭐⭐⭐ | Medium |
| Mobile responsive | ⭐⭐ | ⭐⭐ | Medium |
| IRWIN live data | ⭐⭐⭐⭐ | ⭐⭐ | High |
| Skill portability | ⭐ | ⭐⭐⭐⭐ | High |

### Risk Assessment
| Work Item | Technical Risk | Schedule Risk | Dependency Risk |
|-----------|----------------|---------------|-----------------|
| Vector overlays | Low | Low | Low (fixtures OK) |
| MCP tools | Medium | Low | Medium (needs Phase 1) |
| Mobile responsive | Low | Medium | None |
| IRWIN live data | High | High | High (API access) |
| Skill portability | Medium | High | None |

---

## Sprint Planning Template

For each sprint, fill out:

```markdown
## Sprint [N]: [Theme]

**Dates:** [Start] - [End]
**Goal:** [One-sentence objective]

### Deliverables
| Item | Owner | Estimate | Acceptance Criteria |
|------|-------|----------|---------------------|
| ... | ... | ... | ... |

### Dependencies
- [ ] [Dependency 1]
- [ ] [Dependency 2]

### Risks
- **[Risk]**: [Mitigation]

### Definition of Done
- [ ] Code merged to main
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Demo script updated (if user-facing)
```

---

## Success Metrics (Post-Demo)

Track these as we move toward pilot:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Demo completion rate | 100% | Demos that run without technical failure |
| Response latency | < 10s | P95 time from query to first response |
| Proof Layer coverage | 100% | % of responses with citations |
| Mobile usability | SUS > 70 | System Usability Scale survey |
| Accessibility | WCAG AA | Automated + manual audit |

---

**Document Owner:** RANGER CTO  
**Last Updated:** 2024-12-31  
**Status:** Draft for Review
