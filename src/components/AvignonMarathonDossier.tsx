'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Activity,
  Download,
  Award,
  Zap,
  TrendingUp,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Music,
  Droplets,
  Car,
  Train,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './AvignonMarathonDossier.module.css';

// Dynamic Leaflet components for SSR safety
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

// Helper component to auto-fit map view bounds
const ChangeView = ({ bounds }: { bounds: [[number, number], [number, number]] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, bounds]);
  return null;
};

// Haversine distance calculator
const calculateDistance = (p1: { lat: number; lon: number }, p2: { lat: number; lon: number }) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lon - p1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

interface ElevationPoint {
  dist: string;
  elev: number;
}

export default function AvignonMarathonDossier() {
  const [selectedRace, setSelectedRace] = useState<'marathon' | 'semi'>('marathon');
  const [activeTab, setActiveTab] = useState<'parcours' | 'strategie' | 'logistique' | 'equipement'>('parcours');

  // Map & GPX state
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([]);
  const [center, setCenter] = useState<[number, number]>([43.955, 4.81]);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingGpx, setLoadingGpx] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const gpxFile = selectedRace === 'marathon' 
    ? '/itineraires/marathon-avignon.gpx' 
    : '/itineraires/semi-marathon-avignon.gpx';

  useEffect(() => {
    if (!isMounted) return;

    let isCancelled = false;
    setLoadingGpx(true);

    const loadGpx = async () => {
      try {
        const response = await fetch(gpxFile);
        const gpxText = await response.text();
        const { default: gpxParser } = await import('gpxparser');
        const gpx = new gpxParser();
        gpx.parse(gpxText);

        if (isCancelled) return;

        const track = gpx.tracks[0];
        if (track && track.points.length > 0) {
          const coords = track.points.map(p => [p.lat, p.lon] as [number, number]);
          setPositions(coords);

          let cumulativeDist = 0;
          const elevData: ElevationPoint[] = track.points.map((p, i) => {
            if (i > 0) {
              const prev = track.points[i - 1];
              cumulativeDist += calculateDistance(prev, p);
            }
            return {
              dist: (cumulativeDist / 1000).toFixed(2),
              elev: Math.round(p.ele)
            };
          });
          setElevationData(elevData);

          const lats = coords.map(p => p[0]);
          const lons = coords.map(p => p[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);

          setCenter([(minLat + maxLat) / 2, (minLon + maxLon) / 2]);
          setBounds([[minLat, minLon], [maxLat, maxLon]]);
        }
      } catch (err) {
        console.error('Erreur chargement GPX Avignon:', err);
      } finally {
        if (!isCancelled) setLoadingGpx(false);
      }
    };

    loadGpx();

    return () => {
      isCancelled = true;
    };
  }, [gpxFile, isMounted]);

  return (
    <div className={styles.dossierWrapper}>
      {/* 1. HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.badgeRow}>
            <span className={styles.badgePink}>
              <Sparkles size={14} /> ÉDITION INAUGURALE 2026
            </span>
            <span className={styles.badgeGold}>
              <Award size={14} /> LABEL RÉGIONAL FFA
            </span>
            <span className={styles.badgeCyan}>
              <Zap size={14} /> QUALIFICATIF CHAMPIONNATS DE FRANCE
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            DOSSIER SPÉCIAL : SEMI & MARATHON D&apos;AVIGNON
          </h1>

          <p className={styles.heroSubtitle}>
            Dimanche 27 septembre 2026 : courrez au cœur de la Cité des Papes et sur l&apos;Île de la Barthelasse. 
            Retrouvez l&apos;analyse tactique du coach STAPS, les traces GPX interactives, les repères de ravitaillement 
            et toutes les informations logistiques officielles extraites du Guide Coureur.
          </p>

          {/* Subtabs for navigation */}
          <div className={styles.navTabs}>
            <button
              onClick={() => setActiveTab('parcours')}
              className={`${styles.navTab} ${activeTab === 'parcours' ? styles.navTabActive : ''}`}
            >
              <Compass size={16} /> Parcours & GPX Interactif
            </button>
            <button
              onClick={() => setActiveTab('strategie')}
              className={`${styles.navTab} ${activeTab === 'strategie' ? styles.navTabActive : ''}`}
            >
              <TrendingUp size={16} /> Analyse & Pacing Coach (STAPS)
            </button>
            <button
              onClick={() => setActiveTab('logistique')}
              className={`${styles.navTab} ${activeTab === 'logistique' ? styles.navTabActive : ''}`}
            >
              <ShieldCheck size={16} /> Guide Pratique & Dossards
            </button>
            <button
              onClick={() => setActiveTab('equipement')}
              className={`${styles.navTab} ${activeTab === 'equipement' ? styles.navTabActive : ''}`}
            >
              <ShoppingBag size={16} /> Chaussures & Matériel
            </button>
          </div>
        </div>
      </section>

      {/* 2. DISTANCE SWITCHER TOGGLE */}
      <div className={styles.distanceSwitcher}>
        <button
          onClick={() => setSelectedRace('marathon')}
          className={`${styles.distBtn} ${selectedRace === 'marathon' ? styles.distBtnActiveMarathon : ''}`}
        >
          <span className={styles.distBtnTitle}>🏆 MARATHON D&apos;AVIGNON</span>
          <span className={styles.distBtnSub}>42,195 KM • 80M D+ • DÉPART 9H00</span>
        </button>
        <button
          onClick={() => setSelectedRace('semi')}
          className={`${styles.distBtn} ${selectedRace === 'semi' ? styles.distBtnActive : ''}`}
        >
          <span className={styles.distBtnTitle}>⚡ SEMI-MARATHON D&apos;AVIGNON</span>
          <span className={styles.distBtnSub}>21,0975 KM • 60M D+ • DÉPART 8H00</span>
        </button>
      </div>

      {/* 3. KEY METRICS GRID */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Distance</span>
            <Activity size={16} />
          </div>
          <div className={styles.metricValue}>
            {selectedRace === 'marathon' ? '42,195 km' : '21,0975 km'}
          </div>
          <div className={styles.metricSub}>Mesurée officiellement FFA</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Dénivelé</span>
            <TrendingUp size={16} />
          </div>
          <div className={styles.metricValue}>
            {selectedRace === 'marathon' ? '+80m D+' : '+60m D+'}
          </div>
          <div className={styles.metricSub}>Parcours plat ultra-roulant</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Départ</span>
            <Clock size={16} />
          </div>
          <div className={styles.metricValue}>
            {selectedRace === 'marathon' ? '09:00' : '08:00'}
          </div>
          <div className={styles.metricSub}>Devant la Gare Avignon Centre</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Barrière Horaire</span>
            <AlertTriangle size={16} />
          </div>
          <div className={styles.metricValue}>
            {selectedRace === 'marathon' ? '5h45' : '2h45'}
          </div>
          <div className={styles.metricSub}>Arrivée max Barthelasse</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Ravitaillements</span>
            <Droplets size={16} />
          </div>
          <div className={styles.metricValue}>
            {selectedRace === 'marathon' ? '9 postes' : '5 postes'}
          </div>
          <div className={styles.metricSub}>Frate Mate + Électrolytes Tā</div>
        </div>
      </div>

      {/* 4. TAB CONTENT: PARCOURS & GPX */}
      {activeTab === 'parcours' && (
        <>
          {/* Interactive Map & Profile Card */}
          <div className={styles.mapCard}>
            <div className={styles.mapCardHeader}>
              <div className={styles.mapTitleGroup}>
                <Compass size={22} color="#ec4899" />
                <h3 className={styles.mapTitle}>
                  TRACÉ GPX OFFICIEL - {selectedRace === 'marathon' ? 'MARATHON (42,195 KM)' : 'SEMI-MARATHON (21,1 KM)'}
                </h3>
              </div>
              <a
                href={gpxFile}
                download
                className={styles.gpxDownloadBtn}
                title="Télécharger le fichier GPX pour montre GPS ou Garmin / Strava"
              >
                <Download size={16} /> TÉLÉCHARGER LE GPX ({selectedRace === 'marathon' ? '42K' : '21K'})
              </a>
            </div>

            {/* Leaflet Map */}
            <div className={styles.mapContainer}>
              {isMounted && !loadingGpx ? (
                <MapContainer
                  center={center}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                  bounds={bounds || undefined}
                >
                  <ChangeView bounds={bounds} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {positions.length > 0 && (
                    <Polyline
                      positions={positions}
                      color={selectedRace === 'marathon' ? '#ec4899' : '#38bdf8'}
                      weight={4}
                      opacity={0.9}
                    />
                  )}
                </MapContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                  Chargement de la trace satellite...
                </div>
              )}
            </div>

            {/* Recharts Elevation Profile */}
            <div className={styles.profileSection}>
              <div className={styles.profileHeader}>
                <div className={styles.profileTitle}>
                  <TrendingUp size={16} color="#facc15" /> Profil Altimétrique Interactif
                </div>
                <div className={styles.profileStats}>
                  Altitude min: 16 m • max: 39 m • 100% bitume et voies carrossables
                </div>
              </div>

              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={elevationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedRace === 'marathon' ? '#ec4899' : '#38bdf8'} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={selectedRace === 'marathon' ? '#ec4899' : '#38bdf8'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="dist"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5, fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis
                      domain={['dataMin - 5', 'dataMax + 10']}
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      label={{ value: 'Alt (m)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#facc15', fontWeight: 'bold' }}
                      labelStyle={{ color: '#9ca3af' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => [`${val} m`, 'Altitude']}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(lbl: any) => `Kilomètre ${lbl}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="elev"
                      stroke={selectedRace === 'marathon' ? '#ec4899' : '#38bdf8'}
                      strokeWidth={2.5}
                      fill="url(#elevGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Course Breakdown Section */}
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <Layers size={24} color="#ec4899" />
              <h2 className={styles.sectionTitle}>
                DÉCOUPAGE STRATÉGIQUE TRONÇON PAR TRONÇON
              </h2>
            </div>

            <div className={styles.tronconGrid}>
              {/* Tronçon 1 */}
              <div className={styles.tronconCard}>
                <div className={styles.tronconHeader}>
                  <span className={selectedRace === 'marathon' ? styles.tronconKmBadge : styles.tronconKmBadgeSemi}>
                    KM 0 → KM 6
                  </span>
                  <h4 className={styles.tronconName}>Le Prologue Médiéval & Le Cœur Intra-Muros</h4>
                </div>
                <div className={styles.tronconBody}>
                  <div>
                    <p className={styles.tronconDesc}>
                      Départ mythique devant la façade néo-classique de la <strong>Gare Avignon Centre</strong>. 
                      Le peloton longe les remparts du XIVe siècle (Bd Saint-Roch, Bd Saint-Michel), 
                      avant de s&apos;engouffrer dans le dédale historique : rue Thiers, Place des Corps Saints (KM 3.6 - musique live), 
                      Place Carnot (KM 4.4 et 5.6), puis l&apos;apothéose visuelle au <strong>Palais des Papes (KM 6)</strong>.
                    </p>
                    <ul className={styles.tronconKeyPoints}>
                      <li><CheckCircle2 size={14} /> <strong>Revêtement :</strong> Asphalte urbain et secteurs pavés en centre piétonnier.</li>
                      <li><CheckCircle2 size={14} /> <strong>Profil :</strong> Léger faux-plat montant vers le Rocher des Doms, virages à angle droit.</li>
                      <li><CheckCircle2 size={14} /> <strong>Ambiance :</strong> Forte présence du public et résonance festive entre les façades en pierre.</li>
                    </ul>
                  </div>
                  <div className={styles.coachAdviceBox}>
                    <div className={styles.coachAdviceHeader}>
                      <Zap size={14} /> Conseil Coach Vincent Buisson (STAPS)
                    </div>
                    <p className={styles.coachAdviceText}>
                      &laquo; Attention au piège de l&apos;euphorie ! Le cadre somptueux et les vivats du public incitent à partir trop vite. 
                      Adoptez une foulée compacte sur les pavés pour épargner vos mollets et vos tendons d&apos;Achille. 
                      Ne tentez aucun dépassement brusque dans les ruelles étroites, soyez patient. &raquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Tronçon 2 */}
              <div className={styles.tronconCard}>
                <div className={styles.tronconHeader}>
                  <span className={selectedRace === 'marathon' ? styles.tronconKmBadge : styles.tronconKmBadgeSemi}>
                    KM 6 → KM 10
                  </span>
                  <h4 className={styles.tronconName}>Franchissement du Rhône & Transition Barthelasse</h4>
                </div>
                <div className={styles.tronconBody}>
                  <div>
                    <p className={styles.tronconDesc}>
                      Sortie de la cité par la Porte de l&apos;Oulle et engagement sur le <strong>Pont Édouard Daladier</strong>. 
                      La vue sur le Pont Saint-Bénézet et le Rhône est grandiose. Une fois sur l&apos;Île de la Barthelasse, 
                      la route s&apos;élargit pour atteindre le <strong>premier grand ravitaillement au KM 10</strong> 
                      (boisson Frate Mate, électrolytes Tā et sanitaires).
                    </p>
                    <ul className={styles.tronconKeyPoints}>
                      <li><CheckCircle2 size={14} /> <strong>Exposition au vent :</strong> Le pont Daladier est sensible au Mistral de face ou au vent de sud.</li>
                      <li><CheckCircle2 size={14} /> <strong>Ravitaillement KM 10 :</strong> Boisson au maté Frate Mate + électrolytes Tā + WC.</li>
                    </ul>
                  </div>
                  <div className={styles.coachAdviceBox}>
                    <div className={styles.coachAdviceHeader}>
                      <Zap size={14} /> Conseil Coach Vincent Buisson (STAPS)
                    </div>
                    <p className={styles.coachAdviceText}>
                      &laquo; Sur le pont du Rhône, abritez-vous systématiquement dans un groupe pour contrer la prise au vent. 
                      Au KM 10, même si la fraîcheur matinale masque la soif, buvez dès à présent quelques gorgées d&apos;électrolytes Tā 
                      pour anticiper les pertes sudorales. &raquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Tronçon 3 */}
              <div className={styles.tronconCard}>
                <div className={styles.tronconHeader}>
                  <span className={selectedRace === 'marathon' ? styles.tronconKmBadge : styles.tronconKmBadgeSemi}>
                    KM 10 → {selectedRace === 'marathon' ? 'KM 21' : 'KM 21,1 (ARRIVÉE)'}
                  </span>
                  <h4 className={styles.tronconName}>
                    {selectedRace === 'marathon' 
                      ? "L'Île de la Barthelasse, les Vergers & Séparation"
                      : "Le Tour des Vergers & L'Arrivée Triomphale du Semi"}
                  </h4>
                </div>
                <div className={styles.tronconBody}>
                  <div>
                    <p className={styles.tronconDesc}>
                      {selectedRace === 'marathon' ? (
                        <>
                          Au KM 12, les parcours se séparent ! Le marathon continue son aventure vers le nord de l&apos;île. 
                          Vous traversez des paysages verdoyants au milieu des vergers de pommiers et poiriers. 
                          Passage au semi-marathon en <strong>2h55 maximum</strong> (barrière horaire).
                        </>
                      ) : (
                        <>
                          La boucle du semi serpente à travers la nature apaisante de la Barthelasse. 
                          Ravitos successifs aux KM 13, KM 15 et KM 17. Au KM 20, animation musicale au Centre Nautique, 
                          puis dernière ligne droite sur le Chemin des Berges pour franchir l&apos;arche à la Base de Loisirs !
                        </>
                      )}
                    </p>
                    <ul className={styles.tronconKeyPoints}>
                      <li><CheckCircle2 size={14} /> <strong>Revêtement :</strong> 100% plat, goudron lisse et allées sécurisées.</li>
                      <li><CheckCircle2 size={14} /> <strong>Points d&apos;eau :</strong> Ravitos aux KM 13, 15 et 17 (Semi) / KM 13, 18 (Marathon).</li>
                    </ul>
                  </div>
                  <div className={styles.coachAdviceBox}>
                    <div className={styles.coachAdviceHeader}>
                      <Zap size={14} /> Conseil Coach Vincent Buisson (STAPS)
                    </div>
                    <p className={styles.coachAdviceText}>
                      {selectedRace === 'marathon' 
                        ? "« Ne vous trompez pas de trajectoire lors de la scission au KM 12. Ne vous emballez pas au passage du semi : vous n'avez accompli que la première moitié du chemin. Votre fréquence cardiaque doit être sous contrôle total. »"
                        : "« Pour les coureurs du semi, c'est le moment d'engager l'accélération progressive dès le KM 16 si les jambes répondent bien. Le profil est ultra-favorable pour battre votre record personnel (RP) ! »"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Tronçons spécifiques Marathon */}
              {selectedRace === 'marathon' && (
                <>
                  <div className={styles.tronconCard}>
                    <div className={styles.tronconHeader}>
                      <span className={styles.tronconKmBadge}>KM 21 → KM 32</span>
                      <h4 className={styles.tronconName}>La Boucle Nord, Barrage CNR & La Solitude du Coureur</h4>
                    </div>
                    <div className={styles.tronconBody}>
                      <div>
                        <p className={styles.tronconDesc}>
                          Cap vers l&apos;extrême nord de l&apos;île de la Barthelasse, en longeant le bras vif du fleuve vers le Pont de Sauveterre 
                          et les abords du barrage CNR. Moins de public dans ce secteur champêtre : c&apos;est l&apos;épreuve de vérité mentale. 
                          Ravitaillements cruciaux aux <strong>KM 24 et KM 28</strong>. Barrière horaire au <strong>KM 30 en 4h05</strong>.
                        </p>
                        <ul className={styles.tronconKeyPoints}>
                          <li><CheckCircle2 size={14} /> <strong>Spécificité :</strong> Longues lignes droites, besoin de concentration et de rythme métronome.</li>
                          <li><CheckCircle2 size={14} /> <strong>Musique :</strong> Animation au KM 28 (École de la Barthelasse).</li>
                        </ul>
                      </div>
                      <div className={styles.coachAdviceBox}>
                        <div className={styles.coachAdviceHeader}>
                          <Zap size={14} /> Conseil Coach Vincent Buisson (STAPS)
                        </div>
                        <p className={styles.coachAdviceText}>
                          &laquo; Entre le 25e et le 30e km, le cerveau commence à envoyer des signaux de fatigue. 
                          Fixez des repères visuels rapprochés (arbres, poteaux, virages). Prenez vos gels énergétiques Nutripure (30g de glucides) toutes les 35-40 minutes 
                          ou buvez régulièrement votre boisson d&apos;effort Nutripure 60g avec de l&apos;eau pour maintenir vos réserves de glycogène et retarder le mur. &raquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tronconCard}>
                    <div className={styles.tronconHeader}>
                      <span className={styles.tronconKmBadge}>KM 32 → KM 42,195 (ARRIVÉE)</span>
                      <h4 className={styles.tronconName}>Le Mur du 30e, La Digue des Canotiers & La Délivrance</h4>
                    </div>
                    <div className={styles.tronconBody}>
                      <div>
                        <p className={styles.tronconDesc}>
                          Retour le long de la digue du Rhône. Le panorama sur les remparts d&apos;Avignon et le Palais des Papes réapparaît, 
                          baigné par la lumière de la mi-journée. Ravitaillements aux <strong>KM 33, KM 35 (Frate Mate + Tā) et KM 39</strong>. 
                          Animations musicales survoltées au Centre Nautique (KM 37.5 et KM 41.6) avant le tapis bleu de la Base de Loisirs !
                        </p>
                        <ul className={styles.tronconKeyPoints}>
                          <li><CheckCircle2 size={14} /> <strong>Barrière finale :</strong> 5h45 de course (fermeture ligne 14h45).</li>
                          <li><CheckCircle2 size={14} /> <strong>Derniers kilomètres :</strong> Cadre magnifique, public présent pour pousser vers la ligne d&apos;arrivée.</li>
                        </ul>
                      </div>
                      <div className={styles.coachAdviceBox}>
                        <div className={styles.coachAdviceHeader}>
                          <Zap size={14} /> Conseil Coach Vincent Buisson (STAPS)
                        </div>
                        <p className={styles.coachAdviceText}>
                          &laquo; Les 10 derniers kilomètres se courent avec le cœur et la tête. 
                          Ne regardez plus votre montre toutes les 10 secondes : concentrez-vous sur votre posture, relâchez les épaules, 
                          souriez au public et savourez chaque mètre de ce tracé unique dans l&apos;histoire de la Cité des Papes. &raquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* 5. TAB CONTENT: STRATÉGIE & PACING */}
      {activeTab === 'strategie' && (
        <>
          {/* Coach Bio Card */}
          <div className={styles.coachProfileCard}>
            <div className={styles.coachProfileHeader}>
              <div className={styles.coachAvatar}>VB</div>
              <div className={styles.coachInfo}>
                <h3>Vincent Buisson</h3>
                <div className={styles.coachTagline}>
                  <Award size={16} /> Entraîneur Diplômé STAPS • Fondateur de RunVaucluse
                </div>
              </div>
            </div>

            <p className={styles.coachBio}>
              Spécialiste de la préparation athlétique et du demi-fond/fond, Vincent accompagne plus de 100 athlètes 
              (sur route et en trail). Pour cette première édition du Marathon et Semi-Marathon d&apos;Avignon, 
              voici l&apos;analyse scientifique des leviers de performance sur ce parcours d&apos;une planéité remarquable.
            </p>

            <div className={styles.coachStrategyGrid}>
              <div className={styles.strategyItem}>
                <div className={styles.strategyItemTitle}>
                  <TrendingUp size={18} /> Even-Pacing Strict
                </div>
                <p className={styles.strategyItemText}>
                  Sur un profil affichant moins de 80m de dénivelé total, la régularité d&apos;allure est la clé maîtresse. 
                  Courir 5 secondes au kilomètre trop vite sur les 10 premiers kilomètres entraîne une surconsommation de glycogène 
                  qui se paie par 30 à 45 secondes de perte au kilomètre après le 30e.
                </p>
              </div>

              <div className={styles.strategyItem}>
                <div className={styles.strategyItemTitle}>
                  <Droplets size={18} /> Nutrition & Hydratation (Nutripure)
                </div>
                <p className={styles.strategyItemText}>
                  Pour sécuriser votre apport de 60g de glucides/heure sans troubles gastriques, 
                  Vincent Buisson conseille les <strong>gels énergétiques de son partenaire Nutripure</strong> (30g de glucides, ratio 2:1) 
                  ou la <strong>boisson d&apos;effort Nutripure 60g</strong> dans votre flasque (avec électrolytes et BCAA). 
                  Complétez avec l&apos;eau des ravitaillements tous les 5 km.
                </p>
              </div>

              <div className={styles.strategyItem}>
                <div className={styles.strategyItemTitle}>
                  <Wind size={18} /> Gestion du Vent Rhodanien
                </div>
                <p className={styles.strategyItemText}>
                  La vallée du Rhône est sujette au Mistral. Les sections le long des berges et la traversée du Pont Daladier 
                  sont les plus exposées. Ne restez jamais seul face au vent : organisez des relais ou abritez-vous derrière les meneurs d&apos;allure.
                </p>
              </div>
            </div>
          </div>

          {/* Pacing Table */}
          <div className={styles.pacingSection}>
            <h3 className={styles.pacingTitle}>
              GRILLE DES TEMPS DE PASSAGE & MENEURS D&apos;ALLURE OFFICIELS
            </h3>
            <p className={styles.pacingDesc}>
              {selectedRace === 'marathon'
                ? '6 meneurs d’allure officiels seront présents sur le Marathon d’Avignon (3h00 à 4h30). Retrouvez leurs allures et temps de passage cibles :'
                : '4 meneurs d’allure officiels vous accompagneront sur le Semi-Marathon d’Avignon (1h20 à 2h00) :'}
            </p>

            <div className={styles.tableWrapper}>
              <table className={styles.pacingTable}>
                <thead>
                  {selectedRace === 'marathon' ? (
                    <tr>
                      <th>Objectif</th>
                      <th>Allure Moyenne</th>
                      <th>KM 10</th>
                      <th>Semi (KM 21,1)</th>
                      <th>KM 30</th>
                      <th>KM 35</th>
                      <th>Arrivée (42,195 km)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Objectif</th>
                      <th>Allure Moyenne</th>
                      <th>KM 5</th>
                      <th>KM 10</th>
                      <th>KM 15</th>
                      <th>KM 20</th>
                      <th>Arrivée (21,1 km)</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {selectedRace === 'marathon' ? (
                    <>
                      <tr>
                        <td className={styles.targetTime}>3h00</td>
                        <td className={styles.targetPace}>4&apos;16 / km</td>
                        <td>42&apos;39</td>
                        <td>1h29&apos;59</td>
                        <td>2h07&apos;58</td>
                        <td>2h29&apos;18</td>
                        <td className={styles.targetTime}>2h59&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>3h15</td>
                        <td className={styles.targetPace}>4&apos;37 / km</td>
                        <td>46&apos;13</td>
                        <td>1h37&apos;30</td>
                        <td>2h18&apos;38</td>
                        <td>2h41&apos;45</td>
                        <td className={styles.targetTime}>3h14&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>3h30</td>
                        <td className={styles.targetPace}>4&apos;58 / km</td>
                        <td>49&apos;46</td>
                        <td>1h45&apos;00</td>
                        <td>2h29&apos;18</td>
                        <td>2h54&apos;12</td>
                        <td className={styles.targetTime}>3h29&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>3h45</td>
                        <td className={styles.targetPace}>5&apos;20 / km</td>
                        <td>53&apos;20</td>
                        <td>1h52&apos;30</td>
                        <td>2h39&apos;58</td>
                        <td>3h06&apos;38</td>
                        <td className={styles.targetTime}>3h44&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>4h00</td>
                        <td className={styles.targetPace}>5&apos;41 / km</td>
                        <td>56&apos;53</td>
                        <td>2h00&apos;00</td>
                        <td>2h50&apos;38</td>
                        <td>3h19&apos;05</td>
                        <td className={styles.targetTime}>3h59&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>4h30</td>
                        <td className={styles.targetPace}>6&apos;24 / km</td>
                        <td>1h03&apos;59</td>
                        <td>2h15&apos;00</td>
                        <td>3h11&apos;57</td>
                        <td>3h43&apos;57</td>
                        <td className={styles.targetTime}>4h29&apos;59</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className={styles.targetTime}>1h20</td>
                        <td className={styles.targetPace}>3&apos;47 / km</td>
                        <td>18&apos;57</td>
                        <td>37&apos;54</td>
                        <td>56&apos;52</td>
                        <td>1h15&apos;49</td>
                        <td className={styles.targetTime}>1h19&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>1h30</td>
                        <td className={styles.targetPace}>4&apos;16 / km</td>
                        <td>21&apos;20</td>
                        <td>42&apos;39</td>
                        <td>1h03&apos;59</td>
                        <td>1h25&apos;19</td>
                        <td className={styles.targetTime}>1h29&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>1h45</td>
                        <td className={styles.targetPace}>4&apos;58 / km</td>
                        <td>24&apos;53</td>
                        <td>49&apos;46</td>
                        <td>1h14&apos;39</td>
                        <td>1h39&apos;32</td>
                        <td className={styles.targetTime}>1h44&apos;59</td>
                      </tr>
                      <tr>
                        <td className={styles.targetTime}>2h00</td>
                        <td className={styles.targetPace}>5&apos;41 / km</td>
                        <td>28&apos;27</td>
                        <td>56&apos;53</td>
                        <td>1h25&apos;20</td>
                        <td>1h53&apos;46</td>
                        <td className={styles.targetTime}>1h59&apos;59</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 6. TAB CONTENT: GUIDE LOGISTIQUE OFFICIEL */}
      {activeTab === 'logistique' && (
        <>
          <div className={styles.logisticsGrid}>
            {/* Retrait Dossards */}
            <div className={`${styles.logisticsCard} ${styles.logisticsCardHighlight}`}>
              <div className={styles.logisticsHeader}>
                <div className={styles.logisticsIcon}>
                  <Award size={20} />
                </div>
                <h3 className={styles.logisticsTitle}>Retrait des Dossards</h3>
              </div>
              <div className={styles.logisticsContent}>
                <p>
                  <strong>Lieu :</strong> Espace Jeanne Laurent (2 Montée des Moulins, 84000 Avignon).
                </p>
                <ul className={styles.logisticsList}>
                  <li>
                    <Calendar size={14} color="#ec4899" /> <strong>Vendredi 25 septembre :</strong> 16h00 à 20h00
                  </li>
                  <li>
                    <Calendar size={14} color="#ec4899" /> <strong>Samedi 26 septembre :</strong> 10h00 à 20h00
                  </li>
                  <li>
                    <CheckCircle2 size={14} color="#ec4899" /> <strong>Pièces requises :</strong> QR Code de retrait + pièce d&apos;identité (dossier validé sur Finishers avec PPS ou licence FFA).
                  </li>
                  <li>
                    <ShoppingBag size={14} color="#ec4899" /> <strong>T-shirt manche longue offert :</strong> à retirer en boutique chez <strong>STATION STORE</strong> dans Avignon.
                  </li>
                </ul>
                <div className={styles.logisticsAlert}>
                  <AlertTriangle size={16} /> PAS DE RETRAIT DE DOSSARD LE DIMANCHE MATIN !
                </div>
              </div>
            </div>

            {/* Dimanche Matin & Horaires */}
            <div className={styles.logisticsCard}>
              <div className={styles.logisticsHeader}>
                <div className={`${styles.logisticsIcon} ${styles.logisticsIconCyan}`}>
                  <Clock size={20} />
                </div>
                <h3 className={styles.logisticsTitle}>Programme du Dimanche 27 Septembre</h3>
              </div>
              <div className={styles.logisticsContent}>
                <ul className={styles.logisticsList}>
                  <li>
                    <strong>7h00 - 8h00 :</strong> Dépôt consignes Semi-Marathon (Cours Président Kennedy).
                  </li>
                  <li>
                    <strong>7h00 - 8h40 :</strong> Dépôt consignes Marathon (Cours Président Kennedy).
                  </li>
                  <li>
                    <strong>7h30 :</strong> Ouverture des SAS Semi (Porte de la République / Cours Jean Jaurès).
                  </li>
                  <li>
                    <strong>8h00 :</strong> <span style={{ color: '#38bdf8', fontWeight: 800 }}>DÉPART DU SEMI-MARATHON</span> (Gare Centre).
                  </li>
                  <li>
                    <strong>8h30 :</strong> Ouverture des SAS Marathon (Porte de la République).
                  </li>
                  <li>
                    <strong>9h00 :</strong> <span style={{ color: '#ec4899', fontWeight: 800 }}>DÉPART DU MARATHON</span> (Gare Centre).
                  </li>
                  <li>
                    <strong>10h45 :</strong> Dernière arrivée Semi (Barrière 2h45).
                  </li>
                  <li>
                    <strong>13h30 - 14h30 :</strong> Cérémonie de remise des prix (Base de Loisirs).
                  </li>
                  <li>
                    <strong>14h45 :</strong> Dernière arrivée Marathon (Barrière 5h45).
                  </li>
                </ul>
              </div>
            </div>

            {/* Ravitaillements */}
            <div className={styles.logisticsCard}>
              <div className={styles.logisticsHeader}>
                <div className={`${styles.logisticsIcon} ${styles.logisticsIconGold}`}>
                  <Droplets size={20} />
                </div>
                <h3 className={styles.logisticsTitle}>Ravitaillements & Éco-Responsabilité</h3>
              </div>
              <div className={styles.logisticsContent}>
                <p>
                  Tous les ravitaillements sont servis en <strong>verres en carton</strong> avec électrolytes <strong>Tā</strong>. 
                  La boisson au maté <strong>Frate Mate</strong> sera servie aux <strong>KM 10 et KM 35</strong>.
                </p>
                <div className={styles.ravitoTimeline}>
                  {selectedRace === 'marathon' ? (
                    <>
                      <span className={styles.ravitoPill}>KM 5</span>
                      <span className={`${styles.ravitoPill} ${styles.ravitoPillSpecial}`}>KM 10 (Frate Mate + WC)</span>
                      <span className={styles.ravitoPill}>KM 13 (WC)</span>
                      <span className={styles.ravitoPill}>KM 18</span>
                      <span className={styles.ravitoPill}>KM 24</span>
                      <span className={styles.ravitoPill}>KM 28 (WC)</span>
                      <span className={styles.ravitoPill}>KM 33 (WC)</span>
                      <span className={`${styles.ravitoPill} ${styles.ravitoPillSpecial}`}>KM 35 (Frate Mate + WC)</span>
                      <span className={styles.ravitoPill}>KM 39</span>
                      <span className={styles.ravitoPill}>Arrivée</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.ravitoPill}>KM 5</span>
                      <span className={`${styles.ravitoPill} ${styles.ravitoPillSpecial}`}>KM 10 (Frate Mate + WC)</span>
                      <span className={styles.ravitoPill}>KM 13 (WC)</span>
                      <span className={styles.ravitoPill}>KM 15</span>
                      <span className={styles.ravitoPill}>KM 17 (WC)</span>
                      <span className={styles.ravitoPill}>Arrivée</span>
                    </>
                  )}
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  💡 <em>Conseil organisation : Il est vivement recommandé d&apos;emporter votre propre flasque (250ml pour le Semi, 500ml pour le Marathon).</em>
                </p>
              </div>
            </div>

            {/* Barrières Horaires */}
            <div className={styles.logisticsCard}>
              <div className={styles.logisticsHeader}>
                <div className={styles.logisticsIcon}>
                  <AlertTriangle size={20} />
                </div>
                <h3 className={styles.logisticsTitle}>Barrières Horaires Strictes</h3>
              </div>
              <div className={styles.logisticsContent}>
                <p>
                  Les temps limites sont calculés depuis le coup de pistolet de votre épreuve :
                </p>
                {selectedRace === 'marathon' ? (
                  <ul className={styles.logisticsList}>
                    <li><strong>KM 21 (Semi-Marathon) :</strong> 2h55 de course (11h55)</li>
                    <li><strong>KM 30 :</strong> 4h05 de course (13h05)</li>
                    <li><strong>Arrivée (KM 42,195) :</strong> 5h45 de course (14h45)</li>
                  </ul>
                ) : (
                  <ul className={styles.logisticsList}>
                    <li><strong>KM 5 :</strong> 45 min de course (08h45)</li>
                    <li><strong>KM 10 :</strong> 1h25 de course (09h25)</li>
                    <li><strong>KM 15 :</strong> 2h05 de course (10h05)</li>
                    <li><strong>Arrivée (KM 21,1) :</strong> 2h45 de course (10h45)</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Parking & Transportation Guide */}
          <div className={styles.parkingGuide}>
            <div className={styles.sectionHeader}>
              <Car size={24} color="#38bdf8" />
              <h3 className={styles.sectionTitle}>GUIDE DU STATIONNEMENT LE DIMANCHE 27 SEPTEMBRE</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Plusieurs ponts et axes routiers seront fermés dès 7h15 pour la sécurité des coureurs. Anticipez votre arrivée !
            </p>

            <div className={styles.parkingGrid}>
              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Parking de l&apos;Île Piot</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgeFree}`}>GRATUIT</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  <strong>1 100 places</strong> (dont 22 PMR). Idéal si vous venez du Gard : situé à seulement <strong>300m de l&apos;arrivée</strong> sur l&apos;Île de la Barthelasse !
                </p>
                <div className={styles.parkingDetail}>
                  Accès avant 7h15 par tous accès. Dès 7h15 : accessible depuis le Gard par le Pont du Royaume ou de l&apos;Europe.
                </div>
              </div>

              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Parking des Italiens</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgeFree}`}>GRATUIT</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  <strong>1 450 places</strong> (dont 25 PMR). Recommandé pour les coureurs venant du Vaucluse, de l&apos;autoroute A7 et des Bouches-du-Rhône.
                </p>
                <div className={styles.parkingDetail}>
                  Accessible sans restriction toute la journée. À 2,4 km à pied du départ.
                </div>
              </div>

              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Relais Tram St-Chamand</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgePaid}`}>2,50 € / JOUR</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  <strong>360 places</strong>. Tarif avantageux incluant le ticket de tramway Orizo. L&apos;arrêt de tramway vous dépose à 300m du départ !
                </p>
                <div className={styles.parkingDetail}>
                  Av. Pierre de Coubertin, 84000 Avignon. Accessible toute la journée.
                </div>
              </div>

              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Parking Indigo Jean Jaurès</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgePaid}`}>PAYANT</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  <strong>700 places</strong>. Situé à 200m seulement de la ligne de départ (devant la Gare Centre).
                </p>
                <div className={styles.parkingDetail}>
                  Arrivée obligatoire avant 6h45 (accès fermé de 6h45 à 11h). Sortie possible à toute heure.
                </div>
              </div>

              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Allées de l&apos;Oulle</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgeFree}`}>4H GRATUIT</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  <strong>530 places</strong>. Bd de l&apos;Oulle, à 1,2 km à pied du départ.
                </p>
                <div className={styles.parkingDetail}>
                  Entrée avant 7h15 impérative. Parking inaccessible de 7h15 à 11h30.
                </div>
              </div>

              <div className={styles.parkingItem}>
                <div className={styles.parkingItemHeader}>
                  <span className={styles.parkingItemTitle}>Arrivée en Train SNCF</span>
                  <span className={`${styles.parkingItemBadge} ${styles.badgeFree}`}>ÉCO-MOBILITÉ</span>
                </div>
                <p className={styles.parkingItemDesc}>
                  La ligne de départ est située directement sur le parvis de la <strong>Gare Avignon Centre</strong>.
                </p>
                <div className={styles.parkingDetail}>
                  L&apos;Espace Jeanne Laurent (dossards) est à 10 min à pied. Tramway Orizo à proximité.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 7. TAB CONTENT: ÉQUIPEMENT & MATÉRIEL TOP4RUNNING */}
      {activeTab === 'equipement' && (
        <div className={styles.gearSection}>
          <div className={styles.sectionHeader}>
            <ShoppingBag size={24} color="#ec4899" />
            <h3 className={styles.sectionTitle}>SÉLECTION MATÉRIEL & CHAUSSURES RECOMMANDÉES</h3>
          </div>
          <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Avec son profil ultra-plat (+80m D+ sur le marathon) et 100% de bitume et chemins carrossables réguliers, 
            le Marathon d&apos;Avignon est le terrain de prédilection des <strong>chaussures de compétition à plaque de carbone</strong>. 
            Découvrez nos recommandations techniques pour performer sur ce tracé :
          </p>

          <div className={styles.gearGrid}>
            <div className={styles.gearCard}>
              <div className={styles.gearCardTitle}>⚡ Super-Shoes Carbone (RP / Compétition)</div>
              <p className={styles.gearCardText}>
                Maximisez votre retour d&apos;énergie et préservez vos fibres musculaires sur le bitume roulant de la Barthelasse : 
                Nike Alphafly 3, Vaporfly 3, Adidas Adizero Adios Pro 3, Asics Metaspeed Sky Paris, Saucony Endorphin Pro 4.
              </p>
              <a
                href="https://top4running.fr/c/running-chaussures?a_box=sc3esau3"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.affiliateBtn}
              >
                Voir les modèles carbone Top4Running <ExternalLink size={14} />
              </a>
            </div>

            <div className={styles.gearCard}>
              <div className={styles.gearCardTitle}>💧 Hydratation & Flasques Souples</div>
              <p className={styles.gearCardText}>
                L&apos;organisation recommande une <strong>flasque souple de 250ml (semi) ou 500ml (marathon)</strong>. 
                Une ceinture porte-bidon fine vous évitera la cohue aux tables de ravitaillement et permettra de boire régulièrement.
              </p>
              <a
                href="https://top4running.fr/c/accessoires-running?a_box=sc3esau3"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.affiliateBtn}
              >
                Ceintures & Flasques Top4Running <ExternalLink size={14} />
              </a>
            </div>

            <div className={styles.gearCard}>
              <div className={styles.gearCardTitle}>⚡ Partenaire Nutrition : NUTRIPURE</div>
              <p className={styles.gearCardText}>
                Pour optimiser l&apos;apport glucidique (60g/h) sans écœurement ni inconfort gastrique, le coach Vincent Buisson recommande son partenaire <strong>Nutripure</strong> : 
                la <strong>Boisson Énergétique d&apos;Effort 60g</strong> (ratio 2:1 maltodextrine/fructose, 1000mg BCAA, 5 électrolytes) 
                ou les <strong>Gels Énergétiques Nutripure</strong> (30g de glucides par gel, technologie SolidCarbs™).
              </p>
              <a
                href="https://www.nutripure.fr/fr/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.affiliateBtn}
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
              >
                Découvrir la nutrition Nutripure <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. FINAL CALL TO ACTION */}
      <section className={styles.finalCta}>
        <h3 className={styles.finalCtaTitle}>PRÊT À MARQUER L&apos;HISTOIRE EN VAUCLUSE ?</h3>
        <p className={styles.finalCtaDesc}>
          Rejoignez des milliers de coureurs pour la première édition du Marathon et Semi-Marathon d&apos;Avignon 
          le dimanche 27 septembre 2026. Les inscriptions sont ouvertes sur le site officiel !
        </p>
        <div className={styles.finalCtaButtons}>
          <a
            href="https://www.avignon-marathon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            S&apos;INSCRIRE SUR LE SITE OFFICIEL <ExternalLink size={16} />
          </a>
          <Link href="/#calendrier" className={styles.btnSecondary}>
            VOIR TOUT LE CALENDRIER VAUCLUSE
          </Link>
        </div>
      </section>
    </div>
  );
}

// Small inline Wind icon helper if not in lucide
function Wind({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
    </svg>
  );
}
