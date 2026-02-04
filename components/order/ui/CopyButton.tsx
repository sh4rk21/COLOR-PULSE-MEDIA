'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-dark-card border border-dark-border hover:border-accent/50
        text-sm text-light-subtle hover:text-light
        transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label && <span className="text-light-muted">{label}:</span>}
      <span className="font-mono">{text}</span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.svg
            key="check"
            className="w-4 h-4 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
