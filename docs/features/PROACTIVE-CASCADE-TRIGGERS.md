# Feature Spec: Proactive Cascade Triggers

> **Status:** Proposed (Phase 2)  
> **Author:** RANGER Architecture Team  
> **Date:** December 28, 2025  
> **Priority:** High — Differentiating capability for federal AI  
> **Dependencies:** ADR-005 (Skills-First), ADR-007.1 (Tool Invocation), Event Infrastructure

---

## Executive Summary

RANGER currently uses **orchestration**: the Recovery Coordinator explicitly calls specialist agents in response to user queries. This works but creates a reactive system that waits for humans to ask questions.

This feature introduces **proactive cascade triggers**: specialist agents emit events when they discover significant findings, and other specialists automatically respond to relevant events without requiring Coordinator mediation. This transforms RANGER from "AI that answers questions" to "AI that surfaces issues overnight."

**The 8-Minute Reality:** A Forest Supervisor at 6:30 AM should see "3 things changed overnight" without having to ask.

---

## Problem Statement

### Current Behavior (Orchestration)

```
User: "Give me a recovery briefing for Cedar Creek"
         │
         ▼
┌─────────────────────┐
│ Recovery Coordinator │
└─────────────────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    ▼         ▼            ▼            ▼
┌───────┐ ┌───────┐ ┌──────────┐ ┌──────────┐
│ Burn  │ │ Trail │ │ Cruising │ │   NEPA   │
│Analyst│ │Assess │ │ Assist   │ │  Advisor │
└───────┘ └───────┘ └──────────┘ └──────────┘
    │         │            │            │
    └─────────┴────────────┴────────────┘
                    │
                    ▼
         Synthesized Briefing
```

**Limitations:**
- System is purely reactive—waits for user queries
- No automatic correlation between specialist findings
- Overnight changes aren't surfaced until someone asks
- Coordinator must explicitly know all cross-domain relationships

### Desired Behavior (Choreography + Orchestration Hybrid)

```
                    ┌─────────────────────┐
                    │    Event Bus        │
                    │  (Pub/Sub Topics)   │
                    └─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Burn Analyst │    │ Trail Assessor│    │   Cruising    │
│               │    │               │    │   Assistant   │
│ Emits:        │    │ Listens:      │    │ Listens:      │
│ BurnAssessed  │───▶│ BurnAssessed  │    │ BurnAssessed  │
│               │    │               │    │ TrailAssessed │
│               │    │ Emits:        │    │               │
│               │    │ TrailAssessed │───▶│ Emits:        │
│               │    │ HazardFound   │    │ SalvageReady  │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Recovery Coordinator │
                    │                     │
                    │ Subscribes to ALL   │
                    │ Synthesizes changes │
                    │ Escalates critical  │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ "3 things changed   │
                    │  overnight..."      │
                    └─────────────────────┘
```

**Benefits:**
- Specialists proactively cascade findings to relevant peers
- Cross-domain correlations happen automatically
- Coordinator maintains oversight without micromanaging
- Overnight processing surfaces changes for morning briefing

---

## User Stories

### US-1: Automatic Cross-Domain Analysis

> As a **Forest Supervisor**, when the Burn Analyst detects high-severity burn in a new sector, I want the Trail Assessor to **automatically** evaluate trails in that sector, so that I see correlated findings without asking separate questions.

**Acceptance Criteria:**
- Burn Analyst emits `BurnSeverityAssessed` event with sector and severity
- Trail Assessor subscribes and automatically runs assessment for affected trails
- Both findings appear in next briefing with correlation noted
- Audit trail shows cascade: "Trail assessment triggered by burn severity finding"

### US-2: Overnight Change Summary

> As a **Forest Supervisor** checking RANGER at 6:30 AM, I want to see what changed overnight without asking, so that I can prepare my 8-minute briefing efficiently.

