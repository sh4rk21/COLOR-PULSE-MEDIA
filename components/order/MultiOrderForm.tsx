'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import StepCatalogue from './steps/StepCatalogue';
import StepModeSelection from './steps/StepModeSelection';
import StepOrderDetails from './steps/StepOrderDetails';
import StepCartRecap from './steps/StepCartRecap';
import StepCustomerInfo from './steps/StepCustomerInfo';
import StepPayment from './steps/StepPayment';
import CartSidebar from './ui/CartSidebar';
import type {
  OrderMode,
  LinkDetail,
  WordCount,
  PaymentMethod,
  SitePricing,
  CartItem,
  Placement,
} from '@/lib/order/types';
import { generateOrderReference } from '@/lib/order/types';
import { INITIAL_LINK } from '@/lib/order/constants';
import { calculatePrice, formatPrice } from '@/lib/order/pricing';
import { createCartItem, calculateCartTotal, removeCartItem } from '@/lib/order/cart';
import { validateStep1, validateStep2, validateStep3 } from '@/lib/order/validation';

interface MultiOrderFormProps {
  preselectedSite?: string;
  locale: string;
}

type Phase = 'catalogue' | 'configure' | 'recap' | 'customer' | 'payment';
type ConfigStep = 'mode' | 'details';

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function MultiOrderForm({ preselectedSite, locale }: MultiOrderFormProps) {
  const t = useTranslations('order');

  // Sites state
  const [sites, setSites] = useState<SitePricing[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  // Multi-order state
  const [phase, setPhase] = useState<Phase>('catalogue');
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [configStep, setConfigStep] = useState<ConfigStep>('mode');

  // Customer/payment state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch sites on mount
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/order/sites');
        const data = await response.json();

        if (data.success) {
          setSites(data.sites);

          // Pre-select site if provided
          if (preselectedSite) {
            const found = data.sites.find(
              (s: SitePricing) => s.Site.toLowerCase() === preselectedSite.toLowerCase()
            );
            if (found) {
              setSelectedSiteIds([found.Id]);
            }
          }
        } else {
          setSitesError(data.error || 'Failed to load sites');
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSitesError('Failed to load sites');
      } finally {
        setIsLoadingSites(false);
      }
    }

    fetchSites();
  }, [preselectedSite]);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('multi_order_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setName(parsed.name);
        // Cart items are restored when sites are loaded
        if (parsed.selectedSiteIds?.length && sites.length > 0) {
          setSelectedSiteIds(parsed.selectedSiteIds);
          // Rebuild cart items from saved data
          const restoredItems: CartItem[] = parsed.cartItemsData?.map((saved: { siteId: number; mode: OrderMode | null; links: LinkDetail[]; linkCount: number; wordCount: WordCount; briefing: string; titleIdea: string; price: number; configured: boolean }) => {
            const site = sites.find((s) => s.Id === saved.siteId);
            if (!site) return null;
            return {
              id: `${site.Id}-${Date.now()}-${Math.random()}`,
              site,
              mode: saved.mode,
              links: saved.links || [INITIAL_LINK()],
              linkCount: saved.linkCount || 1,
              wordCount: saved.wordCount || 800,
              briefing: saved.briefing || '',
              titleIdea: saved.titleIdea || '',
              articleFile: null,
              price: saved.price || 0,
              configured: saved.configured || false,
            } as CartItem;
          }).filter(Boolean) as CartItem[];

          if (restoredItems.length > 0) {
            setCartItems(restoredItems);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [sites]);

  // Save cart to localStorage
  useEffect(() => {
    if (cartItems.length > 0 || email) {
      const toSave = {
        selectedSiteIds,
        cartItemsData: cartItems.map((item) => ({
          siteId: item.site.Id,
          mode: item.mode,
          links: item.links,
          linkCount: item.linkCount,
          wordCount: item.wordCount,
          briefing: item.briefing,
          titleIdea: item.titleIdea,
          price: item.price,
          configured: item.configured,
        })),
        email,
        name,
      };
      localStorage.setItem('multi_order_cart', JSON.stringify(toSave));
    }
  }, [cartItems, selectedSiteIds, email, name]);

  // Toggle site selection in catalogue
  const handleToggleSite = useCallback((siteId: number) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  }, []);

  // Move from catalogue to configure
  const handleCatalogueContinue = useCallback(() => {
    const newItems: CartItem[] = selectedSiteIds.map((siteId) => {
      const existing = cartItems.find((item) => item.site.Id === siteId);
      if (existing) return existing;
      const site = sites.find((s) => s.Id === siteId);
      if (!site) return null;
      return createCartItem(site);
    }).filter(Boolean) as CartItem[];

    // Remove items for deselected sites
    setCartItems(newItems);
    setActiveConfigIndex(0);
    setConfigStep('mode');
    setPhase('configure');
  }, [selectedSiteIds, cartItems, sites]);

  // Current item being configured
  const activeItem = cartItems[activeConfigIndex] || null;

  // Update active cart item
  const updateActiveItem = useCallback((updates: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === activeConfigIndex ? { ...item, ...updates } : item))
    );
  }, [activeConfigIndex]);

  // Recalculate price when mode/links change in configure
  const recalculateActivePrice = useCallback(() => {
    if (!activeItem?.mode) return;
    const price = calculatePrice(
      activeItem.site,
      activeItem.mode,
      activeItem.links.length,
      activeItem.mode === 'redaction' ? activeItem.wordCount : undefined
    );
    updateActiveItem({ price });
  }, [activeItem, updateActiveItem]);

  // Move to next item or recap
  const handleConfigNext = useCallback(() => {
    if (configStep === 'mode') {
      if (activeItem && validateStep1(activeItem.mode)) {
        setConfigStep('details');
      }
      return;
    }

    // configStep === 'details'
    if (activeItem?.mode) {
      const validation = validateStep2(
        activeItem.mode,
        activeItem.links,
        activeItem.briefing,
        activeItem.wordCount
      );
      if (!validation.valid) return;

      // Calculate final price and mark as configured
      const price = calculatePrice(
        activeItem.site,
        activeItem.mode,
        activeItem.links.length,
        activeItem.mode === 'redaction' ? activeItem.wordCount : undefined
      );
      updateActiveItem({ configured: true, price });

      // Move to next unconfigured item or recap
      const nextUnconfigured = cartItems.findIndex(
        (item, i) => i > activeConfigIndex && !item.configured
      );
      if (nextUnconfigured !== -1) {
        setActiveConfigIndex(nextUnconfigured);
        setConfigStep('mode');
      } else {
        setPhase('recap');
      }
    }
  }, [configStep, activeItem, activeConfigIndex, cartItems, updateActiveItem]);

  const handleConfigBack = useCallback(() => {
    if (configStep === 'details') {
      setConfigStep('mode');
      return;
    }
    // configStep === 'mode', go back to previous item or catalogue
    if (activeConfigIndex > 0) {
      setActiveConfigIndex(activeConfigIndex - 1);
      setConfigStep('details');
    } else {
      setPhase('catalogue');
    }
  }, [configStep, activeConfigIndex]);

  // Jump to specific item in sidebar
  const handleJumpTo = useCallback((index: number) => {
    setActiveConfigIndex(index);
    setConfigStep(cartItems[index]?.configured ? 'mode' : 'mode');
  }, [cartItems]);

  // Recap actions
  const handleEditItem = useCallback((index: number) => {
    setActiveConfigIndex(index);
    setConfigStep('mode');
    setPhase('configure');
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCartItems((prev) => removeCartItem(prev, id));
    setSelectedSiteIds((prev) => {
      const item = cartItems.find((i) => i.id === id);
      return item ? prev.filter((sid) => sid !== item.site.Id) : prev;
    });
  }, [cartItems]);

  const handleAddMore = useCallback(() => {
    setPhase('catalogue');
  }, []);

  // Generate order reference when moving to payment
  const handleRecapContinue = useCallback(() => {
    if (!orderReference) {
      setOrderReference(generateOrderReference('MULTI'));
    }
    setPhase('customer');
  }, [orderReference]);

  const handleCustomerContinue = useCallback(() => {
    const validation = validateStep3(email);
    if (validation.valid) {
      setPhase('payment');
    }
  }, [email]);

  // Submit multi-order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !paymentMethod || !paymentConfirmed) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      // Upload files for items that have them
      const itemsWithUrls = await Promise.all(
        cartItems.map(async (item) => {
          let fileUrl: string | undefined;
          if (item.articleFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', item.articleFile);
            const uploadResponse = await fetch('/api/order/upload', {
              method: 'POST',
              body: uploadFormData,
            });
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              fileUrl = uploadResult.url;
            }
          }
          return {
            site: item.site.Site,
            siteName: item.site.Nom,
            mode: item.mode!,
            links: item.links,
            ...(item.mode === 'redaction' && {
              wordCount: item.wordCount,
              briefing: item.briefing,
              titleIdea: item.titleIdea,
            }),
            fileUrl: fileUrl || item.fileUrl,
            price: item.price,
          };
        })
      );

      const totalPrice = calculateCartTotal(cartItems);

      const payload = {
        items: itemsWithUrls,
        email,
        name: name || undefined,
        paymentMethod,
        totalPrice,
        orderReference,
      };

      const response = await fetch('/api/order/submit-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      setSubmitStatus('success');
      localStorage.removeItem('multi_order_cart');
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Translation objects for child components ----
  const catalogueTranslations = {
    title: t('catalogue.title'),
    subtitle: t('catalogue.subtitle'),
    filterLangue: t('filterLangue'),
    filterThematique: t('filterThematique'),
    filterGoogleNews: t('catalogue.filterGoogleNews'),
    filterDiscover: t('catalogue.filterDiscover'),
    allLangues: t('allLangues'),
    allThematiques: t('allThematiques'),
    search: t('catalogue.search'),
    searchPlaceholder: t('catalogue.searchPlaceholder'),
    drRange: t('catalogue.drRange'),
    selectedCount: t('catalogue.selectedCount'),
    configure: t('catalogue.configure'),
    noResults: t('catalogue.noResults'),
    resetFilters: t('catalogue.resetFilters'),
    viewList: t('catalogue.viewList'),
    viewGrid: t('catalogue.viewGrid'),
  };

  const modeTranslations = {
    lien_seul: {
      title: t('modes.lien_seul.title'),
      description: t('modes.lien_seul.description'),
    },
    article_fourni: {
      title: t('modes.article_fourni.title'),
      description: t('modes.article_fourni.description'),
    },
    redaction: {
      title: t('modes.redaction.title'),
      description: t('modes.redaction.description'),
    },
  };

  const modeLabels: Record<OrderMode, string> = {
    lien_seul: t('modes.lien_seul.title'),
    article_fourni: t('modes.article_fourni.title'),
    redaction: t('modes.redaction.title'),
  };

  const detailsTranslations = {
    linkCount: t('details.linkCount'),
    links: t('details.link'),
    linkPlural: t('details.links'),
    uploadArticle: t('details.uploadArticle'),
    uploadHint: t('details.uploadHint'),
    briefing: t('details.briefing'),
    briefingHint: t('details.briefingHint'),
    titleIdea: t('details.titleIdea'),
    titleIdeaPlaceholder: t('details.titleIdeaPlaceholder'),
    wordCount: t('details.wordCount'),
    words: t('details.words'),
    attachments: t('details.attachments'),
    attachmentsHint: t('details.attachmentsHint'),
    extraLink: t('details.extraLink'),
    placements: {
      whatever: t('placements.whatever'),
      first: t('placements.first'),
      middle: t('placements.middle'),
      end: t('placements.end'),
    } as Record<Placement, string>,
  };

  const customerTranslations = {
    email: t('customer.email'),
    emailPlaceholder: t('customer.emailPlaceholder'),
    name: t('customer.name'),
    namePlaceholder: t('customer.namePlaceholder'),
    nameHint: t('customer.nameHint'),
  };

  const paymentTranslations = {
    summary: t('payment.summary'),
    mode: t('payment.mode'),
    modeLabels,
    links: t('payment.links'),
    wordCount: t('payment.wordCount'),
    words: t('details.words'),
    total: t('payment.total'),
    paymentMethod: t('payment.paymentMethod'),
    instructions: t('payment.instructions'),
    paypalInstructions: t('payment.paypalInstructions'),
    revolutInstructions: t('payment.revolutInstructions'),
    sepaInstructions: t('payment.sepaInstructions'),
    achInstructions: t('payment.achInstructions'),
    swiftInstructions: t('payment.swiftInstructions'),
    internationalInstructions: t('payment.internationalInstructions'),
    confirmPayment: t('payment.confirmPayment'),
    submit: t('payment.submit'),
    submitting: t('payment.submitting'),
    iban: t('payment.iban'),
    bic: t('payment.bic'),
    beneficiary: t('payment.beneficiary'),
    address: t('payment.address'),
    accountNumber: t('payment.accountNumber'),
    routingNumber: t('payment.routingNumber'),
    swiftCode: t('payment.swiftCode'),
    bankName: t('payment.bankName'),
    bankAddress: t('payment.bankAddress'),
    email: t('payment.email'),
    tag: t('payment.tag'),
    referenceLabel: t('payment.referenceLabel'),
  };

  const sidebarTranslations = {
    sidebarTitle: t('sidebar.title'),
    configured: t('sidebar.configured'),
    pending: t('sidebar.pending'),
    current: t('sidebar.current'),
  };

  const recapTranslations = {
    title: t('cart.title'),
    total: t('payment.total'),
    addMore: t('cart.addMore'),
    continuePayment: t('cart.continuePayment'),
    links: t('details.links'),
    edit: t('cart.edit'),
    remove: t('cart.remove'),
    notConfigured: t('cart.notConfigured'),
    emptyCart: t('cart.emptyCart'),
    allConfigured: t('cart.allConfigured'),
    someNotConfigured: t('cart.someNotConfigured'),
  };

  // ---- Validation for configure step ----
  const canProceedConfig = useCallback((): boolean => {
    if (!activeItem) return false;
    if (configStep === 'mode') return validateStep1(activeItem.mode);
    // details
    if (!activeItem.mode) return false;
    return validateStep2(activeItem.mode, activeItem.links, activeItem.briefing, activeItem.wordCount).valid;
  }, [activeItem, configStep]);

  // ---- Loading state ----
  if (isLoadingSites) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-dark-border" />
            <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <p className="text-light-muted text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (sitesError) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-light mb-2">{t('errors.loadingFailed')}</h1>
        <p className="text-sm text-light-muted">{sitesError}</p>
      </div>
    );
  }

  // ---- Success state ----
  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6"
        >
          <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-medium text-light mb-3"
        >
          {t('success.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-light-muted max-w-md mx-auto leading-relaxed"
        >
          {t('success.message')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20"
        >
          <span className="text-xs text-light-muted">{t('payment.referenceLabel')}:</span>
          <span className="text-sm font-mono font-bold text-accent">{orderReference}</span>
        </motion.div>
        {cartItems.length > 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3 text-sm text-light-muted"
          >
            {cartItems.length} sites &middot; {formatPrice(calculateCartTotal(cartItems))}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Active item price preview
  const activePrice = activeItem?.mode
    ? calculatePrice(
        activeItem.site,
        activeItem.mode,
        activeItem.links.length,
        activeItem.mode === 'redaction' ? activeItem.wordCount : undefined
      )
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6M23 11h-6" />
          </svg>
          {locale === 'fr' ? '// Espace commande' : '// Order portal'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-light mb-2 tracking-tight">{t('title')}</h1>
        <p className="text-light-muted text-sm sm:text-base">{t('subtitle')}</p>
      </motion.div>

      {/* Phase: Catalogue */}
      <AnimatePresence mode="wait">
        {phase === 'catalogue' && (
          <motion.div
            key="catalogue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StepCatalogue
              sites={sites}
              selectedSiteIds={selectedSiteIds}
              onToggleSite={handleToggleSite}
              preselectedSite={preselectedSite}
              onContinue={handleCatalogueContinue}
              t={catalogueTranslations}
            />
          </motion.div>
        )}

        {/* Phase: Configure */}
        {phase === 'configure' && activeItem && (
          <motion.div
            key="configure"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-6"
          >
            {/* Sidebar */}
            <CartSidebar
              items={cartItems}
              activeIndex={activeConfigIndex}
              onJumpTo={handleJumpTo}
              t={sidebarTranslations}
            />

            {/* Config content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Active site badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/15">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-light truncate">{activeItem.site.Nom}</p>
                  <p className="text-xs text-light-muted">
                    {activeItem.site.Site} &middot; {activeItem.site.Thematique} &middot; {activeItem.site.Langue}
                    {cartItems.length > 1 && (
                      <span className="ml-2 text-accent">
                        ({activeConfigIndex + 1}/{cartItems.length})
                      </span>
                    )}
                  </p>
                </div>
                {activePrice !== null && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-light-muted">{t('pricePreview')}</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activePrice}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xl font-bold text-accent"
                      >
                        {formatPrice(activePrice)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Config step indicator */}
              <div className="flex items-center gap-2 text-xs text-light-muted">
                <span className={`px-2 py-0.5 rounded ${configStep === 'mode' ? 'bg-accent/10 text-accent' : 'bg-dark-border text-light-muted'}`}>
                  1. {t('steps.mode')}
                </span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" strokeLinecap="round" />
                </svg>
                <span className={`px-2 py-0.5 rounded ${configStep === 'details' ? 'bg-accent/10 text-accent' : 'bg-dark-border text-light-muted'}`}>
                  2. {t('steps.details')}
                </span>
              </div>

              {/* Step content */}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {configStep === 'mode' && (
                    <StepModeSelection
                      key={`mode-${activeItem.id}`}
                      selectedMode={activeItem.mode}
                      onModeSelect={(mode) => updateActiveItem({ mode })}
                      pricing={activeItem.site}
                      t={modeTranslations}
                    />
                  )}

                  {configStep === 'details' && activeItem.mode && (
                    <StepOrderDetails
                      key={`details-${activeItem.id}`}
                      mode={activeItem.mode}
                      links={activeItem.links}
                      linkCount={activeItem.linkCount}
                      wordCount={activeItem.wordCount}
                      briefing={activeItem.briefing}
                      titleIdea={activeItem.titleIdea}
                      articleFile={activeItem.articleFile}
                      pricing={activeItem.site}
                      onLinksChange={(links) => updateActiveItem({ links })}
                      onLinkCountChange={(linkCount) => updateActiveItem({ linkCount })}
                      onWordCountChange={(wordCount) => updateActiveItem({ wordCount })}
                      onBriefingChange={(briefing) => updateActiveItem({ briefing })}
                      onTitleIdeaChange={(titleIdea) => updateActiveItem({ titleIdea })}
                      onFileChange={(articleFile) => updateActiveItem({ articleFile })}
                      t={detailsTranslations}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4 pt-2">
                <motion.button
                  type="button"
                  onClick={handleConfigBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm text-light-subtle hover:text-light bg-dark-card border border-dark-border hover:border-light-muted/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t('navigation.back')}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleConfigNext}
                  disabled={!canProceedConfig()}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-sm
                    ${canProceedConfig()
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(0,122,255,0.15)]'
                      : 'bg-dark-card border border-dark-border text-light-muted cursor-not-allowed'
                    }
                  `}
                  whileHover={canProceedConfig() ? { scale: 1.02 } : undefined}
                  whileTap={canProceedConfig() ? { scale: 0.98 } : undefined}
                >
                  {t('navigation.next')}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase: Recap */}
        {phase === 'recap' && (
          <motion.div
            key="recap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StepCartRecap
              items={cartItems}
              onEditItem={handleEditItem}
              onRemoveItem={handleRemoveItem}
              onAddMore={handleAddMore}
              onContinue={handleRecapContinue}
              modeLabels={modeLabels}
              t={recapTranslations}
            />
          </motion.div>
        )}

        {/* Phase: Customer */}
        {phase === 'customer' && (
          <motion.div
            key="customer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <StepCustomerInfo
              email={email}
              name={name}
              onEmailChange={setEmail}
              onNameChange={setName}
              t={customerTranslations}
            />

            {/* Navigation */}
            <div className="flex justify-between gap-4 pt-2">
              <motion.button
                type="button"
                onClick={() => setPhase('recap')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm text-light-subtle hover:text-light bg-dark-card border border-dark-border hover:border-light-muted/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('navigation.back')}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleCustomerContinue}
                disabled={!validateStep3(email).valid}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-sm
                  ${validateStep3(email).valid
                    ? 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(0,122,255,0.15)]'
                    : 'bg-dark-card border border-dark-border text-light-muted cursor-not-allowed'
                  }
                `}
                whileHover={validateStep3(email).valid ? { scale: 1.02 } : undefined}
                whileTap={validateStep3(email).valid ? { scale: 0.98 } : undefined}
              >
                {t('navigation.next')}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase: Payment */}
        {phase === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <StepPayment
              mode={cartItems[0]?.mode || 'lien_seul'}
              links={cartItems[0]?.links || []}
              wordCount={cartItems[0]?.mode === 'redaction' ? cartItems[0]?.wordCount : undefined}
              email={email}
              name={name}
              pricing={cartItems[0]?.site || sites[0]}
              paymentMethod={paymentMethod}
              paymentConfirmed={paymentConfirmed}
              onPaymentMethodChange={setPaymentMethod}
              onPaymentConfirmedChange={setPaymentConfirmed}
              isSubmitting={isSubmitting}
              locale={locale}
              orderReference={orderReference}
              t={paymentTranslations}
              cartItems={cartItems}
              cartTotal={calculateCartTotal(cartItems)}
            />

            {/* Error Message */}
            <AnimatePresence>
              {submitStatus === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back button */}
            <motion.button
              type="button"
              onClick={() => setPhase('customer')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm text-light-subtle hover:text-light bg-dark-card border border-dark-border hover:border-light-muted/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('navigation.back')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
