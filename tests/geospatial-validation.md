# Phase 7: Geospatial Layer Validation - Test Plan

## Context

RANGER's geospatial visualization is critical for spatial decision-making. This phase validates that PMTiles layers, burn severity polygons, and interactive tooltips work correctly in the Command Console.

---

## Pre-Flight Validation

### Step 1: Verify Map Component Architecture

```bash
# Check if CedarCreekMap component exists
ls -la apps/command-console/src/components/map/

# Verify PMTiles dependencies
cd apps/command-console
npm list pmtiles maplibre-gl
```

**Expected:**
- `CedarCreekMap.tsx` exists
- `pmtiles` and `maplibre-gl` packages installed

---

## Phase 7.1: PMTiles Federal Boundary Layers

### Objective
Verify that federal boundary layers (forests, ranger districts) load from PMTiles and render correctly.

### Test Steps

1. **Start Command Console** (if not running):
   ```bash
   cd apps/command-console
   npm run dev -- --port 3000
   ```

2. **Navigate to Cedar Creek tactical view**:
   - Open http://localhost:3000/console
   - Click "Cedar Creek Fire" card
   - Verify map loads

3. **Validate Layer Rendering**:

| Layer | Expected Behavior | Visual Check |
|-------|-------------------|--------------|
| **National Forests** | Green polygon outlines | Visible on map |
| **Ranger Districts** | Lighter green subdivisions | Visible within forests |
| **Fire Perimeter** | Red/orange boundary | Cedar Creek outline visible |

### Validation Checklist

- [ ] Map loads without errors in browser console
- [ ] Federal boundary layers visible
- [ ] Layers don't flicker or disappear on zoom
- [ ] Map loads in <3 seconds (Trust Gate criterion)

---

## Phase 7.2: Burn Severity Polygon Rendering

### Objective
Verify that burn severity data from `assess_severity` tool renders as color-coded polygons.

### Test Steps

1. **Trigger burn severity analysis**:
   - In chat: "What is the burn severity for Cedar Creek?"
   - Wait for Burn Analyst response

2. **Verify polygon rendering**:

| Severity Class | Expected Color | Visual Check |
|----------------|----------------|--------------|
| **HIGH** | Dark red/brown | Visible in core burn area |
| **MODERATE** | Orange | Visible in transition zones |
| **LOW** | Yellow | Visible at perimeter |
| **UNBURNED** | Green | Islands within perimeter |

### Validation Checklist

- [ ] Severity polygons appear after agent response
- [ ] Colors match MTBS classification standards
- [ ] Polygon boundaries align with fire perimeter
- [ ] Legend shows severity classes correctly

---

## Phase 7.3: Interactive Tooltip Validation

### Objective
Verify that hovering over map features displays accurate jurisdiction information.

### Test Steps

1. **Hover over National Forest boundary**:
   - Expected tooltip: "Willamette National Forest" (or similar)

2. **Hover over Ranger District**:
   - Expected tooltip: "McKenzie River Ranger District" (or similar)

3. **Hover over burn severity polygon**:
   - Expected tooltip: Severity class + acreage

### Validation Checklist

- [ ] Tooltips appear on hover within 200ms
- [ ] Tooltip text is readable (not truncated)
- [ ] Tooltips disappear when mouse moves away
- [ ] No tooltip flickering or z-index issues

---

## Phase 7.4: Layer Toggle Controls

### Objective
Verify that users can show/hide layers using UI controls.

### Test Steps

1. **Locate layer control panel** (usually top-right or sidebar)

2. **Toggle each layer**:
   - [ ] Federal Boundaries toggle works
   - [ ] Burn Severity toggle works
   - [ ] Fire Perimeter toggle works

3. **Verify state persistence**:
   - Toggle layer off
   - Refresh page
   - Verify layer state is restored (if implemented)

---

## Phase 7.5: Map Performance Validation

### Objective
Verify map performance meets Trust Gate 1→2 criteria (<3s load time).

### Test Steps

1. **Measure initial load time**:
   ```javascript
   // Open browser DevTools → Network tab
   // Reload page
   // Check "DOMContentLoaded" time
   ```

2. **Measure tile loading**:
   - Count PMTiles requests in Network tab
   - Verify tiles load progressively (not all at once)

