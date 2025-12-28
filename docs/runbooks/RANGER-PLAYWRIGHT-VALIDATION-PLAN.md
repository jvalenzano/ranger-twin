# RANGER Phase 4: Playwright Validation Plan

**Purpose:** Comprehensive automated testing guide for Claude Code using Playwright  
**Target:** Command Console UI + ADK Backend Integration  
**Date:** December 27, 2025  
**Executor:** Claude Code (Playwright Mode)  
**Estimated Duration:** 45-60 minutes

---

## Overview

This document provides a structured validation plan for testing RANGER's Phase 4 implementation. You (Claude Code) will navigate the UI via Playwright, execute test scenarios, and document results.

### Test Environment

| Component | URL | Status Check |
|-----------|-----|--------------|
| Frontend | http://localhost:3000 | Page loads, map renders |
| ADK Backend | https://ranger-coordinator-1058891520442.us-central1.run.app | `/health` returns 200 |
| MCP Fixtures | https://ranger-mcp-fixtures-1058891520442.us-central1.run.app | `/health` returns 200 |

### Pre-Flight Checklist

Before starting validation:

1. [ ] Navigate to http://localhost:3000
2. [ ] Verify page loads without console errors
3. [ ] Confirm ADK badge is visible (indicates `VITE_USE_ADK=true`)
4. [ ] Check connection indicator is green (backend reachable)
5. [ ] Verify 3D map renders with terrain

---

## Test Categories

| Category | Priority | Tests | Purpose |
|----------|----------|-------|---------|
| **1. Core Connectivity** | P0 | 4 | Verify frontend-backend communication |
| **2. Session Management** | P0 | 5 | Validate ADK session lifecycle |
| **3. Agent Delegation** | P0 | 8 | Test multi-agent routing |
| **4. Specialist Agents** | P1 | 16 | Validate each agent's tools |
| **5. Proof Layer** | P1 | 6 | Verify transparency features |
| **6. Error Handling** | P1 | 8 | Test graceful degradation |
| **7. UI/UX Validation** | P2 | 10 | Check visual consistency |
| **8. Performance** | P2 | 5 | Measure response times |
| **9. Edge Cases** | P2 | 8 | Stress test boundaries |

---

## Category 1: Core Connectivity (P0)

### Test 1.1: Health Check Endpoint

**Objective:** Verify ADK backend is reachable

**Steps:**
1. Open browser DevTools → Network tab
2. Refresh the page
3. Find the `/health` request

**Expected:**
- Status: 200
- Response body contains:
  ```json
  {
    "status": "healthy",
    "adk_version": "1.21.0",
    "session_backend": "in-memory"
  }
  ```

**Validation Command (via console):**
```javascript
fetch('https://ranger-coordinator-1058891520442.us-central1.run.app/health')
  .then(r => r.json())
  .then(console.log)
```

---

### Test 1.2: CORS Headers

**Objective:** Verify CORS is properly configured

**Steps:**
1. In DevTools Network tab, find `/health` request
2. Click on it and view Response Headers

**Expected Headers:**
- `access-control-allow-origin: *` (or specific origin)
- No CORS errors in console

---

### Test 1.3: Connection Status Indicator

**Objective:** Verify UI reflects backend status

**Steps:**
1. Locate the ADK badge in the chat panel header
2. Observe the connection indicator dot

**Expected:**
- Green dot = connected
- Badge text shows "ADK"

**Edge Test:** 
- Temporarily block network to backend
- Indicator should turn red/yellow

---

### Test 1.4: MCP Fixtures Server Health

**Objective:** Verify MCP server is reachable

**Validation Command:**
```javascript
fetch('https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/health')
  .then(r => r.json())
  .then(console.log)
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "ranger-mcp-fixtures",
  "fixtures": {
    "incident-metadata": true,
    "burn-severity": true,
    "trail-status": true,
    "briefing-events": true
  }
}
```

---

## Category 2: Session Management (P0)

### Test 2.1: Session Creation on First Message

**Objective:** Verify session is created before streaming

**Steps:**
1. Open DevTools → Network tab
2. Clear network log
3. Type any message in chat input
4. Press Enter

**Expected Network Sequence:**
1. `POST /apps/coordinator/users/.../sessions` → 200
2. `POST /run_sse` → 200 (EventStream)

**Verify:** Console log shows `[ADK] Session created: <uuid>`

