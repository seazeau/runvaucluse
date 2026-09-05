'use client';

import { useState, useEffect, useRef } from 'react';
import { Race } from '@/lib/types';
import { Share2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import styles from './CyberCardGenerator.module.css';

interface Props {
  race: Race;
}

export default function CyberCardGenerator({ race }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `cyber-card-${race.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      
      // On mobile/modern browsers, try native share if blob is available
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my-race.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Mon inscription à ${race.name}`,
            text: `Je participe à ${race.name} le ${formattedDate} ! #RunVaucluse #Running`,
          });
        } else {
          // Fallback if file share is not supported
          await navigator.share({
            title: `Mon inscription à ${race.name}`,
            text: `Je participe à ${race.name} le ${formattedDate} ! Retrouvez toutes les infos sur RunVaucluse.fr`,
            url: window.location.href,
          });
        }
      } else {
        // Fallback for desktop: download it
        downloadImage();
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={styles.cyberBtn}>
        Partager mon inscription <Share2 size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modalContent}
            >
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={24} />
              </button>

              <div className={styles.generatorLayout}>
                {/* THE CARD PREVIEW */}
                <div id="cyber-card-export" ref={cardRef} className={styles.cardPreview}>
                  <div className={styles.cardInner}>
                    <div className={styles.cardHeader}>
                      <div className={styles.brand}>RUNVAUCLUSE {"//"} 2026</div>
                      <div className={styles.serial}>ID-{race.id.toString().padStart(4, '0')}</div>
                    </div>

                    <div className={styles.imageContainer}>
                      <img src={race.image_url || '/images/og-image.jpg'} alt="" className={styles.cardImage} />
                      <div className={styles.scanline}></div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.typeBadge}>{race.type}</div>
                      <h2 className={styles.raceName}>{race.name}</h2>
                      <div className={styles.raceLocation}>{race.city.toUpperCase()} {"//"} PROVENCE</div>
                      
                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>DATE</span>
                          <span className={styles.metaValue}>{formattedDate}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>DISTANCES</span>
                          <span className={styles.metaValue}>{race.distances.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.qrPlaceholder}>
                        <div className={styles.qrInner}></div>
                      </div>
                      <div className={styles.status}>STATUS: INSCRIT</div>
                    </div>
                  </div>
                </div>

                {/* CONTROLS */}
                <div className={styles.controls}>
                  <h3 className={styles.controlTitle}>VOTRE CARTE EST PRÊTE</h3>
                  <p className={styles.controlDesc}>Partagez votre prochain défi avec style sur les réseaux sociaux.</p>
                  
                  <div className={styles.actionGrid}>
                    <button 
                      onClick={downloadImage} 
                      className={styles.actionBtn}
                      disabled={isExporting}
                    >
                      <Download size={20} /> {isExporting ? 'EXPORT...' : 'TÉLÉCHARGER'}
                    </button>
                    <button 
                      onClick={shareImage}
                      className={styles.actionBtn} 
                      style={{ background: '#E1306C', color: '#fff', border: 'none' }}
                      disabled={isExporting}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      {isExporting ? 'CHARGEMENT...' : 'PARTAGER'}
                    </button>
                  </div>

                  <div className={styles.tips}>
                    <strong>💡 CONSEIL :</strong> Utilisez cette carte pour vos stories. Le format est optimisé pour un impact visuel maximal.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
