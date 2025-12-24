/**
 * AgentProgressCard - Animated card showing individual agent status during onboarding
 *
 * Displays agent name, icon, status, progress bar, and message.
 * Used in the AgentProgressStep of the onboarding wizard.
 */

import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

import type { AgentType, AgentProgressState } from '@/types/fire';
import { AGENT_DISPLAY } from '@/types/fire';

interface AgentProgressCardProps {
  agent: AgentType;
  state: AgentProgressState;
  isActive?: boolean;
}

export const AgentProgressCard: React.FC<AgentProgressCardProps> = ({
  agent,
  state,
  isActive = false,
}) => {
  const display = AGENT_DISPLAY[agent];
  const { status, message, progress } = state;

  // Status-based styling
  const statusStyles = {
    pending: {
      border: 'border-white/10',
      bg: 'bg-surface/50',
      iconBg: 'bg-slate-700',
      textColor: 'text-slate-500',
    },
    working: {
      border: 'border-accent-cyan/30',
      bg: 'bg-surface',
      iconBg: 'bg-accent-cyan/20',
      textColor: 'text-accent-cyan',
    },
    complete: {
      border: 'border-safe/30',
      bg: 'bg-surface',
      iconBg: 'bg-safe/20',
      textColor: 'text-safe',
    },
    error: {
      border: 'border-severe/30',
      bg: 'bg-surface',
      iconBg: 'bg-severe/20',
      textColor: 'text-severe',
    },
  };

  const style = statusStyles[status];

  // Status icon
  const StatusIcon = () => {
    switch (status) {
      case 'complete':
        return <Check size={16} className="text-safe" />;
      case 'error':
        return <AlertCircle size={16} className="text-severe" />;
      case 'working':
        return <Loader2 size={16} className="text-accent-cyan animate-spin" />;
      default:
        return <span className="text-lg">{display.icon}</span>;
    }
  };

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-300
        ${style.border} ${style.bg}
        ${isActive ? 'ring-1 ring-accent-cyan/50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Agent icon */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            transition-colors duration-300
            ${style.iconBg}
          `}
        >
          <StatusIcon />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Agent name */}
          <div className="flex items-center gap-2">
            <h4
              className={`
                font-semibold text-sm transition-colors duration-300
                ${status === 'pending' ? 'text-slate-400' : 'text-white'}
              `}
            >
              {display.icon} {display.name}
            </h4>
          </div>

          {/* Status message */}
          <p className={`text-xs mt-1 ${style.textColor}`}>{message}</p>

          {/* Progress bar (only when working) */}
          {status === 'working' && typeof progress === 'number' && (
            <div className="mt-2">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {progress}% complete
              </span>
            </div>
          )}

          {/* Completed indicator */}
          {status === 'complete' && (
            <div className="flex items-center gap-1.5 mt-2">
              <Check size={12} className="text-safe" />
              <span className="text-[10px] text-safe font-medium">Analysis complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentProgressCard;
