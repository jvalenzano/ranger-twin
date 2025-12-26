# Site Analysis Feature - Implementation Addendum

**Collaborators:** Anti-Gravity (primary), Claude (addendum)
**Status:** Draft for integration into main plan

This addendum fills in gaps identified during plan review. Anti-Gravity should integrate these into the main implementation plan.

---

## 1. Chip Configuration Structure

### New File: `src/config/siteAnalysisChips.ts`

```typescript
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
  featureProperties: Record<string, any>
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
```

---

## 2. Store Updates (Expanded)

### Updated `visualAuditStore.ts`

```typescript
import { create } from 'zustand';

export type VisualAuditStatus = 'idle' | 'selecting' | 'refining' | 'capturing' | 'analyzing' | 'complete' | 'error';

// NEW: Entry mode determines UI rendering
export type EntryMode = 'area' | 'feature';

// NEW: Feature metadata from popup
export interface FeatureMetadata {
  featureId: string;
  featureType: 'trail-damage-points' | 'timber-plots-points' | 'burn-severity-fill';
  featureName: string;
  properties: Record<string, any>;
  coordinates: [number, number]; // [lng, lat]
}

interface VisualAuditState {
  status: VisualAuditStatus;
  entryMode: EntryMode | null;           // NEW
  capturedImage: string | null;
  userQuery: string;

  // Area-based metadata (existing)
  metadata: {
    bbox?: number[][];
    center?: number[];
    features?: any[];
  } | null;

  // Feature-based metadata (NEW)
  featureMetadata: FeatureMetadata | null;

  // Chip selection (NEW)
  selectedChipIds: string[];

  result: string | null;
  error: string | null;

  // Actions
  setStatus: (status: VisualAuditStatus) => void;
  setCapturedImage: (image: string | null) => void;
  setUserQuery: (query: string) => void;
  setMetadata: (metadata: any) => void;
  setResult: (result: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Area selection entry (existing)
  startSelection: () => void;

  // Feature popup entry (NEW)
  startFeatureAnalysis: (featureMetadata: FeatureMetadata) => void;

  // Chip management (NEW)
  toggleChip: (chipId: string) => void;
  setSelectedChips: (chipIds: string[]) => void;
  clearChips: () => void;

  cancel: () => void;
}

export const useVisualAuditStore = create<VisualAuditState>((set, get) => ({
  status: 'idle',
  entryMode: null,
  capturedImage: null,
  userQuery: '',
  metadata: null,
  featureMetadata: null,
  selectedChipIds: [],
  result: null,
  error: null,

  setStatus: (status) => set({ status }),
  setCapturedImage: (capturedImage) => set({ capturedImage }),
  setUserQuery: (userQuery) => set({ userQuery }),
  setMetadata: (metadata) => set({ metadata }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),

  reset: () => set({
    status: 'idle',
    entryMode: null,
    capturedImage: null,
    userQuery: '',
    metadata: null,
    featureMetadata: null,
    selectedChipIds: [],
    result: null,
    error: null,
  }),

  // Existing: Area selection from toolbar
  startSelection: () => set({
    status: 'selecting',
    entryMode: 'area',
    result: null,
    error: null,
    userQuery: '',
    metadata: null,
    featureMetadata: null,
    selectedChipIds: [],
  }),

  // NEW: Feature analysis from popup
  startFeatureAnalysis: (featureMetadata) => set({
    status: 'refining',
    entryMode: 'feature',
    featureMetadata,
    result: null,
    error: null,
    userQuery: '',
    selectedChipIds: [],
  }),

  // NEW: Chip management
  toggleChip: (chipId) => set((state) => {
    const exists = state.selectedChipIds.includes(chipId);
    return {
      selectedChipIds: exists
        ? state.selectedChipIds.filter(id => id !== chipId)
        : [...state.selectedChipIds, chipId],
    };
  }),

  setSelectedChips: (chipIds) => set({ selectedChipIds: chipIds }),

  clearChips: () => set({ selectedChipIds: [] }),

  cancel: () => set({
    status: 'idle',
    entryMode: null,
    capturedImage: null,
    userQuery: '',
    metadata: null,
    featureMetadata: null,
    selectedChipIds: [],
  }),
}));
```

