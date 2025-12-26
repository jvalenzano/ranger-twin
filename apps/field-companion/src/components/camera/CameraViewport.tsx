import React, { useEffect } from 'react';
import { CameraOff, AlertTriangle } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewportProps {
    isActive: boolean;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({ isActive }) => {
    const { videoRef, startCamera, stopCamera, stream, error } = useCamera();

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isActive, startCamera, stopCamera]);

    if (error) {
        return (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-severe/10 flex items-center justify-center">
                    <AlertTriangle className="text-severe" size={32} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Camera Error</h2>
                    <p className="text-sm text-slate-500 max-w-[250px] mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!isActive) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center flex-col gap-6 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <CameraOff className="text-slate-600" size={32} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white/50 mb-2">Primary Sensor Disengaged</h1>
                    <p className="text-xs text-slate-500 max-w-[200px]">Waiting for hardware authorization. Use "Harness Sensors" to initiate capture.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* Viewport Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full border-[0.5px] border-accent-cyan/20 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-accent-cyan/10" />
                    ))}
                </div>
            </div>

            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan animate-spin" />
                        <span className="text-[10px] mono uppercase tracking-widest text-accent-cyan">Initializing Sensors...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
