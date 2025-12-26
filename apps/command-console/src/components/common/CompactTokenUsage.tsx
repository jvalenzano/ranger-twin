/**
 * CompactTokenUsage - Minimal token usage display for profile dropdown
 *
 * Features:
 * - Single-line summary with today's usage
 * - Traffic light status indicator (green/yellow/red)
 * - Expandable for session details
 * - Link to full usage page (future)
 * - Hides when zero usage
 *
 * Follows SaaS billing best practices (Stripe, AWS, Vercel)
 */

import { useState } from 'react';
import { Coins, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import {
    useSessionTotal,
    useTodayTotal,
    useEstimatedCost,
    useIsFreeTier,
    formatTokenCount,
    formatCost,
} from '@/stores/tokenUsageStore';

type UsageStatus = 'low' | 'moderate' | 'high';

interface UsageStatusConfig {
    color: string;
    bgColor: string;
    label: string;
    dotColor: string;
}

const USAGE_STATUS: Record<UsageStatus, UsageStatusConfig> = {
    low: {
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        label: 'Low usage',
        dotColor: 'bg-emerald-500',
    },
    moderate: {
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        label: 'Moderate',
        dotColor: 'bg-amber-500',
    },
    high: {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'High usage',
        dotColor: 'bg-red-500',
    },
};

// Determine usage status based on token count
const getUsageStatus = (tokens: number): UsageStatus => {
    if (tokens < 10000) return 'low';
    if (tokens < 50000) return 'moderate';
    return 'high';
};

export function CompactTokenUsage() {
    const [isExpanded, setIsExpanded] = useState(false);

    const sessionTotal = useSessionTotal();
    const todayTotal = useTodayTotal();
    const estimatedCost = useEstimatedCost();
    const isFreeTier = useIsFreeTier();

    // Don't show if no usage
    if (todayTotal === 0 && sessionTotal === 0) {
        return null;
    }

    const status = getUsageStatus(todayTotal);
    const statusConfig = USAGE_STATUS[status];

    return (
        <div className="border-t border-slate-700/50 py-3 px-4">
            {/* Compact Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Coins size={14} className="text-amber-400" />
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-300">
                                Tokens: <span className="font-mono text-cyan-400">{formatTokenCount(todayTotal)}</span> today
                            </span>
                            {isFreeTier && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                    FREE
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            <span className={`text-[10px] ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Details Link */}
                    <span className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100">
                        Details
                    </span>
                    {isExpanded ? (
                        <ChevronUp size={12} className="text-slate-400" />
                    ) : (
                        <ChevronDown size={12} className="text-slate-400" />
                    )}
                </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
                    {/* Session Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">This Session</span>
                        <span className="text-[10px] font-mono text-slate-300">
                            {formatTokenCount(sessionTotal)}
                        </span>
                    </div>

                    {/* Cost Estimate */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/20">
                        <span className="text-[10px] text-slate-400">Estimated Cost</span>
                        <span className={`text-[11px] font-bold ${isFreeTier ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isFreeTier ? '$0.00' : formatCost(estimatedCost)}
                        </span>
                    </div>

                    {/* Link to Full Usage Page (Future) */}
                    <button
                        className="w-full mt-2 pt-2 border-t border-slate-700/20 flex items-center justify-center gap-1.5 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={() => {
                            // TODO: Navigate to full usage page
                            console.log('Navigate to usage page');
                        }}
                    >
                        <span>View detailed usage</span>
                        <ExternalLink size={10} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default CompactTokenUsage;
