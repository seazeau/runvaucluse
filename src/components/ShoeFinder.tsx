'use client';

import React, { useState, useEffect, useMemo } from 'react';
import shoesData from '@/data/shoes.json';
import configData from '@/data/shoeFinderConfig.json';
import styles from './ShoeFinder.module.css';
import {
  Dna,
  Target,
  Activity,
  Zap,
  Shield,
  Award,
  TrendingUp,
  RotateCcw,
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  X,
  ChevronRight,
  Compass,
} from 'lucide-react';

export interface ShoeModel {
  id: string | number;
  modelKey: string;
  name: string;
  brand: string;
  usage: string;
  cushion?: string;
  cushionType: string;
  hasPlate: boolean;
  plateType?: string;
  price: number;
  image: string;
  externalUrl: string;
  weight: string;
  drop: number;
  stack?: string;
  stackHeight?: string;
  amorti?: number;
  dynamisme?: number;
  stabilite?: number;
  description: string;
  expertVibe?: string;
  pros: string[];
  cons?: string[];
  expertReason?: string;
  matchScore?: number;
}

interface ProfileRecommendationItem {
  modelName: string;
  brand: string;
  why: string;
}

export type LevelKey = 'DÉBUTANT' | 'INTERMÉDIAIRE' | 'PRO';

interface RunnerProfile {
  id: string;
  title: string;
  description: string;
  levels: Record<LevelKey, ProfileRecommendationItem[]>;
}

interface ShoeFinderProps {
  raceName?: string;
  raceType?: string;
  raceDistances?: string;
  raceSlug?: string;
  startInWizardMode?: boolean;
  showCatalog?: boolean;
}

const PROFILES: RunnerProfile[] = (configData as unknown as { profiles: RunnerProfile[] }).profiles;
const TECH_SPECS: Record<string, Partial<ShoeModel>> = (
  configData as unknown as { techSpecs: Record<string, Partial<ShoeModel>> }
).techSpecs;

const QUIZ_QUESTIONS = [
  {
    id: 'terrain',
    question: 'SURFACE DE PRÉDILECTION ?',
    options: ['ROUTE', 'MIXTE', 'TRAIL'],
    icon: Target,
  },
  {
    id: 'weight',
    question: 'CATÉGORIE DE POIDS ?',
    options: ['< 75KG', '75-85KG', '> 85KG'],
    icon: Activity,
  },
  {
    id: 'experience',
    question: "NIVEAU D'EXPERTISE ?",
    options: ['DÉBUTANT', 'INTERMÉDIAIRE', 'PRO'],
    icon: Award,
  },
  {
    id: 'volume',
    question: 'DISTANCE HEBDO ?',
    options: ['< 20KM', '20-50KM', '> 50KM'],
    icon: TrendingUp,
  },
  {
    id: 'injury',
    question: 'POINTS DE FRAGILITÉ ?',
    options: ['AUCUNE', 'ARTICULATIONS', 'PIEDS'],
    icon: Shield,
  },
  {
    id: 'priority',
    question: 'OBJECTIF PRIORITAIRE ?',
    options: ['VITESSE', 'CONFORT', 'PROTECTION', 'POLYVALENCE'],
    icon: Zap,
  },
] as const;

