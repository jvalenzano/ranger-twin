/**
 * CitationChip - Specialized tactical chip for data source attribution
 * 
 * Displays icons and abbreviated labels for authoritative sources
 * like Sentinel-2 [S-2], MTBS [FSM], and IRWIN.
 */

import React from 'react';
import { Database, Satellite, Zap, FileText } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface CitationChipProps {
    sourceType: string;
    sourceId: string;
    excerpt?: string;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
    'S-2': {
        label: 'S-2',
        icon: <Satellite size={10} />,
        color: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
        description: 'Sentinel-2 Satellite Imagery'
    },
    'SENTINEL': {
        label: 'S-2',
        icon: <Satellite size={10} />,
        color: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
        description: 'Sentinel-2 Satellite Imagery'
    },
    'MTBS': {
        label: 'FSM',
        icon: <Zap size={10} />,
        color: 'bg-severe/20 text-severe border-severe/30',
        description: 'Fire Swath Mapping (MTBS)'
    },
    'FSM': {
        label: 'FSM',
        icon: <Zap size={10} />,
        color: 'bg-severe/20 text-severe border-severe/30',
        description: 'Fire Swath Mapping (MTBS)'
    },
    'IRWIN': {
        label: 'IRWIN',
        icon: <Zap size={10} />,
        color: 'bg-warning/20 text-warning border-warning/30',
        description: 'Integrated Reporting of Wildland-Fire Information'
    },
    'RANGER': {
        label: 'RGR',
        icon: <Database size={10} />,
        color: 'bg-safe/20 text-safe border-safe/30',
        description: 'RANGER Knowledge Base'
    },
    'INTERNAL': {
        label: 'RGR',
        icon: <Database size={10} />,
        color: 'bg-safe/20 text-safe border-safe/30',
        description: 'RANGER Internal Data'
    }
};

const DEFAULT_CONFIG = {
    label: 'DOC',
    icon: <FileText size={10} />,
    color: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    description: 'Data Source'
};

export const CitationChip: React.FC<CitationChipProps> = ({ sourceType, sourceId, excerpt }) => {
    const normalizedType = sourceType.toUpperCase();
    const config = SOURCE_CONFIG[normalizedType] || DEFAULT_CONFIG;

    return (
        <Tooltip
            content={{
                title: `${config.description}: ${sourceId}`,
                description: excerpt || 'Direct citation from source material.',
                tip: 'Click to view source (Phase 5)'
            }}
        >
            <div className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded border
        text-[10px] font-bold uppercase tracking-tighter
        ${config.color} cursor-help transition-all hover:brightness-110
      `}>
                {config.icon}
                <span>[{config.label}]</span>
            </div>
        </Tooltip>
    );
};

export default CitationChip;
