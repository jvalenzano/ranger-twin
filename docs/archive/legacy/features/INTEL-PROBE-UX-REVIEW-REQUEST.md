# UX Review Request: Intel Probe Feature

**To:** USFS UX/UI Expert  
**From:** RANGER Development Team  
**Date:** December 23, 2024  
**Subject:** Feature Spec Review — Intel Probe (AI-Powered Forensic Analysis)

---

## Context

We're building **RANGER**, an AI-powered post-fire recovery command center for the Forest Service. The system helps District Rangers, Timber Sale Administrators, and field crews make faster, better-informed decisions during the recovery lifecycle.

We recently designed a new feature called **Intel Probe** and need your critical eye before we write any code.

---

## What We Need From You

Please review the attached feature spec (`FORENSIC-POPUP-TRIGGER.md`) and provide feedback on:

### 1. Workflow Fit
- Does this feature fit how foresters actually work in the field?
- Are we adding friction or removing it?
- Would you use this, or would you work around it?

### 2. Quick Query Chips
We designed pre-composed "Quick Query Chips" based on common questions foresters ask. For each feature type (trail damage, timber plots, burn zones, compliance), we have 6 chip options.

**Please review:**
- Are these the *right* questions? Did we miss any critical ones?
- Is the language natural, or does it sound like a developer wrote it?
- Would you want to multi-select chips, or is one-at-a-time better?
- Should there be a "Most Common" chip pre-selected by default?

### 3. Naming & Terminology
We chose:
- **"Intel Probe"** as the feature name
- **"Quick Queries"** for the preset question chips
- **"Research Mission"** for the AI investigation
- **"Intelligence Briefing"** for the output

**Please evaluate:**
- Do these terms resonate with USFS culture?
- Are they too military/tactical? Too corporate?
- What would *you* call these features?

### 4. Visual Layout
The modal shows:
1. Context Anchor (feature ID, coordinates)
2. Quick Query Chips (checkboxes)
3. Research Focus textarea (editable)
4. Launch button

**Please consider:**
- Is the information hierarchy correct?
- Is anything missing from the context display?
- Would you want to see a map thumbnail, or is the feature ID sufficient?

### 5. Edge Cases
- What happens if the user clicks a feature with incomplete data?
- What if the AI returns conflicting information?
- How should we handle "I don't know" responses?

### 6. Accessibility
- Any concerns for field use (low connectivity, mobile devices, bright sunlight)?
- Keyboard navigation needs?
- Screen reader considerations?

---

## Key Design Decisions (Already Made)

These are locked in, but feel free to challenge them:

1. **Trigger from feature popup** — Not a separate toolbar tool
2. **Multi-select chips allowed** — Queries are concatenated
3. **Human refinement always available** — User can edit before launching
4. **Context-aware chips** — Different chips for trails vs. timber vs. burn zones

---

## What We're NOT Asking

- Don't worry about technical feasibility (we'll handle that)
- Don't design alternatives from scratch (we need feedback on *this* design)
- Don't worry about AI accuracy (separate workstream)

---

## Deliverable

Please provide:
1. **Top 3 concerns** — Things that would block field adoption
2. **Top 3 wins** — Things you think will work well
3. **Quick Query Chip edits** — Add/remove/reword suggestions
4. **Naming alternatives** (if any)
5. **Any "Wait, what about...?" moments**

Written response is fine. If you'd prefer a 30-minute call, we can arrange that.

---

## Timeline

We'd like feedback within **48 hours** so we can incorporate changes before the next dev sprint.

---

## Attached Documents

1. `FORENSIC-POPUP-TRIGGER.md` — Full feature spec with visual mockups, chip definitions, and implementation notes

---

## Thank You

Your field experience is invaluable. We want RANGER to be the tool you *wish* you had, not another system you have to work around.

— RANGER Development Team
