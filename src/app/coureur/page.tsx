import { Suspense } from 'react';
import { Metadata } from 'next';
import CoureurClient from './CoureurClient';

export const metadata: Metadata = {
  title: 'Fiche Coureur & Palmarès Officiel | RunVaucluse',
  description: 'Consultez la fiche profil de votre coureur : nombre de courses en Vaucluse, kilomètres parcourus, victoires, chronos et classements officiels 2026.',
};

export default function CoureurPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#c05621', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>CHARGEMENT DU PROFIL ATHLÈTE...</p>
      </div>
    }>
      <CoureurClient />
    </Suspense>
  );
}
