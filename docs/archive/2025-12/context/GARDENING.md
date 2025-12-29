# Repository Gardening Checklist

> **Schedule:** Every Friday, 90 minutes (or before major demos)

## Quick Status Check (5 min)

- [ ] Run: `find . -name "*.md" -path "./docs/*" -mtime +14 -type f | head -20`
- [ ] Check root directory for stray files (deployment summaries, fix reports)
- [ ] Verify `.context/` files are current

## Audit Phase (30 min)

### Root Directory Cleanup
- [ ] Any `*-SUMMARY.md`, `*-REPORT.md`, `*-CHECKLIST.md` files?
  - If deployment-related → Archive to `docs/archive/deployments/YYYY-MM/`
  - If fix-related → Archive to `docs/archive/fixes/YYYY-MM/`
- [ ] Any `test_*.sh` or `test_*.py` one-off scripts?
  - If still needed → Move to `scripts/`
  - If obsolete → Delete

### ADR Health Check
- [ ] All ADRs have Status field (Proposed/Accepted/Superseded)?
- [ ] Superseded ADRs link to replacement?
- [ ] Any ADRs reference deprecated patterns?

### Documentation Drift
- [ ] Does `CLAUDE.md` (root) match `.context/CLAUDE.md`?
- [ ] Are agent skill counts in docs accurate?
- [ ] Do command examples still work?

## Consolidate Phase (45 min)

### Duplicate Detection
- [ ] Check `docs/runbooks/` for overlapping guides
- [ ] Check `docs/specs/` for redundant specifications
- [ ] Look for `_v2`, `-DRAFT`, `-OLD` suffixes

### Archive Candidates
Files that match these patterns are archive candidates:
- `_!_` prefix (old "important" markers)
- `PHASE*` prefix (phase-specific, now complete)
- Session logs, audit reports, deployment reports

### Consolidation Actions
For each duplicate cluster:
1. Identify newest/most complete version
2. Merge unique content from older versions
3. Move older versions to `docs/archive/YYYY-MM/`
4. Update any cross-references

## Commit Phase (15 min)

### Archive Moves
```bash
# Create dated archive folder
mkdir -p docs/archive/$(date +%Y-%m)

# Move files (example)
git mv OLD-FILE.md docs/archive/$(date +%Y-%m)/

# Add archive README if new folder
echo "# Archive - $(date +%B %Y)\n\nFiles archived during gardening session." > docs/archive/$(date +%Y-%m)/README.md
```

### Commit Message Format
```
docs: weekly gardening session

Archived:
- OLD-FILE.md → archive/2025-01/
- ANOTHER.md → archive/2025-01/

Consolidated:
- Merged X into Y

Updated:
- .context/CLAUDE.md (refreshed agent counts)
```

## Validation (5 min)

- [ ] `npm run typecheck` passes (if docs changed imports)
- [ ] `pytest agents/ -v --collect-only` still finds all tests
- [ ] No broken relative links in `.context/` files

## Post-Gardening

Update this section with session notes:

### Last Session
- **Date:** _____________
- **Duration:** ___ minutes
- **Files archived:** ___
- **Files consolidated:** ___
- **Issues found:** ___

### Known Debt (To Address Next Time)
- [ ] _____________
- [ ] _____________

---

## Emergency Gardening (Pre-Demo)

Shorter checklist when time is limited:

1. [ ] Root directory clean? (No stray summaries/reports)
2. [ ] `.context/CLAUDE.md` current?
3. [ ] Demo-related docs accurate?
4. [ ] No `DRAFT` or `WIP` files in visible locations?

Time: 15 minutes max

---

*Template created: December 2025*
