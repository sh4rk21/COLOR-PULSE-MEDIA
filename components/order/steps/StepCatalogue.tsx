'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SiteCard from '../ui/SiteCard';
import type { SitePricing, CatalogueFilters, CatalogueView } from '@/lib/order/types';

interface StepCatalogueProps {
  sites: SitePricing[];
  selectedSiteIds: number[];
  onToggleSite: (siteId: number) => void;
  preselectedSite?: string;
  onContinue: () => void;
  t: {
    title: string;
    subtitle: string;
    filterLangue: string;
    filterThematique: string;
    filterGoogleNews: string;
    filterDiscover: string;
    allLangues: string;
    allThematiques: string;
    search: string;
    searchPlaceholder: string;
    drRange: string;
    selectedCount: string;
    configure: string;
    noResults: string;
    resetFilters: string;
    viewList: string;
    viewGrid: string;
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepCatalogue({
  sites,
  selectedSiteIds,
  onToggleSite,
  preselectedSite,
  onContinue,
  t,
}: StepCatalogueProps) {
  const [filters, setFilters] = useState<CatalogueFilters>({
    langue: '',
    thematique: '',
    googleNews: null,
    discoverMin: 0,
    drMin: 0,
    drMax: 100,
    search: '',
  });

  const [view, setView] = useState<CatalogueView>('list');

  const langues = useMemo(() => [...new Set(sites.map((s) => s.Langue))].sort(), [sites]);
  const thematiques = useMemo(
    () =>
      [...new Set(
        sites
          .filter((s) => !filters.langue || s.Langue === filters.langue)
          .map((s) => s.Thematique)
      )].sort(),
    [sites, filters.langue]
  );

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (filters.langue && s.Langue !== filters.langue) return false;
      if (filters.thematique && s.Thematique !== filters.thematique) return false;
      if (filters.googleNews === true && !s.Google_News) return false;
      if (filters.discoverMin > 0 && s.Discover_Score < filters.discoverMin) return false;
      if (filters.drMin > 0 && s.DR < filters.drMin) return false;
      if (filters.drMax < 100 && s.DR > filters.drMax) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !s.Nom.toLowerCase().includes(q) &&
          !s.Site.toLowerCase().includes(q) &&
          !s.Thematique.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [sites, filters]);

  // Sort: pinned first, then alphabetical
  const sortedSites = useMemo(() => {
    const pinned = preselectedSite?.toLowerCase();
    return [...filteredSites].sort((a, b) => {
      const aPin = pinned && a.Site.toLowerCase() === pinned;
      const bPin = pinned && b.Site.toLowerCase() === pinned;
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return a.Nom.localeCompare(b.Nom);
    });
  }, [filteredSites, preselectedSite]);

  const hasFilters = filters.langue || filters.thematique || filters.googleNews !== null || filters.discoverMin > 0 || filters.drMin > 0 || filters.drMax < 100 || filters.search;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-6"
    >
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder={t.searchPlaceholder}
          className="form-input pl-10 text-sm"
        />
      </div>

      {/* Filters row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-light-muted mb-1 font-medium">{t.filterLangue}</label>
          <select
            value={filters.langue}
            onChange={(e) => setFilters((f) => ({ ...f, langue: e.target.value, thematique: '' }))}
            className="form-input text-xs"
          >
            <option value="">{t.allLangues}</option>
            {langues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-light-muted mb-1 font-medium">{t.filterThematique}</label>
          <select
            value={filters.thematique}
            onChange={(e) => setFilters((f) => ({ ...f, thematique: e.target.value }))}
            className="form-input text-xs"
          >
            <option value="">{t.allThematiques}</option>
            {thematiques.map((th) => (
              <option key={th} value={th}>{th}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-light-muted mb-1 font-medium">{t.filterGoogleNews}</label>
          <select
            value={filters.googleNews === null ? '' : filters.googleNews ? 'yes' : 'no'}
            onChange={(e) => {
              const v = e.target.value;
              setFilters((f) => ({ ...f, googleNews: v === '' ? null : v === 'yes' }));
            }}
            className="form-input text-xs"
          >
            <option value="">--</option>
            <option value="yes">Google News</option>
            <option value="no">Non GNews</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-light-muted mb-1 font-medium">{t.filterDiscover}</label>
          <select
            value={filters.discoverMin || ''}
            onChange={(e) => setFilters((f) => ({ ...f, discoverMin: parseInt(e.target.value) || 0 }))}
            className="form-input text-xs"
          >
            <option value="">--</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-light-muted mb-1 font-medium">{t.drRange}</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              value={filters.drMin || ''}
              onChange={(e) => setFilters((f) => ({ ...f, drMin: parseInt(e.target.value) || 0 }))}
              placeholder="Min"
              className="form-input text-xs w-full"
            />
            <span className="text-light-muted text-xs">-</span>
            <input
              type="number"
              min={0}
              max={100}
              value={filters.drMax < 100 ? filters.drMax : ''}
              onChange={(e) => setFilters((f) => ({ ...f, drMax: parseInt(e.target.value) || 100 }))}
              placeholder="Max"
              className="form-input text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Results count + view toggle + reset */}
      <div className="flex items-center justify-between text-xs text-light-muted">
        <span>{sortedSites.length} site{sortedSites.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters({ langue: '', thematique: '', googleNews: null, discoverMin: 0, drMin: 0, drMax: 100, search: '' })}
              className="text-accent hover:text-accent-hover transition-colors"
            >
              {t.resetFilters}
            </button>
          )}
          {/* View toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-dark-card border border-dark-border">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-accent/15 text-accent' : 'text-light-muted hover:text-light'}`}
              title={t.viewList}
            >
              {/* List icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-accent/15 text-accent' : 'text-light-muted hover:text-light'}`}
              title={t.viewGrid}
            >
              {/* Grid icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sites - List or Grid */}
      <div className={
        view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
          : 'flex flex-col gap-2'
      }>
        <AnimatePresence mode="popLayout">
          {sortedSites.map((site, index) => (
            <motion.div
              key={site.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
            >
              <SiteCard
                site={site}
                selected={selectedSiteIds.includes(site.Id)}
                pinned={preselectedSite?.toLowerCase() === site.Site.toLowerCase()}
                variant={view}
                onToggle={() => onToggleSite(site.Id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sortedSites.length === 0 && (
        <div className="text-center py-12">
          <p className="text-light-muted text-sm">{t.noResults}</p>
        </div>
      )}

      {/* Bottom action bar */}
      <AnimatePresence>
        {selectedSiteIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 z-20"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-card/95 border border-accent/30 backdrop-blur-lg shadow-[0_0_30px_rgba(0,122,255,0.1)]">
              <span className="text-sm text-light">
                <span className="font-bold text-accent">{selectedSiteIds.length}</span>{' '}
                {t.selectedCount}
              </span>
              <motion.button
                type="button"
                onClick={onContinue}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-[0_0_20px_rgba(0,122,255,0.15)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.configure} {selectedSiteIds.length} site{selectedSiteIds.length > 1 ? 's' : ''}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
