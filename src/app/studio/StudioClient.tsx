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
  MessageCircle,
  Compass,
  Globe
} from 'lucide-react';
import { toPng } from 'html-to-image';
import LogoIcon from '@/components/LogoIcon';
import clubsData from '@/data/clubs.json';
import recordsData from '@/data/vaucluse-records.json';
import { drawReelFrame, ReelRunnerData } from './reelRenderer';
import { Film, Play, Pause, Search, Award, Flame } from 'lucide-react';
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

interface ClubRegionItem {
  name: string;
  query: string;
  city: string;
  specialty: string;
}

interface ClubRegion {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  clubs: ClubRegionItem[];
}

const CLUB_REGIONS: ClubRegion[] = [
  {
    id: 'avignon',
    title: 'GRAND AVIGNON & PLAINE',
    subtitle: '8 clubs & groupes d\'entraînement sur Avignon, Le Pontet, Sorgues...',
    icon: '🏛️',
    clubs: [
      { name: 'CAS Avignon (CASA)', query: 'CAS Avignon', city: 'Avignon', specialty: 'Piste, Hors-Stade & FFA' },
      { name: 'CS Avignon Montfavet (CSAMA)', query: 'CS Avignon Montfavet', city: 'Montfavet', specialty: 'Piste & Running convivial' },
      { name: 'Grand Avignon Mistral (GAMA)', query: 'Grand Avignon Mistral', city: 'Avignon', specialty: 'Demi-fond & Santé' },
      { name: 'US Le Pontet Athlétisme', query: 'US Le Pontet', city: 'Le Pontet', specialty: 'Stade Montbord • Route, Trail' },
      { name: 'ASVA Villeneuve', query: 'ASVA Villeneuve', city: 'Villeneuve', specialty: 'Stade Sagnes • Running, Trail' },
      { name: 'Sorgues Athlé 84', query: 'Sorgues Athlé', city: 'Sorgues', specialty: 'Stade Badaffier • Running' },
      { name: 'Les 5 Pas de Courthézon', query: 'Courthézon', city: 'Courthézon', specialty: 'Hors-stade & Trail' },
      { name: 'OVTLN', query: 'OVTLN', city: 'Entraigues', specialty: 'Course nature & Sorties groupe' }
    ]
  },
  {
    id: 'ventoux',
    title: 'VENTOUX & COMTAT VENAISSIN',
    subtitle: '7 clubs au pied du Géant de Provence et des Dentelles',
    icon: '⛰️',
    clubs: [
      { name: 'UA Carpentras (UAC)', query: 'UA Carpentras', city: 'Carpentras', specialty: 'Stade Roseraie • Piste, Trail' },
      { name: 'Athlé Vaison Ventoux', query: 'Athlé Vaison Ventoux', city: 'Vaison', specialty: 'Route, Trail & Jeunes' },
      { name: 'Team PAPA', query: 'Team PAPA', city: 'Pernes', specialty: 'Trail & Ultra endurance' },
      { name: 'Terra Sport Ventoux', query: 'Terra Sport Ventoux', city: 'Pernes/Ventoux', specialty: 'Trail technique & D+' },
      { name: 'Ventoux Organisation', query: 'Ventoux Organisation', city: 'Bédoin', specialty: 'Sorties Massif du Ventoux' },
      { name: 'La Foulée Montilienne', query: 'Foulée Montilienne', city: 'Monteux', specialty: 'Running route & Loisir' },
      { name: 'La Loriolade', query: 'La Loriolade', city: 'Loriol', specialty: 'Course nature & Convivialité' }
    ]
  },
  {
    id: 'luberon',
    title: 'LUBERON & PAYS D\'APT',
    subtitle: '8 clubs entre ocres, falaises, Sorgues et Sud Luberon',
    icon: '🌿',
    clubs: [
      { name: 'AS Cavaillon Athletic (ASC)', query: 'AS Cavaillon', city: 'Cavaillon', specialty: 'Stade Pagnetti • Piste, Route, Trail' },
      { name: 'DénivLuberon', query: 'DénivLuberon', city: 'Robion/Apt', specialty: 'Trail engagé & Dénivelé' },
      { name: 'Union Sport Apt (USALV)', query: 'Union Sport Apt', city: 'Apt', specialty: 'Stade de Bosque • Route & Trail' },
      { name: 'U Sault Apt Luberon Ventoux', query: 'U Sault Apt', city: 'Sault & Apt', specialty: 'Haute Provence • Nature' },
      { name: 'BC Isle sur la Sorgue (BCI)', query: 'BC Isle sur la Sorgue', city: "L'Isle-sur-Sorgue", specialty: 'Stade Névons • Piste & Trail' },
      { name: 'Ménerbes Running', query: 'Ménerbes Running', city: 'Ménerbes', specialty: 'Sentiers du Luberon' },
      { name: 'Goult Rockets Runners', query: 'Goult Rockets', city: 'Goult', specialty: 'Collines & Sorties plaisir' },
      { name: 'Piémont Club', query: 'Piémont Club', city: 'Pertuis', specialty: 'Sud Luberon • Piste & Hors-stade' }
    ]
  },
  {
    id: 'nord',
    title: 'HAUT VAUCLUSE & ENCLAVE',
    subtitle: '8 clubs sur Orange, Bollène, Valréas, Mornas...',
    icon: '🍇',
    clubs: [
      { name: 'UA Orange Haut Vaucluse', query: 'UA Orange Haut Vaucluse', city: 'Orange', specialty: 'Stade Clapier • Piste & Route' },
      { name: 'Running Orange Club (ROC 84)', query: 'Running Orange Club', city: 'Orange', specialty: 'Running route & Convivialité' },
      { name: 'Orange Sports Athlé (OSAN)', query: 'OSAN', city: 'Orange/Sérignan', specialty: 'Trail & Course nature' },
      { name: 'ACEP Valréas', query: 'ACEP Valréas', city: 'Valréas', specialty: 'Route, Trail & Cross' },
      { name: 'Bollène Athlétique Club (BAC)', query: 'Bollène Athlétique', city: 'Bollène', specialty: 'Piste, Running & Jeunes' },
      { name: 'CAP Bollène', query: 'CAP Bollène', city: 'Bollène', specialty: 'Hors-stade & Trail' },
      { name: 'Les Foulées de Mornas', query: 'Foulées de Mornas', city: 'Mornas', specialty: 'Chemins de la forteresse' },
      { name: 'ES Nord Vaucluse (ESNV)', query: 'ESNV', city: 'Orange-Bollène', specialty: 'Entente territoriale FFA' }
    ]
  }
];

const POPULAR_RUNNERS: ReelRunnerData[] = [
  {
    name: 'Didier Bresson',
    club: 'Allianz Bresson Carpentras',
    count: 12,
    totalKm: 164,
    wins: 0,
    grade: 'Pilier du Peloton'
  },
  {
    name: 'Chantal Jacob',
    club: 'AS Apt & Ventoux Trail',
    count: 22,
    totalKm: 246,
    wins: 0,
    grade: 'Légende du 84'
  },
  {
    name: 'Alexandre Reymonet',
    club: '1000 Pattes du Pontet',
    count: 22,
    totalKm: 238,
    wins: 1,
    grade: 'Légende du 84'
  },
  {
    name: 'Bruno Dallara',
    club: 'Big Pig',
    count: 18,
    totalKm: 181,
    wins: 0,
    grade: 'Légende du 84'
  },
  {
    name: 'Clara Entresangle',
    club: 'AS Cavaillon',
    count: 8,
    totalKm: 75,
    wins: 6,
    grade: 'Championne du 84'
  },
  {
    name: 'Romain Legendre',
    club: 'UA Carpentras',
    count: 6,
    totalKm: 60,
    wins: 4,
    grade: 'Recordman 84'
  }
];

interface Props {
  races: Race[];
  latestWinners: LatestWinnerRace[];
}

