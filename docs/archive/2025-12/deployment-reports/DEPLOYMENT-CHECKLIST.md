# AgentTool Refactor - Deployment Checklist
Date: 2025-12-27
Commit: 3fb715d

---

## Pre-Deployment Verification

- [x] Code committed to develop branch
- [x] Local agent initialization successful
- [x] ADR-008 created
- [x] Runbook updated

---

## Deployment Commands

### Option 1: Deploy from Source (Recommended)
```bash
cd /Users/jvalenzano/Projects/ranger-twin

# Deploy coordinator
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=ranger-twin-dev,GOOGLE_CLOUD_LOCATION=us-central1,MCP_FIXTURES_URL=https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/sse
```

### Option 2: Build and Deploy Separately
```bash
# Build image
gcloud builds submit --tag gcr.io/ranger-twin-dev/ranger-coordinator

# Deploy image
gcloud run deploy ranger-coordinator \
  --image gcr.io/ranger-twin-dev/ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://ranger-coordinator-1058891520442.us-central1.run.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ranger-orchestrator",
  "adk_version": "1.21.0",
  "agents_dir": "/workspace/agents",
  "session_backend": "firestore"
}
```

### 2. Smoke Test Queries

Open frontend: `https://ranger-console-1058891520442.us-central1.run.app`

#### Test 1: Multi-Domain Recovery Briefing
**Query:** "Give me a recovery briefing for Cedar Creek"

**Success Criteria:**
- [ ] Response includes burn severity data
- [ ] Response includes trail/infrastructure status
- [ ] Response includes timber salvage estimates
- [ ] Response includes NEPA pathway recommendations
- [ ] Confidence scores vary (not all 75%)
- [ ] Response synthesizes across domains (e.g., "bridge repair unlocks timber access")

**Expected Log Entries:**
```
tool_call: burn_analyst
tool_call: trail_assessor
tool_call: cruising_assistant
tool_call: nepa_advisor
```

#### Test 2: Single-Domain Query
**Query:** "What is the soil burn severity at Cedar Creek?"

**Success Criteria:**
- [ ] Coordinator calls burn_analyst tool
- [ ] Response includes confidence score (expected: 92% or 85%)
- [ ] Response includes severity breakdown by sector
- [ ] Response includes priority sectors

**Expected Log Entries:**
```
tool_call: burn_analyst
tool_result: {...confidence: 0.92...}
```

#### Test 3: Portfolio Triage
**Query:** "Which fires need BAER assessments?"

**Success Criteria:**
- [ ] Coordinator calls portfolio_triage tool
- [ ] Response includes ranked fire list
- [ ] Response includes triage scores
- [ ] Confidence: 92%

**Expected Log Entries:**
```
tool_call: portfolio_triage
```

### 3. Log Inspection
```bash
# Check for specialist tool calls
gcloud run services logs read ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1 \
  --limit 100 | grep -E "burn_analyst|trail_assessor|cruising_assistant|nepa_advisor"

# Check for errors
gcloud run services logs read ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1 \
  --limit 50 | grep -i error
```

### 4. Verify No Refusals
**Anti-pattern to check for:**
- [ ] No "I cannot help with that" messages
- [ ] No "This is outside my domain" messages
- [ ] No "I am the Burn Analyst and I only handle..." messages

These would indicate sub_agents pattern is still in effect.

---

## Rollback Plan (If Needed)

If deployment fails or tests don't pass:

### Rollback to Previous Revision
```bash
# Find previous working revision
gcloud run revisions list \
  --service ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1

# Route 100% traffic to previous revision
gcloud run services update-traffic ranger-coordinator \
  --to-revisions <PREVIOUS-REVISION-ID>=100 \
  --project ranger-twin-dev \
  --region us-central1
```

### Debug Steps
1. Check Cloud Run logs for specific error
2. Verify MCP Fixtures server is running
3. Check environment variables are set correctly
4. Test agent locally with API key: `cd agents && adk run coordinator`

---

## Success Criteria Summary

| Test | Status | Notes |
|------|--------|-------|
| Health check returns 200 | ⏳ | |
| Test 1: Recovery briefing calls all 4 specialists | ⏳ | |
| Test 2: Burn severity query shows 92% confidence | ⏳ | |
| Test 3: Portfolio triage returns ranked fires | ⏳ | |
| No specialist refusals in responses | ⏳ | |
| Logs show tool_call events for specialists | ⏳ | |

---

## Post-Validation Actions

Once all tests pass:

1. **Update Punch List**
   ```bash
   # Edit docs/testing/PUNCH-LIST.md
   # Mark PL-002 as ✅ Fixed + Verified
   ```

2. **Merge to Main** (if on develop branch)
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

3. **Tag Release**
   ```bash
   git tag -a v0.2.0-agent-tool-refactor -m "Critical fix: AgentTool pattern for multi-agent orchestration"
   git push origin v0.2.0-agent-tool-refactor
   ```

4. **Notify Stakeholders**
   - Recovery briefing queries now work
   - Confidence scores are dynamic (85-98%)
   - Multi-domain synthesis operational

---

## Monitoring

After deployment, monitor for 24-48 hours:

```bash
# Watch logs in real-time
gcloud run services logs tail ranger-coordinator \
  --project ranger-twin-dev \
  --region us-central1

# Check error rate
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit 50 \
  --project ranger-twin-dev \
  --format json
```

---

**Deployment Owner:** [Your Name]
**Deployment Date:** [Date]
**Verified By:** [Name]
**Verification Date:** [Date]
