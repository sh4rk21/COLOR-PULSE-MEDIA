'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PaymentCard from '../ui/PaymentCard';
import CopyButton from '../ui/CopyButton';
import type { OrderMode, PaymentMethod, SitePricing, LinkDetail } from '@/lib/order/types';
import { PAYMENT_METHODS } from '@/lib/order/constants';
import { calculatePrice, formatPrice } from '@/lib/order/pricing';

interface StepPaymentProps {
  mode: OrderMode;
  links: LinkDetail[];
  wordCount?: number;
  email: string;
  name: string;
  pricing: SitePricing;
  paymentMethod: PaymentMethod | null;
  paymentConfirmed: boolean;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onPaymentConfirmedChange: (confirmed: boolean) => void;
  isSubmitting: boolean;
  locale: string;
  orderReference: string;
  t: {
    summary: string;
    mode: string;
    modeLabels: Record<OrderMode, string>;
    links: string;
    wordCount: string;
    words: string;
    total: string;
    paymentMethod: string;
    instructions: string;
    paypalInstructions: string;
    revolutInstructions: string;
    sepaInstructions: string;
    achInstructions: string;
    swiftInstructions: string;
    internationalInstructions: string;
    confirmPayment: string;
    submit: string;
    submitting: string;
    iban: string;
    bic: string;
    beneficiary: string;
    address: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    bankName: string;
    bankAddress: string;
    email: string;
    tag: string;
    referenceLabel: string;
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepPayment({
  mode,
  links,
  wordCount,
  email,
  name,
  pricing,
  paymentMethod,
  paymentConfirmed,
  onPaymentMethodChange,
  onPaymentConfirmedChange,
  isSubmitting,
  locale,
  orderReference,
  t,
}: StepPaymentProps) {
  const totalPrice = calculatePrice(
    pricing,
    mode,
    links.length,
    wordCount as 500 | 800 | 1000 | 1500 | undefined
  );

  const paymentMethodsArray = Object.entries(PAYMENT_METHODS) as [PaymentMethod, typeof PAYMENT_METHODS[PaymentMethod]][];

  const getInstructions = (method: PaymentMethod): string => {
    switch (method) {
      case 'paypal': return t.paypalInstructions;
      case 'revolut': return t.revolutInstructions;
      case 'sepa': return t.sepaInstructions;
      case 'us_ach': return t.achInstructions;
      case 'us_swift': return t.swiftInstructions;
      case 'international': return t.internationalInstructions;
      default: return '';
    }
  };

  const renderPaymentDetails = (method: PaymentMethod) => {
    const info = PAYMENT_METHODS[method];
    const details = info.details;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4"
      >
        <p className="text-sm text-light-muted">{getInstructions(method)}</p>

        {/* Order Reference */}
        <div className="p-4 rounded-xl bg-accent/[0.06] border border-accent/20">
          <p className="text-[11px] uppercase tracking-wider text-accent mb-1.5 font-medium">{t.referenceLabel}</p>
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-bold text-accent tracking-wider">{orderReference}</span>
            <CopyButton text={orderReference} />
          </div>
        </div>

        <div className="space-y-2.5">
          {details.email && (
            <CopyButton text={details.email} label={t.email} />
          )}
          {details.tag && (
            <CopyButton text={details.tag} label={t.tag} />
          )}
          {details.iban && (
            <CopyButton text={details.iban} label={t.iban} />
          )}
          {details.bic && (
            <CopyButton text={details.bic} label={t.bic} />
          )}
          {details.accountNumber && (
            <CopyButton text={details.accountNumber} label={t.accountNumber} />
          )}
          {details.routingNumber && (
            <CopyButton text={details.routingNumber} label={t.routingNumber} />
          )}
          {details.swiftCode && (
            <CopyButton text={details.swiftCode} label={t.swiftCode} />
          )}
          {details.beneficiary && (
            <div className="flex items-center gap-2 text-sm py-1">
              <span className="text-light-muted min-w-[80px]">{t.beneficiary}</span>
              <span className="text-light font-medium">{details.beneficiary}</span>
            </div>
          )}
          {details.bankName && (
            <div className="flex items-center gap-2 text-sm py-1">
              <span className="text-light-muted min-w-[80px]">{t.bankName}</span>
              <span className="text-light">{details.bankName}</span>
            </div>
          )}
          {details.address && (
            <div className="flex items-center gap-2 text-sm py-1">
              <span className="text-light-muted min-w-[80px]">{t.address}</span>
              <span className="text-light">{details.address}</span>
            </div>
          )}
          {details.bankAddress && (
            <div className="flex items-center gap-2 text-sm py-1">
              <span className="text-light-muted min-w-[80px]">{t.bankAddress}</span>
              <span className="text-light">{details.bankAddress}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-6"
    >
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-dark-card border border-dark-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          <h3 className="text-sm font-medium text-light">{t.summary}</h3>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-light-muted">{t.mode}</span>
            <span className="text-light font-medium">{t.modeLabels[mode]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-light-muted">{t.links}</span>
            <span className="text-light font-medium">{links.length}</span>
          </div>
          {mode === 'redaction' && wordCount && (
            <div className="flex justify-between items-center">
              <span className="text-light-muted">{t.wordCount}</span>
              <span className="text-light font-medium">{wordCount} {t.words}</span>
            </div>
          )}
          <div className="pt-3 mt-3 border-t border-dark-border flex justify-between items-center">
            <span className="text-light font-medium">{t.total}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={totalPrice}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-bold text-accent"
              >
                {formatPrice(totalPrice)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-[11px] uppercase tracking-wider text-light-muted mb-3 font-medium">{t.paymentMethod}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {paymentMethodsArray.map(([method, info]) => (
            <PaymentCard
              key={method}
              icon={info.icon}
              label={locale === 'fr' ? info.label : info.labelEn}
              selected={paymentMethod === method}
              onClick={() => onPaymentMethodChange(method)}
            />
          ))}
        </div>
      </motion.div>

      {/* Payment Instructions */}
      <AnimatePresence>
        {paymentMethod && renderPaymentDetails(paymentMethod)}
      </AnimatePresence>

      {/* Payment Confirmation Checkbox */}
      {paymentMethod && (
        <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          htmlFor="payment-confirmed"
          className={`
            flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
            ${paymentConfirmed
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-dark-card border-dark-border hover:border-light-muted/20'
            }
          `}
        >
          <div className={`
            flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-all
            ${paymentConfirmed ? 'bg-green-500 border-green-500' : 'border-light-muted/30'}
          `}>
            {paymentConfirmed && (
              <motion.svg
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </div>
          <input
            type="checkbox"
            id="payment-confirmed"
            checked={paymentConfirmed}
            onChange={(e) => onPaymentConfirmedChange(e.target.checked)}
            className="sr-only"
          />
          <span className={`text-sm transition-colors ${paymentConfirmed ? 'text-light' : 'text-light-muted'}`}>
            {t.confirmPayment}
          </span>
        </motion.label>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!paymentMethod || !paymentConfirmed || isSubmitting}
        className={`
          w-full px-8 py-4 rounded-xl font-medium text-white text-base
          transition-all flex items-center justify-center gap-2
          ${!paymentMethod || !paymentConfirmed || isSubmitting
            ? 'bg-dark-card border border-dark-border text-light-muted cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover shadow-[0_0_30px_rgba(0,122,255,0.15)]'
          }
        `}
        whileHover={!isSubmitting && paymentMethod && paymentConfirmed ? { scale: 1.01, y: -1 } : undefined}
        whileTap={!isSubmitting && paymentMethod && paymentConfirmed ? { scale: 0.99 } : undefined}
      >
        {isSubmitting ? (
          <>
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
              <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </div>
            {t.submitting}
          </>
        ) : (
          <>
            {t.submit}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
