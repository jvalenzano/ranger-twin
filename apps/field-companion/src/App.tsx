import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  MapPin,
  Menu,
  ShieldAlert,
  ArrowRight,
  Compass,
  Navigation,
  Wind,
  Plus,
  Loader2
} from 'lucide-react';
import { CameraViewport } from '@/components/camera/CameraViewport';
import { useMultimodal } from '@/hooks/useMultimodal';
import { useSync } from '@/hooks/useSync';
import { syncService } from '@/services/syncService';

const App: React.FC = () => {
  const { camera, voice, spatial, startHarness, stopHarness } = useMultimodal();
  const { pendingCount, isSyncing } = useSync();
  const [lastDetection, setLastDetection] = useState<string | null>(null);

  const handleHarness = () => {
    if (camera.stream) {
      stopHarness();
    } else {
      startHarness();
    }
  };

  const handleVoiceToggle = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  const handleCapture = () => {
    if (!camera.stream) return;

    const id = `DET-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setLastDetection(id);

    syncService.enqueue('DETECTION', {
      id,
      location: spatial.spatialData,
      timestamp: new Date().toISOString(),
    });

    // Reset indicator after 2s
    setTimeout(() => setLastDetection(null), 2000);
  };

  // Auto-enqueue telemetry while active
  useEffect(() => {
    if (!camera.stream) return;

    const interval = setInterval(() => {
      syncService.enqueue('TELEMETRY', {
        location: spatial.spatialData,
      });
    }, 10000); // Every 10s for demo

    return () => clearInterval(interval);
  }, [camera.stream, spatial.spatialData]);

  // Sync voice notes when recording stops
  useEffect(() => {
    if (voice.audioUrl && !voice.isRecording) {
      syncService.enqueue('VOICE_NOTE', { url: voice.audioUrl });
    }
  }, [voice.audioUrl, voice.isRecording]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-slate-200 overflow-hidden font-display select-none">
      {/* Viewfinder Area */}
      <div
        className="relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-crosshair"
        onClick={handleCapture}
      >
        <CameraViewport isActive={camera.stream !== null} />

        {/* Tactical Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10 w-full max-w-[200px]">
          <div className="glass px-3 py-1 items-center flex gap-2 rounded-sm border-accent-cyan/30">
            <div className={`w-1.5 h-1.5 rounded-full ${camera.stream ? 'bg-accent-cyan animate-pulse' : 'bg-slate-500'}`} />
            <span className={`text-[10px] font-bold tracking-[0.2em] mono uppercase ${camera.stream ? 'text-accent-cyan' : 'text-slate-500'}`}>
              {camera.stream ? 'RANGER-STREAM-LIVE' : 'SENSORS-OFFLINE'}
            </span>
          </div>

          {camera.stream && (
            <div className="glass px-2 py-2 flex flex-col gap-1 rounded-sm text-[9px] mono border-white/5 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-2">
                <MapPin size={10} className="text-safe" />
                <span className="text-white font-bold tracking-tighter">
                  {spatial.spatialData.latitude?.toFixed(5) || '43.71212'}°, {spatial.spatialData.longitude?.toFixed(5) || '-122.10543'}°
                </span>
              </div>
              <div className="flex items-center gap-2 ml-1 text-slate-400">
                <div className="w-[1px] h-2 bg-slate-700 ml-1" />
                <span>ACC: {spatial.spatialData.accuracy?.toFixed(1) || '3.2'}m</span>
              </div>
              <div className="flex items-center gap-2 ml-1 text-slate-400">
                <div className="w-[1px] h-2 bg-slate-700 ml-1" />
                <span>ALT: {spatial.spatialData.altitude?.toFixed(0) || 1542}m</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end pointer-events-none z-10">
          <div className="glass px-2 py-1 rounded-sm text-[9px] mono flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-widest">BATT</span>
            <span className="text-safe lowercase">87%</span>
          </div>

          {camera.stream && (
            <div className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-right-4">
              <div className="text-[20px] mono font-bold text-white/40 tracking-tighter tabular-nums select-none">
                {new Date().toLocaleTimeString('en-GB', { hour12: false })}:00
              </div>
              <div className="glass px-2 py-1 rounded-sm flex gap-3 text-[8px] mono uppercase text-slate-500">
                <div className="flex items-center gap-1">
                  <Navigation size={8} style={{ transform: `rotate(${spatial.spatialData.heading || 0}deg)` }} className="text-accent-cyan" />
                  <span>HDG: {spatial.spatialData.heading?.toFixed(0) || 284}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind size={8} className="text-accent-cyan" />
                  <span>SPD: {(spatial.spatialData.speed || 0).toFixed(1)}m/s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spatial Orientation HUD */}
        {camera.stream && spatial.spatialData.orientation && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 opacity-60">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-[1px] bg-white/20 relative">
                <div
                  className="absolute h-2 w-[1px] bg-accent-cyan -top-[3px] transition-all duration-300"
                  style={{ left: `${50 + (spatial.spatialData.orientation.gamma || 0)}%` }}
                />
              </div>
              <span className="text-[8px] mono text-slate-500 uppercase">Roll</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-[1px] h-10 bg-white/20 relative">
                <div
                  className="absolute w-2 h-[1px] bg-accent-cyan -left-[3px] transition-all duration-300"
                  style={{ top: `${50 - (spatial.spatialData.orientation.beta || 0)}%` }}
                />
              </div>
              <span className="text-[8px] mono text-slate-500 uppercase">Pitch</span>
            </div>
          </div>
        )}

        {/* Central UI crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="w-12 h-12 border border-accent-cyan/20 rounded-full" />
          <div className="absolute w-4 h-[1px] bg-accent-cyan/80 translate-x-8" />
          <div className="absolute w-4 h-[1px] bg-accent-cyan/80 -translate-x-8" />
          <div className="absolute w-[1px] h-4 bg-accent-cyan/80 translate-y-8" />
          <div className="absolute w-[1px] h-4 bg-accent-cyan/80 -translate-y-8" />

          {/* Pulse on capture */}
          {lastDetection && (
            <div className="absolute w-24 h-24 border-2 border-accent-cyan rounded-full animate-ping opacity-50" />
          )}
        </div>

        {/* Capture Indicator */}
        {lastDetection && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full border-accent-cyan/50 text-accent-cyan text-xs font-bold mono tracking-widest flex items-center gap-2 animate-bounce z-20">
            <Plus size={14} />
            MARKER {lastDetection} LOGGED
          </div>
        )}
      </div>

      {/* Control Panel (Bottom) */}
      <div className="h-[180px] glass border-t border-white/5 p-4 flex flex-col gap-4 z-20">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleVoiceToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${voice.isRecording ? 'bg-severe text-white animate-pulse' : 'bg-slate-800 text-slate-400 border border-white/10'}`}
            >
              {voice.isRecording ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 border border-white/10 flex items-center justify-center">
              <Compass size={20} />
            </button>
          </div>

          <button
            onClick={handleHarness}
            className={`flex-1 mx-4 h-14 rounded-full flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all ${camera.stream ? 'bg-severe text-white animate-pulse-cyan' : 'bg-accent-cyan text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.3)]'}`}
          >
            <div className={`w-3 h-3 rounded-full ${camera.stream ? 'bg-white' : 'bg-slate-900'} animate-pulse`} />
            {camera.stream ? 'Capturing Intelligence' : 'Harness Sensors'}
          </button>

          <button className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 border border-white/10 flex items-center justify-center">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Sync Pipeline</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-accent-cyan animate-pulse' : 'bg-safe'}`} />
              <span className={`text-xs font-bold uppercase tracking-widest font-mono ${isSyncing ? 'text-accent-cyan' : 'text-safe'}`}>
                {isSyncing ? 'Syncing...' : 'Synced'}
              </span>
              {pendingCount > 0 && <span className="text-[10px] text-slate-500 mono">QUEUE: {pendingCount}</span>}
              {isSyncing && <Loader2 size={10} className="animate-spin text-accent-cyan" />}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert size={14} className="text-warning" />
            <span className="text-[11px] mono uppercase tracking-tight">System Integrity Normal</span>
            <ArrowRight size={12} className="opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
