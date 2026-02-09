'use client';

import { motion } from 'framer-motion';
import StarRating from './StarRating';
import MetricBadge from './MetricBadge';
import type { SitePricing, CatalogueView } from '@/lib/order/types';
import { formatPrice } from '@/lib/order/pricing';

interface SiteCardProps {
  site: SitePricing;
  selected: boolean;
  pinned?: boolean;
  variant?: CatalogueView;
  onToggle: () => void;
}

export default function SiteCard({ site, selected, pinned, variant = 'list', onToggle }: SiteCardProps) {
  if (variant === 'list') {
    return (
      <motion.button
        type="button"
        onClick={onToggle}
        className={`
          w-full text-left px-4 py-3 rounded-xl border transition-all relative
          ${selected
            ? 'bg-accent/[0.06] border-accent/40 shadow-[0_0_15px_rgba(0,122,255,0.06)]'
            : 'bg-dark-card border-dark-border hover:border-light-muted/20'
          }
          ${pinned ? 'ring-1 ring-accent/20' : ''}
        `}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div className={`
            flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-all
            ${selected ? 'bg-accent border-accent' : 'border-light-muted/30'}
          `}>
            {selected && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {/* Name + URL */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-light truncate">{site.Nom}</h3>
              {pinned && (
                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                </span>
              )}
            </div>
            <p className="text-xs text-light-muted truncate">
              {site.Site} &middot; {site.Thematique} &middot; {site.Langue}
            </p>
          </div>

          {/* Discover + GNews */}
          <div className="shrink-0 flex items-center gap-1.5">
            <StarRating score={site.Discover_Score} />
            {site.Google_News && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                GNews
              </span>
            )}
          </div>

          {/* Metrics */}
          <div className="shrink-0 hidden md:flex items-center gap-1.5">
            {site.TF > 0 && <MetricBadge label="TF" value={site.TF} />}
            {site.CF > 0 && <MetricBadge label="CF" value={site.CF} />}
            {site.RD > 0 && <MetricBadge label="RD" value={site.RD} />}
            {site.DR > 0 && <MetricBadge label="DR" value={site.DR} />}
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <p className="text-sm text-accent font-medium">{formatPrice(site.Prix_Lien)}+</p>
          </div>
        </div>
      </motion.button>
    );
  }

  // Grid variant
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all relative
        ${selected
          ? 'bg-accent/[0.06] border-accent/40 shadow-[0_0_20px_rgba(0,122,255,0.08)]'
          : 'bg-dark-card border-dark-border hover:border-light-muted/20'
        }
        ${pinned ? 'ring-1 ring-accent/20' : ''}
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Checkbox */}
      <div className="flex items-start gap-3">
        <div className={`
          flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 mt-0.5 transition-all
          ${selected ? 'bg-accent border-accent' : 'border-light-muted/30'}
        `}>
          {selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-light truncate">{site.Nom}</h3>
            {pinned && (
              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
              </span>
            )}
          </div>

          {/* URL + meta */}
          <p className="text-xs text-light-muted mb-2 truncate">
            {site.Site} &middot; {site.Thematique} &middot; {site.Langue}
          </p>

          {/* Discover + GNews */}
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating score={site.Discover_Score} />
            {site.Google_News && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                GNews
              </span>
            )}
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {site.TF > 0 && <MetricBadge label="TF" value={site.TF} />}
            {site.CF > 0 && <MetricBadge label="CF" value={site.CF} />}
            {site.RD > 0 && <MetricBadge label="RD" value={site.RD} />}
            {site.DR > 0 && <MetricBadge label="DR" value={site.DR} />}
          </div>

          {/* Price */}
          <p className="text-xs text-accent font-medium">
            {formatPrice(site.Prix_Lien)}+
          </p>
        </div>
      </div>
    </motion.button>
  );
}
