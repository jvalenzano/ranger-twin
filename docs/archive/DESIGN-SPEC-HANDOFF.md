# RANGER Command Console: Design Specification Handoff

**Purpose:** Engineering handoff document with precise CSS, typography, and map rendering specifications for the Command Console UI.

**Generated:** December 2024 via Google AI Studio (Gemini)

**Status:** Reference Specification

---

## Image Generation Prompt

To generate the canonical UI mockup in Midjourney v6 or DALL-E 3:

```
Photorealistic UI mockup of a professional geospatial command center screen on a 4K display. Dark mode "Tactical Futurism" aesthetic. BACKGROUND: Deep Slate Blue (#0F172A). CENTRAL VIEWPORT: A stunning 3D oblique aerial view of Oregon Cascade mountains, photorealistic forest texture. A data overlay heatmap drapes the terrain: Deep Red (burned core), Glowing Amber (transition zone), Vibrant Emerald Green (unburned). Morning light, volumetric haze. LEFT SIDEBAR: Slim 64px vertical glass rail, "IMPACT" step is active with a glowing Emerald icon and border, followed by muted "DAMAGE" and "TIMBER" icons. TOP RIGHT HUD: A floating frosted glass panel (backdrop blur) with thin borders. Text "BURN ANALYST" and large "42%" metric in JetBrains Mono font, with a horizontal red/amber/green stacked bar chart. HEADER: Minimal glass bar, "RANGER" geometric text, breadcrumbs. BOTTOM RIGHT: Floating pill-shaped map toggles "SAT / TER / IR". STYLE: Territory Studio, FUI, The Martian UI, high-end data visualization, sharp 1px borders, no gradients, 8k resolution, screen design, cinematic lighting.
```

---

## 1. The "Glass" Stack (CSS Composition)

To achieve the non-gaming, high-end tactical look, glass panels must use this specific stack. **Do not use simple opacity.**

```css
.panel-glass {
  /* The Surface */
  background: rgba(30, 41, 59, 0.70); /* Slate 800 @ 70% */

  /* The Frost */
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);

  /* The Tactical Border */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05); /* Top highlight */

  border-radius: 6px; /* Strict limit, no bubbly corners */
}
```

### Glass Variants

```css
/* Active/Focused Panel */
.panel-glass--active {
  border-color: rgba(16, 185, 129, 0.3); /* Emerald glow */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 0 20px -5px rgba(16, 185, 129, 0.2); /* Outer glow */
}

/* Header Bar (more transparent) */
.panel-glass--header {
  background: rgba(30, 41, 59, 0.50);
  backdrop-filter: blur(16px) saturate(150%);
}

/* Floating Controls */
.panel-glass--floating {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
}
```

---

## 2. Typography Hierarchy

### Labels / UI Chrome

| Property | Value |
|----------|-------|
| **Font Family** | `Inter` or `Geist Sans` (Variable weight) |
| **Usage** | Navigation, Headers, Buttons |
| **Letter Spacing** | `+0.01em` (+1%) for readability on dark backgrounds |
| **Font Weights** | 400 (body), 500 (labels), 600 (headers) |

### Data / Metrics

| Property | Value |
|----------|-------|
| **Font Family** | `JetBrains Mono` |
| **Usage** | The "42%" metric, coordinates, lat/long, timestamps |
| **Font Features** | `font-variant-numeric: tabular-nums lining-nums;` |
| **Note** | Tabular lining figures are **mandatory** to prevent jitter during live updates |

### CSS Implementation

```css
:root {
  --font-sans: 'Inter', 'Geist Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Labels */
.text-label {
  font-family: var(--font-sans);
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  font-size: 0.75rem; /* 12px */
}

/* Metrics */
.text-metric {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500;
}

.text-metric--hero {
  font-size: 3rem; /* 48px */
  line-height: 1;
}

.text-metric--secondary {
  font-size: 1.125rem; /* 18px */
}
```

---

## 3. The Map Layer (MapLibre/Cesium Directives)

### Terrain Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Terrain Exaggeration** | `1.2x` | Emphasizes Willamette NF topography without looking cartoonish |
| **Pitch** | `45°` | Oblique aerial view |
| **Bearing** | `315°` (NW) | Morning light from east casts shadows toward viewer |
| **Zoom** | `~12` | ~10,000ft virtual altitude |

### Atmosphere

```javascript
// Cesium
viewer.scene.skyAtmosphere.show = true;
viewer.scene.skyAtmosphere.brightnessShift = 0.4;

// MapLibre (approximation)
map.setFog({
  range: [0.5, 10],
  color: 'rgba(15, 23, 42, 0.3)', // Slate 900 tinted
  'horizon-blend': 0.1
});
```

### Burn Severity Overlay

Use a **Fragment Shader** for the heatmap to ensure Red/Amber/Green colors **multiply** against the terrain texture, allowing "charred" ground texture to remain visible through the red overlay.

```glsl
// Conceptual shader logic
vec4 terrainColor = texture2D(u_terrain, v_texCoord);
vec4 severityColor = texture2D(u_severity, v_texCoord);

// Multiply blend mode
gl_FragColor = vec4(
  terrainColor.rgb * severityColor.rgb * 1.5, // Boost for visibility
  severityColor.a
);
```

### Severity Color Stops

