import React, { useState } from 'react';
import { useAnalysisHistoryStore, downloadAnalysisAsMarkdown, type SavedAnalysis } from '@/stores/analysisHistoryStore';
import { History, X, Trash2, Download, ChevronRight, AlertTriangle, Trees, Flame, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Feature type icon helper
const FeatureIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-4 h-4" }) => {
    switch (type) {
        case 'trail-damage-points':
            return <AlertTriangle className={`${className} text-amber-400`} />;
        case 'timber-plots-points':
            return <Trees className={`${className} text-emerald-400`} />;
        case 'burn-severity-fill':
            return <Flame className={`${className} text-red-400`} />;
        default:
            return <FileText className={`${className} text-blue-400`} />;
    }
};

interface AnalysisHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AnalysisHistoryPanel: React.FC<AnalysisHistoryPanelProps> = ({ isOpen, onClose }) => {
    const analyses = useAnalysisHistoryStore((state) => state.analyses);
    const deleteAnalysis = useAnalysisHistoryStore((state) => state.deleteAnalysis);
    const clearHistory = useAnalysisHistoryStore((state) => state.clearHistory);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedAnalysis = analyses.find(a => a.id === selectedId);

    if (!isOpen) return null;

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f111a] w-full max-w-4xl h-[80vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-cyan/20 rounded-lg">
                            <History className="w-5 h-5 text-accent-cyan" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                Analysis History
                            </h3>
                            <p className="text-[10px] text-text-muted">
                                {analyses.length} saved {analyses.length === 1 ? 'analysis' : 'analyses'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {analyses.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('Clear all saved analyses? This cannot be undone.')) {
                                        clearHistory();
                                        setSelectedId(null);
                                    }
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                Clear All
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* List Panel */}
                    <div className="w-1/3 border-r border-white/10 overflow-y-auto">
                        {analyses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <History className="w-12 h-12 text-text-muted/30 mb-4" />
                                <p className="text-xs text-text-muted">No saved analyses yet</p>
                                <p className="text-[10px] text-text-muted/60 mt-1">
                                    Run a Site Analysis and click "Save" to keep it here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {analyses.map((analysis) => (
                                    <button
                                        key={analysis.id}
                                        onClick={() => setSelectedId(analysis.id)}
                                        className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${selectedId === analysis.id ? 'bg-white/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <FeatureIcon type={analysis.featureType} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">
                                                    {analysis.featureName}
                                                </p>
                                                <p className="text-[10px] text-text-muted truncate">
                                                    {analysis.fireContext}
                                                </p>
                                                <p className="text-[9px] text-text-muted/60 mt-1">
                                                    {formatDate(analysis.timestamp)}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-text-muted/50 flex-shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {selectedAnalysis ? (
                            <>
                                {/* Detail Header */}
                                <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FeatureIcon type={selectedAnalysis.featureType} className="w-5 h-5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{selectedAnalysis.featureName}</h4>
                                                <p className="text-[10px] text-text-muted">
                                                    {formatDate(selectedAnalysis.timestamp)} • {selectedAnalysis.fireContext}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => downloadAnalysisAsMarkdown(selectedAnalysis)}
                                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                title="Download as Markdown"
                                            >
                                                <Download className="w-4 h-4 text-text-muted hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    deleteAnalysis(selectedAnalysis.id);
                                                    setSelectedId(null);
                                                }}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-black prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-white prose-blockquote:border-accent-cyan prose-blockquote:bg-accent-cyan/10 prose-blockquote:rounded prose-blockquote:px-4 prose-blockquote:py-2">
                                        <ReactMarkdown>
                                            {selectedAnalysis.result}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                <FileText className="w-12 h-12 text-text-muted/30 mb-4" />
                                <p className="text-xs text-text-muted">Select an analysis to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisHistoryPanel;
