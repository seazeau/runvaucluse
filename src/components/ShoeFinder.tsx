'use client';

import React, { useState, useMemo } from 'react';
import shoesData from '@/data/shoes.json';
import styles from './ShoeFinder.module.css';
import { Sparkles, ExternalLink, RotateCcw, SlidersHorizontal, Compass } from 'lucide-react';

export interface ShoeItem {
  id: number;
  name: string;
  brand: string;
  profile_id: number;
  level: string;
  terrain: string;
  goal: string;
  price: number;
  image_url: string;
  description: string;
  affiliate_url: string;
}

interface ShoeFinderProps {
  /** Optional race or route context to pre-calibrate the scanner */
  raceName?: string;
  raceType?: string;
  raceDistances?: string;
  raceSlug?: string;
  /** If true, starts directly in the 3-step interactive wizard */
  startInWizardMode?: boolean;
}

type TerrainType = 'Route' | 'Trail' | 'Chemin';
type LevelType = 'Débutant' | 'Intermédiaire' | 'Pro';
type GoalType = 'Compétition' | 'Polyvalente' | 'Entraînement' | 'Confortable';

function detectDefaultTerrain(raceType?: string, raceName?: string): TerrainType {
  const hay = `${raceType || ''} ${raceName || ''}`.toLowerCase();
  if (hay.includes('trail') || hay.includes('mont') || hay.includes('ventoux') || hay.includes('dentelles') || hay.includes('luberon') || hay.includes('colline')) {
    return 'Trail';
  }
  if (hay.includes('nature') || hay.includes('chemin') || hay.includes('vigne') || hay.includes('terroir') || hay.includes('cross')) {
    return 'Chemin';
  }
  return 'Route';
}

