'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Menu, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useChatStore } from '@/stores/chat-store';
import type { Session, Message } from '@/stores/chat-store';

export default function Home() {
  const {
    sessions,
    currentSessionId,
    messages,
    isSending,
    sidebarOpen,
    setSessions,
    setCurrentSessionId,
    setMessages,
    addMessage,
    setIsSending,
    setSidebarOpen,
    toggleSidebar,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data: Session[] = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSessionMessages = useCallback(
    async (sessionId: string) => {
      setCurrentSessionId(sessionId);
      setMessages([]);

      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const data = { messages: [] as Message[] };
          const json = await res.json();
          data.messages = json.messages || [];
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    },
    [setCurrentSessionId, setMessages]
  );

  const createNewChat = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Cuộc trò chuyện mới' }),
      });
      if (res.ok) {
        const newSession = await res.json();
        await loadSessions();
        await loadSessionMessages(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (currentSessionId === id) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        await loadSessions();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSessionId) {
      // Create a new session first
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.substring(0, 40) }),
        });
        if (res.ok) {
          const newSession = await res.json();
          setCurrentSessionId(newSession.id);
          await loadSessions();
          // Now send the message with the new session ID
          await sendToAI(newSession.id, content);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
      return;
    }

    await sendToAI(currentSessionId, content);
  };

  const sendToAI = async (sessionId: string, content: string) => {
    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    setIsSending(true);

    try {
      // Build message history for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          createdAt: new Date().toISOString(),
        };
        addMessage(assistantMessage);
        // Refresh sessions to update title and last message
        loadSessions();
      } else {
        const errorData = await res.json();
        addMessage({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `❌ Lỗi: ${errorData.error || 'Không thể kết nối đến AI'}`,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Không thể gửi tin nhắn. Vui lòng thử lại.',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="h-dvh flex bg-[#0a0a0a] text-zinc-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 lg:w-80 shrink-0 border-r border-zinc-800">
        <div className="w-full">
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={loadSessionMessages}
            onNewChat={createNewChat}
            onDeleteSession={deleteSession}
            onClose={() => {}}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-zinc-400 hover:text-zinc-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-zinc-100 truncate">
                {currentSession?.title || 'ZChat AI'}
              </h1>
              <p className="text-[11px] text-emerald-400">Trực tuyến</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={createNewChat}
            className="text-zinc-400 hover:text-zinc-100"
            title="Cuộc trò chuyện mới"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* Messages Area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100 mb-2">
                Xin chào! 👋
              </h2>
              <p className="text-sm text-zinc-400 max-w-sm">
                Tôi là ZChat AI, trợ lý của bạn. Hãy bắt đầu cuộc trò chuyện!
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                {[
                  'Giới thiệu về bản thân',
                  'Viết code Python',
                  'Dịch văn bản sang tiếng Anh',
                  'Giải bài toán toán',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs text-left px-3 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-1">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {isSending && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={sendMessage} disabled={isSending} />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 border-zinc-800 bg-zinc-950">
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              loadSessionMessages(id);
              setSidebarOpen(false);
            }}
            onNewChat={createNewChat}
            onDeleteSession={deleteSession}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
