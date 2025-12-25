/**
 * IncidentRail - Right sidebar showing filtered list of fires
 *
 * Features:
 * - Search input
 * - Scrollable list of IncidentCards
 * - Synced with map selection/hover
 * - Watchlist filtering when in watchlist view
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Flame, AlertTriangle } from 'lucide-react';

import {
  useMissionStore,
  useSelectedFireId,
  useHoveredFireId,
  useMissionFilters,
  useStackView,
  useWatchlist,
} from '@/stores/missionStore';
import { nationalFireService } from '@/services/nationalFireService';
import { IncidentCard } from './IncidentCard';
import type { NationalFire } from '@/types/mission';

export function IncidentRail() {
  const filters = useMissionFilters();
  const stackView = useStackView();
  const watchlist = useWatchlist();
  const selectedFireId = useSelectedFireId();
  const hoveredFireId = useHoveredFireId();
  const { selectFire, hoverFire, setSearchQuery, enterTacticalView } = useMissionStore();

  const [fires, setFires] = useState<NationalFire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load fires on mount
  useEffect(() => {
    async function loadFires() {
      setIsLoading(true);
      await nationalFireService.initialize();
      setFires(nationalFireService.getAllFires());
      setIsLoading(false);
    }
    loadFires();
  }, []);

  // Filter fires based on current filters and stack view
  const filteredFires = useMemo(() => {
    let result = nationalFireService.getFilteredFires(filters);

    // If in watchlist view, filter to only watched fires
    if (stackView === 'watchlist') {
      result = result.filter((fire) => watchlist.includes(fire.id));
    }

    return result;
  }, [fires, filters, stackView, watchlist]);

  // Stats
  const totalAcres = filteredFires.reduce((sum, f) => sum + f.acres, 0);

  const handleEnterTactical = (fire: NationalFire) => {
    if (fire.hasFixtures && fire.fixtureFireId) {
      enterTacticalView(fire.fixtureFireId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">
            {stackView === 'watchlist' ? 'Watchlist' : 'Incident List'}
          </h2>
          <span className="text-xs text-slate-400">
            {filteredFires.length} fires
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fires..."
            className="w-full pl-8 pr-8 py-1.5 rounded bg-slate-800/50 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Flame size={12} className="text-orange-400" />
          <span>{(totalAcres / 1000000).toFixed(2)}M total acres</span>
        </div>
      </div>

      {/* Fire list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredFires.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertTriangle size={32} className="text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">
              {stackView === 'watchlist'
                ? 'No fires in your watchlist'
                : 'No fires match your filters'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stackView === 'watchlist'
                ? 'Star fires to add them here'
                : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          // Fire cards
          filteredFires.map((fire) => (
            <IncidentCard
              key={fire.id}
              fire={fire}
              isSelected={fire.id === selectedFireId}
              isHovered={fire.id === hoveredFireId}
              onSelect={() => selectFire(fire.id)}
              onHover={(hovering) => hoverFire(hovering ? fire.id : null)}
              onEnterTactical={() => handleEnterTactical(fire)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default IncidentRail;
