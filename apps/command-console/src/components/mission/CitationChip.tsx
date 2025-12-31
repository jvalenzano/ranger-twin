/**
 * CitationChip - Compact source citation badge
 *
 * Displays a color-coded citation badge. Click to open CitationPopup
 * with full details for transparency/verification.
 */

import { useState, useRef } from 'react';
import type { Citation } from '@/types/briefing';
import { CitationPopup } from './CitationPopup';

// Color mapping by source type
const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Satellite data - Blue
  'S-2': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'MTBS': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Landsat': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'satellite': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },

  // Regulations - Purple
  'FSM': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'FSH': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'NEPA': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'regulation': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },

  // Data sources - Green
  'IRWIN': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'NIFC': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'USFS': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'BLM': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'data': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },

  // Default - Gray
  'default': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

function getSourceColors(sourceType: string): { bg: string; text: string; border: string } {
  // Check exact match first
  if (SOURCE_COLORS[sourceType]) {
    return SOURCE_COLORS[sourceType]!;
  }

  // Check partial matches
  const upperType = sourceType.toUpperCase();
  for (const [key, value] of Object.entries(SOURCE_COLORS)) {
    if (upperType.includes(key.toUpperCase())) {
      return value;
    }
  }

  return SOURCE_COLORS['default']!;
}

interface CitationChipProps {
  citation: Citation;
  className?: string;
}

export function CitationChip({ citation, className = '' }: CitationChipProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const chipRef = useRef<HTMLButtonElement>(null);

  const colors = getSourceColors(citation.source_type);

  // Create display label from source type and ID
  const displayLabel = citation.source_type
    ? `[${citation.source_type}] ${citation.id}`
    : citation.id;

  return (
    <>
      <button
        ref={chipRef}
        onClick={() => setIsPopupOpen(true)}
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
          border transition-all cursor-pointer
          hover:brightness-110 active:brightness-90
          ${colors.bg} ${colors.text} ${colors.border}
          ${className}
        `}
        title={`View citation: ${displayLabel}`}
        aria-label={`View citation details for ${displayLabel}`}
      >
        <span className="truncate max-w-[120px]">{displayLabel}</span>
      </button>

      {isPopupOpen && (
        <CitationPopup
          citation={citation}
          anchorEl={chipRef.current}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}

export default CitationChip;
