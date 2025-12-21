# RANGER: Next Session Roadmap

**Last Updated:** December 20, 2025
**Current Phase:** Mockup Complete → Engineering Scaffold

---

## What We Have

### Mockups (Complete)
| Version | File | Purpose |
|---------|------|---------|
| V1 | `docs/assets/mockup-iterations/ranger-command-console-v1.png` | Clean UI chrome reference |
| V2 | `docs/assets/mockup-iterations/ranger-command-console-v2.png` | Hero mockup with 3D terrain |

### Code Export (Ready to Integrate)
```
docs/assets/temp/ranger-command-console-v2/
├── App.tsx              # Main component with Terrain3D visualization
├── components/
│   ├── Attribution.tsx  # Scale bar, data source attribution
│   ├── Header.tsx       # RANGER header with breadcrumbs
│   ├── InsightPanel.tsx # BURN ANALYST glassmorphic panel
│   ├── MapControls.tsx  # SAT/TER/IR toggle, zoom controls
│   └── Sidebar.tsx      # Lifecycle rail (IMPACT/DAMAGE/TIMBER/COMPLIANCE)
├── index.html           # Entry point with Tailwind styles
├── index.tsx            # React root
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite build config
```

### App Scaffold (Empty, Ready for Code)
```
apps/command-console/
├── public/
├── README.md
└── src/
    ├── assets/
    ├── components/
    │   ├── layout/      # Header, Sidebar
    │   ├── map/         # Terrain visualization, MapLibre integration
    │   ├── panels/      # Agent HUD panels
    │   └── ui/          # Shared primitives
    ├── hooks/
    ├── stores/
    ├── styles/
    └── utils/
```

---

## Next Session Options

### Option A: Integrate V2 Code into Scaffold
**Goal:** Get the mockup running locally as a real React app

**Steps:**
1. Copy V2 export components into `apps/command-console/src/`
2. Set up Vite + Tailwind + TypeScript
3. Install dependencies (`pnpm install`)
4. Run dev server (`pnpm dev`)
5. Verify mockup renders correctly in browser

**Outcome:** Working local dev environment with animated terrain mockup

---

### Option B: Replace CSS Terrain with Real Mapping
**Goal:** Swap the CSS/SVG terrain with actual geospatial libraries

**Steps:**
1. Install MapLibre GL JS + deck.gl
2. Create `TerrainLayer` component with 3DEP elevation data
3. Add burn severity raster overlay (dNBR from MTBS)
4. Keep the UI chrome (header, panels, controls) from V2
5. Connect to Cedar Creek Fire sample data

**Outcome:** Real 3D terrain with actual fire data

---

### Option C: Build Burn Analyst Agent Backend
**Goal:** Create the API that powers the BURN ANALYST panel

**Steps:**
1. Set up FastAPI in `services/api-gateway/`
2. Create `/api/v1/burn-analyst/query` endpoint
3. Integrate Google Earth Engine for dNBR calculation
4. Return severity stats, confidence scores
5. Wire up frontend panel to live API

**Outcome:** Real AI agent returning real burn analysis

---

### Option D: Generate Additional Lifecycle Mockups
**Goal:** Create DAMAGE, TIMBER, COMPLIANCE views

**Steps:**
1. Use Google AI Studio with V2 as base
2. Swap BURN ANALYST panel for TRAIL ASSESSOR (DAMAGE view)
3. Create variations for TIMBER and COMPLIANCE lifecycle steps
4. Export screenshots for stakeholder deck

**Outcome:** Complete mockup set for all four lifecycle stages

---

## Recommended Path

**For next session:** Start with **Option A** (integrate code locally).

Getting the mockup running in a real dev environment unblocks everything else:
- You can iterate faster in VS Code than AI Studio
- You can add real mapping libraries incrementally
- You have a working demo for stakeholders

After Option A is complete, move to Option B (real mapping) or Option C (backend), depending on whether you want to polish the frontend or build the AI agent.

---

## Quick Start Commands

```bash
# Navigate to command console
cd apps/command-console

# Copy V2 export (manual step)
# cp -r docs/assets/temp/ranger-command-console-v2/* .

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open browser
# http://localhost:5173
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/NEXT-SESSION.md` | **This file** — roadmap for next session |
| `docs/architecture/UX-VISION.md` | Design philosophy, mockup references |
| `docs/assets/MOCKUP-SESSION-LOG.md` | Full iteration history |
| `docs/assets/DESIGN-SPEC-HANDOFF.md` | CSS tokens, typography, component specs |
| `apps/command-console/README.md` | App-specific setup instructions |
| `CLAUDE.md` | Project overview for AI assistants |

---

## Session Wrap-Up Checklist

Before ending any session:
- [ ] Screenshot any new mockups → `docs/assets/mockup-iterations/`
- [ ] Export code changes → `docs/assets/temp/` or directly to `apps/`
- [ ] Update `NEXT-SESSION.md` with new roadmap items
- [ ] Commit with descriptive message
- [ ] Note any blockers or decisions needed
