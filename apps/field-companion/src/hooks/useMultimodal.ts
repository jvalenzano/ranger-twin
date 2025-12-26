import { useEffect } from 'react';
import { useCamera } from './useCamera';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useSpatialTracking } from './useSpatialTracking';

export const useMultimodal = () => {
    const camera = useCamera();
    const voice = useVoiceRecorder();
    const spatial = useSpatialTracking(camera.stream !== null);

    // Sync internal states if needed
    useEffect(() => {
        if (camera.stream && !spatial.spatialData.latitude) {
            // Just to illustrate coordination
            console.log('[useMultimodal] Sensors engaged, spatial tracking active.');
        }
    }, [camera.stream, spatial.spatialData.latitude]);

    const startHarness = async () => {
        await camera.startCamera();
        await spatial.requestPermissions();
    };

    const stopHarness = () => {
        camera.stopCamera();
        if (voice.isRecording) voice.stopRecording();
    };

    return {
        camera,
        voice,
        spatial,
        startHarness,
        stopHarness,
    };
};
