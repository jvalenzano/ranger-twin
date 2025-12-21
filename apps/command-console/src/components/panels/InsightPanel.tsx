/**
 * InsightPanel - Displays the active agent's briefing
 *
 * This panel shows:
 * 1. Agent name and confidence score
 * 2. Summary and detail from the briefing
 * 3. Reasoning chain (expandable)
 * 4. Suggested actions (clickable to trigger next agent)
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Map,
  TreePine,
  FileCheck,
  Brain,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { useBriefingStore } from '@/stores/briefingStore';
import { useLifecycleStore } from '@/stores/lifecycleStore';
import type { AgentBriefingEvent, SourceAgent } from '@/types/briefing';
import briefingService from '@/services/briefingService';

// Map agents to icons and display names
const AGENT_CONFIG: Record<SourceAgent, { icon: LucideIcon; name: string }> = {
  burn_analyst: { icon: Flame, name: 'BURN ANALYST' },
  trail_assessor: { icon: Map, name: 'TRAIL ASSESSOR' },
  cruising_assistant: { icon: TreePine, name: 'CRUISING ASSISTANT' },
  nepa_advisor: { icon: FileCheck, name: 'NEPA ADVISOR' },
  recovery_coordinator: { icon: Brain, name: 'RECOVERY COORDINATOR' },
};

const InsightPanel: React.FC = () => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const events = useBriefingStore((state) => state.events);
  const pulsePhase = useLifecycleStore((state) => state.pulsePhase);

  // Get the most recent event (top of the list)
  const latestEvent: AgentBriefingEvent | undefined = events[0];

  // Handle suggested action click
  const handleActionClick = (targetAgent: SourceAgent) => {
    // Map agent to phase
    const agentToPhase: Record<SourceAgent, 'IMPACT' | 'DAMAGE' | 'TIMBER' | 'COMPLIANCE'> = {
      burn_analyst: 'IMPACT',
      trail_assessor: 'DAMAGE',
      cruising_assistant: 'TIMBER',
      nepa_advisor: 'COMPLIANCE',
      recovery_coordinator: 'IMPACT', // Coordinator doesn't have its own phase
    };

    const phase = agentToPhase[targetAgent];

    // Pulse the target phase to draw attention
    pulsePhase(phase);

    // Trigger real backend action
    if (targetAgent === 'burn_analyst') {
      briefingService.triggerBurnAnalysis('Sector NW-4');
    } else if (targetAgent === 'trail_assessor') {
      briefingService.triggerTrailAssessment('Waldo Lake Trail');
    } else if (targetAgent === 'cruising_assistant') {
      briefingService.triggerTimberCruise('Plot 47-Alpha');
    } else if (targetAgent === 'nepa_advisor') {
      briefingService.triggerNepaReview('Cedar Creek Recovery');
    }

    console.log(`[InsightPanel] Action clicked: trigger ${targetAgent}`);
  };

  // If no event, show empty state
  if (!latestEvent) {
    return (
      <div className="absolute top-6 right-6 w-[360px] glass p-5 rounded-md z-20">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Brain size={32} className="text-text-muted mb-3 opacity-50" />
          <p className="text-text-muted text-sm">
            Click a lifecycle phase to see agent insights
          </p>
        </div>
      </div>
    );
  }

  const config = AGENT_CONFIG[latestEvent.source_agent];
  const Icon = config.icon;
  const confidencePercent = Math.round(latestEvent.proof_layer.confidence * 100);

  return (
    <div className="absolute top-6 right-6 w-[360px] glass p-5 rounded-md z-20 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-safe" />
          <span className="text-[12px] font-medium tracking-[0.1em] text-text-primary uppercase">
            {config.name}
          </span>
        </div>
        <div className="bg-safe/10 text-safe px-2 py-0.5 rounded text-[10px] mono font-bold border border-safe/20">
          {confidencePercent}% CONF
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <p className="text-[15px] text-text-primary font-medium leading-relaxed">
          {latestEvent.content.summary}
        </p>
      </div>

      {/* Detail */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded border border-white/5">
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {latestEvent.content.detail}
        </p>
      </div>

      {/* Reasoning Chain (Expandable) */}
      <div className="mb-4">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors w-full"
        >
          {isReasoningExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span className="text-[11px] uppercase tracking-wider font-medium">
            Reasoning Chain ({latestEvent.proof_layer.reasoning_chain.length} steps)
          </span>
        </button>

        {isReasoningExpanded && (
          <div className="mt-3 pl-4 border-l border-white/10 space-y-2">
            {latestEvent.proof_layer.reasoning_chain.map((step, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-[10px] mono text-text-muted w-4 flex-shrink-0">
                  {index + 1}.
                </span>
                <p className="text-[12px] text-text-secondary">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confidence Ledger (if present) */}
      {latestEvent.proof_layer.confidence_ledger && (
        <div className="mb-4 p-3 bg-slate-900/30 rounded border border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">
            Data Sources
          </div>
          <div className="space-y-1">
            {latestEvent.proof_layer.confidence_ledger.inputs.slice(0, 3).map((input, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[11px] text-text-secondary truncate max-w-[200px]">
                  {input.source}
                </span>
                <span
                  className={`text-[10px] mono font-medium ${input.tier === 1
                    ? 'text-safe'
                    : input.tier === 2
                      ? 'text-warning'
                      : 'text-severe'
                    }`}
                >
                  {Math.round(input.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {latestEvent.content.suggested_actions.length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Suggested Actions
          </div>
          {latestEvent.content.suggested_actions.map((action) => (
            <button
              key={action.action_id}
              onClick={() => handleActionClick(action.target_agent)}
              className="w-full flex items-center gap-2 p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-warning/30 transition-all group"
            >
              <Zap size={14} className="text-warning group-hover:text-warning" />
              <div className="text-left flex-1">
                <div className="text-[12px] text-text-primary font-medium">
                  {action.label}
                </div>
                <div className="text-[10px] text-text-muted">
                  {action.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="pt-3 mt-3 border-t border-white/5">
        <span className="text-[10px] text-text-muted mono">
          {new Date(latestEvent.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default InsightPanel;
