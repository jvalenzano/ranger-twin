/**
 * LocationSelector - Interactive location selection component
 *
 * Features:
 * - Auto-detect using browser geolocation API
 * - Manual selection from forest/district list
 * - Permission handling with clear messaging
 * - Displays current location with icon
 *
 * Follows best practices from Google Maps, weather apps, emergency systems
 */

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, Loader2, AlertCircle } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';

// Forest districts for manual selection
const FOREST_DISTRICTS = [
    { id: 'willamette-nf', forest: 'Willamette National Forest', district: 'McKenzie River', state: 'OR' },
    { id: 'deschutes-nf', forest: 'Deschutes National Forest', district: 'Bend-Fort Rock', state: 'OR' },
    { id: 'umpqua-nf', forest: 'Umpqua National Forest', district: 'Diamond Lake', state: 'OR' },
    { id: 'rogue-river-nf', forest: 'Rogue River-Siskiyou NF', district: 'High Cascades', state: 'OR' },
    { id: 'mt-hood-nf', forest: 'Mt. Hood National Forest', district: 'Hood River', state: 'OR' },
    { id: 'gifford-pinchot-nf', forest: 'Gifford Pinchot NF', district: 'Mt. Adams', state: 'WA' },
    { id: 'okanogan-wenatchee-nf', forest: 'Okanogan-Wenatchee NF', district: 'Methow Valley', state: 'WA' },
    { id: 'tahoe-nf', forest: 'Tahoe National Forest', district: 'Truckee', state: 'CA' },
];

type GeolocationStatus = 'idle' | 'requesting' | 'success' | 'denied' | 'error';

interface LocationSelectorProps {
    onClose?: () => void;
}

export function LocationSelector({ onClose }: LocationSelectorProps) {
    const { location, setLocation } = usePreferencesStore();
    const [isOpen, setIsOpen] = useState(false);
    const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState(location?.district || 'Willamette National Forest');

    // Request geolocation permission and get coordinates
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus('error');
            return;
        }

        setGeoStatus('requesting');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: [number, number] = [
                    position.coords.longitude,
                    position.coords.latitude,
                ];

                // Find nearest forest district (simplified - in production, use reverse geocoding)
                const nearestDistrict = FOREST_DISTRICTS[0]; // Default to Willamette

                setLocation({
                    type: 'auto',
                    coordinates: coords,
                    district: nearestDistrict.district,
                    forest: nearestDistrict.forest,
                });

                setGeoStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    onClose?.();
                }, 1000);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setGeoStatus('denied');
                } else {
                    setGeoStatus('error');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    // Manual selection
    const handleManualSelect = (district: typeof FOREST_DISTRICTS[0]) => {
        setLocation({
            type: 'manual',
            district: district.district,
            forest: district.forest,
            coordinates: undefined,
        });
        setSelectedDistrict(district.forest);
        setIsOpen(false);
        onClose?.();
    };

    // Filter districts based on search
    const filteredDistricts = FOREST_DISTRICTS.filter(
        (d) =>
            d.forest.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get short forest name for display
    const getShortForestName = (forest: string) => {
        return forest.replace(' National Forest', ' NF').replace('National Forest', 'NF');
    };

    return (
        <div className="relative">
            {/* Current Location Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-[11px] text-slate-300 hover:text-white transition-colors group"
            >
                <MapPin size={12} className="text-emerald-400" />
                <span>{getShortForestName(location?.forest || 'Willamette National Forest')}</span>
                <span className="text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors">
                    Change
                </span>
            </button>

            {/* Location Selection Modal */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                            Select Location
                        </h3>
                    </div>

                    {/* Auto-detect Section */}
                    <div className="px-4 py-3 border-b border-slate-700/30">
                        <button
                            onClick={handleUseMyLocation}
                            disabled={geoStatus === 'requesting'}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-medium
                transition-all
                ${geoStatus === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : geoStatus === 'denied' || geoStatus === 'error'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                                }
              `}
                        >
                            {geoStatus === 'requesting' ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Requesting location...</span>
                                </>
                            ) : geoStatus === 'success' ? (
                                <>
                                    <Check size={14} />
                                    <span>Location detected!</span>
                                </>
                            ) : geoStatus === 'denied' ? (
                                <>
                                    <AlertCircle size={14} />
                                    <span>Permission denied</span>
                                </>
                            ) : geoStatus === 'error' ? (
                                <>
                                    <AlertCircle size={14} />
                                    <span>Unable to detect location</span>
                                </>
                            ) : (
                                <>
                                    <Navigation size={14} />
                                    <span>Use my current location</span>
                                </>
                            )}
                        </button>

                        {(geoStatus === 'denied' || geoStatus === 'error') && (
                            <p className="mt-2 text-[10px] text-slate-400">
                                {geoStatus === 'denied'
                                    ? 'Location access denied. Please select manually below.'
                                    : 'Unable to access location. Please select manually below.'}
                            </p>
                        )}
                    </div>

                    {/* Manual Selection */}
                    <div className="px-4 py-3">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                            Or select manually
                        </label>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search forests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-[11px] bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                        />

                        {/* District List */}
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                            {filteredDistricts.map((district) => {
                                const isSelected = location?.forest === district.forest;
                                return (
                                    <button
                                        key={district.id}
                                        onClick={() => handleManualSelect(district)}
                                        className={`
                      w-full px-3 py-2 rounded text-left text-[11px] transition-colors
                      flex items-center justify-between
                      ${isSelected
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'text-slate-300 hover:bg-slate-700/50'
                                            }
                    `}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{district.forest}</div>
                                            <div className="text-[10px] text-slate-500 truncate">
                                                {district.district} · {district.state}
                                            </div>
                                        </div>
                                        {isSelected && <Check size={12} className="text-cyan-400 flex-shrink-0 ml-2" />}
                                    </button>
                                );
                            })}

                            {filteredDistricts.length === 0 && (
                                <div className="px-3 py-4 text-center text-[11px] text-slate-500">
                                    No forests found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onClose?.();
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocationSelector;
