import { setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import type { Metadata } from 'next';
import { alternatesPage } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy', alternates: alternatesPage(locale, '/confidentialite') };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

const UPDATED = '26 octobre 2026';
const UPDATED_EN = 'October 26, 2026';
const EMAIL = 'info@geomtl.com';

export default async function ConfidentialitePage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const fr = locale === 'fr';

  const sections = fr ? [
    {
      id: 'responsable',
      title: '1. Responsable du traitement',
      content: (
        <p>
          GÉOMTL (ci-après «&nbsp;nous&nbsp;») est responsable de la protection des renseignements
          personnels collectés via le site <strong>geomtl.com</strong>. Pour toute question,
          écrivez à <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
    {
      id: 'collecte',
      title: '2. Renseignements collectés',
      content: (
        <div className="space-y-3">
          <p>Nous collectons uniquement les renseignements que vous nous fournissez volontairement :</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Formulaire de contact : nom, courriel, message</li>
            <li>Demande pour devenir partenaire ou exposant : organisation (nom, adresse civique, téléphone), responsable de la facturation et responsable du kiosque sur place (nom, courriel, téléphone), niveau et kiosque souhaités, message</li>
            <li>Infolettre : adresse courriel</li>
            <li>Inscription à un atelier : nom, courriel, organisation</li>
          </ul>
          <p>
            Ce site n&apos;utilise à ce jour <strong>aucun outil d&apos;analyse d&apos;audience ni de
            traçage publicitaire</strong>. Si cela change, cette politique sera mise à jour et votre
            consentement sera demandé au préalable.
          </p>
        </div>
      ),
    },
    {
      id: 'temoins',
      title: '3. Témoins (cookies)',
      content: (
        <div className="space-y-3">
          <p>Ce site utilise deux catégories de témoins :</p>
          <div className="space-y-3">
            <div className="glass-2027 rounded-xl p-4">
              <p className="font-semibold text-geo-ink text-sm mb-1">Témoins essentiels</p>
              <p className="text-sm">
                Nécessaires au fonctionnement du site (navigation, préférences de langue).
                Ils ne peuvent pas être désactivés.
              </p>
            </div>
            <div className="glass-2027 rounded-xl p-4">
              <p className="font-semibold text-geo-ink text-sm mb-1">Témoin de consentement</p>
              <p className="text-sm">
                <code className="text-geo-teal-dark text-xs">geomtl_cookie_consent</code> : stocké
                dans votre navigateur (localStorage) pour mémoriser votre choix sur cette bannière.
                Durée : indéfinie, jusqu&apos;à suppression manuelle.
              </p>
            </div>
          </div>
          <p>
            Vous pouvez retirer votre consentement à tout moment en effaçant les données
            locales de votre navigateur pour ce site, ou en nous contactant.
          </p>
        </div>
      ),
    },
    {
      id: 'finalites',
      title: '4. Finalités du traitement',
      content: (
        <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
          <li>Répondre à vos demandes de contact ou d&apos;information</li>
          <li>Traiter vos demandes pour devenir partenaire ou exposant et réserver un kiosque (accessibles seulement au comité organisateur)</li>
          <li>Vous envoyer notre infolettre (si vous y avez souscrit)</li>
          <li>Gérer vos inscriptions aux ateliers et à l&apos;événement</li>
          <li>Mémoriser vos préférences de navigation (langue, consentement)</li>
        </ul>
      ),
    },
    {
      id: 'conservation',
      title: '5. Durée de conservation',
      content: (
        <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
          <li>Messages de contact : 12 mois</li>
          <li>Demandes pour devenir partenaire ou exposant : jusqu&apos;à 6 mois après l&apos;événement</li>
          <li>Inscriptions à l&apos;infolettre : jusqu&apos;à désabonnement</li>
          <li>Données d&apos;inscription à l&apos;événement : 24 mois après l&apos;événement</li>
        </ul>
      ),
    },
    {
      id: 'transferts',
      title: '6. Fournisseurs de services et transferts hors Québec',
      content: (
        <div className="space-y-3">
          <p>
            Pour faire fonctionner le site et l&apos;événement, nous confions certains renseignements
            aux fournisseurs de services suivants, qui les traitent pour notre compte et seulement
            pour ces fins :
          </p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li><strong>Google Workspace</strong> : courriels envoyés par les formulaires du site et échanges avec le comité</li>
            <li><strong>Mailchimp</strong> : envoi de l&apos;infolettre</li>
            <li><strong>Le Point de Vente</strong> : plateforme de billetterie et d&apos;inscription à l&apos;événement</li>
            <li><strong>Vercel</strong> : hébergement du site</li>
            <li><strong>Supabase</strong> : base de données des demandes de partenariat et d&apos;exposition</li>
            <li><strong>Le Studio</strong> : prestataire mandaté par le comité organisateur</li>
          </ul>
          <p>
            Certains de ces fournisseurs, notamment Google, Mailchimp, Vercel et Supabase, conservent
            ou traitent des renseignements à l&apos;extérieur du Québec, entre autres aux États-Unis.
            Ces communications se font conformément à la <em>Loi sur la protection des
            renseignements personnels dans le secteur privé</em> (Loi 25), qui exige que les
            renseignements y bénéficient d&apos;une protection adéquate.
          </p>
        </div>
      ),
    },
    {
      id: 'droits',
      title: '7. Vos droits',
      content: (
        <div className="space-y-2">
          <p>Conformément à la Loi 25, vous avez le droit de :</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Accéder aux renseignements que nous détenons sur vous</li>
            <li>Demander la rectification de renseignements inexacts</li>
            <li>Demander l&apos;effacement de vos renseignements</li>
            <li>Retirer votre consentement en tout temps</li>
            <li>Déposer une plainte auprès de la Commission d&apos;accès à l&apos;information du Québec</li>
          </ul>
          <p>
            Pour exercer ces droits, écrivez à{' '}
            <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '8. Contact : responsable de la protection des renseignements personnels',
      content: (
        <div className="glass-2027 rounded-xl p-5 space-y-1 text-sm">
          <p className="text-geo-ink font-semibold">Martin Carpentier, président de GÉOMTL</p>
          <p>Responsable de la protection des renseignements personnels</p>
          <p>4590, rue Bosco, Brossard (Québec) J4Z 0L9</p>
          <p>
            <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>
          </p>
        </div>
      ),
    },
  ] : [
    {
      id: 'controller',
      title: '1. Data Controller',
      content: (
        <p>
          GÉOMTL ("we") is responsible for the protection of personal information collected
          through the website <strong>geomtl.com</strong>. For any question, write to{' '}
          <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
    {
      id: 'collection',
      title: '2. Information Collected',
      content: (
        <div className="space-y-3">
          <p>We only collect information you voluntarily provide:</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Contact form: name, email, message</li>
            <li>Partner or exhibitor request: organization (name, street address, phone), billing contact and on-site booth contact (name, email, phone), desired level and booth, message</li>
            <li>Newsletter: email address</li>
            <li>Workshop registration: name, email, organization</li>
          </ul>
          <p>
            This site currently uses <strong>no audience analytics or advertising tracking</strong>.
            If this changes, this policy will be updated and your consent will be requested beforehand.
          </p>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: '3. Cookies',
      content: (
        <div className="space-y-3">
          <p>This site uses two categories of cookies:</p>
          <div className="space-y-3">
            <div className="glass-2027 rounded-xl p-4">
              <p className="font-semibold text-geo-ink text-sm mb-1">Essential cookies</p>
              <p className="text-sm">
                Required for the site to function (navigation, language preferences).
                They cannot be disabled.
              </p>
            </div>
            <div className="glass-2027 rounded-xl p-4">
              <p className="font-semibold text-geo-ink text-sm mb-1">Consent cookie</p>
              <p className="text-sm">
                <code className="text-geo-teal-dark text-xs">geomtl_cookie_consent</code>: stored in
                your browser (localStorage) to remember your banner choice.
                Duration: indefinite, until manually cleared.
              </p>
            </div>
          </div>
          <p>
            You may withdraw your consent at any time by clearing this site&apos;s local data in
            your browser, or by contacting us.
          </p>
        </div>
      ),
    },
    {
      id: 'purposes',
      title: '4. Purposes of Processing',
      content: (
        <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
          <li>Responding to your contact or information requests</li>
          <li>Processing your partner or exhibitor and booth requests (accessible only to the organizing committee)</li>
          <li>Sending our newsletter (if you subscribed)</li>
          <li>Managing workshop and event registrations</li>
          <li>Remembering your browsing preferences (language, consent)</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      title: '5. Retention Period',
      content: (
        <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
          <li>Contact messages: 12 months</li>
          <li>Partner or exhibitor requests: until 6 months after the event</li>
          <li>Newsletter subscriptions: until unsubscription</li>
          <li>Event registration data: 24 months after the event</li>
        </ul>
      ),
    },
    {
      id: 'transfers',
      title: '6. Service Providers and Transfers Outside Quebec',
      content: (
        <div className="space-y-3">
          <p>
            To operate the website and the event, we entrust some information to the following
            service providers, who process it on our behalf and only for these purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li><strong>Google Workspace</strong>: emails sent by the website forms and exchanges with the committee</li>
            <li><strong>Mailchimp</strong>: newsletter delivery</li>
            <li><strong>Le Point de Vente</strong>: ticketing and event registration platform</li>
            <li><strong>Vercel</strong>: website hosting</li>
            <li><strong>Supabase</strong>: database of partner and exhibitor requests</li>
            <li><strong>Le Studio</strong>: service provider engaged by the organizing committee</li>
          </ul>
          <p>
            Some of these providers, including Google, Mailchimp, Vercel and Supabase, store or
            process information outside Quebec, notably in the United States. These transfers are
            made in accordance with Quebec Law 25 (Act respecting the protection of personal
            information in the private sector), which requires the information to receive adequate
            protection.
          </p>
        </div>
      ),
    },
    {
      id: 'rights',
      title: '7. Your Rights',
      content: (
        <div className="space-y-2">
          <p>Under Quebec Law 25, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Withdraw your consent at any time</li>
            <li>File a complaint with the Commission d&apos;accès à l&apos;information du Québec</li>
          </ul>
          <p>
            To exercise these rights, write to{' '}
            <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '8. Contact: Privacy Officer',
      content: (
        <div className="glass-2027 rounded-xl p-5 space-y-1 text-sm">
          <p className="text-geo-ink font-semibold">Martin Carpentier, President of GÉOMTL</p>
          <p>Privacy Officer</p>
          <p>4590 Rue Bosco, Brossard, QC J4Z 0L9, Canada</p>
          <p>
            <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-geo-cream pt-20">
      {/* Header */}
      <div className="page-header-2027 py-16 sm:py-20">
        <Container>
          <p className="text-xs font-semibold tracking-widest uppercase text-geo-ink mb-3">
            {fr ? 'Loi 25 : conformité' : 'Law 25: Compliance'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-geo-ink mb-3">
            {fr ? 'Politique de confidentialité' : 'Privacy Policy'}
          </h1>
          <p className="text-geo-ink-soft text-sm">
            {fr ? `Dernière mise à jour : ${UPDATED}` : `Last updated: ${UPDATED_EN}`}
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <div className="max-w-3xl mx-auto">
          {/* Table of contents */}
          <nav className="glass-2027 rounded-2xl p-5 mb-10">
            <p className="text-xs font-semibold tracking-wider uppercase text-geo-ink-soft mb-3">
              {fr ? 'Sommaire' : 'Contents'}
            </p>
            <ol className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-geo-ink-soft hover:text-geo-teal-dark transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-geo-ink mb-3">{s.title}</h2>
                <div className="text-geo-ink-soft leading-relaxed text-sm">{s.content}</div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
