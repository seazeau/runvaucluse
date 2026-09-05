import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorer | Itinéraires Trail & Course à pied en Vaucluse',
  description: 'Découvrez notre sélection des plus beaux parcours de trail et itinéraires de course à pied en Vaucluse (84). Téléchargez les traces GPX et partez explorer la Provence.',
};

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
