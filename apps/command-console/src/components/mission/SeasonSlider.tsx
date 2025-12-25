/**
 * SeasonSlider - Bottom timeline for temporal navigation
 *
 * Shows fire season timeline (May - October) with:
 * - Draggable slider
 * - Month markers
 * - "Today" indicator
 */

import React, { useRef, useCallback } from 'react';
import { Calendar } from 'lucide-react';

import { useMissionStore, useSeasonPosition } from '@/stores/missionStore';

const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export function SeasonSlider() {
  const seasonPosition = useSeasonPosition();
  const { setSeasonPosition } = useMissionStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  const updatePosition = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSeasonPosition(percent);
  };

  // Convert position to month name for display
  const getMonthFromPosition = (position: number): string => {
    const monthIndex = Math.min(Math.floor((position / 100) * MONTHS.length), MONTHS.length - 1);
    return MONTHS[monthIndex] || 'May';
  };

  return (
    <div className="h-full flex items-center px-4 gap-4">
      {/* Label */}
      <div className="flex items-center gap-2 text-slate-400 text-sm min-w-[100px]">
        <Calendar size={14} />
        <span className="font-medium">Season</span>
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="flex-1 h-8 relative cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-slate-700 rounded-full" />

        {/* Filled portion */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
          style={{ width: `${seasonPosition}%` }}
        />

        {/* Month markers */}
        {MONTHS.map((month, i) => {
          const position = (i / (MONTHS.length - 1)) * 100;
          return (
            <div
              key={month}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${position}%` }}
            >
              <div className="w-px h-2 bg-slate-600" />
              <span className="text-[10px] text-slate-500 mt-0.5">{month}</span>
            </div>
          );
        })}

        {/* Slider thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
          style={{ left: `${seasonPosition}%` }}
        />
      </div>

      {/* Current position label */}
      <div className="text-right min-w-[80px]">
        <span className="text-sm font-medium text-white">
          {getMonthFromPosition(seasonPosition)}
        </span>
        {seasonPosition >= 95 && (
          <span className="ml-2 text-xs text-cyan-400 font-medium">Today</span>
        )}
      </div>
    </div>
  );
}

export default SeasonSlider;
