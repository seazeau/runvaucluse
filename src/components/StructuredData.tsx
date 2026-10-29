import { Race } from '@/lib/types';

export default function StructuredData({ race }: { race: Race }) {
  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const raceYear = raceDate.getFullYear();

  const isMarathonAvignon = race.slug === 'marathon-davignon-avignon';
  const isMarathonTerroirs = race.slug === 'marathon-des-terroirs-du-ventoux-mazan';
  const eventName = isMarathonAvignon 
    ? "Marathon & Semi-Marathon d'Avignon 2027" 
    : isMarathonTerroirs
    ? "Marathon des Terroirs du Ventoux 2027"
    : `${race.name} ${raceYear}`;

  const description = isMarathonAvignon
    ? "Participez à la 2ème édition du Marathon et Semi-Marathon d'Avignon le 14 mars 2027 : 6 000 dossards, 42,195 km et 21,1 km labellisés FFA, inscriptions Finishers et tracés GPX."
    : isMarathonTerroirs
    ? "Participez à la 1ère édition du Marathon des Terroirs du Ventoux les 23 et 24 octobre 2027 à Mazan : Marathon (42 km), Semi (21 km), 10 km, Rando (5 km) et courses enfants. Foulées festives et ravitaillements gourmands au cœur des domaines AOC Ventoux."
    : race.description || `Participez à ${race.name} (${race.type}) le ${formattedDate} à ${race.city} en Vaucluse (84). Distances au programme : ${race.distances}. Inscription, parcours et infos pratiques sur RunVaucluse.`;

  const registrationUrl = race.registration_link || race.link || `https://runvaucluse.fr/race/${race.slug}/`;

  const fullImageUrl = race.image_url?.startsWith('http') 
    ? race.image_url 
    : `https://runvaucluse.fr${race.image_url || '/images/og-image.jpg'}`;

  // Complete Schema.org @graph including SportsEvent, BreadcrumbList, and FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Sports Event Schema
      {
        '@type': 'SportsEvent',
        '@id': `https://runvaucluse.fr/race/${race.slug}/#event`,
        name: eventName,
        description: description,
        url: `https://runvaucluse.fr/race/${race.slug}/`,
        startDate: race.date,
        endDate: race.date,
        eventStatus: race.is_cancelled ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: `${race.name} - ${race.city}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: race.city,
            addressRegion: 'Vaucluse',
            postalCode: '84000',
            addressCountry: 'FR',
          },
        },
        image: [fullImageUrl],
        offers: {
          '@type': 'Offer',
          url: registrationUrl,
          availability: race.is_cancelled ? 'https://schema.org/Discontinued' : 'https://schema.org/InStock',
          price: '0',
          priceCurrency: 'EUR',
          validFrom: `${raceYear - 1}-10-01`,
        },
        organizer: {
          '@type': 'Organization',
          name: race.contact || 'Comité d\'Organisation RunVaucluse',
          url: race.website || `https://runvaucluse.fr/race/${race.slug}/`,
        },
        sport: race.type.toLowerCase().includes('trail') ? 'Trail running' : 'Running',
      },

      // 2. BreadcrumbList Schema (Rich Google SERP Breadcrumbs)
      {
        '@type': 'BreadcrumbList',
        '@id': `https://runvaucluse.fr/race/${race.slug}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: 'https://runvaucluse.fr/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Calendrier des Courses',
            item: 'https://runvaucluse.fr/#calendrier',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: race.name,
            item: `https://runvaucluse.fr/race/${race.slug}/`,
          },
        ],
      },

      // 3. FAQPage Schema (Triggers Rich Snippet Accordions in Google Search)
      {
        '@type': 'FAQPage',
        '@id': `https://runvaucluse.fr/race/${race.slug}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `Quand a lieu la course ${race.name} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${race.name} se déroule le ${formattedDate} à ${race.city} dans le département du Vaucluse (84), en région Provence-Alpes-Côte d'Azur.`,
            },
          },
          {
            '@type': 'Question',
            name: `Quelles sont les distances proposées sur ${race.name} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `L'épreuve propose les formats et distances suivants : ${race.distances}. Il s'agit d'une épreuve officielle de type ${race.type}.`,
            },
          },
          {
            '@type': 'Question',
            name: `Comment s'inscrire à ${race.name} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: race.is_cancelled 
                ? `L'édition ${raceYear} de cette épreuve a été officiellement annulée.`
                : race.registration_link
                ? `Les inscriptions en ligne sont ouvertes sur la plateforme ${race.registration_platform || 'officielle'} : ${race.registration_link}. Retrouvez toutes les infos pratiques sur RunVaucluse.`
                : `Les inscriptions et modalités pratiques pour ${race.name} sont gérées par l'organisation (${race.contact || 'contact organisateur'}) et référencées sur le calendrier RunVaucluse.`,
            },
          },
          {
            '@type': 'Question',
            name: `Où se situe le départ de la course à ${race.city} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Le rassemblement et le départ de l'épreuve ont lieu sur la commune de ${race.city} (Vaucluse). Un plan d'accès et une carte géographique interactive sont consultables directement sur la fiche RunVaucluse.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
