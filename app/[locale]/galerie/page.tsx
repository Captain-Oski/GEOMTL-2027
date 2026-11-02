import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import { EDITIONS, FLICKR_ALBUMS_URL } from '@/data/galerie';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { Camera } from '@phosphor-icons/react/dist/ssr/Camera';
import { cn } from '@/lib/utils';
import { alternatesPage } from '@/lib/seo';

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Galerie' : 'Gallery', alternates: alternatesPage(locale, '/galerie') };
}

export default async function GaleriePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'gallery' });
  const fr = locale === 'fr';

  return (
    <div className="min-h-screen bg-geo-cream pt-20">
      <div className="page-header-2027 py-16 sm:py-20">
        <Container>
          <SectionTitle eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        </Container>
      </div>

      <Container className="py-12 space-y-16">
        {EDITIONS.map((edition) => (
          <section key={edition.annee} id={`edition-${edition.annee}`} className="scroll-mt-28">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-bold text-geo-ink">GÉOMTL {edition.annee}</h2>
              <a
                href={edition.album}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-geo-teal-dark hover:underline"
              >
                {fr ? 'Voir l\'album complet sur Flickr' : 'See the full album on Flickr'}
                <ArrowSquareOut size={16} weight="light" aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {edition.photos.map((photo, index) => (
                <a
                  key={photo.src}
                  href={photo.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative block overflow-hidden rounded-xl bg-geo-ink/5',
                    index === 0 ? 'col-span-2 row-span-2' : 'aspect-[3/2]'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={fr ? photo.alt.fr : photo.alt.en}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {fr ? photo.alt.fr : photo.alt.en}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <div className="glass-2027 rounded-2xl p-8 text-center">
          <Camera size={32} weight="light" className="mx-auto mb-3 text-geo-ink" aria-hidden="true" />
          <h3 className="text-xl font-bold text-geo-ink mb-3">
            {fr ? 'Toutes les photos sur Flickr' : 'All photos on Flickr'}
          </h3>
          <p className="text-geo-ink-soft text-sm mb-6 max-w-xl mx-auto">
            {fr
              ? 'Retrouvez les albums complets des éditions précédentes sur le compte Flickr de l\'ACSG – Section Montréal. Les photos de 2027 y seront publiées après l\'événement.'
              : 'Browse the full albums of past editions on the ACSG – Montréal Section Flickr account. 2027 photos will be published there after the event.'}
          </p>
          <a
            href={FLICKR_ALBUMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-geo-noir bg-gradient-geo-2027 hover:opacity-90 transition-all"
          >
            {fr ? 'Voir les albums' : 'See the albums'}
            <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-4 text-xs text-geo-ink-soft">
            {fr ? 'Photos : ACSG – Section Montréal' : 'Photos: ACSG – Montréal Section'}
          </p>
        </div>
      </Container>
    </div>
  );
}