export default function StudioClient({ races, latestWinners }: Props) {
  const [mode, setMode] = useState<'weekend' | 'podiums' | 'new_race' | 'clubs' | 'story' | 'reel'>('new_race');

  // Reel Motion State (Carte Coureur & Recherche)
  const [reelTime, setReelTime] = useState(0);
  const [reelPlaying, setReelPlaying] = useState(true);
  const [selectedRunnerIndex, setSelectedRunnerIndex] = useState(0);
  const [customRunnerName, setCustomRunnerName] = useState('');
  const [customRunnerClub, setCustomRunnerClub] = useState('');
  const [customRunnerCount, setCustomRunnerCount] = useState<number>(12);
  const [customRunnerKm, setCustomRunnerKm] = useState<number>(164);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const currentRunner: ReelRunnerData = customRunnerName.trim()
    ? {
        name: customRunnerName.trim(),
        club: customRunnerClub.trim() || 'Coureur Vaucluse',
        count: customRunnerCount,
        totalKm: customRunnerKm,
        wins: 0,
        grade: customRunnerCount >= 10 ? 'Légende du 84' : customRunnerCount >= 5 ? 'Pilier du Peloton' : 'Finisher Régulier'
      }
    : (POPULAR_RUNNERS[selectedRunnerIndex] || POPULAR_RUNNERS[0]);

  useEffect(() => {
    if (mode !== 'reel' || !reelPlaying) return;
    const interval = setInterval(() => {
      setReelTime((prev) => {
        const next = Math.round((prev + 0.05) * 100) / 100;
        return next >= 12.0 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [mode, reelPlaying]);

  const exportReelVideo = async () => {
    setIsExportingVideo(true);
    setExportProgress(0);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExportingVideo(false);
        return;
      }

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reel-wall-of-fame-runvaucluse.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
        setExportProgress(100);
      };

      recorder.start();

      const totalFrames = 360;
      for (let f = 0; f < totalFrames; f++) {
        const t = f / 30;
        drawReelFrame(ctx, 1080, 1920, t, currentRunner);
        setExportProgress(Math.round((f / totalFrames) * 100));
        if (f % 15 === 0) {
          await new Promise((r) => setTimeout(r, 4));
        }
      }

      recorder.stop();
    } catch (err) {
      console.error('Error exporting Reel video:', err);
      setIsExportingVideo(false);
    }
  };
  
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
    return races.find(r => r.slug === 'traversee-des-dentelles-gigondas')?.slug || races.find(r => r.slug === 'utlm-backyard-ultra-monteux')?.slug || races.find(r => r.slug === 'trail-nocturne-de-bonnieux-bonnieux')?.slug || races.find(r => r.slug === 'la-vigneronde-puget')?.slug || races[0]?.slug || '';
  });

  // Clubs Carrousel State
  const [clubsType, setClubsType] = useState<'guide' | 'call'>('guide');
  const [clubContactEmail, setClubContactEmail] = useState('contact@runvaucluse.fr');
  const [clubInstagramTag, setClubInstagramTag] = useState('@runvaucluse.fr');
  const [clubsCoverMode, setClubsCoverMode] = useState<'all' | 'featured'>('all');

  // Story State
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>(
    races.find(r => r.slug === 'utlm-backyard-ultra-monteux')?.slug || races[0]?.slug || ''
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
  }, [mode, selectedPodiumSlugs, selectedStorySlug, selectedNewRaceSlug, clubsType]);

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
    totalSlides = clubsType === 'guide' ? 7 : 4; // Guide: Cover + Pourquoi + 4 Régions + CTA | Call: 4 slides
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
      if (race.slug === 'utlm-backyard-ultra-monteux') {
        return `🔔 TOP DÉPART // UTLM BACKYARD ULTRA 2026 ! ⏳🔥\n\nC'est parti aujourd'hui à 14h00 au Domaine de Beauregard (Lac de Monteux) pour la 5ème édition de l'Ultra Tour du Lac de Monteux Backyard Ultra !\n\nLe concept officiel « Last One Standing » créé par Lazarus Lake :\n🔄 Une boucle de 6,706 km (18m D+) avec vue sur le Mont Ventoux et les Dentelles\n⏱️ Moins d'une heure pour boucler chaque tour\n🔔 Nouveau départ toutes les heures à la cloche, sans aucun retard toléré\n🛌 Le temps restant sert à manger, soigner ses pieds, dormir 10 minutes... ou douter !\n🏆 Règle absolue : il n'y a qu'UN SEUL finisher et unique vainqueur. Tous les autres coureurs finissent DNF (Did Not Finish).\n\n130 guerriers et guerrières prennent le départ cet après-midi. Qui sera le dernier homme ou la dernière femme debout ? Combien de boucles seront courues ? 24h (100 miles) ? 36h ? 48h+ ?\n\n👉 Retrouvez la présentation de l'épreuve et les actualités sur :\n🔗 WWW.RUNVAUCLUSE.FR (Lien en bio)\n\n💬 À vos pronostics en commentaire : combien de tours pour le vainqueur selon vous ? 👇\n\n#runvaucluse #utlm #utlmby #backyardultra #lastonestanding #lazaruslake #monteux #vaucluse #runningvaucluse #trailvaucluse #ultratrail #courseapied #ultraendurance #defi #lacdemonteux`;
      }
      if (race.slug === 'traversee-des-dentelles-gigondas') {
        return `🏔️ OUVERTURE DES INSCRIPTIONS // LA TRAVERSÉE DES DENTELLES 2027 ! 🏃‍♂️⚡\n\nC’est officiel : les inscriptions pour la 39ème édition de la Traversée des Dentelles de Gigondas viennent d’ouvrir sur la plateforme Finishers ! 🍇⛰️\n\nUn grand week-end de trail sur 2 JOURS complets au cœur du massif spectaculaire des Dentelles de Montmirail :\n📅 Dates : Samedi 5 & Dimanche 6 Juin 2027\n📍 Lieu : Gigondas (Vaucluse)\n🎟️ Inscriptions officielles : sur @finishers_fr (Finishers)\n\n🔥 2 JOURS, 2 AMBIANCES, 5 ÉPREUVES :\n\n🌅 LE SAMEDI 5 JUIN // FORMATS COURTS & SOIRÉE FESTIVE\nPour lancer le week-end entre vignes, pinèdes et convivialité provençale :\n🔹 17h30 • LA GAMBADE (11 km • 420m D+) : tracé dynamique et abordable\n🔹 17h35 • LA PETITE GAMBADE (5 km • 210m D+) : parfait pour débuter ou aller vite\n🔹 17h40 • MARCHE DES DENTELLES (11 km • 420m D+) : randonnée sportive au cœur du massif\n🔹 COURSES ENFANTS : Kids (1 km) & Mini Kids (200 m)\n🎉 Suivi de l'ambiance festive, du terroir et de la fête au village de Gigondas !\n\n☀️ LE DIMANCHE 6 JUIN // LES GRANDS DÉFIS EN ALTITUDE\nPour les amoureux de grand spectacle et de dénivelé au lever du soleil :\n🔹 05h30 • MARATHON DES DENTELLES (42 km • 2 000m D+) : le défi ultime à l'aube sur les crêtes techniques et sauvages du massif\n🔹 08h00 • LA TRAVERSÉE DES DENTELLES (21 km • 600m D+) : l'épreuve reine historique face au Mont Ventoux\n\nQue vous veniez en solo pour défier les crêtes, entre amis pour le week-end complet ou en famille pour profiter du village vigneron, c'est l'un des plus beaux rendez-vous trail de Provence !\n\nSur RUNVAUCLUSE.FR, la fiche complète est en ligne :\n📍 Détail des 5 parcours & profils de dénivelé\n⏰ Horaires des 2 jours de course\n🎟️ Lien direct d'inscription Finishers\n\n👉 Rendez-vous sur le site :\n🔗 WWW.RUNVAUCLUSE.FR (Lien direct en bio !)\n\n💾 Enregistrez ce post pour bloquer votre week-end 2027 et taguez votre équipe de trail en commentaire ! 👇\n\n#runvaucluse #traverseedesdentelles #dentellesdemontmirail #gigondas #trailvaucluse #runningvaucluse #finishers #marathondesdentelles #trailfrance #montventoux #vaucluse #courseapied #provence #trailrunning #outdoorprovence`;
      }
      if (race.slug === 'marathon-davignon-avignon') {
        return `🔥 ANNONCE OFFICIELLE // 2ÈME ÉDITION DU MARATHON D'AVIGNON ! 🏃‍♂️⚡\n\nBloquez la date : le Dimanche 14 mars 2027, la Cité des Papes accueillera la 2ème édition de son grand Marathon et Semi-Marathon officiel ! 🏰🏅\n\nLes infos clés officielles :\n📅 Date : Dimanche 14 mars 2027\n🎟️ 6 000 dossards au total (3 000 sur le semi / 3 000 sur le marathon)\n⭐ Parcours labellisés FFA sur les 2 distances (qualificatif Championnats de France)\n⏱️ Inscriptions : ouverture AVANT FIN OCTOBRE sur la plateforme unique Finishers !\n🤝 Partenaires majeurs : NGE & Ville d'Avignon\n\nAvec son tracé ultra-plat au cœur des remparts du XIVe siècle et sur l'Île de la Barthelasse, c'est l'épreuve parfaite pour exploser votre record personnel ou réussir votre premier marathon !\n\nSur RUNVAUCLUSE.FR, nous venons de mettre à jour le DOSSIER COMPLET :\n📍 Tracés GPX interactifs\n📈 Profil altimétrique et analyse tactique coach STAPS\n⏱️ Toutes les infos sur les 6 000 dossards et l'ouverture des inscriptions\n\n👉 Retrouvez le dossier dès maintenant sur le site :\n🔗 WWW.RUNVAUCLUSE.FR (Lien en bio !)\n\n💾 Enregistrez ce post et identifiez vos potes pour ne pas rater l'ouverture des dossards fin octobre ! 👇\n\n#runvaucluse #marathonavignon #semimarathonavignon #avignon #finishers #vaucluse #runningvaucluse #courseapied #marathon #semimarathon #ffa #nge #course2027`;
      }
      const dateFormatted = new Date(race.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return `✨ NOUVEAU DOSSARD EN VAUCLUSE // ${race.name.toUpperCase()} !\n\nUne nouvelle course vient d'être ajoutée au calendrier officiel sur RUNVAUCLUSE.FR 🏃‍♂️⚡\n\n📅 Date : ${dateFormatted}\n📍 Lieu : ${race.city} (Vaucluse)\n📏 Formats : ${race.distances}\n${race.label ? `🏷️ Label : ${race.label}\n` : ''}${race.contact ? `👥 Organisation : ${race.contact}\n` : ''}\n${race.description ? `${race.description.slice(0, 280)}...\n\n` : ''}👉 Retrouvez la fiche complète, le parcours et le lien direct d'inscription officielle sur :\n🔗 WWW.RUNVAUCLUSE.FR (Lien en bio)\n\n💾 Enregistrez ce post pour votre calendrier de courses et taguez vos amis partants ! 👇\n\n#runvaucluse #runningvaucluse #trailvaucluse #${race.city.toLowerCase().replace(/[^a-z0-9]/g, '')} #courseapied #dossard #vaucluse #provence #calendriercourses`;
    } else if (mode === 'clubs') {
      if (clubsType === 'guide') {
        return `🏃‍♂️ TU COURS ENCORE TOUT SEUL DANS TON COIN ?

Si tu as du mal à te motiver l'hiver, si tu stagnes sur tes chronos sur 10 km ou semi, ou si tu cherches simplement un groupe sympa pour partager tes sorties longues le dimanche... Il y a forcément un club fait pour toi dans le 84 ! 💥

Dans le Vaucluse, ce sont désormais 31 CLUBS ET ASSOCIATIONS d'athlétisme, de trail et de running qui vous accueillent, quel que soit votre niveau (du grand débutant au marathonien sub-3h) !

👉 POURQUOI REJOINDRE UN CLUB ?
1️⃣ La régularité : fini les séances sautées après le boulot.
2️⃣ La piste d'athlétisme : des séances de fractionné calibrées pour progresser sans se blesser.
3️⃣ L'ambiance : des partenaires de sortie, des covoiturages sur les courses locales et des apéros d'après-séance !

---

📍 OÙ TROUVER VOTRE CLUB DANS LE VAUCLUSE ?

🏛️ GRAND AVIGNON :
• CAS Avignon (CASA) • CS Avignon Montfavet (CSAMA) • US Le Pontet • GAMA • ASVA Villeneuve • Sorgues Athlé • Courthézon • OVTLN Entraigues

⛰️ VENTOUX & COMTAT :
• UA Carpentras • Athlé Vaison Ventoux • Team PAPA Pernes • Terra Sport Ventoux • Ventoux Organisation • La Foulée Montilienne • La Loriolade

🌿 LUBERON & SORGUES :
• AS Cavaillon • DénivLuberon Robion • US Apt & USALV Sault • BCI Isle-sur-la-Sorgue • Ménerbes Running • Goult Rockets • Piémont Club Pertuis

🍇 HAUT VAUCLUSE & ENCLAVE :
• UAOHV Orange • ROC 84 Orange • OSAN Orange • ACEP Valréas • BAC & CAP Bollène • Mornas • ESNV

---

🔎 HORAIRES & DÉTAILS DES SÉANCES :
Tous les jours d'entraînement, lieux de rendez-vous (stades / collines), tarifs des licences et contacts des coachs sont répertoriés sur notre annuaire :
🔗 WWW.RUNVAUCLUSE.FR (Lien direct en bio @runvaucluse.fr)

💬 QUESTION : Tu cours en solo ou en club ? Tague ton club ou ton pote de course en commentaire ! 👇

💾 Sauvegarde ce carrousel pour retrouver tous les clubs du département à tout moment !

#runvaucluse #runningvaucluse #trailvaucluse #athlevaucluse #clubrunning #courirvaucluse #courseapied #avignon #carpentras #cavaillon #orange #apt #bollene #islesurlasorgue #vaucluse #runningfrance`;
      }
      return `📢 APPEL À TOUS LES CLUBS & ASSOCIATIONS DU VAUCLUSE ! 🏃‍♂️🏃‍♀️\n\nLe Vaucluse regorge de clubs passionnés, de groupes d’entraînement chaleureux et de coachs engagés.\n\nSur RUNVAUCLUSE.FR, nous voulons offrir à chaque coureur vauclusien — qu’il soit débutant, traileur ou compétiteur — un annuaire complet et précis pour trouver le club qui lui correspond.\n\n👉 Responsables, coachs ou coureurs : aidez-nous à compléter la fiche de votre club !\n\nEnvoyez-nous simplement :\n1️⃣ Une courte présentation de votre club (l’esprit, vos spécialités : route, trail, piste, loisir, jeunes…)\n2️⃣ Vos créneaux et horaires d’entraînement (jours, heures et lieux de rendez-vous)\n3️⃣ Vos liens d’inscriptions et contacts officiels (site, mail, réseaux)\n\n📩 Pour nous les envoyer :\n• En message privé directement ici (${clubInstagramTag})\n• Par mail à : ${clubContactEmail}\n\nC’est 100% gratuit et ouvert à toutes les structures du département (FFA, FSGT, UFOLEP ou assos running indépendantes).\n\n👇 Tague ton club, ton président ou tes partenaires d’entraînement en commentaire pour qu’ils ne manquent pas le train !\n\n---\n#runvaucluse #runningvaucluse #trailvaucluse #athlevaucluse #clubathletisme #clubrunning #vaucluse #avignon #carpentras #cavaillon #orange #apt #bollene #islesurlasorgue #courirconvivialite #courseapied`;
    } else if (mode === 'story') {
      if (activeStoryRace.slug === 'utlm-backyard-ultra-monteux') {
        return `🔔 TOP DÉPART : UTLM BACKYARD ULTRA AU LAC DE MONTEUX !\n\n130 coureurs au départ, boucle de 6,706 km chaque heure. 1 seul finisher, tous les autres DNF !\n\n👉 Retrouvez toutes les infos sur RUNVAUCLUSE.FR (Lien en bio) !\n\n#runvaucluse #utlm #backyardultra #lastonestanding #monteux #courseapied`;
      }
      return `⚡ J - 7 AVANT LE DÉPART : ${activeStoryRace.name.toUpperCase()} !\n\nLes inscriptions approchent de la clôture à ${activeStoryRace.city}. Format : ${activeStoryRace.distances}.\n\n👉 Réservez votre dossard directement sur RUNVAUCLUSE.FR (Lien en bio) !\n\n#runvaucluse #courseapied #${activeStoryRace.city.toLowerCase().replace(/[^a-z]/g, '')}`;
    } else if (mode === 'reel') {
      return `🏃‍♂️ TU AS COURU DANS LE VAUCLUSE CETTE ANNÉE ? TA CARTE COUREUR EST DISPONIBLE ! 🪪⚡\n\nQue tu aies fait 1 course de village ou 20 trails, toutes tes stats 2026/2027 sont réunies sur une seule carte officielle :\n\n✅ Nombre de dossards terminés\n✅ Distance totale parcourue en compétition\n✅ Podiums et classements\n✅ Badge de saison (Légende du 84, Pilier du peloton...)\n\n👉 Tape ton prénom et nom sur RUNVAUCLUSE.FR/COUREUR (Lien direct en bio 🔗) pour générer ta carte et la partager en Story !\n\n💬 Tague ton club et tes potes de course en commentaire pour qu'ils découvrent leur bilan ! 👇\n\n#runvaucluse #runningvaucluse #trailvaucluse #cartecoureur #bilanrunning #vaucluse #courseapied #avignon #cavaillon #carpentras #orange #apt #trailduventoux #instarunfrance`;
    }
    return '';
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generateCaption() || '');
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
              <Users size={18} /> Carrousel "Guide des Clubs"
            </button>
            <button 
              className={`${styles.tabBtn} ${mode === 'story' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('story'); setActiveSlideIndex(0); }}
            >
              <Zap size={18} /> Story "Focus Course J-7"
            </button>
            <button 
              className={`${styles.tabBtn} ${mode === 'reel' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMode('reel'); setReelPlaying(true); setReelTime(0); }}
            >
              <Film size={18} /> Reel Motion "Carte Coureur"
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

            {/* CLUBS MODE CONTROLS */}
            {mode === 'clubs' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Users size={18} /> Carrousel Clubs & Assos
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Type de carrousel</label>
                  <div className={styles.displayModeGrid}>
                    <button
                      type="button"
                      className={`${styles.displayModeBtn} ${clubsType === 'guide' ? styles.displayModeBtnActive : ''}`}
                      onClick={() => setClubsType('guide')}
                    >
                      <Compass size={15} /> Guide Coureurs (7 slides)
                    </button>
                    <button
                      type="button"
                      className={`${styles.displayModeBtn} ${clubsType === 'call' ? styles.displayModeBtnActive : ''}`}
                      onClick={() => setClubsType('call')}
                    >
                      <Users size={15} /> Appel Dirigeants (4 slides)
                    </button>
                  </div>
                </div>

                {clubsType === 'guide' ? (
                  <div className={styles.formGroup}>
                    <p style={{ color: 'rgba(250, 247, 242, 0.75)', fontSize: '0.85rem', lineHeight: '1.45', margin: 0 }}>
                      Ce carrousel 7 slides présente l&apos;intégralité des <strong>{clubsData.length} clubs</strong> aux coureurs par secteur géographique (Grand Avignon, Ventoux, Luberon, Haut Vaucluse) pour les aider à choisir leur club cette saison.
                    </p>
                  </div>
                ) : (
                  <>
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
                          <Users size={15} /> Les {clubsData.length} clubs (Mosaïque)
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

            {/* REEL RUNNER CARD CONTROLS */}
            {mode === 'reel' && (
              <>
                <h3 className={styles.controlsSectionTitle}>
                  <Film size={18} /> Configuration Reel "Carte Coureur"
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Coureur de Démonstration</label>
                  <select 
                    className={styles.selectInput}
                    value={selectedRunnerIndex}
                    onChange={(e) => {
                      setSelectedRunnerIndex(parseInt(e.target.value));
                      setCustomRunnerName('');
                    }}
                  >
                    {POPULAR_RUNNERS.map((runner, idx) => (
                      <option key={idx} value={idx}>
                        {runner.name} ({runner.club}) — {runner.count} courses ({runner.totalKm} km)
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Ou Personnaliser un Athlète</label>
                  <input 
                    type="text"
                    className={styles.selectInput}
                    placeholder="Nom Prénom (ex: Didier Bresson)"
                    value={customRunnerName}
                    onChange={(e) => setCustomRunnerName(e.target.value)}
                    style={{ marginBottom: '0.4rem' }}
                  />
                  {customRunnerName.trim() && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                      <input 
                        type="text"
                        className={styles.selectInput}
                        placeholder="Club"
                        value={customRunnerClub}
                        onChange={(e) => setCustomRunnerClub(e.target.value)}
                      />
                      <input 
                        type="number"
                        className={styles.selectInput}
                        placeholder="Courses"
                        value={customRunnerCount}
                        onChange={(e) => setCustomRunnerCount(parseInt(e.target.value) || 0)}
                      />
                      <input 
                        type="number"
                        className={styles.selectInput}
                        placeholder="Total Km"
                        value={customRunnerKm}
                        onChange={(e) => setCustomRunnerKm(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Contrôle de l'Animation (12s)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <button 
                      onClick={() => setReelPlaying(!reelPlaying)}
                      className={styles.actionBtn}
                      style={{ flex: 1, padding: '0.6rem' }}
                    >
                      {reelPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {reelPlaying ? 'Mettre en pause' : 'Lancer la lecture'}
                    </button>
                    <button 
                      onClick={() => { setReelTime(0); setReelPlaying(true); }}
                      className={styles.actionBtn}
                      style={{ padding: '0.6rem' }}
                      title="Recommencer"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                    <button 
                      onClick={() => { setReelTime(1.2); setReelPlaying(false); }}
                      className={styles.actionBtn}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', opacity: reelTime < 3.2 ? 1 : 0.7 }}
                    >
                      Scène 1 : Recherche
                    </button>
                    <button 
                      onClick={() => { setReelTime(4.8); setReelPlaying(false); }}
                      className={styles.actionBtn}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', opacity: reelTime >= 3.2 && reelTime < 7.2 ? 1 : 0.7 }}
                    >
                      Scène 2 : Carte Coureur
                    </button>
                    <button 
                      onClick={() => { setReelTime(8.2); setReelPlaying(false); }}
                      className={styles.actionBtn}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', opacity: reelTime >= 7.2 && reelTime < 9.5 ? 1 : 0.7 }}
                    >
                      Scène 3 : 24K Cartes
                    </button>
                    <button 
                      onClick={() => { setReelTime(10.5); setReelPlaying(false); }}
                      className={styles.actionBtn}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', opacity: reelTime >= 9.5 ? 1 : 0.7 }}
                    >
                      Scène 4 : Outro Story
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Export Vidéo Instagram Reel</label>
                  <button 
                    onClick={exportReelVideo}
                    disabled={isExportingVideo}
                    className={styles.downloadBtn}
                    style={{ background: 'linear-gradient(135deg, #EB5E28, #F6C83B)', color: '#0D1013', fontWeight: 800 }}
                  >
                    <Film size={18} />
                    {isExportingVideo ? `Génération vidéo HD... (${exportProgress}%)` : 'Exporter la Vidéo (WebM 1080p)'}
                  </button>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'rgba(250, 247, 242, 0.6)' }}>
                    Génère le Reel vertical (9:16) 1080×1920 fluide avec la recherche et la carte de {currentRunner.name}.
                  </p>
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
            {mode === 'reel' ? (
              <div className={styles.reelContainer}>
                {/* Visual Canvas (capturable by toPng as well) */}
                <div 
                  ref={canvasRef}
                  className={styles.reelCanvas}
                >
                  <div className={styles.reelBackgroundOverlay} />
                  <div className={styles.reelGlowOrb1} />
                  <div className={styles.reelGlowOrb2} />

                  {/* Progress Bar */}
                  <div className={styles.reelProgressBarContainer}>
                    <div 
                      className={styles.reelProgressBarFill}
                      style={{ width: `${(reelTime / 12) * 100}%` }}
                    />
                  </div>

                  {/* Header */}
                  <div className={styles.reelBrandHeader}>
                    <div className={styles.reelLogo}>
                      <LogoIcon size={26} /> RUNVAUCLUSE
                    </div>
                    <span className={styles.reelSceneBadge}>
                      {reelTime < 3.2 && '🔍 RECHERCHE COUREUR'}
                      {reelTime >= 3.2 && reelTime < 7.2 && '🪪 CARTE OFFICIELLE'}
                      {reelTime >= 7.2 && reelTime < 9.5 && '📊 24K CARTES'}
                      {reelTime >= 9.5 && '🔥 GÉNÈRE TA CARTE'}
                    </span>
                  </div>

                  {/* Content Zone */}
                  <div className={styles.reelContentZone}>
                    {/* SCENE 1 : HOOK & LIVE SEARCH */}
                    {reelTime < 3.2 && (
                      <div className={styles.reelHookZone} key="scene-1">
                        <span className={styles.reelHookPill}>
                          <Sparkles size={14} /> BILAN OFFICIEL DE SAISON 2026/2027
                        </span>
                        <h2 className={styles.reelHookTitle}>
                          TU AS COURU DANS LE 84 <br /><span className={styles.reelHookHighlight}>CETTE ANNÉE ?</span>
                        </h2>

                        <div className={styles.reelSearchSimulationBox}>
                          <div className={styles.reelSearchInputRow}>
                            <Search size={18} color="#F6C83B" />
                            <span className={styles.reelSearchTypingText}>
                              {currentRunner.name.slice(0, Math.floor(Math.min(1, reelTime / 1.8) * currentRunner.name.length))}
                            </span>
                            <span className={styles.reelSearchCursor} />
                          </div>

                          {reelTime >= 2.0 && (
                            <div className={styles.reelSearchResultPill}>
                              <span>✓ 1 profil trouvé : <strong>{currentRunner.name}</strong></span>
                              <span style={{ color: '#F6C83B', fontSize: '0.7rem' }}>{currentRunner.club}</span>
                            </div>
                          )}

                          {reelTime >= 2.6 && (
                            <div style={{ textAlign: 'center', background: '#F6C83B', color: '#0D1013', borderRadius: '8px', padding: '0.45rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                              GÉNÉRER MA CARTE COUREUR ➔
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SCENE 2 : THE RUNNER CARD REVEAL */}
                    {reelTime >= 3.2 && reelTime < 7.2 && (
                      <div className={styles.reelCardContainer} key="scene-2">
                        <div style={{ textAlign: 'center', marginBottom: '0.45rem' }}>
                          <span style={{ color: '#EB5E28', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px' }}>
                            TOUTES TES STATS EN UN CLIC
                          </span>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', color: '#FAF7F2', margin: 0, letterSpacing: '0.5px' }}>
                            TA CARTE OFFICIELLE DE SAISON 🪪
                          </h3>
                        </div>

                        <div className={styles.reelStoryCard}>
                          <div className={styles.reelStoryCardShine} />

                          <div className={styles.reelCardHeader}>
                            <div className={styles.reelCardBrand}>
                              <LogoIcon size={18} /> RUNVAUCLUSE
                            </div>
                            <span className={styles.reelCardGradeBadge} style={{ background: 'rgba(246, 200, 59, 0.15)', border: '1px solid #F6C83B', color: '#F6C83B' }}>
                              👑 {currentRunner.grade.toUpperCase()}
                            </span>
                          </div>

                          <div className={styles.reelCardProfile}>
                            <div className={styles.reelCardAvatar}>
                              {currentRunner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <h4 className={styles.reelCardAthleteName}>
                              {currentRunner.name.toUpperCase()}
                            </h4>
                            <p className={styles.reelCardClubName}>
                              <MapPin size={12} /> {currentRunner.club}
                            </p>
                          </div>

                          <div className={styles.reelCardStatsGrid}>
                            <div className={styles.reelCardStatBox}>
                              <span className={styles.reelCardStatValue}>{currentRunner.count}</span>
                              <span className={styles.reelCardStatLabel}>🏃 DOSSARDS TERMINÉS</span>
                            </div>
                            <div className={styles.reelCardStatBox}>
                              <span className={styles.reelCardStatValue}>{currentRunner.totalKm} KM</span>
                              <span className={styles.reelCardStatLabel}>📍 DISTANCE COURSE</span>
                            </div>
                            <div className={styles.reelCardStatBox}>
                              <span className={styles.reelCardStatValue}>{currentRunner.wins > 0 ? `${currentRunner.wins}` : '100%'}</span>
                              <span className={styles.reelCardStatLabel}>🥇 {currentRunner.wins > 0 ? 'VICTOIRES / PODIUMS' : 'TAUX FINISHER'}</span>
                            </div>
                            <div className={styles.reelCardStatBox}>
                              <span className={styles.reelCardStatValue}>TOP 5%</span>
                              <span className={styles.reelCardStatLabel}>🏆 RANG DÉPARTEMENTAL</span>
                            </div>
                          </div>

                          <div className={styles.reelCardFooter}>
                            <span>RUNVAUCLUSE.FR/COUREUR</span>
                            <span style={{ color: '#F6C83B', fontWeight: 700 }}>SAISON 2026/2027 ⚡</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCENE 3 : 24K RUNNERS */}
                    {reelTime >= 7.2 && reelTime < 9.5 && (
                      <div className={styles.reelDatabaseZone} key="scene-3">
                        <span className={styles.reelHookPill} style={{ background: '#F6C83B', color: '#0D1013' }}>
                          <Award size={14} /> BILAN COMMUNAUTAIRE
                        </span>
                        <h2 className={styles.reelCounterDisplay}>24 655</h2>
                        <h3 className={styles.reelDatabaseLabel}>
                          CARTES DISPONIBLES DANS LE VAUCLUSE
                        </h3>
                        <div className={styles.reelStatBox}>
                          <Trophy size={24} color="#F6C83B" style={{ flexShrink: 0 }} />
                          <div style={{ fontSize: '0.8rem', lineHeight: '1.35' }}>
                            <div style={{ fontWeight: 700, color: '#FAF7F2' }}>Que tu aies fait 1 course ou 20 trails...</div>
                            <div style={{ color: '#F6C83B' }}>Toutes tes courses sont réunies sur ta carte ! 📲</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCENE 4 : OUTRO */}
                    {reelTime >= 9.5 && (
                      <div className={styles.reelOutroZone} key="scene-4">
                        <span className={styles.reelHookPill}>
                          <Flame size={14} /> GRATUIT & EN 1 CLIC
                        </span>
                        <h2 className={styles.reelOutroTitle}>
                          DÉCOUVRE TA <br /><span style={{ color: '#F6C83B' }}>CARTE COUREUR</span>
                        </h2>

                        <div className={styles.reelSearchBarMockup}>
                          <Search size={18} color="#F6C83B" />
                          <span>Tape ton nom sur runvaucluse.fr/coureur</span>
                        </div>

                        <div className={styles.reelCtaPill}>
                          TÉLÉCHARGE & PARTAGE EN STORY
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={styles.reelFooter}>
                    <span>RUNVAUCLUSE.FR/RECORDS</span>
                    <span className={styles.reelFooterHighlight}>
                      LIEN EN BIO <ChevronRight size={15} />
                    </span>
                  </div>
                </div>

                {/* Timeline & Player Bar */}
                <div className={styles.reelControlsToolbar}>
                  <div className={styles.reelTimelineRow}>
                    <button 
                      onClick={() => setReelPlaying(!reelPlaying)}
                      className={styles.navArrowBtn}
                      style={{ padding: '0.4rem', borderRadius: '8px' }}
                    >
                      {reelPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <input 
                      type="range"
                      min="0"
                      max="12"
                      step="0.1"
                      value={reelTime}
                      onChange={(e) => {
                        setReelTime(parseFloat(e.target.value));
                        setReelPlaying(false);
                      }}
                      className={styles.reelTimeSlider}
                    />

                    <span className={styles.reelTimeText}>
                      {reelTime.toFixed(1)}s / 12.0s
                    </span>
                  </div>

                  <div className={styles.reelButtonsRow}>
                    <div className={styles.reelScenesNav}>
                      <button 
                        onClick={() => { setReelTime(1.0); setReelPlaying(false); }}
                        className={`${styles.reelSceneBtn} ${reelTime < 3 ? styles.reelSceneBtnActive : ''}`}
                      >
                        Hook
                      </button>
                      <button 
                        onClick={() => { setReelTime(4.5); setReelPlaying(false); }}
                        className={`${styles.reelSceneBtn} ${reelTime >= 3 && reelTime < 6.2 ? styles.reelSceneBtnActive : ''}`}
                      >
                        24K Runners
                      </button>
                      <button 
                        onClick={() => { setReelTime(7.5); setReelPlaying(false); }}
                        className={`${styles.reelSceneBtn} ${reelTime >= 6.2 && reelTime < 9.5 ? styles.reelSceneBtnActive : ''}`}
                      >
                        Records
                      </button>
                      <button 
                        onClick={() => { setReelTime(10.5); setReelPlaying(false); }}
                        className={`${styles.reelSceneBtn} ${reelTime >= 9.5 ? styles.reelSceneBtnActive : ''}`}
                      >
                        Outro
                      </button>
                    </div>

                    <button 
                      onClick={exportReelVideo}
                      disabled={isExportingVideo}
                      className={styles.actionBtn}
                      style={{ background: '#EB5E28', color: '#FAF7F2', borderColor: '#EB5E28', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                    >
                      <Film size={14} /> {isExportingVideo ? `${exportProgress}%` : 'Export WebM'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
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
                            <span className={styles.slidePillTag}>
                              {race.slug === 'utlm-backyard-ultra-monteux' ? 'TOP DÉPART AUJOURD\'HUI 🔔' : race.slug === 'traversee-des-dentelles-gigondas' ? 'INSCRIPTIONS OUVERTES 🏔️' : 'NOUVEAU SUR LE SITE ✨'}
                            </span>
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
                                  <Calendar size={14} /> {race.slug === 'utlm-backyard-ultra-monteux' ? 'JEUDI 1ER OCTOBRE • 14H00' : race.slug === 'traversee-des-dentelles-gigondas' ? 'SAMEDI 5 & DIMANCHE 6 JUIN 2027' : dateFormatted}
                                </div>
                                <h3 className={styles.posterRaceName}>{race.name}</h3>
                                <div className={styles.raceSlideCity}>
                                  <MapPin size={15} /> {race.city} • VAUCLUSE
                                </div>
                                <div className={styles.raceSlideDistances} style={{ marginTop: '0.6rem' }}>
                                  {race.slug === 'utlm-backyard-ultra-monteux' ? (
                                    <>
                                      <span className={styles.raceSlideDistPill}>6,706 KM / HEURE</span>
                                      <span className={styles.raceSlideDistPill}>LAST ONE STANDING</span>
                                      <span className={styles.raceSlideDistPill}>1 SEUL FINISHER</span>
                                    </>
                                  ) : (
                                    distList.map((dist, idx) => (
                                      <span key={idx} className={styles.raceSlideDistPill}>{dist}</span>
                                    ))
                                  )}
                                </div>
                                <div className={styles.posterBadges}>
                                  <span className={styles.posterTagBadge}>
                                    {race.slug === 'utlm-backyard-ultra-monteux' ? '🔥 5ÈME ÉDITION' : race.slug === 'traversee-des-dentelles-gigondas' ? '🔥 39ÈME ÉDITION • WEEK-END SUR 2 JOURS' : (race.label ? `🏷️ ${race.label.toUpperCase()}` : '📍 COURSE VAUCLUSE')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={styles.raceCardPosterBox}>
                                <img src={raceImage} alt={race.name} className={styles.racePosterImg} />
                              </div>
                              <div className={styles.raceSlideInfo}>
                                <div className={styles.raceSlideMetaRow}>
                                  <Calendar size={14} /> {race.slug === 'utlm-backyard-ultra-monteux' ? 'JEUDI 1ER OCTOBRE • 14H00' : dateFormatted}
                                </div>
                                <h3 className={styles.raceSlideName}>{race.name}</h3>
                                <div className={styles.raceSlideCity}>
                                  <MapPin size={15} /> {race.city} • VAUCLUSE
                                </div>
                                <div className={styles.raceSlideDistances} style={{ marginTop: '0.75rem' }}>
                                  {race.slug === 'utlm-backyard-ultra-monteux' ? (
                                    <>
                                      <span className={styles.raceSlideDistPill}>6,706 KM / HEURE</span>
                                      <span className={styles.raceSlideDistPill}>LAST ONE STANDING</span>
                                      <span className={styles.raceSlideDistPill}>1 SEUL FINISHER</span>
                                    </>
                                  ) : (
                                    distList.map((dist, idx) => (
                                      <span key={idx} className={styles.raceSlideDistPill}>{dist}</span>
                                    ))
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          <div className={styles.coverFooter}>
                            <span>{race.slug === 'utlm-backyard-ultra-monteux' ? 'LE CONCEPT & LES RÈGLES' : 'PROGRAMME & DÉTAILS'}</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 1: FORMATS & INFOS CLÉS */}
                      {activeSlideIndex === 1 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>
                              {race.slug === 'utlm-backyard-ultra-monteux' ? 'LE CONCEPT OFFICIEL 🔔' : 'AU PROGRAMME 📅'}
                            </span>
                          </div>

                          <div style={{ margin: '0.8rem 0 0.4rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#FAF7F2", margin: 0, letterSpacing: "1px" }}>
                              {race.slug === 'utlm-backyard-ultra-monteux' ? 'LAST ONE STANDING' : 'LES ÉPREUVES DU JOUR'}
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              {race.name} ({race.city})
                            </p>
                          </div>

                          {race.slug === 'utlm-backyard-ultra-monteux' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', margin: '0.8rem 0' }}>
                              <div style={{
                                background: 'linear-gradient(135deg, rgba(235, 94, 40, 0.16), rgba(250, 247, 242, 0.05))',
                                border: '1px solid rgba(235, 94, 40, 0.35)',
                                borderRadius: '12px',
                                padding: '0.85rem 0.95rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: '0.2rem',
                                textAlign: 'left'
                              }}>
                                <span style={{ fontSize: '0.68rem', color: '#F6C83B', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                  BOUCLE OFFICIELLE
                                </span>
                                <span style={{ fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)", fontSize: '1.65rem', fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, margin: '0.1rem 0' }}>
                                  6,706 KM
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.75)', lineHeight: 1.2 }}>
                                  Moins d&apos;1h par tour
                                </span>
                              </div>

                              <div style={{
                                background: 'linear-gradient(135deg, rgba(235, 94, 40, 0.16), rgba(250, 247, 242, 0.05))',
                                border: '1px solid rgba(235, 94, 40, 0.35)',
                                borderRadius: '12px',
                                padding: '0.85rem 0.95rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: '0.2rem',
                                textAlign: 'left'
                              }}>
                                <span style={{ fontSize: '0.68rem', color: '#F6C83B', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                  LE SIGNAL
                                </span>
                                <span style={{ fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)", fontSize: '1.65rem', fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, margin: '0.1rem 0' }}>
                                  À LA CLOCHE
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.75)', lineHeight: 1.2 }}>
                                  Départ toutes les heures
                                </span>
                              </div>

                              <div style={{
                                background: 'linear-gradient(135deg, rgba(235, 94, 40, 0.16), rgba(250, 247, 242, 0.05))',
                                border: '1px solid rgba(235, 94, 40, 0.35)',
                                borderRadius: '12px',
                                padding: '0.85rem 0.95rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: '0.2rem',
                                textAlign: 'left'
                              }}>
                                <span style={{ fontSize: '0.68rem', color: '#F6C83B', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                  RÈGLE IMPITOYABLE
                                </span>
                                <span style={{ fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)", fontSize: '1.65rem', fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, margin: '0.1rem 0' }}>
                                  1 FINISHER
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.75)', lineHeight: 1.2 }}>
                                  Tous les autres DNF
                                </span>
                              </div>

                              <div style={{
                                background: 'linear-gradient(135deg, rgba(235, 94, 40, 0.16), rgba(250, 247, 242, 0.05))',
                                border: '1px solid rgba(235, 94, 40, 0.35)',
                                borderRadius: '12px',
                                padding: '0.85rem 0.95rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: '0.2rem',
                                textAlign: 'left'
                              }}>
                                <span style={{ fontSize: '0.68rem', color: '#F6C83B', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                  PELOTON 2026
                                </span>
                                <span style={{ fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)", fontSize: '1.65rem', fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, margin: '0.1rem 0' }}>
                                  130 COUREURS
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.75)', lineHeight: 1.2 }}>
                                  Édition 100% complète
                                </span>
                              </div>
                            </div>
                          ) : (
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
                          )}

                          <div className={styles.newRaceFactsGrid}>
                            <div className={styles.newRaceFactCard}>
                              <span className={styles.newRaceFactLabel}><Calendar size={13} /> DATE</span>
                              <span className={styles.newRaceFactVal}>{race.slug === 'utlm-backyard-ultra-monteux' ? '1er oct. 14h' : new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
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
                              <span className={styles.newRaceFactLabel}><Timer size={13} /> FINISHER</span>
                              <span className={styles.newRaceFactVal}>{race.slug === 'utlm-backyard-ultra-monteux' ? '1 Unique' : (race.registration_platform || 'En ligne')}</span>
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>{race.slug === 'utlm-backyard-ultra-monteux' ? 'L\'ÉPREUVE MENTALE' : 'L\'ESPRIT DU DÉFI'}</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 2: PRÉSENTATION & AMBIANCE */}
                      {activeSlideIndex === 2 && (
                        <div className={styles.raceSlideCard}>
                          <div className={styles.slideBrandHeader}>
                            <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                            <span className={styles.slidePillTag}>
                              {race.slug === 'utlm-backyard-ultra-monteux' ? 'DÉFI MENTAL EXTRÊME ⚡' : 'L\'EXPÉRIENCE 🌟'}
                            </span>
                          </div>

                          <div style={{ margin: '0.8rem 0 0.4rem' }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#F6C83B", margin: 0, letterSpacing: "1px" }}>
                              {race.slug === 'utlm-backyard-ultra-monteux' ? 'LA GUERRE D\'USURE' : 'POURQUOI S\'INSCRIRE ?'}
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.7)", fontSize: "0.9rem" }}>
                              {race.name}
                            </p>
                          </div>

                          <div className={styles.newRaceDescCard}>
                            <p className={styles.newRaceDescText}>
                              {race.slug === 'traversee-des-dentelles-gigondas'
                                ? "Un festival trail complet sur 2 JOURS au pied des crêtes calcaires des Dentelles de Montmirail ! Le samedi soir : ambiance festive et formats accessibles (5 km, 11 km, marche et enfants). Le dimanche matin : les grands défis en altitude au lever du soleil (42 km Marathon 2000D+ et 21 km historique). Venez vivre l'esprit trail provençal, entre vignobles réputés et panoramas grandioses sur le Mont Ventoux !"
                                : race.slug === 'utlm-backyard-ultra-monteux'
                                ? "Imaginé par Lazarus Lake, le format Backyard Ultra pousse le corps et l'esprit au-delà de leurs limites. 6,7 km par heure paraît accessible, mais la nuit, le froid, la fatigue cumulée et la cloche qui sonne inlassablement transforment chaque départ en épreuve de volonté. Tant qu'il reste 2 coureurs en lice, la course ne s'arrête jamais !"
                                : (race.description || "Une expérience sportive et humaine incontournable au cœur des paysages du Vaucluse. Venez relever le défi et partager une journée conviviale avec tous les passionnés de course à pied de la région.")}
                            </p>
                            <div className={styles.newRaceContactPill}>
                              {race.slug === 'traversee-des-dentelles-gigondas'
                                ? '📍 Gigondas • 2 Jours de trail • Samedi soir & Dimanche matin'
                                : race.slug === 'utlm-backyard-ultra-monteux'
                                ? '📍 Domaine de Beauregard • Vue sur le Mont Ventoux'
                                : (race.contact ? `👥 Organisation : ${race.contact}` : '📍 Vaucluse (84)')}
                            </div>
                          </div>

                          <div className={styles.coverFooter}>
                            <span>{race.slug === 'utlm-backyard-ultra-monteux' ? 'PRONOSTIC & SUIVI' : 'COMMENT PARTICIPER'}</span>
                            <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                          </div>
                        </div>
                      )}

                      {/* SLIDE 3: CTA FINAL */}
                      {activeSlideIndex === 3 && (
                        <div className={styles.outroCard}>
                          <LogoIcon size={52} />
                          <h2 className={styles.outroBigTitle}>
                            {race.slug === 'utlm-backyard-ultra-monteux' ? 'QUE LE MEILLEUR GAGNE !' : 'INSCRIPTIONS OUVERTES !'}
                          </h2>
                          <p className={styles.outroDesc}>
                            {race.slug === 'utlm-backyard-ultra-monteux'
                              ? "Suivez l'évolution des rescapés, les infos officielles et les chronos de l'épreuve sur :"
                              : <>Retrouvez tous les détails, le règlement officiel et le lien d'inscription directe pour <strong>{race.name}</strong> sur :</>}
                          </p>
                          <div className={styles.outroUrlPill}>
                            {race.slug === 'utlm-backyard-ultra-monteux' ? 'WWW.RUNVAUCLUSE.FR' : 'RUNVAUCLUSE.FR'}
                          </div>
                          <div className={styles.savePostReminder}>
                            {race.slug === 'utlm-backyard-ultra-monteux'
                              ? '💬 Pronostic en commentaire : combien de tours selon vous ?'
                              : <><Bookmark size={18} /> Enregistre ce post pour ton prochain dossard !</>}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* =========================================================
                    MODE 5: CLUBS CAROUSEL SLIDES (GUIDE 7 SLIDES OU APPEL 4 SLIDES)
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

                  const getClubLogo = (query: string): string => {
                    const c = clubsData.find(item => item.name.toLowerCase().includes(query.toLowerCase()));
                    return c?.image_url || '/icon.svg';
                  };

                  // ----------------------------------------------------
                  // A. MODE GUIDE COUREURS (7 SLIDES PAR SECTEUR)
                  // ----------------------------------------------------
                  if (clubsType === 'guide') {
                    return (
                      <>
                        {/* SLIDE 0: COVER GUIDE */}
                        {activeSlideIndex === 0 && (
                          <div className={styles.raceSlideCard}>
                            <div className={styles.slideBrandHeader}>
                              <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                              <span className={styles.slidePillTag}>GUIDE COUREURS 2026/2027 🏃‍♂️</span>
                            </div>

                            <div style={{ margin: '0.4rem 0 0.1rem' }}>
                              <span style={{ 
                                fontFamily: 'var(--font-mono, monospace)', 
                                fontSize: '0.85rem', 
                                fontWeight: 700, 
                                color: '#F6C83B', 
                                letterSpacing: '1px',
                                textTransform: 'uppercase' 
                              }}>
                                ANNUAIRE DU RUNNING EN VAUCLUSE
                              </span>
                              <h2 style={{ 
                                fontFamily: 'var(--font-display, sans-serif)', 
                                fontSize: '2.5rem', 
                                lineHeight: '0.95', 
                                color: '#FAF7F2', 
                                margin: '0.4rem 0 0.5rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                              }}>
                                OÙ COURIR EN CLUB DANS LE VAUCLUSE ?
                              </h2>
                              <p style={{ 
                                color: 'rgba(250, 247, 242, 0.8)', 
                                fontSize: '0.88rem', 
                                lineHeight: '1.35', 
                                margin: 0 
                              }}>
                                Les <strong>31 clubs et assos</strong> du 84 pour ne plus courir seul, s&apos;entraîner en groupe et progresser cette saison.
                              </p>
                            </div>

                            {/* Clubs preview logos */}
                            <div className={styles.clubsCoverLogosGridAll}>
                              {allClubs.map((club, idx) => (
                                <div 
                                  key={idx} 
                                  className={styles.clubLogoMiniItemAll} 
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
                                ⚡ LES 31 CLUBS DU 84
                              </span>
                              <span className={styles.posterTagBadge} style={{ fontSize: '0.75rem', background: '#EB5E28' }}>
                                📍 4 GRANDS BASSINS
                              </span>
                            </div>

                            <div className={styles.coverFooter}>
                              <span>DÉCOUVREZ VOTRE SECTEUR</span>
                              <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                            </div>
                          </div>
                        )}

                        {/* SLIDE 1: POURQUOI REJOINDRE UN CLUB */}
                        {activeSlideIndex === 1 && (
                          <div className={styles.raceSlideCard}>
                            <div className={styles.slideBrandHeader}>
                              <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                              <span className={styles.slidePillTag}>LES AVANTAGES 🎯</span>
                            </div>

                            <div style={{ margin: '0.5rem 0 0.2rem' }}>
                              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.3rem", color: "#FAF7F2", margin: 0, letterSpacing: "1px" }}>
                                NE COUREZ PLUS SEUL(E) !
                              </h3>
                              <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.75)", fontSize: "0.88rem" }}>
                                3 vraies raisons d&apos;intégrer un groupe d&apos;entraînement :
                              </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '0.6rem 0' }}>
                              <div className={styles.clubBenefitCard}>
                                <Zap size={22} className={styles.clubBenefitIcon} />
                                <div>
                                  <h4 className={styles.clubBenefitTitle}>PROGRESSION & PISTE D&apos;ATHLÉ</h4>
                                  <p className={styles.clubBenefitText}>
                                    Des séances de VMA et de fractionné encadrées par des coachs diplômés pour franchir un cap (10 km, semi, marathon) sans vous blesser.
                                  </p>
                                </div>
                              </div>

                              <div className={styles.clubBenefitCard}>
                                <MapPin size={22} className={styles.clubBenefitIcon} />
                                <div>
                                  <h4 className={styles.clubBenefitTitle}>MOTIVATION & SORTIES NATURE</h4>
                                  <p className={styles.clubBenefitText}>
                                    Fini les séances en solo dans le froid ou sous le Mistral. Partagez vos sorties longues le dimanche en colline, garrigue ou vers le Ventoux.
                                  </p>
                                </div>
                              </div>

                              <div className={styles.clubBenefitCard}>
                                <Trophy size={22} className={styles.clubBenefitIcon} />
                                <div>
                                  <h4 className={styles.clubBenefitTitle}>CONVIVIALITÉ & ÉPREUVES DU WEEK-END</h4>
                                  <p className={styles.clubBenefitText}>
                                    Covoiturages sur les courses locales, émulation sur les lignes de départ et l&apos;ambiance chaleureuse des 3èmes mi-temps !
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className={styles.coverFooter}>
                              <span>LES CLUBS PRÈS DE CHEZ VOUS</span>
                              <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                            </div>
                          </div>
                        )}

                        {/* SLIDES 2 à 5: LES 4 BASSINS GÉOGRAPHIQUES */}
                        {activeSlideIndex >= 2 && activeSlideIndex <= 5 && (() => {
                          const region = CLUB_REGIONS[activeSlideIndex - 2];
                          return (
                            <div className={styles.raceSlideCard}>
                              <div className={styles.slideBrandHeader}>
                                <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                                <span className={styles.slidePillTag}>SECTEUR {activeSlideIndex - 1}/4 {region.icon}</span>
                              </div>

                              <div style={{ margin: '0.4rem 0 0.15rem' }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.3rem", color: "#F6C83B", margin: 0, letterSpacing: "1px", lineHeight: "1" }}>
                                  {region.title}
                                </h3>
                                <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.75)", fontSize: "0.82rem" }}>
                                  {region.subtitle}
                                </p>
                              </div>

                              <div className={styles.clubRegionGrid}>
                                {region.clubs.map((c, i) => (
                                  <div key={i} className={styles.clubRegionCardItem}>
                                    <div className={styles.clubRegionLogo}>
                                      <img src={getClubLogo(c.query)} alt={c.name} />
                                    </div>
                                    <div className={styles.clubRegionInfo}>
                                      <h4 className={styles.clubRegionName} title={c.name}>{c.name}</h4>
                                      <div className={styles.clubRegionMeta}>
                                        <span className={styles.clubRegionCity}>📍 {c.city}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className={styles.coverFooter}>
                                <span>{activeSlideIndex === 5 ? 'HORAIRES & INFOS COMPLÈTES' : 'SUITE DU GUIDE'}</span>
                                <span className={styles.swipeArrow}>SWIPE <ChevronRight size={18} /></span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SLIDE 6: CTA FINAL COUREURS */}
                        {activeSlideIndex === 6 && (
                          <div className={styles.raceSlideCard}>
                            <div className={styles.slideBrandHeader}>
                              <div className={styles.slideLogo}><LogoIcon size={24} /> RUNVAUCLUSE</div>
                              <span className={styles.slidePillTag}>ANNUAIRE OFFICIEL 🌐</span>
                            </div>

                            <div style={{ margin: '0.5rem 0 0.2rem', textAlign: 'center' }}>
                              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", color: "#F6C83B", margin: 0, letterSpacing: "1px" }}>
                                TROUVEZ VOTRE CLUB EN 1 CLIC
                              </h3>
                              <p style={{ margin: '0.2rem 0 0', color: "rgba(250, 247, 242, 0.75)", fontSize: "0.9rem" }}>
                                Consultez les créneaux, jours et horaires précis sur le site officiel :
                              </p>
                            </div>

                            <div className={styles.clubContactGrid}>
                              <div className={styles.clubContactItem}>
                                <span className={styles.clubContactLabel}>
                                  <Globe size={18} color="#EB5E28" /> SITE INTERNET
                                </span>
                                <span className={styles.clubContactVal}>WWW.RUNVAUCLUSE.FR</span>
                              </div>

                              <div className={styles.clubContactItem}>
                                <span className={styles.clubContactLabel}>
                                  <Timer size={18} color="#EB5E28" /> SÉANCES & CRÉNEAUX
                                </span>
                                <span className={styles.clubContactVal}>STADES, HORAIRES & LIEUX</span>
                              </div>

                              <div className={styles.clubContactItem}>
                                <span className={styles.clubContactLabel}>
                                  <FileText size={18} color="#EB5E28" /> CONTACTS & ADHÉSIONS
                                </span>
                                <span className={styles.clubContactVal}>LIENS DIRECTS DES CLUBS</span>
                              </div>
                            </div>

                            <div className={styles.clubCommunityCallout}>
                              💬 <strong>Tu cours dans un club du 84 ?</strong><br />
                              Tague ton club ou tes partenaires de run en commentaire ! 👇
                            </div>

                            <div className={styles.coverFooter}>
                              <span>RUNVAUCLUSE.FR • COMMUNAUTÉ</span>
                              <span className={styles.swipeArrow}><Bookmark size={16} /> ENREGISTRE</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  // ----------------------------------------------------
                  // B. MODE APPEL AUX DIRIGEANTS (4 SLIDES)
                  // ----------------------------------------------------
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
                              {clubsCoverMode === 'all' ? `⚡ LES ${clubsData.length} CLUBS DU VAUCLUSE` : '⚡ +25 CLUBS RÉFÉRENCÉS'}
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
                            {activeStoryRace.slug === 'utlm-backyard-ultra-monteux' ? 'TOP DÉPART 14H00 🔔' : 'J - 7 AVANT DÉPART ⏱️'}
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
                            {activeStoryRace.slug === 'utlm-backyard-ultra-monteux' ? "AUJOURD'HUI • JEUDI 1ER OCTOBRE 14H00" : new Date(activeStoryRace.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                          </div>
                          
                          <h2 className={styles.coverMainTitle} style={{ fontSize: '2.6rem', margin: '0.25rem 0' }}>
                            {activeStoryRace.name}
                          </h2>

                          <div className={styles.raceSlideCity} style={{ justifyContent: 'center', fontSize: '0.92rem' }}>
                            <MapPin size={15} /> {activeStoryRace.city} • VAUCLUSE
                          </div>

                          <div className={styles.raceSlideDistances} style={{ justifyContent: 'center', marginTop: '0.65rem' }}>
                            {activeStoryRace.slug === 'utlm-backyard-ultra-monteux' ? (
                              <>
                                <span className={styles.raceSlideDistPill} style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>
                                  6,706 KM / HEURE
                                </span>
                                <span className={styles.raceSlideDistPill} style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>
                                  LAST ONE STANDING
                                </span>
                              </>
                            ) : (
                              activeStoryRace.distances.split(',').map((dist, idx) => (
                                <span key={idx} className={styles.raceSlideDistPill} style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>
                                  {dist.trim()}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(250, 247, 242, 0.2)', paddingTop: '0.85rem' }}>
                          <div className={styles.outroUrlPill} style={{ fontSize: '1.2rem', padding: '0.45rem 1.25rem', marginBottom: '0.35rem' }}>
                            {activeStoryRace.slug === 'utlm-backyard-ultra-monteux' ? 'SUIVRE LA COURSE : RUNVAUCLUSE.FR' : 'INSCRIPTION : LIEN EN BIO ↗'}
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
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
