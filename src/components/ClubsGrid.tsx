'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, ExternalLink } from 'lucide-react';
import styles from './ClubsGrid.module.css';
import clubsData from '../data/clubs.json';
import { Club } from '@/lib/types';
import ClubModal from './ClubModal';

const ClubsGrid = () => {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenClub = (club: Club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  return (
    <section className={styles.clubsSection}>
      <header className={styles.header}>
        <h2 className={styles.title}>CLUBS ET ASSOS</h2>
        <p className={styles.subtitle}>Les clubs et associations qui font vibrer le Vaucluse.</p>
      </header>

      <div className={styles.grid}>
        {(clubsData as Club[]).map((club, index) => {
          const hasDetails = Boolean(club.description || club.schedule);

          const CardInner = (
            <>
              <div className={styles.cardGlow}></div>
              <div className={styles.imageContainer}>
                <img src={club.image_url} alt={club.name} className={styles.logo} />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{club.name}</h3>
                {club.city && (
                  <span className={styles.cityTag}>
                    <MapPin size={11} /> {club.city}
                  </span>
                )}
                {hasDetails && (
                  <span className={styles.badgeDetails}>
                    <Info size={10} /> Fiche & Horaires
                  </span>
                )}
                <div className={styles.scanline}></div>
              </div>
            </>
          );

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              viewport={{ once: true }}
            >
              {hasDetails ? (
                <button 
                  type="button"
                  onClick={() => handleOpenClub(club)}
                  className={`${styles.clubCard} ${styles.clubCardFeatured}`}
                  aria-label={`Voir la fiche détaillée de ${club.name}`}
                >
                  {CardInner}
                </button>
              ) : club.website ? (
                <a 
                  href={club.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.clubCard}
                  aria-label={`Visiter le site de ${club.name}`}
                >
                  {CardInner}
                </a>
              ) : (
                <div className={styles.clubCard}>
                  {CardInner}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Club Modal */}
      <ClubModal 
        club={selectedClub}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default ClubsGrid;
