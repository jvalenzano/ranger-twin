import React, { useEffect, useState } from 'react';
import { useVisualAuditStore } from '@/stores/visualAuditStore';
import { useLifecycleStore } from '@/stores/lifecycleStore';
import { X, Globe, ShieldCheck, FileText, Share2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ForensicReportModal: React.FC = () => {
    const { status, capturedImage, userQuery, result, reset, setResult, setStatus } = useVisualAuditStore();
    const activePhase = useLifecycleStore((state) => state.activePhase);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Trigger simulation of analysis when image is captured
    useEffect(() => {
        if (status === 'analyzing' && capturedImage && !result) {
            setIsAnalyzing(true);

            const timer = setTimeout(() => {
                const queryIntent = userQuery || 'General Forensic Audit';

                setResult(`
### FORENSIC INTELLIGENCE BRIEFING: AREA #3510
**Audit Date:** Dec 23, 2025 | **Workflow:** ${activePhase} Analysis
**Specific Mission focus:** "${queryIntent}"

> [!CAUTION]
> **SKEPTICAL ALERT: CRITICAL NAMING DISCREPANCY**
> Cross-referencing current cockpit metadata against the **USFS National Forest System (NFS)** records reveals a data integrity error.
> 
> **Dashboard Identifier:** Hills Creek Trail #3510
> **Official USFS Designation:** Elk Creek Trail #3510 (Willamette NF)

#### 1. Research Target: ${queryIntent}
Grounding analysis in archival records for the **Cedar Creek Fire (2022)** specifically investigating: *${queryIntent}*.

Search results from InciWeb and USFS BAER logs confirm the following for this specific patch:
- **Burn Severity:** High (dNBR > 600).
- **Drainage Impact:** The user's query regarding "${queryIntent}" correlates with localized bridge failures reported in the Oct 2022 Post-Fire summary.
- **Media Proof:** Sentinel-2 imagery confirms localized debris flow covering approx 0.4 acres near the indicated target.

| Source | Type | Title | Status |
| :--- | :--- | :--- | :--- |
| **InciWeb** | Archive | Cedar Creek Fire Incident Log | [Verified] |
| **USFS BAER** | Report | Burned Area Hazard Summary | [Confirmed] |
| **NIFC** | Media | Sentinel-2 Burn Detection (Oct 2022) | [Correlated] |

**Recommendation:** Update cockpit database reference #3510 to "Elk Creek Trail" and flag for field verification of the hazard identified in research: *${queryIntent}*.
                `);
                setStatus('complete');
                setIsAnalyzing(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [status, capturedImage, userQuery, result, activePhase, setResult, setStatus]);

    if (status === 'idle' || status === 'selecting' || status === 'refining') return null;

    // Only show this modal for area-based analysis (when capturedImage exists)
    // Feature-based Site Analysis uses the inline analyzing state in VisualAuditOverlay
    if (!capturedImage) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0f111a] w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-widest text-white uppercase">Forensic Intelligence Briefing</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-tighter">Powered by RANGER Skeptical Orchestrator</p>
                        </div>
                    </div>
                    <button
                        onClick={reset}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Evidence Capture */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-blue-400/80 tracking-widest">Visual Target</label>
                                <div className="aspect-square bg-slate-900 rounded-lg border border-white/10 overflow-hidden relative group">
                                    {capturedImage ? (
                                        <>
                                            {/* Show captured image if it looks valid, otherwise use static fallback */}
                                            {capturedImage.length > 50000 ? (
                                                <img src={capturedImage} alt="Captured focus area" className="w-full h-full object-cover" />
                                            ) : (
                                                <img
                                                    src={`https://api.maptiler.com/maps/satellite/static/43.71,-122.05,14/300x300.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
                                                    alt="Static map fallback"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-500/80 rounded text-[8px] text-white font-mono">
                                                {capturedImage.length > 50000 ? `${Math.round(capturedImage.length / 1024)}KB` : 'Static'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                            <Search className="w-8 h-8 opacity-20 animate-pulse" />
                                            <span className="text-[9px] text-red-400 uppercase">No capture</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                        Reference Snapshot
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-blue-400/80 tracking-widest">Research Context</label>
                                <div className="space-y-1">
                                    <div className="flex justify-between p-2 bg-white/[0.03] rounded border border-white/5">
                                        <span className="text-[10px] text-text-muted italic">Primary Incident</span>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Cedar Creek Fire</span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-white/[0.03] rounded border border-white/5">
                                        <span className="text-[10px] text-text-muted italic">Coordinates</span>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">43.71, -122.05</span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-white/[0.03] rounded border border-white/5">
                                        <span className="text-[10px] text-text-muted italic">Status</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isAnalyzing ? 'text-blue-400 animate-pulse' : 'text-emerald-400'}`}>
                                            {isAnalyzing ? 'Active Mission' : 'Synthesized'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10">
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-white/10 transition-all flex items-center justify-center gap-2">
                                <Share2 className="w-3.5 h-3.5" /> Export Insights
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Intelligence Synthesis */}
                    <div className="flex-1 flex flex-col bg-black/40 relative">
                        {isAnalyzing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12 text-center bg-[#0f111a]/50">
                                <div className="w-16 h-16 relative">
                                    <Globe className="w-full h-full text-blue-500/20 animate-spin" />
                                    <Search className="w-6 h-6 text-blue-400 absolute inset-0 m-auto" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Synthesizing Proof</h3>
                                    <p className="text-[10px] text-text-muted leading-relaxed uppercase">
                                        Skeptical Agent is cross-referencing dashboard labels against USFS Archives, InciWeb Logs, and news records...
                                    </p>
                                </div>
                                <div className="w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="prose prose-invert prose-sm max-w-none prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-black prose-p:text-text-muted prose-p:leading-relaxed prose-li:text-text-muted">
                                    {result ? (
                                        <ReactMarkdown>{result}</ReactMarkdown>
                                    ) : (
                                        <div className="flex items-center justify-center h-full opacity-20 uppercase tracking-widest text-xs">
                                            Intelligence synthesis pending...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        {!isAnalyzing && result && (
                            <div className="px-8 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> View Full Chronology
                                    </button>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-white flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Cite Sources
                                    </button>
                                </div>
                                <button
                                    onClick={reset}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Confirm Audit Insights
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
