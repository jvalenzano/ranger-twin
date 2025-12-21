/**
 * Chat Store - Manages conversation state
 *
 * Controls:
 * - Message history
 * - Loading state
 * - Error handling
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import aiBriefingService, { type AgentRole } from '@/services/aiBriefingService';

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

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (query: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

// Generate unique message ID
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      messages: [],
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
        set((state) => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
          error: null,
        }));

        try {
          // Query the AI
          const response = await aiBriefingService.query(query);

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

            set((state) => ({
              messages: [...state.messages, assistantMessage],
              isLoading: false,
            }));
          } else {
            // Handle error response
            const errorMessage: ChatMessage = {
              id: generateId(),
              role: 'assistant',
              content: response.error || 'Sorry, I encountered an error processing your request.',
              timestamp: new Date().toISOString(),
              isError: true,
            };

            set((state) => ({
              messages: [...state.messages, errorMessage],
              isLoading: false,
              error: response.error || 'Query failed',
            }));
          }
        } catch (error) {
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: 'Sorry, I encountered an unexpected error. Please try again.',
            timestamp: new Date().toISOString(),
            isError: true,
          };

          set((state) => ({
            messages: [...state.messages, errorMessage],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unexpected error',
          }));
        }
      },

      clearMessages: () => {
        set({ messages: [], error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'chat-store' }
  )
);

// Selector hooks
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatLoading = () => useChatStore((state) => state.isLoading);
export const useChatError = () => useChatStore((state) => state.error);
