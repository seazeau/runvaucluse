'use client';

import { useState } from 'react';
import styles from './Organisateurs.module.css';
import { 
  Check, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  FileText, 
  Send, 
  ArrowRight, 
  Palette, 
  Smartphone, 
  Map, 
  ShieldCheck 
} from 'lucide-react';

export default function OrganisateursClient() {
  const [selectedPack, setSelectedPack] = useState('pack-site');
  const [formData, setFormData] = useState({
    courseNom: '',
    organisateurNom: '',
    email: '',
    telephone: '',
    pack: 'pack-site',
    dateCourse: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSelectPack = (packKey: string) => {
    setSelectedPack(packKey);
    setFormData(prev => ({ ...prev, pack: packKey }));
    const formEl = document.getElementById('devis-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const packLabels: { [k: string]: string } = {
      'pack-gratuit': 'Pack 1 : Référencement Gratuit (Mise à jour / Inscription)',
      'pack-visibilite': 'Pack 2 : Visibilité & Course Vedette',
      'pack-site': 'Pack 3 : Création de Site Internet Dédié pour la Course',
      'studio-graphique': 'Studio Graphique : Affiche Collector & Vidéo GPX'
    };

    const chosenPack = packLabels[formData.pack] || formData.pack;

    const subject = encodeURIComponent(`[Espace Organisateur] Demande pour ${formData.courseNom || 'une course'} - ${chosenPack}`);
    const body = encodeURIComponent(
      `DEMANDE ESPACE ORGANISATEUR - RUNVAUCLUSE\n\n` +
      `Course : ${formData.courseNom}\n` +
      `Date prévue de l'épreuve : ${formData.dateCourse || 'Non précisée'}\n` +
      `Service souhaité : ${chosenPack}\n` +
      `Nom du contact : ${formData.organisateurNom}\n` +
      `Email : ${formData.email}\n` +
      `Téléphone : ${formData.telephone || 'Non renseigné'}\n\n` +
      `Détails / Message :\n${formData.message}`
    );

    window.location.href = `mailto:contact@runvaucluse.fr?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        
        {/* HERO */}
        <header className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            <span>ESPACE PROFESSIONNEL • RUNVAUCLUSE B2B</span>
          </div>

          <h1 className={styles.title}>
            FAITES RAYONNER VOTRE ÉPREUVE <br />
            <span className={styles.titleHighlight}>AUPRÈS DES COUREURS DU VAUCLUSE.</span>
          </h1>

          <p className={styles.subtitle}>
            Remplissez vos sas de départ, modernisez votre image et professionnalisez votre communication. 
            Du référencement gratuit à la création de votre site web officiel clé en main.
          </p>
        </header>

        {/* STATS ROW */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>105+</div>
            <div className={styles.statLabel}>Courses Référencées</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Vaucluse & Ventoux</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>N°1</div>
            <div className={styles.statLabel}>Média Running Local</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>0 €</div>
            <div className={styles.statLabel}>Référencement Basique</div>
          </div>
        </div>

        {/* OFFERS GRID */}
        <section className={styles.offersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>CHOISISSEZ VOTRE FORMULE D&apos;ACCOMPAGNEMENT</h2>
            <p className={styles.sectionDesc}>
              Des solutions adaptées aux petites foulées communales comme aux grands événements régionaux.
            </p>
          </div>

          <div className={styles.packsGrid}>
            
            {/* PACK 1: GRATUIT */}
            <div className={styles.packCard}>
              <div>
                <span className={styles.packBadge}>ESSENTIEL • 100% GRATUIT</span>
                <h3 className={styles.packTitle}>RÉFÉRENCEMENT OFFICIEL</h3>
                <p className={styles.packSubtitle}>
                  Assurez la présence officielle de votre épreuve sur le calendrier référence du Vaucluse.
                </p>

                <div className={styles.priceTag}>
                  <span className={styles.priceAmount}>0 €</span>
                  <span className={styles.pricePeriod}>Gratuit à vie</span>
                </div>

                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Fiche épreuve dédiée indexée sur Google</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Lien direct vers votre plateforme d&apos;inscription (KMS, Nikrome, Njuko...)</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Intégration de votre affiche et de vos distances</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Publication de vos classements officiels post-course</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button" 
                className={styles.packCta}
                onClick={() => handleSelectPack('pack-gratuit')}
              >
                <span>Inscrire ma course</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* PACK 2: VISIBILITÉ VEDETTE */}
            <div className={`${styles.packCard} ${styles.featuredPack}`}>
              <div>
                <span className={`${styles.packBadge} ${styles.featuredPackBadge}`}>
                  <Sparkles size={11} color="#FAF1D6" /> COUP DE PROJECTEUR
                </span>
                <h3 className={styles.packTitle}>PACK VISIBILITÉ VEDETTE</h3>
                <p className={styles.packSubtitle}>
                  Multipliez vos inscriptions en mettant votre épreuve en avant au moment clé.
                </p>

                <div className={styles.priceTag}>
                  <span className={styles.priceAmount}>149 €</span>
                  <span className={styles.pricePeriod}>Par épreuve</span>
                </div>

                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span><strong>Épinglée en « Course à la Une »</strong> en tête du calendrier</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Badge exclusif <strong>« Recommandé par RunVaucluse »</strong></span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Relai dédié dans la newsletter mensuelle aux coureurs</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Post et story ciblés sur nos réseaux Instagram / Facebook</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Mise en avant sur nos fiches conseils et dossiers thématiques</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button" 
                className={`${styles.packCta} ${styles.packCtaPrimary}`}
                onClick={() => handleSelectPack('pack-visibilite')}
              >
                <span>Booster nos inscriptions</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* PACK 3: CRÉATION SITE WEB */}
            <div className={`${styles.packCard} ${styles.premiumPack}`}>
              <div>
                <span className={`${styles.packBadge} ${styles.premiumPackBadge}`}>
                  <Globe size={11} color="#000" /> NOUVEAU • CLÉ EN MAIN
                </span>
                <h3 className={styles.packTitle}>CRÉATION DE SITE WEB DÉDIÉ</h3>
                <p className={styles.packSubtitle}>
                  Fini le vieux blog Wix ou la simple page Facebook. Offrez à vos coureurs et sponsors une vitrine digitale d&apos;élite.
                </p>

                <div className={styles.priceTag}>
                  <span className={styles.priceAmount}>Dès 690 €</span>
                  <span className={styles.pricePeriod}>Sur devis</span>
                </div>

                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span><strong>Site vitrine moderne & ultra-rapide</strong> pensé pour mobile</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span><strong>Carte interactive des parcours</strong> avec dénivelé et téléchargement GPX</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Bouton d&apos;inscription pro relié à votre chronométreur</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Espace Règlement, Accès / Parkings, Horaires & FAQ coureurs</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span><strong>Mur valorisant pour vos sponsors</strong> et collectivités locales</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={18} className={styles.featureIcon} />
                    <span>Nom de domaine personnalisé (.fr / .com) et hébergement inclus</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button" 
                className={`${styles.packCta} ${styles.packCtaHighlight}`}
                onClick={() => handleSelectPack('pack-site')}
              >
                <span>Créer le site de notre course</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </section>

        {/* STUDIO BANNER */}
        <div className={styles.studioBanner}>
          <div>
            <div className={styles.studioTag}>
              <Palette size={12} /> STUDIO GRAPHIQUE RUNVAUCLUSE
            </div>
            <h3 className={styles.studioTitle}>
              BESOIN D&apos;UNE AFFICHE COLLECTOR OU D&apos;UNE VIDÉO 3D DE PARCOURS ?
            </h3>
            <p className={styles.studioDesc}>
              Votre course n&apos;a pas de graphiste ? Notre studio conçoit des affiches illustrées rétro modernes (style Pauline / Art Déco provençal) et des animations 3D cinématiques de vos traces GPX prêtes pour Instagram & Facebook.
            </p>
            <div className={styles.studioFeatures}>
              <span>✓ Affiches illustrées haute définition prêtes pour impression A3/A2</span>
              <span>✓ Formats carrés et verticaux optimisés pour vos réseaux sociaux</span>
              <span>✓ Animation vidéo 3D du tracé avec profil altimétrique et points clés</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              type="button" 
              className={styles.packCtaHighlight}
              style={{ padding: '1rem 2rem' }}
              onClick={() => handleSelectPack('studio-graphique')}
            >
              <span>Demander un visuel / vidéo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* CONTACT / FORM SECTION */}
        <section id="devis-form" className={styles.formSection}>
          <div className={styles.formGrid}>
            
            {/* LEFT SIDEBAR */}
            <div>
              <h2 className={styles.formSidebarTitle}>ÉCHANGEONS SUR VOTRE ÉVÉNEMENT</h2>
              <p className={styles.formSidebarDesc}>
                Que vous souhaitiez simplement référencer votre course gratuitement, booster vos inscriptions ou créer le site web officiel de votre épreuve, notre équipe locale vous répond sous 24h.
              </p>

              <div className={styles.contactDirect}>
                <span className={styles.contactDirectLabel}>CONTACT DIRECT PAR EMAIL</span>
                <a href="mailto:contact@runvaucluse.fr" className={styles.contactDirectEmail}>
                  contact@runvaucluse.fr
                </a>
                <span style={{ fontSize: '0.8rem', color: '#5E6973' }}>
                  Réponse garantie sous 24 heures par Vincent Buisson.
                </span>
              </div>
            </div>

            {/* FORM */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formField}>
                <label htmlFor="pack">FORMULE SOUHAITÉE</label>
                <select 
                  id="pack" 
                  name="pack" 
                  value={formData.pack} 
                  onChange={handleChange}
                  required
                >
                  <option value="pack-site">🌟 Pack 3 : Création de Site Internet Dédié (Dès 690 €)</option>
                  <option value="pack-visibilite">🚀 Pack 2 : Visibilité & Course Vedette (149 €)</option>
                  <option value="pack-gratuit">✅ Pack 1 : Référencement Gratuit (0 €)</option>
                  <option value="studio-graphique">🎨 Studio : Affiche Collector ou Vidéo GPX</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="courseNom">NOM DE VOTRE COURSE / TRAIL</label>
                  <input 
                    type="text" 
                    id="courseNom" 
                    name="courseNom" 
                    placeholder="Ex: Trail du Ventoux, Foulées..." 
                    value={formData.courseNom}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="dateCourse">DATE PRÉVUE DE L&apos;ÉPREUVE</label>
                  <input 
                    type="text" 
                    id="dateCourse" 
                    name="dateCourse" 
                    placeholder="Ex: 14 Mars 2027" 
                    value={formData.dateCourse}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="organisateurNom">VOTRE NOM & PRÉNOM (ORGANISATEUR)</label>
                  <input 
                    type="text" 
                    id="organisateurNom" 
                    name="organisateurNom" 
                    placeholder="Jean Dupont" 
                    value={formData.organisateurNom}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="email">EMAIL DE CONTACT</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="contact@votre-club.fr" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label htmlFor="telephone">TÉLÉPHONE (OPTIONNEL)</label>
                <input 
                  type="tel" 
                  id="telephone" 
                  name="telephone" 
                  placeholder="06 00 00 00 00" 
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="message">VOTRE MESSAGE OU PRÉCISIONS</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  placeholder="Expliquez-nous vos besoins : date limite d'ouverture des inscriptions, liens existants, éléments à intégrer sur le site web..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Send size={18} />
                <span>Envoyer ma demande à l&apos;équipe</span>
              </button>

              {submitted && (
                <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  ✓ Votre client mail a été ouvert avec votre demande pré-remplie. Merci !
                </p>
              )}
            </form>

          </div>
        </section>

      </div>
    </div>
  );
}
