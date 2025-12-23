/**
 * FloatingLegend - Draggable map legend overlay
 *
 * Features:
 * - Fully draggable positioning over the map
 * - Collapse/expand toggle
 * - Compact summary mode (dots only)
 * - Dock button to return to sidebar
 * - Position persisted to localStorage
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  PanelLeftClose,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import {
  useActiveLayer,
  useLegendExpanded,
  useLegendPosition,
  useLegendCompact,
  useLegendMode,
  useMapStore,
} from '@/stores/mapStore';
import { useLifecycleStore } from '@/stores/lifecycleStore';
import Tooltip from '@/components/ui/Tooltip';

// Severity color palette (normal view)
const SEVERITY_COLORS = {
  HIGH: '#EF4444',
  MODERATE: '#F59E0B',
  LOW: '#10B981',
};

// IR/Thermal color palette
const IR_SEVERITY_COLORS = {
  HIGH: '#EF4444',
  MODERATE: '#F59E0B',
  LOW: '#10B981',
};

// Trail damage type colors
const DAMAGE_COLORS = {
  BRIDGE_FAILURE: '#EF4444',
  DEBRIS_FLOW: '#F97316',
  HAZARD_TREES: '#EAB308',
  TREAD_EROSION: '#F59E0B',
};

// Timber priority colors
const PRIORITY_COLORS = {
  HIGHEST: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#22C55E',
};

const FloatingLegend: React.FC = () => {
  const activeLayer = useActiveLayer();
  const legendExpanded = useLegendExpanded();
  const legendPosition = useLegendPosition();
  const legendCompact = useLegendCompact();
  const legendMode = useLegendMode();
  const setLegendExpanded = useMapStore((state) => state.setLegendExpanded);
  const setLegendPosition = useMapStore((state) => state.setLegendPosition);
  const setLegendCompact = useMapStore((state) => state.setLegendCompact);
  const dockLegend = useMapStore((state) => state.dockLegend);
  const { activePhase } = useLifecycleStore();

  const isIR = activeLayer === 'IR';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Phase-based visibility
  const showBurnSeverity = true;
  const showTrailDamage = ['DAMAGE', 'TIMBER', 'COMPLIANCE'].includes(activePhase);
  const showTimberPlots = ['TIMBER', 'COMPLIANCE'].includes(activePhase);

  // Handle drag start - MUST be declared before conditional return
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      e.preventDefault();
    },
    []
  );

  // Handle drag move - MUST be declared before conditional return
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Clamp to viewport
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 100);
      setLegendPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setLegendPosition]);

  // Don't render if legend is docked (after all hooks)
  if (legendMode === 'docked') {
    return null;
  }

  // Legend item renderer
  const LegendItem: React.FC<{ label: string; color: string; shape?: 'square' | 'circle' }> = ({
    label,
    color,
    shape = 'square',
  }) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-2.5 h-2.5 ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'} border border-white/20`}
        style={{ backgroundColor: color }}
      />
      {!legendCompact && <span className="text-[11px] text-slate-300">{label}</span>}
    </div>
  );

  // Compact summary dots
  const CompactDots: React.FC<{ colors: string[] }> = ({ colors }) => (
    <div className="flex gap-1">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full border border-white/20"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`
        fixed z-50 min-w-[140px]
        bg-[#0a0f1a]/90 backdrop-blur-xl
        border border-white/10 rounded-lg shadow-2xl
        transition-shadow
        ${isDragging ? 'shadow-accent-cyan/20 cursor-grabbing' : ''}
      `}
      style={{
        left: legendPosition.x,
        top: legendPosition.y,
      }}
    >
      {/* Header with drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-between px-3 py-2
          border-b border-white/5
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-text-muted" />
          <Layers size={14} className="text-accent-cyan" />
          <span className="text-[11px] font-semibold text-white">Legend</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Compact toggle */}
          <Tooltip content={{ title: legendCompact ? 'Expand labels' : 'Compact mode', description: legendCompact ? 'Show full legend labels' : 'Show color dots only' }}>
            <button
              onClick={() => setLegendCompact(!legendCompact)}
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              {legendCompact ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
          </Tooltip>

          {/* Collapse/Expand */}
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            {legendExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Dock button */}
          <Tooltip content={{ title: 'Dock to sidebar', description: 'Return legend to sidebar' }}>
            <button
              onClick={dockLegend}
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <PanelLeftClose size={12} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Legend content */}
      {legendExpanded && (
        <div className="p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Burn Severity */}
          {showBurnSeverity && (
            <div className="space-y-1.5">
              {!legendCompact && (
                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Burn Severity {isIR && '(Thermal)'}
                </h4>
              )}
              {legendCompact ? (
                <CompactDots
                  colors={[
                    isIR ? IR_SEVERITY_COLORS.HIGH : SEVERITY_COLORS.HIGH,
                    isIR ? IR_SEVERITY_COLORS.MODERATE : SEVERITY_COLORS.MODERATE,
                    isIR ? IR_SEVERITY_COLORS.LOW : SEVERITY_COLORS.LOW,
                  ]}
                />
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  <LegendItem
                    label="High"
                    color={isIR ? IR_SEVERITY_COLORS.HIGH : SEVERITY_COLORS.HIGH}
                  />
                  <LegendItem
                    label="Moderate"
                    color={isIR ? IR_SEVERITY_COLORS.MODERATE : SEVERITY_COLORS.MODERATE}
                  />
                  <LegendItem
                    label="Low"
                    color={isIR ? IR_SEVERITY_COLORS.LOW : SEVERITY_COLORS.LOW}
                  />
                </div>
              )}
            </div>
          )}

          {/* Trail Damage */}
          {showTrailDamage && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              {!legendCompact && (
                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Infrastructure
                </h4>
              )}
              {legendCompact ? (
                <CompactDots
                  colors={[
                    DAMAGE_COLORS.BRIDGE_FAILURE,
                    DAMAGE_COLORS.DEBRIS_FLOW,
                    DAMAGE_COLORS.HAZARD_TREES,
                    DAMAGE_COLORS.TREAD_EROSION,
                  ]}
                />
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  <LegendItem label="Bridge Failure" color={DAMAGE_COLORS.BRIDGE_FAILURE} shape="circle" />
                  <LegendItem label="Debris Flow" color={DAMAGE_COLORS.DEBRIS_FLOW} shape="circle" />
                  <LegendItem label="Hazard Trees" color={DAMAGE_COLORS.HAZARD_TREES} shape="circle" />
                  <LegendItem label="Tread/Erosion" color={DAMAGE_COLORS.TREAD_EROSION} shape="circle" />
                </div>
              )}
            </div>
          )}

          {/* Timber Priority */}
          {showTimberPlots && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              {!legendCompact && (
                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Salvage Priority
                </h4>
              )}
              {legendCompact ? (
                <CompactDots
                  colors={[
                    PRIORITY_COLORS.HIGHEST,
                    PRIORITY_COLORS.HIGH,
                    PRIORITY_COLORS.MEDIUM,
                    PRIORITY_COLORS.LOW,
                  ]}
                />
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  <LegendItem label="Highest" color={PRIORITY_COLORS.HIGHEST} shape="circle" />
                  <LegendItem label="High" color={PRIORITY_COLORS.HIGH} shape="circle" />
                  <LegendItem label="Medium" color={PRIORITY_COLORS.MEDIUM} shape="circle" />
                  <LegendItem label="Low" color={PRIORITY_COLORS.LOW} shape="circle" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collapsed summary */}
      {!legendExpanded && (
        <div className="px-3 py-2 flex items-center gap-2">
          <CompactDots
            colors={[SEVERITY_COLORS.HIGH, SEVERITY_COLORS.MODERATE, SEVERITY_COLORS.LOW]}
          />
          {showTrailDamage && (
            <>
              <div className="w-px h-3 bg-white/10" />
              <CompactDots
                colors={[DAMAGE_COLORS.BRIDGE_FAILURE, DAMAGE_COLORS.HAZARD_TREES]}
              />
            </>
          )}
          {showTimberPlots && (
            <>
              <div className="w-px h-3 bg-white/10" />
              <CompactDots colors={[PRIORITY_COLORS.HIGHEST, PRIORITY_COLORS.LOW]} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingLegend;
