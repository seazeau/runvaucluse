'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import styles from './Results.module.css';
import Link from 'next/link';
import { slugify, canonicalSlug } from '@/lib/utils';

interface RaceResult {
  id: number;
  race_slug: string;
  event_name: string;
  rank_overall: number;
  bib: string;
  name: string;
  rank_sex: string;
  rank_cat: string;
  time: string;
  podium: string;
  speed: string;
  club: string;
}

interface RaceResultsClientProps {
  results: RaceResult[];
}

export default function RaceResultsClient({ results }: RaceResultsClientProps) {
  // Group results by event_name
  const groupedResults = results.reduce((acc: { [key: string]: RaceResult[] }, res) => {
    if (!acc[res.event_name]) acc[res.event_name] = [];
    acc[res.event_name].push(res);
    return acc;
  }, {});

  const eventNames = Object.keys(groupedResults);
  const [activeDistance, setActiveDistance] = useState(eventNames[0] || "");

  if (results.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>Aucun résultat disponible pour cette course.</p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {/* Distance Filters */}
      <div className={styles.filtersWrapper}>
        <div className={styles.filters}>
          {eventNames.map((name) => (
            <button
              key={name}
              className={`${styles.filterBtn} ${activeDistance === name ? styles.activeFilter : ''}`}
              onClick={() => setActiveDistance(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Table */}
      {activeDistance && groupedResults[activeDistance] && (
        <div className={styles.distanceSection}>
          <h2 className={styles.distanceTitle}>
            <Trophy size={20} className={styles.trophyIcon} />
            {activeDistance}
          </h2>
          
          <div className={styles.tableContainer}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Doss.</th>
                  <th>Nom</th>
                  <th>Sexe</th>
                  <th>Cat.</th>
                  <th>Temps</th>
                  <th>Vitesse</th>
                  <th>Club</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults[activeDistance].map((res) => (
                  <tr key={res.id}>
                    <td className={styles.rank}>{res.rank_overall}</td>
                    <td>{res.bib}</td>
                    <td className={styles.name}>
                      {!res.name || res.name.toLowerCase().includes('inconnu') || res.name.toLowerCase().includes('dossard') || res.name.length < 3 ? (
                        res.name
                      ) : (
                        <Link 
                          href={`/coureur?id=${canonicalSlug(res.name)}`} 
                          className={styles.runnerLink}
                          title={`Voir la fiche coureur de ${res.name}`}
                        >
                          {res.name}
                        </Link>
                      )}
                    </td>
                    <td>{res.rank_sex}</td>
                    <td>{res.rank_cat}</td>
                    <td className={styles.time}>{res.time}</td>
                    <td>{res.speed}</td>
                    <td className={styles.club}>{res.club || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
