'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import styles from './EditorialHero.module.css';

const ALL_FEATURED_RACES = [
  {
    date: '2026-11-15',
    slug: 'les-10-km-dalthen-althen-des-paluds',
    name: "LES 10 KM D'ALTHEN",
    badge: '15 NOVEMBRE • ALTHEN',
    distBadge: 'FFA QUALIF • 10 KM',
    meta: '10 km et 5 km qualificatifs pour les championnats de France, parcours ultra roulant.',
    image: '/images/10kmalthen.jpg'
  },
  {
    date: '2026-10-25',
    slug: 'pernes-en-rose-pernes-les-fontaines',
    name: 'PERNES EN ROSE',
    badge: '25 OCTOBRE • PERNES',
    distBadge: 'NATURE • 10 KM & 2 KM',
    meta: '10 km chronométré et marche solidaire au profit de la Ligue contre le cancer.',
    image: '/images/pernesenrose.png'
  },
  {
    date: '2026-09-27',
    slug: 'marathon-davignon-avignon',
    name: "MARATHON D'AVIGNON",
    badge: '27 SEPTEMBRE • AVIGNON',
    distBadge: '42,2 KM & 21,1 KM',
    meta: 'Le long du Rhône et du Palais des Papes. Le grand marathon historique de Provence.',
    image: '/images/marathonavignon.jpg'
  },
  {
    date: '2026-10-04',
    slug: 'trail-de-saint-didier-saint-didier',
    name: 'TRAIL DE SAINT-DIDIER',
    badge: '4 OCTOBRE • SAINT-DIDIER',
    distBadge: 'TRAIL • 44 KM (1940D+)',
    meta: '44 km, 27 km, 14 km et 9 km à travers les collines des Monts de Vaucluse.',
    image: '/images/saintdidier.jpg'
  },
  {
    date: '2026-09-12',
    slug: 'ventoux-by-night-bedoin',
    name: 'VENTOUX BY NIGHT',
    badge: '12 SEPTEMBRE • BÉDOIN',
    distBadge: 'TRAIL NOCTURNE • 17 KM',
    meta: 'Course nocturne mythique au départ de Bédoin sur les contreforts du Géant de Provence.',
    image: '/images/ventouxbynight.png'
  },
  {
    date: '2026-09-20',
    slug: 'trail-du-ruban-dore-sault',
    name: 'TRAIL DU RUBAN DORÉ',
    badge: '20 SEPTEMBRE • SAULT',
    distBadge: 'TRAIL • 33 KM & 12 KM',
    meta: 'Au pays de la lavande à Sault avec vue imprenable sur le Mont Ventoux.',
    image: '/images/rubandore.jpg'
  },
  {
    date: '2026-09-27',
    slug: 'trail-in-ocre-gargas',
    name: 'TRAIL IN OCRE',
    badge: '27 SEPTEMBRE • GARGAS',
    distBadge: 'TRAIL • 21 KM & 13 KM',
    meta: "Une traversée unique au milieu des falaises et sables d'ocre du Luberon.",
    image: '/images/rideandtrailinocre.png'
  },
  {
    date: '2026-10-18',
    slug: 'la-rose-pontetienne-le-pontet',
    name: 'LA ROSE PONTÉTIENNE',
    badge: '18 OCTOBRE • LE PONTET',
    distBadge: 'ROUTE FFA • 10 KM & 5 KM',
    meta: '10 km et 5 km qualificatifs FFA et marche solidaire pour Octobre Rose.',
    image: '/images/rosepontétienne.png'
  },
  {
    date: '2026-11-01',
    slug: 'trail-des-monts-de-vaucluse-saumane',
    name: 'MONTS DE VAUCLUSE',
    badge: '1 NOVEMBRE • SAUMANE',
    distBadge: 'TRAIL • 50 KM (2325D+)',
    meta: 'Le grand rendez-vous automnal à Saumane au cœur des Monts de Vaucluse.',
    image: '/images/trailmontvaucluse.jpg'
  },
  {
    date: '2026-11-08',
    slug: 'trail-du-ventouret-bedoin',
    name: 'TRAIL DU VENTOURET',
    badge: '8 NOVEMBRE • BÉDOIN',
    distBadge: 'TRAIL • 36 KM & 24 KM',
    meta: 'L\'automne sauvage sur les sentiers techniques et forêts du Ventoux.',
    image: '/images/trailduventouret.jpg'
  }
];

const now = new Date();
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const FEATURED_RACES = ALL_FEATURED_RACES.filter(race => race.date >= todayStr);

