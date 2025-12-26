/**
 * FireIdentificationStep - Step 1 of the onboarding wizard
 *
 * Allows user to enter fire details: name, location, year, acres.
 * Future: Will include IRWIN search integration.
 */

import React from 'react';
import { Search, MapPin, Calendar, Layers } from 'lucide-react';

import type { FireContext } from '@/types/fire';

interface FireIdentificationStepProps {
  fireInput: Partial<FireContext>;
  onUpdate: (input: Partial<FireContext>) => void;
  onNext: () => void;
}

export const FireIdentificationStep: React.FC<FireIdentificationStepProps> = ({
  fireInput,
  onUpdate,
  onNext,
}) => {
  const handleInputChange = (field: keyof FireContext, value: string | number) => {
    onUpdate({ [field]: value });
  };

  const isValid = fireInput.name && fireInput.forest && fireInput.state && fireInput.year;

  return (
    <div className="space-y-6">
      {/* Search bar (simulated IRWIN search) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search IRWIN database for existing fires..."
          className="
            w-full pl-10 pr-4 py-3 rounded-lg
            bg-surface-elevated border border-white/10
            text-text-primary placeholder:text-slate-500
            focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
            transition-all
          "
          disabled
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 uppercase">
          Coming Soon
        </span>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-slate-500">or enter manually</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Manual entry form */}
      <div className="space-y-4">
        {/* Fire name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Fire Name *
          </label>
          <input
            type="text"
            value={fireInput.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Lionshead Fire"
            className="
              w-full px-4 py-2.5 rounded-lg
              bg-surface-elevated border border-white/10
              text-text-primary placeholder:text-slate-500
              focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
              transition-all
            "
          />
        </div>

        {/* Forest and State (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} />
              National Forest *
            </label>
            <input
              type="text"
              value={fireInput.forest || ''}
              onChange={(e) => handleInputChange('forest', e.target.value)}
              placeholder="e.g., Mt. Hood NF"
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-surface-elevated border border-white/10
                text-text-primary placeholder:text-slate-500
                focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
                transition-all
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              State *
            </label>
            <select
              value={fireInput.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-surface-elevated border border-white/10
                text-text-primary
                focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
                transition-all
              "
            >
              <option value="">Select state</option>
              <option value="AZ">Arizona</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="ID">Idaho</option>
              <option value="MT">Montana</option>
              <option value="NM">New Mexico</option>
              <option value="NV">Nevada</option>
              <option value="OR">Oregon</option>
              <option value="UT">Utah</option>
              <option value="WA">Washington</option>
              <option value="WY">Wyoming</option>
            </select>
          </div>
        </div>

        {/* Year and Acres (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} />
              Fire Year *
            </label>
            <input
              type="number"
              value={fireInput.year || ''}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
              placeholder="e.g., 2023"
              min={2000}
              max={new Date().getFullYear()}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-surface-elevated border border-white/10
                text-text-primary placeholder:text-slate-500
                focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
                transition-all
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} />
              Approximate Acres
            </label>
            <input
              type="number"
              value={fireInput.acres || ''}
              onChange={(e) => handleInputChange('acres', parseInt(e.target.value) || 0)}
              placeholder="e.g., 50000"
              min={0}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-surface-elevated border border-white/10
                text-text-primary placeholder:text-slate-500
                focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
                transition-all
              "
            />
          </div>
        </div>
      </div>

      {/* Location hint */}
      <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
        <p className="text-xs text-accent-cyan">
          <strong>Location:</strong> Click on the map behind this wizard to set the fire
          centroid, or we'll estimate from available data sources.
        </p>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!isValid}
        className={`
          w-full py-3 rounded-lg font-semibold text-sm transition-all
          ${
            isValid
              ? 'bg-accent-cyan text-slate-900 hover:bg-accent-cyan/90'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }
        `}
      >
        Check Data Availability
      </button>
    </div>
  );
};

export default FireIdentificationStep;
