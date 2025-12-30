# Pre-Flight Validation Protocol

**Status:** Active Development Standard  
**Date Established:** 2024-12-30  
**Authority:** RANGER CTO (Jason Valenzano)  
**Applies To:** All AI coding agents (Claude Code, sub-agents, future AI contributors)

---

## Purpose

Prevent AI coding agents from implementing solutions based on unvalidated assumptions about runtime state, system configuration, or component behavior. This protocol mandates empirical verification before code changes.

---

## The Problem This Solves

### Anti-Pattern: Assumption-Driven Implementation
```
Static Code Analysis → Assumptions About Runtime → Implementation → 
Discovery of Wrong Assumptions → Extensive Rework
```

**Cost:** 4-6 hours of implementation against incorrect assumptions, followed by 6-10 hours of debugging and rewriting.

**Root Cause:** AI agents excel at code analysis but cannot inherently distinguish between:
- **Aspirational documentation** (describes future state)
- **Current runtime state** (actual system behavior)
- **Outdated configuration** (docs say port 8000, actual is 8080)
- **Multiple valid paths** (two backends, both documented, which is canonical?)

### Corrected Pattern: Validation-First Development
```
Static Code Analysis → Explicit Assumptions → Runtime Verification → 
Validated Plan → Implementation
```

**Benefit:** 1-2 hours of validation prevents 6-10 hours of rework.

---

## When to Apply This Protocol

**MANDATORY for any implementation plan that involves:**

1. **Multiple system components** (frontend + backend + database + external services)
2. **Runtime dependencies** (services must be running, ports must be open, APIs must be accessible)
3. **>2 hours estimated implementation effort**
4. **Deployment or infrastructure changes**
5. **Integration with external systems** (MCP servers, RAG, third-party APIs)

**OPTIONAL but recommended for:**
- Single-component changes with complex state management
- Changes to configuration files with unclear precedence
- Refactoring that assumes current behavior matches documentation

---

## Protocol Steps

### Step 1: Identify Assumptions in Implementation Plan

**AI Agent Task:** Before presenting an implementation plan, explicitly list all assumptions being made.

**Common assumptions to flag:**
- "Service X is running" → Have you verified with `ps aux` or `docker ps`?
- "Component Y handles Z" → Have you traced the actual request path at runtime?
- "Configuration points to A" → Have you read the actual `.env` file in the deployment environment?
- "Feature W works end-to-end" → Have you manually tested it?
- "Database contains data for X" → Have you queried it?
- "Port Y is available" → Have you checked with `lsof -i :Y`?

**Template for assumption listing:**
```markdown
## Assumptions Requiring Validation

Based on code analysis and documentation, this plan assumes:

1. **Service State:**
   - [ ] API Gateway is running on port 8000
   - [ ] Database contains Cedar Creek fixture data
   - [ ] MCP Fixtures Server is accessible

2. **Configuration:**
   - [ ] Frontend .env points to http://localhost:8000
   - [ ] Backend uses GOOGLE_API_KEY from environment
   - [ ] RAG corpora are in europe-west3 region

3. **Component Behavior:**
   - [ ] Coordinator successfully delegates to specialists
   - [ ] Specialists return proof_layer in responses
   - [ ] Frontend displays AgentResponse objects correctly

4. **Data Availability:**
   - [ ] Cedar Creek BAER reports are in knowledge base
   - [ ] dNBR raster files exist in fixtures
   - [ ] Trail damage points have severity scores

**All assumptions above require runtime verification before implementation.**
```

---

### Step 2: Create Pre-Implementation Validation Checklist

**AI Agent Task:** Convert assumptions into testable verification steps.

**Checklist Template:**
```markdown
## Pre-Implementation Validation Checklist

Before writing any implementation code, verify:

### Runtime State
- [ ] Service X is running
  - Command: `ps aux | grep X` or `docker ps | grep X`
  - Expected: Process found with PID
  - Actual: [FILL IN AFTER TESTING]

- [ ] Port Y is accessible
  - Command: `lsof -i :Y` or `curl -I http://localhost:Y`
  - Expected: Service responds with 200 OK
  - Actual: [FILL IN AFTER TESTING]