// Rule: Ensure affiliate links always contain 'a_box=sc3esau3'
export function ensureTop4RunningAffiliateUrl(url: string): string {
  if (!url) return 'https://top4running.fr/?a_box=sc3esau3';
  if (url.includes('a_box=sc3esau3')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}a_box=sc3esau3`;
}

export default function ShoeFinder({
  raceName,
  raceType,
  raceDistances,
  raceSlug,
  startInWizardMode = false,
}: ShoeFinderProps) {
  const initialTerrain = useMemo(
    () => detectDefaultTerrain(raceType, raceName),
    [raceType, raceName]
  );

  const [wizardMode, setWizardMode] = useState<boolean>(startInWizardMode);
  const [step, setStep] = useState<number>(startInWizardMode ? 1 : 4);

  const [terrain, setTerrain] = useState<TerrainType>(initialTerrain);
  const [level, setLevel] = useState<LevelType>('Intermédiaire');
  const [goal, setGoal] = useState<GoalType>('Compétition');

  // Rule: 11 profiles x 3 levels, sorted by name descending to favor the latest model versions
  const recommendedShoes = useMemo(() => {
    const matches = (shoesData as ShoeItem[]).filter(
      (shoe) =>
        shoe.terrain.toLowerCase() === terrain.toLowerCase() &&
        shoe.level.toLowerCase() === level.toLowerCase() &&
        shoe.goal.toLowerCase() === goal.toLowerCase()
    );

    const sorted = [...matches].sort((a, b) =>
      b.name.localeCompare(a.name, 'fr', { numeric: true, sensitivity: 'base' })
    );

    // Deduplicate by model name if any
    const unique: ShoeItem[] = [];
    const seen = new Set<string>();
    for (const s of sorted) {
      const key = `${s.brand}-${s.name}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }

    return unique.slice(0, 3);
  }, [terrain, level, goal]);

  const handleWizardSelect = (
    key: 'terrain' | 'level' | 'goal',
    value: string
  ) => {
    if (key === 'terrain') {
      setTerrain(value as TerrainType);
      setStep(2);
    } else if (key === 'level') {
      setLevel(value as LevelType);
      setStep(3);
    } else if (key === 'goal') {
      setGoal(value as GoalType);
      setStep(4);
    }
  };

  const startWizard = () => {
    setWizardMode(true);
    setStep(1);
  };

  const trackAffiliateClick = (shoe: ShoeItem) => {
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
      };
      if (w.gtag) {
        w.gtag('event', 'click_affiliation_top4running', {
          shoe_name: shoe.name,
          shoe_brand: shoe.brand,
          shoe_price: shoe.price,
          terrain: shoe.terrain,
          level: shoe.level,
          goal: shoe.goal,
          race_slug: raceSlug || 'global_shoe_finder',
        });
      }
    }
  };

  const terrainLabel =
    terrain === 'Trail'
      ? '⛰️ Sentiers & Dénivelé (Trail)'
      : terrain === 'Chemin'
      ? '🌲 Chemins & Nature (Mixte)'
      : '🛣️ Route & Bitume Rapide';

  return (
    <section className={styles.scannerWrapper} aria-label="Scanner et Recommandateur de Chaussures Running & Trail">
      <div className={styles.scannerCard}>
        {/* Top Progress Bar */}
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className={styles.innerPadding}>
          {/* Top Bar */}
          <div className={styles.topHeader}>
            <div className={styles.badgeGroup}>
              <span className={styles.scannerTechBadge}>
                <Sparkles size={13} /> SHOE SCANNER IA • 11 PROFILS × 3 NIVEAUX
              </span>
              {raceName && (
                <span className={styles.terrainDetectedBadge}>
                  <Compass size={13} /> Calibré pour : {terrainLabel}
                </span>
              )}
            </div>

            {step === 4 ? (
              <button
                type="button"
                onClick={startWizard}
                className={styles.modeSwitchBtn}
              >
                <RotateCcw size={13} /> Faire le test en 3 étapes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setWizardMode(false);
                  setStep(4);
                }}
                className={styles.modeSwitchBtn}
              >
                <SlidersHorizontal size={13} /> Voir le comparateur direct
              </button>
            )}
          </div>

          {/* Title */}
          <div className={styles.titleRow}>
            {step < 4 && (
              <span className={styles.stepLabel}>
                Diagnostic Chaussures • Étape {step} sur 3
              </span>
            )}
            <h2 className={styles.mainTitle}>
              {raceName
                ? `QUELLES CHAUSSURES POUR ${raceName.toUpperCase()} ?`
                : 'TROUVEZ VOS 3 PAIRES IDÉALES EN 15 SECONDES'}
            </h2>
            <p className={styles.subTitle}>
              {raceName
                ? `Sélection biomécanique calibrée selon le terrain (${terrain}${raceDistances ? ` • ${raceDistances}` : ''}), votre volume d'entraînement et votre objectif.`
                : 'Algorithme RunVaucluse × Top4Running : 33 profils biomécaniques triés automatiquement sur les dernières versions sorties.'}
            </p>
          </div>

          {/* STEP 1: TERRAIN */}
          {wizardMode && step === 1 && (
            <div>
              <div className={styles.optionsGrid3}>
                <button
                  type="button"
                  onClick={() => handleWizardSelect('terrain', 'Route')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🛣️</span>
                  <span className={styles.optionTitle}>Route / Asphalte</span>
                  <span className={styles.optionDesc}>
                    5 km, 10 km, Semi et Marathon sur bitume roulant.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('terrain', 'Trail')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>⛰️</span>
                  <span className={styles.optionTitle}>Trail / Montagne</span>
                  <span className={styles.optionDesc}>
                    Sentiers calcaires du Ventoux, Dentelles, Luberon et fort D+.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('terrain', 'Chemin')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🌲</span>
                  <span className={styles.optionTitle}>Chemin / Nature</span>
                  <span className={styles.optionDesc}>
                    Courses nature, vignobles, ocres et pistes forestières roulantes.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LEVEL */}
          {wizardMode && step === 2 && (
            <div>
              <div className={styles.optionsGrid3}>
                <button
                  type="button"
                  onClick={() => handleWizardSelect('level', 'Débutant')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🔋</span>
                  <span className={styles.optionTitle}>Moins de 30 km / sem</span>
                  <span className={styles.optionDesc}>
                    Débutant, reprise ou1 à 2 sorties plaisir par semaine.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('level', 'Intermédiaire')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🏃‍♂️</span>
                  <span className={styles.optionTitle}>30 à 50 km / sem</span>
                  <span className={styles.optionDesc}>
                    Coureur régulier (3 à 4 séances/semaine) visant un chrono.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('level', 'Pro')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>⚡</span>
                  <span className={styles.optionTitle}>Plus de 50 km / sem</span>
                  <span className={styles.optionDesc}>
                    Compétiteur intensif à haut volume hebdomadaire.
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={styles.backStepBtn}
              >
                ← Retour au choix du terrain
              </button>
            </div>
          )}

          {/* STEP 3: GOAL */}
          {wizardMode && step === 3 && (
            <div>
              <div className={styles.optionsGrid2}>
                <button
                  type="button"
                  onClick={() => handleWizardSelect('goal', 'Compétition')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🏁</span>
                  <span className={styles.optionTitle}>Compétition / Jour de Course</span>
                  <span className={styles.optionDesc}>
                    Dynamisme maximal, légèreté, plaque carbone ou accroche élite.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('goal', 'Polyvalente')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🔄</span>
                  <span className={styles.optionTitle}>Chaussure Polyvalente</span>
                  <span className={styles.optionDesc}>
                    Une paire unique capable de tout faire (footing, seuil et dossard).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('goal', 'Entraînement')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>🏋️‍♂️</span>
                  <span className={styles.optionTitle}>Entraînement & Volume</span>
                  <span className={styles.optionDesc}>
                    Robustesse, maintien et durabilité pour borner toute l&apos;année.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelect('goal', 'Confortable')}
                  className={styles.optionCard}
                >
                  <span className={styles.optionEmoji}>☁️</span>
                  <span className={styles.optionTitle}>Confort & Protection Max</span>
                  <span className={styles.optionDesc}>
                    Amorti moelleux maximal pour épargner les articulations sur le long.
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={styles.backStepBtn}
              >
                ← Retour au volume hebdomadaire
              </button>
            </div>
          )}

          {/* STEP 4: RESULTS + INSTANT FILTER MATRIX */}
          {step === 4 && (
            <div>
              {/* 1-Click Filter Matrix */}
              <div className={styles.quickFiltersBar}>
                <div className={styles.filterRow}>
                  <span className={styles.filterGroupLabel}>1. Terrain :</span>
                  <div className={styles.pillGroup}>
                    {(['Route', 'Trail', 'Chemin'] as TerrainType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTerrain(t)}
                        className={`${styles.filterPill} ${
                          terrain === t ? styles.filterPillActive : ''
                        }`}
                      >
                        {t === 'Route' ? '🛣️ Route' : t === 'Trail' ? '⛰️ Trail' : '🌲 Chemin / Mixte'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterRow}>
                  <span className={styles.filterGroupLabel}>2. Votre Niveau :</span>
                  <div className={styles.pillGroup}>
                    {(
                      [
                        { id: 'Débutant', label: '🔋 Débutant (<30 km/sem)' },
                        { id: 'Intermédiaire', label: '🏃‍♂️ Régulier (30-50 km/sem)' },
                        { id: 'Pro', label: '⚡ Intensif (>50 km/sem)' },
                      ] as { id: LevelType; label: string }[]
                    ).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setLevel(lvl.id)}
                        className={`${styles.filterPill} ${
                          level === lvl.id ? styles.filterPillActive : ''
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterRow}>
                  <span className={styles.filterGroupLabel}>3. Objectif :</span>
                  <div className={styles.pillGroup}>
                    {(
                      [
                        { id: 'Compétition', label: '🏁 Compétition / Dossard' },
                        { id: 'Polyvalente', label: '🔄 Polyvalente' },
                        { id: 'Entraînement', label: '🏋️‍♂️ Entraînement' },
                        { id: 'Confortable', label: '☁️ Confort Max' },
                      ] as { id: GoalType; label: string }[]
                    ).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`${styles.filterPill} ${
                          goal === g.id ? styles.filterPillActive : ''
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Recommended Shoe Cards */}
              <div className={styles.resultsGrid}>
                {recommendedShoes.map((shoe, idx) => {
                  const affiliateHref = ensureTop4RunningAffiliateUrl(shoe.affiliate_url);
                  return (
                    <article
                      key={`${shoe.id}-${idx}`}
                      className={`${styles.shoeCard} ${
                        idx === 0 ? styles.shoeCardFeatured : ''
                      }`}
                    >
                      {idx === 0 && (
                        <span className={styles.topPickBadge}>
                          ★ Choix #1 Coach
                        </span>
                      )}

                      <div className={styles.imageBox}>
                        <img
                          src={shoe.image_url}
                          alt={`${shoe.brand} ${shoe.name}`}
                          className={styles.shoeImg}
                          loading="lazy"
                        />
                        <span className={styles.priceTag}>{shoe.price} €</span>
                      </div>

                      <div className={styles.cardBody}>
                        <div>
                          <div className={styles.brandMetaRow}>
                            <span className={styles.brandName}>{shoe.brand}</span>
                            <span className={styles.goalTag}>
                              {shoe.terrain} • {shoe.goal}
                            </span>
                          </div>
                          <h3 className={styles.shoeTitle}>{shoe.name}</h3>
                          <p className={styles.shoeDesc}>{shoe.description}</p>
                        </div>

                        <a
                          href={affiliateHref}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={() => trackAffiliateClick(shoe)}
                          className={styles.buyBtn}
                        >
                          Voir l&apos;offre sur Top4Running <ExternalLink size={14} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className={styles.footerBar}>
                <span>
                  💡 Sélection mise à jour avec les dernières versions ({terrain} • {level} • {goal}).
                </span>
                <a
                  href={`https://top4running.fr/c/${
                    terrain === 'Trail' ? 'chaussures-de-trail' : 'running-chaussures'
                  }?a_box=sc3esau3`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={styles.catalogLink}
                >
                  Explorer tout le rayon {terrain} sur Top4Running <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
