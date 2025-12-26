# Command Console

> Desktop UI for Project RANGER - "Tactical Futurism" aesthetic

## Overview

The Command Console is the primary interface for strategic planners, District Rangers, and regional office staff. It provides a 3D digital twin visualization with AI agent interaction panels.

**Status:** Active Development (Track B1 Complete)

## Design Philosophy

- **F-35 Cockpit meets National Geographic**
- Dark mode default
- Glassmorphic translucent panels
- Information-dense displays
- Green/Amber/Red status indicators

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand
- **Future**: MapLibre GL JS + deck.gl

## Project Structure

```
src/
├── components/
│   ├── layout/              # Header, Sidebar (Lifecycle Rail)
│   ├── map/                 # Terrain3D, MapControls, Attribution
│   ├── panels/              # InsightPanel (agent metrics)
│   ├── briefing/            # BriefingObserver, renderers (Track B2)
│   └── ui/                  # Shared UI components
├── hooks/                   # useBriefingEvents, etc (Track B2)
├── stores/                  # Zustand stores (Track B2)
├── types/                   # TypeScript type definitions
└── styles/                  # CSS utilities
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Lint & typecheck
pnpm lint
pnpm typecheck
```

## Design Tokens

Defined in `tailwind.config.js`:

| Token | Value | Usage |
|-------|-------|-------|
| `safe` | `#10B981` | Success, low severity |
| `warning` | `#F59E0B` | Moderate, caution |
| `severe` | `#EF4444` | High severity, critical |
| `background` | `#020617` | Deep dark canvas |
| `surface` | `#0F172A` | Panel backgrounds |

## Current Features (Track B1)

- [x] 3D isometric terrain with animated contour lines
- [x] Fire perimeter overlay with thermal effects
- [x] Lifecycle Rail navigation (IMPACT/DAMAGE/TIMBER/COMPLIANCE)
- [x] InsightPanel with Burn Analyst metrics
- [x] Glassmorphic UI components
- [x] HUD scanlines and military aesthetic

## Upcoming (Track B2)

- [ ] BriefingObserver WebSocket integration
- [ ] AgentBriefingEvent renderers (rail_pulse, map_highlight, panel_inject, modal_interrupt)
- [ ] Zustand store for briefing events
- [ ] Real-time agent event handling

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```
