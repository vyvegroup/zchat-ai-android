'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="flex px-4 py-1 justify-start"
    >
      <div className="md-bubble-ai px-5 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <motion.span
            className="rounded-full"
            style={{ width: 6, height: 6, background: '#D0BCFF' }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="rounded-full"
            style={{ width: 6, height: 6, background: '#D0BCFF' }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="rounded-full"
            style={{ width: 6, height: 6, background: '#D0BCFF' }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
