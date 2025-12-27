# RANGER Architecture Diagrams

Visual explanations of RANGER's architecture, value proposition, and technical contracts.

## The Diagram Set

### Context & Introduction

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [Cedar Creek Fire 2022](Cedar%20Creek%20Fire%202022.png) | All audiences | "Why does this problem matter?" |

### Technical Architecture (Skills-First ADK)

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [The Skills-First Architecture](The%20Skills-First%20Architecture.png) (Planned) | Developers | "How does the ADK runtime work with Skills?" |
| [Phase 4 ADK Developer Stack](Phase%204%20ADK%20Developer%20Stack.png) (Planned) | Developers | "What ports are running? (3000/8000/8080)" |
| [ADK Data Flow & SSE Streaming](ADK%20Data%20Flow%20&%20SSE%20Streaming.png) (Planned) | Architects | "How do events stream to the UI?" |
| [The MCP Abstraction Layer](The%20MCP%20Abstraction%20Layer.png) (Planned) | Technical reviewers | "How do we switch between Fixtures and Real Data?" |
| [The Coordinator's Skill Roster](The%20Coordinator's%20Skill%20Roster.png) (Planned) | Architects | "Which agent has which skills?" |
| [AgentBriefingEvent Rendering Pipeline](AgentBriefingEvent%20Rendering%20Pipeline.png) | Developers | "How do events become UI?" |

### [ARCHIVED] Microservices Architecture (Legacy)

| Diagram | Status |
|---------|--------|
| [Local Developer Stack](Local%20Developer%20Stack.png) | Superseded by Phase 4 Stack |
| [How the pieces fit together](How%20the%20pieces%20fit%20together.png) | Superseded by ADK Data Flow |
| [Agentic AI Architecture](Agentic%20AI%20Architecture.png) | Superseded by Skills-First Architecture |
| [Coordinator Routing & Cross-Agent Cascade](Coordinator%20Routing%20&%20Cross-Agent%20Cascade.png) | Superseded by Coordinator's Skill Roster |
| [Phase 1 Architecture Boundaries](Phase%201%20Architecture%20Boundaries.png) | Superseded by MCP Abstraction Layer |

### Value Proposition

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [The Cedar Creek Recovery Chain](The%20Cedar%20Creek%20Recovery%20Chain%20(Persona%20Cascade).png) | USFS stakeholders | "Why should my team care?" |
| [The Confidence Ledger](The%20Confidence%20Ledger%20(Trust%20Architecture).png) | Procurement/compliance | "Can we trust this AI?" |
| [The Legacy Bridge](The%20Legacy%20Bridge%20(TRACS%20&%20FSVeg%20Export).png) | IT decision-makers | "Do we have to replace our systems?" |

## Quick Reference

**For developer onboarding:** Cedar Creek Fire 2022 (context) → **Phase 4 ADK Developer Stack** (ports) → The Skills-First Architecture → ADK Data Flow

**For investor/partner presentations:** Cedar Creek Fire 2022 (problem) → The MCP Abstraction Layer → Recovery Chain

**For government procurement:** Cedar Creek Fire 2022 (context) → Confidence Ledger → Legacy Bridge

**For USFS field staff:** Cedar Creek Fire 2022 (their fire) → Recovery Chain (the human story)

**For executive briefings:** Cedar Creek Fire 2022 (scale) → Recovery Chain (value) → Confidence Ledger (trust)

## Visual Style

All diagrams share a consistent "tactical whiteboard" aesthetic:

- Dark slate blue background (#0F172A)
- Chalk-on-slate hand-drawn style
- RANGER severity palette (green/amber/red)
- Consistent agent icons (fire, boot, tree, document)

This style reinforces RANGER's identity as an operational tool for real-world decision-making.

## Detailed Documentation

See **[DIAGRAM-NARRATIVES.md](DIAGRAM-NARRATIVES.md)** for:

- One-sentence summaries
- Detailed story walkthroughs (2-3 paragraphs each)
- Key talking points for presentations
- Audience/purpose mapping tables
- Generation prompts for reproducibility

## Creating New Diagrams

The generation prompts are preserved in DIAGRAM-NARRATIVES.md. When creating additional diagrams:

1. Follow the established prompt structure
2. Maintain the chalk-on-slate aesthetic
3. Use consistent agent iconography
4. Reference real file names and data structures
5. Include a clear narrative flow (left-to-right or top-to-bottom)
6. Add explicit callouts for key insights

## File Naming Convention

Use descriptive names that match the diagram title:
- Spaces are okay (helps readability)
- Include parenthetical clarifiers when helpful: `(Persona Cascade)`, `(Trust Architecture)`
- PNG format for all diagrams
