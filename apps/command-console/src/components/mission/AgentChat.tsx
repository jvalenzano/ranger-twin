/**
 * AgentChat - Chat interface for AI agents
 *
 * Week 2: Mock mode with hardcoded responses (1.5s delay)
 * Week 3-4: Will be wired to actual ADK/Recovery Coordinator
 *
 * Features:
 * - Message list with auto-scroll
 * - User messages right-aligned (cyan)
 * - Agent messages left-aligned with author attribution
 * - Input disabled while "thinking"
 * - proof_layer placeholder for confidence display
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { Send, Trash2, Bot, Maximize2, Minimize2, ChevronDown, ChevronUp, Copy, ArrowDown } from 'lucide-react';

import { useMockChatStore, type MockChatMessage } from '@/stores/mockChatStore';

// Message interface (Week 2 spec)
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  author?: string;
  content: string;
  timestamp: Date;
  proof_layer?: {
    confidence: number;
    sources: string[];
    reasoning_chain?: string[];
  };
}

// Suggested prompts for empty state
const SUGGESTED_PROMPTS = [
  "What's the status of Cedar Creek?",
  'Show high-priority watersheds',
  'NEPA timeline for emergency stabilization',
  'Trail closure recommendations',
];

// Mock responses for Week 2 demo
type MockResponse = {
  role: 'agent';
  author: string;
  content: string;
  proof_layer: {
    confidence: number;
    sources: string[];
  };
  followUpSuggestions?: string[];
};

const MOCK_RESPONSES: MockResponse[] = [
  {
    role: 'agent',
    author: 'Recovery Coordinator',
    content:
      "Based on the Burn Analyst's assessment, Cedar Creek Fire is currently at 45% containment with 125,000 acres burned. The BAER team has identified 3 high-priority watersheds requiring immediate attention.",
    proof_layer: {
      confidence: 0.87,
      sources: ['burn_severity_analysis', 'baer_assessment_report'],
    },
    followUpSuggestions: [
      'Tell me more about the high-priority watersheds',
      'What are the erosion risks?',
      'Timeline for stabilization',
    ],
  },
  {
    role: 'agent',
    author: 'Burn Analyst',
    content:
      'High severity burn detected in the northeast quadrant. Soil hydrophobicity is elevated in zones A3 and A4, creating significant erosion risk before winter precipitation.',
    proof_layer: {
      confidence: 0.92,
      sources: ['satellite_imagery', 'soil_samples'],
    },
    followUpSuggestions: [
      'Mitigation options for zones A3/A4',
      'Expected rainfall timeline',
      'Soil recovery projections',
    ],
  },
  {
    role: 'agent',
    author: 'Recovery Coordinator',
    content:
      "I've coordinated with the Trail Assessor. Three critical trail segments need emergency closure. The NEPA Advisor confirms we can proceed under categorical exclusion for emergency stabilization.",
    proof_layer: {
      confidence: 0.85,
      sources: ['trail_damage_report', 'nepa_guidance'],
    },
    followUpSuggestions: [
      'Which trail segments are affected?',
      'Show the categorical exclusion details',
      'Resource requirements for closure',
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

export function AgentChat({ isPopped = false, onTogglePop }: AgentChatProps) {
  // Use shared store for messages (persists between docked/popped states)
  const {
    messages,
    isThinking,
    mockIndex,
    inputHistory,
    addMessage,
    setThinking,
    incrementMockIndex,
    clearMessages,
    addToHistory,
  } = useMockChatStore();

  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        if (messages.length > 0 && confirm('Clear chat history?')) {
          clearMessages();
          setExpandedSources(new Set());
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [messages.length, clearMessages]);

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

  // Handle suggested prompt click
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    if (isThinking) return;
    setInput(prompt);
    // Auto-send after a brief delay to show the prompt
    setTimeout(() => {
      const userMessage: MockChatMessage = {
        id: generateId(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      addToHistory(prompt);
      setInput('');
      setHistoryIndex(-1);
      setThinking(true);

      setTimeout(() => {
        const mockResponse = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]!;
        const agentMessage: MockChatMessage = {
          id: generateId(),
          role: mockResponse.role,
          author: mockResponse.author,
          content: mockResponse.content,
          proof_layer: mockResponse.proof_layer,
          timestamp: new Date(),
          followUpSuggestions: mockResponse.followUpSuggestions,
        };
        addMessage(agentMessage);
        incrementMockIndex();
        setThinking(false);
      }, 1500);
    }, 100);
  }, [isThinking, mockIndex, addMessage, addToHistory, setThinking, incrementMockIndex]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isThinking) return;

    const trimmedInput = input.trim();

    // Add user message
    const userMessage: MockChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    addToHistory(trimmedInput);
    setInput('');
    setHistoryIndex(-1);
    setThinking(true);

    // Mock response after 1.5s delay
    setTimeout(() => {
      const mockResponse = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]!;
      const agentMessage: MockChatMessage = {
        id: generateId(),
        role: mockResponse.role,
        author: mockResponse.author,
        content: mockResponse.content,
        proof_layer: mockResponse.proof_layer,
        timestamp: new Date(),
        followUpSuggestions: mockResponse.followUpSuggestions,
      };
      addMessage(agentMessage);
      incrementMockIndex();
      setThinking(false);
    }, 1500);
  }, [input, isThinking, mockIndex, addMessage, addToHistory, setThinking, incrementMockIndex]);

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

  const handleClear = () => {
    clearMessages();
    setExpandedSources(new Set());
  };

  const toggleSourcesExpanded = (messageId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-cyan-400" />
          <span className="text-sm font-medium text-white">Recovery Coordinator</span>
          <span className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-400 rounded">
            Mock
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
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
              {isPopped ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
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
        {messages.length === 0 ? (
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
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Agent attribution */}
              {msg.role === 'agent' && msg.author && (
                <span className="text-[10px] font-medium text-amber-400 mb-1 ml-1">
                  {msg.author}
                </span>
              )}

              {/* Message bubble */}
              <div
                className={`group max-w-[85%] px-3 py-2 rounded-lg text-sm relative ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/20 text-cyan-100 rounded-br-sm'
                    : 'bg-white/5 text-slate-200 rounded-bl-sm'
                }`}
              >
                {/* Copy button for agent messages */}
                {msg.role === 'agent' && (
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

                {/* Confidence indicator with expandable sources */}
                {msg.proof_layer && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => toggleSourcesExpanded(msg.id)}
                      className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors w-full"
                    >
                      <span>Confidence: {Math.round(msg.proof_layer.confidence * 100)}%</span>
                      <span className="text-slate-600">•</span>
                      <span>{msg.proof_layer.sources.length} sources</span>
                      {expandedSources.has(msg.id) ? (
                        <ChevronUp size={12} className="ml-auto" />
                      ) : (
                        <ChevronDown size={12} className="ml-auto" />
                      )}
                    </button>
                    {expandedSources.has(msg.id) && (
                      <div className="mt-2 pl-2 border-l border-white/10 space-y-1">
                        {msg.proof_layer.sources.map((source, idx) => (
                          <div key={idx} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-cyan-500/60" />
                            <span>{source.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                        {msg.proof_layer.reasoning_chain && msg.proof_layer.reasoning_chain.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/5">
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Reasoning</span>
                            {msg.proof_layer.reasoning_chain.map((step, idx) => (
                              <div key={idx} className="text-[10px] text-slate-400 mt-1">
                                {idx + 1}. {step}
                              </div>
                            ))}
                          </div>
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

              {/* Follow-up suggestions (only for agent messages, only on last agent message) */}
              {msg.role === 'agent' &&
                msg.followUpSuggestions &&
                msg.followUpSuggestions.length > 0 &&
                messages[messages.length - 1]?.id === msg.id && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.followUpSuggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestedPrompt(suggestion)}
                        disabled={isThinking}
                        className="px-2 py-1 text-[10px] rounded bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))
        )}

        {/* Thinking indicator */}
        {isThinking && (
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
            disabled={isThinking}
            placeholder={isThinking ? 'Waiting for response...' : 'Ask a question...'}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-400 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentChat;
