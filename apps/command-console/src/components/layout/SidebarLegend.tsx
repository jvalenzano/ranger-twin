import React from 'react';
import { Layers, ChevronRight, ChevronDown } from 'lucide-react';
import { useActiveLayer, useLegendExpanded, useMapStore } from '@/stores/mapStore';
import { useLifecycleStore } from '@/stores/lifecycleStore';

// Severity color palette (normal view)
const SEVERITY_COLORS = {
    HIGH: '#EF4444',    // Red
    MODERATE: '#F59E0B', // Amber
    LOW: '#10B981',      // Green
};

// IR/Thermal color palette (heat signature style)
const IR_SEVERITY_COLORS = {
    HIGH: '#EF4444',     // Red
    MODERATE: '#F59E0B', // Amber
    LOW: '#10B981',      // Green
};

// Trail damage type colors
const DAMAGE_COLORS = {
    BRIDGE_FAILURE: '#EF4444',
    DEBRIS_FLOW: '#F97316',
    HAZARD_TREES: '#EAB308',
    TREAD_EROSION: '#F59E0B', // Amber
    SIGNAGE: '#22C55E',
};

// Timber priority colors
const PRIORITY_COLORS = {
    HIGHEST: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#EAB308',
    LOW: '#22C55E',
};

interface SidebarLegendProps {
    isExpanded: boolean;
    onExpandSidebar: () => void;
}

const SidebarLegend: React.FC<SidebarLegendProps> = ({ isExpanded, onExpandSidebar }) => {
    const activeLayer = useActiveLayer();
    const legendExpanded = useLegendExpanded();
    const setLegendExpanded = useMapStore((state) => state.setLegendExpanded);
    const { activePhase } = useLifecycleStore();
    const isIR = activeLayer === 'IR';

    const toggleLegend = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isExpanded) {
            onExpandSidebar();
            setLegendExpanded(true);
        } else {
            setLegendExpanded(!legendExpanded);
        }
    };

    // Determine visibility based on active phase
    const showBurnSeverity = true;
    const showTrailDamage = ['DAMAGE', 'TIMBER', 'COMPLIANCE'].includes(activePhase);
    const showTimberPlots = ['TIMBER', 'COMPLIANCE'].includes(activePhase);

    return (
        <div className="mt-2 border-t border-white/5">
            {/* Legend Header Item */}
            <button
                onClick={toggleLegend}
                className={`
          group relative w-full flex items-center gap-3 transition-all duration-200
          ${isExpanded ? 'py-3 px-3' : 'py-3 px-2 justify-center flex-col'}
          ${legendExpanded && isExpanded ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
        `}
                aria-expanded={legendExpanded && isExpanded}
                aria-label="Toggle Map Legend"
            >
                <div className="relative flex-shrink-0">
                    <Layers
                        size={22}
                        className={`transition-all ${legendExpanded && isExpanded ? 'text-accent-cyan' : 'text-text-muted group-hover:text-text-primary'}`}
                    />
                </div>

                {isExpanded && (
                    <>
                        <span className={`text-[12px] font-semibold flex-1 text-left ${legendExpanded ? 'text-accent-cyan' : 'text-text-muted group-hover:text-text-primary'}`}>
                            LEGEND
                        </span>
                        {legendExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
                    </>
                )}
            </button>

            {/* Expanded Legend Content */}
            {isExpanded && legendExpanded && (
                <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Burn Severity Section */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Burn Severity {isIR && '(Thermal)'}
                        </h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {[
                                { label: 'High', color: isIR ? IR_SEVERITY_COLORS.HIGH : SEVERITY_COLORS.HIGH },
                                { label: 'Moderate', color: isIR ? IR_SEVERITY_COLORS.MODERATE : SEVERITY_COLORS.MODERATE },
                                { label: 'Low', color: isIR ? IR_SEVERITY_COLORS.LOW : SEVERITY_COLORS.LOW },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-sm border border-white/10"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-[11px] text-slate-300">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trail Damage Section */}
                    {showTrailDamage && (
                        <div className="space-y-2 pt-1">
                            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Infrastructure Damage
                            </h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    { label: 'Bridge Failure', color: DAMAGE_COLORS.BRIDGE_FAILURE },
                                    { label: 'Debris Flow', color: DAMAGE_COLORS.DEBRIS_FLOW },
                                    { label: 'Hazard Trees', color: DAMAGE_COLORS.HAZARD_TREES },
                                    { label: 'Tread/Erosion', color: DAMAGE_COLORS.TREAD_EROSION },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-[11px] text-slate-300">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timber Priority Section */}
                    {showTimberPlots && (
                        <div className="space-y-2 pt-1">
                            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Salvage Priority
                            </h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    { label: 'Highest', color: PRIORITY_COLORS.HIGHEST },
                                    { label: 'High', color: PRIORITY_COLORS.HIGH },
                                    { label: 'Medium', color: PRIORITY_COLORS.MEDIUM },
                                    { label: 'Low', color: PRIORITY_COLORS.LOW },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-sm"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-[11px] text-slate-300">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SidebarLegend;
