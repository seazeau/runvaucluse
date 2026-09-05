'use client';

import Link from 'next/link';
import styles from './RouteCard.module.css';
import { MoveUpRight, Map, Zap, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

interface RouteCardProps {
  slug: string;
  title: string;
  location: string;
  distance: string;
  elevation: string;
  difficulty: 'Facile' | 'Modéré' | 'Difficile' | 'Expert';
  image: string;
  gpxLink?: string;
  elevationProfile?: number[];
}

export default function RouteCard({ slug, title, location, distance, elevation, difficulty, image, gpxLink, elevationProfile }: RouteCardProps) {
  const diffBadgeStyles = {
    'Facile': { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
    'Modéré': { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
    'Difficile': { bg: '#FFEDD5', text: '#9A3412', border: '#FDBA74' },
    'Expert': { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }
  };

  // Generate SVG path for elevation profile
  const generateProfilePath = () => {
    if (!elevationProfile || elevationProfile.length === 0) return "";
    
    const min = Math.min(...elevationProfile);
    const max = Math.max(...elevationProfile);
    const range = max - min || 1;
    const width = 300;
    const height = 100;
    
    const points = elevationProfile.map((h, i) => {
      const x = (i / (elevationProfile.length - 1)) * width;
      const y = height - ((h - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  return (
    <Link href={`/explorer/${slug}`}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
      >
        <div className={styles.imageContainer}>
          {image ? (
            <img src={image} alt={title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
              {elevationProfile && (
                <svg viewBox="0 0 300 100" className={styles.miniProfile} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad-${slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path 
                    d={generateProfilePath()} 
                    fill={`url(#grad-${slug})`}
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                </svg>
              )}
              <Map size={32} className={styles.placeholderIcon} />
              <span className={styles.placeholderText}>PROFIL GPX</span>
            </div>
          )}
          <div className={styles.overlay}></div>
          <div 
            className={styles.difficulty} 
            style={{ 
              backgroundColor: diffBadgeStyles[difficulty]?.bg || '#ffffff',
              color: diffBadgeStyles[difficulty]?.text || '#111417',
              borderColor: diffBadgeStyles[difficulty]?.border || 'transparent',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            {difficulty}
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.location}>
            <Map size={14} className={styles.icon} />
            <span>{location}</span>
          </div>
          <h3 className={styles.title}>{title}</h3>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <Zap size={16} />
              <span>{distance}</span>
            </div>
            <div className={styles.statItem}>
              <Mountain size={16} />
              <span>{elevation}</span>
            </div>
          </div>

          <div className={styles.gpxBtn}>
            DÉCOUVRIR L&apos;ITINÉRAIRE <MoveUpRight size={14} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
