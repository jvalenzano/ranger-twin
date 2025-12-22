/**
 * DemoTourOverlay - The guided demo experience UI
 *
 * Features:
 * - Step-by-step annotation cards
 * - Progress indicator (step dots)
 * - Back/Next/Skip navigation
 * - Syncs with map camera and layer visibility
 * - "Look For" callouts
 */

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { useLifecycleStore } from '@/stores/lifecycleStore';
import {
  useDemoTourStore,
  useTourActive,
  useTourStep,
  useTourProgress,
  type TourStep,
} from '@/stores/demoTourStore';
import { useMapStore } from '@/stores/mapStore';

// Agent badge colors
const AGENT_COLORS: Record<string, string> = {
  coordinator: 'bg-accent-cyan text-slate-900',
  'burn-analyst': 'bg-severe text-white',
  'trail-assessor': 'bg-warning text-slate-900',
  'cruising-assistant': 'bg-safe text-slate-900',
  'nepa-advisor': 'bg-purple-500 text-white',
};

const AGENT_LABELS: Record<string, string> = {
  coordinator: 'Recovery Coordinator',
  'burn-analyst': 'Burn Analyst',
  'trail-assessor': 'Trail Assessor',
  'cruising-assistant': 'Cruising Assistant',
  'nepa-advisor': 'NEPA Advisor',
};

// Progress dots component
const ProgressDots: React.FC<{ current: number; total: number; onGoTo: (index: number) => void }> = ({
  current,
  total,
  onGoTo,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onGoTo(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current - 1
            ? 'bg-accent-cyan w-4'
            : index < current - 1
              ? 'bg-accent-cyan/50'
              : 'bg-slate-600'
            }`}
          aria-label={`Go to step ${index + 1}`}
        />
      ))}
    </div>
  );
};

// Look For callout item
const LookForItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  return (
    <div
      className="flex items-start gap-2 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Eye size={14} className="text-accent-cyan mt-0.5 shrink-0" />
      <span className="text-xs text-slate-300">{text}</span>
    </div>
  );
};

// Main tour card component
const TourCard: React.FC<{ step: TourStep }> = ({ step }) => {
  const { nextStep, prevStep, skipTour, goToStep } = useDemoTourStore();
  const { current, total } = useTourProgress();
  const currentStepIndex = useDemoTourStore((state) => state.currentStepIndex);
  const isLastStep = currentStepIndex === total - 1;
  const isFirstStep = currentStepIndex === 0;

  // Position classes based on cardPosition
  const positionClasses: Record<string, string> = {
    'top-left': 'top-24 left-24',
    'top-right': 'top-24 right-6',
    'bottom-left': 'bottom-24 left-24',
    'bottom-right': 'bottom-24 right-6',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`absolute ${positionClasses[step.cardPosition]} z-50 w-[380px] animate-slideIn`}
    >
      <div className="glass-panel border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-cyan" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Guided Tour
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 mono">
              {current}/{total}
            </span>
            <button
              onClick={skipTour}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Agent badge */}
          {step.agent && (
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${AGENT_COLORS[step.agent]}`}
            >
              {AGENT_LABELS[step.agent]}
            </span>
          )}

          {/* Title and subtitle */}
          <div>
            <h3 className="text-lg font-bold text-white">{step.title}</h3>
            <p className="text-sm text-accent-cyan font-medium">{step.subtitle}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>

          {/* Look For section */}
          {step.lookFor.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Look For
              </span>
              <div className="space-y-2">
                {step.lookFor.map((item, index) => (
                  <LookForItem key={index} text={item} delay={index * 150} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="px-4 py-3 border-t border-white/5 bg-slate-800/30 flex items-center justify-between">
          <ProgressDots current={current} total={total} onGoTo={goToStep} />

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${isFirstStep
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <ChevronLeft size={14} />
              Back
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded bg-accent-cyan text-slate-900 hover:bg-accent-cyan/90 transition-all"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map/Layer sync effect component
const TourMapSync: React.FC<{ step: TourStep }> = ({ step }) => {
  const { flyTo, setActiveLayer, setVisibleLayers } = useMapStore();
  const { setActivePhase } = useLifecycleStore();

  useEffect(() => {
    // Fly to the step's camera position
    flyTo(step.camera.center, step.camera.zoom);

    // Set the base layer
    setActiveLayer(step.baseLayer);

    // Sync sidebar lifecycle phase
    if (step.lifecyclePhase) {
      setActivePhase(step.lifecyclePhase);
    }

    // Set visible data layers
    setVisibleLayers(step.visibleLayers);

    // Note: We're setting the camera but we need to also handle bearing/pitch
    // The mapStore's flyTo doesn't support bearing/pitch yet, so we'll set it via setCamera
    const setCamera = useMapStore.getState().setCamera;
    setCamera({
      center: step.camera.center,
      zoom: step.camera.zoom,
      bearing: step.camera.bearing ?? 0,
      pitch: step.camera.pitch ?? 45,
    });
  }, [step, flyTo, setActiveLayer, setVisibleLayers, setActivePhase]);

  return null;
};

// Main overlay component
const DemoTourOverlay: React.FC = () => {
  const isActive = useTourActive();
  const step = useTourStep();

  if (!isActive || !step) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none" />

      {/* Map/Layer sync effect */}
      <TourMapSync step={step} />

      {/* Tour card */}
      <TourCard step={step} />
    </>
  );
};

export default DemoTourOverlay;
