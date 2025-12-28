# RANGER Phase 4: ADK Integration Implementation Guide

> **✅ FULLY COMPLETED — December 27, 2025**
>
> Phase 4 implementation is complete. Multi-agent system deployed to Cloud Run.
> Keep this document for reference and onboarding new team members.
>
> **Key Achievements:**
> - 5 agents with 16+ tools deployed and verified
> - 645 tests passing
> - Vertex AI with ADC authentication (no API keys)
> - Full E2E flow: Coordinator → Burn Analyst delegation working
>
> **Production URLs:**
> - Coordinator: https://ranger-coordinator-1058891520442.us-central1.run.app
> - MCP Fixtures: https://ranger-mcp-fixtures-1058891520442.us-central1.run.app

**Version:** 2.2
**Date:** December 26, 2025 (Completed December 27, 2025)
**Status:** ✅ COMPLETED
**Research Basis:** 44 Q4 2025 sources (official Google docs, GitHub discussions, production deployments)
**Confidence Level:** VERIFIED (Production deployment confirmed)

---

## Implementation Progress

### ✅ Completed (December 26, 2025)

| Component | Commit | Status |
|-----------|--------|--------|
| Multi-agent wiring (coordinator + 4 specialists) | `3e349ad` | ✅ VERIFIED |
| ADK Event Transformer | Existing | ✅ Implemented |
| useADKStream React Hook | Existing | ✅ Implemented |
| SSE Client Parser | Existing | ✅ Implemented |
| MCP Fixtures Server | `services/mcp-fixtures/` | ✅ 4 tools working |
| ADK Chat Service | `fbef1b4` | ✅ NEW - Bridges chat UI to ADK |
| Dual-mode chatStore | `fbef1b4` | ✅ NEW - ADK + Legacy modes |
| ADK mode toggle UI | `b78a26b` | ✅ NEW - Visual mode indicator |
| Connection status indicator | `01073b7` | ✅ NEW - Live status in UI |
| Agent tests | 645 tests | ✅ ALL PASSING |
| **Frontend bug fixes** | Dec 26 | ✅ 3 bugs fixed (see below) |

### Bug Fixes (December 26, 2025)

During automated validation, 3 frontend bugs were discovered and fixed:

| Bug | Symptom | Root Cause | Fix |
|-----|---------|------------|-----|
| HTTP 422 | "Input should be valid dictionary" | `new_message` sent as string, not Content | `adkClient.ts` - wrap in ADK Content format |
| HTTP 404 #1 | "Session not found" | Session not created before streaming | `adkChatService.ts` - add `createSession()` |
| HTTP 404 #2 | "Session not found" (after fix #1) | Server ignores client session IDs | `adkChatService.ts` - capture server ID from response |

**Key Learning:** ADK server assigns session IDs. Frontend must capture from response, not generate locally.

**See:** `docs/runbooks/PHASE4-VALIDATION-GUIDE.md` for full details and verification commands.

### Agent Hierarchy (Verified)

```
coordinator (gemini-2.0-flash)
├── Tools: portfolio_triage, delegate_query
├── burn_analyst (gemini-2.0-flash)
│   └── Tools: assess_severity, classify_mtbs, validate_boundary
├── trail_assessor (gemini-2.0-flash)
│   └── Tools: classify_damage, evaluate_closure, prioritize_trails
├── cruising_assistant (gemini-2.0-flash)
│   └── Tools: recommend_methodology, estimate_volume, assess_salvage, analyze_csv_data
└── nepa_advisor (gemini-2.5-flash)
    └── Tools: search_regulatory_documents, extract_pdf_content, decide_pathway,
               generate_documentation_checklist, estimate_compliance_timeline
```

**Total:** 5 agents, 16 tools, hierarchical orchestration ready.

### 🔄 In Progress

- End-to-end testing (local dev uses `GOOGLE_API_KEY`, production uses Vertex AI + ADC)
- Cloud Run deployment configuration

### ⏳ Pending

- Firestore session integration
- Production hardening
- Load testing (10-20 concurrent SSE connections)

### Environment Variables

```bash
# Local development (API key)
GOOGLE_API_KEY=your_key_here

# Production (Vertex AI + ADC - no API key needed)
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=ranger-twin-dev
GOOGLE_CLOUD_LOCATION=us-central1

# Frontend (.env.local)
VITE_USE_ADK=true                    # Enable ADK mode
VITE_ADK_URL=http://localhost:8000   # ADK orchestrator URL
```

> **Note:** Production uses Vertex AI with Application Default Credentials (ADC).
> The Cloud Run service account needs `roles/aiplatform.user`. See ADR-006.

---

## Executive Summary

This guide provides implementation-level specifications for integrating Google ADK with the RANGER Command Console. All critical unknowns have been resolved through expert research.

### Key Findings Summary

| Question | Answer | Implementation |
|----------|--------|----------------|
| **Tool output in SSE?** | JSON in `content.parts[0].text` | Parse with TypeScript middleware |
| **Sub-agent visibility?** | ✅ YES—inner reasoning exposed | No special config needed |
| **Error handling?** | `error_code` field on events | Implement retry logic in React |
| **Session state?** | Firestore (serverless) | Shared dict via `ctx.session.state` |
| **MCP on Cloud Run?** | ❌ StdioServerParams broken; ✅ SseServerParams | Separate Cloud Run MCP services |
| **Cloud Run config?** | 2 CPU, 4GB RAM, concurrency=20, min=1 | Single gcloud deployment command |
| **Agent Engine vs CR?** | Cloud Run for demo | Full control, custom UI, lower cost |

