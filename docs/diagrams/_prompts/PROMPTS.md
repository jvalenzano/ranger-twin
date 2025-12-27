# Developer Diagram Prompts

**Purpose:** Visual documentation for the engineering team.
**Audience:** Developers, Architects.
**Aesthetic:** Tactical Whiteboard (Dark slate blue #0F172A).

---

## 1. ADK Runtime & Skill Loading (P0)

**Output File:** `adk-runtime-skills.png`
**Concept:** The "Brain" (ADK) loading "Tools" (Skills) from a library.

```
Create a technical whiteboard diagram titled "The Skills-First Architecture: Modular Intelligence"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A).

Layout: Central Hub and Spoke.

CENTER - "ADK Runtime (The Brain)"
Large Hexagon.
Label: "Google ADK Runtime"
Subtitle: "Gemini 2.0 Flash"
Contains small icons for: "Context Management", "Tool Execution", "Reasoning"

LEFT - "Skill Library (The Tools)"
A vertical stack of "Skill Cards" plugging into the Runtime.
Cards labeled:
- "Portfolio Triage"
- "Soil Burn Analysis"
- "NEPA Guidance"
- "Timber Cruising"
Arrow pointing INTO the Runtime: "Dynamic Skill Loading"

RIGHT - "MCP Data Layer (The Senses)"
Two boxes representing MCP Servers.
1. "MCP Fixtures" (connected to JSON files)
2. "MCP External" (connected to Cloud/APIs)
Double-sided arrows connecting Runtime to MCPs.

TOP - "Command Console (The Body)"
React/Browser UI frame.
Arrow pointing DOWN to Runtime: "User Intent (SSE)"
Arrow pointing UP from Runtime: "Streaming Briefing"

BOTTOM - "Agent Personas"
Small badges showing "Virtual" agents that emerge from skill combos:
- Coordinator
- Burn Analyst
- Trail Assessor
Caption: "Agents are just bundles of Skills"
```

---

## 2. Developer Port Map (P0)

**Output File:** `developer-port-map.png`
**Concept:** The simplified Phase 4 development environment.

```
Create a technical whiteboard diagram titled "Phase 4 Developer Environment"

Style: Tactical whiteboard. Dark background.

Layout: Three horizontal tiers.

TOP TIER - "Frontend (Client)"
Large Box: "Command Console"
URL: "http://localhost:3000"
Tech: React + Vite + useADKStream
Content: 3D Map, Chat, Sidebar

MIDDLE TIER - "Orchestration (Server)"
Large Box: "ADK Runtime"
URL: "http://localhost:8000"
Tech: Python + Google ADK + Gemini API
Note: "Single Entry Point for All Agents"

BOTTOM TIER - "Data Services (Sources)"
Box 1: "MCP Fixtures Server"
URL: "http://localhost:8080"
Content: Serves `burn-severity.json`, `trail-damage.json`
Box 2: "Session Store"
Tech: InMemory / Redis

ARROWS:
1. Frontend -> ADK (SSE Connection) "Stream Events"
2. ADK -> MCP Fixtures "Tool Calls"
3. ADK -> Internet "Gemini API"
```

---

## 3. SSE Streaming Flow (P0)

**Output File:** `sse-streaming-flow.png`
**Concept:** The complete lifecycle of an event via Server-Sent Events.

```
Create a detailed sequence flow diagram titled "The Pulse: ADK Event Streaming"

Style: Engineering flow chart. Dark background.

Swimlanes:
1. User (React)
2. ADK (Python)
3. Gemini (LLM)
4. MCP (Data)

Steps (Top to Bottom):
1. User: "Analyze Sector 4" -> ADK
2. ADK -> Gemini: "Prompt + Context"
3. Gemini -> ADK: "Reasoning: checking severity..."
4. ADK -> User (SSE): "Event: reasoning_trace" (UI shows thinking spinner)
5. Gemini -> ADK: "Call: get_burn_severity(4)"
6. ADK -> MCP: "get_burn_severity(4)"
7. MCP -> ADK: "Result: {severity: high}"
8. ADK -> Gemini: "Tool Result"
9. Gemini -> ADK: "Final Answer: Sector 4 is critical..."
10. ADK -> User (SSE): "Event: agent_briefing" (UI renders card)
```

---

## 4. MCP Data Layer (P0)

**Output File:** `mcp-data-layer.png`
**Concept:** How MCP acts as the abstraction switch.

```
Create a concept diagram titled "The Universal Adapter: MCP"

Style: System architecture. Dark background.

Left Side: "The Agents (Consumers)"
Icons for Burn Analyst, Trail Assessor.
Arrow output: `tool_call: get_burn_severity()`

Center: "MCP Router"
Visual: A switchboard or patch bay.
Label: "Model Context Protocol"

Right Side: "The Sources (Providers)"
Split into Top and Bottom.

Top (Active): "Fixtures (Dev)"
Icon: JSON File
Connection: Live wire to MCP

Bottom (Future): "Real World (Prod)"
Icon: Satellite/Cloud
Connection: Dotted wire (Switchable)

Bottom Caption: "Agents ask 'What'. MCP decides 'How'."
```
