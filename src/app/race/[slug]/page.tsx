import { Race } from '@/lib/types';
import racesData from '@/data/races.json';
import styles from './RaceDetail.module.css';
import { MapPin, Calendar, Activity, Phone, Globe, ArrowLeft, Download, FileText, Trophy, Sparkles, HelpCircle, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getResultsBySlug } from '@/lib/db';
import StructuredData from '@/components/StructuredData';
import CyberCardGenerator from '@/components/CyberCardGenerator';
import AvignonMarathonDossier from '@/components/AvignonMarathonDossier';
import TerroirsMarathonDossier from '@/components/TerroirsMarathonDossier';
import NutripurePartnerCard from '@/components/NutripurePartnerCard';
import ShoeFinder from '@/components/ShoeFinder';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = (racesData as Race[]).find(r => r.slug === slug);

  if (!race) return { title: 'Course non trouvée' };

  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const raceYear = raceDate.getFullYear();

  const hasCityInName = race.name.toLowerCase().includes(race.city.toLowerCase());
  const displayName = hasCityInName ? race.name : `${race.name} (${race.city})`;

  // High-CTR SEO Titles matching user search intent (Inscriptions, Dates, Parcours)
  let pageTitle = `${displayName} ${raceYear} : Inscription, Parcours & Date`;
  let metaDescription = race.description 
    ? (race.description.length > 155 ? race.description.substring(0, 152).trim() + '...' : race.description)
    : `Toutes les infos sur ${displayName} le ${formattedDate} à ${race.city} en Vaucluse (${race.distances}) : inscription en ligne, tracé, dénivelé et calendrier officiel.`;

  if (race.is_cancelled) {
    pageTitle = `[ANNULÉE] ${displayName} ${raceYear} : Informations`;
  } else if (slug === 'marathon-davignon-avignon') {
    pageTitle = `Marathon & Semi-Marathon d'Avignon 2027 (14 Mars) : Inscription & Parcours GPX`;
    metaDescription = `Dimanche 14 mars 2027 : 2e édition du Marathon (42,2 km, départ 9h) & Semi-Marathon d'Avignon (21,1 km, départ 8h). Inscriptions Finishers, tracés GPX plats (+80m D+) & dossards.`;
  } else if (slug === 'marathon-des-terroirs-du-ventoux-mazan') {
    pageTitle = `Marathon des Terroirs du Ventoux 2027 : Inscriptions, Formats & Affiche`;
    metaDescription = `1ère édition les 23 & 24 octobre 2027 à Mazan : Marathon (42 km), Semi (21 km), 10 km, Rando (5 km) et enfants. Run, Taste & Party avec les vins AOC Ventoux.`;
  }

  const fullImageUrl = race.image_url?.startsWith('http') 
    ? race.image_url 
    : `https://runvaucluse.fr${race.image_url || '/images/og-image.jpg'}`;

  const extraKeywords = slug === 'marathon-davignon-avignon' ? [
    'marathon avignon 2027',
    'semi marathon avignon 2027',
    "marathon d'avignon 2027",
    'semi-marathon avignon 2027',
    'semi avignon 2027',
    "semi marathon d'avignon 2027",
    'inscription marathon avignon 2027',
    'inscription semi marathon avignon 2027',
    'parcours marathon avignon 2027',
    'gpx marathon avignon',
    'date marathon avignon 2027',
    'finishers marathon avignon'
  ] : [];

  return {
    title: slug === 'marathon-davignon-avignon' ? { absolute: `${pageTitle} | RunVaucluse` } : pageTitle,
    description: metaDescription,
    keywords: [
      ...extraKeywords,
      `${race.name}`,
      `inscription ${race.name}`,
      `inscription ${race.name} ${raceYear}`,
      `${race.city}`,
      `course ${race.city}`,
      `trail ${race.city}`,
      `${race.type} vaucluse`,
      `calendrier courses ${raceYear}`,
      `inscriptions ${race.name}`,
      `parcours ${race.name}`,
      'trail vaucluse',
      'running paca',
      'course a pied vaucluse'
    ],
    alternates: {
      canonical: `https://runvaucluse.fr/race/${race.slug}/`,
    },
    openGraph: {
      title: `${pageTitle} | RunVaucluse`,
      description: metaDescription,
      url: `https://runvaucluse.fr/race/${race.slug}/`,
      siteName: 'RunVaucluse',
      locale: 'fr_FR',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${race.name} - ${race.city} Vaucluse`,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | RunVaucluse`,
      description: metaDescription,
      images: [fullImageUrl],
    }
  };
}

