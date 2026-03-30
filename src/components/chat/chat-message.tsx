'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn('flex px-4 py-1', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('max-w-[82%] px-4 py-2.5', isUser ? 'md-bubble-user' : 'md-bubble-ai')}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div
            className="text-sm leading-relaxed max-w-none"
            style={{ color: '#E6E1E5' }}
          >
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}
        <p
          className="text-[10px] mt-1"
          style={{
            color: isUser ? 'rgba(56, 30, 114, 0.5)' : '#938F99',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}
