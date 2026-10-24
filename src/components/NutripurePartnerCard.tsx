'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './NutripurePartnerCard.module.css';
import { ExternalLink, Copy, Check, Sparkles } from 'lucide-react';

export default function NutripurePartnerCard() {
  const [copied, setCopied] = useState(false);
  const promoCode = 'RUNPASSION';
  const affiliateUrl = 'https://www.nutripure.fr/fr/?s=RUNPASSION';

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.adContainer} aria-label="Publicité partenaire Nutripure">
      <div className={styles.adBanner}>
        {/* Left: Nutripure Logo */}
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer sponsored" 
          className={styles.logoLink}
          title="Visiter Nutripure"
        >
          <div className={styles.logoWrapper}>
            <Image
              src="/images/nutripure-logo.png"
              alt="Logo Nutripure"
              width={70}
              height={70}
              className={styles.logoImg}
            />
          </div>
        </a>

        {/* Center: Ad Copy */}
        <div className={styles.adContent}>
          <div className={styles.adMeta}>
            <span className={styles.sponsorBadge}>SPONSORISÉ</span>
            <span className={styles.partnerTag}>
              <Sparkles size={11} className={styles.sparkleIcon} /> Partenaire Nutrition
            </span>
          </div>

          <h3 className={styles.adTitle}>
            <a 
              href={affiliateUrl} 
              target="_blank" 
              rel="noopener noreferrer sponsored"
              className={styles.titleLink}
            >
              NUTRIPURE
            </a>
          </h3>

          <p className={styles.adText}>
            Gels énergétiques, boisson d&apos;effort 2:1 &amp; électrolytes anti-crampes. 
            Bénéficiez de <strong>-10% de réduction</strong> sur votre 1ère commande avec le code :
          </p>
        </div>

        {/* Right: Code & CTA Button */}
        <div className={styles.adActions}>
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.codeButton} ${copied ? styles.copied : ''}`}
            title="Cliquez pour copier le code promo"
          >
            <span className={styles.codeText}>{promoCode}</span>
            <span className={styles.copyLabel}>
              {copied ? (
                <>
                  <Check size={13} /> -10% COPIÉ !
                </>
              ) : (
                <>
                  <Copy size={13} /> COPIER (-10%)
                </>
              )}
            </span>
          </button>

          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={styles.ctaButton}
          >
            <span>PROFITER DE L&apos;OFFRE</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
