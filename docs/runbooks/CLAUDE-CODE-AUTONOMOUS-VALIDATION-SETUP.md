# Claude Code Autonomous Validation Setup Guide

**Purpose:** Configure Claude Code for autonomous, programmatic validation of RANGER Phase 4  
**Target:** Hands-free execution of the 70-test validation plan  
**Architecture:** Chrome integration + Subagents for context management  
**Date:** December 27, 2025

---

## Executive Summary

Based on the latest Claude Code documentation and best practices, here's the optimal architecture for autonomous validation:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (Main Claude Code)               │
│  • Loads validation plan                                         │
│  • Manages test execution flow                                   │
│  • Aggregates results                                            │
│  • Handles failures/retries                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  @browser-tester │  │ @api-validator  │  │ @report-writer  │
│  (Subagent)      │  │ (Subagent)      │  │ (Subagent)      │
│                  │  │                  │  │                  │
│  • Chrome control │  │ • Health checks │  │ • Summarize     │
│  • UI navigation  │  │ • SSE testing   │  │ • Format output │
│  • Screenshots    │  │ • Session mgmt  │  │ • Generate MD   │
│  • Form filling   │  │ • Agent queries │  │                  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Part 1: Prerequisites

### 1.1 Version Requirements

```bash
# Check Claude Code version (need 2.0.73+)
claude --version

# Update if needed
npm update -g @anthropic-ai/claude-code

# Verify Chrome extension version (need 1.0.36+)
# Check in chrome://extensions
```

### 1.2 Chrome Extension Setup

1. **Install Claude in Chrome extension:**
   - Go to: https://chromewebstore.google.com/detail/claude-in-chrome
   - Click "Add to Chrome"
   - Pin extension to toolbar

2. **Authenticate:**
   - Click extension icon
   - Log in with your Claude Max/Pro account
   - Grant necessary permissions

3. **Connect to Claude Code:**
   ```bash
   # Run this to verify connection
   claude --chrome
   
   # Or use /chrome command inside Claude Code
   /chrome
   ```

4. **Verify connection:**
   ```bash
   # Quick test - should open browser and perform action
   claude -p "Open Chrome and navigate to http://localhost:3000, then take a screenshot"
   ```

---

## Part 2: Create Validation Subagents

Subagents solve the **context window problem** by running in isolated contexts. For a 70-test validation plan, we'll create three specialized subagents.

### 2.1 Create Project Agent Directory

```bash
mkdir -p .claude/agents
```

### 2.2 Browser Tester Subagent

Create `.claude/agents/browser-tester.md`:

```markdown
---
name: browser-tester
description: UI testing specialist. Use proactively for all browser-based validation tests including navigation, form filling, visual verification, and screenshot capture. MUST BE USED for any test requiring Chrome interaction.
tools: Bash, Read, Write, mcp__browser
model: sonnet
permissionMode: acceptEdits
---

You are an expert UI test automation specialist for the RANGER application.

## Your Responsibilities
1. Navigate to specified URLs using Chrome
2. Interact with UI elements (click, type, scroll)
3. Capture screenshots as evidence
4. Read console logs for errors
5. Validate visual states and content
6. Report pass/fail status with evidence

## Test Execution Protocol
For each test you execute:

1. **Navigate** to the target URL
2. **Wait** for page to be fully loaded (check for loading indicators)
3. **Execute** the test steps
4. **Capture** a screenshot as evidence
5. **Verify** expected outcomes
6. **Report** results in this format:

```
### Test [ID]: [Name]
**Status:** ✅ Pass | ❌ Fail | ⚠️ Partial
**Evidence:** [screenshot path or description]
**Observed:** [what happened]
**Expected:** [what should happen]
**Notes:** [any issues or observations]
```

## Chrome-Specific Commands
- Navigate: `browser_navigate` with URL
- Click: `browser_click` with element reference
- Type: `browser_type` with text
- Screenshot: `browser_take_screenshot` with filename
- Wait: `browser_wait_for` with condition
- Console: `browser_console_messages` for logs

## Error Handling
- If element not found, wait up to 10 seconds before failing
- If page doesn't load, capture screenshot and report failure
- If modal blocks interaction, note it and try to dismiss

## Output Requirements
Always return structured results that can be aggregated.
```

### 2.3 API Validator Subagent

Create `.claude/agents/api-validator.md`:

