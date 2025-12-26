/**
 * FireOnboardingWizard - Main wizard container for adding new fires
 *
 * Multi-step modal wizard that demonstrates the agentic workflow:
 * 1. Fire Identification - Enter fire details
 * 2. Data Availability - Check available data sources
 * 3. Agent Progress - Watch agents analyze the fire (the "aha moment")
 * 4. Completion - Summary and transition to dashboard
 */

import React, { useEffect, useCallback } from 'react';
import { X, Flame, ChevronLeft } from 'lucide-react';

import { ONBOARDING_STEPS } from '@/types/fire';
import {
  useFireContextStore,
  useOnboardingState,
} from '@/stores/fireContextStore';

import {
  FireIdentificationStep,
  DataAvailabilityStep,
  AgentProgressStep,
  CompletionStep,
} from './steps';

import fireOnboardingService from '@/services/fireOnboardingService';

// Progress dots component
const ProgressDots: React.FC<{
  current: number;
  total: number;
  onGoTo?: (index: number) => void;
}> = ({ current, onGoTo }) => {
  return (
    <div className="flex items-center gap-2">
      {ONBOARDING_STEPS.map((step, index) => (
        <button
          key={step.id}
          onClick={() => onGoTo?.(index)}
          disabled={index > current || !onGoTo}
          className={`
            flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium
            transition-all duration-300
            ${
              index === current
                ? 'bg-accent-cyan text-slate-900'
                : index < current
                  ? 'bg-safe/20 text-safe cursor-pointer hover:bg-safe/30'
                  : 'bg-slate-700 text-slate-500'
            }
          `}
        >
          <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-current">
            {index + 1}
          </span>
          <span className="hidden sm:inline">{step.title}</span>
        </button>
      ))}
    </div>
  );
};

export const FireOnboardingWizard: React.FC = () => {
  const {
    closeOnboarding,
    setOnboardingStep,
    nextOnboardingStep,
    prevOnboardingStep,
    updateFireInput,
    completeOnboarding,
    resetOnboarding,
  } = useFireContextStore();

  const onboarding = useOnboardingState();
  const { isOpen, currentStep, fireInput, agentProgress } = onboarding;

  // Start agent simulation when entering step 2 (agent progress)
  useEffect(() => {
    if (isOpen && currentStep === 2 && fireInput.name) {
      fireOnboardingService.startSimulation(fireInput);
    }
  }, [isOpen, currentStep, fireInput]);

  // Handle closing
  const handleClose = useCallback(() => {
    // Stop any running simulation
    fireOnboardingService.stopSimulation();
    closeOnboarding();
    // Reset after close animation
    setTimeout(resetOnboarding, 300);
  }, [closeOnboarding, resetOnboarding]);

  // Handle completion
  const handleComplete = useCallback(() => {
    // Stop simulation if still running
    fireOnboardingService.stopSimulation();

    // Create the new fire context
    const newFire = fireOnboardingService.createFireContext(fireInput);
    completeOnboarding(newFire);

    // Reset after close
    setTimeout(resetOnboarding, 300);
  }, [fireInput, completeOnboarding, resetOnboarding]);

  // Handle going back
  const handleBack = useCallback(() => {
    if (currentStep === 2) {
      // Stop simulation if going back from agent progress
      fireOnboardingService.stopSimulation();
    }
    prevOnboardingStep();
  }, [currentStep, prevOnboardingStep]);

  // Handle step navigation (only allow going to completed steps)
  const handleGoToStep = useCallback(
    (index: number) => {
      if (index < currentStep) {
        if (currentStep === 2) {
          fireOnboardingService.stopSimulation();
        }
        setOnboardingStep(index);
      }
    },
    [currentStep, setOnboardingStep]
  );

  if (!isOpen) {
    return null;
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FireIdentificationStep
            fireInput={fireInput}
            onUpdate={updateFireInput}
            onNext={nextOnboardingStep}
          />
        );
      case 1:
        return (
          <DataAvailabilityStep
            fireInput={fireInput}
            onUpdate={updateFireInput}
            onNext={nextOnboardingStep}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <AgentProgressStep
            fireInput={fireInput}
            agentProgress={agentProgress}
            onComplete={nextOnboardingStep}
          />
        );
      case 3:
        return <CompletionStep fireInput={fireInput} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  const currentStepInfo = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-xl mx-4
          bg-surface border border-white/10 rounded-xl
          shadow-2xl shadow-black/50
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
          max-h-[90vh] flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-severe/20 flex items-center justify-center">
              <Flame size={20} className="text-severe" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Add New Fire</h2>
              <p className="text-xs text-slate-500">
                {currentStepInfo?.description || 'Configure your fire analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-text-primary transition-colors p-1"
            aria-label="Close wizard"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 border-b border-white/5 shrink-0">
          <ProgressDots
            current={currentStep}
            total={ONBOARDING_STEPS.length}
            onGoTo={handleGoToStep}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{renderStepContent()}</div>

        {/* Footer (only show back button on certain steps) */}
        {currentStep > 0 && currentStep < 3 && (
          <div className="px-6 py-4 border-t border-white/10 shrink-0">
            <button
              onClick={handleBack}
              className="
                flex items-center gap-1 px-3 py-1.5 text-sm
                text-slate-400 hover:text-text-primary transition-colors
              "
            >
              <ChevronLeft size={16} />
              Back to {ONBOARDING_STEPS[currentStep - 1]?.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FireOnboardingWizard;
