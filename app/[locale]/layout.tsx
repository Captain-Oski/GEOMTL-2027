import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import { SCRIPT_THEME } from '@/lib/theme-script';
import { URL_SITE } from '@/lib/site';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

// Approximation libre du wordmark "GÉOMTL" (Studio Le Séisme n'a fourni
// que des exports PDF, pas les fichiers de police) : un grotesque
// géométrique gras, proche en esprit. À remplacer si le studio livre
// la police exacte.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return {
    // Adresses absolues des aperçus de partage (opengraph-image) et des icônes
    metadataBase: new URL(URL_SITE),
    // Preuve de propriété pour Google Search Console (propriété https://www.geomtl.com/) :
    // à garder en place, Google la revérifie régulièrement
    verification: { google: '49AlPWI4X_f2NglrcoOJZU96Cr60_RdZ2gk0GCt9JKI' },
    title: {
      default: 'GÉOMTL 2027',
      template: '%s | GÉOMTL 2027'
    },
    description:
      locale === 'fr'
        ? 'Comprendre le territoire, façonner l\'avenir. 3–5 octobre 2027, Centre de congrès de Saint-Hyacinthe.'
        : 'Understanding the territory, shaping the future. October 3–5, 2027, Centre de congrès de Saint-Hyacinthe.',
    keywords: ['geomatics', 'geospatial', 'GIS', 'conference', 'montreal', 'géomatique', 'SIG'],
    openGraph: {
      title: 'GÉOMTL 2027',
      description:
        locale === 'fr'
          ? 'La conférence géospatiale de référence, Saint-Hyacinthe, 3–5 octobre 2027'
          : 'The reference geospatial conference, Saint-Hyacinthe, October 3–5, 2027',
      siteName: 'GÉOMTL 2027',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const validLocales = ['fr', 'en'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    // suppressHydrationWarning : SCRIPT_THEME peut ajouter la classe .dark
    // à <html> avant que React ne prenne la main.
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="bg-geo-cream text-geo-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
