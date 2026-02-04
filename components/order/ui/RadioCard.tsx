'use client';

import { motion } from 'framer-motion';

interface RadioCardProps {
  icon: string;
  title: string;
  description: string;
  price: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function RadioCard({
  icon,
  title,
  description,
  price,
  selected,
  onClick,
  disabled = false,
}: RadioCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full p-5 sm:p-6 rounded-2xl text-left transition-all
        border focus:outline-none group
        ${selected
          ? 'border-accent/40 bg-accent/[0.06] shadow-[0_0_30px_rgba(0,122,255,0.08)]'
          : 'border-dark-border bg-dark-card hover:border-light-muted/20 hover:bg-dark-card/80'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-4">
        {/* Icon container */}
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-2xl
          transition-colors
          ${selected ? 'bg-accent/15' : 'bg-dark border border-dark-border group-hover:border-light-muted/20'}
        `}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium transition-colors ${selected ? 'text-light' : 'text-light-subtle'}`}>
            {title}
          </h3>
          <p className="mt-1 text-sm text-light-muted leading-relaxed">{description}</p>

          {/* Price - large and prominent */}
          <div className="mt-3 pt-3 border-t border-dark-border/50">
            <span className={`
              text-xl font-bold tracking-tight transition-colors
              ${selected ? 'text-accent' : 'text-light-subtle'}
            `}>
              {price}
            </span>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      <div className={`
        absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center
        transition-all
        ${selected ? 'border-accent bg-accent scale-100' : 'border-light-muted/30 scale-90'}
      `}>
        {selected && (
          <motion.svg
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
}
