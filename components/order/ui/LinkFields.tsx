'use client';

import { motion } from 'framer-motion';
import type { LinkDetail, Placement } from '@/lib/order/types';
import { PLACEMENT_OPTIONS } from '@/lib/order/constants';

interface LinkFieldsProps {
  index: number;
  link: LinkDetail;
  onChange: (index: number, link: LinkDetail) => void;
  onRemove?: (index: number) => void;
  canRemove: boolean;
  placementLabels: Record<Placement, string>;
}

export default function LinkFields({
  index,
  link,
  onChange,
  onRemove,
  canRemove,
  placementLabels,
}: LinkFieldsProps) {
  const handleChange = (field: keyof LinkDetail, value: string) => {
    onChange(index, { ...link, [field]: value });
  };

  return (
    <motion.div
      className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-dark-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-light-subtle">Lien {index + 1}</span>
        </div>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-light-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* URL */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1 font-medium">URL</label>
          <input
            type="url"
            value={link.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://example.com/page"
            className="form-input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Anchor */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1 font-medium">Ancre</label>
            <input
              type="text"
              value={link.anchor}
              onChange={(e) => handleChange('anchor', e.target.value)}
              placeholder="Mon texte d'ancre"
              className="form-input text-sm"
            />
          </div>

          {/* Placement */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1 font-medium">Placement</label>
            <select
              value={link.placement}
              onChange={(e) => handleChange('placement', e.target.value)}
              className="form-input text-sm"
            >
              {PLACEMENT_OPTIONS.map((placement) => (
                <option key={placement} value={placement}>
                  {placementLabels[placement]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
