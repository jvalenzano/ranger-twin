/**
 * CompletionStep - Step 4 of the onboarding wizard
 *
 * Shows summary of what was generated and provides CTA to open the dashboard.
 */

import React from 'react';
import { Check, Map, FileText, AlertTriangle, Trees, ArrowRight, Sparkles } from 'lucide-react';

import type { FireContext } from '@/types/fire';

interface GeneratedItem {
  icon: React.ReactNode;
  label: string;
  count?: number;
  description: string;
}

const GENERATED_ITEMS: GeneratedItem[] = [
  {
    icon: <Map size={18} />,
    label: 'Fire Perimeter',
    description: 'Boundary polygon with burn severity zones',
  },
  {
    icon: <AlertTriangle size={18} />,
    label: 'Priority Zones',
    count: 12,
    description: 'High-severity areas requiring immediate attention',
  },
  {
    icon: <FileText size={18} />,
    label: 'Trail Assessments',
    count: 8,
    description: 'Infrastructure damage reports and work orders',
  },
  {
    icon: <Trees size={18} />,
    label: 'Timber Plots',
    count: 15,
    description: 'Salvage candidates with volume estimates',
  },
];

interface CompletionStepProps {
  fireInput: Partial<FireContext>;
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ fireInput, onComplete }) => {
  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-safe/20 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
          <Sparkles size={32} className="text-safe" />
        </div>
        <h3 className="text-xl font-bold text-text-primary">
          <span className="text-accent-cyan">{fireInput.name}</span> is Ready!
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          RANGER agents have analyzed your fire and prepared a complete recovery dashboard.
        </p>
      </div>

      {/* Generated items summary */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          What's Been Generated
        </span>
        <div className="space-y-2">
          {GENERATED_ITEMS.map((item, index) => (
            <div
              key={item.label}
              className="
                flex items-center gap-3 p-3 rounded-lg bg-surface border border-white/10
                animate-in slide-in-from-left-4 fade-in duration-300
              "
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-safe/20 flex items-center justify-center text-safe">
                {item.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-text-primary">{item.label}</span>
                  {item.count && (
                    <span className="px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan text-[10px] font-bold">
                      {item.count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{item.description}</p>
              </div>

              {/* Check */}
              <Check size={16} className="text-safe" />
            </div>
          ))}
        </div>
      </div>

      {/* Fire summary card */}
      <div className="p-4 rounded-lg bg-surface-elevated border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-severe/20 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary">{fireInput.name}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              <span>
                <strong className="text-slate-300">Forest:</strong> {fireInput.forest}
              </span>
              <span>
                <strong className="text-slate-300">State:</strong> {fireInput.state}
              </span>
              <span>
                <strong className="text-slate-300">Year:</strong> {fireInput.year}
              </span>
              <span>
                <strong className="text-slate-300">Acres:</strong>{' '}
                {fireInput.acres?.toLocaleString() || 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
        <p className="text-xs text-accent-cyan">
          <strong>What's Next:</strong> Explore the 4-phase workflow in the sidebar, chat with
          agents for deeper analysis, or take the guided tour.
        </p>
      </div>

      {/* CTA button */}
      <button
        onClick={onComplete}
        className="
          w-full py-4 rounded-lg font-bold text-sm
          bg-accent-cyan text-slate-900
          hover:bg-accent-cyan/90 transition-all
          flex items-center justify-center gap-2
          animate-in fade-in slide-in-from-bottom-2 duration-300
        "
        style={{ animationDelay: '400ms' }}
      >
        Open Fire Dashboard
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default CompletionStep;
