import styles from './Rules.module.css';
import { ShieldCheck, Info, Scale, TrendingUp } from 'lucide-react';
import Leaderboard from './Leaderboard';

export default function Rules() {
  return (
    <div className={styles.rulesContainer}>
      <section className={styles.section}>
        <div className={styles.header}>
          <ShieldCheck className={styles.icon} size={32} />
          <h2 className={styles.title}>CADRE RÉGLEMENTAIRE 2026</h2>
        </div>
        <p className={styles.intro}>
          Pour la saison du 1er septembre 2025 au 31 août 2026, la participation est régie par les normes de la Fédération. 
          L&apos;effort est mesuré par l&apos;outil technique : <strong>Distance (km) + [D+ (m) / 100]</strong>.
        </p>

        <div className={styles.grid}>
          <div className={styles.ruleBox}>
            <h3>Catégories d&apos;Âge</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Catégorie</th><th>Né(e) en</th></tr>
              </thead>
              <tbody>
                <tr><td>Masters (VE)</td><td>1991 & avant</td></tr>
                <tr><td>Seniors (SE)</td><td>1992 à 2003</td></tr>
                <tr><td>Espoirs (ES)</td><td>2004 à 2006</td></tr>
                <tr><td>Juniors (JU)</td><td>2007 & 2008</td></tr>
                <tr><td>Cadets (CA)</td><td>2009 & 2010</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.ruleBox}>
            <h3>Limites d&apos;Effort (km/effort)</h3>
            <ul className={styles.list}>
              <li><strong>Espoir / Senior / Master :</strong> Illimitée</li>
              <li><strong>Junior :</strong> 25 km max</li>
              <li><strong>Cadet :</strong> 15 km max</li>
              <li><strong>Minime :</strong> 5 km max</li>
              <li><strong>Benjamin :</strong> 3 km max</li>
            </ul>
          </div>
        </div>
      </section>

      <Leaderboard />

      <section className={styles.section}>
        <div className={styles.header}>
          <Scale className={styles.icon} size={32} />
          <h2 className={styles.title}>LE CHALLENGE VAUCLUSIEN</h2>
        </div>
        <div className={styles.challengeGrid}>
          <div className={styles.card}>
            <h4>Éligibilité</h4>
            <p>Participation à <strong>5 épreuves minimum</strong> pour être classé au palmarès final de la saison.</p>
          </div>
          <div className={styles.card}>
            <h4>Barème Points</h4>
            <p>1er : 100 pts | 2ème : 90 pts | 3ème : 85 pts | 4ème : 80 pts...</p>
            <p className={styles.small}>Décroissant jusqu&apos;au 19ème. 1pt de participation au delà.</p>
          </div>
          <div className={styles.card}>
            <h4>Classement Clubs</h4>
            <p>Cumul des points des 3 meilleurs classés du club par épreuve.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