---

### Test 2.2: Session ID Captured from Server

**Objective:** Verify client uses server-assigned session ID

**Steps:**
1. Send a message
2. In DevTools Console, run:
   ```javascript
   // This depends on how the service exposes state
   // Look for session ID in application state
   ```
3. Compare session ID in subsequent `/run_sse` requests

**Expected:**
- Session ID in `/run_sse` matches ID returned from session creation
- NOT a client-generated UUID

---

### Test 2.3: Session Persistence Across Messages

**Objective:** Verify same session used for conversation

**Steps:**
1. Send message: "Hello"
2. Wait for response
3. Send message: "What fire are we discussing?"
4. Compare session IDs in both `/run_sse` requests

**Expected:**
- Same session_id in both requests
- Second response may reference context from first (if agents maintain state)

---

### Test 2.4: New Session on Page Refresh

**Objective:** Verify fresh session after reload

**Steps:**
1. Send a message and note the session ID
2. Refresh the page (Cmd+R)
3. Send another message
4. Check the new session ID

**Expected:**
- Different session ID after refresh
- Clean conversation state

---

### Test 2.5: Session Timeout Handling

**Objective:** Verify graceful handling of expired sessions

**Steps:**
1. Send a message
2. Wait 10+ minutes (or simulate timeout)
3. Send another message

**Expected:**
- If session expired, new session created automatically
- No error shown to user (graceful recovery)

---

## Category 3: Agent Delegation (P0)

### Test 3.1: Coordinator Identifies Itself

**Objective:** Verify coordinator responds to meta-queries

**Input:** "What agents do you have available?"

**Expected Response Contains:**
- List of specialist agents (burn-analyst, trail-assessor, cruising-assistant, nepa-advisor)
- Brief description of each agent's purpose

---

### Test 3.2: Delegation to Burn Analyst

**Objective:** Verify burn-related queries route correctly

**Input:** "What is the burn severity for cedar-creek-2022?"

**Expected:**
- Coordinator announces delegation: "I am transferring you to the burn analyst..."
- Burn Analyst responds with severity data
- Response includes confidence score

**SSE Events to Observe:**
1. `functionCall: delegate_query`
2. `functionCall: transfer_to_agent` (target: burn_analyst)
3. `author: burn_analyst` in subsequent events

---

### Test 3.3: Delegation to Trail Assessor

**Objective:** Verify trail-related queries route correctly

**Input:** "What trails need to be closed after Cedar Creek fire?"

**Expected:**
- Delegation to trail-assessor
- Response includes trail names and closure recommendations
- Risk scores visible

---

### Test 3.4: Delegation to Cruising Assistant

**Objective:** Verify timber-related queries route correctly

**Input:** "What is the salvage potential for cedar-creek-2022?"

**Expected:**
- Delegation to cruising-assistant
- Response includes timber volume estimates
- Salvage viability assessment

---

### Test 3.5: Delegation to NEPA Advisor

**Objective:** Verify compliance-related queries route correctly

**Input:** "What NEPA pathway should we use for Cedar Creek recovery?"

**Expected:**
- Delegation to nepa-advisor
- Response recommends CE, EA, or EIS pathway
- Rationale provided

---

### Test 3.6: Ambiguous Query Handling

**Objective:** Verify coordinator handles unclear requests

**Input:** "Help me with Cedar Creek"

**Expected:**
- Coordinator asks clarifying question, OR
- Coordinator provides overview and offers to delegate

---

### Test 3.7: Multi-Domain Query

**Objective:** Verify coordinator can synthesize across agents

**Input:** "Give me a complete recovery briefing for Cedar Creek including burn severity, trail damage, and compliance requirements."

**Expected:**
- Multiple agent delegations (sequential or parallel)
- Final synthesis combining insights from all specialists
- Proof layer shows reasoning from each agent

---

### Test 3.8: Return to Coordinator After Specialist

**Objective:** Verify conversation can continue after delegation

**Steps:**
1. Send burn severity query (routes to burn-analyst)
2. Wait for response
3. Send: "Now what about the trails?"

**Expected:**
- Coordinator receives second query
- Routes to trail-assessor
- Conversation context maintained

---

## Category 4: Specialist Agent Tools (P1)

### 4A: Burn Analyst Tools

#### Test 4A.1: assess_severity Tool

**Input:** "Assess the burn severity for cedar-creek-2022"

