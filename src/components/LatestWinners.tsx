import React from 'react';
import Link from 'next/link';
import { Trophy, Calendar, MapPin, Zap } from 'lucide-react';
import styles from './LatestWinners.module.css';

interface Winner {
  name: string;
  event_name: string;
  time: string;
  club: string;
  rank_sex: string;
  rank_overall: number;
}

interface RaceWithWinners {
  slug: string;
  name: string;
  date: string;
  city: string;
  winners: Winner[];
}

interface LatestWinnersProps {
  races: RaceWithWinners[];
}

const LatestWinners: React.FC<LatestWinnersProps> = ({ races }) => {
  if (races.length === 0) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <Zap className={styles.flashIcon} size={20} />
          <h2 className={styles.title}>PODIUMS DU WEEKEND</h2>
        </div>
        <div className={styles.line}></div>
      </div>

      <div className={styles.grid}>
        {races.map((race) => {
          // Group winners by event
          const eventGroups: { [key: string]: { male?: Winner, female?: Winner, distanceNum: number } } = {};
          
          race.winners.forEach(w => {
            if (!eventGroups[w.event_name]) {
              const distMatch = w.event_name.match(/(\d+)/);
              const distNum = distMatch ? parseInt(distMatch[1]) : 0;
              eventGroups[w.event_name] = { distanceNum: distNum };
            }
            
            const isExplicitFemale = w.rank_sex.includes('(F)') || w.rank_sex.includes('F') || w.rank_sex.includes('Femme');
            const isExplicitMale = w.rank_sex.includes('(M)') || w.rank_sex.includes('M') || w.rank_sex.includes('Masculin');

            if (isExplicitFemale && !eventGroups[w.event_name].female) {
              eventGroups[w.event_name].female = w;
            } else if (isExplicitMale && !eventGroups[w.event_name].male) {
              eventGroups[w.event_name].male = w;
            } else if (!isExplicitFemale && !isExplicitMale) {
              // Heuristic for unlabeled data (like Cavaillon)
              // The first person at rank_overall 1 is usually Male (statistically)
              // The NEXT person who has a rank_sex of 1 is the Female winner
              if (w.rank_overall === 1 && !eventGroups[w.event_name].male) {
                eventGroups[w.event_name].male = w;
              } else if (w.rank_overall > 1 && !eventGroups[w.event_name].female) {
                // If we already have a male winner at rank 1, and this person also has sex rank 1
                eventGroups[w.event_name].female = w;
              }
            }
          });

          // Sort events by distance (longest first)
          const sortedEvents = Object.keys(eventGroups).sort((a, b) => eventGroups[b].distanceNum - eventGroups[a].distanceNum);

          return (
            <div key={race.slug} className={styles.raceCard}>
              <div className={styles.raceInfo}>
                <h3 className={styles.raceName}>{race.name}</h3>
                <div className={styles.meta}>
                  <span><Calendar size={12} /> {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  <span><MapPin size={12} /> {race.city}</span>
                </div>
              </div>

              <div className={styles.eventsList}>
                {sortedEvents.map(eventName => {
                  const winners = eventGroups[eventName];
                  return (
                    <div key={eventName} className={styles.eventLine}>
                      <span className={styles.distanceBadge}>{eventName}</span>
                      
                      <div className={styles.winnersDuo}>
                        {winners.male && (
                          <div className={styles.winnerMini}>
                            <Trophy size={10} className={styles.maleIcon} />
                            <span className={styles.miniName}>{winners.male.name}</span>
                          </div>
                        )}
                        
                        {winners.male && winners.female && <div className={styles.separator}></div>}

                        {winners.female && (
                          <div className={styles.winnerMini}>
                            <Trophy size={10} className={styles.femaleIcon} />
                            <span className={styles.miniName}>{winners.female.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Link href={`/resultats/${race.slug}/`} className={styles.link}>
                DÉTAILS COMPLETS
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LatestWinners;
