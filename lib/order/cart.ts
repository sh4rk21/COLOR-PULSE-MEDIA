import type { CartItem, SitePricing } from './types';
import { INITIAL_LINK } from './constants';

export function createCartItem(site: SitePricing): CartItem {
  return {
    id: `${site.Id}-${Date.now()}`,
    site,
    mode: null,
    links: [INITIAL_LINK()],
    linkCount: 1,
    wordCount: 800,
    briefing: '',
    titleIdea: '',
    articleFile: null,
    price: 0,
    configured: false,
  };
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function removeCartItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((item) => item.id !== id);
}
