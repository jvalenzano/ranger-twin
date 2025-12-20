# Google AI Studio Workflow for RANGER Mockups

**Purpose:** Step-by-step guide for generating high-fidelity UI mockups using Google AI Studio.

**Last Updated:** December 2024

---

## Prerequisites

- A Google account (any Gmail works)
- Browser with internet access
- No installation or credit card required for free tier

---

## Step 1: Access Google AI Studio

1. Open your browser and navigate to **[aistudio.google.com](https://aistudio.google.com)**
2. Sign in with your Google account
3. You'll land on the Home dashboard

---

## Step 2: Navigate to Playground

The left sidebar contains:

| Section | Purpose |
|---------|---------|
| **Home** | Dashboard with quick actions |
| **Playground** | Prompt testing and image generation |
| **Build** | React app generation ("vibe coding") |
| **Stream** | Voice/video interactions |
| **Dashboard** | Usage and API key management |

**Click "Playground"** — this is where we generate mockups.

---

## Step 3: Select the Right Model

At the top of the Playground, locate the **model dropdown**.

### Model Options

| Model | Best For | Tier | Rate Limit |
|-------|----------|------|------------|
| `gemini-2.5-flash` | Fast text/reasoning | Free | 15 RPM |
| `gemini-2.5-pro` | Deep reasoning, Maps | Free | 5 RPM |
| `gemini-3-pro` | Complex analysis | Paid | — |
| `gemini-3-pro-image` | **Image generation with text** | Paid | — |

### For RANGER Mockups

- **Paid tier:** Select `gemini-3-pro-image` (best quality, renders UI text properly)
- **Free tier:** Select `gemini-2.5-flash` and request detailed descriptions, then use with external image generators

---

## Step 4: Configure System Instructions

In the right sidebar, find **"System Instructions"**. This sets the model's persona for the entire session.

**Copy and paste:**

```
You are a Lead Creative Technologist at Territory Studio (the team behind Blade Runner 2049 and The Martian UI) specializing in "Tactical Futurism" interfaces. You merge the data density of an F-35 cockpit with the visual richness of a National Geographic documentary.

Design Philosophy ("Tactical Futurism"):
- Mode: Dark Mode only (Deep Slate/Midnight Blue backgrounds)
- Materials: High-end Glassmorphism with backdrop blur (16-24px)
- Typography: Monospace for data (JetBrains Mono); geometric sans-serif for labels (Inter, Geist)
- Aesthetic: "Function is Beauty." No decorative fluff.
- Visual Hierarchy: Use luminosity—active elements glow, inactive elements recede.

Brand Colors (Strict Adherence):
- #0F172A (Background - Slate 900)
- #1E293B (Surface - Slate 800 at 80% opacity)
- #10B981 (Safe/Recovery - Emerald)
- #F59E0B (Warning/Damage - Amber)
- #EF4444 (Severe/Danger - Red)
- #64748B (Muted/Inactive - Slate 500)
- #F8FAFC (Text Primary - Slate 50)

Anti-Patterns (Avoid):
- Rounded corners > 8px (too friendly, not tactical)
- Pure white (#FFFFFF) anywhere
- Gradient backgrounds on panels
- Cartoon or gaming aesthetics
- Drop shadows without glow
```

---

## Step 5: Adjust Model Parameters

In the right sidebar, configure these settings:

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| **Temperature** | `0.7` – `0.9` | Balanced creativity |
| **Top P** | `0.95` | Default is fine |
| **Top K** | `40` | Default is fine |
| **Max Output Tokens** | `8192`+ | Allows detailed output |
| **Thinking Level** | Medium/High | Gemini 3 only |

---

## Step 6: Disable Unnecessary Tools

Toggle these **OFF** (not needed for mockups):

- [ ] Code Execution
- [ ] Google Search Grounding
- [ ] Function Calling

Keep the interface focused on generation.

---

## Step 7: Enter the Prompt

In the main chat input, paste the full prompt from `AI-STUDIO-PROMPT.md`.

### Quick Start Version

If you want to test quickly, use this condensed prompt:

```
Generate a photorealistic, high-fidelity UI mockup of the "RANGER Command Console" running on a 4K display (3840x2160). This is a professional geospatial command center for the US Forest Service.

Scenario: Tracking the Cedar Creek Fire (127,000 acres) in Willamette National Forest, Oregon. The Burn Analyst agent is active, showing burn severity analysis.

Layout:
1. Dark slate background (#0F172A)
2. Central 3D terrain viewport (75% width) with burn severity heatmap overlay
   - Red (#EF4444): High severity in fire origin
   - Amber (#F59E0B): Moderate severity transition zones
   - Green (#10B981): Low/unburned on periphery
3. Left sidebar (64px wide): 4-step lifecycle rail
   - Step 1: IMPACT (active, glowing green border)
   - Step 2: DAMAGE (pending)
   - Step 3: TIMBER (pending)
   - Step 4: COMPLIANCE (pending)
4. Top-right glassmorphic panel (320px wide):
   - Header: "BURN ANALYST" with confidence badge
   - Hero stat: "42%" High Severity
   - Supporting metrics: acreage breakdown
   - Stacked bar chart (Red/Amber/Green)
5. Header bar (48px): "RANGER" wordmark left, "Cedar Creek Fire" center, user avatar right
6. Bottom-right: Floating map controls (SAT/TER/IR toggles, zoom, compass)

Style: Bloomberg Terminal meets Google Earth. Premium SaaS, not gaming.
Aspect Ratio: 16:9 (3840x2160)
```

---

## Step 8: Generate and Iterate

1. **Press Enter** or click the send button
2. Wait 30-90 seconds for image generation
3. Review the output

### Iteration Prompts

If the result needs refinement:

| Problem | Follow-up Prompt |
|---------|------------------|
| **Too dark** | "Increase terrain exposure by 20%. Add rim lighting to panel edges. Glass panels need frosted edge highlight (1px white at 10% opacity)." |
| **Too cartoonish** | "Switch to photorealistic rendering. Reference Unreal Engine 5 Lumen lighting. This is enterprise software, not a video game." |
| **Text is gibberish** | "Focus on spatial layout and color blocking. Use placeholder boxes where text would appear. Maintain panel positioning." |
| **Colors off-brand** | "Strictly use: Background #0F172A, Panels #1E293B at 80%, Green #10B981, Amber #F59E0B, Red #EF4444." |
| **Too cluttered** | "Reduce information density by 30%. The map viewport should feel expansive and cinematic." |
| **Lacks depth** | "Add layered depth: Background (map) → Mid-ground (subtle grid at 5% opacity) → Foreground (glass panels with stronger blur)." |

---

## Step 9: Save the Mockup

Once satisfied:

1. **Right-click the image** → "Save image as..."
2. Save to: `docs/assets/`
3. **Naming convention:** `ranger-{view}-v{N}.png`
   - `ranger-command-console-v1.png`
   - `ranger-burn-analyst-active-v2.png`
   - `ranger-mobile-field-companion-v1.png`

---

## Step 10: Update Documentation

If this becomes the canonical mockup, update the reference in `docs/architecture/UX-VISION.md`:

```markdown
![RANGER Command Console Mockup](../assets/ranger-command-console-v1.png)
```

---

## Quality Checklist

Before adopting a mockup, verify:

- [ ] Dark background is slate (#0F172A), not pure black
- [ ] All four lifecycle phases visible in left rail
- [ ] "RANGER" wordmark visible (not "Project RANGER AI")
- [ ] Agent name is "BURN ANALYST" (not "FireSight")
- [ ] Severity colors match: Green (#10B981), Amber (#F59E0B), Red (#EF4444)
- [ ] Glass panels have visible blur/frosted effect
- [ ] Panel corners are sharp (6-8px max radius)
- [ ] Overall impression: professional, tactical, enterprise-grade

---

## Free Tier Limitations

| Model | Rate Limit | Notes |
|-------|------------|-------|
| Gemini 2.5 Flash | 15 req/min | Good for iteration |
| Gemini 2.5 Pro | 5 req/min | Deeper reasoning |
| Gemini 3 Pro | Paid only | Complex analysis |
| Gemini 3 Pro Image | Paid only | Best for mockups |

If you hit rate limits, wait 60 seconds before retrying.

---

## Alternative Workflows

### If Free Tier Only

1. Use `gemini-2.5-flash` to generate a detailed textual description
2. Export that description to:
   - **Midjourney** (`/imagine` command)
   - **DALL-E** (ChatGPT Plus)
   - **Figma AI** (for component-based design)

### If Using Build Mode

Build mode generates working React apps, not static mockups. Use it when you want:
- Interactive prototypes
- Exportable code
- Live component previews

---

## Alternate Prompts

### Mobile: Field Companion

```
Generate a mobile UI mockup (iPhone 15 Pro, 1179x2556) of the "RANGER Field Companion" app.

The user is a field ranger reviewing a trail segment flagged by the Trail Assessor agent.

Show:
- Full-bleed photo of damaged trail (washout/erosion)
- Bottom sheet: damage classification, severity badge, GPS coordinates
- Top status bar: offline sync indicator
- Floating action button: "Capture Photo"

Style: Tactical Futurism, optimized for sunlight readability (higher contrast).
Dark background with emerald accents.
```

### Dashboard: Multi-Agent View

```
Generate a dashboard mockup showing all four RANGER agents in a 2x2 grid.

Each agent card displays:
- Agent name and status indicator (active/idle)
- Key metric from latest analysis
- Mini data visualization (sparkline or gauge)
- "Open" action button

Footer: Recovery Coordinator command bar for synthesizing insights.

Style: Mission Control aesthetic. Multiple data streams at a glance.
Background #0F172A, cards #1E293B with glassmorphic effect.
```

---

## Troubleshooting

### "Model not available"
- Gemini 3 models require paid tier
- Switch to `gemini-2.5-flash` for free access

### Image generation fails
- Simplify the prompt (remove detailed specifications)
- Try breaking into two prompts: layout first, then styling

### Rate limited
- Wait 60 seconds
- Reduce prompt complexity to lower token usage

### Output is text-only, no image
- Confirm you're using an image-capable model (`gemini-3-pro-image`)
- Add explicit instruction: "Generate an image, not a description"

---

## Related Files

| File | Purpose |
|------|---------|
| `docs/assets/AI-STUDIO-PROMPT.md` | Full prompt with all specifications |
| `docs/assets/MOCKUP-GENERATION.md` | Design brief and alternate tools |
| `docs/assets/ranger-mockup.png` | Current placeholder mockup |
| `docs/architecture/UX-VISION.md` | Design philosophy and rationale |
| `docs/brand/BRAND-ARCHITECTURE.md` | Naming conventions and colors |

---

## References

- [Google AI Studio Tutorial - DataCamp](https://www.datacamp.com/tutorial/google-ai-studio-tutorial)
- [Google AI Studio Beginner's Guide - Geeky Gadgets](https://www.geeky-gadgets.com/google-ai-studio-beginner-guide-2025/)
- [Google AI Studio for Beginners - Neuroflash](https://neuroflash.com/blog/google-ai-studio/)
- [Official Google AI Studio](https://aistudio.google.com)
