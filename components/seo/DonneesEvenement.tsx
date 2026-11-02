import { EVENT_CONFIG } from '@/data/config';
import { URL_SITE } from '@/lib/site';

// Données structurées schema.org de l'événement : elles aident Google à
// présenter GÉOMTL 2027 comme un événement (dates, lieu, billets).
export default function DonneesEvenement({ locale }: { locale: string }) {
  const fr = locale === 'fr';
  const { tarifs, datesEvenement, ticketUrl } = EVENT_CONFIG;
  const billets = fr ? ticketUrl.fr : ticketUrl.en;

  const offre = (nom: string, prix: number, periode: Record<string, string> = {}) => ({
    '@type': 'Offer',
    name: nom,
    price: prix,
    priceCurrency: 'CAD',
    availability: 'https://schema.org/InStock',
    url: billets,
    ...periode,
  });

  const evenement = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: EVENT_CONFIG.name,
    description: fr
      ? 'La conférence géospatiale de référence du Québec : conférences, ateliers, vitrines technologiques et salon des exposants.'
      : "Quebec's reference geospatial conference: talks, workshops, technology showcases and an exhibition hall.",
    startDate: datesEvenement.debut,
    endDate: datesEvenement.fin,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${URL_SITE}/${locale}`,
    image: `${URL_SITE}/${locale}/opengraph-image`,
    location: {
      '@type': 'Place',
      name: fr ? EVENT_CONFIG.venue.fr : EVENT_CONFIG.venue.en,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1325, rue Daniel-Johnson Ouest',
        addressLocality: 'Saint-Hyacinthe',
        addressRegion: 'QC',
        postalCode: 'J2S 8S4',
        addressCountry: 'CA',
      },
    },
    organizer: { '@type': 'Organization', name: 'GÉOMTL', url: URL_SITE },
    offers: [
      offre(fr ? 'Forfait 2 jours, tarif anticipé' : '2-day package, early rate', tarifs.deuxJours, {
        validThrough: tarifs.finTarifAnticipe,
      }),
      offre(fr ? 'Forfait 2 jours, tarif régulier' : '2-day package, regular rate', tarifs.deuxJoursRegulier, {
        validFrom: tarifs.debutTarifRegulier,
      }),
      offre(fr ? 'Forfait 1 jour, 4 octobre' : '1-day package, October 4', tarifs.jour4),
      offre(fr ? 'Forfait 1 jour, 5 octobre' : '1-day package, October 5', tarifs.jour5),
      offre(fr ? 'Forfait Étudiant' : 'Student package', tarifs.etudiant),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // « < » échappé : le contenu ne peut pas fermer la balise script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(evenement).replace(/</g, '\\u003c') }}
    />
  );
}
