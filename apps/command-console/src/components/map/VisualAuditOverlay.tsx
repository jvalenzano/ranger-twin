import React, { useState, useRef, useEffect } from 'react';
import { useVisualAuditStore } from '@/stores/visualAuditStore';
import { useMapStore } from '@/stores/mapStore';
import { useActiveFire } from '@/stores/fireContextStore';
import { useAnalysisHistoryStore, downloadAnalysisAsMarkdown, type SavedAnalysis } from '@/stores/analysisHistoryStore';
import { useBriefingStore } from '@/stores/briefingStore';
import { Maximize, X, Search, Map, Trees, Flame, AlertTriangle, Download, Save, Check, Shield, BookOpen, Brain } from 'lucide-react';
import { QuickQueryChips } from './QuickQueryChips';
import { buildQueryFromChips } from '@/config/siteAnalysisChips';
import ReactMarkdown from 'react-markdown';
import { adkChatService } from '@/services/adkChatService';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';

// Feature type icon component
const FeatureTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'trail-damage-points':
            return (
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
            );
        case 'timber-plots-points':
            return (
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Trees className="w-5 h-5 text-emerald-400" />
                </div>
            );
        case 'burn-severity-fill':
            return (
                <div className="p-2 bg-red-500/20 rounded-lg">
                    <Flame className="w-5 h-5 text-red-400" />
                </div>
            );
        default:
            return (
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Search className="w-5 h-5 text-blue-400" />
                </div>
            );
    }
};

// Feature type label helper
const getFeatureTypeLabel = (type: string): string => {
    switch (type) {
        case 'trail-damage-points':
            return 'Trail Infrastructure';
        case 'timber-plots-points':
            return 'Timber Plot';
        case 'burn-severity-fill':
            return 'Burn Zone';
        default:
            return 'Feature';
    }
};

