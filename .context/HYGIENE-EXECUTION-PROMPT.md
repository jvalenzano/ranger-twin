# Repository Hygiene Execution Prompt

## Context
You are executing a repository hygiene cleanup for RANGER. The `.context/` directory structure has already been created with:
- `.context/README.md` - Directory purpose
- `.context/CLAUDE.md` - Streamlined agent context (~1000 tokens)
- `.context/architecture.md` - Current state summary
- `.context/GARDENING.md` - Weekly maintenance checklist
- `.context/MANIFEST.md` - Authoritative document index

## Your Task

### Step 1: Run the cleanup script
```bash
chmod +x scripts/hygiene-cleanup.sh
./scripts/hygiene-cleanup.sh
```

### Step 2: Verify the .context/ directory
```bash
ls -la .context/
cat .context/CLAUDE.md | head -50
```

### Step 3: Update the root CLAUDE.md
The root `CLAUDE.md` should now redirect to `.context/CLAUDE.md`. Replace its contents with a slim redirect:

```markdown
# CLAUDE.md

> **Primary context:** See `.context/CLAUDE.md` for streamlined agent instructions.

This file exists for backwards compatibility. The authoritative context lives in `.context/`.

## Quick Reference

- **Agent context:** `.context/CLAUDE.md`
- **Architecture:** `.context/architecture.md`
- **Maintenance:** `.context/GARDENING.md`
- **Doc manifest:** `.context/MANIFEST.md`

## Extended Reference (Original)

[Keep the existing content below for reference, but agents should prefer .context/ files]

---

[ORIGINAL CLAUDE.md CONTENT BELOW - FOR REFERENCE ONLY]

```

Actually, on second thought - keep the root CLAUDE.md as-is for now since Claude Code reads it automatically. We can revisit this later.

### Step 4: Commit the changes
```bash
git add -A
git status
git commit -m "chore: repository hygiene - initial cleanup

Created:
- .context/ directory with streamlined agent context
- .context/CLAUDE.md (~1000 tokens vs ~4000 in root)
- .context/architecture.md (current state summary)
- .context/GARDENING.md (weekly maintenance checklist)
- .context/MANIFEST.md (authoritative doc index)

Archived to docs/archive/2025-12/:
- DEPLOYMENT-CHECKLIST.md
- DEPLOYMENT-SUMMARY-PL010.md
- PL-006-DEPLOYMENT-REPORT.md
- CRITICAL-FIX-SUMMARY.md

Removed:
- Stray test_nepa_*.sh scripts (one-off artifacts)

This establishes the hygiene framework per expert panel recommendations.
See .context/GARDENING.md for ongoing maintenance process."
```

### Step 5: Verify clean state
```bash
# Root should be cleaner now
ls -la *.md

# Archive should have the reports
ls -la docs/archive/2025-12/

# .context/ should have 5 files
ls -la .context/
```

## Success Criteria

- [ ] Root directory has no `*-SUMMARY.md`, `*-REPORT.md`, `*-CHECKLIST.md` files (except README)
- [ ] `.context/` directory exists with 5 markdown files
- [ ] `docs/archive/2025-12/` contains archived deployment/fix reports
- [ ] No stray `test_*.sh` files at root
- [ ] Git commit created with hygiene changes

## Do NOT

- Do not modify any code files
- Do not delete any ADRs
- Do not modify `docs/specs/` or `docs/adr/`
- Do not touch the agents/ or apps/ directories
