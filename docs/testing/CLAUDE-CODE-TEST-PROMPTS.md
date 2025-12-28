# RANGER Test Automation Prompt

> **Purpose:** Structured prompts for Claude Code browser-based testing
> **Prerequisite:** Claude Code with browser tools enabled

---

## Test Suite 1: Smoke Test (2 minutes)

Copy this entire block into Claude Code:

```
I need you to perform a smoke test on the deployed RANGER application.

**URL:** https://ranger-console-1058891520442.us-central1.run.app
**Auth:** Basic Auth - username: ranger, password: CedarCreek2025!

Execute these checks and report pass/fail:

1. NAVIGATION
   - [ ] Page loads without errors
   - [ ] Mission Control view renders (dark background, map visible)
   - [ ] At least one fire card visible in sidebar

2. MAP
   - [ ] Map tiles load (not blank/grey)
   - [ ] Fire markers visible on map
   - [ ] Map is interactive (can pan/zoom)

3. INTERACTION
   - [ ] Click any fire card "Enter" button
   - [ ] Tactical view loads (map zooms, sidebar changes)
   - [ ] Chat icon/FAB is visible

Report format:
- ✅ Pass: [description]
- ❌ Fail: [description + screenshot if possible]
- ⚠️ Partial: [description]
```

---

## Test Suite 2: Chat Functionality (5 minutes)

```
Continue testing RANGER. Now testing chat functionality.

**Prerequisite:** Already in Tactical View (or navigate there first)

Execute these chat tests:

1. BASIC QUERY
   - Open chat panel (click chat icon)
   - Send message: "What is the burn severity for Cedar Creek?"
   - [ ] Loading indicator appears
   - [ ] Response arrives within 30 seconds
   - [ ] Response mentions severity percentages
   - [ ] Response mentions acreage

2. MULTI-AGENT QUERY
   - Send message: "Give me a recovery briefing"
   - [ ] Response includes burn analysis content
   - [ ] Response includes trail damage content
   - [ ] Response includes timber value content
   - [ ] Response includes NEPA guidance
   
3. EDGE CASES
   - Send empty message (just spaces)
   - [ ] Appropriate handling (no crash)
   - Send: "asdfghjkl random gibberish"
   - [ ] Graceful response or error message

Capture the full text of one successful agent response for review.
```

---

## Test Suite 3: Feature Interaction (5 minutes)

```
Continue testing RANGER. Now testing map feature interaction.

**Prerequisite:** In Tactical View with Cedar Creek loaded

Execute these feature tests:

1. BURN SEVERITY POLYGONS
   - Click on a colored burn severity zone on the map
   - [ ] Popup appears with zone information
   - [ ] Severity level shown (Low/Moderate/High)
   - [ ] Sector name displayed

2. TRAIL DAMAGE POINTS
   - Locate and click a trail marker (circle icon)
   - [ ] Popup shows trail name
   - [ ] Damage severity displayed
   - [ ] "Quick Query" chips appear below popup

3. QUICK QUERY CHIPS
   - With trail popup open, click "NFS Database" chip
   - [ ] Query auto-populates in chat
   - [ ] Query contains trail name from popup
   - Submit the query
   - [ ] Response received about trail history

Screenshot each popup type for documentation.
```

---

## Test Suite 4: Proof Layer Validation (3 minutes)

```
Continue testing RANGER. Now testing the Proof Layer transparency features.

**Prerequisite:** Have triggered at least one chat query

Execute these transparency tests:

1. LOCATE INSIGHT PANEL
   - Look for InsightPanel on right side of tactical view
   - [ ] At least one insight card visible
   - [ ] Card shows source agent (Burn Analyst, etc.)

2. CONFIDENCE INDICATOR
   - [ ] Confidence percentage visible (e.g., "92%")
   - [ ] Color-coded appropriately (green/amber/red)

3. REASONING CHAIN
   - Click "Show Reasoning" or expand accordion
   - [ ] Step-by-step reasoning visible
   - [ ] Steps form logical progression
   - [ ] Citations listed (MTBS, FSM, etc.)

4. CITATION LINKS
   - [ ] Citations are clickable (or show source info on hover)
   - [ ] Citation format includes source type and ID

Document the reasoning chain steps for one insight.
```

