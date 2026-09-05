import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Records & Bilans d\'Athlétisme du Vaucluse 2026 | RunVaucluse',
  description: 'Découvrez les records officiels homologués FFA du Vaucluse (5 km, 10 km, Semi-Marathon, Marathon) et le classement départemental de régularité 2026.',
  keywords: [
    'records athlétisme vaucluse',
    'records 10km vaucluse',
    'records marathon vaucluse',
    'bilans ffa vaucluse 2026',
    'classement coureurs 84',
    'challenge régularité vaucluse',
    'running vaucluse'
  ],
  alternates: {
    canonical: 'https://runvaucluse.fr/records/',
  },
  openGraph: {
    title: 'Records & Bilans d\'Athlétisme du Vaucluse 2026 | RunVaucluse',
    description: 'Les temps de référence homologués FFA sur route et le classement de régularité des coureurs du 84.',
    url: 'https://runvaucluse.fr/records/',
    type: 'website',
  }
};

export default function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
