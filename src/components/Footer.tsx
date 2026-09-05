import Link from 'next/link';
import styles from './Footer.module.css';
import LogoIcon from './LogoIcon';
import { Mail, ExternalLink, Calendar, MapPin, Trophy, Users, ChevronRight, Award } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.footerLogo}>
              <LogoIcon size={30} className={styles.logoIcon} />
              <span>RUNVAUCLUSE</span>
              <span className={styles.registered}>®</span>
            </Link>
            <p className={styles.brandDesc}>
              Le calendrier officiel de la <strong>course à pied en Vaucluse (84)</strong>. 
              Retrouvez tous les trails, marathons et courses sur route du département. 
              Performance et passion au cœur de la Provence.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://www.instagram.com/runvaucluse.fr/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.facebook.com/share/18DpLLeykk/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="mailto:contact@runvaucluse.fr" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>NAVIGATION</h4>
            <ul className={styles.linksList}>
              <li><Link href="/#calendrier"><Calendar size={14} /> Calendrier 2026</Link></li>
              <li><Link href="/records"><Award size={14} /> Records & Palmarès</Link></li>
              <li><Link href="/resultats"><Trophy size={14} /> Résultats Officiels</Link></li>
              <li><Link href="/#clubs"><Users size={14} /> Clubs & Associations</Link></li>
            </ul>
          </div>

          {/* SEO Cities Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>COURSE VAUCLUSE</h4>
            <ul className={styles.linksList}>
              <li><Link href="/#calendrier"><ChevronRight size={12} /> Trail Avignon</Link></li>
              <li><Link href="/#calendrier"><ChevronRight size={12} /> Running Carpentras</Link></li>
              <li><Link href="/#calendrier"><ChevronRight size={12} /> Course Orange</Link></li>
              <li><Link href="/#calendrier"><ChevronRight size={12} /> Trail du Ventoux</Link></li>
              <li><Link href="/#calendrier"><ChevronRight size={12} /> Foulées de Cavaillon</Link></li>
            </ul>
          </div>

          {/* Resources & Affiliate */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>RESSOURCES</h4>
            <ul className={styles.linksList}>
              <li>
                <a href="https://top4running.fr/?a_box=sc3esau3" target="_blank" rel="noopener noreferrer" className={styles.affiliateLink}>
                  Boutique Top4Running <ExternalLink size={12} />
                </a>
              </li>
              <li><a href="https://vaucluse.athle.fr/" target="_blank" rel="noopener noreferrer">CDCHS 84 <ExternalLink size={12} /></a></li>
              <li><Link href="/#contact">Proposer une course</Link></li>
              <li><Link href="/mentions-legales">Mentions Légales</Link></li>
            </ul>
          </div>
        </div>

        {/* SEO Text Block */}
        <div className={styles.seoFooterBlock}>
          <p>
            <strong>RunVaucluse</strong> est votre portail dédié au <strong>running en Vaucluse</strong>. 
            Nous référençons chaque <strong>course à pied en Vaucluse</strong>, du petit trail de village aux grands marathons nationaux. 
            Que vous cherchiez un <strong>trail en Vaucluse</strong> ou une <strong>course sur route</strong>, notre calendrier 2026 
            est mis à jour quotidiennement pour vous offrir les meilleures épreuves de Provence.
          </p>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            &copy; {currentYear} RUNVAUCLUSE | PERFORMANCE & ADVENTURE
          </div>
          <div className={styles.legalLinks}>
            <Link href="/mentions-legales">Mentions Légales</Link>
            <Link href="/politique-confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
