import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getOrganizationSchema, getWebSiteSchema, getWebPageSchema } from '@/lib/structuredData'
import { Inter } from 'next/font/google'
import InteractiveGridBackground from '@/components/layout/InteractiveGridBackground'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colorpulsemedia.com'

  const metadata = {
    fr: {
      title: 'Color Pulse Media | Acteur média opérationnel',
      description: 'Un réseau de médias digitaux opérationnel. Infrastructure éprouvée. Audiences authentiques.',
    },
    en: {
      title: 'Color Pulse Media | Media operator, not agency',
      description: 'An operational digital media network. Proven infrastructure. Authentic audiences.',
    },
  }

  return {
    title: metadata[locale as 'fr' | 'en'].title,
    description: metadata[locale as 'fr' | 'en'].description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr': '/fr',
        'en': '/en',
      },
    },
    openGraph: {
      title: metadata[locale as 'fr' | 'en'].title,
      description: metadata[locale as 'fr' | 'en'].description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Color Pulse Media',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata[locale as 'fr' | 'en'].title,
      description: metadata[locale as 'fr' | 'en'].description,
    },
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteSchema(locale)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebPageSchema(locale)),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <InteractiveGridBackground />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
