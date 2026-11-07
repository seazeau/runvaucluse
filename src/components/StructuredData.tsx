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
    ? "Dimanche 14 mars 2027 : 2ème édition du Marathon (42,195 km, départ 9h00) et Semi-Marathon d'Avignon (21,1 km, départ 8h00). 6 000 dossards sur Finishers, parcours plat (+80m D+) labellisé FFA au cœur du Palais des Papes et de l'Île de la Barthelasse, tracés GPX officiels."
    : isMarathonTerroirs
    ? "Participez à la 1ère édition du Marathon des Terroirs du Ventoux les 23 et 24 octobre 2027 à Mazan : Marathon (42 km), Semi (21 km), 10 km, Rando (5 km) et courses enfants. Foulées festives et ravitaillements gourmands au cœur des domaines AOC Ventoux."
    : race.description || `Participez à ${race.name} (${race.type}) le ${formattedDate} à ${race.city} en Vaucluse (84). Distances au programme : ${race.distances}. Inscription, parcours et infos pratiques sur RunVaucluse.`;

  const registrationUrl = race.registration_link || race.link || `https://runvaucluse.fr/race/${race.slug}/`;

  const fullImageUrl = race.image_url?.startsWith('http') 
    ? race.image_url 
    : `https://runvaucluse.fr${race.image_url || '/images/og-image.jpg'}`;

  const faqEntities = isMarathonAvignon
    ? [
        {
          '@type': 'Question',
          name: "Quelle est la date et l'heure de départ du Marathon et Semi-Marathon d'Avignon 2027 ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "La 2ème édition du Marathon et Semi-Marathon d'Avignon a lieu le dimanche 14 mars 2027 devant la Gare Avignon Centre (Cours Jean Jaurès). Le départ du Semi-Marathon (21,0975 km) est donné à 8h00 et le départ du Marathon (42,195 km) à 9h00.",
          },
        },
        {
          '@type': 'Question',
          name: "Comment s'inscrire au Marathon et Semi-Marathon d'Avignon 2027 ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Les inscriptions en ligne sont ouvertes sur la plateforme officielle Finishers (6 000 dossards disponibles : 3 000 sur le Marathon et 3 000 sur le Semi-Marathon). Un Parcours de Prévention Santé (PPS de moins de 3 mois) ou une licence FFA valide est requis pour valider le dossier.",
          },
        },
        {
          '@type': 'Question',
          name: "Quel est le parcours et le dénivelé du Marathon d'Avignon 2027 (GPX) ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Le parcours est 100 % sur route, ultra-plat et mesuré officiellement avec label FFA (qualificatif Championnats de France) : +80m D+ sur le Marathon (42,195 km) et +60m D+ sur le Semi-Marathon (21,1 km). Il traverse les remparts, le Palais des Papes, le Pont Daladier et l'Île de la Barthelasse. Les tracés GPX officiels 42K et 21K sont téléchargeables gratuitement sur RunVaucluse.",
          },
        },
        {
          '@type': 'Question',
          name: "Où et quand retirer son dossard pour le Marathon d'Avignon 2027 ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Le retrait des dossards s'effectue à l'Espace Jeanne Laurent (2 Montée des Moulins, 84000 Avignon) le vendredi 12 mars 2027 de 16h00 à 20h00 et le samedi 13 mars 2027 de 10h00 à 20h00 sur présentation de la carte d'identité et du QR Code Finishers. Aucun dossard n'est remis le dimanche matin.",
          },
        },
        {
          '@type': 'Question',
          name: "Quelles sont les barrières horaires et allures des meneurs d'allure à Avignon ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "La barrière horaire est fixée à 2h45 sur le Semi-Marathon (4 meneurs d'allure : 1h20, 1h30, 1h45, 2h00) et à 5h45 sur le Marathon avec passages limites en 2h55 au KM 21 et 4h05 au KM 30 (6 meneurs d'allure : 3h00, 3h15, 3h30, 3h45, 4h00 et 4h30).",
          },
        },
      ]
    : [
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
      ];

  // Complete Schema.org @graph including SportsEvent, BreadcrumbList, and FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Sports Event Schema
      {
        '@type': 'SportsEvent',
        '@id': `https://runvaucluse.fr/race/${race.slug}/#event`,
        name: eventName,
        alternateName: isMarathonAvignon
          ? ["Marathon d'Avignon 2027", "Semi-Marathon d'Avignon 2027", "Semi Avignon 2027"]
          : undefined,
        description: description,
        url: `https://runvaucluse.fr/race/${race.slug}/`,
        startDate: isMarathonAvignon ? '2027-03-14T08:00:00+01:00' : race.date,
        endDate: isMarathonAvignon ? '2027-03-14T15:00:00+01:00' : race.date,
        eventStatus: race.is_cancelled ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: isMarathonAvignon ? 'Parvis Gare Avignon Centre & Île de la Barthelasse - Avignon' : `${race.name} - ${race.city}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: isMarathonAvignon ? 'Boulevard Saint-Roch / Cours Jean Jaurès' : undefined,
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
        subEvent: isMarathonAvignon
          ? [
              {
                '@type': 'SportsEvent',
                name: "Marathon d'Avignon 2027 (42,195 km - Labellisé FFA)",
                startDate: '2027-03-14T09:00:00+01:00',
                description: "Marathon officiel de 42,195 km (+80m D+) labellisé FFA au départ de la Gare Avignon Centre à 9h00. 3 000 dossards.",
                url: 'https://runvaucluse.fr/race/marathon-davignon-avignon/',
              },
              {
                '@type': 'SportsEvent',
                name: "Semi-Marathon d'Avignon 2027 (21,0975 km - Labellisé FFA)",
                startDate: '2027-03-14T08:00:00+01:00',
                description: "Semi-Marathon officiel de 21,0975 km (+60m D+) labellisé FFA au départ de la Gare Avignon Centre à 8h00. 3 000 dossards.",
                url: 'https://runvaucluse.fr/race/marathon-davignon-avignon/',
              },
            ]
          : undefined,
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
            name: eventName,
            item: `https://runvaucluse.fr/race/${race.slug}/`,
          },
        ],
      },

      // 3. FAQPage Schema (Triggers Rich Snippet Accordions in Google Search)
      {
        '@type': 'FAQPage',
        '@id': `https://runvaucluse.fr/race/${race.slug}/#faq`,
        mainEntity: faqEntities,
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
