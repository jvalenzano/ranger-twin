# RANGER Command Console: Vibe Coding Guide

**Purpose:** Step-by-step instructions for generating the RANGER Command Console UI using Google AI Studio's Build mode.

**Last Updated:** December 2025

---

## What is Vibe Coding?

Google AI Studio's **Build mode** generates working React + TypeScript + Tailwind CSS web applications from natural language descriptions. Instead of static mockup images, you get:

- **Interactive prototypes** — Click around, test the UI
- **Real code** — Export as ZIP or push to GitHub
- **Annotation Mode** — Point at elements and describe changes
- **Instant preview** — See changes render in real-time

This is the recommended workflow for generating the RANGER Command Console mockup.

---

## Prerequisites

- Google account (any Gmail works)
- Modern browser (Chrome recommended)
- No installation required
- Free tier is sufficient for prototyping

---

## Important Limitations

Before starting, understand these constraints:

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Web apps only for preview** | Build mode renders web apps in-browser; mobile/desktop apps generate code but won't preview | We're building a web UI, so this is fine |
| **React/Angular only** | Default is React; Angular available in settings | React is our target stack |
| **API keys are visible in shared apps** | Never put real API keys in shared code | Use placeholder `process.env.GEMINI_API_KEY` |
| **Apps stored in Google Drive** | Inherits Drive permissions (private by default) | Export to GitHub for version control |
| **No local import** | Can't import existing code into AI Studio | Start fresh, export when done |

---

## Step 1: Open Build Mode

