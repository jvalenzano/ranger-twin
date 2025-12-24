import React from 'react';
import { getChipsForFeatureType, type FeatureType } from '@/config/siteAnalysisChips';

interface QuickQueryChipsProps {
    featureType: FeatureType;
    selectedIds: string[];
    onToggle: (chipId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    safety: 'border-red-500/30 bg-red-500/10 text-red-400',
    history: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    compliance: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    logistics: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    environmental: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

const CATEGORY_SELECTED_COLORS: Record<string, string> = {
    safety: 'border-red-500 bg-red-500/30 text-red-300',
    history: 'border-blue-500 bg-blue-500/30 text-blue-300',
    compliance: 'border-purple-500 bg-purple-500/30 text-purple-300',
    logistics: 'border-amber-500 bg-amber-500/30 text-amber-300',
    environmental: 'border-emerald-500 bg-emerald-500/30 text-emerald-300',
};

export const QuickQueryChips: React.FC<QuickQueryChipsProps> = ({
    featureType,
    selectedIds,
    onToggle,
}) => {
    const chips = getChipsForFeatureType(featureType);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan">
                    Quick Queries
                </label>
                <span className="text-[9px] text-text-muted">
                    {selectedIds.length} selected
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {chips.map((chip) => {
                    const isSelected = selectedIds.includes(chip.id);
                    const colorClass = isSelected
                        ? CATEGORY_SELECTED_COLORS[chip.category]
                        : CATEGORY_COLORS[chip.category];

                    return (
                        <button
                            key={chip.id}
                            onClick={() => onToggle(chip.id)}
                            title={chip.description}
                            className={`
                px-3 py-2.5 rounded-lg border text-[11px] font-medium
                transition-all duration-150 text-left min-h-[44px]
                ${colorClass}
                ${isSelected ? 'ring-1 ring-white/20' : 'hover:border-white/30'}
              `}
                        >
                            {chip.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickQueryChips;
