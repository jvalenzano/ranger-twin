# Cedar Creek Demo Scenario Checklist

**Last Updated:** December 27, 2025
**Status:** Ready for Execution (with known limitations)
**Demo Duration:** 8-10 minutes
**Difficulty:** Intermediate (requires ADK setup)

---

## The "8-Minute Reality" Demo

**Persona:** Forest Supervisor Maria Rodriguez
**Scenario:** 6:30 AM briefing prep for Cedar Creek Fire recovery
**Context:** Maria needs a rapid assessment of recovery priorities before her 7:00 AM team standup
**Primary Query:** "Give me a recovery briefing for Cedar Creek"
**Expected Outcome:** Multi-source assessment from Burn Analyst, Trail Assessor, and other specialists

---

## Prerequisites

### Environment Setup

#### Python Environment
- [ ] Python 3.13+ installed
  ```bash
  python3 --version  # Should show 3.13.x or higher
  ```
- [ ] Virtual environment activated
  ```bash
  cd /Users/jvalenzano/Projects/ranger-twin
  source .venv/bin/activate  # or: source venv/bin/activate
  python --version           # Verify correct version in venv
  ```
- [ ] Google ADK installed
  ```bash
  pip list | grep google-adk  # Should show google-adk version
  adk --version               # Verify CLI available
  ```

#### API Keys
- [ ] GOOGLE_API_KEY configured
  ```bash
  echo $GOOGLE_API_KEY  # Should output your API key (not empty)
  ```
  **If not set:**
  ```bash
  export GOOGLE_API_KEY=your_api_key_here
  ```

### Data Validation

#### Cedar Creek Fixtures
- [ ] All 5 fixture files present
  ```bash
  ls -lh data/fixtures/cedar-creek/
  ```
  **Expected files:**
  - `incident-metadata.json` (fire perimeter, containment)
  - `burn-severity.json` (127,831 acres total, 63.6% high severity)
  - `trail-damage.json` (5 trails: 3 closed, 2 open-caution)
  - `timber-plots.json` (cruise data for salvage assessment)
  - `briefing-events.json` (mock event samples)

- [ ] Verify fixture data integrity
  ```bash
  python -m json.tool data/fixtures/cedar-creek/incident-metadata.json > /dev/null
  python -m json.tool data/fixtures/cedar-creek/burn-severity.json > /dev/null
  python -m json.tool data/fixtures/cedar-creek/trail-damage.json > /dev/null
  ```
  **Expected:** No JSON parsing errors

#### NEPA Documents (Optional)
- [ ] NEPA documents loaded (for NEPA Advisor queries)
  ```bash
  ls agents/nepa_advisor/data/  # FSM/FSH documents should be present
  ```

### Agent Health Checks

#### All Agents Import Successfully
- [ ] Test agent imports
  ```bash
  cd agents
  python -c "from coordinator.agent import root_agent as coordinator; print('✅ Coordinator')"
  python -c "from burn_analyst.agent import root_agent as burn_analyst; print('✅ Burn Analyst')"
  python -c "from trail_assessor.agent import root_agent as trail_assessor; print('✅ Trail Assessor')"
  python -c "from cruising_assistant.agent import root_agent as cruising_assistant; print('✅ Cruising Assistant')"
  python -c "from nepa_advisor.agent import root_agent as nepa_advisor; print('✅ NEPA Advisor')"
  ```
  **Expected:** All 5 agents print success (no import errors)

#### Coordinator Has Sub-Agents
- [ ] Verify sub-agent registration
  ```bash
  cd agents
  python -c "from coordinator.agent import root_agent; print(f'Sub-agents: {len(root_agent.sub_agents)}'); print([a.name for a in root_agent.sub_agents])"
  ```
  **Expected output:**
  ```
  Sub-agents: 4
  ['burn_analyst', 'trail_assessor', 'cruising_assistant', 'nepa_advisor']
  ```

#### All Agents Use mode=AUTO (ADR-007.1)
- [ ] Verify ADR-007.1 configuration
  ```bash
  cd agents
  python -c "from coordinator.agent import root_agent; print(f'Mode: {root_agent.generate_content_config.mode}')"
  ```
  **Expected:** `Mode: AUTO` (not ANY or NONE)

  Repeat for all agents to confirm mode=AUTO.

---

## Demo Flow

### Step 1: Start ADK Web Server

#### Launch Server
```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
source ../.venv/bin/activate
adk web --port 8000
```

