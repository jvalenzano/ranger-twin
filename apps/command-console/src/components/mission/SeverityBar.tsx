/**
 * SeverityBar - Horizontal severity indicator for fire cards
 *
 * Shows a colored bar representing fire severity level.
 */

import { SEVERITY_DISPLAY, type FireSeverity } from '@/types/mission';

interface SeverityBarProps {
  severity: FireSeverity;
  className?: string;
}

export function SeverityBar({ severity, className = '' }: SeverityBarProps) {
  const display = SEVERITY_DISPLAY[severity];
  const widthPercent = (display.weight / 4) * 100;

  return (
    <div className={`h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${widthPercent}%`,
          backgroundColor: display.color,
        }}
      />
    </div>
  );
}

/**
 * SeverityBadge - Small badge showing severity label
 */
interface SeverityBadgeProps {
  severity: FireSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const display = SEVERITY_DISPLAY[severity];

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${className}`}
      style={{
        backgroundColor: `${display.color}20`,
        color: display.color,
      }}
    >
      {display.label}
    </span>
  );
}

export default SeverityBar;
