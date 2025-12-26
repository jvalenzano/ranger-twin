# RANGER Demo Validation Test Plan

**Purpose**: Programmatic validation of all RANGER Command Console features using Playwright browser automation.

**Target URL**: `http://localhost:5173` (local dev) or deployed Vercel URL

**Test Environment**: Chromium browser, 1920x1080 viewport (also test 768x1024 tablet, 375x812 mobile)

---

## Pre-Test Setup

1. Ensure the app is running at the target URL
2. Verify MapTiler API key is configured (map tiles load)
3. Verify Gemini API key is configured (AI chat works)

---

## Test Suite 1: Initial Load & Core UI

### T1.1 - App Loads Successfully
- **Action**: Navigate to app URL
- **Expected**:
  - Loading skeleton appears briefly (animated contour rings)
  - App loads within 5 seconds
  - No console errors (check `browser_console_messages`)
- **Log**: Load time, any errors

### T1.2 - Map Renders
- **Action**: Wait for map container
- **Expected**:
  - MapLibre canvas element present
  - Satellite imagery visible (not blank/gray)
  - Cedar Creek area centered (~43.7°N, 122.1°W)
- **Log**: Screenshot of initial map state

### T1.3 - Header Elements
- **Action**: Inspect header bar
- **Expected**:
  - "RANGER" wordmark visible
  - Breadcrumb: "Willamette NF > Cedar Creek Fire > Impact Analysis"
  - "Run Demo" button present
  - "Ask" button present
  - "Live" indicator with green dot
- **Log**: Any missing elements

### T1.4 - Sidebar Navigation
- **Action**: Inspect left sidebar
- **Expected**:
  - 4 lifecycle phase buttons: IMPACT, DAMAGE, TIMBER, COMPLIANCE
  - One phase should be active (highlighted)
  - Clicking phases changes active state
- **Log**: Screenshot of sidebar

### T1.5 - Map Controls
- **Action**: Locate bottom-right controls
- **Expected**:
  - SAT/TER/IR layer toggle buttons
  - Zoom +/- buttons
  - Compass button
  - SAT button active by default (green highlight)
- **Log**: Screenshot of controls

---

## Test Suite 2: Map Interactions

### T2.1 - Layer Switching: SAT → TER
- **Action**: Click TER button
- **Expected**:
  - TER button becomes active (green)
  - SAT button becomes inactive
  - Map appearance changes (slightly desaturated)
- **Log**: Before/after screenshots

### T2.2 - Layer Switching: TER → IR
- **Action**: Click IR button
- **Expected**:
  - IR button becomes active (orange glow, pulsing)
  - Map becomes dark/grayscale
  - IR legend appears below controls
  - Burn severity zones show thermal colors (blue/yellow/white)
  - High severity areas have pulsing glow animation
- **Log**: Screenshot of IR mode with legend

### T2.3 - Layer Switching: IR → SAT
- **Action**: Click SAT button
- **Expected**:
  - Returns to normal satellite view
  - IR legend disappears
  - Normal burn severity colors (red/amber/green)
- **Log**: Confirm normal state restored

### T2.4 - Zoom Controls
- **Action**: Click zoom + button 3 times
- **Expected**:
  - Map zooms in incrementally
  - Zoom level increases
- **Action**: Click zoom - button 3 times
- **Expected**:
  - Map zooms out to original level
- **Log**: Zoom behavior smooth/jerky

### T2.5 - Compass Reset
- **Action**: Drag map to rotate bearing, then click compass
- **Expected**:
  - Map bearing resets to north (0°)
  - Pitch adjusts to default (45°)
- **Log**: Compass functionality

### T2.6 - Map Pan/Drag
- **Action**: Click and drag map
- **Expected**:
  - Map pans smoothly
  - Can navigate around Cedar Creek area
- **Log**: Pan responsiveness

---

## Test Suite 3: Fire Data Overlays

### T3.1 - Fire Perimeter Visible
- **Action**: Inspect map for fire perimeter
- **Expected**:
  - White dashed line outlining fire boundary
  - Perimeter forms complete polygon
- **Log**: Screenshot showing perimeter

### T3.2 - Burn Severity Zones
- **Action**: Inspect colored overlay areas
- **Expected**:
  - Red zones (HIGH severity)
  - Amber/yellow zones (MODERATE severity)
  - Green zones (LOW severity)
  - Semi-transparent fill with colored outline
- **Log**: All three severity levels visible

### T3.3 - Burn Severity Popup
- **Action**: Click on a burn severity zone
- **Expected**:
  - Popup appears with zone info
  - Shows: name, severity level, acres, dNBR value
  - Popup styled with dark theme
- **Log**: Screenshot of popup, data accuracy

