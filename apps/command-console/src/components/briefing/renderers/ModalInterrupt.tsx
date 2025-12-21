/**
 * ModalInterrupt - Critical alert modal overlay
 *
 * Displays when an event has severity: critical and ui_binding.target: modal_interrupt
 * Requires user acknowledgment before dismissing.
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

import type { AgentBriefingEvent } from '@/types/briefing';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';
import { InsightCard } from '../InsightCard';

interface ModalInterruptProps {
  event: AgentBriefingEvent;
  onDismiss: () => void;
  onActionClick?: (actionId: string) => void;
}

export const ModalInterrupt: React.FC<ModalInterruptProps> = ({
  event,
  onDismiss,
  onActionClick,
}) => {
  const agentName = AGENT_DISPLAY_NAMES[event.source_agent];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onDismiss}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-lg mx-4
          bg-surface border border-severe/30 rounded-lg
          shadow-[0_0_60px_rgba(239,68,68,0.3)]
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Critical header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-severe/10">
          <div className="w-10 h-10 rounded-full bg-severe/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-severe" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary">Critical Alert</h2>
            <p className="text-[12px] text-text-muted uppercase tracking-wider">
              From {agentName}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <InsightCard
            event={event}
            showDetail={true}
            onActionClick={onActionClick}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onDismiss}
            className="
              px-4 py-2 rounded text-[13px] font-medium
              bg-surface-elevated text-text-secondary
              hover:bg-white/10 transition-colors
            "
          >
            Acknowledge
          </button>
          {event.content.suggested_actions[0] && (
            <button
              onClick={() => onActionClick?.(event.content.suggested_actions[0]!.action_id)}
              className="
                px-4 py-2 rounded text-[13px] font-medium
                bg-safe text-white
                hover:bg-safe/80 transition-colors
              "
            >
              {event.content.suggested_actions[0].label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalInterrupt;