const SEASON_RECORDS = [
  {
    distance: '10 km Route',
    short: '10 KM',
    men: { athlete: 'Cédric SEVIN', time: "31'41''", club: 'Grand Avignon Mistral Athlé', pace: '3\'10" / km' },
    women: { athlete: 'Clara ENTRESANGLE', time: "31'45''", club: 'AS Cavaillon', pace: '3\'11" / km' },
  },
  {
    distance: 'Semi-Marathon',
    short: 'SEMI',
    men: { athlete: 'Romain LE MOUELLIC', time: "1h09'51''", club: 'Running Orange Club 84', pace: '3\'19" / km' },
    women: { athlete: 'Vanessa BONTOUX', time: "1h25'14''", club: 'ACEP Valréas', pace: '4\'02" / km' },
  },
  {
    distance: 'Marathon',
    short: 'MARATHON',
    men: { athlete: 'Mohammed MESBAHI ACHOUR', time: "2h26'13''", club: 'Grand Avignon Mistral Athlé', pace: '3\'28" / km' },
    women: { athlete: 'Romane GIRARD', time: "3h00'48''", club: 'Athlé Vaison Ventoux', pace: '4\'17" / km' },
  },
];

export default function EditorialHero() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const scrollToCalendar = () => {
    const el = document.getElementById('calendrier');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const selectFormat = (format: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('filter-format', { detail: format }));
    }
    scrollToCalendar();
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanPrev(scrollLeft > 20);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 20);

    const cardStep = 344;
    const index = Math.min(
      Math.max(1, Math.round(scrollLeft / cardStep) + 1),
      FEATURED_RACES.length
    );
    setCurrentSlide(index);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const cardStep = 344;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -cardStep : cardStep,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.editorialWrapper}>
      <div className="container">

        {/* PANEL 1: SLATE DISCOVERY */}
        <div className={styles.panelSlate}>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroLocationTag}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              Mont Ventoux • 1 909 m
            </div>
            <div className={styles.heroSubtitle}>
              LE CALENDRIER OFFICIEL DU 84
            </div>
            <h1 className={styles.heroTitle}>
              DÉCOUVREZ <br className={styles.mobileOnlyBreak} />LE VAUCLUSE
            </h1>
          </div>

          <div className={styles.heroMiddleRow}>
            <p className={styles.heroIntroText}>
              Du sommet mythique du Mont Ventoux aux sentiers ocres du Luberon, trouvez votre prochain dossard et suivez tous les chronos de Provence.
            </p>
            <button onClick={scrollToCalendar} className={styles.pillBtn}>
              Explorer le calendrier
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className={styles.statsStrip}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>76+ COURSES</div>
              <div className={styles.statDesc}>Calendrier complet officiel et synchronisé chaque semaine.</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>27 CLUBS</div>
              <div className={styles.statDesc}>La communauté FFA et hors-stade de tout le département.</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10 000+ DOSSARDS</div>
              <div className={styles.statDesc}>Coureurs classés et fiches athlètes sur le Wall of Fame.</div>
            </div>
          </div>
        </div>

      </div>

      <div className="container">

        {/* PANEL 2: PEACH POPULAR RACES CAROUSEL (SOUS DÉCOUVREZ LE VAUCLUSE) */}
        <div className={styles.panelPeach}>
          <div className={styles.carouselSection}>
            
            {/* Left Info Column */}
            <div className={styles.carouselInfoCol}>
              <div>
                <div className={styles.carouselTag}>SÉLECTION OFFICIELLE 2026</div>
                <h2 className={styles.carouselTitle}>ÉPREUVES EN VEDETTE</h2>
                <p className={styles.carouselDesc}>
                  Les courses incontournables et emblématiques de Provence. Fiches techniques, profils de dénivelé et réservations de dossards.
                </p>
                <button onClick={scrollToCalendar} className={styles.pillBtn}>
                  Voir tout le calendrier
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Navigation Controls */}
              <div className={styles.carouselControls}>
                <button 
                  onClick={() => scroll('left')} 
                  disabled={!canPrev}
                  className={styles.carouselNavBtn}
                  aria-label="Épreuve précédente"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <span className={styles.carouselCounter}>
                  {String(currentSlide).padStart(2, '0')} / {String(FEATURED_RACES.length).padStart(2, '0')}
                </span>

                <button 
                  onClick={() => scroll('right')} 
                  disabled={!canNext}
                  className={styles.carouselNavBtn}
                  aria-label="Épreuve suivante"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Sliding Carousel Column */}
            <div className={styles.carouselTrackCol}>
              <div 
                ref={carouselRef}
                onScroll={handleScroll}
                className={styles.carouselTrack}
              >
                {FEATURED_RACES.map((race) => (
                  <Link 
                    key={race.slug} 
                    href={`/race/${race.slug}/`} 
                    className={styles.carouselCard}
                  >
                    <div 
                      className={styles.carouselCardBg}
                      style={{ backgroundImage: `url(${race.image})` }}
                    />
                    <div className={styles.carouselCardGradient} />
                    
                    <div className={styles.carouselCardTop}>
                      <span className={styles.carouselCardBadge}>{race.badge}</span>
                      <span className={styles.carouselCardDist}>{race.distBadge}</span>
                    </div>

                    <div className={styles.carouselCardBottom}>
                      <div className={styles.carouselRaceName}>{race.name}</div>
                      <div className={styles.carouselRaceMeta}>{race.meta}</div>
                      <div className={styles.carouselViewLink}>
                        Consulter la fiche <span>↗</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="container">

        {/* PANEL: RECORDS DE LA SAISON */}
        <div className={styles.panelRecords}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <div className={styles.recordsTag}>
                <span className={styles.pulseDot} />
                BILANS OFFICIELS FFA • SAISON 2026 EN COURS
              </div>
              <h2 className={styles.displayTitle}>RECORDS DE LA SAISON ACTUELLE</h2>
              <p className={styles.recordsDesc}>
                Les meilleures performances départementales sur les distances reines sur route (Hommes & Femmes).
              </p>
            </div>
            <Link href="/records?tab=chrono" className={styles.pillBtn}>
              Voir le Top 5 complet & Records
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className={styles.recordsGrid}>
            {SEASON_RECORDS.map((item) => (
              <div key={item.distance} className={styles.seasonCard}>
                <div className={styles.seasonCardHeader}>
                  <span className={styles.seasonDistBadge}>
                    <Zap size={15} color="#c05621" />
                    {item.distance}
                  </span>
                  <Link href="/records?tab=chrono" className={styles.seasonCardLink}>
                    Top 5 FFA ↗
                  </Link>
                </div>

                <div className={styles.seasonPerformances}>
                  {/* Homme */}
                  <div className={styles.perfRow}>
                    <div className={styles.genderIconM}>H</div>
                    <div className={styles.perfDetails}>
                      <div className={styles.perfTop}>
                        <span className={styles.perfAthlete}>{item.men.athlete}</span>
                        <span className={styles.perfTime}>{item.men.time}</span>
                      </div>
                      <div className={styles.perfBottom}>
                        <span className={styles.perfClub}>{item.men.club}</span>
                        <span className={styles.perfPace}>{item.men.pace}</span>
                      </div>
                    </div>
                  </div>

                  {/* Femme */}
                  <div className={styles.perfRow}>
                    <div className={styles.genderIconF}>F</div>
                    <div className={styles.perfDetails}>
                      <div className={styles.perfTop}>
                        <span className={styles.perfAthlete}>{item.women.athlete}</span>
                        <span className={styles.perfTime}>{item.women.time}</span>
                      </div>
                      <div className={styles.perfBottom}>
                        <span className={styles.perfClub}>{item.women.club}</span>
                        <span className={styles.perfPace}>{item.women.pace}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="container">

        {/* PANEL 3: VANILLA FORMATS */}
        <div className={styles.panelVanilla}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.displayTitle}>NOS COURSES PAR FORMAT</h2>
            </div>
            <button onClick={() => selectFormat('all')} className={styles.pillBtn}>
              Voir toutes les épreuves
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className={styles.categoryCardsGrid}>
            {/* CATEGORY 01 */}
            <div onClick={() => selectFormat('Trail')} className={styles.catCard}>
              <div 
                className={styles.catCardImg}
                style={{ backgroundImage: 'url("/images/hero-ventoux-trail.jpg")' }}
              />
              <div className={styles.catCardBody}>
                <div className={styles.catNum}>01</div>
                <div className={styles.catTitle}>
                  Trail <span>↗</span>
                </div>
                <div className={styles.catDesc}>
                  Du 8 km aux ultras jusqu&apos;au format 100M dans les Dentelles, le Mont Ventoux et le Luberon.
                </div>
              </div>
            </div>

            {/* CATEGORY 02 */}
            <div onClick={() => selectFormat('Course nature')} className={styles.catCard}>
              <div 
                className={styles.catCardImg}
                style={{ backgroundImage: 'url("/images/hero-ventoux-vignoble.jpg")' }}
              />
              <div className={styles.catCardBody}>
                <div className={styles.catNum}>02</div>
                <div className={styles.catTitle}>
                  Course nature <span>↗</span>
                </div>
                <div className={styles.catDesc}>
                  Sentiers de sous-bois, chemins de vignobles et parcours vallonnés au cœur d&apos;une nature préservée.
                </div>
              </div>
            </div>

            {/* CATEGORY 03 */}
            <div onClick={() => selectFormat('Course sur route FFA')} className={styles.catCard}>
              <div 
                className={styles.catCardImg}
                style={{ backgroundImage: 'url("/images/route-ffa.jpg")' }}
              />
              <div className={styles.catCardBody}>
                <div className={styles.catNum}>03</div>
                <div className={styles.catTitle}>
                  Course sur route FFA <span>↗</span>
                </div>
                <div className={styles.catDesc}>
                  Parcours roulants, marathons historiques et courses qualificatives pour les championnats de France.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
