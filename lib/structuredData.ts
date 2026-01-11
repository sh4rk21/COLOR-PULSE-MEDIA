export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Color Pulse Media',
    description: 'Un réseau de médias digitaux opérationnel. Infrastructure éprouvée. Audiences authentiques.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://colorpulsemedia.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://colorpulsemedia.com'}/logo.png`,
    foundingDate: '2021',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Business Development',
      availableLanguage: ['French', 'English'],
    },
  }
}

export function getWebSiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Color Pulse Media',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://colorpulsemedia.com'}/${locale}`,
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
  }
}

export function getWebPageSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: locale === 'fr' ? 'Color Pulse Media | Acteur média opérationnel' : 'Color Pulse Media | Media operator, not agency',
    description: locale === 'fr'
      ? 'Un réseau de médias digitaux opérationnel. Infrastructure éprouvée. Audiences authentiques.'
      : 'An operational digital media network. Proven infrastructure. Authentic audiences.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://colorpulsemedia.com'}/${locale}`,
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
  }
}
