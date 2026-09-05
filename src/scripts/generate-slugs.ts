import fs from 'fs';
import path from 'path';

const racesPath = path.join(process.cwd(), 'src', 'data', 'races.json');
const races = JSON.parse(fs.readFileSync(racesPath, 'utf8'));

function createSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '')   // remove diacritical marks
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')             // replace spaces with -
    .replace(/[^\w-]+/g, '')          // remove all non-word chars
    .replace(/--+/g, '-');            // replace multiple - with single -
}

const racesWithSlugs = (races as any[]).map(race => ({
  ...race,
  slug: createSlug(`${race.name}-${race.city}`)
}));

fs.writeFileSync(racesPath, JSON.stringify(racesWithSlugs, null, 2));
console.log(`Généré ${racesWithSlugs.length} slugs dans src/data/races.json`);
