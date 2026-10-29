'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  GlassWater,
  Music,
  PartyPopper
} from 'lucide-react';
import styles from './TerroirsMarathonDossier.module.css';

export default function TerroirsMarathonDossier() {
  return (
    <div className={styles.dossierWrapper} id="dossier-terroirs">
      {/* 1. HERO BANNER */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.badgeRow}>
            <span className={styles.badgePurple}>
              🍇 NOUVEAUTÉ 2027
            </span>
            <span className={styles.badgeOrange}>
              <MapPin size={13} /> MAZAN (VAUCLUSE)
            </span>
            <span className={styles.badgeGold}>
              <Sparkles size={13} /> FOULÉES FESTIVES & GOURMANDES
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            MARATHON DES TERROIRS <br />
            <span className={styles.heroHighlight}>DU VENTOUX 2027</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Bien plus qu&apos;une simple course : une immense fête au pied du Géant de Provence, portée par l&apos;expertise de <strong>Ventoux Organisation</strong> (Trail du Ventoux au Vieux Campeur) et <strong>Ventoux Events</strong> (Colnago GF Mont Ventoux), en partenariat avec les vins <strong>AOC Ventoux</strong>.
          </p>

          {/* LAUNCH ALERT BOX */}
          <div className={styles.launchAlert}>
            <div className={styles.launchInfo}>
              <div className={styles.launchIcon}>
                <Clock size={24} />
              </div>
              <div>
                <div className={styles.launchTitle}>Ouverture Officielle des Inscriptions</div>
                <div className={styles.launchDate}>VENDREDI 14 NOVEMBRE 2026 • 12H00</div>
              </div>
            </div>

            <a
              href="https://www.marathondesterroirsduventoux.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.launchBtn}
            >
              Site Officiel <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. LE TRIPTYQUE : RUN, TASTE & PARTY */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPretitle}>L&apos;Esprit de la Course</span>
          <h2 className={styles.sectionTitle}>La Recette en Trois Temps : Run, Taste & Party</h2>
          <p className={styles.sectionDesc}>
            Avis aux coureurs, marcheurs et bons vivants : préparez vos baskets et vos plus beaux déguisements !
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {/* RUN */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconBox} style={{ background: '#FEF3C7', color: '#B45309' }}>
              🏃‍♂️
            </div>
            <span className={styles.pillarTag} style={{ color: '#B45309' }}>TEMPS 1 • SPORT & NATURE</span>
            <h3 className={styles.pillarTitle}>RUN</h3>
            <p className={styles.pillarText}>
              Des parcours magnifiques tracés au milieu des vignes aux couleurs chatoyantes de l&apos;automne et la traversée de domaines viticoles emblématiques face aux crêtes du Mont Ventoux.
            </p>
          </div>

          {/* TASTE */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconBox} style={{ background: '#EDE9FE', color: '#6D28D9' }}>
              🍷
            </div>
            <span className={styles.pillarTag} style={{ color: '#6D28D9' }}>TEMPS 2 • TERROIR & CONVIVIALITÉ</span>
            <h3 className={styles.pillarTitle}>TASTE</h3>
            <p className={styles.pillarText}>
              Des ravitaillements gourmands, festifs et musicaux mettant à l&apos;honneur les spécialités locales provençales et les cuvées de l&apos;appellation AOC Ventoux, avec des animations tout au long du tracé.
            </p>
          </div>

          {/* PARTY */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconBox} style={{ background: '#FFEDD5', color: '#C2410C' }}>
              🎉
            </div>
            <span className={styles.pillarTag} style={{ color: '#C2410C' }}>TEMPS 3 • FÊTE & DÉGUISEMENTS</span>
            <h3 className={styles.pillarTitle}>PARTY</h3>
            <p className={styles.pillarText}>
              Dès l&apos;arche d&apos;arrivée franchie à Mazan, place à la fête avec un grand repas musical provençal, des concerts et une ambiance festive inoubliable jusqu&apos;au bout de la nuit !
            </p>
          </div>
        </div>
      </div>

      {/* 3. LES 5 FORMATS AU PROGRAMME */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPretitle}>Les Épreuves Officielles</span>
          <h2 className={styles.sectionTitle}>5 Formats pour Tous les Niveaux</h2>
          <p className={styles.sectionDesc}>
            Que vous veniez pour claquer un chrono, savourer les vignes déguisé ou randonner en famille.
          </p>
        </div>

        <div className={styles.formatsGrid}>
          {/* Marathon */}
          <div className={styles.formatCard}>
            <div>
              <span className={styles.formatBadge} style={{ background: '#FEF3C7', color: '#B45309' }}>CHRONO & FESTIF</span>
              <div className={styles.formatDist}>42 KM</div>
              <div className={styles.formatName}>Le Marathon</div>
              <p className={styles.formatMeta}>
                L&apos;épreuve reine à travers les plus beaux domaines viticoles au pied du Ventoux.
              </p>
            </div>
          </div>

          {/* Semi */}
          <div className={styles.formatCard}>
            <div>
              <span className={styles.formatBadge} style={{ background: '#EDE9FE', color: '#6D28D9' }}>CHRONO & FESTIF</span>
              <div className={styles.formatDist}>21 KM</div>
              <div className={styles.formatName}>Le Semi-Marathon</div>
              <p className={styles.formatMeta}>
                L&apos;équilibre parfait entre défi sportif, dégustations et ambiance festive.
              </p>
            </div>
          </div>

          {/* 10 km */}
          <div className={styles.formatCard}>
            <div>
              <span className={styles.formatBadge} style={{ background: '#FFEDD5', color: '#C2410C' }}>CHRONO & FESTIF</span>
              <div className={styles.formatDist}>10 KM</div>
              <div className={styles.formatName}>Les 10 km</div>
              <p className={styles.formatMeta}>
                Format dynamique et ultra-accessible, idéal entre amis et en déguisement complet.
              </p>
            </div>
          </div>

          {/* Rando */}
          <div className={styles.formatCard}>
            <div>
              <span className={styles.formatBadge} style={{ background: '#DCFCE7', color: '#15803D' }}>SANS CHRONO</span>
              <div className={styles.formatDist}>05 KM</div>
              <div className={styles.formatName}>La Randonnée</div>
              <p className={styles.formatMeta}>
                Accessible à tous les marcheurs, familles et curieux pour vivre le terroir sans pression.
              </p>
            </div>
          </div>

          {/* Enfants */}
          <div className={styles.formatCard}>
            <div>
              <span className={styles.formatBadge} style={{ background: '#E0F2FE', color: '#0369A1' }}>JEUNES POUSSES</span>
              <div className={styles.formatDist}>KIDS</div>
              <div className={styles.formatName}>Courses Enfants</div>
              <p className={styles.formatMeta}>
                Pour que la fête soit totale pour les futurs petits champions du Vaucluse.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AFFICHE & ORGANISATION */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPretitle}>L&apos;Affiche & Les Organisateurs</span>
          <h2 className={styles.sectionTitle}>Une Alliance de Référence en Vaucluse</h2>
        </div>

        <div className={styles.posterOrgRow}>
          {/* Affiche */}
          <div className={styles.posterCard}>
            <img
              src="/images/poster-marathon-des-terroirs-du-ventoux-2027.jpg"
              alt="Affiche Marathon des Terroirs du Ventoux 2027"
              className={styles.posterImg}
            />
          </div>

          {/* Details & Orga */}
          <div className={styles.orgDetailsCard}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)", fontSize: '2rem', color: '#111417', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Porté par les pionniers de l&apos;Outdoor en Provence
              </h3>
              <p style={{ color: '#5E6973', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Le Marathon des Terroirs du Ventoux naît de la rencontre entre deux des plus grandes équipes d&apos;organisation d&apos;événements sportifs en France et le syndicat des vignerons de l&apos;AOC Ventoux.
              </p>

              <div className={styles.orgLogosRow}>
                <div className={styles.orgBox}>
                  <Award size={24} color="#EB5E28" />
                  <span className={styles.orgName}>Ventoux Organisation</span>
                  <span className={styles.orgRole}>Trail du Ventoux</span>
                </div>

                <div className={styles.orgBox}>
                  <Zap size={24} color="#7C3AED" />
                  <span className={styles.orgName}>Ventoux Events</span>
                  <span className={styles.orgRole}>Colnago GF Mont Ventoux</span>
                </div>

                <div className={styles.orgBox}>
                  <GlassWater size={24} color="#B45309" />
                  <span className={styles.orgName}>Vins AOC Ventoux</span>
                  <span className={styles.orgRole}>Terroir & Domaines</span>
                </div>
              </div>

              <div style={{ background: '#FAF7F2', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(17, 20, 23, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#111417', marginBottom: '0.35rem' }}>
                  <Calendar size={18} color="#EB5E28" /> Rendez-vous les 23 & 24 Octobre 2027 à Mazan
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5E6973', lineHeight: '1.5' }}>
                  Retrouvez toutes les actualités, profils de dénivelé et informations pratiques sur le site officiel de l&apos;épreuve et sur le calendrier officiel RunVaucluse.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://www.marathondesterroirsduventoux.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.launchBtn}
              >
                Accéder au Site Officiel <ExternalLink size={16} />
              </a>
              <Link
                href="/#calendrier"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(17, 20, 23, 0.15)',
                  color: '#111417',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Retour au Calendrier 84
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
