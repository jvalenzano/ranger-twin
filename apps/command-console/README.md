# Command Console

> Desktop UI for Project RANGER - "Tactical Futurism" aesthetic

## Overview

The Command Console is the primary interface for strategic planners, District Rangers, and regional office staff. It provides a 3D digital twin visualization with AI agent interaction panels.

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
- **Mapping**: MapLibre GL JS + deck.gl
- **Charts**: Recharts
- **State**: Zustand

## Key Components

```
src/
├── components/
│   ├── map/                 # 3D viewport, layers, controls
│   ├── agents/              # Agent chat panels, insight cards
│   ├── lifecycle/           # Rail navigation (Impact→Damage→Timber→Compliance)
│   └── common/              # Glassmorphic cards, buttons, inputs
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand state stores
├── api/                     # API client for agent queries
└── styles/                  # Tailwind config, design tokens
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint & typecheck
pnpm lint
pnpm typecheck
```

## Design Tokens

```css
--color-safe: #10B981;
--color-warning: #F59E0B;
--color-severe: #EF4444;
--color-background: #0F172A;
--color-surface: #1E293B;
--color-glass: rgba(30, 41, 59, 0.8);
```

## Key Features

- [ ] 3D terrain rendering with deck.gl TerrainLayer
- [ ] Cinematic zoom from US map to Cedar Creek
- [ ] Lifecycle Rail navigation
- [ ] Agent chat interface with confidence scores
- [ ] Layer toggles (Satellite, 3D Canopy, Infrared, Trails)
- [ ] Timeline scrubber (pre-fire → post-fire → projected)
- [ ] Export to GeoJSON, PDF

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000
VITE_MAPLIBRE_STYLE=https://...
VITE_MAPTILER_KEY=...
```
