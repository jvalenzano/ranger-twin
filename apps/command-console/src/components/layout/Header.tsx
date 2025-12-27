import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronRight,
  Play,
  MessageSquare,
  X,
  Zap,
  Satellite,
  AlertTriangle,
  FileCheck,
  Settings,
  LogOut,
  User,
  Clock,
  MessageCircle,
} from 'lucide-react';

import { useDemoTourStore, useTourActive } from '@/stores/demoTourStore';
import { useLifecycleStore, type LifecyclePhase } from '@/stores/lifecycleStore';
import { useActiveLayer, type MapLayerType } from '@/stores/mapStore';
import { usePreferencesStore, useUxTooltipsEnabled, useDxTooltipsEnabled, useTimeZone } from '@/stores/preferencesStore';
import { useActiveFire } from '@/stores/fireContextStore';
import { FireSelector } from '@/components/fire';
import { CompactTokenUsage } from '@/components/common/CompactTokenUsage';
import { LocationSelector } from '@/components/common/LocationSelector';
import { formatTimestamp, getTimezoneAbbr } from '@/utils/time';

// Map phase IDs to user-friendly labels (consistent naming)
const PHASE_LABELS: Record<LifecyclePhase, string> = {
  IMPACT: 'Impact Analysis',
  DAMAGE: 'Damage Assessment',
  TIMBER: 'Timber Salvage',
  COMPLIANCE: 'Compliance Review',
};

// Phase-specific colors for breadcrumb indicator
// Using direct color values to ensure consistency with workflow colors
const PHASE_TEXT_COLORS: Record<LifecyclePhase, string> = {
  IMPACT: 'text-red-500',      // #ef4444 - matches phase.impact
  DAMAGE: 'text-amber-500',    // #f59e0b - matches phase.damage
  TIMBER: 'text-emerald-500',  // #10b981 - matches phase.timber
  COMPLIANCE: 'text-purple-500', // #a855f7 - matches phase.compliance
};

// Layer info for header display - includes date for data freshness context
// Color scheme: SAT=cyan (sky/space), TER=amber (earth), IR=orange (heat)
const LAYER_INFO: Record<MapLayerType, { label: string; source: string; date: string; color: string; borderColor: string }> = {
  SAT: { label: 'SAT', source: 'Sentinel-2 L2A', date: 'Oct 2024', color: 'text-cyan-400', borderColor: 'border-cyan-400/30' },
  TER: { label: 'TER', source: '3DEP 10m DEM', date: '2023', color: 'text-amber-400', borderColor: 'border-amber-400/30' },
  IR: { label: 'IR', source: 'dNBR Analysis', date: 'Oct 2024', color: 'text-orange-400', borderColor: 'border-orange-400/30' },
};

// Mock alerts for demo purposes
const MOCK_ALERTS = [
  {
    id: 1,
    type: 'agent',
    icon: Zap,
    title: 'Impact Analyst',
    message: 'Identified 3 new high-severity zones in SW-1 sector',
    time: '2 min ago',
    color: 'text-red-400',
    unread: true,
  },
  {
    id: 2,
    type: 'data',
    icon: Satellite,
    title: 'New Imagery Available',
    message: 'Sentinel-2 L2A updated for Cedar Creek perimeter',
    time: '1 hr ago',
    color: 'text-emerald-400',
    unread: true,
  },
  {
    id: 3,
    type: 'workflow',
    icon: AlertTriangle,
    title: 'Damage Phase Ready',
    message: 'Impact analysis complete. Trail assessment can begin.',
    time: '3 hrs ago',
    color: 'text-amber-400',
    unread: false,
  },
  {
    id: 4,
    type: 'compliance',
    icon: FileCheck,
    title: 'NEPA Deadline',
    message: 'Categorical exclusion review due in 14 days',
    time: '1 day ago',
    color: 'text-purple-400',
    unread: false,
  },
];

// Mock user profile
const MOCK_USER = {
  name: 'Sarah Chen',
  role: 'District Resource Specialist',
  district: 'Willamette National Forest',
  avatar: 'https://picsum.photos/seed/ranger-sarah/64/64',
};

interface HeaderProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  sidebarWidth?: number;
}

