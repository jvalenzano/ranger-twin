/**
 * Preferences Store - User preferences with localStorage persistence
 *
 * Manages user preferences like tooltip visibility.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
    tooltipsEnabled: boolean;

    // Actions
    setTooltipsEnabled: (enabled: boolean) => void;
    toggleTooltips: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            tooltipsEnabled: true, // Default to enabled for new users

            setTooltipsEnabled: (enabled) => set({ tooltipsEnabled: enabled }),
            toggleTooltips: () => set({ tooltipsEnabled: !get().tooltipsEnabled }),
        }),
        { name: 'ranger-preferences' }
    )
);

// Convenience hook for tooltip state
export const useTooltipsEnabled = () => usePreferencesStore((state) => state.tooltipsEnabled);
