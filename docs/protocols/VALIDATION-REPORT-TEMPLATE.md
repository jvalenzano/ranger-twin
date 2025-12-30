# Pre-Implementation Validation Report

**Plan Name:** [Name of implementation plan being validated]  
**Date:** [YYYY-MM-DD]  
**Agent:** [Claude Code / Sub-agent Name / Human Name]  
**Validation Session:** [N]

---

## Executive Summary

- **Assumptions Tested:** [N]
- **Assumptions Validated:** [N]
- **Assumptions Invalidated:** [N]
- **Architectural Ambiguities Found:** [N]
- **Recommendation:** [PROCEED / REVISE PLAN / ESCALATE]

**One-sentence summary:** [Brief statement of key finding]

---

## Detailed Findings

### 1. Runtime State Verification

#### [Service/Component Name]
- **Assumption:** [What the plan assumed]
- **Test:** `[Command used to test]`
- **Result:** [VALIDATED / INVALIDATED / AMBIGUOUS]
- **Evidence:**
  ```
  [Command output]
  ```
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

#### [Service/Component Name]
- **Assumption:** [What the plan assumed]
- **Test:** `[Command used to test]`
- **Result:** [VALIDATED / INVALIDATED / AMBIGUOUS]
- **Evidence:**
  ```
  [Command output]
  ```
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

---

### 2. Configuration Verification

#### [Configuration Item]
- **Assumption:** [What the plan assumed]
- **Test:** `[Command used to test]`
- **Result:** [VALIDATED / INVALIDATED / AMBIGUOUS]
- **Evidence:**
  ```
  [File contents or command output]
  ```
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

---

### 3. Component Behavior Testing

#### [Feature/Component Tested]
- **Assumption:** [What the plan assumed]
- **Test:** [Description of manual test performed]
- **Result:** [VALIDATED / INVALIDATED / AMBIGUOUS]
- **Evidence:**
  - [Screenshot path or description]
  - [Network request/response details]
  - [Error messages observed]
- **Impact on Plan:** [None / Requires revision / Blocks implementation]

---

### 4. Architectural Clarity

#### [Ambiguity Description]
- **Question:** [What architectural question arose?]
- **Investigation:** [What did you investigate?]
- **Findings:** [What did you discover?]
- **Options:** [List 2-3 possible paths forward]
- **Impact on Plan:** [Requires human decision / Can proceed with clarification]

---

## Critical Discoveries

### Discovery 1: [Title]
**What:** [Description of what you found]

**Why It Matters:** [Impact on implementation plan]

**Recommendation:** [How should this be handled?]

**Evidence:** [Link to logs, screenshots, command output]

---

### Discovery 2: [Title]
**What:** [Description of what you found]

**Why It Matters:** [Impact on implementation plan]

**Recommendation:** [How should this be handled?]

**Evidence:** [Link to logs, screenshots, command output]

---

## Revised Assumptions (Post-Validation)

After validation, we now know:

### ✅ Validated Assumptions
1. [Assumption that proved correct]
2. [Assumption that proved correct]

### ❌ Invalidated Assumptions
1. [Assumption that proved incorrect]
   - **Why:** [What evidence disproved it]
   - **Impact:** [How this affects the plan]

### ⚠️ Ambiguous Assumptions
1. [Assumption requiring human decision]
   - **Why:** [What makes this ambiguous]
   - **Options:** [Possible resolutions]

---

## Impact on Implementation Plan

### Changes Required

#### [Section of Plan]
- **Original approach:** [What plan proposed]
- **Why it won't work:** [Validation finding]
- **Revised approach:** [New proposal]
- **Effort impact:** [Time/complexity change]

#### [Section of Plan]
- **Original approach:** [What plan proposed]
- **Why it won't work:** [Validation finding]
- **Revised approach:** [New proposal]
- **Effort impact:** [Time/complexity change]

---

### Plan Sections That Remain Valid

The following sections are unaffected by validation findings:

1. [Section name] - [Brief justification]
2. [Section name] - [Brief justification]

---

## Recommendations

### Primary Recommendation: [PROCEED / REVISE / ESCALATE]

**If PROCEED:**
- Validation confirmed all critical assumptions
- Implementation plan is sound
- Ready to begin [Session/Phase Name]
- No blocking issues identified

**If REVISE:**
The plan needs the following revisions:
1. [Specific revision needed]
2. [Specific revision needed]

**Estimated impact on timeline:** [Hours/days added or removed]

Request approval for revised plan before proceeding.

**If ESCALATE:**
The following requires strategic decision:

**Architectural Ambiguity:** [Describe the ambiguity]

**Options:**
1. **Option A:** [Description]
   - Pros: [List]
   - Cons: [List]
   - Effort: [Estimate]

2. **Option B:** [Description]
   - Pros: [List]
   - Cons: [List]
   - Effort: [Estimate]

3. **Option C:** [Description]
   - Pros: [List]
   - Cons: [List]
   - Effort: [Estimate]

**Recommendation:** [Which option and why]

Request strategic guidance before proceeding.

---

## Next Steps

### Immediate Actions (If Approved)
1. [First action to take]
2. [Second action to take]
3. [Third action to take]

### Blocked Pending (If Revision/Escalation Required)
- [ ] [Item requiring resolution]
- [ ] [Item requiring resolution]

---

## Appendices

### Appendix A: Command Output Logs

#### [Command Name]
```bash
$ [command]
[full output]
```

#### [Command Name]
```bash
$ [command]
[full output]
```

---

### Appendix B: Screenshots/Evidence

- [Screenshot 1: Description] - `path/to/screenshot.png`
- [Screenshot 2: Description] - `path/to/screenshot.png`
- [HAR File: Network trace] - `path/to/trace.har`

---

### Appendix C: Configuration Files

#### `.env.local`
```
[relevant configuration]
```

#### `config.yaml`
```yaml
[relevant configuration]
```

---

### Appendix D: Investigation Trail

**Dead ends explored (to prevent future repetition):**

1. **[Hypothesis]**
   - Tested: [What was tried]
   - Result: [Why it didn't work]
   - Learning: [What this teaches us]

2. **[Hypothesis]**
   - Tested: [What was tried]
   - Result: [Why it didn't work]
   - Learning: [What this teaches us]

---

## Validation Checklist (Completed)

- [x] Runtime state verified
- [x] Configuration verified
- [x] Component behavior tested
- [x] Architectural ambiguities identified
- [x] Evidence documented
- [x] Impact on plan assessed
- [x] Recommendation provided
- [ ] CTO approval received

---

**Validation completed by:** [Agent/Human Name]  
**Date submitted:** [YYYY-MM-DD HH:MM UTC]  
**Awaiting approval from:** RANGER CTO (Jason Valenzano)
