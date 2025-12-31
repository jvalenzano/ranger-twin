/**
 * PhaseFilterChips - Multi-select chip filter for fire recovery phases
 *
 * Supports collapsed (icon-only) and expanded (full labels) states.
 * Shows count per phase and integrates with missionStore for filter persistence.
 *
 * @example
 * <PhaseFilterChips collapsed={isSidebarCollapsed} />
 */

import { Check } from 'lucide-react';

import { usePhaseFilter, useMissionStore } from '@/stores/missionStore';
import { useFireCountByPhase } from '@/hooks';
import { useNotificationStore } from '@/stores/notificationStore';
import { PHASE_DISPLAY, type FirePhase } from '@/types/mission';

interface PhaseFilterChipsProps {
  /**
   * When true, shows compact view with colored dots and count badges.
   * When false, shows full labels with checkboxes.
   * @default false
   */
  collapsed?: boolean;
  /** Optional className for container overrides */
  className?: string;
}

const PHASE_ORDER: FirePhase[] = ['active', 'baer_assessment', 'baer_implementation', 'in_restoration'];

export function PhaseFilterChips({ collapsed = false, className = '' }: PhaseFilterChipsProps) {
  const selectedPhases = usePhaseFilter();
  const phaseCounts = useFireCountByPhase();
  const { togglePhaseFilter } = useMissionStore();
  const { info: toastInfo } = useNotificationStore();

  // Handle toggle with last-phase protection
  const handleToggle = (phase: FirePhase) => {
    // Check if this is the last selected phase
    if (selectedPhases.length === 1 && selectedPhases.includes(phase)) {
      toastInfo('At least one phase must be selected');
      return;
    }
    togglePhaseFilter(phase);
  };

  // Calculate total fires for header
  const totalFires = Object.values(phaseCounts).reduce((sum, count) => sum + count, 0);
  const visibleFires = selectedPhases.reduce((sum, phase) => sum + phaseCounts[phase], 0);

  return (
    <div
      className={`space-y-1 ${className}`}
      role="group"
      aria-label="Filter fires by recovery phase"
    >
      {/* Section header - only in expanded mode */}
      {!collapsed && (
        <div className="px-1 mb-2 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">
            Phase Filter
          </span>
          <span className="text-[9px] text-slate-500">
            {visibleFires} of {totalFires}
          </span>
        </div>
      )}

      {/* Phase chips */}
      {PHASE_ORDER.map((phase) => {
        const isSelected = selectedPhases.includes(phase);
        const display = PHASE_DISPLAY[phase];
        const count = phaseCounts[phase];

        return (
          <PhaseChip
            key={phase}
            label={display.label}
            abbrev={display.abbrev}
            color={display.color}
            count={count}
            isSelected={isSelected}
            collapsed={collapsed}
            onToggle={() => handleToggle(phase)}
          />
        );
      })}
    </div>
  );
}

/**
 * Internal PhaseChip component
 */
interface PhaseChipProps {
  label: string;
  abbrev: string;
  color: string;
  count: number;
  isSelected: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

function PhaseChip({
  label,
  abbrev,
  color,
  count,
  isSelected,
  collapsed,
  onToggle,
}: PhaseChipProps) {
  return (
    <button
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${label}, ${count} fires, ${isSelected ? 'selected' : 'not selected'}`}
      onClick={onToggle}
      className={`
        group relative w-full flex items-center rounded-r-lg transition-all duration-200
        ${collapsed ? 'py-1.5 px-2 gap-1 justify-center flex-col' : 'py-2 px-3 gap-3'}
        ${isSelected ? 'bg-white/[0.04]' : 'opacity-50 hover:opacity-75 hover:bg-white/[0.02]'}
      `}
      style={{
        borderLeft: `3px solid ${isSelected ? color : 'transparent'}`,
      }}
    >
      {/* Color dot / checkbox indicator */}
      <div className="relative flex-shrink-0">
        <span
          className={`
            w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all
            ${isSelected ? '' : 'ring-1 ring-slate-600'}
          `}
          style={{ backgroundColor: isSelected ? color : 'transparent' }}
        >
          {isSelected && !collapsed && (
            <Check size={8} className="text-white/80" strokeWidth={3} />
          )}
        </span>
      </div>

      {/* Label + count */}
      {collapsed ? (
        // Collapsed: stacked abbreviation and count
        <>
          <span
            className="text-[7px] font-bold tracking-wider uppercase"
            style={{ color: isSelected ? color : '#64748b' }}
          >
            {abbrev}
          </span>
          {count > 0 && (
            <span className="text-[8px] text-slate-500">{count}</span>
          )}
        </>
      ) : (
        // Expanded: label and count inline
        <>
          <span
            className="flex-1 text-left text-[11px] font-medium transition-colors"
            style={{ color: isSelected ? color : '#94a3b8' }}
          >
            {label}
          </span>
          <span
            className={`
              text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center
              ${isSelected ? 'bg-white/10' : 'bg-white/5'}
            `}
            style={{ color: isSelected ? color : '#64748b' }}
          >
            {count}
          </span>
        </>
      )}
    </button>
  );
}

export default PhaseFilterChips;
