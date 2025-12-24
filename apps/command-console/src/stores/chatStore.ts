/**
 * Chat Store - Manages conversation state
 *
 * Controls:
 * - Message history with 7-day localStorage persistence
 * - Loading state
 * - Error handling
 * - Export/clear functionality
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import aiBriefingService, { type AgentRole } from '@/services/aiBriefingService';
import { useFireContextStore } from '@/stores/fireContextStore';

// localStorage configuration
const STORAGE_KEY = 'ranger-chat-history';
const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentRole?: AgentRole;
  confidence?: number;
  reasoning?: string[];
  isError?: boolean;
}

interface PersistedChatState {
  messages: ChatMessage[];
  lastUpdated: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (query: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  exportConversation: () => string;
  loadPersistedMessages: () => void;
}

// Generate unique message ID
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Filter out messages older than retention period
function filterExpiredMessages(messages: ChatMessage[]): ChatMessage[] {
  const cutoff = Date.now() - (RETENTION_DAYS * MS_PER_DAY);
  return messages.filter((msg) => new Date(msg.timestamp).getTime() > cutoff);
}

// Load messages from localStorage
function loadFromStorage(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PersistedChatState = JSON.parse(stored);
      // Filter expired messages
      return filterExpiredMessages(parsed.messages);
    }
  } catch {
    // Ignore localStorage errors
  }
  return [];
}

// Save messages to localStorage
function saveToStorage(messages: ChatMessage[]): void {
  try {
    const state: PersistedChatState = {
      messages: filterExpiredMessages(messages),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
}

// Clear stored messages
function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

// Load initial messages on store creation
const initialMessages = loadFromStorage();

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: initialMessages,
      isLoading: false,
      error: null,

      sendMessage: async (query: string) => {
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
        };

        // Add user message and set loading
        set((state) => {
          const newMessages = [...state.messages, userMessage];
          saveToStorage(newMessages);
          return {
            messages: newMessages,
            isLoading: true,
            error: null,
          };
        });

        try {
          // Get the active fire context for dynamic prompts
          const activeFire = useFireContextStore.getState().activeFire;

          // Query the AI with fire context
          const response = await aiBriefingService.query(query, 'demo-session-123', activeFire);

          if (response.success && response.response) {
            const assistantMessage: ChatMessage = {
              id: generateId(),
              role: 'assistant',
              content: response.response.summary,
              timestamp: new Date().toISOString(),
              agentRole: response.response.agentRole,
              confidence: response.response.confidence,
              reasoning: response.response.reasoning,
            };

            set((state) => {
              const newMessages = [...state.messages, assistantMessage];
              saveToStorage(newMessages);
              return {
                messages: newMessages,
                isLoading: false,
              };
            });
          } else {
            // Handle error response
            const errorMessage: ChatMessage = {
              id: generateId(),
              role: 'assistant',
              content: response.error || 'Sorry, I encountered an error processing your request.',
              timestamp: new Date().toISOString(),
              isError: true,
            };

            set((state) => {
              const newMessages = [...state.messages, errorMessage];
              saveToStorage(newMessages);
              return {
                messages: newMessages,
                isLoading: false,
                error: response.error || 'Query failed',
              };
            });
          }
        } catch (error) {
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: 'Sorry, I encountered an unexpected error. Please try again.',
            timestamp: new Date().toISOString(),
            isError: true,
          };

          set((state) => {
            const newMessages = [...state.messages, errorMessage];
            saveToStorage(newMessages);
            return {
              messages: newMessages,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unexpected error',
            };
          });
        }
      },

      clearMessages: () => {
        clearStorage();
        set({ messages: [], error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      exportConversation: () => {
        const { messages } = get();
        const exportData = {
          exportedAt: new Date().toISOString(),
          messageCount: messages.length,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            agentRole: msg.agentRole,
            confidence: msg.confidence,
          })),
        };
        return JSON.stringify(exportData, null, 2);
      },

      loadPersistedMessages: () => {
        const messages = loadFromStorage();
        set({ messages });
      },
    }),
    { name: 'chat-store' }
  )
);

// Selector hooks
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatLoading = () => useChatStore((state) => state.isLoading);
export const useChatError = () => useChatStore((state) => state.error);