**Acceptance Criteria:**
- System accumulates events from overnight processing
- Recovery Coordinator generates delta summary: "Since your last session: 3 assessments updated, 1 new hazard detected"
- Changes are prioritized by severity (Critical → High → Medium)
- User can drill into any change for full reasoning chain

### US-3: Proactive Hazard Escalation

> As a **District Ranger**, when any specialist detects a safety-critical hazard, I want immediate notification even if I haven't asked, so that I can act before conditions worsen.

**Acceptance Criteria:**
- Specialists can emit `HazardDetected` events with severity classification
- Critical hazards bypass normal queue and trigger immediate UI notification
- Human-in-the-loop required for any recommended closures or evacuations
- Complete audit trail for compliance review

### US-4: Cascade Guardrails

> As an **Agency Administrator**, I want assurance that autonomous cascades cannot create runaway loops or unauthorized actions, so that the system remains safe for federal operations.

**Acceptance Criteria:**
- Circuit breakers prevent cascade loops (max depth, timeout limits)
- Policy checks validate each cascade action before execution
- Anomaly detection flags unusual cascade patterns
- All autonomous actions logged with full provenance

---

## Technical Design

### Event Schema

```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

class EventType(Enum):
    # Assessment completions
    BURN_SEVERITY_ASSESSED = "burn_severity_assessed"
    TRAIL_DAMAGE_ASSESSED = "trail_damage_assessed"
    TIMBER_SALVAGE_ASSESSED = "timber_salvage_assessed"
    NEPA_PATHWAY_DETERMINED = "nepa_pathway_determined"
    
    # Anomalies and hazards
    HAZARD_DETECTED = "hazard_detected"
    ANOMALY_DETECTED = "anomaly_detected"
    THRESHOLD_EXCEEDED = "threshold_exceeded"
    
    # Coordinator events
    BRIEFING_REQUESTED = "briefing_requested"
    ESCALATION_REQUIRED = "escalation_required"
    HUMAN_DECISION_NEEDED = "human_decision_needed"

class Severity(Enum):
    INFO = "info"           # Routine update
    WARNING = "warning"     # Noteworthy finding
    HIGH = "high"           # Requires attention
    CRITICAL = "critical"   # Immediate action needed

@dataclass
class RANGEREvent:
    """Base event schema for all RANGER agent communications."""
    
    # Identity
    event_id: str                    # UUID for this event
    correlation_id: str              # Groups related events (e.g., same user session)
    parent_event_id: Optional[str]   # Event that triggered this one (cascade tracking)
    
    # Source
    source_agent: str                # Agent that emitted this event
    source_skill: Optional[str]      # Specific skill if applicable
    
    # Classification
    event_type: EventType
    severity: Severity
    
    # Payload
    fire_id: str                     # Always scoped to an incident
    affected_sectors: List[str]      # Geographic scope
    payload: Dict[str, Any]          # Event-specific data
    
    # Cascade control
    cascade_triggers: List[str]      # Suggested downstream agents
    cascade_depth: int               # How many cascades deep (for circuit breaker)
    requires_human_approval: bool    # Block until human confirms
    
    # Metadata
    timestamp: datetime
    confidence: float                # 0.0 - 1.0
    
    # Proof Layer
    reasoning_summary: str           # One-line explanation
    citations: List[Dict[str, str]]  # Data sources
```

### Example Events

**Burn Analyst Completes Assessment:**
```python
BurnSeverityAssessed = RANGEREvent(
    event_id="evt-001-burn",
    correlation_id="session-abc123",
    parent_event_id=None,  # User-initiated, not cascade
    source_agent="burn_analyst",
    source_skill="soil-burn-severity",
    event_type=EventType.BURN_SEVERITY_ASSESSED,
    severity=Severity.HIGH,
    fire_id="cedar-creek-2022",
    affected_sectors=["NW-4", "NW-5"],
    payload={
        "total_acres": 18340,
        "high_severity_pct": 42,
        "dnbr_mean": 0.72,
        "erosion_risk": "elevated"
    },
    cascade_triggers=["trail_assessor", "cruising_assistant"],
    cascade_depth=0,
    requires_human_approval=False,
    timestamp=datetime.utcnow(),
    confidence=0.94,
    reasoning_summary="Sectors NW-4/NW-5 show 42% high-severity burn requiring downstream assessment",
    citations=[{"source": "MTBS", "date": "2022-10-15", "reference": "dNBR classification"}]
)
```

