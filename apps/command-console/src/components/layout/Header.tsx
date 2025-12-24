import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronRight,
  ChevronDown,
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
  Shield,
  Clock,
  Check,
  MessageCircle,
} from 'lucide-react';

import { useDemoTourStore, useTourActive } from '@/stores/demoTourStore';
import { useLifecycleStore, type LifecyclePhase } from '@/stores/lifecycleStore';
import { useActiveLayer, type MapLayerType } from '@/stores/mapStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useActiveFire } from '@/stores/fireContextStore';
import { FireSelector } from '@/components/fire';

// Timezone options relevant for USFS operations
const TIMEZONE_OPTIONS = [
  { id: 'UTC', label: 'UTC', offset: 0 },
  { id: 'America/Los_Angeles', label: 'Pacific', offset: -8 },
  { id: 'America/Denver', label: 'Mountain', offset: -7 },
  { id: 'America/Chicago', label: 'Central', offset: -6 },
  { id: 'America/New_York', label: 'Eastern', offset: -5 },
  { id: 'America/Anchorage', label: 'Alaska', offset: -9 },
  { id: 'Pacific/Honolulu', label: 'Hawaii', offset: -10 },
];

// Format timestamp for a specific timezone
const formatTimestamp = (timezoneId: string) => {
  const now = new Date();
  try {
    return now.toLocaleTimeString('en-US', {
      timeZone: timezoneId,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    // Fallback to UTC if timezone is invalid
    return now.toISOString().slice(11, 19);
  }
};

// Get timezone abbreviation
const getTimezoneAbbr = (timezoneId: string) => {
  const option = TIMEZONE_OPTIONS.find((tz) => tz.id === timezoneId);
  if (option) {
    return option.id === 'UTC' ? 'UTC' : option.label.slice(0, 3).toUpperCase();
  }
  return 'UTC';
};

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
}

const Header: React.FC<HeaderProps> = ({ onChatToggle, isChatOpen = false }) => {
  const startTour = useDemoTourStore((state) => state.startTour);
  const endTour = useDemoTourStore((state) => state.endTour);
  const isTourActive = useTourActive();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const activeLayer = useActiveLayer();
  const tooltipsEnabled = usePreferencesStore((state) => state.tooltipsEnabled);
  const toggleTooltips = usePreferencesStore((state) => state.toggleTooltips);
  const activeFire = useActiveFire();

  // Shorten forest name for breadcrumb display
  const shortForestName = activeFire.forest
    .replace(' National Forest', ' NF')
    .replace('National Forest', 'NF');

  // Default to Pacific time (Willamette NF is in Oregon)
  const [selectedTimezone, setSelectedTimezone] = useState('America/Los_Angeles');
  const [timestamp, setTimestamp] = useState(formatTimestamp(selectedTimezone));
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const timezoneRef = useRef<HTMLDivElement>(null);

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp(selectedTimezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (timezoneRef.current && !timezoneRef.current.contains(event.target as Node)) {
        setTimezoneOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoClick = () => {
    if (isTourActive) {
      endTour();
    } else {
      startTour();
    }
  };

  const unreadCount = MOCK_ALERTS.filter((a) => a.unread).length;

  return (
    <header className="absolute top-0 left-0 right-0 h-[48px] glass-header z-30 flex items-center justify-between px-4 md:px-8">
      {/* Left side - Breadcrumb with layer info */}
      <div className="flex items-center gap-2 text-text-secondary text-[11px] md:text-[12px] font-medium tracking-wide ml-12 md:ml-16">
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
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all group ${
            isTourActive
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
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all ${
            isChatOpen
              ? 'bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan'
              : 'bg-transparent border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
          }`}
        >
          <MessageSquare size={10} />
          Chat
        </button>

        {/* Timezone & Timestamp */}
        <div ref={timezoneRef} className="relative flex items-center gap-2">
          {/* Timezone Selector */}
          <button
            onClick={() => {
              setTimezoneOpen(!timezoneOpen);
              setAlertsOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all"
          >
            <Clock size={12} className="text-slate-400" />
            <span className="hidden sm:inline">{getTimezoneAbbr(selectedTimezone)}</span>
            <ChevronDown size={10} className={`transition-transform ${timezoneOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Timestamp Display */}
          <span className="text-slate-200 text-[10px] font-bold mono tracking-wider">
            {timestamp}
          </span>

          {/* Timezone Dropdown */}
          {timezoneOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-slate-700/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Timezone
                </span>
              </div>
              <div className="py-1">
                {TIMEZONE_OPTIONS.map((tz) => (
                  <button
                    key={tz.id}
                    onClick={() => {
                      setSelectedTimezone(tz.id);
                      setTimezoneOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-[11px] hover:bg-slate-700/50 transition-colors ${
                      selectedTimezone === tz.id ? 'text-accent-cyan' : 'text-slate-300'
                    }`}
                  >
                    <span className="font-medium">{tz.label}</span>
                    <span className="text-slate-500 mono text-[10px]">
                      {tz.offset >= 0 ? '+' : ''}{tz.offset}:00
                    </span>
                    {selectedTimezone === tz.id && (
                      <Check size={12} className="text-accent-cyan ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-xl overflow-hidden z-50">
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
                      className={`px-4 py-3 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                        alert.unread ? 'bg-slate-700/20' : ''
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
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-xl overflow-hidden z-50">
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
                <div className="mt-3 flex items-center gap-2">
                  <Shield size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-slate-400">
                    {MOCK_USER.district}
                  </span>
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
                {/* Tooltip Toggle */}
                <button
                  onClick={toggleTooltips}
                  className="w-full px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={14} />
                    Tooltips
                  </div>
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      tooltipsEnabled ? 'bg-accent-cyan' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                        tooltipsEnabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>

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
