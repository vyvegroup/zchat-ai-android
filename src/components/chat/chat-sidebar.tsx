'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Session } from '@/stores/chat-store';

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
}: ChatSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    onDeleteSession(id);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays}d trước`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectSession(id);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 safe-top"
        style={{ height: 64, borderBottom: '1px solid #2B2B2B' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 14, background: '#D0BCFF' }}
          >
            <Sparkles size={14} style={{ color: '#381E72' }} />
          </div>
          <span className="text-base font-medium" style={{ color: '#E6E1E5' }}>
            VenCode
          </span>
        </div>
        <button
          className="md-icon-btn md:hidden"
          onClick={onClose}
          aria-label="Close"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* New Chat - Icon only button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="md-filled-btn md-filled-tonal w-full"
          aria-label="New chat"
          style={{ height: 48, borderRadius: 24, gap: 10 }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5 pb-4">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: '#938F99' }}>
              <MessageSquare size={28} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="text-xs">Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id}>
                {deletingId === session.id ? (
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: 'rgba(242, 184, 181, 0.1)', border: '1px solid rgba(242, 184, 181, 0.2)' }}
                  >
                    <p className="text-xs mb-3" style={{ color: '#F2B8B5' }}>
                      Xoá cuộc trò chuyện này?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(session.id)}
                        className="md-filled-btn"
                        style={{
                          background: '#F2B8B5',
                          color: '#601410',
                          height: 32,
                          borderRadius: 16,
                          padding: '0 16px',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        Xoá
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="md-filled-btn md-filled-tonal"
                        style={{
                          height: 32,
                          borderRadius: 16,
                          padding: '0 16px',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    className={cn(
                      'relative flex items-center justify-between gap-2 px-4 py-3 rounded-2xl cursor-pointer transition-colors',
                    )}
                    style={{
                      background: currentSessionId === session.id ? '#2B2B2B' : 'transparent',
                    }}
                  >
                    {/* Active indicator */}
                    {currentSessionId === session.id && (
                      <div className="md-active-indicator" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color: currentSessionId === session.id ? '#E6E1E5' : '#CAC4D0',
                        }}
                      >
                        {session.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px]" style={{ color: '#938F99' }}>
                        {formatDate(session.updatedAt)}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="md-icon-btn"
                        style={{ width: 32, height: 32 }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} style={{ color: '#938F99' }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
