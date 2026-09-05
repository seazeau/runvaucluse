import styles from '../page.module.css';

export const metadata = {
  title: "Mentions Légales",
  description: "Mentions légales du site RunVaucluse.fr",
  robots: { index: false }
};

export default function MentionsLegales() {
  return (
    <div className={styles.pageWrapper} style={{ paddingTop: '10rem' }}>
      <div className="container">
        <h1 className={styles.sectionTitle}>MENTIONS LÉGALES</h1>
        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', maxWidth: '800px', marginTop: '3rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>1. ÉDITION DU SITE</h2>
            <p>Le site <strong>RunVaucluse.fr</strong> est édité à titre personnel dans le but de promouvoir la course à pied en Vaucluse.</p>
            <p>Directeur de la publication : RunVaucluse Team</p>
            <p>Contact : contact@runvaucluse.fr</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>2. HÉBERGEMENT</h2>
            <p>Le site est hébergé par <strong>Hostinger</strong>.</p>
            <p>Siège social : Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>3. PROPRIÉTÉ INTELLECTUELLE</h2>
            <p>L&apos;ensemble du contenu (textes, logos, icônes) est la propriété exclusive de RunVaucluse, sauf mention contraire (photos d&apos;organisateurs, logos de clubs).</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>4. AFFILIATION</h2>
            <p>RunVaucluse participe au programme d&apos;affiliation Top4Running. Certains liens sortants peuvent générer une commission sans surcoût pour l&apos;utilisateur.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
