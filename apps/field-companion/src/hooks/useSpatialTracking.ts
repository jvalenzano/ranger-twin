import { useState, useEffect, useCallback } from 'react';

export interface SpatialData {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    heading: number | null; // From Geolocation (GPS)
    speed: number | null;
    orientation: {
        alpha: number | null; // Compass
        beta: number | null; // Pitch
        gamma: number | null; // Roll
    } | null;
}

export const useSpatialTracking = (isActive: boolean) => {
    const [spatialData, setSpatialData] = useState<SpatialData>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        heading: null,
        speed: null,
        orientation: null,
    });

    const handleOrientation = (event: DeviceOrientationEvent) => {
        setSpatialData(prev => ({
            ...prev,
            orientation: {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
            },
        }));
    };

    useEffect(() => {
        if (!isActive) return;

        // 1. Geolocation Tracking
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setSpatialData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                }));
            },
            (error) => {
                console.error('[useSpatialTracking] Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );

        // 2. Orientation Tracking
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [isActive]);

    const requestPermissions = useCallback(async () => {
        // iOS 13+ requires explicit permission for DeviceOrientation
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch (err) {
                console.error('[useSpatialTracking] Permission request failed:', err);
            }
        }
    }, []);

    return {
        spatialData,
        requestPermissions,
    };
};
