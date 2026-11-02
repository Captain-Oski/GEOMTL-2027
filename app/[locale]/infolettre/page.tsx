import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { EVENT_CONFIG } from '@/data/config';
import { formulaireMailchimp } from '@/lib/infolettre';
import { alternatesPage } from '@/lib/seo';
import FormulaireInfolettre from '@/components/infolettre/FormulaireInfolettre';
import BoutonInfolettre from '@/components/ui/BoutonInfolettre';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const fr = locale === 'fr';

  return {
    title: fr ? 'Infolettre' : 'Newsletter',
    description: fr
      ? 'Abonnez-vous à l\'infolettre de GÉOMTL 2027 : programme, conférenciers, billetterie et nouvelles de l\'événement.'
      : 'Subscribe to the GÉOMTL 2027 newsletter: program, speakers, tickets and event news.',
    alternates: alternatesPage(locale, '/infolettre'),
  };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function InfolettrePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const fr = locale === 'fr';
  const formulaire = formulaireMailchimp();

  return (
    <div className="min-h-screen bg-geo-cream pt-20">
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Visuel de la charte : dégradé cyan → citron en trame de points */}
        <Image
          src="/images/brand/degrade-trame.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover pointer-events-none select-none"
        />

        <div className="relative z-10 px-4 max-w-xl mx-auto">
          <div className="rounded-2xl bg-white/55 dark:bg-geo-cream/75 backdrop-blur-md border border-white/60 dark:border-geo-ink/10 px-6 py-10 sm:px-10 sm:py-12 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-geo-ink mb-3">
              {EVENT_CONFIG.name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-geo-ink font-display mb-4 leading-tight text-balance">
              {fr ? 'Abonnez-vous à l\'infolettre' : 'Subscribe to the newsletter'}
            </h1>
            <p className="text-base sm:text-lg text-geo-ink mb-8 leading-relaxed">
              {fr
                ? 'Programme, conférenciers, ouverture de la billetterie : recevez les annonces de GÉOMTL 2027 directement par courriel.'
                : 'Program, speakers, ticket sales: get GÉOMTL 2027 announcements straight to your inbox.'}
            </p>

            {formulaire ? (
              <FormulaireInfolettre locale={locale} action={formulaire.action} piege={formulaire.piege} />
            ) : (
              <BoutonInfolettre locale={locale} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
