import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ShoeFinder from '@/components/ShoeFinder';
import NutripurePartnerCard from '@/components/NutripurePartnerCard';

export const metadata: Metadata = {
  title: 'Shoe Finder : Quelles Chaussures de Running & Trail Choisir ?',
  description:
    'Trouvez vos 3 paires de chaussures idéales en 15 secondes selon votre terrain (Route, Trail Ventoux/Luberon, Chemin), votre volume hebdomadaire et votre objectif avec le Shoe Scanner RunVaucluse × Top4Running.',
  alternates: {
    canonical: 'https://runvaucluse.fr/shoe-finder/',
  },
  keywords: [
    'quelles chaussures trail vaucluse',
    'comparateur chaussures running',
    'shoe finder running',
    'chaussures trail ventoux',
    'chaussures marathon avignon',
    'top4running chaussure running',
    'conseil chaussure course a pied',
  ],
};

export default function ShoeFinderPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main, #FAF7F2)',
        paddingTop: '7rem',
        paddingBottom: '5rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            href="/#calendrier"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gray-muted, #5E6973)',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> RETOUR AU CALENDRIER DES COURSES
          </Link>
        </div>

        <ShoeFinder startInWizardMode={true} showCatalog={true} raceSlug="page_shoe_finder" />

        <div style={{ marginTop: '2.5rem' }}>
          <NutripurePartnerCard />
        </div>
      </div>
    </div>
  );
}
