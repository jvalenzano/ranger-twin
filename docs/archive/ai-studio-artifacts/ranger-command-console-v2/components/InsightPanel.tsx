import React from 'react';

const InsightPanel: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 w-[320px] glass p-5 rounded-md z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[12px] font-medium tracking-[0.1em] text-[#F8FAFC] uppercase">BURN ANALYST</span>
        </div>
        <div className="bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded text-[10px] mono font-bold border border-[#10B981]/20">
          98.4% CONF
        </div>
      </div>

      {/* Hero Metric */}
      <div className="mb-4">
        <div className="text-[48px] mono font-medium leading-none text-[#F8FAFC]">42%</div>
        <div className="text-[14px] text-[#94A3B8] font-medium mt-1">High Severity</div>
      </div>

      {/* Stats Grid (4 Supporting Stats) */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
        <div>
          <div className="text-[14px] mono text-[#F8FAFC]">127,341 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Total Analyzed</div>
        </div>
        <div>
          <div className="text-[14px] mono text-[#EF4444]">53,484 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-[#64748B]">High Severity</div>
        </div>
        <div>
          <div className="text-[14px] mono text-[#F59E0B]">39,476 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Moderate</div>
        </div>
        <div>
          <div className="text-[14px] mono text-[#10B981]">34,381 ac</div>
          <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Low/Unburned</div>
        </div>
      </div>

      {/* Horizontal Stacked Bar Chart (Clean) */}
      <div className="mb-6">
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-900/50">
          <div className="h-full bg-[#EF4444]" style={{ width: '42%' }} title="High Severity" />
          <div className="h-full bg-[#F59E0B]" style={{ width: '31%' }} title="Moderate Severity" />
          <div className="h-full bg-[#10B981]" style={{ width: '27%' }} title="Low/Unburned" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5">
        <span className="text-[11px] text-[#64748B]">Updated 2h ago • Sentinel-2 L2A</span>
      </div>
    </div>
  );
};

export default InsightPanel;