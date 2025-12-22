/**
 * Sidebar - Expandable Lifecycle Navigation
 *
 * Two states:
 * - Expanded (default): Shows icon + label + description (200px)
 * - Collapsed: Icon only with label below (64px)
 *
 * Automatically collapses after first workflow selection for more map space.
 * Includes map controls section at the bottom.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  AlertTriangle,
  TreePine,
  FileCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Compass,
  Ruler,
  PenTool,
  Settings,
  Pin,
  type LucideIcon,
} from 'lucide-react';

import {
  useLifecycleStore,
  useAllPhases,
  type LifecyclePhase,
} from '@/stores/lifecycleStore';
import { useMapStore, useActiveLayer } from '@/stores/mapStore';
import { useMeasureStore, useMeasureMode } from '@/stores/measureStore';
import mockBriefingService, {
  type LifecyclePhase as MockPhase,
} from '@/services/mockBriefingService';
import { useNotificationStore } from '@/stores/notificationStore';
import SidebarLegend from './SidebarLegend';
import Tooltip from '@/components/ui/Tooltip';
import { tooltipContent, type TooltipContent } from '@/config/tooltipContent';
import { useToolbarStore, TOOLBAR_TOOLS, type ToolId } from '@/stores/toolbarStore';

interface LifecycleStep {
  id: LifecyclePhase;
  icon: LucideIcon;
  label: string;
  description: string;
}

// Phase color configuration - using direct hex values for reliability
// These MUST match the values in tailwind.config.js
const PHASE_HEX_COLORS: Record<LifecyclePhase, string> = {
  IMPACT: '#ef4444',    // Red (fire/impact)
  DAMAGE: '#f59e0b',    // Amber
  TIMBER: '#10b981',    // Emerald
  COMPLIANCE: '#a855f7', // Purple
};

// Consistent naming: Workflow → Agent
// Impact Analysis → Impact Analyst
// Damage Assessment → Damage Assessor
// Timber Salvage → Timber Analyst
// Compliance Review → Compliance Advisor
const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    id: 'IMPACT',
    icon: Flame,
    label: 'Impact',
    description: 'Burn severity',
  },
  {
    id: 'DAMAGE',
    icon: AlertTriangle,
    label: 'Damage',
    description: 'Trail & assets',
  },
  {
    id: 'TIMBER',
    icon: TreePine,
    label: 'Timber',
    description: 'Salvage priority',
  },
  {
    id: 'COMPLIANCE',
    icon: FileCheck,
    label: 'Compliance',
    description: 'Regulatory',
  },
];

// Width constants
const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onWidthChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const phases = useAllPhases();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const setActivePhase = useLifecycleStore((state) => state.setActivePhase);
  const clearPulse = useLifecycleStore((state) => state.clearPulse);
  const info = useNotificationStore((state) => state.info);

  // Notify parent of width changes
  useEffect(() => {
    onWidthChange?.(isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  }, [isExpanded, onWidthChange]);

  const handlePhaseClick = (phase: LifecyclePhase) => {
    setActivePhase(phase);
    clearPulse(phase);

    // Fire the event for this phase from fixtures
    mockBriefingService.triggerPhase(phase as MockPhase);

    // Show toast with phase-colored icon
    const phaseColor = PHASE_HEX_COLORS[phase];
    info(`Viewing ${phase} analysis`, undefined, phaseColor);

    // Auto-collapse after first interaction to maximize map space
    if (!hasInteracted) {
      setHasInteracted(true);
      // Delay collapse slightly so user sees the selection
      setTimeout(() => setIsExpanded(false), 800);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setHasInteracted(true);
  };

  const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <aside
      className="absolute top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-out bg-[#0a0f1a]/65 backdrop-blur-2xl border-r border-white/[0.1] overflow-visible"
      style={{ width: sidebarWidth }}
    >
      {/* RANGER Brand Header - matches main header height (48px) */}
      <div className="h-[48px] flex items-center justify-between px-2 border-b border-white/10">
        {/* Clickable logo area - toggles sidebar */}
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {/* Single Tree Circular Badge Logo with Phase Color Gradient */}
          <div className="flex items-center justify-center flex-shrink-0 relative">
            <svg
              width="36"
              height="36"
              viewBox="0 0 512 512"
              fill="none"
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
            >
              {/* Gradient definitions for phase colors */}
              <defs>
                {/* Full cycle gradient ring - represents recovery phases */}
                <linearGradient id="phaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />      {/* Red - Impact */}
                  <stop offset="33%" stopColor="#f59e0b" />     {/* Amber - Damage */}
                  <stop offset="66%" stopColor="#10b981" />     {/* Emerald - Timber */}
                  <stop offset="100%" stopColor="#a855f7" />    {/* Purple - Compliance */}
                </linearGradient>
                {/* Subtle inner glow */}
                <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="85%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
              </defs>

              {/* Outer gradient ring - phase colors */}
              <circle
                cx="256"
                cy="256"
                r="248"
                fill="none"
                stroke="url(#phaseGradient)"
                strokeWidth="16"
                opacity="0.9"
              />

              {/* Dark inner circle background */}
              <circle cx="256" cy="256" r="232" fill="url(#innerGlow)" />

              {/* Subtle inner border */}
              <circle
                cx="256"
                cy="256"
                r="232"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />

              {/* Back mountain ridge - subtle */}
              <path
                d="M 56 280 L 100 220 L 150 250 L 220 180 L 256 210 L 300 160 L 360 220 L 420 190 L 456 280"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Front mountain ridge */}
              <path
                d="M 56 320 L 120 270 L 180 295 L 240 240 L 300 275 L 360 230 L 420 280 L 456 320"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Evergreen tree - white/light for contrast on dark bg */}
              <g transform="translate(256, 100)">
                <path
                  d="M0 0 L-60 70 L-35 70 L-75 130 L-45 130 L-85 195 L-50 195 L-95 265 L95 265 L50 195 L85 195 L45 130 L75 130 L35 70 L60 70 Z"
                  fill="rgba(255,255,255,0.9)"
                />
                <rect x="-22" y="265" width="44" height="70" fill="rgba(255,255,255,0.9)" />
              </g>
            </svg>
          </div>
          {isExpanded && (
            <>
              <span
                className="text-[22px] font-bold tracking-[0.08em] bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent"
              >
                RANGER
              </span>
              {/* Chevron indicator */}
              <ChevronLeft size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
            </>
          )}
        </button>
      </div>

      {/* Workflow steps */}
      <div className="flex-1 pt-4 pb-4 px-2 space-y-1 overflow-hidden">
        {LIFECYCLE_STEPS.map((step) => {
          const Icon = step.icon;
          const phaseState = phases[step.id];
          const isActive = activePhase === step.id;
          const isComplete = phaseState.status === 'complete';
          const hasPulse = phaseState.hasNewInsight;
          const phaseColor = PHASE_HEX_COLORS[step.id];

          const baseTooltip = tooltipContent.workflowPhases[step.id];
          if (!baseTooltip) return null;

          // Add phase color to tooltip for dynamic tip text color
          const phaseTooltip = {
            ...baseTooltip,
            accentColor: phaseColor,
          };

          return (
            <Tooltip
              key={step.id}
              content={phaseTooltip}
              position="right"
              className="block w-full"
            >
              <button
                onClick={() => handlePhaseClick(step.id)}
                className={`
                  group relative w-full flex items-center rounded-r-lg transition-all duration-200
                  ${isExpanded ? 'py-3 px-3 gap-3' : 'py-2 px-2 gap-0.5 justify-center flex-col'}
                  ${hasPulse ? 'bg-warning/5' : isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                `}
                style={{
                  borderLeft: `3px solid ${isActive ? phaseColor : hasPulse ? '#f59e0b' : 'transparent'}`,
                }}
                aria-label={`${step.label}: ${step.description}`}
                aria-pressed={isActive}
              >
                {/* Icon - always uses phase color */}
                <div className="relative flex-shrink-0">
                  <Icon
                    size={26}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{
                      color: hasPulse ? '#f59e0b' : phaseColor,
                      opacity: isActive || hasPulse ? 1 : 0.6,
                    }}
                    className="transition-all group-hover:opacity-100"
                  />

                  {/* Completion badge */}
                  {isComplete && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-background shadow-lg"
                      style={{ backgroundColor: phaseColor }}
                    >
                      <Check size={10} strokeWidth={3} className="text-slate-900" />
                    </div>
                  )}
                </div>

                {/* Label and description (expanded mode) */}
                {isExpanded && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[12px] font-semibold transition-colors"
                          style={{
                            color: hasPulse ? '#f59e0b' : isActive ? phaseColor : undefined,
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted block truncate">
                        {step.description}
                      </span>
                    </div>
                    {/* Action chevron */}
                    <ChevronRight
                      size={14}
                      className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{
                        color: isActive ? phaseColor : undefined,
                        opacity: isActive ? 0.6 : undefined,
                      }}
                    />
                  </>
                )}

                {/* Label (collapsed mode) */}
                {!isExpanded && (
                  <span
                    className="text-[8px] font-bold tracking-wider uppercase transition-all group-hover:opacity-100"
                    style={{
                      color: hasPulse ? '#f59e0b' : phaseColor,
                      opacity: isActive || hasPulse ? 1 : 0.6,
                    }}
                  >
                    {step.id.slice(0, 3)}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* RANGER Sidebar Legend - Contextual Key */}
      <SidebarLegend isExpanded={isExpanded} onExpandSidebar={() => setIsExpanded(true)} />

      {/* Map Controls Section */}
      <MapControlsSection isExpanded={isExpanded} />
    </aside>
  );
};

// Map Controls Section Component with Configurable Toolbar
const MapControlsSection: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const customizeRef = useRef<HTMLDivElement>(null);

  const activeLayer = useActiveLayer();
  const setActiveLayer = useMapStore((state) => state.setActiveLayer);
  const zoomIn = useMapStore((state) => state.zoomIn);
  const zoomOut = useMapStore((state) => state.zoomOut);
  const resetBearing = useMapStore((state) => state.resetBearing);

  const measureMode = useMeasureMode();
  const setMeasureMode = useMeasureStore((state) => state.setMode);
  const clearMeasure = useMeasureStore((state) => state.clear);

  const pinnedTools = useToolbarStore((state) => state.pinnedTools);
  const togglePin = useToolbarStore((state) => state.togglePin);
  const resetToDefaults = useToolbarStore((state) => state.resetToDefaults);

  // Close customize panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setCustomizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDistanceClick = () => {
    if (measureMode === 'distance') {
      clearMeasure();
    } else {
      setMeasureMode('distance');
    }
  };

  const handleAreaClick = () => {
    if (measureMode === 'area') {
      clearMeasure();
    } else {
      setMeasureMode('area');
    }
  };

  // Tool action handlers
  const toolActions: Record<ToolId, () => void> = {
    'layer-sat': () => setActiveLayer('SAT'),
    'layer-ter': () => setActiveLayer('TER'),
    'layer-ir': () => setActiveLayer('IR'),
    'zoom-in': zoomIn,
    'zoom-out': zoomOut,
    'reset-north': resetBearing,
    'measure-distance': handleDistanceClick,
    'measure-area': handleAreaClick,
  };

  // Tool active states
  const getToolActive = (toolId: ToolId): boolean => {
    switch (toolId) {
      case 'layer-sat': return activeLayer === 'SAT';
      case 'layer-ter': return activeLayer === 'TER';
      case 'layer-ir': return activeLayer === 'IR';
      case 'measure-distance': return measureMode === 'distance';
      case 'measure-area': return measureMode === 'area';
      default: return false;
    }
  };

  // Tool icons
  const getToolIcon = (toolId: ToolId, size: number = 16) => {
    switch (toolId) {
      case 'layer-sat':
      case 'layer-ter':
      case 'layer-ir':
        return null; // Layer tools use text labels
      case 'zoom-in': return <Plus size={size} />;
      case 'zoom-out': return <Minus size={size} />;
      case 'reset-north': return <Compass size={size} />;
      case 'measure-distance': return <Ruler size={size} />;
      case 'measure-area': return <PenTool size={size} />;
    }
  };

  // Get tooltip content for a tool
  const getToolTooltip = (toolId: ToolId): TooltipContent | null => {
    const tooltipMap: Record<string, TooltipContent | undefined> = {
      'layer-sat': tooltipContent.mapControls.SAT,
      'layer-ter': tooltipContent.mapControls.TER,
      'layer-ir': tooltipContent.mapControls.IR,
      'zoom-in': tooltipContent.mapControls.zoomIn,
      'zoom-out': tooltipContent.mapControls.zoomOut,
      'reset-north': tooltipContent.mapControls.resetNorth,
      'measure-distance': tooltipContent.mapControls.measureDistance,
      'measure-area': tooltipContent.mapControls.measureArea,
    };
    return tooltipMap[toolId] || null;
  };

  // Separate pinned tools by category
  const pinnedLayers = TOOLBAR_TOOLS.filter(t => t.category === 'layers' && pinnedTools.includes(t.id));
  const pinnedOtherTools = TOOLBAR_TOOLS.filter(t => t.category !== 'layers' && pinnedTools.includes(t.id));

  // Count unpinned tools for the customize button badge
  const unpinnedCount = TOOLBAR_TOOLS.length - pinnedTools.length;

  const ControlButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, isActive = false, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-9 h-9 rounded-lg flex items-center justify-center transition-all
        ${isActive
          ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
          : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-300'
        }
      `}
    >
      {children}
    </button>
  );

  // Layer button color scheme: SAT=cyan (sky/space), TER=amber (earth), IR=orange (heat)
  const LAYER_BUTTON_STYLES: Record<string, string> = {
    'layer-sat': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
    'layer-ter': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'layer-ir': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  };

  const LayerButton: React.FC<{
    toolId: ToolId;
    label: string;
  }> = ({ toolId, label }) => {
    const isActive = getToolActive(toolId);
    const tooltip = getToolTooltip(toolId);
    const activeStyle = LAYER_BUTTON_STYLES[toolId] || 'bg-safe/20 text-safe border border-safe/40';

    const button = (
      <button
        onClick={toolActions[toolId]}
        className={`
          w-full h-8 rounded-md text-[10px] font-bold tracking-tight transition-all
          ${isActive
            ? activeStyle
            : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-300'
          }
        `}
      >
        {label}
      </button>
    );

    const wrapperClass = isExpanded ? 'flex-1' : 'w-9';

    return tooltip ? (
      <Tooltip content={tooltip} position="right" className={wrapperClass}>
        {button}
      </Tooltip>
    ) : (
      <div className={wrapperClass}>{button}</div>
    );
  };

  return (
    <div className={`px-3 py-4 border-t border-white/10 ${!isExpanded ? 'overflow-hidden' : ''}`} ref={customizeRef}>
      {/* Section Header with Customize Button */}
      {isExpanded && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Map Controls
          </span>
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            className={`
              relative p-1 rounded transition-all
              ${customizeOpen
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }
            `}
            title="Customize toolbar"
          >
            <Settings size={14} />
            {unpinnedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-600 text-[8px] font-bold text-slate-300 rounded-full flex items-center justify-center">
                {unpinnedCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Customize Panel */}
      {customizeOpen && isExpanded && (
        <div className="mb-3 p-3 bg-slate-800/80 rounded-lg border border-slate-600/50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pin size={12} className="text-accent-cyan" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Customize Tools
              </span>
            </div>
            <button
              onClick={resetToDefaults}
              className="text-[9px] text-slate-400 hover:text-accent-cyan transition-colors"
            >
              Reset
            </button>
          </div>

          {/* All tools in a grid - click to toggle */}
          <div className="flex flex-wrap gap-1.5">
            {TOOLBAR_TOOLS.map((tool) => {
              const isPinned = pinnedTools.includes(tool.id);
              const icon = getToolIcon(tool.id, 14);
              const isLayerTool = tool.category === 'layers';

              return (
                <Tooltip
                  key={tool.id}
                  content={{
                    title: tool.label,
                    description: isPinned ? 'Click to hide from toolbar' : 'Click to show in toolbar',
                  }}
                  position="top"
                  delay={200}
                >
                  <button
                    onClick={() => togglePin(tool.id)}
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center transition-all
                      ${isPinned
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                        : 'bg-slate-700/50 text-slate-500 border border-slate-600/50 hover:border-slate-500/50 hover:text-slate-400'
                      }
                    `}
                  >
                    {isLayerTool ? (
                      <span className="text-[10px] font-bold">{tool.shortLabel}</span>
                    ) : (
                      icon
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* Layer Toggle - Only show pinned layers */}
      {pinnedLayers.length > 0 && (
        <div className={`flex ${isExpanded ? 'gap-1 mb-3' : 'flex-col gap-1 items-center mb-3'}`}>
          {pinnedLayers.map((tool) => (
            <LayerButton key={tool.id} toolId={tool.id} label={tool.shortLabel} />
          ))}
        </div>
      )}

      {/* Other Controls - Only show pinned tools */}
      {pinnedOtherTools.length > 0 && (
        isExpanded ? (
          <div className="flex flex-wrap gap-2">
            {pinnedOtherTools.map((tool) => {
              const tooltip = getToolTooltip(tool.id);
              const icon = getToolIcon(tool.id);
              const button = (
                <ControlButton
                  key={tool.id}
                  onClick={toolActions[tool.id]}
                  isActive={getToolActive(tool.id)}
                  title={tool.label}
                >
                  {icon}
                </ControlButton>
              );

              return tooltip ? (
                <Tooltip key={tool.id} content={tooltip} position="right">
                  <span className="inline-flex">{button}</span>
                </Tooltip>
              ) : (
                <span key={tool.id} className="inline-flex">{button}</span>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-1 items-center">
            {pinnedOtherTools.map((tool) => {
              const tooltip = getToolTooltip(tool.id);
              const icon = getToolIcon(tool.id);
              const button = (
                <ControlButton
                  key={tool.id}
                  onClick={toolActions[tool.id]}
                  isActive={getToolActive(tool.id)}
                  title={tool.label}
                >
                  {icon}
                </ControlButton>
              );

              return tooltip ? (
                <Tooltip key={tool.id} content={tooltip} position="right">
                  <span className="inline-flex">{button}</span>
                </Tooltip>
              ) : (
                <span key={tool.id} className="inline-flex">{button}</span>
              );
            })}
          </div>
        )
      )}

      {/* Customize button for collapsed mode */}
      {!isExpanded && (
        <div className="flex flex-col gap-1 items-center mt-2 pt-2 border-t border-white/5">
          <button
            onClick={() => {
              // In collapsed mode, clicking customize should expand the sidebar
              // For now, just show a tooltip hint
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-300 relative"
            title="Expand sidebar to customize tools"
          >
            <Settings size={14} />
            {unpinnedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-600 text-[8px] font-bold text-slate-300 rounded-full flex items-center justify-center">
                {unpinnedCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
