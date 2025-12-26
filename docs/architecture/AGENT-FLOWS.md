# RANGER Agent Flow Visualizations

> [!IMPORTANT]
> **Standard:** These diagrams represent the authoritative logic flows for the **[ADR-005](../adr/ADR-005-skills-first-architecture.md)** Skills-First architecture.

## 1. ADK Local State Transitions

This diagram details how the **Recovery Coordinator** manages the local context of a fire incident as different specialist skills are invoked.

```mermaid
stateDiagram-v2
    [*] --> Idle: ADK Session Init
    
    Idle --> ParsingIntent: User Input Received
    
    ParsingIntent --> Delegating: Intent Maps to Skill
    ParsingIntent --> Synthesis: Intent Requires Context Only
    
    state Delegating {
        [*] --> FetchingData: Tool Call (MCP)
        FetchingData --> ExecutingLogic: Data Received
        ExecutingLogic --> EmittingInsight: AgentBriefingEvent
    }
    
    Delegating --> Synthesis: Insight Received
    
    Synthesis --> SyncSessionState: Update ADK Global Context
    SyncSessionState --> Idle: Awaiting Next Input
    
    Synthesis --> Error: Invalid Tool Output
    Error --> Idle: Diagnostic Briefing Emitted
```

## 2. Multi-Agent Delegation Sequence

This sequence shows a typical "BAER Triage" request where the Coordinator must orchestrate multiple skills to provide a synthesized recovery plan.

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant AC as Recovery Coordinator
    participant BA as Burn Analyst Skill
    participant TA as Trail Assessor Skill
    participant SS as ADK Session State

    U->>AC: "Generate recovery plan for Cedar Creek"
    
    AC->>BA: Invocation (Request Severity)
    BA->>BA: Calculate dNBR
    BA-->>AC: Insight: High Severity detected
    
    AC->>SS: Update Context (Severity: High)
    
    AC->>TA: Invocation (Request Damage Assessment)
    Note over TA: Skill reads Severity:High from SS
    TA->>TA: Prioritize Trail Triage
    TA-->>AC: Insight: 3 high-risk washouts found
    
    AC->>AC: Final Synthesis
    AC-->>U: Comprehensive Briefing (Severity + Damage + Actions)
```

## 3. Data Flow: Sensor to Insight

```mermaid
graph LR
    A[Federal API / IRWIN] --> B[MCP Wrapper]
    B --> C[ADK Tool Invocation]
    C --> D[Specialist Reasoning]
    D --> E[Coordinator Synthesis]
    E --> F[Command Console UI]
```

---
*Created: December 2025*
