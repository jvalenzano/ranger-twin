/**
 * TokenUsagePanel - Display LLM token usage in profile dropdown
 *
 * Shows stakeholders:
 * - Session token count (resets on page refresh)
 * - Today's token count (persisted)
 * - Estimated cost
 * - Recent calls breakdown (expandable)
 *
 * Integrates with tokenUsageStore for data and aiBriefingService for capture.
 */

import { useState } from 'react';
import { Coins, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import {
    useSessionTotal,
    useTodayTotal,
    useMonthlyTotal,
    useEstimatedCost,
    useRecentRecords,
    useIsFreeTier,
    formatTokenCount,
    formatCost,
} from '@/stores/tokenUsageStore';

export function TokenUsagePanel() {
    const [isExpanded, setIsExpanded] = useState(false);

    const sessionTotal = useSessionTotal();
    const todayTotal = useTodayTotal();
    const monthlyTotal = useMonthlyTotal();
    const estimatedCost = useEstimatedCost();
    const recentRecords = useRecentRecords(5);
    const isFreeTier = useIsFreeTier();

    return (
        <div className="border-t border-slate-700/50 py-3 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Coins size={14} className="text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Token Usage
                    </span>
                </div>
                {isFreeTier && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                        FREE TIER
                    </span>
                )}
            </div>

            {/* Main Metrics */}
            <div className="space-y-2">
                {/* Session Total */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">This Session</span>
                    <span className="text-[11px] font-mono text-cyan-400">
                        {formatTokenCount(sessionTotal)}
                    </span>
                </div>

                {/* Today Total */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">Today</span>
                    <span className="text-[11px] font-mono text-cyan-400">
                        {formatTokenCount(todayTotal)}
                    </span>
                </div>

                {/* Monthly Total (collapsed) */}
                <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px]">This Month</span>
                    <span className="text-[10px] font-mono">
                        {formatTokenCount(monthlyTotal)}
                    </span>
                </div>
            </div>

            {/* Cost Estimate */}
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Estimated Cost</span>
                <span className={`text-[11px] font-bold ${isFreeTier ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isFreeTier ? '$0.00 (free)' : formatCost(estimatedCost)}
                </span>
            </div>

            {/* Expandable Recent Calls */}
            {sessionTotal > 0 && (
                <div className="mt-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp size={12} />
                        ) : (
                            <ChevronDown size={12} />
                        )}
                        {isExpanded ? 'Hide' : 'Show'} recent calls
                    </button>

                    {isExpanded && recentRecords.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                            {recentRecords.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-start gap-2 text-[9px] p-1.5 bg-slate-900/50 rounded"
                                >
                                    <Zap size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-400 truncate">
                                                {record.query || 'Query'}
                                            </span>
                                            <span className="font-mono text-cyan-400 flex-shrink-0">
                                                {formatTokenCount(record.totalTokens)}
                                            </span>
                                        </div>
                                        <div className="text-slate-600 mt-0.5">
                                            {record.model.split('/').pop()?.replace(':free', '')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Zero State */}
            {sessionTotal === 0 && (
                <div className="mt-2 text-[10px] text-slate-500 italic">
                    No LLM calls this session
                </div>
            )}
        </div>
    );
}

export default TokenUsagePanel;