```markdown
---
name: api-validator
description: Backend API testing specialist. Use proactively for health checks, session management tests, SSE streaming validation, and agent delegation verification. MUST BE USED for any test involving direct API calls.
tools: Bash, Read, Write
model: sonnet
permissionMode: acceptEdits
---

You are an expert API test specialist for the RANGER ADK backend.

## Your Responsibilities
1. Execute health check endpoints
2. Test session creation and management
3. Validate SSE streaming responses
4. Verify agent delegation flows
5. Check error handling and edge cases
6. Parse and validate JSON responses

## Test Execution Protocol
For each API test:

1. **Prepare** the request (method, headers, body)
2. **Execute** using curl or fetch
3. **Parse** the response
4. **Validate** against expected schema/values
5. **Report** results in structured format

## API Endpoints Reference
- Health: GET https://ranger-coordinator-1058891520442.us-central1.run.app/health
- Sessions: POST /apps/coordinator/users/{user}/sessions
- Stream: POST /run_sse (with session_id)
- MCP: GET https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/health

## curl Command Patterns

```bash
# Health check
curl -s https://ranger-coordinator-1058891520442.us-central1.run.app/health | jq

# Create session
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  "https://ranger-coordinator-1058891520442.us-central1.run.app/apps/coordinator/users/test-user/sessions"

# SSE stream (capture first events)
curl -N -X POST \
  -H "Content-Type: application/json" \
  -d '{"new_message":{"role":"user","parts":[{"type":"text","text":"Hello"}]}}' \
  "https://ranger-coordinator-1058891520442.us-central1.run.app/apps/coordinator/users/test-user/sessions/{session_id}/run_sse" \
  --max-time 30
```

## Output Format
```
### Test [ID]: [Name]
**Status:** ✅ Pass | ❌ Fail
**Request:** [method] [endpoint]
**Response Code:** [status]
**Response Body:** [truncated relevant portion]
**Validation:** [what was checked]
**Notes:** [observations]
```

## Error Handling
- Retry failed requests up to 3 times with 2s delay
- Capture full error response for debugging
- Note if error is transient vs persistent
```

### 2.4 Report Writer Subagent

Create `.claude/agents/report-writer.md`:

```markdown
---
name: report-writer
description: Test report aggregation specialist. Use after tests complete to generate comprehensive validation reports, summarize findings, and create actionable recommendations.
tools: Read, Write
model: haiku
---

You are a QA report writer specializing in test result aggregation.

## Your Responsibilities
1. Aggregate test results from multiple sources
2. Calculate pass/fail rates by category
3. Identify patterns in failures
4. Generate executive summaries
5. Create actionable recommendations
6. Format final report in Markdown

## Report Structure

```markdown
# RANGER Phase 4 Validation Report

**Executed:** [Date/Time]
**Duration:** [Total time]
**Executor:** Claude Code (Autonomous)

## Executive Summary
[2-3 sentence overview of results]

## Results by Category

| Category | Total | Pass | Fail | Skip | Rate |
|----------|-------|------|------|------|------|
| ... | ... | ... | ... | ... | ...% |

## Critical Issues (P0)
[List any blocking issues]

## High Priority Issues (P1)
[List important non-blocking issues]

## Observations
[Patterns, trends, concerns]

## Recommendations
[Prioritized action items]

## Detailed Results
[Test-by-test breakdown]
```

## Aggregation Rules
- P0 (Critical): Any test that blocks core functionality
- P1 (High): Tests that show degraded but functional state
- P2 (Medium): Minor issues or enhancement opportunities
```

---

## Part 3: Create Orchestration Scripts

### 3.1 Main Validation Runner

Create `scripts/run-validation.sh`:

