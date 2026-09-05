import itinerairesData from '@/data/itineraires.json';
import styles from './RouteDetail.module.css';
import { MapPin, Zap, Mountain, ChevronLeft, Download, Info, Lightbulb, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import GPXViewer from '@/components/GPXViewer';
import { getResultsBySlug } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = itinerairesData.find(r => r.slug === slug);

  if (!route) return { title: 'Itinéraire non trouvé' };

  return {
    title: `${route.title} - Itinéraire Trail | RunVaucluse`,
    description: `Découvrez l'itinéraire "${route.title}" en Vaucluse : ${route.distance}, ${route.elevation} de dénivelé. ${route.description.substring(0, 100)}...`,
    openGraph: {
      title: `${route.title} - Itinéraire Trail | RunVaucluse`,
      description: route.description,
      images: route.image ? [route.image] : [],
    }
  };
}

export async function generateStaticParams() {
  return itinerairesData.map((route) => ({
    slug: route.slug,
  }));
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = itinerairesData.find(r => r.slug === slug);
  const results = getResultsBySlug(slug);

  if (!route) return <div>Itinéraire non trouvé</div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": route.title,
    "description": route.description,
    "image": route.image ? `https://runvaucluse.fr${route.image}` : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": route.location,
      "addressRegion": "Vaucluse",
      "addressCountry": "FR"
    },
    "url": `https://runvaucluse.fr/explorer/${slug}`
  };

  return (
    <div className={styles.pageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <div className="container">
          <Link href="/explorer" className={styles.backLink}>
            <ChevronLeft size={16} /> RETOUR AUX ITINÉRAIRES
          </Link>

          <div className={styles.header}>
            <div className={styles.locationBadge}>
              <MapPin size={14} /> {route.location}
            </div>
            <h1 className={styles.title}>{route.title}</h1>
          </div>

          <div className={styles.grid}>
            {/* Left Column: Media, Map & Description */}
            <div className={styles.contentSection}>
              {route.image ? (
                <>
                  <div className={styles.mainImageContainer}>
                    <img src={route.image} alt={route.title} className={styles.mainImage} />
                  </div>
                  
                  {route.allImages && route.allImages.length > 0 && (
                    <div className={styles.imageGallery}>
                      {route.allImages.map((img, i) => (
                        <img key={i} src={img} alt={`${route.title} ${i + 1}`} className={styles.galleryThumb} />
                      ))}
                    </div>
                  )}

                  {/* GPX Map and Profile - BELOW image if image exists */}
                  <div className={styles.mapContainer}>
                    <GPXViewer gpxLink={route.gpxLink} />
                  </div>
                </>
              ) : (
                <>
                  {/* GPX Map and Profile - AT TOP if no image */}
                  <div className={styles.mapContainer}>
                    <GPXViewer gpxLink={route.gpxLink} />
                  </div>
                </>
              )}

              <div className={styles.descriptionCard}>
                <div className={styles.cardHeader}>
                  <Info size={20} className={styles.accentIcon} />
                  <h3>DESCRIPTION DU PARCOURS</h3>
                </div>
                <p>{route.description}</p>
              </div>

              {route.advice && (
                <div className={styles.adviceCard}>
                  <div className={styles.cardHeader}>
                    <Lightbulb size={20} className={styles.accentIcon} />
                    <h3>CONSEILS PRATIQUES</h3>
                  </div>
                  <p>{route.advice}</p>
                </div>
              )}
            </div>

            {/* Right Column: Stats & Action */}
            <div className={styles.sidebar}>
              <div className={styles.statsCard}>
                <div className={styles.statRow}>
                  <div className={styles.statIcon}><Zap size={20} /></div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>DISTANCE</span>
                    <span className={styles.statValue}>{route.distance}</span>
                  </div>
                </div>
                <div className={styles.statRow}>
                  <div className={styles.statIcon}><Mountain size={20} /></div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>DÉNIVELÉ</span>
                    <span className={styles.statValue}>{route.elevation}</span>
                  </div>
                </div>
                <div className={styles.statRow}>
                  <div className={styles.statIcon} style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className={styles.difficultyDot} style={{ 
                      backgroundColor: route.difficulty === 'Expert' ? '#f87171' : 
                                       route.difficulty === 'Difficile' ? '#fb923c' : 
                                       route.difficulty === 'Modéré' ? '#facc15' : '#4ade80' 
                    }} />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>DIFFICULTÉ</span>
                    <span className={styles.statValue}>{route.difficulty}</span>
                  </div>
                </div>
              </div>

              <a href={route.gpxLink} download className={styles.downloadBtn}>
                TÉLÉCHARGER LE GPX <Download size={20} />
              </a>

              {results.length > 0 && (
                <Link href={`/resultats/${slug}`} className={styles.resultsBtn}>
                  VOIR LES RÉSULTATS <Trophy size={20} />
                </Link>
              )}

              <div className={styles.warningBox}>
                <p>Attention : La pratique du trail nécessite un équipement adapté et une vérification de la météo. Vous restez responsable de votre sécurité.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

