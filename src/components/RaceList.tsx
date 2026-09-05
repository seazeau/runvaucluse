'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Race } from '@/lib/types';
import RaceCard from './RaceCard';
import FilterBar from './FilterBar';
import styles from './RaceList.module.css';
import { AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight } from 'lucide-react';

interface RaceListProps {
  initialRaces: Race[];
}

export default function RaceList({ initialRaces }: RaceListProps) {
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

  // Strict filter: only upcoming races (race.date >= today)
  const upcomingRaces = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return initialRaces.filter(race => race.date >= todayStr);
  }, [initialRaces]);

  // Available months from upcoming races
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    upcomingRaces.forEach(race => {
      const m = race.date.split('-')[1];
      if (m) months.add(m);
    });
    return Array.from(months).sort();
  }, [upcomingRaces]);

  const filteredRaces = useMemo(() => {
    return upcomingRaces.filter(race => {
      // 1. Filter by Month
      const raceMonth = race.date.split('-')[1];
      const monthMatch = selectedMonth === 'all' || raceMonth === selectedMonth;
      if (!monthMatch) return false;

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
  }, [upcomingRaces, selectedMonth, selectedType, selectedDistance]);

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
        <div className={styles.count}>
          <span className={styles.countBadge}>{filteredRaces.length}</span>
          <span>{filteredRaces.length > 1 ? 'ÉPREUVES À VENIR' : 'ÉPREUVE À VENIR'}</span>
        </div>
        <Link href="/resultats" className={styles.archiveLink}>
          <Trophy size={14} className={styles.archiveIcon} />
          <span>Consulter les résultats des courses passées</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filteredRaces.length > 0 ? (
            filteredRaces.map((race, index) => (
              <RaceCard key={race.id} race={race} index={index} />
            ))
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
