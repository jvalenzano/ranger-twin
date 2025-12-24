/**
 * AgentProgressStep - Step 3 of the onboarding wizard (The "Aha Moment")
 *
 * Shows real-time animated progress of all RANGER agents analyzing the fire.
 * This is the core demonstration of multi-agent orchestration.
 */

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

import type { AgentType, AgentProgressState, FireContext } from '@/types/fire';
import { AGENT_DISPLAY } from '@/types/fire';
import AgentProgressCard from '../AgentProgressCard';

// Ordered list of agents (matches orchestration order)
const AGENT_ORDER: AgentType[] = [
  'burn_analyst',
  'trail_assessor',
  'cruising_assistant',
  'nepa_advisor',
  'recovery_coordinator',
];

interface AgentProgressStepProps {
  fireInput: Partial<FireContext>;
  agentProgress: Record<AgentType, AgentProgressState>;
  onComplete: () => void;
}

export const AgentProgressStep: React.FC<AgentProgressStepProps> = ({
  fireInput,
  agentProgress,
  onComplete,
}) => {
  const hasCompletedRef = useRef(false);

  // Check if all agents are complete
  const allComplete = AGENT_ORDER.every(
    (agent) => agentProgress[agent]?.status === 'complete'
  );

  // Find current active agent
  const activeAgent = AGENT_ORDER.find(
    (agent) => agentProgress[agent]?.status === 'working'
  );

  // Count completed agents
  const completedCount = AGENT_ORDER.filter(
    (agent) => agentProgress[agent]?.status === 'complete'
  ).length;

  // Auto-advance when all complete
  useEffect(() => {
    if (allComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      // Small delay before advancing
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allComplete, onComplete]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan text-sm font-medium mb-3">
          <Sparkles size={14} className="animate-pulse" />
          <span>Agents at Work</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">
          Analyzing{' '}
          <span className="text-accent-cyan">{fireInput.name || 'New Fire'}</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {allComplete
            ? 'Analysis complete! Preparing your dashboard...'
            : `${completedCount} of ${AGENT_ORDER.length} agents complete`}
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-safe rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / AGENT_ORDER.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Data Ingestion</span>
          <span>Analysis</span>
          <span>Synthesis</span>
        </div>
      </div>

      {/* Agent progress cards */}
      <div className="space-y-3">
        {AGENT_ORDER.map((agent) => (
          <AgentProgressCard
            key={agent}
            agent={agent}
            state={agentProgress[agent]}
            isActive={agent === activeAgent}
          />
        ))}
      </div>

      {/* Coordinator activity log (when active) */}
      {activeAgent === 'recovery_coordinator' && (
        <div className="p-3 rounded-lg bg-surface border border-accent-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{AGENT_DISPLAY.recovery_coordinator.icon}</span>
            <span className="text-xs font-medium text-accent-cyan uppercase tracking-wider">
              Coordinator Activity
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <p className="animate-pulse">Synthesizing agent findings...</p>
            <p>Building unified recovery timeline...</p>
            <p>Generating priority matrix...</p>
          </div>
        </div>
      )}

      {/* Completion message */}
      {allComplete && (
        <div className="p-4 rounded-lg bg-safe/10 border border-safe/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-safe/20 flex items-center justify-center">
              <Sparkles size={20} className="text-safe" />
            </div>
            <div>
              <h4 className="font-semibold text-safe">Analysis Complete!</h4>
              <p className="text-xs text-slate-400">
                All agents have finished analyzing the fire. Preparing your dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProgressStep;
