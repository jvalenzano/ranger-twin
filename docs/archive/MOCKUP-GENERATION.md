# RANGER Command Console: Mockup Generation Guide

**Purpose:** This document provides prompts and instructions for generating high-fidelity UI mockups of the RANGER Command Console.

**Current Mockup:** `ranger-mockup.png` (placeholder - needs regeneration)

---

## Design Brief

### Visual Identity: "Tactical Futurism"

The RANGER Command Console follows an **"F-35 Cockpit meets National Geographic"** aesthetic—mission-critical data presentation with the visual richness of nature documentary cinematography.

| Design Element | Specification |
|----------------|---------------|
| **Mode** | Dark Mode (default) |
| **Style** | Glassmorphism with layered translucent panels |
| **Palette** | Emergency management colors (Green/Amber/Red) |
| **Typography** | High-contrast, monospace for data; sans-serif for labels |
| **Animation** | Subtle, purposeful transitions; "cinematic zoom" for map navigation |

### Color Tokens

```css
--color-safe: #10B981;        /* Green - low severity, success */
--color-warning: #F59E0B;     /* Amber - moderate, caution */
--color-severe: #EF4444;      /* Red - high severity, critical */
--color-background: #0F172A;  /* Dark background */
--color-surface: #1E293B;     /* Card/panel backgrounds */
--color-glass: rgba(30, 41, 59, 0.8);  /* Glassmorphic overlays */
```

---

## The Crew: Agent Panel Layout

The left-hand sidebar displays the four core agents in a vertical "Lifecycle Rail":

| Phase | Agent | Icon Concept | Status Indicator |
|-------|-------|--------------|------------------|
| **1. Impact** | Burn Analyst | Satellite/flame | Severity heat gradient |
| **2. Damage** | Trail Assessor | Trail/camera | Damage count badge |
| **3. Timber** | Cruising Assistant | Tree/microphone | Plot completion % |
| **4. Compliance** | NEPA Advisor | Document/check | Citation count |

The **Recovery Coordinator** orchestrates across all agents and appears as a floating action button or command bar.

---

## Mockup Generation Prompts

### Option A: Google AI Studio (Gemini 2.0 Flash)

**System Instructions:**
```
You are a Lead UI/UX Creative Technologist specializing in Geospatial AI and high-end 3D interfaces (WebGL, Deck.gl, MapLibre). Your aesthetic is "Tactical Futurism": think F-35 Cockpit meets National Geographic. Use Dark Mode, Glassmorphism, and a vibrant color palette (Safe Green #10B981, Warning Amber #F59E0B, and Severe Red #EF4444). Focus on usability for field rangers and strategic planners.
```

**User Prompt:**
```
Design a high-fidelity mockup for the "RANGER Command Console" - a digital twin platform for the US Forest Service.

**The scenario:** A user is viewing the Cedar Creek Fire (Willamette National Forest, Oregon) in the 3D digital twin, with the Burn Analyst agent active.

**Key UI Elements to include:**
1. **Central 3D Map Viewport:** Photorealistic terrain with burn severity overlay (green/amber/red gradient). Include subtle topographic contours.
2. **Agent Lifecycle Rail (left sidebar):** Vertical stepper with four phases:
   - Impact (Burn Analyst) - ACTIVE, glowing green border
   - Damage (Trail Assessor) - pending
   - Timber (Cruising Assistant) - pending
   - Compliance (NEPA Advisor) - pending
3. **AI Insight Panel (glassmorphic overlay, top-right):**
   - "Burn Analyst" header with confidence indicator
   - Key stat: "42% High Severity | 31% Moderate | 27% Low"
   - "127,341 acres analyzed"
   - "Last updated: 2 hours ago"
4. **Map Controls (floating buttons, bottom-right):** Toggle for Satellite / Terrain / Infrared views
5. **Header Bar:** "RANGER" wordmark left, fire name "Cedar Creek Fire" center, user avatar right
6. **Dark background (#0F172A) with glassmorphic panels using rgba(30, 41, 59, 0.8)**

Style: Premium SaaS dashboard, not cartoonish. Think Bloomberg Terminal meets Google Earth.
```

---

### Option B: Midjourney / DALL-E

**Prompt:**
```
UI mockup of a dark mode geospatial command console for forest fire recovery. 3D terrain map as central viewport showing burn severity in green/amber/red gradient. Left sidebar with four vertical steps labeled Impact, Damage, Timber, Compliance. Glassmorphic translucent overlay panels with statistics. Premium SaaS aesthetic, Bloomberg Terminal meets Google Earth. Dark background #0F172A, accent green #10B981. High fidelity, 16:9 aspect ratio --ar 16:9 --v 6
```

---

### Option C: Figma/Sketch Manual Design

Reference files:
- Color tokens: See `docs/brand/BRAND-ARCHITECTURE.md`
- Component library: TBD in `packages/ui-components/`
- Inspiration: F-35 cockpit HUDs, Bloomberg Terminal, Google Earth Studio

---

## Mockup Checklist

Before finalizing a mockup, verify:

- [ ] Dark mode background (#0F172A)
- [ ] All four agents represented in lifecycle rail
- [ ] Agent names use role titles (Burn Analyst, not "FireSight")
- [ ] No "AI" suffix in visible UI labels
- [ ] Glassmorphic panels with proper transparency
- [ ] Emergency color palette (green/amber/red) for severity
- [ ] RANGER wordmark visible (not "Project RANGER AI")
- [ ] Cedar Creek Fire context (Oregon, Willamette NF)
- [ ] Confidence/citation indicators on agent output

---

## File Naming Convention

Generated mockups should follow this pattern:

```
ranger-{view}-{version}.png

Examples:
- ranger-mockup.png           (current placeholder)
- ranger-command-console-v1.png
- ranger-burn-analyst-active-v1.png
- ranger-mobile-field-companion-v1.png
```

---

## References

- [UX-VISION.md](../architecture/UX-VISION.md) - Full design philosophy
- [BRAND-ARCHITECTURE.md](../brand/BRAND-ARCHITECTURE.md) - Naming conventions and color tokens
- [PROJECT-BRIEF.md](../PROJECT-BRIEF.md) - Agent specifications and Cedar Creek context
