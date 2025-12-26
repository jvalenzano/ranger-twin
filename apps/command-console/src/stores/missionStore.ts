/**
 * Mission Store - Zustand state management for National Command view
 *
 * Manages:
 * - View mode (NATIONAL vs TACTICAL)
 * - Fire selection and hover state
 * - Filters (phase, region, search)
 * - Watchlist
 * - National camera state
 * - View transitions
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  ViewMode,
  MissionStackView,
  MissionFilters,
  NationalCamera,
  TransitionState,
  FirePhase,
  USFSRegion,
  SortOption,
} from '@/types/mission';

import {
  DEFAULT_MISSION_FILTERS,
  DEFAULT_NATIONAL_CAMERA,
} from '@/types/mission';

interface MissionState {
  // View orchestration
  viewMode: ViewMode;
  stackView: MissionStackView;
  transitionState: TransitionState;

  // Selection
  selectedFireId: string | null;
  hoveredFireId: string | null;

  // Filters
  filters: MissionFilters;

  // Watchlist (persisted)
  watchlist: string[];

  // National camera (separate from tactical mapStore)
  nationalCamera: NationalCamera;

  // Actions - View
  setViewMode: (mode: ViewMode) => void;
  setStackView: (view: MissionStackView) => void;
  setTransitionState: (state: TransitionState) => void;

  // Actions - Selection
  selectFire: (id: string | null) => void;
  hoverFire: (id: string | null) => void;

  // Actions - Filters
  setFilters: (filters: Partial<MissionFilters>) => void;
  togglePhaseFilter: (phase: FirePhase) => void;
  toggleRegionFilter: (region: USFSRegion) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  resetFilters: () => void;

  // Actions - Watchlist
  addToWatchlist: (fireId: string) => void;
  removeFromWatchlist: (fireId: string) => void;
  toggleWatchlist: (fireId: string) => void;
  isWatched: (fireId: string) => boolean;
  clearWatchlist: () => void;

  // Actions - Camera
  setNationalCamera: (camera: Partial<NationalCamera>) => void;
  resetNationalCamera: () => void;

  // Actions - Transitions
  enterTacticalView: (fireId: string) => void;
  returnToNational: () => void;
}

export const useMissionStore = create<MissionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        viewMode: 'NATIONAL',
        stackView: 'national',
        transitionState: 'idle',
        selectedFireId: null,
        hoveredFireId: null,
        filters: { ...DEFAULT_MISSION_FILTERS },
        watchlist: [],
        nationalCamera: { ...DEFAULT_NATIONAL_CAMERA },

        // View actions
        setViewMode: (mode) => set({ viewMode: mode }),

        setStackView: (view) => set({ stackView: view }),

        setTransitionState: (state) => set({ transitionState: state }),

        // Selection actions
        selectFire: (id) => set({ selectedFireId: id }),

        hoverFire: (id) => set({ hoveredFireId: id }),

        // Filter actions
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        togglePhaseFilter: (phase) =>
          set((state) => {
            const current = state.filters.phases;
            const hasPhase = current.includes(phase);
            const newPhases = hasPhase
              ? current.filter((p) => p !== phase)
              : [...current, phase];
            // Don't allow empty phases - at least one must be selected
            if (newPhases.length === 0) return state;
            return {
              filters: { ...state.filters, phases: newPhases },
            };
          }),

        toggleRegionFilter: (region) =>
          set((state) => {
            const current = state.filters.regions;
            const hasRegion = current.includes(region);
            const newRegions = hasRegion
              ? current.filter((r) => r !== region)
              : [...current, region];
            // Don't allow empty regions - at least one must be selected
            if (newRegions.length === 0) return state;
            return {
              filters: { ...state.filters, regions: newRegions },
            };
          }),

        setSearchQuery: (query) =>
          set((state) => ({
            filters: { ...state.filters, searchQuery: query },
          })),

        setSortBy: (sortBy) =>
          set((state) => ({
            filters: { ...state.filters, sortBy },
          })),

        resetFilters: () =>
          set({
            filters: { ...DEFAULT_MISSION_FILTERS },
          }),

        // Watchlist actions
        addToWatchlist: (fireId) =>
          set((state) => {
            if (state.watchlist.includes(fireId)) return state;
            return { watchlist: [...state.watchlist, fireId] };
          }),

        removeFromWatchlist: (fireId) =>
          set((state) => ({
            watchlist: state.watchlist.filter((id) => id !== fireId),
          })),

        toggleWatchlist: (fireId) =>
          set((state) => {
            const isWatched = state.watchlist.includes(fireId);
            return {
              watchlist: isWatched
                ? state.watchlist.filter((id) => id !== fireId)
                : [...state.watchlist, fireId],
            };
          }),

        isWatched: (fireId) => get().watchlist.includes(fireId),

        clearWatchlist: () => set({ watchlist: [] }),

        // Camera actions
        setNationalCamera: (camera) =>
          set((state) => ({
            nationalCamera: { ...state.nationalCamera, ...camera },
          })),

        resetNationalCamera: () =>
          set({ nationalCamera: { ...DEFAULT_NATIONAL_CAMERA } }),

        // Transition actions
        enterTacticalView: (fireId) => {
          set({
            selectedFireId: fireId,
            transitionState: 'swooping_in',
          });

          // The actual view mode change happens after animation
          // This is triggered by the map component when flyTo completes
          console.log(`[MissionStore] Preparing to enter tactical view for: ${fireId}`);
        },

        returnToNational: () => {
          set({
            transitionState: 'swooping_out',
          });

          // The actual view mode change happens after animation
          console.log('[MissionStore] Preparing to return to national view');
        },
      }),
      {
        name: 'ranger-mission',
        version: 2, // Increment for 4-phase migration
        // Only persist watchlist and filters
        partialize: (state) => ({
          watchlist: state.watchlist,
          filters: state.filters,
        }),
        // Migrate from v1 (3-phase) to v2 (4-phase)
        migrate: (persisted, version) => {
          const state = persisted as {
            watchlist?: string[];
            filters?: MissionFilters & { phases?: string[] };
          };

          if (version === 0 || version === 1) {
            // Migrate old phase values to new 4-phase model
            if (state.filters?.phases) {
              const oldPhases = state.filters.phases as string[];
              const newPhases: FirePhase[] = [];

              for (const phase of oldPhases) {
                if (phase === 'active') {
                  newPhases.push('active');
                } else if (phase === 'in_baer') {
                  // Split old 'in_baer' into both BAER phases
                  newPhases.push('baer_assessment');
                  newPhases.push('baer_implementation');
                } else if (phase === 'in_recovery') {
                  // Rename to 'in_restoration'
                  newPhases.push('in_restoration');
                }
              }

              // Deduplicate and ensure valid phases
              state.filters.phases = [...new Set(newPhases)] as FirePhase[];
            }
          }

          return state;
        },
        // Merge persisted state on hydration
        merge: (persisted, current) => {
          const persistedState = persisted as {
            watchlist?: string[];
            filters?: MissionFilters;
          };

          // Merge persisted filters with defaults to handle new fields
          const mergedFilters = persistedState.filters
            ? { ...DEFAULT_MISSION_FILTERS, ...persistedState.filters }
            : DEFAULT_MISSION_FILTERS;

          return {
            ...current,
            watchlist: persistedState.watchlist || [],
            filters: mergedFilters,
          };
        },
      }
    ),
    { name: 'mission-store' }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useViewMode = () => useMissionStore((state) => state.viewMode);
export const useStackView = () => useMissionStore((state) => state.stackView);
export const useTransitionState = () =>
  useMissionStore((state) => state.transitionState);

export const useSelectedFireId = () =>
  useMissionStore((state) => state.selectedFireId);
export const useHoveredFireId = () =>
  useMissionStore((state) => state.hoveredFireId);

export const useMissionFilters = () =>
  useMissionStore((state) => state.filters);
export const usePhaseFilter = () =>
  useMissionStore((state) => state.filters.phases);
export const useRegionFilter = () =>
  useMissionStore((state) => state.filters.regions);
export const useSearchQuery = () =>
  useMissionStore((state) => state.filters.searchQuery);

export const useWatchlist = () =>
  useMissionStore((state) => state.watchlist);
export const useWatchlistCount = () =>
  useMissionStore((state) => state.watchlist.length);

export const useSortBy = () =>
  useMissionStore((state) => state.filters.sortBy);

export const useNationalCamera = () =>
  useMissionStore((state) => state.nationalCamera);

/**
 * Check if a specific fire is in the watchlist
 */
export const useIsFireWatched = (fireId: string) =>
  useMissionStore((state) => state.watchlist.includes(fireId));

/**
 * Check if we're in national view
 */
export const useIsNationalView = () =>
  useMissionStore((state) => state.viewMode === 'NATIONAL');

/**
 * Check if we're in tactical view
 */
export const useIsTacticalView = () =>
  useMissionStore((state) => state.viewMode === 'TACTICAL');

/**
 * Check if transition is in progress
 */
export const useIsTransitioning = () =>
  useMissionStore((state) => state.transitionState !== 'idle');
