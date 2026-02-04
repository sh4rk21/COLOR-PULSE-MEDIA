import { OrderMode, SitePricing, WordCount } from './types';

export function calculatePrice(
  pricing: SitePricing,
  mode: OrderMode,
  linkCount: number,
  wordCount?: WordCount
): number {
  const extraLinks = Math.max(0, linkCount - 1) * pricing.Prix_Lien_Sup;

  switch (mode) {
    case 'lien_seul':
      return pricing.Prix_Lien + extraLinks;

    case 'article_fourni':
      return pricing.Prix_Article + extraLinks;

    case 'redaction': {
      const wordPriceKey = `Prix_${wordCount}_Mots` as keyof SitePricing;
      const wordPrice = (pricing[wordPriceKey] as number) || 0;
      return pricing.Prix_Article_Redige + wordPrice + extraLinks;
    }

    default:
      return 0;
  }
}

export function formatPrice(price: number): string {
  return `${price}€`;
}