// Rule: Ensure affiliate links always contain 'a_box=sc3esau3'
export function ensureTop4RunningAffiliateUrl(url?: string, fallbackQuery?: string): string {
  if (!url || url === '#') {
    const q = fallbackQuery ? `search?search=${encodeURIComponent(fallbackQuery)}&` : '?';
    return `https://top4running.fr/${q}a_box=sc3esau3`;
  }
  if (url.includes('a_box=sc3esau3')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}a_box=sc3esau3`;
}

function detectInitialProfileForRace(raceType?: string, raceName?: string, raceDistances?: string): {
  profileId: string;
  terrain: 'ROUTE' | 'MIXTE' | 'TRAIL';
} {
  const hay = `${raceType || ''} ${raceName || ''} ${raceDistances || ''}`.toLowerCase();
  if (
    hay.includes('trail') ||
    hay.includes('ventoux') ||
    hay.includes('dentelles') ||
    hay.includes('luberon') ||
    hay.includes('ventouret') ||
    hay.includes('mont')
  ) {
    if (hay.includes('ultra') || hay.includes('42') || hay.includes('50') || hay.includes('60') || hay.includes('80')) {
      return { profileId: 'ultra', terrain: 'TRAIL' };
    }
    return { profileId: 'trail-poly', terrain: 'TRAIL' };
  }
  if (hay.includes('nature') || hay.includes('chemin') || hay.includes('vigne') || hay.includes('cross')) {
    return { profileId: 'trail-poly', terrain: 'MIXTE' };
  }
  if (hay.includes('marathon') || hay.includes('semi') || hay.includes('10 km') || hay.includes('10km')) {
    return { profileId: 'records', terrain: 'ROUTE' };
  }
  return { profileId: 'polyvalent', terrain: 'ROUTE' };
}

function computeProfileFromAnswers(answers: Record<string, string>): RunnerProfile {
  const { terrain, weight, experience, volume, injury, priority } = answers;
  if (terrain === 'TRAIL') {
    if (priority === 'VITESSE') return PROFILES[6]; // 7. Le Performeur Trail
    if (volume === '> 50KM' || priority === 'PROTECTION') return PROFILES[5]; // 6. L'Ultra-Traileur
    return PROFILES[4]; // 5. Le Traileur Polyvalent
  }
  if (terrain === 'MIXTE') {
    return PROFILES[4]; // 5. Le Traileur Polyvalent
  }
  if (weight === '> 85KG') return PROFILES[2]; // 3. Gabarit Fort (+85kg)
  if (injury === 'ARTICULATIONS' || priority === 'PROTECTION') return PROFILES[8]; // 9. Soucieux de ses Articulations
  if (priority === 'VITESSE') {
    return experience === 'DÉBUTANT' ? PROFILES[7] : PROFILES[1]; // 8. Tempo ou 2. Chasseur de Records
  }
  if (priority === 'CONFORT') return PROFILES[3]; // 4. Fan de Confort
  if (priority === 'POLYVALENCE') return PROFILES[9]; // 10. Le Polyvalent
  if (experience === 'DÉBUTANT' && volume === '< 20KM') return PROFILES[0]; // 1. Pur Débutant / Récup
  return PROFILES[9]; // 10. Le Polyvalent
}

// Live client-side XML fetcher via /feed.php on Hostinger (sorts by name descending to favor newest versions)
async function fetchLiveTop4RunningFeed(fallbackShoes: ShoeModel[]): Promise<ShoeModel[]> {
  try {
    const res = await fetch('/feed.php', { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallbackShoes;
    const xml = await res.text();
    if (!xml.includes('<item>')) return fallbackShoes;

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    if (items.length === 0) return fallbackShoes;

    const getTag = (str: string, tag: string) => {
      const m = str.match(
        new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`)
      );
      return m ? (m[1] ?? m[2] ?? '').trim() : '';
    };

    const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelKeys = Object.keys(TECH_SPECS).sort((a, b) => b.length - a.length);
    const matched: (ShoeModel & { _penalty: number })[] = [];

    for (const itemXml of items) {
      const fullCat = getTag(itemXml, 'full_category');
      if (!fullCat.toLowerCase().includes('chaussures')) continue;
      if (/enfant|junior|pointes|athlétisme|athletisme/i.test(fullCat)) continue;

      const shortTitle = getTag(itemXml, 'short_title');
      const manufacturer = getTag(itemXml, 'manufacturer');
      if (!shortTitle || !manufacturer) continue;
      if (/\b(jr|kids|gs|ps|td|crib|ld|md|spike|pointes|ghost racer)\b/i.test(shortTitle)) continue;

      const modelKey = modelKeys.find((k) => {
        if (k === 'Aero Glide GRVL') return /aero glide.*grvl/i.test(shortTitle);
        if (k === 'Sonic Blast' || k === 'Sonicblast') return /sonic\s*blast/i.test(shortTitle);
        if (k === 'Gel-Trabuco') return /(gel-)?trabuco\b(?!\s*max)/i.test(shortTitle);
        return new RegExp(`\\b${escapeRx(k)}\\b`, 'i').test(shortTitle);
      });
      if (!modelKey) continue;

      const spec = TECH_SPECS[modelKey] || {};
      const price = parseFloat(getTag(itemXml, 'sale_price') || getTag(itemXml, 'price') || '0');
      const rawUrl = getTag(itemXml, 'url');
      const externalUrl = ensureTop4RunningAffiliateUrl(rawUrl, `${manufacturer} ${shortTitle}`);
      const imgurl = getTag(itemXml, 'imgurl');
      const id = getTag(itemXml, 'itemgroup_id') || getTag(itemXml, 'item_id') || `${manufacturer}-${modelKey}`;

      const isWomen =
        fullCat.toLowerCase().includes('femme') ||
        /\b(w|wmns|women)\b/i.test(shortTitle) ||
        rawUrl.includes('-women-');
      const isVariant = /\b(wide|gtx|gore-tex|shield|winter|tr)\b/i.test(shortTitle);
      const penalty = (isWomen ? 2 : 0) + (isVariant ? 1 : 0);

      matched.push({
        id,
        modelKey,
        name: shortTitle,
        brand: manufacturer,
        usage: spec.usage || 'Route & Compétition',
        cushion: spec.cushion || 'Dynamique',
        cushionType: spec.cushion || 'Dynamique',
        hasPlate: Boolean(spec.hasPlate),
        plateType: spec.plateType,
        price,
        image: imgurl,
        externalUrl,
        weight: spec.weight || '250g',
        drop: spec.drop ?? 8,
        stack: spec.stack || '36/28mm',
        stackHeight: spec.stack || '36/28mm',
        amorti: spec.amorti ?? 85,
        dynamisme: spec.dynamisme ?? 85,
        stabilite: spec.stabilite ?? 85,
        description:
          spec.expertVibe || `Expertise RunVaucluse : ${spec.usage || 'Running'} • Amorti ${spec.cushion || 'Pro'}.`,
        expertVibe: spec.expertVibe,
        pros: spec.pros || ['Performance validée', 'Valeur sûre'],
        cons: spec.cons || [],
        _penalty: penalty,
      });
    }

    if (matched.length === 0) return fallbackShoes;

    // Rule: Always sort by name descending to favor latest model versions
    matched.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' }));

    const map = new Map<string, ShoeModel & { _penalty: number }>();
    const getVer = (name: string, mKey: string) => {
      const clean = name.toLowerCase().replace(mKey.toLowerCase(), '');
      const m = clean.match(/\b(\d{1,2})\b/);
      return m ? parseInt(m[1], 10) : 0;
    };

    for (const item of matched) {
      const key = `${item.brand}-${item.modelKey}`.toLowerCase();
      if (map.has(key)) {
        const existing = map.get(key)!;
        const vNew = getVer(item.name, item.modelKey);
        const vOld = getVer(existing.name, existing.modelKey);
        if (vNew > vOld || (vNew === vOld && item._penalty < existing._penalty)) {
          map.set(key, item);
        }
      } else {
        map.set(key, item);
      }
    }

    const liveList: ShoeModel[] = Array.from(map.values()).map(({ _penalty, ...rest }) => rest);
    const seen = new Set(liveList.map((s) => `${s.brand}-${s.modelKey}`.toLowerCase()));
    for (const fb of fallbackShoes) {
      const k = `${fb.brand}-${fb.modelKey}`.toLowerCase();
      if (!seen.has(k)) {
        liveList.push(fb);
        seen.add(k);
      }
    }
    return liveList;
  } catch {
    return fallbackShoes;
  }
}

