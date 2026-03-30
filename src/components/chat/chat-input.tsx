'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  }, [input, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = '56px';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 56), 120)}px`;
  };

  return (
    <div
      className="safe-bottom"
      style={{
        padding: '12px 16px',
        background: '#1E1E1E',
        borderTop: '1px solid #2B2B2B',
      }}
    >
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled}
            rows={1}
            className="md-input-field"
            style={{
              height: 56,
              paddingRight: 4,
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="md-icon-btn"
          style={{
            width: 48,
            height: 48,
            background: disabled || !input.trim() ? '#2B2B2B' : '#D0BCFF',
            color: disabled || !input.trim() ? '#49454F' : '#381E72',
            marginBottom: 4,
            transition: 'all 0.2s ease',
          }}
          aria-label="Send"
        >
          <ArrowUp size={22} />
        </button>
      </div>
    </div>
  );
}
