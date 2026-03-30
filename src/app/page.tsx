'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Menu, Plus, ChevronDown, Settings2 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { CreateRolePanel } from '@/components/chat/create-role-panel';
import { useChatStore } from '@/stores/chat-store';
import { getAllRoles, DEFAULT_ROLES, TAG_COLORS } from '@/lib/ai-roles';
import type { AIRole } from '@/lib/ai-roles';
import type { Session, Message, ImageResult } from '@/stores/chat-store';

export default function Home() {
  const {
    sessions,
    currentSessionId,
    messages,
    isSending,
    sidebarOpen,
    selectedRoleIndex,
    roles,
    setSessions,
    setCurrentSessionId,
    setMessages,
    addMessage,
    setIsSending,
    setSidebarOpen,
    toggleSidebar,
    setSelectedRoleIndex,
    setRoles,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  const currentRole = roles[selectedRoleIndex] || roles[0] || DEFAULT_ROLES[0];

  useEffect(() => {
    loadSessions();
    setRoles(getAllRoles());
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

  const searchImages = async (query: string) => {
    // Add user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: `🔍 Tìm ảnh: ${query}`,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);
    setIsSending(true);

    try {
      // Ensure session exists
      let sid = currentSessionId;
      if (!sid) {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `🔍 ${query}` }),
        });
        if (res.ok) {
          const newSession = await res.json();
          sid = newSession.id;
          setCurrentSessionId(sid);
          await loadSessions();
        } else return;
      }

      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 12 }),
      });

      if (res.ok) {
        const data = await res.json();
        const imageResults: ImageResult[] = (data.results || []).map((item: { url: string; name: string; thumbnail: string; source: string; tags?: string[]; score?: number }) => ({
          url: item.url || item.thumbnail,
          name: item.name || query,
          thumbnail: item.thumbnail || item.url,
          source: item.source || 'Gelbooru',
        }));

        const content = imageResults.length > 0
          ? `Tìm thấy **${imageResults.length} ảnh** cho "${query}" từ Gelbooru 🔍`
          : `Không tìm thấy ảnh nào cho "${query}". Thử tags khác nhé!`;

        addMessage({
          id: `img-${Date.now()}`,
          role: 'assistant',
          content,
          images: imageResults.length > 0 ? imageResults : undefined,
          createdAt: new Date().toISOString(),
        });
      } else {
        addMessage({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '❌ Không thể tìm ảnh. Thử lại sau.',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Lỗi kết nối. Thử lại sau.',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
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
          systemPrompt: currentRole.systemPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addMessage({
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          images: data.images || undefined,
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
    } catch {
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

  const handleRolesUpdated = (newRoles: AIRole[]) => {
    setRoles(newRoles);
    if (selectedRoleIndex >= newRoles.length) {
      setSelectedRoleIndex(0);
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
          <div className="flex items-center gap-1">
            <button
              className="md-icon-btn md:hidden"
              onClick={toggleSidebar}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>

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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 py-2 rounded-2xl md-elevation-2"
                  style={{ background: '#2B2B2B', minWidth: 200, maxWidth: 280 }}
                >
                  <div className="px-4 py-2 space-y-1" style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {roles.map((role, index) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSelectedRoleIndex(index);
                          setShowRolePicker(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors"
                        style={{
                          background: index === selectedRoleIndex ? '#333333' : 'transparent',
                        }}
                      >
                        <span className="text-base">{role.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: index === selectedRoleIndex ? role.color : '#CAC4D0',
                            }}
                          >
                            {role.name}
                          </span>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {role.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] px-1 py-px rounded-full"
                                style={{
                                  background: `${TAG_COLORS[tag] || '#49454F'}20`,
                                  color: TAG_COLORS[tag] || '#938F99',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {index === selectedRoleIndex && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: role.color }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Create Role Button */}
                  <div style={{ borderTop: '1px solid #333333' }} className="px-3 pt-2 mt-1">
                    <button
                      onClick={() => {
                        setShowRolePicker(false);
                        setShowCreateRole(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-colors"
                      style={{ color: '#D0BCFF' }}
                    >
                      <Plus size={16} />
                      <span className="text-sm font-medium">Tạo Role</span>
                      <Settings2 size={14} className="ml-auto" style={{ color: '#938F99' }} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              className="md-icon-btn"
              onClick={() => setShowCreateRole(true)}
              aria-label="Manage roles"
            >
              <Settings2 size={20} />
            </button>
            <button
              className="md-icon-btn"
              onClick={createNewChat}
              aria-label="New chat"
            >
              <Plus size={22} />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#121212' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div
                className="flex items-center justify-center mb-4"
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
              <div className="flex gap-1.5 mb-2 flex-wrap justify-center">
                {currentRole.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${TAG_COLORS[tag] || '#49454F'}20`,
                      color: TAG_COLORS[tag] || '#938F99',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-center max-w-[260px]" style={{ color: '#938F99' }}>
                {currentRole.isCustom
                  ? 'Custom role. Hãy bắt đầu trò chuyện.'
                  : getRoleDescription(currentRole.id)}
              </p>
              {/* Quick action hints */}
              {currentRole.supportsImages && (
                <div
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-2xl"
                  style={{ background: '#2B2B2B' }}
                >
                  <span className="text-xs" style={{ color: '#938F99' }}>
                    💡 Nhấn nút <strong style={{ color: '#74B9FF' }}>🔍</strong> để tìm ảnh Gelbooru
                  </span>
                </div>
              )}
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
        <ChatInput onSend={sendMessage} onImageSearch={searchImages} disabled={isSending} />
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

      {/* Create Role Panel (Sheet) */}
      <Sheet open={showCreateRole} onOpenChange={setShowCreateRole}>
        <SheetContent
          side="right"
          className="w-[340px] sm:w-[400px] p-0"
          style={{ background: '#1E1E1E' }}
        >
          <CreateRolePanel
            roles={roles}
            onClose={() => setShowCreateRole(false)}
            onCreated={handleRolesUpdated}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getRoleDescription(id: string): string {
  const descriptions: Record<string, string> = {
    assistant: 'Trợ lý AI thông minh, đa năng.',
    coder: 'Chuyên gia lập trình, code & debug.',
    writer: 'Nhà văn, sáng tạo nội dung.',
    translator: 'Dịch giả chuyên nghiệp đa ngôn ngữ.',
    teacher: 'Giáo viên giải thích mọi thứ.',
    analyst: 'Chuyên gia phân tích & tư vấn.',
    'anime-expert': 'Chuyên gia anime/manga, đề xuất & review.',
    gamer: 'Game thủ chuyên nghiệp, review & guide.',
    'meme-king': 'Vua meme, hài hước, bắt trend.',
    chef: 'Đầu bếp, công thức & mẹo nấu ăn.',
    fitness: 'Huấn luyện viên thể hình & dinh dưỡng.',
    music: 'Chuyên gia âm nhạc mọi thể loại.',
    philosopher: 'Triết gia, thảo luận sâu sắc.',
    'image-gen': 'Chuyên gia tạo prompt ảnh AI.',
    'nsfw-rp': 'Đối tác RP trưởng thành, nhập vai hoàn toàn.',
    'nsfw-story': 'Nhà kể chuyện không giới hạn nội dung.',
    'nsfw-writer': 'Nhà văn 18+, văn phong nghệ thuật.',
    'nsfw-advisor': 'Cố vấn thân mật, không phán xét.',
    'nsfw-char': 'Nhập vai bất kỳ nhân vật nào.',
    'nsfw-imagine': 'Sáng tạo concept art & prompt.',
    'nsfw-date': 'Date simulator, hẹn hò chân thực.',
    unfiltered: 'AI không giới hạn, không kiểm duyệt.',
    'nsfw-yandere': 'Yandere girl - yêu cuồng nhiệt, dark love.',
    'nsfw-tsundere': 'Tsundere - lạnh lùng bên ngoài, dễ thương bên trong.',
    'nsfw-kawaii': 'Kawaii Maid - dễ thương, gọi Master.',
    'gelbooru-search': 'Tìm ảnh Gelbooru, SFW & NSFW.',
  };
  return descriptions[id] || 'Trợ lý AI thông minh.';
}
