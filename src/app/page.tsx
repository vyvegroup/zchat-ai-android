'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Menu, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useChatStore } from '@/stores/chat-store';
import { AI_ROLES } from '@/lib/ai-roles';
import type { Session, Message } from '@/stores/chat-store';

export default function Home() {
  const {
    sessions,
    currentSessionId,
    messages,
    isSending,
    sidebarOpen,
    selectedRoleIndex,
    setSessions,
    setCurrentSessionId,
    setMessages,
    addMessage,
    setIsSending,
    setSidebarOpen,
    toggleSidebar,
    setSelectedRoleIndex,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showRolePicker, setShowRolePicker] = useRolePicker();

  const currentRole = AI_ROLES[selectedRoleIndex];

  useEffect(() => {
    loadSessions();
  }, []);

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
          const json = await res.json();
          setMessages(json.messages || []);
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
        body: JSON.stringify({ title: 'VenCode Chat' }),
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
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    setIsSending(true);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId,
          roleId: currentRole.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addMessage({
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          createdAt: new Date().toISOString(),
        });
        loadSessions();
      } else {
        const errorData = await res.json();
        addMessage({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Lỗi: ${errorData.error || 'Không thể kết nối'}`,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-dvh flex overflow-hidden" style={{ background: '#121212' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-[280px] lg:w-[300px] shrink-0" style={{ borderRight: '1px solid #2B2B2B' }}>
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
        {/* Material You Top App Bar */}
        <header
          className="flex items-center justify-between px-2 shrink-0 safe-top"
          style={{ height: 64, background: '#1E1E1E' }}
        >
          <button
            className="md-icon-btn md:hidden"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          {/* Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
              style={{ background: `${currentRole.color}15`, color: currentRole.color }}
            >
              <span className="text-sm">{currentRole.icon}</span>
              <span className="text-xs font-medium hidden sm:inline">{currentRole.name}</span>
              <ChevronDown size={14} className="hidden sm:block" />
            </button>

            {/* Role Picker Dropdown */}
            {showRolePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRolePicker(false)} />
                <div
                  className="absolute top-full left-0 mt-2 z-50 py-2 rounded-2xl md-elevation-2"
                  style={{ background: '#2B2B2B', minWidth: 180 }}
                >
                  {AI_ROLES.map((role, index) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedRoleIndex(index);
                        setShowRolePicker(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                      style={{
                        background: index === selectedRoleIndex ? '#333333' : 'transparent',
                      }}
                    >
                      <span className="text-base">{role.icon}</span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: index === selectedRoleIndex ? role.color : '#CAC4D0',
                        }}
                      >
                        {role.name}
                      </span>
                      {index === selectedRoleIndex && (
                        <div
                          className="ml-auto w-2 h-2 rounded-full"
                          style={{ background: role.color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            className="md-icon-btn"
            onClick={createNewChat}
            aria-label="New chat"
          >
            <Plus size={22} />
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#121212' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div
                className="flex items-center justify-center mb-5"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 28,
                  background: `linear-gradient(135deg, ${currentRole.color} 0%, ${currentRole.color}88 100%)`,
                }}
              >
                <span className="text-3xl">{currentRole.icon}</span>
              </div>
              <p className="text-lg font-medium mb-1" style={{ color: '#E6E1E5' }}>
                {currentRole.name}
              </p>
              <p className="text-sm text-center max-w-[260px]" style={{ color: '#938F99' }}>
                {getRoleDescription(currentRole.id)}
              </p>
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

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0"
          style={{ background: '#1E1E1E' }}
        >
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

function useRolePicker() {
  const [show, setShow] = React.useState(false);
  return [show, setShow] as const;
}

function getRoleDescription(id: string): string {
  const descriptions: Record<string, string> = {
    assistant: 'Trợ lý AI thông minh, đa năng.',
    coder: 'Chuyên gia lập trình, code & debug.',
    writer: 'Nhà văn, sáng tạo nội dung.',
    translator: 'Dịch giả chuyên nghiệp đa ngôn ngữ.',
    teacher: 'Giáo viên giải thích mọi thứ.',
    analyst: 'Chuyên gia phân tích & tư vấn.',
  };
  return descriptions[id] || 'Trợ lý AI thông minh.';
}

import React from 'react';
