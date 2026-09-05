import styles from '../page.module.css';

export const metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de protection des données personnelles de RunVaucluse.fr",
  robots: { index: false }
};

export default function PolitiqueConfidentialite() {
  return (
    <div className={styles.pageWrapper} style={{ paddingTop: '10rem' }}>
      <div className="container">
        <h1 className={styles.sectionTitle}>POLITIQUE DE CONFIDENTIALITÉ</h1>
        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', maxWidth: '800px', marginTop: '3rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>1. COLLECTE DES DONNÉES</h2>
            <p>RunVaucluse collecte des données via son formulaire de contact (Email, Nom). Ces données ne sont utilisées que pour répondre à vos demandes.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>2. COOKIES</h2>
            <p>Nous utilisons des outils d&apos;analyse d&apos;audience (Google Tag Manager) qui peuvent déposer des cookies anonymes pour mesurer le trafic sur le site.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>3. DESTINATAIRES DES DONNÉES</h2>
            <p>Vos données ne sont jamais vendues ni partagées avec des tiers, à l&apos;exception de l&apos;hébergeur du site.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>4. VOS DROITS</h2>
            <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en nous contactant à : contact@runvaucluse.fr</p>
          </section>
        </div>
      </div>
    </div>
  );
}