**Trail Assessor Responds (Cascade):**
```python
TrailDamageAssessed = RANGEREvent(
    event_id="evt-002-trail",
    correlation_id="session-abc123",
    parent_event_id="evt-001-burn",  # Triggered by burn assessment
    source_agent="trail_assessor",
    source_skill="trail-damage-classification",
    event_type=EventType.TRAIL_DAMAGE_ASSESSED,
    severity=Severity.HIGH,
    fire_id="cedar-creek-2022",
    affected_sectors=["NW-4"],
    payload={
        "trails_assessed": 3,
        "closures_recommended": 2,
        "estimated_repair_cost": 127000,
        "hazard_trees": 156
    },
    cascade_triggers=["nepa_advisor"],  # Closures need NEPA review
    cascade_depth=1,  # One level deep
    requires_human_approval=True,  # Closures need human sign-off
    timestamp=datetime.utcnow(),
    confidence=0.87,
    reasoning_summary="2 trails in NW-4 require closure due to debris flow risk from high-severity burn",
    citations=[
        {"source": "TRACS", "date": "2022-11-01", "reference": "Damage codes D3, D4"},
        {"source": "Cascade", "date": "2025-12-28", "reference": "Triggered by evt-001-burn"}
    ]
)
```

**Hazard Requiring Immediate Escalation:**
```python
HazardDetected = RANGEREvent(
    event_id="evt-003-hazard",
    correlation_id="session-abc123",
    parent_event_id="evt-002-trail",
    source_agent="trail_assessor",
    source_skill="hazard-detection",
    event_type=EventType.HAZARD_DETECTED,
    severity=Severity.CRITICAL,
    fire_id="cedar-creek-2022",
    affected_sectors=["NW-4"],
    payload={
        "hazard_type": "DEBRIS_FLOW_IMMINENT",
        "trail_id": "TR-405",
        "milepost": 2.3,
        "risk_to_public": True,
        "recommended_action": "IMMEDIATE_CLOSURE"
    },
    cascade_triggers=[],  # No auto-cascade for critical hazards
    cascade_depth=2,
    requires_human_approval=True,  # Always for critical
    timestamp=datetime.utcnow(),
    confidence=0.91,
    reasoning_summary="CRITICAL: Debris flow risk at TR-405 MP 2.3 requires immediate closure decision",
    citations=[
        {"source": "Soil stability model", "reference": "Slope > 35°, saturated conditions"},
        {"source": "Weather", "reference": "2 inches precipitation forecast next 48h"}
    ]
)
```

### Subscription Matrix

| Agent | Subscribes To | Emits |
|-------|---------------|-------|
| **Burn Analyst** | `BRIEFING_REQUESTED` | `BURN_SEVERITY_ASSESSED`, `ANOMALY_DETECTED` |
| **Trail Assessor** | `BURN_SEVERITY_ASSESSED`, `BRIEFING_REQUESTED` | `TRAIL_DAMAGE_ASSESSED`, `HAZARD_DETECTED` |
| **Cruising Assistant** | `BURN_SEVERITY_ASSESSED`, `TRAIL_DAMAGE_ASSESSED`, `BRIEFING_REQUESTED` | `TIMBER_SALVAGE_ASSESSED` |
| **NEPA Advisor** | `TRAIL_DAMAGE_ASSESSED`, `TIMBER_SALVAGE_ASSESSED`, `BRIEFING_REQUESTED` | `NEPA_PATHWAY_DETERMINED` |
| **Recovery Coordinator** | **ALL EVENTS** | `BRIEFING_REQUESTED`, `ESCALATION_REQUIRED`, `HUMAN_DECISION_NEEDED` |

