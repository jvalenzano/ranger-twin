import React from 'react';

const InsightPanel: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 w-[320px] glass p-5 rounded-md z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe" />
          <span className="text-[12px] font-medium tracking-[0.1em] text-text-primary uppercase">
            BURN ANALYST
          </span>
        </div>
        <div className="bg-safe/10 text-safe px-1.5 py-0.5 rounded text-[10px] mono font-bold border border-safe/20">
          98.4% CONF
        </div>
      </div>

      {/* Hero Metric */}
      <div className="mb-4">
        <div className="text-[48px] mono font-medium leading-none text-text-primary">
          42%
        </div>
        <div className="text-[14px] text-text-secondary font-medium mt-1">
          High Severity
        </div>
      </div>

      {/* Stats Grid (4 Supporting Stats) */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
        <div>
          <div className="text-[14px] mono text-text-primary">127,341 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Total Analyzed
          </div>
        </div>
        <div>
          <div className="text-[14px] mono text-severe">53,484 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            High Severity
          </div>
        </div>
        <div>
          <div className="text-[14px] mono text-warning">39,476 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Moderate
          </div>
        </div>
        <div>
          <div className="text-[14px] mono text-safe">34,381 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Low/Unburned
          </div>
        </div>
      </div>

      {/* Horizontal Stacked Bar Chart (Clean) */}
      <div className="mb-6">
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-900/50">
          <div
            className="h-full bg-severe"
            style={{ width: '42%' }}
            title="High Severity"
          />
          <div
            className="h-full bg-warning"
            style={{ width: '31%' }}
            title="Moderate Severity"
          />
          <div
            className="h-full bg-safe"
            style={{ width: '27%' }}
            title="Low/Unburned"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5">
        <span className="text-[11px] text-text-muted">
          Updated 2h ago - Sentinel-2 L2A
        </span>
      </div>
    </div>
  );
};

export default InsightPanel;
