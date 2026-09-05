'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Trophy, ChevronDown, ChevronUp, Activity, Zap, Timer, MapPin, Calendar, ShieldCheck, Award, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './records.module.css';

// Road records data
import recordsData from '@/data/vaucluse-records.json';
import bilans2026Data from '@/data/vaucluse-bilans-2026.json';

// Types
interface Result {
  rn: string;
  en: string;
  ro: number;
  t: string;
  d: string;
}

interface Runner {
  n: string;
  s: string;
  r: Result[];
  count: number;
  wins: number;
}

interface RoadRecord {
  id: string;
  distance: string;
  distanceShort: string;
  gender: 'M' | 'F';
  genderLabel: string;
  time: string;
  athlete: string;
  club: string;
  clubCity: string;
  date: string;
  year: string;
  location: string;
  event: string;
  pace: string;
  speed: string;
  homologation: string;
}

interface BilanAthlete {
  rank: number;
  rawRank: number;
  time: string;
  isPersonalRecord: boolean;
  athlete: string;
  club: string;
  date: string;
  fullDate: string;
  location: string;
  pace: string;
  speed: string;
}

interface BilanCategory {
  id: string;
  distance: string;
  distanceShort: string;
  gender: 'M' | 'F';
  genderLabel: string;
  season: number;
  totalEntries: number;
  top5: BilanAthlete[];
}

