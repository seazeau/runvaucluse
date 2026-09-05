'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  Search, 
  Calendar, 
  MapPin, 
  Award, 
  Share2, 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  Zap, 
  Activity, 
  Timer, 
  Mountain, 
  ExternalLink,
  Flame,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import RunnerCardModal from '@/components/RunnerCardModal';
import { canonicalSlug, slugify } from '@/lib/utils';
import styles from './coureur.module.css';

interface RaceResult {
  rn: string;
  en: string;
  ro: number | string;
  t: string;
  d: string;
  slug?: string;
  club?: string;
  cat?: string;
}

interface Runner {
  n: string;
  s: string;
  club?: string;
  count: number;
  wins: number;
  r: RaceResult[];
}

function parseDistanceKm(eventName: string): number {
  if (!eventName) return 10;
  const match = eventName.match(/(\d+(\.\d+)?)\s*k/i);
  if (match) return parseFloat(match[1]);
  const numMatch = eventName.match(/(\d+(\.\d+)?)/);
  return numMatch ? parseFloat(numMatch[1]) : 10;
}

function calculatePaceAndSpeed(timeStr: string, distanceKm: number) {
  if (!timeStr || !distanceKm) return { pace: '-', speed: '-' };
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  let totalSec = 0;
  if (parts.length === 3) {
    totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    totalSec = parts[0] * 60 + parts[1];
  }
  if (totalSec <= 0 || distanceKm <= 0) return { pace: '-', speed: '-' };
  
  const secPerKm = totalSec / distanceKm;
  const paceMin = Math.floor(secPerKm / 60);
  const paceSec = Math.round(secPerKm % 60);
  const pace = `${paceMin}:${paceSec.toString().padStart(2, '0')} /km`;
  const speed = `${(3600 / secPerKm).toFixed(1)} km/h`;
  return { pace, speed };
}

