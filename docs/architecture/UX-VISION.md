# RANGER Command Console: UI/UX Vision

This document outlines the "Command & Control" interface designed for the US Forest Service, transitioning from a macro-level US map to a high-fidelity 3D "Digital Twin" of specific forest fire sites.

## 1. Tactical Forest Intelligence

The interface is built on the principle of **"Macro-to-Micro Intelligence."** It allows a strategic planner to see the entire national landscape and then dive into a hyper-detailed "Digital Twin" of a specific fire event.

### Key Design Features

1.  **3D Digital Twin Engine:** The central viewport displays a photorealistic 3D model of the forest. It overlays real-time AI detections like burn severity and heat signatures directly onto the terrain.
2.  **Post-Fire Lifecycle Rail:** The left-hand sidebar provides a direct link to the four core AI agents ("The Crew"):
    - **Impact (Burn Analyst):** Satellite-based burn assessment.
    - **Damage (Trail Assessor):** Computer vision identification of trail washouts.
    - **Timber (Cruising Assistant):** Multimodal data for salvage logging.
    - **Compliance (NEPA Advisor):** AI-assisted regulatory workflows.
3.  **AI Insight HUD:** Translucent, glassmorphic panels provide high-level metrics and "What-If" scenarios, such as estimated timber loss or recovery timelines.

## 2. Design Mockups: "The Ranger's Command Console"

### V2: Hero Mockup (3D Terrain Visualization)

![RANGER Command Console v2](../assets/mockup-iterations/ranger-command-console-v2.png)

*Approved v2 hero mockup — December 2025. This represents the **IMPACT** lifecycle view.*

**Key Features (IMPACT View):**
- **3D Terrain:** Organic topographic contours with 25 elevation layers, isometric perspective.
- **Fire Visualization:** Pulsing thermal gradient representing burn intensity/severity.
- **Tactical HUD:** Coordinate grid, crosshairs, and dot grid overlay.
- **Lifecycle Context:** This shows the initial assessment phase where satellite data defines the fire's footprint.

### UI Framework: Shared Chrome vs. View-Specific Content

The Command Console uses a unified shell ("The Chrome") that persists across all lifecycle views, while the central viewport and side panels reflect the active agent's focus.

| Component | Type | Description |
|-----------|------|-------------|
| **Navigation Header** | Shared | Branding, global search, and fire event selector. |
| **Lifecycle Rail** | Shared | Vertical navigation between IMPACT, DAMAGE, TIMBER, and COMPLIANCE. |
| **3D Terrain Engine** | Shared | The base digital twin (3DEP terrain + satellite base maps). |
| **Agent Insight Panel** | View-Specific | The glassmorphic HUD that changes content based on the active agent (e.g., Burn Analyst metrics vs. Trail Assessor work orders). |
| **Tactical Overlays** | View-Specific | Map layers (burn severity dNBR, trail GPS lines, timber stand polygons) specific to the workflow. |
| **Multimodal Controls** | Shared | View toggles (Sat/3D/IR), zoom, and orientation controls. |

## 3. Design Rationale: "Tactical Futurism"
- **Dark Mode:** Reduces eye strain for operators working in low-light command centers or field conditions.
- **Glassmorphism:** Layered translucent elements keep the focus on the primary 3D map while providing context.
- **Vibrant HUD Palette:** Uses standardized emergency management colors (Green/Amber/Red) to signal urgency and safety levels at a glance.

---

## 4. Prototyping Roadmap

### Google AI Studio: The "Super-Prompt"
To prototype this vision, use the following **System Instructions** and **User Prompt** in Google AI Studio with **Gemini 2.0 Flash**.

#### System Instructions
> You are a Lead UI/UX Creative Technologist specializing in Geospatial AI and high-end 3D interfaces (WebGL, Deck.gl, Mapbox). Your aesthetic is "Tactical Futurism": think F-35 Cockpit meets National Geographic. Use Dark Mode, Glassmorphism, and a vibrant color palette (Safe Green `#10B981`, Warning Amber `#F59E0B`, and Severe Red `#EF4444`). Focus on usability for field rangers and strategic planners.

#### User Prompt
> "Design a high-fidelity React component for the 'RANGER Command Console'.
>
> **The scenario:** A user is zooming from a macro view of the USA (pulsing fire beacons) into a hyper-detailed 3D digital twin of the Cedar Creek Fire.
>
> **Key UI Elements to include:**
> 1. **Interactive 3D Map Placeholder:** A central viewport with a 'Cinematic Zoom' animation trigger.
> 2. **Lifecycle Rail:** A vertical stepper showing: [Impact Analysis] -> [Damage Mapping] -> [Timber Recovery] -> [NEPA Compliance].
> 3. **AI Insight Overlay:** A translucent 'Glassmorphic' window showing real-time AI detections (e.g., 'The Burn Analyst detected 40% high-severity burn area').
> 4. **Multimodal Controls:** Floating buttons to toggle 'Satellite', '3D Canopy', and 'Infrared' views.
