/**
 * SplashHeader - Top banner for splash screen
 *
 * Displays RANGER branding, subtitle, and system status
 */

import React from 'react';

const SplashHeader: React.FC = () => {
  // Get current UTC timestamp
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <header className="w-full flex justify-between items-center px-8 py-6 border-b border-slate-300/10 z-10 bg-slate-950/50 backdrop-blur-md">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold tracking-tighter text-teal-400 font-mono">
          RANGER
        </h1>
      </div>

      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
        <span className="hidden md:inline">USFS Region 6 | Phase 0 Demo</span>
        <span className="hidden lg:inline text-slate-600">·</span>
        <span className="hidden md:inline">{timestamp}</span>
        <span className="flex items-center gap-2 px-2 py-1 bg-slate-900 border border-teal-400/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          <span className="text-teal-400">SYSTEM STATUS: ACTIVE</span>
        </span>
      </div>
    </header>
  );
};

export default SplashHeader;
