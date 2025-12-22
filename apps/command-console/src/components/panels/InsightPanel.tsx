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
  AlertTriangle,
  TreePine,
  FileCheck,
  Brain,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { useBriefingStore } from '@/stores/briefingStore';
import { useLifecycleStore, type LifecyclePhase } from '@/stores/lifecycleStore';
import type { AgentBriefingEvent, SourceAgent } from '@/types/briefing';
import briefingService from '@/services/briefingService';
import mockBriefingService from '@/services/mockBriefingService';
import { useNotificationStore } from '@/stores/notificationStore';
import { exportTracsWorkOrders, exportFsVegData } from '@/utils/exportUtils';


// Agent badge colors - using direct classes that Tailwind can detect
// These match the workflow phase colors
const AGENT_BADGE_STYLES: Record<SourceAgent, string> = {
  burn_analyst: 'bg-[#22d3ee] text-slate-900',      // Cyan - Impact
  trail_assessor: 'bg-[#f59e0b] text-slate-900',    // Amber - Damage
  cruising_assistant: 'bg-[#10b981] text-slate-900', // Emerald - Timber
  nepa_advisor: 'bg-[#a855f7] text-white',          // Purple - Compliance
  recovery_coordinator: 'bg-[#06b6d4] text-slate-900',
};

// Map agents to icons and display names (consistent with workflow naming)
const AGENT_CONFIG: Record<SourceAgent, { icon: LucideIcon; name: string }> = {
  burn_analyst: { icon: Flame, name: 'IMPACT ANALYST' },
  trail_assessor: { icon: AlertTriangle, name: 'DAMAGE ASSESSOR' },
  cruising_assistant: { icon: TreePine, name: 'TIMBER ANALYST' },
  nepa_advisor: { icon: FileCheck, name: 'COMPLIANCE ADVISOR' },
  recovery_coordinator: { icon: Brain, name: 'RECOVERY COORDINATOR' },
};

const InsightPanel: React.FC = () => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const events = useBriefingStore((state) => state.events);
  const pulsePhase = useLifecycleStore((state) => state.pulsePhase);
  const setActivePhase = useLifecycleStore((state) => state.setActivePhase);
  const success = useNotificationStore((state) => state.success);

  // Get the most recent event (top of the list)
  const latestEvent: AgentBriefingEvent | undefined = events[0];

  // Handle suggested action click
  const handleActionClick = (action: any) => {
    const { target_agent: targetAgent, action_id: actionId, label } = action;

    // 1. Handle Exports (Immediate)
    if (actionId === 'act_004') {
      exportTracsWorkOrders();
      success('Exporting TRACS Work Orders (CSV + JSON)...');
      return;
    }
    if (actionId === 'act_007') {
      exportFsVegData();
      success('Exporting FSVeg Data (CSV)...');
      return;
    }
    if (actionId === 'act_012') {
      success('Generating Full Recovery Briefing PDF...');
      return;
    }

    // 2. Identify Target Phase for Optimistic UI
    const agentToPhase: Record<string, LifecyclePhase> = {
      burn_analyst: 'IMPACT',
      trail_assessor: 'DAMAGE',
      cruising_assistant: 'TIMBER',
      nepa_advisor: 'COMPLIANCE',
      recovery_coordinator: 'IMPACT',
    };
    const phase = agentToPhase[targetAgent];

    if (phase) {
      // OPTIMISTIC UPDATE: Update UI state immediately regardless of network
      setActivePhase(phase);

      // Pulse the target phase to draw attention
      pulsePhase(phase);

      // Trigger mock event to ensure UI updates in demo mode
      mockBriefingService.triggerPhase(phase);

      success(`Triggered ${label}`);
    }

    // 3. Trigger real backend action (Fire-and-forget in demo)
    if (targetAgent === 'burn_analyst') {
      briefingService.triggerBurnAnalysis('Sector NW-4');
    } else if (targetAgent === 'trail_assessor') {
      briefingService.triggerTrailAssessment('Waldo Lake Trail');
    } else if (targetAgent === 'cruising_assistant') {
      briefingService.triggerTimberCruise('Plot 47-Alpha');
    } else if (targetAgent === 'nepa_advisor') {
      briefingService.triggerNepaReview('Cedar Creek Recovery');
    }

    console.log(`[InsightPanel] Action clicked: trigger ${targetAgent} (${actionId})`);
  };

  // If no event, don't show anything - sidebar provides guidance
  if (!latestEvent) {
    return null;
  }

  const config = AGENT_CONFIG[latestEvent.source_agent];
  const badgeStyle = AGENT_BADGE_STYLES[latestEvent.source_agent];
  const Icon = config.icon;
  const confidencePercent = Math.round(latestEvent.proof_layer.confidence * 100);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[360px] bg-[#0a0f1a]/95 backdrop-blur-xl border-l border-white/[0.06] z-20 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          {/* Agent Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${badgeStyle}`}>
            <Icon size={12} />
            {config.name}
          </span>
          {/* Confidence */}
          <span className="text-[10px] mono font-bold text-text-muted">
            {confidencePercent}% CONF
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary */}
        <div>
          <p className="text-[15px] text-text-primary font-medium leading-relaxed">
            {latestEvent.content.summary}
          </p>
        </div>

        {/* Detail */}
        <div className="p-3 bg-white/[0.02] rounded border border-white/[0.04]">
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {latestEvent.content.detail}
          </p>
        </div>

        {/* Reasoning Chain (Expandable) */}
        <div>
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
          <div className="p-3 bg-white/[0.02] rounded border border-white/[0.04]">
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
          <div className="pt-4 border-t border-white/[0.06] space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Suggested Actions
            </div>
            {latestEvent.content.suggested_actions.map((action) => (
              <button
                key={action.action_id}
                onClick={() => handleActionClick(action)}
                className="w-full flex items-center gap-2 p-2 rounded bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-warning/30 transition-all group"
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
      </div>

      {/* Timestamp - Fixed at bottom */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06]">
        <span className="text-[10px] text-text-muted mono">
          {new Date(latestEvent.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default InsightPanel;
