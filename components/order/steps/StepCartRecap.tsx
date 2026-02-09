'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CartItemRow from '../ui/CartItemRow';
import type { CartItem, OrderMode } from '@/lib/order/types';
import { formatPrice } from '@/lib/order/pricing';
import { calculateCartTotal } from '@/lib/order/cart';

interface StepCartRecapProps {
  items: CartItem[];
  onEditItem: (index: number) => void;
  onRemoveItem: (id: string) => void;
  onAddMore: () => void;
  onContinue: () => void;
  modeLabels: Record<OrderMode, string>;
  t: {
    title: string;
    total: string;
    addMore: string;
    continuePayment: string;
    links: string;
    edit: string;
    remove: string;
    notConfigured: string;
    emptyCart: string;
    allConfigured: string;
    someNotConfigured: string;
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepCartRecap({
  items,
  onEditItem,
  onRemoveItem,
  onAddMore,
  onContinue,
  modeLabels,
  t,
}: StepCartRecapProps) {
  const total = calculateCartTotal(items);
  const allConfigured = items.every((item) => item.configured);
  const configuredCount = items.filter((item) => item.configured).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        <h2 className="text-lg font-medium text-light">{t.title}</h2>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <CartItemRow
              key={item.id}
              item={item}
              onEdit={() => onEditItem(index)}
              onRemove={() => onRemoveItem(item.id)}
              modeLabels={modeLabels}
              t={{
                links: t.links,
                edit: t.edit,
                remove: t.remove,
                notConfigured: t.notConfigured,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-light-muted text-sm">{t.emptyCart}</p>
        </div>
      )}

      {/* Status message */}
      {items.length > 0 && !allConfigured && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <svg className="w-4 h-4 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-xs text-yellow-400">{t.someNotConfigured} ({configuredCount}/{items.length})</p>
        </div>
      )}

      {/* Total */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-light">{t.total}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={total}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-bold text-accent"
              >
                {formatPrice(total)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={onAddMore}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-light-subtle bg-dark-card border border-dark-border hover:border-light-muted/20 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.addMore}
        </motion.button>

        <motion.button
          type="button"
          onClick={onContinue}
          disabled={!allConfigured || items.length === 0}
          className={`
            flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${allConfigured && items.length > 0
              ? 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(0,122,255,0.15)]'
              : 'bg-dark-card border border-dark-border text-light-muted cursor-not-allowed'
            }
          `}
          whileHover={allConfigured && items.length > 0 ? { scale: 1.02 } : undefined}
          whileTap={allConfigured && items.length > 0 ? { scale: 0.98 } : undefined}
        >
          {t.continuePayment}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
