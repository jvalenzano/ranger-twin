/**
 * IncidentRail - Right sidebar showing filtered list of fires
 *
 * Features:
 * - Filter summary bar showing "X of Y fires" with active filter chips
 * - Search input
 * - Scrollable list of IncidentCards
 * - Synced with map selection/hover
 * - Watchlist filtering when in watchlist view
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, AlertTriangle, RotateCcw } from 'lucide-react';

import {
  useMissionStore,
  useSelectedFireId,
  useHoveredFireId,
  useMissionFilters,
  useStackView,
  useWatchlist,
} from '@/stores/missionStore';
import { nationalFireService } from '@/services/nationalFireService';
import { TechnicalTooltip } from '@/components/common/TechnicalTooltip';
import { IncidentCard } from './IncidentCard';
import { PortfolioSummary } from './PortfolioSummary';
import { TopEscalations } from './TopEscalations';
import {
  PHASE_DISPLAY,
  DEFAULT_MISSION_FILTERS,
  type NationalFire,
  type FirePhase,
  type USFSRegion,
} from '@/types/mission';

export function IncidentRail() {
  const filters = useMissionFilters();
  const stackView = useStackView();
  const watchlist = useWatchlist();
  const selectedFireId = useSelectedFireId();
  const hoveredFireId = useHoveredFireId();
  const {
    selectFire,
    hoverFire,
    setSearchQuery,
    enterTacticalView,
    togglePhaseFilter,
    toggleRegionFilter,
    resetFilters,
  } = useMissionStore();

  const [fires, setFires] = useState<NationalFire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Scroll to selected card when selection changes (for map->list sync)
  useEffect(() => {
    if (selectedFireId) {
      const cardElement = cardRefs.current.get(selectedFireId);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedFireId]);

  // Filter fires based on current filters and stack view
  const filteredFires = useMemo(() => {
    let result = nationalFireService.getFilteredFires(filters);

    // If in watchlist view, filter to only watched fires
    if (stackView === 'watchlist') {
      result = result.filter((fire) => watchlist.includes(fire.id));
    }

    return result;
  }, [fires, filters, stackView, watchlist]);

  // Check if any filters are active (not at default)
  const hasActiveFilters = useMemo(() => {
    const phasesNotDefault =
      filters.phases.length !== DEFAULT_MISSION_FILTERS.phases.length ||
      !filters.phases.every((p) => DEFAULT_MISSION_FILTERS.phases.includes(p));
    const regionsNotDefault =
      filters.regions.length !== DEFAULT_MISSION_FILTERS.regions.length ||
      !filters.regions.every((r) => DEFAULT_MISSION_FILTERS.regions.includes(r));
    const hasSearch = filters.searchQuery.length > 0;

    return phasesNotDefault || regionsNotDefault || hasSearch;
  }, [filters]);

  // Get active filter chips to display
  const activeFilterChips = useMemo(() => {
    const chips: { type: 'phase' | 'region'; value: string; label: string; color?: string }[] = [];

    // If not showing all phases, show which phases ARE selected
    if (filters.phases.length < 3) {
      filters.phases.forEach((phase) => {
        chips.push({
          type: 'phase',
          value: phase,
          label: PHASE_DISPLAY[phase].label,
          color: PHASE_DISPLAY[phase].color,
        });
      });
    }

    // If not showing all regions, show which regions ARE selected
    if (filters.regions.length < 6) {
      filters.regions.forEach((region) => {
        chips.push({
          type: 'region',
          value: String(region),
          label: `R${region}`,
        });
      });
    }

    return chips;
  }, [filters]);

  const allFiresCount = fires.length;

  const handleEnterTactical = (fire: NationalFire) => {
    if (fire.hasFixtures && fire.fixtureFireId) {
      enterTacticalView(fire.fixtureFireId);
    }
  };

  const handleRemoveChip = (type: 'phase' | 'region', value: string) => {
    if (type === 'phase') {
      togglePhaseFilter(value as FirePhase);
    } else if (type === 'region') {
      toggleRegionFilter(Number(value) as USFSRegion);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <TechnicalTooltip tooltipId="ui-incident-rail">
            <h2 className="text-sm font-semibold text-white">
              {stackView === 'watchlist' ? 'Watchlist' : 'Incident List'}
            </h2>
          </TechnicalTooltip>
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

      {/* Filter Summary Bar */}
      <div className="px-3 py-2 border-b border-white/10 bg-slate-800/30">
        <div className="flex items-center justify-between gap-2">
          {/* Count display */}
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing{' '}
            <span className="text-white font-medium">{filteredFires.length}</span>
            {' '}of{' '}
            <span className="text-slate-300">{allFiresCount}</span>
            {' '}fires
          </span>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeFilterChips.map((chip) => (
              <span
                key={`${chip.type}-${chip.value}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300"
                style={{
                  borderLeft: chip.color ? `2px solid ${chip.color}` : undefined,
                }}
              >
                {chip.label}
                <button
                  onClick={() => handleRemoveChip(chip.type, chip.value)}
                  className="text-slate-500 hover:text-white ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary fires={filteredFires} />

      {/* Top Escalations - fires with rising priority */}
      <TopEscalations fires={filteredFires} maxItems={5} />

      {/* Fire list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-white/5 animate-pulse"
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
            {hasActiveFilters && stackView !== 'watchlist' && (
              <button
                onClick={resetFilters}
                className="mt-3 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
              >
                Show all fires
              </button>
            )}
          </div>
        ) : (
          // Fire cards
          filteredFires.map((fire) => (
            <div
              key={fire.id}
              ref={(el) => {
                if (el) cardRefs.current.set(fire.id, el);
              }}
            >
              <IncidentCard
                fire={fire}
                isSelected={fire.id === selectedFireId}
                isHovered={fire.id === hoveredFireId}
                onSelect={() => selectFire(fire.id)}
                onHover={(hovering) => hoverFire(hovering ? fire.id : null)}
                onEnterTactical={() => handleEnterTactical(fire)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default IncidentRail;
