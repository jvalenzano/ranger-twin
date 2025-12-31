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
import Tooltip from '@/components/ui/Tooltip';
import { tooltipContent } from '@/config/tooltipContent';


// Agent badge colors - using direct classes that Tailwind can detect
// These match the workflow phase colors
const AGENT_BADGE_STYLES: Record<SourceAgent, string> = {
  burn_analyst: 'bg-[#ef4444] text-white',          // Red - Impact (fire/burn)
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

// Phase accent colors for dynamic UI elements (confidence, expand link, action icons)
const AGENT_ACCENT_COLORS: Record<SourceAgent, { text: string; hex: string }> = {
  burn_analyst: { text: 'text-[#ef4444]', hex: '#ef4444' },        // Red - Impact
  trail_assessor: { text: 'text-[#f59e0b]', hex: '#f59e0b' },      // Amber - Damage
  cruising_assistant: { text: 'text-[#10b981]', hex: '#10b981' },  // Emerald - Timber
  nepa_advisor: { text: 'text-[#a855f7]', hex: '#a855f7' },        // Purple - Compliance
  recovery_coordinator: { text: 'text-[#06b6d4]', hex: '#06b6d4' },
};

const InsightPanel: React.FC = () => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const events = useBriefingStore((state) => state.events);
  const pulsePhase = useLifecycleStore((state) => state.pulsePhase);
  const setActivePhase = useLifecycleStore((state) => state.setActivePhase);
  const success = useNotificationStore((state) => state.success);

  // Get the most recent event (top of the list)
  const latestEvent: AgentBriefingEvent | undefined = events[0];

  // Check if we're in demo mode (skip backend API calls)
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Handle suggested action click
  const handleActionClick = async (action: any) => {
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

    console.log(`[InsightPanel] Action clicked: trigger ${targetAgent} (${actionId})`);

    // 3. Trigger real backend action (graceful degradation for demos)
    // Skip backend calls entirely in demo mode
    if (isDemoMode) {
      console.log('[InsightPanel] Demo mode - skipping backend API call');
      return;
    }

    // Attempt backend call with graceful error handling
    try {
      if (targetAgent === 'burn_analyst') {
        await briefingService.triggerBurnAnalysis('Sector NW-4');
      } else if (targetAgent === 'trail_assessor') {
        await briefingService.triggerTrailAssessment('Waldo Lake Trail');
      } else if (targetAgent === 'cruising_assistant') {
        await briefingService.triggerTimberCruise('Plot 47-Alpha');
      } else if (targetAgent === 'nepa_advisor') {
        await briefingService.triggerNepaReview('Cedar Creek Recovery');
      }
    } catch (error) {
      // Graceful degradation: Log warning but don't show error to user
      // The optimistic UI update via mockBriefingService already succeeded
      console.warn('[InsightPanel] Backend unavailable, using mock cascade:', error);
    }
  };

  // If no event, don't show anything - sidebar provides guidance
  if (!latestEvent) {
    return null;
  }

  const config = AGENT_CONFIG[latestEvent.source_agent];
  const badgeStyle = AGENT_BADGE_STYLES[latestEvent.source_agent];
  const accentColor = AGENT_ACCENT_COLORS[latestEvent.source_agent];
  const Icon = config.icon;
  const confidencePercent = Math.round(latestEvent.proof_layer.confidence * 100);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[360px] bg-[#0a0f1a]/65 backdrop-blur-2xl border-l border-white/[0.1] z-20 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          {/* Agent Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${badgeStyle}`}>
            <Icon size={12} />
            {config.name}
          </span>
          {/* Confidence - Dynamic phase color */}
          <Tooltip content={tooltipContent.confidenceScores.agentConfidence!} position="left">
            <span className={`text-[10px] mono font-bold cursor-help ${accentColor.text}`}>
              {confidencePercent}% CONF
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Scrollable Content - Custom scrollbar with phase color */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-phase"
        style={{
          ['--scrollbar-color' as string]: accentColor.hex,
          ['--scrollbar-color-hover' as string]: `${accentColor.hex}cc`,
        }}
      >
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

          {/* Preview when collapsed */}
          {!isReasoningExpanded && latestEvent.proof_layer.reasoning_chain.length > 0 && (
            <div className="mt-2 pl-4 border-l border-white/10">
              <p className="text-[11px] text-text-muted italic line-clamp-2">
                "{latestEvent.proof_layer.reasoning_chain[0]?.substring(0, 80)}..."
              </p>
              <span className={`text-[10px] mt-1 inline-block ${accentColor.text}`}>
                Expand to see full reasoning
              </span>
            </div>
          )}

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
                <Tooltip
                  key={index}
                  content={tooltipContent.confidenceScores.sourceReliability!}
                  position="left"
                >
                  <div className="flex items-center justify-between cursor-help">
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
                </Tooltip>
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
                className="w-full flex items-center gap-2 p-2 rounded bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all group"
                style={{ ['--hover-border' as string]: `${accentColor.hex}50` }}
              >
                <Zap size={14} className={accentColor.text} />
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

      {/* Timestamp - Shows when this briefing was generated */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[9px] text-text-muted uppercase tracking-wider">
          Briefing Generated
        </span>
        <span className={`text-[10px] mono font-medium ${accentColor.text}`}>
          {new Date(latestEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default InsightPanel;
