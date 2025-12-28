# RANGER Pitch Materials

> **Purpose:** Centralized home for pitch decks, one-pagers, and presentation assets organized by audience and use case.

## Directory Structure

```
docs/pitch/
├── README.md                 # This file - index and guidelines
├── decks/                    # Full pitch decks (Markdown source)
│   ├── proof-layer-showcase.md
│   ├── executive-overview.md
│   └── technical-deep-dive.md
├── one-pagers/               # Single-page summaries
│   ├── forest-supervisor.md
│   └── regional-leadership.md
├── screenshots/              # Annotated UI captures for decks
│   └── .gitkeep
└── templates/                # Reusable slide structures
    └── slide-template.md
```

## Deck Inventory

| Deck | Audience | Duration | Status |
|------|----------|----------|--------|
| [Proof Layer Showcase](decks/proof-layer-showcase.md) | Technical / Compliance | 15 min | Draft |
| Executive Overview | C-Suite / Regional Foresters | 10 min | Planned |
| Technical Deep Dive | IT / Architecture Review | 30 min | Planned |

## One-Pager Inventory

| Document | Audience | Use Case |
|----------|----------|----------|
| Forest Supervisor | District Rangers | Leave-behind after field demo |
| Regional Leadership | Forest Supervisors | Pre-meeting context |

## Screenshot Capture Guidelines

When capturing screenshots for pitch materials:

1. **Use production deployment** (not localhost)
2. **Expand reasoning accordions** before capture
3. **Include full viewport** with citations visible
4. **Naming convention:** `[agent]-[feature]-[date].png`
   - Example: `burn-analyst-reasoning-chain-2025-12-28.png`

## Design System Reference

All pitch materials should follow the Tactical Futurism aesthetic:

| Element | Value |
|---------|-------|
| Background | `#0F172A` (Slate 900) |
| Primary Accent | `#10B981` (Emerald 500) |
| Warning | `#F59E0B` (Amber 500) |
| Critical | `#EF4444` (Red 500) |
| Monospace Font | JetBrains Mono |
| Body Font | Inter |

See [BRAND-ARCHITECTURE.md](../brand/BRAND-ARCHITECTURE.md) for complete guidelines.

## Maintenance

- **Owner:** Product Team
- **Review Cycle:** Before each stakeholder presentation
- **Last Updated:** December 28, 2025