### Configuration Verification
- [ ] Environment file contains required variables
  - Command: `cat .env | grep VARIABLE_NAME`
  - Expected: VARIABLE_NAME=expected_value
  - Actual: [FILL IN AFTER TESTING]

- [ ] Configuration precedence is clear
  - Check: .env vs .env.local vs environment variables
  - Expected: X takes precedence
  - Actual: [FILL IN AFTER TESTING]

### Component Behavior Testing
- [ ] Manual trigger of feature X from UI
  - Action: Click button, submit form, etc.
  - Expected: Response Y
  - Actual: [FILL IN AFTER TESTING]

- [ ] Request path tracing
  - Method: Browser DevTools Network tab OR curl with -v flag
  - Expected: Request reaches endpoint Z
  - Actual: [FILL IN AFTER TESTING]

- [ ] Error reproduction
  - Action: Trigger the condition that plan aims to fix
  - Expected: Specific error E
  - Actual: [FILL IN AFTER TESTING]

### Architectural Clarity
- [ ] Identify source of truth for ambiguous components
  - Question: If two backends exist, which is canonical?
  - Method: Check git history, docs, configuration
  - Answer: [FILL IN AFTER INVESTIGATION]

- [ ] Resolve conflicting documentation
  - Conflict: Doc A says X, Doc B says Y
  - Resolution: Test actual behavior
  - Result: [FILL IN AFTER TESTING]
```

---

### Step 3: Execute Validation (No Code Changes)

**AI Agent Instructions:**

1. **Use read-only commands only** (no writes, no deploys, no service restarts)
   - ✅ Allowed: `ps aux`, `lsof`, `cat`, `curl -I`, `grep`, `docker ps`
   - ❌ Forbidden: `docker build`, `npm install`, `git commit`, file edits

2. **Capture actual output** (not what you expect, what you observe)
   - Show full command output (stdout + stderr)
   - Note discrepancies between expected and actual
   - Highlight surprises or unexpected findings

3. **Test edge cases** (not just happy path)
   - What happens when service is not running?
   - What happens when configuration is missing?
   - What happens when request times out?

4. **Document dead ends** (things you tried that didn't work)
   - This prevents future developers from repeating the same exploration

**Example Validation Execution:**
```bash
# Checking if API Gateway is running
$ ps aux | grep -i "api-gateway\|uvicorn\|fastapi" | grep -v grep
[No output]

# Checking port 8000
$ lsof -i :8000
[No output - port not in use]

# Checking configuration
$ cd apps/command-console && cat .env.local | grep RANGER_API
VITE_RANGER_API_URL=http://localhost:8000

# FINDING: Frontend configured for port 8000, but no service running on that port
# QUESTION: Is API Gateway supposed to be running? Or is there another backend?

# Searching for backend entry points
$ find . -name "main.py" -type f
./main.py
./services/api-gateway/app/main.py

# FINDING: Two potential backend entry points found
# AMBIGUITY: Which one is canonical? Both configured for port 8000?
```

---

### Step 4: Report Validation Findings

**AI Agent Task:** Create validation report in `/docs/investigation/`

**Report Template:**
```markdown
# Pre-Implementation Validation Report

**Plan Name:** [Name of implementation plan being validated]
**Date:** [YYYY-MM-DD]
**Agent:** [Claude Code, Sub-agent Name, etc.]

---

## Executive Summary

- **Assumptions Tested:** [N]
- **Assumptions Validated:** [N]
- **Assumptions Invalidated:** [N]
- **Architectural Ambiguities Found:** [N]
- **Recommendation:** [PROCEED / REVISE PLAN / ESCALATE]

---

## Detailed Findings

### 1. Runtime State Verification

#### Service X Running Status
- **Assumption:** Service X is running on port Y
- **Test:** `ps aux | grep X`
- **Result:** [VALIDATED / INVALIDATED]
- **Evidence:** [Command output]
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

### 2. Configuration Verification

#### Environment Variables
- **Assumption:** Frontend points to backend at localhost:8000
- **Test:** `cat .env.local | grep RANGER_API`
- **Result:** [VALIDATED / INVALIDATED]
- **Evidence:** [File contents]
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

