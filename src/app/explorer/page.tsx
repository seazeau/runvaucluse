'use client';

import { useState, useMemo } from 'react';
import RouteCard from '@/components/RouteCard';
import RouteSubmissionForm from '@/components/RouteSubmissionForm';
import styles from './Explorer.module.css';
import { Map as MapIcon, Share2, Plus } from 'lucide-react';
import itinerairesData from '@/data/itineraires.json';

interface Route {
  slug?: string;
  distance: string;
  [key: string]: unknown;
}

export default function ExplorerPage() {
  const [filter, setFilter] = useState('all');

  const filteredRoutes = useMemo(() => {
    return (itinerairesData as Route[]).filter((route: Route) => {
      const dist = parseFloat(route.distance.replace(',', '.').replace(' km', ''));
      if (filter === 'short') return dist < 15;
      if (filter === 'medium') return dist >= 15 && dist <= 30;
      if (filter === 'long') return dist > 30;
      return true;
    });
  }, [filter]);

  const scrollToSubmit = () => {
    const element = document.getElementById('submit');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.hero}>
        <img 
          src="/images/itinéraire.jpg" 
          alt="Outdoor Adventure" 
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>EXPLORER LE VAUCLUSE</h1>
          <p className={styles.subtitle}>Les plus beaux itinéraires de trail et de course à pied en Provence.</p>
          <button onClick={scrollToSubmit} className={styles.heroBtn}>
            PROPOSER UN ITINÉRAIRE <Plus size={20} />
          </button>
        </div>
      </section>

      <div className="container">
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <MapIcon size={24} style={{ color: 'var(--accent)' }} />
              <h2 className={styles.sectionTitle}>ITINÉRAIRES</h2>
            </div>
            <p className={styles.sectionDesc}>
              Une sélection de tracés mythiques testés et approuvés par la communauté.
              Cliquez sur un parcours pour voir les détails et télécharger le GPX.
            </p>
          </header>

          <div className={styles.filterBar}>
            <button 
              className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'short' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('short')}
            >
              Court (&lt; 15km)
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'medium' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('medium')}
            >
              Moyen (15-30km)
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'long' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('long')}
            >
              Long (&gt; 30km)
            </button>
          </div>

          <div className={styles.routeGrid}>
            {filteredRoutes.map((route: Route, i: number) => (
              <RouteCard key={route.slug || i} {...(route as unknown as React.ComponentProps<typeof RouteCard>)} />
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Aucun itinéraire ne correspond à ce critère pour le moment.
            </div>
          )}
        </section>

        <section id="submit" className={styles.submissionSection}>
          <div className={styles.submissionGrid}>
            <div className={styles.submissionInfo}>
              <Share2 size={32} style={{ color: 'var(--accent)', marginBottom: '1.5rem' }} />
              <h2>PARTAGEZ VOTRE PARCOURS</h2>
              <p>
                Vous connaissez un sentier secret, une montée technique ou un parcours roulant que vous adorez ? 
                Soumettez votre itinéraire (Strava, Komoot ou GPX) pour en faire profiter la communauté.
              </p>
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>1</div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Remplissez le formulaire technique.</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>2</div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Notre équipe valide le tracé et la sécurité.</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>3</div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>L&apos;itinéraire est publié avec vos crédits.</span>
                </div>
              </div>
            </div>
            <div>
              <RouteSubmissionForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