### What We're NOT Building

| Component | Status | Rationale |
|-----------|--------|-----------|
| WebSocket Bridge | ❌ Eliminated | ADK provides native SSE streaming |
| Custom API Gateway | ❌ Eliminated | `get_fast_api_app()` handles routing |
| Foundation Skills extraction | ❌ Deferred | Premature optimization for demo |
| IRWIN Integration | ❌ Deferred | Federal API access bureaucracy |

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [ADK Event Schema & Transformation](#2-adk-event-schema--transformation)
3. [SSE Client Implementation](#3-sse-client-implementation)
4. [Session State Management](#4-session-state-management)
5. [MCP Server Integration](#5-mcp-server-integration)
6. [Cloud Run Deployment](#6-cloud-run-deployment)
7. [Error Handling Patterns](#7-error-handling-patterns)
8. [Proof Layer Implementation](#8-proof-layer-implementation)
9. [Implementation Timeline](#9-implementation-timeline)
10. [Deployment Checklist](#10-deployment-checklist)
11. [Quick Reference](#11-quick-reference)

---

## 1. System Architecture

### Overall Architecture

```
┌──────────────────────────────────────┐
│     React Web UI (Command Console)    │
│  ├─ User input: fire scenario         │
│  ├─ Display: agent reasoning + proof  │
│  └─ State: Zustand + SSE streaming    │
└────────────────┬─────────────────────┘
                 │ HTTP POST /run_sse
                 │ (new_message, session_id, state)
                 ▼
┌──────────────────────────────────────────────────────────┐
│    Cloud Run: ranger-coordinator (Single Container)      │
│                                                          │
│  FastAPI + Google ADK                                   │
│  ├─ /run_sse → Streams SSE events (ADK native)          │
│  ├─ /ui → React build (static files)                    │
│  └─ /health → Cloud Run probe                           │
│                                                          │
│  Agents (all in same container):                        │
│  ├─ RecoveryCoordinator (orchestrator)                  │
│  ├─ BurnAnalyst → MCPToolset(MTBS service)              │
│  ├─ TrailAssessor → MCPToolset(NRCS service)            │
│  ├─ CruisingAssistant → local Python tools              │
│  └─ NEPAAdvisor → local Python tools                    │
│                                                          │
│  Config:                                                │
│  - CPU: 2 cores                                         │
│  - Memory: 4GB                                          │
│  - Concurrency: 20 requests                             │
│  - Min instances: 1                                     │
│  - Timeout: 600 seconds                                 │
└────────────────┬────────────┬──────────────┬────────────┘
                 │            │              │
                 ▼            ▼              ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Cloud Run:   │ │ Cloud Run:   │ │ Firestore    │
        │ ranger-mcp-  │ │ ranger-mcp-  │ │ (Session DB) │
        │ mtbs         │ │ nrcs         │ │              │
        │              │ │              │ │ fire_id      │
        │ HTTP MCP     │ │ HTTP MCP     │ │ region       │
        │ Server       │ │ Server       │ │ burn_findings│
        │              │ │              │ │ trail_data   │
        │ MTBS API     │ │ NRCS API     │ │ nepa_context │
        │ wrapper      │ │ wrapper      │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
```

### Data Flow: Cedar Creek Scenario

```
User Input:
"How severe is the burn? What trails need assessment?"
                    ↓
        /run_sse POST request
        {
          app_name: "ranger",
          user_id: "usfs-demo",
          session_id: "cedar-creek-1",
          new_message: "...",
          state: { fire_id: "cedar-creek-2025" }
        }
                    ↓
    Coordinator reads session (fire_id)
                    ↓
    LLM decides: "Route to Burn Analyst first"
                    ↓
    ADK Event #1: "Delegating to Burn Analyst..."
                    ↓
    Burn Analyst tool call: mtbs_classify(fire_id)
                    ↓
    HTTP → Cloud Run ranger-mcp-mtbs service
    Returns: { severity, confidence, mtbs_id, ... }
                    ↓
    ADK Event #2: "{\"severity\": \"high\", \"confidence\": 0.94, ...}"
                    ↓
    ADKEventTransformer enriches with proof_layer
                    ↓
    SSE stream to React
                    ↓
    React displays:
    ┌──────────────────────────┐
    │ BurnAnalyst (94% conf)   │
    │ Severity: HIGH           │
    │ Reasoning: Queried MTBS, │
    │ Found severe complexity. │
    │ Source: MTBS cc_2025_001 │
    └──────────────────────────┘
```

---

## 2. ADK Event Schema & Transformation

### ADK Native Event Structure

ADK's `/run_sse` endpoint emits events with this structure:

```json
{
  "id": "e-1",
  "invocationId": "cedar-creek-session-1",
  "author": "BurnAnalyst",
  "content": {
    "parts": [{"text": "{\"severity\": \"high\", \"confidence\": 0.94}"}]
  },
  "actions": {
    "tool_call": {
      "name": "mtbs_classify",
      "args": {"fire_id": "cedar-creek-2025"}
    }
  },
  "partial": false,
  "timestamp": 1706817600000
}
```

**Critical Finding:** Tool outputs are serialized as JSON strings within `content.parts[0].text`. You must parse JSON from text—no native `structured_data` field exists.

### Multi-Agent Event Flow Example

When Coordinator delegates to Burn Analyst:

```json
// Event 1: Coordinator thinks about the problem
{
  "id": "e-1",
  "invocationId": "cedar-creek-session-1",
  "author": "RecoveryCoordinator",
  "content": {
    "parts": [{"text": "Analyzing Cedar Creek fire. Need burn severity assessment. Delegating to Burn Analyst..."}]
  },
  "partial": false
}

// Event 2: Burn Analyst receives delegation
{
  "id": "e-2",
  "invocationId": "cedar-creek-session-1",
  "author": "BurnAnalyst",
  "content": {
    "parts": [{"text": "Received fire context. Calling mtbs_classify tool..."}]
  },
  "partial": false
}

// Event 3: Burn Analyst tool call (action)
{
  "id": "e-3",
  "invocationId": "cedar-creek-session-1",
  "author": "BurnAnalyst",
  "actions": {
    "tool_call": {
      "name": "mtbs_classify",
      "args": {"fire_id": "cedar-creek-2025", "region": "ca-north"}
    }
  },
  "partial": false
}

// Event 4: Burn Analyst receives tool result
{
  "id": "e-4",
  "invocationId": "cedar-creek-session-1",
  "author": "BurnAnalyst",
  "content": {
    "parts": [{"text": "{\"severity\": \"high\", \"complexity\": \"severe\", \"confidence\": 0.94, \"mtbs_id\": \"cc_2025_001\"}"}]
  },
  "partial": false
}

// Event 5: Burn Analyst synthesis
{
  "id": "e-5",
  "invocationId": "cedar-creek-session-1",
  "author": "BurnAnalyst",
  "content": {
    "parts": [{"text": "MTBS analysis shows severe burn complexity affecting 12,500 acres. High severity with 94% confidence."}]
  },
  "partial": false
}

// Event 6: Coordinator continues to next specialist
{
  "id": "e-6",
  "invocationId": "cedar-creek-session-1",
  "author": "RecoveryCoordinator",
  "content": {
    "parts": [{"text": "Burn Analyst confirms high severity (94% confidence). Now delegating to Trail Assessor..."}]
  },
  "partial": false
}
```

**Key Insight for Proof Layer:** Sub-agent reasoning is natively exposed. Each delegation yields separate events per agent visible to client—exactly what RANGER needs for transparent, auditable AI.

### RANGER Target Event Structure (AgentBriefingEvent)

```typescript
interface AgentBriefingEvent {
  event_id: string;
  correlation_id: string;
  parent_event_id: string | null;
  type: 'INSIGHT' | 'ALERT' | 'ACTION' | 'STATUS';
  source_agent: string;
  skill_id: string | null;
  content: {
    summary: string;
    detail: string;
  };
  proof_layer: {
    confidence: number;
    reasoning_chain: string[];
    citations: Array<{
      source: string;
      reference_id?: string;
    }>;
  };
  timestamp: string;
}
```

### Field Mapping

| ADK Field | AgentBriefingEvent Field | Transformation |
|-----------|--------------------------|----------------|
| `id` | `event_id` | Direct map |
| `invocationId` | `correlation_id` | Direct map |
| — | `parent_event_id` | Track delegation chain in client |
| — | `type` | Infer from `actions` presence |
| `author` | `source_agent` | Direct map |
| `actions.tool_call.name` | `skill_id` | Extract tool name |
| `content.parts[].text` | `content.summary/detail` | Parse JSON, extract fields |
| — | `proof_layer` | Build from tool output structure |

---

## 3. SSE Client Implementation

### ADK Endpoint Configuration

ADK's `/run_sse` endpoint accepts POST requests:

```typescript
interface RunSSERequest {
  app_name: string;      // "ranger"
  user_id: string;       // "usfs-demo"
  session_id: string;    // "cedar-creek-001"
  new_message: string;   // User query
  state?: Record<string, any>; // Optional initial state
}
```

### React SSE Parser

**Source:** AlfaBlok/adk-sse-testing (May 2025) - Working example

```typescript
// File: apps/command-console/src/lib/adkClient.ts

async function parseADKStream(response: Response) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let accumulator = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    accumulator += decoder.decode(value, { stream: true });
    const lines = accumulator.split('\n');
    accumulator = lines[lines.length - 1]; // Keep incomplete line
    
    for (const line of lines.slice(0, -1)) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.slice(6));
        
        // Tool output detection
        if (event.content?.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              // Parse JSON if this is tool output
              try {
                const toolData = JSON.parse(part.text);
                console.log("Tool structured output:", toolData);
                // toolData = { severity, confidence, sources, etc }
              } catch (e) {
                // Not JSON, just text reasoning
                console.log("Tool text output:", part.text);
              }
            }
          }
        }
        
        // Check if event is complete or partial
        if (!event.partial) {
          console.log("Complete response received");
        }
      }
    }
  }
}
```

### React Hook: useADKStream

```typescript
// File: apps/command-console/src/hooks/useADKStream.ts

import { useState, useCallback } from 'react';
import { AgentBriefingEvent } from '../types';
import { transformer } from '../services/adkEventTransformer';

export const useADKStream = (coordinatorUrl: string) => {
  const [events, setEvents] = useState<AgentBriefingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startStream = useCallback(
    async (query: string, fireId: string, sessionId: string) => {
      setIsLoading(true);
      setError(null);
      setEvents([]);
      
      try {
        const response = await fetch(`${coordinatorUrl}/run_sse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_name: 'ranger',
            user_id: 'usfs-demo',
            session_id: sessionId,
            new_message: query,
            state: { fire_id: fireId }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines[lines.length - 1];
          
          for (const line of lines.slice(0, -1)) {
            if (line.startsWith('data: ')) {
              try {
                const adkEvent = JSON.parse(line.slice(6));
                const briefing = transformer.transformEvent(adkEvent);
                setEvents(prev => [...prev, briefing]);
              } catch (e) {
                console.error('Failed to parse event:', e);
              }
            }
          }
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setError(errorMsg);
        console.error('Stream error:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [coordinatorUrl]
  );
  
  return { events, isLoading, error, startStream };
};
```

---

## 4. Session State Management

### Recommended Backend: Firestore

**Source:** Reddit announcement (Sept 28, 2025) - "Announcing a Datastore-Backed Session Service for the ADK"

**Advantages for demo:**
- Serverless: scales to zero between demo sessions
- Latency: 20-100ms per roundtrip (acceptable)
- No running database infrastructure
- Automatic persistence across Cloud Run request boundaries

### ADK Server Configuration

```python
# main.py

from google.adk.cli.fast_api import get_fast_api_app

app = get_fast_api_app(
    agents_dir="./agents",
    session_service_uri="firestore://projects/ranger-twin-dev/databases/default",
    allow_origins=["*"],  # Tighten for production
    web=False,  # Disable built-in UI
)
```

### Cross-Agent State Sharing Pattern

Sub-agents access parent session `ctx.session.state` automatically—shared dict accessible to all:

```python
# File: agents/burn_analyst.py
async def burn_analyst_execute(ctx):
    """Burn Analyst agent - writes to shared session state."""
    fire_id = ctx.session.state['fire_id']  # Read from initialization
    
    # Call tool
    severity = await mtbs_classify(fire_id)
    
    # Write to session (persists in Firestore)
    ctx.session.state['burn_findings'] = {
        'severity': severity['severity'],
        'complexity': severity['complexity'],
        'confidence': severity['confidence'],
        'mtbs_id': severity['id']
    }
    
    return severity

# File: agents/trail_assessor.py
async def trail_assessor_execute(ctx):
    """Trail Assessor agent - reads from previous agent."""
    fire_id = ctx.session.state['fire_id']
    
    # Automatically access what Burn Analyst wrote
    prior_burn_severity = ctx.session.state.get('burn_findings', {})
    
    # Use burn info to inform trail assessment
    trails = await assess_trails(fire_id, prior_burn_severity)
    
    # Write own findings
    ctx.session.state['trail_data'] = {
        'assessed_trails': trails,
        'total_impact_miles': sum(t['affected_miles'] for t in trails)
    }
    
    return trails

# File: agents/nepa_advisor.py
async def nepa_advisor_execute(ctx):
    """NEPA Advisor - synthesizes all prior findings."""
    
    # All prior specialist findings available via session state
    burn = ctx.session.state.get('burn_findings', {})
    trails = ctx.session.state.get('trail_data', {})
    
    # Generate holistic NEPA compliance assessment
    nepa_plan = await generate_nepa_plan(burn, trails)
    
    ctx.session.state['nepa_findings'] = nepa_plan
    
    return nepa_plan
```

### Firestore Session Document Structure

```json
{
  "id": "cedar-creek-session-1",
  "app_name": "ranger",
  "user_id": "usfs-demo",
  "created_at": "2025-02-01T18:00:00Z",
  "updated_at": "2025-02-01T18:15:32Z",
  "state": {
    "fire_id": "cedar-creek-2025",
    "region": "ca-north",
    "burn_findings": {
      "severity": "high",
      "complexity": "severe",
      "confidence": 0.94,
      "mtbs_id": "cc_2025_001"
    },
    "trail_data": {
      "assessed_trails": [
        {"name": "Scenic Loop", "affected_miles": 2.3, "priority": "high"},
        {"name": "Ridge Traverse", "affected_miles": 0.8, "priority": "low"}
      ],
      "total_impact_miles": 3.1
    },
    "nepa_findings": {
      "compliance_status": "requires_mitigation",
      "critical_areas": ["riparian_zones", "viewsheds"]
    }
  }
}
```

---

## 5. MCP Server Integration

### Critical Finding: StdioServerParams Don't Work on Cloud Run

**Source:** GitHub Issue #1727 (June 29, 2025) - OPEN, NOT FIXED

```
TypeError: cannot pickle 'TextIOWrapper' instances
```

**Root cause:** StdioServerParams uses file handles (stdin/stdout) that can't serialize for container deployment.

### The Solution: HTTP-Based MCP Servers

**Source:** GitHub Discussion #2796 (Sep 12, 2025) - ADK Maintainer Response

```python
# ❌ DON'T do this
from google.adk.tools.mcp import MCPToolset
mcp_tools = MCPToolset(stdio_server_params=StdioServerParameters(...))

# ✅ DO this instead
from google.adk.tools.mcp import MCPToolset, SseServerParams
mcp_tools = MCPToolset(
    connection_params=SseServerParams(
        url="https://ranger-mcp-mtbs-XXXX.a.run.app/sse"
    )
)
```

### Agent Configuration with HTTP MCP

```python
# File: agents/burn_analyst.py
from google.adk import agent
from google.adk.tools.mcp import MCPToolset, SseServerParams
import os

burn_analyst = agent.LlmAgent(
    name="BurnAnalyst",
    model="gemini-2.0-flash",
    description="Analyzes burn severity using MTBS data",
    instruction="""You are the Burn Severity Specialist. 
    When asked about burn intensity or severity:
    1. Use the mtbs_classify tool with the fire_id from session context
    2. Interpret results in context of USFS recovery standards
    3. Provide confidence score for your assessment
    4. Cite MTBS database as source
    """,
    tools=[
        MCPToolset(
            connection_params=SseServerParams(
                url=os.environ.get("MTBS_MCP_URL")
            )
        )
    ]
)

trail_assessor = agent.LlmAgent(
    name="TrailAssessor",
    model="gemini-2.0-flash",
    description="Assesses trail damage and accessibility",
    instruction="""You are the Trail Damage Assessment Specialist.
    When asked about trail conditions:
    1. Use the assess_trails tool with fire context
    2. Evaluate accessibility impacts
    3. Prioritize trail restoration
    4. Cite NRCS data sources
    """,
    tools=[
        MCPToolset(
            connection_params=SseServerParams(
                url=os.environ.get("NRCS_MCP_URL")
            )
        )
    ]
)

coordinator = agent.LlmAgent(
    name="RecoveryCoordinator",
    model="gemini-2.0-flash",
    description="Orchestrates multi-specialist forest recovery assessment",
    instruction="""You are the Recovery Coordinator for USFS forest recovery.
    Route questions to appropriate specialists:
    1. BurnAnalyst: Determines burn severity, complexity
    2. TrailAssessor: Assesses trail damage, restoration priority
    3. NEPAAdvisor: Ensures NEPA compliance
    
    Synthesize findings into coherent recovery briefing with confidence levels.
    """,
    sub_agents=[burn_analyst, trail_assessor]
)
```

### MCP Fixtures Server Implementation

```python
# File: services/mcp-mtbs/server.py

from mcp import Server
from mcp.server.sse import sse_server
from fastapi import FastAPI
import json

app_mcp = Server("ranger-mtbs")

# Load fixture data
with open("data/fixtures/cedar-creek-mtbs.json") as f:
    MTBS_DATA = json.load(f)

@app_mcp.tool()
async def mtbs_classify(fire_id: str, region: str = None) -> dict:
    """Retrieve MTBS burn severity classification for a fire."""
    if fire_id not in MTBS_DATA:
        return {"error": f"Unknown fire: {fire_id}"}
    
    data = MTBS_DATA[fire_id]
    return {
        "severity": data["severity"],
        "complexity": data["complexity"],
        "confidence": data["confidence"],
        "mtbs_id": data["id"],
        "acreage": data["acreage"],
        "source": "MTBS"
    }

# FastAPI wrapper for Cloud Run
fastapi_app = FastAPI()
fastapi_app.mount("/", sse_server(app_mcp))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8080)
```

---

## 6. Cloud Run Deployment

### Recommended Configuration

**Source:** Cloud Run Best Practices (Dec 21, 2025) + Codelabs (Oct 2, 2025)

| Setting | Value | Rationale |
|---------|-------|-----------|
| CPU | 2 | 1 CPU per concurrent SSE stream; <1 CPU enforces concurrency=1 |
| Memory | 4GB | Gemini context window + agent state + streaming buffer |
| Concurrency | 20 | SSE keeps connections open; 20 = ~4-5 concurrent users |
| Min Instances | 1 | Cold start mitigation (~$20/month, essential for demo) |
| Timeout | 600s | Long-running agent conversations |
| CPU Throttling | Disabled | Consistent performance during streaming |

### Deployment Commands

**Step 1: Deploy MCP Services**

```bash
# MTBS Data Service
gcloud run deploy ranger-mcp-mtbs \
  --source ./services/mcp-mtbs \
  --project ranger-twin-dev \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --allow-unauthenticated

# NRCS Trail Data Service
gcloud run deploy ranger-mcp-nrcs \
  --source ./services/mcp-nrcs \
  --project ranger-twin-dev \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --allow-unauthenticated
```

**Step 2: Deploy Coordinator**

```bash
# Get URLs from previous deployments
MTBS_URL=$(gcloud run services describe ranger-mcp-mtbs \
  --project ranger-twin-dev --region us-central1 \
  --format 'value(status.url)')/sse

NRCS_URL=$(gcloud run services describe ranger-mcp-nrcs \
  --project ranger-twin-dev --region us-central1 \
  --format 'value(status.url)')/sse

# Deploy coordinator
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1 \
  --cpu 2 \
  --memory 4Gi \
  --concurrency 20 \
  --min-instances 1 \
  --timeout 600 \
  --set-env-vars \
    GOOGLE_GENAI_USE_VERTEXAI=true,\
    GOOGLE_CLOUD_PROJECT=ranger-twin-dev,\
    GOOGLE_CLOUD_LOCATION=us-central1,\
    MTBS_MCP_URL=$MTBS_URL,\
    NRCS_MCP_URL=$NRCS_URL,\
    FIRESTORE_PROJECT=ranger-twin-dev,\
    ENABLE_CLOUD_TRACE=true \
  --allow-unauthenticated \
  --enable-cpu-throttling=false
```

**Step 3: Verify Deployment**

```bash
# Test coordinator health
COORDINATOR_URL=$(gcloud run services describe ranger-coordinator \
  --project ranger-twin-dev --region us-central1 \
  --format 'value(status.url)')

curl $COORDINATOR_URL/health

# Test SSE streaming
curl -X POST $COORDINATOR_URL/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "ranger",
    "user_id": "test",
    "session_id": "test-session-1",
    "new_message": "Test Cedar Creek fire",
    "state": {"fire_id": "cedar-creek-2025"}
  }'
```

### Dockerfile (ADK Orchestrator)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY agents/ ./agents/
COPY main.py .

ENV AGENTS_DIR=/app/agents

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### requirements.txt

```
google-adk>=0.3.0
google-cloud-firestore>=2.16.0
google-cloud-logging>=3.10.0
uvicorn>=0.30.0
```

---

## 7. Error Handling Patterns

### ADK Error Codes

**Source:** Google ADK Streaming Dev Guide (Aug 31, 2025)

| Error Code | Meaning | Client Action |
|------------|---------|---------------|
| `RESOURCE_EXHAUSTED` | Rate limit / quota | Retry with exponential backoff |
| `BLOCKLIST` | Content policy violation | Don't retry; show user message |
| `MAX_TOKENS` | Context length exceeded | Truncate history; retry |
| `DEADLINE_EXCEEDED` | Request timeout | Retry once |
| `UNAVAILABLE` | Service temporarily down | Retry with backoff |

### Python Error Handling

```python
async for event in runner.run_live(...):
    
    if event.error_code == "RESOURCE_EXHAUSTED":
        # Rate limit hit - retryable with exponential backoff
        await asyncio.sleep(2 ** retry_count)
        continue
        
    elif event.error_code == "BLOCKLIST":
        # Content policy violation - terminal, don't retry
        log_error(f"Blocked content: {event.error_message}")
        break
        
    elif event.error_code == "MAX_TOKENS":
        # Context limit - retryable, trim history
        log_warning("Context limit reached")
        continue
        
    elif event.error_code == "DEADLINE_EXCEEDED":
        # Timeout - retryable
        await asyncio.sleep(1)
        continue
        
    elif event.error_code == "UNAVAILABLE":
        # Service down - retryable
        await asyncio.sleep(2 ** retry_count)
        continue
```

### React Error Handling

```typescript
const handleADKEvent = (event: ADKEvent) => {
  if (event.error_code) {
    const isRetryable = 
      event.error_code === "RESOURCE_EXHAUSTED" ||
      event.error_code === "DEADLINE_EXCEEDED" ||
      event.error_code === "UNAVAILABLE";
    
    if (isRetryable) {
      dispatch({
        type: "SHOW_AGENT_RETRY",
        agent: event.author,
        attempt: retryCount + 1,
        message: `Agent ${event.author} hit temporary limit. Retrying...`
      });
      
      // Exponential backoff
      const delay = 1000 * Math.pow(2, retryCount);
      setTimeout(() => retryAgent(event.author), delay);
      
    } else {
      // Terminal error
      dispatch({
        type: "SHOW_AGENT_ERROR",
        agent: event.author,
        message: `Agent error: ${event.error_message}`,
        terminalError: true
      });
    }
  }
};
```

### Federal Audit Trail Logging

```python
# Log all errors with session context for audit trail
logger.warning(
    f"Agent error",
    extra={
        "session_id": session_id,
        "agent": event.author,
        "error_code": event.error_code,
        "error_message": event.error_message,
        "retryable": is_retryable(event.error_code),
        "retry_attempt": retry_count,
        "timestamp": datetime.now().isoformat()
    }
)
```

---

## 8. Proof Layer Implementation

### What is the Proof Layer?

The **proof layer** is the transparency mechanism that lets USFS see HOW the AI made each decision:

```json
{
  "confidence": 0.94,
  "reasoning_chain": [
    "Received fire_id=cedar-creek-2025",
    "Queried MTBS database via HTTP API",
    "Retrieved burn classification: Severe complexity",
    "Confidence based on 15-year historical precedent"
  ],
  "citations": [
    { "source": "MTBS", "reference_id": "cc_2025_001" }
  ]
}
```

This is what separates transparent, auditable AI from a black box.

### ADKEventTransformer Implementation

```typescript
// File: apps/command-console/src/services/adkEventTransformer.ts

import { ADKEvent, AgentBriefingEvent, ProofLayer } from '../types';

interface AgentMetadata {
  [agentName: string]: {
    skillId: string;
    expectedTools: string[];
    dataSource: string;
  };
}

const AGENT_METADATA: AgentMetadata = {
  "BurnAnalyst": {
    skillId: "mtbs-classification",
    expectedTools: ["mtbs_classify"],
    dataSource: "MTBS"
  },
  "TrailAssessor": {
    skillId: "trail-assessment",
    expectedTools: ["assess_trails"],
    dataSource: "NRCS"
  },
  "CruisingAssistant": {
    skillId: "timber-estimation",
    expectedTools: ["estimate_salvage"],
    dataSource: "USFS-Cruise"
  },
  "NEPAAdvisor": {
    skillId: "nepa-compliance",
    expectedTools: ["check_requirements"],
    dataSource: "USFS-NEPA"
  }
};

export class ADKEventTransformer {
  private eventChain: Map<string, ADKEvent> = new Map();

  transformEvent(adkEvent: ADKEvent): AgentBriefingEvent {
    const meta = AGENT_METADATA[adkEvent.author] || {};
    
    const eventType = this.inferEventType(adkEvent);
    const proofLayer = this.extractProofLayer(adkEvent, meta);
    const parentEventId = this.findParentEvent(adkEvent);
    
    const briefing: AgentBriefingEvent = {
      event_id: adkEvent.id,
      correlation_id: adkEvent.invocationId,
      parent_event_id: parentEventId,
      type: eventType,
      source_agent: adkEvent.author,
      skill_id: meta.skillId || "unknown",
      content: {
        summary: this.extractSummary(adkEvent),
        detail: adkEvent.content?.parts?.[0]?.text || ""
      },
      proof_layer: proofLayer,
      timestamp: new Date().toISOString()
    };
    
    this.eventChain.set(adkEvent.id, adkEvent);
    
    return briefing;
  }

  private inferEventType(event: ADKEvent): AgentBriefingEvent['type'] {
    if (event.actions?.tool_call) return "ACTION";
    
    const text = event.content?.parts?.[0]?.text?.toLowerCase() || "";
    if (text.includes("error") || text.includes("failed")) return "ALERT";
    if (text.includes("confidence") || text.includes("analysis")) return "INSIGHT";
    return "STATUS";
  }

  private extractProofLayer(event: ADKEvent, meta: any): ProofLayer {
    const text = event.content?.parts?.[0]?.text || "";
    
    let toolData: Record<string, any> = {};
    try {
      toolData = JSON.parse(text);
    } catch (e) {
      // Not JSON, continue
    }
    
    return {
      confidence: toolData?.confidence || 0,
      reasoning_chain: this.splitReasoningChain(text),
      citations: this.extractCitations(event.author, toolData, meta)
    };
  }

  private splitReasoningChain(text: string): string[] {
    // Return first 3 sentences as reasoning steps
    return text
      .split(/[.!?]/)
      .slice(0, 3)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private extractCitations(agentName: string, toolData: any, meta: any): Array<{ source: string; reference_id?: string }> {
    const citations: Array<{ source: string; reference_id?: string }> = [];
    
    if (meta?.dataSource) {
      citations.push({
        source: meta.dataSource,
        reference_id: toolData?.mtbs_id || toolData?.id
      });
    }
    
    return citations;
  }

  private extractSummary(event: ADKEvent): string {
    const text = event.content?.parts?.[0]?.text || "";
    
    try {
      const data = JSON.parse(text);
      if (data.severity) {
        return `Severity: ${data.severity} (${Math.round((data.confidence || 0) * 100)}% confidence)`;
      }
    } catch (e) {}
    
    return text.split(/[.!?]/)[0].slice(0, 200);
  }

  private findParentEvent(event: ADKEvent): string | undefined {
    const events = Array.from(this.eventChain.values())
      .filter(e => e.invocationId === event.invocationId)
      .sort((a, b) => a.id.localeCompare(b.id));
    
    const idx = events.findIndex(e => e.id === event.id);
    return idx > 0 ? events[idx - 1].id : undefined;
  }
}

export const transformer = new ADKEventTransformer();
```

### React Component: AgentBriefing Display

```tsx
// File: apps/command-console/src/components/AgentBriefing.tsx

import React from 'react';
import { AgentBriefingEvent } from '../types';

interface Props {
  events: AgentBriefingEvent[];
  isLoading: boolean;
}

export const AgentBriefing: React.FC<Props> = ({ events, isLoading }) => {
  return (
    <div className="agent-briefing space-y-4">
      {events.map((event) => (
        <div 
          key={event.event_id} 
          className={`
            p-4 rounded-lg backdrop-blur-md
            ${event.type === 'INSIGHT' ? 'bg-emerald-900/40 border border-emerald-500/50' : ''}
            ${event.type === 'ALERT' ? 'bg-red-900/40 border border-red-500/50' : ''}
            ${event.type === 'ACTION' ? 'bg-amber-900/40 border border-amber-500/50' : ''}
            ${event.type === 'STATUS' ? 'bg-slate-900/40 border border-slate-500/50' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-slate-300">
              {event.source_agent}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
              {event.skill_id}
            </span>
            {event.proof_layer?.confidence > 0 && (
              <span className={`
                text-sm font-medium
                ${event.proof_layer.confidence >= 0.9 ? 'text-emerald-400' : ''}
                ${event.proof_layer.confidence >= 0.6 && event.proof_layer.confidence < 0.9 ? 'text-amber-400' : ''}
                ${event.proof_layer.confidence < 0.6 ? 'text-red-400' : ''}
              `}>
                {Math.round(event.proof_layer.confidence * 100)}% confident
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <p className="text-white font-medium">{event.content.summary}</p>
            <p className="text-slate-300 text-sm mt-1">{event.content.detail}</p>
          </div>
          
          {event.proof_layer && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200">
                Show Reasoning
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-slate-700">
                <div className="mb-2">
                  <h4 className="text-xs uppercase text-slate-500 mb-1">Reasoning Chain</h4>
                  <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                    {event.proof_layer.reasoning_chain.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                {event.proof_layer.citations.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase text-slate-500 mb-1">Sources</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {event.proof_layer.citations.map((cite, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono">
                            {cite.source}
                          </span>
                          {cite.reference_id && (
                            <span className="text-slate-500">{cite.reference_id}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full" />
          <span>Agents thinking...</span>
        </div>
      )}
    </div>
  );
};
```

---

## 9. Implementation Timeline

### 3-Week Sprint (Compressed)

#### Week 1: Foundation (Days 1-5) — IN PROGRESS

**Backend:**
- [x] Implement ADKEventTransformer (TypeScript) ✅
- [x] Test SSE parsing with slow tool (replicate AlfaBlok example) ✅
- [x] Prepare MCP service skeletons ✅
- [x] Wire coordinator with all 4 specialist sub_agents ✅ (commit: `3e349ad`)

**Infrastructure:**
- [x] MCP Fixtures Server created and tested ✅
- [ ] Deploy MCP services to Cloud Run
- [ ] Set up Firestore session backend
- [x] Test Coordinator → Specialists multi-agent flow locally ✅

#### Week 2: Container Packaging (Days 6-10)

**Backend:**
- [ ] Create `main.py` (FastAPI + ADK) — IN PROGRESS
- [ ] Implement error handling in React
- [ ] Create Dockerfile + requirements.txt
- [ ] Wire React chat input to ADK endpoint

**Testing:**
- [ ] Full scenario test with Cedar Creek data
- [ ] Load testing (10-20 concurrent SSE connections)
- [ ] Rehearsal with USFS scenario

#### Week 3: Production Hardening (Days 11-15)

**Final Touches:**
- [ ] Add request logging for audit trails
- [ ] Graceful shutdown handling
- [ ] Documentation & runbook

**Deployment:**
- [ ] Deploy to live environment
- [ ] Monitor for 24-48 hours
- [ ] Demo preparation and practice

### Expected Demo Timeline

```
USFS rep opens: https://ranger-coordinator.run.app
↓ (8 seconds: cold start first request, then sub-2s after)
Enters: "Analyze Cedar Creek fire for recovery planning"
↓
BurnAnalyst (3s): "Severity: HIGH (94% confidence)"
↓
TrailAssessor (2s): "3.1 miles of trails affected"
↓
NEPAAdvisor (1s): "Mitigation required in riparian zones"
↓
Coordinator (1s): Synthesizes final briefing
↓
Total: ~10 seconds for full multi-agent reasoning
UI shows: Proof layer for each decision (confidence, reasoning, sources)
```

---

## 10. Deployment Checklist

### Pre-Deployment Verification

- [ ] All 5 agents execute locally (`adk web --port 8000`)
- [ ] Coordinator properly delegates to specialists
- [ ] Firestore session backend working (state persists)
- [ ] React displays proof_layer with confidence, reasoning, citations
- [ ] Error handling tested (simulate rate limit, network failure)
- [ ] Load test: 10 concurrent SSE connections without crashes

### Post-Deployment Verification

```bash
# View Cloud Run metrics
gcloud run services describe ranger-coordinator \
  --project ranger-twin-dev --region us-central1

# Monitor logs
gcloud run logs read ranger-coordinator \
  --project ranger-twin-dev --limit 50

# Test health endpoint
curl $(gcloud run services describe ranger-coordinator \
  --project ranger-twin-dev --region us-central1 \
  --format 'value(status.url)')/health
```

---

## 11. Quick Reference

### 7 Questions Summary

| Q | Topic | Answer | Do This |
|---|-------|--------|---------|
| 1 | Tool output? | `content.parts[0].text` JSON | Parse in middleware |
| 2 | Sub-agent visibility? | ✅ Exposed via events | No config needed |
| 3 | Error handling? | `error_code` field | Implement retry logic |
| 4 | Session state? | Firestore serverless | Use Firestore backend |
| 5 | MCP on Cloud Run? | ❌ Stdio broken; ✅ SseServerParams | Separate services |
| 6 | Cloud Run config? | 2 CPU, 4GB RAM, concurrency=20, min=1 | Copy deployment command |
| 7 | Agent Engine vs CR? | Cloud Run for demo | Full control + custom UI |

### Critical Do's & Don'ts

**✅ DO:**
- Use Firestore for sessions (serverless, scales to zero)
- Use SseServerParams for MCP (HTTP-based, containerized)
- Implement retry logic for rate-limited errors
- Deploy MCP services separately
- Enable `--trace_to_cloud` for observability
- Set `--min-instances 1` for <1s cold starts
- Use Secret Manager for API keys

**❌ DON'T:**
- Don't use StdioServerParameters on Cloud Run (pickling breaks)
- Don't set CPU <1 (forces sequential-only)
- Don't put secrets in environment variables
- Don't skip error handling in React UI
- Don't assume tool output is structured (parse JSON from text)
- Don't forget `--allow-unauthenticated` for demo

### Key Resources

| Resource | URL |
|----------|-----|
| ADK Documentation | https://google.github.io/adk-docs/ |
| ADK Events Reference | https://google.github.io/adk-docs/events/ |
| SSE Parsing Example | https://github.com/AlfaBlok/adk-sse-testing |
| Cloud Run Deployment | https://google.github.io/adk-docs/deploy/cloud-run/ |
| Firestore Sessions | https://github.com/pentium10/adk-datastore-session-service |

---

## Appendix: Decision Log

| Decision | Choice | Rationale | Source |
|----------|--------|-----------|--------|
| Streaming Protocol | SSE via `/run_sse` | Native ADK support; no WebSocket complexity | ADK docs |
| Session Backend | Firestore | Serverless; scales to zero; Cloud Run optimized | Reddit Sept 2025 |
| MCP Transport | `SseServerParams` | StdioServerParams fails on Cloud Run | GitHub #1727 |
| Deployment Target | Cloud Run | More control; custom UI support; production-proven | MLOps Community Nov 2025 |
| Event Transformation | Client-side | Faster iteration; refactor to server in Phase 5 | Team decision |

---

**Document Owner:** RANGER CTO Review Panel  
**Last Updated:** December 26, 2025  
**Status:** Approved for Implementation  
**Research Basis:** 44 Q4 2025 sources  
**Confidence Level:** HIGH (85%)

---

*Build with confidence. 🚀*
