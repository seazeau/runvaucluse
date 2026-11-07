'use client';

import React, { useState, useEffect, useMemo } from 'react';
import shoesData from '@/data/shoes.json';
import configData from '@/data/shoeFinderConfig.json';
import styles from './ShoeFinder.module.css';
import {
  Sparkles,
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
    question: 'Sur quel terrain courez-vous principalement ?',
    options: [
      { value: 'ROUTE', label: '🛣️ Route & Bitume' },
      { value: 'MIXTE', label: '🌲 Chemins & Mixte' },
      { value: 'TRAIL', label: '⛰️ Trail & Montagne' },
    ],
    icon: Target,
  },
  {
    id: 'weight',
    question: 'Quel est votre gabarit ?',
    options: [
      { value: '< 75KG', label: 'Moins de 75 kg' },
      { value: '75-85KG', label: '75 à 85 kg' },
      { value: '> 85KG', label: 'Plus de 85 kg' },
    ],
    icon: Activity,
  },
  {
    id: 'experience',
    question: 'Quel est votre niveau de pratique ?',
    options: [
      { value: 'DÉBUTANT', label: '🌱 Débutant / Loisir' },
      { value: 'INTERMÉDIAIRE', label: '🏃 Régulier / Confirmé' },
      { value: 'PRO', label: '⚡ Compétiteur / Intensif' },
    ],
    icon: Award,
  },
  {
    id: 'volume',
    question: 'Quelle est votre distance hebdomadaire ?',
    options: [
      { value: '< 20KM', label: 'Moins de 20 km / sem' },
      { value: '20-50KM', label: '20 à 50 km / sem' },
      { value: '> 50KM', label: 'Plus de 50 km / sem' },
    ],
    icon: TrendingUp,
  },
  {
    id: 'injury',
    question: 'Avez-vous une sensibilité particulière ?',
    options: [
      { value: 'AUCUNE', label: 'Aucune fragilité' },
      { value: 'ARTICULATIONS', label: 'Genoux / Articulations' },
      { value: 'PIEDS', label: 'Pieds / Tendons' },
    ],
    icon: Shield,
  },
  {
    id: 'priority',
    question: 'Quel est votre objectif prioritaire ?',
    options: [
      { value: 'VITESSE', label: '🏁 Vitesse & Chrono' },
      { value: 'CONFORT', label: '☁️ Confort & Plaisir' },
      { value: 'PROTECTION', label: '🛡️ Protection & Stabilité' },
      { value: 'POLYVALENCE', label: '🔄 Polyvalence (Tout-en-un)' },
    ],
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

function detectInitialProfileForRace(
  raceType?: string,
  raceName?: string,
  raceDistances?: string
): {
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
    if (
      hay.includes('ultra') ||
      hay.includes('42') ||
      hay.includes('50') ||
      hay.includes('60') ||
      hay.includes('80')
    ) {
      return { profileId: 'ultra', terrain: 'TRAIL' };
    }
    return { profileId: 'trail-poly', terrain: 'TRAIL' };
  }
  if (
    hay.includes('nature') ||
    hay.includes('chemin') ||
    hay.includes('vigne') ||
    hay.includes('cross')
  ) {
    return { profileId: 'trail-poly', terrain: 'MIXTE' };
  }
  if (
    hay.includes('marathon') ||
    hay.includes('semi') ||
    hay.includes('10 km') ||
    hay.includes('10km')
  ) {
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
      const id =
        getTag(itemXml, 'itemgroup_id') ||
        getTag(itemXml, 'item_id') ||
        `${manufacturer}-${modelKey}`;

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
          spec.expertVibe ||
          `Expertise RunVaucluse : ${spec.usage || 'Running'} • Amorti ${spec.cushion || 'Pro'}.`,
        expertVibe: spec.expertVibe,
        pros: spec.pros || ['Performance validée', 'Valeur sûre'],
        cons: spec.cons || [],
        _penalty: penalty,
      });
    }

    if (matched.length === 0) return fallbackShoes;

    // Rule: Always sort by name descending to favor latest model versions
    matched.sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
    );

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
          externalUrl: ensureTop4RunningAffiliateUrl(
            match.externalUrl,
            `${match.brand} ${match.name}`
          ),
          expertReason: rec.why,
          matchScore: 98 - idx * 4,
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
        pros: ['Sélection Coach', 'Dernière Génération'],
        matchScore: 95 - idx * 4,
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
      const matchedProf = computeProfileFromAnswers(nextAnswers);
      setSelectedProfileId(matchedProf.id);
      if (nextAnswers.experience) {
        setSelectedLevel(nextAnswers.experience as LevelKey);
      }
      setQuizActive(false);
    }
  };

  const startDiagnostic = () => {
    setStep(0);
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
      className={styles.finderWrapper}
      aria-label="Conseiller Chaussures Running & Trail RunVaucluse"
    >
      <div className={styles.mainContainer}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.badgeGroup}>
            <span className={styles.sunBadge}>
              <Sparkles size={13} /> CONSEILLER CHAUSSURES 2026 • 11 PROFILS × 3 NIVEAUX
            </span>
            {raceName && (
              <span className={styles.raceBadge}>
                <Compass size={13} /> Spécial {raceName}
              </span>
            )}
          </div>

          {quizActive ? (
            <button
              type="button"
              onClick={() => setQuizActive(false)}
              className={styles.modeBtn}
            >
              <SlidersHorizontal size={14} /> Voir la sélection par profil
            </button>
          ) : (
            <button
              type="button"
              onClick={startDiagnostic}
              className={styles.modeBtn}
            >
              <RotateCcw size={14} /> Faire le test en 6 questions
            </button>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className={styles.headerBlock}>
          <h2 className={styles.mainTitle}>
            {raceName ? (
              <>
                QUELLES CHAUSSURES POUR{' '}
                <span className={styles.mainTitleAccent}>{raceName} ?</span>
              </>
            ) : (
              <>
                TROUVEZ VOS 3 PAIRES{' '}
                <span className={styles.mainTitleAccent}>IDÉALES EN 30 SECONDES</span>
              </>
            )}
          </h2>
          <p className={styles.subTitle}>
            {raceName
              ? `Sélection calibrée pour le terrain de l'épreuve (${raceType || 'Course'}${
                  raceDistances ? ` • ${raceDistances}` : ''
                }), mise à jour avec les derniers modèles 2026 sur Top4Running.`
              : 'Sélectionnez directement votre profil parmi nos 11 profils types (Débutant, Régulier, Pro) ou répondez à 6 questions rapides pour obtenir votre recommandation sur-mesure.'}
          </p>
        </div>

        {/* MODE A: 6-QUESTION RUNNER DIAGNOSTIC */}
        {quizActive && (
          <div className={styles.quizBox}>
            <div className={styles.quizHeaderRow}>
              <span className={styles.quizStepLabel}>
                Question {step + 1} sur {QUIZ_QUESTIONS.length}
              </span>
              <span className={styles.quizPctLabel}>
                {Math.round(((step + 1) / QUIZ_QUESTIONS.length) * 100)}% complété
              </span>
            </div>

            <div className={styles.progressTrack}>
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={`${styles.progressSegment} ${
                    idx <= step ? styles.progressSegmentActive : ''
                  }`}
                />
              ))}
            </div>

            <div className={styles.questionTitleRow}>
              <div className={styles.questionIconCircle}>
                <CurrentQuestionIcon size={20} />
              </div>
              <h3 className={styles.questionHeading}>{QUIZ_QUESTIONS[step].question}</h3>
            </div>

            <div className={styles.optionsGrid}>
              {QUIZ_QUESTIONS[step].options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleQuizOptionSelect(option.value)}
                  className={styles.optionCardBtn}
                >
                  <span>{option.label}</span>
                  <ChevronRight size={18} color="#ea580c" />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={styles.backStepBtn}
              >
                ← Revenir à la question précédente
              </button>
            )}
          </div>
        )}

        {/* MODE B: RESULTS + 11 PROFILES x 3 LEVELS SELECTOR */}
        {!quizActive && (
          <div>
            {/* Active Profile Banner */}
            <div className={styles.profileBanner}>
              <div>
                <div className={styles.profileLabelSmall}>Profil sélectionné</div>
                <h3 className={styles.profileTitle}>{activeProfile.title}</h3>
                <p className={styles.profileDesc}>{activeProfile.description}</p>
              </div>
              <span className={styles.sunBadge} style={{ background: '#ffffff' }}>
                ✓ {shoes.length} modèles 2026 synchronisés
              </span>
            </div>

            {/* 11 Profiles x 3 Levels Filter Bar */}
            <div className={styles.controlsBar}>
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>1. Votre profil :</span>
                <select
                  aria-label="Choisir parmi les 11 profils de coureur"
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
                <span className={styles.controlLabel}>2. Votre niveau :</span>
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
                        ? '🌱 Débutant / Loisir'
                        : lvl === 'INTERMÉDIAIRE'
                        ? '🏃 Intermédiaire / Régulier'
                        : '⚡ Pro / Compétition'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Recommended Shoes */}
            <div className={styles.resultsGrid}>
              {recommendedShoes.map((shoe, idx) => (
                <article
                  key={`${shoe.id}-${idx}`}
                  className={`${styles.shoeCard} ${
                    idx === 0 ? styles.shoeCardFeatured : ''
                  }`}
                >
                  <div className={styles.cardTopMeta}>
                    <span
                      className={`${styles.matchBadge} ${
                        idx === 0 ? styles.matchBadgeFeatured : ''
                      }`}
                    >
                      {idx === 0
                        ? `★ Choix #1 (${shoe.matchScore || 98}%)`
                        : `Affinité ${shoe.matchScore || 94 - idx * 4}%`}
                    </span>
                    <span className={styles.stockTag}>● En stock</span>
                  </div>

                  <div
                    className={styles.imageBox}
                    onClick={() => setDetailShoe(shoe)}
                    title="Voir la fiche détaillée"
                  >
                    <img
                      src={shoe.image || '/chaussure_jaune.svg'}
                      alt={`${shoe.brand} ${shoe.name}`}
                      className={styles.shoeImg}
                      loading="lazy"
                    />
                  </div>

                  <div className={styles.brandLabel}>{shoe.brand}</div>
                  <h4 className={styles.shoeTitle}>{shoe.name}</h4>

                  <div className={styles.coachAdviceBox}>
                    <div className={styles.coachAdviceLabel}>L&apos;avis du coach :</div>
                    <p className={styles.coachAdviceText}>
                      {shoe.expertReason || shoe.description}
                    </p>
                  </div>

                  <div className={styles.specsRow}>
                    <div className={styles.specPill}>
                      <div className={styles.specLabel}>Poids</div>
                      <div className={styles.specValue}>{shoe.weight || '260g'}</div>
                    </div>
                    <div className={styles.specPill}>
                      <div className={styles.specLabel}>Drop</div>
                      <div className={styles.specValue}>{shoe.drop ?? 8} mm</div>
                    </div>
                    <div className={styles.specPillPrice}>
                      <div className={styles.specLabel}>Meilleur prix</div>
                      <div className={styles.specValue}>
                        {shoe.price > 0 ? `${shoe.price} €` : 'Voir'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.gaugesGroup}>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeName}>Amorti</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.amorti || 85}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeName}>Dynamisme</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.dynamisme || 82}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.gaugeRow}>
                      <span className={styles.gaugeName}>Stabilité</span>
                      <div className={styles.gaugeTrack}>
                        <div
                          className={styles.gaugeFill}
                          style={{ width: `${shoe.stabilite || 85}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => setDetailShoe(shoe)}
                      className={styles.detailsBtn}
                    >
                      Fiche complète
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
                      Voir l&apos;offre <ArrowUpRight size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL 2026 CATALOG EXPLORER (shown on /shoe-finder page) */}
      {showCatalog && (
        <div id="shoe-list" className={styles.catalogSection}>
          <div className={styles.catalogHeader}>
            <span className={styles.sunBadge}>CATALOGUE COMPLET 2026</span>
            <h2 className={styles.catalogTitle}>
              EXPLORER LES {filteredCatalog.length} MODÈLES DE RÉFÉRENCE
            </h2>
            <p className={styles.subTitle} style={{ margin: '0 auto' }}>
              Comparez les dernières versions sorties (poids, drop, plaque carbone et tarifs en direct chez notre partenaire Top4Running).
            </p>
          </div>

          <div className={styles.catalogFilterPanel}>
            <div className={styles.searchBar}>
              <Search size={18} color="#5E6973" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle ou une marque (ex: Clifton 11, Pegasus 42, Speedgoat 7, Adios Pro 5)..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6973' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.catalogSelectRow}>
              <div className={styles.catalogSelectGroup}>
                <select
                  aria-label="Filtrer par terrain"
                  value={selectedSurfaceFilter}
                  onChange={(e) =>
                    setSelectedSurfaceFilter(e.target.value as 'ALL' | 'ROUTE' | 'TRAIL')
                  }
                  className={styles.catalogSelect}
                >
                  <option value="ALL">Tous les terrains ({shoes.length})</option>
                  <option value="ROUTE">🛣️ Route & Compétition</option>
                  <option value="TRAIL">⛰️ Trail & Chemins</option>
                </select>

                <select
                  aria-label="Filtrer par marque"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className={styles.catalogSelect}
                >
                  <option value="ALL">Toutes les marques ({brandsList.length})</option>
                  {brandsList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Trier par prix"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as 'NONE' | 'ASC' | 'DESC')}
                  className={styles.catalogSelect}
                >
                  <option value="NONE">Tri : Dernières versions</option>
                  <option value="ASC">Prix : du - cher au + cher</option>
                  <option value="DESC">Prix : du + cher au - cher</option>
                </select>
              </div>

              <span className={styles.sunBadge}>
                {filteredCatalog.length} modèles affichés
              </span>
            </div>
          </div>

          <div className={styles.catalogGrid}>
            {filteredCatalog.map((shoe) => (
              <article key={shoe.id} className={styles.shoeCard}>
                <div className={styles.cardTopMeta}>
                  <span className={styles.matchBadge}>{shoe.usage}</span>
                  <span className={styles.stockTag}>● En stock</span>
                </div>

                <div
                  className={styles.imageBox}
                  onClick={() => setDetailShoe(shoe)}
                >
                  <img
                    src={shoe.image || '/chaussure_jaune.svg'}
                    alt={`${shoe.brand} ${shoe.name}`}
                    className={styles.shoeImg}
                    loading="lazy"
                  />
                </div>

                <div className={styles.brandLabel}>{shoe.brand}</div>
                <h3 className={styles.shoeTitle}>{shoe.name}</h3>

                <div className={styles.specsRow}>
                  <div className={styles.specPill}>
                    <div className={styles.specLabel}>Poids</div>
                    <div className={styles.specValue}>{shoe.weight}</div>
                  </div>
                  <div className={styles.specPill}>
                    <div className={styles.specLabel}>Drop</div>
                    <div className={styles.specValue}>{shoe.drop} mm</div>
                  </div>
                  <div className={styles.specPillPrice}>
                    <div className={styles.specLabel}>Prix</div>
                    <div className={styles.specValue}>
                      {shoe.price > 0 ? `${shoe.price} €` : 'Voir'}
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => setDetailShoe(shoe)}
                    className={styles.detailsBtn}
                  >
                    Détails
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
                    Voir l&apos;offre <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FICHE TECHNIQUE */}
      {detailShoe && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDetailShoe(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setDetailShoe(null)}
              className={styles.modalCloseBtn}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className={styles.modalImageSide}>
              <img
                src={detailShoe.image || '/chaussure_jaune.svg'}
                alt={`${detailShoe.brand} ${detailShoe.name}`}
                style={{
                  maxWidth: '88%',
                  maxHeight: '260px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 28px rgba(17,20,23,0.16))',
                }}
              />
            </div>

            <div className={styles.modalContentSide}>
              <div className={styles.brandLabel}>{detailShoe.brand}</div>
              <h2 className={styles.mainTitle} style={{ fontSize: '2.4rem', marginBottom: '1.25rem' }}>
                {detailShoe.name}
              </h2>

              <div className={styles.modalSpecsGrid}>
                <div>
                  <div className={styles.specLabel}>Usage idéal</div>
                  <div className={styles.specValue}>{detailShoe.usage}</div>
                </div>
                <div>
                  <div className={styles.specLabel}>Type d&apos;amorti</div>
                  <div className={styles.specValue}>
                    {detailShoe.cushionType || detailShoe.cushion || 'Dynamique'}
                  </div>
                </div>
                <div>
                  <div className={styles.specLabel}>Plaque de propulsion</div>
                  <div className={styles.specValue}>
                    {detailShoe.hasPlate
                      ? detailShoe.plateType || 'Plaque Carbone'
                      : 'Sans plaque (souple)'}
                  </div>
                </div>
                <div>
                  <div className={styles.specLabel}>Poids / Drop / Profil</div>
                  <div className={styles.specValue}>
                    {detailShoe.weight} • Drop {detailShoe.drop} mm (
                    {detailShoe.stackHeight || detailShoe.stack || '36/28mm'})
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div className={styles.specLabel} style={{ marginBottom: '0.5rem' }}>
                  Points forts du modèle
                </div>
                <div className={styles.prosList} style={{ marginBottom: 0 }}>
                  {(detailShoe.pros || ['Performance validée', 'Valeur sûre']).map((p) => (
                    <span key={p} className={styles.proBadge}>
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
                style={{ padding: '1rem', fontSize: '0.88rem', marginTop: 'auto' }}
              >
                Commander sur Top4Running ({detailShoe.price} €) <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