export async function generateStaticParams() {
  return (racesData as Race[]).map((race) => ({
    slug: race.slug,
  }));
}

export default async function RaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = (racesData as Race[]).find(r => r.slug === slug);

  if (!race) {
    return <div>Course non trouvée</div>;
  }

  const results = getResultsBySlug(slug);
  const hasResults = results.length > 0;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isUpcoming = race.date >= todayStr;

  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mapQuery = encodeURIComponent(`${race.city}, Vaucluse, France`);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  // Smart FB Link: use direct link if it's a full URL, otherwise search
  const fbUrl = race.facebook?.startsWith('http') 
    ? race.facebook 
    : `https://www.facebook.com/search/top/?q=${encodeURIComponent(race.name)}`;

  // Related races for internal SEO linking
  const relatedRaces = (racesData as Race[])
    .filter(r => r.slug !== slug)
    .sort((a, b) => {
      const sameTypeA = a.type === race.type ? 1 : 0;
      const sameTypeB = b.type === race.type ? 1 : 0;
      if (sameTypeA !== sameTypeB) return sameTypeB - sameTypeA;
      return Math.abs(new Date(a.date).getTime() - raceDate.getTime()) - Math.abs(new Date(b.date).getTime() - raceDate.getTime());
    })
    .slice(0, 3);

  // GPX for GRV
  const isGRV = slug === 'grand-raid-ventoux-by-utmb-malaucene';
  const grvGpx = [
    { label: '123 KM (100M)', file: '/itineraires/100_M_GRV_26_v6_62916c4aac.gpx' },
    { label: '82 KM (100K)', file: '/itineraires/100_K_GRV_26_v6_02a026d758.gpx' },
    { label: '52 KM (50K)', file: '/itineraires/50_K_GRV_26_v6_d9bc3f59ce.gpx' },
    { label: '25 KM (20K)', file: '/itineraires/20_K_GRV_26_v6_b38f5b4346.gpx' },
  ];

  // GPX for Traversée des Dentelles
  const isDentelles = slug === 'traversee-des-dentelles-gigondas';
  const dentellesGpx = [
    { label: '42 KM • Marathon des Dentelles (2 000m D+)', file: '/itineraires/traversee-dentelles-42km-marathon.gpx' },
    { label: '21 KM • La Traversée des Dentelles (600m D+)', file: '/itineraires/traversee-dentelles-21km.gpx' },
    { label: '11 KM • La Gambade (420m D+)', file: '/itineraires/traversee-dentelles-11km-gambade.gpx' },
    { label: '5 KM • La Petite Gambade (210m D+)', file: '/itineraires/traversee-dentelles-5km-petite-gambade.gpx' },
  ];

  // GPX for Marathon & Semi-Marathon d'Avignon 2027
  const isAvignon = slug === 'marathon-davignon-avignon';
  const avignonGpx = [
    { label: "42,2 KM • Marathon d'Avignon (+80m D+)", file: '/itineraires/marathon-avignon.gpx' },
    { label: "21,1 KM • Semi-Marathon d'Avignon (+60m D+)", file: '/itineraires/semi-marathon-avignon.gpx' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <StructuredData race={race} />
      
      <main className={styles.main}>
        <div className="container">
          <nav className={styles.breadcrumbs} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link href="/#calendrier">Calendrier</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{race.name}</span>
          </nav>

          <Link href="/#calendrier" className={styles.backLink}>
            <ArrowLeft size={16} /> RETOUR AU CALENDRIER
          </Link>

          <div className={styles.detailGrid}>
            {/* Left: Poster */}
            <div className={styles.posterSection}>
              {race.image_url ? (
                <a 
                  href={race.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.posterLink}
                  title="Voir l'affiche officielle en haute définition (plein écran)"
                >
                  <img src={race.image_url} alt={race.name} className={styles.poster} />
                  <span className={styles.posterZoomHint}>
                    <ZoomIn size={14} /> Voir en HD
                  </span>
                </a>
              ) : (
                <div className={styles.posterPlaceholder}>PAS D&apos;AFFICHE DISPONIBLE</div>
              )}
            </div>

            {/* Right: Info */}
            <div className={styles.infoSection}>
              <div className={styles.header}>
                <div className={styles.badgeRow}>
                  {race.is_cancelled && (
                    <span className={styles.cancelledBadge}>ÉDITION 2026 ANNULÉE</span>
                  )}
                  <span className={styles.typeBadge}>{race.type}</span>
                  {race.label && <span className={styles.labelBadge}>{race.label}</span>}
                  {slug === 'marathon-davignon-avignon' && (
                    <span className={styles.dossierBadge}>⭐ DOSSIER OFFICIEL COUREUR</span>
                  )}
                  {slug === 'marathon-des-terroirs-du-ventoux-mazan' && (
                    <span className={styles.dossierBadge} style={{ background: 'linear-gradient(135deg, #7b2cbf, #eb5e28)', color: '#fff' }}>
                      🍇 DOSSIER OFFICIEL & FOULÉES FESTIVES
                    </span>
                  )}
                </div>
                <h1 className={styles.title}>
                  {slug === 'marathon-davignon-avignon'
                    ? "Marathon & Semi-Marathon d'Avignon 2027"
                    : race.name}
                </h1>
                <div className={styles.location}>
                  <MapPin size={20} className={styles.icon} />
                  <span>{race.city}, Vaucluse (84)</span>
                </div>
              </div>

              <div className={styles.techGrid}>
                <div className={styles.techItem}>
                  <Calendar size={20} className={styles.icon} />
                  <div>
                    <span className={styles.techLabel}>DATE DE L&apos;ÉPREUVE</span>
                    <span className={styles.techValue}>{formattedDate}</span>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <Activity size={20} className={styles.icon} />
                  <div>
                    <span className={styles.techLabel}>DISTANCES DISPONIBLES</span>
                    <span className={styles.techValue}>
                      {slug === 'marathon-davignon-avignon'
                        ? 'Marathon (42,195 km) & Semi-Marathon (21,1 km)'
                        : race.distances}
                    </span>
                  </div>
                </div>
              </div>

              {isGRV && (
                <div className={styles.gpxContainer}>
                  <span className={styles.gpxLabel}>TRACÉS GPX OFFICIELS</span>
                  <div className={styles.gpxGrid}>
                    {grvGpx.map((gpx, idx) => (
                      <a key={idx} href={gpx.file} download className={styles.gpxBtn}>
                        <Download size={16} /> {gpx.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isDentelles && (
                <div className={styles.gpxContainer}>
                  <span className={styles.gpxLabel}>TRACÉS GPX OFFICIELS (4 PARCOURS)</span>
                  <div className={styles.gpxGrid}>
                    {dentellesGpx.map((gpx, idx) => (
                      <a key={idx} href={gpx.file} download className={styles.gpxBtn}>
                        <Download size={16} /> {gpx.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isAvignon && (
                <div className={styles.gpxContainer}>
                  <span className={styles.gpxLabel}>TRACÉS GPX OFFICIELS 2027 (MARATHON & SEMI)</span>
                  <div className={styles.gpxGrid}>
                    {avignonGpx.map((gpx, idx) => (
                      <a key={idx} href={gpx.file} download className={styles.gpxBtn}>
                        <Download size={16} /> {gpx.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!isDentelles && !isGRV && !isAvignon && (race.pdf_link || race.parcours_link || race.gpx_link) && (
                <div className={styles.gpxContainer}>
                  <span className={styles.gpxLabel}>PLAN & TRACÉ DU PARCOURS</span>
                  <div className={styles.gpxGrid}>
                    {race.gpx_link && (
                      <a href={race.gpx_link} download className={styles.gpxBtn}>
                        <Download size={16} /> TÉLÉCHARGER LE TRACÉ GPX
                      </a>
                    )}
                    {race.pdf_link && (
                      <a href={race.pdf_link} target="_blank" rel="noopener noreferrer" className={styles.gpxBtn}>
                        <FileText size={16} /> VOIR LE PLAN DU PARCOURS (PDF)
                      </a>
                    )}
                    {race.parcours_link && (
                      <a href={race.parcours_link} target="_blank" rel="noopener noreferrer" className={styles.gpxBtn}>
                        <FileText size={16} /> VOIR LE PLAN & PROFIL DU PARCOURS
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.description}>
                <h3>À PROPOS DE L&apos;ÉVÈNEMENT</h3>
                {slug === 'marathon-davignon-avignon' ? (
                  <p>
                    <strong>Dimanche 14 mars 2027 :</strong> 2ème édition du grand <strong>Marathon d&apos;Avignon (42,195 km, départ 9h00)</strong> et <strong>Semi-Marathon d&apos;Avignon (21,1 km, départ 8h00)</strong> ! 
                    Courez au cœur de la Cité des Papes, devant le Palais des Papes et sur l&apos;Île de la Barthelasse sur un parcours 100% route ultra-plat (+80m D+ sur le marathon, +60m D+ sur le semi), 
                    <strong>labellisé FFA sur les 2 distances</strong> et qualificatif pour les Championnats de France. 
                    <strong>6 000 dossards au total</strong> (3 000 sur le semi-marathon / 3 000 sur le marathon). 
                    Les <strong>inscriptions sont ouvertes en ligne</strong> sur la plateforme officielle <strong>Finishers</strong>. 
                    Partenaires majeurs : <strong>NGE</strong> et <strong>Ville d&apos;Avignon</strong>. 
                    Retrouvez ci-dessous le dossier officiel complet : <strong>tracés GPX téléchargeables (42K & 21K)</strong>, profil altimétrique interactif, 
                    <strong>découpage km par km</strong>, horaires, ravitaillements, parkings et <strong>conseils tactiques de Vincent Buisson (Diplômé STAPS)</strong>.
                  </p>
                ) : race.description ? (
                  <p>{race.description}</p>
                ) : (
                  <p>
                    Le <strong>{formattedDate}</strong>, rejoignez-nous à <strong>{race.city}</strong> pour participer à <strong>{race.name}</strong>, 
                    une épreuve de type <strong>{race.type}</strong>. Cet évènement propose plusieurs distances ({race.distances}) 
                    accessibles à tous les niveaux. Ne manquez pas cette occasion de découvrir les paysages du Vaucluse en compétition ou en loisir.
                  </p>
                )}
              </div>

              <div className={styles.contactSection}>
                <h3>CONTACT & ORGANISATION</h3>
                <div className={styles.contactItem}>
                  <Phone size={16} />
                  <span>{race.contact}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                {slug === 'marathon-davignon-avignon' && (
                  <div className={styles.announcementBox}>
                    <div className={styles.announcementTitle}>
                      <Sparkles size={16} /> 2ÈME ÉDITION • DIMANCHE 14 MARS 2027 • 6 000 DOSSARDS
                    </div>
                    <p className={styles.announcementText}>
                      <strong>Inscriptions ouvertes en ligne sur Finishers</strong> (3 000 dossards Marathon départ 9h00 / 3 000 dossards Semi-Marathon départ 8h00). Parcours ultra-plats labellisés FFA sur les 2 distances. Partenaires majeurs : <strong>NGE</strong> & <strong>Ville d&apos;Avignon</strong>.
                    </p>
                  </div>
                )}

                {slug === 'marathon-des-terroirs-du-ventoux-mazan' && (
                  <div className={styles.announcementBox} style={{ borderColor: 'rgba(235, 94, 40, 0.4)', background: 'linear-gradient(135deg, rgba(123, 44, 191, 0.15), rgba(235, 94, 40, 0.12))' }}>
                    <div className={styles.announcementTitle} style={{ color: '#F6C83B' }}>
                      <Sparkles size={16} /> 1ÈRE ÉDITION • 23 & 24 OCTOBRE 2027 • MAZAN
                    </div>
                    <p className={styles.announcementText}>
                      Ouverture des inscriptions <strong>vendredi 14 novembre à 12h00 pétantes</strong> ! 5 formats festifs & gourmands (Marathon 42 km, Semi 21 km, 10 km, Rando 5 km et Enfants) au pied du Géant de Provence en partenariat avec les vins <strong>AOC Ventoux</strong>.
                    </p>
                  </div>
                )}

                {hasResults && (
                  <Link href={`/resultats/${slug}`} className={styles.resultsBtn}>
                    <Trophy size={18} /> {isUpcoming ? 'VOIR LES RÉSULTATS (ÉDITION PRÉCÉDENTE)' : 'VOIR LES RÉSULTATS OFFICIELS'}
                  </Link>
                )}

                {race.is_cancelled ? (
                  <div className={styles.cancelledAlertBox}>
                    <div className={styles.cancelledAlertTitle}>⚠️ ÉPREUVE ANNULÉE EN {raceDate.getFullYear()}</div>
                    <p className={styles.cancelledAlertText}>
                      L&apos;édition {raceDate.getFullYear()} de cette course a été officiellement annulée par l&apos;organisation. Les inscriptions ne seront pas ouvertes pour cette année.
                    </p>
                  </div>
                ) : isUpcoming ? (
                  race.registration_link ? (
                    <a href={race.registration_link} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                      {race.registration_platform ? `S'INSCRIRE SUR ${race.registration_platform.toUpperCase()}` : "S'INSCRIRE"}
                    </a>
                  ) : race.link ? (
                    <a href={race.link} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                      S'INSCRIRE
                    </a>
                  ) : (
                    <div className={styles.pendingMsg}>Les inscriptions ne sont pas encore ouvertes.</div>
                  )
                ) : !hasResults ? (
                  <div className={styles.pendingMsg}>Épreuve terminée.</div>
                ) : null}
                
                {slug === 'marathon-davignon-avignon' && (
                  <a href="#dossier-marathon" className={styles.dossierScrollBtn}>
                    VOIR LE DOSSIER & GPX ↓
                  </a>
                )}

                {slug === 'marathon-des-terroirs-du-ventoux-mazan' && (
                  <a href="#dossier-terroirs" className={styles.dossierScrollBtn} style={{ background: 'linear-gradient(135deg, rgba(123, 44, 191, 0.4), rgba(235, 94, 40, 0.4))' }}>
                    VOIR LE DOSSIER & INFOS ↓
                  </a>
                )}

                {!race.is_cancelled && <CyberCardGenerator race={race} />}
              </div>

              <div className={styles.socialRow}>
                {race.website && (
                  <a href={race.website} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Site Officiel">
                    <Globe size={20} />
                  </a>
                )}
                {race.facebook && (
                  <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}
                {race.instagram && (
                  <a href={race.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
                <a href={mapSearchUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Localisation">
                  <MapPin size={20} />
                </a>
              </div>
            </div>
          </div>

          {slug === 'marathon-davignon-avignon' && <AvignonMarathonDossier />}
          {slug === 'marathon-des-terroirs-du-ventoux-mazan' && <TerroirsMarathonDossier />}

          <section className={styles.coachCard}>
            <div className={styles.coachLeft}>
              <img
                src="/images/vincent-buisson.webp"
                alt="Vincent Buisson — Coach Course à Pied STAPS"
                className={styles.coachAvatar}
                loading="lazy"
              />
              <div className={styles.coachContent}>
                <div className={styles.coachBadges}>
                  <span className={styles.coachTag}>Coaching Officiel RunVaucluse</span>
                  <span className={styles.coachTagMuted}>Diplômé STAPS • Suivi Nolio</span>
                </div>
                <h2 className={styles.coachTitle}>
                  PRÉPARER {race.name.toUpperCase()} AVEC UN PLAN SUR-MESURE
                </h2>
                <p className={styles.coachText}>
                  Fondateur de RunVaucluse et entraîneur diplômé STAPS (Sub-35&apos; au 10 km),{' '}
                  <a href="https://vincentbuisson.fr/" target="_blank" rel="noopener" className={styles.coachInlineLink}>
                    Vincent Buisson
                  </a>{' '}
                  vous accompagne chaque semaine sur <strong>Nolio</strong> pour arriver au départ à 100% de vos moyens :{' '}
                  <a href="https://vincentbuisson.fr/coaching-10km/" target="_blank" rel="noopener" className={styles.coachInlineLink}>
                    préparation 10 km
                  </a>
                  ,{' '}
                  <a href="https://vincentbuisson.fr/coaching-semi-marathon/" target="_blank" rel="noopener" className={styles.coachInlineLink}>
                    coaching semi-marathon
                  </a>
                  ,{' '}
                  <a href="https://vincentbuisson.fr/coaching-marathon/" target="_blank" rel="noopener" className={styles.coachInlineLink}>
                    préparation marathon
                  </a>{' '}
                  et trail.
                </p>
                <div className={styles.coachPills}>
                  <a href="https://vincentbuisson.fr/calculateur-allures/" target="_blank" rel="noopener" className={styles.coachPill}>
                    Calculateur VMA &amp; Allures →
                  </a>
                  <a href="https://vincentbuisson.fr/blog/endurance-fondamentale-zone-2-running/" target="_blank" rel="noopener" className={styles.coachPill}>
                    Guide Endurance Fondamentale (Zone 2) →
                  </a>
                  <a href="https://vincentbuisson.fr/blog/seuil-lactique-course-a-pied-sv1-sv2/" target="_blank" rel="noopener" className={styles.coachPill}>
                    Seuils SV1 &amp; SV2 →
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.coachRight}>
              <a href="https://vincentbuisson.fr/contact/" target="_blank" rel="noopener" className={styles.coachCta}>
                Réserver mon bilan offert →
              </a>
              <span className={styles.coachSubCta}>Visio de 15 min • Sans engagement</span>
            </div>
          </section>

          <NutripurePartnerCard />

          <ShoeFinder
            raceName={race.name}
            raceType={race.type}
            raceDistances={race.distances}
            raceSlug={race.slug}
          />

          <div className={styles.mapContainer}>
            <div className={styles.mapHeader}>
              <MapPin size={24} />
              <h2>LOCALISATION</h2>
            </div>
            <iframe 
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              className={styles.mapIframe}
              allowFullScreen={true} 
              loading="lazy"
            ></iframe>
          </div>

          {/* SEO FAQ Section */}
          <section className={styles.faqSection}>
            <div className={styles.faqHeader}>
              <HelpCircle size={22} />
              <h2>
                QUESTIONS FRÉQUENTES •{' '}
                {slug === 'marathon-davignon-avignon'
                  ? "MARATHON & SEMI-MARATHON D'AVIGNON 2027"
                  : race.name.toUpperCase()}
              </h2>
            </div>
            {slug === 'marathon-davignon-avignon' ? (
              <div className={styles.faqGrid}>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Quelle est la date et l&apos;heure de départ du Marathon et Semi-Marathon d&apos;Avignon 2027 ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    La 2ème édition se déroule le <strong>dimanche 14 mars 2027</strong> devant la <strong>Gare Avignon Centre</strong> (Cours Jean Jaurès). Le départ du <strong>Semi-Marathon d&apos;Avignon (21,0975 km)</strong> est donné à <strong>8h00</strong> et celui du <strong>Marathon d&apos;Avignon (42,195 km)</strong> à <strong>9h00</strong>.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Comment s&apos;inscrire au Marathon et Semi-Marathon d&apos;Avignon 2027 ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Les inscriptions en ligne sont ouvertes sur la plateforme officielle <strong>Finishers</strong> (6 000 dossards disponibles : 3 000 sur le Marathon et 3 000 sur le Semi-Marathon). Une attestation <strong>PPS (Parcours de Prévention Santé)</strong> de moins de 3 mois ou une licence FFA valide est requise.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Quel est le parcours et le dénivelé du Marathon d&apos;Avignon 2027 (GPX) ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Le tracé est 100 % sur route, ultra-roulant et <strong>labellisé FFA</strong> (qualificatif Championnats de France) : <strong>+80m D+ sur le Marathon (42,2 km)</strong> et <strong>+60m D+ sur le Semi-Marathon (21,1 km)</strong>. Il traverse les remparts, le Palais des Papes, le Pont Daladier et l&apos;Île de la Barthelasse. Les 2 fichiers GPX officiels sont téléchargeables gratuitement en haut de cette page.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Où et quand retirer son dossard à Avignon ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Le retrait des dossards a lieu à l&apos;<strong>Espace Jeanne Laurent</strong> (2 Montée des Moulins, 84000 Avignon) le <strong>vendredi 12 mars 2027 de 16h00 à 20h00</strong> et le <strong>samedi 13 mars 2027 de 10h00 à 20h00</strong>. Attention : aucun retrait de dossard le dimanche matin.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Quelles sont les barrières horaires et les allures des meneurs d&apos;allure ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Temps limite de <strong>2h45 sur le Semi-Marathon</strong> (4 meneurs d&apos;allure : 1h20, 1h30, 1h45, 2h00) et de <strong>5h45 sur le Marathon</strong> avec barrières intermédiaires à 2h55 au KM 21 et 4h05 au KM 30 (6 meneurs d&apos;allure : 3h00, 3h15, 3h30, 3h45, 4h00 et 4h30).
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    Où se garer le dimanche 14 mars 2027 pour le départ ?
                  </h3>
                  <p className={styles.faqAnswer}>
                    Les parkings gratuits recommandés sont le <strong>Parking des Italiens</strong> (1 450 places, ouvert toute la journée) et le <strong>Parking de l&apos;Île Piot</strong> (1 100 places à 300m de l&apos;arrivée Barthelasse, accès avant 7h15 ou par le Gard), ainsi que le parking-relais Tram St-Chamand.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.faqGrid}>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Quand a lieu {race.name} ?</h3>
                  <p className={styles.faqAnswer}>
                    L&apos;épreuve se déroule le <strong>{formattedDate}</strong> à <strong>{race.city}</strong> en Vaucluse (84).
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Quelles sont les distances au programme ?</h3>
                  <p className={styles.faqAnswer}>
                    {race.name} propose les parcours et formats suivants : <strong>{race.distances}</strong> ({race.type}).
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Comment s&apos;inscrire à la course ?</h3>
                  <p className={styles.faqAnswer}>
                    {race.is_cancelled ? (
                      "L'édition a été officiellement annulée pour cette année."
                    ) : race.registration_link ? (
                      <>
                        Les inscriptions sont ouvertes en ligne sur la plateforme <strong>{race.registration_platform || "officielle"}</strong>. Retrouvez le lien direct d&apos;inscription ci-dessus.
                      </>
                    ) : race.link ? (
                      <>
                        Les informations et inscriptions sont accessibles via le site officiel de l&apos;organisation.
                      </>
                    ) : (
                      "Les inscriptions ouvriront prochainement. Consultez régulièrement le calendrier RunVaucluse pour ne pas manquer l'ouverture des dossards."
                    )}
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Où se situe le départ à {race.city} ?</h3>
                  <p className={styles.faqAnswer}>
                    Le rassemblement et le retrait des dossards sont situés sur la commune de <strong>{race.city}</strong> (Vaucluse). Consultez la carte interactive ci-dessus pour planifier votre itinéraire.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* SEO Related Races for Internal Linking */}
          {relatedRaces.length > 0 && (
            <section className={styles.relatedSection}>
              <div className={styles.relatedHeader}>
                <h2>ÉPREUVES SIMILAIRES EN VAUCLUSE</h2>
                <Link href="/#calendrier" className={styles.backLink} style={{ margin: 0 }}>
                  VOIR TOUT LE CALENDRIER →
                </Link>
              </div>
              <div className={styles.relatedGrid}>
                {relatedRaces.map((r) => {
                  const rDate = new Date(r.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <Link key={r.slug} href={`/race/${r.slug}/`} className={styles.relatedCard}>
                      <div className={styles.relatedImageContainer}>
                        {r.image_url ? (
                          <>
                            <div 
                              className={styles.relatedBlurBackdrop}
                              style={{ backgroundImage: `url(${r.image_url})` }}
                              aria-hidden="true"
                            />
                            <img src={r.image_url} alt={r.name} className={styles.relatedImage} loading="lazy" />
                          </>
                        ) : (
                          <div className={styles.relatedPlaceholder}>RUNVAUCLUSE</div>
                        )}
                      </div>
                      <div className={styles.relatedBody}>
                        <span className={styles.relatedBadge}>{r.type}</span>
                        <h3 className={styles.relatedTitle}>{r.name}</h3>
                        <div className={styles.relatedMeta}>
                          <span><Calendar size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />{rDate}</span>
                          <span><MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />{r.city}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
