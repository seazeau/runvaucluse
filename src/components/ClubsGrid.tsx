'use client';

import { motion } from 'framer-motion';
import styles from './ClubsGrid.module.css';
import clubsData from '../data/clubs.json';

const ClubsGrid = () => {
  return (
    <section className={styles.clubsSection}>
      <header className={styles.header}>
        <h2 className={styles.title}>CLUBS ET ASSOS</h2>
        <p className={styles.subtitle}>Les clubs et associations qui font vibrer le Vaucluse.</p>
      </header>

      <div className={styles.grid}>
        {clubsData.map((club, index) => {
          const CardContent = (
            <>
              <div className={styles.cardGlow}></div>
              <div className={styles.imageContainer}>
                <img src={club.image_url} alt={club.name} className={styles.logo} />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{club.name}</h3>
                <div className={styles.scanline}></div>
              </div>
            </>
          );

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              {club.website ? (
                <a href={club.website} target="_blank" rel="noopener noreferrer" className={styles.clubCard}>
                  {CardContent}
                </a>
              ) : (
                <div className={styles.clubCard}>
                  {CardContent}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ClubsGrid;
