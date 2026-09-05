'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './FilterBar.module.css';
import { ChevronDown, Calendar, Zap, Activity, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  onMonthChange: (month: string) => void;
  onTypeChange: (type: string) => void;
  onDistanceChange: (distance: string) => void;
  selectedMonth: string;
  selectedType: string;
  selectedDistance: string;
  availableMonths?: string[];
}

const MONTHS: FilterOption[] = [
  { value: 'all', label: 'Toutes les dates' },
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

const FORMATS: FilterOption[] = [
  { value: 'all', label: 'Tous les formats' },
  { value: 'Trail', label: 'Trail' },
  { value: 'Course nature', label: 'Course nature' },
  { value: 'Course sur route FFA', label: 'Course sur route FFA' },
];

const DISTANCES: FilterOption[] = [
  { value: 'all', label: 'Toutes distances' },
  { value: 'sprint', label: 'Sprint (< 10km)' },
  { value: 'short', label: 'Court (10-20km)' },
  { value: 'long', label: 'Long (21-42km)' },
  { value: 'ultra', label: 'Ultra (> 42km)' },
];

function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  icon: Icon 
}: { 
  label: string; 
  options: FilterOption[]; 
  value: string; 
  onChange: (val: string) => void;
  icon: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={styles.filterGroup} ref={containerRef}>
      <span className={styles.label}>{label}</span>
      <div 
        className={`${styles.selectTrigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.triggerLeft}>
          <Icon size={16} className={styles.icon} />
          <span className={styles.currentValue}>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.dropdown}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((opt) => (
              <div 
                key={opt.value}
                className={`${styles.option} ${value === opt.value ? styles.optionActive : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={14} className={styles.checkIcon} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterBar({ 
  onMonthChange, 
  onTypeChange, 
  onDistanceChange,
  selectedMonth, 
  selectedType,
  selectedDistance,
  availableMonths
}: FilterBarProps) {
  const displayedMonths = React.useMemo(() => {
    if (!availableMonths || availableMonths.length === 0) {
      return MONTHS;
    }
    return [
      { value: 'all', label: 'Toutes les dates' },
      ...MONTHS.filter(m => m.value !== 'all' && availableMonths.includes(m.value))
    ];
  }, [availableMonths]);

  return (
    <div className={styles.filterBar}>
      <CustomSelect 
        label="MOIS" 
        options={displayedMonths} 
        value={selectedMonth} 
        onChange={onMonthChange}
        icon={Calendar}
      />
      <CustomSelect 
        label="FORMAT" 
        options={FORMATS} 
        value={selectedType} 
        onChange={onTypeChange}
        icon={Zap}
      />
      <CustomSelect 
        label="DISTANCE" 
        options={DISTANCES} 
        value={selectedDistance} 
        onChange={onDistanceChange}
        icon={Activity}
      />
    </div>
  );
}
