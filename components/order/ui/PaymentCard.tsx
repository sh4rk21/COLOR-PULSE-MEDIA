'use client';

import { motion } from 'framer-motion';

interface PaymentCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function PaymentCard({ icon, label, selected, onClick }: PaymentCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        relative p-4 rounded-xl text-center transition-all
        border focus:outline-none group
        ${selected
          ? 'border-accent/40 bg-accent/[0.06] shadow-[0_0_20px_rgba(0,122,255,0.08)]'
          : 'border-dark-border bg-dark-card hover:border-light-muted/20'
        }
      `}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      <div className={`
        text-2xl mb-2 transition-transform
        ${selected ? 'scale-110' : 'group-hover:scale-105'}
      `}>
        {icon}
      </div>
      <span className={`text-xs font-medium transition-colors ${selected ? 'text-accent' : 'text-light-muted group-hover:text-light-subtle'}`}>
        {label}
      </span>

      {selected && (
        <motion.div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,122,255,0.3)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
