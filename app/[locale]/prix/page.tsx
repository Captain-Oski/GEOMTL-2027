import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import { Trophy } from '@phosphor-icons/react/dist/ssr/Trophy';
import type { Metadata } from 'next';
import { alternatesPage } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Prix GAÏA' : 'GAÏA Prize', alternates: alternatesPage(locale, '/prix') };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

// Source : http://acsg-montreal.ca/prix-gaia/ (2025 : annonce de Géolocation)
const laureats = [
  { annee: 2025, noms: ['Ivan Pagé'], organisation: 'Géolocation' },
  { annee: 2023, noms: ['Francis Roy'], organisation: 'Université Laval' },
  { annee: 2019, noms: ['Luc Lévesque'], organisation: 'Ville de Montréal' },
  { annee: 2016, noms: ['Claude Levasseur'], organisation: 'Effigis' },
  { annee: 2013, noms: ['Annick Jatton'], organisation: 'Université Laval' },
  { annee: 2011, noms: ['Pierre Tessier'], organisation: 'Ministère des Ressources naturelles' },
  { annee: 2009, noms: ['Guy Rochon'], organisation: 'SoftMap Technologies' },
  { annee: 2006, noms: ['Yvan Bédard'], organisation: 'Université Laval' },
  { annee: 2004, noms: ['Laval Pineault'], organisation: 'Ministère des Ressources naturelles' },
  { annee: 2002, noms: ['Marc-A. Gendron', 'Claude Lefebvre'], organisation: 'Gendron-Lefebvre' },
  { annee: 2000, noms: ['Pierre Gagnon'], organisation: 'Université Laval' },
  { annee: 1997, noms: ['Guy Béliveau', 'Jules Couture'], organisation: 'Béliveau-Couture' },
  { annee: 1995, noms: ['Michel Paradis'], organisation: 'Ministère de l\'Environnement et de la Faune' },
  { annee: 1993, noms: ['Roland Provencher'], organisation: 'Ville de Montréal' },
];

export default async function PrixPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'awards' });
  const fr = locale === 'fr';

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

      <Container className="py-12 space-y-16">
        <section className="glass-2027 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-geo-ink mb-4 flex items-center gap-2">
            <Trophy size={26} weight="light" aria-hidden="true" />
            {t('about')}
          </h2>
          <p className="text-geo-ink-soft leading-relaxed">
            {fr
              ? 'Depuis 1993, le prix GAÏA est décerné à un lauréat du milieu de l\'entreprise privée, gouvernemental ou de l\'éducation pour reconnaître son apport remarquable dans le domaine de la géomatique au Québec. Il est remis par les sections Montréal et Champlain de l\'Association canadienne des sciences géomatiques (ACSG).'
              : 'Since 1993, the GAÏA Prize has been awarded to a laureate from private industry, government or education to recognize a remarkable contribution to geomatics in Quebec. It is presented by the Montréal and Champlain sections of the ACSG (Canadian Institute of Geomatics).'}
          </p>
          <p className="text-geo-ink-soft leading-relaxed mt-4">
            {fr
              ? 'Le prix GAÏA 2027 sera remis lors de GÉOMTL 2027, du 3 au 5 octobre au Centre de congrès de Saint-Hyacinthe.'
              : 'The 2027 GAÏA Prize will be presented at GÉOMTL 2027, on October 3–5 at the Centre de congrès de Saint-Hyacinthe.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-geo-ink mb-6">{t('pastWinners')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {laureats.map((laureat) => (
              <li key={laureat.annee} className="glass-2027 rounded-xl p-5">
                <p className="text-sm font-bold text-geo-teal-dark">{laureat.annee}</p>
                <p className="font-bold text-geo-ink mt-1">{laureat.noms.join(fr ? ' et ' : ' and ')}</p>
                <p className="text-sm text-geo-ink-soft">{laureat.organisation}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-geo-ink-soft mt-6">
            {fr ? 'Source : ' : 'Source: '}
            <a
              href="http://acsg-montreal.ca/prix-gaia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-geo-teal-dark hover:underline"
            >
              {fr ? 'ACSG – Section Montréal' : 'ACSG – Montréal Section'}
            </a>
          </p>
        </section>
      </Container>
    </div>
  );
}
