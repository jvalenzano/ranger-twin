/**
 * FireInfoPopup - "Fire at a Glance" popup card
 *
 * Glassmorphic popup appearing next to selected fire marker with:
 * - Fire name & location header
 * - Satellite preview thumbnail (MapTiler Static API)
 * - Key stats: Acres, Containment %, Severity, Phase
 * - Triage score indicator
 * - Quick actions: Star/Unstar, Enter Tactical View
 */

import { useState, useEffect } from 'react';
import { Star, ArrowRight, Flame, Target, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

import type { NationalFire } from '@/types/mission';
import { SEVERITY_DISPLAY, PHASE_DISPLAY } from '@/types/mission';
import { useMissionStore, useIsFireWatched } from '@/stores/missionStore';
import { getAdaptiveFirePreviewUrl } from '@/utils/firePreviewService';

interface FireInfoPopupProps {
  fire: NationalFire;
  onClose?: () => void;
}

/**
 * Format acres with K/M suffix
 */
function formatAcres(acres: number): string {
  if (acres >= 1000000) {
    return `${(acres / 1000000).toFixed(1)}M`;
  }
  if (acres >= 1000) {
    return `${(acres / 1000).toFixed(0)}K`;
  }
  return acres.toLocaleString();
}

/**
 * Get severity label with proper casing
 */
function getSeverityLabel(severity: NationalFire['severity']): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

// =============================================================================
// External Link Generators
// =============================================================================
// Philosophy: RANGER is the "nerve center, not the sensors." We link to
// authoritative external tools rather than building our own visualizations.

/**
 * NASA FIRMS deep link - Satellite fire detections
 * Pattern: https://firms.modaps.eosdis.nasa.gov/usfs/map/#d:24hrs;@{lon},{lat},{zoom}z
 */
function getNasaFirmsUrl(fire: NationalFire): string {
  const [lon, lat] = fire.coordinates;
  // Adaptive zoom: larger fires need wider view
  const zoom = fire.acres > 100000 ? 8 : fire.acres > 10000 ? 9 : 10;
  return `https://firms.modaps.eosdis.nasa.gov/usfs/map/#d:24hrs;@${lon.toFixed(4)},${lat.toFixed(4)},${zoom}.0z`;
}

/**
 * InciWeb search link - Official incident information
 * Pattern: https://inciweb.wildfire.gov/?q={fire_name}
 */
function getInciWebUrl(fire: NationalFire): string {
  // Remove common suffixes like "Fire" for better search results
  const searchName = fire.name.replace(/\s+(Fire|Incident|Complex)$/i, '').trim();
  return `https://inciweb.wildfire.gov/?q=${encodeURIComponent(searchName)}`;
}

/**
 * NIFC situational report link - National fire perimeters
 * Opens the NIFC data portal filtered to current fire season
 */
function getNifcUrl(): string {
  return 'https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-current-interagency-fire-perimeters/explore';
}

/**
 * MTBS viewer link - Historical burn severity data
 * Note: MTBS viewer is a general portal; direct fire-specific linking not available
 */
function getMtbsUrl(_fire: NationalFire): string {
  return 'https://www.mtbs.gov/viewer/index.html';
}

/**
 * Satellite Preview Image component with loading state
 */
function SatellitePreview({ fire }: { fire: NationalFire }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUrl = getAdaptiveFirePreviewUrl(fire);

  if (!imageUrl) {
    return (
      <div className="w-full h-[120px] bg-slate-800/50 rounded flex items-center justify-center">
        <span className="text-xs text-slate-500">Preview unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[120px] bg-slate-800/50 rounded overflow-hidden">
      {/* Loading skeleton */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80">
          <Flame className="w-8 h-8 text-slate-600 mb-1" />
          <span className="text-[10px] text-slate-500">Image unavailable</span>
        </div>
      )}

      {/* Satellite image */}
      <img
        src={imageUrl}
        alt={`Satellite view of ${fire.name}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {/* Coordinates overlay */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-mono text-slate-300">
        {fire.coordinates[1].toFixed(3)}, {fire.coordinates[0].toFixed(3)}
      </div>
    </div>
  );
}

/**
 * Main FireInfoPopup component
 */
export function FireInfoPopup({ fire, onClose }: FireInfoPopupProps) {
  const { toggleWatchlist, enterTacticalView } = useMissionStore();
  const isWatched = useIsFireWatched(fire.id);
  const [animateIn, setAnimateIn] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const severityColor = SEVERITY_DISPLAY[fire.severity].color;
  const canEnterTactical = fire.hasFixtures;

  const handleEnterTactical = () => {
    if (canEnterTactical) {
      enterTacticalView(fire.id);
      onClose?.();
    }
  };

  const handleToggleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(fire.id);
  };

  return (
    <div
      className={`
        fire-info-popup-content w-[280px]
        bg-[#0f111a]/95 backdrop-blur-md
        border border-white/10 rounded-lg
        shadow-xl shadow-black/50
        transition-all duration-200
        ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm truncate pr-2">
            {fire.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {fire.state} &bull; Region {fire.region} &bull; {PHASE_DISPLAY[fire.phase].label}
          </p>
        </div>

        {/* Star button */}
        <button
          onClick={handleToggleWatch}
          className={`
            p-1.5 rounded-full transition-all
            ${isWatched
              ? 'text-amber-400 bg-amber-400/20 hover:bg-amber-400/30'
              : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
            }
          `}
          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Satellite Preview */}
      <div className="p-3 border-b border-white/10">
        <SatellitePreview fire={fire} />
      </div>

      {/* Stats Grid */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/10">
        {/* Acres */}
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <div>
            <div className="text-xs text-slate-400">Acres</div>
            <div className="text-sm font-semibold text-white">
              {formatAcres(fire.acres)}
            </div>
          </div>
        </div>

        {/* Containment */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                borderColor: fire.containment >= 80 ? '#22c55e' : fire.containment >= 50 ? '#eab308' : '#ef4444',
                background: `conic-gradient(${fire.containment >= 80 ? '#22c55e' : fire.containment >= 50 ? '#eab308' : '#ef4444'} ${fire.containment}%, transparent 0)`
              }}
            />
          </div>
          <div>
            <div className="text-xs text-slate-400">Contained</div>
            <div className="text-sm font-semibold text-white">
              {fire.containment}%
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: severityColor }} />
          <div>
            <div className="text-xs text-slate-400">Severity</div>
            <div className="text-sm font-semibold" style={{ color: severityColor }}>
              {getSeverityLabel(fire.severity)}
            </div>
          </div>
        </div>

        {/* Triage Score */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs text-slate-400">Triage</div>
            <div className="text-sm font-semibold text-cyan-400">
              {fire.triageScore.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleEnterTactical}
          disabled={!canEnterTactical}
          className={`
            w-full py-2 px-3 rounded-md text-sm font-semibold
            flex items-center justify-center gap-2
            transition-all
            ${canEnterTactical
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
              : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }
          `}
        >
          {canEnterTactical ? (
            <>
              Enter Simulation
              <ArrowRight size={16} />
            </>
          ) : (
            'No fixture data available'
          )}
        </button>

        {canEnterTactical && (
          <p className="text-[9px] text-slate-500 text-center">
            Double-click marker or press Enter
          </p>
        )}

        {/* External Links - "nerve center, not sensors" philosophy */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            External Tools
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <a
              href={getNasaFirmsUrl(fire)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                py-1.5 px-2 rounded text-[11px] font-medium
                flex items-center justify-center gap-1
                bg-orange-500/10 text-orange-400 hover:bg-orange-500/20
                border border-orange-500/20 transition-all
              "
              title="NASA satellite fire detections"
            >
              FIRMS
              <ExternalLink size={10} />
            </a>
            <a
              href={getInciWebUrl(fire)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                py-1.5 px-2 rounded text-[11px] font-medium
                flex items-center justify-center gap-1
                bg-amber-500/10 text-amber-400 hover:bg-amber-500/20
                border border-amber-500/20 transition-all
              "
              title="Official incident information"
            >
              InciWeb
              <ExternalLink size={10} />
            </a>
            <a
              href={getNifcUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="
                py-1.5 px-2 rounded text-[11px] font-medium
                flex items-center justify-center gap-1
                bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20
                border border-emerald-500/20 transition-all
              "
              title="NIFC fire perimeters"
            >
              NIFC
              <ExternalLink size={10} />
            </a>
            <a
              href={getMtbsUrl(fire)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                py-1.5 px-2 rounded text-[11px] font-medium
                flex items-center justify-center gap-1
                bg-purple-500/10 text-purple-400 hover:bg-purple-500/20
                border border-purple-500/20 transition-all
              "
              title="Historical burn severity"
            >
              MTBS
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Create popup HTML for MapLibre (fallback when React render not available)
 */
export function createPopupHTML(fire: NationalFire, isWatched: boolean): string {
  const severityColor = SEVERITY_DISPLAY[fire.severity].color;
  const imageUrl = getAdaptiveFirePreviewUrl(fire);

  return `
    <div class="fire-info-popup-content">
      <div class="popup-header">
        <div>
          <h3>${fire.name}</h3>
          <p>${fire.state} &bull; Region ${fire.region} &bull; ${PHASE_DISPLAY[fire.phase].label}</p>
        </div>
        <button class="star-btn ${isWatched ? 'watched' : ''}" data-fire-id="${fire.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="popup-image">
        ${imageUrl ? `<img src="${imageUrl}" alt="${fire.name}" />` : '<div class="no-image">Preview unavailable</div>'}
      </div>
      <div class="popup-stats">
        <div class="stat">
          <span class="label">Acres</span>
          <span class="value">${formatAcres(fire.acres)}</span>
        </div>
        <div class="stat">
          <span class="label">Contained</span>
          <span class="value">${fire.containment}%</span>
        </div>
        <div class="stat">
          <span class="label">Severity</span>
          <span class="value" style="color: ${severityColor}">${getSeverityLabel(fire.severity)}</span>
        </div>
        <div class="stat">
          <span class="label">Triage</span>
          <span class="value" style="color: #22d3ee">${fire.triageScore.toFixed(1)}</span>
        </div>
      </div>
      <div class="popup-actions">
        <button class="enter-btn ${fire.hasFixtures ? '' : 'disabled'}" data-fire-id="${fire.id}" ${!fire.hasFixtures ? 'disabled' : ''}>
          ${fire.hasFixtures ? 'Enter Simulation →' : 'No fixture data'}
        </button>
        <div class="external-links">
          <a href="${getNasaFirmsUrl(fire)}" target="_blank" rel="noopener noreferrer" class="ext-link firms">FIRMS ↗</a>
          <a href="${getInciWebUrl(fire)}" target="_blank" rel="noopener noreferrer" class="ext-link inciweb">InciWeb ↗</a>
          <a href="${getNifcUrl()}" target="_blank" rel="noopener noreferrer" class="ext-link nifc">NIFC ↗</a>
          <a href="${getMtbsUrl(fire)}" target="_blank" rel="noopener noreferrer" class="ext-link mtbs">MTBS ↗</a>
        </div>
      </div>
    </div>
  `;
}

export default FireInfoPopup;