### Cascade Rules Engine

```python
class CascadeRule:
    """Defines when an event should trigger downstream agents."""
    
    trigger_event: EventType
    conditions: Dict[str, Any]  # Payload conditions that must match
    target_agents: List[str]
    requires_approval: bool
    max_cascade_depth: int

# Example Rules
CASCADE_RULES = [
    CascadeRule(
        trigger_event=EventType.BURN_SEVERITY_ASSESSED,
        conditions={"severity": ["HIGH", "CRITICAL"]},
        target_agents=["trail_assessor"],
        requires_approval=False,
        max_cascade_depth=3
    ),
    CascadeRule(
        trigger_event=EventType.BURN_SEVERITY_ASSESSED,
        conditions={"high_severity_pct": {"gte": 30}},
        target_agents=["cruising_assistant"],
        requires_approval=False,
        max_cascade_depth=3
    ),
    CascadeRule(
        trigger_event=EventType.TRAIL_DAMAGE_ASSESSED,
        conditions={"closures_recommended": {"gte": 1}},
        target_agents=["nepa_advisor"],
        requires_approval=True,  # Closures need NEPA, which needs human review
        max_cascade_depth=3
    ),
    CascadeRule(
        trigger_event=EventType.HAZARD_DETECTED,
        conditions={"severity": "CRITICAL"},
        target_agents=[],  # No auto-cascade
        requires_approval=True,
        max_cascade_depth=0  # Stop here
    ),
]
```

---

## Safety Architecture

### Layer 1: Pre-Cascade Policy Checks

Before any cascade executes, validate:

```python
class CascadePolicy:
    """Synchronous validation before cascade execution."""
    
    def validate(self, event: RANGEREvent, target_agent: str) -> PolicyResult:
        checks = [
            self._check_authorization(event, target_agent),
            self._check_cascade_depth(event),
            self._check_resource_budget(event),
            self._check_rate_limit(event.source_agent),
            self._check_fire_scope(event),
        ]
        return PolicyResult(
            allowed=all(c.passed for c in checks),
            violations=[c for c in checks if not c.passed]
        )
    
    def _check_cascade_depth(self, event: RANGEREvent) -> CheckResult:
        """Prevent runaway cascades."""
        MAX_DEPTH = 3
        if event.cascade_depth >= MAX_DEPTH:
            return CheckResult(
                passed=False,
                reason=f"Cascade depth {event.cascade_depth} exceeds max {MAX_DEPTH}"
            )
        return CheckResult(passed=True)
    
    def _check_rate_limit(self, agent: str) -> CheckResult:
        """Prevent agents from flooding the event bus."""
        recent_events = self.event_store.count_recent(agent, window_minutes=5)
        MAX_EVENTS_PER_WINDOW = 20
        if recent_events >= MAX_EVENTS_PER_WINDOW:
            return CheckResult(
                passed=False,
                reason=f"Agent {agent} rate limited: {recent_events} events in 5 min"
            )
        return CheckResult(passed=True)
```

### Layer 2: Circuit Breakers

```python
class AgentCircuitBreaker:
    """Prevent cascade failures from propagating."""
    
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.state = CircuitState.CLOSED  # CLOSED, OPEN, HALF_OPEN
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        
        # Thresholds
        self.failure_threshold = 3
        self.recovery_timeout = timedelta(minutes=5)
        self.half_open_max_calls = 2
    
    def can_execute(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if datetime.utcnow() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        elif self.state == CircuitState.HALF_OPEN:
            return self.success_count < self.half_open_max_calls
    
    def record_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.half_open_max_calls:
                self.state = CircuitState.CLOSED
                self.success_count = 0
    
    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            self.success_count = 0
```