```bash
#!/bin/bash
set -euo pipefail

# ============================================
# RANGER Phase 4 Autonomous Validation Runner
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$PROJECT_ROOT/validation-results/$(date +%Y%m%d-%H%M%S)"
VALIDATION_PLAN="$PROJECT_ROOT/docs/runbooks/RANGER-PLAYWRIGHT-VALIDATION-PLAN.md"

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "🚀 Starting RANGER Phase 4 Autonomous Validation"
echo "📁 Results directory: $RESULTS_DIR"
echo ""

# ============================================
# Phase 1: Pre-flight Checks
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 1: Pre-flight Checks"
echo "═══════════════════════════════════════════"

# Check Chrome connection
echo "🔍 Checking Chrome extension connection..."
claude -p "Check if Chrome extension is connected. If not connected, report the issue." \
  --output-format json > "$RESULTS_DIR/preflight-chrome.json" 2>&1 || true

# Check backend health
echo "🔍 Checking backend health..."
claude -p "Use @api-validator to check health of:
1. https://ranger-coordinator-1058891520442.us-central1.run.app/health
2. https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/health
Report status of each." \
  --output-format json > "$RESULTS_DIR/preflight-backend.json" 2>&1

# Check frontend is running
echo "🔍 Checking frontend..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running" || {
  echo "❌ Frontend not running at localhost:3000"
  echo "Please start the frontend with: cd apps/command-console && npm run dev"
  exit 1
}

echo ""

# ============================================
# Phase 2: Core Connectivity Tests (P0)
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 2: Core Connectivity Tests (P0)"
echo "═══════════════════════════════════════════"

claude -p "Execute the following validation tests using @api-validator:

## Category 1: Core Connectivity (4 tests)

Test 1.1: Health Check Endpoint
- GET https://ranger-coordinator-1058891520442.us-central1.run.app/health
- Verify status 200 and response contains 'healthy'

Test 1.2: CORS Headers
- Verify access-control-allow-origin header present

Test 1.3: Connection Status
- Report backend reachability

Test 1.4: MCP Fixtures Health
- GET https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/health
- Verify fixtures are loaded

Report each test result in the standard format." \
  --output-format json \
  --allowedTools "Bash,Read,Write" \
  > "$RESULTS_DIR/category1-connectivity.json" 2>&1

echo "✅ Category 1 complete"

# ============================================
# Phase 3: Session Management Tests (P0)
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 3: Session Management Tests (P0)"
echo "═══════════════════════════════════════════"

claude -p "Execute the following validation tests using @api-validator:

## Category 2: Session Management (5 tests)

Test 2.1: Session Creation
- POST to /apps/coordinator/users/test-user/sessions
- Verify 200 response with session ID

Test 2.2: Session ID Format
- Verify session_id is a valid UUID

Test 2.3: Session Persistence
- Create session, note ID
- Make a request with that session
- Verify same session used

Test 2.4: New Session on Each Creation
- Create two sessions
- Verify different IDs

Test 2.5: Session in SSE Request
- Create session
- Send message to /run_sse
- Verify session ID in request matches

Report each test result in the standard format." \
  --output-format json \
  --allowedTools "Bash,Read,Write" \
  > "$RESULTS_DIR/category2-sessions.json" 2>&1

echo "✅ Category 2 complete"

# ============================================
# Phase 4: UI Validation Tests (P1)
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 4: UI Validation Tests"
echo "═══════════════════════════════════════════"

claude --chrome -p "Execute the following UI validation tests using Chrome:

## Category 7: UI/UX Validation (10 tests)

1. Navigate to http://localhost:3000
2. Wait for page to fully load
3. Take a screenshot: 'initial-load.png'

For each test, report pass/fail:

Test 7.1: Chat Panel Layout
- Verify input field visible at bottom
- Verify send button present

Test 7.2: Map Panel
- Verify 3D map renders (look for MapLibre canvas)

Test 7.3: ADK Badge
- Look for 'ADK' badge in chat header

Test 7.4: Dark Mode
- Verify dark background (slate-900 or similar)

Test 7.5: Loading States
- Type a message but don't send
- Verify input accepts text

Take screenshots as evidence and save to: $RESULTS_DIR/screenshots/

Report each test result." \
  --output-format json \
  --allowedTools "Bash,Read,Write,mcp__browser" \
  > "$RESULTS_DIR/category7-ui.json" 2>&1

echo "✅ Category 7 complete"

# ============================================
# Phase 5: Agent Delegation Tests (P0)
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 5: Agent Delegation Tests"
echo "═══════════════════════════════════════════"

claude --chrome -p "Execute agent delegation tests via the UI:

Navigate to http://localhost:3000

## Category 3: Agent Delegation (8 tests)

Test 3.1: Coordinator Self-Identification
- Type: 'What agents do you have available?'
- Press Enter
- Wait for response (up to 30 seconds)
- Verify response mentions specialist agents
- Take screenshot

Test 3.2: Burn Analyst Delegation
- Type: 'What is the burn severity for cedar-creek-2022?'
- Press Enter
- Wait for response
- Verify delegation occurs (look for 'burn analyst' or 'transfer')
- Take screenshot

Test 3.3: Trail Assessor Delegation
- Type: 'What trails need to be closed after Cedar Creek fire?'
- Wait for response
- Verify trail information returned

Test 3.4: Ambiguous Query
- Type: 'Help me with Cedar Creek'
- Verify coordinator asks for clarification or provides overview

For each test, document:
- Input sent
- Response received
- Delegation evidence
- Pass/fail status

Save screenshots to: $RESULTS_DIR/screenshots/" \
  --output-format json \
  --allowedTools "Bash,Read,Write,mcp__browser" \
  > "$RESULTS_DIR/category3-delegation.json" 2>&1

echo "✅ Category 3 complete"

# ============================================
# Phase 6: Generate Final Report
# ============================================
echo "═══════════════════════════════════════════"
echo "Phase 6: Generate Final Report"
echo "═══════════════════════════════════════════"

claude -p "Use @report-writer to generate a comprehensive validation report.

Read all JSON files in: $RESULTS_DIR/
- category1-connectivity.json
- category2-sessions.json
- category3-delegation.json
- category7-ui.json

Aggregate results and generate a Markdown report with:
1. Executive summary
2. Pass/fail rates by category
3. Critical issues found
4. Recommendations
5. Detailed test results

Save report to: $RESULTS_DIR/VALIDATION-REPORT.md" \
  --output-format json \
  --allowedTools "Read,Write" \
  > "$RESULTS_DIR/report-generation.json" 2>&1

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Validation Complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "📊 Results saved to: $RESULTS_DIR"
echo "📄 Report: $RESULTS_DIR/VALIDATION-REPORT.md"
echo ""

# Display summary
if [ -f "$RESULTS_DIR/VALIDATION-REPORT.md" ]; then
  head -50 "$RESULTS_DIR/VALIDATION-REPORT.md"
fi
```