---

## 3. AI Service Integration

### Update to `VisualAuditOverlay.tsx` - Analysis Handler

```typescript
import { useFireContextStore } from '@/stores/fireContextStore';
import aiBriefingService from '@/services/aiBriefingService';
import { buildQueryFromChips } from '@/config/siteAnalysisChips';

// Inside the component:
const activeFire = useFireContextStore((state) => state.activeFire);

const handleRunAnalysis = async () => {
  const { entryMode, userQuery, selectedChipIds, featureMetadata, metadata } = useVisualAuditStore.getState();

  setStatus('analyzing');

  try {
    let queryText = userQuery;

    // For feature-based entry, build query from chips + user additions
    if (entryMode === 'feature' && featureMetadata) {
      const chipQuery = buildQueryFromChips(selectedChipIds, featureMetadata.properties);
      queryText = chipQuery + (userQuery ? `\n\nAdditional question: ${userQuery}` : '');
    }

    // Include context about the analysis target
    const contextPrefix = entryMode === 'feature' && featureMetadata
      ? `[Site Analysis: ${featureMetadata.featureName} - ${featureMetadata.featureType}]\n\n`
      : `[Area Analysis: ${metadata?.features?.length || 0} features detected]\n\n`;

    const fullQuery = contextPrefix + queryText;

    // Call AI service with fire context
    const response = await aiBriefingService.query(
      fullQuery,
      'site-analysis-session',
      activeFire
    );

    if (response.success && response.response) {
      setResult(response.response.summary);
      setStatus('complete');
    } else {
      setError(response.error || 'Analysis failed');
      setStatus('error');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    setStatus('error');
  }
};
```

---

## 4. Popup Implementation with setDOMContent

### Update to `CedarCreekMap.tsx` - Popup Handler

