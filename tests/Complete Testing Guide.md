🧪 RANGER Demo Validation: Complete Testing Guide
Based on my research of modern ADK testing practices and your project structure, here's a step-by-step walkthrough.

Phase 1: Pre-Flight Environment Check
First, let's verify your environment is ready.

Step 1.1: Verify Virtual Environment & Dependencies
bashcd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
which python
Expected: Path should include .venv
bash
pip show google-adk | grep Version
Expected: Version should be recent (1.x.x as of late 2025)

Step 1.2: Verify Environment Variables
bash
echo "GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"
echo "GOOGLE_CLOUD_LOCATION: $GOOGLE_CLOUD_LOCATION"
echo "GOOGLE_GENAI_USE_VERTEXAI: $GOOGLE_GENAI_USE_VERTEXAI"

Required values:

GOOGLE_CLOUD_PROJECT: Your GCP project ID (e.g., ranger-twin-dev)
GOOGLE_CLOUD_LOCATION: Region (e.g., us-central1 or us-west1)
GOOGLE_GENAI_USE_VERTEXAI: Should be True for Vertex AI

If not set, check your .env:
bashcat .env | grep -E "GOOGLE_CLOUD|GOOGLE_GENAI"
Step 1.3: Verify RAG Fallback Configuration
bashcat agents/.vertex_rag_config.json
Expected output:
json{
    "enabled": false,
    "healthy": false,
    "phase": "demo",
    ...
}
This confirms RAG is disabled and we're using embedded fallback (per your billing optimization).

Phase 2: Launch ADK Web Server
Step 2.1: Start the Server
From the parent directory of your agents folder:
bashcd /Users/jvalenzano/Projects/ranger-twin
adk web agents/ --port 8000
Alternative with auto-reload (useful during development):
bashadk web agents/ --port 8000 --reload_agents
```

**Expected output:**
```
+-----------------------------------------------------------------------------+
| ADK Web Server started                                                      |
|                                                                             |
| For local testing, access at http://localhost:8000.                         |
+-----------------------------------------------------------------------------+
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Step 2.2: Open the Web UI

Open your browser to: **http://localhost:8000**

You should see the ADK Dev UI with a dropdown in the top-left corner.

---

## Phase 3: Agent Discovery Validation

### Step 3.1: Verify All Agents Are Discovered

In the top-left dropdown, you should see:
- ☑️ `coordinator`
- ☑️ `burn_analyst`
- ☑️ `trail_assessor`
- ☑️ `cruising_assistant`
- ☑️ `nepa_advisor`

**If any are missing:**
1. Check the terminal for import errors
2. Verify each agent's `__init__.py` exports `root_agent`

### Step 3.2: Verify Agent Graph (Optional)

Some ADK versions show an agent graph visualization. If available:
1. Click on `coordinator` in the dropdown
2. Look for a "Graph" or "Agent Tree" tab
3. Verify you see the 4 specialist tools connected

---

## Phase 4: Single-Agent Validation (Specialists)

Test each specialist individually to confirm embedded fallback works.

### Test 4.1: Burn Analyst

1. Select `burn_analyst` from the dropdown
2. Type this query:
```
What is the burn severity for Cedar Creek?
```

**Expected behavior:**
- Agent calls `assess_severity(fire_id="cedar-creek-2022")`
- Response includes specific acreage (127,831 acres total)
- Response includes severity breakdown (42% high, 35% moderate, 23% low)
- **Confidence score** is displayed (e.g., "Confidence: 92%")
- **Citations** reference MTBS or embedded knowledge

**Validation checklist:**
- [ ] Tool was called (visible in Events/Trace tab)
- [ ] Response contains specific numbers from Cedar Creek fixtures
- [ ] Confidence value is present
- [ ] No "I don't have data" or generic responses

### Test 4.2: Trail Assessor

1. Select `trail_assessor` from the dropdown
2. Type:
```
Which trails are damaged at Cedar Creek?
```

**Expected behavior:**
- Agent calls `assess_damage` tool
- Response includes trail segment names/IDs
- Type I-IV damage classification mentioned
- Closure recommendations provided

