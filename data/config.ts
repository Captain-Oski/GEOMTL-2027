export const EVENT_CONFIG = {
  name: "GÉOMTL 2027",
  dates: { fr: "3–5 octobre 2027", en: "October 3–5, 2027" },
  // Dates des forfaits en vente (billetterie et Le Point de Vente), pour les données structurées
  datesEvenement: { debut: "2027-10-04", fin: "2027-10-05" },
  venue: { fr: "Centre de congrès de Saint-Hyacinthe", en: "Centre de congrès de Saint-Hyacinthe" },
  city: "Saint-Hyacinthe, QC",
  stats: { participants: 400, days: 2, speakers: 60, workshops: 20, exhibitors: 26, awards: 1 },
  tagline: {
    fr: "Comprendre le territoire, façonner l'avenir.",
    en: "Understanding the territory, shaping the future."
  },
  microSlogans: {
    fr: [
      "Voir le territoire autrement.",
      "Connecter les données, les idées et les décisions.",
      "Là où le géospatial devient une expérience collective."
    ],
    en: [
      "See the territory differently.",
      "Connect data, ideas, and decisions.",
      "Where geospatial becomes a collective experience."
    ]
  },
  // Événement GÉOMTL 2027 sur Le Point de Vente (page en français et en anglais)
  ticketUrl: {
    fr: "https://lepointdevente.com/billets/l0z261010001?lang=fr",
    en: "https://lepointdevente.com/tickets/l0z261010001?lang=en"
  },
  // Tarifs validés par le comité (JD, octobre 2026). Le forfait 2 jours est le seul
  // à avoir un tarif anticipé (jusqu'au 15 août 2027) et un tarif régulier.
  tarifs: {
    deuxJours: 795,
    deuxJoursRegulier: 895,
    jour4: 495,
    jour5: 400,
    etudiant: 95,
    finTarifAnticipe: "2027-08-15",
    debutTarifRegulier: "2027-08-16"
  },
  partnerUrl: "#devenir-partenaire",
  email: "info@geomtl.com",
  // Une adresse par sujet ; info@ reste l'adresse générale.
  courriels: {
    info: "info@geomtl.com",
    inscription: "inscription@geomtl.com",
    partenariat: "partenariat@geomtl.com",
    conferencier: "conferencier@geomtl.com"
  },
  // Adresse « action » du formulaire intégré Mailchimp (Forms > Embedded form,
  // balise <form>). Une fois remplie, les boutons « S'abonner » mènent à la page
  // /infolettre ; tant qu'elle est vide, ils ouvrent un courriel prérempli.
  mailchimpAction: "https://geomtl.us12.list-manage.com/subscribe/post?u=e8567f65db880b7495086d39a&amp;id=a5d830038f&amp;f_id=0002b7e0f0" as string | null,
  address: {
    fr: "1325, rue Daniel-Johnson Ouest, Saint-Hyacinthe, QC J2S 8S4",
    en: "1325 rue Daniel-Johnson Ouest, Saint-Hyacinthe, QC J2S 8S4"
  },
  social: {
    linkedin: "https://www.linkedin.com/company/geomtl"
  }
};

export const LOCALES = ['fr', 'en'] as const;
export type Locale = typeof LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'fr';