### Layer 3: Anomaly Detection

```python
class CascadeAnomalyDetector:
    """Detect unusual cascade patterns that might indicate problems."""
    
    def __init__(self):
        self.baseline_patterns = {}  # Learned from historical data
    
    def check_anomaly(self, event: RANGEREvent) -> Optional[Anomaly]:
        anomalies = []
        
        # Check 1: Unusual cascade chains
        chain = self._get_cascade_chain(event)
        if len(chain) > self.baseline_patterns.get("avg_chain_length", 2) * 2:
            anomalies.append(Anomaly(
                type="LONG_CASCADE_CHAIN",
                severity="WARNING",
                detail=f"Chain length {len(chain)} exceeds 2x baseline"
            ))
        
        # Check 2: Circular cascades
        if self._detect_circular_cascade(event):
            anomalies.append(Anomaly(
                type="CIRCULAR_CASCADE",
                severity="CRITICAL",
                detail="Event chain contains circular reference"
            ))
        
        # Check 3: Unusual event frequency
        agent_freq = self._get_agent_frequency(event.source_agent, window_hours=1)
        baseline_freq = self.baseline_patterns.get(f"{event.source_agent}_hourly", 5)
        if agent_freq > baseline_freq * 3:
            anomalies.append(Anomaly(
                type="HIGH_FREQUENCY",
                severity="WARNING",
                detail=f"Agent emitting {agent_freq}/hr vs baseline {baseline_freq}/hr"
            ))
        
        return anomalies[0] if anomalies else None
```

### Layer 4: Human-in-the-Loop Escalation

```python
class EscalationPolicy:
    """Determine when human approval is required."""
    
    # Confidence thresholds
    AUTO_EXECUTE_THRESHOLD = 0.90
    OPTIONAL_REVIEW_THRESHOLD = 0.70
    
    # Action classes that always require approval
    ALWAYS_REQUIRE_APPROVAL = [
        "trail_closure",
        "evacuation_recommendation",
        "resource_commitment_over_50k",
        "nepa_pathway_change",
        "public_safety_alert",
    ]
    
    def requires_human_approval(self, event: RANGEREvent, proposed_action: str) -> ApprovalRequirement:
        # Critical events always need approval
        if event.severity == Severity.CRITICAL:
            return ApprovalRequirement(
                required=True,
                reason="Critical severity events require human confirmation"
            )
        
        # Certain action classes always need approval
        if proposed_action in self.ALWAYS_REQUIRE_APPROVAL:
            return ApprovalRequirement(
                required=True,
                reason=f"Action class '{proposed_action}' requires approval per policy"
            )
        
        # Confidence-based escalation
        if event.confidence < self.OPTIONAL_REVIEW_THRESHOLD:
            return ApprovalRequirement(
                required=True,
                reason=f"Confidence {event.confidence:.0%} below threshold"
            )
        elif event.confidence < self.AUTO_EXECUTE_THRESHOLD:
            return ApprovalRequirement(
                required=False,
                recommended=True,
                reason=f"Confidence {event.confidence:.0%} suggests optional review"
            )
        
        return ApprovalRequirement(required=False)
```

---

## Implementation Phases

### Phase 1: Event Infrastructure (Sprint 1-2)

**Goal:** Establish event bus and observability without changing agent behavior.

**Deliverables:**
- [ ] Event schema implementation (`RANGEREvent` dataclass)
- [ ] Event bus infrastructure (Pub/Sub or in-memory for demo)
- [ ] Event persistence for audit trail
- [ ] Coordinator subscribes to all events
- [ ] Basic event dashboard in UI

**Agents emit events but don't listen yet.** Coordinator receives all events and logs them. No autonomous cascades.

**Risk:** Low — additive change, no behavior modification

### Phase 2: Controlled Diagnostic Cascades (Sprint 3-4)

**Goal:** Enable specialist-to-specialist cascades for diagnostic workflows.

