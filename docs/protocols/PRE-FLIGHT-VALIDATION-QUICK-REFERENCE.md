# Pre-Flight Validation Quick Reference

**Version:** 1.0 | **Date:** 2024-12-30 | **Authority:** RANGER CTO

---

## When to Use This Protocol

✅ **MANDATORY** for plans involving:
- Multiple system components (frontend + backend + database)
- Runtime dependencies (services, ports, APIs)
- >2 hours implementation effort
- Deployment or infrastructure changes

---

## The 4-Step Process

### 1️⃣ List Assumptions
What are you assuming is true that you haven't verified?
- Services running?
- Configurations correct?
- Data available?
- Components behaving as documented?

### 2️⃣ Create Validation Checklist
```markdown
☐ Service X running (`ps aux | grep X`)
☐ Port Y accessible (`lsof -i :Y`)
☐ Config Z correct (`cat .env | grep Z`)
☐ Feature W works (manual UI test)
```

### 3️⃣ Execute Validation
- **Use read-only commands only**
- **Capture actual output** (not expected)
- **Document surprises**
- **No code changes**

### 4️⃣ Report & Wait
- Write: `/docs/investigation/pre-session-N-validation.md`
- Report: Validated / Invalidated / Ambiguous
- Wait: For CTO approval before coding

---

## Common Validation Commands

```bash
# Check if service running
ps aux | grep SERVICE_NAME
docker ps | grep CONTAINER_NAME

# Check if port accessible
lsof -i :PORT_NUMBER
curl -I http://localhost:PORT

# Check configuration
cat .env | grep VARIABLE_NAME
cat .env.local | grep VARIABLE_NAME

# Check file exists
ls -la /path/to/file

# Check process logs
docker logs CONTAINER_NAME --tail 50

# Check network connectivity
curl -v http://endpoint/health
```

---

## Decision Matrix

| Validation Result | Action |
|-------------------|--------|
| All assumptions validated ✅ | PROCEED with implementation |
| Some assumptions invalidated ⚠️ | REVISE plan, resubmit |
| Architectural ambiguity found 🔴 | ESCALATE for CTO decision |

---

## Red Flags (Stop Immediately)

🚨 **Service not running** when plan assumes it is
🚨 **Two components configured for same resource** (port, database, etc.)
🚨 **Configuration points to non-existent endpoint**
🚨 **Documentation contradicts actual behavior**
🚨 **Multiple valid implementation paths** with no clear guidance

→ All red flags = ESCALATE, don't guess

---

## Cost of Skipping Validation

**Without validation:**
- 4-6 hours implementation against wrong assumptions
- 6-10 hours debugging and rewriting
- Total waste: 10-16 hours

**With validation:**
- 1-2 hours validation
- Correct implementation first time
- Total time: 3-5 hours

**Savings: ~10 hours per major feature**

---

## Template Phrases for Reports

### Executive Summary
```
- Assumptions Tested: 8
- Assumptions Validated: 5
- Assumptions Invalidated: 2
- Architectural Ambiguities: 1
- Recommendation: REVISE PLAN
```

### Finding Template
```
#### [Assumption Name]
- **Assumption:** Service X running on port Y
- **Test:** `ps aux | grep X`
- **Result:** INVALIDATED
- **Evidence:** [command output]
- **Impact:** Blocks implementation
```

---

## Document Locations

- **Full protocol:** `docs/protocols/PRE-FLIGHT-VALIDATION-PROTOCOL.md`
- **Validation reports:** `docs/investigation/pre-session-N-validation.md`
- **Main reference:** `CLAUDE.md` (this protocol section at top)

---

## Real Example: What This Prevented

**Scenario:** Claude Code planned to "fix routing" to API Gateway (4-6 hour estimate)

**Validation discovered:**
- API Gateway not running ❌
- Two backends configured for same port 🚨
- Frontend config ambiguous ⚠️

**Without validation:** 10+ hours of false starts
**With validation:** 30 minutes to escalate for decision
**Time saved:** ~9 hours

---

## Contact for Questions

**CTO:** Jason Valenzano
**Protocol Violations:** Work stoppage, no exceptions
**Ambiguity Resolution:** Escalate via validation report

---

**Remember:** 30 minutes of validation saves 10 hours of rework.
**Always validate. Never assume.**