3. **Test zoom performance**:
   - Zoom in/out rapidly
   - Verify no lag or stuttering

### Performance Checklist

- [ ] Initial map load <3 seconds
- [ ] Tile requests use HTTP/2 or HTTP/3
- [ ] No 404 errors for missing tiles
- [ ] Smooth zoom/pan (60fps target)

---

## Phase 7.6: Data Integration Verification

### Objective
Verify that agent tool outputs correctly integrate with map visualization.

### Test Steps

1. **Test Burn Analyst → Map integration**:
   ```
   Query: "Show me high severity areas for Cedar Creek"
   Expected: Map highlights high severity polygons
   ```

2. **Test Trail Assessor → Map integration**:
   ```
   Query: "Which trails are damaged?"
   Expected: Map shows trail markers with damage indicators
   ```

3. **Test Cruising Assistant → Map integration**:
   ```
   Query: "Where are the timber plots?"
   Expected: Map shows plot locations
   ```

### Integration Checklist

- [ ] Agent responses trigger map updates
- [ ] Map updates happen within 1 second of response
- [ ] Multiple queries don't cause layer conflicts
- [ ] Map state resets correctly between queries

---

## Success Criteria

### Phase 7 PASS Requirements

- [ ] All PMTiles layers load without errors
- [ ] Burn severity polygons render with correct colors
- [ ] Tooltips display accurate jurisdiction names
- [ ] Layer toggles work correctly
- [ ] Map loads in <3 seconds
- [ ] Agent tool outputs integrate with map

### Demo-Ready Checklist

- [ ] Screenshot: Map with all layers visible
- [ ] Screenshot: Tooltip interaction
- [ ] Screenshot: Burn severity polygons
- [ ] Video: Layer toggle demonstration (optional)

---

## Troubleshooting

### If PMTiles layers don't load:

```bash
# Check if PMTiles files exist
ls -la apps/command-console/public/pmtiles/

# Verify CORS headers in dev server
curl -I http://localhost:3000/pmtiles/federal-boundaries.pmtiles
```

### If tooltips don't appear:

```typescript
// Check MapLibre event listeners in CedarCreekMap.tsx
map.on('mousemove', 'layer-name', (e) => {
  console.log('Hover event:', e.features);
});
```

### If map performance is slow:

```bash
# Check bundle size
npm run build
ls -lh apps/command-console/dist/

# Verify tile caching
# Open DevTools → Application → Cache Storage
```

---

## Output Format

After completing Phase 7, report results:

```markdown
## Phase 7 Validation Report

### 7.1 PMTiles Layers
- [ ] Federal boundaries: ✅/❌
- [ ] Ranger districts: ✅/❌
- [ ] Fire perimeter: ✅/❌
- Load time: X.Xs

### 7.2 Burn Severity Polygons
- [ ] Color coding correct: ✅/❌
- [ ] Alignment with perimeter: ✅/❌
- [ ] Legend accuracy: ✅/❌

### 7.3 Tooltips
- [ ] Jurisdiction tooltips: ✅/❌
- [ ] Severity tooltips: ✅/❌
- [ ] Response time: Xms

### 7.4 Layer Toggles
- [ ] All toggles functional: ✅/❌

### 7.5 Performance
- [ ] Load time <3s: ✅/❌
- [ ] Smooth zoom/pan: ✅/❌

### 7.6 Data Integration
- [ ] Burn Analyst integration: ✅/❌
- [ ] Trail Assessor integration: ✅/❌
- [ ] Cruising Assistant integration: ✅/❌

### Screenshots Captured
1. [map_all_layers.png]
2. [tooltip_interaction.png]
3. [burn_severity_polygons.png]

### Issues Found
- [List any issues]

### Verdict: PASS / FAIL / PARTIAL
```

---

## Reference Documents

- `/apps/command-console/src/components/map/CedarCreekMap.tsx` - Map component
- `/apps/command-console/src/config/tooltipContent.ts` - Tooltip configuration
- `/docs/guides/learning/GEOSPATIAL-FORMATS.md` - PMTiles architecture
- `/docs/guides/learning/MAPLIBRE-INTEGRATION.md` - MapLibre patterns
