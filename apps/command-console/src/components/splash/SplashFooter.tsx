/**
 * SplashFooter - Footer with agency logos and attribution
 *
 * Displays source authorities and build information
 */

import React from 'react';

const SplashFooter: React.FC = () => {
  return (
    <footer className="w-full flex flex-col border-t border-slate-300/10 bg-slate-950/50 z-10 px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <span className="text-[11px] font-bold text-slate-300 border border-slate-400 px-2 py-1">
            USFS
          </span>
          <span className="text-[11px] font-bold text-slate-300 border border-slate-400 px-2 py-1">
            USGS
          </span>
          <span className="text-[11px] font-bold text-slate-300 border border-slate-400 px-2 py-1">
            NRCS
          </span>
          <span className="text-[11px] font-bold text-slate-300 border border-slate-400 px-2 py-1">
            FEMA
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          Source Authorities: Forest Service Directives · Code of Federal Regulations · MTBS · NRCS
        </div>
      </div>

      <div className="flex justify-start items-center text-[10px] font-mono text-slate-500 mt-2">
        <div>TECHTREND FEDERAL | DIGITAL TWIN INITIATIVE</div>
      </div>
    </footer>
  );
};

export default SplashFooter;
