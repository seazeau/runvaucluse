import styles from './Results.module.css';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getResultsBySlug, getRaceBySlug, getRacesWithResults } from '@/lib/db';
import { Metadata } from 'next';
import RaceResultsClient from './RaceResultsClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = getRaceBySlug(slug);
  
  if (!race) return { title: 'Résultats non trouvés' };

  return {
    title: `Résultats : ${race.name} 2026 | RunVaucluse`,
    description: `Classement complet et temps officiels de la course ${race.name} qui a eu lieu le ${new Date(race.date).toLocaleDateString('fr-FR')}.`,
  };
}

export async function generateStaticParams() {
  const races = getRacesWithResults();
  return races.map((race) => ({
    slug: race.slug,
  }));
}

export default async function RaceResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = getRaceBySlug(slug);
  const results = getResultsBySlug(slug);

  if (!race) return <div className={styles.noResults}>Course non trouvée</div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": race.name,
    "startDate": race.date,
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": race.city || "Vaucluse",
        "addressRegion": "Vaucluse",
        "addressCountry": "FR"
      }
    },
    "description": `Résultats de la course ${race.name}`,
    "url": `https://runvaucluse.fr/resultats/${slug}`
  };

  return (
    <div className={styles.pageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/resultats" className={styles.backLink}>
            <ChevronLeft size={16} /> TOUS LES RÉSULTATS
          </Link>

          <div className={styles.header}>
            <h1 className={styles.title}>{race.name}</h1>
            <p className={styles.subtitle}>
              {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} — {results.length} Finisseurs
            </p>
          </div>

          <RaceResultsClient results={results} />
        </div>
      </main>
    </div>
  );
}
