import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import ContactSection from '@/components/about/ContactSection';
import Histoire from '@/components/about/Histoire';
import type { Metadata } from 'next';
import { Target } from '@phosphor-icons/react/dist/ssr/Target';
import { Binoculars } from '@phosphor-icons/react/dist/ssr/Binoculars';
import { UsersThree } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { Trophy } from '@phosphor-icons/react/dist/ssr/Trophy';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { alternatesPage } from '@/lib/seo';

// Mission, vision, prix GAÏA et histoire sont masqués à la demande du comité :
// la page n'affiche que l'équipe et « Nous joindre ». Passer à true pour les
// réafficher.
const AFFICHER_PRESENTATION = false;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'À propos' : 'About', alternates: alternatesPage(locale, '/apropos') };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function AProposPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const team = [
    { name: 'Martin Carpentier',       org: 'Jakarto',        role: locale === 'fr' ? 'Président et coordonnateur'                         : 'President & Coordinator',                         initials: 'MC', color: '#20FEFD' },
    { name: 'Joanie Desgroseilliers',  org: 'Hydro-Québec',   role: locale === 'fr' ? 'Secrétariat et opérations'                          : 'Secretariat & Operations',                        initials: 'JD', color: '#01CDA5' },
    { name: 'Adelmo Rodriguez',        org: 'K2 Geospatial',  role: locale === 'fr' ? 'Programmation, conférences, prix et bourses'         : 'Programming, Conferences, Awards & Grants',       initials: 'AR', color: '#1BC868' },
    { name: 'Martin Fafard',           org: 'Ville de Mascouche', role: locale === 'fr' ? 'Trésorerie'                                      : 'Treasurer',                                       initials: 'MF', color: '#D0DC00' },
    { name: 'Prosper Ravo',            org: 'Stantec',        role: locale === 'fr' ? 'Communications et Web'                               : 'Communications & Web',                            initials: 'PR', color: '#6A8C3A' },
    { name: 'Clément Glogowski',       org: 'Esri Canada',    role: locale === 'fr' ? 'Partenariats, exposants et expérience participants'  : 'Partnerships, Exhibitors & Attendee Experience',  initials: 'CG', color: '#00A383' },
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

      <Container className="py-12 space-y-16">
        {AFFICHER_PRESENTATION && (
          <>
            {/* Mission */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold text-geo-ink mb-4 flex items-center gap-2"><Target size={26} weight="light" aria-hidden="true" />{t('missionTitle')}</h2>
                <p className="text-geo-ink-soft leading-relaxed">
                  {locale === 'fr'
                    ? 'GÉOMTL est la conférence de référence pour la communauté géospatiale du Québec et du Canada francophone. Notre mission est de rassembler les professionnels, chercheurs, décideurs et passionnés du géospatial pour partager des connaissances, créer des connexions et faire avancer le secteur.'
                    : 'GÉOMTL is the reference conference for the geospatial community in Quebec and French Canada. Our mission is to bring together geospatial professionals, researchers, decision-makers and enthusiasts to share knowledge, create connections and advance the sector.'}
                </p>
                <p className="text-geo-ink-soft leading-relaxed mt-4">
                  {locale === 'fr'
                    ? 'En 2027, GÉOMTL rassemblera plus de 400 professionnels au Centre de congrès de Saint-Hyacinthe pour deux journées intenses d\'apprentissage, de networking et de découverte. C\'est l\'événement géospatial majeur de l\'année pour le Canada francophone.'
                    : 'In 2027, GÉOMTL will bring together more than 400 professionals at the Centre de congrès de Saint-Hyacinthe for two intense days of learning, networking and discovery. It is the major geospatial event of the year for French Canada.'}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-geo-ink mb-4 flex items-center gap-2"><Binoculars size={26} weight="light" aria-hidden="true" />{t('visionTitle')}</h2>
                <p className="text-geo-ink-soft leading-relaxed">
                  {locale === 'fr'
                    ? 'Nous croyons que le géospatial est bien plus qu\'une technologie : c\'est un langage, une façon de comprendre et de prendre soin du territoire. Notre vision est un monde où les données géospatiales servent à prendre de meilleures décisions pour les communautés, les écosystèmes et les générations futures.'
                    : 'We believe geospatial is much more than a technology: it is a language, a way of understanding and caring for the territory. Our vision is a world where geospatial data is used to make better decisions for communities, ecosystems and future generations.'}
                </p>
                <p className="text-geo-ink-soft leading-relaxed mt-4">
                  {locale === 'fr'
                    ? 'GÉOMTL aspire à être le lieu où cette vision prend forme, où les idées deviennent des projets et où les projets deviennent des politiques et des pratiques.'
                    : 'GÉOMTL aspires to be the place where this vision takes shape, where ideas become projects and where projects become policies and practices.'}
                </p>
              </div>
            </section>

            <section className="glass-2027 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-geo-ink mb-3 flex items-center gap-2">
                  <Trophy size={26} weight="light" aria-hidden="true" />
                  {locale === 'fr' ? 'Le prix GAÏA' : 'The GAÏA Prize'}
                </h2>
                <p className="text-geo-ink-soft leading-relaxed">
                  {locale === 'fr'
                    ? 'Reconnaître l\'excellence fait partie de notre mission. GÉOMTL accueille la remise du prix GAÏA, décerné depuis 1993 par les sections Montréal et Champlain de l\'Association canadienne des sciences géomatiques (ACSG) pour souligner un apport remarquable à la géomatique au Québec.'
                    : 'Recognizing excellence is part of our mission. GÉOMTL hosts the presentation of the GAÏA Prize, awarded since 1993 by the Montréal and Champlain sections of the ACSG (Canadian Institute of Geomatics) to honour a remarkable contribution to geomatics in Quebec.'}
                </p>
              </div>
              <Link
                href={`/${locale}/prix`}
                className="group inline-flex flex-shrink-0 items-center justify-center gap-2 self-start lg:self-center bg-geo-ink px-6 py-3 font-semibold text-geo-cream hover:bg-geo-ink/85 transition-colors"
              >
                {locale === 'fr' ? 'Découvrir le prix et ses lauréats' : 'Discover the prize and its laureates'}
                <ArrowRight size={18} weight="light" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </section>

            <Histoire locale={locale} titre={t('historyTitle')} />
          </>
        )}

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold text-geo-ink mb-6 flex items-center gap-2"><UsersThree size={26} weight="light" aria-hidden="true" />{t('teamTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map(member => (
              <div key={member.name} className="glass-2027 rounded-xl p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-geo-ink flex-shrink-0"
                  style={{ background: `${member.color}20`, border: `1px solid ${member.color}40` }}
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-geo-ink text-sm">{member.name}</p>
                  <p className="text-xs text-geo-ink-soft leading-snug">{member.role}</p>
                  <p className="text-xs mt-0.5 font-medium text-geo-teal-dark">{member.org}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ContactSection />
      </Container>
    </div>
  );
}