**Expected Response Contains:**
- Total acreage (127,341 acres)
- Severity breakdown (High/Moderate/Low percentages)
- Sector-by-sector analysis
- Confidence score (92%+)
- Data source citation (MTBS, Sentinel-2)

---

#### Test 4A.2: classify_mtbs Tool

**Input:** "Classify the MTBS data for Cedar Creek"

**Expected Response Contains:**
- MTBS class assignments (1-4)
- dNBR threshold explanations
- Classification methodology reference

---

#### Test 4A.3: validate_boundary Tool

**Input:** "Validate the fire boundary for cedar-creek-2022"

**Expected Response Contains:**
- Geometry validity check
- Acreage comparison (reported vs calculated)
- Boundary source reference

---

#### Test 4A.4: Burn Analyst with Invalid Fire ID

**Input:** "What is the burn severity for nonexistent-fire-2025?"

**Expected:**
- Error handled gracefully
- Message indicates fire not found
- Suggestions offered (check fire ID, available fires)

---

### 4B: Trail Assessor Tools

#### Test 4B.1: classify_damage Tool

**Input:** "Classify the trail damage for cedar-creek-2022"

**Expected Response Contains:**
- USFS damage types (I-IV)
- List of affected trails
- Damage descriptions

---

#### Test 4B.2: evaluate_closure Tool

**Input:** "Which trails should be closed after Cedar Creek?"

**Expected Response Contains:**
- Trail names with OPEN/CLOSED status
- Risk scores (0-100)
- Hazard factors (debris flow, erosion, etc.)

---

#### Test 4B.3: prioritize_trails Tool

**Input:** "Prioritize trail repairs with a $200,000 budget"

**Expected Response Contains:**
- Ranked trail list
- Cost estimates
- Budget allocation recommendations
- Cost-effectiveness scores

---

#### Test 4B.4: Waldo Lake Trail Specific Query

**Input:** "What is the status of Waldo Lake Trail after Cedar Creek?"

**Expected:**
- HIGH risk classification
- CLOSED recommendation
- Specific damage details

---

### 4C: Cruising Assistant Tools

#### Test 4C.1: assess_salvage Tool

**Input:** "Assess salvage potential for cedar-creek-2022"

**Expected Response Contains:**
- Salvage viability by plot
- Deterioration timelines
- Priority rankings

---

#### Test 4C.2: estimate_volume Tool

**Input:** "Estimate timber volume for the high severity sectors"

**Expected Response Contains:**
- MBF (thousand board feet) values
- Species breakdown
- Defect deductions applied

---

#### Test 4C.3: recommend_methodology Tool

**Input:** "What cruise methodology should we use for salvage assessment?"

**Expected Response Contains:**
- Recommended protocol (variable plot, fixed plot, etc.)
- BAF recommendations
- Stand characteristic considerations

---

#### Test 4C.4: Species-Specific Query

**Input:** "How long do we have before blue stain affects Douglas-fir salvage?"

**Expected:**
- Species-specific decay timeline (12 months for PSME)
- Urgency recommendation

---

### 4D: NEPA Advisor Tools

#### Test 4D.1: determine_pathway Tool

**Input:** "What NEPA pathway for post-fire recovery at Cedar Creek?"

**Expected Response Contains:**
- Pathway recommendation (likely EA for 127k acres)
- Decision factors
- Rationale for choice over alternatives

---

#### Test 4D.2: estimate_timeline Tool

**Input:** "What is the compliance timeline for Cedar Creek recovery?"

**Expected Response Contains:**
- Milestone dates
- Required review periods
- Critical path items

---

#### Test 4D.3: generate_checklist Tool

**Input:** "Generate a NEPA checklist for post-fire salvage"

**Expected Response Contains:**
- Documentation requirements
- Consultation needs
- Public comment requirements

---

#### Test 4D.4: Categorical Exclusion Query

**Input:** "Can we use a Categorical Exclusion for Cedar Creek?"

**Expected:**
- Analysis of CE applicability
- Likely "No" due to acreage/complexity
- Explanation of CE limitations

---

## Category 5: Proof Layer Validation (P1)

### Test 5.1: Confidence Score Display

**Objective:** Verify confidence scores are visible

**Input:** "What is the burn severity for cedar-creek-2022?"

**Expected:**
- Response shows "94% confidence" or similar
- Color-coded (green for high, amber for moderate)