### 3. Component Behavior Testing

#### Feature X Trigger Test
- **Assumption:** Clicking button X triggers API call to /endpoint
- **Test:** Manual UI interaction with DevTools Network tab open
- **Result:** [VALIDATED / INVALIDATED]
- **Evidence:** [Screenshot, HAR file, curl recreation]
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

### 4. Architectural Clarity

#### Multiple Backend Entry Points
- **Ambiguity:** Two main.py files found, both configured for port 8000
- **Investigation:** [Git history, documentation review, testing]
- **Resolution:** [Which is canonical, why, evidence]
- **Impact on Plan:** [Fundamental revision required]

---

## Critical Discoveries

### Discovery 1: [Title]
**What:** [Description]
**Why It Matters:** [Impact on implementation plan]
**Recommendation:** [How to handle this]

### Discovery 2: [Title]
**What:** [Description]
**Why It Matters:** [Impact on implementation plan]
**Recommendation:** [How to handle this]

---

## Revised Assumptions (Post-Validation)

After validation, we now know:

- ✅ **Validated:** [Assumptions that proved correct]
- ❌ **Invalidated:** [Assumptions that proved incorrect]
- ⚠️ **Ambiguous:** [Assumptions requiring human decision]

---

## Impact on Implementation Plan

### Changes Required

1. **[Section of Plan]**
   - Original approach: [What plan proposed]
   - Why it won't work: [Validation finding]
   - Revised approach: [New proposal]

### Plan Sections That Remain Valid

- [List sections unaffected by validation findings]

---

## Recommendations

### Recommended Path Forward

[PROCEED / REVISE / ESCALATE]

**If PROCEED:**
- Validation confirmed all assumptions
- Implementation plan is sound
- Ready to begin Session 1

**If REVISE:**
- [List specific revisions needed]
- [Estimate impact on timeline/scope]
- Request approval for revised plan

**If ESCALATE:**
- [Describe architectural ambiguity requiring human decision]
- [Present 2-3 options with pros/cons]
- Request strategic guidance before proceeding

---

## Appendices

### Appendix A: Command Output Logs
[Full output from validation commands]

### Appendix B: Screenshots/Evidence
[Links to screenshots, HAR files, etc.]

### Appendix C: Configuration Files
[Relevant .env, config.yaml contents]
```

**Output Location:** `/docs/investigation/pre-session-N-validation.md`

---

### Step 5: Human Review & Decision

**CTO Task:** Review validation report and make strategic decision.

**Decision Options:**

1. **APPROVE (Proceed with original plan)**
   - Validation confirmed assumptions
   - No architectural ambiguities found
   - Implementation can proceed as planned

2. **REVISE (Request plan revision)**
   - Validation invalidated key assumptions
   - Plan needs adjustment but path is clear
   - Agent can revise autonomously

3. **ESCALATE (Strategic decision required)**
   - Validation uncovered architectural ambiguity
   - Multiple valid paths exist
   - Human judgment needed to select approach

**Response Template:**
```markdown
## CTO Review: [APPROVED / REVISION REQUIRED / ESCALATION DECISION]

### Decision Rationale
[Why this decision]

### Instructions to Agent

**If APPROVED:**
Proceed with Session 1 implementation. Begin with [specific starting point].

**If REVISION REQUIRED:**
Revise the following sections:
1. [Section] - [What to change and why]
2. [Section] - [What to change and why]

Re-submit revised plan for approval.

**If ESCALATION DECISION:**
I've chosen [Option A/B/C] because [strategic rationale].

Revise plan accordingly and proceed.

