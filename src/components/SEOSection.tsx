import Link from 'next/link';
import styles from '../app/page.module.css';

export default function SEOSection() {
  return (
    <section className={styles.seoSection}>
      <div className="container">
        <div className={styles.seoGrid}>
          <div className={styles.seoContent}>
            <h2 className={styles.seoTitle}>Votre Calendrier de Course à Pied & Trails en Vaucluse 2026</h2>
            <p className={styles.seoText}>
              Bienvenue sur <strong>RunVaucluse</strong>, la plateforme de référence dédiée au <strong>running et au trail dans le Vaucluse (84)</strong>. 
              Que vous prépariez votre premier 10 km, un semi-marathon rapide ou un trail engagé sur les pentes du Géant de Provence, 
              notre calendrier centralise l&apos;intégralité des épreuves officielles : du mythique <strong>Trail du Ventoux</strong>{' '}aux courses populaires 
              d&apos;Avignon, Orange, Carpentras, Cavaillon, L&apos;Isle-sur-la-Sorgue, Sorgues ou Apt.
            </p>
            <p className={styles.seoText}>
              Pour chaque épreuve, retrouvez en un clic les dates confirmées, distances, profils de dénivelé, liens d&apos;inscription directe et{' '}
              <Link href="/resultats" style={{ color: '#c05621', fontWeight: 700 }}>classements officiels</Link> après chaque week-end de compétition.
            </p>
          </div>
          <div className={styles.seoContent}>
            <h3 className={styles.seoSubTitle}>Le 84, Terre d&apos;Élection du Running en Provence</h3>
            <p className={styles.seoText}>
              Entre les Dentelles de Montmirail, le sommet du Mont Ventoux, les falaises du Luberon et les chemins des Monts de Vaucluse, le département offre une diversité unique en région PACA. 
              Découvrez les <Link href="/records" style={{ color: '#c05621', fontWeight: 700 }}>records officiels FFA du Vaucluse</Link>, suivez le classement de régularité des coureurs locaux 
              et générez votre carte finisher personnalisée sur votre <Link href="/coureur" style={{ color: '#c05621', fontWeight: 700 }}>Fiche Coureur</Link>.
            </p>
            <p className={styles.seoText}>
              Consultez également notre <a href="#clubs" style={{ color: '#c05621', fontWeight: 700 }}>annuaire des clubs d&apos;athlétisme et associations running</a>{' '}pour trouver un groupe d&apos;entraînement près de chez vous.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