```typescript
import { useVisualAuditStore } from '@/stores/visualAuditStore';
import type { FeatureMetadata } from '@/stores/visualAuditStore';

// Inside the click handler:
const handleFeatureClick = (e: maplibregl.MapMouseEvent) => {
  if (!map.current) return;

  const layers = ['trail-damage-points', 'timber-plots-points', 'burn-severity-fill'];
  const features = map.current.queryRenderedFeatures(e.point, { layers });

  if (!features.length) return;

  const feature = features[0];
  if (!feature || !feature.properties) return;

  const props = feature.properties;
  const layerId = feature.layer.id as FeatureMetadata['featureType'];

  // Close existing popup
  if (activePopup.current) {
    activePopup.current.remove();
  }

  // Create popup content as DOM element
  const popupContent = document.createElement('div');
  popupContent.className = 'p-2';

  // Build content based on feature type
  let headerHtml = '';
  let detailsHtml = '';
  let featureName = '';

  if (layerId === 'trail-damage-points') {
    featureName = props.trail_name;
    headerHtml = `
      <div class="font-bold text-sm">${props.trail_name}</div>
      <div class="text-xs text-amber-400">${props.type?.replace('_', ' ')}</div>
    `;
    detailsHtml = `
      <div class="text-xs mt-1">${props.description}</div>
      <div class="text-xs mt-1 text-red-400">Severity: ${props.severity}/5</div>
    `;
  } else if (layerId === 'timber-plots-points') {
    featureName = `Plot ${props.plot_id}`;
    const priorityColor = getPriorityColor(props.priority);
    headerHtml = `
      <div class="font-bold text-sm">Plot ${props.plot_id}</div>
      <div class="text-xs text-cyan-400">${props.stand_type}</div>
    `;
    detailsHtml = `
      <div class="text-xs mt-1">MBF/acre: ${props.mbf_per_acre}</div>
      <div class="text-xs">Value/acre: $${props.salvage_value_per_acre?.toLocaleString()}</div>
      <div class="text-xs mt-1 font-medium" style="color: ${priorityColor}">Priority: ${props.priority}</div>
    `;
  } else if (layerId === 'burn-severity-fill') {
    featureName = props.name;
    const severityColor = getSeverityColor(props.severity);
    headerHtml = `
      <div class="font-bold text-sm">${props.name}</div>
      <div class="text-xs" style="color: ${severityColor}">${props.severity} Severity</div>
    `;
    detailsHtml = `
      <div class="text-xs mt-1">${props.acres?.toLocaleString()} acres</div>
      <div class="text-xs">dNBR: ${props.dnbr_mean}</div>
    `;
  }

  // Assemble popup HTML
  popupContent.innerHTML = `
    ${headerHtml}
    ${detailsHtml}
    <button class="site-analysis-btn mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      Analyze Site
    </button>
    <div class="text-[9px] text-center text-gray-400 mt-1">Cross-reference with USFS records</div>
  `;

  // Attach click handler to button
  const analyzeBtn = popupContent.querySelector('.site-analysis-btn');
  analyzeBtn?.addEventListener('click', (evt) => {
    evt.stopPropagation();

    // Get coordinates from feature geometry
    const coords = feature.geometry.type === 'Point'
      ? feature.geometry.coordinates as [number, number]
      : e.lngLat.toArray() as [number, number];

    // Prepare feature metadata
    const featureMetadata: FeatureMetadata = {
      featureId: props.damage_id || props.plot_id || props.zone_id || String(feature.id),
      featureType: layerId,
      featureName,
      properties: { ...props },
      coordinates: coords,
    };

    // Trigger Site Analysis flow
    useVisualAuditStore.getState().startFeatureAnalysis(featureMetadata);

    // Close popup
    if (activePopup.current) {
      activePopup.current.remove();
      activePopup.current = null;
    }
  });

  // Create and show popup using setDOMContent
  const popup = new maplibregl.Popup({ className: 'ranger-popup' })
    .setLngLat(e.lngLat)
    .setDOMContent(popupContent)
    .addTo(map.current);

  activePopup.current = popup;
  popup.on('close', () => {
    if (activePopup.current === popup) {
      activePopup.current = null;
    }
  });
};
```

---

## 5. Overlay Conditional Rendering

### Updated `VisualAuditOverlay.tsx` Structure

```tsx
{/* Investigation Card (Refining Mode) */}
{status === 'refining' && (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <div className="bg-[#0f111a] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

      {/* Header - Dynamic based on entry mode */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {entryMode === 'feature' && featureMetadata ? (
            <>
              <FeatureTypeIcon type={featureMetadata.featureType} />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  Site Analysis
                </h3>
                <p className="text-[10px] text-text-muted">
                  {featureMetadata.featureName} • {activeFire.name}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Maximize className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  Area Analysis
                </h3>
                <p className="text-[10px] text-text-muted">
                  {metadata?.features?.length || 0} features • {activeFire.name}
                </p>
              </div>
            </>
          )}
        </div>
        <button onClick={cancel}>
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Feature context OR area thumbnail */}
        {entryMode === 'feature' && featureMetadata ? (
          <FeatureContextCard metadata={featureMetadata} />
        ) : (
          <AreaThumbnailCard metadata={metadata} capturedImage={capturedImage} />
        )}

        {/* Quick Query Chips (feature mode only) */}
        {entryMode === 'feature' && featureMetadata && (
          <QuickQueryChips
            featureType={featureMetadata.featureType}
            selectedIds={selectedChipIds}
            onToggle={toggleChip}
          />
        )}

        {/* User Query Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            {entryMode === 'feature' ? 'Additional Questions' : 'Research Focus'}
          </label>
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder={entryMode === 'feature'
              ? 'Add any specific questions about this site...'
              : 'Ask a specific question about this area...'}
            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end gap-3">
        <button onClick={cancel} className="px-4 py-2 text-[10px] text-text-muted">
          Cancel
        </button>
        <button
          onClick={handleRunAnalysis}
          disabled={entryMode === 'feature' && selectedChipIds.length === 0 && !userQuery}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white rounded-lg text-xs font-black uppercase"
        >
          Run Analysis
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 6. QuickQueryChips Component

### New File: `src/components/map/QuickQueryChips.tsx`

```tsx
import React from 'react';
import { getChipsForFeatureType, type FeatureType, type QuickQueryChip } from '@/config/siteAnalysisChips';

