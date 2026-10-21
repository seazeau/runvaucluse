import { Race } from '@/lib/types';
import racesData from '@/data/races.json';
import styles from './RaceDetail.module.css';
import { MapPin, Calendar, Activity, Phone, Globe, ArrowLeft, Download, FileText, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getResultsBySlug } from '@/lib/db';
import StructuredData from '@/components/StructuredData';
import CyberCardGenerator from '@/components/CyberCardGenerator';
import AvignonMarathonDossier from '@/components/AvignonMarathonDossier';

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

  const seoDescription = race.description || 
    `Participez à ${race.name} (${race.type}) le ${formattedDate} à ${race.city}. Retrouvez les distances (${race.distances}), les infos d'inscription et le calendrier complet des courses en Vaucluse sur RunVaucluse.`;

  const hasCityInName = race.name.toLowerCase().includes(race.city.toLowerCase());
  const displayName = hasCityInName ? race.name : `${race.name} (${race.city})`;

  const pageTitle = race.is_cancelled
    ? `[ANNULÉE] ${displayName} ${raceYear}`
    : `${displayName} ${raceYear} : Parcours, Inscriptions & Infos`;

  return {
    title: pageTitle,
    description: seoDescription,
    keywords: [`${race.name}`, `${race.city}`, `course ${race.type} vaucluse`, `calendrier courses ${raceYear}`, `trail vaucluse`, `running paca`, 'marathon avignon', 'semi marathon avignon'],
    alternates: {
      canonical: `https://runvaucluse.fr/race/${race.slug}/`,
    },
    openGraph: {
      title: `${displayName} ${raceYear}`,
      description: seoDescription,
      url: `https://runvaucluse.fr/race/${race.slug}/`,
      images: [race.image_url || '/images/og-image.jpg'],
      type: 'website',
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

  // GPX for GRV
  const isGRV = slug === 'grand-raid-ventoux-by-utmb-malaucene';
  const grvGpx = [
    { label: '123 KM (100M)', file: '/itineraires/100_M_GRV_26_v6_62916c4aac.gpx' },
    { label: '82 KM (100K)', file: '/itineraires/100_K_GRV_26_v6_02a026d758.gpx' },
    { label: '52 KM (50K)', file: '/itineraires/50_K_GRV_26_v6_d9bc3f59ce.gpx' },
    { label: '25 KM (20K)', file: '/itineraires/20_K_GRV_26_v6_b38f5b4346.gpx' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <StructuredData race={race} />
      
      <main className={styles.main}>
        <div className="container">
          <Link href="/#calendrier" className={styles.backLink}>
            <ArrowLeft size={16} /> RETOUR AU CALENDRIER
          </Link>

          <div className={styles.detailGrid}>
            {/* Left: Poster */}
            <div className={styles.posterSection}>
              {race.image_url ? (
                <img src={race.image_url} alt={race.name} className={styles.poster} />
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
                </div>
                <h1 className={styles.title}>{race.name}</h1>
                <div className={styles.location}>
                  <MapPin size={20} className={styles.icon} />
                  <span>{race.city}, Vaucluse</span>
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
                    <span className={styles.techValue}>{race.distances}</span>
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

              {(race.pdf_link || race.parcours_link || race.gpx_link) && (
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
                    <strong>Dimanche 14 mars 2027 :</strong> 2ème édition du grand Marathon & Semi-Marathon d&apos;Avignon ! 
                    Courrez au cœur de la Cité des Papes et sur l&apos;Île de la Barthelasse sur un parcours ultra-plat (+80m D+), 
                    <strong>labellisé FFA sur les 2 distances</strong> et qualificatif pour les Championnats de France. 
                    <strong>6 000 dossards au total</strong> (3 000 sur le semi / 3 000 sur le marathon). 
                    Ouverture des inscriptions <strong>avant la fin du mois d&apos;octobre</strong> sur la plateforme unique <strong>Finishers</strong>. 
                    Partenaires majeurs : <strong>NGE</strong> et <strong>Ville d&apos;Avignon</strong>. 
                    Retrouvez ci-dessous le dossier officiel complet : <strong>tracés GPX téléchargeables</strong>, profil altimétrique interactif, 
                    <strong>découpage km par km</strong>, ravitaillements et <strong>conseils tactiques de Vincent Buisson (Diplômé STAPS)</strong>.
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
                      <Sparkles size={16} /> 2ÈME ÉDITION • 14 MARS 2027 • 6 000 DOSSARDS
                    </div>
                    <p className={styles.announcementText}>
                      Ouverture des inscriptions <strong>avant fin octobre</strong> sur la plateforme unique <strong>Finishers</strong> (3 000 marathon / 3 000 semi-marathon). Parcours labellisés FFA sur les 2 distances. Partenaires majeurs : <strong>NGE</strong> & <strong>Ville d&apos;Avignon</strong>.
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
        </div>
      </main>
    </div>
  );
}
