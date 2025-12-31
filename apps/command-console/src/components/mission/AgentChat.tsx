/**
 * AgentChat - Chat interface for AI agents
 *
 * Week 3-4: Wired to ADK/Recovery Coordinator with mock fallback
 *
 * Features:
 * - Message list with auto-scroll
 * - User messages right-aligned (cyan)
 * - Agent messages left-aligned with author attribution
 * - Live ADK mode with health check fallback to mock
 * - ProofLayerPanel for detailed reasoning display
 * - Keyboard shortcuts: Cmd+K (focus), Cmd+L (clear)
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Send,
  Trash2,
  Bot,
  Maximize2,
  Copy,
  ArrowDown,
  Wifi,
  WifiOff,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

import { useChatStore } from '@/stores/chatStore';
import { useMockChatStore, type MockChatMessage } from '@/stores/mockChatStore';
import { adkChatService } from '@/services/adkChatService';
import { ProofLayerPanel } from './ProofLayerPanel';
import { CitationChip } from './CitationChip';
import type { ProofLayer, SourceAgent, Citation } from '@/types/briefing';
import { AGENT_DISPLAY_NAMES } from '@/types/briefing';

// Suggested prompts for empty state
const SUGGESTED_PROMPTS = [
  "What's the status of Cedar Creek?",
  'Show high-priority watersheds',
  'NEPA timeline for emergency stabilization',
  'Trail closure recommendations',
];

// Mock responses for fallback mode
const MOCK_RESPONSES = [
  {
    author: 'Recovery Coordinator',
    agentRole: 'recovery_coordinator' as SourceAgent,
    content:
      "Based on the Burn Analyst's assessment, Cedar Creek Fire is currently at 45% containment with 125,000 acres burned. The BAER team has identified 3 high-priority watersheds requiring immediate attention.",
    confidence: 0.87,
    reasoning: [
      'Retrieved burn severity data from MTBS satellite imagery',
      'Cross-referenced with BAER team field assessments',
      'Identified watershed priority based on erosion risk model',
    ],
    citations: [
      { source_type: 'MTBS', id: 'cedar-creek-2024', uri: 'ranger://mtbs/cedar-creek-2024', excerpt: 'High severity burn in NE quadrant' },
      { source_type: 'BAER', id: 'assessment-001', uri: 'ranger://baer/assessment-001', excerpt: '3 priority watersheds identified' },
    ],
  },
  {
    author: 'Burn Analyst',
    agentRole: 'burn_analyst' as SourceAgent,
    content:
      'High severity burn detected in the northeast quadrant. Soil hydrophobicity is elevated in zones A3 and A4, creating significant erosion risk before winter precipitation.',
    confidence: 0.92,
    reasoning: [
      'Analyzed Sentinel-2 imagery from post-fire window',
      'Calculated dNBR values for burn severity classification',
      'Correlated with soil moisture sensor data',
    ],
    citations: [
      { source_type: 'S-2', id: 'S2A_20241215', uri: 'ranger://sentinel/S2A_20241215', excerpt: 'dNBR = 0.78 (High Severity)' },
      { source_type: 'USFS', id: 'soil-data-a3', uri: 'ranger://usfs/soil-data-a3', excerpt: 'Hydrophobicity index: 4.2' },
    ],
  },
  {
    author: 'Recovery Coordinator',
    agentRole: 'recovery_coordinator' as SourceAgent,
    content:
      "I've coordinated with the Trail Assessor. Three critical trail segments need emergency closure. The NEPA Advisor confirms we can proceed under categorical exclusion for emergency stabilization.",
    confidence: 0.85,
    reasoning: [
      'Trail Assessor identified structural damage on 3 segments',
      'NEPA Advisor confirmed CE applicability under 36 CFR 220.6(e)',
      'Coordinated closure timeline with district ranger',
    ],
    citations: [
      { source_type: 'FSM', id: 'fsm-2300-closure', uri: 'ranger://fsm/2300-closure', excerpt: 'Emergency closure procedures' },
      { source_type: 'NEPA', id: 'ce-36cfr220', uri: 'ranger://nepa/ce-36cfr220', excerpt: 'Categorical exclusion criteria' },
    ],
  },
];

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AgentChatProps {
  isPopped?: boolean;
  onTogglePop?: () => void;
}

type ConnectionMode = 'checking' | 'live' | 'mock';

// Unified message interface for display
interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  author?: string;
  content: string;
  timestamp: string;
  agentRole?: SourceAgent;
  confidence?: number;
  reasoning?: string[];
  citations?: Citation[];
  isError?: boolean;
}

export function AgentChat({ isPopped = false, onTogglePop }: AgentChatProps) {
  // Stores
  const chatStore = useChatStore();
  const mockStore = useMockChatStore();

  // Local state
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('checking');
  const [proofPanelOpen, setProofPanelOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<{
    proofLayer: ProofLayer;
    agentName: SourceAgent;
  } | null>(null);
  const [mockIndex, setMockIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine which messages to display based on mode
  const isLiveMode = connectionMode === 'live';
  const isLoading = isLiveMode ? chatStore.isLoading : mockStore.isThinking;

  // Convert messages to unified display format
  const displayMessages: DisplayMessage[] = isLiveMode
    ? chatStore.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === 'user' ? 'user' : 'assistant',
        author: msg.agentRole ? AGENT_DISPLAY_NAMES[msg.agentRole as SourceAgent] : undefined,
        content: msg.content,
        timestamp: msg.timestamp,
        agentRole: msg.agentRole as SourceAgent | undefined,
        confidence: msg.confidence,
        reasoning: msg.reasoning,
        citations: [], // TODO: Extract from ADK events
        isError: msg.isError,
      }))
    : mockStore.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === 'user' ? 'user' : 'assistant',
        author: msg.author,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        agentRole: undefined,
        confidence: msg.proof_layer?.confidence,
        reasoning: msg.proof_layer?.reasoning_chain,
        citations: [],
        isError: false,
      }));

  // Health check on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await adkChatService.healthCheck();
        setConnectionMode(result.healthy ? 'live' : 'mock');
        console.log(`[AgentChat] Mode: ${result.healthy ? 'Live ADK' : 'Mock fallback'}`);
      } catch {
        setConnectionMode('mock');
        console.log('[AgentChat] Mode: Mock fallback (health check failed)');
      }
    };
    checkConnection();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Cmd/Ctrl + L: Clear chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        if (displayMessages.length > 0 && confirm('Clear chat history?')) {
          handleClear();
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [displayMessages.length]);

  // Copy message to clipboard
  const copyToClipboard = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(messageId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Handle scroll to detect when to show scroll button
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Open proof layer panel
  const openProofPanel = useCallback((msg: DisplayMessage) => {
    if (!msg.confidence) return;

    const proofLayer: ProofLayer = {
      confidence: msg.confidence,
      citations: msg.citations || [],
      reasoning_chain: msg.reasoning || [],
    };

    setSelectedProof({
      proofLayer,
      agentName: msg.agentRole || 'recovery_coordinator',
    });
    setProofPanelOpen(true);
  }, []);

  // Send message (routes to live or mock)
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    setInput('');
    setHistoryIndex(-1);
    setInputHistory((prev) => [trimmedInput, ...prev.slice(0, 9)]);

    if (isLiveMode) {
      // Live ADK mode
      await chatStore.sendMessage(trimmedInput);
    } else {
      // Mock mode
      const userMessage: MockChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmedInput,
        timestamp: new Date(),
      };
      mockStore.addMessage(userMessage);
      mockStore.setThinking(true);

      // Simulate response delay
      setTimeout(() => {
        const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]!;
        const agentMessage: MockChatMessage = {
          id: generateId(),
          role: 'agent',
          author: response.author,
          content: response.content,
          timestamp: new Date(),
          proof_layer: {
            confidence: response.confidence,
            sources: response.citations.map((c) => c.source_type),
            reasoning_chain: response.reasoning,
          },
        };
        mockStore.addMessage(agentMessage);
        mockStore.setThinking(false);
        setMockIndex((prev) => prev + 1);
      }, 1500);
    }
  }, [input, isLoading, isLiveMode, chatStore, mockStore, mockIndex]);

  // Handle suggested prompt
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [isLoading]);

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Arrow up: recall previous message from history
    if (e.key === 'ArrowUp' && !input && inputHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(inputHistory[newIndex] ?? '');
    }
    // Arrow down: navigate forward in history
    if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      if (newIndex < 0) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex] ?? '');
      }
    }
    // Escape: exit history mode
    if (e.key === 'Escape' && historyIndex >= 0) {
      setHistoryIndex(-1);
      setInput('');
    }
  };

  // Clear chat
  const handleClear = useCallback(() => {
    if (isLiveMode) {
      chatStore.clearMessages();
    } else {
      mockStore.clearMessages();
    }
  }, [isLiveMode, chatStore, mockStore]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    setConnectionMode('checking');
    try {
      const result = await adkChatService.healthCheck();
      setConnectionMode(result.healthy ? 'live' : 'mock');
    } catch {
      setConnectionMode('mock');
    }
  }, []);

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      <div className="h-full flex flex-col bg-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-white">Recovery Coordinator</span>
            {/* Mode badge */}
            {connectionMode === 'checking' && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-500/20 text-slate-400 rounded flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" />
                Checking
              </span>
            )}
            {connectionMode === 'live' && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1">
                <Wifi size={10} />
                Live
              </span>
            )}
            {connectionMode === 'mock' && (
              <button
                onClick={retryConnection}
                className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-400 rounded flex items-center gap-1 hover:bg-amber-500/30 transition-colors"
                title="Click to retry ADK connection"
              >
                <WifiOff size={10} />
                Mock
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {displayMessages.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                title="Clear chat"
              >
                <Trash2 size={14} />
              </button>
            )}
            {onTogglePop && (
              <button
                onClick={onTogglePop}
                className="p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                title={isPopped ? 'Dock chat' : 'Pop out chat'}
              >
                {isPopped ? <Maximize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 space-y-3 relative"
        >
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot size={32} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 mb-4">What would you like to know?</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 text-left transition-colors border border-white/5 hover:border-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Agent attribution */}
                {msg.role === 'assistant' && msg.author && (
                  <span className="text-[10px] font-medium text-amber-400 mb-1 ml-1">
                    {msg.author}
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`group max-w-[85%] px-3 py-2 rounded-lg text-sm relative ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-100 rounded-br-sm'
                      : msg.isError
                      ? 'bg-red-500/20 text-red-200 rounded-bl-sm border border-red-500/30'
                      : 'bg-white/5 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {/* Copy button for assistant messages */}
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="absolute -top-1 -right-1 p-1 rounded bg-slate-700/90 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy message"
                    >
                      {copied === msg.id ? (
                        <span className="text-[9px] text-green-400 px-1">Copied!</span>
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Confidence badge - clickable to open ProofLayerPanel */}
                  {msg.role === 'assistant' && msg.confidence && !msg.isError && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => openProofPanel(msg)}
                        className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors group/proof"
                      >
                        <ShieldCheck size={12} className="group-hover/proof:text-cyan-400" />
                        <span>
                          Confidence: {Math.round(msg.confidence * 100)}%
                        </span>
                        {msg.citations && msg.citations.length > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>{msg.citations.length} citations</span>
                          </>
                        )}
                        {msg.reasoning && msg.reasoning.length > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>{msg.reasoning.length} steps</span>
                          </>
                        )}
                        <span className="text-[9px] text-slate-600 ml-auto group-hover/proof:text-cyan-400">
                          View details →
                        </span>
                      </button>

                      {/* Inline citations (show first 3) */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.citations.slice(0, 3).map((citation, idx) => (
                            <CitationChip key={`${citation.id}-${idx}`} citation={citation} />
                          ))}
                          {msg.citations.length > 3 && (
                            <button
                              onClick={() => openProofPanel(msg)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300"
                            >
                              +{msg.citations.length - 3} more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-600 mt-0.5 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))
          )}

          {/* Thinking indicator */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium text-amber-400 mb-1 ml-1">
                Recovery Coordinator
              </span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 rounded-bl-sm">
                <span className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
                <span className="text-sm text-slate-400">Analyzing...</span>
              </div>
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors shadow-lg flex items-center gap-1.5"
            >
              <ArrowDown size={12} />
              <span>Latest</span>
            </button>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isLoading ? 'Waiting for response...' : 'Ask a question...'}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Proof Layer Panel */}
      {selectedProof && (
        <ProofLayerPanel
          proofLayer={selectedProof.proofLayer}
          agentName={selectedProof.agentName}
          isOpen={proofPanelOpen}
          onClose={() => setProofPanelOpen(false)}
        />
      )}
    </>
  );
}

export default AgentChat;
