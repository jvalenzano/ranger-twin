import React from 'react';
import { Layers, ChevronRight, ChevronDown, PanelRightOpen } from 'lucide-react';
import { useActiveLayer, useLegendExpanded, useLegendMode, useMapStore } from '@/stores/mapStore';
import { useLifecycleStore } from '@/stores/lifecycleStore';
import Tooltip from '@/components/ui/Tooltip';
import { tooltipContent } from '@/config/tooltipContent';

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
    const legendMode = useLegendMode();
    const setLegendExpanded = useMapStore((state) => state.setLegendExpanded);
    const detachLegend = useMapStore((state) => state.detachLegend);
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

    const handleDetach = (e: React.MouseEvent) => {
        e.stopPropagation();
        detachLegend();
    };

    // Determine visibility based on active phase
    const showTrailDamage = ['DAMAGE', 'TIMBER', 'COMPLIANCE'].includes(activePhase);
    const showTimberPlots = ['TIMBER', 'COMPLIANCE'].includes(activePhase);

    // Don't render if legend is floating
    if (legendMode === 'floating') {
        return null;
    }

    return (
        <div className="px-2 border-t border-white/5 pt-1">
            {/* Legend Header Item - matches workflow item styling */}
            <Tooltip content={tooltipContent.legend} position="right" className="block w-full">
                <button
                    onClick={toggleLegend}
                    className={`
                        group relative w-full flex items-center rounded-r-lg transition-all duration-200
                        ${isExpanded ? 'py-3 px-3 gap-3' : 'py-2 px-2 gap-0.5 justify-center flex-col'}
                        ${legendExpanded && isExpanded ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                    `}
                    style={{
                        borderLeft: `3px solid ${legendExpanded && isExpanded ? '#22d3ee' : 'transparent'}`,
                    }}
                    aria-expanded={legendExpanded && isExpanded}
                    aria-label="Toggle Map Legend"
                >
                    <div className="relative flex-shrink-0">
                        <Layers
                            size={26}
                            strokeWidth={legendExpanded && isExpanded ? 2.5 : 1.5}
                            className={`transition-all ${legendExpanded && isExpanded ? 'text-accent-cyan' : 'text-text-muted opacity-60 group-hover:opacity-100'}`}
                        />
                    </div>

                    {isExpanded && (
                        <>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[12px] font-semibold transition-colors ${legendExpanded ? 'text-accent-cyan' : ''}`}>
                                        Legend
                                    </span>
                                </div>
                                <span className="text-[10px] text-text-muted block truncate">
                                    Map layer key
                                </span>
                            </div>
                            {/* Detach button */}
                            <Tooltip content={{ title: 'Float legend', description: 'Detach legend to drag over map' }} position="top">
                                <button
                                    onClick={handleDetach}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-text-muted hover:text-accent-cyan transition-all flex-shrink-0"
                                >
                                    <PanelRightOpen size={12} />
                                </button>
                            </Tooltip>
                            {/* Action chevron - matches workflow items */}
                            {legendExpanded ? (
                                <ChevronDown
                                    size={14}
                                    className="text-text-muted flex-shrink-0"
                                    style={{ color: '#22d3ee', opacity: 0.6 }}
                                />
                            ) : (
                                <ChevronRight
                                    size={14}
                                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                            )}
                        </>
                    )}

                    {/* Label (collapsed mode) - matches workflow collapsed style */}
                    {!isExpanded && (
                        <span
                            className={`text-[8px] font-bold tracking-wider uppercase transition-all group-hover:opacity-100 ${
                                legendExpanded ? 'text-accent-cyan opacity-100' : 'text-text-muted opacity-60'
                            }`}
                        >
                            KEY
                        </span>
                    )}
                </button>
            </Tooltip>

            {/* Expanded Legend Content */}
            {isExpanded && legendExpanded && (
                <div className="ml-3 pl-3 py-3 border-l-[3px] border-accent-cyan/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

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
