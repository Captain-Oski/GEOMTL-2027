import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import WhyAttend from '@/components/home/WhyAttend';
import HomeCTA from './HomeCTA';
import DonneesEvenement from '@/components/seo/DonneesEvenement';
import { alternatesPage } from '@/lib/seo';

// Themes.tsx reste hors de la page tant que les thématiques 2027 ne sont pas
// définies par l'équipe.
// Conférenciers, programme, ateliers, exposants et partenaires ne sont pas
// encore annoncés publiquement (lancement prévu octobre 2026 au RDV
// Géomatique AGMQ) - FeaturedSpeakers, ProgramPreview et PartnersSection
// restent hors de la page d'accueil tant que ces sections ne sont pas
// réactivées avec de vraies données.
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const fr = locale === 'fr';
  return {
    title: fr ? 'GÉOMTL 2027 - Comprendre le territoire, façonner l\'avenir' : 'GÉOMTL 2027 - Understanding the territory, shaping the future',
    description: fr
      ? 'La conférence géospatiale de référence du Québec. 3–5 octobre 2027, Centre de congrès de Saint-Hyacinthe.'
      : "Quebec's reference geospatial conference. October 3–5, 2027, Centre de congrès de Saint-Hyacinthe.",
    alternates: alternatesPage(locale),
  };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  return (
    <>
      <DonneesEvenement locale={locale} />
      <Hero />
      <Stats />
      <WhyAttend />
      <HomeCTA />
    </>
  );
}
