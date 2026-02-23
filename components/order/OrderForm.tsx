'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Stepper from './Stepper';
import StepModeSelection from './steps/StepModeSelection';
import StepOrderDetails from './steps/StepOrderDetails';
import StepCustomerInfo from './steps/StepCustomerInfo';
import StepPayment from './steps/StepPayment';
import type {
  OrderMode,
  LinkDetail,
  WordCount,
  PaymentMethod,
  SitePricing,
  OrderFormData,
  Placement,
} from '@/lib/order/types';
import { generateOrderReference } from '@/lib/order/types';
import { INITIAL_LINK } from '@/lib/order/constants';
import { calculatePrice, formatPrice } from '@/lib/order/pricing';
import { validateStep1, validateStep2, validateStep3 } from '@/lib/order/validation';

interface OrderFormProps {
  preselectedSite?: string;
  locale: string;
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function OrderForm({ preselectedSite, locale }: OrderFormProps) {
  const t = useTranslations('order');

  // Sites state
  const [sites, setSites] = useState<SitePricing[]>([]);
  const [selectedSite, setSelectedSite] = useState<SitePricing | null>(null);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [filterLangue, setFilterLangue] = useState<string>('');
  const [filterThematique, setFilterThematique] = useState<string>('');

  const [currentStep, setCurrentStep] = useState(1);
  const [orderReference, setOrderReference] = useState<string>('');
  const [formData, setFormData] = useState<OrderFormData>({
    mode: null,
    links: [INITIAL_LINK()],
    linkCount: 1,
    wordCount: 800,
    briefing: '',
    titleIdea: '',
    articleFile: null,
    email: '',
    name: '',
    paymentMethod: null,
    paymentConfirmed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const steps = [
    t('steps.mode'),
    t('steps.details'),
    t('steps.info'),
    t('steps.payment'),
  ];

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
              setSelectedSite(found);
              setOrderReference(generateOrderReference(found.Nom));
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

  // Load form data from localStorage when site changes
  useEffect(() => {
    if (selectedSite) {
      const saved = localStorage.getItem(`order_${selectedSite.Site}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            articleFile: null,
          }));
        } catch {
          // Ignore parse errors
        }
      } else {
        setFormData({
          mode: null,
          links: [INITIAL_LINK()],
          linkCount: 1,
          wordCount: 800,
          briefing: '',
          titleIdea: '',
          articleFile: null,
          email: '',
          name: '',
          paymentMethod: null,
          paymentConfirmed: false,
        });
        setCurrentStep(1);
      }
    }
  }, [selectedSite]);

  // Save to localStorage on change
  useEffect(() => {
    if (selectedSite) {
      const toSave = { ...formData, articleFile: null };
      localStorage.setItem(`order_${selectedSite.Site}`, JSON.stringify(toSave));
    }
  }, [formData, selectedSite]);

  const getValidationErrors = useCallback((): string[] => {
    if (!selectedSite) return ['Sélectionnez un site'];

    switch (currentStep) {
      case 1:
        return validateStep1(formData.mode) ? [] : ['Sélectionnez un mode'];
      case 2:
        return validateStep2(
          formData.mode!,
          formData.links,
          formData.briefing,
          formData.wordCount
        ).errors;
      case 3:
        return validateStep3(formData.email).errors;
      case 4:
        const errors: string[] = [];
        if (!formData.paymentMethod) errors.push('Sélectionnez un mode de paiement');
        if (!formData.paymentConfirmed) errors.push('Confirmez le paiement');
        return errors;
      default:
        return [];
    }
  }, [currentStep, formData, selectedSite]);

  const canProceed = useCallback((): boolean => {
    return getValidationErrors().length === 0;
  }, [getValidationErrors]);

  // Update validation errors when form data changes
  useEffect(() => {
    setValidationErrors(getValidationErrors());
  }, [getValidationErrors]);

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSiteChange = (siteId: string) => {
    const site = sites.find((s) => s.Site === siteId);
    if (site) {
      setSelectedSite(site);
      setOrderReference(generateOrderReference(site.Nom));
      const url = new URL(window.location.href);
      url.searchParams.set('site', site.Site);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canProceed() || isSubmitting || !selectedSite) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      let fileUrl: string | undefined;
      if (formData.articleFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.articleFile);

        const uploadResponse = await fetch('/api/order/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        }
      }

      const totalPrice = calculatePrice(
        selectedSite,
        formData.mode!,
        formData.links.length,
        formData.mode === 'redaction' ? formData.wordCount : undefined
      );

      const payload = {
        site: selectedSite.Site,
        siteName: selectedSite.Nom,
        mode: formData.mode!,
        links: formData.links,
        ...(formData.mode === 'redaction' && {
          wordCount: formData.wordCount,
          briefing: formData.briefing,
          titleIdea: formData.titleIdea,
        }),
        email: formData.email,
        name: formData.name || undefined,
        paymentMethod: formData.paymentMethod!,
        totalPrice,
        fileUrl,
        orderReference,
      };

      const response = await fetch('/api/order/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      setSubmitStatus('success');
      localStorage.removeItem(`order_${selectedSite.Site}`);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Translations objects for child components
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
    unavailable: t('modes.unavailable'),
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
    modeLabels: {
      lien_seul: t('modes.lien_seul.title'),
      article_fourni: t('modes.article_fourni.title'),
      redaction: t('modes.redaction.title'),
    } as Record<OrderMode, string>,
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

  // Derived data
  const langues = [...new Set(sites.map((s) => s.Langue))].sort();
  const thematiques = [...new Set(
    sites
      .filter((s) => (!filterLangue || s.Langue === filterLangue))
      .map((s) => s.Thematique)
  )].sort();
  const filteredSites = sites.filter(
    (s) => (!filterLangue || s.Langue === filterLangue) && (!filterThematique || s.Thematique === filterThematique)
  );

  // Loading state
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

  // Error state
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

  // Success state
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
      </motion.div>
    );
  }

  const currentPrice = formData.mode && selectedSite
    ? calculatePrice(
        selectedSite,
        formData.mode,
        formData.links.length,
        formData.mode === 'redaction' ? formData.wordCount : undefined
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

      {/* Site Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 sm:p-6 rounded-2xl bg-dark-card border border-dark-border"
      >
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1.5 font-medium">{t('filterLangue')}</label>
            <select
              value={filterLangue}
              onChange={(e) => {
                setFilterLangue(e.target.value);
                setFilterThematique('');
              }}
              className="form-input text-sm"
            >
              <option value="">{t('allLangues')}</option>
              {langues.map((langue) => (
                <option key={langue} value={langue}>{langue}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1.5 font-medium">{t('filterThematique')}</label>
            <select
              value={filterThematique}
              onChange={(e) => setFilterThematique(e.target.value)}
              className="form-input text-sm"
            >
              <option value="">{t('allThematiques')}</option>
              {thematiques.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-dark-border my-4" />

        {/* Site Select */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-light-muted mb-1.5 font-medium">{t('selectSite')}</label>
          <select
            value={selectedSite?.Site || ''}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="form-input text-base"
          >
            <option value="">{t('chooseSite')}</option>
            {filteredSites.map((site) => (
              <option key={site.Id} value={site.Site}>
                {site.Nom} ({site.Site})
              </option>
            ))}
          </select>
          {filteredSites.length === 0 && (filterLangue || filterThematique) && (
            <p className="text-xs text-light-muted mt-2">
              {locale === 'fr' ? 'Aucun site pour ces filtres.' : 'No sites match these filters.'}
            </p>
          )}
        </div>
      </motion.div>

      {/* Show form only when site is selected */}
      <AnimatePresence mode="wait">
        {selectedSite && (
          <motion.div
            key={selectedSite.Site}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: customEase }}
            className="space-y-8"
          >
            {/* Selected site badge */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/15">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-light truncate">{selectedSite.Nom}</p>
                <p className="text-xs text-light-muted">{selectedSite.Site} &middot; {selectedSite.Thematique} &middot; {selectedSite.Langue}</p>
              </div>
              {currentPrice !== null && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-light-muted">{t('pricePreview')}</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPrice}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xl font-bold text-accent"
                    >
                      {formatPrice(currentPrice)}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Stepper */}
            <Stepper currentStep={currentStep} steps={steps} />

            {/* Step Content */}
            <div className="min-h-[350px] pt-4">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <StepModeSelection
                    key="step1"
                    selectedMode={formData.mode}
                    onModeSelect={(mode) => setFormData((prev) => ({ ...prev, mode }))}
                    pricing={selectedSite}
                    t={modeTranslations}
                  />
                )}

                {currentStep === 2 && formData.mode && (
                  <StepOrderDetails
                    key="step2"
                    mode={formData.mode}
                    links={formData.links}
                    linkCount={formData.linkCount}
                    wordCount={formData.wordCount}
                    briefing={formData.briefing}
                    titleIdea={formData.titleIdea}
                    articleFile={formData.articleFile}
                    pricing={selectedSite}
                    onLinksChange={(links) => setFormData((prev) => ({ ...prev, links }))}
                    onLinkCountChange={(linkCount) => setFormData((prev) => ({ ...prev, linkCount }))}
                    onWordCountChange={(wordCount) => setFormData((prev) => ({ ...prev, wordCount }))}
                    onBriefingChange={(briefing) => setFormData((prev) => ({ ...prev, briefing }))}
                    onTitleIdeaChange={(titleIdea) => setFormData((prev) => ({ ...prev, titleIdea }))}
                    onFileChange={(articleFile) => setFormData((prev) => ({ ...prev, articleFile }))}
                    t={detailsTranslations}
                  />
                )}

                {currentStep === 3 && (
                  <StepCustomerInfo
                    key="step3"
                    email={formData.email}
                    name={formData.name}
                    onEmailChange={(email) => setFormData((prev) => ({ ...prev, email }))}
                    onNameChange={(name) => setFormData((prev) => ({ ...prev, name }))}
                    t={customerTranslations}
                  />
                )}

                {currentStep === 4 && formData.mode && (
                  <StepPayment
                    key="step4"
                    mode={formData.mode}
                    links={formData.links}
                    wordCount={formData.mode === 'redaction' ? formData.wordCount : undefined}
                    email={formData.email}
                    name={formData.name}
                    pricing={selectedSite}
                    paymentMethod={formData.paymentMethod}
                    paymentConfirmed={formData.paymentConfirmed}
                    onPaymentMethodChange={(paymentMethod) => setFormData((prev) => ({ ...prev, paymentMethod }))}
                    onPaymentConfirmedChange={(paymentConfirmed) => setFormData((prev) => ({ ...prev, paymentConfirmed }))}
                    isSubmitting={isSubmitting}
                    locale={locale}
                    orderReference={orderReference}
                    t={paymentTranslations}
                  />
                )}
              </AnimatePresence>
            </div>

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

            {/* Validation Errors */}
            <AnimatePresence>
              {currentStep < 4 && validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-400 font-medium mb-0.5">{t('validation.toContinue')}</p>
                    <ul className="text-xs text-yellow-400/70 space-y-0.5">
                      {validationErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between gap-4 pt-2"
              >
                <motion.button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm
                    ${currentStep === 1
                      ? 'text-light-muted/30 cursor-not-allowed'
                      : 'text-light-subtle hover:text-light bg-dark-card border border-dark-border hover:border-light-muted/30'
                    }
                  `}
                  whileHover={currentStep > 1 ? { scale: 1.02 } : undefined}
                  whileTap={currentStep > 1 ? { scale: 0.98 } : undefined}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t('navigation.back')}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-sm
                    ${canProceed()
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(0,122,255,0.15)]'
                      : 'bg-dark-card border border-dark-border text-light-muted cursor-not-allowed'
                    }
                  `}
                  whileHover={canProceed() ? { scale: 1.02 } : undefined}
                  whileTap={canProceed() ? { scale: 0.98 } : undefined}
                >
                  {t('navigation.next')}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
