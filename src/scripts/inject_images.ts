import fs from 'fs';
import path from 'path';

const racesPath = path.join(process.cwd(), 'src/data/races.json');
const races = JSON.parse(fs.readFileSync(racesPath, 'utf-8'));

const IMAGES = {
  Trail: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
  Route: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800",
  Nature: "https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=800",
  Cross: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?auto=format&fit=crop&q=80&w=800",
  "Urban Trail": "https://images.unsplash.com/photo-1513594434134-48a1ec4a0a3f?auto=format&fit=crop&q=80&w=800",
  Marche: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
  Generic: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=800"
};

const updatedRaces = races.map((race: any) => {
  // If it already has a specific image (featured), keep it
  if (race.image_url && race.is_featured) return race;

  // Otherwise assign by type
  let img = IMAGES.Generic;
  if (race.type.includes('Trail')) img = IMAGES.Trail;
  else if (race.type.includes('Route')) img = IMAGES.Route;
  else if (race.type.includes('Nature')) img = IMAGES.Nature;
  else if (race.type.includes('Cross')) img = IMAGES.Cross;
  else if (race.type.includes('Urban')) img = IMAGES.Trail; // Or Urban specifically
  else if (race.type.includes('Marche')) img = IMAGES.Marche;

  return { ...race, image_url: img };
});

fs.writeFileSync(racesPath, JSON.stringify(updatedRaces, null, 2));
console.log("Images injected successfully into races.json");
