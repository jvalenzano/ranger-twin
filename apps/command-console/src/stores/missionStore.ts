/**
 * Mission Store - Zustand state management for National Mission Control
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

  // Timeline
  seasonPosition: number; // 0-100, maps to fire season

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
  resetFilters: () => void;

  // Actions - Watchlist
  addToWatchlist: (fireId: string) => void;
  removeFromWatchlist: (fireId: string) => void;
  toggleWatchlist: (fireId: string) => void;
  isWatched: (fireId: string) => boolean;
  clearWatchlist: () => void;

  // Actions - Timeline
  setSeasonPosition: (position: number) => void;

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
        seasonPosition: 100, // Default to "today" (end of timeline)
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

        // Timeline actions
        setSeasonPosition: (position) =>
          set({ seasonPosition: Math.max(0, Math.min(100, position)) }),

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
        // Only persist watchlist and filters
        partialize: (state) => ({
          watchlist: state.watchlist,
          filters: state.filters,
        }),
        // Merge persisted state on hydration
        merge: (persisted, current) => {
          const persistedState = persisted as {
            watchlist?: string[];
            filters?: MissionFilters;
          };

          return {
            ...current,
            watchlist: persistedState.watchlist || [],
            filters: persistedState.filters || DEFAULT_MISSION_FILTERS,
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

export const useSeasonPosition = () =>
  useMissionStore((state) => state.seasonPosition);

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
