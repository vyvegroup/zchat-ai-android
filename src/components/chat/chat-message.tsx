'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/stores/chat-store';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex gap-2.5 px-4 py-1.5',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar
        className={cn(
          'mt-1 h-8 w-8 shrink-0 flex items-center justify-center',
          isUser
            ? 'bg-emerald-600 text-white'
            : 'bg-zinc-700 text-emerald-400'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </Avatar>

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5',
          isUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-pre:bg-zinc-900 prose-pre:p-3 prose-code:text-emerald-400 prose-a:text-emerald-400 prose-strong:text-white prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-emerald-200/60 text-right' : 'text-zinc-500'
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}
