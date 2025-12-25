/**
 * MissionHeader - Top bar for Mission Control
 *
 * Contains:
 * - Logo/title
 * - Date/time display
 * - Phase filter chips (Critical, In BAER, In Recovery)
 * - User profile dropdown
 */

import { useState, useEffect } from 'react';
import { Filter, User, Clock } from 'lucide-react';

import { useMissionStore, usePhaseFilter } from '@/stores/missionStore';
import { PHASE_DISPLAY, type FirePhase } from '@/types/mission';

const PHASE_ORDER: FirePhase[] = ['active', 'in_baer', 'in_recovery'];

export function MissionHeader() {
  const phaseFilter = usePhaseFilter();
  const { togglePhaseFilter } = useMissionStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="h-full flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-sm">
      {/* Left section - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-wide">
            RANGER
          </span>
          <span className="text-xs text-slate-500 font-mono">
            MISSION CONTROL
          </span>
        </div>

        {/* Date/Time */}
        <div className="flex items-center gap-2 text-slate-400 text-sm font-mono ml-4">
          <Clock size={14} />
          <span>{formatDate()}</span>
          <span className="text-cyan-400">{formatTime()}</span>
          <span className="text-slate-600">UTC</span>
        </div>
      </div>

      {/* Center section - Phase Filter Chips */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-2 flex items-center gap-1">
          <Filter size={12} />
          Active Incidents
        </span>

        {PHASE_ORDER.map((phase) => {
          const isActive = phaseFilter.includes(phase);
          const display = PHASE_DISPLAY[phase];

          return (
            <button
              key={phase}
              onClick={() => togglePhaseFilter(phase)}
              className={`
                px-3 py-1.5 rounded text-xs font-medium
                transition-all duration-200 flex items-center gap-1.5
                ${isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
              style={{
                backgroundColor: isActive ? display.bgColor : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: isActive ? display.color : 'transparent',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? display.color : '#64748b' }}
              />
              {display.label}
            </button>
          );
        })}
      </div>

      {/* Right section - Profile */}
      <div className="flex items-center gap-3">
        {/* Filter icon button */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Advanced Filters"
        >
          <Filter size={18} />
        </button>

        {/* Profile dropdown */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm">Forest Supervisor</span>
        </button>
      </div>
    </header>
  );
}

export default MissionHeader;