const Header: React.FC<HeaderProps> = ({
  onChatToggle,
  isChatOpen = false,
  sidebarWidth = 64 // Default to collapsed width if not provided
}) => {
  const startTour = useDemoTourStore((state) => state.startTour);
  const endTour = useDemoTourStore((state) => state.endTour);
  const isTourActive = useTourActive();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const activeLayer = useActiveLayer();
  const uxTooltipsEnabled = useUxTooltipsEnabled();
  const dxTooltipsEnabled = useDxTooltipsEnabled();
  const { toggleUxTooltips, toggleDxTooltips } = usePreferencesStore();
  const timeZone = useTimeZone();
  const activeFire = useActiveFire();

  // Shorten forest name for breadcrumb display
  const shortForestName = activeFire.forest
    .replace(' National Forest', ' NF')
    .replace('National Forest', 'NF');

  const [timestamp, setTimestamp] = useState(formatTimestamp(timeZone));
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp(timeZone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoClick = () => {
    if (isTourActive) {
      endTour();
    } else {
      // Force the Cedar Creek demo experience
      startTour('cedar-creek-2022');
    }
  };

  const unreadCount = MOCK_ALERTS.filter((a) => a.unread).length;

  return (
    <header
      className="absolute top-0 left-0 right-0 h-[48px] glass-header z-30 flex items-center justify-between transition-[padding] duration-300 ease-out"
      style={{
        paddingLeft: `${sidebarWidth + 24}px`,
        paddingRight: '32px'
      }}
    >
      {/* Left side - Breadcrumb with layer info */}
      <div className="flex items-center gap-2 text-text-secondary text-[11px] md:text-[12px] font-medium tracking-wide">
        <span className="hidden sm:inline">{shortForestName}</span>
        <ChevronRight size={14} className="opacity-40 hidden sm:inline" />
        <FireSelector />
        <ChevronRight size={14} className="opacity-40" />
        <span className={`${PHASE_TEXT_COLORS[activePhase]} font-semibold transition-all duration-300`}>
          {PHASE_LABELS[activePhase]}
        </span>
        {/* Layer info pill - subtle container with layer-colored accent */}
        {LAYER_INFO[activeLayer] && (
          <span className={`hidden md:inline-flex items-center gap-2 ml-3 px-2.5 py-1 rounded border bg-white/[0.02] ${LAYER_INFO[activeLayer].borderColor}`}>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${LAYER_INFO[activeLayer].color}`}>
              {LAYER_INFO[activeLayer].label}
            </span>
            <span className="text-[10px] text-text-secondary">
              {LAYER_INFO[activeLayer].source}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-text-muted">
              {LAYER_INFO[activeLayer].date}
            </span>
          </span>
        )}
      </div>

      {/* Right side status/user/actions */}
      <div className="flex items-center gap-4">
        {/* Demo Button - outline style */}
        <button
          onClick={handleDemoClick}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all group ${isTourActive
            ? 'bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan'
            : 'bg-transparent border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/60'
            }`}
        >
          {isTourActive ? (
            <>
              <X size={10} />
              Stop
            </>
          ) : (
            <>
              <Play size={10} className="group-hover:scale-110 transition-transform" />
              Demo
            </>
          )}
        </button>

        {/* Chat Button */}
        <button
          onClick={onChatToggle}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all ${isChatOpen
            ? 'bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan'
            : 'bg-transparent border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
            }`}
        >
          <MessageSquare size={10} />
          Chat
        </button>

        {/* Timezone & Timestamp */}
        <div className="relative flex items-center gap-2 px-2 py-1 rounded border border-transparent hover:border-white/10 transition-colors">
          <Clock size={12} className="text-slate-400" />
          <span className="text-[10px] mono uppercase tracking-wider text-slate-300">
            {getTimezoneAbbr(timeZone)}
          </span>
          <span className="text-slate-200 text-[10px] font-bold mono tracking-wider pl-1 border-l border-white/10 ml-1">
            {timestamp}
          </span>
        </div>

        {/* Alerts Dropdown */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setProfileOpen(false);
            }}
            className="relative text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-cyan text-[9px] font-bold text-slate-900 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {alertsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    Notifications
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {unreadCount} unread
                  </span>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {MOCK_ALERTS.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`px-4 py-3 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer ${alert.unread ? 'bg-slate-700/20' : ''
                        }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 ${alert.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-200">
                              {alert.title}
                            </span>
                            {alert.unread && (
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {alert.message}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {alert.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/50">
                <button className="text-[10px] text-accent-cyan hover:text-accent-cyan/80 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setAlertsOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden hover:border-white/30 transition-colors"
          >
            <img
              src={MOCK_USER.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              {/* User Info */}
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
                    UX Tooltips
                  </div>
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors ${uxTooltipsEnabled ? 'bg-accent-cyan' : 'bg-slate-600'}`}
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
                    <Zap size={14} className={dxTooltipsEnabled ? 'text-purple-400' : 'text-slate-500'} />
                    DX Tooltips
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
    </header>
  );
};

export default Header;