**Deliverables:**
- [ ] Cascade rules engine
- [ ] Subscription matrix implementation
- [ ] Pre-cascade policy checks
- [ ] Circuit breakers per agent
- [ ] Cascade depth tracking
- [ ] "Triggered by" attribution in Proof Layer

**Cascades enabled for:**
- Burn → Trail (high severity triggers trail assessment)
- Burn → Cruising (high mortality triggers salvage assessment)
- Trail → NEPA (closures trigger compliance review)

**All results still synthesized by Coordinator.** Human approval required for any recommended actions.

**Risk:** Medium — new autonomous behavior, but bounded by policy checks

### Phase 3: Proactive Overnight Processing (Sprint 5-6)

**Goal:** System processes background updates and generates change summaries.

**Deliverables:**
- [ ] Scheduled event processing (cron-triggered analysis)
- [ ] Delta detection ("what changed since last session")
- [ ] Overnight summary generation
- [ ] Priority-ranked change notifications
- [ ] "Morning briefing" UI component

**Scenario:** At 2 AM, system automatically re-runs burn analysis with new satellite data. Finding triggers trail re-assessment. By 6:30 AM, Coordinator has synthesized: "Overnight: Burn severity increased in NW-4 (was Moderate, now High). Trail TR-405 now recommended for closure. Awaiting your approval."

**Risk:** Medium-High — autonomous background processing, requires robust monitoring

### Phase 4: Bounded Autonomous Actions (Future)

**Goal:** Enable routine autonomous actions within strict policy boundaries.

**Deliverables:**
- [ ] Action authorization framework
- [ ] Autonomous action audit trail
- [ ] Rollback capabilities
- [ ] Expanded anomaly detection

**Example autonomous actions:**
- Adjust monitoring frequency for sectors showing change
- Update priority scores based on new data
- Generate draft notifications for human review

**NOT autonomous:** Closures, resource commitments, public communications, NEPA determinations

**Risk:** High — requires extensive testing and stakeholder buy-in

---

## Success Metrics

### Operational Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| Events emitted/day | Baseline | +50% | +100% | +150% |
| Cascade depth (avg) | 0 | 1.2 | 1.5 | 1.8 |
| Human approvals/day | N/A | 5-10 | 10-20 | 15-25 |
| Time to insight | Manual | -30% | -50% | -60% |

### Safety Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Circuit breaker trips/day | < 2 | > 5 |
| Policy violations blocked | 100% | Any miss |
| Circular cascades detected | 0 | > 0 |
| Anomalies flagged | < 5/day | > 20/day |
| Human escalation response time | < 30 min | > 2 hours |

### User Experience Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to morning briefing | 8+ minutes (manual) | < 2 minutes (proactive) |
| Cross-domain insights surfaced | 0 (user must ask) | 3-5 per session |
| Overnight changes visible | 0 | All relevant changes |
| "Holy shit" moments in demos | Occasional | Consistent |

---

## Open Questions

1. **Event Bus Technology:** Use GCP Pub/Sub for production, or start with in-memory for demo simplicity?

2. **Cascade Trigger Timing:** Should cascades execute immediately, or batch for efficiency?

3. **Multi-Fire Cascades:** Can a finding in one fire trigger analysis in a nearby fire?

4. **User Preferences:** Should users be able to configure which cascades they want?

5. **MCP Integration:** Should events flow through MCP, or is this a separate communication layer?

---

## References