1. Navigate to **[aistudio.google.com/apps](https://aistudio.google.com/apps)**
2. Sign in with your Google account
3. You should see the Build interface with:
   - "Describe your idea" input box
   - Model selector (Gemini 3 Flash Preview)
   - "I'm feeling lucky" button
   - AI Chips for features (Nano Banana, Voice, Veo, Search)

---

## Step 2: Configure Settings (Optional)

Click the **Settings** icon if you need to:

- Switch framework from React to Angular (keep React)
- Adjust model parameters
- Enable/disable specific AI features

**Recommended:** Keep defaults for initial generation.

---

## Step 3: Enter the Master Prompt

Copy and paste this prompt into the "Describe your idea" input:

```
Build a professional geospatial command console UI called "RANGER Command Console" for the US Forest Service. This is a digital twin platform for post-fire forest recovery analysis.

DESIGN SYSTEM ("Tactical Futurism"):
- Dark mode only, background: #0F172A (Slate 900)
- Glassmorphic panels: bg-slate-800/70 with backdrop-blur-[24px], 1px border border-white/10, rounded-md (6px max)
- Typography: Inter for labels (font-weight 500, tracking +1%), JetBrains Mono for metrics/data
- Status colors: #10B981 (safe/green), #F59E0B (warning/amber), #EF4444 (critical/red)
- Text colors: #F8FAFC (primary), #94A3B8 (muted)
- Aesthetic: Bloomberg Terminal meets NASA Mission Control. No cartoon elements, no rounded corners > 8px.

LAYOUT (16:9 aspect ratio, simulating 4K display):

1. FULL BACKGROUND:
   - Dark slate (#0F172A) base
   - Central area: a gradient div simulating a terrain map with burn severity overlay
   - Use layered radial gradients: red (#EF4444) center fading to amber (#F59E0B) then green (#10B981) at edges
   - This represents a burn severity heatmap draped over forest terrain

2. LEFT SIDEBAR - "Lifecycle Rail" (64px wide, full height):
   - Glassmorphic background (bg-slate-800/70, backdrop-blur-[24px], border-r border-white/10)
   - 4 vertical steps connected by a thin vertical line (2px wide, #64748B):
     * Step 1: "IMPACT" - Active state with glowing green (#10B981) border and shadow, satellite icon, checkmark badge showing "Complete"
     * Step 2: "DAMAGE" - Pending state, trail/path icon, dimmed (#64748B)
     * Step 3: "TIMBER" - Pending state, tree icon, dimmed
     * Step 4: "COMPLIANCE" - Pending state, document icon, dimmed
   - Icons should be 24px, labels below each icon in uppercase 10px text
   - Active step should have a subtle pulsing glow animation

3. TOP HEADER BAR (48px height, full width):
   - Glassmorphic, more transparent (bg-slate-800/50, backdrop-blur-[16px], border-b border-white/8)
   - Left side (with 80px left padding to clear sidebar): "RANGER" wordmark in bold Inter 600, 18px, letter-spacing 0.05em
   - Center: Breadcrumb text "Willamette NF › Cedar Creek Fire › Impact Analysis" in #94A3B8
   - Right side: Green pulsing "Live" indicator dot, bell icon, circular user avatar placeholder

4. TOP-RIGHT INSIGHT PANEL - "Burn Analyst HUD" (320px wide, floating):
   - Glassmorphic card (bg-slate-800/70, backdrop-blur-[24px], border border-white/10, rounded-md, p-5)
   - Position: 24px from top, 24px from right
   - Header row: Small green dot (8px), "BURN ANALYST" label (uppercase, Inter 500, 12px, tracking 0.1em), right-aligned "98.4% confidence" badge
   - Hero metric: "42%" in JetBrains Mono 500, 48px size, #F8FAFC color
   - Below metric: "High Severity" label in #94A3B8, 14px
   - Grid of 4 supporting stats (2x2):
     * "127,341 ac" — Total Analyzed
     * "53,484 ac" — High Severity
     * "39,476 ac" — Moderate
     * "34,381 ac" — Low/Unburned
   - Horizontal stacked bar chart below stats: 8px height, full width, rounded ends (4px)
     * Red segment (#EF4444): 42%
     * Amber segment (#F59E0B): 31%
     * Green segment (#10B981): 27%
   - Footer: "Updated 2h ago • Sentinel-2 L2A" in 11px #64748B

5. BOTTOM-RIGHT MAP CONTROLS (floating):
   - Vertical pill-shaped container (glassmorphic, rounded-full for the container)
   - 3 toggle buttons stacked: "SAT" (active/highlighted with bg-emerald-500), "TER", "IR"
   - Below toggles: zoom "+" and "-" buttons
   - Small compass rose icon at bottom
   - 24px from bottom, 24px from right

6. BOTTOM-LEFT ATTRIBUTION:
   - Scale bar showing "5 mi" with tick marks
   - Attribution text: "Imagery: Sentinel-2 • Elevation: 3DEP" in 10px #64748B

INTERACTIONS:
- All buttons should have hover states (subtle brightness/opacity increase)
- The "Live" indicator should have a CSS pulsing animation (opacity oscillation)
- Active lifecycle step glow should pulse subtly

QUALITY REQUIREMENTS:
- This should look like premium enterprise software from Palantir, Planet Labs, or Mapbox Studio
- Every element must feel purposeful and data-driven
- High information density but not cluttered
- Sharp, tactical aesthetic—not friendly or playful
```

---

## Step 4: Generate the App

1. Click **"Build →"** button (or press Enter)
2. Wait for generation (60-180 seconds typical)
3. Watch the progress:
   - "Building the Core Logic..."
   - "Styling Components..."
   - Files appear in the left panel (`App.tsx`, `index.tsx`, etc.)
4. Live preview appears in the right panel

---

## Step 5: Review Initial Output

Check the preview against these criteria:

| Element | Expected | Check |
|---------|----------|-------|
| Background | Dark slate #0F172A | [ ] |
| Left sidebar | 4 lifecycle steps, first active | [ ] |
| Header | "RANGER" wordmark visible | [ ] |
| Insight panel | "BURN ANALYST" with 42% metric | [ ] |
| Stacked bar | Red/Amber/Green segments | [ ] |
| Glassmorphism | Visible blur on panels | [ ] |
| Map controls | SAT/TER/IR toggles visible | [ ] |

---

## Step 6: Iterate with Annotation Mode

This is the power feature. To refine specific elements:

1. Click the **pencil/annotation icon** in the preview toolbar
2. **Draw a box** around the element to change
3. **Type your instruction** in natural language
4. Click **"Add to chat"**
5. Gemini applies the change

### Common Refinements

**If glassmorphism is too subtle:**
```
Select the Burn Analyst panel, then say:
"Make the glassmorphism more prominent. Use backdrop-blur-[24px], add saturate(180%), and add an inset box-shadow at the top edge (inset 0 1px 0 0 rgba(255,255,255,0.05)) for a frosted highlight."
```

**If typography doesn't match:**
```
Select the 42% metric, then say:
"Use JetBrains Mono font, font-weight 500, and add font-variant-numeric: tabular-nums for stable number rendering."
```

**If colors are off:**
```
Select the whole app, then say:
"Ensure these exact colors: background #0F172A, panels #1E293B at 70% opacity, green #10B981, amber #F59E0B, red #EF4444, text #F8FAFC, muted text #94A3B8. No other colors."
```

**If the burn severity gradient isn't visible:**
```
Select the central map area, then say:
"Add a layered radial gradient background simulating burn severity: center is #EF4444 (red), transitions to #F59E0B (amber) at 40%, then #10B981 (green) at the edges. Make it look like a heatmap over terrain."
```

**If the lifecycle rail glow is missing:**
```
Select the IMPACT step, then say:
"Add a glowing effect: box-shadow 0 0 20px rgba(16, 185, 129, 0.3), and a pulsing animation that oscillates the shadow opacity."
```

---

## Step 7: Use Chat for Broader Changes

For changes that affect multiple components, use the chat panel:

**Add tactical grid overlay:**
```
Add a subtle grid overlay at 5% opacity over the entire map area. Use a repeating linear gradient to create thin white lines every 50px, both horizontal and vertical. This gives it a more technical/tactical feel.
```

**Improve information hierarchy:**
```
Ensure visual hierarchy through luminosity: active elements should glow and be bright, inactive elements should recede into darkness. The map viewport should be the hero, panels should float above it.
```

**Add polish:**
```
Add these finishing touches:
1. Subtle transition on all interactive elements (150ms ease-out)
2. The header should have a very subtle bottom border glow
3. Map controls should have hover states that brighten slightly
```

---

## Step 8: Inspect and Edit Code

Click the **"Code"** tab in the preview panel to view generated TypeScript.

**Key files:**
- `App.tsx` — Main component layout
- `index.tsx` — Entry point
- Component files for sidebar, header, panels

You can edit code directly here if needed. Changes reflect in the preview immediately.

**Tip:** If something looks wrong, check the Tailwind classes in the code. AI sometimes uses close-but-not-exact values.

---

## Step 9: Export Your Work

### Option A: Screenshot for Documentation

1. Use browser DevTools → Capture full-size screenshot
2. Or use the annotation toolbar's screenshot feature
3. Save as: `docs/assets/ranger-command-console-v1.png`

### Option B: Download Code

1. Click the **download icon** in the toolbar
2. Select **"Download ZIP"**
3. Extract to: `apps/command-console/src/mockups/`

### Option C: Push to GitHub

1. Click the **GitHub icon**
2. Authenticate if needed
3. Select your repository
4. Choose branch and commit

---

## Step 10: Update RANGER Documentation

After exporting:

```bash
# Update the mockup reference
# In docs/architecture/UX-VISION.md, ensure the image path is correct:
# ![RANGER Command Console Mockup](../assets/ranger-command-console-v1.png)
```

---

## Troubleshooting

### Build Fails or Hangs

- Simplify your prompt (remove detailed specifications)
- Try "I'm feeling lucky" first, then iterate
- Refresh the page and try again

### Preview Shows Errors

- Check the browser console for JavaScript errors
- Look at the Code tab for syntax issues
- Ask Gemini to "fix the error in the console"

### Glassmorphism Doesn't Render

Safari and some browsers don't fully support `backdrop-filter`. Test in Chrome.

### Colors Don't Match

Gemini sometimes uses similar-but-different colors. Use Annotation Mode to correct:
```
"Change this background to exactly #0F172A, not #0F1629 or any other shade"
```

### Rate Limited

Free tier has limits. Options:
- Wait for quota reset (daily)
- Add your own API key in settings
- Export and continue in local IDE

---

## Quality Checklist

Before finalizing the mockup:

- [ ] Background is #0F172A (not pure black)
- [ ] All 4 lifecycle phases visible in left rail
- [ ] "RANGER" wordmark visible (not "Project RANGER AI")
- [ ] Agent name is "BURN ANALYST" (not "FireSight")
- [ ] Severity colors: Green #10B981, Amber #F59E0B, Red #EF4444
- [ ] Glass panels have visible blur effect
- [ ] Panel corners are sharp (6-8px max radius)
- [ ] Typography uses Inter and JetBrains Mono
- [ ] Stacked bar chart shows 42%/31%/27% split
- [ ] Overall impression: professional, tactical, enterprise-grade

---

## File References

| File | Purpose |
|------|---------|
| `AI-STUDIO-PROMPT.md` | Alternative prompts and system instructions |
| `DESIGN-SPEC-HANDOFF.md` | CSS specs for engineering handoff |
| `GOOGLE-AI-STUDIO-WORKFLOW.md` | Legacy Playground workflow (for reference) |
| `MOCKUP-GENERATION.md` | Design brief and Midjourney alternatives |

---

## Sources

- [Build mode in Google AI Studio - Official Docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Introducing vibe coding in Google AI Studio - Google Blog](https://blog.google/technology/developers/introducing-vibe-coding-in-google-ai-studio/)
- [AI Studio Build Mode Limitations - Community Forum](https://discuss.ai.google.dev/t/ai-studio-build-mode-limitations-what-you-need-to-know/112517)
- [Google AI Studio App Gallery](https://aistudio.google.com/apps?source=showcase)
