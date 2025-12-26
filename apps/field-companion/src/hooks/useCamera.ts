import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera for field work
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: true, // Also request audio for multimodal capture
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error('[useCamera] Failed to access camera:', err);
            setError('Camera access denied or unavailable.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    return {
        stream,
        error,
        videoRef,
        startCamera,
        stopCamera,
    };
};
