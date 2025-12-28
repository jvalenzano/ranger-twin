import React, { useState, useRef } from 'react';
import { useMapStore } from '@/stores/mapStore';
import {
    Camera, Search, Clock, Globe, ArrowLeft,
    Download, Eye, Maximize, AlertTriangle,
    PlayCircle, FileText, Image as ImageIcon
} from 'lucide-react';

interface SelectionRect {
    start: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
}

const ForensicInsightLab: React.FC = () => {
    const mapInstance = useMapStore((state) => state.mapInstance);

    // Capture State
    const [snapshotMode, setSnapshotMode] = useState(false);
    const [selection, setSelection] = useState<SelectionRect>({ start: null, current: null });
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Refs for interaction
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse Handlers for Area Selection
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!snapshotMode) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setSelection({
            start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
            current: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!snapshotMode || !selection.start) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setSelection(prev => ({
            ...prev,
            current: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        }));
    };

    const handleMouseUp = () => {
        if (!snapshotMode || !selection.start || !selection.current) return;
        performCroppedCapture();
        setSnapshotMode(false);
        setSelection({ start: null, current: null });
    };

    const performCroppedCapture = () => {
        if (!mapInstance || !selection.start || !selection.current) return;

        const canvas = mapInstance.getCanvas();

        // Calculate crop dimensions
        const x = Math.min(selection.start.x, selection.current.x);
        const y = Math.min(selection.start.y, selection.current.y);
        const width = Math.abs(selection.start.x - selection.current.x);
        const height = Math.abs(selection.start.y - selection.current.y);

        if (width < 10 || height < 10) return; // Ignore tiny accidental clicks

        // Scale factor for high-DPI displays
        const factor = canvas.width / canvas.clientWidth;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = width * factor;
        cropCanvas.height = height * factor;
        const ctx = cropCanvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(
                canvas,
                x * factor, y * factor, width * factor, height * factor,
                0, 0, width * factor, height * factor
            );
            setCapturedImage(cropCanvas.toDataURL('image/jpeg', 0.9));
        }

        // Geospatial context extraction
        // const bounds = mapInstance.getBounds();
        // (In a real impl, we'd use mapInstance.unproject to get LngLat for the selection box)
        console.log('[Lab] Area selection captured:', { width, height });
    };

    const handleRunAnalysis = () => {
        setIsAnalyzing(true);
        // Mocking the 'Skeptical Agent' research flow inspired by the user experiment
        setTimeout(() => {
            setResult(`
### FORENSIC REPORT: WILLAMETTE NATIONAL FOREST AREA #3510
**Audit Date:** Dec 23, 2025 | **Target ID:** Hills Creek Trail #3510 (Labeled)

> [!CAUTION]
> **FORENSIC DISCREPANCY ALERT: NAMING ERROR DETECTED**
> Cross-referencing dashboard metadata against the **USFS Enterprise Data Warehouse** and official **Willamette National Forest system records** reveals a significant mismatch.
> 
> **Dashboard Label:** Hills Creek Trail #3510
> **Official Record:** Elk Creek Trail #3510
> **Status:** The Trail #3510 ID is officially assigned to Elk Creek Trail. "Hills Creek Trail" appears to be a label hallucination or synthetic test data.

#### 1. Incident Research: Cedar Creek Fire (Fall 2022)
Search results confirm high-severity burn activity in the Elk Creek drainage. 
- **Start:** Aug 1, 2022 (Lightning)
- **Impact:** Heavy timber loss across 127,000+ acres.
- **Infrastructure Status:** Multiple bridge failures confirmed in Waldo Lake recreation district.

#### 2. Visual Correlation (Markers 47-ALPHA/BRAVO)
Markers in the snapshot correlate with localized debris flow burial zones reported in the **BAER (Burned Area Emergency Response)** report. The $238K repair estimate for the primary bridge loss matches the "Severe Impact" tier for backcountry timber structures.

#### 3. Media & Proof Gallery
| Source | Type | Title | Link |
| :--- | :--- | :--- | :--- |
| **InciWeb** | Log | [Cedar Creek Fire Official Archives](http://google.com/search?q=InciWeb+Cedar+Creek+Fire) | [Go to Source] |
| **YouTube** | Video | [Cedar Creek Fire 2022 Time-lapse (NIFC)](http://google.com/search?q=Cedar+Creek+Fire+Timelapse) | [Watch Video] |
| **Local News** | Article | [Oakridge Evacuation & Fire Behavior Reports](http://google.com/search?q=Oakridge+Cedar+Creek+Fire+News) | [Read Report] |

**Analyst Recommendation:** Remap identifier #3510 to "Elk Creek Trail" to ensure geospatial data integrity.
      `);
            setIsAnalyzing(false);
        }, 2200);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                setSnapshotMode(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInjectMockData = () => {
        // Simulating the user's specific Hills Creek discovery
        setCapturedImage('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=3270');
        setResult(null);
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-[#0a0a0c] text-[#e0e0e0] flex flex-col p-6 overflow-hidden mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-widest text-text-primary uppercase flex items-center gap-2">
                            Forensic Insight Engine <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">LAB-ORCHESTRATOR</span>
                        </h1>
                        <p className="text-[10px] text-text-muted uppercase tracking-tighter mt-0.5">Vetting Skeptical Agent Logic & Multi-Modal Grounding</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-[10px] font-bold tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> EXIT LAB
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow min-h-0">
                {/* Left: Interactive Capture Area */}
                <div className="flex flex-col gap-6 min-h-0">
                    <div className="flex-grow bg-[#121215] rounded-xl border border-white/10 relative overflow-hidden flex flex-col">
                        {/* Map Preview (Simulated as the actual app background) */}
                        <div
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className={`flex-grow relative ${snapshotMode ? 'cursor-crosshair' : 'cursor-default'}`}
                        >
                            {!mapInstance && !capturedImage ? (
                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-6 p-12 text-center bg-black/60">
                                    <div className="relative">
                                        <Globe className="w-16 h-16 opacity-20 animate-pulse" />
                                        <AlertTriangle className="w-6 h-6 text-yellow-500 absolute -bottom-1 -right-1" />
                                    </div>
                                    <div className="space-y-4 max-w-sm">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Map Instance Not Cloud-Synced</p>
                                        <p className="text-[10px] text-white/40 leading-relaxed uppercase">
                                            The Lab is in a separate tab and cannot "see" the map in your other window.
                                        </p>

                                        <div className="flex flex-col gap-2 pt-4">
                                            <button
                                                onClick={handleInjectMockData}
                                                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-[10px] font-bold tracking-widest transition-all"
                                            >
                                                SIMULATE: LOAD HILLS CREEK #3510 CONTEXT
                                            </button>
                                            <label className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-bold tracking-widest cursor-pointer text-center transition-all">
                                                UPLOAD MANUAL SCREENSHOT
                                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="text-[9px] uppercase bg-black/40 px-2 py-1 rounded-full border border-white/10 text-white/40">
                                        {mapInstance ? 'Live App Canvas Active' : 'Simulation Mode Active'}
                                    </div>
                                </div>
                            )}

                            {/* Area Selection Overlay */}
                            {snapshotMode && selection.start && selection.current && (
                                <div
                                    className="absolute border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    style={{
                                        left: Math.min(selection.start.x, selection.current.x),
                                        top: Math.min(selection.start.y, selection.current.y),
                                        width: Math.abs(selection.start.x - selection.current.x),
                                        height: Math.abs(selection.start.y - selection.current.y)
                                    }}
                                >
                                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-1 uppercase">
                                        <Maximize className="w-3 h-3" /> Area Selection
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Control Bar */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex gap-4 items-center justify-between">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setSnapshotMode(!snapshotMode); setCapturedImage(null); }}
                                    disabled={!mapInstance}
                                    className={`px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all ${!mapInstance ? 'opacity-30 cursor-not-allowed' : snapshotMode ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 border border-white/20'}`}
                                >
                                    {snapshotMode ? 'CANCEL' : <><Maximize className="w-4 h-4" /> Snapshot Selection</>}
                                </button>
                                <button
                                    onClick={() => { setSnapshotMode(false); performCroppedCapture(); }}
                                    disabled={!mapInstance}
                                    className={`px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all ${!mapInstance ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-600/30'}`}
                                >
                                    <Camera className="w-4 h-4" /> Full Capture
                                </button>
                            </div>
                            <div className="text-[10px] text-text-muted flex items-center gap-2 uppercase tracking-tight">
                                <AlertTriangle className="w-3 h-3 text-yellow-500/50" />
                                {mapInstance ? 'Map connection established' : 'Map disconnected (Sim Mode only)'}
                            </div>
                        </div>
                    </div>

                    {/* Captured Thumbnail & Run Button */}
                    {capturedImage && (
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-6 items-center">
                                <div className="w-32 h-32 rounded-lg border border-white/10 overflow-hidden flex-shrink-0 relative group">
                                    <img src={capturedImage} alt="Captured Map" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Search className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-400">Context Acquired</h3>
                                        <p className="text-[10px] text-text-muted leading-tight mt-1 uppercase">Bounding box and pixel buffer extracted. Ready for skeptical forensic analysis.</p>
                                    </div>
                                    <button
                                        onClick={handleRunAnalysis}
                                        disabled={isAnalyzing}
                                        className="w-full py-3 bg-white text-black hover:bg-blue-50 rounded-lg font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Clock className="w-5 h-5 animate-spin" /> Investigating...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" /> Orchestrate Research Mission
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Forensic Report / Insight Modal */}
                <div className="flex flex-col min-h-0">
                    <div className={`flex-grow rounded-xl border h-full transition-all duration-700 min-h-0 flex flex-col ${result ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/5 border-white/10 border-dashed items-center justify-center'}`}>
                        {!result && !isAnalyzing && (
                            <div className="text-center space-y-4 p-12 opacity-30">
                                <div className="p-4 bg-white/5 rounded-full inline-block border border-white/10">
                                    <Eye className="w-12 h-12" />
                                </div>
                                <p className="text-[10px] tracking-[0.3em] uppercase max-w-[200px] leading-loose">Awaiting Intelligence Snapshot To Initialize Research Mission</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="p-8 space-y-8 w-full">
                                <div className="flex items-center gap-3 animate-pulse">
                                    <Search className="w-5 h-5 text-blue-500" />
                                    <div className="h-4 bg-white/10 rounded w-1/2" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                                    <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
                                    <div className="h-3 bg-white/5 rounded w-4/6 animate-pulse" />
                                </div>
                                <div className="p-6 bg-white/5 rounded-lg border border-white/5 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded animate-pulse" />
                                        <div className="flex-grow space-y-2">
                                            <div className="h-3 bg-white/10 rounded w-1/4 animate-pulse" />
                                            <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* Report Header */}
                                <div className="p-6 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-xs font-black uppercase tracking-widest text-[#f0f0f0]">Intelligence Synthesis</h2>
                                    </div>
                                    <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-500/20 rounded border border-blue-500/20">
                                        Grounding: Search + Visual
                                    </div>
                                </div>
                                <div className="flex-grow overflow-auto p-8 custom-scrollbar">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="text-[13px] leading-relaxed text-[#d0d0d0] whitespace-pre-wrap font-sans">
                                            {/* We manually handle formatting since we aren't using a markdown lib in the lab currently, 
                                                but for the experiment, we'll keep the text clean */}
                                            {result.trim().split('\n').map((line, i) => {
                                                if (line.startsWith('###')) return <h3 key={i} className="text-blue-400 font-black text-sm uppercase mt-6 mb-3 tracking-widest">{line.replace('###', '')}</h3>;
                                                if (line.startsWith('####')) return <h4 key={i} className="text-white font-bold text-xs uppercase mt-4 mb-2 tracking-widest underline underline-offset-4 decoration-blue-500/50">{line.replace('####', '')}</h4>;
                                                if (line.startsWith('>')) return <div key={i} className="my-4 p-4 bg-red-950/30 border-l-2 border-red-500 text-red-100 italic text-xs">{line.replace('> [!CAUTION]', 'CAUTION:').replace('> ', '')}</div>;
                                                if (line.startsWith('|')) return null; // Skip table for now in plain text map
                                                return <p key={i} className="mb-2">{line}</p>;
                                            })}

                                            {/* Manual Table rendering for the 'Media Gallery' */}
                                            <div className="mt-8 pt-6 border-t border-white/10">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/70 mb-4 flex items-center gap-2">
                                                    <PlayCircle className="w-4 h-4" /> Media & Verification Log
                                                </h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[
                                                        { label: 'Incident Log', title: 'Cedar Creek Official Archives', icon: FileText, color: 'text-yellow-400' },
                                                        { label: 'Video Feed', title: 'NIFC Aerial Fire Behavior', icon: PlayCircle, color: 'text-red-400' },
                                                        { label: 'Visual Archive', title: 'Burn Severity BAER Overlay', icon: ImageIcon, color: 'text-blue-400' }
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                                                <div>
                                                                    <p className="text-[8px] uppercase font-black text-text-muted">{item.label}</p>
                                                                    <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</p>
                                                                </div>
                                                            </div>
                                                            <button className="p-2 rounded bg-white/5 border border-white/10 group-hover:border-blue-500/40">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {['MAP VIEW', 'CHRONOLOGY', 'GEOJSON'].map(tab => (
                                            <button key={tab} className="text-[9px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded uppercase tracking-tighter hover:bg-blue-500/20 hover:border-blue-500/30 transition-all text-text-muted hover:text-blue-400">
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="text-[10px] font-black bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white tracking-widest shadow-lg shadow-blue-500/20">
                                        SUBMIT FORENSIC ALERT
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForensicInsightLab;
