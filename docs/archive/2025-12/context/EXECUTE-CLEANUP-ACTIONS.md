# Repository Hygiene: Execute Cleanup Actions

## Context
The audit is complete (see `.context/AUDIT-RESULTS.md`). The repo is in good shape—most docs are current. We have a small, targeted set of cleanup actions to execute.

## Approved Actions

Execute these actions in order:

---

### Step 1: Remove `_!_` Prefixes (Rename Files)

```bash
cd /Users/jvalenzano/Projects/ranger-twin

# Rename the two _!_ prefixed files
git mv "docs/_!_IMPLEMENTATION-ROADMAP.md" "docs/IMPLEMENTATION-ROADMAP.md"
git mv "docs/_!_PRODUCT-SUMMARY.md" "docs/PRODUCT-SUMMARY.md"

echo "✓ Renamed _!_ prefixed files"
```

---

### Step 2: Update Cross-References

Search for any files that reference the old `_!_` filenames and update them:

```bash
# Find references to old filenames
grep -r "_!_IMPLEMENTATION-ROADMAP" docs/ .context/ --include="*.md" 2>/dev/null
grep -r "_!_PRODUCT-SUMMARY" docs/ .context/ --include="*.md" 2>/dev/null
```

For each file found, update the reference to remove the `_!_` prefix.

Also check and update:
- `docs/README.md`
- `.context/MANIFEST.md`
- Any specs that reference these files

---

### Step 3: Update ADR-007 Supersession Marker

Edit `docs/adr/ADR-007-tool-invocation-strategy.md` and update the header metadata to indicate it's superseded:

Add these lines near the top (after the title, in the metadata block):

```markdown
**Status:** Superseded by ADR-007.1
**Superseded By:** [ADR-007.1](./ADR-007.1-tool-invocation-strategy.md)
**Supersession Date:** 2025-12-28
```

If there's an existing `**Status:**` line, change it from `Accepted` to `Superseded by ADR-007.1`.

---

### Step 4: Archive Phase 2 Planning Doc

```bash
# Create planning archive directory
mkdir -p docs/archive/2025-12/planning

# Move the Phase 2 integration roadmap
git mv docs/INTEGRATION-ROADMAP.md docs/archive/2025-12/planning/

echo "✓ Archived INTEGRATION-ROADMAP.md"
```

Create the archive README:

```bash
cat > docs/archive/2025-12/planning/README.md << 'EOF'
# Planning Documents - December 2025

Archived during repository hygiene cleanup (2025-12-28).

## Contents

### INTEGRATION-ROADMAP.md
Phase 2 integration planning document mapping Phase 1 fixtures to Phase 2 live data sources.

- **Archived Reason:** Phase 2 focus; not blocking current Phase 1/4 development
- **Still Valid:** Yes, will be relevant when Phase 2 integration work begins
- **Restoration:** `git mv docs/archive/2025-12/planning/INTEGRATION-ROADMAP.md docs/`

---
*Archived: December 28, 2025*
EOF

echo "✓ Created archive README"
```

---

### Step 5: Remove Empty Planning Directory

```bash
# Remove empty directory (if it exists and is empty)
rmdir docs/planning 2>/dev/null && echo "✓ Removed empty docs/planning/" || echo "Directory not empty or doesn't exist"
```

---

### Step 6: Update .context/MANIFEST.md

Edit `.context/MANIFEST.md` to reflect the renamed files. Update the Tier 1 table:

Change:
```markdown
| Product Summary | `docs/_!_PRODUCT-SUMMARY.md` | What RANGER is |
```

To:
```markdown
| Product Summary | `docs/PRODUCT-SUMMARY.md` | What RANGER is |
```

Also add a note about the archived integration roadmap if it was previously listed.

---

### Step 7: Verify Changes

```bash
# Check no _!_ files remain outside archive
find docs -name "_!_*" | grep -v archive

# Check ADR-007 has supersession marker
grep -i "supersed" docs/adr/ADR-007-tool-invocation-strategy.md

# Check archive structure
ls -la docs/archive/2025-12/planning/

# Check renamed files exist
ls -la docs/IMPLEMENTATION-ROADMAP.md docs/PRODUCT-SUMMARY.md
```

---

### Step 8: Commit

```bash
git add -A
git status

# Review the changes look correct
git diff --cached --stat

git commit -m "chore: repository hygiene - first pass cleanup

Renamed (removed legacy _!_ prefix):
- docs/_!_IMPLEMENTATION-ROADMAP.md → docs/IMPLEMENTATION-ROADMAP.md
- docs/_!_PRODUCT-SUMMARY.md → docs/PRODUCT-SUMMARY.md

Archived:
- docs/INTEGRATION-ROADMAP.md → docs/archive/2025-12/planning/
  (Phase 2 planning doc, not blocking current work)

ADR updates:
- ADR-007: Added supersession marker (superseded by ADR-007.1)

Removed:
- Empty docs/planning/ directory

Audit: 62 docs scanned, repo is actively maintained, no stale content found.
See .context/AUDIT-RESULTS.md for full report."
```

---

## What NOT To Do

- Do NOT archive any other docs (audit found they're all current)
- Do NOT consolidate runbooks (they serve complementary purposes)
- Do NOT modify any code files
- Do NOT delete any ADRs

---

## Success Criteria

After execution, verify:
- [ ] No `_!_` prefixed files in `docs/` (outside archive)
- [ ] `docs/IMPLEMENTATION-ROADMAP.md` exists (renamed)
- [ ] `docs/PRODUCT-SUMMARY.md` exists (renamed)
- [ ] `docs/adr/ADR-007-tool-invocation-strategy.md` has supersession marker
- [ ] `docs/archive/2025-12/planning/INTEGRATION-ROADMAP.md` exists
- [ ] `docs/planning/` directory removed (or was already empty)
- [ ] `.context/MANIFEST.md` updated with correct paths
- [ ] Git commit created

---

## Time Estimate
15-20 minutes for full execution and verification.
