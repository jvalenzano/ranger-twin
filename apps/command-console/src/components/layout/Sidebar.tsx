import React from 'react';
import {
  ShieldCheck,
  Map,
  TreePine,
  ClipboardCheck,
  Check,
  type LucideIcon,
} from 'lucide-react';

interface LifecycleStep {
  id: string;
  icon: LucideIcon;
  status: 'complete' | 'pending' | 'active';
  label: string;
  active: boolean;
}

const Sidebar: React.FC = () => {
  const steps: LifecycleStep[] = [
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

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative z-10 group cursor-pointer flex flex-col items-center"
            >
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded-md border transition-all duration-500
                  ${
                    step.active
                      ? 'bg-safe/15 border-safe active-step-glow text-safe'
                      : 'bg-slate-900/40 border-white/10 text-text-muted group-hover:border-white/30 group-hover:text-slate-300'
                  }
                `}
              >
                <Icon size={20} strokeWidth={step.active ? 2.5 : 1.5} />

                {/* Checkmark badge for completed tasks */}
                {step.status === 'complete' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-safe rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                    <Check size={10} strokeWidth={3} className="text-background" />
                  </div>
                )}
              </div>
              <span
                className={`
                  mt-2 text-[8px] font-bold tracking-[0.1em] transition-colors uppercase
                  ${step.active ? 'text-safe' : 'text-text-muted group-hover:text-slate-300'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