---

### Test 5.2: Reasoning Chain Visibility

**Objective:** Verify reasoning steps are accessible

**Steps:**
1. Send burn severity query
2. Look for "Show Reasoning" toggle or expandable section
3. Click to expand

**Expected:**
- Step-by-step logic visible:
  1. "Loaded 8 sectors for Cedar Creek Fire..."
  2. "CORE-1: dNBR 0.81 >= 0.66 -> HIGH severity..."
  3. "High severity dominates (63.6%)..."

---

### Test 5.3: Citation Display

**Objective:** Verify data sources are cited

**Input:** "Assess burn severity for Cedar Creek"

**Expected:**
- Citation chips visible (e.g., `[MTBS]`, `[Sentinel-2]`)
- Reference IDs when applicable
- Imagery dates

---

### Test 5.4: Agent Attribution

**Objective:** Verify which agent produced each insight

**Input:** Multi-agent query

**Expected:**
- Each response section shows agent name
- Skill ID visible (e.g., `[Skill: Burn Analysis]`)

---

### Test 5.5: Low Confidence Handling

**Objective:** Verify low-confidence warnings

**Input:** Query that produces uncertain results

**Expected:**
- Lower confidence score displayed
- Visual warning (amber/red color)
- Recommendation to verify with additional sources

---

### Test 5.6: Proof Layer Persistence

**Objective:** Verify proof data doesn't disappear

**Steps:**
1. Send query with proof layer
2. Scroll up in chat
3. Return to the response

**Expected:**
- Proof layer still accessible
- Reasoning chain still expandable

---

## Category 6: Error Handling (P1)

### Test 6.1: Network Interruption

**Objective:** Verify graceful handling of network loss

**Steps:**
1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Send a message

**Expected:**
- Loading indicator appears
- Error message shown (not crash)
- Suggestion to retry

---

### Test 6.2: Backend Timeout

**Objective:** Verify handling of slow responses

**Steps:**
1. Send complex query
2. If response takes >30s, observe behavior

**Expected:**
- Loading indicator persists
- Eventually shows timeout message OR completes
- No infinite spinner

---

### Test 6.3: Invalid JSON Response

**Objective:** Verify handling of malformed data

**Note:** This may require backend modification to test properly

**Expected:**
- Error caught and displayed gracefully
- Chat remains functional

---

### Test 6.4: Rate Limit Handling

**Objective:** Verify handling of API rate limits

**Steps:**
1. Send 5+ rapid queries in succession
2. Observe responses

**Expected:**
- Rate limit message if hit
- Retry logic activates
- User informed of delay

---

### Test 6.5: Empty Response Handling

**Input:** Query that produces no results

**Expected:**
- Message indicates no data found
- Not a crash or blank response
- Suggestions offered

---

### Test 6.6: Special Characters in Input

**Input:** "What's the burn severity for <script>alert('xss')</script>?"

**Expected:**
- Input sanitized
- No script execution
- Query processed normally or rejected safely

---

### Test 6.7: Very Long Input

**Input:** 5000+ character message

**Expected:**
- Either processed or gracefully rejected
- Character limit warning if applicable
- No crash

---

### Test 6.8: Backend Unavailable

**Objective:** Verify behavior when Cloud Run is down

**Steps:**
1. Modify VITE_ADK_URL to invalid endpoint
2. Refresh and send message

**Expected:**
- Connection indicator shows disconnected
- Error message displayed
- Option to retry or switch to legacy mode

---

## Category 7: UI/UX Validation (P2)

### Test 7.1: Chat Panel Layout

**Objective:** Verify chat panel renders correctly

**Checks:**
- [ ] Input field visible at bottom
- [ ] Send button functional
- [ ] Messages display with proper formatting
- [ ] Scroll works for long conversations
- [ ] ADK badge visible in header

---

### Test 7.2: Map Panel Layout

**Objective:** Verify map renders correctly

**Checks:**
- [ ] 3D terrain loads
- [ ] Fire markers visible
- [ ] Zoom/pan controls work
- [ ] No rendering errors

---

### Test 7.3: Briefing Panel Layout

**Objective:** Verify briefing panel displays events

**Checks:**
- [ ] Panel visible (right side or tab)
- [ ] Events stream in during queries
- [ ] Color coding matches event types
- [ ] Expandable sections work

