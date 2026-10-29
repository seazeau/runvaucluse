import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TerroirsMarathonDossier from '@/components/TerroirsMarathonDossier';

export const metadata: Metadata = {
  title: "Marathon des Terroirs du Ventoux 2027 : Inscriptions, Affiche & Dossier Officiel | RunVaucluse",
  alternates: {
    canonical: 'https://runvaucluse.fr/race/marathon-des-terroirs-du-ventoux-mazan/',
  },
  description: "Dossier officiel et annonce de la 1ère édition du Marathon des Terroirs du Ventoux (23 & 24 Octobre 2027 à Mazan) : Run, Taste & Party au milieu des vignes AOC Ventoux. Marathon 42 km, Semi 21 km, 10 km, Rando 5 km et enfants. Inscriptions dès le 14 novembre 2026 à 12h.",
  keywords: [
    "marathon des terroirs du ventoux",
    "marathon des terroirs ventoux 2027",
    "marathon mazan 2027",
    "course festive vaucluse",
    "aoc ventoux running",
    "ventoux organisation",
    "ventoux events",
    "marathon festif provence",
    "inscriptions marathon des terroirs",
    "runvaucluse"
  ],
  openGraph: {
    title: "Marathon des Terroirs du Ventoux 2027 : Inscriptions, Formats & Affiche | RunVaucluse",
    description: "1ère édition les 23 & 24 octobre 2027 à Mazan : Marathon (42 km), Semi (21 km), 10 km, Rando (5 km) et enfants. Run, Taste & Party avec les vins AOC Ventoux.",
    images: ['/images/poster-marathon-des-terroirs-du-ventoux-2027.jpg'],
    type: 'article',
  }
};

export default function MarathonTerroirsPage() {
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

        <TerroirsMarathonDossier />
      </div>
    </div>
  );
}
