/**
 * Mock Chat Store - Simple state management for Week 2 mock chat
 *
 * Ensures messages persist when chat is popped/docked.
 * Will be replaced by real chatStore integration in Week 3-4.
 */

import { create } from 'zustand';

export interface MockChatMessage {
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
  followUpSuggestions?: string[];
}

interface MockChatState {
  messages: MockChatMessage[];
  isThinking: boolean;
  mockIndex: number;
  inputHistory: string[];

  addMessage: (message: MockChatMessage) => void;
  setThinking: (thinking: boolean) => void;
  incrementMockIndex: () => void;
  clearMessages: () => void;
  addToHistory: (input: string) => void;
}

export const useMockChatStore = create<MockChatState>((set) => ({
  messages: [],
  isThinking: false,
  mockIndex: 0,
  inputHistory: [],

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setThinking: (thinking) => set({ isThinking: thinking }),

  incrementMockIndex: () =>
    set((state) => ({ mockIndex: state.mockIndex + 1 })),

  clearMessages: () => set({ messages: [], mockIndex: 0 }),

  addToHistory: (input) =>
    set((state) => ({
      inputHistory: [input, ...state.inputHistory].slice(0, 10),
    })),
}));

// Selector hooks
export const useMockMessages = () => useMockChatStore((s) => s.messages);
export const useMockIsThinking = () => useMockChatStore((s) => s.isThinking);
export const useMockIndex = () => useMockChatStore((s) => s.mockIndex);