export default function ShoeFinder({
  raceName,
  raceType,
  raceDistances,
  raceSlug,
  startInWizardMode = false,
  showCatalog = false,
}: ShoeFinderProps) {
  const initialCalibration = useMemo(
    () => detectInitialProfileForRace(raceType, raceName, raceDistances),
    [raceType, raceName, raceDistances]
  );

  const [shoes, setShoes] = useState<ShoeModel[]>(() => shoesData as unknown as ShoeModel[]);
  const [quizActive, setQuizActive] = useState<boolean>(startInWizardMode);
  const [step, setStep] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    terrain: initialCalibration.terrain,
    experience: 'INTERMÉDIAIRE',
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialCalibration.profileId);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('INTERMÉDIAIRE');
  const [detailShoe, setDetailShoe] = useState<ShoeModel | null>(null);

  // Catalog filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedSurfaceFilter, setSelectedSurfaceFilter] = useState<'ALL' | 'ROUTE' | 'TRAIL'>('ALL');
  const [priceSort, setPriceSort] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');

  // Attempt live XML feed refresh on mount
  useEffect(() => {
    let mounted = true;
    fetchLiveTop4RunningFeed(shoesData as unknown as ShoeModel[]).then((updated) => {
      if (mounted && updated.length > 0) {
        setShoes(updated);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeProfile = useMemo(
    () => PROFILES.find((p) => p.id === selectedProfileId) || PROFILES[9],
    [selectedProfileId]
  );

  // Resolve the 3 recommended shoes for the active profile x level (sorted by name descending)
  const recommendedShoes = useMemo(() => {
    const levelRecs = activeProfile.levels[selectedLevel] || activeProfile.levels['INTERMÉDIAIRE'];
    const sortedInventory = [...shoes].sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    return levelRecs.map((rec, idx) => {
      const target = rec.modelName.toLowerCase();
      const match = sortedInventory.find(
        (s) =>
          s.modelKey.toLowerCase() === target ||
          s.name.toLowerCase().includes(target) ||
          target.includes(s.modelKey.toLowerCase())
      );

      if (match) {
        return {
          ...match,
          externalUrl: ensureTop4RunningAffiliateUrl(match.externalUrl, `${match.brand} ${match.name}`),
          expertReason: rec.why,
          matchScore: 98 - idx * 5,
        };
      }

      const cleanBrand = rec.brand === 'Sonic' ? 'ASICS' : rec.brand;
      return {
        id: `fallback-${rec.modelName}`,
        modelKey: rec.modelName,
        name: `${cleanBrand} ${rec.modelName}`,
        brand: cleanBrand,
        usage: 'Performance & Entraînement',
        cushionType: 'Dynamique',
        hasPlate: false,
        price: 150,
        image: '/chaussure_jaune.svg',
        externalUrl: ensureTop4RunningAffiliateUrl(undefined, `${cleanBrand} ${rec.modelName}`),
        weight: '255g',
        drop: 8,
        stackHeight: '35/27mm',
        amorti: 85,
        dynamisme: 85,
        stabilite: 85,
        description: rec.why,
        expertReason: rec.why,
        pros: ['Sélection Expert', 'Dernière Génération'],
        matchScore: 95 - idx * 5,
      } as ShoeModel;
    });
  }, [activeProfile, selectedLevel, shoes]);

  const handleQuizOptionSelect = (optionValue: string) => {
    const currentQ = QUIZ_QUESTIONS[step];
    const nextAnswers = { ...answers, [currentQ.id]: optionValue };
    setAnswers(nextAnswers);

    if (currentQ.id === 'experience') {
      setSelectedLevel(optionValue as LevelKey);
    }

    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      const matchedProf = computeProfileFromAnswers(nextAnswers);
      setSelectedProfileId(matchedProf.id);
      if (nextAnswers.experience) {
        setSelectedLevel(nextAnswers.experience as LevelKey);
      }
      setTimeout(() => {
        setIsAnalyzing(false);
        setQuizActive(false);
      }, 1100);
    }
  };

  const startFullBiometricScan = () => {
    setStep(0);
    setIsAnalyzing(false);
    setQuizActive(true);
  };

  const trackAffiliateClick = (shoe: ShoeModel) => {
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
      };
      if (w.gtag) {
        w.gtag('event', 'click_affiliation_top4running', {
          shoe_name: shoe.name,
          shoe_brand: shoe.brand,
          shoe_price: shoe.price,
          profile_id: activeProfile.id,
          level: selectedLevel,
          race_slug: raceSlug || 'global_shoe_finder',
        });
      }
    }
  };

  // Catalog filtering & sorting
  const brandsList = useMemo(
    () => Array.from(new Set(shoes.map((s) => s.brand))).sort(),
    [shoes]
  );

  const filteredCatalog = useMemo(() => {
    return shoes
      .filter((s) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q) ||
          (s.usage || '').toLowerCase().includes(q);
        const matchesBrand = selectedBrand === 'ALL' || s.brand === selectedBrand;
        const isTrailShoe = /trail|montagne|ultra|skyrunning|gravel|chemins/i.test(
          `${s.usage} ${s.name}`
        );
        const matchesSurface =
          selectedSurfaceFilter === 'ALL' ||
          (selectedSurfaceFilter === 'TRAIL' && isTrailShoe) ||
          (selectedSurfaceFilter === 'ROUTE' && !isTrailShoe);
        return matchesSearch && matchesBrand && matchesSurface;
      })
      .sort((a, b) => {
        if (priceSort === 'ASC') return (a.price || 0) - (b.price || 0);
        if (priceSort === 'DESC') return (b.price || 0) - (a.price || 0);
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [shoes, searchQuery, selectedBrand, selectedSurfaceFilter, priceSort]);

  const CurrentQuestionIcon = QUIZ_QUESTIONS[step]?.icon || Target;

  return (
    <section
      className={styles.scannerWrapper}
      aria-label="Scanner Biométrique Chaussures Running & Trail"
    >
      {/* MAIN CYBER DNA SCANNER CARD */}
      <div className={styles.cyberCard}>
        <div className={`${styles.techCorner} ${styles.tcTl}`} />
        <div className={`${styles.techCorner} ${styles.tcTr}`} />
        <div className={`${styles.techCorner} ${styles.tcBl}`} />
        <div className={`${styles.techCorner} ${styles.tcBr}`} />

        {/* Subtle Radar Background */}
        <div className={styles.radarBg}>
          <div className={styles.radarCircleOuter} />
        </div>

        {/* TOP HUD BAR */}
        <div className={styles.topBar}>
          <div className={styles.badgeRow}>
            <span className={styles.dnaBadge}>
              <Dna size={14} /> MAPPAGE_DNA v4.2 • 11 PROFILS × 3 NIVEAUX
            </span>
            {raceName && (
              <span className={styles.raceCalibratedBadge}>
                <Compass size={13} /> CALIBRÉ : {raceName.toUpperCase()}
              </span>
            )}
          </div>

          {quizActive ? (
            <button
              type="button"
              onClick={() => {
                setIsAnalyzing(false);
                setQuizActive(false);
              }}
              className={styles.actionSwitchBtn}
            >
              <SlidersHorizontal size={14} /> [ MATRICE 11×3 DIRECTE ]
            </button>
          ) : (
            <button
              type="button"
              onClick={startFullBiometricScan}
              className={styles.actionSwitchBtn}
            >
              <RotateCcw size={14} /> [ LANCER LE SCAN BIOMÉTRIQUE 6 ÉTAPES ]
            </button>
          )}
        </div>

        {/* HEADER TITLE */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 className={styles.heroTitle}>
            {raceName ? (
              <>
                SÉLECTION DNA POUR{' '}
                <span className={styles.heroTitleAccent}>{raceName}</span>
              </>
            ) : (
              <>
                ANALYSE TECH.{' '}
                <span className={styles.heroTitleAccent}>SHOE SCANNER IA.</span>
              </>
            )}
          </h2>
          <p className={styles.heroSubtitle}>
            {raceName
              ? `Rayon X sur les exigences du parcours (${raceType || 'Course'}${
                  raceDistances ? ` • ${raceDistances}` : ''
                }) croisé avec le flux live Top4Running 2026 pour extraire vos 3 paires idéales.`
              : 'Rayon X sur votre profil biomécanique (surface, gabarit, volume hebdo, articulations et objectif) pour extraire vos 3 chaussures 2026 idéales.'}
          </p>
        </div>

        {/* MODE A: 6-STEP BIOMETRIC QUIZ */}
        {quizActive && !isAnalyzing && (
          <div style={{ position: 'relative', zIndex: 2, marginTop: '1rem' }}>
            <div className={styles.quizProgressHeader}>
              <div>
                <div className={styles.hudDataLight}>SÉQUENCE_CHARGEMENT</div>
                <div className={styles.quizStepNum}>
                  ÉTAPE_{step + 1} / {QUIZ_QUESTIONS.length}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.hudDataLight}>PROGRESSION</div>
                <div className={styles.quizStepNum} style={{ color: '#ffffff' }}>
                  {Math.round(((step + 1) / QUIZ_QUESTIONS.length) * 100)}%
                </div>
              </div>
            </div>

            <div className={styles.quizSegments}>
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={`${styles.quizSegment} ${
                    idx <= step ? styles.quizSegmentActive : ''
                  }`}
                />
              ))}
            </div>

            <div className={styles.questionHeader}>
              <div className={styles.questionIconRing}>
                <CurrentQuestionIcon size={22} />
              </div>
              <h3 className={styles.questionTitle}>{QUIZ_QUESTIONS[step].question}</h3>
            </div>

            <div className={styles.optionsGrid}>
              {QUIZ_QUESTIONS[step].options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleQuizOptionSelect(option)}
                  className={styles.quizOptionBtn}
                >
                  <div className={`${styles.techCorner} ${styles.tcTl}`} style={{ width: 8, height: 8 }} />
                  <div className={`${styles.techCorner} ${styles.tcBr}`} style={{ width: 8, height: 8 }} />
                  <span className={styles.quizOptionText}>{option}</span>
                  <ChevronRight size={18} color="#fcb900" />
                </button>
              ))}
            </div>

            {step > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className={styles.detailsBtn}
                  style={{ width: 'auto', padding: '0.55rem 1rem' }}
                >
                  ← ÉTAPE PRÉCÉDENTE
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE B: DNA RADAR ANALYZING ANIMATION */}
        {quizActive && isAnalyzing && (
          <div className={styles.analyzingBox}>
            <div className={styles.dnaRadarSpinner}>
              <div className={styles.dnaSpinnerRing} />
              <Dna size={52} color="#fcb900" />
            </div>
            <h3 className={styles.questionTitle} style={{ marginBottom: '0.6rem' }}>
              ANALYSE_DNA EN COURS...
            </h3>
            <p className={styles.hudData}>
              CROISEMENT BIOMÉTRIQUE × FLUX LIVE TOP4RUNNING ({shoes.length} MODÈLES 2026)
            </p>
          </div>
        )}

        {/* MODE C: RESULTS + 11x3 EXPERT MATRIX SWITCHER */}
        {!quizActive && (
          <div>
            {/* Detected Profile Banner */}
            <div className={styles.profileBanner}>
              <div>
                <div className={styles.hudData}>PROFIL_DÉTECTÉ // SÉQUENÇAGE_TERMINÉ</div>
                <h3 className={styles.profileBannerTitle}>{activeProfile.title}</h3>
                <p className={styles.profileBannerDesc}>{activeProfile.description}</p>
              </div>
              <div className={styles.inventoryCountBadge}>
                <span className={styles.liveDot} />
                FLUX LIVE 2026 : {shoes.length} MODÈLES SYNCHRONISÉS
              </div>
            </div>

            {/* Direct 11 Profiles x 3 Levels Switcher */}
            <div className={styles.matrixControls}>
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>PROFIL (11 PROFILS) :</span>
                <select
                  aria-label="Sélectionner un des 11 profils de coureur"
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className={styles.profileSelect}
                >
                  {PROFILES.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.title} — {prof.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>NIVEAU (3 NIVEAUX) :</span>
                <div className={styles.levelPills}>
                  {(['DÉBUTANT', 'INTERMÉDIAIRE', 'PRO'] as LevelKey[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`${styles.levelPill} ${
                        selectedLevel === lvl ? styles.levelPillActive : ''
                      }`}
                    >
                      {lvl === 'DÉBUTANT'
                        ? '⚡ DÉBUTANT / LOISIR'
                        : lvl === 'INTERMÉDIAIRE'
                        ? '🔥 INTERMÉDIAIRE / RÉGULIER'
                        : '🏆 PRO / PERFORMANCE'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 RECOMMENDED SHOES */}
            <div className={styles.resultsGrid}>
              {recommendedShoes.map((shoe, idx) => (
                <article
                  key={`${shoe.id}-${idx}`}
                  className={`${styles.resultShoeCard} ${
                    idx === 0 ? styles.resultShoeCardFeatured : ''
                  }`}
                >
                  <div className={`${styles.techCorner} ${styles.tcTl}`} style={{ opacity: 0.45 }} />
                  <div className={`${styles.techCorner} ${styles.tcTr}`} style={{ opacity: 0.45 }} />
                  <div className={`${styles.techCorner} ${styles.tcBl}`} style={{ opacity: 0.45 }} />
                  <div className={`${styles.techCorner} ${styles.tcBr}`} style={{ opacity: 0.45 }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span className={styles.affinityBadge} style={{ marginBottom: 0 }}>
                      AFFINITÉ_PROFIL : {shoe.matchScore || 98 - idx * 5}%
                    </span>
                    <span
                      className={styles.hudDataLight}
                      style={{ color: '#34d399', fontSize: '0.6rem' }}
                    >
                      ● EN_STOCK
                    </span>
                  </div>

                  {/* Image Stage with Scan Line */}
                  <div
                    className={styles.shoeImageStage}
                    onClick={() => setDetailShoe(shoe)}
                    title="Voir la fiche technique complète"
                  >
                    <div className={styles.dataGridOverlay} />
                    <div
                      className={styles.scanLine}
                      style={{ animationDelay: `${idx * 0.6}s` }}
                    />
                    <img
                      src={shoe.image || '/chaussure_jaune.svg'}
                      alt={`${shoe.brand} ${shoe.name}`}
                      className={styles.shoeImg}
                      loading="lazy"
                    />
                  </div>

                  <div className={styles.shoeBrandLabel}>{shoe.brand}</div>
                  <h4 className={styles.shoeModelTitle}>{shoe.name}</h4>

                  {/* Expert Reason */}
                  <div className={styles.expertReasonBox}>
                    <div className={styles.expertReasonLabel}>ANALYSE_EXPERT :</div>
                    <p className={styles.expertReasonText}>
                      {shoe.expertReason || shoe.description}
                    </p>
                  </div>

                  {/* Weight / Drop / Price Triplet */}
                  <div className={styles.specsTriplet}>
                    <div className={styles.specCell}>
                      <div className={styles.specCellLabel}>POIDS</div>
                      <div className={styles.specCellVal}>{shoe.weight || '260g'}</div>
                    </div>
                    <div className={styles.specCell}>
                      <div className={styles.specCellLabel}>DROP</div>
                      <div className={styles.specCellVal}>{shoe.drop ?? 8}MM</div>
                    </div>
                    <div className={styles.specCellPrice}>
                      <div className={styles.specCellLabel} style={{ color: '#fcb900' }}>
                        PRIX LIVE
                      </div>
                      <div className={styles.specCellPriceVal}>
                        {shoe.price > 0 ? `${shoe.price}€` : 'VOIR'}
                      </div>
                    </div>
                  </div>

                  {/* Biomechanical Gauges */}
                  <div className={styles.gaugesBox}>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeLabel}>AMORTI</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.amorti || 85}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeLabel}>DYNAMISME</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.dynamisme || 82}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeLabel}>STABILITÉ</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.stabilite || 85}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => setDetailShoe(shoe)}
                      className={styles.detailsBtn}
                    >
                      [ DÉTAILS ]
                    </button>
                    <a
                      href={ensureTop4RunningAffiliateUrl(
                        shoe.externalUrl,
                        `${shoe.brand} ${shoe.name}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => trackAffiliateClick(shoe)}
                      className={styles.buyBtn}
                    >
                      VOIR L&apos;OFFRE <ArrowUpRight size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL LIVE INVENTORY EXPLORER (shown on /shoe-finder page) */}
      {showCatalog && (
        <div id="shoe-list" className={styles.catalogSection}>
          <div className={styles.catalogHeader}>
            <div className={styles.hudData} style={{ color: '#0f172a' }}>
              BASE_DE_DONNÉES_BIOMÉCANIQUE // TOP4RUNNING 2026
            </div>
            <h2 className={styles.catalogTitle}>SÉLECTION_DNA ({filteredCatalog.length} MODÈLES)</h2>
          </div>

          <div className={styles.searchBarContainer}>
            <div className={styles.searchBox}>
              <div className={`${styles.techCorner} ${styles.tcTl}`} />
              <div className={`${styles.techCorner} ${styles.tcTr}`} />
              <div className={`${styles.techCorner} ${styles.tcBl}`} />
              <div className={`${styles.techCorner} ${styles.tcBr}`} />
              <Search size={18} color="#fcb900" style={{ marginRight: '1rem', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="RECHERCHER UN MODÈLE 2026 (EX: CLIFTON 11, PEGASUS 42, SPEEDGOAT 7, ADIOS PRO 5)..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fcb900',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.catalogFiltersRow}>
              <select
                aria-label="Filtrer par surface"
                value={selectedSurfaceFilter}
                onChange={(e) =>
                  setSelectedSurfaceFilter(e.target.value as 'ALL' | 'ROUTE' | 'TRAIL')
                }
                className={styles.catalogSelect}
              >
                <option value="ALL">SURFACE : TOUTES ({shoes.length})</option>
                <option value="ROUTE">🛣️ ROUTE & COMPÉTITION</option>
                <option value="TRAIL">⛰️ TRAIL & ULTRA</option>
              </select>

              <select
                aria-label="Filtrer par marque"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={styles.catalogSelect}
              >
                <option value="ALL">MARQUES : TOUTES ({brandsList.length})</option>
                {brandsList.map((b) => (
                  <option key={b} value={b}>
                    {b.toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                aria-label="Trier par prix"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as 'NONE' | 'ASC' | 'DESC')}
                className={styles.catalogSelect}
              >
                <option value="NONE">TRI : DERNIÈRES VERSIONS (A-Z)</option>
                <option value="ASC">PRIX : CROISSANT (MOINS CHER)</option>
                <option value="DESC">PRIX : DÉCROISSANT</option>
              </select>

              <div className={styles.inventoryCountBadge}>
                <span className={styles.liveDot} />
                LIVE_INVENTORY : {filteredCatalog.length} UNITS
              </div>
            </div>
          </div>

          <div className={styles.catalogGrid}>
            {filteredCatalog.map((shoe) => (
              <article key={shoe.id} className={styles.resultShoeCard}>
                <div className={`${styles.techCorner} ${styles.tcTl}`} style={{ opacity: 0.3 }} />
                <div className={`${styles.techCorner} ${styles.tcTr}`} style={{ opacity: 0.3 }} />
                <div className={`${styles.techCorner} ${styles.tcBl}`} style={{ opacity: 0.3 }} />
                <div className={`${styles.techCorner} ${styles.tcBr}`} style={{ opacity: 0.3 }} />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div>
                    <div className={styles.hudDataLight} style={{ fontSize: '0.48rem' }}>
                      USAGE_CIBLE
                    </div>
                    <div className={styles.hudData} style={{ fontSize: '0.62rem' }}>
                      {shoe.usage}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.hudDataLight} style={{ fontSize: '0.48rem' }}>
                      DISPONIBILITÉ
                    </div>
                    <div
                      className={styles.hudData}
                      style={{ fontSize: '0.62rem', color: '#34d399' }}
                    >
                      EN_STOCK
                    </div>
                  </div>
                </div>

                <div
                  className={styles.shoeImageStage}
                  onClick={() => setDetailShoe(shoe)}
                >
                  <div className={styles.dataGridOverlay} />
                  <img
                    src={shoe.image || '/chaussure_jaune.svg'}
                    alt={`${shoe.brand} ${shoe.name}`}
                    className={styles.shoeImg}
                    loading="lazy"
                  />
                </div>

                <div className={styles.shoeBrandLabel}>{shoe.brand}</div>
                <h3 className={styles.shoeModelTitle}>{shoe.name}</h3>

                <div className={styles.specsTriplet}>
                  <div className={styles.specCell}>
                    <div className={styles.specCellLabel}>POIDS</div>
                    <div className={styles.specCellVal}>{shoe.weight}</div>
                  </div>
                  <div className={styles.specCell}>
                    <div className={styles.specCellLabel}>DROP</div>
                    <div className={styles.specCellVal}>{shoe.drop}MM</div>
                  </div>
                  <div className={styles.specCellPrice}>
                    <div className={styles.specCellLabel} style={{ color: '#fcb900' }}>
                      PRIX
                    </div>
                    <div className={styles.specCellPriceVal}>
                      {shoe.price > 0 ? `${shoe.price}€` : 'TBC'}
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => setDetailShoe(shoe)}
                    className={styles.detailsBtn}
                  >
                    [ DÉTAILS ]
                  </button>
                  <a
                    href={ensureTop4RunningAffiliateUrl(
                      shoe.externalUrl,
                      `${shoe.brand} ${shoe.name}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackAffiliateClick(shoe)}
                    className={styles.buyBtn}
                  >
                    ACHETER <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TECHNICAL DETAILS MODAL */}
      {detailShoe && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDetailShoe(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.techCorner} ${styles.tcTl}`} />
            <div className={`${styles.techCorner} ${styles.tcTr}`} />
            <div className={`${styles.techCorner} ${styles.tcBl}`} />
            <div className={`${styles.techCorner} ${styles.tcBr}`} />

            <button
              type="button"
              onClick={() => setDetailShoe(null)}
              className={styles.modalCloseBtn}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className={styles.modalImageCol}>
              <div className={styles.dataGridOverlay} />
              <div className={styles.scanLine} />
              <img
                src={detailShoe.image || '/chaussure_jaune.svg'}
                alt={`${detailShoe.brand} ${detailShoe.name}`}
                style={{
                  maxWidth: '88%',
                  maxHeight: '280px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.75))',
                  position: 'relative',
                  zIndex: 2,
                }}
              />
            </div>

            <div className={styles.modalInfoCol}>
              <div className={styles.hudData} style={{ marginBottom: '0.35rem' }}>
                FLUX_DONNÉES // {detailShoe.brand.toUpperCase()}
              </div>
              <h2
                className={styles.heroTitle}
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '1.5rem' }}
              >
                {detailShoe.name}
              </h2>

              <div className={styles.modalSpecsGrid}>
                <div>
                  <div className={styles.hudDataLight} style={{ fontSize: '0.52rem' }}>
                    USAGE RECOMMANDÉ
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>
                    {detailShoe.usage}
                  </div>
                </div>
                <div>
                  <div className={styles.hudDataLight} style={{ fontSize: '0.52rem' }}>
                    SYSTÈME D&apos;AMORTI
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>
                    {detailShoe.cushionType || detailShoe.cushion || 'Dynamique'}
                  </div>
                </div>
                <div>
                  <div className={styles.hudDataLight} style={{ fontSize: '0.52rem' }}>
                    PLAQUE / PROPULSION
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>
                    {detailShoe.hasPlate
                      ? (detailShoe.plateType || 'Plaque Carbone').toUpperCase()
                      : 'SANS PLAQUE (FLEXIBLE)'}
                  </div>
                </div>
                <div>
                  <div className={styles.hudDataLight} style={{ fontSize: '0.52rem' }}>
                    POIDS / DROP / PROFIL
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fcb900' }}>
                    {detailShoe.weight} • Drop {detailShoe.drop}mm ({detailShoe.stackHeight || detailShoe.stack || '36/28mm'})
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  className={styles.hudDataLight}
                  style={{ fontSize: '0.52rem', marginBottom: '0.6rem' }}
                >
                  POINTS FORTS VALIDÉS
                </div>
                <div className={styles.prosTagList} style={{ marginBottom: 0 }}>
                  {(detailShoe.pros || ['Performance validée', 'Valeur sûre']).map((p) => (
                    <span key={p} className={styles.proTag}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={ensureTop4RunningAffiliateUrl(
                  detailShoe.externalUrl,
                  `${detailShoe.brand} ${detailShoe.name}`
                )}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackAffiliateClick(detailShoe)}
                className={styles.buyBtn}
                style={{ padding: '1.1rem', fontSize: '0.85rem' }}
              >
                COMMANDER SUR TOP4RUNNING ({detailShoe.price}€) <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
