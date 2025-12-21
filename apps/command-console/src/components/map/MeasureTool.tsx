/**
 * MeasureTool - Interactive distance and area measurement on the map
 *
 * Features:
 * - Distance mode: Click points to measure path length
 * - Area mode: Click points to draw polygon and measure acreage
 * - Real-time calculation using Turf.js
 * - ESC to cancel, double-click to complete
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import distance from '@turf/distance';
import area from '@turf/area';
import { point, polygon } from '@turf/helpers';

import {
  useMeasureStore,
  useMeasureMode,
  useMeasurePoints,
  useMeasureComplete,
} from '@/stores/measureStore';

interface MeasureToolProps {
  map: maplibregl.Map | null;
}

const MEASURE_SOURCE_ID = 'measure-source';
const MEASURE_LINE_LAYER = 'measure-line';
const MEASURE_FILL_LAYER = 'measure-fill';
const MEASURE_POINTS_LAYER = 'measure-points';

const MeasureTool: React.FC<MeasureToolProps> = ({ map }) => {
  const mode = useMeasureMode();
  const points = useMeasurePoints();
  const isComplete = useMeasureComplete();

  const addPoint = useMeasureStore((state) => state.addPoint);
  const setMeasurements = useMeasureStore((state) => state.setMeasurements);
  const complete = useMeasureStore((state) => state.complete);
  const clear = useMeasureStore((state) => state.clear);

  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);
  const dblClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);

  // Calculate measurements whenever points change
  useEffect(() => {
    if (points.length < 2) {
      setMeasurements(null, null);
      return;
    }

    // Calculate distance (cumulative along path)
    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      if (prevPoint && currPoint) {
        const from = point([prevPoint.lng, prevPoint.lat]);
        const to = point([currPoint.lng, currPoint.lat]);
        totalDist += distance(from, to, { units: 'miles' });
      }
    }
    setMeasurements(totalDist, null);

    // Calculate area if in area mode and we have at least 3 points
    if (mode === 'area' && points.length >= 3) {
      const coords = points.map((p) => [p.lng, p.lat]);
      // Close the polygon
      const firstCoord = coords[0];
      if (firstCoord) {
        coords.push(firstCoord);
        const poly = polygon([coords]);
        const areaMeters = area(poly);
        // Convert square meters to acres (1 acre = 4046.86 sq meters)
        const areaAcres = areaMeters / 4046.86;
        setMeasurements(totalDist, areaAcres);
      }
    }
  }, [points, mode, setMeasurements]);

  // Update map layers when points change
  useEffect(() => {
    if (!map || !mode) return;

    // Ensure source exists
    if (!map.getSource(MEASURE_SOURCE_ID)) {
      map.addSource(MEASURE_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add fill layer for area mode
      map.addLayer({
        id: MEASURE_FILL_LAYER,
        type: 'fill',
        source: MEASURE_SOURCE_ID,
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': '#00D4FF',
          'fill-opacity': 0.2,
        },
      });

      // Add line layer
      map.addLayer({
        id: MEASURE_LINE_LAYER,
        type: 'line',
        source: MEASURE_SOURCE_ID,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#00D4FF',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      // Add points layer
      map.addLayer({
        id: MEASURE_POINTS_LAYER,
        type: 'circle',
        source: MEASURE_SOURCE_ID,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#00D4FF',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });
    }

    // Build GeoJSON features
    const features: GeoJSON.Feature[] = [];

    // Add points
    points.forEach((p) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
        properties: {},
      });
    });

    // Add line if we have 2+ points
    if (points.length >= 2) {
      const coords = points.map((p) => [p.lng, p.lat]);
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
        properties: {},
      });
    }

    // Add polygon if in area mode with 3+ points
    if (mode === 'area' && points.length >= 3) {
      const coords = points.map((p) => [p.lng, p.lat]);
      const firstCoord = coords[0];
      if (firstCoord) {
        coords.push(firstCoord); // Close the polygon
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords],
          },
          properties: {},
        });
      }
    }

    // Update source
    const source = map.getSource(MEASURE_SOURCE_ID) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features,
      });
    }
  }, [map, mode, points]);

  // Set up click handlers
  useEffect(() => {
    if (!map || !mode || isComplete) return;

    // Change cursor to crosshair
    map.getCanvas().style.cursor = 'crosshair';

    // Click handler
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      addPoint({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    // Double-click to complete
    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      complete();
    };

    clickHandlerRef.current = handleClick;
    dblClickHandlerRef.current = handleDblClick;

    map.on('click', handleClick);
    map.on('dblclick', handleDblClick);

    // Disable double-click zoom while measuring
    map.doubleClickZoom.disable();

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
      map.getCanvas().style.cursor = '';
      map.doubleClickZoom.enable();
    };
  }, [map, mode, isComplete, addPoint, complete]);

  // ESC key to cancel/clear
  useEffect(() => {
    if (!mode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, clear]);

  // Clean up layers when mode is cleared
  useEffect(() => {
    if (!map) return;

    if (!mode) {
      // Remove layers and source when not measuring
      if (map.getLayer(MEASURE_POINTS_LAYER)) {
        map.removeLayer(MEASURE_POINTS_LAYER);
      }
      if (map.getLayer(MEASURE_LINE_LAYER)) {
        map.removeLayer(MEASURE_LINE_LAYER);
      }
      if (map.getLayer(MEASURE_FILL_LAYER)) {
        map.removeLayer(MEASURE_FILL_LAYER);
      }
      if (map.getSource(MEASURE_SOURCE_ID)) {
        map.removeSource(MEASURE_SOURCE_ID);
      }
    }
  }, [map, mode]);

  // This component doesn't render anything - it just manages map interactions
  return null;
};

export default MeasureTool;
