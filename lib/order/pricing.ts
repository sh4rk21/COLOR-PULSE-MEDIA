import { OrderMode, SitePricing, WordCount } from './types';

export function isModeAvailable(pricing: SitePricing, mode: OrderMode): boolean {
  switch (mode) {
    case 'lien_seul':
      return pricing.Prix_Lien !== null;
    case 'article_fourni':
      return pricing.Prix_Article !== null;
    case 'redaction':
      return pricing.Prix_Article_Redige !== null;
    default:
      return false;
  }
}

export function calculatePrice(
  pricing: SitePricing,
  mode: OrderMode,
  linkCount: number,
  wordCount?: WordCount
): number {
  const extraLinks = Math.max(0, linkCount - 1) * (pricing.Prix_Lien_Sup ?? 0);

  switch (mode) {
    case 'lien_seul':
      return (pricing.Prix_Lien ?? 0) + extraLinks;

    case 'article_fourni':
      return (pricing.Prix_Article ?? 0) + extraLinks;

    case 'redaction': {
      const wordPriceKey = `Prix_${wordCount}_Mots` as keyof SitePricing;
      const wordPrice = (pricing[wordPriceKey] as number | null) ?? 0;
      return (pricing.Prix_Article_Redige ?? 0) + wordPrice + extraLinks;
    }

    default:
      return 0;
  }
}

export function formatPrice(price: number | null): string {
  if (price === null) return '—';
  return `${price}€`;
}
