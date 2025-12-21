# Google AI Studio Build Prompt: RANGER Command Console

To use this prompt in Google AI Studio, upload the `nervous_system_ui_mockup_1766225237036.png` image and paste the following text:

---

## The Vision
"Bring to life this **Agentic OS for Natural Resource Recovery**, named **RANGER**. This is not a static dashboard; it is a 'Nervous System' interface where AI agents act as workflow lenses. The aesthetic is **Tactical Futurism**: high-precision, glassmorphic, and mission-critical."

### 1. Layout & Framework
- Create a **React-based Single Page Application** using **Vite** and **Tailwind CSS**.
- Use **MapLibre GL** for the central 3D viewport (initialize with a dark terrain map of the Pacific Northwest).
- Implement a **Left-side Lifecycle Rail** with four distinct segments: [IMPACT, DAMAGE, TIMBER, COMPLIANCE].
- Add a **Right-side AI Briefing Panel** for deep-dive insights.

### 2. The "Nervous System" UI (The Pulse)
- Implement a **Rhythmic Glow (Pulse)** on the Lifecycle Rail segments. 
- Use **Framer Motion** to create a breathing animation:
    - Default: A low-frequency, subtle Forest Emerald (`#10B981`) glow.
    - Warning: A higher-frequency Amber (`#F59E0B`) pulse.
    - Critical: A sharp, rhythmic Red (`#EF4444`) "heartbeat."

### 3. The "Synapse" (Interactive Briefings)
- The Right Panel must render **AgentBriefingEvents**. When an agent item is clicked, animate a "Synapse Expansion"—a vertical accordion that reveals a **Reasoning Chain** (Observations ➔ Logic ➔ Recommendation).
- Use **Glassmorphism** for all panels: `backdrop-blur-xl`, `bg-slate-900/60`, and a subtle 1px border `border-slate-700/50`.

### 4. Asset Integration
- Use the uploaded image as the visual anchor for the 3D map hotspots and the "Command Console" header.
- The 3D view should contain **Tactical Hotspots** (interactive markers) that correspond to events (e.g., "Bridge Washout" at coordinates `43.8923, -122.1245`).

### 5. Color Tokens
- **Background:** Obsidian Slate (`#0F172A`)
- **Primary/Safe:** Forest Emerald (`#10B981`)
- **Attention:** Tactical Amber (`#F59E0B`)
- **Emergency:** Magma Red (`#EF4444`)
- **Text:** High-contrast Monospace (`JetBrains Mono`) for metrics, clean Sans-serif (`Inter`) for narratives.

### 6. Interaction Logic
- Clicking a rail segment should update the global state and re-center the 3D map on relevant data sectors.
- Suggested Action buttons (e.g., "Approve Work Order") should have a "Naptic" hover effect (slight scale and glow intensity increase).

"Build me a functional prototype that captures this 'Live Surface' feel—authoritative, transparent, and agent-native."
