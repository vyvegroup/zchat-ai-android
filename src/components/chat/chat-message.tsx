'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { ImageIcon, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Message, ImageResult } from '@/stores/chat-store';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [lightboxImg, setLightboxImg] = useState<ImageResult | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const hasImages = message.images && message.images.length > 0;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openLightbox = (img: ImageResult) => {
    if (!hasImages) return;
    const idx = message.images!.findIndex((i) => i.url === img.url);
    setLightboxImg(img);
    setLightboxIdx(idx >= 0 ? idx : 0);
  };

  const navigateLightbox = (dir: number) => {
    if (!message.images) return;
    const newIdx = lightboxIdx + dir;
    if (newIdx >= 0 && newIdx < message.images.length) {
      setLightboxIdx(newIdx);
      setLightboxImg(message.images[newIdx]);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={cn('flex px-4 py-1', isUser ? 'justify-end' : 'justify-start')}
      >
        <div className={cn('max-w-[85%] px-4 py-2.5', isUser ? 'md-bubble-user' : 'md-bubble-ai')}>
          {/* Images Grid - show before text */}
          {hasImages && (
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {message.images!.map((img, idx) => (
                <div
                  key={img.url}
                  className="relative rounded-xl overflow-hidden cursor-pointer group/img"
                  style={{ aspectRatio: '1', background: '#1E1E1E' }}
                  onClick={() => openLightbox(img)}
                >
                  {/* eslint-disable-next-line @next/next/img */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1"
                  >
                    <ImageIcon size={14} style={{ color: 'white' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

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

      {/* Image Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)' }}
          onClick={() => setLightboxImg(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 md-icon-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Navigate buttons */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-3 z-10 md-icon-btn"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {lightboxIdx < (message.images?.length || 0) - 1 && (
            <button
              className="absolute right-3 z-10 md-icon-btn"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Counter */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#CAC4D0' }}
          >
            {lightboxIdx + 1} / {message.images?.length || 1}
          </div>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/img */}
          <img
            src={lightboxImg.url}
            alt={lightboxImg.name}
            className="max-w-[90vw] max-h-[85vh] max-h-[85dvh] object-contain rounded-lg"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Open in browser */}
          <button
            className="absolute top-4 left-4 z-10 md-icon-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            onClick={(e) => { e.stopPropagation(); window.open(lightboxImg.url, '_blank'); }}
            aria-label="Open in browser"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      )}
    </>
  );
}
