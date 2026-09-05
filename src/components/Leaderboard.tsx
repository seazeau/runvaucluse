'use client';

import { useState } from 'react';
import styles from './Leaderboard.module.css';
import leaderboardData from '../data/leaderboard.json';
import { Trophy, Medal, Users } from 'lucide-react';

type TabType = 'TOUS' | 'CADET' | 'JUNIOR' | 'ESPOIR' | 'SÉNIOR' | 'VÉTÉRAN';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabType>('SÉNIOR');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'CADET', label: 'CADETS' },
    { id: 'JUNIOR', label: 'JUNIORS' },
    { id: 'ESPOIR', label: 'ESPOIRS' },
    { id: 'SÉNIOR', label: 'SÉNIORS' },
    { id: 'VÉTÉRAN', label: 'VÉTÉRANS' },
    { id: 'TOUS', label: 'TOUS' },
  ];

  const filteredData = leaderboardData.filter(cat => {
    if (activeTab === 'TOUS') return true;
    return cat.category.toUpperCase().includes(activeTab);
  });

  return (
    <div className={styles.leaderboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Trophy className={styles.icon} size={32} />
          <h2 className={styles.title}>TOP 5 PAR CATÉGORIE</h2>
        </div>
        
        <div className={styles.tabsWrapper}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {filteredData.map((cat, idx) => {
          const maxPoints = Math.max(...cat.rankings.map(p => p.points));
          
          return (
            <div key={idx} className={styles.categoryCard}>
              <div className={styles.scanline}></div>
              <h3 className={styles.categoryTitle}>
                <Users size={18} />
                {cat.category}
              </h3>
              <div className={styles.rankingsList}>
                {cat.rankings.map((player, pIdx) => (
                  <div key={pIdx} className={styles.playerRowWrapper}>
                    <div className={styles.playerRow}>
                      <div className={styles.rankInfo}>
                        <span className={`${styles.rankNumber} ${pIdx < 3 ? styles[`rank${pIdx + 1}`] : ''}`}>
                          {pIdx === 0 && <Medal size={14} className={styles.medalIcon} />}
                          {pIdx + 1}
                        </span>
                        <span className={styles.playerName}>{player.name}</span>
                      </div>
                      <span className={styles.points}>{player.points} <small>pts</small></span>
                    </div>
                    {/* Power Bar Container */}
                    <div className={styles.powerBarContainer}>
                      <div 
                        className={styles.powerBar} 
                        style={{ width: `${(player.points / maxPoints) * 100}%` }}
                      >
                        <div className={styles.powerBarGlow}></div>
                        <div className={styles.powerBarInnerGlow}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

