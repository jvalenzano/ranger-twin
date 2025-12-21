
import React from 'react';

const Attribution: React.FC = () => {
  return (
    <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
      {/* Scale Bar */}
      <div className="flex flex-col gap-1">
        <div className="w-[100px] h-1 border-x border-b border-white/30 flex justify-between">
          <div className="h-full w-0.5 bg-white/30" />
          <div className="h-full w-0.5 bg-white/30" />
          <div className="h-full w-0.5 bg-white/30" />
        </div>
        <div className="text-[10px] mono text-[#64748B]">5 mi</div>
      </div>
      
      {/* Meta Text */}
      <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium">
        Imagery: Sentinel-2 • Elevation: 3DEP
      </div>
    </div>
  );
};

export default Attribution;
