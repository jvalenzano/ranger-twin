/**
 * Site Analysis Quick Query Chips
 *
 * Domain-specific query templates for each feature type.
 * Templates use {placeholders} that get filled from feature properties.
 */

export interface QuickQueryChip {
    id: string;
    label: string;           // Short label for chip UI (e.g., "NFS Database")
    description: string;     // Tooltip text explaining the query
    queryTemplate: string;   // Full query with {placeholders}
    featureTypes: FeatureType[];
    category: 'safety' | 'history' | 'compliance' | 'logistics' | 'environmental';
}

export type FeatureType =
    | 'trail-damage-points'
    | 'timber-plots-points'
    | 'burn-severity-fill';

export const SITE_ANALYSIS_CHIPS: QuickQueryChip[] = [
    // === TRAIL DAMAGE CHIPS ===
    {
        id: 'trail-nfs-database',
        label: 'NFS Database',
        description: 'Cross-reference against National Forest System trail records',
        queryTemplate: 'Check NFS trail database for {trail_name}. What is the official trail classification, maintenance schedule, and last inspection date?',
        featureTypes: ['trail-damage-points'],
        category: 'history',
    },
    {
        id: 'trail-maintenance-history',
        label: 'Maintenance History',
        description: 'Review past maintenance work orders and costs',
        queryTemplate: 'What maintenance work has been performed on {trail_name} in the past 5 years? Include work order numbers and costs if available.',
        featureTypes: ['trail-damage-points'],
        category: 'history',
    },
    {
        id: 'trail-baer-history',
        label: 'BAER History',
        description: 'Check Burned Area Emergency Response records',
        queryTemplate: 'Has {trail_name} been included in previous BAER assessments? What emergency treatments were applied?',
        featureTypes: ['trail-damage-points'],
        category: 'safety',
    },
    {
        id: 'trail-hazard-trees',
        label: 'Hazard Trees',
        description: 'Assess hazard tree density and risk',
        queryTemplate: 'Based on the {severity}/5 damage severity at {trail_name}, estimate hazard tree density and recommend survey priority.',
        featureTypes: ['trail-damage-points'],
        category: 'safety',
    },
    {
        id: 'trail-access-status',
        label: 'Access Status',
        description: 'Current closure status and alternate routes',
        queryTemplate: 'What is the current closure status of {trail_name}? Are there alternate access routes to key destinations?',
        featureTypes: ['trail-damage-points'],
        category: 'logistics',
    },
    {
        id: 'trail-wilderness',
        label: 'Wilderness Boundary',
        description: 'Check wilderness designation constraints',
        queryTemplate: 'Is {trail_name} within designated Wilderness? What mechanized equipment restrictions apply to repairs?',
        featureTypes: ['trail-damage-points'],
        category: 'compliance',
    },

    // === TIMBER PLOT CHIPS ===
    {
        id: 'timber-salvage-window',
        label: 'Salvage Window',
        description: 'Time remaining for economic salvage',
        queryTemplate: 'For timber plot {plot_id} with {stand_type} at {mbf_per_acre} MBF/acre, estimate remaining salvage window before significant value loss.',
        featureTypes: ['timber-plots-points'],
        category: 'logistics',
    },
    {
        id: 'timber-esa-concerns',
        label: 'ESA Concerns',
        description: 'Endangered Species Act considerations',
        queryTemplate: 'Are there known ESA-listed species (spotted owl, salmon, etc.) in the vicinity of plot {plot_id}? What survey requirements apply?',
        featureTypes: ['timber-plots-points'],
        category: 'compliance',
    },
    {
        id: 'timber-past-sales',
        label: 'Past Sales/Litigation',
        description: 'Historical timber sale records and legal issues',
        queryTemplate: 'Have there been previous timber sales or litigation near plot {plot_id}? Any precedents that affect this salvage opportunity?',
        featureTypes: ['timber-plots-points'],
        category: 'history',
    },
    {
        id: 'timber-haul-routes',
        label: 'Log Haul Routes',
        description: 'Access roads and hauling logistics',
        queryTemplate: 'What are the viable log haul routes from plot {plot_id}? Are access roads passable? Any weight restrictions?',
        featureTypes: ['timber-plots-points'],
        category: 'logistics',
    },
    {
        id: 'timber-market',
        label: 'Market Conditions',
        description: 'Current timber market and mill capacity',
        queryTemplate: 'What are current market conditions for {stand_type}? Which mills have capacity? Estimated stumpage value?',
        featureTypes: ['timber-plots-points'],
        category: 'logistics',
    },

    // === BURN ZONE CHIPS ===
    {
        id: 'burn-prefire',
        label: 'Pre-Fire Conditions',
        description: 'Vegetation and land use before the fire',
        queryTemplate: 'What were the pre-fire conditions in {name}? Vegetation type, stand age, previous treatments?',
        featureTypes: ['burn-severity-fill'],
        category: 'history',
    },
    {
        id: 'burn-progression',
        label: 'Fire Progression',
        description: 'How the fire moved through this area',
        queryTemplate: 'How did the fire progress through {name}? What weather and terrain factors contributed to {severity} severity?',
        featureTypes: ['burn-severity-fill'],
        category: 'history',
    },
    {
        id: 'burn-erosion',
        label: 'Erosion Risk',
        description: 'Post-fire erosion and debris flow hazards',
        queryTemplate: 'What is the erosion risk for {name} with {severity} severity over {acres} acres? Are there downstream values at risk?',
        featureTypes: ['burn-severity-fill'],
        category: 'safety',
    },
    {
        id: 'burn-water',
        label: 'Drinking Water',
        description: 'Municipal watershed impacts',
        queryTemplate: 'Does {name} affect any municipal watersheds or drinking water sources? What are the water quality concerns?',
        featureTypes: ['burn-severity-fill'],
        category: 'environmental',
    },
    {
        id: 'burn-reforestation',
        label: 'Reforestation Needs',
        description: 'Natural regeneration vs planting requirements',
        queryTemplate: 'Given {severity} severity in {name}, what is the likelihood of natural regeneration? Is planting recommended?',
        featureTypes: ['burn-severity-fill'],
        category: 'environmental',
    },
];

/**
 * Get chips applicable to a feature type
 */
export function getChipsForFeatureType(featureType: FeatureType): QuickQueryChip[] {
    return SITE_ANALYSIS_CHIPS.filter(chip =>
        chip.featureTypes.includes(featureType)
    );
}

/**
 * Build query text from selected chips and feature properties
 */
export function buildQueryFromChips(
    selectedChipIds: string[],
    featureProperties: Record<string, unknown>
): string {
    const selectedChips = SITE_ANALYSIS_CHIPS.filter(c => selectedChipIds.includes(c.id));

    const queries = selectedChips.map(chip => {
        // Replace {placeholders} with actual property values
        let query = chip.queryTemplate;
        for (const [key, value] of Object.entries(featureProperties)) {
            query = query.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
        return query;
    });

    return queries.join('\n\n');
}
