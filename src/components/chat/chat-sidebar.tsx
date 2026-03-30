'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100">ZChat</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-100 md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-11"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Cuộc trò chuyện mới</span>
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id}>
                {deletingId === session.id ? (
                  <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/50">
                    <p className="text-xs text-red-300 mb-2">
                      Xoá cuộc trò chuyện này?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete(session.id)}
                        className="h-7 text-xs rounded-lg"
                      >
                        Xoá
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelDelete}
                        className="h-7 text-xs text-zinc-400 rounded-lg"
                      >
                        Huỷ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-colors group',
                      currentSessionId === session.id
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.title}
                        </p>
                        {session.lastMessage && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {session.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-zinc-600">
                          {formatDate(session.updatedAt)}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-zinc-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
