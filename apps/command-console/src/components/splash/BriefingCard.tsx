/**
 * BriefingCard - Individual briefing item component
 *
 * Displays agent briefing with severity indicator
 */

import React from 'react';
import type { BriefingItem, Severity } from '@/types/splash';

interface BriefingCardProps {
  item: BriefingItem;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ item }) => {
  const getSeverityColor = (sev: Severity): string => {
    switch (sev) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
        return 'bg-teal-400';
      default:
        return 'bg-slate-400';
    }
  };

  const isPulsingRed = item.severity === 'HIGH';

  return (
    <div
      className="fade-in group flex items-center gap-4 p-4 rounded-lg bg-slate-800/20 backdrop-blur-md border border-slate-300/10 hover:border-slate-300/20 transition-all duration-150"
      style={{ animationDelay: `${item.delay}ms` }}
    >
      {/* Agent Icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-900 rounded-md text-xl border border-slate-700/50">
        {item.icon}
      </div>

      {/* Briefing Content */}
      <div className="flex-grow flex flex-col gap-0.5">
        <span className="text-[10px] font-bold font-mono text-slate-500 tracking-wider">
          {item.agent}
        </span>
        <p className="text-sm font-medium text-slate-200">{item.content}</p>
      </div>

      {/* Severity Indicator */}
      <div className="flex-shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(item.severity)} ${
            isPulsingRed ? 'pulse-red shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''
          }`}
        ></div>
      </div>
    </div>
  );
};

export default BriefingCard;
