/**
 * InsightCard - Glassmorphic card for displaying AgentBriefingEvents
 *
 * Used by:
 * - PanelInjectManager for panel_inject events
 * - ModalInterrupt for critical alerts
 */

import React from 'react';
import {
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  Info,
  ChevronDown,
  HelpCircle,
  FileText,
  MapPin,
  Download,
  ExternalLink,
  ClipboardList,
  Play,
  Eye,
} from 'lucide-react';

import type { AgentBriefingEvent, EventType, Severity, SuggestedAction } from '@/types/briefing';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';
import { ReasoningChain } from './ReasoningChain';
import Tooltip from '@/components/ui/Tooltip';
import { CitationChip } from './CitationChip';

// Mapping of agent to skill badge text
const AGENT_SKILLS: Record<string, string> = {
  recovery_coordinator: 'Orchestration',
  burn_analyst: 'Burn Analysis',
  trail_assessor: 'Damage Assessment',
  cruising_assistant: 'Timber Volume',
  nepa_advisor: 'Regulatory Compliance',
};

interface InsightCardProps {
  event: AgentBriefingEvent;
  onDismiss?: () => void;
  onActionClick?: (actionId: string) => void;
  showDetail?: boolean;
  compact?: boolean;
}

const TYPE_ICONS: Record<EventType, React.ReactNode> = {
  alert: <AlertTriangle size={16} />,
  insight: <Lightbulb size={16} />,
  action_required: <AlertCircle size={16} />,
  status_update: <Info size={16} />,
};

const SEVERITY_STYLES: Record<Severity, string> = {
  info: 'border-safe/30 bg-safe/5',
  warning: 'border-warning/30 bg-warning/5',
  critical: 'border-severe/30 bg-severe/5',
};

const SEVERITY_DOT: Record<Severity, string> = {
  info: 'bg-safe',
  warning: 'bg-warning',
  critical: 'bg-severe',
};

/**
 * Get icon for action based on label keywords
 */
const getActionIcon = (label: string): React.ReactNode => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('view') || lowerLabel.includes('show')) {
    return <Eye size={12} />;
  }
  if (lowerLabel.includes('generate') || lowerLabel.includes('create')) {
    return <FileText size={12} />;
  }
  if (lowerLabel.includes('export') || lowerLabel.includes('download')) {
    return <Download size={12} />;
  }
  if (lowerLabel.includes('map') || lowerLabel.includes('locate') || lowerLabel.includes('navigate')) {
    return <MapPin size={12} />;
  }
  if (lowerLabel.includes('regulatory') || lowerLabel.includes('compliance') || lowerLabel.includes('nepa')) {
    return <ClipboardList size={12} />;
  }
  if (lowerLabel.includes('start') || lowerLabel.includes('run') || lowerLabel.includes('analyze')) {
    return <Play size={12} />;
  }
  if (lowerLabel.includes('open') || lowerLabel.includes('link')) {
    return <ExternalLink size={12} />;
  }
  return <Play size={12} />;
};

/**
 * Determine if action should be primary (first action or contains priority keywords)
 */
const isPrimaryAction = (action: SuggestedAction, index: number): boolean => {
  if (index === 0) return true;
  const lowerLabel = action.label.toLowerCase();
  return lowerLabel.includes('generate') || lowerLabel.includes('start') || lowerLabel.includes('create');
};

/**
 * Get confidence tier styling based on percentage
 * Tier 1 (90%+): Green - Direct use, no hedging
 * Tier 2 (70-89%): Amber - Caution-flagged, human decision pending
 * Tier 3 (<70%): Red - Demo only, synthetic
 */
const getConfidenceTier = (confidence: number): { bg: string; text: string; label: string } => {
  if (confidence >= 90) {
    return { bg: 'bg-safe/20', text: 'text-safe', label: 'High confidence - Direct use' };
  }
  if (confidence >= 70) {
    return { bg: 'bg-warning/20', text: 'text-warning', label: 'Medium confidence - Verify before use' };
  }
  return { bg: 'bg-severe/20', text: 'text-severe', label: 'Low confidence - Demo/synthetic data' };
};

