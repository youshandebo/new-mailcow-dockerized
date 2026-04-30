import { create } from 'zustand';
import { ChatMessage, EmailSummary } from '../types';
import { aiApi } from '../api/ai';

interface AiState {
  // Chat
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  isChatLoading: boolean;

  // Summary
  currentSummary: EmailSummary | null;
  isSummaryLoading: boolean;

  // Compose assist
  isComposeLoading: boolean;
  composeResult: string;

  // Actions
  toggleChat: () => void;
  sendChatMessage: (content: string, currentEmail?: string) => Promise<void>;
  clearChat: () => void;
  summarizeEmail: (subject: string, body: string, from?: string[]) => Promise<void>;
  clearSummary: () => void;
  aiCompose: (params: { prompt: string; context?: string; mode: 'compose' | 'reply' | 'improve' }) => AsyncGenerator<string>;
}

export const useAiStore = create<AiState>((set, get) => ({
  chatMessages: [],
  isChatOpen: false,
  isChatLoading: false,
  currentSummary: null,
  isSummaryLoading: false,
  isComposeLoading: false,
  composeResult: '',

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  sendChatMessage: async (content, currentEmail) => {
    const userMsg: ChatMessage = { role: 'user', content };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isChatLoading: true,
    }));

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    set((state) => ({ chatMessages: [...state.chatMessages, assistantMsg] }));

    try {
      const context = currentEmail ? { currentEmail } : undefined;
      for await (const chunk of aiApi.chat([...get().chatMessages.slice(0, -1), userMsg], context)) {
        assistantMsg.content += chunk;
        set((state) => ({
          chatMessages: [
            ...state.chatMessages.slice(0, -1),
            { ...assistantMsg },
          ],
        }));
      }
    } catch (err) {
      assistantMsg.content = 'Sorry, I encountered an error. Please try again.';
      set((state) => ({
        chatMessages: [...state.chatMessages.slice(0, -1), assistantMsg],
      }));
    } finally {
      set({ isChatLoading: false });
    }
  },

  clearChat: () => set({ chatMessages: [] }),

  summarizeEmail: async (subject, body, from) => {
    set({ isSummaryLoading: true, currentSummary: null });
    try {
      const summary = await aiApi.summarize(subject, body, from);
      set({ currentSummary: summary, isSummaryLoading: false });
    } catch (err) {
      console.error('Summarize failed:', err);
      set({ isSummaryLoading: false });
    }
  },

  clearSummary: () => set({ currentSummary: null }),

  async *aiCompose(params) {
    set({ isComposeLoading: true, composeResult: '' });
    try {
      let result = '';
      for await (const chunk of aiApi.compose(params)) {
        result += chunk;
        set({ composeResult: result });
        yield chunk;
      }
    } finally {
      set({ isComposeLoading: false });
    }
  },
}));