### Additional Guidance
[Any specific direction or constraints]
```

---

## Enforcement Mechanisms

### For AI Coding Agents

**Hard Rule:** AI agents MUST complete Pre-Flight Validation before writing implementation code.

**Violations:**
- ❌ Starting implementation without validation report
- ❌ Writing validation report with untested assumptions ("Expected: X, Actual: [not tested]")
- ❌ Proceeding after validation invalidates assumptions without plan revision
- ❌ Making architectural decisions that should be escalated

**If violation detected:** Human pauses work, agent reverts changes, validation executed properly.

### For Human Reviewers (CTO)

**Checklist for reviewing AI agent plans:**
- [ ] Does plan make assumptions about runtime state?
- [ ] Are assumptions explicitly listed?
- [ ] Has agent tested those assumptions?
- [ ] If not, insert Pre-Flight Validation checkpoint
- [ ] Review validation findings before approving implementation

---

## Success Metrics

### Leading Indicators
- **Time spent in validation:** Target 10-20% of total implementation time
  - If <5%: Agent is rushing, likely making assumptions
  - If >30%: Agent is stuck, may need architectural guidance

### Lagging Indicators
- **Rework rate:**
  - Without validation: 40-60% of implementation time is rework
  - With validation: 10-20% of implementation time is rework

### Quality Indicators
- **Architectural clarity:**
  - Without validation: "We tried A, didn't work, switched to B"
  - With validation: "We validated A wouldn't work, chose B from start"

---

## Real-World Example: Site Analysis Proof Layer

### Context
Claude Code presented implementation plan to add proof layer to Site Analysis feature. Plan assumed:
- API Gateway is functional
- Coordinator routes queries to specialists
- 4-6 hours to "fix routing"

### Validation Prevented Disaster

**What validation discovered:**
1. API Gateway not running (no process on port 8000)
2. Two backend entry points exist (architectural ambiguity)
3. Frontend configuration unclear (which backend is canonical?)
4. "Fix routing" would have been "build routing from scratch"

**Without validation:** 6-10 hours of false starts, debugging, rewriting
**With validation:** 30 minutes to discover issues, escalate for architectural decision

**Time saved:** ~8 hours
**Quality improvement:** Clear architectural decision before code written

---

## Integration with Existing Protocols

### Relationship to ADRs (Architecture Decision Records)

Pre-Flight Validation often surfaces need for ADRs:
- Validation finds architectural ambiguity → Write ADR documenting decision
- Validation confirms approach works → Reference ADR as validation evidence

### Relationship to Skills-First Architecture (ADR-005)

Pre-Flight Validation ensures skills are invoked correctly:
- Validate that skills exist and are accessible
- Verify skill inputs/outputs match expected schema
- Test skill execution before building orchestration

### Relationship to Deployment Runbooks

Pre-Flight Validation is a **prerequisite** for deployment:
- Deployment runbook assumes services are correctly configured
- Validation ensures configuration matches runbook assumptions

---

## Appendix: Common Validation Scenarios

### Scenario 1: Service Not Running

**Assumption:** "API Gateway is running on port 8000"

**Validation:**
```bash
$ lsof -i :8000
[No output]
```

**Finding:** Service not running

**Impact:** Cannot "fix routing" if service doesn't exist

**Resolution:** Start service OR identify correct service

---

### Scenario 2: Configuration Mismatch

**Assumption:** "Frontend configured for localhost:8000"

**Validation:**
```bash
$ cat .env.local | grep API_URL
VITE_RANGER_API_URL=http://localhost:3000
```

**Finding:** Frontend points to port 3000, not 8000

**Impact:** "Fixing" port 8000 backend won't help frontend

**Resolution:** Update configuration OR change backend port

---

### Scenario 3: Architectural Ambiguity

**Assumption:** "API Gateway handles chat requests"

**Validation:**
```bash
$ find . -name "main.py"
./main.py
./services/api-gateway/app/main.py

$ grep -r "port.*8000" .
./main.py:    uvicorn.run(app, host="0.0.0.0", port=8000)
./services/api-gateway/app/main.py:    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Finding:** Two backends configured for same port

**Impact:** Cannot proceed without knowing which is canonical

**Resolution:** Escalate for architectural decision

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2024-12-30 | Initial protocol established | Jason Valenzano (CTO) |

---

## References

- **Triggering incident:** Claude Code proof layer implementation plan (2024-12-30)
- **Related protocols:** None (this is the first formal protocol)
- **Related ADRs:** ADR-005 (Skills-First), all ADRs referenced during validation
