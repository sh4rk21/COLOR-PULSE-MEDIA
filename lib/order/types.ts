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
  Prix_Lien: number | null;
  Prix_Lien_Sup: number | null;
  Prix_Article: number | null;
  Prix_Article_Redige: number | null;
  Prix_500_Mots: number | null;
  Prix_800_Mots: number | null;
  Prix_1000_Mots: number | null;
  Prix_1500_Mots: number | null;
  Actif: boolean;
  Discover_Score: number;
  Discover_Views: number;
  Google_News: boolean;
  Google_News_URL: string | null;
  TF: number;
  CF: number;
  RD: number;
  DR: number;
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

export interface CartItem {
  id: string;
  site: SitePricing;
  mode: OrderMode | null;
  links: LinkDetail[];
  linkCount: number;
  wordCount: WordCount;
  briefing: string;
  titleIdea: string;
  articleFile: File | null;
  fileUrl?: string;
  price: number;
  configured: boolean;
}

export interface CatalogueFilters {
  langue: string;
  thematique: string;
  googleNews: boolean | null;
  discoverMin: number;
  drMin: number;
  drMax: number;
  search: string;
}

export type CatalogueView = 'list' | 'grid';

export interface MultiOrderSubmitPayload {
  items: {
    site: string;
    siteName: string;
    mode: OrderMode;
    links: LinkDetail[];
    wordCount?: WordCount;
    briefing?: string;
    titleIdea?: string;
    fileUrl?: string;
    price: number;
  }[];
  email: string;
  name?: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  orderReference: string;
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