export const InsightCard: React.FC<InsightCardProps> = ({
  event,
  onDismiss,
  onActionClick,
  showDetail = false,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(showDetail);

  const agentName = AGENT_DISPLAY_NAMES[event.source_agent];
  const confidencePercent = Math.round(event.proof_layer.confidence * 100);
  const confidenceTier = getConfidenceTier(confidencePercent);

  return (
    <div
      className={`
        glass rounded-md border transition-all
        ${SEVERITY_STYLES[event.severity]}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[event.severity]}`} />
          <span className="text-[11px] font-medium tracking-[0.1em] text-text-primary uppercase">
            {agentName}
          </span>
          {/* Skill Badge */}
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-text-muted font-bold uppercase tracking-wider">
            [Skill: {AGENT_SKILLS[event.source_agent] || 'Standard'}]
          </span>
          <span className="text-text-muted">{TYPE_ICONS[event.type]}</span>
        </div>
        {/* Confidence badge with color tier and tooltip */}
        <Tooltip
          content={{
            title: `${confidencePercent}% Confidence`,
            description: confidenceTier.label,
            tip: confidencePercent >= 90
              ? 'This analysis can be used directly'
              : confidencePercent >= 70
                ? 'Review recommended before action'
                : 'For demonstration purposes only',
          }}
        >
          <div
            className={`
              ${confidenceTier.bg} ${confidenceTier.text}
              px-2 py-0.5 rounded text-[10px] mono font-medium
              flex items-center gap-1.5 cursor-help
              border border-current/20
            `}
          >
            <span>{confidencePercent}%</span>
            <HelpCircle size={10} className="opacity-60" />
          </div>
        </Tooltip>
      </div>

      {/* Summary */}
      <p className={`text-text-primary ${compact ? 'text-[12px]' : 'text-[13px]'} font-medium`}>
        {event.content.summary}
      </p>

      {/* Expandable Detail */}
      {!compact && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-2 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
            {isExpanded ? 'Hide details' : 'Show details'}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Detail text */}
              <p className="text-[12px] text-text-secondary">
                {event.content.detail}
              </p>

              {/* Reasoning chain - using new prominent component */}
              {event.proof_layer.reasoning_chain.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <ReasoningChain
                    steps={event.proof_layer.reasoning_chain}
                    defaultExpanded={true}
                  />
                </div>
              )}

              {/* Citations */}
              {event.proof_layer.citations.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.proof_layer.citations.map((citation, i) => (
                      <CitationChip
                        key={i}
                        sourceType={citation.source_type}
                        sourceId={citation.id}
                        excerpt={citation.excerpt}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Suggested Actions */}
      {event.content.suggested_actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {event.content.suggested_actions.map((action, index) => {
            const primary = isPrimaryAction(action, index);
            return (
              <Tooltip
                key={action.action_id}
                content={{
                  title: action.label,
                  description: action.rationale,
                  tip: `Handled by ${action.target_agent.replace('-', ' ')}`,
                }}
              >
                <button
                  onClick={() => onActionClick?.(action.action_id)}
                  className={`
                    px-3 py-1.5 rounded text-[11px] font-medium
                    flex items-center gap-1.5
                    transition-all duration-150
                    ${primary
                      ? 'bg-safe text-slate-900 hover:bg-safe/90 shadow-sm shadow-safe/20'
                      : 'bg-safe/10 text-safe border border-safe/30 hover:bg-safe/20'
                    }
                  `}
                >
                  {getActionIcon(action.label)}
                  {action.label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* Dismiss button (if handler provided) */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      )}

      {/* Timestamp */}
      <div className="mt-3 text-[10px] text-text-muted">
        {formatTimestamp(event.timestamp)}
      </div>
    </div>
  );
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

export default InsightCard;
