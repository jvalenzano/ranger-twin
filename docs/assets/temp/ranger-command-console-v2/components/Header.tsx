import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-[48px] w-full glass-header z-30 flex items-center justify-between px-8">
      {/* Left side Wordmark */}
      <div className="flex items-center pl-12">
        <span className="text-[18px] font-bold tracking-[0.05em] text-[#F8FAFC]">RANGER</span>
      </div>

      {/* Center Breadcrumb */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#94A3B8] text-[12px] font-medium tracking-wide">
        <span>Willamette NF</span>
        <ChevronRight size={14} className="opacity-40" />
        <span>Cedar Creek Fire</span>
        <ChevronRight size={14} className="opacity-40" />
        <span className="text-[#F8FAFC]">Impact Analysis</span>
      </div>

      {/* Right side status/user */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] live-dot shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[#10B981] uppercase text-[10px] font-bold tracking-widest">Live</span>
        </div>
        <button className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
          <img src="https://picsum.photos/seed/ranger/32/32" alt="Avatar" className="w-full h-full object-cover grayscale" />
        </div>
      </div>
    </header>
  );
};

export default Header;