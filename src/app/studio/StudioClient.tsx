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
  Share2,
  Upload,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  Users,
  Mail,
  MessageCircle
} from 'lucide-react';
import { toPng } from 'html-to-image';
import LogoIcon from '@/components/LogoIcon';
import clubsData from '@/data/clubs.json';
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
  const [mode, setMode] = useState<'weekend' | 'podiums' | 'new_race' | 'clubs' | 'story'>('weekend');
  
  // Weekend Carrousel State
  const [selectedRaceSlugs, setSelectedRaceSlugs] = useState<string[]>(() => {
    // Default to the first 4 races from September 2026
    return races.slice(0, 4).map(r => r.slug);
  });
  const [weekendTitle, setWeekendTitle] = useState('LES DOSSARDS DU WEEK-END');
  const [weekendDates, setWeekendDates] = useState('SAMEDI 12 & DIMANCHE 13 SEPTEMBRE');

  // Podiums Carrousel State (Multi-race support)
  const [selectedPodiumSlugs, setSelectedPodiumSlugs] = useState<string[]>(() => {
    // Default to the first 2 races from latestWinners (e.g. Trail du Ruban Doré & Urban Trail de Vedène)
    return latestWinners.slice(0, 2).map(r => r.slug);
  });
  const [podiumTitle, setPodiumTitle] = useState('LES PODIUMS DU WEEK-END');
  const [podiumDates, setPodiumDates] = useState('SAMEDI 19 & DIMANCHE 20 SEPTEMBRE');

  // New Race Carrousel State
  const [selectedNewRaceSlug, setSelectedNewRaceSlug] = useState<string>(() => {
    return races.find(r => r.slug === 'trail-nocturne-de-bonnieux-bonnieux')?.slug || races.find(r => r.slug === 'la-vigneronde-puget')?.slug || races[0]?.slug || '';
  });

  // Clubs Call Carrousel State
  const [clubContactEmail, setClubContactEmail] = useState('contact@runvaucluse.fr');
  const [clubInstagramTag, setClubInstagramTag] = useState('@runvaucluse.fr');
  const [clubsCoverMode, setClubsCoverMode] = useState<'all' | 'featured'>('all');

  // Story State
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>(
    races[0]?.slug || ''
  );

  // Carousel Pagination State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [imageDisplayMode, setImageDisplayMode] = useState<'poster' | 'banner'>('poster');
  const [customImages, setCustomImages] = useState<{ [slug: string]: string }>({});

  const handleFileUpload = (slug: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result;
      if (res && typeof res === 'string') {
        setCustomImages(prev => ({ ...prev, [slug]: res }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeCustomImage = (slug: string) => {
    setCustomImages(prev => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const canvasRef = useRef<HTMLDivElement>(null);

  // Reset slide index when changing mode or selection
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [mode, selectedPodiumSlugs, selectedStorySlug, selectedNewRaceSlug]);

  // Selected races for Weekend Mode
  const selectedRaces = races.filter(r => selectedRaceSlugs.includes(r.slug));
  
  // Selected races for Podiums Mode (Multi-race support)
  const selectedPodiumRaces = latestWinners.filter(r => selectedPodiumSlugs.includes(r.slug));

  // Flat list of podium events across all selected races
  const allPodiumItems = (() => {
    const items: { race: LatestWinnerRace; eventName: string; winners: typeof latestWinners[0]['winners'] }[] = [];
    selectedPodiumRaces.forEach(race => {
      const groups: { [key: string]: typeof race.winners } = {};
      race.winners.forEach(w => {
        if (!groups[w.event_name]) groups[w.event_name] = [];
        groups[w.event_name].push(w);
      });
      Object.entries(groups).forEach(([eventName, winners]) => {
        items.push({ race, eventName, winners });
      });
    });
    return items;
  })();

  // Selected race for New Race Mode
  const activeNewRace = races.find(r => r.slug === selectedNewRaceSlug) || races[0];

  // Selected race for Story Mode
  const activeStoryRace = races.find(r => r.slug === selectedStorySlug) || races[0];

  // Calculate total slides based on mode
  let totalSlides = 1;
  if (mode === 'weekend') {
    totalSlides = 1 + selectedRaces.length + 1; // Cover + races + CTA
  } else if (mode === 'podiums') {
    totalSlides = 1 + (allPodiumItems.length > 0 ? allPodiumItems.length : 1) + 1; // Cover + all event slides + Outro CTA
  } else if (mode === 'new_race') {
    totalSlides = 4; // Cover + Formats + Présentation + CTA
  } else if (mode === 'clubs') {
    totalSlides = 4; // Cover + Pourquoi + Checklist + CTA
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

  // Toggle race selection in Podiums Mode
  const togglePodiumRace = (slug: string) => {
    setSelectedPodiumSlugs(prev => {
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
      if (selectedPodiumRaces.length > 1) {
        const raceBlocks = selectedPodiumRaces.map(race => {
          const winnerLines = race.winners.slice(0, 4)
            .map(w => `  🥇 ${w.name} (${w.event_name}) en ${w.time}${w.club ? ' - ' + w.club : ''}`)
            .join('\n');
          return `📍 ${race.name.toUpperCase()} (${race.city}) :\n${winnerLines}`;
        }).join('\n\n');

        return `🏆 LES RÉSULTATS DU WEEK-END EN VAUCLUSE !\n\nBravo à tous les courageux finishers qui ont bravé les sentiers et le bitume ce week-end dans le 84 ! 🏃‍♂️🏃‍♀️🌿\n\nFélicitations à tous les vainqueurs du jour :\n\n${raceBlocks}\n\n📊 Tous les résultats officiels, chronos, allures et fiches coureurs complètes sont en ligne sur :\n👉 WWW.RUNVAUCLUSE.FR/RESULTATS\n\nIdentifiez vos potes finishers en commentaire ! 👇\n\n#runvaucluse #resultatsrunning #runningvaucluse #trailvaucluse #podium #finisher #vaucluse #courseapied`;
      } else {
        const race = selectedPodiumRaces[0];
        const winnerLines = race?.winners.slice(0, 4)
          .map(w => `🥇 ${w.name} (${w.event_name}) en ${w.time}${w.club ? ' - ' + w.club : ''}`)
          .join('\n');
        return `🏆 LES RÉSULTATS DU WEEK-END // ${race?.name.toUpperCase()}\n\nBravo à tous les finishers de cette magnifique édition à ${race?.city} !\n\nFélicitations aux vainqueurs du jour :\n${winnerLines}\n\n📊 Tous les résultats officiels, chronos, allures et fiches coureurs complètes sont en ligne sur :\n👉 WWW.RUNVAUCLUSE.FR/RESULTATS\n\nIdentifiez vos potes finishers en commentaire ! 👇\n\n#runvaucluse #resultatsrunning #runningvaucluse #trailvaucluse #podium #finisher #vaucluse`;
      }
    } else if (mode === 'new_race') {
      const race = activeNewRace;
      if (race.slug === 'marathon-davignon-avignon') {
        return `🔥 DOSSIER SPÉCIAL // SEMI & MARATHON D'AVIGNON 2026 ! 🏃‍♂️⚡\n\nLe 27 septembre 2026, la Cité des Papes accueille la première édition de son grand Marathon et Semi-Marathon officiel ! 🏰🏅\n\nAvec moins de 80m de dénivelé positif, un tracé somptueux entre remparts du XIVe siècle, Palais des Papes et vergers de la Barthelasse, c'est LE parcours idéal pour décrocher votre record personnel ou vous qualifier pour les Championnats de France FFA.\n\nSur RUNVAUCLUSE.FR, nous venons de mettre en ligne le DOSSIER COMPLET & L'ANALYSE TACTIQUE DU COACH :\n\n📍 Tracés GPX officiels téléchargeables (42,195 km & 21,0975 km)\n📈 Profil altimétrique interactif km par km\n⏱️ Grille des 6 meneurs d'allures officiels (de 3h00 à 4h30 sur marathon, 1h20 à 2h00 sur semi)\n🧠 Conseils tactiques du coach Vincent Buisson (Diplômé STAPS, +100 athlètes suivis) : gestion du vent sur le Rhône, piège des pavés intra-muros, régularité d'allure\n⚡ Stratégie nutrition : les recommandations de son partenaire @nutripurefr (boisson d'effort 60g & gels énergétiques pour éviter le mur)\n🚗 Guide logistique complet : retrait dossards, consignes, sas de départ et parkings gratuits (Piot, Italiens, St-Chamand)\n\n👉 Retrouvez le dossier interactif dès maintenant sur le site :\n🔗 WWW.RUNVAUCLUSE.FR (Lien direct en bio !)\n\n💾 Enregistrez ce post pour votre prépa et identifiez vos potes qui cherchent leur prochain défi ! 👇\n\n#runvaucluse #marathonavignon #semimarathonavignon #avignon #vaucluse #runningvaucluse #courseapied #marathon #semimarathon #ffa #nutripure #top4running #stravafrance #runningfrance #course2026`;
      }
      const dateFormatted = new Date(race.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return `✨ NOUVEAU DOSSARD EN VAUCLUSE // ${race.name.toUpperCase()} !\n\nUne nouvelle course vient d'être ajoutée au calendrier officiel sur RUNVAUCLUSE.FR 🏃‍♂️⚡\n\n📅 Date : ${dateFormatted}\n📍 Lieu : ${race.city} (Vaucluse)\n📏 Formats : ${race.distances}\n${race.label ? `🏷️ Label : ${race.label}\n` : ''}${race.contact ? `👥 Organisation : ${race.contact}\n` : ''}\n${race.description ? `${race.description.slice(0, 280)}...\n\n` : ''}👉 Retrouvez la fiche complète, le parcours et le lien direct d'inscription officielle sur :\n🔗 WWW.RUNVAUCLUSE.FR (Lien en bio)\n\n💾 Enregistrez ce post pour votre calendrier de courses et taguez vos amis partants ! 👇\n\n#runvaucluse #runningvaucluse #trailvaucluse #${race.city.toLowerCase().replace(/[^a-z0-9]/g, '')} #courseapied #dossard #vaucluse #provence #calendriercourses`;
    } else if (mode === 'clubs') {
      return `📢 APPEL À TOUS LES CLUBS & ASSOCIATIONS DU VAUCLUSE ! 🏃‍♂️🏃‍♀️\n\nLe Vaucluse regorge de clubs passionnés, de groupes d’entraînement chaleureux et de coachs engagés.\n\nSur RUNVAUCLUSE.FR, nous voulons offrir à chaque coureur vauclusien — qu’il soit débutant, traileur ou compétiteur — un annuaire complet et précis pour trouver le club qui lui correspond.\n\n👉 Responsables, coachs ou coureurs : aidez-nous à compléter la fiche de votre club !\n\nEnvoyez-nous simplement :\n1️⃣ Une courte présentation de votre club (l’esprit, vos spécialités : route, trail, piste, loisir, jeunes…)\n2️⃣ Vos créneaux et horaires d’entraînement (jours, heures et lieux de rendez-vous)\n3️⃣ Vos liens d’inscriptions et contacts officiels (site, mail, réseaux)\n\n📩 Pour nous les envoyer :\n• En message privé directement ici (${clubInstagramTag})\n• Par mail à : ${clubContactEmail}\n\nC’est 100% gratuit et ouvert à toutes les structures du département (FFA, FSGT, UFOLEP ou assos running indépendantes).\n\n👇 Tague ton club, ton président ou tes partenaires d’entraînement en commentaire pour qu’ils ne manquent pas le train !\n\n---\n#runvaucluse #runningvaucluse #trailvaucluse #athlevaucluse #clubathletisme #clubrunning #vaucluse #avignon #carpentras #cavaillon #orange #apt #bollene #islesurlasorgue #courirconvivialite #courseapied`;
    } else {
      return `⚡ J - 7 AVANT LE DÉPART : ${activeStoryRace.name.toUpperCase()} !\n\nLes inscriptions approchent de la clôture à ${activeStoryRace.city}. Format : ${activeStoryRace.distances}.\n\n👉 Réservez votre dossard directement sur RUNVAUCLUSE.FR (Lien en bio) !\n\n#runvaucluse #courseapied #${activeStoryRace.city.toLowerCase().replace(/[^a-z]/g, '')}`;
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

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
              className={`${styles.tabBtn} ${mode === 'new_race' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('new_race'); setActiveSlideIndex(0); }}
            >
              <Sparkles size={18} /> Carrousel "Nouvelle Course"
            </button>
            <button 
              className={`${styles.tabBtn} ${mode === 'clubs' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('clubs'); setActiveSlideIndex(0); }}
            >
              <Users size={18} /> Carrousel "Appel aux Clubs"
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
                  <Trophy size={18} /> Configuration des Podiums
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Titre de la Couverture</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={podiumTitle}
                    onChange={(e) => setPodiumTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Dates affichées</label>
                  <input 
                    type="text" 
                    className={styles.textInput}
                    value={podiumDates}
                    onChange={(e) => setPodiumDates(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className={styles.label} style={{ margin: 0 }}>
                      Courses à regrouper ({selectedPodiumSlugs.length}/6 max)
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        type="button"
                        onClick={() => setSelectedPodiumSlugs(latestWinners.slice(0, 2).map(r => r.slug))}
                        style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FAF7F2', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Ce week-end (2)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedPodiumSlugs([latestWinners[0]?.slug || ''])}
                        style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FAF7F2', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Dernière seule
                      </button>
                    </div>
                  </div>

                  <div className={styles.raceChecklist}>
                    {latestWinners.map(race => (
                      <label key={race.slug} className={styles.raceCheckItem}>
                        <input 
                          type="checkbox" 
                          checked={selectedPodiumSlugs.includes(race.slug)}
                          onChange={() => togglePodiumRace(race.slug)}
                        />
                        <span>
                          <strong>{race.name}</strong> ({race.city})<br/>
                          <small style={{ color: '#888' }}>
                            {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {race.distances} • {race.winners.length} vainqueurs
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* NEW RACE MODE CONTROLS */}
            {mode === 'new_race' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Sparkles size={18} /> Présentation Nouvelle Course
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Choisir la course ajoutée</label>
                  <select 
                    className={styles.selectInput}
                    value={selectedNewRaceSlug}
                    onChange={(e) => setSelectedNewRaceSlug(e.target.value)}
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

            {/* CLUBS CALL MODE CONTROLS */}
            {mode === 'clubs' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Users size={18} /> Appel aux Clubs & Assos
                </h3>

                <div className={styles.formGroup}>
                  <p style={{ color: 'rgba(250, 247, 242, 0.7)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>
                    Ce carrousel 4 slides invite tous les clubs et associations running du 84 à compléter leur fiche officielle sur RunVaucluse.fr.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Affichage des logos sur la Cover</label>
                  <div className={styles.displayModeGrid}>
                    <button
                      type="button"
                      className={`${styles.displayModeBtn} ${clubsCoverMode === 'all' ? styles.displayModeBtnActive : ''}`}
                      onClick={() => setClubsCoverMode('all')}
                    >
                      <Users size={15} /> Les 27 clubs (Mosaïque)
                    </button>
                    <button
                      type="button"
                      className={`${styles.displayModeBtn} ${clubsCoverMode === 'featured' ? styles.displayModeBtnActive : ''}`}
                      onClick={() => setClubsCoverMode('featured')}
                    >
                      <Trophy size={15} /> 8 clubs en vedette
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email de contact affiché</label>
                  <input 
                    type="text"
                    className={styles.selectInput}
                    value={clubContactEmail}
                    onChange={(e) => setClubContactEmail(e.target.value)}
                    placeholder="contact@runvaucluse.fr"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Compte Instagram affiché</label>
                  <input 
                    type="text"
                    className={styles.selectInput}
                    value={clubInstagramTag}
                    onChange={(e) => setClubInstagramTag(e.target.value)}
                    placeholder="@runvaucluse.fr"
                  />
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

            {/* VISUAL & POSTER SETTINGS */}
            {(mode === 'weekend' || mode === 'story' || mode === 'new_race') && (
              <div className={styles.visualSettingsBox}>
                <h3 className={styles.controlsSectionTitle}>
                  <ImageIcon size={18} /> Rendu des Visuels
                </h3>

                {(mode === 'weekend' || mode === 'new_race') && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Format d&apos;affichage de l&apos;affiche</label>
                    <div className={styles.displayModeGrid}>
                      <button
                        type="button"
                        className={`${styles.displayModeBtn} ${imageDisplayMode === 'poster' ? styles.displayModeBtnActive : ''}`}
                        onClick={() => setImageDisplayMode('poster')}
                      >
                        <FileText size={15} /> Affiche Verticale
                      </button>
                      <button
                        type="button"
                        className={`${styles.displayModeBtn} ${imageDisplayMode === 'banner' ? styles.displayModeBtnActive : ''}`}
                        onClick={() => setImageDisplayMode('banner')}
                      >
                        <ImageIcon size={15} /> Bannière Paysage
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Poster Upload */}
                {(() => {
                  const targetSlug = mode === 'story'
                    ? activeStoryRace.slug
                    : mode === 'new_race'
                      ? activeNewRace.slug
                      : (activeSlideIndex > 0 && activeSlideIndex <= selectedRaces.length 
                          ? selectedRaces[activeSlideIndex - 1].slug 
                          : selectedRaces[0]?.slug);
                  
                  const targetRace = races.find(r => r.slug === targetSlug);
                  if (!targetRace) return null;

                  const hasCustom = !!customImages[targetSlug];

                  return (
                    <div className={styles.uploadBox}>
                      <label className={styles.label}>
                        Affiche pour : <strong style={{ color: '#111417' }}>{targetRace.name}</strong>
                      </label>
                      <div className={styles.uploadBtnRow}>
                        <label className={styles.uploadBtn}>
                          <Upload size={14} /> {hasCustom ? 'Remplacer l’affiche' : 'Importer une affiche (JPG/PNG)'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(targetSlug, file);
                            }}
                          />
                        </label>
                        {hasCustom && (
                          <button 
                            type="button"
                            className={styles.resetImgBtn}
                            title="Rétablir l'image d'origine"
                            onClick={() => removeCustomImage(targetSlug)}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                      {hasCustom && (
                        <span className={styles.customActiveBadge}>
                          <Check size={12} /> Affiche personnalisée chargée !
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
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
                      const raceImage = customImages[race.slug] || race.image_url || '/images/hero-ventoux-trail.jpg';
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

                          {imageDisplayMode === 'poster' ? (
                            <div className={styles.raceSlidePosterLayout}>
                              {/* Left Column: Framed Vertical Poster */}
                              <div className={styles.posterFrameContainer}>
                                <div 
                                  className={styles.posterAmbientGlow} 
                                  style={{ backgroundImage: `url(${raceImage})` }} 
                                />
                                <div className={styles.posterFrame}>
                                  <div 
                                    className={styles.posterFrameBackdrop} 
                                    style={{ backgroundImage: `url(${raceImage})` }} 
                                  />
                                  <img 
                                    src={raceImage} 
                                    alt={race.name}
                                    className={styles.posterImg}
                                  />
                                </div>
                              </div>

                              {/* Right Column: Race Details */}
                              <div className={styles.posterInfoCol}>
                                <div className={styles.raceSlideMetaRow}>
                                  <Calendar size={14} />
                                  {new Date(race.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                                </div>

                                <h3 className={styles.posterRaceName}>{race.name}</h3>

                                <div className={styles.raceSlideCity}>
                                  <MapPin size={15} /> {race.city} • VAUCLUSE
                                </div>

                                <div className={styles.raceSlideDistances} style={{ marginTop: '0.6rem' }}>
                                  {race.distances.split(',').map((dist, idx) => (
                                    <span key={idx} className={styles.raceSlideDistPill}>
                                      {dist.trim()}
                                    </span>
                                  ))}
                                </div>

                                <div className={styles.posterBadges}>
                                  <span className={styles.posterTagBadge}>
                                    ⚡ DOSSARDS OUVERTS
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={styles.raceCardPosterBox}>
                                <img 
                                  src={raceImage} 
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
                            </>
                          )}

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
                          style={{ backgroundImage: `url(${selectedPodiumRaces[0]?.image_url || '/images/sommet-ventoux-1080p.jpg'})` }}
                        />
                        <div className={styles.coverGradient} />

                        <div className={styles.coverContent}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={32} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>RÉSULTATS 2026 🏆</span>
                          </div>

                          <div>
                            <div className={styles.coverSubtitle}>
                              <Trophy size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                              {podiumDates || 'LES PODIUMS DU WEEK-END'}
                            </div>
                            <h2 className={styles.coverMainTitle} style={selectedPodiumRaces.length > 1 ? { fontSize: '2.8rem', lineHeight: '1.05' } : undefined}>
                              {podiumTitle}
                            </h2>

                            {selectedPodiumRaces.length > 1 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '1.2rem' }}>
                                {selectedPodiumRaces.map(r => (
                                  <div key={r.slug} className={styles.coverTeaserPill} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.9rem' }}>
                                    <span>📍 <strong>{r.name}</strong> ({r.city})</span>
                                    <span style={{ color: '#F6C83B', fontSize: '0.78rem', fontWeight: 800 }}>{r.distances}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.coverTeaserPill}>
                                {selectedPodiumRaces[0]?.city} • {new Date(selectedPodiumRaces[0]?.date || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              </div>
                            )}
                          </div>

                          <div className={styles.coverFooter}>
                            <span>DÉCOUVREZ TOUS LES PODIUMS</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* SLIDES 1..N: PODIUM PER EVENT/DISTANCE ACROSS ALL SELECTED RACES */}
                    {activeSlideIndex > 0 && activeSlideIndex <= allPodiumItems.length && (() => {
                      const item = allPodiumItems[activeSlideIndex - 1];
                      const { race, eventName, winners } = item;
                      const menWinner = winners.find(w => w.rank_sex?.includes('M') || w.rank_overall === 1);
                      const womenWinner = winners.find(w => w.rank_sex?.includes('F') || w.rank_sex?.includes('Fem'));

                      return (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}>
                              <LogoIcon size={24} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.slidePillTag}>
                              {selectedPodiumRaces.length > 1 ? `${race.city.toUpperCase()} • ` : ''}{eventName.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ margin: '0.8rem 0' }}>
                            <div style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'rgba(250, 247, 242, 0.75)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '0.2rem'
                            }}>
                              <MapPin size={13} color="#F6C83B" /> {race.name} ({race.city})
                            </div>
                            <h3 style={{ 
                              fontFamily: "var(--font-display)", 
                              fontSize: "2.4rem", 
                              color: "#F6C83B", 
                              margin: "0 0 0.2rem",
                              letterSpacing: "1px",
                              lineHeight: 1
                            }}>
                              LES VAINQUEURS SCRATCH
                            </h3>
                            <p style={{ margin: 0, color: "rgba(250, 247, 242, 0.65)", fontSize: "0.85rem" }}>
                              Épreuve {eventName} • {new Date(race.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Rang scratch : #{menWinner.rank_overall}</span>
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
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Rang scratch : #{womenWinner.rank_overall}</span>
                              </div>
                            </div>
                          )}

                          <div className={styles.coverFooter}>
                            <span>CLASSEMENT COMPLET : RUNVAUCLUSE.FR</span>
                            <span className={styles.swipeArrow}>
                              SWIPE <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SLIDE FINAL: CTA */}
                    {activeSlideIndex === allPodiumItems.length + 1 && (
                      <div className={styles.outroCard}>
                        <Trophy size={52} color="#F6C83B" />
                        <h2 className={styles.outroBigTitle}>
                          TOUS LES CHRONOS SONT EN LIGNE !
                        </h2>
                        <p className={styles.outroDesc}>
                          {selectedPodiumRaces.length > 1 ? (
                            <>
                              Retrouvez tous les résultats de <strong>{selectedPodiumRaces.map(r => r.name).join(' & ')}</strong>, vos temps officiels, allures et classements sur :
                            </>
                          ) : (
                            <>
                              Retrouvez votre temps officiel, votre allure, votre classement par catégorie et votre fiche coureur sur :
                            </>
                          )}
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
                    MODE 4: NOUVELLE COURSE CAROUSEL SLIDES (4 SLIDES)
                   ========================================================= */}
                {mode === 'new_race' && (() => {
                  const race = activeNewRace || races[0];
                  if (!race) return null;
                  const raceImage = customImages[race.slug] || race.image_url || '/images/sommet-ventoux-1080p.jpg';
                  const dateFormatted = new Date(race.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
                  const distList = race.distances ? race.distances.split(',').map(d => d.trim()).filter(Boolean) : [];

                  return (
                    <>
                      {/* SLIDE 0: COVER ANNONCE */}
                      {activeSlideIndex === 0 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>NOUVEAU SUR LE SITE ✨</span>
                          </div>

                          {imageDisplayMode === 'poster' ? (
                            <div className={styles.raceSlidePosterLayout}>
                              <div className={styles.posterFrameContainer}>
                                <div className={styles.posterAmbientGlow} style={{ backgroundImage: `url(${raceImage})` }} />
                                <div className={styles.posterFrame}>
                                  <div className={styles.posterFrameBackdrop} style={{ backgroundImage: `url(${raceImage})` }} />
                                  <img src={raceImage} alt={race.name} className={styles.posterImg} />
                                </div>
                              </div>
                              <div className={styles.posterInfoCol}>
                                <div className={styles.raceSlideMetaRow}>
                                  <Calendar size={14} /> {dateFormatted}
                                </div>
                                <h3 className={styles.posterRaceName}>{race.name}</h3>
                                <div className={styles.raceSlideCity}>
                                  <MapPin size={15} /> {race.city} • VAUCLUSE
                                </div>
                                <div className={styles.raceSlideDistances} style={{ marginTop: '0.6rem' }}>
                                  {distList.map((dist, idx) => (
                                    <span key={idx} className={styles.raceSlideDistPill}>{dist}</span>
                                  ))}
                                </div>
                                {race.label && (
                                  <div className={styles.posterBadges}>
                                    <span className={styles.posterTagBadge}>🏷️ {race.label.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={styles.raceCardPosterBox}>
                                <img src={raceImage} alt={race.name} className={styles.racePosterImg} />
                              </div>
                              <div className={styles.raceSlideInfo}>
                                <div className={styles.raceSlideMetaRow}>
                                  <Calendar size={14} /> {dateFormatted}
                                </div>
                                <h3 className={styles.raceSlideName}>{race.name}</h3>
                                <div className={styles.raceSlideCity}>
                                  <MapPin size={15} /> {race.city} • VAUCLUSE
                                </div>
                                <div className={styles.raceSlideDistances} style={{ marginTop: '0.75rem' }}>
                                  {distList.map((dist, idx) => (
                                    <span key={idx} className={styles.raceSlideDistPill}>{dist}</span>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          <div className={styles.coverFooter}>
                            <span>PROGRAMME & DÉTAILS</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 1: FORMATS & INFOS CLÉS */}
                      {activeSlideIndex === 1 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>AU PROGRAMME 📅</span>
                          </div>

                          <div style={{ margin: '0.8rem 0 0.4rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#FAF7F2", margin: 0, letterSpacing: "1px" }}>
                              LES ÉPREUVES DU JOUR
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              {race.name} ({race.city})
                            </p>
                          </div>

                          <div 
                            className={styles.newRaceDistRow}
                            style={distList.length > 2 ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } : undefined}
                          >
                            {distList.map((dist, idx) => (
                              <div 
                                key={idx} 
                                className={styles.newRaceDistCard}
                                style={distList.length > 2 ? { padding: '0.65rem 0.85rem' } : undefined}
                              >
                                <span 
                                  className={styles.newRaceDistName}
                                  style={distList.length > 2 ? { fontSize: '1.25rem' } : undefined}
                                >
                                  {dist}
                                </span>
                                <span className={styles.newRaceDistPillBadge}>OUVERT</span>
                              </div>
                            ))}
                          </div>

                          <div className={styles.newRaceFactsGrid}>
                            <div className={styles.newRaceFactCard}>
                              <span className={styles.newRaceFactLabel}><Calendar size={13} /> DATE</span>
                              <span className={styles.newRaceFactVal}>{new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className={styles.newRaceFactCard}>
                              <span className={styles.newRaceFactLabel}><MapPin size={13} /> LIEU</span>
                              <span className={styles.newRaceFactVal}>{race.city}</span>
                            </div>
                            <div className={styles.newRaceFactCard}>
                              <span className={styles.newRaceFactLabel}><Zap size={13} /> TYPE</span>
                              <span className={styles.newRaceFactVal}>{race.type || 'Course'}</span>
                            </div>
                            <div className={styles.newRaceFactCard}>
                              <span className={styles.newRaceFactLabel}><Timer size={13} /> INSCRIPTION</span>
                              <span className={styles.newRaceFactVal}>{race.registration_platform || 'En ligne'}</span>
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>L'ESPRIT DU DÉFI</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 2: PRÉSENTATION & AMBIANCE */}
                      {activeSlideIndex === 2 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>L'EXPÉRIENCE 🌟</span>
                          </div>

                          <div style={{ margin: '0.8rem 0 0.4rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#F6C83B", margin: 0, letterSpacing: "1px" }}>
                              POURQUOI S'INSCRIRE ?
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              {race.name}
                            </p>
                          </div>

                          <div className={styles.newRaceDescCard}>
                            <p className={styles.newRaceDescText}>
                              {race.description || "Une expérience sportive et humaine incontournable au cœur des paysages du Vaucluse. Venez relever le défi et partager une journée conviviale avec tous les passionnés de course à pied de la région."}
                            </p>
                            {race.contact && (
                              <div className={styles.newRaceContactPill}>
                                👥 Organisation : {race.contact}
                              </div>
                            )}
                          </div>

                          <div className={styles.coverFooter}>
                            <span>COMMENT PARTICIPER</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 3: CTA FINAL */}
                      {activeSlideIndex === 3 && (
                        <div className={styles.outroCard}>
                          <LogoIcon size={52} />
                          <h2 className={styles.outroBigTitle}>
                            INSCRIPTIONS OUVERTES !
                          </h2>
                          <p className={styles.outroDesc}>
                            Retrouvez tous les détails, le règlement officiel et le lien d'inscription directe pour <strong>{race.name}</strong> sur :
                          </p>
                          <div className={styles.outroUrlPill}>
                            RUNVAUCLUSE.FR
                          </div>
                          <div className={styles.savePostReminder}>
                            <Bookmark size={18} /> Enregistre ce post pour ton prochain dossard !
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* =========================================================
                    MODE 5: APPEL AUX CLUBS CAROUSEL SLIDES (4 SLIDES)
                   ========================================================= */}
                {mode === 'clubs' && (() => {
                  const featuredClubs = [
                    clubsData.find(c => c.name.includes("Team PAPA")),
                    clubsData.find(c => c.name.includes("Loriolade")),
                    clubsData.find(c => c.name.includes("Carpentras") || c.name.includes("U.A.C")),
                    clubsData.find(c => c.name.includes("Ménerbes")),
                    clubsData.find(c => c.name.includes("Le Pontet") || c.name.includes("USPA")),
                    clubsData.find(c => c.name.includes("Vaison")),
                    clubsData.find(c => c.name.includes("Courthézon") || c.name.includes("5 Pas")),
                    clubsData.find(c => c.name.includes("CS AMA") || c.name.includes("Montfavet")),
                  ].filter(Boolean) as typeof clubsData;

                  const allClubs = clubsData.filter(c => c.image_url);
                  const displayClubs = clubsCoverMode === 'all' ? allClubs : featuredClubs;

                  return (
                    <>
                      {/* SLIDE 0: COVER ANNONCE */}
                      {activeSlideIndex === 0 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>COMMUNAUTÉ 84 🤝</span>
                          </div>

                          <div style={{ margin: clubsCoverMode === 'all' ? '0.4rem 0 0.1rem' : '0.6rem 0 0.2rem' }}>
                            <span style={{ 
                              fontFamily: 'var(--font-mono, monospace)', 
                              fontSize: '0.85rem', 
                              fontWeight: 700, 
                              color: '#F6C83B', 
                              letterSpacing: '1px',
                              textTransform: 'uppercase' 
                            }}>
                              ANNUAIRE OFFICIEL DU RUNNING 84
                            </span>
                            <h2 style={{ 
                              fontFamily: 'var(--font-display, sans-serif)', 
                              fontSize: clubsCoverMode === 'all' ? '2.6rem' : '2.8rem', 
                              lineHeight: '0.95', 
                              color: '#FAF7F2', 
                              margin: '0.4rem 0 0.5rem',
                              letterSpacing: '1px',
                              textTransform: 'uppercase'
                            }}>
                              APPEL À TOUS LES CLUBS DU VAUCLUSE !
                            </h2>
                            <p style={{ 
                              color: 'rgba(250, 247, 242, 0.8)', 
                              fontSize: '0.88rem', 
                              lineHeight: '1.35', 
                              margin: 0 
                            }}>
                              Faites briller vos couleurs et attirez de nouveaux coureurs pour la saison sur <strong>RunVaucluse.fr</strong>.
                            </p>
                          </div>

                          {/* Clubs preview logos */}
                          <div className={clubsCoverMode === 'all' ? styles.clubsCoverLogosGridAll : styles.clubsCoverLogosGridFeatured}>
                            {displayClubs.map((club, idx) => (
                              <div 
                                key={idx} 
                                className={clubsCoverMode === 'all' ? styles.clubLogoMiniItemAll : styles.clubLogoMiniItemFeatured} 
                                title={club.name}
                              >
                                <img src={club.image_url} alt={club.name} className={styles.clubLogoMiniImg} />
                              </div>
                            ))}
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            marginBottom: '0.4rem' 
                          }}>
                            <span className={styles.posterTagBadge} style={{ fontSize: '0.75rem' }}>
                              {clubsCoverMode === 'all' ? '⚡ LES 27 CLUBS DU VAUCLUSE' : '⚡ +25 CLUBS RÉFÉRENCÉS'}
                            </span>
                            <span className={styles.posterTagBadge} style={{ fontSize: '0.75rem', background: '#EB5E28' }}>
                              🆓 100% GRATUIT
                            </span>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>INFOS & DÉMARCHES</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 1: POURQUOI REJOINDRE */}
                      {activeSlideIndex === 1 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>POURQUOI PARTICIPER ? 🎯</span>
                          </div>

                          <div style={{ margin: '0.5rem 0 0.2rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.3rem", color: "#FAF7F2", margin: 0, letterSpacing: "1px" }}>
                              FAITES DÉCOUVRIR VOTRE CLUB
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.88rem" }}>
                              Le répertoire de référence des coureurs et traileurs du 84
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '0.6rem 0' }}>
                            <div className={styles.clubBenefitCard}>
                              <MapPin size={22} className={styles.clubBenefitIcon} />
                              <div>
                                <h4 className={styles.clubBenefitTitle}>DES MILLIERS DE COUREURS ACTIFS</h4>
                                <p className={styles.clubBenefitText}>
                                  Débutants, coureurs sur route ou traileurs cherchent chaque mois un groupe convivial, un coach ou une licence près de chez eux.
                                </p>
                              </div>
                            </div>

                            <div className={styles.clubBenefitCard}>
                              <Trophy size={22} className={styles.clubBenefitIcon} />
                              <div>
                                <h4 className={styles.clubBenefitTitle}>VALORISEZ VOS COACHS & BÉNÉVOLES</h4>
                                <p className={styles.clubBenefitText}>
                                  Mettez en avant l&apos;ambiance unique de votre structure, vos entraînements piste / nature et vos sorties club.
                                </p>
                              </div>
                            </div>

                            <div className={styles.clubBenefitCard}>
                              <Zap size={22} className={styles.clubBenefitIcon} />
                              <div>
                                <h4 className={styles.clubBenefitTitle}>100% GRATUIT & INDÉPENDANT</h4>
                                <p className={styles.clubBenefitText}>
                                  Un espace dédié pour fédérer le sport en Vaucluse, sans aucun frais d&apos;inscription ni abonnement.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>CE QU&apos;IL FAUT NOUS ENVOYER</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 2: LES 3 INFOS CLÉS */}
                      {activeSlideIndex === 2 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>LA CHECKLIST 📋</span>
                          </div>

                          <div style={{ margin: '0.5rem 0 0.2rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.3rem", color: "#F6C83B", margin: 0, letterSpacing: "1px" }}>
                              3 INFOS SIMPLES À TRANSMETTRE
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.88rem" }}>
                              Aidez-nous à créer ou compléter la fiche de votre club :
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '0.6rem 0' }}>
                            <div className={styles.clubChecklistCard}>
                              <div className={styles.clubChecklistNum}>1</div>
                              <div>
                                <h4 className={styles.clubChecklistTitle}>PRÉSENTATION & ESPRIT DU CLUB</h4>
                                <p className={styles.clubChecklistText}>
                                  Route, trail, piste, loisir, compétition, école d&apos;athlétisme... Ce qui fait l&apos;ADN et la force de votre communauté.
                                </p>
                              </div>
                            </div>

                            <div className={styles.clubChecklistCard}>
                              <div className={styles.clubChecklistNum}>2</div>
                              <div>
                                <h4 className={styles.clubChecklistTitle}>CRÉNEAUX & LIEUX D&apos;ENTRAÎNEMENT</h4>
                                <p className={styles.clubChecklistText}>
                                  Jours de la semaine, horaires précis, stades, pistes d&apos;athlétisme ou points de rendez-vous nature.
                                </p>
                              </div>
                            </div>

                            <div className={styles.clubChecklistCard}>
                              <div className={styles.clubChecklistNum}>3</div>
                              <div>
                                <h4 className={styles.clubChecklistTitle}>CONTACT & LIEN D&apos;INSCRIPTION</h4>
                                <p className={styles.clubChecklistText}>
                                  Lien vers votre site web officiel, formulaire d&apos;adhésion, réseaux sociaux ou email du secrétariat.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>COMMENT NOUS CONTACTER</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 3: CTA FINAL & TRANSMISSION */}
                      {activeSlideIndex === 3 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>À VOUS DE JOUER 📬</span>
                          </div>

                          <div style={{ margin: '0.5rem 0 0.2rem', textAlign: 'center' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", color: "#F6C83B", margin: 0, letterSpacing: "1px" }}>
                              ENVOYEZ-NOUS VOS INFOS
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              Nous mettrons à jour votre fiche sous 24h :
                            </p>
                          </div>

                          <div className={styles.clubContactGrid}>
                            <div className={styles.clubContactItem}>
                              <span className={styles.clubContactLabel}>
                                <MessageCircle size={18} color="#EB5E28" /> EN DM INSTAGRAM
                              </span>
                              <span className={styles.clubContactVal}>{clubInstagramTag}</span>
                            </div>

                            <div className={styles.clubContactItem}>
                              <span className={styles.clubContactLabel}>
                                <Mail size={18} color="#EB5E28" /> PAR EMAIL
                              </span>
                              <span className={styles.clubContactVal}>{clubContactEmail}</span>
                            </div>

                            <div className={styles.clubContactItem}>
                              <span className={styles.clubContactLabel}>
                                <Zap size={18} color="#EB5E28" /> SUR LE SITE
                              </span>
                              <span className={styles.clubContactVal}>RUNVAUCLUSE.FR</span>
                            </div>
                          </div>

                          <div className={styles.clubCommunityCallout}>
                            👥 <strong>Tu cours dans un club du 84 ?</strong><br />
                            Tague ton président, ton coach ou tes partenaires d&apos;entraînement en commentaire pour qu&apos;ils soient au courant ! 👇
                          </div>

                          <div className={styles.coverFooter}>
                            <span>RUNVAUCLUSE.FR • COMMUNAUTÉ</span>
                            <span className={styles.swipeArrow}><Bookmark size={16} /> ENREGISTRE</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* =========================================================
                    MODE 3: STORY J-7 (9:16)
                   ========================================================= */}
                {mode === 'story' && (() => {
                  const raceImage = customImages[activeStoryRace.slug] || activeStoryRace.image_url || '/images/sommet-ventoux-1080p.jpg';
                  return (
                    <>
                      <div 
                        className={styles.coverBackground}
                        style={{ backgroundImage: `url(${raceImage})` }}
                      />
                      <div className={styles.coverGradient} />

                      <div className={styles.coverContent}>
                        <div className={styles.slideBrandHeader}>
                          <div className={styles.slideLogo}>
                            <LogoIcon size={32} /> RUNVAUCLUSE
                          </div>
                          <span className={styles.slidePillTag} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            J - 7 AVANT DÉPART ⏱️
                          </span>
                        </div>

                        <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
                          <div className={styles.storyPosterBox}>
                            <div 
                              className={styles.storyPosterAmbient} 
                              style={{ backgroundImage: `url(${raceImage})` }} 
                            />
                            <div className={styles.storyPosterFrame}>
                              <div 
                                className={styles.storyPosterBackdrop} 
                                style={{ backgroundImage: `url(${raceImage})` }} 
                              />
                              <img 
                                src={raceImage} 
                                alt={activeStoryRace.name}
                                className={styles.storyPosterImg}
                              />
                            </div>
                          </div>

                          <div className={styles.coverSubtitle} style={{ fontSize: '0.95rem', marginTop: '0.85rem' }}>
                            <Calendar size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                            {new Date(activeStoryRace.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                          </div>
                          
                          <h2 className={styles.coverMainTitle} style={{ fontSize: '2.6rem', margin: '0.25rem 0' }}>
                            {activeStoryRace.name}
                          </h2>

                          <div className={styles.raceSlideCity} style={{ justifyContent: 'center', fontSize: '0.92rem' }}>
                            <MapPin size={15} /> {activeStoryRace.city} • VAUCLUSE
                          </div>

                          <div className={styles.raceSlideDistances} style={{ justifyContent: 'center', marginTop: '0.65rem' }}>
                            {activeStoryRace.distances.split(',').map((dist, idx) => (
                              <span key={idx} className={styles.raceSlideDistPill} style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>
                                {dist.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(250, 247, 242, 0.2)', paddingTop: '0.85rem' }}>
                          <div className={styles.outroUrlPill} style={{ fontSize: '1.2rem', padding: '0.45rem 1.25rem', marginBottom: '0.35rem' }}>
                            INSCRIPTION : LIEN EN BIO ↗
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.7)' }}>
                            @RUNVAUCLUSE.FR • TOUTES LES COURSES DU 84
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
