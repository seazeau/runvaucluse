'use client';

import { Race } from '@/lib/types';
import styles from './FeaturedRace.module.css';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedRaceProps {
  race: Race;
}

export default function FeaturedRace({ race }: FeaturedRaceProps) {
  const raceDate = new Date(race.date);
  const day = raceDate.getDate().toString().padStart(2, '0');
  const month = raceDate.toLocaleDateString('fr-FR', { month: 'long' });

  return (
    <div className={styles.featuredCard}>
      <div className={styles.imageWrapper}>
        {race.image_url && (
          <img src={race.image_url} alt={race.name} className={styles.image} />
        )}
        <div className={styles.overlay}></div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.badge}>SÉLECTION ÉLITE</div>
          <div className={styles.type}>{race.type}</div>
          <motion.h3 
            className={styles.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {race.name}
          </motion.h3>
        </div>

        <div className={styles.right}>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>DATE</span>
              <span className={styles.metaValue}>{day} {month}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>LIEU</span>
              <span className={styles.metaValue}>{race.city}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>DISTANCE</span>
              <span className={styles.metaValue}>{race.distances.split(',')[0]}</span>
            </div>
          </div>

          <a href={race.link} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
            <ArrowUpRight size={40} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
