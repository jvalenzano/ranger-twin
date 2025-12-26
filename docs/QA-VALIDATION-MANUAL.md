# RANGER Command Console: QA Validation Manual

**Version:** 1.0
**Last Updated:** 2025-12-23
**Target Release:** Cedar Creek Demo (All Milestones Complete)

This document provides comprehensive manual testing procedures for the RANGER Command Console. QA analysts should follow each persona narrative and validate all interactive elements function as specified.

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Persona Workflow Narratives](#2-persona-workflow-narratives)
   - [Sarah Chen: Fire Management Officer (ACT/ASM)](#21-sarah-chen-fire-management-officer)
   - [Marcus Rodriguez: Recreation Technician (IMP)](#22-marcus-rodriguez-recreation-technician)
   - [Elena Vasquez: Timber Cruiser (RST)](#23-elena-vasquez-timber-cruiser)
   - [Dr. James Park: Environmental Coordinator (COMPLIANCE)](#24-dr-james-park-environmental-coordinator)
3. [Component Test Cases](#3-component-test-cases)
4. [Keyboard Shortcuts](#4-keyboard-shortcuts)
5. [Edge Cases & Error Handling](#5-edge-cases--error-handling)
6. [Sign-Off Checklist](#6-sign-off-checklist)

---

## 1. Test Environment Setup

### Prerequisites

| Requirement | Specification |
|-------------|---------------|
| Browser | Chrome 120+, Firefox 120+, Safari 17+ |
| Resolution | Minimum 1280x720, recommended 1920x1080 |
| Network | Stable internet for MapTiler tiles and Gemini API |
| Local Server | `pnpm dev` running on `http://localhost:5173` |

### Initial State Verification

Before beginning tests, verify the application loads correctly:

- [ ] Map renders with Cedar Creek fire area visible
- [ ] Sidebar shows 4 lifecycle phases (Active, Assessment, Implementation, Restoration)
- [ ] Header displays RANGER branding, timestamp, and controls
- [ ] No console errors on initial load

### Test Data Context

All tests use the **Cedar Creek Fire** fixture data:
- **Location:** 43.726°N, 122.167°W (Willamette National Forest, Oregon)
- **Fire Size:** 127,000 acres
- **Trails:** 5 trails with 16 damage points
- **Timber Plots:** 8 salvage priority areas

---

## 2. Persona Workflow Narratives

### 2.1 Sarah Chen: Fire Management Officer

**Role:** Active / BAER Assessment Phase Lead
**Goal:** Assess burn severity and generate initial recovery briefing
**Pain Point:** Currently spends 2-3 hours in QGIS assembling burn severity analysis

---

#### Narrative Test Script

> *Sarah arrives at 6:30 AM to prepare the morning briefing for the District Ranger. She needs to understand the Cedar Creek fire's impact on the Willamette National Forest before the 8 AM meeting.*

**Step 1: Application Launch**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Navigate to `http://localhost:5173` | Map loads centered on Cedar Creek with satellite imagery | |
| Observe initial state | IMPACT phase highlighted in sidebar, burn severity layer visible | |
| Check header timestamp | Current time displayed in configured timezone | |

**Step 2: Explore Burn Severity**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Hover over red burn severity polygon | Cursor changes to pointer, area highlights | |
| Click on HIGH severity zone | Popup appears with: name, severity level, acres, dNBR value | |
| Click elsewhere on map | Popup dismisses | |
| Verify legend shows severity colors | Red (High), Amber (Moderate), Green (Low) visible in legend | |

**Step 3: Engage the Burn Analyst**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click IMPACT phase button in sidebar | Insight Panel updates with Burn Analyst briefing | |
| Read the briefing content | Shows severity breakdown, affected acres, key findings | |
| Expand reasoning chain (click chevron) | Shows step-by-step reasoning with confidence indicators | |
| Verify confidence score displayed | Percentage shown (e.g., 87%) with data sources listed | |

**Step 4: Switch Map Views**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click TER (Terrain) button | Map switches to terrain/hillshade view | |
| Click IR (Infrared) button | Map switches to thermal visualization, perimeter glows cyan | |
| Click SAT (Satellite) button | Map returns to satellite imagery | |
| Verify layer toggle state | Active layer button highlighted with accent color | |

**Step 5: Use Chat for Clarification**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click Chat icon in header | Chat panel slides in from right | |
| Click suggested query "What's the burn severity near Waldo Lake?" | Query populates in input field | |
| Press Enter or click Send | Message appears in chat, loading indicator shows | |
| Wait for response | AI response with severity analysis, confidence, reasoning chain | |
| Click Minimize button | Panel collapses to FAB in bottom-right | |

**Step 6: Run Guided Demo**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click "Demo" button in header | Tour overlay appears with Step 1 card | |
| Observe map animation | Camera flies to appropriate location for current step | |
| Click Next button | Advances to Step 2, map animates to new view | |
| Click progress dot for Step 4 | Jumps directly to Step 4 | |
| Click X to close tour | Tour ends, returns to normal view | |

---

### 2.2 Marcus Rodriguez: Recreation Technician

**Role:** BAER Implementation Phase Lead
**Goal:** Inventory trail damage and generate TRACS work orders
**Pain Point:** Manual paper forms with no spatial link to fire data

---

#### Narrative Test Script

> *Marcus heads out at 7 AM to survey trails damaged by the Cedar Creek fire. Before entering the field, he reviews the AI-generated damage assessment to prioritize which trails to visit first.*

**Step 1: Navigate to Damage Phase**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click DAMAGE phase in sidebar | Sidebar item highlights, phase becomes active | |
| Observe map changes | Trail damage points appear as colored circles | |
| Verify legend updates | "Infrastructure Damage" section appears with damage type colors | |

**Step 2: Explore Trail Damage Points**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Locate red circle on map (Bridge Failure) | Circle visible near trail intersection | |
| Hover over damage point | Circle grows slightly, cyan stroke appears, cursor changes | |
| Click on damage point | Popup shows: trail name, damage type, description, severity (1-5) | |
| Verify damage ID label | Small label (e.g., "WL-001") visible above point | |

**Step 3: Review Damage Assessment Briefing**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read Insight Panel content | Trail Assessor briefing with damage inventory | |
| Expand reasoning chain | Shows data sources: field observations, burn severity correlation | |
| Look for action buttons | "Generate TRACS Work Orders" or similar action visible | |
| Click export action | Toast notification confirms export initiated | |

**Step 4: Use Terrain View for Context**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click TER button | Terrain view shows topography | |
| Zoom in on steep trail section | Hillshade reveals slope where debris flow occurred | |
| Use zoom controls (+/-) | Map zooms smoothly | |
| Use mouse scroll | Map zooms with scroll wheel | |

**Step 5: Measure Distance to Damage**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click Distance measurement tool (ruler icon) | Tool activates, cursor changes to crosshair | |
| Click starting point on map | First point placed, visible as cyan dot | |
| Click additional points | Line draws between points | |
| Double-click to complete | Total distance displayed in measurement overlay | |
| Click X on measurement overlay | Measurement clears, tool deactivates | |

**Step 6: Ask About Specific Trail**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Open chat panel | Chat interface appears | |
| Type "What's the damage status of Waldo Lake Trail?" | Message appears in chat | |
| Send message | Response includes specific damage points, severities, recommendations | |
| Verify citations | Response references fixture data or regulatory sources | |

---

### 2.3 Elena Vasquez: Timber Cruiser

**Role:** Restoration Phase Lead
**Goal:** Plan salvage operations and generate FSVeg-compatible data
**Pain Point:** Manual data entry isolated from compliance context

---

#### Narrative Test Script

> *Elena reviews the salvage priority map before heading to the timber plots. She needs to understand which areas have the highest value recovery potential and coordinate with the compliance team.*

**Step 1: Navigate to Timber Phase**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click TIMBER phase in sidebar | Phase activates, insight panel updates | |
| Observe map changes | Timber plot markers appear | |
| Verify legend updates | "Salvage Priority" section appears with priority colors | |

**Step 2: Explore Timber Plots**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Locate highest priority plot (red/orange marker) | Marker visible in high severity burn area | |
| Hover over timber plot | Marker scales up, stroke changes to cyan | |
| Click on timber plot | Popup shows: plot ID, stand type, MBF/acre, value, priority | |
| Verify priority color coding | Highest (red), High (orange), Medium (yellow), Low (green) | |

**Step 3: Review Cruising Assistant Briefing**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read Insight Panel content | Salvage recommendations with volume estimates | |
| Expand reasoning chain | Shows calculation methodology, data sources | |
| Look for FSVeg export action | "Export FSVeg Data" button visible | |
| Click export action | Toast confirms export | |

**Step 4: Cross-Reference with Burn Severity**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Observe timber plots over burn severity layer | Plots visible with severity colors underneath | |
| Toggle burn severity in legend (if available) | Layer visibility changes | |
| Click IMPACT phase briefly | Burn severity emphasized, timber plots may dim | |
| Return to TIMBER phase | Timber context restored | |

**Step 5: Use Area Measurement**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click Area measurement tool (polygon icon) | Tool activates | |
| Click points to draw polygon around timber area | Points connected, area fills with cyan | |
| Double-click to complete | Area displayed in acres/hectares | |
| Press ESC key | Measurement clears | |

**Step 6: Chat About Salvage Priorities**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Open chat panel | Chat interface appears | |
| Type "Which timber plots should we prioritize for salvage?" | Message sent | |
| Review response | AI provides ranked priorities with reasoning | |
| Download conversation | Click download icon, JSON file saves | |

---

### 2.4 Dr. James Park: Environmental Coordinator

**Role:** COMPLIANCE Phase Lead
**Goal:** Determine NEPA pathway and generate compliance documentation
**Pain Point:** 3 weeks manual cite-checking against FSM/FSH regulations

---

#### Narrative Test Script

> *Dr. Park needs to assess whether the proposed salvage operations qualify for a Categorical Exclusion or require an Environmental Assessment. He relies on the NEPA Advisor's RAG-powered regulatory analysis.*

**Step 1: Navigate to Compliance Phase**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click COMPLIANCE phase in sidebar | Phase activates, all data layers visible | |
| Observe insight panel | NEPA Advisor briefing with regulatory context | |
| Verify phase indicator | Purple/blue accent color for compliance | |

**Step 2: Review NEPA Analysis**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Read Insight Panel content | NEPA pathway recommendation (CE, EA, or EIS) | |
| Expand reasoning chain | Shows regulatory citations from FSM/FSH | |
| Verify citations present | References to 36 CFR 220.6, FSH 1909.15, FSM 1950 | |
| Check confidence score | Score reflects regulatory certainty | |

**Step 3: Ask Regulatory Questions**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Open chat panel | Chat interface appears | |
| Type "What categorical exclusions apply to post-fire trail repair?" | Message sent | |
| Review response | Cites specific CE categories (e.g., 36 CFR 220.6(e)(14)) | |
| Ask follow-up "What documentation is required?" | Response lists requirements: Decision Memo, extraordinary circumstances review | |

**Step 4: Request Compliance Checklist**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Type "Generate a CE compliance checklist for trail repair" | Message sent | |
| Review response | Structured checklist with checkbox items | |
| Verify checklist completeness | Includes: CE category, extraordinary circumstances, documentation | |
| Copy conversation | Click copy button, paste elsewhere to verify | |

**Step 5: Full Workflow Review**

| Action | Expected Result | Pass/Fail |
|--------|-----------------|-----------|
| Click through all 4 phases in sequence | Each phase loads appropriate briefing | |
| Verify cascade logic | Each phase references upstream analysis | |
| Check cross-phase citations | NEPA references burn severity and damage assessments | |

---

## 3. Component Test Cases

### 3.1 Sidebar Controls

#### Phase Selection

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-001 | Select IMPACT phase | Click IMPACT button | Phase highlights, insight panel updates | |
| SB-002 | Select DAMAGE phase | Click DAMAGE button | Phase highlights, trail damage appears | |
| SB-003 | Select TIMBER phase | Click TIMBER button | Phase highlights, timber plots appear | |
| SB-004 | Select COMPLIANCE phase | Click COMPLIANCE button | Phase highlights, all layers visible | |
| SB-005 | Phase pulse animation | Trigger briefing event | New insight indicator pulses | |

#### Sidebar Expand/Collapse

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-010 | Collapse sidebar | Click RANGER logo | Sidebar collapses to 64px, icons only | |
| SB-011 | Expand sidebar | Click logo again | Sidebar expands to 200px with labels | |
| SB-012 | Auto-collapse on first use | Click any phase first time | Sidebar auto-collapses after 800ms | |

#### Layer Controls

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-020 | Switch to Satellite | Click SAT button | Satellite tiles load, button highlights cyan | |
| SB-021 | Switch to Terrain | Click TER button | Terrain/hillshade loads, button highlights amber | |
| SB-022 | Switch to Infrared | Click IR button | Thermal view loads, button highlights orange | |
| SB-023 | Layer button states | Observe all 3 buttons | Only active layer highlighted | |

#### Zoom and Navigation

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-030 | Zoom in | Click + button | Map zooms in one level | |
| SB-031 | Zoom out | Click - button | Map zooms out one level | |
| SB-032 | Reset bearing | Rotate map, click compass | Map resets to north-up | |

#### Measurement Tools

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-040 | Activate distance tool | Click ruler icon | Tool activates, cursor changes | |
| SB-041 | Deactivate by re-click | Click ruler again | Tool deactivates, measurement clears | |
| SB-042 | Activate area tool | Click polygon icon | Tool activates | |
| SB-043 | Tool mutual exclusion | Activate distance, then area | Distance deactivates, area activates | |

#### Toolbar Customization

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| SB-050 | Open customize panel | Click gear/customize button | Panel expands with tool toggles | |
| SB-051 | Unpin a tool | Toggle off a tool | Tool disappears from toolbar | |
| SB-052 | Pin a tool | Toggle on a tool | Tool appears in toolbar | |
| SB-053 | Reset to defaults | Click reset button | All tools return to default state | |
| SB-054 | Badge shows unpinned count | Unpin 2 tools | Badge shows "2" | |

---

### 3.2 Legend Controls

#### Sidebar Legend

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| LG-001 | Expand legend | Click legend header | Legend content expands | |
| LG-002 | Collapse legend | Click header again | Legend content collapses | |
| LG-003 | Phase-conditional sections | Switch phases | Infrastructure Damage shows in DAMAGE+ | |
| LG-004 | Detach legend | Click detach button | Legend floats over map | |

#### Floating Legend

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| LG-010 | Drag legend | Click and drag header | Legend moves with cursor | |
| LG-011 | Boundary constraints | Drag to edge of viewport | Legend stops at boundary | |
| LG-012 | Compact mode | Click minimize icon | Legend shows only color dots | |
| LG-013 | Expand compact | Click maximize icon | Legend shows full labels | |
| LG-014 | Dock legend | Click dock button | Legend returns to sidebar | |

---

### 3.3 Header Controls

#### Demo Tour

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| HD-001 | Start tour | Click Demo button | Tour overlay appears, Step 1 shown | |
| HD-002 | Stop tour | Click Demo button (now shows "Stop") | Tour ends | |
| HD-003 | Next step | Click Next button | Advances to next step | |
| HD-004 | Previous step | Click Back button | Returns to previous step | |
| HD-005 | Skip tour | Click X button | Tour ends immediately | |
| HD-006 | Jump to step | Click progress dot | Jumps to selected step | |
| HD-007 | Map sync | Navigate through steps | Camera animates to step location | |
| HD-008 | Layer sync | Observe each step | Correct layers visible per step | |
| HD-009 | Finish tour | Click Finish on last step | Tour ends, normal state restored | |

#### Timezone Selector

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| HD-020 | Open dropdown | Click timezone display | Dropdown opens with 7 options | |
| HD-021 | Select timezone | Click "Pacific" | Dropdown closes, time updates | |
| HD-022 | Verify time format | Observe timestamp | Shows HH:MM:SS in 24h format | |
| HD-023 | Live update | Wait 5 seconds | Timestamp increments | |

#### Alerts Dropdown

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| HD-030 | Open alerts | Click bell icon | Dropdown opens with notifications | |
| HD-031 | Unread badge | Observe bell icon | Badge shows unread count | |
| HD-032 | Alert item display | Read alert items | Shows icon, title, message, time | |
| HD-033 | Close dropdown | Click outside dropdown | Dropdown closes | |

#### Profile Dropdown

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| HD-040 | Open profile menu | Click avatar | Dropdown opens | |
| HD-041 | Toggle tooltips | Click tooltip toggle switch | Switch state changes, tooltips enable/disable | |
| HD-042 | Menu items present | Observe menu | Profile, Settings, Preferences, Sign Out visible | |

---

### 3.4 Chat Panel

#### Panel Controls

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| CH-001 | Open chat | Click chat icon in header | Panel slides in from right | |
| CH-002 | Close chat | Click X button | Panel slides out | |
| CH-003 | Minimize chat | Click minimize button | Panel collapses to FAB | |
| CH-004 | Restore from FAB | Click FAB | Panel expands | |
| CH-005 | Resize panel | Drag left edge | Panel width changes (300-600px) | |

#### Messaging

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| CH-010 | Send message | Type text, press Enter | Message appears in chat | |
| CH-011 | Send via button | Type text, click send | Message appears in chat | |
| CH-012 | Empty send blocked | Click send with empty input | Nothing happens, button disabled | |
| CH-013 | Loading indicator | Send message | Spinner shows during API call | |
| CH-014 | AI response | Wait for response | Response appears with agent badge | |
| CH-015 | Reasoning chain | Observe response | Expandable reasoning section present | |
| CH-016 | Confidence score | Observe response | Confidence percentage displayed | |

#### Suggested Queries

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| CH-020 | Click suggestion | Click suggested query chip | Query populates input field | |
| CH-021 | Send suggested query | Click chip, press Enter | Message sends with suggested text | |

#### Export Functions

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| CH-030 | Copy conversation | Click copy button | Checkmark appears, content in clipboard | |
| CH-031 | Download conversation | Click download button | JSON file downloads | |
| CH-032 | Clear conversation | Click clear button | All messages removed | |

---

### 3.5 Map Interactions

#### Feature Interactions

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| MP-001 | Click burn severity | Click colored polygon | Popup with severity info | |
| MP-002 | Click trail damage | Click damage point | Popup with damage details | |
| MP-003 | Click timber plot | Click plot marker | Popup with plot details | |
| MP-004 | Popup dismissal | Click elsewhere | Popup closes | |
| MP-005 | Hover feedback | Hover over feature | Visual highlight (stroke, scale) | |
| MP-006 | Cursor change | Hover over clickable | Cursor becomes pointer | |

#### Navigation

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| MP-010 | Pan map | Click and drag | Map pans smoothly | |
| MP-011 | Scroll zoom | Use mouse wheel | Map zooms at cursor | |
| MP-012 | Pinch zoom | Use trackpad pinch | Map zooms (if supported) | |
| MP-013 | Rotate map | Right-click drag or Ctrl+drag | Map rotates | |
| MP-014 | Tilt map | Ctrl+right-click drag | Map tilts to show 3D terrain | |

#### Terrain

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| MP-020 | 3D terrain visible | Tilt map in TER mode | Mountains show 3D extrusion | |
| MP-021 | Terrain exaggeration | Compare SAT vs TER | TER shows more pronounced terrain | |

---

### 3.6 Insight Panel & Cards

#### Insight Panel

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| IP-001 | Panel updates on phase | Click different phases | Panel content changes per phase | |
| IP-002 | Reasoning chain expand | Click chevron | Full reasoning steps shown | |
| IP-003 | Reasoning chain collapse | Click chevron again | Returns to preview | |
| IP-004 | Action button click | Click suggested action | Action triggered, toast confirms | |
| IP-005 | Confidence display | Observe panel | Data source confidence percentages shown | |

#### Insight Cards

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| IP-010 | Card detail toggle | Click "Show details" | Details section expands | |
| IP-011 | Card action buttons | Click action button | Action fires, feedback provided | |
| IP-012 | Card dismiss | Click dismiss/X | Card removed from display | |

---

## 4. Keyboard Shortcuts

| Test ID | Shortcut | Expected Result | Pass/Fail |
|---------|----------|-----------------|-----------|
| KB-001 | `N` | Reset map bearing to north | |
| KB-002 | `S` | Switch to Satellite layer | |
| KB-003 | `T` | Switch to Terrain layer | |
| KB-004 | `I` | Switch to Infrared layer | |
| KB-005 | `+` | Zoom in | |
| KB-006 | `-` | Zoom out | |
| KB-007 | `ESC` | Clear active measurement | |
| KB-008 | `Enter` (in chat) | Send message | |
| KB-009 | `Shift+Enter` (in chat) | New line in message | |

---

## 5. Edge Cases & Error Handling

### Network Errors

| Test ID | Scenario | Steps | Expected Result | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| EC-001 | Gemini API timeout | Disconnect network, send chat | Loading indicator, then error message | |
| EC-002 | Map tiles fail | Block MapTiler domain | Graceful fallback or error display | |
| EC-003 | Slow response | Throttle network | Loading states display, no freeze | |

### Boundary Conditions

| Test ID | Scenario | Steps | Expected Result | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| EC-010 | Very long chat message | Paste 5000+ characters | Message handles gracefully | |
| EC-011 | Rapid phase switching | Click phases quickly | No race conditions, correct state | |
| EC-012 | Multiple popups attempt | Click features rapidly | Only one popup at a time | |
| EC-013 | Resize to minimum | Resize chat to 300px | Layout remains usable | |
| EC-014 | Resize to maximum | Resize chat to 600px | Layout remains usable | |

### State Persistence

| Test ID | Scenario | Steps | Expected Result | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| EC-020 | Chat persistence | Send messages, refresh page | Messages restored from localStorage | |
| EC-021 | Panel position persistence | Resize chat, refresh | Position restored | |
| EC-022 | Legend position persistence | Move floating legend, refresh | Position restored | |

---

## 6. Sign-Off Checklist

### Milestone 1: Living Map

- [ ] MapLibre GL JS renders correctly
- [ ] MapTiler satellite tiles load
- [ ] MapTiler terrain/hillshade tiles load
- [ ] Map centered on Cedar Creek (43.7°N, 122.1°W)
- [ ] SAT/TER/IR toggle works
- [ ] Zoom controls work
- [ ] Compass/bearing reset works
- [ ] 3D terrain exaggeration visible

### Milestone 2: Fire Story

- [ ] Fire perimeter polygon visible (dashed white outline)
- [ ] Burn severity zones with color gradient (red/amber/green)
- [ ] Trail damage points visible with damage type colors
- [ ] Trail damage labels (IDs) visible
- [ ] Timber plot markers visible with priority colors
- [ ] All feature popups work on click
- [ ] Hover effects work on all features

### Milestone 3: Guided Experience

- [ ] Demo button starts tour
- [ ] All 7 tour steps display correctly
- [ ] Progress dots navigate between steps
- [ ] Back/Next navigation works
- [ ] Skip/close tour works
- [ ] Map syncs camera to each step
- [ ] Layers sync to each step
- [ ] "Look For" callouts display

### Milestone 4: Intelligent Core

- [ ] Gemini API integration works
- [ ] Burn Analyst generates briefing
- [ ] Trail Assessor generates briefing
- [ ] Cruising Assistant generates briefing (or placeholder)
- [ ] NEPA Advisor generates briefing with citations
- [ ] Loading states during API calls
- [ ] Error handling with fallback

### Milestone 5: Conversation

- [ ] Chat input works
- [ ] Messages display correctly
- [ ] AI responses include reasoning chain
- [ ] Suggested query chips work
- [ ] Chat history persists
- [ ] Copy/download/clear functions work
- [ ] Panel resize works
- [ ] Minimize/restore works

### Milestone 6: IR Layer

- [ ] IR button switches to thermal view
- [ ] Burn severity has thermal styling
- [ ] Fire perimeter glows cyan in IR mode
- [ ] Trail damage points visible in IR
- [ ] Timber plots visible in IR

### Milestone 7: Polish

- [ ] All loading states present
- [ ] Error boundaries catch errors gracefully
- [ ] No console errors during normal use
- [ ] Responsive at 1280x720 minimum
- [ ] Favicon and meta tags present
- [ ] Tooltips work throughout

### Milestone 8: NEPA RAG

- [ ] NEPA Advisor returns regulatory citations
- [ ] FSM/FSH references accurate
- [ ] Compliance checklist generation works
- [ ] NEPA pathway recommendations logical

---

## Test Execution Log

| Date | Tester | Environment | Milestones Tested | Issues Found | Sign-Off |
|------|--------|-------------|-------------------|--------------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Issue Reporting Template

```
**Issue ID:** QA-XXX
**Severity:** Critical / High / Medium / Low
**Component:** [Component name]
**Test Case:** [Test ID from this document]

**Description:**
[What happened]

**Expected:**
[What should have happened]

**Steps to Reproduce:**
1.
2.
3.

**Environment:**
- Browser:
- Resolution:
- Network:

**Screenshots/Recording:**
[Attach if applicable]
```

---

*Document prepared for RANGER QA Team. All tests should be executed against the Cedar Creek demo deployment.*
