import React from 'react';
import Link from 'next/link';
import { Trophy, Zap, Crown, Flame } from 'lucide-react';
import styles from './LocalLegends.module.css';

interface Runner {
  name: string;
  slug: string;
  count: number;
}

interface LocalLegendsProps {
  topRacers: Runner[];
  topWinners: Runner[];
}

const LocalLegends: React.FC<LocalLegendsProps> = ({ topRacers, topWinners }) => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Crown className={styles.mainIcon} size={24} />
          <h2 className={styles.title}>LOCAL LEGENDS</h2>
        </div>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.grid}>
        {/* COL 1: ASSIDUITE */}
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <Zap className={styles.colIcon} size={16} />
            <h3 className={styles.colTitle}>LES PLUS ASSIDUS</h3>
            <span className={styles.colSubtitle}>COURSES TERMINÉES</span>
          </div>
          <div className={styles.list}>
            {topRacers.map((runner, index) => (
              <div key={runner.slug} className={styles.item}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.name}>{runner.name}</span>
                <span className={styles.value}>
                  {runner.count} <Flame size={12} className={styles.flame} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COL 2: VICTOIRES */}
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <Trophy className={styles.colIcon} size={16} />
            <h3 className={styles.colTitle}>LES CHAMPIONS</h3>
            <span className={styles.colSubtitle}>VICTOIRES SCRATCH</span>
          </div>
          <div className={styles.list}>
            {topWinners.map((runner, index) => (
              <div key={runner.slug} className={styles.item}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.name}>{runner.name}</span>
                <span className={styles.value}>
                  {runner.count} <Crown size={12} className={styles.crown} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalLegends;