---

### Test 7.4: Responsive Design (Tablet)

**Objective:** Verify layout at 768px width

**Steps:**
1. Open DevTools → Device toolbar
2. Set viewport to 768x1024

**Checks:**
- [ ] Layout adapts (panels stack or collapse)
- [ ] Chat remains functional
- [ ] Map remains visible

---

### Test 7.5: Dark Mode Consistency

**Objective:** Verify dark mode aesthetic

**Checks:**
- [ ] Background is dark (slate-900 or similar)
- [ ] Text is readable (light colors)
- [ ] No jarring bright elements
- [ ] Glassmorphism effects present

---

### Test 7.6: Loading States

**Objective:** Verify loading indicators

**Steps:**
1. Send a message
2. Observe loading state

**Checks:**
- [ ] Loading indicator appears immediately
- [ ] Animated (pulse or spinner)
- [ ] Disappears when response arrives

---

### Test 7.7: ADK Mode Toggle

**Objective:** Verify mode switching works

**Steps:**
1. Find ADK/Legacy toggle
2. Click to switch modes
3. Verify badge changes

**Checks:**
- [ ] Toggle is clickable
- [ ] Mode indicator updates
- [ ] Subsequent queries use correct service

---

### Test 7.8: Keyboard Navigation

**Objective:** Verify keyboard accessibility

**Checks:**
- [ ] Tab navigates through interactive elements
- [ ] Enter submits chat input
- [ ] Escape closes modals (if any)

---

### Test 7.9: Message Formatting

**Objective:** Verify markdown rendering in responses

**Expected in responses:**
- Bold text renders bold
- Lists render properly
- Code blocks formatted
- Tables render (if applicable)

---

### Test 7.10: Timestamp Display

**Objective:** Verify timestamps are shown

**Checks:**
- [ ] Messages show timestamp
- [ ] Format is readable (HH:MM or relative)
- [ ] UTC indicator present (per tactical futurism spec)

---

## Category 8: Performance Testing (P2)

### Test 8.1: Initial Page Load Time

**Objective:** Measure cold start performance

**Steps:**
1. Open DevTools → Performance tab
2. Hard refresh (Cmd+Shift+R)
3. Measure time to interactive

**Target:** < 3 seconds

---

### Test 8.2: First Query Response Time

**Objective:** Measure time to first response

**Steps:**
1. Start timer when sending query
2. Stop when first SSE event received

**Target:** < 5 seconds (includes Cloud Run cold start if applicable)

---

### Test 8.3: Streaming Latency

**Objective:** Measure SSE event delivery

**Steps:**
1. Send query
2. Observe gap between SSE events

**Expected:** 
- Events stream in < 500ms intervals
- No long pauses between events

---

### Test 8.4: Memory Usage

**Objective:** Verify no memory leaks

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Send 10 queries
4. Take another snapshot
5. Compare

**Expected:**
- Memory growth < 50MB
- No runaway growth

---

### Test 8.5: Concurrent Connections

**Objective:** Test multiple simultaneous users (if possible)

**Steps:**
1. Open app in 3 browser tabs
2. Send queries simultaneously from each

**Expected:**
- All tabs receive responses
- No cross-talk between sessions

---

## Category 9: Edge Cases (P2)

### Test 9.1: Empty Input

**Steps:**
1. Click send with empty input field
2. Press Enter with empty input

**Expected:**
- Input rejected
- No request sent
- Helpful message or disabled button

---

### Test 9.2: Rapid Fire Queries

**Steps:**
1. Send 5 messages in < 5 seconds
2. Observe responses

**Expected:**
- All queries processed (possibly queued)
- Responses arrive in order
- No dropped messages

---

### Test 9.3: Unicode Input

**Input:** "🔥 What's the burn severity for Cedar Creek? ¿Cómo está?"

**Expected:**
- Unicode processed correctly
- No encoding errors
- Response renders properly

---

### Test 9.4: SQL Injection Attempt

**Input:** "'; DROP TABLE sessions; --"

**Expected:**
- Input sanitized
- No database impact
- Query processed safely or rejected

---

### Test 9.5: Conversation Length Limit

**Steps:**
1. Send 20+ messages in one session
2. Observe behavior

**Expected:**
- Conversation history maintained
- Performance remains acceptable
- No truncation without warning

---

### Test 9.6: Browser Back Button

