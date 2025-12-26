# Transition Plan: Phase 1 (Coordinator Agent)

## Senior Tech Lead Recommendations

1.  **Prioritize IRWIN Connectivity**: Our research highlights IRWIN as the "Missing Link." Before building complex logic, we need the **MCP-IRWIN** server to provide real-time incident data. 
2.  **Shift from "Agents" to "Skills"**: In the next session, we should treat the specialist agents (Burn, Trail, etc.) as **Skill Packages** rather than standalone service containers. This reduces infra overhead.
3.  **Implement the reasoning_chain UI**: The `AgentBriefingEvent` schema is ready. Our first Coordinator implementation should focus on the "Proof Layer" to build user trust in the AI's logic.

---

## Warm-up Prompt for Next Session

**Prompt:**
"I am ready to begin **Phase 1: Coordinator Agent** of the RANGER project. We have completed the Documentation Audit (Stage 1-5) and all core specs are aligned with **ADR-005 (Skills-First Architecture)** and **Google ADK**.

**Current Objectives:**
1.  Initialize the `agents/coordinator/` directory using the Google ADK.
2.  Implement the first **Delegation Skill** to route queries to the (currently empty) specialist registry.
3.  Set up the **Agent-to-UI Bridge** by creating the FastAPI/chat-context endpoint.

**Context Check:**
- Use `docs/specs/agent-interface.md` as the source of truth for communication.
- Refer to `docs/specs/SKILLS-LIBRARY-INDEX.md` for current specialist mappings.
- Orchestration Target: **Gemini 3 Flash** via Google ADK.

Let's start by initializing the Coordinator agent structure."

---

## Technical Debt to Address
- **GitHub Pro**: Highly recommended for **GitHub Actions** (to automate ADK skill verification) and **Advanced Branch Protection** for the `agents/` and `skills/` directories.
- **API Key Management**: Move from `.env` to a centralized Secret Manager as we transition to Phase 1.
