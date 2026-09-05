'use client';

import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CAROUSEL_RACES = [
  {
    id: 63,
    slug: "pernes-en-rose-pernes-les-fontaines",
    name: "PERNES EN ROSE",
    city: "Pernes-les-Fontaines",
    description: "Une course et marche solidaire au profit de la Ligue contre le cancer. 10 km adulte, marche de 2 km, course enfants et animations.",
    image: "/images/pernesenrose.png",
  },
  {
    id: 70,
    slug: "les-10-km-dalthen-althen-des-paluds",
    name: "LES 10 KM D'ALTHEN",
    city: "Althen-des-Paluds",
    description: "Des courses sur route rapides et plates de 10 km et 5 km, labellisées et qualificatives pour les championnats de France.",
    image: "/images/10kmalthen.jpg",
  },
  {
    id: 53,
    slug: "marathon-davignon-avignon",
    name: "MARATHON D'AVIGNON",
    city: "Avignon",
    description: "Un tracé somptueux et plat le long du Rhône, des remparts historiques et du Palais des Papes.",
    image: "/images/marathonavignon.jpg",
  },
  {
    id: 56,
    slug: "trail-de-saint-didier-saint-didier",
    name: "TRAIL DE SAINT-DIDIER",
    city: "Saint-Didier",
    description: "Des sentiers techniques, des mono-traces joueuses et des panoramas exceptionnels sur les Monts de Vaucluse.",
    image: "/images/saintdidier.jpg",
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_RACES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_RACES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_RACES.length) % CAROUSEL_RACES.length);
  };

  const currentRace = CAROUSEL_RACES[currentIndex];

  const goToRace = (slug: string) => {
    router.push(`/race/${slug}/`);
  };

  const scrollToCalendar = () => {
    const element = document.getElementById('calendrier');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="accueil" className={styles.hero}>
      <div className={styles.backgroundContainer} onClick={() => goToRace(currentRace.slug)} style={{ cursor: 'pointer' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentRace.id}
            src={currentRace.image}
            className={styles.bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            whileHover={{ scale: 1.02 }}
          />
        </AnimatePresence>
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainInfo}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRace.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className={styles.title} onClick={() => goToRace(currentRace.slug)} style={{ cursor: 'pointer' }}>{currentRace.name}</h2>
              <p className={styles.description}>{currentRace.description}</p>
              <button className={styles.exploreBtn} onClick={() => goToRace(currentRace.slug)}>
                DÉCOUVRIR L&apos;ÉPREUVE <ArrowRight size={20} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.verticalNav}>
        {CAROUSEL_RACES.map((_, i) => (
          <div 
            key={i} 
            className={`${styles.navItem} ${currentIndex === i ? styles.navItemActive : ''}`}
          />
        ))}
      </div>

      <div className={styles.carouselContainer}>
        {CAROUSEL_RACES.map((race, i) => {
          // Preview logic: show next items
          const isNext = (i > currentIndex);
          if (!isNext && i !== currentIndex) return null;
          
          return (
            <motion.div 
              key={race.id}
              className={`${styles.card} ${currentIndex === i ? styles.cardActive : ''}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => i === currentIndex ? goToRace(race.slug) : setCurrentIndex(i)}
            >
              <img src={race.image} className={styles.cardImg} alt={race.name} />
              <div className={styles.cardOverlay}>
                <span className={styles.cardTitle}>{race.name}</span>
                <span className={styles.cardSubtitle}>{race.city}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll CTA */}
      <motion.div 
        className={styles.scrollCTA}
        onClick={scrollToCalendar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className={styles.mouseIcon}>
          <div className={styles.mouseWheel}></div>
        </div>
        <span className={styles.scrollText}>DÉCOUVRIR LE CALENDRIER 2026</span>
      </motion.div>

      <div className={styles.navigation}>
        <button className={styles.navBtn} onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>
        <button className={styles.navBtn} onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
