// Order page types

export type OrderMode = 'lien_seul' | 'article_fourni' | 'redaction';
export type Placement = 'whatever' | 'first' | 'middle' | 'end';
export type WordCount = 500 | 800 | 1000 | 1500;
export type PaymentMethod = 'paypal' | 'revolut' | 'sepa' | 'us_ach' | 'us_swift' | 'international';

export interface LinkDetail {
  url: string;
  anchor: string;
  placement: Placement;
}

export interface SitePricing {
  Id: number;
  Site: string;
  Nom: string;
  Langue: string;
  Thematique: string;
  Prix_Lien: number;
  Prix_Lien_Sup: number;
  Prix_Article: number;
  Prix_Article_Redige: number;
  Prix_500_Mots: number;
  Prix_800_Mots: number;
  Prix_1000_Mots: number;
  Prix_1500_Mots: number;
  Actif: boolean;
}

export interface OrderFormData {
  mode: OrderMode | null;
  links: LinkDetail[];
  linkCount: number;
  wordCount: WordCount;
  briefing: string;
  titleIdea: string;
  articleFile: File | null;
  email: string;
  name: string;
  paymentMethod: PaymentMethod | null;
  paymentConfirmed: boolean;
}

export interface OrderSubmitPayload {
  site: string;
  siteName: string;
  mode: OrderMode;
  links: LinkDetail[];
  wordCount?: WordCount;
  briefing?: string;
  titleIdea?: string;
  email: string;
  name?: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  fileUrl?: string;
  orderReference: string;
}

// Generate order reference from site name
export function generateOrderReference(siteName: string): string {
  const initials = siteName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  // Use timestamp + random for uniqueness (e.g., DD-1A2B3C)
  const uniquePart = Date.now().toString(36).slice(-4).toUpperCase() +
    Math.random().toString(36).slice(-2).toUpperCase();

  return `${initials}-${uniquePart}`;
}

export interface PricingResponse {
  success: true;
  pricing: SitePricing;
}

export interface PricingError {
  success: false;
  error: string;
}

export type PricingResult = PricingResponse | PricingError;
