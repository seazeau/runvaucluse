import RaceList from '@/components/RaceList';
import ClubsGrid from '@/components/ClubsGrid';
import ContactForm from '@/components/ContactForm';
import EditorialHero from '@/components/EditorialHero';
import FAQSection from '@/components/FAQSection';
import SEOSection from '@/components/SEOSection';
import { Race } from '@/lib/types';
import styles from './page.module.css';
import { Plus, AlertCircle, Calendar } from 'lucide-react';

// Direct import for static export reliability
import racesData from '../data/races.json';

export default async function Home() {
  return (
    <div className={styles.pageWrapper}>
      
      {/* Hidden H1 for SEO but present for Google - Essential for 'course vaucluse' ranking */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        RunVaucluse | Le Calendrier Officiel des Courses en Vaucluse 2026
      </h1>

      <EditorialHero />

      {/* FULL CALENDAR SECTION */}
      <section id="calendrier" className={styles.calendarSection}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <div className={styles.headerTitleGroup}>
              <Calendar size={24} className={styles.headerIcon} />
              <h2 className={styles.sectionTitle}>CALENDRIER 2026</h2>
            </div>
            <p className={styles.sectionDesc}>
              Toutes les prochaines épreuves officielles en Vaucluse. Consultez les parcours, dates et préparez vos dossards.
            </p>
            <a href="#contact" className={styles.organizerCTA}>
              <Plus size={14} /> PROPOSER UNE COURSE / SIGNALER UNE ERREUR <AlertCircle size={14} />
            </a>
          </header>
          
          <RaceList initialRaces={racesData as Race[]} />
        </div>
      </section>

      {/* CLUBS SECTION */}
      <section id="clubs">
        <ClubsGrid />
      </section>

      {/* FAQ SECTION WITH GOOGLE FAQPAGE SCHEMA */}
      <FAQSection />

      {/* CONTACT SECTION FOR ORGANIZERS */}
      <section id="contact" className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>VOUS ÊTES ORGANISATEUR ?</h2>
              <p className={styles.contactDesc}>
                Vous souhaitez corriger une information, mettre à jour votre affiche ou demander une mise en avant de votre course sur RunVaucluse ?
              </p>
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>EMAIL OFFICIEL</span>
                  <a href="mailto:contact@runvaucluse.fr" className={styles.contactValue}>contact@runvaucluse.fr</a>
                </div>
              </div>
            </div>
            <div className={styles.contactAction}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* LOCAL SEO SEMANTIC SECTION */}
      <SEOSection />
    </div>
  );
}