### 3.2 Make Script Executable

```bash
chmod +x scripts/run-validation.sh
```

---

## Part 4: Alternative - Single Prompt Autonomous Mode

For simpler execution, you can run everything in a single Claude Code session with auto-accept mode:

### 4.1 Create Master Validation Prompt

Create `scripts/validation-prompt.md`:

```markdown
# RANGER Phase 4 Validation - Autonomous Execution

You are executing a comprehensive validation plan for the RANGER application.
Work autonomously through all tests, using subagents to manage context.

## Setup
1. Create results directory: `mkdir -p validation-results/$(date +%Y%m%d)`
2. Verify Chrome extension is connected with `/chrome`

## Execution Strategy
- Use @browser-tester for all UI tests
- Use @api-validator for all API tests  
- Use @report-writer for final aggregation
- Take screenshots as evidence
- Log all results to files

## Test Execution Order

### Priority 0 (Must Pass)
1. **Connectivity** - Backend health, CORS, MCP fixtures
2. **Sessions** - Creation, ID capture, persistence
3. **Delegation** - Coordinator routes to correct agents

### Priority 1 (Important)
4. **Specialist Agents** - Each agent responds correctly
5. **Proof Layer** - Confidence scores, reasoning chains
6. **Error Handling** - Graceful degradation

### Priority 2 (Nice to Have)
7. **UI/UX** - Layout, responsive, dark mode
8. **Performance** - Load times, streaming
9. **Edge Cases** - Unicode, injection, rapid queries

## For Each Test
1. Execute the test
2. Capture evidence (screenshot or response)
3. Log result: PASS / FAIL / SKIP
4. Note any issues
5. Continue to next test

## Output
After all tests, generate:
- `validation-results/SUMMARY.md` - High-level results
- `validation-results/DETAILED.md` - Full test log
- `validation-results/screenshots/` - Visual evidence

BEGIN VALIDATION NOW. Do not stop until complete or blocked.
```

### 4.2 Run with Full Autonomy

```bash
# Enable auto-accept mode and run
claude --chrome \
  --permission-mode acceptEdits \
  --allowedTools "Bash,Read,Write,Edit,mcp__browser" \
  -p "$(cat scripts/validation-prompt.md)"
```

---

## Part 5: Advanced - Headless Batch Mode

For CI/CD integration or scheduled runs:

### 5.1 Headless Validation Script

```bash
#!/bin/bash
# headless-validation.sh - Run without interactive prompts

set -euo pipefail

RESULTS_FILE="validation-$(date +%Y%m%d-%H%M%S).json"

# Run validation in headless mode with JSON output
claude -p "Execute RANGER Phase 4 validation tests:

1. Check backend health endpoints
2. Test session creation and management
3. Verify agent delegation (use API directly, not browser)
4. Validate response formats

Return results as structured JSON with:
- total_tests
- passed
- failed  
- skipped
- critical_issues[]
- test_results[]

Focus on API-level tests that don't require browser." \
  --output-format json \
  --allowedTools "Bash,Read,Write" \
  > "$RESULTS_FILE"

# Parse results
PASSED=$(jq -r '.result | fromjson | .passed // 0' "$RESULTS_FILE" 2>/dev/null || echo "0")
FAILED=$(jq -r '.result | fromjson | .failed // 0' "$RESULTS_FILE" 2>/dev/null || echo "0")

echo "Results: $PASSED passed, $FAILED failed"
echo "Full results: $RESULTS_FILE"

# Exit with failure if any tests failed
[ "$FAILED" -eq 0 ] || exit 1
```

