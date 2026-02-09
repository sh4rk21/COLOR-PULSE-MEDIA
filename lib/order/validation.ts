import { z } from 'zod';

export const linkDetailSchema = z.object({
  url: z.string().url('URL invalide'),
  anchor: z.string().min(1, 'Ancre requise'),
  placement: z.enum(['whatever', 'first', 'middle', 'end']),
});

export const orderSubmitSchema = z.object({
  site: z.string().min(1),
  siteName: z.string().min(1),
  mode: z.enum(['lien_seul', 'article_fourni', 'redaction']),
  links: z.array(linkDetailSchema).min(1),
  wordCount: z.number().optional(),
  briefing: z.string().optional(),
  titleIdea: z.string().optional(),
  email: z.string().email('Email invalide'),
  name: z.string().optional(),
  paymentMethod: z.enum(['paypal', 'revolut', 'sepa', 'us_ach', 'us_swift', 'international']),
  totalPrice: z.number().positive(),
  fileUrl: z.string().optional(),
  orderReference: z.string().min(1),
});

export type OrderSubmitInput = z.infer<typeof orderSubmitSchema>;

export const multiOrderItemSchema = z.object({
  site: z.string().min(1),
  siteName: z.string().min(1),
  mode: z.enum(['lien_seul', 'article_fourni', 'redaction']),
  links: z.array(linkDetailSchema).min(1),
  wordCount: z.number().optional(),
  briefing: z.string().optional(),
  titleIdea: z.string().optional(),
  fileUrl: z.string().optional(),
  price: z.number().positive(),
});

export const multiOrderSubmitSchema = z.object({
  items: z.array(multiOrderItemSchema).min(1),
  email: z.string().email('Email invalide'),
  name: z.string().optional(),
  paymentMethod: z.enum(['paypal', 'revolut', 'sepa', 'us_ach', 'us_swift', 'international']),
  totalPrice: z.number().positive(),
  orderReference: z.string().min(1),
});

export type MultiOrderSubmitInput = z.infer<typeof multiOrderSubmitSchema>;

// Validation per step
export function validateStep1(mode: string | null): boolean {
  return mode !== null && ['lien_seul', 'article_fourni', 'redaction'].includes(mode);
}

export function validateStep2(
  mode: string,
  links: Array<{ url: string; anchor: string; placement: string }>,
  briefing?: string,
  wordCount?: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate links
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    try {
      new URL(link.url);
    } catch {
      errors.push(`Lien ${i + 1}: URL invalide`);
    }
    if (!link.anchor.trim()) {
      errors.push(`Lien ${i + 1}: Ancre requise`);
    }
  }

  // Mode-specific validation
  if (mode === 'redaction') {
    if (!briefing || briefing.trim().length < 20) {
      errors.push('Briefing: minimum 20 caractères');
    }
    if (!wordCount) {
      errors.push('Nombre de mots requis');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateStep3(email: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Email invalide');
  }

  return { valid: errors.length === 0, errors };
}

export function validateStep4(
  paymentMethod: string | null,
  paymentConfirmed: boolean
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paymentMethod) {
    errors.push('Méthode de paiement requise');
  }
  if (!paymentConfirmed) {
    errors.push('Veuillez confirmer le paiement');
  }

  return { valid: errors.length === 0, errors };
}
