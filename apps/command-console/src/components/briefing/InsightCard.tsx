/**
 * InsightCard - Glassmorphic card for displaying AgentBriefingEvents
 *
 * Used by:
 * - PanelInjectManager for panel_inject events
 * - ModalInterrupt for critical alerts
 */

import React from 'react';
import { AlertTriangle, Lightbulb, AlertCircle, Info, ChevronDown } from 'lucide-react';

import type { AgentBriefingEvent, EventType, Severity } from '@/types/briefing';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';

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
          <span className="text-text-muted">{TYPE_ICONS[event.type]}</span>
        </div>
        <div className="bg-surface-elevated text-text-secondary px-1.5 py-0.5 rounded text-[10px] mono font-medium">
          {confidencePercent}% CONF
        </div>
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

              {/* Reasoning chain */}
              {event.proof_layer.reasoning_chain.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
                    Reasoning
                  </p>
                  <ul className="space-y-1">
                    {event.proof_layer.reasoning_chain.map((step, i) => (
                      <li key={i} className="text-[11px] text-text-secondary mono">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations */}
              {event.proof_layer.citations.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
                    Sources
                  </p>
                  <ul className="space-y-1">
                    {event.proof_layer.citations.map((citation, i) => (
                      <li key={i} className="text-[11px] text-text-muted">
                        <span className="text-text-secondary">{citation.source_type}:</span>{' '}
                        {citation.excerpt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Suggested Actions */}
      {event.content.suggested_actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {event.content.suggested_actions.map((action) => (
            <button
              key={action.action_id}
              onClick={() => onActionClick?.(action.action_id)}
              className="
                px-3 py-1.5 rounded text-[11px] font-medium
                bg-safe/10 text-safe border border-safe/30
                hover:bg-safe/20 transition-colors
              "
              title={action.rationale}
            >
              {action.label}
            </button>
          ))}
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