// Save Analysis Button Component
const SaveAnalysisButton: React.FC = () => {
    const [saved, setSaved] = useState(false);
    const saveAnalysis = useAnalysisHistoryStore((state) => state.saveAnalysis);
    const { featureMetadata, selectedChipIds, userQuery, result } = useVisualAuditStore();
    const activeFire = useActiveFire();

    const handleSave = () => {
        if (!featureMetadata || !result) return;

        saveAnalysis({
            featureId: featureMetadata.featureId,
            featureName: featureMetadata.featureName,
            featureType: featureMetadata.featureType,
            coordinates: featureMetadata.coordinates,
            fireContext: activeFire.name,
            selectedChipIds,
            userQuery,
            result,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10'
                }`}
        >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save'}
        </button>
    );
};

// Proof Layer Panel Component (Phase 1 - Transparency)
const ProofLayerPanel: React.FC = () => {
    const adkResult = useVisualAuditStore((state) => state.adkResult);
    const [expanded, setExpanded] = useState(false);

    if (!adkResult?.proofLayer) return null;

    const { confidence, citations, reasoning_chain } = adkResult.proofLayer;
    const confidencePercent = Math.round(confidence * 100);
    const confidenceColor = confidencePercent >= 85 ? 'text-emerald-400' : confidencePercent >= 70 ? 'text-amber-400' : 'text-red-400';

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
            {/* Collapsed Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-accent-cyan/20 rounded-lg">
                        <Shield className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">
                        Proof Layer
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${confidenceColor}`}>
                        {confidencePercent}%
                    </span>
                    <span className="text-[9px] text-text-muted">
                        {expanded ? '▼' : '▶'}
                    </span>
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/5">
                    {/* Confidence Score */}
                    <div className="pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Confidence</span>
                            <span className={`text-xs font-bold ${confidenceColor}`}>{confidencePercent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${confidencePercent >= 85 ? 'bg-emerald-500' : confidencePercent >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${confidencePercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Reasoning Chain */}
                    {reasoning_chain.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-3 h-3 text-accent-cyan" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Reasoning Chain</span>
                            </div>
                            <ol className="space-y-1.5 pl-4">
                                {reasoning_chain.slice(0, 5).map((step, idx) => (
                                    <li key={idx} className="text-[10px] text-text-secondary list-decimal">
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Citations */}
                    {citations.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-3 h-3 text-accent-cyan" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Data Sources</span>
                            </div>
                            <div className="space-y-1.5">
                                {citations.map((citation, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-[10px]">
                                        <span className="text-accent-cyan font-bold shrink-0">[{idx + 1}]</span>
                                        <div>
                                            <span className="text-white font-medium">{citation.source_type}</span>
                                            <span className="text-text-muted"> — {citation.excerpt}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Source Agent */}
                    {adkResult.sourceAgent && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-[9px] text-text-muted">
                                Analysis by: <span className="text-white font-medium">{AGENT_DISPLAY_NAMES[adkResult.sourceAgent]}</span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Download Analysis Button Component
const DownloadAnalysisButton: React.FC = () => {
    const { featureMetadata, selectedChipIds, userQuery, result } = useVisualAuditStore();
    const activeFire = useActiveFire();

    const handleDownload = () => {
        if (!featureMetadata || !result) return;

        const analysis: SavedAnalysis = {
            id: `temp-${Date.now()}`,
            timestamp: new Date().toISOString(),
            featureId: featureMetadata.featureId,
            featureName: featureMetadata.featureName,
            featureType: featureMetadata.featureType,
            coordinates: featureMetadata.coordinates,
            fireContext: activeFire.name,
            selectedChipIds,
            userQuery,
            result,
        };

        downloadAnalysisAsMarkdown(analysis);
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
        >
            <Download className="w-4 h-4" />
            Download
        </button>
    );
};

export const VisualAuditOverlay: React.FC = () => {
    const status = useVisualAuditStore((state) => state.status);
    const entryMode = useVisualAuditStore((state) => state.entryMode);
    const cancel = useVisualAuditStore((state) => state.cancel);
    const setCapturedImage = useVisualAuditStore((state) => state.setCapturedImage);
    const setStatus = useVisualAuditStore((state) => state.setStatus);
    const setMetadata = useVisualAuditStore((state) => state.setMetadata);
    const { userQuery, setUserQuery, capturedImage, metadata, featureMetadata, selectedChipIds } = useVisualAuditStore();
    const toggleChip = useVisualAuditStore((state) => state.toggleChip);

    const mapInstance = useMapStore((state) => state.mapInstance);
    const activeFire = useActiveFire();

    const [selection, setSelection] = useState<{ start: { x: number, y: number } | null, current: { x: number, y: number } | null }>({
        start: null,
        current: null
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // ADK-powered analysis with Proof Layer (Phase 1)
    useEffect(() => {
        if (status === 'analyzing' && entryMode === 'feature' && featureMetadata) {
            const startTime = Date.now();
            const MINIMUM_DISPLAY_TIME = 1500; // Show spinner for at least 1.5s

            const chipQuery = buildQueryFromChips(selectedChipIds, featureMetadata.properties);
            const fullQuery = chipQuery + (userQuery ? `\n\nAdditional question: ${userQuery}` : '');

            // Build contextual query for ADK
            const contextualQuery = `Analyze this ${getFeatureTypeLabel(featureMetadata.featureType)} feature from the Cedar Creek Fire:

**Feature:** ${featureMetadata.featureName}
**Coordinates:** ${featureMetadata.coordinates[1].toFixed(4)}°N, ${Math.abs(featureMetadata.coordinates[0]).toFixed(4)}°W
**Properties:** ${JSON.stringify(featureMetadata.properties, null, 2)}

**Questions:**
${fullQuery || 'Provide a comprehensive site assessment'}`;

            console.log('[SiteAnalysis] Streaming via ADK:', contextualQuery.slice(0, 150) + '...');

            // Track responses for aggregation
            let lastResponse = { summary: '', reasoning: [] as string[], confidence: 0, agentRole: 'recovery-coordinator' };

            adkChatService.streamQuery(
                contextualQuery,
                activeFire.fire_id || 'cedar-creek',
                {
                    onEvent: (response) => {
                        lastResponse = {
                            summary: response.summary,
                            reasoning: response.reasoning,
                            confidence: response.confidence,
                            agentRole: response.agentRole,
                        };
                    },
                    onError: async (error) => {
                        console.error('[SiteAnalysis] ADK streaming error:', error);
                        const elapsed = Date.now() - startTime;
                        if (elapsed < MINIMUM_DISPLAY_TIME) {
                            await new Promise(resolve => setTimeout(resolve, MINIMUM_DISPLAY_TIME - elapsed));
                        }
                        useVisualAuditStore.getState().setResult(`## Analysis Error\n\n${error}\n\nPlease try again.`);
                        setStatus('complete');
                    },
                    onComplete: async () => {
                        const elapsed = Date.now() - startTime;
                        if (elapsed < MINIMUM_DISPLAY_TIME) {
                            await new Promise(resolve => setTimeout(resolve, MINIMUM_DISPLAY_TIME - elapsed));
                        }

                        // Get the latest event from briefingStore for full proof layer
                        const latestEvents = useBriefingStore.getState().events;
                        const latestEvent = latestEvents[0];

                        // Store ADK result with proof layer
                        if (latestEvent) {
                            useVisualAuditStore.getState().setADKResult({
                                summary: lastResponse.summary || latestEvent.content.summary,
                                sourceAgent: latestEvent.source_agent,
                                proofLayer: latestEvent.proof_layer,
                                processingTimeMs: Date.now() - startTime,
                            });
                        }

                        // Build markdown result for display
                        const result = `## Site Analysis Report: ${featureMetadata.featureName}

**Analysis Date:** ${new Date().toLocaleDateString()}
**Feature Type:** ${getFeatureTypeLabel(featureMetadata.featureType)}
**Fire Context:** ${activeFire.name}
**Processing Time:** ${Date.now() - startTime}ms

---

### Analysis

${lastResponse.summary || 'Analysis completed. See Proof Layer for details.'}`;

                        useVisualAuditStore.getState().setResult(result);
                        setStatus('complete');
                    },
                }
            );
        }
    }, [status, entryMode, featureMetadata, selectedChipIds, userQuery, activeFire, setStatus]);

    // Early return AFTER all hooks
    if (status === 'idle') return null;

    const handleMouseDown = (e: React.MouseEvent) => {
        setSelection({
            start: { x: e.clientX, y: e.clientY },
            current: { x: e.clientX, y: e.clientY }
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (selection.start) {
            setSelection(prev => ({ ...prev, current: { x: e.clientX, y: e.clientY } }));
        }
    };

    const handleMouseUp = () => {
        if (selection.start && selection.current) {
            performCapture();
        }
        setSelection({ start: null, current: null });
    };

    const performCapture = () => {
        if (!mapInstance || !selection.start || !selection.current) return;

        try {
            const canvas = mapInstance.getCanvas();
            const mapRect = canvas.getBoundingClientRect();

            // Calculate pixel bounds relative to map container
            const startX = Math.min(selection.start.x, selection.current.x) - mapRect.left;
            const startY = Math.min(selection.start.y, selection.current.y) - mapRect.top;
            const endX = Math.max(selection.start.x, selection.current.x) - mapRect.left;
            const endY = Math.max(selection.start.y, selection.current.y) - mapRect.top;

            console.log('[SiteAnalysis] Capture bounds:', { startX, startY, endX, endY });

            // 1. Extract Geospatial Metadata
            const sw = mapInstance.unproject([startX, endY]);
            const ne = mapInstance.unproject([endX, startY]);
            const bbox = [[sw.lng, sw.lat], [ne.lng, ne.lat]];
            const center = [(sw.lng + ne.lng) / 2, (sw.lat + ne.lat) / 2];

            // 2. Extract Semantic Features (Grounding)
            const layers = ['trail-damage-points', 'timber-plots-points', 'burn-severity-fill'];
            const features = mapInstance.queryRenderedFeatures([
                [startX, startY],
                [endX, endY]
            ], { layers });

            const sanitizedFeatures = features.map(f => ({
                id: (f.id ?? (f.properties as Record<string, unknown>)?.damage_id ?? (f.properties as Record<string, unknown>)?.plot_id) as string | number,
                layer: f.layer.id,
                properties: f.properties as Record<string, unknown>
            })).filter((f): f is { id: string | number; layer: string; properties: Record<string, unknown> } => f.id !== undefined && f.id !== null);

            setMetadata({ bbox, center, features: sanitizedFeatures });
            console.log('[SiteAnalysis] Metadata set:', { center, featureCount: sanitizedFeatures.length });

            // 3. Capture full canvas (simplest approach - avoids CORS/cropping issues)
            try {
                const dataUrl = canvas.toDataURL('image/png');
                console.log('[SiteAnalysis] Captured full canvas, dataUrl length:', dataUrl.length);
                if (dataUrl && dataUrl.length > 100) {
                    setCapturedImage(dataUrl);
                } else {
                    console.error('[SiteAnalysis] Empty or invalid dataUrl');
                }
            } catch (corsError) {
                console.error('[SiteAnalysis] Canvas is tainted (CORS issue):', corsError);
            }

            // Transition to refining
            setStatus('refining');
        } catch (err) {
            console.error('[SiteAnalysis] Capture failed:', err);
            setStatus('error');
        }
    };

    const handleRunAnalysis = () => {
        // Build query from chips if in feature mode
        if (entryMode === 'feature' && featureMetadata) {
            const chipQuery = buildQueryFromChips(selectedChipIds, featureMetadata.properties);
            const fullQuery = chipQuery + (userQuery ? `\n\nAdditional question: ${userQuery}` : '');
            console.log('[SiteAnalysis] Running analysis with query:', fullQuery);
        }
        setStatus('analyzing');
    };

    const isAnalyzeDisabled = entryMode === 'feature' && selectedChipIds.length === 0 && !userQuery.trim();

    return (
        <div
            className={`fixed inset-0 z-[100] ${status === 'selecting' ? 'cursor-crosshair bg-black/10' : 'bg-black/40 backdrop-blur-sm pointer-events-auto'}`}
            onMouseDown={status === 'selecting' ? handleMouseDown : undefined}
            onMouseMove={status === 'selecting' ? handleMouseMove : undefined}
            onMouseUp={status === 'selecting' ? handleMouseUp : undefined}
            ref={containerRef}
        >
            {/* Visual Cue: Help Text (Selection Mode - Area only) */}
            {status === 'selecting' && entryMode === 'area' && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-in-from-top-4">
                    <div className="p-1 bg-accent-cyan rounded-full">
                        <Maximize className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Draw area to analyze</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); cancel(); }}
                        className="ml-2 p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Selection Box (Selection Mode) */}
            {status === 'selecting' && selection.start && selection.current && (
                <div
                    className="absolute border-2 border-accent-cyan bg-accent-cyan/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    style={{
                        left: Math.min(selection.start.x, selection.current.x),
                        top: Math.min(selection.start.y, selection.current.y),
                        width: Math.abs(selection.start.x - selection.current.x),
                        height: Math.abs(selection.start.y - selection.current.y)
                    }}
                >
                    <div className="absolute -top-6 left-0 bg-accent-cyan text-white text-[10px] font-black px-2 py-0.5 flex items-center gap-1 uppercase tracking-tighter">
                        ANALYSIS AREA
                    </div>

                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent-cyan" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent-cyan" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent-cyan" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent-cyan" />
                </div>
            )}

            {/* Site Analysis Modal (Refining Mode) */}
            {status === 'refining' && (
                <div className="absolute inset-0 flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#0f111a] w-full max-w-xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header - Dynamic based on entry mode */}
                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {entryMode === 'feature' && featureMetadata ? (
                                    <>
                                        <FeatureTypeIcon type={featureMetadata.featureType} />
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                                Site Analysis
                                            </h3>
                                            <p className="text-[10px] text-text-muted">
                                                {featureMetadata.featureName} • {activeFire.name}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-2 bg-accent-cyan/20 rounded-lg">
                                            <Map className="w-5 h-5 text-accent-cyan" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                                Area Analysis
                                            </h3>
                                            <p className="text-[10px] text-text-muted">
                                                {metadata?.features?.length || 0} features • {activeFire.name}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={cancel} className="p-2 hover:bg-white/5 rounded-full">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Feature Context Card (Feature Mode) */}
                            {entryMode === 'feature' && featureMetadata && (
                                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-1 flex-1 bg-accent-cyan/20 rounded-full" />
                                        <span className="text-[9px] font-bold text-accent-cyan uppercase tracking-widest">Feature Details</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] flex justify-between">
                                            <span className="text-text-muted">Type</span>
                                            <span className="text-white font-medium">{getFeatureTypeLabel(featureMetadata.featureType)}</span>
                                        </div>
                                        <div className="text-[10px] flex justify-between">
                                            <span className="text-text-muted">Coordinates</span>
                                            <span className="text-white font-mono text-[9px]">
                                                {featureMetadata.coordinates[1].toFixed(4)}°N, {Math.abs(featureMetadata.coordinates[0]).toFixed(4)}°W
                                            </span>
                                        </div>
                                        {featureMetadata.properties.severity !== undefined && (
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-text-muted">Severity</span>
                                                <span className="text-red-400 font-medium">{String(featureMetadata.properties.severity)}/5</span>
                                            </div>
                                        )}
                                        {featureMetadata.properties.priority !== undefined && (
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-text-muted">Priority</span>
                                                <span className="text-amber-400 font-medium">{String(featureMetadata.properties.priority)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Area Thumbnail Card (Area Mode) */}
                            {entryMode === 'area' && (
                                <div className="flex gap-4">
                                    <div className="w-32 aspect-square rounded-lg border border-white/10 overflow-hidden flex-shrink-0 bg-black relative">
                                        {(() => {
                                            const apiKey = import.meta.env.VITE_MAPTILER_API_KEY as string;
                                            const zoom = Math.min(Math.floor(mapInstance?.getZoom() || 14), 17);
                                            const staticUrl = metadata?.center && metadata.center[0] !== undefined && metadata.center[1] !== undefined
                                                ? `https://api.maptiler.com/maps/satellite/static/${metadata.center[0].toFixed(4)},${metadata.center[1].toFixed(4)},${zoom}/128x128.png?key=${apiKey}`
                                                : null;

                                            const imgSrc = (capturedImage && capturedImage.length > 50000)
                                                ? capturedImage
                                                : (staticUrl || '');

                                            return imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt="Map thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                    <Map className="w-8 h-8" />
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 flex-1 bg-accent-cyan/20 rounded-full" />
                                            <span className="text-[9px] font-bold text-accent-cyan uppercase tracking-widest">Selected Area</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-text-muted">Fire</span>
                                                <span className="text-white font-bold uppercase tracking-tighter">{activeFire.name}</span>
                                            </div>
                                            <div className="text-[10px] flex justify-between">
                                                <span className="text-text-muted">Center</span>
                                                <span className="text-white font-bold uppercase tracking-tighter">
                                                    {metadata?.center && metadata.center[1] != null && metadata.center[0] != null
                                                        ? `${metadata.center[1].toFixed(4)}°N, ${Math.abs(metadata.center[0]).toFixed(4)}°W`
                                                        : 'Unknown'}
                                                </span>
                                            </div>
                                            {metadata?.features && metadata.features.length > 0 && (
                                                <div className="text-[10px] flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                                    <span className="text-accent-cyan font-black uppercase tracking-widest text-[8px]">Detected Features</span>
                                                    <div className="flex gap-1">
                                                        {metadata.features.slice(0, 3).map((f) => (
                                                            <span key={String(f.id)} className="bg-accent-cyan/20 text-accent-cyan px-1.5 py-0.5 rounded text-[8px] font-bold">
                                                                {String(f.id)}
                                                            </span>
                                                        ))}
                                                        {metadata.features.length > 3 && <span className="text-text-muted text-[8px]">+{metadata.features.length - 3}</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Query Chips (Feature Mode Only) */}
                            {entryMode === 'feature' && featureMetadata && (
                                <QuickQueryChips
                                    featureType={featureMetadata.featureType}
                                    selectedIds={selectedChipIds}
                                    onToggle={toggleChip}
                                />
                            )}

                            {/* Selected Query Preview (Feature Mode) */}
                            {entryMode === 'feature' && featureMetadata && selectedChipIds.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan">
                                            Query Preview
                                        </label>
                                        <span className="text-[9px] text-text-muted italic">Auto-generated from selections</span>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-text-secondary max-h-32 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {buildQueryFromChips(selectedChipIds, featureMetadata.properties)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* User Query Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan">
                                        {entryMode === 'feature' ? 'Additional Questions' : 'Research Focus'}
                                    </label>
                                    {entryMode === 'feature' && (
                                        <span className="text-[9px] text-text-muted italic">Optional refinement</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <textarea
                                        autoFocus={entryMode === 'area'}
                                        value={userQuery}
                                        onChange={(e) => setUserQuery(e.target.value)}
                                        placeholder={entryMode === 'feature'
                                            ? 'Add any specific questions about this site...'
                                            : 'Ask a specific question about this area (e.g., "Look for bridge failure reports" or "Find slope stability archives")...'}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-text-muted/50 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all resize-none"
                                    />
                                    <div className="absolute top-2 right-2 opacity-10">
                                        <Search className="w-12 h-12 text-accent-cyan" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Launch Action */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-between items-center gap-3">
                            <div className="text-[9px] text-text-muted">
                                {entryMode === 'feature' && selectedChipIds.length > 0 && (
                                    <span>{selectedChipIds.length} {selectedChipIds.length === 1 ? 'query' : 'queries'} selected</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancel}
                                    className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzeDisabled}
                                    className="px-6 py-2.5 bg-accent-cyan hover:bg-accent-cyan/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-cyan/20 transition-all active:scale-95 min-h-[44px]"
                                >
                                    Run Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analyzing State */}
            {status === 'analyzing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#0f111a] p-8 rounded-2xl border border-white/10 shadow-2xl text-center max-w-md">
                        <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Analyzing Site</h3>
                        {featureMetadata && (
                            <p className="text-xs text-accent-cyan mb-2">{featureMetadata.featureName}</p>
                        )}
                        <p className="text-xs text-text-muted">Cross-referencing USFS records...</p>
                        {selectedChipIds.length > 0 && (
                            <p className="text-[10px] text-text-muted mt-2">
                                Processing {selectedChipIds.length} {selectedChipIds.length === 1 ? 'query' : 'queries'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Complete State - Show Results */}
            {status === 'complete' && entryMode === 'feature' && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="bg-[#0f111a] w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {featureMetadata && <FeatureTypeIcon type={featureMetadata.featureType} />}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                        Analysis Complete
                                    </h3>
                                    <p className="text-[10px] text-emerald-400">
                                        {featureMetadata?.featureName} • {activeFire.name}
                                    </p>
                                </div>
                            </div>
                            <button onClick={cancel} className="p-2 hover:bg-white/5 rounded-full">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-black prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-white prose-blockquote:border-accent-cyan prose-blockquote:bg-accent-cyan/10 prose-blockquote:rounded prose-blockquote:px-4 prose-blockquote:py-2">
                                <ReactMarkdown>
                                    {useVisualAuditStore.getState().result || ''}
                                </ReactMarkdown>
                            </div>

                            {/* Proof Layer Panel (Phase 1 - Transparency) */}
                            <ProofLayerPanel />
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
                            <div className="flex gap-2">
                                <SaveAnalysisButton />
                                <DownloadAnalysisButton />
                            </div>
                            <button
                                onClick={cancel}
                                className="px-6 py-2.5 bg-accent-cyan hover:bg-accent-cyan/80 text-white rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
