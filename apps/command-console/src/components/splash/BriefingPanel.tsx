/**
 * BriefingPanel - Left panel with boot sequence and briefing cards
 *
 * Features:
 * - 2-second boot animation with 4 steps
 * - Staggered fade-in of 5 briefing cards
 * - CTA button to enter command console
 */

import React, { useState, useEffect } from 'react';
import BriefingCard from './BriefingCard';
import { BRIEFING_DATA } from './constants';

const BriefingPanel: React.FC = () => {
  const [bootStep, setBootStep] = useState(0);
  const [showBriefing, setShowBriefing] = useState(false);

  // Boot sequence: 4 steps over 2 seconds
  useEffect(() => {
    const timers = [
      setTimeout(() => setBootStep(1), 500),
      setTimeout(() => setBootStep(2), 1000),
      setTimeout(() => setBootStep(3), 1500),
      setTimeout(() => {
        setBootStep(4);
        setShowBriefing(true);
      }, 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnterConsole = () => {
    // Navigate to /console route, which triggers HTTP Basic Auth
    window.location.href = '/console';
  };

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 bg-slate-800/30 backdrop-blur-3xl border border-slate-300/10 rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Briefing Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
          0600 · CEDAR CREEK FIRE · RECOVERY BRIEFING
        </h2>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          127,000 ACRES · DISTRICT RANGER: SARAH M. · WILLAMETTE NATIONAL FOREST
        </p>
      </div>

      {/* Boot Sequence or Briefing Cards */}
      <div className="flex flex-col gap-3 mt-4 flex-grow relative">
        {/* Boot Sequence Overlay */}
        {!showBriefing && (
          <div className="absolute inset-0 flex flex-col gap-2 font-mono text-[11px] text-teal-400/70 p-4 bg-slate-900/40 rounded-lg border border-slate-700/50">
            <div
              className={`transition-opacity duration-300 ${
                bootStep >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              [0.5s] RANGER System Online...
            </div>
            <div
              className={`transition-opacity duration-300 ${
                bootStep >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              [1.0s] Connecting to Cedar Creek data sources...
            </div>
            <div
              className={`transition-opacity duration-300 ${
                bootStep >= 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              [1.5s] Contextualizing 14 cross-agency feeds...
            </div>
            <div
              className={`transition-opacity duration-300 ${
                bootStep >= 4 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              [2.0s] Briefing generated. Finalizing reasoning chain.
            </div>
          </div>
        )}

        {/* Briefing Cards (shown after boot) */}
        {showBriefing &&
          BRIEFING_DATA.map((item) => <BriefingCard key={item.id} item={item} />)}
      </div>

      {/* CTA Button */}
      <div className="mt-4 flex flex-col gap-6">
        <button
          onClick={handleEnterConsole}
          disabled={!showBriefing}
          className={`group relative w-full py-3 px-5 font-mono font-bold text-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider overflow-hidden ${
            showBriefing
              ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] border border-teal-500/60 hover:shadow-[0_6px_20px_rgba(45,212,191,0.4),0_0_40px_rgba(45,212,191,0.2),inset_0_-1px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-teal-400 hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)]'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
          }`}
        >
          {/* Shimmer effect on hover */}
          {showBriefing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-[shimmer_2s_ease-in-out_infinite]"
                 style={{ backgroundSize: '200% 100%' }} />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {showBriefing ? (
              <>
                <span className="text-base">→</span>
                <span>ENTER COMMAND CONSOLE</span>
              </>
            ) : (
              'INITIALIZING...'
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default BriefingPanel;
