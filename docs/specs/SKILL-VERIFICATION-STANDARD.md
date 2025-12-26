# Standard: Skill Verification & Quality Gates (v1.0)

> [!IMPORTANT]
> **Purpose:** This standard defines the "Definition of Done" (DoD) for any Specialist Skill added to the RANGER library, ensuring consistency, transparency, and auditability.

## 1. Definition of Done (DoD) for an Agentic Skill

A Skill is considered **Production-Ready** when it satisfies the following criteria:

- [ ] **Specification Alignment:** The logic matches the domain requirements in the corresponding `docs/features/` spec (e.g., Burn Severity thresholds).
- [ ] **Reasoning Transparency:** The skill emits a populated `reasoning_chain` in every `AgentBriefingEvent`.
- [ ] **Citation Compliance:** Every claim includes a citation to a validated source (Satellite, Field Note, or Regulation).
- [ ] **Schema Validation:** JSON outputs strictly follow the `PROTOCOL-AGENT-COMMUNICATION.md` schema.
- [ ] **Error Handling:** The skill gracefully handles "Missing Data" or "Upstream Failure" without crashing the ADK session.
- [ ] **Documentation:** A complete `skill.md` exists in the `docs/specs/` directory following the standard template.

## 2. RANGER Protocol Compliance Checklist

Every Skill check-in must pass this checklist during the PR review:

| Category | Requirement | Verification Method |
|----------|-------------|-------------------|
| **Identity** | Unique `skill_id` in registry | Code Audit |
| **Logic** | Reasoning steps are human-readable | Manual Review |
| **Data** | Uses MCP for all external calls | Dependency Audit |
| **UX** | Includes a `ui_target` (Map/Briefing) | Smoke Test |
| **Performance** | Logic completes in < 5s | Profile Trace |

## 3. Automated Quality Gates (GitHub Actions)

The RANGER CI pipeline enforces the following gates:

1.  **Linter:** Strict Pydantic model validation for all event schemas.
2.  **Logic Simulation:** Skills are tested against `data/fixtures/` to ensure deterministic output for known inputs.
3.  **Prompt Injection Shield:** LLM inputs are scanned for common override patterns.
4.  **Cost Guard:** Every verification run reports estimated token usage per skill invocation.

## 4. Governance & Sign-off

- **Domain Approval:** For specialized skills (e.g., NEPA), a domain expert (Silviculturist/Environment Coordinator) must review the reasoning logic.
- **Security Approval:** Any skill requiring new MCP permissions or external API keys requires an infra review.

---
*Created: December 2025*
