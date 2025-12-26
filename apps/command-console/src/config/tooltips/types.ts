/**
 * Tooltip Type Definitions
 *
 * Shared types for UX and DX tooltip systems.
 * UX tooltips = User help hints (cyan)
 * DX tooltips = Developer documentation (purple)
 */

/**
 * UX Tooltip Content - User-facing help hints
 * Used by: src/components/ui/Tooltip.tsx
 */
export interface UxTooltipContent {
    title: string;
    description: string;
    tip?: string;
    shortcut?: string;
    metadata?: string;
    accentColor?: string;
}

/**
 * DX Tooltip Content - Developer documentation
 * Used by: src/components/common/TechnicalTooltip.tsx
 */
export interface DxTooltipContent {
    /** Unique identifier for this tooltip */
    id: string;

    /** Title of the technical explanation (3-6 words) */
    title: string;

    /** Brief one-line description of WHAT it does */
    summary: string;

    /** Detailed technical flow with ASCII diagrams */
    details: string;

    /** Source file reference (relative to src/) */
    sourceFile?: string;

    /** Key data points to display */
    dataPoints?: DataPoint[];

    /** Category for organization */
    category: DxCategory;

    /** Priority for implementation (high = confusing for new devs) */
    priority: 'high' | 'medium' | 'low';

    /** Component or area where this tooltip should appear */
    location: string;

    /** Related tooltip IDs for cross-referencing */
    relatedIds?: string[];
}

export interface DataPoint {
    label: string;
    value: string;
}

/**
 * DX Tooltip Categories
 */
export type DxCategory =
    | 'domain'      // Fire/forestry domain concepts (BAER, severity, phases)
    | 'data'        // Data sources and formats (FIRMS, NIFC, MTBS)
    | 'ui'          // UI element explanations (triage score, filters)
    | 'integration' // External system integrations (APIs, exports)
    | 'navigation'  // Navigation and workflow (enter simulation, views)
    | 'technical';  // Technical implementation details (stores, services)

/**
 * DX Tooltip Registry - All tooltips keyed by ID
 */
export type DxTooltipRegistry = Record<string, DxTooltipContent>;

/**
 * Helper to create a DX tooltip with type checking
 */
export function defineDxTooltip(content: DxTooltipContent): DxTooltipContent {
    return content;
}

/**
 * Helper to create multiple DX tooltips with type checking
 */
export function defineDxTooltips<T extends DxTooltipRegistry>(tooltips: T): T {
    return tooltips;
}
