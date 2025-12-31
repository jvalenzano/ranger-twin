/**
 * ProofLayerPanel - Reasoning transparency drawer
 *
 * Right-side drawer (~450px) showing the "Proof Layer" for federal compliance.
 * Displays: confidence score, source citations, and reasoning chain.
 *
 * "Not 'AI said do this.' But 'Here's what we know, here's what we're
 * inferring, here's what you decide.'" - Workshop design principle
 */

import { useEffect, useRef } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { ProofLayer, SourceAgent } from '@/types/briefing';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';
import { CitationChip } from './CitationChip';

interface ProofLayerPanelProps {
  proofLayer: ProofLayer;
  agentName: SourceAgent;
  isOpen: boolean;
  onClose: () => void;
}

// Confidence tier thresholds
function getConfidenceTier(confidence: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (confidence >= 0.8) {
    return {
      label: 'High Confidence',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500',
    };
  }
  if (confidence >= 0.6) {
    return {
      label: 'Medium Confidence',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500',
    };
  }
  return {
    label: 'Low Confidence',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
  };
}

export function ProofLayerPanel({
  proofLayer,
  agentName,
  isOpen,
  onClose,
}: ProofLayerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus in panel
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on open
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const confidencePercent = Math.round(proofLayer.confidence * 100);
  const tier = getConfidenceTier(proofLayer.confidence);
  const displayName = AGENT_DISPLAY_NAMES[agentName] || agentName;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-[450px] max-w-full h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-label="Proof Layer Details"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Proof Layer</h2>
              <p className="text-[10px] text-slate-400">{displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Confidence Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded bg-cyan-500" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confidence Score
              </h3>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              {/* Score display */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className={`text-4xl font-bold ${tier.color}`}>
                  {confidencePercent}%
                </span>
                <span className={`text-xs font-medium ${tier.color}`}>
                  {tier.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tier.bgColor} transition-all duration-500`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              {/* Tier explanation */}
              <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                {proofLayer.confidence >= 0.8 && (
                  <>Tier 1: Direct use, no hedging required.</>
                )}
                {proofLayer.confidence >= 0.6 && proofLayer.confidence < 0.8 && (
                  <>Tier 2: Caution-flagged, human decision recommended.</>
                )}
                {proofLayer.confidence < 0.6 && (
                  <>Tier 3: Demo/synthetic data only, requires validation.</>
                )}
              </p>
            </div>
          </section>

          {/* Citations Section */}
          {proofLayer.citations && proofLayer.citations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded bg-purple-500" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Citations ({proofLayer.citations.length})
                </h3>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                <div className="flex flex-wrap gap-2">
                  {proofLayer.citations.map((citation, idx) => (
                    <CitationChip key={`${citation.id}-${idx}`} citation={citation} />
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-slate-500">
                  Click a citation to view source details and excerpt.
                </p>
              </div>
            </section>
          )}

          {/* Reasoning Chain Section */}
          {proofLayer.reasoning_chain && proofLayer.reasoning_chain.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded bg-emerald-500" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Reasoning Chain
                </h3>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                <ol className="space-y-3">
                  {proofLayer.reasoning_chain.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      {/* Step number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-300">
                          {idx + 1}
                        </span>
                      </div>
                      {/* Step content */}
                      <div className="flex-1 pt-0.5">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* Confidence Ledger Section (if available) */}
          {proofLayer.confidence_ledger && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded bg-amber-500" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Confidence Ledger
                </h3>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5 space-y-2">
                {proofLayer.confidence_ledger.inputs.map((input, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400">{input.source}</span>
                    <div className="flex items-center gap-2">
                      <span className={getConfidenceTier(input.confidence).color}>
                        {Math.round(input.confidence * 100)}%
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Tier {input.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-800/50 border-t border-white/10">
          <p className="text-[10px] text-slate-500 text-center">
            Proof Layer ensures transparency for federal compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProofLayerPanel;
