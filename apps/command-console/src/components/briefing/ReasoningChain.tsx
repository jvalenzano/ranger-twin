/**
 * ReasoningChain - Prominent display component for AI reasoning transparency
 *
 * Features:
 * - Prominent toggle button (not hidden details element)
 * - First step shown inline for quick context
 * - Step-level confidence visualization (colored dots)
 * - Expandable remaining steps
 * - "Why?" quick link integration
 *
 * Based on UX assessment recommendation for improved reasoning visibility.
 */

import React, { useState } from 'react';
import { ChevronRight, HelpCircle, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

interface ReasoningStep {
  text: string;
  confidence?: number; // 0-100, optional per-step confidence
}

interface ReasoningChainProps {
  /** Array of reasoning steps (strings or objects with text/confidence) */
  steps: (string | ReasoningStep)[];
  /** Accent color for styling (hex or tailwind class) */
  accentColor?: string;
  /** Show in compact mode (for chat messages) */
  compact?: boolean;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  /** Callback when "Why?" is clicked */
  onWhyClick?: () => void;
  /** Optional className override */
  className?: string;
}

/**
 * Get confidence tier and corresponding styling
 */
const getConfidenceTier = (confidence: number): { color: string; icon: React.ReactNode } => {
  if (confidence >= 90) {
    return { color: 'text-safe', icon: <CheckCircle2 size={10} className="text-safe" /> };
  }
  if (confidence >= 70) {
    return { color: 'text-warning', icon: <Circle size={10} className="text-warning fill-warning" /> };
  }
  return { color: 'text-severe', icon: <AlertCircle size={10} className="text-severe" /> };
};

/**
 * Normalize step to consistent format
 */
const normalizeStep = (step: string | ReasoningStep): ReasoningStep => {
  if (typeof step === 'string') {
    return { text: step };
  }
  return step;
};

export const ReasoningChain: React.FC<ReasoningChainProps> = ({
  steps,
  accentColor = 'accent-cyan',
  compact = false,
  defaultExpanded = false,
  onWhyClick,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!steps || steps.length === 0) {
    return null;
  }

  const normalizedSteps = steps.map(normalizeStep);
  const firstStep = normalizedSteps[0]!; // Safe because we check steps.length > 0 above
  const remainingSteps = normalizedSteps.slice(1);
  const hasMultipleSteps = remainingSteps.length > 0;

  return (
    <div className={`${className}`}>
      {/* Main toggle button with first step preview */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-start gap-2 p-2 rounded-md
          ${compact ? 'bg-slate-700/30' : 'bg-surface-elevated/50'}
          border border-white/5 hover:border-white/10
          transition-all group text-left
        `}
      >
        {/* Expand/collapse indicator */}
        <ChevronRight
          size={compact ? 12 : 14}
          className={`
            mt-0.5 text-text-muted group-hover:text-text-secondary
            transition-transform shrink-0
            ${isExpanded ? 'rotate-90' : ''}
          `}
        />

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-medium text-text-secondary uppercase tracking-wider`}>
              Reasoning {steps.length > 1 && `(${steps.length} steps)`}
            </span>

            {/* Why? button */}
            {onWhyClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhyClick();
                }}
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 rounded
                  text-[10px] font-medium text-${accentColor}
                  hover:bg-${accentColor}/10 transition-colors
                `}
              >
                <HelpCircle size={10} />
                Why?
              </button>
            )}
          </div>

          {/* First step inline preview */}
          <div className="flex items-start gap-2 mt-1.5">
            {firstStep.confidence !== undefined && (
              <span className="shrink-0 mt-0.5">
                {getConfidenceTier(firstStep.confidence).icon}
              </span>
            )}
            <p className={`${compact ? 'text-[11px]' : 'text-[12px]'} text-text-secondary line-clamp-2`}>
              <span className="text-text-muted mr-1">1.</span>
              {firstStep.text}
            </p>
          </div>

          {/* "More steps" indicator when collapsed */}
          {!isExpanded && hasMultipleSteps && (
            <p className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-text-muted mt-1`}>
              +{remainingSteps.length} more step{remainingSteps.length > 1 ? 's' : ''}...
            </p>
          )}
        </div>
      </button>

      {/* Expanded steps */}
      {isExpanded && hasMultipleSteps && (
        <div className={`mt-1 ml-5 space-y-1 ${compact ? 'pl-2' : 'pl-3'} border-l border-white/10`}>
          {remainingSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-2 py-1">
              {step.confidence !== undefined ? (
                <span className="shrink-0 mt-0.5">
                  {getConfidenceTier(step.confidence).icon}
                </span>
              ) : (
                <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-text-muted shrink-0 w-4`}>
                  {index + 2}.
                </span>
              )}
              <p className={`${compact ? 'text-[11px]' : 'text-[12px]'} text-text-secondary`}>
                {step.confidence !== undefined && (
                  <span className="text-text-muted mr-1">{index + 2}.</span>
                )}
                {step.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Simplified version for chat messages
 */
export const ChatReasoningChain: React.FC<{
  steps: string[];
  className?: string;
}> = ({ steps, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors group"
      >
        <ChevronRight
          size={12}
          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span className="font-medium">
          View reasoning ({steps.length} step{steps.length > 1 ? 's' : ''})
        </span>
      </button>

      {isExpanded && (
        <ol className="mt-2 ml-4 space-y-1.5 list-none">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[10px] text-slate-500 mono shrink-0 w-4">{idx + 1}.</span>
              <span className="text-[11px] text-slate-400">{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ReasoningChain;
