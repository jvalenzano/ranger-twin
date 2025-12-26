/**
 * Tooltip Content Configuration
 * 
 * Centralized tooltip content for the RANGER Command Console.
 * Organized by UI section for easy maintenance and updates.
 */

export interface TooltipContent {
    title: string;
    description: string;
    tip?: string;
    shortcut?: string;
    metadata?: string;
    accentColor?: string; // Optional hex color for tip text (e.g., phase colors)
}

interface TooltipContentConfig {
    workflowsHeader: TooltipContent;
    workflowPhases: Record<string, TooltipContent>;
    mapControls: Record<string, TooltipContent>;
    confidenceScores: Record<string, TooltipContent>;
    dataSources: Record<string, TooltipContent>;
    legend: TooltipContent;
}

export const tooltipContent: TooltipContentConfig = {
    workflowsHeader: {
        title: 'Recovery Workflows',
        description: 'Post-fire recovery follows a sequential process. Start with Impact to assess burn severity, then progress through Damage, Timber, and Compliance phases. Each phase builds on insights from previous analyses.',
        tip: 'Select a workflow below to begin. The AI agent will analyze data and provide actionable briefings.',
    },
    workflowPhases: {
        IMPACT: {
            title: 'Burn Severity Analysis',
            description: 'Identifies fire damage intensity using satellite imagery. This foundational analysis informs all downstream assessments. Start here after fire containment.',
            tip: 'High-severity zones require immediate attention for safety hazards',
        },
        DAMAGE: {
            title: 'Trail & Infrastructure',
            description: 'Assesses damage to trails, roads, and facilities. Requires Impact analysis to prioritize high-severity areas. Generates work orders for field crews.',
            tip: 'Bridge failures and debris flows are flagged as critical priorities',
        },
        TIMBER: {
            title: 'Salvage Prioritization',
            description: 'Identifies timber plots for potential salvage harvest. Considers burn severity, access, and ecological constraints. Exports to FSVeg format.',
            tip: 'Salvage operations must begin within 12-18 months for optimal value',
        },
        COMPLIANCE: {
            title: 'Regulatory Review',
            description: 'NEPA requirements, endangered species, watershed protections. Synthesizes findings from previous phases. Required before field operations.',
            tip: 'Compliance review typically takes 60-90 days for categorical exclusions',
        },
    },
    mapControls: {
        SAT: {
            title: 'Satellite Imagery',
            description: 'High-resolution aerial photography. Best for identifying landmarks, structures, and ground conditions.',
            shortcut: 'S',
        },
        TER: {
            title: '3D Terrain',
            description: 'Elevation model with 10m resolution. Shows topography, drainages, and slope. 2.5× vertical exaggeration applied.',
            shortcut: 'T',
        },
        IR: {
            title: 'Infrared Analysis',
            description: 'Thermal/near-infrared composite highlighting burn severity. Red = high severity, Yellow = moderate, Green = low/unburned.',
            shortcut: 'I',
        },
        measureDistance: {
            title: 'Measure Distance',
            description: 'Calculate distances on the map. Click to start, double-click to finish. Measurements shown in feet (<0.1 mi) or miles.',
            shortcut: 'D',
        },
        measureArea: {
            title: 'Measure Area',
            description: 'Calculate areas on the map. Click to create polygon vertices, double-click to close shape. Requires minimum 3 points.',
            shortcut: 'A',
        },
        visualAudit: {
            title: 'Area Analysis',
            description: 'Select an area for AI-powered assessment. Cross-reference map data against USFS records.',
            tip: 'Draw a box on the map. For single features, click them directly to use Site Analysis.',
            shortcut: 'F',
        },
        zoomIn: {
            title: 'Zoom In',
            description: 'Increase map magnification to see more detail.',
            shortcut: '+',
        },
        zoomOut: {
            title: 'Zoom Out',
            description: 'Decrease map magnification to see broader area.',
            shortcut: '-',
        },
        resetNorth: {
            title: 'Reset North',
            description: 'Reset map rotation to north-up orientation.',
            shortcut: 'N',
        },
    },
    confidenceScores: {
        agentConfidence: {
            title: 'Agent Confidence',
            description: 'How certain the AI is about this assessment. >90% = High confidence, 70-90% = Review recommended, <70% = Requires verification.',
            tip: 'Confidence is calculated from data quality, coverage, and model certainty',
        },
        sourceReliability: {
            title: 'Source Reliability',
            description: 'Quality score for this data source based on resolution, recency, and coverage.',
            tip: 'Tier 1 sources (>90%) are authoritative; Tier 3 (<70%) need field validation',
        },
    },
    dataSources: {
        MTBS: {
            title: 'Monitoring Trends in Burn Severity',
            description: 'USGS program providing standardized burn severity classifications. 30m resolution, updated post-fire.',
            metadata: '30m resolution, 2024 classification',
        },
        'Sentinel-2': {
            title: 'ESA Sentinel-2 Satellite',
            description: 'Multispectral satellite imagery at 10-20m resolution. 5-day revisit cycle enables recent post-fire analysis.',
            metadata: '10-20m resolution, 5-day revisit',
        },
        dNBR: {
            title: 'Differenced Normalized Burn Ratio',
            description: 'Spectral index comparing pre/post-fire vegetation. Standard method for severity classification.',
            metadata: 'Threshold-based classification',
        },
    },
    legend: {
        title: 'Map Legend',
        description: 'Shows color coding for burn severity, infrastructure damage, and timber salvage priorities. Legend updates based on active workflow phase.',
        tip: 'Click to expand and see all active map layers',
    },
};
