/**
 * FireTooltip - Minimal hover tooltip for fire markers
 *
 * Shows fire name and severity on hover with a 300ms delay.
 * Rendered into MapLibre's native tooltip system.
 */

import type { NationalFire } from '@/types/mission';
import { SEVERITY_DISPLAY, PHASE_DISPLAY } from '@/types/mission';

interface FireTooltipProps {
  fire: NationalFire;
}

/**
 * FireTooltip component - renders the tooltip content
 */
export function FireTooltip({ fire }: FireTooltipProps) {
  const severityColor = SEVERITY_DISPLAY[fire.severity].color;

  return (
    <div className="fire-tooltip-content">
      {/* Fire name with severity indicator */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: severityColor }}
        />
        <span className="font-semibold text-white text-sm truncate max-w-[180px]">
          {fire.name}
        </span>
      </div>

      {/* Location and phase */}
      <div className="text-[10px] text-slate-400 mt-0.5">
        {fire.state} &bull; {PHASE_DISPLAY[fire.phase].label}
      </div>

      {/* Hint */}
      <div className="text-[9px] text-slate-500 mt-1 italic">
        Click for details
      </div>
    </div>
  );
}

/**
 * Generate tooltip HTML string for MapLibre popup
 * (Used when we can't render React directly)
 */
export function getFireTooltipHTML(fire: NationalFire): string {
  const severityColor = SEVERITY_DISPLAY[fire.severity].color;
  const phaseLabel = PHASE_DISPLAY[fire.phase].label;

  return `
    <div class="fire-tooltip-content">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${severityColor}; flex-shrink: 0;"></span>
        <span style="font-weight: 600; color: white; font-size: 13px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${fire.name}
        </span>
      </div>
      <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
        ${fire.state} &bull; ${phaseLabel}
      </div>
      <div style="font-size: 9px; color: #64748b; margin-top: 4px; font-style: italic;">
        Click for details
      </div>
    </div>
  `;
}

/**
 * Create a DOM element for the tooltip
 */
export function createTooltipElement(fire: NationalFire): HTMLDivElement {
  const container = document.createElement('div');
  container.innerHTML = getFireTooltipHTML(fire);
  return container;
}

export default FireTooltip;
