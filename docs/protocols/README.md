# RANGER Development Protocols

This directory contains mandatory development protocols for all contributors (human and AI).

---

## Active Protocols

### 🔴 Critical (Mandatory Compliance)

| Protocol | Purpose | Applies To | Document |
|----------|---------|------------|----------|
| **Pre-Flight Validation** | Prevent false-start implementation by validating runtime assumptions before coding | All implementation plans >2hrs or multi-component | [PRE-FLIGHT-VALIDATION-PROTOCOL.md](PRE-FLIGHT-VALIDATION-PROTOCOL.md) |

---

## Quick Reference Cards

| Card | Use Case |
|------|----------|
| [Pre-Flight Validation Quick Reference](PRE-FLIGHT-VALIDATION-QUICK-REFERENCE.md) | Printable/desktop reference for validation workflow |

---

## Protocol Compliance

### For AI Coding Agents

**Mandatory reading before any implementation:**
1. `PRE-FLIGHT-VALIDATION-PROTOCOL.md` - Understand when and how to validate
2. `PRE-FLIGHT-VALIDATION-QUICK-REFERENCE.md` - Quick lookup during work

**Enforcement:**
- Violations result in work stoppage
- Changes reverted, validation executed properly
- No exceptions

### For Human Reviewers

**Before approving any AI agent plan:**
- [ ] Does plan involve >2hr effort or multiple components?
- [ ] If yes, has agent completed Pre-Flight Validation?
- [ ] Has validation report been reviewed and approved?
- [ ] Are there unresolved architectural ambiguities?

**If validation missing → PAUSE work, require validation**

---

## Protocol Versioning

Protocols are versioned documents:
- **Version 1.0:** Initial establishment
- **Updates:** Tracked in document history section
- **Breaking changes:** New major version number

---

## Adding New Protocols

**Process:**
1. Identify recurring failure pattern or quality issue
2. Document root cause and solution pattern
3. Write protocol following template below
4. Add to this index
5. Update CLAUDE.md with reference

**Template structure:**
- Purpose and problem statement
- When to apply
- Step-by-step process
- Enforcement mechanisms
- Success metrics
- Real-world examples

---

## Document History

| Date | Protocol | Change |
|------|----------|--------|
| 2024-12-30 | Pre-Flight Validation | Protocol established |

---

## Related Documentation

- **CLAUDE.md** - Main AI agent reference (protocols referenced at top)
- **docs/adr/** - Architecture Decision Records (protocols inform ADRs)
- **docs/guides/** - Operational procedures (protocols prerequisite for deployment)

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **AI** | Artificial Intelligence | Machine learning systems |

→ **[Full Glossary](../GLOSSARY.md)**
