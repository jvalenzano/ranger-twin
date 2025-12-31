/**
 * FieldModeToggle - High-contrast mode toggle for outdoor visibility
 *
 * Compact toggle button for enabling/disabling field mode.
 * Placed in BriefingStrip for easy access.
 */

import { Sun, Moon } from 'lucide-react';
import { useFieldMode } from '@/hooks/useFieldMode';

interface FieldModeToggleProps {
  className?: string;
}

export function FieldModeToggle({ className = '' }: FieldModeToggleProps) {
  const { isFieldMode, toggleFieldMode } = useFieldMode();

  return (
    <button
      onClick={toggleFieldMode}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md
        text-xs font-medium transition-all
        ${isFieldMode
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300'
        }
        ${className}
      `}
      title={isFieldMode ? 'Disable Field Mode (high contrast)' : 'Enable Field Mode (high contrast)'}
      aria-label={isFieldMode ? 'Disable field mode' : 'Enable field mode'}
      aria-pressed={isFieldMode}
    >
      {isFieldMode ? (
        <>
          <Sun size={14} className="text-amber-400" />
          <span>Field</span>
        </>
      ) : (
        <>
          <Moon size={14} />
          <span>Standard</span>
        </>
      )}
    </button>
  );
}

export default FieldModeToggle;
