import { ArrowUpRight, BookOpen } from 'lucide-react';
import styles from './RunPassionMediaBanner.module.css';

interface FeaturedArticle {
  url: string;
  tag: string;
  title: string;
  excerpt: string;
}

const FEATURED_ARTICLES: FeaturedArticle[] = [
  {
    url: 'https://runpassion.fr/adidas-adios-pro-4-vs-adios-pro-5',
    tag: 'Guide 2026',
    title: 'Duel Carbone : Adidas Adios Pro 4 vs Adios Pro 5',
    excerpt:
      'Comparatif détaillé de la mousse, du rocker et du dynamisme pour choisir votre super-shoe marathon.',
  },
  {
    url: 'https://runpassion.fr/gamme-nike-running-2026-guide-complet',
    tag: "Guide d'achat",
    title: 'Gamme Nike Running 2026 : Le Guide Complet',
    excerpt:
      'Pegasus, Vomero, Vaporfly 4 ou Alphafly : quelle paire Nike choisir selon votre allure et vos objectifs ?',
  },
  {
    url: 'https://runpassion.fr/salomon-s-lab-phantasm-3',
    tag: 'Test Route Carbone',
    title: 'Test Salomon S/LAB Phantasm 3',
    excerpt:
      'Essai complet de la fusée route signée Salomon : maintien, rendement énergétique et comportement en course.',
  },
  {
    url: 'https://runpassion.fr/les-4-meilleures-chaussures-pour-marathon',
    tag: 'Sélection',
    title: 'Les 4 Meilleures Chaussures pour Marathon',
    excerpt:
      'Notre classement expert des 4 modèles incontournables sur 42,195 km en 2026 pour viser votre record.',
  },
  {
    url: 'https://runpassion.fr/mount-to-coast-c1',
    tag: 'Révolution Ultra',
    title: 'Test Mount to Coast C1 & H1',
    excerpt:
      "Découverte des nouveautés longue distance pensées pour enchaîner les heures sans perte d'amorti.",
  },
  {
    url: 'https://runpassion.fr/nike-alphafly-4-vs-adidas-adios-pro-5-2026',
    tag: 'Super-Shoes',
    title: 'Nike Alphafly 4 vs Adidas Adios Pro 5',
    excerpt:
      'Analyse comparative des deux références mondiales du bitume : stabilité, relance et choix selon votre foulée.',
  },
];

export default function RunPassionMediaBanner() {
  return (
    <section
      className={styles.bannerSection}
      aria-label="Tests matériel et actualités running sur RunPassion.fr"
    >
      <div className={styles.bannerCard}>
        <div className={styles.topHeader}>
          <div className={styles.headerTextGroup}>
            <div className={styles.badgePill}>
              <span className={styles.badgeDot} />
              <span>MÉDIA PARTENAIRE • RUNPASSION.FR</span>
            </div>
            <h2 className={styles.title}>
              TESTS MATÉRIEL, COMPARATIFS CARBONE &amp; ACTU RUNNING SUR{' '}
              <span className={styles.titleAccent}>RUNPASSION.FR</span>
            </h2>
            <p className={styles.subtitle}>
              Retrouvez tous nos <strong>tests terrain indépendants</strong> (route, marathon,
              trail), <strong>guides d&apos;achat 2026</strong> et actualités élite sur{' '}
              <strong>RunPassion.fr</strong> (+140 articles et comparatifs rédigés sans filtre).
            </p>
          </div>

          <a
            href="https://runpassion.fr/"
            target="_blank"
            rel="noopener"
            className={styles.primaryCta}
          >
            <span>Explorer tous les tests sur RunPassion.fr</span>
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className={styles.articlesGrid}>
          {FEATURED_ARTICLES.map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener"
              className={styles.articleCard}
            >
              <div className={styles.articleTop}>
                <span className={styles.articleTag}>{article.tag}</span>
                <ArrowUpRight size={15} className={styles.articleArrow} />
              </div>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleExcerpt}>{article.excerpt}</p>
              <span className={styles.articleReadLink}>
                <BookOpen size={13} /> Lire l&apos;analyse complète
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
