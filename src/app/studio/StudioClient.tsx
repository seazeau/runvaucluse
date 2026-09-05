'use client';

import { useState, useRef, useEffect } from 'react';
import { Race } from '@/lib/types';
import { 
  Download, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trophy, 
  Sparkles, 
  MapPin, 
  Timer, 
  Zap, 
  Bookmark,
  Share2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import LogoIcon from '@/components/LogoIcon';
import styles from './studio.module.css';

interface LatestWinnerRace {
  slug: string;
  name: string;
  date: string;
  city: string;
  image_url?: string;
  distances?: string;
  type?: string;
  winners: {
    name: string;
    event_name: string;
    time: string;
    club: string | null;
    rank_sex: string;
    rank_overall: number;
  }[];
}

interface Props {
  races: Race[];
  latestWinners: LatestWinnerRace[];
}

export default function StudioClient({ races, latestWinners }: Props) {
  const [mode, setMode] = useState<'weekend' | 'podiums' | 'story'>('weekend');
  
  // Weekend Carrousel State
  const [selectedRaceSlugs, setSelectedRaceSlugs] = useState<string[]>(() => {
    // Default to the first 4 races from September 2026
    return races.slice(0, 4).map(r => r.slug);
  });
  const [weekendTitle, setWeekendTitle] = useState('LES DOSSARDS DU WEEK-END');
  const [weekendDates, setWeekendDates] = useState('SAMEDI 12 & DIMANCHE 13 SEPTEMBRE');

  // Podiums Carrousel State
  const [selectedResultSlug, setSelectedResultSlug] = useState<string>(
    latestWinners[0]?.slug || ''
  );

  // Story State
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>(
    races[0]?.slug || ''
  );

  // Carousel Pagination State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Reset slide index when changing mode
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [mode, selectedResultSlug, selectedStorySlug]);

  // Selected races for Weekend Mode
  const selectedRaces = races.filter(r => selectedRaceSlugs.includes(r.slug));
  
  // Selected race for Podiums Mode
  const activePodiumRace = latestWinners.find(r => r.slug === selectedResultSlug) || latestWinners[0];

  // Selected race for Story Mode
  const activeStoryRace = races.find(r => r.slug === selectedStorySlug) || races[0];

  // Calculate total slides based on mode
  let totalSlides = 1;
  if (mode === 'weekend') {
    totalSlides = 1 + selectedRaces.length + 1; // Cover + races + CTA
  } else if (mode === 'podiums') {
    // Group winners by event_name
    const eventGroups: { [key: string]: typeof activePodiumRace.winners } = {};
    activePodiumRace?.winners.forEach(w => {
      if (!eventGroups[w.event_name]) eventGroups[w.event_name] = [];
      eventGroups[w.event_name].push(w);
    });
    const eventCount = Object.keys(eventGroups).length;
    totalSlides = 1 + (eventCount > 0 ? eventCount : 1) + 1;
  } else if (mode === 'story') {
    totalSlides = 1;
  }

  // Toggle race selection in Weekend Mode
  const toggleRace = (slug: string) => {
    setSelectedRaceSlugs(prev => {
      if (prev.includes(slug)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(s => s !== slug);
      } else {
        if (prev.length >= 6) return prev; // Limit to 6
        return [...prev, slug];
      }
    });
  };

  // Download active slide as PNG
  const downloadCurrentSlide = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, { 
        cacheBust: true, 
        pixelRatio: 2 
      });
      const link = document.createElement('a');
      link.download = `runvaucluse-${mode}-slide-${activeSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download all slides in sequence
  const downloadAllSlides = async () => {
    setIsExporting(true);
    const originalIndex = activeSlideIndex;
    try {
      for (let i = 0; i < totalSlides; i++) {
        setActiveSlideIndex(i);
        // Small delay to allow state and DOM update
        await new Promise(res => setTimeout(res, 250));
        if (canvasRef.current) {
          const dataUrl = await toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 });
          const link = document.createElement('a');
          link.download = `runvaucluse-${mode}-slide-${i + 1}.png`;
          link.href = dataUrl;
          link.click();
          await new Promise(res => setTimeout(res, 200));
        }
      }
    } catch (err) {
      console.error('Batch export failed:', err);
    } finally {
      setActiveSlideIndex(originalIndex);
      setIsExporting(false);
    }
  };

  // Generate Instagram Caption
  const generateCaption = () => {
    if (mode === 'weekend') {
      const raceLines = selectedRaces
        .map(r => `📍 ${r.name.toUpperCase()} (${r.city}) • ${r.distances}`)
        .join('\n');
      return `🏃‍♂️ LE MENU DU WEEK-END EN VAUCLUSE !\n\nPrêt à épingler votre dossard ce week-end ? Voici les épreuves au programme dans le 84 :\n\n${raceLines}\n\n👉 Retrouvez les parcours détaillés, les profils de dénivelé et les liens d'inscriptions officiels sur le lien en bio ou sur WWW.RUNVAUCLUSE.FR !\n\n💾 Enregistrez ce post pour ne rien oublier ce week-end !\n\n#runvaucluse #runningvaucluse #trailvaucluse #montventoux #trailventoux #vaucluse #provence #stravafrance #calendriercourses #runningfrance`;
    } else if (mode === 'podiums') {
      const winnerLines = activePodiumRace?.winners.slice(0, 4)
        .map(w => `🥇 ${w.name} (${w.event_name}) en ${w.time}${w.club ? ' - ' + w.club : ''}`)
        .join('\n');
      return `🏆 LES RÉSULTATS DU WEEK-END // ${activePodiumRace?.name.toUpperCase()}\n\nBravo à tous les finishers de cette magnifique édition à ${activePodiumRace?.city} !\n\nFélicitations aux vainqueurs du jour :\n${winnerLines}\n\n📊 Tous les résultats officiels, chronos, allures et fiches coureurs complètes sont en ligne sur :\n👉 WWW.RUNVAUCLUSE.FR/RESULTATS\n\nIdentifiez vos potes finishers en commentaire ! 👇\n\n#runvaucluse #resultatsrunning #runningvaucluse #trailvaucluse #podium #finisher #vaucluse`;
    } else {
      return `⚡ J - 7 AVANT LE DÉPART : ${activeStoryRace.name.toUpperCase()} !\n\nLes inscriptions approchent de la clôture à ${activeStoryRace.city}. Format : ${activeStoryRace.distances}.\n\n👉 Réservez votre dossard directement sur RUNVAUCLUSE.FR (Lien en bio) !\n\n#runvaucluse #courseapied #${activeStoryRace.city.toLowerCase().replace(/[^a-z]/g, '')}`;
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Group winners for active podium race
  const podiumEvents = (() => {
    if (!activePodiumRace) return [];
    const groups: { [key: string]: typeof activePodiumRace.winners } = {};
    activePodiumRace.winners.forEach(w => {
      if (!groups[w.event_name]) groups[w.event_name] = [];
      groups[w.event_name].push(w);
    });
    return Object.entries(groups);
  })();

  return (
    <div className={styles.studioWrapper}>
      <div className={styles.studioContainer}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <span className={styles.badgeTag}>
                <Sparkles size={14} /> STUDIO CRÉATIF OFFICIEL
              </span>
              <h1 className={styles.title}>INSTAGRAM CONTENT STUDIO</h1>
              <p className={styles.subtitle}>
                Générez en 1 clic vos Carrousels (4:5) et Stories (9:16) prêts à publier pour @runvaucluse.fr
              </p>
            </div>
          </div>

          {/* Format Tabs */}
          <div className={styles.tabsBar}>
            <button 
              className={`${styles.tabBtn} ${mode === 'weekend' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('weekend'); setActiveSlideIndex(0); }}
            >
              <Calendar size={18} /> Carrousel "Menu du Week-end"
            </button>
            <button 
              className={`${styles.tabBtn} ${mode === 'podiums' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('podiums'); setActiveSlideIndex(0); }}
            >
              <Trophy size={18} /> Carrousel "Podiums & Résultats"
            </button>
            <button 
              className={`${styles.tabBtn} ${mode === 'story' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('story'); setActiveSlideIndex(0); }}
            >
              <Zap size={18} /> Story "Focus Course J-7"
            </button>
          </div>
        </header>

        {/* Studio Layout */}
        <div className={styles.studioLayout}>
          
          {/* Controls Sidebar */}
          <div className={styles.controlsCard}>
            
            {/* WEEKEND MODE CONTROLS */}
            {mode === 'weekend' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Calendar size={18} /> Configuration du Week-end
                </h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Titre de la Couverture</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={weekendTitle}
                    onChange={(e) => setWeekendTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Dates affichées</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={weekendDates}
                    onChange={(e) => setWeekendDates(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Sélectionner les courses ({selectedRaceSlugs.length}/6 max)
                  </label>
                  <div className={styles.raceChecklist}>
                    {races.map(race => (
                      <label key={race.slug} className={styles.raceCheckItem}>
                        <input 
                          type="checkbox" 
                          checked={selectedRaceSlugs.includes(race.slug)}
                          onChange={() => toggleRace(race.slug)}
                        />
                        <span>
                          <strong>{race.name}</strong> ({race.city})<br/>
                          <small style={{ color: '#888' }}>{race.date} • {race.distances}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* PODIUMS MODE CONTROLS */}
            {mode === 'podiums' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Trophy size={18} /> Sélection des Résultats
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Course récemment courue</label>
                  <select 
                    className={styles.selectInput}
                    value={selectedResultSlug}
                    onChange={(e) => setSelectedResultSlug(e.target.value)}
                  >
                    {latestWinners.map(race => (
                      <option key={race.slug} value={race.slug}>
                        {race.name} ({race.city}) — {race.date}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* STORY MODE CONTROLS */}
            {mode === 'story' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Zap size={18} /> Épreuve en Vedette
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Choisir la course</label>
                  <select 
                    className={styles.selectInput}
                    value={selectedStorySlug}
                    onChange={(e) => setSelectedStorySlug(e.target.value)}
                  >
                    {races.map(race => (
                      <option key={race.slug} value={race.slug}>
                        {race.name} ({race.city}) — {race.date}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Export Buttons */}
            <div className={styles.exportBtns}>
              <button 
                onClick={downloadCurrentSlide} 
                className={styles.primaryBtn}
                disabled={isExporting}
              >
                <Download size={18} /> {isExporting ? 'EXPORT EN COURS...' : 'TÉLÉCHARGER CETTE SLIDE (HD)'}
              </button>

              {mode !== 'story' && (
                <button 
                  onClick={downloadAllSlides} 
                  className={styles.secondaryBtn}
                  disabled={isExporting}
                >
                  <Share2 size={18} /> TÉLÉCHARGER LE CARROUSEL ENTIER ({totalSlides} SLIDES)
                </button>
              )}
            </div>

            {/* Caption Generator Box */}
            <div className={styles.captionBox}>
              <div className={styles.captionHeader}>
                <span className={styles.label} style={{ margin: 0 }}>Légende Instagram</span>
                <button onClick={copyCaption} className={styles.copyBtn}>
                  {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCaption ? 'COPIÉ !' : 'COPIER'}
                </button>
              </div>
              <textarea 
                className={styles.captionTextarea}
                readOnly
                value={generateCaption()}
              />
            </div>

          </div>

          {/* Canvas Preview Area */}
          <div className={styles.previewArea}>
            
            {/* Pagination Controls */}
            {mode !== 'story' && (
              <div className={styles.carouselPagination}>
                <button 
                  onClick={() => setActiveSlideIndex(p => Math.max(0, p - 1))}
                  disabled={activeSlideIndex === 0}
                  className={styles.navArrowBtn}
                  aria-label="Slide précédente"
                >
                  <ChevronLeft size={22} />
                </button>

                <span className={styles.slideCounter}>
                  SLIDE {activeSlideIndex + 1} / {totalSlides}
                </span>

                <button 
                  onClick={() => setActiveSlideIndex(p => Math.min(totalSlides - 1, p + 1))}
                  disabled={activeSlideIndex === totalSlides - 1}
                  className={styles.navArrowBtn}
                  aria-label="Slide suivante"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            )}

            {/* ACTUAL RENDERED CANVAS */}
            <div className={`${styles.canvasViewport} ${mode === 'story' ? styles.canvasViewportStory : ''}`}>
              <div 
                ref={canvasRef} 
                className={`${styles.slideCanvas} ${mode === 'story' ? styles.slideCanvasStory : ''}`}
              >

                {/* =========================================================
                    MODE 1: WEEKEND CAROUSEL SLIDES
                   ========================================================= */}
                {mode === 'weekend' && (
                  <>
                    {/* SLIDE 0: COVER */}
                    {activeSlideIndex === 0 && (
                      <>
                        <div 
                          className={styles.coverBackground}
                          style={{ backgroundImage: 'url(/images/sommet-ventoux-1080p.jpg)' }}
                        />
                        <div className={styles.coverGradient} />
                        
                        <div className={styles.coverContent}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={32} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>OFFICIEL 84</span>
                          </div>

                          <div>
                            <div className={styles.coverSubtitle}>
                              <Calendar size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                              {weekendDates}
                            </div>
                            <h2 className={styles.coverMainTitle}>{weekendTitle}</h2>
                            <div className={styles.coverTeaserPill}>
                              {selectedRaces.length} COURSES À VENIR CE WEEK-END
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>CALENDRIER DES ÉPREUVES</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* SLIDES 1..N: INDIVIDUAL RACE */}
                    {activeSlideIndex > 0 && activeSlideIndex <= selectedRaces.length && (() => {
                      const race = selectedRaces[activeSlideIndex - 1];
                      return (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={24} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>
                              {race.type.toUpperCase() || 'COURSE'}
                            </span>
                          </div>

                          <div className={styles.raceCardPosterBox}>
                            <img 
                              src={race.image_url || '/images/hero-ventoux-trail.jpg'} 
                              alt={race.name}
                              className={styles.racePosterImg}
                            />
                          </div>

                          <div className={styles.raceSlideInfo}>
                            <div className={styles.raceSlideMetaRow}>
                              <Calendar size={14} />
                              {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </div>

                            <h3 className={styles.raceSlideName}>{race.name}</h3>

                            <div className={styles.raceSlideCity}>
                              <MapPin size={15} /> {race.city} • VAUCLUSE
                            </div>

                            <div className={styles.raceSlideDistances} style={{ marginTop: '0.75rem' }}>
                              {race.distances.split(',').map((dist, idx) => (
                                <span key={idx} className={styles.raceSlideDistPill}>
                                  {dist.trim()}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>DOSSARDS & INFOS : RUNVAUCLUSE.FR</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SLIDE FINAL: CTA */}
                    {activeSlideIndex === selectedRaces.length + 1 && (
                      <div className={styles.outroCard}>
                        <LogoIcon size={52} />
                        <h2 className={styles.outroBigTitle}>
                          PRÊT À ÉPINGLER TON DOSSARD ?
                        </h2>
                        <p className={styles.outroDesc}>
                          Retrouvez tous les parcours, dénivelés, horaires et liens d'inscriptions officiels sur :
                        </p>
                        <div className={styles.outroUrlPill}>
                          RUNVAUCLUSE.FR
                        </div>
                        <div className={styles.savePostReminder}>
                          <Bookmark size={18} /> Enregistre ce post pour ton week-end !
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* =========================================================
                    MODE 2: PODIUMS & RESULTATS CAROUSEL SLIDES
                   ========================================================= */}
                {mode === 'podiums' && (
                  <>
                    {/* SLIDE 0: COVER */}
                    {activeSlideIndex === 0 && (
                      <>
                        <div 
                          className={styles.coverBackground}
                          style={{ backgroundImage: `url(${activePodiumRace?.image_url || '/images/sommet-ventoux-1080p.jpg'})` }}
                        />
                        <div className={styles.coverGradient} />

                        <div className={styles.coverContent}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={32} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>RÉSULTATS 2026</span>
                          </div>

                          <div>
                            <div className={styles.coverSubtitle}>
                              <Trophy size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                              LES PODIUMS DU WEEK-END
                            </div>
                            <h2 className={styles.coverMainTitle}>
                              {activePodiumRace?.name}
                            </h2>
                            <div className={styles.coverTeaserPill}>
                              {activePodiumRace?.city} • {new Date(activePodiumRace?.date || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>DÉCOUVREZ LES VAINQUEURS</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* SLIDES 1..N: PODIUM PER EVENT/DISTANCE */}
                    {activeSlideIndex > 0 && activeSlideIndex <= podiumEvents.length && (() => {
                      const [eventName, winners] = podiumEvents[activeSlideIndex - 1];
                      const menWinner = winners.find(w => w.rank_sex?.includes('M') || w.rank_overall === 1);
                      const womenWinner = winners.find(w => w.rank_sex?.includes('F') || w.rank_sex?.includes('Fem'));

                      return (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={24} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>{eventName.toUpperCase()}</span>
                          </div>

                          <div style={{ margin: '1rem 0' }}>
                            <h3 style={{ 
                              fontFamily: "var(--font-display)", 
                              fontSize: "2.2rem", 
                              color: "#F6C83B", 
                              margin: "0 0 0.5rem",
                              letterSpacing: "1px" 
                            }}>
                              LES VAINQUEURS SCRATCH
                            </h3>
                            <p style={{ margin: 0, color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              {activePodiumRace?.name} ({activePodiumRace?.city})
                            </p>
                          </div>

                          {/* Men Winner Card */}
                          {menWinner && (
                            <div className={styles.podiumCard}>
                              <div className={styles.podiumCategory}>
                                <span className={styles.genderBadgeM}>1ER HOMME</span>
                                <span className={styles.winnerTime}>⏱️ {menWinner.time}</span>
                              </div>
                              <h4 className={styles.winnerName}>{menWinner.name}</h4>
                              <div className={styles.winnerMetaRow}>
                                <span className={styles.winnerClub}>{menWinner.club || 'Individuel'}</span>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Rang: #{menWinner.rank_overall}</span>
                              </div>
                            </div>
                          )}

                          {/* Women Winner Card */}
                          {womenWinner && (
                            <div className={styles.podiumCard}>
                              <div className={styles.podiumCategory}>
                                <span className={styles.genderBadgeF}>1ÈRE FEMME</span>
                                <span className={styles.winnerTime}>⏱️ {womenWinner.time}</span>
                              </div>
                              <h4 className={styles.winnerName}>{womenWinner.name}</h4>
                              <div className={styles.winnerMetaRow}>
                                <span className={styles.winnerClub}>{womenWinner.club || 'Individuel'}</span>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Rang: #{womenWinner.rank_overall}</span>
                              </div>
                            </div>
                          )}

                          <div className={styles.coverFooter}>
                            <span>CLASSEMENT : RUNVAUCLUSE.FR</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SLIDE FINAL: CTA */}
                    {activeSlideIndex === podiumEvents.length + 1 && (
                      <div className={styles.outroCard}>
                        <Trophy size={52} color="#F6C83B" />
                        <h2 className={styles.outroBigTitle}>
                          TOUS LES CHRONOS SONT EN LIGNE !
                        </h2>
                        <p className={styles.outroDesc}>
                          Retrouvez votre temps officiel, votre allure, votre classement par catégorie et votre fiche coureur sur :
                        </p>
                        <div className={styles.outroUrlPill}>
                          RUNVAUCLUSE.FR
                        </div>
                        <div className={styles.savePostReminder}>
                          <Share2 size={18} /> Identifiez vos amis finishers en commentaire !
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* =========================================================
                    MODE 3: STORY J-7 (9:16)
                   ========================================================= */}
                {mode === 'story' && (
                  <>
                    <div 
                      className={styles.coverBackground}
                      style={{ backgroundImage: `url(${activeStoryRace.image_url || '/images/sommet-ventoux-1080p.jpg'})` }}
                    />
                    <div className={styles.coverGradient} />

                    <div className={styles.coverContent}>
                      <div className={styles.slideBrandHeader}>
                        <div className={styles.slideLogo}>
                          <LogoIcon size={36} /> RUNVAUCLUSE
                        </div>
                        <span className={styles.slidePillTag} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          J - 7 AVANT DÉPART ⏱️
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                        <div className={styles.raceCardPosterBox} style={{ height: '320px', maxWidth: '340px', margin: '0 auto 1.5rem' }}>
                          <img 
                            src={activeStoryRace.image_url || '/images/sommet-ventoux-1080p.jpg'} 
                            alt={activeStoryRace.name}
                            className={styles.racePosterImg}
                          />
                        </div>

                        <div className={styles.coverSubtitle} style={{ fontSize: '1.1rem' }}>
                          <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                          {new Date(activeStoryRace.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                        </div>
                        
                        <h2 className={styles.coverMainTitle} style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                          {activeStoryRace.name}
                        </h2>

                        <div className={styles.raceSlideCity} style={{ justifyContent: 'center', fontSize: '1rem', marginTop: '0.5rem' }}>
                          <MapPin size={16} /> {activeStoryRace.city} • VAUCLUSE
                        </div>

                        <div className={styles.raceSlideDistances} style={{ justifyContent: 'center', marginTop: '1rem' }}>
                          {activeStoryRace.distances.split(',').map((dist, idx) => (
                            <span key={idx} className={styles.raceSlideDistPill} style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                              {dist.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(250, 247, 242, 0.2)', paddingTop: '1.25rem' }}>
                        <div className={styles.outroUrlPill} style={{ fontSize: '1.3rem', padding: '0.5rem 1.5rem', marginBottom: '0.5rem' }}>
                          INSCRIPTION : LIEN EN BIO ↗
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(250, 247, 242, 0.7)' }}>
                          @RUNVAUCLUSE.FR • TOUTES LES COURSES DU 84
                        </p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
