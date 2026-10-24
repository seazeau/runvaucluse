'use client';

import { useState } from 'react';
import styles from './NutripurePartnerCard.module.css';
import { Zap, Check, Copy, ExternalLink, ShieldCheck, Droplet, BatteryCharging, HeartPulse } from 'lucide-react';

interface NutripurePartnerCardProps {
  raceName?: string;
  raceType?: string;
  raceDistances?: string;
}

export default function NutripurePartnerCard({ raceName, raceType, raceDistances }: NutripurePartnerCardProps) {
  const [copied, setCopied] = useState(false);
  const promoCode = 'RUNPASSION';
  const affiliateUrl = 'https://www.nutripure.fr/fr/?s=RUNPASSION';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isTrail = raceType?.toLowerCase().includes('trail');

  return (
    <section className={styles.card} aria-label="Partenaire Nutrition Nutripure">
      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={styles.badgeOfficial}>
            <Zap size={13} className={styles.zapIcon} /> Partenaire Nutrition Officiel
          </span>
          <span className={styles.badgeQuality}>
            <ShieldCheck size={13} /> 100% Ingrédients Bruts • Zéro Édulcorant
          </span>
        </div>
        <h2 className={styles.title}>
          NUTRITION &amp; RAVITAILLEMENT DE COURSE • NUTRIPURE
        </h2>
        <p className={styles.intro}>
          Pour performer sur {raceName ? <strong>{raceName}</strong> : 'votre épreuve'} {raceDistances ? `(${raceDistances})` : ''} et éviter les troubles digestifs ou les crampes, le coach <strong>Vincent Buisson (Diplômé STAPS)</strong> vous conseille la nutrition pure et traçable <strong>Nutripure</strong>.
        </p>
      </div>

      {/* 3 Key Products Grid */}
      <div className={styles.productGrid}>
        <div className={styles.productCard}>
          <div className={styles.productIconWrapper}>
            <Droplet size={20} />
          </div>
          <div className={styles.productBody}>
            <h3 className={styles.productName}>Boisson d&apos;Effort 2:1 (60g)</h3>
            <p className={styles.productDesc}>
              Ratio idéal 2:1 (maltodextrine/fructose) enrichi en 5 électrolytes (sodium, potassium, magnésium). Hydratation anti-crampes essentielle sous le soleil provençal.
            </p>
          </div>
        </div>

        <div className={styles.productCard}>
          <div className={styles.productIconWrapper}>
            <BatteryCharging size={20} />
          </div>
          <div className={styles.productBody}>
            <h3 className={styles.productName}>Gels Énergétiques SolidCarbs™</h3>
            <p className={styles.productDesc}>
              30g de glucides purs par stick. Texture fluide et pH neutre non acide pour une assimilation digestive parfaite {isTrail ? 'sur les sentiers et ascensions' : 'à allure de course'}.
            </p>
          </div>
        </div>

        <div className={styles.productCard}>
          <div className={styles.productIconWrapper}>
            <HeartPulse size={20} />
          </div>
          <div className={styles.productBody}>
            <h3 className={styles.productName}>Pack Récupération Musculaire</h3>
            <p className={styles.productDesc}>
              Magnésium Bisglycinate chélaté (haute biodisponibilité) et Isolat de Whey Native pour réparer vos fibres musculaires immédiatement après la ligne d&apos;arrivée.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Promo & CTA Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoInfo}>
          <div className={styles.promoTitleGroup}>
            <span className={styles.giftEmoji}>🎁</span>
            <div className={styles.promoTextContent}>
              <span className={styles.promoHeading}>Offre Exclusive Coureurs RunVaucluse</span>
              <span className={styles.promoDiscount}><strong>-10% de réduction</strong> immédiate sur votre 1ère commande</span>
            </div>
          </div>
          <div className={styles.codeBox}>
            <span className={styles.codeLabel}>Code promo :</span>
            <span className={styles.codeValue}>{promoCode}</span>
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyBtn}
              title="Copier le code promo"
              aria-label="Copier le code promo RUNPASSION"
            >
              {copied ? (
                <>
                  <Check size={14} className={styles.checkIcon} /> Copié !
                </>
              ) : (
                <>
                  <Copy size={14} /> Copier
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.actionWrapper}>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.ctaBtn}
          >
            <span>Commander sur Nutripure (-10%)</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
