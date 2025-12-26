/**
 * DX Tooltips: Domain Concepts
 *
 * Core forestry and fire management concepts that developers need to understand.
 * These are foundational concepts referenced across the application.
 */

import { defineDxTooltips } from '../types';

export const domainConcepts = defineDxTooltips({
    // ============================================
    // FIRE RECOVERY LIFECYCLE
    // ============================================

    'concept-baer': {
        id: 'concept-baer',
        title: 'BAER Assessment',
        summary: 'Burned Area Emergency Response - rapid post-fire assessment program.',
        details: `
BAER = Burned Area Emergency Response

Timeline after fire containment:
       ↓
Day 1-7: BAER team deployed
       ↓
Day 7-14: Field assessment
       ↓
Day 14-21: Report & funding request
       ↓
Day 21+: Emergency stabilization begins

BAER focuses on:
• Life/safety hazards (falling trees, debris flows)
• Watershed protection (erosion control)
• Critical infrastructure (roads, utilities)

NOT for long-term recovery - that's separate funding.
        `.trim(),
        sourceFile: 'types/mission.ts',
        dataPoints: [
            { label: 'Timeline', value: '7-21 days post-fire' },
            { label: 'Focus', value: 'Emergency stabilization' },
            { label: 'Authority', value: 'USFS Regional Forester' },
        ],
        category: 'domain',
        priority: 'high',
        location: 'Phase filter chips, Incident cards',
        relatedIds: ['concept-phases', 'concept-recovery'],
    },

    'concept-phases': {
        id: 'concept-phases',
        title: 'Fire Recovery Phases',
        summary: 'The three phases a fire progresses through after ignition.',
        details: `
Fire Lifecycle in RANGER:

┌─────────────────────────────────────────┐
│  ACTIVE                                 │
│  Fire is burning or recently contained  │
│  Focus: Suppression, safety             │
│  Color: Red/Orange                      │
└─────────────────────────────────────────┘
            ↓ (containment + BAER trigger)
┌─────────────────────────────────────────┐
│  IN BAER                                │
│  Emergency assessment underway          │
│  Focus: Hazard mitigation, watershed    │
│  Color: Amber                           │
└─────────────────────────────────────────┘
            ↓ (BAER complete)
┌─────────────────────────────────────────┐
│  IN RECOVERY                            │
│  Long-term restoration                  │
│  Focus: Reforestation, trail repair     │
│  Color: Green                           │
└─────────────────────────────────────────┘

Phase determines available workflows in Tactical view.
        `.trim(),
        sourceFile: 'types/mission.ts',
        dataPoints: [
            { label: 'Active', value: 'Suppression priority' },
            { label: 'In BAER', value: '7-21 day assessment' },
            { label: 'In Recovery', value: 'Months to years' },
        ],
        category: 'domain',
        priority: 'high',
        location: 'MissionHeader phase filters',
        relatedIds: ['concept-baer', 'ui-phase-filter'],
    },

    'concept-severity': {
        id: 'concept-severity',
        title: 'Fire Severity Classification',
        summary: 'How fires are classified by impact level (Critical → Low).',
        details: `
Severity is calculated from multiple factors:

Input Factors:
├─ Burn intensity (dNBR satellite analysis)
├─ Acres burned
├─ Structures threatened/destroyed
├─ Watershed impact
└─ Species habitat affected

Classification Thresholds:
┌──────────┬─────────────────────────────┐
│ CRITICAL │ >100K acres OR structures   │
│          │ destroyed OR watershed      │
├──────────┼─────────────────────────────┤
│ HIGH     │ >50K acres OR significant   │
│          │ infrastructure damage       │
├──────────┼─────────────────────────────┤
│ MODERATE │ >10K acres, manageable      │
│          │ with standard resources     │
├──────────┼─────────────────────────────┤
│ LOW      │ <10K acres, minimal impact  │
└──────────┴─────────────────────────────┘

Severity affects triage score calculation.
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'Critical', value: '>100K acres' },
            { label: 'High', value: '>50K acres' },
            { label: 'Moderate', value: '>10K acres' },
            { label: 'Low', value: '<10K acres' },
        ],
        category: 'domain',
        priority: 'high',
        location: 'Legend, Incident cards, Map markers',
        relatedIds: ['ui-triage-score', 'ui-severity-badge'],
    },

    'concept-containment': {
        id: 'concept-containment',
        title: 'Fire Containment',
        summary: 'What "containment percentage" actually means.',
        details: `
Containment ≠ Extinguished

Containment measures perimeter control:

0% Contained:
┌─────────────────┐
│    🔥🔥🔥       │  Fire spreading freely
│   🔥🔥🔥🔥      │  No control lines
│    🔥🔥🔥       │
└─────────────────┘

50% Contained:
┌─────────────────┐
│ ═══🔥🔥🔥      │  Control line on
│    🔥🔥🔥🔥     │  half of perimeter
│    🔥🔥🔥       │
└─────────────────┘

100% Contained:
┌─────────────────┐
│ ═══════════════ │  Fire surrounded
│ ║  🔥🔥🔥    ║ │  Can still burn
│ ║   🔥🔥     ║ │  inside lines
│ ═══════════════ │
└─────────────────┘

100% contained fires can still be:
• Hot inside the perimeter
• Weeks from being "out"
• In active monitoring status
        `.trim(),
        sourceFile: 'types/fire.ts',
        dataPoints: [
            { label: 'Measurement', value: 'Perimeter %' },
            { label: '100% contained', value: 'NOT extinguished' },
        ],
        category: 'domain',
        priority: 'medium',
        location: 'Fire popup, Incident cards',
    },

    'concept-regions': {
        id: 'concept-regions',
        title: 'USFS Regions',
        summary: 'Forest Service regional organization (R1-R10).',
        details: `
USFS divides the US into numbered regions:

┌─────────────────────────────────────────┐
│ R1  │ Northern (MT, ND, ID-north)       │
│ R2  │ Rocky Mountain (CO, WY, SD, NE)   │
│ R3  │ Southwestern (AZ, NM)             │
│ R4  │ Intermountain (UT, NV, ID-south)  │
│ R5  │ Pacific Southwest (CA, HI, Guam)  │
│ R6  │ Pacific Northwest (OR, WA)        │
│ R8  │ Southern (13 southeastern states) │
│ R9  │ Eastern (20 northeastern states)  │
│ R10 │ Alaska                            │
└─────────────────────────────────────────┘

Note: R7 was merged into R9 in 1965.

In RANGER:
• Region shown on incident cards (e.g., "R6")
• Fires filtered/grouped by region
• Each region has distinct fire seasons
        `.trim(),
        sourceFile: 'types/fire.ts',
        dataPoints: [
            { label: 'Total Regions', value: '9 active' },
            { label: 'Pacific NW', value: 'R6 (OR, WA)' },
        ],
        category: 'domain',
        priority: 'low',
        location: 'Incident cards, Filters',
    },

    // ============================================
    // DATA SOURCES
    // ============================================

    'data-firms': {
        id: 'data-firms',
        title: 'NASA FIRMS',
        summary: 'Fire Information for Resource Management System - satellite thermal detection.',
        details: `
FIRMS = Fire Information for Resource Management System

How it works:
┌─────────────────────────────────────────┐
│ VIIRS Satellite (S-NPP & NOAA-20)       │
│ Orbits Earth every ~100 minutes         │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ Thermal Anomaly Detection               │
│ Identifies heat signatures > background │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ FIRMS Processing (NASA)                 │
│ Filters, classifies, publishes          │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ RANGER fetches via CSV API              │
│ Updates on "Refresh Hotspots" click     │
└─────────────────────────────────────────┘

Confidence Levels:
• High (>80%): Very likely fire
• Nominal (30-80%): Probable fire
• Low (<30%): Possible false positive

Limitations:
• Cloud cover blocks detection
• Small fires may be missed
• Industrial heat sources can trigger
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'Satellite', value: 'VIIRS S-NPP' },
            { label: 'Resolution', value: '375m' },
            { label: 'Latency', value: '~3 hours' },
            { label: 'API', value: 'NASA FIRMS CSV' },
        ],
        category: 'data',
        priority: 'high',
        location: 'Map legend, FIRMS button, Refresh Hotspots',
        relatedIds: ['ui-refresh-hotspots', 'ui-firms-legend'],
    },

    'data-nifc': {
        id: 'data-nifc',
        title: 'NIFC Data',
        summary: 'National Interagency Fire Center - authoritative fire perimeter data.',
        details: `
NIFC = National Interagency Fire Center

The "source of truth" for active fire data:

Data Published:
├─ Fire perimeters (GeoJSON polygons)
├─ Incident details (name, acres, containment)
├─ Daily situation reports
└─ Resource deployment status

Update Frequency:
• Active fires: Every 12-24 hours
• Perimeters: As mapping flights occur
• Situation reports: Daily at 0600 local

In RANGER:
┌─────────────────────────────────────────┐
│ nationalFireService.ts                  │
│ Fetches from NIFC ArcGIS REST API       │
│ Caches results in Zustand store         │
│ "NIFC: Unknown" = no recent data        │
└─────────────────────────────────────────┘
        `.trim(),
        sourceFile: 'services/nationalFireService.ts',
        dataPoints: [
            { label: 'Source', value: 'NIFC ArcGIS' },
            { label: 'Update', value: '12-24 hours' },
            { label: 'Authority', value: 'Federal agencies' },
        ],
        category: 'data',
        priority: 'medium',
        location: 'Incident rail header, Data freshness indicators',
        relatedIds: ['data-inciweb'],
    },

    'data-inciweb': {
        id: 'data-inciweb',
        title: 'InciWeb',
        summary: 'Incident Information System - public-facing fire incident portal.',
        details: `
InciWeb = Incident Web

Public information portal for wildfires:

Content:
├─ Incident narratives (human-written)
├─ Closure orders and maps
├─ Press releases
├─ Evacuation information
└─ Photos and videos

Relationship to NIFC:
┌─────────────────────────────────────────┐
│ NIFC = Authoritative operational data   │
│        (perimeters, acres, resources)   │
├─────────────────────────────────────────┤
│ InciWeb = Public communication layer    │
│           (context, closures, updates)  │
└─────────────────────────────────────────┘

In RANGER:
• External link button opens InciWeb page
• Not used for data ingestion (Phase 1)
• Future: Could scrape for narrative context
        `.trim(),
        sourceFile: 'components/mission/FirePopup.tsx',
        dataPoints: [
            { label: 'Audience', value: 'Public' },
            { label: 'Content', value: 'Narratives, closures' },
        ],
        category: 'data',
        priority: 'low',
        location: 'External Tools section in fire popup',
        relatedIds: ['data-nifc', 'data-mtbs'],
    },

    'data-mtbs': {
        id: 'data-mtbs',
        title: 'MTBS',
        summary: 'Monitoring Trends in Burn Severity - standardized burn severity mapping.',
        details: `
MTBS = Monitoring Trends in Burn Severity

USGS/USFS program for consistent severity mapping:

Process:
┌─────────────────────────────────────────┐
│ 1. Pre-fire satellite imagery           │
│    (Landsat, Sentinel-2)                │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ 2. Post-fire satellite imagery          │
│    (captured after fire containment)    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ 3. dNBR calculation                     │
│    Differenced Normalized Burn Ratio    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ 4. Severity classification              │
│    High / Moderate / Low / Unburned     │
└─────────────────────────────────────────┘

Coverage:
• All fires >1000 acres (CONUS)
• All fires >500 acres (Alaska)
• Historical data back to 1984
        `.trim(),
        sourceFile: 'services/burnSeverityService.ts',
        dataPoints: [
            { label: 'Resolution', value: '30m (Landsat)' },
            { label: 'Min Size', value: '1000 acres' },
            { label: 'History', value: 'Since 1984' },
        ],
        category: 'data',
        priority: 'low',
        location: 'External Tools section, Tactical analysis',
        relatedIds: ['concept-severity'],
    },
});
