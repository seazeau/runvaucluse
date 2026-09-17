import Image from 'next/image';
import Link from 'next/link';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Smartphone, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  return (
    <section id="a-propos" className={styles.aboutSection}>
      <div className={styles.container}>
        
        {/* Header Badge */}
        <div className={styles.headerBadge}>
          <span className={styles.badgeDot}></span>
          <span>À PROPOS • QUI EST DERRIÈRE RUNVAUCLUSE ?</span>
        </div>

        <div className={styles.mainGrid}>
          
          {/* LEFT: COACH CARD & STATS */}
          <div className={styles.portraitCard}>
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
                <Sparkles size={13} color="#f6c83b" />
                <span>FONDATEUR & COACH RUNNING</span>
              </div>

              <div className={styles.coachIdentity}>
                <h3 className={styles.coachName}>VINCENT BUISSON</h3>
                <p className={styles.coachRole}>Fondateur de RunVaucluse • Coach Course à Pied</p>
              </div>
            </div>

            {/* Quick credentials grid */}
            <div className={styles.quickCredentials}>
              <div className={styles.credentialPill}>
                <GraduationCap size={16} className={styles.credentialIcon} />
                <span>Diplômé STAPS</span>
              </div>
              <div className={styles.credentialPill}>
                <Users size={16} className={styles.credentialIcon} />
                <span>+100 Athlètes suivis</span>
              </div>
              <div className={styles.credentialPill}>
                <Clock size={16} className={styles.credentialIcon} />
                <span>Sub-35' sur 10 km</span>
              </div>
              <div className={styles.credentialPill}>
                <Smartphone size={16} className={styles.credentialIcon} />
                <span>Expert Nolio & GPS</span>
              </div>
            </div>
          </div>

          {/* RIGHT: STORY, PHILOSOPHY & COACHING */}
          <div className={styles.contentCol}>
            <div>
              <h2 className={styles.title}>
                PASSION DU BITUME, <br />
                <span className={styles.titleHighlight}>SCIENCE DU MOUVEMENT.</span>
              </h2>
            </div>

            <p className={styles.leadText}>
              RunVaucluse est né d'une volonté simple : <strong>offrir aux coureurs et organisateurs du Vaucluse une plateforme locale, fiable et moderne</strong> pour rassembler l'intégralité du calendrier des courses sans friction.
            </p>

            <p className={styles.storyParagraph}>
              Derrière ce projet, je suis <strong>Vincent Buisson</strong>, coureur passionné sur route (sub-35' au 10 km) et <strong>entraîneur diplômé STAPS (Sciences et Techniques des Activités Physiques et Sportives)</strong>. 
              Au quotidien, j'accompagne à distance des coureurs et coureuses de tous niveaux — du premier dossard aux quêtes de records sur 10 km, semi-marathon et marathon.
            </p>

            {/* 4 Pillars */}
            <div className={styles.pillarsGrid}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconWrapper}>
                    <GraduationCap size={16} />
                  </div>
                  <h4 className={styles.pillarTitle}>Formation STAPS</h4>
                </div>
                <p className={styles.pillarDesc}>
                  La physiologie de l'effort et la biomécanique appliquées concrètement à votre entraînement.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconWrapper}>
                    <Users size={16} />
                  </div>
                  <h4 className={styles.pillarTitle}>+100 Athlètes Accompagnés</h4>
                </div>
                <p className={styles.pillarDesc}>
                  Une expérience éprouvée sur le terrain pour faire progresser durablement sans blessure.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconWrapper}>
                    <Sliders size={16} />
                  </div>
                  <h4 className={styles.pillarTitle}>100% Individualisé</h4>
                </div>
                <p className={styles.pillarDesc}>
                  Programmation sur Nolio adaptée chaque semaine à votre vie pro, votre fatigue et vos sensations.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconWrapper}>
                    <Smartphone size={16} />
                  </div>
                  <h4 className={styles.pillarTitle}>Synchro Montres GPS</h4>
                </div>
                <p className={styles.pillarDesc}>
                  Séances et allures directement injectées dans Garmin, Coros, Suunto ou Apple Watch.
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
                <ExternalLink size={15} />
              </a>

              <a href="#contact" className={styles.secondaryCta}>
                <span>Contacter RunVaucluse</span>
                <ArrowRight size={14} />
              </a>
            </div>

            <p className={styles.guaranteeNote}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Suivi direct et personnalisé par Vincent • Réponse sous 24h</span>
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