**Validation checklist:**
- [ ] Tool was called
- [ ] Trail damage data from fixtures returned
- [ ] Damage types classified correctly

### Test 4.3: Cruising Assistant

1. Select `cruising_assistant` from the dropdown
2. Type:
```
What's the timber salvage opportunity for Cedar Creek?
```

**Expected behavior:**
- Agent calls `estimate_volume` or similar tool
- Response includes MBF (thousand board feet) estimates
- Salvage window timeline mentioned
- Species breakdown if available

**Validation checklist:**
- [ ] Tool was called
- [ ] Volume estimates returned
- [ ] Salvage viability assessment included

### Test 4.4: NEPA Advisor

1. Select `nepa_advisor` from the dropdown
2. Type:
```
What NEPA pathway should we use for Cedar Creek trail repairs?
```

**Expected behavior:**
- Agent calls `lookup_ce_checklist` or similar tool
- Response recommends CE (Categorical Exclusion) or EA pathway
- FSH 1909.15 citation included
- 36 CFR 220.6 references

**Validation checklist:**
- [ ] Tool was called
- [ ] CE/EA/EIS recommendation provided
- [ ] Regulatory citations (FSH, CFR) present
- [ ] Embedded template knowledge used (not "RAG unavailable" error)

---

## Phase 5: Multi-Agent Orchestration (Coordinator)

This is the **critical demo test** - the Recovery Coordinator calling all 4 specialists.

### Test 5.1: Recovery Briefing Cascade

1. Select `coordinator` from the dropdown
2. Type:
```
Give me a recovery briefing for Cedar Creek
```

**Expected behavior:**
The Coordinator should:
1. Call `burn_analyst_tool` → Get severity data
2. Call `trail_assessor_tool` → Get infrastructure damage
3. Call `cruising_assistant_tool` → Get timber salvage estimates
4. Call `nepa_advisor_tool` → Get compliance pathway
5. **Synthesize** all outputs into a unified briefing

**Watch the Events/Trace tab** - you should see 4 separate tool invocations.

**Validation checklist:**
- [ ] **All 4 specialists called** (verify in Events tab)
- [ ] Burn severity data included (acreage, severity classes)
- [ ] Trail damage data included (closures, damage points)
- [ ] Timber salvage data included (MBF estimates, salvage window)
- [ ] NEPA pathway included (CE/EA recommendation)
- [ ] **Cross-domain synthesis** present (e.g., "bridge repair unlocks timber access")
- [ ] Confidence scores from each specialist preserved
- [ ] Recommended actions listed
- [ ] **Response time < 30 seconds** (Trust Gate criterion)

### Test 5.2: Single-Domain Routing

Test that the Coordinator correctly routes single-domain queries:
```
What is the burn severity?
```

**Expected:** Coordinator calls ONLY `burn_analyst_tool` (not all 4)
```
Which trails should we close?
```

**Expected:** Coordinator calls ONLY `trail_assessor_tool`

**Validation checklist:**
- [ ] Single-domain queries route to single specialist
- [ ] No unnecessary calls to other specialists

