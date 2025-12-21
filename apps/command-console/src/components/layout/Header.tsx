import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-[48px] w-full glass-header z-30 flex items-center justify-between px-8">
      {/* Left side Wordmark */}
      <div className="flex items-center pl-12">
        <span className="text-[18px] font-bold tracking-[0.05em] text-text-primary">
          RANGER
        </span>
      </div>

      {/* Center Breadcrumb */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-secondary text-[12px] font-medium tracking-wide">
        <span>Willamette NF</span>
        <ChevronRight size={14} className="opacity-40" />
        <span>Cedar Creek Fire</span>
        <ChevronRight size={14} className="opacity-40" />
        <span className="text-text-primary">Impact Analysis</span>
      </div>

      {/* Right side status/user */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe live-dot shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-safe uppercase text-[10px] font-bold tracking-widest">
            Live
          </span>
        </div>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
          <img
            src="https://picsum.photos/seed/ranger/32/32"
            alt="Avatar"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
