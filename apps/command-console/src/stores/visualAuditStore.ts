import { create } from 'zustand';

export type VisualAuditStatus = 'idle' | 'selecting' | 'refining' | 'capturing' | 'analyzing' | 'complete' | 'error';

// Entry mode determines UI rendering
export type EntryMode = 'area' | 'feature';

// Feature metadata from popup
export interface FeatureMetadata {
    featureId: string;
    featureType: 'trail-damage-points' | 'timber-plots-points' | 'burn-severity-fill';
    featureName: string;
    properties: Record<string, unknown>;
    coordinates: [number, number]; // [lng, lat]
}

interface VisualAuditState {
    status: VisualAuditStatus;
    entryMode: EntryMode | null;
    capturedImage: string | null;
    userQuery: string;

    // Area-based metadata (existing)
    metadata: {
        bbox?: number[][];
        center?: number[];
        features?: { id: string | number; layer: string; properties: Record<string, unknown> }[];
    } | null;

    // Feature-based metadata (from popup)
    featureMetadata: FeatureMetadata | null;

    // Chip selection
    selectedChipIds: string[];

    result: string | null;
    error: string | null;

    // Actions
    setStatus: (status: VisualAuditStatus) => void;
    setCapturedImage: (image: string | null) => void;
    setUserQuery: (query: string) => void;
    setMetadata: (metadata: VisualAuditState['metadata']) => void;
    setResult: (result: string | null) => void;
    setError: (error: string | null) => void;
    reset: () => void;

    // Area selection entry (existing)
    startSelection: () => void;

    // Feature popup entry
    startFeatureAnalysis: (featureMetadata: FeatureMetadata) => void;

    // Chip management
    toggleChip: (chipId: string) => void;
    setSelectedChips: (chipIds: string[]) => void;
    clearChips: () => void;

    cancel: () => void;
}

export const useVisualAuditStore = create<VisualAuditState>((set) => ({
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

    // Feature analysis from popup
    startFeatureAnalysis: (featureMetadata) => set({
        status: 'refining',
        entryMode: 'feature',
        featureMetadata,
        result: null,
        error: null,
        userQuery: '',
        selectedChipIds: [],
        metadata: null,
        capturedImage: null,
    }),

    // Chip management
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
