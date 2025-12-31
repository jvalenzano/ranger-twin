/**
 * HotspotLayerControl - Toggle and configure VIIRS thermal hotspot layer
 *
 * Features:
 * - Toggle switch to show/hide hotspots
 * - Confidence slider (0-100, default 80)
 * - Time range presets (24h, 3d, 7d)
 * - Hotspot count display
 * - Informative tooltip about the data source
 */

import { Flame, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import {
  useMissionStore,
  useShowHotspots,
  useHotspotConfidence,
  useHotspotDayRange,
} from '@/stores/missionStore';
import { getConfidenceLevelFromThreshold } from '@/utils/hotspotFilter';

interface HotspotLayerControlProps {
  /** Number of visible hotspots after filtering */
  hotspotCount: number;
  /** Whether hotspot data is currently loading */
  isLoading?: boolean;
}

const TIME_PRESETS = [
  { value: 1 as const, label: '24h' },
  { value: 3 as const, label: '3d' },
  { value: 7 as const, label: '7d' },
];

export function HotspotLayerControl({
  hotspotCount,
  isLoading = false,
}: HotspotLayerControlProps) {
  const showHotspots = useShowHotspots();
  const confidenceThreshold = useHotspotConfidence();
  const dayRange = useHotspotDayRange();
  const { toggleHotspots, setHotspotConfidence, setHotspotDayRange } = useMissionStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const confidenceLabel = getConfidenceLevelFromThreshold(confidenceThreshold);

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
      {/* Header row - always visible */}
      <button
        onClick={() => {
          if (!showHotspots) {
            // If turning on, just toggle
            toggleHotspots();
          } else {
            // If already on, expand/collapse settings
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Flame
            size={14}
            className={showHotspots ? 'text-orange-400' : 'text-slate-500'}
          />
          <span className="text-[11px] text-slate-300">Thermal Hotspots</span>

          {/* Info icon with tooltip */}
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
          >
            <Info size={12} className="text-slate-500 hover:text-slate-400 cursor-help" />

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  <strong className="text-orange-400">VIIRS Thermal Detection</strong>
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                  Real-time fire hotspots from NASA satellites (Suomi NPP & NOAA-20)
                  with 375m resolution. Updated every 12 hours.
                </p>
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>High confidence (~90%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Nominal confidence (~50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Low confidence (~20%)</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 mt-2">
                  Source: NASA FIRMS
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle switch */}
          <div
            role="switch"
            aria-checked={showHotspots}
            onClick={(e) => {
              e.stopPropagation();
              toggleHotspots();
            }}
            className={`
              relative w-8 h-4 rounded-full transition-colors cursor-pointer
              ${showHotspots ? 'bg-orange-500' : 'bg-slate-600'}
            `}
          >
            <div
              className={`
                absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
                ${showHotspots ? 'translate-x-4' : 'translate-x-0.5'}
              `}
            />
          </div>

          {/* Expand/collapse chevron (only when hotspots are on) */}
          {showHotspots && (
            <div className="text-slate-500">
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          )}
        </div>
      </button>

      {/* Expanded settings (only when hotspots are on and expanded) */}
      {showHotspots && isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {/* Time range presets */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">Time Range</span>
            </div>
            <div className="flex gap-1">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setHotspotDayRange(preset.value)}
                  className={`
                    flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors
                    ${dayRange === preset.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence slider */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Confidence</span>
              <span className="text-[10px] text-slate-400">
                {confidenceLabel} ({confidenceThreshold}%)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={confidenceThreshold}
              onChange={(e) => setHotspotConfidence(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
              <span>All</span>
              <span>High only</span>
            </div>
          </div>
        </div>
      )}

      {/* Count indicator (always visible when hotspots are on) */}
      {showHotspots && (
        <div className="px-3 py-1.5 border-t border-white/5 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Visible</span>
            <span className="text-[10px] text-orange-400 font-medium">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${hotspotCount.toLocaleString()} hotspots`
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotspotLayerControl;
