# Field Companion

> Mobile PWA for field data capture - offline-first architecture

## Overview

The Field Companion is a Progressive Web App designed for trail crews, timber cruisers, and field foresters. It emphasizes one-handed operation, offline capability, and seamless data sync.

## Design Philosophy

- **Camera-centric**: Primary interface is video capture
- **One-handed operation**: Large touch targets, swipe gestures
- **Offline-first**: Full functionality without connectivity
- **Voice input**: Hands-free data capture via Whisper

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite (PWA plugin)
- **Styling**: Tailwind CSS
- **Offline**: Workbox service worker
- **Storage**: IndexedDB (Dexie.js)
- **Camera**: MediaDevices API

## Key Components

```
src/
├── components/
│   ├── camera/              # Video capture, damage marking
│   ├── voice/               # Voice recording interface
│   ├── sync/                # Sync queue indicator
│   └── common/              # Mobile-optimized components
├── hooks/
│   ├── useCamera.ts         # Camera access
│   ├── useGeolocation.ts    # GPS tracking
│   ├── useOfflineSync.ts    # Sync queue management
│   └── useVoiceRecorder.ts  # Audio recording
├── stores/                  # Zustand + IndexedDB persistence
└── workers/                 # Service worker, background sync
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production (includes SW)
pnpm build

# Preview PWA
pnpm preview
```

## Key Features

- [ ] Video capture with GPS correlation
- [ ] Voice note recording
- [ ] Offline damage point marking
- [ ] Background sync when online
- [ ] Trail selection and navigation
- [ ] Sync queue visualization

## PWA Manifest

```json
{
  "name": "RANGER AI Field Companion",
  "short_name": "Field Companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#10B981"
}
```

## Offline Strategy

1. Cache app shell on install
2. Store captured data in IndexedDB
3. Queue API requests for background sync
4. Sync when connectivity restored
5. Show sync status to user
