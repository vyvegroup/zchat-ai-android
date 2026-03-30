'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowUp, ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageSearch: (query: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onImageSearch, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [imageMode, setImageMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    if (imageMode) {
      onImageSearch(trimmed);
    } else {
      onSend(trimmed);
    }
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  }, [input, disabled, onSend, onImageSearch, imageMode]);

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
        {/* Image search toggle */}
        <button
          onClick={() => setImageMode(!imageMode)}
          className="md-icon-btn"
          style={{
            width: 40,
            height: 40,
            background: imageMode ? '#74B9FF' : 'transparent',
            color: imageMode ? '#381E72' : '#938F99',
            marginBottom: 4,
            transition: 'all 0.2s ease',
          }}
          aria-label={imageMode ? 'Switch to text mode' : 'Switch to image search mode'}
        >
          <ImageIcon size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={imageMode ? '🔍 Tìm ảnh Gelbooru (tags cách nhau bằng space)...' : 'Nhập tin nhắn...'}
            disabled={disabled}
            rows={1}
            className="md-input-field"
            style={{
              height: 56,
              paddingRight: 4,
              ...(imageMode ? { borderLeft: '3px solid #74B9FF', borderRadius: '20px 28px 28px 20px' } : {}),
            }}
          />
          {/* Image mode indicator */}
          {imageMode && (
            <div
              className="absolute top-1 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: '#74B9FF20', color: '#74B9FF' }}
            >
              <ImageIcon size={10} />
              Gelbooru
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="md-icon-btn"
          style={{
            width: 48,
            height: 48,
            background: disabled || !input.trim()
              ? '#2B2B2B'
              : imageMode
                ? '#74B9FF'
                : '#D0BCFF',
            color: disabled || !input.trim() ? '#49454F' : '#381E72',
            marginBottom: 4,
            transition: 'all 0.2s ease',
          }}
          aria-label={imageMode ? 'Search images' : 'Send'}
        >
          {imageMode ? <ImageIcon size={22} /> : <ArrowUp size={22} />}
        </button>
      </div>
    </div>
  );
}
