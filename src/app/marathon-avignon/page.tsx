import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvignonMarathonDossier from '@/components/AvignonMarathonDossier';

export const metadata: Metadata = {
  title: "Marathon & Semi-Marathon d'Avignon 2026 - Présentation & Analyse Complète | RunVaucluse",
  description: "Dossier officiel et analyse tactique complète du Marathon et Semi-Marathon d'Avignon (27 Septembre 2026) : tracés GPX téléchargeables, profils altimétriques, conseils de coach STAPS, tableau des allures et guide logistique du coureur.",
  keywords: [
    "marathon avignon 2026",
    "semi-marathon avignon",
    "gpx marathon avignon",
    "parcours marathon avignon",
    "guide coureur marathon avignon",
    "course sur route vaucluse",
    "top4running marathon avignon",
    "runvaucluse",
    "vincent buisson coach"
  ],
  openGraph: {
    title: "Marathon & Semi-Marathon d'Avignon 2026 - Analyse & Guide Officiel | RunVaucluse",
    description: "Tracés GPX officiels, dénivelé, conseils coach STAPS, grille des meneurs d'allure et infos dossards pour le Marathon d'Avignon.",
    images: ['/images/marathonavignon.jpg'],
    type: 'article',
  }
};

export default function MarathonAvignonPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/#calendrier"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9ca3af',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            <ArrowLeft size={16} /> RETOUR AU CALENDRIER
          </Link>
        </div>

        <AvignonMarathonDossier />
      </div>
    </div>
  );
}
