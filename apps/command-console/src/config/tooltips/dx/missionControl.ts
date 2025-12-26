/**
 * DX Tooltips: Command View UI Elements
 *
 * Technical documentation for UI components in Command view.
 * Organized by location in the interface.
 */

import { defineDxTooltips } from '../types';

export const missionControlTooltips = defineDxTooltips({
    // ============================================
    // HEADER ELEMENTS
    // ============================================

    'ui-phase-filter': {
        id: 'ui-phase-filter',
        title: 'Phase Filter Chips',
        summary: 'Toggle visibility of fires by recovery phase.',
        details: `
User clicks phase chip (Active/In BAER/In Recovery)
       ↓
togglePhaseFilter(phase) in missionStore.ts
       ↓
Updates phaseFilter[] array (add/remove phase)
       ↓
useFilteredFires() selector recomputes
       ↓
┌─────────────────────────────────────────┐
│ Filtered fires list updates             │
│ • IncidentRail re-renders               │
│ • Map markers update visibility         │
│ • Count badges update                   │
└─────────────────────────────────────────┘

Constraint: At least one phase always selected.
If user tries to deselect last phase, it stays on.
        `.trim(),
        sourceFile: 'stores/missionStore.ts',
        dataPoints: [
            { label: 'State', value: 'phaseFilter[]' },
            { label: 'Default', value: 'All phases on' },
        ],
        category: 'ui',
        priority: 'high',
        location: 'MissionHeader center section',
        relatedIds: ['concept-phases', 'ui-incident-rail'],
    },

    'ui-timeframe-filter': {
        id: 'ui-timeframe-filter',
        title: 'Timeframe Filter',
        summary: 'Filter fires by when they were last updated.',
        details: `
User selects timeframe from dropdown
       ↓
setTimeframeFilter(timeframe) in missionStore.ts
       ↓
Updates filters.timeframe in state
       ↓
useFilteredFires() applies time filter:

┌─────────────────────────────────────────┐
│ last_24h:      lastUpdated > now - 24h  │
│ last_7d:       lastUpdated > now - 7d   │
│ current_season: May 1 - Oct 31 of year  │
│ all:           No time filter           │
└─────────────────────────────────────────┘

Note: "Current Season" is fire season (May-Oct).
Off-season fires still exist but may have
stale data.
        `.trim(),
        sourceFile: 'stores/missionStore.ts',
        dataPoints: [
            { label: 'State', value: 'filters.timeframe' },
            { label: 'Default', value: 'current_season' },
            { label: 'Fire Season', value: 'May 1 - Oct 31' },
        ],
        category: 'ui',
        priority: 'high',
        location: 'MissionHeader right section',
        relatedIds: ['ui-phase-filter'],
    },

    'ui-view-dropdown': {
        id: 'ui-view-dropdown',
        title: 'Portfolio View Selector',
        summary: 'Switch between National Portfolio and Watchlist views.',
        details: `
Two portfolio views available:

┌─────────────────────────────────────────┐
│ NATIONAL PORTFOLIO                      │
│ All fires matching current filters      │
│ Default view for situational awareness  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ MY WATCHLIST                            │
│ Only starred fires                      │
│ Personalized tracking for assigned      │
│ incidents or areas of interest          │
└─────────────────────────────────────────┘

Data flow:
setStackView(view) → missionStore
       ↓
useFilteredFires() checks stackView
       ↓
If 'watchlist': filters to watchlist IDs
If 'national': shows all (filtered by phase/time)
        `.trim(),
        sourceFile: 'stores/missionStore.ts',
        dataPoints: [
            { label: 'State', value: 'stackView' },
            { label: 'Options', value: 'national | watchlist' },
        ],
        category: 'navigation',
        priority: 'medium',
        location: 'MissionHeader left section',
        relatedIds: ['ui-watchlist-star'],
    },

    // ============================================
    // MAP LEGEND
    // ============================================

    'ui-severity-legend': {
        id: 'ui-severity-legend',
        title: 'Managed Fires Legend',
        summary: 'Color coding for fire severity levels on the map.',
        details: `
Legend shows severity classification:

Visual encoding on map:
┌────────────────────────────────────────┐
│ ● Critical  │ Red      │ Largest dots │
│ ● High      │ Orange   │ Large dots   │
│ ● Moderate  │ Yellow   │ Medium dots  │
│ ● Low       │ Green    │ Small dots   │
└────────────────────────────────────────┘

Marker sizing formula (NationalMap.tsx):
size = Math.max(8, Math.min(24, Math.log10(acres) * 5))

This creates logarithmic scaling:
• 1K acres ≈ 15px
• 10K acres ≈ 20px
• 100K acres ≈ 25px (capped at 24)
        `.trim(),
        sourceFile: 'components/mission/NationalMap.tsx',
        dataPoints: [
            { label: 'Min Size', value: '8px' },
            { label: 'Max Size', value: '24px' },
            { label: 'Scale', value: 'Logarithmic' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Left panel legend',
        relatedIds: ['concept-severity', 'ui-fire-markers'],
    },

    'ui-firms-legend': {
        id: 'ui-firms-legend',
        title: 'NASA FIRMS Legend',
        summary: 'Confidence levels for satellite thermal detections.',
        details: `
FIRMS confidence indicates detection reliability:

┌─────────────────────────────────────────┐
│ ● High Confidence (>80%)                │
│   Strong thermal signature              │
│   Very likely active fire               │
│   Color: Orange-red                     │
├─────────────────────────────────────────┤
│ ● Nominal (30-80%)                      │
│   Moderate thermal signature            │
│   Probable fire, some uncertainty       │
│   Color: Orange                         │
├─────────────────────────────────────────┤
│ ● Low Confidence (<30%)                 │
│   Weak thermal signature                │
│   Could be industrial, volcanic, etc.   │
│   Color: Yellow-orange                  │
└─────────────────────────────────────────┘

"2 detections (24h)" = count of FIRMS points
in last 24 hours currently visible on map.
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'High', value: '>80% confidence' },
            { label: 'Nominal', value: '30-80%' },
            { label: 'Low', value: '<30%' },
        ],
        category: 'data',
        priority: 'high',
        location: 'Left panel legend',
        relatedIds: ['data-firms', 'ui-refresh-hotspots'],
    },

    // ============================================
    // MAP INTERACTIONS
    // ============================================

    'ui-fire-markers': {
        id: 'ui-fire-markers',
        title: 'Fire Map Markers',
        summary: 'Interactive circles representing managed fires.',
        details: `
Fire markers are MapLibre circle layers:

Visual Properties:
├─ Color → Severity (red/orange/yellow/green)
├─ Size → log10(acres) scaled
├─ Opacity → 0.8 base, 1.0 on hover
└─ Border → White stroke for contrast

Interactions:
┌─────────────────────────────────────────┐
│ Hover:                                  │
│ • Marker enlarges (1.2x)                │
│ • Cursor changes to pointer             │
│ • setHoveredFireId() updates store      │
│ • Incident card highlights in rail      │
├─────────────────────────────────────────┤
│ Click:                                  │
│ • Opens fire popup                      │
│ • selectFire(id) updates store          │
│ • Card scrolls into view in rail        │
├─────────────────────────────────────────┤
│ Double-click:                           │
│ • Enters Tactical view                  │
└─────────────────────────────────────────┘

Layer IDs: 'fires-layer', 'fires-hover-layer'
        `.trim(),
        sourceFile: 'components/mission/NationalMap.tsx',
        dataPoints: [
            { label: 'Layer', value: 'fires-layer' },
            { label: 'Hover', value: 'fires-hover-layer' },
            { label: 'Source', value: 'fires-source' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Map view',
        relatedIds: ['ui-fire-popup', 'ui-severity-legend'],
    },

    'ui-fire-popup': {
        id: 'ui-fire-popup',
        title: 'Fire Popup Card',
        summary: 'Detailed fire information shown on marker click.',
        details: `
Popup displays selected fire details:

┌─────────────────────────────────────────┐
│ Cedar Creek Fire               [star]   │
│ OR • Region 6 • In Recovery             │
├─────────────────────────────────────────┤
│ [Satellite preview image]               │
│ Coordinates: 43.726, -122.167           │
├─────────────────────────────────────────┤
│ Acres: 127K    Contained: 100%          │
│ Severity: High  Triage: 38.1            │
├─────────────────────────────────────────┤
│ [Enter Simulation →]                    │
│ Double-click marker or press Enter      │
├─────────────────────────────────────────┤
│ EXTERNAL TOOLS                          │
│ [FIRMS] [InciWeb] [NIFC] [MTBS]         │
└─────────────────────────────────────────┘

Data bound from selectedFire in missionStore.
External links open in new tab.
        `.trim(),
        sourceFile: 'components/mission/NationalMap.tsx',
        dataPoints: [
            { label: 'Trigger', value: 'Marker click' },
            { label: 'State', value: 'selectedFireId' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Map overlay on selected fire',
        relatedIds: ['ui-enter-tactical', 'ui-external-tools'],
    },

    'ui-refresh-hotspots': {
        id: 'ui-refresh-hotspots',
        title: 'Refresh Hotspots',
        summary: 'Fetches latest NASA FIRMS satellite thermal detections.',
        details: `
User clicks "Refresh Hotspots"
       ↓
fetchFirmsHotspots() in nationalFireService.ts
       ↓
NASA FIRMS API request:
• Endpoint: firms.modaps.eosdis.nasa.gov
• Sensor: VIIRS (S-NPP satellite)
• Timeframe: Last 24 hours
• Format: CSV
       ↓
Parse CSV → GeoJSON FeatureCollection
       ↓
setFirmsHotspots(features) updates store
       ↓
Map re-renders 'firms-layer' with new data
       ↓
Legend updates "X detections (24h)"

Rate limit: NASA allows ~100 requests/day.
Cached in store to prevent redundant fetches.
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'API', value: 'NASA FIRMS CSV' },
            { label: 'Sensor', value: 'VIIRS S-NPP' },
            { label: 'Timeframe', value: 'Last 24 hours' },
            { label: 'Rate Limit', value: '~100/day' },
        ],
        category: 'integration',
        priority: 'high',
        location: 'Map controls (bottom right)',
        relatedIds: ['data-firms', 'ui-firms-legend'],
    },

    'ui-reset-view': {
        id: 'ui-reset-view',
        title: 'Reset View Button',
        summary: 'Returns map to default CONUS view.',
        details: `
User clicks "Reset View"
       ↓
map.flyTo() with default bounds:

Default View:
┌─────────────────────────────────────────┐
│ Center: [-98.5795, 39.8283]             │
│         (Geographic center of CONUS)    │
│ Zoom: 4                                 │
│ Pitch: 0° (flat)                        │
│ Bearing: 0° (north up)                  │
└─────────────────────────────────────────┘

Also clears:
• Selected fire (closes popup)
• Hovered fire state

Does NOT reset:
• Filters (phase, timeframe)
• Watchlist
• Layer visibility
        `.trim(),
        sourceFile: 'components/mission/NationalMap.tsx',
        dataPoints: [
            { label: 'Center', value: 'CONUS center' },
            { label: 'Zoom', value: '4' },
        ],
        category: 'navigation',
        priority: 'low',
        location: 'Map controls (bottom right)',
    },

    'ui-firms-toggle': {
        id: 'ui-firms-toggle',
        title: 'FIRMS Layer Toggle',
        summary: 'Show/hide NASA FIRMS thermal detection points.',
        details: `
Toggle button controls FIRMS layer visibility:

┌─────────────────────────────────────────┐
│ [⚙ FIRMS (2)]                          │
│                                         │
│ Badge shows count of visible detections │
│ Click toggles firms-layer visibility    │
└─────────────────────────────────────────┘

State flow:
toggleFirmsVisible() in mapStore
       ↓
firmsVisible boolean flips
       ↓
Map layer visibility updates:
map.setLayoutProperty('firms-layer', 'visibility', ...)

FIRMS data persists in store even when hidden.
        `.trim(),
        sourceFile: 'stores/mapStore.ts',
        dataPoints: [
            { label: 'State', value: 'firmsVisible' },
            { label: 'Layer', value: 'firms-layer' },
        ],
        category: 'ui',
        priority: 'low',
        location: 'Map controls (bottom right)',
        relatedIds: ['data-firms', 'ui-firms-legend'],
    },

    // ============================================
    // INCIDENT RAIL
    // ============================================

    'ui-incident-rail': {
        id: 'ui-incident-rail',
        title: 'Incident Rail',
        summary: 'Scrollable list of fires matching current filters.',
        details: `
Right panel structure:

┌─────────────────────────────────────────┐
│ Incident List                           │
│ [Search fires...]                       │
├─────────────────────────────────────────┤
│ Showing 2 of 2 fires      [24h] [Reset] │
│ ● 1  ● 1  ⏱ 2 updated    NIFC: Unknown │
├─────────────────────────────────────────┤
│ [Incident Card 1]                       │
│ [Incident Card 2]                       │
│ ...                                     │
└─────────────────────────────────────────┘

Data flow:
useFilteredFires() → fires[]
       ↓
Sort by triage score (descending)
       ↓
Map to <IncidentCard /> components

Interactions:
• Hover card → highlights map marker
• Click card → selects fire, opens popup
• Click "Enter" → navigates to Tactical
        `.trim(),
        sourceFile: 'components/mission/IncidentRail.tsx',
        dataPoints: [
            { label: 'Width', value: '320px fixed' },
            { label: 'Sort', value: 'Triage desc' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Right panel',
        relatedIds: ['ui-incident-card', 'ui-filter-summary'],
    },

    'ui-filter-summary': {
        id: 'ui-filter-summary',
        title: 'Filter Summary Bar',
        summary: 'Shows active filter count and quick reset option.',
        details: `
Summary bar shows filtering status:

"Showing 2 of 2 fires"
• First number: filtered count
• Second number: total before filters

Filter chips:
• [24h] = timeframe filter active
• Click to remove individual filter

Status indicators:
• ● 1 ● 1 = severity breakdown (critical, high, etc.)
• ⏱ 2 updated today = recently modified fires
• NIFC: Unknown = data freshness status

[Reset] clears all filters to defaults.
        `.trim(),
        sourceFile: 'components/mission/IncidentRail.tsx',
        dataPoints: [
            { label: 'Shows', value: 'filtered/total count' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Top of incident rail',
        relatedIds: ['ui-incident-rail', 'ui-phase-filter'],
    },

    'ui-incident-card': {
        id: 'ui-incident-card',
        title: 'Incident Card',
        summary: 'Compact fire summary optimized for triage decisions.',
        details: `
Card layout (triage-first hierarchy):

┌─────────────────────────────────────────┐
│ 165.5 ████████░░  Bootleg Fire       ☆ │
│ ▲ CRITICAL · IN RECOVERY                │
├─────────────────────────────────────────┤
│ 414K acres · 100% · OR · R6   [Enter →] │
└─────────────────────────────────────────┘

Components:
├─ Triage score (large, left)
├─ Severity bar (mini visual)
├─ Fire name
├─ Watchlist star (toggle)
├─ Severity badge + Phase badge
├─ Metadata row (acres, containment, location)
└─ Enter button (→ Tactical)

Interactions:
• Hover → setHoveredFireId() → map marker highlights
• Click → selectFire() → popup opens
• Star → toggleWatchlist() → adds/removes from list
• Enter → navigate to /twin/{fireId}
        `.trim(),
        sourceFile: 'components/mission/IncidentCard.tsx',
        dataPoints: [
            { label: 'Height', value: '~100px' },
            { label: 'Key Action', value: 'Enter → Tactical' },
        ],
        category: 'ui',
        priority: 'high',
        location: 'Incident rail list items',
        relatedIds: ['ui-triage-score', 'ui-watchlist-star'],
    },

    'ui-triage-score': {
        id: 'ui-triage-score',
        title: 'Triage Score',
        summary: 'Prioritization score calculated from severity, size, and phase.',
        details: `
Triage score formula:

score = severityWeight × acresNormalized × phaseMultiplier

Components:
┌─────────────────────────────────────────┐
│ severityWeight:                         │
│   Critical = 4                          │
│   High = 3                              │
│   Moderate = 2                          │
│   Low = 1                               │
├─────────────────────────────────────────┤
│ acresNormalized:                        │
│   Math.min(acres / 10000, 50)           │
│   Caps at 500K acres (50 points)        │
├─────────────────────────────────────────┤
│ phaseMultiplier:                        │
│   Active = 2.0 (urgent)                 │
│   In BAER = 1.5 (time-sensitive)        │
│   In Recovery = 1.0 (baseline)          │
└─────────────────────────────────────────┘

Example: 414K acres, Critical, In Recovery
= 4 × 41.4 × 1.0 = 165.6

Higher score = needs attention first.
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'Range', value: '0 - 400+' },
            { label: 'Factors', value: '3 (sev, size, phase)' },
        ],
        category: 'ui',
        priority: 'high',
        location: 'Incident cards, Fire popup',
        relatedIds: ['concept-severity', 'concept-phases'],
    },

    'ui-watchlist-star': {
        id: 'ui-watchlist-star',
        title: 'Watchlist Star',
        summary: 'Toggle to add/remove fire from personal watchlist.',
        details: `
Star icon toggles watchlist membership:

User clicks star
       ↓
toggleWatchlist(fireId) in missionStore
       ↓
Updates watchlist Set in state
       ↓
Persists to localStorage

When viewing "My Watchlist":
• Only starred fires shown
• Badge shows count in view dropdown

Use cases:
• Track assigned incidents
• Monitor fires in your region
• Follow fires of personal interest

State: watchlist: Set<string> (fire IDs)
        `.trim(),
        sourceFile: 'stores/missionStore.ts',
        dataPoints: [
            { label: 'State', value: 'watchlist Set' },
            { label: 'Storage', value: 'localStorage' },
        ],
        category: 'ui',
        priority: 'medium',
        location: 'Incident cards, Fire popup',
        relatedIds: ['ui-view-dropdown'],
    },

    'ui-enter-tactical': {
        id: 'ui-enter-tactical',
        title: 'Enter Tactical',
        summary: 'Navigate to Tactical view for detailed fire analysis.',
        details: `
"Enter Tactical" transitions to Tactical view:

User clicks "Enter →" or double-clicks marker
       ↓
navigate('/twin/{fireId}')
       ↓
Tactical view loads with fire context:
┌─────────────────────────────────────────┐
│ • Fire perimeter loaded on map          │
│ • Satellite imagery centered on fire    │
│ • Briefing panel ready for queries      │
│ • Workflow phases available             │
└─────────────────────────────────────────┘

Context set in fireContextStore:
• activeFire = selected fire data
• forest, region, coordinates populated

Keyboard: Enter key also triggers when
card or popup is focused.
        `.trim(),
        sourceFile: 'components/mission/IncidentCard.tsx',
        dataPoints: [
            { label: 'Route', value: '/twin/:fireId' },
            { label: 'Shortcut', value: 'Enter key' },
        ],
        category: 'navigation',
        priority: 'high',
        location: 'Incident cards, Fire popup',
        relatedIds: ['ui-incident-card', 'ui-fire-popup'],
    },

    'ui-external-tools': {
        id: 'ui-external-tools',
        title: 'External Tools Links',
        summary: 'Quick access to authoritative fire data sources.',
        details: `
Four external tool buttons in fire popup:

┌─────────────────────────────────────────┐
│ FIRMS   │ NASA satellite portal          │
│         │ Real-time thermal detections   │
│         │ firms.modaps.eosdis.nasa.gov   │
├─────────┼────────────────────────────────┤
│ InciWeb │ Public incident information    │
│         │ Closures, evacuation, updates  │
│         │ inciweb.nwcg.gov               │
├─────────┼────────────────────────────────┤
│ NIFC    │ National Interagency Fire Ctr  │
│         │ Official perimeters, reports   │
│         │ nifc.gov                        │
├─────────┼────────────────────────────────┤
│ MTBS    │ Burn severity archive          │
│         │ Historical fire data           │
│         │ mtbs.gov                        │
└─────────────────────────────────────────┘

Links open in new tab (_blank).
URLs constructed with fire name/location.
        `.trim(),
        sourceFile: 'components/mission/NationalMap.tsx',
        dataPoints: [
            { label: 'Links', value: '4 external sites' },
            { label: 'Target', value: '_blank' },
        ],
        category: 'integration',
        priority: 'low',
        location: 'Fire popup bottom section',
        relatedIds: ['data-firms', 'data-nifc', 'data-inciweb', 'data-mtbs'],
    },
});
