/**
 * DataAvailabilityStep - Step 2 of the onboarding wizard
 *
 * Shows simulated data source availability check with animations.
 * Displays which data sources are available for the fire.
 */

import React, { useEffect, useState } from 'react';
import { Check, AlertTriangle, X, Loader2, Database, Satellite, Map, Trees } from 'lucide-react';

import type { FireContext } from '@/types/fire';

interface DataSource {
  id: keyof FireContext['data_status'];
  name: string;
  source: string;
  icon: React.ReactNode;
  description: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'perimeter',
    name: 'Fire Perimeter',
    source: 'NIFC / IRWIN',
    icon: <Map size={18} />,
    description: 'Fire boundary polygons from national incident data',
  },
  {
    id: 'burn_severity',
    name: 'Burn Severity',
    source: 'MTBS / RAVG',
    icon: <Satellite size={18} />,
    description: 'Satellite-derived burn severity classification',
  },
  {
    id: 'trail_damage',
    name: 'Trail Network',
    source: 'TRACS',
    icon: <Database size={18} />,
    description: 'Trail infrastructure and damage assessments',
  },
  {
    id: 'timber_plots',
    name: 'Timber Plots',
    source: 'FSVeg / FIA',
    icon: <Trees size={18} />,
    description: 'Forest inventory and vegetation data',
  },
];

interface DataSourceRowProps {
  source: DataSource;
  status: 'checking' | 'available' | 'partial' | 'unavailable';
  coverage?: number;
  delay: number;
}

const DataSourceRow: React.FC<DataSourceRowProps> = ({ source, status, coverage, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-white/5">
        <div className="w-8 h-8 rounded-lg bg-slate-700 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-800 rounded mt-1 animate-pulse" />
        </div>
      </div>
    );
  }

  const statusConfig = {
    checking: {
      icon: <Loader2 size={16} className="animate-spin text-accent-cyan" />,
      badge: 'Checking...',
      badgeClass: 'bg-accent-cyan/20 text-accent-cyan',
      borderClass: 'border-accent-cyan/20',
    },
    available: {
      icon: <Check size={16} className="text-safe" />,
      badge: 'Available',
      badgeClass: 'bg-safe/20 text-safe',
      borderClass: 'border-safe/30',
    },
    partial: {
      icon: <AlertTriangle size={16} className="text-warning" />,
      badge: coverage ? `${Math.round(coverage * 100)}% Coverage` : 'Partial',
      badgeClass: 'bg-warning/20 text-warning',
      borderClass: 'border-warning/30',
    },
    unavailable: {
      icon: <X size={16} className="text-severe" />,
      badge: 'Not Available',
      badgeClass: 'bg-severe/20 text-severe',
      borderClass: 'border-severe/30',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg bg-surface border transition-all duration-300
        ${config.borderClass}
        animate-in slide-in-from-left-4 fade-in duration-300
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-slate-400">
        {source.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-text-primary">{source.name}</span>
          <span className="text-[10px] text-slate-500 uppercase">{source.source}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{source.description}</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${config.badgeClass}`}>
          {config.badge}
        </span>
        {config.icon}
      </div>
    </div>
  );
};

interface DataAvailabilityStepProps {
  fireInput: Partial<FireContext>;
  onUpdate: (input: Partial<FireContext>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DataAvailabilityStep: React.FC<DataAvailabilityStepProps> = ({
  fireInput,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [checkPhase, setCheckPhase] = useState<'checking' | 'complete'>('checking');
  const [sourceStatuses, setSourceStatuses] = useState<
    Record<string, { status: 'checking' | 'available' | 'partial' | 'unavailable'; coverage?: number }>
  >({
    perimeter: { status: 'checking' },
    burn_severity: { status: 'checking' },
    trail_damage: { status: 'checking' },
    timber_plots: { status: 'checking' },
  });

  // Simulate data availability check
  useEffect(() => {
    const checkTimings: { id: string; delay: number; result: { status: 'available' | 'partial' | 'unavailable'; coverage?: number } }[] = [
      { id: 'perimeter', delay: 800, result: { status: 'available' } },
      { id: 'burn_severity', delay: 1600, result: { status: 'available' } },
      { id: 'trail_damage', delay: 2400, result: { status: 'partial', coverage: 0.75 } },
      { id: 'timber_plots', delay: 3200, result: { status: 'partial', coverage: 0.6 } },
    ];

    checkTimings.forEach(({ id, delay, result }) => {
      setTimeout(() => {
        setSourceStatuses((prev) => ({
          ...prev,
          [id]: result,
        }));
      }, delay);
    });

    // Mark complete
    setTimeout(() => {
      setCheckPhase('complete');

      // Update fireInput with simulated data status
      const dataStatus: FireContext['data_status'] = {
        perimeter: { available: true, source: 'NIFC' },
        burn_severity: { available: true, source: 'MTBS' },
        trail_damage: { available: true, source: 'TRACS', coverage: 0.75 },
        timber_plots: { available: true, source: 'FSVeg', coverage: 0.6 },
      };
      onUpdate({ data_status: dataStatus });
    }, 3500);
  }, [onUpdate]);

  const availableCount = Object.values(sourceStatuses).filter(
    (s) => s.status === 'available' || s.status === 'partial'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary">
          Checking Data Sources for{' '}
          <span className="text-accent-cyan">{fireInput.name || 'New Fire'}</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Querying federal databases for available data...
        </p>
      </div>

      {/* Data source list */}
      <div className="space-y-2">
        {DATA_SOURCES.map((source, index) => (
          <DataSourceRow
            key={source.id}
            source={source}
            status={sourceStatuses[source.id]?.status || 'checking'}
            coverage={sourceStatuses[source.id]?.coverage}
            delay={index * 400}
          />
        ))}
      </div>

      {/* Summary */}
      {checkPhase === 'complete' && (
        <div
          className="p-4 rounded-lg bg-safe/10 border border-safe/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center gap-2">
            <Check size={18} className="text-safe" />
            <span className="font-medium text-safe">
              {availableCount} of {DATA_SOURCES.length} data sources available
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 ml-6">
            RANGER agents will work with available data and estimate missing coverage.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="
            flex-1 py-3 rounded-lg font-medium text-sm
            bg-surface-elevated text-text-secondary border border-white/10
            hover:bg-white/5 transition-all
          "
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={checkPhase !== 'complete'}
          className={`
            flex-1 py-3 rounded-lg font-semibold text-sm transition-all
            ${
              checkPhase === 'complete'
                ? 'bg-accent-cyan text-slate-900 hover:bg-accent-cyan/90'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {checkPhase === 'complete' ? 'Start Agent Analysis' : 'Checking...'}
        </button>
      </div>
    </div>
  );
};

export default DataAvailabilityStep;
