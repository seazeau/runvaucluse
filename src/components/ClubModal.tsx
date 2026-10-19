'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Clock, 
  UserCheck, 
  MessageCircle, 
  Mountain,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { Club } from '@/lib/types';
import styles from './ClubModal.module.css';

interface ClubModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClubModal({ club, isOpen, onClose }: ClubModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!club) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.logoContainer}>
                <img src={club.image_url} alt={club.name} className={styles.logo} />
              </div>
              <div className={styles.headerInfo}>
                <h3 className={styles.title}>{club.name}</h3>
                {club.city && (
                  <div className={styles.cityBadge}>
                    <MapPin size={13} />
                    <span>{club.city}</span>
                  </div>
                )}
                {club.disciplines && club.disciplines.length > 0 && (
                  <div className={styles.disciplinesList}>
                    {club.disciplines.map((d, i) => (
                      <span key={i} className={styles.disciplinePill}>{d}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className={styles.body}>
              {/* Presentation */}
              {club.description && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <Compass size={17} className={styles.sectionIcon} />
                    Présentation & Esprit du club
                  </h4>
                  <p className={styles.descriptionText}>{club.description}</p>
                </div>
              )}

              {/* Schedule */}
              {club.schedule && club.schedule.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <Clock size={17} className={styles.sectionIcon} />
                    Créneaux & Horaires d&apos;entraînement
                  </h4>
                  <div className={styles.scheduleGrid}>
                    {club.schedule.map((slot, index) => (
                      <div key={index} className={styles.scheduleCard}>
                        <div className={styles.scheduleCardTitle}>
                          <Calendar size={14} />
                          <span>{slot.title}</span>
                        </div>
                        <div className={styles.scheduleCardDays}>{slot.days}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach / Encadrement */}
              {club.coach && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <UserCheck size={17} className={styles.sectionIcon} />
                    Encadrement & Spécialités
                  </h4>
                  <div className={styles.coachCard}>
                    <strong>Profil encadrant :</strong> {club.coach}
                  </div>
                </div>
              )}

              {/* Notes & WhatsApp info */}
              {club.notes && (
                <div className={styles.notesCard}>
                  <MessageCircle size={18} className={styles.notesIcon} />
                  <div>{club.notes}</div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className={styles.footer}>
              {club.website && (
                <a 
                  href={club.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.websiteBtn}
                >
                  <span>Visiter le site officiel & Inscriptions</span>
                  <ExternalLink size={15} />
                </a>
              )}
              <button className={styles.closeModalBtn} onClick={onClose}>
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