export default function CoureurClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryId = searchParams.get('id');
  const queryName = searchParams.get('nom') || searchParams.get('name') || searchParams.get('search');

  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Wall of Fame database
  useEffect(() => {
    fetch('/data/wall-of-fame.json')
      .then(res => res.json())
      .then((data: Runner[]) => {
        setRunners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement coureurs:', err);
        setLoading(false);
      });
  }, []);

  // Determine active runner when data or query changes
  useEffect(() => {
    if (runners.length === 0) return;

    if (queryId) {
      const match = runners.find(r => 
        r.s === queryId || 
        canonicalSlug(r.n) === queryId || 
        slugify(r.n) === queryId
      );
      if (match) {
        setSelectedRunner(match);
        return;
      }
    }

    if (queryName) {
      const clean = queryName.toLowerCase().trim();
      const match = runners.find(r => r.n.toLowerCase().includes(clean));
      if (match) {
        setSelectedRunner(match);
        return;
      }
    }

    // Default to #1 runner if no param given
    if (!selectedRunner && runners.length > 0) {
      setSelectedRunner(runners[0]);
    }
  }, [runners, queryId, queryName]);

  // Autocomplete search suggestions
  const searchSuggestions = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length < 2) return [];
    return runners
      .filter(r => r.n.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchInput, runners]);

  const handleSelectRunner = (runner: Runner) => {
    setSelectedRunner(runner);
    setSearchInput('');
    setIsSearchFocused(false);
    window.history.replaceState(null, '', `/coureur?id=${runner.s}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareProfile = () => {
    if (!selectedRunner) return;
    const url = `${window.location.origin}/coureur?id=${selectedRunner.s}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Lien du profil copié dans le presse-papier !');
    } else {
      showToast('URL : ' + url);
    }
  };

  // Grade helper
  const getGrade = (count: number) => {
    if (count > 8) return { label: 'LÉGENDE DU VAUCLUSE', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' };
    if (count >= 7) return { label: 'PILIER DU PELOTON', color: '#1E40AF', bg: '#DBEAFE', border: '#BFDBFE' };
    if (count >= 4) return { label: 'L\'INITIÉ DU 84', color: '#166534', bg: '#DCFCE7', border: '#BBF7D0' };
    return { label: 'LA RECRUE', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
  };

  // Compute runner metrics
  const runnerMetrics = useMemo(() => {
    if (!selectedRunner) return null;

    const rank2026 = runners.findIndex(r => r.s === selectedRunner.s) + 1;
    const grade = getGrade(selectedRunner.count);

    let totalKm = 0;
    let bestRank = 999999;
    let podiums = 0;
    let top10 = 0;
    let hasVentoux = false;

    selectedRunner.r.forEach(res => {
      const km = parseDistanceKm(res.en);
      totalKm += km;

      const rNum = typeof res.ro === 'number' ? res.ro : parseInt(res.ro, 10);
      if (!isNaN(rNum) && rNum > 0) {
        if (rNum < bestRank) bestRank = rNum;
        if (rNum <= 3) podiums++;
        if (rNum <= 10) top10++;
      }

      const lowerName = res.rn.toLowerCase();
      if (lowerName.includes('ventoux') || lowerName.includes('grv') || lowerName.includes('malaucene')) {
        hasVentoux = true;
      }
    });

    return {
      rank2026: rank2026 > 0 ? rank2026 : 1,
      grade,
      totalKm: Math.round(totalKm),
      bestRank: bestRank < 999999 ? bestRank : '-',
      podiums,
      top10,
      hasVentoux
    };
  }, [selectedRunner, runners]);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <p>CHARGEMENT DES PROFILS DU VAUCLUSE...</p>
        </div>
      </div>
    );
  }

  if (!selectedRunner) {
    return (
      <div className={styles.pageWrapper}>
        <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
          <h2>Aucun coureur trouvé</h2>
          <p style={{ marginTop: '1rem' }}>Vérifiez l&apos;orthographe ou recherchez un autre coureur.</p>
          <Link href="/records?tab=regularite" className={styles.primaryBtn} style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Voir le classement complet de régularité
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Story Modal */}
      {runnerMetrics && (
        <RunnerCardModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          runner={{
            n: selectedRunner.n,
            s: selectedRunner.s,
            club: selectedRunner.club,
            count: selectedRunner.count,
            wins: selectedRunner.wins,
            totalKm: runnerMetrics.totalKm,
            bestRank: typeof runnerMetrics.bestRank === 'number' ? runnerMetrics.bestRank : 0,
            rank2026: runnerMetrics.rank2026,
            grade: runnerMetrics.grade
          }}
        />
      )}

      <div className="container">
        {/* TOP BAR / NAVIGATION & SEARCH */}
        <div className={styles.topBar}>
          <Link href="/records?tab=regularite" className={styles.backLink}>
            <ArrowLeft size={16} /> CLASSEMENT DE RÉGULARITÉ
          </Link>

          {/* Autocomplete Search Bar */}
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un autre coureur (nom, prénom)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              className={styles.searchInput}
            />

            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {searchSuggestions.map(s => (
                  <button
                    key={s.s}
                    type="button"
                    className={styles.suggestionItem}
                    onMouseDown={() => handleSelectRunner(s)}
                  >
                    <div>
                      <div className={styles.suggestionName}>{s.n}</div>
                      <div className={styles.suggestionMeta}>
                        {s.club || 'Sans club'} • {s.count} courses
                      </div>
                    </div>
                    <ChevronRight size={16} color="#c05621" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HERO ATHLETE PROFILE */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileMain}>
              <div className={styles.rankBadgeHeader}>
                <Trophy size={14} color="#c05621" />
                <span>RANG #{runnerMetrics?.rank2026} DU VAUCLUSE EN 2026</span>
              </div>

              <h1 className={styles.athleteTitle}>{selectedRunner.n}</h1>

              {selectedRunner.club && (
                <div className={styles.clubRow}>
                  <ShieldCheck size={16} color="#2b6cb0" />
                  <span>{selectedRunner.club}</span>
                </div>
              )}

              {/* Badges List */}
              <div className={styles.badgesRow}>
                <span 
                  className={styles.gradeBadge}
                  style={{
                    backgroundColor: runnerMetrics?.grade.bg,
                    color: runnerMetrics?.grade.color,
                    borderColor: runnerMetrics?.grade.border
                  }}
                >
                  <Award size={14} />
                  {runnerMetrics?.grade.label}
                </span>

                {selectedRunner.wins > 0 && (
                  <span className={styles.victoryBadge}>
                    <Trophy size={13} />
                    {selectedRunner.wins} {selectedRunner.wins > 1 ? 'Victoires Scratch' : 'Victoire Scratch'}
                  </span>
                )}

                {runnerMetrics?.hasVentoux && (
                  <span className={styles.ventouxBadge}>
                    <Mountain size={13} />
                    Finisher Ventoux
                  </span>
                )}

                {selectedRunner.count >= 10 && (
                  <span className={styles.centurionBadge}>
                    <Flame size={13} />
                    Centurion 10+ Courses
                  </span>
                )}

                {runnerMetrics && runnerMetrics.top10 > 0 && (
                  <span className={styles.top10Badge}>
                    <Zap size={13} />
                    {runnerMetrics.top10}x Top 10
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Instagram Story Card & Copy Link */}
            <div className={styles.profileActions}>
              <button 
                onClick={() => setIsStoryModalOpen(true)}
                className={styles.storyBtn}
              >
                <Award size={18} />
                Générer ma Carte Finisher (Story)
              </button>

              <button 
                onClick={handleShareProfile}
                className={styles.shareProfileBtn}
              >
                <Share2 size={16} />
                Partager ce profil
              </button>
            </div>
          </div>

          {/* ATHLETE KEY METRICS */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Calendar size={22} color="#c05621" />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{selectedRunner.count}</span>
                <span className={styles.statLabel}>COURSES EN VAUCLUSE</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Activity size={22} color="#2b6cb0" />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{runnerMetrics?.totalKm} <small>km</small></span>
                <span className={styles.statLabel}>KILOMÈTRES EN COURSE</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Trophy size={22} color="#d97706" />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue} style={{ color: selectedRunner.wins > 0 ? '#d97706' : 'inherit' }}>
                  {selectedRunner.wins > 0 ? selectedRunner.wins : (runnerMetrics?.bestRank !== '-' ? `#${runnerMetrics?.bestRank}` : '-')}
                </span>
                <span className={styles.statLabel}>
                  {selectedRunner.wins > 0 ? 'VICTOIRES SCRATCH' : 'MEILLEUR CLASSEMENT'}
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <UserCheck size={22} color="#166534" />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{runnerMetrics?.podiums}</span>
                <span className={styles.statLabel}>PODIUMS SCRATCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE / RACES HISTORY */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <div>
              <h2 className={styles.historyTitle}>PALMARÈS & ÉPREUVES 2026</h2>
              <p className={styles.historySubtitle}>
                Toutes les courses et temps officiels enregistrés sur le département du Vaucluse.
              </p>
            </div>
            <div className={styles.historyCountBadge}>
              {selectedRunner.r.length} {selectedRunner.r.length > 1 ? 'épreuves' : 'épreuve'}
            </div>
          </div>

          <div className={styles.racesTableWrapper}>
            <table className={styles.racesTable}>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>COURSE</th>
                  <th>DISTANCE</th>
                  <th>TEMPS</th>
                  <th>ALLURE / VITESSE</th>
                  <th>SCRATCH</th>
                  <th>CATÉGORIE</th>
                  <th>FICHE</th>
                </tr>
              </thead>
              <tbody>
                {selectedRunner.r.map((race, idx) => {
                  const distKm = parseDistanceKm(race.en);
                  const { pace, speed } = calculatePaceAndSpeed(race.t, distKm);
                  const rankNum = typeof race.ro === 'number' ? race.ro : parseInt(race.ro as string, 10);
                  const isPodium = !isNaN(rankNum) && rankNum >= 1 && rankNum <= 3;

                  return (
                    <tr key={idx}>
                      <td className={styles.cellDate}>
                        {new Date(race.d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className={styles.cellRaceName}>
                        {race.slug ? (
                          <Link href={`/resultats/${race.slug}`} className={styles.raceTableLink}>
                            {race.rn}
                          </Link>
                        ) : (
                          race.rn
                        )}
                      </td>
                      <td className={styles.cellDistance}>
                        <span className={styles.distPill}>{race.en}</span>
                      </td>
                      <td className={styles.cellTime}>
                        <div className={styles.timeVal}>{race.t}</div>
                      </td>
                      <td className={styles.cellMetrics}>
                        <div className={styles.paceVal}>{pace}</div>
                        <div className={styles.speedVal}>{speed}</div>
                      </td>
                      <td className={styles.cellRank}>
                        {isPodium ? (
                          <span className={styles.podiumRankBadge}>
                            {rankNum === 1 ? '🥇 #1' : rankNum === 2 ? '🥈 #2' : '🥉 #3'}
                          </span>
                        ) : (
                          <span className={styles.regularRankBadge}>
                            #{race.ro}
                          </span>
                        )}
                      </td>
                      <td className={styles.cellCat}>
                        {race.cat || '-'}
                      </td>
                      <td className={styles.cellAction}>
                        {race.slug && (
                          <Link href={`/resultats/${race.slug}`} className={styles.raceDetailBtn} title="Voir le classement complet">
                            <ExternalLink size={14} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM CALLOUT */}
        <div className={styles.footerCallout}>
          <div className={styles.calloutText}>
            <h3>VOUS ÊTES COUREUR EN VAUCLUSE ?</h3>
            <p>
              Les résultats sont synchronisés automatiquement après chaque week-end de course officielle. Vous pouvez partager votre fiche ou générer votre carte finisher pour vos stories.
            </p>
          </div>
          <div className={styles.calloutButtons}>
            <button onClick={() => setIsStoryModalOpen(true)} className={styles.calloutBtnPrimary}>
              Générer ma Story Instagram
            </button>
            <Link href="/records" className={styles.calloutBtnSecondary}>
              Voir les records officiels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
