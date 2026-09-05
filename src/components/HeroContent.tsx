'use client';

import { motion } from 'framer-motion';
import styles from '../app/page.module.css';

export default function HeroContent() {
  return (
    <>
      <div className={styles.heroImageWrapper}>
        <motion.img 
          src="https://images.unsplash.com/photo-1530143311094-34d802ca9993?auto=format&fit=crop&q=100&w=2000" 
          className={styles.heroImage}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
        />
        <div className={styles.heroOverlay}></div>
      </div>

      <div className={styles.bigNumber}>
        2026
      </div>

      <div className={styles.titleWrapper}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          RUN<br />VAUCLUSE
        </motion.h1>
      </div>

      <div className={styles.heroMeta}>
        <motion.p 
          className={styles.heroDescription}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ULTRA RUNNING IS RAW, HONEST, AND TOUGH. RUNVAUCLUSE EXPOSES YOUR GRIT, TESTS YOUR DISCIPLINE, AND SHAPES YOUR JOURNEY.
        </motion.p>
      </div>
    </>
  );
}
