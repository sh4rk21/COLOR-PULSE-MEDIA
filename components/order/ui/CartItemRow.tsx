'use client';

import { motion } from 'framer-motion';
import type { CartItem, OrderMode } from '@/lib/order/types';
import { formatPrice } from '@/lib/order/pricing';

interface CartItemRowProps {
  item: CartItem;
  onEdit: () => void;
  onRemove: () => void;
  modeLabels: Record<OrderMode, string>;
  t: {
    links: string;
    edit: string;
    remove: string;
    notConfigured: string;
  };
}

export default function CartItemRow({ item, onEdit, onRemove, modeLabels, t }: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-border group"
    >
      {/* Status */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${item.configured ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}
      `}>
        {item.configured ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-light truncate">{item.site.Nom}</p>
        {item.configured && item.mode ? (
          <p className="text-xs text-light-muted">
            {modeLabels[item.mode]} &middot; {item.links.length} {t.links}
          </p>
        ) : (
          <p className="text-xs text-yellow-400/70">{t.notConfigured}</p>
        )}
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        {item.configured && item.price > 0 ? (
          <span className="text-sm font-bold text-accent">{formatPrice(item.price)}</span>
        ) : (
          <span className="text-xs text-light-muted">--</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-accent/10 text-light-muted hover:text-accent transition-colors"
          title={t.edit}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-light-muted hover:text-red-400 transition-colors"
          title={t.remove}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
