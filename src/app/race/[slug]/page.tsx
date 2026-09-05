import { Race } from '@/lib/types';
import racesData from '@/data/races.json';
import styles from './RaceDetail.module.css';
import { MapPin, Calendar, Activity, Phone, Globe, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import CyberCardGenerator from '@/components/CyberCardGenerator';

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

  const seoDescription = race.description || 
    `Participez à ${race.name} (${race.type}) le ${formattedDate} à ${race.city}. Retrouvez les distances (${race.distances}), les infos d'inscription et le calendrier complet des courses en Vaucluse 2026 sur RunVaucluse.`;

  return {
    title: `${race.name} - ${race.city} | RunVaucluse 2026`,
    description: seoDescription,
    keywords: [`${race.name}`, `${race.city}`, `course ${race.type} vaucluse`, `calendrier courses 2026`, `trail vaucluse`, `running paca`],
    openGraph: {
      title: `${race.name} - ${race.city}`,
      description: seoDescription,
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
                  <span className={styles.typeBadge}>{race.type}</span>
                  {race.label && <span className={styles.labelBadge}>{race.label}</span>}
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

              <div className={styles.description}>
                <h3>À PROPOS DE L&apos;ÉVÈNEMENT</h3>
                {race.description ? (
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
                {race.registration_link ? (
                  <a href={race.registration_link} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                    S'INSCRIRE
                  </a>
                ) : race.link ? (
                  <a href={race.link} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                    S'INSCRIRE
                  </a>
                ) : (
                  <div className={styles.pendingMsg}>Les inscriptions ne sont pas encore ouvertes.</div>
                )}
                
                <CyberCardGenerator race={race} />
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