#### Verification Checklist
- [ ] Server starts without error
  - Look for: "Starting ADK web server on port 8000"
  - Look for: No Python tracebacks or import errors

- [ ] Web UI accessible
  - Open browser: `http://localhost:8000`
  - Page loads with ADK interface

- [ ] All 5 agents visible in agent selector
  - Coordinator
  - Burn Analyst (burn_analyst)
  - Trail Assessor (trail_assessor)
  - Cruising Assistant (cruising_assistant)
  - NEPA Advisor (nepa_advisor)

**Troubleshooting:**
- If server won't start: Check `GOOGLE_API_KEY` is set
- If agents don't load: Check for import errors in console output
- If port 8000 busy: Use different port `adk web --port 8080`

---

### Step 2: Send Briefing Query to Coordinator

#### Query
**Agent:** Coordinator
**Message:** "Give me a recovery briefing for Cedar Creek"

#### Expected Behavior
- [ ] Coordinator receives query (message appears in chat)
- [ ] Coordinator may delegate to specialists (check ADK UI for sub-agent calls if visible)
- [ ] Response appears within 60 seconds (no infinite hang)
- [ ] Response is synthesized text (not just raw tool outputs or JSON)
- [ ] Response mentions multiple aspects (burn severity, trails, timber, etc.)

#### Expected Content (Approximate)
Response should include information like:
- Fire size: ~127,831 acres
- Burn severity: 63.6% high severity (MTBS classification)
- Trail damage: 3 trails closed, 2 open with caution
- Timber salvage considerations
- Recovery timeline recommendations

**Note:** Exact wording will vary based on model synthesis.

#### Red Flags (Failure Modes)
- ❌ Agent hangs for >60 seconds → Check mode=AUTO (not mode=ANY)
- ❌ Response is raw JSON → Check agent synthesis instruction
- ❌ Response is "I don't have access to that data" → Check fixture files present
- ❌ Infinite loop (agent keeps calling tools) → Check mode=AUTO enforcement

---

### Step 3: Verify Proof Layer (Optional)

**Note:** Progressive proof layer UI not implemented yet. This step checks basic audit capture.

- [ ] Check server logs for tool invocations
  - Look for: "TOOL_INVOCATION" or similar log entries
  - Look for: Tool names (e.g., "assess_severity", "evaluate_closure")

- [ ] Response includes reasoning (in text)
  - Response explains "why" not just "what"
  - Response cites data sources if possible

**What You WON'T See (Known Gaps):**
- Progressive reasoning chain visualization
- Streaming confidence gauge
- confidence_ledger metadata in UI

