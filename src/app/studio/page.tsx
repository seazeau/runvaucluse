import { Metadata } from 'next';
import racesData from '@/data/races.json';
import { getLatestWinners } from '@/lib/db';
import { Race } from '@/lib/types';
import StudioClient from './StudioClient';

export const metadata: Metadata = {
  title: 'Studio Instagram & Médias | RunVaucluse',
  description: 'Générateur officiel de carrousels, stories et visuels pour @runvaucluse.fr.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function StudioPage() {
  const latestWinners = getLatestWinners(12);
  const races = racesData as Race[];

  return (
    <StudioClient 
      races={races} 
      latestWinners={latestWinners} 
    />
  );
}
