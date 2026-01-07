# AI Agent Orchestration: Best Practices Guide

> **Version:** 1.0  
> **Created:** December 29, 2025  
> **Purpose:** Reusable patterns for delegating complex technical tasks to AI coding agents  
> **Audience:** CTOs, technical leads, and developers managing AI-assisted development workflows

---

## Table of Contents

1. [Introduction](#introduction)
2. [The Core Problem: Assumption Collapse](#the-core-problem-assumption-collapse)
3. [Pattern 1: Pre-Flight Validation Protocol](#pattern-1-pre-flight-validation-protocol)
4. [Pattern 2: Parallel Sub-Agent Orchestration](#pattern-2-parallel-sub-agent-orchestration)
5. [Pattern 3: Context Management & Checkpointing](#pattern-3-context-management--checkpointing)
6. [Pattern 4: Structured Output Requirements](#pattern-4-structured-output-requirements)
7. [Pattern 5: Search Protocol for Code Audits](#pattern-5-search-protocol-for-code-audits)
8. [Pattern 6: Zombie Code Detection](#pattern-6-zombie-code-detection)
9. [Pattern 7: Self-Verification Gates](#pattern-7-self-verification-gates)
10. [Pattern 8: Communication & Progress Reporting](#pattern-8-communication--progress-reporting)
11. [Pattern 9: Cost-Optimized Model Selection](#pattern-9-cost-optimized-model-selection)
12. [Pattern 10: Source of Truth Hierarchy](#pattern-10-source-of-truth-hierarchy)
13. [Prompt Engineering Checklist](#prompt-engineering-checklist)
14. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
15. [Example Prompts](#example-prompts)

---

## Introduction

This guide captures battle-tested patterns for orchestrating AI coding agents (Claude Code, Antigravity, Cursor, etc.) on complex software engineering tasks. These patterns emerged from preventing a potential 6-hour implementation failure by catching invalid runtime assumptions through systematic validation.

**Key Insight:** Modern AI agents are extraordinarily capable but prone to "assumption collapse" - building elaborate solutions on unvalidated premises. The patterns here prevent this failure mode.

**Scope:** These practices apply to:
- Large codebase audits (100+ files)
- Multi-agent task orchestration
- Architecture migration/refactoring
- Production system debugging
- Technical debt assessment

---

## The Core Problem: Assumption Collapse

### What Is Assumption Collapse?

An AI agent makes a reasonable-sounding assumption about system state, architecture, or dependencies, then builds an entire implementation plan on that assumption without validation. When the assumption proves false, hours of work become worthless.

### Real-World Example

**Scenario:** Agent tasked with "fixing proof layer routing in UI"

**Agent's Assumption:** "API Gateway is running on localhost:8000 and returning data; I just need to fix the UI parsing logic"

**Reality:** No backend was running at all. The UI was falling back to a mock API. The agent was about to spend 6 hours implementing UI "fixes" for a backend that didn't exist.

**Cost of Failure:** 6 hours of wasted development + technical debt from incorrect fixes + loss of trust in AI-assisted development

### How Assumption Collapse Happens

1. **Incomplete Context:** Agent doesn't have full system visibility
2. **Optimistic Reasoning:** LLMs default to "best case" interpretations
3. **Documentation Lag:** Code comments/docs describe old architecture
4. **Pressure to Deliver:** "Just start coding" culture skips validation

### Prevention Strategy

**30 minutes of validation saves 10 hours of rework.**

Every implementation task must begin with explicit validation of assumptions before writing any code.

---

## Pattern 1: Pre-Flight Validation Protocol

### Purpose
Prevent assumption collapse by requiring explicit validation of runtime state, architecture, and dependencies before implementation begins.

### When to Use
- Any task involving external APIs or services
- Integration work between multiple components
- Refactoring legacy/unfamiliar code
- Production deployments or migrations

### Protocol Steps

#### Step 1: Identify Assumptions
Before planning implementation, the agent must explicitly list:
- What services/APIs am I assuming exist?
- What state am I assuming the system is in?
- What architecture am I assuming is canonical?
- What data formats am I assuming?

#### Step 2: Test Each Assumption
For every assumption, provide specific validation test:

```markdown
| Assumption | Validation Test | Evidence Required |
|------------|----------------|-------------------|
| API Gateway is running | `curl localhost:8000/health` | HTTP 200 response |
| Backend returns proof_layer | Inspect actual JSON response | Field exists in response body |
| Feature-ID is primary key | Check UI click handler code | Confirms feature_id passed |
```

#### Step 3: Document Findings
Create validation report with this structure:

```markdown
## Validation Report

**Task:** [Brief description]
**Date:** [ISO timestamp]
**Validator:** [Agent name/model]

### Assumptions Tested

1. **Assumption:** API Gateway functional on port 8000
   - **Test:** `curl http://localhost:8000/health`
   - **Result:** ❌ Connection refused
   - **Impact:** BLOCKS implementation - no backend to route to

2. **Assumption:** UI expects lat/lon coordinates
   - **Test:** Read VisualAuditOverlay.tsx click handler
   - **Result:** ✅ Confirmed - passes feature_id, not coordinates
   - **Impact:** Plan was correct

### Validated/Invalidated

✅ **VALIDATED:**
- Feature-ID approach is correct
- UI component structure matches plan

❌ **INVALIDATED:**
- Backend is not running (blocks work)
- Two backends exist (architecture ambiguity)

### Recommendation
STOP implementation. Resolve backend architecture ambiguity first.
```

#### Step 4: Go/No-Go Decision Gate
Based on validation findings:

- **GO:** All critical assumptions validated, proceed with implementation
- **REVISE:** Minor issues found, update plan and re-validate
- **ESCALATE:** Major blockers or architectural ambiguities, escalate to human decision-maker

### Implementation Template

```markdown
## Pre-Flight Validation Checklist

### Runtime Environment
- [ ] Services running? (list expected processes/ports)
- [ ] Dependencies available? (databases, APIs, etc.)
- [ ] Environment variables configured?
- [ ] Network connectivity working?

### Architecture Validation  
- [ ] Which component is canonical? (if multiple exist)
- [ ] Are there version conflicts? (multiple implementations)
- [ ] Is this production code or abandoned prototype?
- [ ] What's the deployment state? (dev/staging/prod)

### Data Contract Validation
- [ ] What does API actually return? (capture real response)
- [ ] What schema does it expect? (inspect route handler)
- [ ] Are there breaking changes from docs?
- [ ] Do fixtures match production data structure?

### Code Archaeology
- [ ] When was this code last modified? (`git log`)
- [ ] Are there active imports? (grep for references)
- [ ] Does it contradict architectural decisions? (check ADRs)
- [ ] Is this referenced in current roadmap?

### Evidence Collection
For each validation test:
1. Document exact command/code used
2. Capture full output/response
3. Note line numbers for code references
4. Include timestamps for service checks
```

### Success Metrics
- Zero architectural surprises during implementation
- No "oh, we need to refactor the backend first" discoveries mid-task
- Reduced rework cycles from invalid assumptions

---

## Pattern 2: Parallel Sub-Agent Orchestration

### Purpose
Reduce execution time for large audits/analysis tasks by leveraging AI's ability to spawn parallel sub-agents.

### When to Use
- Codebase audits (100+ files)
- Multi-category analysis tasks
- Independent validation checks
- Large-scale refactoring planning

### Strategy

Modern AI agents (Claude Opus 4.5, GPT-4, etc.) can spawn multiple sub-agents that work concurrently on independent tasks. Structure your prompts to exploit this.

### Orchestration Pattern

```markdown
## Execution Strategy: Parallel Operations

Launch these tasks SIMULTANEOUSLY:

**Agent A (Explore - Haiku):** Pattern Search #1
- Glob: **/*.py
- Grep: "deprecated_function"
- Output: matching_files_A.json

**Agent B (Explore - Haiku):** Pattern Search #2  
- Glob: **/*.ts
- Grep: "TODO|FIXME"
- Output: matching_files_B.json

**Agent C (Analysis - Sonnet):** Architecture Analysis
- Read: main.py, coordinator.py
- Compare: Against ADR-005 requirements
- Output: architecture_violations.md

**Agent D (Analysis - Sonnet):** Dependency Analysis
- Read: requirements.txt, package.json
- Check: For conflicts/duplicates
- Output: dependency_report.json

**Synthesis Agent (Opus):** Final Report
- Wait for: All sub-agents complete
- Inputs: All sub-agent outputs
- Output: consolidated_report.md
```

### Model Selection for Sub-Agents

| Agent Type | Model | Use Case | Cost |
|------------|-------|----------|------|
| **Explore** | Haiku | Fast pattern searches, file listing | $$ |
| **Analysis** | Sonnet 4.5 | Deep reasoning, cross-file analysis | $$$ |
| **Synthesis** | Opus 4.5 | Final decisions, ambiguity resolution | $$$$ |

### Time Savings

**Sequential execution:** 6 independent tasks × 20 min = 120 minutes  
**Parallel execution:** max(20 min per task) + 15 min synthesis = ~35 minutes

**Speedup:** 3.4x faster

### Implementation Example

```markdown
## Task: Audit Codebase for ADR-005 Compliance

### Parallel Sub-Agent Tasks (Launch Simultaneously)

#### Sub-Agent A: OpenRouter Reference Scan
```bash
Model: Haiku
Glob: **/*.{py,ts,json,env*}
Grep: "openrouter|anthropic|OPENROUTER_API_KEY"
Output: /audit/openrouter-refs.json
Deadline: 10 minutes
```

#### Sub-Agent B: FastAPI vs ADK Mapping
```bash
Model: Sonnet
Task: Read all Python files, classify as FastAPI or ADK
Check: Do both exist? Which is newer?
Output: /audit/backend-architecture.md
Deadline: 20 minutes
```

#### Sub-Agent C: Skills Directory Validation
```bash
Model: Haiku
Task: For each agent/, verify skills/ subfolder exists
Check: Do skill.md files follow template?
Output: /audit/skills-compliance.json
Deadline: 15 minutes
```

#### Synthesis Agent: Final Report
```bash
Model: Opus 4.5
Wait: For A, B, C completion
Task: Compile findings, rank severity, resolve conflicts
Output: /audit/FINAL-REPORT.md
Deadline: 15 minutes post-subagent completion
```

**Total Time:** ~35 minutes (vs 60+ sequential)
```

### Coordination Mechanism

**Use a shared state file for coordination:**

```json
{
  "audit_id": "20251229-143000",
  "sub_agents": {
    "agent_a": {
      "status": "complete",
      "output_file": "/audit/openrouter-refs.json",
      "completed_at": "2025-12-29T14:10:00Z"
    },
    "agent_b": {
      "status": "in_progress",
      "progress": "60%",
      "eta": "2025-12-29T14:20:00Z"
    }
  }
}
```

---

## Pattern 3: Context Management & Checkpointing

### Purpose
Prevent data loss when tasks span multiple AI context windows (common for large audits taking 2+ hours).

### The Context Window Problem

Modern AI agents have context limits:
- Claude Opus 4.5: ~200K tokens (~150K words)
- GPT-4 Turbo: ~128K tokens  
- Large codebases easily exceed this in a single pass

**Symptom:** Agent "forgets" earlier findings, duplicates work, or loses progress mid-task.

### Solution: Explicit Checkpointing

#### Checkpoint Strategy

```markdown
## Context Management Protocol

**This task will span multiple context windows. Use checkpointing:**

1. **Save progress every 30 minutes** to:
   - `/work/checkpoint-HHMMSS.json` (state file)
   - `/work/findings-HHMMSS.md` (human-readable)

2. **Before context window refresh:**
   - Write all findings to persistent storage
   - Document which tasks remain incomplete
   - Save "resume instructions" for next context

3. **On context refresh:**
   - Read most recent checkpoint file
   - Resume from saved state
   - Verify critical findings are still accessible

4. **Checkpoint format:**
```json
{
  "timestamp": "2025-12-29T14:30:00Z",
  "task_id": "codebase-audit-001",
  "completed_tasks": [
    "Agent A: OpenRouter scan (23 refs found)",
    "Agent B: Backend mapping (2 backends identified)"
  ],
  "pending_tasks": [
    "Agent C: Skills validation (40% complete)",
    "Agent D: Dependency audit (not started)"
  ],
  "findings_summary": {
    "critical_violations": 4,
    "medium_issues": 12,
    "low_priority": 8
  },
  "next_action": "Complete Agent C validation, then start Agent D"
}
```
```

#### Checkpoint File Locations

**Structured directory for long-running tasks:**

```
/work/
├── checkpoints/
│   ├── 2025-12-29T1400.json
│   ├── 2025-12-29T1430.json
│   └── 2025-12-29T1500.json
├── findings/
│   ├── category-1-violations.md
│   ├── category-2-issues.md
│   └── category-3-debt.md
├── state/
│   └── current-state.json  # Always points to latest
└── outputs/
    └── FINAL-REPORT.md
```

#### Resume Instructions

**Include this in every checkpoint:**

```markdown
## Resume Instructions (Next Context Window)

**When you reload this task:**

1. Read `/work/state/current-state.json` for progress summary
2. Read `/work/findings/*.md` for what's been discovered
3. Check `pending_tasks` array for what remains
4. DO NOT re-scan files already processed (see `scanned_files` list)
5. Pick up at: [SPECIFIC NEXT TASK]

**Critical Context to Preserve:**
- We found 4 HIGH severity violations blocking implementation
- API Gateway is confirmed zombie architecture (remove it)
- Backend is main.py (ADK), not api-gateway/main.py
- Coordinator proof_layer emission status: UNKNOWN (needs runtime test)
```

---

## Pattern 4: Structured Output Requirements

### Purpose
Ensure AI agent outputs are machine-readable and can feed into downstream automation or human decision workflows.

### The Problem with Unstructured Outputs

**Bad output:** Long markdown essay with findings buried in prose

**Why it's bad:**
- Humans must manually extract action items
- Can't feed into CI/CD pipelines
- Severity/priority lost in narrative
- No way to track "fixed vs not fixed"

### Solution: Dual Output Format

#### Format 1: Machine-Readable JSON

```json
{
  "metadata": {
    "audit_id": "codebase-audit-001",
    "completed_at": "2025-12-29T15:30:00Z",
    "agent": "Claude Opus 4.5",
    "execution_time_minutes": 87
  },
  "critical_violations": [
    {
      "id": "CRIT-001",
      "file": "services/api-gateway/main.py",
      "line": 15,
      "severity": "HIGH",
      "category": "architecture_conflict",
      "issue": "FastAPI backend conflicts with ADK mandate",
      "evidence": "from fastapi import FastAPI\napp = FastAPI()",
      "adr_citation": "ADR-005 Section 2",
      "recommendation": "Remove services/api-gateway/ directory",
      "blocks_implementation": true,
      "estimated_fix_time_hours": 0.5
    }
  ],
  "summary": {
    "total_files_scanned": 284,
    "violations_by_severity": {
      "high": 4,
      "medium": 12,
      "low": 8
    },
    "estimated_cleanup_hours": 6.5,
    "blocks_implementation": true
  }
}
```

**Why this is good:**
- Can generate tickets automatically (GitHub Issues, Jira)
- CI/CD can block merges if HIGH severity exists
- Dashboards can visualize technical debt
- Progress tracking: "4 HIGH → 2 HIGH → 0 HIGH"

#### Format 2: Human-Readable Summary

```markdown
# Codebase Audit Report

**Completed:** 2025-12-29 15:30 UTC  
**Execution Time:** 87 minutes  
**Files Scanned:** 284

## 🚨 Critical Issues (BLOCKS IMPLEMENTATION)

### CRIT-001: API Gateway Architecture Conflict
- **File:** `services/api-gateway/main.py:15`
- **Issue:** FastAPI backend contradicts ADR-005 ADK mandate
- **Impact:** Port 8000 conflict with main.py (ADK backend)
- **Fix:** Remove `services/api-gateway/` directory entirely
- **Time:** 30 minutes

**Why this blocks work:** Claude Code will attempt to route to API Gateway, but ADK backend is canonical. Creates race condition on port 8000.

---

## 📊 Summary Dashboard

| Category | Count | Estimated Fix Time |
|----------|-------|-------------------|
| 🚨 Critical (HIGH) | 4 | 2 hours |
| ⚠️ Medium | 12 | 4 hours |
| ℹ️ Low | 8 | 30 minutes |
| **TOTAL** | **24** | **6.5 hours** |

## ✅ What's Working Well

- Skills architecture compliant (ADR-005)
- MCP connectivity properly implemented
- Frontend UI components match spec

## 🎯 Recommended Action Sequence

1. Remove API Gateway zombie architecture (30 min)
2. Fix OpenRouter imports in aiBriefingService.ts (15 min)
3. Verify Coordinator proof_layer emission (runtime test, 30 min)
4. Clean up deprecated environment variables (15 min)

**Total cleanup before Phase 1:** ~90 minutes
```

### Schema Specification Template

When requesting structured output, always provide the exact schema:

```markdown
## Output Requirements

Create TWO files:

### 1. Machine-Readable: `/audit/audit-report.json`

Use this EXACT schema (do not deviate):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["metadata", "critical_violations", "summary"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["audit_id", "completed_at"],
      "properties": {
        "audit_id": {"type": "string"},
        "completed_at": {"type": "string", "format": "date-time"}
      }
    },
    "critical_violations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["file", "severity", "issue"],
        "properties": {
          "file": {"type": "string"},
          "line": {"type": "integer"},
          "severity": {"enum": ["HIGH", "MEDIUM", "LOW"]},
          "issue": {"type": "string"},
          "blocks_implementation": {"type": "boolean"}
        }
      }
    }
  }
}
```

### 2. Human-Readable: `/audit/SUMMARY.md`

Include these sections:
- Executive summary (3-5 sentences)
- Critical issues blocking work
- Summary dashboard table
- Recommended action sequence with time estimates
```
```

---

## Pattern 5: Search Protocol for Code Audits

### Purpose
Prevent false positives/negatives when auditing large codebases by enforcing systematic search methodology.

### The Problem: Assumption-Based Searching

**Bad approach:** "I'll search for 'openrouter' and assume any matches are violations"

**What goes wrong:**
- False positives: Commented code, documentation, test mocks
- False negatives: Variants like "OpenRouter", "open_router", "OPENROUTER"
- Context loss: Can't distinguish production vs test code

### Solution: 3-Step Validation

#### Step 1: Glob (Identify Candidates)

```bash
# Use specific glob patterns for file discovery
Glob: **/*.{py,ts,js,json}
Glob: **/*.env*
Glob: services/**/*.py
```

#### Step 2: Grep (Find Patterns)

```bash
# Case-insensitive, multiple patterns
Grep: "openrouter|anthropic|OPENROUTER_API_KEY" (case-insensitive)
Grep: "@app\.(post|get|put|delete)" (regex)
Grep: "from fastapi import"
```

#### Step 3: Read & Verify (Confirm Context)

**CRITICAL: Always read the full file before declaring a finding.**

```markdown
## Example: Finding OpenRouter Violations

### Step 1: Glob
Found 47 files containing potential references

### Step 2: Grep  
Found 23 matches for "openrouter" pattern

### Step 3: Read & Classify Each Match

**File:** `services/api-gateway/router.py`
**Line:** 42
**Match:** `from openrouter import Client`
**Context (read full file):**
```python
# This is the production router
from openrouter import Client

client = Client(api_key=os.getenv("OPENROUTER_KEY"))
```
**Classification:** HIGH severity - Active production import

---

**File:** `tests/mocks/llm_mock.py`
**Line:** 18
**Match:** `# from openrouter import Client`
**Context:**
```python
# Legacy test mock - no longer used
# from openrouter import Client
```
**Classification:** LOW severity - Commented code, cleanup candidate

---

**File:** `docs/ADR-006.md`
**Line:** 89
**Match:** "We previously used OpenRouter but..."
**Classification:** Not a violation - Documentation reference
```

### Search Pattern Catalog

Common patterns for different audit types:

#### Architecture Audit
```markdown
**Deprecated Framework (FastAPI → ADK):**
- Glob: **/*.py
- Grep: "@app\.(get|post|put|delete)|from fastapi import"
- Verify: Is this production code or test/legacy?

**Dual Backend Detection:**
- Glob: **/*main.py, **/server.py
- Grep: "app\.run|uvicorn\.run|if __name__.*main"
- Verify: Which is canonical? Check git log activity.
```

#### Dependency Audit
```markdown
**Unused Imports:**
- Glob: **/*.py
- Grep: "^import |^from .* import" (line start)
- Verify: Is this import used anywhere in file? (search for symbol)

**Version Conflicts:**
- Read: requirements.txt, pyproject.toml, package.json
- Check: Are there duplicate packages? Incompatible versions?
```

#### Security Audit
```markdown
**Hardcoded Secrets:**
- Glob: **/*.{py,ts,js,env}
- Grep: "api[_-]?key|secret|password|token" (case-insensitive)
- Verify: Is this a variable name or actual secret value?

**SQL Injection Risk:**
- Glob: **/*.py
- Grep: "execute\(.*%s|execute\(.*\+|execute\(.*f\""
- Verify: Is this using parameterized queries or string concat?
```

---

## Pattern 6: Zombie Code Detection

### Purpose
Systematically identify abandoned code that contradicts current architecture but hasn't been removed.

### What Is Zombie Code?

Code that is:
- No longer used in production
- Contradicts current architectural decisions
- Not actively maintained (no recent commits)
- But still present in the repository

**Why it's dangerous:** New developers (or AI agents) discover it and assume it's canonical, building on top of deprecated patterns.

### Detection Heuristics

A file/directory is "zombie code" if it fails **2 or more** of these tests:

#### Test 1: Import Test
```bash
# Is this module imported anywhere in production code?
grep -r "from services.api_gateway import" .
grep -r "import api_gateway" .

# Check __init__.py and index.ts exports
cat services/api_gateway/__init__.py
# If empty or missing → likely not exported

# Result: FAIL if zero imports found
```

#### Test 2: Git Activity Test
```bash
# Has this been modified in last 3 months?
git log --since="3 months ago" services/api_gateway/

# Result: FAIL if zero commits
```

#### Test 3: Contradiction Test
```markdown
# Does this code contradict documented architecture decisions?

**Check:**
1. Read relevant ADR docs (Architecture Decision Records)
2. Compare code patterns against ADR mandates
3. Look for explicit deprecation notices

**Example:**
- Code uses: `from fastapi import FastAPI`
- ADR-005 says: "We adopt Google ADK as agent runtime"
- Result: FAIL - direct contradiction
```

#### Test 4: Dependency Test
```bash
# Is this package in requirements.txt but never imported?

# Step 1: Check if package is listed
grep "fastapi" requirements.txt

# Step 2: Check if it's imported anywhere
grep -r "from fastapi import" . | wc -l

# If listed but 0 imports in production code:
# Result: FAIL - unused dependency
```

### Zombie Detection Algorithm

```markdown
## Zombie Code Detection Procedure

For each suspect file/directory:

1. Run all 4 tests
2. Count failures
3. If ≥2 failures → Mark as zombie
4. Verify with human before deletion

### Example: `services/api-gateway/`

| Test | Result | Evidence |
|------|--------|----------|
| Import | ❌ FAIL | Zero imports found in production code |
| Git Activity | ❌ FAIL | Last commit 4 months ago |
| Contradiction | ❌ FAIL | Uses FastAPI, ADR-005 mandates ADK |
| Dependency | ✅ PASS | FastAPI imported in test mocks |

**Failures:** 3/4  
**Classification:** ZOMBIE CODE  
**Recommendation:** Remove `services/api-gateway/` directory
```

### Zombie Code Report Template

```markdown
## Zombie Code Detection Report

### High-Confidence Zombies (3-4 tests failed)

#### `services/api-gateway/`
- **Failed Tests:** Import (0 refs), Git Activity (4mo old), Contradiction (vs ADR-005)
- **Size:** 2,847 lines across 12 files
- **Recommendation:** DELETE entire directory
- **Risk:** Low - no production dependencies

### Moderate-Confidence Zombies (2 tests failed)

#### `utils/legacy_parser.py`
- **Failed Tests:** Git Activity (6mo old), Import (0 refs)
- **Size:** 432 lines
- **Recommendation:** Review with team before deleting
- **Risk:** Medium - unclear if used in deployment scripts

### Not Zombies (0-1 tests failed)

#### `agents/coordinator/orchestrator.py`
- **Failed Tests:** None
- **Git Activity:** ✅ Active (modified 2 days ago)
- **Imports:** ✅ Imported by 8 files
- **Status:** PRODUCTION CODE - DO NOT TOUCH
```

---

## Pattern 7: Self-Verification Gates

### Purpose
Have the AI agent validate its own work before presenting findings, catching errors that humans would spot immediately.

### Why This Matters

AI agents are confident even when wrong. They'll present:
- Findings that contradict their own evidence
- Severity ratings that don't match impact
- Recommendations that don't address the issue

**Self-verification catches these before wasting human review time.**

### Self-Verification Checklist

Include this at the END of every complex task prompt:

```markdown
## Self-Verification Protocol

**Before marking this task complete, run this checklist:**

### 1. Evidence Validation
- [ ] Re-read all files cited in findings
- [ ] Confirm line numbers are correct
- [ ] Verify evidence snippets match actual file content
- [ ] Check that file paths are accurate (not truncated/modified)

### 2. Consistency Check
- [ ] Do HIGH severity findings actually block work?
- [ ] Are severity rankings consistent across similar issues?
- [ ] Do recommendations actually solve the stated problem?
- [ ] Are ADR citations specific (not just "ADR-005" but "ADR-005 Section 2.3")?

### 3. False Positive Check
- [ ] Did I distinguish production code from test code?
- [ ] Did I distinguish active code from commented code?
- [ ] Did I distinguish documentation from actual violations?
- [ ] Did I consider alternative explanations for findings?

### 4. Completeness Check
- [ ] Did I search the full scope requested?
- [ ] Did I check all specified file types?
- [ ] Did I document any areas I couldn't audit (and why)?
- [ ] Did I flag ambiguities/uncertainties explicitly?

### 5. Self-Critique
Answer these questions honestly:
- "What might I have missed?"
- "Did I make assumptions without validation?"
- "Would someone with fresh eyes understand my findings?"
- "Did I actually read the ADR docs or just skim them?"
```

### Self-Critique Questions

Include these open-ended prompts:

```markdown
## Final Self-Reflection

Before presenting findings, answer:

1. **Assumption Audit:**
   - What assumptions did I make during this audit?
   - Which assumptions did I validate vs take for granted?
   - Example: "I assumed main.py is the canonical backend because it's in the root, but I should verify with git log activity"

2. **Blind Spots:**
   - What parts of the codebase did I not examine?
   - Why? (e.g., "Didn't check /tests/ because prompt said 'production code only'")
   - Should those areas have been checked anyway?

3. **Confidence Assessment:**
   - For each HIGH severity finding, how confident am I? (0-100%)
   - What would increase my confidence? (e.g., "Runtime test needed")
   - Did I mark any findings as uncertain/ambiguous?

4. **Human Review Needs:**
   - Which findings require human architectural judgment?
   - Which findings are slam-dunks (obvious violations)?
   - What questions should I ask the human reviewer?
```

### Example Self-Correction

```markdown
## Self-Verification: ISSUE FOUND

**Original Finding:**
```
FILE: agents/coordinator/orchestrator.py
SEVERITY: HIGH
ISSUE: Missing proof_layer emission
EVIDENCE: (none provided)
```

**Self-Verification Check Failed:** No evidence provided

**Corrected Finding:**
```
FILE: agents/coordinator/orchestrator.py
LINE: 156-180
SEVERITY: HIGH
ISSUE: proof_layer defined but not emitted in response
EVIDENCE:
  Line 156: proof_layer = {
    "confidence": 0.85,
    "reasoning_chain": [...]
  }
  Line 178: return {"content": briefing}
  # proof_layer never added to return dict

CONFIDENCE: 85% (need runtime test to confirm)
```

**Why this is better:** Specific line numbers, actual code evidence, confidence caveat
```

---

## Pattern 8: Communication & Progress Reporting

### Purpose
Keep human supervisors informed during long-running tasks without overwhelming them.

### The Communication Balance

**Too little:** Human wonders "is it stuck? crashed? finished?"  
**Too much:** Human drowns in noise, misses critical findings

### Optimal Reporting Cadence

```markdown
## Communication Style

**Provide progress updates using this format:**

[HH:MM] ✅ Milestone - Brief description
[HH:MM] ⏳ In Progress - Current task (X% complete)
[HH:MM] 🚨 CRITICAL - Blocking issue found
[HH:MM] 📊 Checkpoint - Summary statistics

**Example Timeline:**

[10:15] ✅ Agent A completed - Found 3 OpenRouter references
[10:23] ✅ Agent B completed - Mapped API Gateway architecture
[10:30] ⏳ Agent C in progress - Skills validation 60% complete
[10:45] 🚨 BLOCKER FOUND - API Gateway conflicts with ADK on port 8000
[10:50] 📊 Checkpoint saved - 15 findings so far, 2 blockers
[11:05] ⏳ Agent D in progress - Dependency audit starting
[11:20] ✅ All sub-agents complete - Starting synthesis
[11:35] ✅ TASK COMPLETE - Final report ready for review
```

### Milestone Notifications

**Report these events immediately:**

1. **Blockers Found:** Any HIGH severity issue that stops implementation
2. **Architectural Surprises:** Unexpected system state/configuration
3. **Scope Changes:** "I need to check X, which wasn't in original plan"
4. **Completion:** Task finished, outputs ready for review

### Severity-Based Escalation

```markdown
## When to Interrupt Human Supervision

**🚨 IMMEDIATE ESCALATION (stop and report):**
- Critical security vulnerability found (hardcoded secrets, SQL injection)
- Multiple conflicting architectural implementations (2+ "canonical" backends)
- Data loss risk (destructive operation about to execute)
- Task scope fundamentally misunderstood (need clarification before continuing)

**⚠️ FLAGGED FOR REVIEW (note but continue):**
- Architectural decision needed (which component to keep?)
- Ambiguous findings (could be violation or false positive)
- Resource limits approaching (90% through context window)

**ℹ️ ROUTINE UPDATE (periodic only):**
- Checkpoint saves
- Sub-agent completion
- Progress percentages
```

### Progress Metrics

Include quantitative progress indicators:

```markdown
**Progress Dashboard:**

Files Scanned: 156/284 (55%)
Findings: 12 total (3 HIGH, 5 MEDIUM, 4 LOW)
Estimated Completion: 11:35 UTC (25 min remaining)
Sub-Agents: 3/4 complete
Context Used: 65K/200K tokens (32%)
```

---

## Pattern 9: Cost-Optimized Model Selection

### Purpose
Minimize API costs for long-running tasks by using appropriate model tiers for different subtasks.

### The Cost Problem

**Naive approach:** Use Opus 4.5 for everything → $100+ for large audit

**Optimized approach:** Use model hierarchy → $15-25 for same audit

### Model Tier Strategy

| Model | Cost/1M tokens | Use Cases | Avoid Using For |
|-------|----------------|-----------|-----------------|
| **Haiku** | $0.25 / $1.25 | File searches, pattern matching, glob/grep operations | Architectural decisions, complex reasoning |
| **Sonnet 4.5** | $3 / $15 | Cross-file analysis, code comprehension, moderate reasoning | Simple pattern matching, final synthesis |
| **Opus 4.5** | $15 / $75 | Final synthesis, ambiguous decisions, self-verification | Bulk file reading, simple searches |

### Task Decomposition for Cost Optimization

```markdown
## Cost-Optimized Execution Plan

### Phase 1: Discovery (Haiku - $0.50)
- Glob all Python files → file_list.json
- Grep for pattern matches → candidates.json
- List directory structures → tree.txt
**Estimated tokens:** 20K in + 5K out = 25K total
**Cost:** ~$0.50

### Phase 2: Analysis (Sonnet 4.5 - $5.00)
- Read candidate files (from Phase 1)
- Analyze architecture contradictions
- Cross-reference with ADR documents
**Estimated tokens:** 60K in + 15K out = 75K total
**Cost:** ~$5.00

### Phase 3: Synthesis (Opus 4.5 - $3.00)
- Compile all findings
- Rank severity
- Resolve ambiguities
- Write final reports
**Estimated tokens:** 30K in + 10K out = 40K total
**Cost:** ~$3.00

**Total Estimated Cost:** $8.50

Compare to Opus-only: ~$60 for same task
**Savings:** 85%
```

### Model Selection Decision Tree

```
Is this task:
├── Pattern matching / file listing?
│   └── Use Haiku
├── Needs reasoning about code logic?
│   ├── Simple (within-file)?
│   │   └── Use Sonnet
│   └── Complex (cross-file, architectural)?
│       └── Use Sonnet (or Opus for ambiguity)
└── Final decision / synthesis / self-verification?
    └── Use Opus
```

### Prompt Template for Cost Control

```markdown
## Execution Strategy with Model Selection

**CRITICAL:** Use model tiers appropriately to minimize cost

### Haiku Tasks (Fast & Cheap)
Launch these in parallel:
- [ ] Glob search: **/*.py → file_list.json
- [ ] Grep search: "openrouter" → matches.json
- [ ] Directory tree: agents/ → structure.txt

### Sonnet Tasks (Analysis & Reasoning)
After Haiku completes:
- [ ] Read files from matches.json
- [ ] Analyze architecture alignment
- [ ] Classify violations by severity

### Opus Task (Final Synthesis)
After Sonnet completes:
- [ ] Compile all findings
- [ ] Resolve ambiguous cases
- [ ] Write final report with recommendations

**Cost Estimate:** Haiku $1 + Sonnet $8 + Opus $4 = $13 total
```

---

## Pattern 10: Source of Truth Hierarchy

### Purpose
Resolve conflicts when code, documentation, and architectural decisions disagree.

### The Conflict Problem

Common scenario:
- ADR-005 says: "Use Google ADK for agents"
- Code contains: FastAPI backend implementation
- Developer comment says: "TODO: Migrate to ADK"
- README says: "We use FastAPI for routing"

**Which is correct?**

### Source Hierarchy Framework

```
Tier 1: Architectural Decisions (MUST align)
├── ADR documents (Architecture Decision Records)
├── Technical specs (PROTOCOL-*, *-DESIGN.md)
└── System design documents

Tier 2: Product Vision (SHOULD align)
├── Product requirements (PRD)
├── Feature specifications
└── Roadmap documents

Tier 3: Implementation Artifacts (Derives from Tier 1/2)
├── Source code
├── Configuration files
└── Deployment scripts

Tier 4: Explanatory Materials (Can be outdated)
├── README files
├── Code comments
├── Tutorial documentation
```

### Conflict Resolution Rules

**Rule 1:** If code contradicts Tier 1 docs, **the code is wrong**

**Rule 2:** If Tier 2 docs contradict Tier 1, **Tier 2 needs updating**

**Rule 3:** If Tier 4 docs contradict anything above, **ignore Tier 4**

### Example Conflict Resolution

```markdown
## Conflict: Which Backend Is Canonical?

**Evidence Found:**

1. **ADR-005 (Tier 1):** "We adopt Google ADK as the agent runtime"
   - Date: 2025-12-25
   - Status: Accepted

2. **Code (Tier 3):** 
   - `services/api-gateway/main.py`: FastAPI implementation
   - `main.py`: ADK implementation
   - Both configured for port 8000

3. **README (Tier 4):** "RANGER uses FastAPI for routing"
   - Last updated: 2025-11-15 (before ADR-005)

**Conflict Resolution:**

- **Tier 1 (ADR-005)** is source of truth: ADK is canonical
- **Tier 3 (code)** contradicts Tier 1: API Gateway is zombie code
- **Tier 4 (README)** is outdated: needs update

**Decision:** Remove API Gateway, update README to reflect ADK

**Justification:** 
ADR-005 was accepted after API Gateway was built. The ADR explicitly deprecates FastAPI patterns in favor of ADK. README simply wasn't updated to reflect architectural decision.
```

### Source Audit Template

```markdown
## Source of Truth Audit

For each architectural question, document:

### Question: [What is the canonical backend?]

**Tier 1 Sources (Authoritative):**
- ADR-005 Section 2: "Google ADK mandated"
- Status: Accepted 2025-12-25

**Tier 2 Sources (Vision):**
- PRODUCT-SUMMARY.md: "Multi-agent orchestration via ADK"
- Status: Aligned with Tier 1

**Tier 3 Sources (Implementation):**
- main.py: ADK implementation ✅
- services/api-gateway/main.py: FastAPI implementation ❌
- Conflict: Two backends exist

**Tier 4 Sources (Documentation):**
- README.md: Mentions FastAPI (outdated)
- Status: Contradicts Tier 1, needs update

**Resolution:**
- Canonical: main.py (ADK)
- Remove: services/api-gateway/
- Update: README.md to reflect ADK
```

### Creating New Source of Truth

When documenting architectural decisions:

```markdown
## ADR Template (Becomes Tier 1)

# ADR-XXX: [Decision Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Decision Makers:** [Team/Role]

## Context
[What led to this decision?]

## Decision
[What are we doing?]

## Consequences
### Positive
[Benefits of this approach]

### Negative
[Tradeoffs and limitations]

## Alternatives Considered
[What else did we evaluate?]

## Implementation
[How will this be realized?]
```

**After approval:** This ADR becomes Tier 1 source of truth. All code must align with it.

---

## Prompt Engineering Checklist

Use this checklist when delegating tasks to AI agents:

### Pre-Task Setup
- [ ] Identify all assumptions the agent might make
- [ ] Define source of truth hierarchy for this task
- [ ] Specify exact output format (JSON schema if machine-readable)
- [ ] Determine which subtasks can run in parallel
- [ ] Estimate context window needs (will this span multiple windows?)

### Prompt Structure
- [ ] Read [Tier 1 docs] before starting (list specific files)
- [ ] Execute tasks in parallel where possible (specify sub-agent assignments)
- [ ] Use checkpointing every N minutes (specify checkpoint format)
- [ ] Follow 3-step search protocol: Glob → Grep → Read
- [ ] Output both machine-readable JSON and human summary

### Validation Requirements
- [ ] Pre-flight validation checklist (for implementation tasks)
- [ ] Self-verification checklist (for audits/analysis)
- [ ] Escalation triggers (when to stop and report)
- [ ] Progress reporting cadence (when to send updates)

### Cost Optimization
- [ ] Specify model tiers for different subtasks
- [ ] Use Haiku for searches, Sonnet for analysis, Opus for synthesis
- [ ] Estimate total token consumption and cost

### Quality Gates
- [ ] Specify evidence requirements (line numbers, code snippets)
- [ ] Define severity ranking criteria
- [ ] Require ADR citations for violations
- [ ] Include example findings for calibration

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: "Just Start Coding"

**Bad approach:**
```markdown
Task: Fix the proof layer routing
Go ahead and implement it
```

**Why it fails:** Agent will make assumptions about system state, architecture, and dependencies without validation.

**Better approach:**
```markdown
Task: Fix the proof layer routing

First, complete Pre-Flight Validation:
1. Verify backend is running (curl localhost:8000/health)
2. Inspect actual API response format
3. Confirm which backend is canonical
4. Document findings in validation report

STOP after validation. Wait for human review before implementation.
```

### Anti-Pattern 2: Vague Success Criteria

**Bad approach:**
```markdown
Audit the codebase for issues
Report what you find
```

**Why it fails:** "Issues" is undefined. Agent will report everything or nothing.

**Better approach:**
```markdown
Audit the codebase for ADR-005 compliance violations

Success criteria:
- Find code using FastAPI instead of ADK (HIGH severity)
- Find code with monolithic prompts instead of skills (MEDIUM)
- Provide evidence: file, line number, code snippet
- Rank by severity: HIGH (blocks work) vs MEDIUM (confusing) vs LOW (cleanup)
```

### Anti-Pattern 3: No Output Format Specification

**Bad approach:**
```markdown
Find all the API conflicts and let me know
```

**Why it fails:** Agent will write prose. You'll manually extract action items.

**Better approach:**
```markdown
Find all API conflicts

Output format:
1. /audit/conflicts.json - machine-readable with exact schema [provide schema]
2. /audit/SUMMARY.md - human-readable executive summary

Each conflict must include:
- file, line, evidence, severity, recommendation
```

### Anti-Pattern 4: Sequential When Parallel Is Possible

**Bad approach:**
```markdown
1. Search for OpenRouter refs
2. After that completes, search for FastAPI refs
3. After that completes, search for hardcoded secrets
```

**Why it fails:** Takes 3x longer than necessary.

**Better approach:**
```markdown
Launch these searches IN PARALLEL:
- Agent A: OpenRouter refs
- Agent B: FastAPI refs
- Agent C: Hardcoded secrets

All agents use Haiku for speed.
Synthesis agent (Opus) waits for all three to complete.
```

### Anti-Pattern 5: No Self-Verification

**Bad approach:**
```markdown
Audit the codebase and send me the report
```

**Why it fails:** Agent will present findings without questioning them. You'll catch obvious errors.

**Better approach:**
```markdown
Audit the codebase

After completing audit, run self-verification:
- Re-read files cited in findings
- Confirm line numbers are correct
- Check that HIGH severity actually blocks work
- Answer: "What might I have missed?"

Only present findings after self-verification passes.
```

### Anti-Pattern 6: Ignoring Context Limits

**Bad approach:**
```markdown
Read all 500 files in the codebase and analyze them
```

**Why it fails:** Hits context window limit, loses progress, forgets earlier findings.

**Better approach:**
```markdown
Audit 500 files using checkpointing:

1. Process in batches of 50 files
2. Save checkpoint after each batch
3. If context refresh needed, resume from last checkpoint
4. Use structured outputs so no findings are lost
```

---

## Example Prompts

### Example 1: Pre-Flight Validation (Implementation Task)

```markdown
# Task: Implement Proof Layer UI Display

## STOP: Pre-Flight Validation Required

Before writing ANY code, complete this validation:

### Assumptions to Test

| Assumption | Validation Test | Evidence Required |
|------------|----------------|-------------------|
| Backend is running | `curl http://localhost:8000/health` | HTTP 200 response |
| Backend returns proof_layer | `curl -X POST http://localhost:8000/api/v1/chat -d '{"message":"test"}'` | JSON with proof_layer field |
| UI component exists | Read `VisualAuditOverlay.tsx` | Confirm component structure |
| Feature-ID is passed | Read click handler in UI | Confirm feature_id in request |

### Validation Report Template

Create `/docs/investigation/pre-implementation-validation.md`:

```
## Pre-Implementation Validation Report

**Task:** Implement Proof Layer UI
**Date:** 2025-12-29
**Validator:** [Your agent name]

### Test Results

1. **Backend Running**
   - Test: curl localhost:8000/health
   - Result: [✅ or ❌]
   - Evidence: [paste response]

2. **Proof Layer in Response**
   - Test: Inspect chat endpoint response
   - Result: [✅ or ❌]
   - Evidence: [paste JSON]
   
[etc for all tests]

### Go/No-Go Decision

Based on validation:
- [ ] GO - All critical assumptions validated
- [ ] REVISE - Minor issues found, plan needs updating  
- [ ] ESCALATE - Major blockers, need architectural decision

### Blockers Found
[List any issues that prevent implementation]

### Questions for Human Review
[List any ambiguities/decisions needed]
```

**After completing validation, STOP and present report. Do not proceed to implementation without human approval.**
```

### Example 2: Codebase Audit (Analysis Task)

```markdown
# Task: Audit Codebase for ADR-005 Compliance

## CRITICAL: Read These First

Before starting, read FULL contents of:
- /docs/adr/ADR-005-skills-first-architecture.md
- /docs/adr/ADR-006-google-only-llm-strategy.md

Do not proceed until you've ingested these documents.

## Execution Strategy: Parallel Operations

Launch these sub-agents SIMULTANEOUSLY:

### Agent A (Haiku): OpenRouter Reference Scan
```bash
Glob: **/*.{py,ts,json,env*}
Grep: "openrouter|anthropic|OPENROUTER_API_KEY" (case-insensitive)
Output: /audit/openrouter-refs.json
Deadline: 10 minutes
```

### Agent B (Sonnet): Architecture Mapping
```bash
Task: Find all FastAPI vs ADK implementations
Files: **/*main.py, **/server.py
Check: Which is canonical? Port conflicts?
Output: /audit/backend-analysis.md
Deadline: 20 minutes
```

### Agent C (Haiku): Skills Validation
```bash
Task: Verify agents have skills/ directories
Check: skill.md format compliance
Output: /audit/skills-compliance.json
Deadline: 15 minutes
```

### Synthesis Agent (Opus): Final Report
Wait for A, B, C completion
Compile findings, rank severity
Output: /audit/FINAL-REPORT.md + /audit/audit-report.json

## Output Requirements

### Machine-Readable: /audit/audit-report.json
Use this EXACT schema:
```json
{
  "metadata": {
    "completed_at": "2025-12-29T15:00:00Z",
    "files_scanned": 284
  },
  "critical_violations": [
    {
      "file": "path/to/file.py",
      "line": 42,
      "severity": "HIGH",
      "issue": "Description",
      "evidence": "code snippet",
      "adr_citation": "ADR-005 Section X",
      "blocks_implementation": true
    }
  ]
}
```

### Human-Readable: /audit/SUMMARY.md
Include:
- Executive summary (3-5 sentences)
- Critical blockers table
- Recommended cleanup sequence with time estimates

## Context Management

This task will span multiple windows. Checkpoint every 30 minutes to:
- /audit/checkpoint-HHMMSS.json
- /audit/findings-current.md

## Self-Verification

Before presenting findings:
- [ ] Re-read ADR-005 to confirm violations
- [ ] Verify all HIGH severity findings cite specific ADR sections
- [ ] Check for false positives (test code vs production)
- [ ] Confirm line numbers are accurate
- [ ] Answer: "What might I have missed?"

## Communication

Report progress every 15 minutes:
[HH:MM] ✅ Agent A complete - 3 OpenRouter refs found
[HH:MM] ⏳ Agent B 60% complete
[HH:MM] 🚨 BLOCKER - Port 8000 conflict found

## Estimated Cost

- Agent A,C (Haiku): $1
- Agent B (Sonnet): $6
- Synthesis (Opus): $4
- Total: ~$11

**Ready to begin? Confirm you've read ADR-005 and ADR-006 in full.**
```

### Example 3: Architecture Decision Support

```markdown
# Task: Determine Canonical Backend Architecture

## Context

We have TWO backend implementations:
1. services/api-gateway/main.py (FastAPI)
2. main.py (ADK)

Both configured for port 8000. This creates conflicts.

## Your Mission

Provide evidence-based recommendation on which to keep.

## Investigation Steps

### Step 1: Read Source of Truth Documents
- [ ] Read ADR-005-skills-first-architecture.md
- [ ] Read ADR-006-google-only-llm-strategy.md
- [ ] Read PRODUCT-SUMMARY.md

Document: What do Tier 1 docs say about backend architecture?

### Step 2: Analyze Current Implementations

**For services/api-gateway/main.py:**
- [ ] Last git commit date
- [ ] Number of imports from other code (grep for references)
- [ ] Does it implement ADR-005 patterns?
- [ ] Port configuration

**For main.py:**
- [ ] Last git commit date
- [ ] Number of imports from other code
- [ ] Does it implement ADR-005 patterns?
- [ ] Port configuration

### Step 3: Test Runtime State

```bash
# Check what's actually running
ps aux | grep python
lsof -i :8000

# Try to start both (expect one to fail)
# Document which one claims the port
```

### Step 4: Cross-Reference with Deployment

- [ ] Check Dockerfile - which backend does it start?
- [ ] Check CI/CD scripts - which backend is deployed?
- [ ] Check cloud-run.yaml - which entry point?

## Output Format

```markdown
# Backend Architecture Recommendation

## Evidence Summary

| Factor | API Gateway | ADK (main.py) |
|--------|-------------|---------------|
| ADR Alignment | [❌/✅] | [❌/✅] |
| Last Modified | [date] | [date] |
| Production Refs | [count] | [count] |
| Deployed? | [Yes/No] | [Yes/No] |

## Tier 1 Documentation Says

[Quote relevant ADR sections]

## Zombie Code Tests

**API Gateway:**
- Import Test: [PASS/FAIL]
- Git Activity: [PASS/FAIL]
- Contradiction Test: [PASS/FAIL]

**Conclusion:** [Zombie? Yes/No]

## Recommendation

**KEEP:** [Which backend]
**REMOVE:** [Which backend]

**Rationale:** [Evidence-based justification]

**Migration Steps:**
1. [Specific action]
2. [Specific action]

**Estimated Effort:** [Hours]
```

## Self-Verification

Before presenting:
- [ ] Did I actually read both main.py files?
- [ ] Did I check git history (not just assume)?
- [ ] Did I verify which one is deployed?
- [ ] Is my recommendation aligned with ADR docs?
- [ ] Did I provide migration steps, not just "remove X"?

**Present findings only after verification passes.**
```

---

## Conclusion

These patterns emerged from real-world experience preventing costly implementation failures. The core principles:

1. **Validate Before Implementing** - 30 minutes of validation saves 10 hours of rework
2. **Exploit Parallelism** - Modern AI can run multiple sub-agents concurrently
3. **Structure Everything** - Machine-readable outputs enable automation
4. **Checkpoint Long Tasks** - Don't lose progress to context limits
5. **Verify Evidence** - Read files, don't assume
6. **Self-Check** - AI agents should validate their own work
7. **Communicate Clearly** - Keep humans informed without overwhelming
8. **Optimize Costs** - Use model tiers appropriately
9. **Define Authority** - Establish source of truth hierarchy
10. **Avoid Anti-Patterns** - Learn from common failure modes

**Remember:** AI agents are powerful but not infallible. These patterns provide guardrails that preserve quality while maintaining velocity.

---

## Document Metadata

**Version:** 1.0  
**Created:** 2025-12-29  
**Last Updated:** 2025-12-29  
**Authors:** RANGER Project Team  
**License:** Internal use - jvalenzano  
**Status:** Living document - update as patterns evolve

**Feedback:** If you discover new patterns or anti-patterns, document them and submit for inclusion in future versions.