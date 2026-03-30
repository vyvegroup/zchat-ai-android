import { create } from 'zustand';
import { AI_ROLES } from '@/lib/ai-roles';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  sidebarOpen: boolean;
  selectedRoleIndex: number;

  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSending: (sending: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSelectedRoleIndex: (index: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isLoading: false,
  isSending: false,
  sidebarOpen: false,
  selectedRoleIndex: 0,

  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSending: (sending) => set({ isSending: sending }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedRoleIndex: (index) => set({ selectedRoleIndex: index }),
}));
