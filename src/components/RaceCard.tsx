'use client';

import { Race } from '@/lib/types';
import styles from './RaceCard.module.css';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RaceCardProps {
  race: Race;
  index: number;
}

export default function RaceCard({ race, index }: RaceCardProps) {
  const [year, month, day] = race.date.split('-');
  const monthNames = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
  const dayNum = parseInt(day, 10);
  const monthStr = monthNames[parseInt(month, 10) - 1] || month;

  return (
    <motion.div 
      id={`race-${race.id}`}
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Visual Header - The Poster */}
      <Link href={`/race/${race.slug}`} className={styles.imageSection}>
        {race.image_url ? (
          <>
            <div 
              className={styles.blurBackdrop}
              style={{ backgroundImage: `url(${race.image_url})` }}
              aria-hidden="true"
            />
            <img 
              src={race.image_url} 
              alt={`Affiche de la course ${race.name} - ${race.city} Vaucluse`} 
              className={styles.image} 
            />
          </>
        ) : (
          <div className={styles.placeholder}></div>
        )}
        
        {/* Overlays on image for better space usage */}
        <div className={styles.dateBadge}>
          <span className={styles.day}>{dayNum}</span>
          <span className={styles.month}>{monthStr}</span>
        </div>
        <div className={styles.typeOverlay}>{race.type}</div>
      </Link>

      <div className={styles.content}>
        <div className={styles.mainInfo}>
          {race.label && <span className={styles.labelTag}>{race.label}</span>}
          <Link href={`/race/${race.slug}`}>
            <h3 className={styles.name}>{race.name}</h3>
          </Link>
          <div className={styles.city}>
            <MapPin size={12} /> {race.city}
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.distances}>
            {race.distances.split(',').slice(0, 3).map((d, i) => (
              <span key={i} className={styles.distTag}>{d.trim()}</span>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Link href={`/race/${race.slug}`} className={styles.link}>
            CONSULTER LA FICHE <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
