import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvignonMarathonDossier from '@/components/AvignonMarathonDossier';

export const metadata: Metadata = {
  title: "Marathon & Semi-Marathon d'Avignon 2027 - Présentation & Analyse Complète | RunVaucluse",
  description: "Dossier officiel et analyse tactique complète de la 2ème édition du Marathon et Semi-Marathon d'Avignon (Dimanche 14 Mars 2027) : 6 000 dossards, labellisé FFA sur les 2 distances, inscriptions Finishers, tracés GPX téléchargeables, profils altimétriques et conseils coach STAPS.",
  keywords: [
    "marathon avignon 2027",
    "semi-marathon avignon 2027",
    "finishers marathon avignon",
    "gpx marathon avignon",
    "parcours marathon avignon",
    "guide coureur marathon avignon",
    "course sur route vaucluse",
    "top4running marathon avignon",
    "runvaucluse",
    "vincent buisson coach"
  ],
  openGraph: {
    title: "Marathon & Semi-Marathon d'Avignon 2027 - Analyse & Guide Officiel | RunVaucluse",
    description: "2ème édition le 14 mars 2027 : 6 000 dossards, label FFA, inscriptions Finishers, tracés GPX officiels, dénivelé et conseils coach STAPS.",
    images: ['/images/poster-marathon-davignon-2027.png'],
    type: 'article',
  }
};

export default function MarathonAvignonPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main, #FAF7F2)', paddingTop: '7rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/#calendrier"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gray-muted, #5E6973)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
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
