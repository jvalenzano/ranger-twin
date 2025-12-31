# RANGER Field Companion

> **Mobile Multimodal Sensor for the Digital Twin**

## Overview

The Field Companion is a Progressive Web App (PWA) designed to serve as the **Sensory Layer** for the RANGER platform. Unlike traditional field apps that focus on manual data entry, the Field Companion harnesses **multimodal AI** (Video, Voice, and Spatial Data) to automate the capture of forest intelligence.

It is the primary field interface for the **Trail Assessor** and **Cruising Assistant** agents.

## Design Philosophy: "Observational Assistant"

- **Multimodal Capture**: Simultaneously records video, ambient narration, and high-frequency GPS.
- **Offline-First**: Engineered for "Green Zone" operation with local SQLite buffering and asynchronous background sync.
- **Tactical UI**: Large, high-contrast touch targets designed for one-handed use in difficult terrain.
- **Voice-Native**: Support for voice-triggered data marking to keep hands free for tools or navigation.

## Technical Architecture

The application is structured to manage high-bandwidth data streams while maintaining extreme battery efficiency:

### src/ Structure
```
src/
├── components/
│   ├── camera/          # Multi-stream video capture + AR overlays
│   ├── voice/           # Ambient narration & Whisper-pre-processing
│   ├── spatial/         # High-frequency GPS & IMU (Compass/Gyro/Accel)
│   └── sync/            # Store-and-Forward background sync manager
├── hooks/
│   ├── useMultimodal.ts # Coordinates voice/video/GPS fusion
│   └── useOffline.ts     # SQLite/Dexie persistence logic
├── services/
│   ├── agentBridge.ts   # Formatting for Trail Assessor/Cruising Assistant
│   └── gcsUploader.ts   # Secure chunked upload to Google Cloud Storage
└── stores/              # Zustand state for ephemeral session data
```

## AI Capabilities (Harnessing & Functioning)

The Field Companion is built to "harness" mobile hardware to feed the RANGER "nerve center":

### 1. Trail Assessor Integration
- **Harnesses**: 1080p+ video and GPS tracks.
- **Function**: Automatically flags trail deficiencies (washouts, fallen trees) as the user walks throughout the forest.
- **Output**: Generates a synchronized "Damage Inventory" JSON that is injected into the Command Console.

### 2. Cruising Assistant Integration
- **Harnesses**: Close-up video (bark texture) and voice dictation.
- **Function**: "Speak-and-See" verification. When a user says "Douglas Fir, 24 inches," the AI verifies the species and DBH from the video feed.
- **Output**: Populates FSVeg-compatible plot records with visual proof layers.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production (Offline Manifest)
pnpm build
```

---

**Status:** Conceptual Scaffolding (Phase 1 Simulation)  
**Primary Developer:** TBD  
**Strategy Doc:** [FIELD-AI-STRATEGY.md](../../docs/architecture/FIELD-AI-STRATEGY.md)

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **AR** | Augmented Reality | Overlaying digital content on real-world view |
| **DBH** | Diameter at Breast Height | Standard forestry tree measurement (4.5 ft) |
| **FSVeg** | Forest Service Vegetation | USFS vegetation inventory data system |
| **GPS** | Global Positioning System | Satellite-based geolocation system |
| **GCS** | Google Cloud Storage | Cloud object storage service |
| **IMU** | Inertial Measurement Unit | Sensor for orientation/acceleration |
| **JSON** | JavaScript Object Notation | Lightweight data interchange format |
| **PWA** | Progressive Web App | Web app with native app capabilities |
| **SQLite** | SQL Lite | Embedded relational database |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
