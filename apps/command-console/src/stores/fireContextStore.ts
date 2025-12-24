/**
 * Fire Context Store - Zustand state management for fire selection and onboarding
 *
 * Manages:
 * - Active fire context (selected fire)
 * - Available fires list (demo fires + user-created)
 * - Onboarding wizard state
 * - Fire switching and map coordination
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  FireContext,
  OnboardingState,
  AgentType,
  AgentProgressState,
} from '@/types/fire';

import {
  DEMO_FIRES,
  DEFAULT_FIRE,
  INITIAL_AGENT_PROGRESS,
  ONBOARDING_STEPS,
} from '@/types/fire';

interface FireContextState {
  // Active fire context
  activeFireId: string;
  activeFire: FireContext;

  // Available fires (demo + user-created)
  availableFires: FireContext[];

  // Onboarding wizard state
  onboarding: OnboardingState;

  // Actions - Fire selection
  selectFire: (fireId: string) => void;
  getFireById: (fireId: string) => FireContext | undefined;

  // Actions - Onboarding wizard
  startOnboarding: () => void;
  closeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
  updateFireInput: (input: Partial<FireContext>) => void;
  updateAgentProgress: (agent: AgentType, progress: Partial<AgentProgressState>) => void;
  setOnboardingError: (error: string | undefined) => void;
  completeOnboarding: (newFire: FireContext) => void;
  resetOnboarding: () => void;

  // Actions - Fire management
  addFire: (fire: FireContext) => void;
  removeFire: (fireId: string) => void;
}

// Initial onboarding state
const initialOnboarding: OnboardingState = {
  isOpen: false,
  currentStep: 0,
  totalSteps: ONBOARDING_STEPS.length,
  fireInput: {},
  agentProgress: { ...INITIAL_AGENT_PROGRESS },
  isComplete: false,
};

export const useFireContextStore = create<FireContextState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeFireId: DEFAULT_FIRE.fire_id,
        activeFire: DEFAULT_FIRE,
        availableFires: [...DEMO_FIRES],
        onboarding: { ...initialOnboarding },

        // Select a fire by ID
        selectFire: (fireId) => {
          const fire = get().availableFires.find((f) => f.fire_id === fireId);
          if (fire) {
            set({
              activeFireId: fireId,
              activeFire: fire,
            });
          }
        },

        // Get fire by ID
        getFireById: (fireId) => {
          return get().availableFires.find((f) => f.fire_id === fireId);
        },

        // Start the onboarding wizard
        startOnboarding: () => {
          set({
            onboarding: {
              ...initialOnboarding,
              isOpen: true,
              agentProgress: { ...INITIAL_AGENT_PROGRESS },
            },
          });
        },

        // Close the onboarding wizard
        closeOnboarding: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              isOpen: false,
            },
          }));
        },

        // Set current onboarding step
        setOnboardingStep: (step) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              currentStep: Math.max(0, Math.min(step, state.onboarding.totalSteps - 1)),
            },
          }));
        },

        // Move to next onboarding step
        nextOnboardingStep: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              currentStep: Math.min(
                state.onboarding.currentStep + 1,
                state.onboarding.totalSteps - 1
              ),
            },
          }));
        },

        // Move to previous onboarding step
        prevOnboardingStep: () => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              currentStep: Math.max(state.onboarding.currentStep - 1, 0),
            },
          }));
        },

        // Update fire input during onboarding
        updateFireInput: (input) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              fireInput: {
                ...state.onboarding.fireInput,
                ...input,
              },
            },
          }));
        },

        // Update agent progress during onboarding
        updateAgentProgress: (agent, progress) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              agentProgress: {
                ...state.onboarding.agentProgress,
                [agent]: {
                  ...state.onboarding.agentProgress[agent],
                  ...progress,
                },
              },
            },
          }));
        },

        // Set onboarding error
        setOnboardingError: (error) => {
          set((state) => ({
            onboarding: {
              ...state.onboarding,
              error,
            },
          }));
        },

        // Complete onboarding and add the new fire
        completeOnboarding: (newFire) => {
          set((state) => ({
            availableFires: [...state.availableFires, newFire],
            activeFireId: newFire.fire_id,
            activeFire: newFire,
            onboarding: {
              ...state.onboarding,
              isComplete: true,
              isOpen: false,
            },
          }));
        },

        // Reset onboarding state
        resetOnboarding: () => {
          set({
            onboarding: { ...initialOnboarding },
          });
        },

        // Add a new fire to the list
        addFire: (fire) => {
          set((state) => {
            // Check if fire already exists
            if (state.availableFires.some((f) => f.fire_id === fire.fire_id)) {
              return state;
            }
            return {
              availableFires: [...state.availableFires, fire],
            };
          });
        },

        // Remove a fire from the list (not allowed for demo fires)
        removeFire: (fireId) => {
          set((state) => {
            const fire = state.availableFires.find((f) => f.fire_id === fireId);
            // Don't remove demo fires
            if (fire?.isDemo) {
              return state;
            }
            const newFires = state.availableFires.filter((f) => f.fire_id !== fireId);
            // If removing active fire, switch to default
            if (state.activeFireId === fireId) {
              return {
                availableFires: newFires,
                activeFireId: DEFAULT_FIRE.fire_id,
                activeFire: DEFAULT_FIRE,
              };
            }
            return {
              availableFires: newFires,
            };
          });
        },
      }),
      {
        name: 'ranger-fire-context',
        // Only persist activeFireId and user-created fires
        partialize: (state) => ({
          activeFireId: state.activeFireId,
          // Only persist non-demo fires
          userFires: state.availableFires.filter((f) => !f.isDemo),
        }),
        // Merge persisted state on hydration
        merge: (persisted, current) => {
          const persistedState = persisted as {
            activeFireId?: string;
            userFires?: FireContext[];
          };

          // Reconstruct available fires from demo + persisted user fires
          const availableFires = [
            ...DEMO_FIRES,
            ...(persistedState.userFires || []),
          ];

          // Find the active fire
          const activeFireId = persistedState.activeFireId || DEFAULT_FIRE.fire_id;
          const activeFire =
            availableFires.find((f) => f.fire_id === activeFireId) || DEFAULT_FIRE;

          return {
            ...current,
            activeFireId,
            activeFire,
            availableFires,
          };
        },
      }
    ),
    { name: 'fire-context-store' }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useActiveFire = () => useFireContextStore((state) => state.activeFire);
export const useActiveFireId = () => useFireContextStore((state) => state.activeFireId);
export const useAvailableFires = () => useFireContextStore((state) => state.availableFires);
export const useOnboardingState = () => useFireContextStore((state) => state.onboarding);
export const useIsOnboardingOpen = () =>
  useFireContextStore((state) => state.onboarding.isOpen);
export const useOnboardingStep = () =>
  useFireContextStore((state) => state.onboarding.currentStep);
export const useAgentProgress = () =>
  useFireContextStore((state) => state.onboarding.agentProgress);

/**
 * Get fires by status
 */
export const useDemoFires = () =>
  useFireContextStore((state) => state.availableFires.filter((f) => f.isDemo));
export const useUserFires = () =>
  useFireContextStore((state) => state.availableFires.filter((f) => !f.isDemo));