| Document | Relevance |
|----------|-----------|
| [ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md) | Agent structure, MCP connectivity |
| [ADR-007.1: Tool Invocation Strategy](../adr/ADR-007.1-tool-invocation-enforcement.md) | Agent execution patterns |
| [PROTOCOL-AGENT-COMMUNICATION.md](../specs/PROTOCOL-AGENT-COMMUNICATION.md) | Event schema alignment |
| [PROOF-LAYER-DESIGN.md](../specs/PROOF-LAYER-DESIGN.md) | Cascade attribution in UI |
| [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/) | Pattern reference |
| [CrewAI: Event Listeners](https://docs.crewai.com/en/concepts/event-listener) | Implementation reference |
| [Akira AI: Real-Time Guardrails](https://www.akira.ai/blog/real-time-guardrails-agentic-systems) | Safety architecture |

---

## Appendix A: Demo Script for Cascade Feature

**Setup:** User has not interacted with RANGER since yesterday afternoon.

**6:30 AM — User opens RANGER**

```
┌─────────────────────────────────────────────────────────────────┐
│  🌲 RANGER Recovery Intelligence                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📊 OVERNIGHT CHANGES (3 updates since 4:47 PM)         │   │
│  │                                                         │   │
│  │  🔴 CRITICAL: Trail TR-405 closure recommended          │   │
│  │     Triggered by: Burn severity increase in NW-4        │   │
│  │     Confidence: 91% · Awaiting your approval            │   │
│  │     [View Details] [Approve Closure] [Request Review]   │   │
│  │                                                         │   │
│  │  🟡 HIGH: Salvage window closing for Sector NW-3        │   │
│  │     Triggered by: Timber mortality assessment update    │   │
│  │     Action needed by: January 15, 2026                  │   │
│  │     [View Analysis]                                     │   │
│  │                                                         │   │
│  │  🟢 INFO: NEPA pathway confirmed for NW-4 activities    │   │
│  │     Categorical Exclusion applicable (FSM 1909.15)      │   │
│  │     [View Citation]                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💬 "Good morning. Three items need your attention..."         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User clicks "View Details" on Trail TR-405:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 Trail TR-405 Closure Recommendation                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CASCADE CHAIN (automatically triggered)                        │
│  ─────────────────────────────────────────                      │
│  1. 02:15 AM · Burn Analyst                                     │
│     New Sentinel-2 imagery processed                            │
│     Finding: NW-4 severity upgraded Moderate → High             │
│     Confidence: 94%                                             │
│              │                                                  │
│              ▼ triggered                                        │
│  2. 02:18 AM · Trail Assessor                                   │
│     Automatic re-assessment of trails in NW-4                   │
│     Finding: TR-405 now in high-severity zone                   │
│     Debris flow risk: Elevated (slope 38°, saturated soil)      │
│     Confidence: 91%                                             │
│              │                                                  │
│              ▼ triggered                                        │
│  3. 02:22 AM · NEPA Advisor                                     │
│     Emergency closure pathway identified                        │
│     CE applicable under 36 CFR 220.6(d)(4)                      │
│     Confidence: 96%                                             │
│                                                                 │
│  RECOMMENDED ACTION                                             │
│  ─────────────────────                                          │
│  Close TR-405 from MP 2.0 to MP 5.5 effective immediately       │
│  Duration: Until soil stability assessment complete             │
│  Public notification: Draft prepared [View Draft]               │
│                                                                 │
│  [Approve Closure]  [Modify]  [Reject with Reason]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Supervisor approves with one click. Total time: 90 seconds.**

---

## Appendix B: Comparison to Current State

| Aspect | Current (Orchestration) | Future (Cascade Triggers) |
|--------|------------------------|---------------------------|
| **Morning workflow** | Ask each question manually | See overnight changes immediately |
| **Cross-domain correlation** | User must connect dots | System correlates automatically |
| **Response to new data** | Waits for user query | Processes and cascades proactively |
| **Audit trail** | Single query → response | Full cascade chain with triggers |
| **Time to decision** | Minutes of back-and-forth | Seconds to review pre-analyzed findings |
| **Supervisor cognitive load** | High (synthesis required) | Low (synthesis provided) |

---

**Document Owner:** RANGER Architecture Team  
**Last Updated:** December 28, 2025  
**Status:** Proposed — Awaiting Phase 2 roadmap prioritization