**Steps:**
1. Send a few messages
2. Press browser back button
3. Press forward button

**Expected:**
- Navigation handled gracefully
- Chat state preserved (or clearly reset)

---

### Test 9.7: Page Visibility Change

**Steps:**
1. Send a query
2. Switch to another tab during response
3. Return to RANGER tab

**Expected:**
- Response completed correctly
- No missed events
- UI updates properly

---

### Test 9.8: Copy/Paste Response

**Steps:**
1. Get a response with formatting
2. Select and copy response text
3. Paste into text editor

**Expected:**
- Text copies cleanly
- Formatting preserved (or degrades gracefully)

---

## Test Execution Template

For each test, document results using this format:

```markdown
### Test [ID]: [Name]

**Status:** ✅ Pass | ❌ Fail | ⚠️ Partial | ⏭️ Skipped

**Executed:** [Timestamp]

**Steps Performed:**
1. [What you did]
2. [What you did]

**Observed Result:**
[What actually happened]

**Expected Result:**
[What should have happened]

**Evidence:**
- Screenshot: [filename or description]
- Console log: [relevant output]
- Network: [relevant requests]

**Notes:**
[Any additional observations, bugs found, suggestions]
```

---

## Results Summary Template

After completing all tests, fill in this summary:

```markdown
## RANGER Phase 4 Validation Results

**Executed by:** Claude Code (Playwright)
**Date:** [Date]
**Duration:** [Time]

### Category Results

| Category | Total | Pass | Fail | Skip | Rate |
|----------|-------|------|------|------|------|
| 1. Core Connectivity | 4 | | | | |
| 2. Session Management | 5 | | | | |
| 3. Agent Delegation | 8 | | | | |
| 4. Specialist Agents | 16 | | | | |
| 5. Proof Layer | 6 | | | | |
| 6. Error Handling | 8 | | | | |
| 7. UI/UX | 10 | | | | |
| 8. Performance | 5 | | | | |
| 9. Edge Cases | 8 | | | | |
| **TOTAL** | **70** | | | | |

### Critical Issues Found

| ID | Severity | Description | Steps to Reproduce |
|----|----------|-------------|-------------------|
| | P0/P1/P2 | | |

### Recommendations

1. [Recommendation]
2. [Recommendation]

### Sign-Off

- [ ] All P0 tests pass
- [ ] All P1 tests pass (or have documented workarounds)
- [ ] No critical bugs blocking demo
- [ ] Performance targets met
```

---

## Playwright-Specific Tips

### Useful Playwright Commands

```javascript
// Navigate
await page.goto('http://localhost:3000');

// Wait for element
await page.waitForSelector('[data-testid="chat-input"]');

// Type in input
await page.fill('[data-testid="chat-input"]', 'Your message here');

// Click button
await page.click('[data-testid="send-button"]');

// Wait for response
await page.waitForSelector('.agent-response', { timeout: 30000 });

// Get text content
const text = await page.textContent('.agent-response');

// Take screenshot
await page.screenshot({ path: 'screenshot.png' });

// Check network requests
page.on('response', response => {
  console.log(response.url(), response.status());
});

// Execute in browser context
const result = await page.evaluate(() => {
  return document.querySelector('.some-element').innerText;
});
```

### Handling SSE Streams

```javascript
// Listen for SSE events via page evaluation
const events = await page.evaluate(async () => {
  const response = await fetch('/run_sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ /* request */ })
  });
  
  const reader = response.body.getReader();
  const events = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = new TextDecoder().decode(value);
    events.push(text);
  }
  
  return events;
});
```

---

## Appendix: Test Data Reference

### Cedar Creek Fire (cedar-creek-2022)

| Property | Value |
|----------|-------|
| Fire ID | cedar-creek-2022 |
| Total Acres | 127,341 |
| High Severity | 63.6% |
| Sectors | 8 |
| State | Oregon |

### Expected Tool Responses

| Tool | Key Field | Expected Value |
|------|-----------|----------------|
| assess_severity | confidence | 0.92 |
| assess_severity | high_severity_pct | 63.6 |
| get_trail_status | waldo_lake_risk | HIGH |
| assess_salvage | urgency | HIGH |
| determine_pathway | recommended | EA |

---

**Document Version:** 1.0  
**Created:** December 27, 2025  
**Author:** RANGER CTO  
**For:** Claude Code (Playwright Executor)
