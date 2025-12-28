#!/bin/bash
# RANGER Repository Hygiene - Initial Cleanup Script
# Run from repository root: /Users/jvalenzano/Projects/ranger-twin
# 
# This script:
# 1. Creates the .context/ directory structure
# 2. Moves root-level sediment to archive
# 3. Cleans up stray test files

set -e  # Exit on error

REPO_ROOT="/Users/jvalenzano/Projects/ranger-twin"
ARCHIVE_DIR="docs/archive/2025-12"

cd "$REPO_ROOT"

echo "=== RANGER Repository Hygiene Script ==="
echo "Working directory: $(pwd)"
echo ""

# ============================================
# PHASE 1: Archive root-level sediment
# ============================================
echo "--- Phase 1: Archiving root-level deployment/fix reports ---"

mkdir -p "$ARCHIVE_DIR/deployment-reports"
mkdir -p "$ARCHIVE_DIR/fix-reports"

# Move deployment reports
if [ -f "DEPLOYMENT-CHECKLIST.md" ]; then
    git mv "DEPLOYMENT-CHECKLIST.md" "$ARCHIVE_DIR/deployment-reports/" 2>/dev/null || mv "DEPLOYMENT-CHECKLIST.md" "$ARCHIVE_DIR/deployment-reports/"
    echo "  ✓ Moved DEPLOYMENT-CHECKLIST.md"
fi

if [ -f "DEPLOYMENT-SUMMARY-PL010.md" ]; then
    git mv "DEPLOYMENT-SUMMARY-PL010.md" "$ARCHIVE_DIR/deployment-reports/" 2>/dev/null || mv "DEPLOYMENT-SUMMARY-PL010.md" "$ARCHIVE_DIR/deployment-reports/"
    echo "  ✓ Moved DEPLOYMENT-SUMMARY-PL010.md"
fi

if [ -f "PL-006-DEPLOYMENT-REPORT.md" ]; then
    git mv "PL-006-DEPLOYMENT-REPORT.md" "$ARCHIVE_DIR/deployment-reports/" 2>/dev/null || mv "PL-006-DEPLOYMENT-REPORT.md" "$ARCHIVE_DIR/deployment-reports/"
    echo "  ✓ Moved PL-006-DEPLOYMENT-REPORT.md"
fi

# Move fix reports
if [ -f "CRITICAL-FIX-SUMMARY.md" ]; then
    git mv "CRITICAL-FIX-SUMMARY.md" "$ARCHIVE_DIR/fix-reports/" 2>/dev/null || mv "CRITICAL-FIX-SUMMARY.md" "$ARCHIVE_DIR/fix-reports/"
    echo "  ✓ Moved CRITICAL-FIX-SUMMARY.md"
fi

# ============================================
# PHASE 2: Clean up stray test scripts
# ============================================
echo ""
echo "--- Phase 2: Cleaning up stray test scripts ---"

# Move or delete one-off test scripts
for f in test_nepa_curl.sh test_nepa_final.sh test_nepa_fix.py test_nepa_fix.sh; do
    if [ -f "$f" ]; then
        rm "$f"
        echo "  ✓ Removed $f (one-off test script)"
    fi
done

# ============================================
# PHASE 3: Create archive README if not exists
# ============================================
echo ""
echo "--- Phase 3: Creating archive README ---"

if [ ! -f "$ARCHIVE_DIR/README.md" ]; then
    cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# Archive - December 2025

This folder contains documentation artifacts archived during repository hygiene sessions.

## Contents

### `/deployment-reports/`
One-time deployment summaries and checklists. Preserved for historical reference.

### `/fix-reports/`
Critical fix documentation from specific bug fixes.

## Why Archived

These files were created during active development sprints and served their purpose. They are now:
1. **Superseded** by ADRs and runbooks
2. **Point-in-time** artifacts that don't reflect current state
3. **Root-level clutter** that complicated navigation

## Current Locations

| Looking For | Current Location |
|-------------|------------------|
| AgentTool pattern | `docs/adr/ADR-008-agent-tool-pattern.md` |
| Tool invocation | `docs/adr/ADR-007.1-tool-invocation-strategy.md` |
| Deployment procedures | `docs/deployment/` |
| ADK patterns | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |

---

*Archived: December 28, 2025*
EOF
    echo "  ✓ Created archive README"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=== Cleanup Complete ==="
echo ""
echo "Files archived to: $ARCHIVE_DIR/"
echo ""
echo "Next steps:"
echo "  1. Review .context/ directory (already created)"
echo "  2. Run: git add -A && git status"
echo "  3. Commit: git commit -m 'chore: repository hygiene - archive deployment reports'"
echo ""
echo "To verify .context/ exists:"
echo "  ls -la .context/"
