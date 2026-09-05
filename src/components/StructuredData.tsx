import { Race } from '@/lib/types';

export default function StructuredData({ race }: { race: Race }) {
  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const description = race.description || 
    `Participez à ${race.name} (${race.type}) le ${formattedDate} à ${race.city} en Vaucluse (84). Distances au programme : ${race.distances}. Inscription, parcours et infos pratiques sur RunVaucluse.`;

  const registrationUrl = race.registration_link || race.link || `https://runvaucluse.fr/race/${race.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: race.name,
    description: description,
    startDate: race.date,
    endDate: race.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: `${race.city}, Vaucluse`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: race.city,
        addressRegion: 'Vaucluse',
        addressCountry: 'FR',
      },
    },
    image: [
      race.image_url || 'https://runvaucluse.fr/images/og-image.jpg'
    ],
    offers: {
      '@type': 'Offer',
      url: registrationUrl,
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'EUR',
      validFrom: '2026-01-01'
    },
    organizer: {
      '@type': 'Organization',
      name: race.contact || 'Comité d\'Organisation RunVaucluse',
      url: race.website || `https://runvaucluse.fr/race/${race.slug}`,
    },
    url: `https://runvaucluse.fr/race/${race.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
