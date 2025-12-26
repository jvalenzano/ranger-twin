/**
 * Tooltip Content Registry
 *
 * Central hub for all tooltip content in RANGER.
 *
 * Categories:
 * - UX Tooltips: User experience hints (cyan) - see tooltipContent.ts
 * - DX Tooltips: Developer documentation (purple) - see dx/
 *
 * Future categories could include:
 * - PX Tooltips: Product owner context
 * - OX Tooltips: Operations/DevOps info
 * - AX Tooltips: Analyst methodology notes
 */

// ============================================
// DX TOOLTIPS (Developer Experience)
// ============================================

export {
    dxTooltips,
    getDxTooltip,
    getDxTooltipsByCategory,
    getDxTooltipsByLocation,
    getAllDxTooltipIds,
    getDxTooltipsGrouped,
    getHighPriorityDxTooltips,
    getDxTooltipStats,
    domainConcepts,
    missionControlTooltips,
} from './dx';

export type {
    DxTooltipContent,
    DxCategory,
    DataPoint,
} from './dx';

// ============================================
// UX TOOLTIPS (User Experience)
// ============================================

// UX tooltips are in the parent config folder for backwards compatibility
// See: src/config/tooltipContent.ts

export type { UxTooltipContent } from './types';

// ============================================
// SHARED TYPES
// ============================================

export { defineDxTooltip, defineDxTooltips } from './types';
