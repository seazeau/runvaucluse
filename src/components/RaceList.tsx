'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { Race } from '@/lib/types';
import RaceCard from './RaceCard';
import FilterBar from './FilterBar';
import styles from './RaceList.module.css';
import { AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

interface RaceListProps {
  initialRaces: Race[];
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function RaceList({ initialRaces }: RaceListProps) {
  const [selectedYear, setSelectedYear] = useState<'all' | '2026' | '2027'>('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');

  useEffect(() => {
    const handleFilterFormat = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedType(customEvent.detail);
      }
    };
    window.addEventListener('filter-format', handleFilterFormat);
    return () => window.removeEventListener('filter-format', handleFilterFormat);
  }, []);

  // Strict filter: only upcoming races (race.date >= today), strictly sorted chronologically
  const upcomingRaces = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return initialRaces
      .filter(race => race.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [initialRaces]);

  const count2026 = useMemo(() => {
    return upcomingRaces.filter(r => r.date.startsWith('2026')).length;
  }, [upcomingRaces]);

  const count2027 = useMemo(() => {
    return upcomingRaces.filter(r => r.date.startsWith('2027')).length;
  }, [upcomingRaces]);

  // Available months from upcoming races (optionally filtered by selectedYear)
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>();
    
    upcomingRaces.forEach(race => {
      if (selectedYear !== 'all' && !race.date.startsWith(selectedYear)) {
        return;
      }
      const [y, m] = race.date.split('-');
      if (y && m) {
        const key = `${y}-${m}`;
        if (!monthMap.has(key)) {
          const mIdx = parseInt(m, 10) - 1;
          monthMap.set(key, `${MONTH_NAMES[mIdx]} ${y}`);
        }
      }
    });

    return Array.from(monthMap.entries()).map(([value, label]) => ({ value, label }));
  }, [upcomingRaces, selectedYear]);

  const filteredRaces = useMemo(() => {
    return upcomingRaces.filter(race => {
      // 0. Filter by Year
      if (selectedYear !== 'all' && !race.date.startsWith(selectedYear)) {
        return false;
      }

      // 1. Filter by Month
      if (selectedMonth !== 'all') {
        if (selectedMonth.includes('-')) {
          if (!race.date.startsWith(selectedMonth)) return false;
        } else {
          const raceMonth = race.date.split('-')[1];
          if (raceMonth !== selectedMonth) return false;
        }
      }

      // 2. Filter by Type
      const typeMatch = selectedType === 'all' || race.type === selectedType;
      if (!typeMatch) return false;

      // 3. Filter by Distance
      if (selectedDistance !== 'all') {
        const distanceStr = race.distances || "";
        const numbers = distanceStr.match(/(\d+[,.]?\d*)\s*(?:km|KM)/g);
        
        if (!numbers) {
          return false;
        }

        const maxDistance = Math.max(...numbers.map(n => parseFloat(n.replace(',', '.'))));

        if (selectedDistance === 'sprint' && maxDistance >= 10) return false;
        if (selectedDistance === 'short' && (maxDistance < 10 || maxDistance > 20)) return false;
        if (selectedDistance === 'long' && (maxDistance <= 20 || maxDistance > 42.2)) return false;
        if (selectedDistance === 'ultra' && maxDistance <= 42.2) return false;
      }
      
      return true;
    });
  }, [upcomingRaces, selectedYear, selectedMonth, selectedType, selectedDistance]);

  // First 2027 race index for rendering divider
  const first2027Index = useMemo(() => {
    if (selectedYear !== 'all' || selectedMonth !== 'all') return -1;
    return filteredRaces.findIndex(r => r.date.startsWith('2027'));
  }, [filteredRaces, selectedYear, selectedMonth]);

  return (
    <div className={styles.raceListWrapper}>
      <div className={styles.stickyFilters}>
        <FilterBar 
          onMonthChange={setSelectedMonth} 
          onTypeChange={setSelectedType}
          onDistanceChange={setSelectedDistance}
          selectedMonth={selectedMonth}
          selectedType={selectedType}
          selectedDistance={selectedDistance}
          availableMonths={availableMonths}
        />
      </div>

      <div className={styles.statsRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.count}>
            <span className={styles.countBadge}>{filteredRaces.length}</span>
            <span>{filteredRaces.length > 1 ? 'ÉPREUVES' : 'ÉPREUVE'}</span>
          </div>

          <div className={styles.yearSwitcher}>
            <button 
              type="button"
              className={`${styles.yearBtn} ${selectedYear === 'all' ? styles.yearBtnActive : ''}`}
              onClick={() => { setSelectedYear('all'); setSelectedMonth('all'); }}
            >
              Toutes <span className={styles.yearBadge}>{upcomingRaces.length}</span>
            </button>
            <button 
              type="button"
              className={`${styles.yearBtn} ${selectedYear === '2026' ? styles.yearBtnActive : ''}`}
              onClick={() => { setSelectedYear('2026'); setSelectedMonth('all'); }}
            >
              2026 <span className={styles.yearBadge}>{count2026}</span>
            </button>
            <button 
              type="button"
              className={`${styles.yearBtn} ${selectedYear === '2027' ? styles.yearBtnActive : ''}`}
              onClick={() => { setSelectedYear('2027'); setSelectedMonth('all'); }}
            >
              2027 <span className={styles.yearBadge}>{count2027}</span>
            </button>
          </div>
        </div>

        <Link href="/resultats" className={styles.archiveLink}>
          <Trophy size={14} className={styles.archiveIcon} />
          <span>Consulter les résultats passés</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filteredRaces.length > 0 ? (
            filteredRaces.map((race, index) => {
              const isFirst2027 = index === first2027Index;
              return (
                <Fragment key={race.id}>
                  {isFirst2027 && (
                    <div className={styles.yearDivider}>
                      <div className={styles.yearDividerLine} />
                      <div className={styles.yearDividerBadge}>
                        <Sparkles size={14} className={styles.yearDividerSparkle} />
                        <span>CALENDRIER 2027 — NOUVELLES DATES OFFICIELLES</span>
                      </div>
                      <div className={styles.yearDividerLine} />
                    </div>
                  )}
                  <RaceCard race={race} index={index} />
                </Fragment>
              );
            })
          ) : (
            <div className={styles.noResults}>
              Aucune épreuve trouvée pour ces critères de recherche.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
