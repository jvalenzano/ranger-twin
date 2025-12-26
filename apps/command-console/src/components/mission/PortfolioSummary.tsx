/**
 * PortfolioSummary - Status bar showing severity distribution and data freshness
 *
 * Displays:
 * - Total fire count with severity breakdown
 * - Clickable severity counts as quick filters
 * - Data freshness indicator
 * - Alert for recently updated fires
 */

import { useMemo, useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { nationalFireService } from '@/services/nationalFireService';
import { SEVERITY_DISPLAY, type NationalFire, type FireSeverity } from '@/types/mission';

interface SeverityCount {
  severity: FireSeverity;
  count: number;
  label: string;
  color: string;
}

interface PortfolioSummaryProps {
  fires: NationalFire[];
}

export function PortfolioSummary({ fires }: PortfolioSummaryProps) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get data freshness
  useEffect(() => {
    const updated = nationalFireService.getLastUpdated();
    setLastRefresh(updated);
  }, [fires]);

  // Calculate severity distribution
  const severityCounts = useMemo((): SeverityCount[] => {
    const counts: Record<FireSeverity, number> = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
    };

    fires.forEach((fire) => {
      counts[fire.severity]++;
    });

    return (['critical', 'high', 'moderate', 'low'] as FireSeverity[]).map((severity) => ({
      severity,
      count: counts[severity],
      label: SEVERITY_DISPLAY[severity].label,
      color: SEVERITY_DISPLAY[severity].color,
    }));
  }, [fires]);

  // Count fires updated in last 24h
  const recentUpdates = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return fires.filter((fire) => new Date(fire.lastUpdated) > cutoff).length;
  }, [fires]);

  // Format relative time
  const formatRelativeTime = (date: Date | null): string => {
    if (!date) return 'Unknown';
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-white/10">
      {/* Left: Summary counts */}
      <div className="flex items-center gap-3">
        {/* Total count */}
        <span className="text-xs text-slate-400">
          <span className="text-white font-semibold">{fires.length}</span> fires
        </span>

        {/* Severity breakdown */}
        <div className="flex items-center gap-2">
          {severityCounts.map(({ severity, count, label, color }) => (
            count > 0 && (
              <span
                key={severity}
                className="flex items-center gap-1 text-[11px]"
                title={`${count} ${label} severity fires`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-400">{count}</span>
              </span>
            )
          ))}
        </div>
      </div>

      {/* Right: Freshness and alerts */}
      <div className="flex items-center gap-3">
        {/* Recent updates alert */}
        {recentUpdates > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400">
            <AlertCircle size={10} />
            {recentUpdates} updated today
          </span>
        )}

        {/* Data freshness */}
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <RefreshCw size={10} />
          NIFC: {formatRelativeTime(lastRefresh)}
        </span>
      </div>
    </div>
  );
}

export default PortfolioSummary;
