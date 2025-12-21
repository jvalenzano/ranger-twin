import React from 'react';
import { ShieldCheck, Map, TreePine, ClipboardCheck, Check } from 'lucide-react';

const Sidebar: React.FC = () => {
  const steps = [
    { id: 'IMPACT', icon: ShieldCheck, status: 'complete', label: 'IMPACT', active: true },
    { id: 'DAMAGE', icon: Map, status: 'pending', label: 'DAMAGE', active: false },
    { id: 'TIMBER', icon: TreePine, status: 'pending', label: 'TIMBER', active: false },
    { id: 'COMPLIANCE', icon: ClipboardCheck, status: 'pending', label: 'COMPLIANCE', active: false },
  ];

  return (
    <aside className="w-[64px] h-full glass border-r border-white/10 z-40 flex flex-col items-center py-6">
      <div className="relative flex flex-col items-center gap-12 w-full h-full">
        {/* Background connector line */}
        <div className="absolute top-6 bottom-6 w-[1px] bg-white/5 left-1/2 -translate-x-1/2 z-0" />
        
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 group cursor-pointer flex flex-col items-center">
            <div className={`
              w-10 h-10 flex items-center justify-center rounded-md border transition-all duration-500
              ${step.active 
                ? 'bg-[#10B981]/15 border-[#10B981] active-step-glow text-[#10B981]' 
                : 'bg-slate-900/40 border-white/10 text-[#64748B] group-hover:border-white/30 group-hover:text-slate-300'
              }
            `}>
              <step.icon size={20} strokeWidth={step.active ? 2.5 : 1.5} />
              
              {/* Checkmark badge for completed tasks */}
              {step.status === 'complete' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-[#020617] shadow-lg">
                  <Check size={10} strokeWidth={3} className="text-[#020617]" />
                </div>
              )}
            </div>
            <span className={`
              mt-2 text-[8px] font-bold tracking-[0.1em] transition-colors uppercase
              ${step.active ? 'text-[#10B981]' : 'text-[#64748B] group-hover:text-slate-300'}
            `}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;