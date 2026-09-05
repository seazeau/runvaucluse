'use client';

import React, { useRef, useState } from 'react';
import { X, Download, Share2, Trophy, Award, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import styles from './RunnerCardModal.module.css';

interface RunnerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  runner: {
    n: string;
    s: string;
    club?: string;
    count: number;
    wins: number;
    totalKm: number;
    bestRank: number;
    rank2026: number;
    grade: {
      label: string;
      color: string;
      bg: string;
      border: string;
    };
  };
}

export default function RunnerCardModal({ isOpen, onClose, runner }: RunnerCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `carte-runvaucluse-${runner.s}.png`;
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

      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `profil-${runner.s}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Palmarès 2026 de ${runner.n} sur RunVaucluse`,
            text: `${runner.n} - ${runner.count} courses et ${runner.totalKm} km en Vaucluse en 2026 ! #RunVaucluse #RunningVaucluse`,
          });
          return;
        }
      }
      
      // Fallback
      downloadImage();
    } catch (err) {
      console.error('Share failed:', err);
      downloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className={styles.closeBtn} aria-label="Fermer">
            <X size={22} />
          </button>

          <div className={styles.generatorLayout}>
            {/* THE VISUAL STORY CARD (EXPORT TARGET) */}
            <div className={styles.cardContainer}>
              <div ref={cardRef} className={styles.storyCard}>
                <div className={styles.cardGlowTop} />

                {/* Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.brandTitle}>
                    <span className={styles.brandMain}>RUNVAUCLUSE</span>
                    <span className={styles.brandReg}>®</span>
                    <span className={styles.brandSub}>PALMARÈS 2026</span>
                  </div>
                  <div className={styles.rankBadge}>
                    #{runner.rank2026} DU 84
                  </div>
                </div>

                {/* Athlete Name & Status */}
                <div className={styles.athleteSection}>
                  <div 
                    className={styles.gradeTag}
                    style={{
                      backgroundColor: runner.grade.bg,
                      color: runner.grade.color,
                      borderColor: runner.grade.border
                    }}
                  >
                    <Award size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    {runner.grade.label}
                  </div>

                  <h2 className={styles.athleteName}>{runner.n}</h2>
                  {runner.club && (
                    <div className={styles.athleteClub}>{runner.club}</div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statNumber}>{runner.count}</span>
                    <span className={styles.statLabel}>COURSES</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statNumber}>{runner.totalKm}</span>
                    <span className={styles.statLabel}>KM EN COURSE</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statNumber} style={{ color: runner.wins > 0 ? '#f59e0b' : 'inherit' }}>
                      {runner.wins > 0 ? runner.wins : (runner.bestRank ? `#${runner.bestRank}` : '-')}
                    </span>
                    <span className={styles.statLabel}>
                      {runner.wins > 0 ? 'VICTOIRES' : 'MEILLEUR SCRATCH'}
                    </span>
                  </div>
                </div>

                {/* Footer Callout */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerDomain}>
                    <span>RUNVAUCLUSE.FR</span>
                    <span className={styles.footerDot}>•</span>
                    <span>LE SITE DU RUNNING DANS LE VAUCLUSE</span>
                  </div>
                  <div className={styles.verifiedTag}>
                    <Zap size={11} /> PROFIL HOMOLOGUÉ 84
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.controlsSection}>
              <div className={styles.controlsHeader}>
                <h3 className={styles.controlsTitle}>CARTE COUREUR FINISHER 2026</h3>
                <p className={styles.controlsDesc}>
                  Téléchargez votre carte personnalisée au format Story pour la partager sur Instagram, Strava ou Facebook.
                </p>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={downloadImage}
                  disabled={isExporting}
                  className={styles.downloadBtn}
                >
                  <Download size={18} />
                  {isExporting ? 'Génération...' : 'Télécharger l\'image (PNG)'}
                </button>

                <button
                  onClick={shareImage}
                  disabled={isExporting}
                  className={styles.shareBtn}
                >
                  <Share2 size={18} />
                  Partager
                </button>
              </div>

              <div className={styles.proTip}>
                <strong>💡 Astuce :</strong> Les dimensions sont calibrées pour un rendu net dans vos stories Instagram et posts WhatsApp.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
