# RANGER Diagram Library

This directory contains the visual documentation for the RANGER platform, organized into two distinct tracks based on audience and purpose.

## 📂 The Two Tracks

### 1. [Developer Track](./developer/)
**Audience:** Engineering Team, Architects
**Purpose:** Technical reference, debugging, and onboarding.
**Update Frequency:** High (Sprint-based)

- **[P0] ADK Runtime & Skill Loading** - How the system thinks.
- **[P0] Developer Port Map** - What runs where.
- **[P0] SSE Streaming Flow** - How data moves.
- **[P0] MCP Data Layer** - How tools access data.

👉 **[View Developer Prompts](./developer/PROMPTS.md)** to generate these diagrams.

### 2. [Stakeholder Track](./stakeholder/)
**Audience:** USFS Partners, Investors, Leadership
**Purpose:** Value proposition, workflow, and trust.
**Update Frequency:** Low (Quarterly/Milestone-based)

- **[P0] Cedar Creek Context** - The problem scale.
- **[P0] The Legacy Bridge** - The integration strategy.
- **[P0] The Recovery Chain** - The human impact.
- **[P1] The Confidence Ledger** - The trust model.

👉 **[View Stakeholder Prompts](./stakeholder/PROMPTS.md)** to generate these diagrams.

---

## 🎨 Visual Standard

All diagrams should adhere to the **"Tactical Whiteboard"** aesthetic:
- **Background:** Dark Slate Blue (`#0F172A`)
- **Style:** Clean white chalk lines, hand-drawn feel but precise.
- **Accents:**
  - 🟢 **Green:** Safe, Validated, Operational
  - 🟠 **Amber:** Warning, Processing, Active Fire
  - 🔴 **Red:** Critical, Error, High Severity
- **Iconography:** Use consistent agents symbols (Fire, Boot, Tree, Document).

## 🛠 Workflow

1. **Select** the appropriate track.
2. **Copy** the prompt from the track's `PROMPTS.md`.
3. **Generate** the image (Midjourney v6 or DALL-E 3).
4. **Save** the PNG to the track folder.
5. **Link** it in this README or the track's documentation.
