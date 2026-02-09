import { getTranslations } from 'next-intl/server';
import MultiOrderForm from '@/components/order/MultiOrderForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ site?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'fr' ? 'Commande | Color Pulse Media' : 'Order | Color Pulse Media',
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { site: preselectedSite } = await searchParams;

  return (
    <main className="min-h-screen relative">
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-dark-border/50 backdrop-blur-sm bg-dark/50">
        <div className="container mx-auto max-w-5xl px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
          <Link href={`/${locale === 'fr' ? '' : locale}`} className="flex items-center gap-4 group">
            <Image
              src="/logo/logo.png"
              alt="Color Pulse Media"
              width={200}
              height={200}
              className="opacity-90 group-hover:opacity-100 transition-opacity"
            />
           </Link>
          <Link
            href={`/${locale === 'fr' ? '' : locale}`}
            className="text-sm text-light-muted hover:text-light transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {locale === 'fr' ? 'Retour au site' : 'Back to site'}
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <MultiOrderForm preselectedSite={preselectedSite} locale={locale} />
        </div>
      </div>
    </main>
  );
}
