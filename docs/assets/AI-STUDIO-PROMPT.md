# RANGER Command Console: Google AI Studio Prompt

**Context:** This prompt is designed for multimodal models (like Gemini 2.0 Flash/Pro) to generate high-fidelity UI mockups or detailed design descriptions for the "RANGER" digital twin platform.

**Goal:** Create a visual representation of a forest fire recovery command center that blends military-grade situational awareness with high-end documentary cinematography.

---

## 1. System Instructions

**Role:** You are a Lead Creative Technologist at Territory Studio (the team behind Blade Runner 2049 and The Martian UI) specializing in "Tactical Futurism" interfaces. You merge the data density of an F-35 cockpit with the visual richness of a National Geographic documentary.

**Design Philosophy ("Tactical Futurism"):**
*   **Mode:** Dark Mode only (Deep Slate/Midnight Blue backgrounds).
*   **Materials:** High-end Glassmorphism. Panels are translucent layers of frosted glass with subtle backdrop blur (16-24px), not solid blocks.
*   **Typography:** Monospace numbers for data (e.g., `JetBrains Mono`, `Fira Code`); geometric sans-serif for labels (e.g., `Inter`, `Geist`).
*   **Aesthetic:** "Function is Beauty." No decorative fluff. Every line, border, and glow has a data-driven purpose.
*   **Visual Hierarchy:** Use luminosity to establish hierarchy—active elements glow, inactive elements recede into the dark.

**Brand Colors (Strict Adherence):**
*   `#0F172A` (Background - Slate 900)
*   `#1E293B` (Surface - Slate 800 with 80% opacity)
*   `#10B981` (Safe/Recovery - Emerald 500)
*   `#F59E0B` (Warning/Damage - Amber 500)
*   `#EF4444` (Severe/Danger - Red 500)
*   `#64748B` (Muted/Inactive - Slate 500)
*   `#F8FAFC` (Text Primary - Slate 50)

