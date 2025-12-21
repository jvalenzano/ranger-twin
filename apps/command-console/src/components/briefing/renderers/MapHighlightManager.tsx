/**
 * MapHighlightManager - Manages map feature highlights from events
 *
 * Provides hooks and context for the map component to access
 * GeoJSON features that should be highlighted based on
 * map_highlight events.
 *
 * Future integration: This will connect to MapLibre GL JS
 * to render highlighted features on the 3D terrain.
 */

import React, { createContext, useContext, useMemo } from 'react';

import { useMapHighlightEvents } from '@/hooks/useBriefingEvents';
import type { AgentBriefingEvent, GeoReference, Severity } from '@/types/briefing';

interface HighlightFeature {
  /**
   * The event that triggered this highlight.
   */
  event: AgentBriefingEvent;

  /**
   * GeoJSON Feature for the highlight.
   */
  geoReference: GeoReference;

  /**
   * Severity determines the highlight color.
   */
  severity: Severity;
}

interface MapHighlightState {
  /**
   * All active highlight features.
   */
  features: HighlightFeature[];

  /**
   * GeoJSON FeatureCollection for MapLibre.
   */
  featureCollection: {
    type: 'FeatureCollection';
    features: GeoReference[];
  };

  /**
   * Get highlight style properties for a feature.
   */
  getHighlightStyle: (severity: Severity) => {
    color: string;
    opacity: number;
    strokeWidth: number;
  };
}

const MapHighlightContext = createContext<MapHighlightState | null>(null);

export const MapHighlightProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const highlightEvents = useMapHighlightEvents();

  const state = useMemo<MapHighlightState>(() => {
    // Extract features from events that have geo_reference
    const features: HighlightFeature[] = highlightEvents
      .filter((event) => event.ui_binding.geo_reference !== null)
      .map((event) => ({
        event,
        geoReference: event.ui_binding.geo_reference!,
        severity: event.severity,
      }));

    // Build FeatureCollection for MapLibre
    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: features.map((f) => ({
        ...f.geoReference,
        properties: {
          ...f.geoReference.properties,
          eventId: f.event.event_id,
          severity: f.severity,
          sourceAgent: f.event.source_agent,
        },
      })),
    };

    return {
      features,
      featureCollection,
      getHighlightStyle: (severity: Severity) => {
        const styles: Record<Severity, { color: string; opacity: number; strokeWidth: number }> = {
          info: { color: '#10B981', opacity: 0.3, strokeWidth: 2 },
          warning: { color: '#F59E0B', opacity: 0.4, strokeWidth: 3 },
          critical: { color: '#EF4444', opacity: 0.5, strokeWidth: 4 },
        };
        return styles[severity];
      },
    };
  }, [highlightEvents]);

  return (
    <MapHighlightContext.Provider value={state}>
      {children}
    </MapHighlightContext.Provider>
  );
};

export const useMapHighlights = (): MapHighlightState => {
  const context = useContext(MapHighlightContext);
  if (!context) {
    throw new Error('useMapHighlights must be used within a MapHighlightProvider');
  }
  return context;
};

/**
 * Utility hook to get only features for a specific severity.
 */
export const useHighlightsBySeverity = (severity: Severity): HighlightFeature[] => {
  const { features } = useMapHighlights();
  return useMemo(
    () => features.filter((f) => f.severity === severity),
    [features, severity]
  );
};

export default MapHighlightProvider;
