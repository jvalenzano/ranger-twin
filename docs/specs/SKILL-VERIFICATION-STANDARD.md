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
- [ ] **Evaluation QA Pairs:** Includes `evaluations.xml` with 10 complex question-answer pairs (The "Evaluation 10").
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
| **Verification** | Evaluation QA Pairs | 10 Semantic pairs in XML | Automated Eval |

## 3. Automated Quality Gates (GitHub Actions)

The RANGER CI pipeline enforces the following gates:

1.  **Linter:** Strict Pydantic model validation for all event schemas.
2.  **Logic Simulation:** Skills are tested against `data/fixtures/` to ensure deterministic output for known inputs.
3.  **Prompt Injection Shield:** LLM inputs are scanned for common override patterns.
4.  **Cost Guard:** Every verification run reports estimated token usage per skill invocation.

## 4. Governance & Sign-off

- **Domain Approval:** For specialized skills (e.g., NEPA), a domain expert (Silviculturist/Environment Coordinator) must review the reasoning logic.
- **Security Approval:** Any skill requiring new MCP permissions or external API keys requires an infra review.

43: ---
44: *Created: December 2025*
45: 
46: ## 5. Evaluation Standard (Phase 2)
47: 
48: To support "Evaluation-Driven Development" (EDD), every MCP server and complex skill must include an `evaluations.xml` file.
49: 
50: ### The "Evaluation 10"
51: You must define 10 questions that test the skill's ability to handle complexity.
52: 
53: 1. **Independent**: Not dependent on other questions.
54: 2. **Read-only**: Non-destructive operations only.
55: 3. **Complex**: Requires multiple tool calls or deep reasoning.
56: 4. **Realistic**: Based on actual Forest Service workflows.
57: 5. **Verifiable**: Has a clear, deterministic answer.
58: 
59: ### XML Format
60: ```xml
61: <evaluation>
62:   <qa_pair>
63:     <question>Find the dNBR severity for the Cedar Creek Fire perimeter. What percentage is classified as 'High Severity'?</question>
64:     <answer>42%</answer>
65:   </qa_pair>
66:   <!-- 9 more pairs... -->
67: </evaluation>
68: ```
