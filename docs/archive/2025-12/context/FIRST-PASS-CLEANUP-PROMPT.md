# Repository Hygiene: First Pass Cleanup

## Context
RANGER has accumulated documentation sediment from rapid AI-assisted development. We've established a `.context/` directory with streamlined agent context and a cleanup framework. The initial script moved root-level deployment reports to archive. Now we need a comprehensive first pass.

## Your Mission
Execute a systematic cleanup of the `docs/` directory. You are a Technical Librarian, not a coder. Your job is to consolidate, archive, and organize—not to modify any code.

---

## Phase 1: Audit (Read-Only)

### 1.1 Find stale planning documents
```bash
# Files in docs/ not modified in 14+ days
find docs -name "*.md" -mtime +14 -type f | grep -v archive | head -30
```

### 1.2 Find duplicate/versioned files
```bash
# Look for version suffixes that indicate duplication
find docs -name "*-v2*" -o -name "*_v2*" -o -name "*-DRAFT*" -o -name "*_OLD*" | grep -v archive
```

### 1.3 Find _!_ prefixed files (old "important" markers)
```bash
find docs -name "_!_*" | grep -v archive
```

### 1.4 Check for orphaned implementation guides
```bash
ls -la docs/implementation/ 2>/dev/null || echo "No implementation dir"
ls -la docs/planning/ 2>/dev/null || echo "No planning dir"
ls -la docs/status/ 2>/dev/null || echo "No status dir"
```

### 1.5 List runbook duplicates
```bash
ls -la docs/runbooks/
```

Report your findings before proceeding. Create a file `.context/AUDIT-RESULTS.md` with:
- Total files scanned
- Files flagged for review
- Recommended actions

---

## Phase 2: ADR Health Check

### 2.1 Check all ADRs have status
```bash
for f in docs/adr/*.md; do
  echo "=== $f ==="
  grep -i "^status:" "$f" || echo "  ⚠️ NO STATUS FIELD"
done
```

### 2.2 Check for supersession links
ADR-004 should be marked superseded by ADR-006. Verify:
```bash
grep -i "supersed" docs/adr/ADR-004*.md || echo "ADR-004 missing supersession marker"
```

### 2.3 Fix ADR-004 if needed
If ADR-004 doesn't have supersession info, add to its header:
```markdown
**Status:** Superseded by ADR-006
**Superseded By:** [ADR-006](./ADR-006-google-only-llm-strategy.md)
```

---

## Phase 3: Consolidate Runbooks

Check if these runbooks overlap:
- `GOOGLE-ADK-RUNBOOK.md`
- `ADK-OPERATIONS-RUNBOOK.md`
- `CLAUDE-CODE-ADK-PRIMER.md`

If they cover similar ground:
1. Identify the most complete/recent one
2. Merge unique content from others into it
3. Move deprecated ones to `docs/archive/2025-12/runbooks/`

---

## Phase 4: Archive Candidates

Move these to `docs/archive/2025-12/` (create subdirs as needed):

### 4.1 Root docs/ files that are likely stale
Check each of these—if they're superseded or point-in-time artifacts, archive them:
- `docs/STRATEGIC-REFRAME.md` (if superseded by product summary)
- `docs/INTEGRATION-ROADMAP.md` (if Phase 1 specific)
- `docs/QA-VALIDATION-MANUAL.md` (check if still accurate)

### 4.2 Any `_!_` prefixed files outside archive
The `_!_` prefix was an old "important" convention. These should either:
- Be renamed without prefix if still authoritative
- Be archived if superseded

### 4.3 Implementation/status directories
If `docs/implementation/` or `docs/status/` exist and contain stale content, archive the entire directory.

---

## Phase 5: Update Manifest

After cleanup, update `.context/MANIFEST.md` to reflect:
- Any new authoritative docs
- Any archived docs that were previously listed
- Current runbook structure

---

## Phase 6: Commit

```bash
git add -A
git status

# Review what changed
git diff --cached --stat

git commit -m "chore: repository hygiene - first pass cleanup

Audit findings: [summarize]

Archived:
- [list files moved to archive]

Consolidated:
- [list any merged docs]

ADR updates:
- [list any status changes]

See .context/AUDIT-RESULTS.md for full report."
```

---

## Rules

### DO
- Read files before deciding to archive
- Preserve git history with `git mv`
- Create dated archive folders (`docs/archive/2025-12/`)
- Document why things were archived in archive READMEs
- Update cross-references if you move files

### DO NOT
- Delete any ADRs (mark superseded instead)
- Modify code files (agents/, apps/, services/, etc.)
- Archive anything in `docs/specs/` without explicit approval
- Archive `docs/adr/` files (only update their status)
- Make judgment calls on technical content—just organize

---

## Success Criteria

- [ ] `.context/AUDIT-RESULTS.md` created with findings
- [ ] All ADRs have Status field
- [ ] ADR-004 marked superseded by ADR-006
- [ ] No `_!_` prefixed files outside archive
- [ ] Runbooks consolidated (no redundant guides)
- [ ] Stale implementation/planning docs archived
- [ ] `.context/MANIFEST.md` updated
- [ ] Clean git commit with descriptive message

---

## Time Budget
This should take 30-45 minutes. If you find issues requiring judgment calls, document them in AUDIT-RESULTS.md and flag for human review rather than making assumptions.