const RecordsContent = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'regularite' ? 'regularite' : 'chrono';
  const query = searchParams.get('search');

  const [activeTab, setActiveTab] = useState<'chrono' | 'regularite'>(initialTab);
  const [chronoPeriod, setChronoPeriod] = useState<'all_time' | 'season_2026'>('season_2026');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');

  // Regularite state (Wall of Fame engine)
  const [runnersData, setRunnersData] = useState<Runner[]>([]);
  const [loadingRunners, setLoadingRunners] = useState(true);
  const [search, setSearch] = useState(query?.toUpperCase() || '');
  const [expandedRunner, setExpandedRunner] = useState<string | null>(null);
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    fetch('/data/wall-of-fame.json')
      .then(res => res.json())
      .then(data => {
        setRunnersData(data);
        setLoadingRunners(false);

        if (query) {
          setActiveTab('regularite');
          const found = (data as Runner[]).find(r => 
            r.n.toLowerCase().includes(query.toLowerCase())
          );
          if (found) setExpandedRunner(found.s);
        }
      })
      .catch(err => {
        console.error('Failed to load archives:', err);
        setLoadingRunners(false);
      });
  }, [query]);

  // Filtered road records
  const filteredRecords = useMemo(() => {
    if (genderFilter === 'all') return recordsData as RoadRecord[];
    return (recordsData as RoadRecord[]).filter(r => r.gender === genderFilter);
  }, [genderFilter]);

  // Filtered 2026 season bilans
  const filteredBilans = useMemo(() => {
    if (genderFilter === 'all') return bilans2026Data as BilanCategory[];
    return (bilans2026Data as BilanCategory[]).filter(b => b.gender === genderFilter);
  }, [genderFilter]);

  // Filtered runners for regularite
  const filteredRunners = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return runnersData.slice(0, limit);
    return runnersData
      .filter(r => r.n.toLowerCase().includes(s))
      .slice(0, limit);
  }, [search, limit, runnersData]);

  const getGrade = (count: number) => {
    if (count > 8) return { label: 'LÉGENDE', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' };
    if (count >= 7) return { label: 'PILIER DU PELOTON', color: '#1E40AF', bg: '#DBEAFE', border: '#BFDBFE' };
    if (count >= 4) return { label: 'L\'INITIÉ', color: '#166534', bg: '#DCFCE7', border: '#BBF7D0' };
    return { label: 'LA RECRUE', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.scanlines} />

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <Award size={14} color="#c05621" />
            <span>PALMARÈS & RECORDS DU 84</span>
          </div>

          <h1 className={styles.title}>
            RECORDS DU <span className={styles.titleAccent}>VAUCLUSE</span>
          </h1>
          
          <p className={styles.subtitle}>
            Les chronos de référence homologués FFA sur 5 km, 10 km, Semi et Marathon, ainsi que le classement de régularité (nombre de participations aux courses dans le Vaucluse dans l&apos;année).
          </p>
        </header>

        {/* TABS SELECTOR */}
        <div className={styles.tabsNav}>
          <button 
            onClick={() => setActiveTab('chrono')}
            className={`${styles.tabBtn} ${activeTab === 'chrono' ? styles.tabBtnActive : ''}`}
          >
            <Timer size={17} />
            <span>Records Chrono</span>
            <span className={styles.tabCountBadge}>8</span>
          </button>

          <button 
            onClick={() => setActiveTab('regularite')}
            className={`${styles.tabBtn} ${activeTab === 'regularite' ? styles.tabBtnActive : ''}`}
          >
            <Trophy size={17} />
            <span className={styles.tabLabelFull}>Classement Régularité</span>
            <span className={styles.tabLabelMobile}>Régularité</span>
            <span className={styles.tabCountBadge}>
              {loadingRunners ? '...' : (
                <>
                  <span className={styles.tabCountFull}>{runnersData.length.toLocaleString()} coureurs</span>
                  <span className={styles.tabCountMobile}>{runnersData.length.toLocaleString()}</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* TAB 1: RECORDS CHRONO */}
        {activeTab === 'chrono' && (
          <div className={styles.chronoSection}>
            {/* PERIOD SWITCHER */}
            <div className={styles.periodSwitcher}>
              <button 
                onClick={() => setChronoPeriod('all_time')}
                className={`${styles.periodBtn} ${chronoPeriod === 'all_time' ? styles.periodBtnActive : ''}`}
              >
                <Trophy size={15} />
                <span className={styles.periodLabelFull}>Records Absolus (Tous les temps)</span>
                <span className={styles.periodLabelMobile}>Records Absolus</span>
              </button>
              <button 
                onClick={() => setChronoPeriod('season_2026')}
                className={`${styles.periodBtn} ${chronoPeriod === 'season_2026' ? styles.periodBtnActive : ''}`}
              >
                <Zap size={15} />
                <span className={styles.periodLabelFull}>Saison 2026 (Top 5 FFA)</span>
                <span className={styles.periodLabelMobile}>Saison 2026</span>
                <span className={styles.seasonBadgeLive}>En cours</span>
              </button>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.genderFilters}>
                <button 
                  onClick={() => setGenderFilter('all')}
                  className={`${styles.genderBtn} ${genderFilter === 'all' ? styles.genderBtnActive : ''}`}
                >
                  {chronoPeriod === 'all_time' ? `Tous les records (${recordsData.length})` : `Tous les Top 5 (${bilans2026Data.length})`}
                </button>
                <button 
                  onClick={() => setGenderFilter('M')}
                  className={`${styles.genderBtn} ${genderFilter === 'M' ? styles.genderBtnActive : ''}`}
                >
                  Hommes (4)
                </button>
                <button 
                  onClick={() => setGenderFilter('F')}
                  className={`${styles.genderBtn} ${genderFilter === 'F' ? styles.genderBtnActive : ''}`}
                >
                  Femmes (4)
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', fontWeight: 600 }}>
                {chronoPeriod === 'all_time' 
                  ? "Base officielle Comité 84 Athlétisme & Fédération Française d'Athlétisme"
                  : "Bilans officiels FFA 2026 • Département 084 (Vaucluse)"}
              </div>
            </div>

            {chronoPeriod === 'all_time' ? (
              /* VIEW 1: RECORDS ABSOLUS HISTORIQUES */
              <div className={styles.recordsGrid}>
                {filteredRecords.map((record) => (
                  <div key={record.id} className={styles.recordCard}>
                    <div>
                      <div className={styles.cardHeader}>
                        <span className={styles.distBadge}>
                          <Zap size={13} color="#c05621" />
                          {record.distance}
                        </span>
                        <span className={`${styles.genderTag} ${record.gender === 'M' ? styles.genderTagM : styles.genderTagF}`}>
                          {record.genderLabel}
                        </span>
                      </div>

                      <div className={styles.timeDisplay}>
                        {record.time}
                      </div>

                      <div className={styles.athleteRow}>
                        <span className={styles.athleteName}>{record.athlete}</span>
                      </div>

                      <div className={styles.clubBadge}>
                        <ShieldCheck size={15} color="#2b6cb0" />
                        <span>{record.club} ({record.clubCity})</span>
                      </div>

                      <div className={styles.metricsGrid}>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>Allure moyenne</span>
                          <span className={styles.metricValue}>{record.pace}</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>Vitesse moyenne</span>
                          <span className={styles.metricValue}>{record.speed}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.venueFooter}>
                      <div className={styles.eventLocation}>
                        <MapPin size={13} />
                        <span>{record.location} • {record.date}</span>
                      </div>
                      <span className={styles.homologationTag}>
                        {record.homologation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* VIEW 2: BILANS SAISON 2026 (TOP 5 FFA) */
              <div className={styles.recordsGrid}>
                {filteredBilans.map((bilan) => {
                  const leader = bilan.top5[0];
                  const runners = bilan.top5.slice(1);

                  return (
                    <div key={bilan.id} className={styles.bilanCard}>
                      <div>
                        <div className={styles.cardHeader}>
                          <span className={styles.distBadge}>
                            <Zap size={13} color="#c05621" />
                            {bilan.distance}
                          </span>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gray-muted)' }}>
                              {bilan.totalEntries} classés
                            </span>
                            <span className={`${styles.genderTag} ${bilan.gender === 'M' ? styles.genderTagM : styles.genderTagF}`}>
                              {bilan.genderLabel}
                            </span>
                          </div>
                        </div>

                        {/* HERO #1 LEADER */}
                        {leader && (
                          <div className={styles.bilanHero}>
                            <div className={styles.bilanLeaderTag}>
                              <Trophy size={13} color="#b45309" />
                              <span>#1 Meilleure perf 2026</span>
                            </div>

                            <div className={styles.bilanTimeHero}>
                              {leader.time}
                            </div>

                            <div className={styles.athleteRow} style={{ marginBottom: '0.35rem' }}>
                              <span className={styles.athleteName} style={{ fontSize: '1.2rem' }}>{leader.athlete}</span>
                            </div>

                            <div className={styles.clubBadge} style={{ marginBottom: '0.75rem' }}>
                              <ShieldCheck size={14} color="#2b6cb0" />
                              <span>{leader.club}</span>
                            </div>

                            <div className={styles.metricsGrid} style={{ marginBottom: '0.6rem' }}>
                              <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Allure</span>
                                <span className={styles.metricValue}>{leader.pace}</span>
                              </div>
                              <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Vitesse</span>
                                <span className={styles.metricValue}>{leader.speed}</span>
                              </div>
                            </div>

                            <div className={styles.venueFooter} style={{ paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                              <div className={styles.eventLocation}>
                                <MapPin size={12} />
                                <span>{leader.fullDate} à {leader.location}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* LEADERBOARD TOP 2 TO 5 */}
                      {runners.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-muted)', marginBottom: '0.5rem' }}>
                            Suite du Top 5 de la saison
                          </div>
                          <div className={styles.top5List}>
                            {runners.map((ath) => (
                              <div key={ath.rank} className={styles.top5Item}>
                                <div className={`${styles.top5Rank} ${ath.rank === 2 ? styles.top5Rank2 : ath.rank === 3 ? styles.top5Rank3 : styles.top5RankDefault}`}>
                                  #{ath.rank}
                                </div>
                                <div className={styles.top5Info}>
                                  <div className={styles.top5Athlete}>{ath.athlete}</div>
                                  <div className={styles.top5Club}>{ath.club}</div>
                                  <div className={styles.top5Meta}>{ath.fullDate} à {ath.location}</div>
                                </div>
                                <div className={styles.top5Perf}>
                                  <div className={styles.top5Time}>{ath.time}</div>
                                  <div className={styles.top5Pace}>{ath.pace}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* HOMOLOGATION & FOOTER CALLOUT */}
            {chronoPeriod === 'season_2026' ? (
              <div className={styles.infoCard}>
                <div className={styles.infoCardText}>
                  <h3>BILANS OFFICIELS FFA — SAISON 2026</h3>
                  <p>
                    Ces classements regroupent les meilleures performances enregistrées sur parcours homologués FFA pour les coureurs licenciés ou rattachés aux clubs du Vaucluse (084) au cours de la saison 2026.
                  </p>
                </div>
                <a 
                  href="https://www.athle.fr/contenu/tous-les-bilans/5268" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.infoCardBtn}
                >
                  Voir tous les bilans sur athle.fr
                  <ArrowUpRight size={16} />
                </a>
              </div>
            ) : (
              <div className={styles.infoCard}>
                <div className={styles.infoCardText}>
                  <h3>VOUS AVEZ BATTU UN RECORD DU VAUCLUSE ?</h3>
                  <p>
                    Les records répertoriés sont homologués par la Fédération Française d&apos;Athlétisme (FFA) et le Comité 84 sur des parcours certifiés officiellement. Si vous détenez une performance officielle récente non listée, signalez-la nous avec votre fiche FFA.
                  </p>
                </div>
                <a href="/#contact" className={styles.infoCardBtn}>
                  Transmettre un justificatif
                  <ArrowUpRight size={16} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASSEMENT REGULARITE (WALL OF FAME ENGINE) */}
        {activeTab === 'regularite' && (
          <div>
            <div className={styles.regulariteIntro}>
              <div className={styles.regulariteIntroText}>
                <h2 className={styles.regulariteSectionTitle}>
                  <Trophy size={20} color="#c05621" />
                  CLASSEMENT DE RÉGULARITÉ 2026
                </h2>
                <p className={styles.regulariteSectionSubtitle}>
                  La régularité comptabilise le <strong>nombre de participations aux courses dans le Vaucluse dans l&apos;année</strong>.
                </p>
              </div>
              <div className={styles.regulariteStatsBadge}>
                {loadingRunners ? 'Chargement...' : `${runnersData.length.toLocaleString()} coureurs`}
              </div>
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={24} color="#c05621" style={{ marginLeft: '0.5rem' }} />
                <input
                  type="text"
                  placeholder="RECHERCHER UN COUREUR PAR NOM OU PRÉNOM..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setLimit(30); }}
                />
              </div>
            </div>

            {loadingRunners ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>SYNCHRONISATION DES PROFILS...</p>
              </div>
            ) : (
              <>
                <div className={styles.list}>
                  <AnimatePresence mode="popLayout">
                    {filteredRunners.map((runner, index) => {
                      const grade = getGrade(runner.count);
                      const isExpanded = expandedRunner === runner.s;

                      return (
                        <div
                          key={runner.s}
                          className={`${styles.runnerCard} ${isExpanded ? styles.activeCard : ''}`}
                          onClick={() => setExpandedRunner(isExpanded ? null : runner.s)}
                        >
                          <div className={styles.cardMain}>
                            <div className={styles.runnerInfo}>
                              <div className={styles.iconBox}>
                                {runner.wins > 0 ? (
                                  <Trophy size={22} color="#d97706" />
                                ) : (
                                  <Zap size={22} color={isExpanded ? 'var(--dark-ink)' : 'var(--gray-muted)'} />
                                )}
                              </div>
                              <div>
                                <h2 className={styles.runnerName}>{runner.n}</h2>
                                <span 
                                  className={styles.gradeBadge} 
                                  style={{ 
                                    color: grade.color, 
                                    backgroundColor: grade.bg, 
                                    borderColor: grade.border 
                                  }}
                                >
                                  {grade.label}
                                </span>
                              </div>
                            </div>

                            <div className={styles.stats}>
                              <div className={styles.statItem}>
                                <div className={styles.statLabel}>Participations 2026</div>
                                <div className={styles.statValue}>{runner.count}</div>
                              </div>
                              {runner.wins > 0 && (
                                <div className={styles.statItem}>
                                  <div className={styles.statLabel}>Victoires</div>
                                  <div className={styles.statValue} style={{ color: '#d97706' }}>{runner.wins}</div>
                                </div>
                              )}
                              <div className={styles.expandIcon}>
                                {isExpanded ? <ChevronUp size={22} color="var(--dark-ink)" /> : <ChevronDown size={22} color="var(--gray-muted)" />}
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={styles.details}
                              >
                                {runner.r.map((res, idx) => (
                                  <div key={idx} className={styles.resultItem}>
                                    <div className={styles.resultInfoLine}>
                                      <span className={styles.resultDate}>{res.d}</span>
                                      <div className={styles.raceInfoContainer}>
                                        <span className={styles.resultRaceName}>{res.rn}</span>
                                        <span className={styles.resultDistance}>{res.en}</span>
                                      </div>
                                      <span className={styles.resultTime}>{res.t}</span>
                                    </div>
                                  </div>
                                ))}

                                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'flex-end' }}>
                                  <Link
                                    href={`/coureur?id=${runner.s}`}
                                    className={styles.viewProfileBtn}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Fiche coureur & Palmarès complet
                                    <ArrowUpRight size={14} />
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {filteredRunners.length >= limit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLimit(l => l + 30); }}
                    className={styles.loadMore}
                  >
                    Charger plus de coureurs
                  </button>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const RecordsPage = () => (
  <Suspense fallback={<div style={{ padding: '8rem 2rem', textAlign: 'center' }}>Chargement des records du Vaucluse...</div>}>
    <RecordsContent />
  </Suspense>
);

export default RecordsPage;