interface QuickQueryChipsProps {
  featureType: FeatureType;
  selectedIds: string[];
  onToggle: (chipId: string) => void;
}

const CATEGORY_COLORS = {
  safety: 'border-red-500/30 bg-red-500/10 text-red-400',
  history: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  compliance: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  logistics: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  environmental: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

const CATEGORY_SELECTED_COLORS = {
  safety: 'border-red-500 bg-red-500/30 text-red-300',
  history: 'border-blue-500 bg-blue-500/30 text-blue-300',
  compliance: 'border-purple-500 bg-purple-500/30 text-purple-300',
  logistics: 'border-amber-500 bg-amber-500/30 text-amber-300',
  environmental: 'border-emerald-500 bg-emerald-500/30 text-emerald-300',
};

export const QuickQueryChips: React.FC<QuickQueryChipsProps> = ({
  featureType,
  selectedIds,
  onToggle,
}) => {
  const chips = getChipsForFeatureType(featureType);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
          Quick Queries
        </label>
        <span className="text-[9px] text-text-muted">
          {selectedIds.length} selected
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {chips.map((chip) => {
          const isSelected = selectedIds.includes(chip.id);
          const colorClass = isSelected
            ? CATEGORY_SELECTED_COLORS[chip.category]
            : CATEGORY_COLORS[chip.category];

          return (
            <button
              key={chip.id}
              onClick={() => onToggle(chip.id)}
              title={chip.description}
              className={`
                px-3 py-2 rounded-lg border text-[11px] font-medium
                transition-all duration-150 text-left
                ${colorClass}
                ${isSelected ? 'ring-1 ring-white/20' : 'hover:border-white/30'}
              `}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 7. CSS Additions

### Add to `index.css`

```css
/* Site Analysis Button in Popups */
.ranger-popup .site-analysis-btn {
  min-height: 44px; /* Glove-friendly touch target */
}

.ranger-popup .site-analysis-btn:active {
  transform: scale(0.98);
}

/* Chip selection feedback */
.quick-query-chip-selected {
  animation: chip-select 0.15s ease-out;
}

@keyframes chip-select {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

---

## File Summary (Complete)

| File | Action | Owner |
|------|--------|-------|
| `siteAnalysisChips.ts` | NEW | Addendum |
| `SiteAnalysisButton.tsx` | SKIP | Integrated into popup directly |
| `QuickQueryChips.tsx` | NEW | Addendum |
| `visualAuditStore.ts` | MODIFY | Addendum (expanded) |
| `VisualAuditOverlay.tsx` | MODIFY | Both (Anti-Gravity leads) |
| `CedarCreekMap.tsx` | MODIFY | Addendum (popup handler) |
| `tooltipContent.ts` | MODIFY | Anti-Gravity |
| `index.css` | MODIFY | Addendum |

---

## Integration Notes for Anti-Gravity

1. **Merge Store Changes**: The expanded `visualAuditStore.ts` includes your proposed changes plus `entryMode` and chip management.

2. **Chip Templates**: The `siteAnalysisChips.ts` file provides the structure. Feel free to adjust the actual query templates based on USFS domain expertise.

3. **Overlay Refactor**: I've sketched the conditional rendering logic. You'll need to integrate with your existing modal styling.

4. **Fire Context**: All AI calls now pass `activeFire` from `fireContextStore` (implemented today).

5. **Testing**: The verification plan in your original doc is solid. Add a test for chip selection → query building.

---

*Addendum prepared by Claude. Ready for integration.*