### T3.4 - Trail Damage Points
- **Action**: Look for circle markers on map
- **Expected**:
  - Multiple colored circles (trail damage points)
  - Different colors for damage types
  - White stroke around circles
- **Log**: Count of visible trail markers

### T3.5 - Trail Damage Popup
- **Action**: Click on a trail damage marker
- **Expected**:
  - Popup with trail name
  - Damage type (e.g., "BRIDGE FAILURE", "DEBRIS FLOW")
  - Description text
  - Severity rating (1-5)
- **Log**: Screenshot of popup

### T3.6 - Timber Plot Points
- **Action**: Look for larger labeled circles
- **Expected**:
  - Circles with plot ID labels (e.g., "CC-001")
  - Color-coded by priority (red=highest, green=low)
  - Darker stroke around circles
- **Log**: Count of visible timber plots

### T3.7 - Timber Plot Popup
- **Action**: Click on a timber plot marker
- **Expected**:
  - Popup with plot ID
  - Stand type
  - MBF/acre value
  - Salvage value per acre ($)
  - Priority level
- **Log**: Screenshot of popup

---

## Test Suite 4: Demo Tour

### T4.1 - Start Tour
- **Action**: Click "Run Demo" button in header
- **Expected**:
  - Tour overlay appears
  - First step card shows "Welcome to RANGER"
  - Progress dots appear (7 dots, first active)
  - Map flies to welcome position
- **Log**: Screenshot of first tour step

### T4.2 - Navigate Tour Forward
- **Action**: Click "Next" button 6 times
- **Expected**: Tour progresses through all 7 steps:
  1. Welcome to RANGER
  2. Burn Analyst (IMPACT)
  3. Trail Assessor (DAMAGE)
  4. Cruising Assistant (TIMBER)
  5. NEPA Advisor (COMPLIANCE)
  6. Recovery Coordinator
  7. Ready to Explore
- **For each step**:
  - Card title/content updates
  - Progress dot updates
  - Map flies to new position
  - Relevant layers become visible
- **Log**: Screenshot of each step, any animation issues

### T4.3 - Navigate Tour Backward
- **Action**: Click "Back" button
- **Expected**:
  - Returns to previous step
  - Progress dot updates
  - Map returns to previous position
- **Log**: Back navigation works

### T4.4 - Skip Tour
- **Action**: Click "Skip" button
- **Expected**:
  - Tour overlay disappears
  - App returns to normal state
  - "Run Demo" button reappears in header
- **Log**: Skip functionality

### T4.5 - End Tour
- **Action**: Start tour again, navigate to step 7, click "Start Exploring"
- **Expected**:
  - Tour completes and closes
  - App in normal interactive state
- **Log**: Tour completion

---

## Test Suite 5: Chat Interface

### T5.1 - Open Chat
- **Action**: Click "Ask" button in header
- **Expected**:
  - Chat panel slides in (bottom-right)
  - "Ask RANGER" header visible
  - Welcome message with bot icon
  - 4 suggested query chips visible
  - Input field and send button
- **Log**: Screenshot of chat panel

### T5.2 - Suggested Query Chips
- **Action**: Read chip labels
- **Expected**:
  - "Burn severity"
  - "Trail damage"
  - "Timber salvage"
  - "NEPA pathways"
- **Action**: Click "Burn severity" chip
- **Expected**:
  - Input field populates with full query
- **Log**: Chip interaction

### T5.3 - Send Message (Burn Query)
- **Action**: Click send button (or press Enter)
- **Expected**:
  - User message appears in chat (cyan bubble, right-aligned)
  - Loading indicator appears (spinning icon, "Analyzing...")
  - After 2-10 seconds, AI response appears
  - Response has:
    - Agent badge (e.g., "BURN ANALYST" in red)
    - Confidence percentage
    - Response text
    - "View reasoning" expandable section
- **Log**: Response time, agent routing correct, screenshot

### T5.4 - Reasoning Chain
- **Action**: Click "View reasoning" in AI response
- **Expected**:
  - Expands to show numbered reasoning steps
  - Each step explains logic
- **Log**: Screenshot of expanded reasoning

### T5.5 - Trail Query
- **Action**: Type "Which trails have the most damage?" and send
- **Expected**:
  - Routes to TRAIL ASSESSOR agent (amber badge)
  - Response discusses trail damage
- **Log**: Correct agent routing

### T5.6 - Timber Query
- **Action**: Type "What are the priority timber salvage plots?" and send
- **Expected**:
  - Routes to CRUISING ASSISTANT agent (green badge)
  - Response discusses timber/salvage
- **Log**: Correct agent routing

### T5.7 - NEPA Query
- **Action**: Type "What NEPA requirements apply here?" and send
- **Expected**:
  - Routes to NEPA ADVISOR agent (purple badge)
  - Response discusses environmental compliance
