/**
 * Token Usage Store - Track LLM token consumption for stakeholder transparency
 *
 * Provides visibility into AI/LLM usage:
 * - Session tokens (resets on page refresh)
 * - Daily totals (persisted for 30 days)
 * - Monthly aggregates
 * - Cost estimates
 *
 * Architecture (ADR-006: Google-Only):
 * 1. aiBriefingService captures usage from Google Gemini responses
 * 2. This store aggregates and persists the data
 * 3. TokenUsagePanel displays in profile dropdown
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export interface TokenUsageRecord {
    id: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    timestamp: string;
    provider: string;
    query?: string; // First 50 chars for context
}

interface TokenUsageState {
    // Session-based (NOT persisted - resets on refresh)
    sessionRecords: TokenUsageRecord[];
    sessionTotal: number;

    // Persistent data (localStorage)
    dailyTotals: Record<string, number>; // 'YYYY-MM-DD' → total tokens
    monthlyTotal: number;
    lastResetDate: string; // ISO date for monthly reset check

    // Actions
    recordUsage: (record: Omit<TokenUsageRecord, 'id'>) => void;
    clearSession: () => void;
    resetMonthlyIfNeeded: () => void;
}

// ============================================
// COST ESTIMATION
// ============================================

/**
 * Google Gemini pricing (approximate)
 * Most Gemini models have generous free tiers
 * Fallback rate for production usage
 */
const COST_PER_1K_TOKENS: Record<string, number> = {
    'gemini-2.0-flash-exp': 0,        // Free tier
    'gemini-1.5-flash': 0.0001,       // If used (paid tier)
    'gemini-1.5-pro': 0.00125,        // If used (paid tier)
    default: 0.001,
};

/**
 * Default cost rate for unknown models
 */
const DEFAULT_COST_RATE = 0.001;

/**
 * Get cost per 1K tokens for a model
 */
function getCostRate(model: string): number {
    return COST_PER_1K_TOKENS[model] ?? DEFAULT_COST_RATE;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get today's date as YYYY-MM-DD
 */
function getTodayKey(): string {
    const isoDate = new Date().toISOString();
    return isoDate.split('T')[0] ?? isoDate.slice(0, 10);
}

/**
 * Get current month as YYYY-MM
 */
function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

/**
 * Generate a unique ID for a usage record
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Clean up daily totals older than 30 days
 */
function cleanupOldDailyTotals(dailyTotals: Record<string, number>): Record<string, number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffKey = cutoffDate.toISOString().slice(0, 10);

    const cleaned: Record<string, number> = {};
    for (const [date, total] of Object.entries(dailyTotals)) {
        if (date >= cutoffKey) {
            cleaned[date] = total;
        }
    }
    return cleaned;
}

// ============================================
// STORE
// ============================================

export const useTokenUsageStore = create<TokenUsageState>()(
    persist(
        (set, get) => ({
            // Session state (not persisted)
            sessionRecords: [],
            sessionTotal: 0,

            // Persistent state
            dailyTotals: {},
            monthlyTotal: 0,
            lastResetDate: getCurrentMonth(),

            /**
             * Record a new usage from an LLM call
             */
            recordUsage: (record) => {
                const id = generateId();
                const todayKey = getTodayKey();
                const currentMonth = getCurrentMonth();

                const newRecord: TokenUsageRecord = { ...record, id };

                set((state) => {
                    // Check if we need to reset monthly total
                    const needsMonthlyReset = state.lastResetDate !== currentMonth;

                    // Update daily totals
                    const updatedDailyTotals = cleanupOldDailyTotals({
                        ...state.dailyTotals,
                        [todayKey]: (state.dailyTotals[todayKey] || 0) + record.totalTokens,
                    });

                    return {
                        // Session updates
                        sessionRecords: [...state.sessionRecords, newRecord],
                        sessionTotal: state.sessionTotal + record.totalTokens,

                        // Persistent updates
                        dailyTotals: updatedDailyTotals,
                        monthlyTotal: needsMonthlyReset
                            ? record.totalTokens
                            : state.monthlyTotal + record.totalTokens,
                        lastResetDate: currentMonth,
                    };
                });
            },

            /**
             * Clear session data (typically on logout or manual reset)
             */
            clearSession: () => {
                set({
                    sessionRecords: [],
                    sessionTotal: 0,
                });
            },

            /**
             * Check and reset monthly total if needed (e.g., on app load)
             */
            resetMonthlyIfNeeded: () => {
                const currentMonth = getCurrentMonth();
                const { lastResetDate } = get();

                if (lastResetDate !== currentMonth) {
                    set({
                        monthlyTotal: 0,
                        lastResetDate: currentMonth,
                    });
                }
            },
        }),
        {
            name: 'ranger-token-usage',
            version: 1,
            // Only persist these fields (session data intentionally excluded)
            partialize: (state) => ({
                dailyTotals: state.dailyTotals,
                monthlyTotal: state.monthlyTotal,
                lastResetDate: state.lastResetDate,
            }),
        }
    )
);

// ============================================
// SELECTOR HOOKS
// ============================================

/**
 * Get total tokens used in current browser session
 */
export const useSessionTotal = () => useTokenUsageStore((state) => state.sessionTotal);

/**
 * Get all session records (for detailed breakdown)
 */
export const useSessionRecords = () => useTokenUsageStore((state) => state.sessionRecords);

/**
 * Get today's token usage
 */
export const useTodayTotal = () => {
    const dailyTotals = useTokenUsageStore((state) => state.dailyTotals);
    const todayKey = getTodayKey();
    return dailyTotals[todayKey] || 0;
};

/**
 * Get monthly token usage
 */
export const useMonthlyTotal = () => useTokenUsageStore((state) => state.monthlyTotal);

/**
 * Get estimated cost for the month
 */
export const useEstimatedCost = () => {
    const monthlyTotal = useTokenUsageStore((state) => state.monthlyTotal);
    // Use default rate for simplicity (most usage is free tier anyway)
    return (monthlyTotal / 1000) * DEFAULT_COST_RATE;
};

/**
 * Get the most recent N usage records from the session
 */
export const useRecentRecords = (limit: number = 5) => {
    const sessionRecords = useTokenUsageStore((state) => state.sessionRecords);
    return sessionRecords.slice(-limit).reverse();
};

/**
 * Check if currently using free tier (cost = $0)
 */
export const useIsFreeTier = () => {
    const sessionRecords = useTokenUsageStore((state) => state.sessionRecords);
    if (sessionRecords.length === 0) return true;

    // Check most recent model used
    const lastRecord = sessionRecords[sessionRecords.length - 1];
    if (!lastRecord) return true;
    return getCostRate(lastRecord.model) === 0;
};

/**
 * Format token count with commas (e.g., 12,450)
 */
export function formatTokenCount(count: number): string {
    return count.toLocaleString();
}

/**
 * Format cost as currency (e.g., $0.12)
 */
export function formatCost(cost: number): string {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
}
