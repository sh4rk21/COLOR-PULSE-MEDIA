import { PaymentMethod } from './types';

export interface PaymentMethodInfo {
  label: string;
  labelEn: string;
  icon: string;
  details: {
    email?: string;
    tag?: string;
    iban?: string;
    bic?: string;
    beneficiary?: string;
    address?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    bankName?: string;
    bankAddress?: string;
  };
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  paypal: {
    label: 'PayPal',
    labelEn: 'PayPal',
    icon: '💳',
    details: {
      email: 'contact@eldorado-consulting.com',
    },
  },
  revolut: {
    label: 'Revolut',
    labelEn: 'Revolut',
    icon: '📱',
    details: {
      tag: '@antoinebressan',
    },
  },
  sepa: {
    label: 'Virement SEPA',
    labelEn: 'SEPA Transfer',
    icon: '🇫🇷',
    details: {
      iban: 'FR76 1695 8000 0198 8709 9304 516',
      bic: 'QNTOFRP1XXX',
      beneficiary: 'ELDORADO CONSULTING',
      address: '10 Rue de la République, 13001 Marseille, France',
    },
  },
  us_ach: {
    label: 'ACH (USA)',
    labelEn: 'ACH (USA)',
    icon: '🇺🇸',
    details: {
      accountNumber: '8312428478',
      routingNumber: '026073150',
      beneficiary: 'ELDORADO CONSULTING',
      bankName: 'Community Federal Savings Bank',
    },
  },
  us_swift: {
    label: 'SWIFT (USA)',
    labelEn: 'SWIFT (USA)',
    icon: '🌐',
    details: {
      accountNumber: '8312428478',
      swiftCode: 'CMFGUS33',
      beneficiary: 'ELDORADO CONSULTING',
      bankName: 'Community Federal Savings Bank',
      bankAddress: '89-16 Jamaica Ave, Woodhaven, NY 11421, USA',
    },
  },
  international: {
    label: 'Virement International',
    labelEn: 'International Wire',
    icon: '🌍',
    details: {
      iban: 'FR76 1695 8000 0198 8709 9304 516',
      bic: 'QNTOFRP1XXX',
      beneficiary: 'ELDORADO CONSULTING',
      address: '10 Rue de la République, 13001 Marseille, France',
      bankName: 'Qonto',
    },
  },
};

export const WORD_COUNT_OPTIONS = [500, 800, 1000, 1500] as const;

export const PLACEMENT_OPTIONS = ['whatever', 'first', 'middle', 'end'] as const;

export const MAX_LINKS = 3;

export const INITIAL_LINK: () => { url: string; anchor: string; placement: 'whatever' } = () => ({
  url: '',
  anchor: '',
  placement: 'whatever',
});
