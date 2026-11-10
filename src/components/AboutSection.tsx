import Image from 'next/image';
import { 
  GraduationCap, 
  Users, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  Sliders,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  return (
    <section id="a-propos" className={styles.aboutSection}>
      <div className="container">
        <div className={styles.panelEditorial}>
          
          {/* Header Badge */}
          <div className={styles.headerBadge}>
            <span className={styles.badgeDot}></span>
            <span>// FONDATEUR & COACHING ATHLÈTES</span>
          </div>

          <div className={styles.mainGrid}>
            
            {/* LEFT: ATHLETE & COACH PROFILE CARD */}
            <div className={styles.athleteCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/images/vincent-buisson.webp"
                  alt="Vincent Buisson - Fondateur de RunVaucluse et Coach Running"
                  width={500}
                  height={600}
                  priority={false}
                  className={styles.coachImage}
                />
                <div className={styles.imageGradient} />
                
                <div className={styles.imageOverlayBadge}>
                  <Sparkles size={12} color="#F6C83B" />
                  <span>FONDATEUR & COACH ATHLÈTES</span>
                </div>

                <div className={styles.coachIdentity}>
                  <h3 className={styles.coachName}>VINCENT BUISSON</h3>
                  <p className={styles.coachRole}>Fondateur de RunVaucluse • Entraîneur Diplômé STAPS</p>
                </div>
              </div>

              {/* Technical athletic credentials grid */}
              <div className={styles.telemetryGrid}>
                <div className={styles.telemetryCell}>
                  <span className={styles.telemetryLabel}>RECORD 10 KM</span>
                  <span className={styles.telemetryValue}>34&apos;48&quot; (SUB-35&apos;)</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.telemetryLabel}>FORMATION</span>
                  <span className={styles.telemetryValue}>DIPLÔMÉ STAPS</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.telemetryLabel}>EXPÉRIENCE</span>
                  <span className={styles.telemetryValue}>+100 ATHLÈTES</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.telemetryLabel}>PLATEFORME</span>
                  <span className={styles.telemetryValue}>EXPERT NOLIO & GPS</span>
                </div>
              </div>
            </div>

            {/* RIGHT: EDITORIAL STORY & COACHING APPROACH */}
            <div className={styles.contentCol}>
              <div>
                <h2 className={styles.title}>
                  PASSION DU BITUME, <br />
                  <span className={styles.titleHighlight}>SCIENCE DE L&apos;ENTRAÎNEMENT.</span>
                </h2>
              </div>

              <p className={styles.leadText}>
                RunVaucluse est né d&apos;une volonté simple : <strong>offrir aux coureurs et organisateurs du Vaucluse une plateforme locale, fiable et moderne</strong> pour rassembler l&apos;intégralité du calendrier des courses sans friction.
              </p>

              <p className={styles.storyParagraph}>
                Derrière ce projet, je suis <strong><a href="https://vincentbuisson.fr/" target="_blank" rel="noopener" className={styles.storyLink}>Vincent Buisson</a></strong>, coureur passionné sur route (sub-35&apos; au 10 km) et <strong>entraîneur course à pied diplômé STAPS (Sciences et Techniques des Activités Physiques et Sportives)</strong>. 
                Au quotidien, j&apos;accompagne à distance des coureurs et coureuses de tous niveaux — du premier dossard aux quêtes de records personnels en{' '}
                <a href="https://vincentbuisson.fr/coaching-10km/" target="_blank" rel="noopener" className={styles.storyLink}>coaching 10 km</a>,{' '}
                <a href="https://vincentbuisson.fr/coaching-semi-marathon/" target="_blank" rel="noopener" className={styles.storyLink}>préparation semi-marathon</a> et{' '}
                <a href="https://vincentbuisson.fr/coaching-marathon/" target="_blank" rel="noopener" className={styles.storyLink}>coaching marathon en ligne</a>.
              </p>

              {/* 4 Pillars */}
              <div className={styles.pillarsGrid}>
                <div className={styles.pillarCard}>
                  <div className={styles.pillarTop}>
                    <span className={styles.pillarIndex}>[ 01 ]</span>
                    <div className={styles.pillarIconWrapper}>
                      <GraduationCap size={16} />
                    </div>
                  </div>
                  <h4 className={styles.pillarTitle}>Formation STAPS</h4>
                  <p className={styles.pillarDesc}>
                    La physiologie de l&apos;effort et la biomécanique appliquées concrètement à votre entraînement.
                  </p>
                </div>

                <div className={styles.pillarCard}>
                  <div className={styles.pillarTop}>
                    <span className={styles.pillarIndex}>[ 02 ]</span>
                    <div className={styles.pillarIconWrapper}>
                      <Users size={16} />
                    </div>
                  </div>
                  <h4 className={styles.pillarTitle}>+100 Athlètes Suivis</h4>
                  <p className={styles.pillarDesc}>
                    Une expérience éprouvée sur le terrain pour progresser durablement et sans blessure.
                  </p>
                </div>

                <div className={styles.pillarCard}>
                  <div className={styles.pillarTop}>
                    <span className={styles.pillarIndex}>[ 03 ]</span>
                    <div className={styles.pillarIconWrapper}>
                      <Sliders size={16} />
                    </div>
                  </div>
                  <h4 className={styles.pillarTitle}>100% Individualisé</h4>
                  <p className={styles.pillarDesc}>
                    Programmation sur Nolio adaptée chaque semaine à votre vie pro, votre fatigue et vos sensations.
                  </p>
                </div>

                <div className={styles.pillarCard}>
                  <div className={styles.pillarTop}>
                    <span className={styles.pillarIndex}>[ 04 ]</span>
                    <div className={styles.pillarIconWrapper}>
                      <Smartphone size={16} />
                    </div>
                  </div>
                  <h4 className={styles.pillarTitle}>Synchro Montres GPS</h4>
                  <p className={styles.pillarDesc}>
                    Séances et allures directement injectées dans votre Garmin, Coros, Suunto ou Apple Watch.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actionsRow}>
                <a 
                  href="https://vincentbuisson.fr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.primaryCta}
                >
                  <span>Découvrir le coaching sur vincentbuisson.fr</span>
                  <ExternalLink size={16} />
                </a>

                <a href="#contact" className={styles.secondaryCta}>
                  <span>Contacter RunVaucluse</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <p className={styles.guaranteeNote}>
                <ShieldCheck size={14} color="#10b981" />
                <span>// SUIVI DIRECT ET PERSONNALISÉ PAR VINCENT BUISSON • RÉPONSE EN MOINS DE 24H</span>
              </p>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
