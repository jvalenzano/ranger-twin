/**
 * Demo Tour Store - Manages the guided demo experience
 *
 * Controls:
 * - Tour active state
 * - Current step
 * - Step-by-step navigation
 * - Map camera positions per step
 * - Layer visibility per step
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MapLayerType, DataLayerType } from './mapStore';

// Tour step definition
export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  lookFor: string[]; // "Look for" callouts
  // Map camera for this step
  camera: {
    center: [number, number];
    zoom: number;
    bearing?: number;
    pitch?: number;
  };
  // Which data layers to show (others hidden)
  visibleLayers: DataLayerType[];
  // Base layer
  baseLayer: MapLayerType;
  // Which lifecycle phase this step relates to (IMPACT, DAMAGE, TIMBER, COMPLIANCE)
  lifecyclePhase?: 'IMPACT' | 'DAMAGE' | 'TIMBER' | 'COMPLIANCE';
  // Which agent this step relates to (for UI highlighting)
  agent?: 'coordinator' | 'burn-analyst' | 'trail-assessor' | 'cruising-assistant' | 'nepa-advisor';
  // Position of the annotation card
  cardPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

// The 7 tour steps as specified in the Manifesto
const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RANGER',
    subtitle: 'The Nerve Center for Forest Recovery',
    description:
      'Watch how a single burn finding cascades through trail assessment, timber analysis, and compliance review — automatically. This is the Cedar Creek Fire (2022) in Oregon\'s Willamette National Forest—127,000 acres of complex recovery decisions.',
    lookFor: [
      'The fire perimeter (dashed white line)',
      'Burn severity zones (red = high, yellow = moderate, green = low)',
      'The lifecycle rail on the left showing four recovery phases',
    ],
    camera: {
      center: [-122.1, 43.7],
      zoom: 10,
      bearing: 0,
      pitch: 45,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity'],
    baseLayer: 'SAT',
    lifecyclePhase: 'IMPACT',
    cardPosition: 'top-right',
  },
  {
    id: 'burn-analysis',
    title: 'Burn Analyst',
    subtitle: 'Impact Assessment Intelligence',
    description:
      'The Burn Analyst processes satellite imagery to classify burn severity. Sarah Chen (Fire Management Officer) needs this before any recovery planning can begin.',
    lookFor: [
      'High severity zones concentrated in the northwest sector',
      'Moderate severity creating a buffer around the core',
      'Low severity areas that may recover naturally',
    ],
    camera: {
      center: [-122.15, 43.75],
      zoom: 12,
      bearing: -15,
      pitch: 50,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity'],
    baseLayer: 'SAT',
    lifecyclePhase: 'IMPACT',
    agent: 'burn-analyst',
    cardPosition: 'top-right',
  },
  {
    id: 'trail-assessment',
    title: 'Trail Assessor',
    subtitle: 'Infrastructure Damage Analysis',
    description:
      'The Trail Assessor evaluates damage to trails and recreational infrastructure. Marcus Rodriguez (Recreation Technician) uses this to prioritize crew deployments.',
    lookFor: [
      'Trail damage points sized by severity',
      'Bridge failures (red) requiring immediate attention',
      'Hazard trees (yellow) along popular trails',
    ],
    camera: {
      center: [-122.05, 43.65],
      zoom: 13,
      bearing: 30,
      pitch: 55,
    },
    visibleLayers: ['firePerimeter', 'trailDamage'],
    baseLayer: 'TER',
    lifecyclePhase: 'DAMAGE',
    agent: 'trail-assessor',
    cardPosition: 'top-right',
  },
  {
    id: 'timber-salvage',
    title: 'Cruising Assistant',
    subtitle: 'Salvage Operations Planning',
    description:
      'The Cruising Assistant analyzes timber stands for salvage potential. Elena Vasquez (Timber Cruiser) identifies priority plots based on species composition, burn severity, and market conditions.',
    lookFor: [
      'Timber plot markers colored by priority',
      'High-value plots in the eastern corridor',
      'Plot IDs for field reference',
    ],
    camera: {
      center: [-122.0, 43.72],
      zoom: 13,
      bearing: -30,
      pitch: 50,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity', 'timberPlots'],
    baseLayer: 'SAT',
    lifecyclePhase: 'TIMBER',
    agent: 'cruising-assistant',
    cardPosition: 'top-right',
  },
  {
    id: 'nepa-compliance',
    title: 'NEPA Advisor',
    subtitle: 'Regulatory Navigation',
    description:
      'The NEPA Advisor helps Dr. James Park (Environmental Coordinator) navigate categorical exclusions and streamlined pathways. Real citations from current regulations.',
    lookFor: [
      'How burn severity informs NEPA pathways',
      'Overlap between timber plots and sensitive areas',
      'The integrated view of all data layers',
    ],
    camera: {
      center: [-122.1, 43.7],
      zoom: 11,
      bearing: 0,
      pitch: 40,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity', 'trailDamage', 'timberPlots'],
    baseLayer: 'SAT',
    lifecyclePhase: 'COMPLIANCE',
    agent: 'nepa-advisor',
    cardPosition: 'top-right',
  },
  {
    id: 'cascade',
    title: 'The Recovery Cascade',
    subtitle: 'Connected Intelligence',
    description:
      'This is RANGER\'s secret: agents don\'t work in isolation. The Burn Analyst\'s severity map informs the Trail Assessor\'s priorities. The Cruising Assistant considers NEPA constraints. Every insight feeds forward.',
    lookFor: [
      'All layers visible simultaneously',
      'How high-severity zones correlate with trail damage',
      'Timber plots positioned in accessible, high-value areas',
    ],
    camera: {
      center: [-122.1, 43.7],
      zoom: 10.5,
      bearing: 45,
      pitch: 60,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity', 'trailDamage', 'timberPlots'],
    baseLayer: 'SAT',
    agent: 'coordinator',
    cardPosition: 'top-right',
  },
  {
    id: 'conclusion',
    title: 'Recovery at the Speed of Insight',
    subtitle: 'From Data to Decision in Minutes',
    description:
      'What once took weeks of manual coordination now happens in minutes. RANGER doesn\'t replace foresters—it amplifies them. Sarah, Marcus, Elena, and Dr. Park each get exactly what they need, when they need it.',
    lookFor: [
      'The complete picture of Cedar Creek recovery',
      'Four workflows, one coordinated plan',
    ],
    camera: {
      center: [-122.1, 43.7],
      zoom: 10,
      bearing: 0,
      pitch: 45,
    },
    visibleLayers: ['firePerimeter', 'burnSeverity', 'trailDamage', 'timberPlots'],
    baseLayer: 'SAT',
    cardPosition: 'top-right',
  },
];

interface DemoTourState {
  // Tour state
  isActive: boolean;
  currentStepIndex: number;
  steps: TourStep[];

  // Computed
  currentStep: TourStep | null;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number; // 0-100

  // Actions
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
}

export const useDemoTourStore = create<DemoTourState>()(
  devtools(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      steps: TOUR_STEPS,

      // Computed getters (recalculated on access)
      get currentStep() {
        const { isActive, currentStepIndex, steps } = get();
        return isActive ? steps[currentStepIndex] : null;
      },

      get totalSteps() {
        return get().steps.length;
      },

      get isFirstStep() {
        return get().currentStepIndex === 0;
      },

      get isLastStep() {
        return get().currentStepIndex === get().steps.length - 1;
      },

      get progress() {
        const { currentStepIndex, steps } = get();
        return ((currentStepIndex + 1) / steps.length) * 100;
      },

      startTour: () => {
        set({ isActive: true, currentStepIndex: 0 });
      },

      endTour: () => {
        set({ isActive: false, currentStepIndex: 0 });
      },

      nextStep: () => {
        const { currentStepIndex, steps } = get();
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          // End tour when reaching the last step
          set({ isActive: false, currentStepIndex: 0 });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      goToStep: (index: number) => {
        const { steps } = get();
        if (index >= 0 && index < steps.length) {
          set({ currentStepIndex: index });
        }
      },

      skipTour: () => {
        set({ isActive: false, currentStepIndex: 0 });
      },
    }),
    { name: 'demo-tour-store' }
  )
);

// Selector hooks for optimized re-renders
export const useTourActive = () => useDemoTourStore((state) => state.isActive);
export const useTourStep = () => {
  const isActive = useDemoTourStore((state) => state.isActive);
  const currentStepIndex = useDemoTourStore((state) => state.currentStepIndex);
  const steps = useDemoTourStore((state) => state.steps);
  return isActive ? steps[currentStepIndex] : null;
};
export const useTourProgress = () => {
  const currentStepIndex = useDemoTourStore((state) => state.currentStepIndex);
  const totalSteps = useDemoTourStore((state) => state.steps.length);
  return {
    current: currentStepIndex + 1,
    total: totalSteps,
    percent: ((currentStepIndex + 1) / totalSteps) * 100,
  };
};

export { TOUR_STEPS };