### 5.2 Session Resumption for Long Tests

```bash
#!/bin/bash
# resumable-validation.sh - Can be paused and resumed

# Start validation and capture session ID
SESSION_OUTPUT=$(claude -p "Start RANGER validation. Report 'READY' when initialized." \
  --output-format json)
SESSION_ID=$(echo "$SESSION_OUTPUT" | jq -r '.session_id')

echo "Session ID: $SESSION_ID"
echo "$SESSION_ID" > .validation-session

# Run tests in batches, resuming same session
claude --resume "$SESSION_ID" -p "Execute Category 1: Core Connectivity tests"
claude --resume "$SESSION_ID" -p "Execute Category 2: Session Management tests"
claude --resume "$SESSION_ID" -p "Execute Category 3: Agent Delegation tests"
claude --resume "$SESSION_ID" -p "Generate final validation report"
```

---

## Part 6: Best Practices

### 6.1 Context Management

| Strategy | When to Use |
|----------|-------------|
| **Subagents** | Each test category gets its own subagent to prevent context pollution |
| **Session Resumption** | Long-running validations that may be interrupted |
| **Batch Processing** | Large test suites that would overflow context window |

### 6.2 Error Recovery

```bash
# Wrap validation in retry logic
MAX_RETRIES=3
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  if ./scripts/run-validation.sh; then
    echo "Validation succeeded"
    exit 0
  fi
  echo "Attempt $i failed, retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

echo "Validation failed after $MAX_RETRIES attempts"
exit 1
```

### 6.3 Chrome-Specific Tips

1. **Modal dialogs block execution** - Tell Claude to dismiss them manually if they appear
2. **Use fresh tabs** - Each test should use `browser_tabs` action: "new" 
3. **Filter console output** - Specify what patterns to look for, don't ask for all logs
4. **No headless mode** - Chrome integration requires visible browser window

### 6.4 Subagent Selection

| Test Type | Use Subagent |
|-----------|--------------|
| UI navigation, clicks, forms | @browser-tester |
| API calls, health checks, SSE | @api-validator |
| Report generation | @report-writer |
| General exploration | @general-purpose (built-in) |

---

## Part 7: Quick Start Commands

### Minimal Setup (5 minutes)

```bash
# 1. Create agents directory
mkdir -p .claude/agents

# 2. Create browser-tester agent (copy from Part 2.2)
# 3. Verify Chrome connection
claude /chrome

# 4. Run basic validation
claude --chrome -p "
Navigate to http://localhost:3000
Verify the page loads
Take a screenshot
Report if chat panel is visible
"
```

### Full Validation Run

```bash
# Option A: Interactive with Chrome
claude --chrome
# Then type: "Execute the validation plan in docs/runbooks/RANGER-PLAYWRIGHT-VALIDATION-PLAN.md"

# Option B: Semi-automated script
./scripts/run-validation.sh

# Option C: Full headless (API tests only)
./scripts/headless-validation.sh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Chrome extension not detected" | Install extension v1.0.36+, run `claude /chrome` |
| "Modal dialogs block flow" | Tell Claude to dismiss manually, then continue |
| Context window overflow | Use subagents, break into smaller test batches |
| Tests timing out | Increase `--max-time` in curl, add explicit waits |
| Screenshots not saving | Verify write permissions, use absolute paths |

---

## Summary

**Recommended Approach for RANGER Phase 4:**

1. **Create the three subagents** (browser-tester, api-validator, report-writer)
2. **Start Claude Code with Chrome**: `claude --chrome`
3. **Enable auto-accept**: Press `Shift+Tab` to toggle
4. **Load the validation plan**: "Read docs/runbooks/RANGER-PLAYWRIGHT-VALIDATION-PLAN.md"
5. **Execute**: "Work through the validation plan autonomously, using subagents for each category"
6. **Review results**: Check generated report and screenshots

The subagent architecture ensures each test category runs in a fresh context window, preventing context pollution and enabling true autonomous execution of all 70 tests.
