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

import React, { useState, useEffect } from 'react';
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
  type LucideIcon,
} from 'lucide-react';

import {
  useLifecycleStore,
  useAllPhases,
  type LifecyclePhase,
} from '@/stores/lifecycleStore';
import { useMapStore, useActiveLayer, type MapLayerType } from '@/stores/mapStore';
import { useMeasureStore, useMeasureMode } from '@/stores/measureStore';
import mockBriefingService, {
  type LifecyclePhase as MockPhase,
} from '@/services/mockBriefingService';

interface LifecycleStep {
  id: LifecyclePhase;
  icon: LucideIcon;
  label: string;
  description: string;
}

// Phase color configuration - using direct hex values for reliability
// These MUST match the values in tailwind.config.js
const PHASE_HEX_COLORS: Record<LifecyclePhase, string> = {
  IMPACT: '#22d3ee',    // Cyan
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
    description: 'Burn severity analysis',
  },
  {
    id: 'DAMAGE',
    icon: AlertTriangle,
    label: 'Damage',
    description: 'Trail & infrastructure',
  },
  {
    id: 'TIMBER',
    icon: TreePine,
    label: 'Timber',
    description: 'Salvage prioritization',
  },
  {
    id: 'COMPLIANCE',
    icon: FileCheck,
    label: 'Compliance',
    description: 'Regulatory review',
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

  // Notify parent of width changes
  useEffect(() => {
    onWidthChange?.(isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  }, [isExpanded, onWidthChange]);

  const handlePhaseClick = (phase: LifecyclePhase) => {
    setActivePhase(phase);
    clearPulse(phase);

    // Fire the event for this phase from fixtures
    mockBriefingService.triggerPhase(phase as MockPhase);

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
      className="absolute top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-out bg-[#0a0f1a]/95 backdrop-blur-xl border-r border-white/[0.06]"
      style={{ width: sidebarWidth }}
    >
      {/* RANGER Brand Header */}
      <div className="h-[56px] flex items-center gap-3 px-3 border-b border-white/10">
        {/* Shield Badge - Clean, no box */}
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-safe drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all"
          >
            <path
              d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="rgba(16,185,129,0.15)"
            />
            <path
              d="M12 7l3 4h-2v3h-2v-3H9l3-4z"
              fill="currentColor"
            />
            <rect x="11" y="14" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {isExpanded && (
          <span className="text-[18px] font-bold tracking-[0.08em] text-text-primary">
            RANGER
          </span>
        )}
      </div>

      {/* Workflows Header with collapse toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        {isExpanded && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Workflows
          </span>
        )}
        <button
          onClick={toggleExpanded}
          className={`p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors ${!isExpanded ? 'mx-auto' : 'ml-auto'}`}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Workflow steps */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {LIFECYCLE_STEPS.map((step) => {
          const Icon = step.icon;
          const phaseState = phases[step.id];
          const isActive = activePhase === step.id;
          const isComplete = phaseState.status === 'complete';
          const hasPulse = phaseState.hasNewInsight;
          const phaseColor = PHASE_HEX_COLORS[step.id];

          return (
            <button
              key={step.id}
              onClick={() => handlePhaseClick(step.id)}
              className={`
                group relative w-full flex items-center gap-3 rounded-r-lg transition-all duration-200
                ${isExpanded ? 'py-3 px-3' : 'py-2 px-2 justify-center flex-col'}
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
                  size={22}
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
              )}

              {/* Label (collapsed mode) */}
              {!isExpanded && (
                <span
                  className="text-[8px] font-bold tracking-wider uppercase mt-1 transition-all group-hover:opacity-100"
                  style={{
                    color: hasPulse ? '#f59e0b' : phaseColor,
                    opacity: isActive || hasPulse ? 1 : 0.6,
                  }}
                >
                  {step.id.slice(0, 3)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map Controls Section */}
      <MapControlsSection isExpanded={isExpanded} />

      {/* Expanded mode: helper text at bottom */}
      {isExpanded && !hasInteracted && (
        <div className="px-3 py-3 border-t border-white/5">
          <p className="text-[10px] text-text-muted text-center">
            Select a workflow to begin analysis
          </p>
        </div>
      )}
    </aside>
  );
};

// Map Controls Section Component
const MapControlsSection: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const activeLayer = useActiveLayer();
  const setActiveLayer = useMapStore((state) => state.setActiveLayer);
  const zoomIn = useMapStore((state) => state.zoomIn);
  const zoomOut = useMapStore((state) => state.zoomOut);
  const resetBearing = useMapStore((state) => state.resetBearing);

  const measureMode = useMeasureMode();
  const setMeasureMode = useMeasureStore((state) => state.setMode);
  const clearMeasure = useMeasureStore((state) => state.clear);

  const layers: MapLayerType[] = ['SAT', 'TER', 'IR'];

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

  return (
    <div className="px-3 py-4 border-t border-white/10">
      {/* Section Header */}
      {isExpanded && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
          Map Controls
        </div>
      )}

      {/* Layer Toggle */}
      <div className={`flex ${isExpanded ? 'gap-1 mb-3' : 'flex-col gap-1 items-center mb-3'}`}>
        {layers.map((layer) => {
          const isActive = activeLayer === layer;
          const isIR = layer === 'IR';

          return (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              title={layer === 'SAT' ? 'Satellite' : layer === 'TER' ? 'Terrain' : 'Infrared'}
              className={`
                ${isExpanded ? 'flex-1' : 'w-9'} h-8 rounded-md text-[10px] font-bold tracking-tight transition-all
                ${isActive && isIR
                  ? 'bg-gradient-to-br from-orange-500/30 to-red-600/30 text-orange-400 border border-orange-500/40'
                  : isActive
                    ? 'bg-safe/20 text-safe border border-safe/40'
                    : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-300'
                }
              `}
            >
              {layer}
            </button>
          );
        })}
      </div>

      {/* Zoom & Navigation Controls */}
      <div className={`flex ${isExpanded ? 'gap-2' : 'flex-col gap-1 items-center'}`}>
        <ControlButton onClick={zoomOut} title="Zoom Out">
          <Minus size={16} />
        </ControlButton>
        <ControlButton onClick={zoomIn} title="Zoom In">
          <Plus size={16} />
        </ControlButton>
        <ControlButton onClick={resetBearing} title="Reset North">
          <Compass size={16} />
        </ControlButton>

        {isExpanded && <div className="w-px h-6 bg-white/10 mx-1" />}

        <ControlButton
          onClick={handleDistanceClick}
          isActive={measureMode === 'distance'}
          title="Measure Distance"
        >
          <Ruler size={16} />
        </ControlButton>
        <ControlButton
          onClick={handleAreaClick}
          isActive={measureMode === 'area'}
          title="Measure Area"
        >
          <PenTool size={16} />
        </ControlButton>
      </div>
    </div>
  );
};

export default Sidebar;
