import { Metadata } from 'next';
import OrganisateursClient from './OrganisateursClient';

export const metadata: Metadata = {
  title: 'Espace Organisateurs • Référencement, Visibilité & Création de Site | RunVaucluse',
  description: 'Boostez les inscriptions de votre course en Vaucluse : référencement officiel gratuit, pack visibilité "Course Vedette" et création de sites web dédiés clé en main.',
  alternates: {
    canonical: 'https://runvaucluse.fr/organisateurs/',
  },
};

export default function OrganisateursPage() {
  return <OrganisateursClient />;
}
