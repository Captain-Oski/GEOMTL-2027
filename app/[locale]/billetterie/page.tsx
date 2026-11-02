import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import type { Metadata } from 'next';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import NotesBillets from '@/components/billetterie/NotesBillets';
import { EVENT_CONFIG } from '@/data/config';
import { alternatesPage } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Billetterie' : 'Tickets', alternates: alternatesPage(locale, '/billetterie') };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function BilletteriePage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'tickets' });

  const fr = locale === 'fr';
  const prix = (montant: number) => (fr ? `${montant} $` : `$${montant}`);

  // Tarifs et forfaits validés par le comité (JD, octobre 2026). Seul le forfait
  // 2 jours a un tarif anticipé et un tarif régulier : les autres n'affichent aucun rabais.
  const forfaits: { id: string; nom: string; detail: string; prix: number; regulier?: number; inclus: string[] }[] = [
    {
      id: 'deux-jours',
      nom: fr ? 'Forfait 2 jours' : '2-day package',
      detail: fr ? '4 et 5 octobre 2027' : 'October 4 and 5, 2027',
      prix: EVENT_CONFIG.tarifs.deuxJours,
      regulier: EVENT_CONFIG.tarifs.deuxJoursRegulier,
      inclus: fr ? [
        'Conférences, vitrines technologiques et ateliers',
        'Salon des exposants',
        'Midis-conférences',
        'Soirée réseautage du 4 octobre, avec bouchées dînatoires'
      ] : [
        'Conferences, technology showcases and workshops',
        'Exhibition hall',
        'Lunch talks',
        'Networking evening on October 4, with hearty hors d\'oeuvres'
      ]
    },
    {
      id: 'jour-4',
      nom: fr ? 'Forfait 1 jour' : '1-day package',
      detail: fr ? 'Lundi 4 octobre 2027' : 'Monday, October 4, 2027',
      prix: EVENT_CONFIG.tarifs.jour4,
      inclus: fr ? [
        'Conférences, vitrines technologiques et ateliers',
        'Salon des exposants',
        'Midi-conférence',
        'Soirée réseautage du 4 octobre, avec bouchées dînatoires'
      ] : [
        'Conferences, technology showcases and workshops',
        'Exhibition hall',
        'Lunch talk',
        'Networking evening on October 4, with hearty hors d\'oeuvres'
      ]
    },
    {
      id: 'jour-5',
      nom: fr ? 'Forfait 1 jour' : '1-day package',
      detail: fr ? 'Mardi 5 octobre 2027' : 'Tuesday, October 5, 2027',
      prix: EVENT_CONFIG.tarifs.jour5,
      inclus: fr ? [
        'Conférences, vitrines technologiques et ateliers',
        'Salon des exposants',
        'Midi-conférence'
      ] : [
        'Conferences, technology showcases and workshops',
        'Exhibition hall',
        'Lunch talk'
      ]
    },
    {
      id: 'etudiant',
      nom: fr ? 'Forfait Étudiant' : 'Student package',
      detail: fr ? 'Étudiants inscrits à temps plein' : 'Full-time students',
      prix: EVENT_CONFIG.tarifs.etudiant,
      inclus: fr ? [
        'Conférences, vitrines technologiques et ateliers',
        'Salon des exposants'
      ] : [
        'Conferences, technology showcases and workshops',
        'Exhibition hall'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-geo-cream pt-20">
      <div className="page-header-2027 py-16 sm:py-20">
        <Container>
          <SectionTitle
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {forfaits.map((forfait) => (
            <div key={forfait.id} className="relative glass-2027 rounded-2xl p-6 flex flex-col border-t-2 border-geo-teal-dark/40">
              {forfait.regulier && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-geo-2027 px-3 py-1 text-xs font-bold text-geo-noir whitespace-nowrap">
                  {fr ? 'Économisez' : 'Save'} {prix(forfait.regulier - forfait.prix)}
                </span>
              )}
              <h3 className="text-xl font-bold text-geo-ink">{forfait.nom}</h3>
              <p className="text-sm text-geo-ink-soft mt-1">{forfait.detail}</p>

              {/* Hauteur fixe : les listes « Inclus » restent alignées d'une carte à l'autre */}
              <div className="mt-6 sm:min-h-[6.5rem]">
                <p className="text-4xl font-black text-geo-ink">{prix(forfait.prix)}</p>
                {forfait.regulier && (
                  <>
                    <p className="mt-1 text-xs text-geo-ink-soft">
                      {fr ? 'Tarif jusqu\'au 15 août, 23 h 45' : 'Rate until August 15, 11:45 pm'}
                    </p>
                    <p className="mt-1 text-sm text-geo-ink-soft">
                      {fr ? 'Tarif régulier : ' : 'Regular rate: '}
                      <span className="font-semibold text-geo-ink">{prix(forfait.regulier)}</span>
                    </p>
                  </>
                )}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-geo-ink-soft mt-6 mb-3">{t('includes')}</p>
              <ul className="space-y-2 mb-8 flex-1">
                {forfait.inclus.map((element) => (
                  <li key={element} className="flex items-start gap-2 text-sm text-geo-ink-soft">
                    <Check size={14} weight="light" className="mt-1 flex-shrink-0 text-geo-ink" aria-hidden="true" />
                    {element}
                  </li>
                ))}
              </ul>

              <a
                href={EVENT_CONFIG.ticketUrl[fr ? 'fr' : 'en']}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 font-bold text-center text-geo-cream bg-geo-ink hover:bg-geo-ink/85 transition-colors"
              >
                {t('buyNow')}
              </a>
            </div>
          ))}
        </div>

        <div className="glass-2027 rounded-2xl p-6 sm:p-8 mt-10 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-geo-ink mb-4">{fr ? 'À savoir' : 'Good to know'}</h3>
          <NotesBillets fr={fr} />
        </div>
      </Container>
    </div>
  );
}
