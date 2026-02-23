'use client';

import { motion, AnimatePresence } from 'framer-motion';
import LinkFields from '../ui/LinkFields';
import FileUpload from '../ui/FileUpload';
import type { OrderMode, LinkDetail, WordCount, SitePricing, Placement } from '@/lib/order/types';
import { MAX_LINKS, INITIAL_LINK, WORD_COUNT_OPTIONS } from '@/lib/order/constants';
import { formatPrice } from '@/lib/order/pricing';

interface StepOrderDetailsProps {
  mode: OrderMode;
  links: LinkDetail[];
  linkCount: number;
  wordCount: WordCount;
  briefing: string;
  titleIdea: string;
  articleFile: File | null;
  pricing: SitePricing;
  onLinksChange: (links: LinkDetail[]) => void;
  onLinkCountChange: (count: number) => void;
  onWordCountChange: (count: WordCount) => void;
  onBriefingChange: (briefing: string) => void;
  onTitleIdeaChange: (title: string) => void;
  onFileChange: (file: File | null) => void;
  t: {
    linkCount: string;
    links: string;
    linkPlural: string;
    uploadArticle: string;
    uploadHint: string;
    briefing: string;
    briefingHint: string;
    titleIdea: string;
    titleIdeaPlaceholder: string;
    wordCount: string;
    words: string;
    attachments: string;
    attachmentsHint: string;
    extraLink: string;
    placements: Record<Placement, string>;
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepOrderDetails({
  mode,
  links,
  linkCount,
  wordCount,
  briefing,
  titleIdea,
  articleFile,
  pricing,
  onLinksChange,
  onLinkCountChange,
  onWordCountChange,
  onBriefingChange,
  onTitleIdeaChange,
  onFileChange,
  t,
}: StepOrderDetailsProps) {
  const handleLinkChange = (index: number, link: LinkDetail) => {
    const newLinks = [...links];
    newLinks[index] = link;
    onLinksChange(newLinks);
  };

  const handleLinkCountChange = (count: number) => {
    onLinkCountChange(count);
    if (count > links.length) {
      const newLinks = [...links];
      while (newLinks.length < count) {
        newLinks.push(INITIAL_LINK());
      }
      onLinksChange(newLinks);
    } else if (count < links.length) {
      onLinksChange(links.slice(0, count));
    }
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onLinksChange(newLinks);
    onLinkCountChange(newLinks.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-6"
    >
      {/* Mode: Article fourni - File Upload */}
      {mode === 'article_fourni' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FileUpload
            onFileSelect={onFileChange}
            selectedFile={articleFile}
            label={t.uploadArticle}
            hint={t.uploadHint}
          />
        </motion.div>
      )}

      {/* Mode: Redaction - Briefing & Options */}
      {mode === 'redaction' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-dark-card border border-dark-border"
          >
            <label className="flex items-center gap-2 text-sm text-light-subtle mb-3">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t.briefing}
            </label>
            <textarea
              value={briefing}
              onChange={(e) => onBriefingChange(e.target.value)}
              placeholder={t.briefingHint}
              rows={4}
              className="form-input resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-light-muted">
                {briefing.length}/500
              </p>
              {briefing.length >= 20 && (
                <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1.5 font-medium">{t.titleIdea}</label>
            <input
              type="text"
              value={titleIdea}
              onChange={(e) => onTitleIdeaChange(e.target.value)}
              placeholder={t.titleIdeaPlaceholder}
              className="form-input"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-2 font-medium">{t.wordCount}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {WORD_COUNT_OPTIONS.map((count) => {
                const wordPriceKey = `Prix_${count}_Mots` as keyof SitePricing;
                const wordPrice = pricing[wordPriceKey] as number;
                const isSelected = wordCount === count;

                return (
                  <motion.button
                    key={count}
                    type="button"
                    onClick={() => onWordCountChange(count)}
                    className={`
                      p-3 rounded-xl border text-center transition-all
                      ${isSelected
                        ? 'border-accent/40 bg-accent/[0.06] shadow-[0_0_15px_rgba(0,122,255,0.06)]'
                        : 'border-dark-border bg-dark-card hover:border-light-muted/20'
                      }
                    `}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`font-medium ${isSelected ? 'text-light' : 'text-light-subtle'}`}>{count}</div>
                    <div className="text-xs text-light-muted">{t.words}</div>
                    {wordPrice > 0 && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-accent' : 'text-accent/60'}`}>+{formatPrice(wordPrice)}</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FileUpload
              onFileSelect={onFileChange}
              selectedFile={articleFile}
              label={t.attachments}
              hint={t.attachmentsHint}
              optional
            />
          </motion.div>
        </>
      )}

      {/* Link Count Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: mode === 'redaction' ? 0.5 : 0.2 }}
      >
        <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-2 font-medium">
          {t.linkCount}
          {pricing.Prix_Lien_Sup != null && pricing.Prix_Lien_Sup > 0 && (
            <span className="normal-case tracking-normal ml-2 text-light-muted/60">
              ({t.extraLink}: +{formatPrice(pricing.Prix_Lien_Sup)})
            </span>
          )}
        </label>
        <div className="flex gap-2.5">
          {[1, 2, 3].map((count) => (
            <motion.button
              key={count}
              type="button"
              onClick={() => handleLinkCountChange(count)}
              className={`
                flex-1 p-3 rounded-xl border text-center transition-all
                ${linkCount === count
                  ? 'border-accent/40 bg-accent/[0.06]'
                  : 'border-dark-border bg-dark-card hover:border-light-muted/20'
                }
              `}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={`font-medium ${linkCount === count ? 'text-light' : 'text-light-subtle'}`}>{count}</span>
              <span className="text-xs text-light-muted ml-1.5">
                {count === 1 ? t.links : t.linkPlural}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Link Fields */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: mode === 'redaction' ? 0.6 : 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {links.map((link, index) => (
            <LinkFields
              key={index}
              index={index}
              link={link}
              onChange={handleLinkChange}
              onRemove={handleRemoveLink}
              canRemove={links.length > 1}
              placementLabels={t.placements}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
