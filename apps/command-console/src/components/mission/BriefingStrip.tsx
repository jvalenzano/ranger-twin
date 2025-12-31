/**
 * BriefingStrip - Portfolio metrics bar with copy-to-clipboard briefing
 *
 * Persistent top bar that displays portfolio-level metrics and provides
 * a one-click briefing summary for the "8-minute reality".
 *
 * @example
 * <BriefingStrip onCopyBriefing={() => console.log('Copied!')} />
 */

import { useState, useMemo } from 'react';
import { Flame, BarChart3, Trees, Clock, ClipboardCopy, Check, Loader2 } from 'lucide-react';

import { useFireStatistics, useDataFreshness } from '@/hooks';
import { useNotificationStore } from '@/stores/notificationStore';
import { FieldModeToggle } from './FieldModeToggle';
import type { FirePhase } from '@/types/mission';

interface BriefingStripProps {
  /** Optional callback after briefing is copied to clipboard */
  onCopyBriefing?: () => void;
  /** Optional className for container overrides */
  className?: string;
}

/**
 * Format large numbers with K/M suffixes
 */
function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}K`;
  }
  return n.toLocaleString();
}

/**
 * Format acres with appropriate suffix
 */
function formatAcres(acres: number): string {
  if (acres >= 1_000_000) {
    return `${(acres / 1_000_000).toFixed(1)}M`;
  }
  if (acres >= 1_000) {
    return `${Math.round(acres / 1_000)}K`;
  }
  return acres.toLocaleString();
}

/**
 * Generate briefing text from metrics
 */
function generateBriefingText(
  totalFires: number,
  byPhase: Record<FirePhase, number>,
  totalAcres: number,
  lastUpdate: string
): string {
  const now = new Date();
  const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

  return [
    `National Status (${dateStr}): ${totalFires} incidents tracked.`,
    `Active: ${byPhase.active}. BAER: ${byPhase.baer_assessment} assessments, ${byPhase.baer_implementation} implementations.`,
    `${formatAcres(totalAcres)} acres affected.`,
    `Last data update: ${lastUpdate}.`,
  ].join(' ');
}

export function BriefingStrip({ onCopyBriefing, className = '' }: BriefingStripProps) {
  const { data: stats, isLoading } = useFireStatistics();
  const { formattedTime, isStale } = useDataFreshness();
  const { success: toastSuccess } = useNotificationStore();

  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Phase breakdown string: "12A | 32I | 11P | 4R"
  const phaseBreakdown = useMemo(() => {
    const parts: string[] = [];
    if (stats.byPhase.active > 0) parts.push(`${stats.byPhase.active}A`);
    if (stats.byPhase.baer_assessment > 0) parts.push(`${stats.byPhase.baer_assessment}B`);
    if (stats.byPhase.baer_implementation > 0) parts.push(`${stats.byPhase.baer_implementation}I`);
    if (stats.byPhase.in_restoration > 0) parts.push(`${stats.byPhase.in_restoration}R`);
    return parts.join(' | ') || '0 fires';
  }, [stats.byPhase]);

  // Handle copy briefing action
  const handleCopyBriefing = async () => {
    if (isCopying || copySuccess) return;

    setIsCopying(true);
    try {
      const briefingText = generateBriefingText(
        stats.total,
        stats.byPhase,
        stats.totalAcres,
        formattedTime
      );

      await navigator.clipboard.writeText(briefingText);
      setCopySuccess(true);
      toastSuccess('Briefing copied to clipboard');
      onCopyBriefing?.();

      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch {
      toastSuccess('Failed to copy briefing');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-2 h-12
        bg-slate-900/80 backdrop-blur-sm border-b border-white/10
        ${className}
      `}
      aria-live="polite"
    >
      {/* Left: Metrics */}
      <div className="flex items-center gap-6">
        {/* Active Fires */}
        <MetricChip
          icon={<Flame size={14} className="text-orange-400" />}
          primary={isLoading ? '...' : formatNumber(stats.byPhase.active)}
          label="Active"
          tooltip="Fires with active suppression"
        />

        {/* Fires by Phase */}
        <MetricChip
          icon={<BarChart3 size={14} className="text-cyan-400" />}
          primary={isLoading ? '...' : `${stats.total} fires`}
          secondary={phaseBreakdown}
          tooltip="Total fires by phase: A=Active, B=BAER Assessment, I=Implementation, R=Restoration"
        />

        {/* Total Acres */}
        <MetricChip
          icon={<Trees size={14} className="text-green-400" />}
          primary={isLoading ? '...' : formatAcres(stats.totalAcres)}
          label="acres"
          tooltip="Total acres affected across all fires"
        />

        {/* Last Update */}
        <MetricChip
          icon={<Clock size={14} className={isStale ? 'text-amber-400' : 'text-slate-400'} />}
          primary={isLoading ? '...' : formattedTime}
          tooltip={isStale ? 'Data may be stale (>15 min old)' : 'Last data refresh time'}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Field Mode Toggle */}
        <FieldModeToggle />

        {/* Copy Briefing Button */}
        <button
          onClick={handleCopyBriefing}
          disabled={isCopying || isLoading}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md
            text-[11px] font-medium transition-all
            ${copySuccess
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={copySuccess ? 'Briefing copied successfully' : 'Copy briefing summary to clipboard'}
        >
          {isCopying ? (
            <Loader2 size={12} className="animate-spin" />
          ) : copySuccess ? (
            <Check size={12} />
          ) : (
            <ClipboardCopy size={12} />
          )}
          <span className="hidden sm:inline">
            {copySuccess ? 'Copied!' : 'Copy Briefing'}
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Internal MetricChip component
 */
interface MetricChipProps {
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  label?: string;
  tooltip?: string;
}

function MetricChip({ icon, primary, secondary, label, tooltip }: MetricChipProps) {
  return (
    <div className="flex items-center gap-2" title={tooltip}>
      {icon}
      <div className="flex items-baseline gap-1">
        <span className="text-white font-semibold text-sm">{primary}</span>
        {label && <span className="text-slate-400 text-[10px]">{label}</span>}
        {secondary && (
          <span className="text-slate-500 text-[10px] ml-1">{secondary}</span>
        )}
      </div>
    </div>
  );
}

export default BriefingStrip;