---

## Test Suite 5: Navigation Flow (3 minutes)

```
Continue testing RANGER. Now testing navigation and state management.

Execute these navigation tests:

1. TACTICAL → MISSION CONTROL
   - From Tactical View, click back/breadcrumb to Mission Control
   - [ ] Mission Control loads correctly
   - [ ] All fire cards still visible
   - [ ] No errors in console

2. MISSION CONTROL → DIFFERENT FIRE
   - Click "Enter" on a different fire card (if available)
   - [ ] Tactical view loads for new fire
   - [ ] Map shows different location
   - [ ] Previous fire context cleared

3. BROWSER NAVIGATION
   - Use browser back button
   - [ ] Previous view loads
   - [ ] No broken state

4. DIRECT URL (if applicable)
   - Navigate to /lab/forensic-insight
   - [ ] Lab view loads (or appropriate 404)

Report any console errors observed during navigation.
```

---

## Test Suite 6: Performance Check (2 minutes)

```
Perform a performance assessment of RANGER.

**URL:** https://ranger-console-1058891520442.us-central1.run.app

Measure and report:

1. INITIAL LOAD
   - Clear cache, navigate to URL
   - [ ] Time to first meaningful paint: ___ seconds
   - [ ] Time to interactive: ___ seconds

2. MAP PERFORMANCE  
   - Pan and zoom aggressively
   - [ ] Frame rate assessment (smooth/choppy)
   - [ ] Any tile loading delays

3. CHAT RESPONSE TIME
   - Send: "What is burn severity?"
   - [ ] Response time: ___ seconds

4. TRANSITION PERFORMANCE
   - Fire card click → tactical view
   - [ ] Animation smoothness (smooth/choppy)

Target benchmarks:
- Initial load: < 3 seconds
- Chat response: < 10 seconds
- Animations: 60fps (smooth)
```

---

## Consolidated Test Report Template

After completing all test suites, generate this report:

```
# RANGER Validation Report
Date: [DATE]
Tester: Claude Code (automated)
URL: https://ranger-console-1058891520442.us-central1.run.app

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Partial: XX

## Critical Issues
[List any blocking issues]

## Test Results

### Smoke Test
[Results]

### Chat Functionality
[Results]

### Feature Interaction
[Results]

### Proof Layer
[Results]

### Navigation
[Results]

### Performance
[Results]

## Recommendations
[Suggested fixes or improvements]

## Screenshots
[Attach or describe key screenshots]
```

---

## Manual Testing Variant

If browser automation isn't available, here's a condensed checklist for human testing:

**5-Minute Manual Smoke Test:**

1. Navigate to URL, enter credentials
2. Verify: Map loads, fire cards visible
3. Click: Any fire card "Enter"
4. Verify: Tactical view loads
5. Open chat, send: "recovery briefing"
6. Verify: Multi-agent response arrives
7. Check: Insight panel shows reasoning
8. Navigate back to Mission Control
9. Verify: No errors, state preserved

**Pass Criteria:**
- All 9 steps complete without errors
- Response time under 15 seconds
- No console errors visible

---

## Issue Logging Protocol

When you discover any issue during testing, log it to `docs/testing/PUNCH-LIST.md` using this format:

```
### [PL-XXX] Short Title
- **Type:** Bug | UX | Enhancement | Performance
- **Severity:** P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Low)
- **Location:** View → Component
- **Description:** What's wrong
- **Expected:** What should happen
- **Screenshot:** (reference if available)
- **Status:** Open
```

**Severity Guide:**
- **P0:** App crashes, data loss, security issue
- **P1:** Major feature broken, blocking demo
- **P2:** Feature works but has noticeable issues
- **P3:** Minor visual/cosmetic issues

**After each test suite, append any discovered issues to the punch list before proceeding.**
