/**
 * Preferences Store - User preferences with localStorage persistence
 *
 * Manages user preferences for different tooltip categories:
 * - UX Tooltips: User experience hints for end users (default: enabled)
 * - DX Tooltips: Developer experience documentation (default: disabled)
 *
 * Extensible pattern allows adding future categories like PX (Product), OX (Ops), etc.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
    // Tooltip categories
    uxTooltipsEnabled: boolean;  // User experience tooltips (general help)
    dxTooltipsEnabled: boolean;  // Developer experience tooltips (technical docs)
    timeZone: string;

    // Location
    location: {
        type: 'auto' | 'manual';
        coordinates?: [number, number];
        district: string;
        forest: string;
    };

    // Actions
    setUxTooltipsEnabled: (enabled: boolean) => void;
    toggleUxTooltips: () => void;
    setDxTooltipsEnabled: (enabled: boolean) => void;
    toggleDxTooltips: () => void;
    setTimeZone: (timeZone: string) => void;
    setLocation: (location: PreferencesState['location']) => void;

    // Legacy aliases (for backwards compatibility during migration)
    tooltipsEnabled: boolean;
    technicalTooltipsEnabled: boolean;
    setTooltipsEnabled: (enabled: boolean) => void;
    toggleTooltips: () => void;
    setTechnicalTooltipsEnabled: (enabled: boolean) => void;
    toggleTechnicalTooltips: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            // New naming convention
            uxTooltipsEnabled: true,   // Default: enabled for new users
            dxTooltipsEnabled: false,  // Default: disabled (developer feature)
            timeZone: 'UTC',           // Default: UTC
            location: {                // Default location
                type: 'manual',
                district: 'McKenzie River',
                forest: 'Willamette National Forest',
            },

            setUxTooltipsEnabled: (enabled) => set({ uxTooltipsEnabled: enabled }),
            toggleUxTooltips: () => set({ uxTooltipsEnabled: !get().uxTooltipsEnabled }),
            setDxTooltipsEnabled: (enabled) => set({ dxTooltipsEnabled: enabled }),
            toggleDxTooltips: () => set({ dxTooltipsEnabled: !get().dxTooltipsEnabled }),
            setTimeZone: (timeZone) => set({ timeZone }),
            setLocation: (location) => set({ location }),

            // Legacy aliases - map to new names
            get tooltipsEnabled() { return get().uxTooltipsEnabled; },
            get technicalTooltipsEnabled() { return get().dxTooltipsEnabled; },
            setTooltipsEnabled: (enabled) => set({ uxTooltipsEnabled: enabled }),
            toggleTooltips: () => set({ uxTooltipsEnabled: !get().uxTooltipsEnabled }),
            setTechnicalTooltipsEnabled: (enabled) => set({ dxTooltipsEnabled: enabled }),
            toggleTechnicalTooltips: () => set({ dxTooltipsEnabled: !get().dxTooltipsEnabled }),
        }),
        {
            name: 'ranger-preferences',
            // Migration: rename old keys to new keys
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as Record<string, unknown>;
                if (version === 0) {
                    // Migrate old names to new names if they exist
                    if ('tooltipsEnabled' in state && !('uxTooltipsEnabled' in state)) {
                        state.uxTooltipsEnabled = state.tooltipsEnabled;
                    }
                    if ('technicalTooltipsEnabled' in state && !('dxTooltipsEnabled' in state)) {
                        state.dxTooltipsEnabled = state.technicalTooltipsEnabled;
                    }
                }
                return state as unknown as PreferencesState;
            },
            version: 1,
        }
    )
);

// Primary hooks (new naming)
export const useUxTooltipsEnabled = () => usePreferencesStore((state) => state.uxTooltipsEnabled);
export const useDxTooltipsEnabled = () => usePreferencesStore((state) => state.dxTooltipsEnabled);
export const useTimeZone = () => usePreferencesStore((state) => state.timeZone);

// Legacy hooks (backwards compatibility)
export const useTooltipsEnabled = () => usePreferencesStore((state) => state.uxTooltipsEnabled);
export const useTechnicalTooltipsEnabled = () => usePreferencesStore((state) => state.dxTooltipsEnabled);
