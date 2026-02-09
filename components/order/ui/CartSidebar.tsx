'use client';

import { motion } from 'framer-motion';
import type { CartItem } from '@/lib/order/types';

interface CartSidebarProps {
  items: CartItem[];
  activeIndex: number;
  onJumpTo: (index: number) => void;
  t: {
    sidebarTitle: string;
    configured: string;
    pending: string;
    current: string;
  };
}

export default function CartSidebar({ items, activeIndex, onJumpTo, t }: CartSidebarProps) {
  if (items.length <= 1) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[220px] shrink-0">
        <div className="sticky top-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-light-muted font-medium mb-3">{t.sidebarTitle}</p>
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const isDone = item.configured;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => onJumpTo(index)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2
                  ${isActive
                    ? 'bg-accent/10 border border-accent/30 text-light'
                    : isDone
                      ? 'bg-dark-card border border-dark-border text-light-subtle hover:border-light-muted/20'
                      : 'bg-dark-card border border-dark-border text-light-muted hover:border-light-muted/20'
                  }
                `}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold
                  ${isActive ? 'bg-accent text-white' : isDone ? 'bg-green-500/20 text-green-400' : 'bg-dark-border text-light-muted'}
                `}>
                  {isDone ? (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="truncate">{item.site.Nom}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile sticky header */}
      <div className="lg:hidden sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark/95 backdrop-blur-lg border-b border-dark-border">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const isDone = item.configured;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onJumpTo(index)}
                className={`
                  shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-accent text-white'
                    : isDone
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-dark-card text-light-muted border border-dark-border'
                  }
                `}
              >
                {item.site.Nom}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
