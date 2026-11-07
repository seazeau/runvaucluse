'use client';

import React, { useState, useEffect, useMemo } from 'react';
import shoesData from '@/data/shoes.json';
import configData from '@/data/shoeFinderConfig.json';
import styles from './ShoeFinder.module.css';
import {
  Sparkles,
  Target,
  Award,
  Zap,
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

export type TerrainType = 'Route' | 'Trail' | 'Chemin';
export type LevelKey = 'DÉBUTANT' | 'INTERMÉDIAIRE' | 'PRO';
export type GoalType = 'Compétition' | 'Polyvalente' | 'Entraînement' | 'Confort';

interface RecSlot {
  modelName: string;
  brand: string;
  why: string;
}

interface ShoeFinderProps {
  raceName?: string;
  raceType?: string;
  raceDistances?: string;
  raceSlug?: string;
  startInWizardMode?: boolean;
  showCatalog?: boolean;
}

const TECH_SPECS: Record<string, Partial<ShoeModel>> = (
  configData as unknown as { techSpecs: Record<string, Partial<ShoeModel>> }
).techSpecs;

// Curated 2026 matrix mapped by Terrain x Goal x Level (using the 11x3 expert recommendations)
const MATRIX_2026: Record<TerrainType, Record<GoalType, Record<LevelKey, RecSlot[]>>> = {
  Route: {
    Compétition: {
      DÉBUTANT: [
        {
          modelName: 'Endorphin Speed',
          brand: 'Saucony',
          why: 'Plaque nylon souple et mousse PWRRUN PB : la chaussure idéale pour battre son record sans traumatiser les mollets.',
        },
        {
          modelName: 'Sonic Blast',
          brand: 'ASICS',
          why: 'Très légère et dynamique pour découvrir la vitesse sur 5 km, 10 km et Semi-Marathon.',
        },
        {
          modelName: 'Mach X',
          brand: 'Hoka',
          why: 'Propulsion PEBA accessible avec une excellente stabilité pour tenir l’allure jusqu’au marathon.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Endorphin Pro',
          brand: 'Saucony',
          why: 'Carbone ultra-efficace et très accessible techniquement pour viser un RP sur 10 km, Semi ou Marathon.',
        },
        {
          modelName: 'Cloudboom Echo',
          brand: 'On Running',
          why: 'Un rebond explosif et précis pour les coureurs réguliers en quête de chrono.',
        },
        {
          modelName: 'Hyperion Elite',
          brand: 'Brooks',
          why: 'Stabilité remarquable à haute vitesse, idéale quand la fatigue s’installe en fin de course.',
        },
      ],
      PRO: [
        {
          modelName: 'Adios Pro',
          brand: 'adidas',
          why: 'Tiges carbone EnergyRods et mousse Lightstrike Pro : la référence mondiale des records sur route.',
        },
        {
          modelName: 'Metaspeed',
          brand: 'ASICS',
          why: 'Rendement énergétique maximal et légèreté absolue pour la haute performance.',
        },
        {
          modelName: 'Fast-R',
          brand: 'Puma',
          why: 'Technologie Nitro Elite ultra-agressive pour une économie de course maximale.',
        },
      ],
    },
    Polyvalente: {
      DÉBUTANT: [
        {
          modelName: 'Pegasus',
          brand: 'Nike',
          why: 'Le grand classique universel : aussi à l’aise en footing lent que sur vos premières courses sur route.',
        },
        {
          modelName: 'Wave Rider',
          brand: 'Mizuno',
          why: 'Dynamisme fluide, stabilité irréprochable et durabilité exceptionnelle au fil des mois.',
        },
        {
          modelName: 'Boston',
          brand: 'adidas',
          why: 'Polyvalente et nerveuse pour progresser du footing jusqu’aux séances d’allure spécifique.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Novablast',
          brand: 'ASICS',
          why: 'Effet trampoline addictif, légère et capable de tout faire du footing de récupération au tempo.',
        },
        {
          modelName: 'Vomero Plus',
          brand: 'Nike',
          why: 'Le parfait compromis entre grand confort d’entraînement et relance dynamique.',
        },
        {
          modelName: 'Ghost Max',
          brand: 'Brooks',
          why: 'Base large ultra-stable et rocker fluide pour enchaîner les kilomètres sans contrainte.',
        },
      ],
      PRO: [
        {
          modelName: 'Superblast',
          brand: 'ASICS',
          why: 'La reine des entraînements rapides et sorties longues : mousse de compétition sans plaque carbone.',
        },
        {
          modelName: 'SuperComp Trainer',
          brand: 'New Balance',
          why: 'Stack généreux FuelCell pour avaler les grosses semaines de préparation marathon.',
        },
        {
          modelName: 'Megablast',
          brand: 'ASICS',
          why: 'Rendement haut de gamme et protection maximale pour les gros volumes hebdomadaires.',
        },
      ],
    },
    Entraînement: {
      DÉBUTANT: [
        {
          modelName: 'Ghost',
          brand: 'Brooks',
          why: 'La stabilité et la robustesse absolues pour accumuler ses premiers kilomètres en toute confiance.',
        },
        {
          modelName: 'Velocity Nitro',
          brand: 'Puma',
          why: 'Rapport qualité/prix imbattable : souple, accrocheuse et très fiable au quotidien.',
        },
        {
          modelName: 'Gel-Cumulus',
          brand: 'ASICS',
          why: 'L’amorti équilibré et rassurant pour borner semaine après semaine.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Clifton',
          brand: 'Hoka',
          why: 'Légère avec un profil incurvé doux qui économise la foulée sur tous vos footings.',
        },
        {
          modelName: '880',
          brand: 'New Balance',
          why: 'Mousse Fresh Foam X neutre, fiable et ultra-endurante pour le volume quotidien.',
        },
        {
          modelName: 'Mach',
          brand: 'Hoka',
          why: 'Vive et légère sans plaque, parfaite pour alterner footings actifs et séances de seuil.',
        },
      ],
      PRO: [
        {
          modelName: 'Evo SL',
          brand: 'adidas',
          why: 'Mousse Lightstrike Pro sans carbone : ultra-légère pour les séances tempo et sorties rythmées.',
        },
        {
          modelName: 'Vomero',
          brand: 'Nike',
          why: 'Amorti ZoomX + ReactX ultra-protecteur pour encaisser le volume entre deux séances clés.',
        },
        {
          modelName: 'Wave Sky',
          brand: 'Mizuno',
          why: 'Douceur maximale pour régénérer les jambes sur les footings de récupération.',
        },
      ],
    },
    Confort: {
      DÉBUTANT: [
        {
          modelName: 'Bondi',
          brand: 'Hoka',
          why: 'L’amorti maximaliste de référence pour filtrer 100 % des chocs sur le bitume.',
        },
        {
          modelName: 'Cloudsurfer',
          brand: 'On Running',
          why: 'Déroulé ultra-soyeux CloudTec Phase pour courir tout en douceur.',
        },
        {
          modelName: 'Supernova Rise',
          brand: 'adidas',
          why: 'Chausson moelleux et maintien très sécurisant dès les premières foulées.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: '1080',
          brand: 'New Balance',
          why: 'Le summum du confort moderne : mousse Fresh Foam X ultra-douce et maintien chausson.',
        },
        {
          modelName: 'Glycerin',
          brand: 'Brooks',
          why: 'Amorti DNA Tuned moelleux et stable pour protéger les articulations sur les sorties longues.',
        },
        {
          modelName: 'Gel-Kayano',
          brand: 'ASICS',
          why: 'Stabilité guidée 4D et grand confort pour ne jamais s’affaisser avec la fatigue.',
        },
      ],
      PRO: [
        {
          modelName: 'Vomero Premium',
          brand: 'Nike',
          why: 'Le modèle le plus moelleux de Nike pour soulager les jambes après les grosses charges.',
        },
        {
          modelName: 'Gel-Nimbus',
          brand: 'ASICS',
          why: 'Un véritable cocon de protection pour les sorties longues et lendemains de compétition.',
        },
        {
          modelName: 'Triumph',
          brand: 'Saucony',
          why: 'Amorti généreux et rebond durable qui ne s’écrase jamais au fil des heures.',
        },
      ],
    },
  },
  Trail: {
    Compétition: {
      DÉBUTANT: [
        {
          modelName: 'Cascadia',
          brand: 'Brooks',
          why: 'Stable, rassurante et dotée d’une excellente accroche pour son premier dossard trail.',
        },
        {
          modelName: 'Speedcross',
          brand: 'Salomon',
          why: 'Crampons mordants et maintien précis du pied pour les sentiers meubles ou techniques.',
        },
        {
          modelName: 'Wave Mujin',
          brand: 'Mizuno',
          why: 'Semelle Vibram ultra-robuste qui protège parfaitement des pierres calcaires.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Peregrine 16',
          brand: 'Saucony',
          why: 'Légère, agile et ultra-accrocheuse : la référence pour les trails courts et nerveux (15 à 35 km).',
        },
        {
          modelName: 'FujiSpeed',
          brand: 'ASICS',
          why: 'Plaque PEBAX et semelle ASICSGRIP redoutable pour relancer fort dans les monotraces.',
        },
        {
          modelName: 'Speedgoat',
          brand: 'Hoka',
          why: 'Vibram Megagrip et amorti généreux pour attaquer les descentes techniques en confiance.',
        },
      ],
      PRO: [
        {
          modelName: 'Tecton X',
          brand: 'Hoka',
          why: 'Double plaque carbone parallèle + Vibram Megagrip Litebase : l’arme absolue en compétition trail.',
        },
        {
          modelName: 'Ultrafly',
          brand: 'Nike',
          why: 'Mousse ZoomX, plaque carbone Flyplate et semelle Vibram pour les trails roulants à techniques.',
        },
        {
          modelName: 'FujiSpeed',
          brand: 'ASICS',
          why: 'Ultra-nerveuse et précise pour le skyrunning et les formats rapides à fort D+.',
        },
      ],
    },
    Polyvalente: {
      DÉBUTANT: [
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'La reine de la polyvalence pour alterner routes, pistes forestières et sentiers du Vaucluse.',
        },
        {
          modelName: 'Gel-Trabuco',
          brand: 'ASICS',
          why: 'Accroche ASICSGRIP bluffante et protection pare-pierres complète sur tous les terrains.',
        },
        {
          modelName: 'Pegasus Trail',
          brand: 'Nike',
          why: 'Souple et très confortable pour passer du bitume aux collines sans transition.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Genesis',
          brand: 'Salomon',
          why: 'Châssis agile, tissu Matryx indestructible et confort royal sur les sentiers caillouteux.',
        },
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Amorti Fresh Foam X généreux et semelle Vibram Megagrip pour tout faire en nature.',
        },
        {
          modelName: 'Gel-Trabuco',
          brand: 'ASICS',
          why: 'Une valeur sûre ultra-complète pour les trails de 15 à 50 km.',
        },
      ],
      PRO: [
        {
          modelName: 'Genesis',
          brand: 'Salomon',
          why: 'Précision chirurgicale dans le technique et durabilité exceptionnelle en montagne.',
        },
        {
          modelName: 'Cascadia',
          brand: 'Brooks',
          why: 'Protection tout-terrain et stabilité à toute épreuve dans les pierriers.',
        },
        {
          modelName: 'Cloudsurfer Trail',
          brand: 'On Running',
          why: 'Foulée ultra-fluide pour les parcours vallonnés et rapides.',
        },
      ],
    },
    Entraînement: {
      DÉBUTANT: [
        {
          modelName: 'Gel-Trabuco',
          brand: 'ASICS',
          why: 'Robuste et très stable pour accumuler du dénivelé en toute sécurité.',
        },
        {
          modelName: 'Cascadia',
          brand: 'Brooks',
          why: 'Conçue pour encaisser des centaines de kilomètres sur les chemins rocailleux.',
        },
        {
          modelName: 'Speedgoat',
          brand: 'Hoka',
          why: 'La référence mondiale pour borner en montagne avec un maximum d’accroche.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Speedgoat',
          brand: 'Hoka',
          why: 'Amorti protecteur et accroche Vibram Megagrip imbattable pour les sorties longues en trail.',
        },
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Légère, souple et très confortable pour enchaîner les heures de rando-course.',
        },
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Idéale pour accumuler du volume chaque semaine sans fatiguer la voûte plantaire.',
        },
      ],
      PRO: [
        {
          modelName: 'Mafate',
          brand: 'Hoka',
          why: 'Amorti double densité indestructible pour les très longues sorties en terrain agressif.',
        },
        {
          modelName: 'Genesis',
          brand: 'Salomon',
          why: 'Tige Matryx kevlar et maintien parfait pour les entraînements intensifs en montagne.',
        },
        {
          modelName: 'Cloudultra',
          brand: 'On Running',
          why: 'Pensée pour les longues distances et l’endurance pure sur sentiers.',
        },
      ],
    },
    Confort: {
      DÉBUTANT: [
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Un vrai chausson monté sur semelle Vibram pour courir en nature avec un confort absolu.',
        },
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Amorti généreux et poids plume pour préserver les jambes dans les descentes.',
        },
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Mousse Energy Foam ultra-moelleuse qui gomme les aspérités des chemins.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Mafate',
          brand: 'Hoka',
          why: 'Le coussin d’amorti ultime pour protéger les quadriceps et les genoux sur les longs trails.',
        },
        {
          modelName: 'More Trail',
          brand: 'New Balance',
          why: 'Semelle XXL Fresh Foam X pour un filtrage maximal des chocs en descente.',
        },
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Confort longue durée dès le premier kilomètre jusqu’aux formats ultra.',
        },
      ],
      PRO: [
        {
          modelName: 'Speedgoat',
          brand: 'Hoka',
          why: 'Le duo amorti/accroche plébiscité sur tous les ultras du Ventoux et du Luberon.',
        },
        {
          modelName: 'Mafate',
          brand: 'Hoka',
          why: 'Protection maximale pour les formats 50 km à 100 miles en montagne.',
        },
        {
          modelName: 'Ultrafly',
          brand: 'Nike',
          why: 'Le moelleux de la mousse ZoomX associé à une base large très stable en descente.',
        },
      ],
    },
  },
  Chemin: {
    Compétition: {
      DÉBUTANT: [
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Légère et roulante pour aller vite sur les courses nature, vignobles et chemins blancs.',
        },
        {
          modelName: 'Pegasus Trail',
          brand: 'Nike',
          why: 'Dynamisme d’une chaussure de route avec l’accroche nécessaire pour les sous-bois.',
        },
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'Spécialement conçue pour le gravel et les parcours mixtes rapides.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'Rebond routier explosif et semelle crantée gravel pour performer sur courses nature.',
        },
        {
          modelName: 'Cloudsurfer Trail',
          brand: 'On Running',
          why: 'Transition ultra-rapide et accroche fluide sur les pistes forestières et chemins secs.',
        },
        {
          modelName: 'Peregrine 16',
          brand: 'Saucony',
          why: 'Nerveuse et légère pour relancer fort dès que le sentier devient sinueux.',
        },
      ],
      PRO: [
        {
          modelName: 'Tecton X',
          brand: 'Hoka',
          why: 'Double plaque carbone ultra-rapide sur les chemins roulants comme sur les monotraces.',
        },
        {
          modelName: 'Ultrafly',
          brand: 'Nike',
          why: 'Un avion de chasse sur les parcours nature rapides et pistes roulantes.',
        },
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'L’arme idéale quand une course alterne 50 % bitume et 50 % chemins.',
        },
      ],
    },
    Polyvalente: {
      DÉBUTANT: [
        {
          modelName: 'Pegasus Trail',
          brand: 'Nike',
          why: 'La référence "door-to-trail" pour partir de chez soi sur le bitume et rejoindre les chemins.',
        },
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Crampons polyvalents de 4 mm qui passent partout sans coller sur la route.',
        },
        {
          modelName: 'Gel-Trabuco',
          brand: 'ASICS',
          why: 'Rassurante et durable si vos chemins deviennent plus pierreux.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Le couteau suisse par excellence entre route, voies vertes et collines provençales.',
        },
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'Amorti généreux et grip gravel pensé pour les sorties mixtes.',
        },
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Très agréable sur les pistes sèches, chemins de vignes et sentiers forestiers.',
        },
      ],
      PRO: [
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'Haut rendement énergétique sur bitume comme sur pistes compactes.',
        },
        {
          modelName: 'Cloudsurfer Trail',
          brand: 'On Running',
          why: 'Foulée naturelle et dynamique pour les parcours mixtes exigeants.',
        },
        {
          modelName: 'Genesis',
          brand: 'Salomon',
          why: 'Confortable sur les portions roulantes et impériale dès que le terrain devient technique.',
        },
      ],
    },
    Entraînement: {
      DÉBUTANT: [
        {
          modelName: 'Pegasus Trail',
          brand: 'Nike',
          why: 'Souple, fiable et inusable pour tous vos footings entre route et chemins.',
        },
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Légère et protectrice pour varier les plaisirs à chaque sortie.',
        },
        {
          modelName: 'Supernova Rise',
          brand: 'adidas',
          why: 'Version ATR idéale pour les parcs, voies vertes et chemins stabilisés.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Une valeur sûre ultra-endurante pour borner sur chemins et sous-bois.',
        },
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Absorbe les chocs sur le dur tout en gardant du mordant sur les sentiers.',
        },
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Parfaite pour les sorties longues mêlant bitume et pistes calcaires.',
        },
      ],
      PRO: [
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Pour avaler de gros volumes hebdomadaires sur terrains variés sans fatigue.',
        },
        {
          modelName: 'Aero Glide GRVL',
          brand: 'Salomon',
          why: 'Un rebond infatigable pour les longues séances au train sur chemins.',
        },
        {
          modelName: 'Superblast',
          brand: 'ASICS',
          why: 'Semelle large et dynamique qui passe parfaitement sur routes et chemins blancs secs.',
        },
      ],
    },
    Confort: {
      DÉBUTANT: [
        {
          modelName: 'Challenger',
          brand: 'Hoka',
          why: 'Tout le moelleux Hoka adapté aux chemins et sentiers faciles.',
        },
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Accueil ultra-doux et grande stabilité pour les sorties plaisir en nature.',
        },
        {
          modelName: 'Cloudsurfer Trail',
          brand: 'On Running',
          why: 'Un déroulé de pied feutré et sans impact sur les pistes.',
        },
      ],
      INTERMÉDIAIRE: [
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Coussin d’amorti XXL pour courir des heures sur les chemins sans douleur.',
        },
        {
          modelName: 'Hierro',
          brand: 'New Balance',
          why: 'Protection maximale sous le pied et chaussant très généreux.',
        },
        {
          modelName: 'More Trail',
          brand: 'New Balance',
          why: 'Le plus gros amorti du marché pour un confort total hors bitume.',
        },
      ],
      PRO: [
        {
          modelName: 'Ultra Glide',
          brand: 'Salomon',
          why: 'Confort royal pour les sorties de récupération en forêt et collines.',
        },
        {
          modelName: 'Cloudultra',
          brand: 'On Running',
          why: 'Double couche d’amorti Helion pour les très longues sorties mixtes.',
        },
        {
          modelName: 'Mafate',
          brand: 'Hoka',
          why: 'Protection intégrale pour ménager les jambes sur tous les sentiers.',
        },
      ],
    },
  },
};

