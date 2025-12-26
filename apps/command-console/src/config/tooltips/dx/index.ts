/**
 * DX Tooltips Registry
 *
 * Central export for all Developer Experience (DX) tooltips.
 * Import from here to access any DX tooltip content.
 *
 * Usage:
 *   import { dxTooltips, getDxTooltip } from '@/config/tooltips/dx';
 *
 *   // Get specific tooltip
 *   const tooltip = getDxTooltip('ui-triage-score');
 *
 *   // Use in component
 *   <TechnicalTooltip {...tooltip}>...</TechnicalTooltip>
 */

import type { DxTooltipContent, DxTooltipRegistry, DxCategory } from '../types';
import { domainConcepts } from './concepts';
import { missionControlTooltips } from './missionControl';

// ============================================
// COMBINED REGISTRY
// ============================================

/**
 * All DX tooltips in a single registry
 */
export const dxTooltips: DxTooltipRegistry = {
    ...domainConcepts,
    ...missionControlTooltips,
};

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Get a specific tooltip by ID
 * @throws if tooltip not found (helps catch typos)
 */
export function getDxTooltip(id: string): DxTooltipContent {
    const tooltip = dxTooltips[id];
    if (!tooltip) {
        console.warn(`[DX Tooltips] Unknown tooltip ID: "${id}"`);
        // Return a fallback instead of throwing to prevent UI crashes
        return {
            id,
            title: 'Unknown Tooltip',
            summary: `Tooltip "${id}" not found in registry.`,
            details: 'This tooltip ID may have been removed or renamed.',
            category: 'technical',
            priority: 'low',
            location: 'Unknown',
        };
    }
    return tooltip;
}

/**
 * Get all tooltips for a specific category
 */
export function getDxTooltipsByCategory(category: DxCategory): DxTooltipContent[] {
    return Object.values(dxTooltips).filter((t) => t.category === category);
}

/**
 * Get all tooltips for a specific location/component
 */
export function getDxTooltipsByLocation(locationPattern: string): DxTooltipContent[] {
    const pattern = locationPattern.toLowerCase();
    return Object.values(dxTooltips).filter((t) =>
        t.location.toLowerCase().includes(pattern)
    );
}

/**
 * Get all tooltip IDs (useful for documentation generation)
 */
export function getAllDxTooltipIds(): string[] {
    return Object.keys(dxTooltips);
}

/**
 * Get tooltips grouped by category (for documentation)
 */
export function getDxTooltipsGrouped(): Record<DxCategory, DxTooltipContent[]> {
    const grouped: Record<DxCategory, DxTooltipContent[]> = {
        domain: [],
        data: [],
        ui: [],
        integration: [],
        navigation: [],
        technical: [],
    };

    for (const tooltip of Object.values(dxTooltips)) {
        grouped[tooltip.category].push(tooltip);
    }

    return grouped;
}

/**
 * Get high-priority tooltips (most important for new devs)
 */
export function getHighPriorityDxTooltips(): DxTooltipContent[] {
    return Object.values(dxTooltips).filter((t) => t.priority === 'high');
}

// ============================================
// STATS (for documentation)
// ============================================

/**
 * Get tooltip registry statistics
 */
export function getDxTooltipStats() {
    const all = Object.values(dxTooltips);
    return {
        total: all.length,
        byCategory: {
            domain: all.filter((t) => t.category === 'domain').length,
            data: all.filter((t) => t.category === 'data').length,
            ui: all.filter((t) => t.category === 'ui').length,
            integration: all.filter((t) => t.category === 'integration').length,
            navigation: all.filter((t) => t.category === 'navigation').length,
            technical: all.filter((t) => t.category === 'technical').length,
        },
        byPriority: {
            high: all.filter((t) => t.priority === 'high').length,
            medium: all.filter((t) => t.priority === 'medium').length,
            low: all.filter((t) => t.priority === 'low').length,
        },
    };
}

// ============================================
// RE-EXPORTS
// ============================================

export { domainConcepts } from './concepts';
export { missionControlTooltips } from './missionControl';
export type { DxTooltipContent, DxCategory, DataPoint } from '../types';
