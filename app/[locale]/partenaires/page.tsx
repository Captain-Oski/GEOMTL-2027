import { getTranslations, setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ui/ComingSoon';
import type { Metadata } from 'next';
import { PAGE_MASQUEE } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Partenaires' : 'Partners', robots: PAGE_MASQUEE };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

// La liste des partenaires confirmés n'est pas encore annoncée publiquement
// (lancement prévu octobre 2026, RDV Géomatique AGMQ) - aucune donnée
// maquette (incluant les noms d'organisations utilisés comme exemples)
// n'est chargée sur cette page tant que la section n'est pas réactivée
// avec les vrais partenaires confirmés.
export default async function PartenairesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'partners' });

  return (
    <ComingSoon
      locale={locale}
      eyebrow={t('eyebrow')}
      title={t('title')}
      message={
        locale === 'fr'
          ? 'Nos partenaires seront dévoilés prochainement. Restez à l\'affût! Vous représentez une organisation intéressée à s\'associer à GÉOMTL 2027?'
          : 'Our partners will be unveiled soon. Stay tuned! Represent an organization interested in partnering with GÉOMTL 2027?'
      }
    />
  );
}
