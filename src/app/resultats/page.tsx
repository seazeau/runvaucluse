import LatestWinners from '@/components/LatestWinners';
import styles from './ResultatsList.module.css';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getRacesWithResults, getLatestWinners } from '@/lib/db';

export const metadata = {
  title: "Résultats & Classements des Courses en Vaucluse 2026 | RunVaucluse",
  description: "Consultez tous les résultats officiels, chronos et classements des courses sur route et trails en Vaucluse (84) : 10 km, semi, marathon et trails du Ventoux.",
  keywords: [
    "résultats course vaucluse",
    "classement course 84",
    "résultats trail vaucluse 2026",
    "chronos course à pied vaucluse",
    "classement trail ventoux"
  ],
  alternates: {
    canonical: 'https://runvaucluse.fr/resultats/',
  },
  openGraph: {
    title: "Résultats & Classements des Courses en Vaucluse 2026 | RunVaucluse",
    description: "Consultez les résultats officiels et classements de toutes les courses à pied du 84.",
    url: 'https://runvaucluse.fr/resultats/',
    type: 'website',
  }
};

export default async function ResultatsPage() {
  const races = getRacesWithResults();
  const latestWinners = getLatestWinners(3);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>RÉSULTATS DES COURSES</h1>
            <p className={styles.subtitle}>
              Retrouvez les classements officiels et les performances de tous les coureurs sur les épreuves du Vaucluse.
            </p>
          </header>

          <LatestWinners races={latestWinners} />

          <div style={{ marginTop: '4rem' }}>
            <h2 className={styles.sectionTitle}>
              <Calendar size={24} style={{ marginRight: '0.75rem' }} />
              HISTORIQUE DES RÉSULTATS
            </h2>
          </div>

          {races.length > 0 ? (
            <div className={styles.raceGrid}>
              {races.map((race) => (
                <Link href={`/resultats/${race.slug}`} key={race.slug} className={styles.raceCard}>
                  <div className={styles.date}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h2 className={styles.raceName}>{race.name}</h2>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <Users size={16} />
                      {race.resultCount} Finisseurs
                    </div>
                    <div className={styles.stat}>
                      <Trophy size={16} />
                      Classements importés
                    </div>
                  </div>
                  <div className={styles.viewBtn}>
                    Voir le classement <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <Trophy size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
              <p>Aucun résultat n&apos;est disponible pour le moment.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Les classements sont ajoutés après chaque week-end de course.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
