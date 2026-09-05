import { MetadataRoute } from 'next';
import racesData from '@/data/races.json';
import itinerairesData from '@/data/itineraires.json';
import { Race } from '@/lib/types';
import { getRacesWithResults } from '@/lib/db';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://runvaucluse.fr';

  const raceUrls = (racesData as Race[]).map((race) => ({
    url: `${baseUrl}/race/${race.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const explorerUrls = (itinerairesData as { slug: string }[]).map((itinaire) => ({
    url: `${baseUrl}/explorer/${itinaire.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const resultsData = getRacesWithResults();
  const resultsUrls = resultsData.map((race) => ({
    url: `${baseUrl}/resultats/${race.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explorer/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resultats/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/records/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/coureur/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...raceUrls,
    ...explorerUrls,
    ...resultsUrls,
  ];
}
