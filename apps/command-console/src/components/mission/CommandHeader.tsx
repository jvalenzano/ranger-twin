/**
 * CommandHeader - Top bar content for Command/National view
 *
 * Contains:
 * - Date/time display
 * - Timeframe dropdown
 * - User profile dropdown
 *
 * Note: RANGER logo, view dropdown, and phase filters are now in CommandSidebar
 */

import { useState, useEffect, useRef } from 'react';
import { Filter, User, Clock, ChevronDown, ArrowUpDown, Code2, Settings, MessageCircle, Bell, LogOut } from 'lucide-react';

import { useMissionStore, useSortBy } from '@/stores/missionStore';
import { usePreferencesStore, useUxTooltipsEnabled, useDxTooltipsEnabled, useTimeZone } from '@/stores/preferencesStore';
import { CompactTokenUsage } from '@/components/common/CompactTokenUsage';
import { LocationSelector } from '@/components/common/LocationSelector';
import { TechnicalTooltip } from '@/components/common/TechnicalTooltip';
import { SORT_DISPLAY, type SortOption } from '@/types/mission';
import { formatTimestamp, getTimezoneAbbr } from '@/utils/time';

// Mock user profile - matches Tactical Header for consistency
const MOCK_USER = {
  name: 'Sarah Chen',
  role: 'District Resource Specialist',
  district: 'Willamette National Forest',
  avatar: 'https://picsum.photos/seed/ranger-sarah/64/64',
};

const SORT_ORDER: SortOption[] = ['priority', 'newest', 'largest', 'name'];

export function CommandHeader() {
  const sortBy = useSortBy();
  const { setSortBy } = useMissionStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const uxTooltipsEnabled = useUxTooltipsEnabled();
  const dxTooltipsEnabled = useDxTooltipsEnabled();
  const { toggleUxTooltips, toggleDxTooltips } = usePreferencesStore();
  const timeZone = useTimeZone();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (sort: SortOption) => {
    setSortBy(sort);
    setIsSortOpen(false);
  };

  return (
    <div className="h-full w-full flex items-center justify-between px-4">
      {/* Left section - Time Display */}
      <div className="flex items-center gap-4">
        {/* Time Display - matches Tactical header format */}
        <div className="flex items-center gap-2 px-2 py-1 rounded border border-transparent hover:border-white/10 transition-colors">
          <Clock size={12} className="text-slate-400" />
          <span className="text-[10px] mono uppercase tracking-wider text-slate-300">
            {getTimezoneAbbr(timeZone)}
          </span>
          <span className="text-slate-200 text-[10px] font-bold mono tracking-wider pl-1 border-l border-white/10 ml-1">
            {formatTimestamp(timeZone, currentTime)}
          </span>
        </div>
      </div>

      {/* Right section - Sort & Profile */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <TechnicalTooltip tooltipId="ui-sort-filter">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                transition-colors border border-transparent
                ${isSortOpen
                  ? 'bg-white/10 text-white border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <ArrowUpDown size={14} />
              <span>{SORT_DISPLAY[sortBy].label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
                {SORT_ORDER.map((sort) => {
                  const isSelected = sort === sortBy;
                  return (
                    <button
                      key={sort}
                      onClick={() => handleSortSelect(sort)}
                      className={`
                      w-full px-4 py-2 text-left text-sm
                      transition-colors flex items-center justify-between
                      ${isSelected
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-300 hover:bg-white/5'
                        }
                    `}
                    >
                      {SORT_DISPLAY[sort].label}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </TechnicalTooltip>

        {/* Filter icon button */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Advanced Filters"
        >
          <Filter size={18} />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden hover:border-white/30 transition-colors relative"
          >
            <img
              src={MOCK_USER.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            {/* Dev mode indicator */}
            {dxTooltipsEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-slate-900" />
            )}
          </button>

          {/* Profile dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
              {/* User info */}
              <div className="px-4 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <img
                    src={MOCK_USER.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-slate-200">
                      {MOCK_USER.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {MOCK_USER.role}
                    </div>
                  </div>
                </div>
                {/* Location Selector */}
                <div className="mt-3">
                  <LocationSelector />
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button className="w-full px-4 py-2 flex items-center gap-3 text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                  <User size={14} />
                  View Profile
                </button>
                <button className="w-full px-4 py-2 flex items-center gap-3 text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                  <Bell size={14} />
                  Notification Settings
                </button>
                <button className="w-full px-4 py-2 flex items-center gap-3 text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                  <Settings size={14} />
                  Preferences
                </button>

                <div className="border-t border-slate-700/50 my-1"></div>

                {/* UX Tooltips Toggle */}
                <button
                  onClick={toggleUxTooltips}
                  className="w-full px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={14} className={uxTooltipsEnabled ? 'text-cyan-400' : 'text-slate-500'} />
                    <span>UX Tooltips</span>
                  </div>
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors ${uxTooltipsEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${uxTooltipsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                  </div>
                </button>

                {/* DX Tooltips Toggle */}
                <button
                  onClick={toggleDxTooltips}
                  className="w-full px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code2 size={14} className={dxTooltipsEnabled ? 'text-purple-400' : 'text-slate-500'} />
                    <span>DX Tooltips</span>
                  </div>
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors ${dxTooltipsEnabled ? 'bg-purple-500' : 'bg-slate-600'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${dxTooltipsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                  </div>
                </button>

                {/* DX Hint text */}
                {dxTooltipsEnabled && (
                  <div className="px-4 py-2 text-[10px] text-purple-400/70 bg-purple-500/5 border-t border-purple-500/10">
                    Look for <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mx-0.5" /> indicators on UI elements
                  </div>
                )}
              </div>

              {/* Compact Token Usage */}
              <CompactTokenUsage />

              {/* Sign Out */}
              <div className="border-t border-slate-700/50 py-2">
                <button className="w-full px-4 py-2 flex items-center gap-3 text-[11px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandHeader;