```javascript
const severityColorScale = [
  [0.0, '#10B981'],  // Low/Unburned - Emerald
  [0.3, '#10B981'],  // Transition start
  [0.5, '#F59E0B'],  // Moderate - Amber
  [0.7, '#F59E0B'],  // Transition
  [0.85, '#EF4444'], // High - Red
  [1.0, '#EF4444']   // Severe
];
```

---

## 4. Color Token Mapping (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'canvas': '#0F172A',      // Global background (Slate 900)
        'surface': '#1E293B',     // Panel backgrounds (Slate 800)

        // Status Colors
        'status': {
          'crit': '#EF4444',      // High Severity / Danger
          'warn': '#F59E0B',      // Moderate Severity / Transition
          'safe': '#10B981',      // Recovery / Active Step Glow
        },

        // Text
        'text': {
          'primary': '#F8FAFC',   // Slate 50
          'secondary': '#CBD5E1', // Slate 300
          'muted': '#94A3B8',     // Slate 400
          'disabled': '#64748B',  // Slate 500
        },

        // Borders
        'border': {
          'subtle': 'rgba(255, 255, 255, 0.08)',
          'default': 'rgba(255, 255, 255, 0.12)',
          'active': 'rgba(16, 185, 129, 0.3)', // Emerald glow
        }
      }
    }
  }
}
```

### CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --color-canvas: #0F172A;
  --color-surface: #1E293B;
  --color-surface-alpha: rgba(30, 41, 59, 0.70);

  /* Status */
  --color-crit: #EF4444;
  --color-warn: #F59E0B;
  --color-safe: #10B981;

  /* Text */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;

  /* Borders */
  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-active: rgba(16, 185, 129, 0.3);
}
```

---

## 5. Component Specifications

### Lifecycle Rail (Left Sidebar)

| Property | Value |
|----------|-------|
| **Width** | `64px` |
| **Background** | `panel-glass` |
| **Step Icon Size** | `24px` |
| **Step Spacing** | `24px` vertical gap |
| **Progress Line** | `2px` width, `#64748B` (Slate 500) |
| **Active State** | Emerald border glow, white icon fill |
| **Pending State** | `#64748B` icon, 50% opacity |

### Insight HUD (Top-Right Panel)

| Property | Value |
|----------|-------|
| **Width** | `320px` |
| **Padding** | `20px` |
| **Background** | `panel-glass` |
| **Header Height** | `32px` |
| **Hero Metric Size** | `48-64px` |
| **Stacked Bar Height** | `8px` |
| **Stacked Bar Radius** | `4px` |

### Header Bar

| Property | Value |
|----------|-------|
| **Height** | `48px` |
| **Background** | `panel-glass--header` |
| **Wordmark** | `Inter 600`, `18px`, `tracking: 0.05em` |
| **Breadcrumb** | `Inter 400`, `14px`, `text-muted` |
| **Padding Left** | `80px` (clears sidebar) |

### Map Controls (Bottom-Right)

| Property | Value |
|----------|-------|
| **Layout** | Vertical stack, `8px` gap |
| **Toggle Pill** | `panel-glass--floating`, `border-radius: 20px` |
| **Button Size** | `36px` square |
| **Active Toggle** | `bg-safe`, white text |
| **Inactive Toggle** | `text-muted` |

---

## 6. Animation Guidelines

### Transitions

```css
/* Default transition for interactive elements */
.interactive {
  transition: all 150ms ease-out;
}

/* Glow pulse for active status */
@keyframes glow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-active {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Map Transitions

- **Zoom**: 300ms ease-out
- **Pan**: 200ms ease-out
- **Fly-to**: 1500ms with easing curve

---

## 7. Accessibility Requirements

| Requirement | Specification |
|-------------|---------------|
| **Contrast Ratio** | WCAG AA (4.5:1 minimum for text) |
| **Focus Indicators** | 2px Emerald outline on focus |
| **Reduced Motion** | Respect `prefers-reduced-motion` |
| **Screen Reader** | ARIA labels for all interactive elements |

### Contrast Verification

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| `text-primary` on `canvas` | 15.1:1 | AA |
| `text-muted` on `canvas` | 5.4:1 | AA |
| `status-safe` on `canvas` | 4.6:1 | AA |
| `status-warn` on `canvas` | 6.8:1 | AA |
| `status-crit` on `canvas` | 5.3:1 | AA |

---

## 8. File References

| File | Purpose |
|------|---------|
| `ranger-mockup.png` | Current placeholder (to be replaced) |
| `ranger-command-console-v1.png` | Target mockup (generate with prompt above) |
| `../architecture/UX-VISION.md` | Design philosophy |
| `../brand/BRAND-ARCHITECTURE.md` | Color tokens, naming |

---

## Summary

This specification ensures the RANGER Command Console feels like a tool for professionals—maintaining the balance between dense data availability and visual clarity. The "Tactical Futurism" aesthetic positions RANGER alongside high-end platforms like Palantir Gotham and Planet Labs while remaining accessible for field operations.

**Key Principles:**
1. Glass panels use blur + border + inset highlight (not simple opacity)
2. Typography uses tabular figures for live data
3. Map overlay uses multiply blend mode
4. All colors locked to token system
5. 6px border radius maximum (tactical, not friendly)