- **Log**: Correct agent routing

### T5.8 - General Query
- **Action**: Type "Give me an overview of recovery status" and send
- **Expected**:
  - Routes to RECOVERY COORDINATOR (cyan badge)
  - Response gives holistic overview
- **Log**: Correct agent routing

### T5.9 - Clear Chat
- **Action**: Click trash icon in chat header
- **Expected**:
  - All messages cleared
  - Returns to welcome state with suggestions
- **Log**: Clear functionality

### T5.10 - Close Chat
- **Action**: Click "Ask" button again (now shows "Close")
- **Expected**:
  - Chat panel closes
  - Button returns to "Ask" state
- **Log**: Toggle functionality

---

## Test Suite 6: Sidebar Lifecycle Phases

### T6.1 - Click IMPACT Phase
- **Action**: Click "IMPACT" in sidebar
- **Expected**:
  - IMPACT becomes active (highlighted)
  - Insight panel updates with Burn Analyst info
- **Log**: Phase switching

### T6.2 - Click DAMAGE Phase
- **Action**: Click "DAMAGE" in sidebar
- **Expected**:
  - DAMAGE becomes active
  - Insight panel shows Trail Assessor info
- **Log**: Phase switching

### T6.3 - Click TIMBER Phase
- **Action**: Click "TIMBER" in sidebar
- **Expected**:
  - TIMBER becomes active
  - Insight panel shows Cruising Assistant info
- **Log**: Phase switching

### T6.4 - Click COMPLIANCE Phase
- **Action**: Click "COMPLIANCE" in sidebar
- **Expected**:
  - COMPLIANCE becomes active
  - Insight panel shows NEPA Advisor info
- **Log**: Phase switching

---

## Test Suite 7: Insight Panel

### T7.1 - Panel Visibility
- **Action**: Inspect top-right area
- **Expected**:
  - Glass-style panel visible
  - Agent name and icon
  - Confidence score bar
  - Summary text
  - Suggested actions (if available)
- **Log**: Screenshot of insight panel

### T7.2 - Expand Reasoning
- **Action**: Click reasoning expand button
- **Expected**:
  - Reasoning chain expands
  - Shows numbered steps
- **Log**: Reasoning visibility

---

## Test Suite 8: Responsive Design

### T8.1 - Tablet View (768x1024)
- **Action**: Resize viewport to tablet size
- **Expected**:
  - Layout adapts
  - All elements still accessible
  - Sidebar may be narrower
  - Chat panel may be wider
- **Log**: Screenshot, any layout breaks

### T8.2 - Mobile View (375x812)
- **Action**: Resize viewport to mobile size
- **Expected**:
  - Sidebar collapses or hides
  - Header shrinks
  - Chat panel goes full-width
  - Map controls smaller but usable
  - Geographic markers may hide
- **Log**: Screenshot, usability issues

---

## Test Suite 9: Error Handling

### T9.1 - Network Error Simulation
- **Action**: Disable network, try to send chat message
- **Expected**:
  - Error message appears in chat
  - App doesn't crash
  - Error styled appropriately (red)
- **Log**: Error handling behavior

### T9.2 - Console Errors
- **Action**: Check browser console throughout testing
- **Expected**:
  - No critical errors
  - No unhandled promise rejections
  - Warnings acceptable but note them
- **Log**: List all console errors/warnings

---

## Test Suite 10: Performance

### T10.1 - Initial Load Time
- **Action**: Measure time from navigation to interactive
- **Expected**: < 5 seconds on good connection
- **Log**: Actual load time

### T10.2 - Map Interaction Smoothness
- **Action**: Pan and zoom rapidly
- **Expected**:
  - 60fps or near
  - No visible lag
  - No tile loading delays > 1s
- **Log**: Any performance issues

### T10.3 - Chat Response Time
- **Action**: Measure AI response times
- **Expected**: 2-10 seconds typical
- **Log**: Average response time

---

## Issue Logging Format

For each issue found, log:

```
ISSUE: [T#.#] [Severity: Critical/High/Medium/Low]
Description: What went wrong
Expected: What should happen
Actual: What actually happened
Screenshot: [filename if applicable]
Console: [any related console output]
Recommendation: Suggested fix
```

---

## Summary Report Template

After completing all tests, provide:

1. **Test Summary**: X passed, Y failed, Z skipped
2. **Critical Issues**: List any blocking issues
3. **High Priority Issues**: List important fixes
4. **Medium/Low Issues**: List nice-to-have fixes
5. **Performance Notes**: Load times, responsiveness
6. **Screenshots**: Key screenshots for reference
7. **Overall Assessment**: Ready for deployment? What needs fixing first?
