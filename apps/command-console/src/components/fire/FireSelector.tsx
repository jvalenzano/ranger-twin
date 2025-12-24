/**
 * FireSelector Component
 *
 * Dropdown selector for switching between fires in the header breadcrumb.
 * Shows current fire name with dropdown to select other available fires
 * or start the onboarding wizard for a new fire.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Flame, MapPin } from 'lucide-react';

import {
  useFireContextStore,
  useActiveFire,
  useAvailableFires,
} from '@/stores/fireContextStore';

interface FireSelectorProps {
  className?: string;
}

const FireSelector: React.FC<FireSelectorProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFire = useActiveFire();
  const availableFires = useAvailableFires();
  const selectFire = useFireContextStore((state) => state.selectFire);
  const startOnboarding = useFireContextStore((state) => state.startOnboarding);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFire = (fireId: string) => {
    selectFire(fireId);
    setIsOpen(false);
  };

  const handleAddNewFire = () => {
    startOnboarding();
    setIsOpen(false);
  };

  // Format acres for display (e.g., 127000 -> "127K ac")
  const formatAcres = (acres: number): string => {
    if (acres >= 1000000) {
      return `${(acres / 1000000).toFixed(1)}M ac`;
    }
    if (acres >= 1000) {
      return `${Math.round(acres / 1000)}K ac`;
    }
    return `${acres} ac`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 -mx-2 -my-1 rounded hover:bg-white/5 transition-colors group"
      >
        <span className="text-text-secondary group-hover:text-text-primary transition-colors">
          {activeFire.name}
        </span>
        <ChevronDown
          size={12}
          className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Fire Event
            </span>
          </div>

          {/* Fire List */}
          <div className="py-1 max-h-64 overflow-y-auto">
            {availableFires.map((fire) => {
              const isActive = fire.fire_id === activeFire.fire_id;
              return (
                <button
                  key={fire.fire_id}
                  onClick={() => handleSelectFire(fire.fire_id)}
                  className={`w-full px-3 py-2.5 flex items-start gap-3 text-left hover:bg-slate-700/50 transition-colors ${
                    isActive ? 'bg-slate-700/30' : ''
                  }`}
                >
                  {/* Fire Icon */}
                  <div
                    className={`mt-0.5 p-1.5 rounded ${
                      isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    <Flame size={14} />
                  </div>

                  {/* Fire Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[12px] font-semibold truncate ${
                          isActive ? 'text-accent-cyan' : 'text-slate-200'
                        }`}
                      >
                        {fire.name}
                      </span>
                      {fire.isDemo && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-600/50 text-slate-400">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={10} className="text-slate-500" />
                      <span className="text-[10px] text-slate-400 truncate">
                        {fire.forest}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500">
                        {formatAcres(fire.acres)}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {fire.year} · {fire.state}
                    </div>
                  </div>

                  {/* Checkmark for active */}
                  {isActive && (
                    <div className="mt-1">
                      <Check size={14} className="text-accent-cyan" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add New Fire */}
          <div className="border-t border-slate-700/50">
            <button
              onClick={handleAddNewFire}
              className="w-full px-3 py-3 flex items-center gap-3 text-left hover:bg-slate-700/30 transition-colors group"
            >
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Plus size={14} />
              </div>
              <div>
                <span className="text-[12px] font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Add New Fire...
                </span>
                <div className="text-[10px] text-slate-500">
                  Start onboarding wizard
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireSelector;
