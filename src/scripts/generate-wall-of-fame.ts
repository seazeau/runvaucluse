import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { slugify, canonicalSlug } from '../lib/utils';

const DB_PATH = path.join(process.cwd(), 'data', 'races.db');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'wall-of-fame.json');
const PUBLIC_OUTPUT_PATH = path.join(process.cwd(), 'public', 'data', 'wall-of-fame.json');

const db = new Database(DB_PATH);

const isUnknown = (name: string): boolean => {
  if (!name) return true;
  const n = name.toLowerCase();
  return (
    n.includes('inconnu') || 
    n.includes('dossard') || 
    n.includes('non connu') || 
    n.includes('anonyme') ||
    n.includes('non renseigne') ||
    n.trim().length < 3
  );
};

function generate() {
  console.log('🚀 Generating Wall of Fame data...');
  
  const allResults = db.prepare(`
    SELECT res.*, r.name as race_name, r.date as race_date
    FROM results res
    JOIN races r ON res.race_slug = r.slug
    ORDER BY r.date DESC
  `).all() as any[];

  const runnersMap = new Map();

  for (const res of allResults) {
    if (isUnknown(res.name)) continue;
    const key = canonicalSlug(res.name);
    
    if (!runnersMap.has(key)) {
      runnersMap.set(key, { n: res.name, s: key, r: [] });
    }

    const runner = runnersMap.get(key);
    const cleanClub = res.club && res.club.trim().length > 1 && !res.club.toLowerCase().includes('km') && !res.club.toLowerCase().includes('scr') ? res.club.trim() : undefined;
    
    runner.r.push({
      rn: res.race_name,
      en: res.event_name,
      ro: res.rank_overall,
      t: res.time,
      d: res.race_date,
      slug: res.race_slug,
      club: cleanClub,
      cat: res.rank_cat || undefined
    });
  }

  const runners = Array.from(runnersMap.values())
    .map(r => {
      // Find the most frequent valid club for this runner
      const clubsCount: Record<string, number> = {};
      r.r.forEach((res: any) => {
        if (res.club) {
          clubsCount[res.club] = (clubsCount[res.club] || 0) + 1;
        }
      });
      const topClub = Object.entries(clubsCount).sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        ...r,
        club: topClub || undefined,
        count: r.r.length,
        wins: r.r.filter((res: any) => res.ro === 1 || res.ro === "1").length
      };
    })
    .sort((a, b) => b.count - a.count);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(runners));
  fs.writeFileSync(PUBLIC_OUTPUT_PATH, JSON.stringify(runners));
  console.log(`✅ Wall of Fame updated in both src/data and public/data.`);
}

generate();
