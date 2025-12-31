# RANGER Diagram Library (v2.0)

> **Updated:** December 28, 2025  
> **Aligned With:** ADR-007.1 Three-Layer Tool Invocation Strategy

This directory contains the visual documentation for the RANGER platform, organized into two distinct tracks based on audience and purpose.

## 🆕 What's New in v2.0

This version incorporates the **ADR-007.1 Three-Layer Enforcement Pattern** throughout the diagram library:

| Change | Rationale |
|--------|-----------|
| Added **Three-Layer Enforcement** diagram | Core architectural concept for federal compliance |
| Added **Federal Compliance Overview** diagram | Executive/auditor-ready slide |
| Updated diagrams to show **Validation Layer** | Accuracy with current implementation |
| Enhanced **Federal Compliance** language | FedRAMP audit readiness |
| Added **Purple** as compliance accent color | Visual consistency for federal elements |

---

## 📂 The Two Tracks

### 1. [Developer Track](./developer/)
**Audience:** Engineering Team, Architects  
**Purpose:** Technical reference, debugging, and onboarding  
**Update Frequency:** High (Sprint-based)

| Priority | Diagram | Purpose | Status |
|----------|---------|---------|--------|
| **P0** | Three-Layer Enforcement | ADR-007.1 architecture | 🆕 NEW |
| **P0** | ADK Runtime & Skills | How the system thinks | ✏️ Updated |
| **P0** | SSE Streaming Flow | How data moves (with validation) | ✏️ Updated |
| **P0** | Developer Port Map | What runs where | ✏️ Updated |
| **P0** | MCP Data Layer | How tools access data | ✏️ Updated |
| **P1** | AgentBriefingEvent Schema | UI data contract | ✏️ Updated |
| **P1** | Skill Anatomy | Skill folder structure | ✅ Unchanged |
| **P1** | Proof Layer Rendering | Trust visualization | ✏️ Updated |

👉 **[View Developer Prompts](./_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md#track-1-developer-diagrams)** to generate these diagrams.

### 2. [Stakeholder Track](./stakeholder/)
**Audience:** USFS Partners, Investors, Leadership  
**Purpose:** Value proposition, workflow, and trust  
**Update Frequency:** Low (Quarterly/Milestone-based)

| Priority | Diagram | Purpose | Status |
|----------|---------|---------|--------|
| **P0** | Federal Compliance Overview | Auditor-ready slide | 🆕 NEW |
| **P0** | Cedar Creek Context | The problem scale | ✅ Unchanged |
| **P0** | RANGER Value Loop | What RANGER does | ✏️ Updated |
| **P0** | The Legacy Bridge | Integration strategy | ✅ Unchanged |
| **P0** | Recovery Chain (Personas) | Human impact | ✅ Unchanged |
| **P1** | Confidence Ledger | Trust model (4 pillars now) | ✏️ Updated |
| **P1** | Maria's 8-Minute Morning | Operational impact | ✏️ Updated |

👉 **[View Stakeholder Prompts](./_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md#track-2-stakeholder-diagrams)** to generate these diagrams.

---

## 🎨 Visual Standard

All diagrams adhere to the **"Tactical Whiteboard"** aesthetic:

### Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Deep Slate Blue | #0F172A |
| Primary | Chalk White | #F8FAFC |
| Success/Validated | RANGER Emerald | #10B981 |
| Warning/Retry | Amber | #F59E0B |
| Critical/Escalation | Alert Red | #EF4444 |
| Highlight/Active | Cyan | #06B6D4 |
| **Compliance/Federal** | **Royal Purple** | **#7C3AED** |
| Muted/Archived | Slate Gray | #64748B |

### Agent Iconography
| Agent | Icon | Color |
|-------|------|-------|
| Recovery Coordinator | 🧠 Brain | White |
| Burn Analyst | 🔥 Flame | Orange |
| Trail Assessor | 🥾 Boot | Blue |
| Cruising Assistant | 🌲 Tree | Green |
| NEPA Advisor | 📋 Clipboard | Purple |
| **Validation Layer** | **🛡️ Shield** | **Emerald** |

---

## 🛠 Workflow

1. **Select** the appropriate track (Developer or Stakeholder)
2. **Read** the [comprehensive prompts file](./_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md)
3. **Copy** the prompt for your target diagram
4. **Generate** using Nano Banana Pro in Google AI Studio (16:9 aspect ratio)
5. **Iterate** on details (edit, don't re-roll)
6. **Save** the PNG to the track folder
7. **Update** this README if adding new diagrams

---

## 📋 Quality Checklist

Before finalizing any diagram, verify:

- [ ] 16:9 aspect ratio
- [ ] Dark slate blue background (#0F172A)
- [ ] Consistent agent iconography
- [ ] RANGER color palette applied
- [ ] All text legible at presentation size
- [ ] Key insight callout box present
- [ ] Corner annotations add context
- [ ] Flow direction clear (left→right or top→bottom)
- [ ] **Validation elements visible where relevant**
- [ ] **Federal/FedRAMP badges on compliance diagrams**
- [ ] **ADR-007.1 referenced where applicable**

---

## 📁 File Structure

```
docs/diagrams/
├── README.md                           ← You are here
├── _prompts/
│   ├── PROMPTS.md                      ← Legacy (v1)
│   ├── _RANGER-DIAGRAM-PROMPTS.md      ← Legacy (v1)
│   └── _RANGER-DIAGRAM-PROMPTS-v2.md   ← Current (v2) ✅
├── developer/
│   ├── three-layer-enforcement.png     ← NEW
│   ├── adk-runtime-skills.png
│   ├── sse-streaming-flow.png
│   ├── mcp-data-layer.png
│   ├── developer-port-map.png
│   ├── agent-briefing-event.png
│   ├── skill-anatomy.png
│   └── proof-layer-rendering.png
└── stakeholder/
    ├── federal-compliance-overview.png ← NEW
    ├── cedar-creek-context.png
    ├── ranger-value-loop.png
    ├── recovery-chain-personas.png
    ├── legacy-bridge.png
    ├── confidence-ledger.png
    └── marias-morning.png
```

---

## 🔗 Related Documents

| Document | Purpose |
|----------|---------|
| [ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md) | Agent/Skills design |
| [ADR-007.1: Three-Layer Tool Invocation](../adr/ADR-007.1-tool-invocation-strategy.md) | Validation architecture |
| [PROOF-LAYER-DESIGN.md](../specs/PROOF-LAYER-DESIGN.md) | Trust visualization spec |
| [PROTOCOL-AGENT-COMMUNICATION.md](../specs/PROTOCOL-AGENT-COMMUNICATION.md) | Event schema |

---

**Document Owner:** RANGER Product Team  
**Last Updated:** December 28, 2025  
**Version:** 2.0

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **FedRAMP** | Federal Risk and Authorization Management | Federal cloud security authorization |
| **MCP** | Model Context Protocol | Protocol for data connectivity |
| **SSE** | Server-Sent Events | HTTP-based real-time streaming |
| **USFS** | United States Forest Service | Federal agency managing national forests |

→ **[Full Glossary](../GLOSSARY.md)**
