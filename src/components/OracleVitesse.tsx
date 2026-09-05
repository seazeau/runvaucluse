'use client';

import { useState, useEffect } from 'react';
import styles from './OracleVitesse.module.css';
import { Zap, Timer, MoveRight, Calculator, Activity } from 'lucide-react';

interface OracleVitesseProps {
  defaultDistance?: string;
}

export default function OracleVitesse({ defaultDistance = "10" }: OracleVitesseProps) {
  // Extract number from string like "10km" or "Trail 15km"
  const parseDistance = (d: string) => {
    const match = d.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 10;
  };

  const [distance, setDistance] = useState<number>(parseDistance(defaultDistance));
  const [time, setTime] = useState({ h: 0, m: 45, s: 0 });

  const totalSeconds = time.h * 3600 + time.m * 60 + time.s;
  let pace = "0:00";
  let speed = "0.00";
  
  if (totalSeconds > 0 && distance > 0) {
    const secondsPerKm = totalSeconds / distance;
    const paceMin = Math.floor(secondsPerKm / 60);
    const paceSec = Math.round(secondsPerKm % 60);
    
    pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
    speed = (3600 / secondsPerKm).toFixed(2);
  }

  return (
    <div className={styles.oracleContainer}>
      <div className={styles.header}>
        <Zap size={18} className={styles.zapIcon} />
        <h3 className={styles.title}>ORACLE VITESSE</h3>
        <span className={styles.version}>v1.0</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.inputGroup}>
          <label>DISTANCE (KM)</label>
          <div className={styles.inputWrapper}>
            <input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
            <div className={styles.inputGlow}></div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>TEMPS CIBLE (H:M:S)</label>
          <div className={styles.timeInputs}>
            <input 
              type="number" 
              value={time.h} 
              placeholder="H"
              onChange={(e) => setTime({...time, h: parseInt(e.target.value) || 0})}
            />
            <span>:</span>
            <input 
              type="number" 
              value={time.m} 
              placeholder="M"
              onChange={(e) => setTime({...time, m: parseInt(e.target.value) || 0})}
            />
            <span>:</span>
            <input 
              type="number" 
              value={time.s} 
              placeholder="S"
              onChange={(e) => setTime({...time, s: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <Timer size={16} />
          <div className={styles.resultValue}>{pace} <small>min/km</small></div>
          <div className={styles.resultLabel}>ALLURE MOYENNE</div>
        </div>
        
        <div className={styles.resultDivider}>
          <MoveRight size={20} />
        </div>

        <div className={styles.resultCard}>
          <Activity size={16} />
          <div className={styles.resultValue}>{speed} <small>km/h</small></div>
          <div className={styles.resultLabel}>VITESSE MOYENNE</div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <Calculator size={12} /> CALCULATEUR DE PERFORMANCE PRÉDICTIF
      </div>
    </div>
  );
}