const QUIZ_STEPS = [
  {
    id: 'terrain',
    question: 'Sur quel terrain courez-vous principalement ?',
    icon: Target,
    options: [
      { value: 'Route', label: '🛣️ Route & Bitume (5 km, 10 km, Semi, Marathon)' },
      { value: 'Trail', label: '⛰️ Trail & Sentiers (Ventoux, Dentelles, Luberon)' },
      { value: 'Chemin', label: '🌲 Chemins & Mixte (Route + Pistes forestières / Vignes)' },
    ],
  },
  {
    id: 'level',
    question: 'Quel est votre volume / niveau actuel ?',
    icon: Award,
    options: [
      { value: 'DÉBUTANT', label: '🌱 Débutant / Loisir (moins de 30 km / sem)' },
      { value: 'INTERMÉDIAIRE', label: '🏃 Régulier / Confirmé (30 à 50 km / sem)' },
      { value: 'PRO', label: '⚡ Compétiteur / Intensif (plus de 50 km / sem)' },
    ],
  },
  {
    id: 'goal',
    question: 'Que recherchez-vous en priorité ?',
    icon: Zap,
    options: [
      { value: 'Compétition', label: '🏁 Compétition & Chrono (Dynamisme / Carbone)' },
      { value: 'Polyvalente', label: '🔄 Chaussure Polyvalente (Une paire pour tout faire)' },
      { value: 'Entraînement', label: '🏋️ Entraînement & Endurance (Fiabilité & Volume)' },
      { value: 'Confort', label: '☁️ Confort & Amorti Max (Plaisir & Douceur)' },
    ],
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

function detectInitialTerrain(raceType?: string, raceName?: string): TerrainType {
  const hay = `${raceType || ''} ${raceName || ''}`.toLowerCase();
  if (
    hay.includes('trail') ||
    hay.includes('ventoux') ||
    hay.includes('dentelles') ||
    hay.includes('luberon') ||
    hay.includes('ventouret') ||
    hay.includes('mont')
  ) {
    return 'Trail';
  }
  if (
    hay.includes('nature') ||
    hay.includes('chemin') ||
    hay.includes('vigne') ||
    hay.includes('cross')
  ) {
    return 'Chemin';
  }
  return 'Route';
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
  const defaultTerrain = useMemo(
    () => detectInitialTerrain(raceType, raceName),
    [raceType, raceName]
  );

  const [shoes, setShoes] = useState<ShoeModel[]>(() => shoesData as unknown as ShoeModel[]);
  const [quizActive, setQuizActive] = useState<boolean>(startInWizardMode);
  const [step, setStep] = useState<number>(0);

  const [terrain, setTerrain] = useState<TerrainType>(defaultTerrain);
  const [level, setLevel] = useState<LevelKey>('INTERMÉDIAIRE');
  const [goal, setGoal] = useState<GoalType>('Polyvalente');
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

  // Resolve the 3 recommended 2026 shoes for Terrain x Goal x Level (sorted by name descending)
  const recommendedShoes = useMemo(() => {
    const slots =
      MATRIX_2026[terrain]?.[goal]?.[level] ||
      MATRIX_2026.Route.Polyvalente.INTERMÉDIAIRE;

    const sortedInventory = [...shoes].sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    return slots.map((rec, idx) => {
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

      return {
        id: `fallback-${rec.modelName}`,
        modelKey: rec.modelName,
        name: `${rec.brand} ${rec.modelName}`,
        brand: rec.brand,
        usage: `${terrain} • ${goal}`,
        cushionType: 'Dynamique',
        hasPlate: false,
        price: 150,
        image: '/chaussure_jaune.svg',
        externalUrl: ensureTop4RunningAffiliateUrl(undefined, `${rec.brand} ${rec.modelName}`),
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
  }, [terrain, level, goal, shoes]);

  const handleQuizOptionSelect = (optionValue: string) => {
    const currentStepId = QUIZ_STEPS[step].id;
    if (currentStepId === 'terrain') {
      setTerrain(optionValue as TerrainType);
      setStep(1);
    } else if (currentStepId === 'level') {
      setLevel(optionValue as LevelKey);
      setStep(2);
    } else if (currentStepId === 'goal') {
      setGoal(optionValue as GoalType);
      setQuizActive(false);
    }
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
          terrain,
          level,
          goal,
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

  const CurrentQuestionIcon = QUIZ_STEPS[step]?.icon || Target;

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
              <Sparkles size={13} /> CONSEILLER CHAUSSURES 2026
            </span>
            {raceName && (
              <span className={styles.raceBadge}>
                <Compass size={13} /> Calibré pour : {raceName}
              </span>
            )}
          </div>

          {quizActive ? (
            <button
              type="button"
              onClick={() => setQuizActive(false)}
              className={styles.modeBtn}
            >
              <SlidersHorizontal size={14} /> Voir le comparateur direct
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setQuizActive(true);
              }}
              className={styles.modeBtn}
            >
              <RotateCcw size={14} /> Faire le test en 3 étapes
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
                <span className={styles.mainTitleAccent}>IDÉALES EN 15 SECONDES</span>
              </>
            )}
          </h2>
          <p className={styles.subTitle}>
            {raceName
              ? `Sélection mise à jour avec les derniers modèles 2026 selon le terrain (${terrain}${
                  raceDistances ? ` • ${raceDistances}` : ''
                }), votre niveau et votre objectif.`
              : 'Choisissez votre terrain, votre niveau et votre objectif pour découvrir les 3 meilleures chaussures 2026 en stock chez Top4Running.'}
          </p>
        </div>

        {/* MODE A: 3-STEP WIZARD */}
        {quizActive && (
          <div className={styles.quizBox}>
            <div className={styles.quizHeaderRow}>
              <span className={styles.quizStepLabel}>
                Étape {step + 1} sur {QUIZ_STEPS.length}
              </span>
              <span className={styles.quizPctLabel}>
                {Math.round(((step + 1) / QUIZ_STEPS.length) * 100)}%
              </span>
            </div>

            <div
              className={styles.progressTrack}
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
            >
              {QUIZ_STEPS.map((q, idx) => (
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
              <h3 className={styles.questionHeading}>{QUIZ_STEPS[step].question}</h3>
            </div>

            <div className={styles.optionsGrid}>
              {QUIZ_STEPS[step].options.map((option) => (
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
                ← Étape précédente
              </button>
            )}
          </div>
        )}

        {/* MODE B: DIRECT 3-CRITERIA PILLS + 3 RECOMMENDED 2026 SHOES */}
        {!quizActive && (
          <div>
            <div className={styles.controlsBar}>
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>1. Terrain :</span>
                <div className={styles.levelPills}>
                  {(['Route', 'Trail', 'Chemin'] as TerrainType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTerrain(t)}
                      className={`${styles.levelPill} ${
                        terrain === t ? styles.levelPillActive : ''
                      }`}
                    >
                      {t === 'Route'
                        ? '🛣️ Route'
                        : t === 'Trail'
                        ? '⛰️ Trail'
                        : '🌲 Chemin / Mixte'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>2. Niveau :</span>
                <div className={styles.levelPills}>
                  {(['DÉBUTANT', 'INTERMÉDIAIRE', 'PRO'] as LevelKey[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`${styles.levelPill} ${
                        level === lvl ? styles.levelPillActive : ''
                      }`}
                    >
                      {lvl === 'DÉBUTANT'
                        ? '🌱 Débutant (<30 km/sem)'
                        : lvl === 'INTERMÉDIAIRE'
                        ? '🏃 Régulier (30-50 km/sem)'
                        : '⚡ Intensif (>50 km/sem)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>3. Objectif :</span>
                <div className={styles.levelPills}>
                  {(
                    [
                      { id: 'Compétition', label: '🏁 Compétition / Dossard' },
                      { id: 'Polyvalente', label: '🔄 Polyvalente' },
                      { id: 'Entraînement', label: '🏋️ Entraînement' },
                      { id: 'Confort', label: '☁️ Confort Max' },
                    ] as { id: GoalType; label: string }[]
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`${styles.levelPill} ${
                        goal === g.id ? styles.levelPillActive : ''
                      }`}
                    >
                      {g.label}
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
                        ? `★ Choix #1 Coach (${shoe.matchScore || 98}%)`
                        : `Recommandé (${shoe.matchScore || 94 - idx * 4}%)`}
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
                    <div className={styles.coachAdviceLabel}>Pourquoi ce modèle :</div>
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
