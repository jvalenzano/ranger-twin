/**
 * ChatPanel - Natural language conversation interface
 *
 * Features:
 * - Message history display
 * - Chat input with send button
 * - Suggested query chips
 * - Loading states
 * - Agent role badges
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  useChatStore,
  useChatMessages,
  useChatLoading,
  type ChatMessage,
} from '@/stores/chatStore';
import type { AgentRole } from '@/services/aiBriefingService';

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

// Message bubble component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
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
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                AGENT_COLORS[message.agentRole]
              } text-slate-900`}
            >
              {AGENT_LABELS[message.agentRole]}
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
          className={`px-4 py-2.5 rounded-2xl ${
            isUser
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

        {/* Reasoning chain for assistant */}
        {!isUser && message.reasoning && message.reasoning.length > 0 && (
          <details className="text-xs text-slate-500 mt-1 cursor-pointer">
            <summary className="hover:text-slate-300 transition-colors">
              View reasoning ({message.reasoning.length} steps)
            </summary>
            <ol className="mt-2 pl-4 space-y-1 list-decimal list-inside">
              {message.reasoning.map((step, idx) => (
                <li key={idx} className="text-slate-400">
                  {step}
                </li>
              ))}
            </ol>
          </details>
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

// Main ChatPanel component
const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const messages = useChatMessages();
  const isLoading = useChatLoading();
  const sendMessage = useChatStore((state) => state.sendMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="absolute bottom-6 right-6 w-[400px] h-[500px] glass rounded-lg flex flex-col overflow-hidden shadow-2xl z-40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent-cyan" />
          <span className="text-sm font-medium text-white">Ask RANGER</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-slate-500 hover:text-white transition-colors p-1"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        )}
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
