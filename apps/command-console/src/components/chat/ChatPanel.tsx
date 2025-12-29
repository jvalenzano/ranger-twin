/**
 * ChatPanel - Natural language conversation interface
 *
 * Features:
 * - Message history display
 * - Chat input with send button
 * - Suggested query chips
 * - Loading states
 * - Agent role badges
 * - Resizable panel width (300-600px)
 * - Minimize to FAB mode
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Trash2,
  X,
  GripVertical,
  Download,
  Copy,
  Check,
  Minus,
  Zap,
  Cpu,
} from 'lucide-react';
import {
  useChatStore,
  useChatMessages,
  useChatLoading,
  useChatADKMode,
  type ChatMessage,
} from '@/stores/chatStore';
import { useConnectionStatus } from '@/stores/briefingStore';
import type { AgentRole } from '@/services/aiBriefingService';
import { ChatReasoningChain } from '@/components/briefing/ReasoningChain';

// Panel width constraints
const MIN_WIDTH = 300;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 400;
const STORAGE_KEY = 'ranger-chat-panel-width';

// Suggested queries for quick start
const SUGGESTED_QUERIES = [
  { label: 'Burn severity', query: 'What is the burn severity near Waldo Lake?' },
  { label: 'Trail damage', query: 'Which trails have the most severe damage?' },
  { label: 'Timber salvage', query: 'What are the highest priority timber salvage plots?' },
  { label: 'NEPA pathways', query: 'What NEPA pathways apply to post-fire salvage?' },
];

// Agent role colors
const AGENT_COLORS: Record<AgentRole, string> = {
  'recovery-coordinator': 'bg-accent-cyan',
  'burn-analyst': 'bg-severe',
  'trail-assessor': 'bg-warning',
  'cruising-assistant': 'bg-safe',
  'nepa-advisor': 'bg-purple-500',
};

const AGENT_LABELS: Record<AgentRole, string> = {
  'recovery-coordinator': 'Coordinator',
  'burn-analyst': 'Burn Analyst',
  'trail-assessor': 'Trail Assessor',
  'cruising-assistant': 'Cruising Assistant',
  'nepa-advisor': 'NEPA Advisor',
};

const AGENT_SKILLS: Record<AgentRole, string> = {
  'recovery-coordinator': 'Orchestration',
  'burn-analyst': 'Burn Analysis',
  'trail-assessor': 'Damage Assessment',
  'cruising-assistant': 'Timber Volume',
  'nepa-advisor': 'Regulatory Compliance',
};

// Message bubble component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser
            ? 'bg-slate-600'
            : message.isError
              ? 'bg-severe/20'
              : 'bg-accent-cyan/20'
          }`}
      >
        {isUser ? (
          <User size={16} className="text-slate-300" />
        ) : message.isError ? (
          <AlertCircle size={16} className="text-severe" />
        ) : (
          <Bot size={16} className="text-accent-cyan" />
        )}
      </div>

      {/* Content */}
      <div
        className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}
      >
        {/* Agent badge for assistant messages */}
        {!isUser && message.agentRole && (
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${AGENT_COLORS[message.agentRole]
                } text-slate-900`}
            >
              {AGENT_LABELS[message.agentRole]}
            </span>
            {/* Skill Badge */}
            <span className="text-[9px] text-slate-500 font-bold opacity-60">
              [Skill: {AGENT_SKILLS[message.agentRole]}]
            </span>
            {message.confidence !== undefined && (
              <span className="text-[10px] text-slate-500 mono">
                {message.confidence}% confidence
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${isUser
              ? 'bg-accent-cyan text-slate-900 rounded-br-sm'
              : message.isError
                ? 'bg-severe/10 border border-severe/30 text-severe rounded-bl-sm'
                : 'bg-slate-700/50 text-slate-200 rounded-bl-sm'
            }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Reasoning chain for assistant - using new prominent component */}
        {!isUser && message.reasoning && message.reasoning.length > 0 && (
          <ChatReasoningChain steps={message.reasoning} />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-600 mono">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

// Suggested query chip
const QueryChip: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-full text-slate-300 hover:text-white transition-all"
  >
    {label}
  </button>
);

// Load persisted panel width
function loadWidth(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const width = parseInt(stored, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        return width;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_WIDTH;
}

// Save panel width
function saveWidth(width: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(width));
  } catch {
    // Ignore localStorage errors
  }
}

interface ChatPanelProps {
  onClose?: () => void;
  onMinimize?: () => void;
}

// Main ChatPanel component
const ChatPanel: React.FC<ChatPanelProps> = ({ onClose, onMinimize }) => {
  const [input, setInput] = useState('');
  const [panelWidth, setPanelWidth] = useState(loadWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const messages = useChatMessages();
  const isLoading = useChatLoading();
  const isADKMode = useChatADKMode();
  const connectionStatus = useConnectionStatus();
  const sendMessage = useChatStore((state) => state.sendMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const exportConversation = useChatStore((state) => state.exportConversation);
  const toggleADKMode = useChatStore((state) => state.toggleADKMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveWidth(panelWidth);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, panelWidth]);

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    const json = exportConversation();
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [exportConversation]);

  // Handle download
  const handleDownload = useCallback(() => {
    const json = exportConversation();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranger-chat-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportConversation]);

  // Handle send
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle suggested query
  const handleSuggestion = (query: string) => {
    setInput(query);
  };

  return (
    <div
      ref={panelRef}
      className={`absolute top-[48px] bottom-0 right-0 bg-[#0a0f1a]/65 backdrop-blur-2xl border-l border-white/[0.1] flex flex-col overflow-hidden shadow-2xl z-30 ${isResizing ? 'select-none' : ''}`}
      style={{ width: panelWidth }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize group z-10 flex items-center justify-center ${isResizing ? 'bg-accent-cyan/20' : 'hover:bg-accent-cyan/10'}`}
      >
        <GripVertical size={12} className={`text-text-muted opacity-0 group-hover:opacity-100 ${isResizing ? 'opacity-100 text-accent-cyan' : ''}`} />
      </div>

      {/* Header */}
      <div className="h-[48px] px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent-cyan" />
          <span className="text-sm font-medium text-white">Ask RANGER</span>
          {/* ADK Mode Badge with connection status */}
          <button
            onClick={toggleADKMode}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors ${isADKMode
                ? connectionStatus === 'connected'
                  ? 'bg-safe/20 text-safe hover:bg-safe/30'
                  : connectionStatus === 'reconnecting'
                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                    : 'bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30'
                : 'bg-slate-600/50 text-slate-400 hover:bg-slate-500/50'
              }`}
            title={`Mode: ${isADKMode ? 'ADK Multi-Agent' : 'Legacy'}${isADKMode ? ` (${connectionStatus})` : ''}. Click to toggle.`}
          >
            {isADKMode ? <Zap size={10} /> : <Cpu size={10} />}
            {isADKMode ? 'ADK' : 'Legacy'}
            {/* Connection indicator dot */}
            {isADKMode && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected'
                    ? 'bg-safe'
                    : connectionStatus === 'reconnecting'
                      ? 'bg-warning animate-pulse'
                      : 'bg-slate-500'
                  }`}
              />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <>
              {/* Copy to clipboard */}
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
                title="Copy conversation"
              >
                {copied ? <Check size={14} className="text-safe" /> : <Copy size={14} />}
              </button>
              {/* Download */}
              <button
                onClick={handleDownload}
                className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
                title="Download conversation"
              >
                <Download size={14} />
              </button>
              {/* Clear */}
              <button
                onClick={clearMessages}
                className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
                title="Clear chat"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          {/* Minimize */}
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
              title="Minimize to button"
            >
              <Minus size={14} />
            </button>
          )}
          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
              title="Close chat"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center">
              <Bot size={24} className="text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium">
                Welcome to RANGER
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ask questions about the Cedar Creek Fire recovery
              </p>
            </div>

            {/* Suggested queries */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {SUGGESTED_QUERIES.map((suggestion, idx) => (
                <QueryChip
                  key={idx}
                  label={suggestion.label}
                  onClick={() => handleSuggestion(suggestion.query)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <Loader2 size={16} className="text-accent-cyan animate-spin" />
                </div>
                <div className="bg-slate-700/50 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <p className="text-sm text-slate-400">Analyzing...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 bg-slate-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Cedar Creek recovery..."
            disabled={isLoading}
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-accent-cyan text-slate-900 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