### Test 5.3: Portfolio Triage
```
Which fires need attention first: Cedar Creek at 12000 acres high severity in BAER assessment, and a hypothetical Small Fire at 500 acres low severity in restoration phase?
Expected: Coordinator calls portfolio_triage tool and returns prioritized ranking.

Phase 6: Trace & Debug Inspection
ADK Web UI provides powerful debugging tools. Let's use them.
Step 6.1: Examine the Trace Tab
After running the recovery briefing:

Click the Trace tab on the right panel
Each row represents a step in the agent's execution

What to verify:

 burn_analyst_tool invocation logged
 trail_assessor_tool invocation logged
 cruising_assistant_tool invocation logged
 nepa_advisor_tool invocation logged
 Tool arguments visible (e.g., fire_id="cedar-creek-2022")
 Tool responses contain fixture data

Step 6.2: Examine Individual Events
Click on any blue row in the Trace to expand:

Event tab: Raw event data
Request tab: What was sent to the LLM
Response tab: What the LLM returned
Graph tab: Visual flow of tool calls

Step 6.3: Verify Proof Layer Fields
In the tool response JSON, look for:
json{
  "reasoning_chain": ["Step 1: ...", "Step 2: ..."],
  "confidence": 0.92,
  "citations": [
    {"source": "MTBS...", "citation_key": "..."}
  ]
}
These fields are critical for Phase 2 Pilot UI rendering.

Phase 7: Create Evaluation Test Cases (Golden Dataset)
The ADK Web UI lets you capture successful interactions as test cases.
Step 7.1: Create an Eval Set

After a successful recovery briefing, click the Eval tab (right panel)
Click Create New Evaluation Set
Name it: ranger_demo_golden_tests

Step 7.2: Save the Current Session

Click Add current session
This saves the interaction (user query + agent response + tool calls) as a test case

Step 7.3: Edit the Test Case

Click the test case ID to inspect
Click Edit (pencil icon) to refine:

Adjust expected response if needed
Verify tool trajectory is correct



Step 7.4: Run the Evaluation

Select your test case(s)
Click Run Evaluation
Set thresholds:

tool_trajectory_avg_score: 0.8 (80% tool match)
response_match_score: 0.6 (60% semantic similarity - allows flexibility)


Click Start

Expected: Tests should PASS if agents are working correctly.

Phase 8: CLI Verification (Headless Testing)
For CI/CD readiness, test via command line.
Step 8.1: Test Agent Import
bashcd /Users/jvalenzano/Projects/ranger-twin
python -c "from agents.coordinator import root_agent; print(f'Coordinator loaded: {root_agent.name}')"
Expected: Coordinator loaded: coordinator
Step 8.2: Run Existing Pytest Suite
bashpytest agents/ -v --tb=short 2>&1 | head -50
This runs your existing unit tests.
Step 8.3: Run ADK Eval CLI (if eval sets exist)
bashadk eval agents/coordinator agents/coordinator/evalset1.evalset.json
(Only works if you've saved eval sets from the Web UI)

Phase 9: API Server Testing (Optional)
For integration testing, you can also test via REST API.
Step 9.1: List Apps
bashcurl -s http://localhost:8000/list-apps | python -m json.tool
Expected: ["coordinator", "burn_analyst", "trail_assessor", "cruising_assistant", "nepa_advisor"]
Step 9.2: Create a Session
bashcurl -X POST http://localhost:8000/apps/coordinator/users/test_user/sessions/test_session \
  -H "Content-Type: application/json" \
  -d '{}'
Step 9.3: Run a Query
bashcurl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "coordinator",
    "userId": "test_user",
    "sessionId": "test_session",
    "newMessage": {
      "role": "user",
      "parts": [{"text": "What is the burn severity for Cedar Creek?"}]
    }
  }' | python -m json.tool

📋 Validation Summary Checklist
Use this to track your demo validation progress:
Environment

 Virtual environment active
 google-adk installed (recent version)
 GCP environment variables set
 RAG config shows enabled: false (fallback mode)

Agent Discovery

 All 5 agents visible in Web UI dropdown
 No import errors in terminal

Single-Agent Tests

 Burn Analyst returns Cedar Creek severity data
 Trail Assessor returns damage classifications
 Cruising Assistant returns volume estimates
 NEPA Advisor returns CE/EA pathway with citations

Multi-Agent Orchestration

 Recovery briefing calls ALL 4 specialists
 Cross-domain synthesis visible in response
 Confidence scores preserved
 Response time < 30 seconds

Proof Layer Compatibility

 reasoning_chain visible in tool responses
 confidence values present (0-1 scale)
 citations include source and retrieval_method

Trust Gate 1→2 Criteria (from ADR-014)

 Multi-agent cascade completes with 3+ specialists
 Proof Layer reasoning chains render in UI
 Citation accuracy (spot-check 10 queries)
 Cross-domain synthesis works
 End-to-end briefing < 30 seconds


Ready to Start?
Run this command now to begin:
bashcd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
adk web agents/ --port 8000
Then open http://localhost:8000 and walk through each test.
Would you like me to help you debug any specific step as you go through the validation?




