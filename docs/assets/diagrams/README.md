# RANGER Architecture Diagrams

Visual explanations of RANGER's architecture, value proposition, and technical contracts.

## The Diagram Set

### Context & Introduction

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [Cedar Creek Fire 2022](Cedar%20Creek%20Fire%202022.png) | All audiences | "Why does this problem matter?" |

### Technical Architecture

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [How the pieces fit together](How%20the%20pieces%20fit%20together.png) | Developers | "How does Phase 1 vs Phase 2 work?" |
| [Agentic AI Architecture](Agentic%20AI%20Architecture.png) | Developers | "How does the local vs cloud workflow operate?" |
| [AgentBriefingEvent Rendering Pipeline](AgentBriefingEvent%20Rendering%20Pipeline.png) | Developers | "How do events become UI?" |
| [Coordinator Routing & Cross-Agent Cascade](Coordinator%20Routing%20&%20Cross-Agent%20Cascade.png) | Architects | "How does orchestration work?" |
| [Phase 1 Architecture Boundaries](Phase%201%20Architecture%20Boundaries.png) | Technical reviewers | "What's real vs simulated?" |

### Value Proposition

| Diagram | Audience | Question It Answers |
|---------|----------|---------------------|
| [The Cedar Creek Recovery Chain](The%20Cedar%20Creek%20Recovery%20Chain%20(Persona%20Cascade).png) | USFS stakeholders | "Why should my team care?" |
| [The Confidence Ledger](The%20Confidence%20Ledger%20(Trust%20Architecture).png) | Procurement/compliance | "Can we trust this AI?" |
| [The Legacy Bridge](The%20Legacy%20Bridge%20(TRACS%20&%20FSVeg%20Export).png) | IT decision-makers | "Do we have to replace our systems?" |

## Quick Reference

**For developer onboarding:** Cedar Creek Fire 2022 (context) → How the pieces fit together → Rendering Pipeline → Coordinator Routing

**For investor/partner presentations:** Cedar Creek Fire 2022 (problem) → Phase 1 Boundaries → Recovery Chain

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
