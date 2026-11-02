import { setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import type { Metadata } from 'next';
import { alternatesPage } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? "Conditions d'utilisation" : 'Terms of Use', alternates: alternatesPage(locale, '/conditions') };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

const UPDATED = '23 octobre 2026';
const UPDATED_EN = 'October 23, 2026';
const EMAIL = 'info@geomtl.com';

export default async function ConditionsPage(
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
      id: 'acceptation',
      title: "1. Acceptation des conditions",
      content: (
        <p>
          En accédant au site <strong>geomtl.com</strong> ou en vous inscrivant à l&apos;événement
          GÉOMTL 2027, vous acceptez les présentes conditions d&apos;utilisation dans leur intégralité.
          Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser ce site.
        </p>
      ),
    },
    {
      id: 'acces',
      title: '2. Accès au site',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL s&apos;efforce d&apos;assurer la disponibilité du site en tout temps, mais ne peut
            garantir un accès ininterrompu. Nous nous réservons le droit de suspendre, modifier
            ou interrompre le site à tout moment, sans préavis.
          </p>
          <p>
            Il vous appartient de vous assurer que votre équipement et votre connexion sont
            compatibles avec le site.
          </p>
        </div>
      ),
    },
    {
      id: 'propriete',
      title: '3. Propriété intellectuelle',
      content: (
        <div className="space-y-2">
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, logos, graphiques, vidéos,
            présentation et architecture) est la propriété exclusive de GÉOMTL ou de ses
            partenaires et est protégé par les lois canadiennes et québécoises sur le droit d&apos;auteur.
          </p>
          <p>
            Toute reproduction, distribution, modification ou utilisation commerciale de ce
            contenu sans autorisation écrite préalable est strictement interdite.
          </p>
          <p>
            Les marques de commerce des partenaires et exposants affichées sur ce site demeurent
            la propriété de leurs titulaires respectifs.
          </p>
        </div>
      ),
    },
    {
      id: 'inscription',
      title: '4. Inscription et billetterie',
      content: (
        <div className="space-y-2">
          <p>
            L&apos;inscription à GÉOMTL 2027 est soumise aux conditions spécifiques communiquées
            lors de l&apos;achat. En vous inscrivant, vous certifiez que les informations fournies
            sont exactes et complètes.
          </p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Les billets sont nominatifs et non transférables.</li>
            <li>Aucun échange et aucun remboursement.</li>
            <li>GÉOMTL se réserve le droit de modifier le programme sans remboursement automatique.</li>
            <li>
              En cas d&apos;annulation de l&apos;événement pour cause de force majeure, un avoir ou
              remboursement partiel sera proposé.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'conduite',
      title: '5. Code de conduite',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL est un espace inclusif et professionnel. Tout participant s&apos;engage à respecter
            les autres participant(e)s, conférencier(ère)s, exposants et organisateurs.
          </p>
          <p>Sont strictement interdits :</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Toute forme de harcèlement, discrimination ou intimidation</li>
            <li>Les comportements offensants ou perturbateurs</li>
            <li>La photographie ou l&apos;enregistrement sans consentement</li>
            <li>L&apos;utilisation non autorisée du nom ou des visuels de GÉOMTL</li>
          </ul>
          <p>
            Tout manquement à ce code peut entraîner l&apos;exclusion de l&apos;événement sans remboursement.
          </p>
        </div>
      ),
    },
    {
      id: 'image',
      title: "6. Droit à l'image",
      content: (
        <p>
          L&apos;événement fait l&apos;objet de photographies et d&apos;enregistrements vidéo à des fins
          de communication et d&apos;archives. En participant à GÉOMTL 2027, vous acceptez que votre
          image puisse être captée et utilisée dans ce cadre. Si vous souhaitez exercer votre
          droit d&apos;opposition, contactez-nous avant l&apos;événement à{' '}
          <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
    {
      id: 'responsabilite',
      title: '7. Limitation de responsabilité',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL ne saurait être tenu responsable des dommages directs ou indirects résultant
            de l&apos;utilisation de ce site, d&apos;une interruption de service, d&apos;une erreur
            dans le contenu ou de la perte de données.
          </p>
          <p>
            Les liens vers des sites tiers sont fournis à titre informatif. GÉOMTL n&apos;est pas
            responsable du contenu de ces sites externes.
          </p>
        </div>
      ),
    },
    {
      id: 'droit',
      title: '8. Droit applicable',
      content: (
        <p>
          Les présentes conditions sont régies par les lois de la province de Québec et les lois
          fédérales canadiennes applicables. Tout litige sera soumis à la compétence exclusive
          des tribunaux du district judiciaire de Montréal.
        </p>
      ),
    },
    {
      id: 'modifications',
      title: '9. Modifications',
      content: (
        <p>
          GÉOMTL se réserve le droit de modifier ces conditions à tout moment. Les modifications
          entrent en vigueur dès leur publication sur ce site. Nous vous encourageons à consulter
          cette page régulièrement. Pour toute question :{' '}
          <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
  ] : [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <p>
          By accessing <strong>geomtl.com</strong> or registering for the GÉOMTL 2027 event,
          you agree to these terms of use in their entirety. If you do not accept these terms,
          please do not use this site.
        </p>
      ),
    },
    {
      id: 'access',
      title: '2. Site Access',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL endeavours to keep the site available at all times but cannot guarantee
            uninterrupted access. We reserve the right to suspend, modify or discontinue the
            site at any time without notice.
          </p>
          <p>
            It is your responsibility to ensure your equipment and connection are compatible
            with the site.
          </p>
        </div>
      ),
    },
    {
      id: 'intellectual-property',
      title: '3. Intellectual Property',
      content: (
        <div className="space-y-2">
          <p>
            All content on this site (text, images, logos, graphics, videos, layout and
            architecture) is the exclusive property of GÉOMTL or its partners and is protected
            by Canadian and Quebec copyright laws.
          </p>
          <p>
            Any reproduction, distribution, modification or commercial use of this content
            without prior written authorization is strictly prohibited.
          </p>
          <p>
            Trademarks of partners and exhibitors displayed on this site remain the property
            of their respective owners.
          </p>
        </div>
      ),
    },
    {
      id: 'registration',
      title: '4. Registration and Ticketing',
      content: (
        <div className="space-y-2">
          <p>
            Registration for GÉOMTL 2027 is subject to specific conditions communicated at
            the time of purchase. By registering, you certify that the information provided
            is accurate and complete.
          </p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Tickets are issued in the attendee&apos;s name and are non-transferable.</li>
            <li>No exchanges and no refunds.</li>
            <li>GÉOMTL reserves the right to modify the program without automatic refund.</li>
            <li>
              In the event of cancellation due to force majeure, a credit or partial refund
              will be offered.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'conduct',
      title: '5. Code of Conduct',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL is an inclusive and professional space. All participants agree to respect
            fellow attendees, speakers, exhibitors and organizers.
          </p>
          <p>Strictly prohibited:</p>
          <ul className="list-disc list-inside space-y-1 text-geo-ink-soft">
            <li>Any form of harassment, discrimination or intimidation</li>
            <li>Offensive or disruptive behaviour</li>
            <li>Photography or recording without consent</li>
            <li>Unauthorized use of the GÉOMTL name or visuals</li>
          </ul>
          <p>
            Violation of this code may result in removal from the event without refund.
          </p>
        </div>
      ),
    },
    {
      id: 'image-rights',
      title: '6. Image Rights',
      content: (
        <p>
          The event is photographed and video-recorded for communications and archival purposes.
          By attending GÉOMTL 2027, you agree that your image may be captured and used for
          these purposes. To exercise your right of objection, contact us before the event at{' '}
          <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      content: (
        <div className="space-y-2">
          <p>
            GÉOMTL shall not be liable for any direct or indirect damages resulting from use
            of this site, service interruptions, content errors or data loss.
          </p>
          <p>
            Links to third-party sites are provided for informational purposes only. GÉOMTL
            is not responsible for the content of those external sites.
          </p>
        </div>
      ),
    },
    {
      id: 'governing-law',
      title: '8. Governing Law',
      content: (
        <p>
          These terms are governed by the laws of the Province of Quebec and applicable
          federal Canadian laws. Any dispute shall be submitted to the exclusive jurisdiction
          of the courts of the judicial district of Montreal.
        </p>
      ),
    },
    {
      id: 'changes',
      title: '9. Changes',
      content: (
        <p>
          GÉOMTL reserves the right to modify these terms at any time. Changes take effect
          upon publication on this site. We encourage you to check this page regularly.
          For any questions:{' '}
          <a href={`mailto:${EMAIL}`} className="text-geo-teal-dark hover:underline">{EMAIL}</a>.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-geo-cream pt-20">
      {/* Header */}
      <div className="page-header-2027 py-16 sm:py-20">
        <Container>
          <p className="text-xs font-semibold tracking-widest uppercase text-geo-ink mb-3">
            {fr ? 'Documents légaux' : 'Legal Documents'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-geo-ink mb-3">
            {fr ? "Conditions d'utilisation" : 'Terms of Use'}
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
