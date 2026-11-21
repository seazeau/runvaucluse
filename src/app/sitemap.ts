import { MetadataRoute } from 'next';
import racesData from '@/data/races.json';
import itinerairesData from '@/data/itineraires.json';
import { Race } from '@/lib/types';
import { getRacesWithResults } from '@/lib/db';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://runvaucluse.fr';
  const baselineDate = new Date('2026-11-01');
  const today = new Date();

  const raceUrls = (racesData as Race[]).map((race) => ({
    url: `${baseUrl}/race/${race.slug}/`,
    lastModified: race.updated_at ? new Date(race.updated_at) : baselineDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const explorerUrls = (itinerairesData as { slug: string }[]).map((itinaire) => ({
    url: `${baseUrl}/explorer/${itinaire.slug}/`,
    lastModified: baselineDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const resultsData = getRacesWithResults();
  const resultsUrls = resultsData.map((race) => ({
    url: `${baseUrl}/resultats/${race.slug}/`,
    lastModified: baselineDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explorer/`,
      lastModified: baselineDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resultats/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/records/`,
      lastModified: baselineDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/coureur/`,
      lastModified: baselineDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/shoe-finder/`,
      lastModified: new Date('2026-11-19'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...raceUrls,
    ...explorerUrls,
    ...resultsUrls,
  ];
}