**See:** `docs/status/IMPLEMENTATION-GAPS.md` (Gap #2: Progressive Proof Layer UI)

---

### Step 4: Test Specialist Directly (Trail Assessor)

This validates single-agent execution without coordination.

#### Query
**Agent:** Trail Assessor (select from dropdown)
**Message:** "What's the damage on Cedar Creek trails?"

#### Expected Behavior
- [ ] Tool invoked: `evaluate_closure` or `classify_damage`
- [ ] Response includes damage points
  - Trail 101: Type III damage, closure recommended
  - Trail 205: Type II damage, open with caution
  - (etc., based on fixture data)
- [ ] Response synthesizes conclusion (not just data dump)
  - Example: "3 trails require closure due to severe damage"
- [ ] No infinite loop (response completes within 30 seconds)

#### Verification
- [ ] Response mentions specific trails by name/number
- [ ] Response includes damage severity classification (Type I-IV)
- [ ] Response provides actionable recommendations (close, caution, reopen)

---

### Step 5: Test Burn Analyst (Severity Assessment)

#### Query
**Agent:** Burn Analyst (select from dropdown)
**Message:** "What's the burn severity for Cedar Creek?"

#### Expected Behavior
- [ ] Tool invoked: `assess_severity` or `classify_mtbs`
- [ ] Response includes severity data
  - Total acres: 127,831
  - High severity: 63.6% (~81,681 acres)
  - Moderate severity: ~25%
  - Low severity: ~11%
  - Unburned: minimal
- [ ] Response synthesizes ecological impact
  - Example: "High severity over 63% suggests significant soil erosion risk"

#### Verification
- [ ] Numbers match Cedar Creek fixture data
- [ ] Response explains what severity means (not just numbers)
- [ ] Response may mention ecological consequences

---

### Step 6: Test Command Console Frontend (Optional)

**Status:** Command Console builds but may not connect to ADK backend yet.

#### Build and Run
```bash
cd /Users/jvalenzano/Projects/ranger-twin/apps/command-console
npm install  # If not already done
npm run dev
```

#### Verification Checklist
- [ ] Frontend builds without error
  - Vite dev server starts
  - No TypeScript compilation errors

- [ ] Map loads
  - Navigate to `http://localhost:5173` (or port shown)
  - MapLibre map renders
  - Cedar Creek fire marker visible (if NIFC data loaded)

- [ ] Chat interface visible
  - Chat panel visible in UI
  - Input field available

- [ ] Can send message (may fail if backend not connected)
  - Try sending a test message
  - If error: Frontend-backend integration not complete (Gap #3)

**Known Limitations:**
- Chat may not connect to ADK backend (integration pending)
- SSE streaming may not work end-to-end yet
- Proof layer UI components not built (Gap #2)

---

## Known Limitations (Demo Readiness Phase)

### Data Layer
- ✅ Cedar Creek fixture data complete
- ❌ MCP servers not connected to agents (agents use hardcoded fixture paths)
- ❌ No live IRWIN or NIFC data (fixture data only)
- ❌ NEPA RAG corpus partial (file search configured but limited docs)

### Agent Layer
- ✅ All 5 agents functional with ADR-007.1 compliance
- ✅ Tool invocations work correctly
- ⏳ Multi-agent coordination untested in runtime (Coordinator delegation may fail)
- ⏳ Sub-agent failure handling untested

### Frontend Layer
- ✅ Command Console builds successfully
- ✅ SSE client implemented with retry logic
- ❌ Progressive proof layer UI not built (designed in SSE-PROOF-LAYER-SPIKE.md)
- ⏳ Frontend-backend integration untested end-to-end
- ⏳ WebSocket fallback not implemented

### Other Limitations
- ❌ No authentication/authorization
- ❌ Single-fire demo only (Cedar Creek)
- ❌ No multi-user session support
- ⏳ 3 test failures in burn_analyst (fixture data misalignment)

---

## Success Criteria

### Minimum Viable Demo (TODAY)

- [ ] **Agent Execution:** At least one agent responds to a query
- [ ] **Data Grounding:** Response includes Cedar Creek fixture data
- [ ] **Coherent Synthesis:** Response is natural language (not raw JSON)
- [ ] **No Infinite Loops:** Response completes within 60 seconds
- [ ] **Tool Invocation:** Agent calls at least one tool successfully

### Full Demo (After P0 Gaps Closed)

- [ ] **Multi-Agent Coordination:** Coordinator successfully delegates to specialists
- [ ] **Proof Layer:** Progressive reasoning visible in UI
- [ ] **MCP Integration:** Agents pull data from MCP servers (not hardcoded paths)
- [ ] **Frontend Integration:** Command Console connects to ADK backend
- [ ] **End-to-End Flow:** Browser → main.py → agents → browser works reliably

---

## Troubleshooting Guide

### Issue: Agent hangs/infinite loop

**Symptoms:** Query sent, but no response after 60+ seconds

**Cause:** `mode=ANY` instead of `mode=AUTO` in agent configuration

**Fix:**
1. Stop ADK server (Ctrl+C)
2. Check agent configuration:
   ```bash
   cd agents
   python -c "from coordinator.agent import root_agent; print(root_agent.generate_content_config.mode)"
   ```
3. If mode is not AUTO, verify `agents/shared/config.py` has:
   ```python
   generate_content_config=types.GenerateContentConfig(
       mode="AUTO",
       temperature=0.1,
   )
   ```
4. Restart ADK server

**Reference:** ADR-007.1 Three-Layer Tool Invocation

---

### Issue: Agent dumps raw tool output

**Symptoms:** Response is JSON blob or raw data, not natural language

**Cause:** Missing synthesis instruction in agent prompt, or mode=ANY

**Fix:**
1. Check agent instruction includes synthesis guidance:
   ```python
   agent = adk.Agent(
       name="agent_name",
       instruction="...[synthesize a coherent response]...",
   )
   ```
2. Ensure mode=AUTO (not mode=ANY)
3. Restart agent

---

### Issue: Import errors when starting ADK

**Symptoms:** `ModuleNotFoundError` or `ImportError` when running `adk web`

**Cause:** Missing dependencies or wrong Python version

**Fix:**
1. Verify Python 3.13+:
   ```bash
   python --version
   ```
2. Verify virtual environment activated:
   ```bash
   which python  # Should point to .venv/bin/python
   ```
3. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Verify google-adk installed:
   ```bash
   pip list | grep google-adk
   ```

---

### Issue: GOOGLE_API_KEY not found

**Symptoms:** `Error: GOOGLE_API_KEY environment variable not set`

**Cause:** API key not configured

**Fix:**
```bash
export GOOGLE_API_KEY=your_api_key_here
echo $GOOGLE_API_KEY  # Verify it's set
```

**Persistent fix (add to ~/.bashrc or ~/.zshrc):**
```bash
echo 'export GOOGLE_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

---

### Issue: "No fixture data found"

**Symptoms:** Agent responds "I don't have access to Cedar Creek data"

**Cause:** Fixture files missing or not loaded correctly

**Fix:**
1. Verify fixture files exist:
   ```bash
   ls -lh data/fixtures/cedar-creek/
   ```
2. Verify JSON is valid:
   ```bash
   python -m json.tool data/fixtures/cedar-creek/burn-severity.json
   ```
3. Check agent skill loading:
   ```bash
   cd agents/burn_analyst
   python -c "from skills.mtbs-classification.scripts.classify_mtbs import execute; print('✅ Skill loads')"
   ```

---

### Issue: Coordinator doesn't delegate

**Symptoms:** Coordinator responds directly instead of calling specialists

**Cause:** Sub-agent wiring not working, or query doesn't match delegation keywords

**Known Limitation:** Multi-agent coordination untested in runtime (Gap #4)

**Workaround:** Query specialists directly instead of via Coordinator

**Fix (Future):**
1. Test Coordinator delegation in runtime
2. Add delegation test coverage
3. Verify sub-agent routing logic

---

### Issue: Frontend won't connect to backend

**Symptoms:** Command Console chat sends messages but gets no response

**Cause:** Frontend-backend integration not complete (Gap #3)

**Known Limitation:** End-to-end integration untested

**Workaround:** Use ADK Web UI (http://localhost:8000) instead of Command Console

**Fix (Future):**
1. Configure `VITE_ADK_URL` in `.env.local`
2. Test SSE endpoint from browser
3. Wire chat interface to `/run_sse` endpoint

---

## Post-Demo Cleanup

### Stop ADK Server
```bash
# If running in terminal: Ctrl+C

# If running in background:
ps aux | grep "adk web"
kill <PID>
```

### Stop Command Console (if running)
```bash
# If running in terminal: Ctrl+C
```

### Clear Session Data (Optional)
```bash
# ADK session data stored in-memory, cleared on restart
# No persistent cleanup needed
```

---

## Next Steps After Demo

### If Demo Succeeds
1. Document observations and feedback
2. Capture video/screenshots if possible
3. Note which queries worked best
4. Identify any unexpected behaviors

### If Demo Fails
1. Review troubleshooting guide above
2. Check `docs/validation/ADR-007.1-VALIDATION-REPORT.md` for known issues
3. Verify all prerequisites met
4. Check implementation gaps that may be blocking

### To Improve Demo
**Address P0 gaps (5-8 days):**
1. **Gap #3:** Test frontend-backend integration end-to-end
2. **Gap #4:** Validate multi-agent coordination in runtime
3. **Gap #1:** Wire MCP servers to agents (optional for demo)
4. **Gap #2:** Build progressive proof layer UI (optional for demo)

**See:** `docs/status/IMPLEMENTATION-GAPS.md`

---

## References

**Documentation:**
- Status Matrix: `docs/status/PHASE1-STATUS-MATRIX.md`
- Implementation Gaps: `docs/status/IMPLEMENTATION-GAPS.md`
- Validation Report: `docs/validation/ADR-007.1-VALIDATION-REPORT.md`
- Operations Runbook: `docs/operations/ADK-OPERATIONS-RUNBOOK.md`

**Source Code:**
- Agents: `/Users/jvalenzano/Projects/ranger-twin/agents/`
- Fixtures: `/Users/jvalenzano/Projects/ranger-twin/data/fixtures/cedar-creek/`
- Frontend: `/Users/jvalenzano/Projects/ranger-twin/apps/command-console/`
- Orchestrator: `/Users/jvalenzano/Projects/ranger-twin/main.py`

**Production URLs:**
- Coordinator: https://ranger-coordinator-1058891520442.us-central1.run.app
- MCP Fixtures: https://ranger-mcp-fixtures-1058891520442.us-central1.run.app

---

**Document Owner:** RANGER Team
**Last Updated:** December 27, 2025
**Demo Status:** Ready for execution (with known limitations)
**Recommended Audience:** Technical stakeholders familiar with CLI tools