**Anti-Patterns (Avoid):**
*   Rounded corners > 8px (too friendly, not tactical)
*   Drop shadows without glow (prefer inner glow or edge lighting)
*   Pure white (#FFFFFF) anywhere—use off-white (#F8FAFC)
*   Gradient backgrounds on panels (use solid translucency)

---

## 2. The Prompt

**Copy and paste the following into the prompt box:**

```text
Generate a photorealistic, high-fidelity UI mockup of the "RANGER Command Console" running on a 4K display (3840x2160). This is a professional geospatial command center for the US Forest Service, not a consumer app.

**Scenario:**
The system is tracking the "Cedar Creek Fire" (127,000 acres) in the Willamette National Forest, Oregon. The user is in the "Impact Analysis" phase, reviewing burn severity data from the Burn Analyst agent to plan recovery operations.

**Screen Layout & Composition (Golden Ratio Proportions):**

1.  **Global Background:**
    *   Deep, dark slate (`#0F172A`) as the base.
    *   Subtle radial gradient emanating from the map center (very subtle, not distracting).
    *   No pure black—maintain rich depth with the slate tone.

2.  **Central Viewport (The "Hero" Content) — 75% of screen width:**
    *   A stunning 3D oblique-angle view of forested mountain terrain (Cascade Range topography).
    *   Camera angle: 45-degree pitch, looking northwest, ~10,000ft virtual altitude.
    *   **Visual Overlay:** A "Burn Severity" classification draped over the 3D terrain:
        *   Deep Red (`#EF4444`) areas (High Severity) concentrated in the fire origin.
        *   Glowing Amber (`#F59E0B`) transition zones (Moderate Severity) surrounding the red.
        *   Vibrant Green (`#10B981`) patches (Low/Unburned) on the periphery and riparian corridors.
    *   **Terrain texture:** Visible tree canopy texture in unburned areas, charred/bare terrain in high severity zones.
    *   *Cinematic touch:* Subtle volumetric haze over the terrain, morning light from the east casting long shadows.

3.  **Left "Lifecycle Rail" (Navigation) — 64px wide, full height:**
    *   A slim, vertical sidebar docked to the left edge with subtle glass effect.
    *   Contains four large icon-and-label step indicators connected by a thin vertical progress line (2px, `#64748B`).
    *   Each step has: Icon (24px), Label below, Status indicator.
    *   **Step 1: IMPACT** (Active State)
        *   Icon: Satellite dish with flame accent
        *   Label: "Impact"
        *   Style: Bright with glowing Emerald border (`#10B981`), filled background, white icon
        *   Badge: Green checkmark, "Complete"
    *   **Step 2: DAMAGE** (Next Up)
        *   Icon: Trail path with camera
        *   Label: "Damage"
        *   Style: Subtle glow, muted but visible, indicating "ready"
    *   **Step 3: TIMBER** (Pending)
        *   Icon: Pine tree with audio wave
        *   Label: "Timber"
        *   Style: Dimmed (`#64748B`), glassy, low opacity
    *   **Step 4: COMPLIANCE** (Pending)
        *   Icon: Document with shield/checkmark
        *   Label: "Compliance"
        *   Style: Dimmed (`#64748B`), glassy, low opacity

4.  **The "Insight HUD" (Top-Right Overlay) — 320px wide:**
    *   A floating, glassmorphic panel with:
        *   Frosted glass effect (backdrop-blur: 24px)
        *   1px border in `rgba(255,255,255,0.1)`
        *   Subtle inner glow on the active edge
    *   **Header Row:**
        *   Left: Small emerald dot (agent status: active)
        *   "BURN ANALYST" in tracked uppercase (`letter-spacing: 0.1em`)
        *   Right: "98.4% confidence" badge
    *   **Hero Metric:**
        *   "42%" in large display type (48-64px, `JetBrains Mono`)
        *   "High Severity" label below in muted text
    *   **Supporting Metrics (grid layout):**
        *   "127,341 ac" — Total Analyzed
        *   "53,484 ac" — High Severity
        *   "39,476 ac" — Moderate
        *   "34,381 ac" — Low/Unburned
    *   **Data Visualization:**
        *   Horizontal stacked bar (100% width of panel, 8px height)
        *   Segments: Red (42%) | Amber (31%) | Green (27%)
        *   Rounded ends (4px radius)
    *   **Footer:** "Updated 2h ago • Sentinel-2 L2A" in small muted text

5.  **Header Bar — 48px height, full width:**
    *   Subtle glass effect, nearly transparent
    *   **Left (padding-left: 80px to clear sidebar):**
        *   "RANGER" wordmark in bold, tracked-out geometric sans-serif
        *   Small "v0.1" version badge
    *   **Center:**
        *   Breadcrumb: "Willamette NF › Cedar Creek Fire › Impact Analysis"
        *   Fire icon with subtle amber glow
    *   **Right:**
        *   "Live" indicator with pulsing emerald dot
        *   Bell icon (notifications)
        *   User avatar circle with status ring

6.  **Map Controls (Bottom-Right, Floating) — Vertical stack:**
    *   Three toggle buttons in a glass pill:
        *   "SAT" (Satellite) — active state
        *   "TER" (Terrain)
        *   "IR" (Infrared)
    *   Zoom controls: + / - buttons
    *   Compass rose (small, subtle)

7.  **Scale Bar & Attribution (Bottom-Left):**
    *   "5 mi" scale bar
    *   "Imagery: Sentinel-2 • Elevation: 3DEP" attribution in 10px muted text

**Style Notes:**
*   Ensure WCAG AA contrast (4.5:1 minimum) between text and backgrounds.
*   Use thin 1px borders with low-opacity white for all panels (`rgba(255,255,255,0.08)`).
*   Panel corners: 6-8px radius maximum—sharp and tactical, not bubbly.
*   No cartoon aesthetics. Reference: Bloomberg Terminal, Palantir Gotham, NASA Mission Control.
*   Aspect Ratio: 16:9 (3840x2160 native).
*   The overall impression should be: "This is software built for people who save forests."
```

---

## 3. Iteration Strategy

### If the first result isn't perfect:

| Problem | Follow-up Prompt |
|---------|------------------|
| **Too dark/muddy** | "Increase terrain exposure by 20%. Add rim lighting to panel edges. The glass panels should have a distinct frosted edge highlight (1px white at 10% opacity)." |
| **Too cartoonish/gaming** | "Switch to photorealistic rendering style. Reference Unreal Engine 5 Lumen lighting. Use physically-based materials for glass (IOR 1.5, roughness 0.1). This is enterprise software, not a video game." |
| **Text is gibberish** | "Focus on spatial layout, color blocking, and panel composition. Use placeholder boxes where text would appear. Maintain exact positioning of the Insight HUD (top-right), Lifecycle Rail (left), and Header (top)." |
| **Colors are off-brand** | "Strictly use only these hex values: Background #0F172A, Panels #1E293B at 80% opacity, Green #10B981, Amber #F59E0B, Red #EF4444. No other colors except grayscale (#64748B for muted, #F8FAFC for text)." |
| **Too cluttered** | "Reduce information density by 30%. Increase whitespace between elements. The map viewport should feel expansive and cinematic, not cramped. Panels should float with breathing room." |
| **Not enough depth** | "Add layered depth: Background (map) → Mid-ground (subtle grid overlay at 5% opacity) → Foreground (glass panels with stronger blur). The z-axis hierarchy should be immediately readable." |

---

## 4. Alternate Prompts

### 4A: Mobile Field Companion View
```text
Generate a mobile UI mockup (iPhone 15 Pro, 1179x2556) of the "RANGER Field Companion" app.

The user is a field ranger reviewing a specific trail segment flagged by the Trail Assessor agent.

Show:
- Full-bleed photo of a damaged trail (washout/erosion)
- Bottom sheet with damage classification, severity, GPS coordinates
- Top status bar showing offline sync status
- "Capture Photo" floating action button

Style: Same Tactical Futurism aesthetic, but optimized for sunlight readability (slightly higher contrast).
```

### 4B: Multi-Agent Dashboard View
```text
Generate a dashboard mockup showing all four RANGER agents in a 2x2 grid layout.

Each agent card shows:
- Agent name and status (active/idle)
- Key metric from latest analysis
- Mini data visualization
- "Open" action button

The Recovery Coordinator appears as a command bar at the bottom, ready to synthesize insights.

Style: "Mission Control" aesthetic—multiple data streams at a glance.
```

---

## 5. Output Handling

### Saving the Mockup

1. Right-click the generated image → "Save image as..."
2. Save to: `docs/assets/`
3. Naming convention: `ranger-command-console-v{N}.png`
   - Example: `ranger-command-console-v1.png`
4. Update the reference in `docs/architecture/UX-VISION.md` if this becomes the canonical mockup

### Quality Checklist

Before adopting a mockup, verify:

- [ ] Dark background is correct slate (#0F172A), not pure black
- [ ] All four lifecycle phases are visible in left rail
- [ ] "RANGER" wordmark visible (not "Project RANGER AI")
- [ ] Agent name is "BURN ANALYST" (not "FireSight")
- [ ] Severity colors match spec (Green/Amber/Red)
- [ ] Glass panels have visible blur effect
- [ ] Overall impression: professional, tactical, not gaming/consumer
