import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { slugify, canonicalSlug } from './utils';
import { Race, RaceResult, RunnerResult } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'races.db');

// Helper to filter out anonymous/unknown entries
export const isUnknown = (name: string): boolean => {
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

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    distances TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_featured INTEGER DEFAULT 0,
    image_url TEXT,
    label TEXT,
    contact TEXT,
    description TEXT,
    facebook TEXT,
    instagram TEXT,
    registration_platform TEXT,
    registration_link TEXT,
    website TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_slug TEXT NOT NULL,
    event_name TEXT NOT NULL,
    rank_overall INTEGER,
    bib TEXT,
    name TEXT,
    rank_sex TEXT,
    rank_cat TEXT,
    time TEXT,
    podium TEXT,
    speed TEXT,
    club TEXT,
    FOREIGN KEY(race_slug) REFERENCES races(slug)
  )
`);

export default db;

export const getResultsBySlug = (slug: string): RaceResult[] => {
  return db.prepare('SELECT * FROM results WHERE race_slug = ? ORDER BY rank_overall ASC').all(slug) as RaceResult[];
};

export const getRacesWithResults = (): (Race & { resultCount: number })[] => {
  return db.prepare(`
    SELECT r.*, COUNT(res.id) as resultCount
    FROM races r
    INNER JOIN results res ON r.slug = res.race_slug
    GROUP BY r.slug
    ORDER BY r.date DESC
  `).all() as (Race & { resultCount: number })[];
};

export const getLatestWinners = (limit: number = 3) => {
  const latestRaces = db.prepare(`
    SELECT DISTINCT r.slug, r.name, r.date, r.city, r.image_url, r.distances, r.type
    FROM races r
    INNER JOIN results res ON r.slug = res.race_slug
    ORDER BY r.date DESC
    LIMIT ?
  `).all(limit) as { slug: string; name: string; date: string; city: string; image_url?: string; distances?: string; type?: string }[];


  return latestRaces.map(race => {
    // Fetch EVERYONE who is 1st in their sex category (or rank_overall 1)
    const winners = db.prepare(`
      SELECT name, event_name, time, club, rank_sex, rank_overall
      FROM results
      WHERE race_slug = ? AND (
        rank_sex = '1' OR 
        rank_sex LIKE '1.%' OR 
        rank_sex LIKE '1 %' OR
        rank_overall = 1
      )
      ORDER BY event_name DESC, rank_overall ASC
    `).all(race.slug) as { name: string; event_name: string; time: string; club: string; rank_sex: string; rank_overall: number }[];

    return {
      ...race,
      winners
    };
  });
};

export const getRaceBySlug = (slug: string): Race | null => {
  return db.prepare('SELECT * FROM races WHERE slug = ?').get(slug) as Race | null;
};

// Runner Profile functions
export const getRunnerResults = (name: string): RunnerResult[] => {
  return db.prepare(`
    SELECT res.*, r.name as race_name, r.date as race_date
    FROM results res
    JOIN races r ON res.race_slug = r.slug
    WHERE LOWER(res.name) = LOWER(?)
    ORDER BY r.date DESC
  `).all(name) as RunnerResult[];
};

export const getRunnerBySlug = (slug: string) => {
  const allNames = db.prepare('SELECT DISTINCT name FROM results').all() as { name: string }[];
  
  // 1. Find all names that match this slug (either directly or via canonical form)
  // This allows finding "JACOB Chantal" if the slug is "chantal-jacob" or "jacob-chantal"
  const matchingNames = allNames.filter((n: { name: string }) => {
    const s = slugify(n.name);
    const c = canonicalSlug(n.name);
    return s === slug || c === slug;
  }).map((n: { name: string }) => n.name);
  
  if (matchingNames.length === 0) return null;
  
  // 2. Fetch results for ALL matching names
  const results: RunnerResult[] = [];
  for (const name of matchingNames) {
    const nameResults = db.prepare(`
        SELECT res.*, r.name as race_name, r.date as race_date
        FROM results res
        JOIN races r ON res.race_slug = r.slug
        WHERE res.name = ?
        ORDER BY r.date DESC
    `).all(name) as RunnerResult[];
    results.push(...nameResults);
  }

  // Sort consolidated results by date
  results.sort((a, b) => b.race_date.localeCompare(a.race_date));
  
  return {
    name: matchingNames[0], // Use the first name format found as primary
    slug: slug,
    results: results
  };
};

export const getTopRacers = (limit = 5): { name: string, raceCount: number, slug: string }[] => {
  // Fetch all results to group them in-memory with canonical logic
  const allResults = db.prepare('SELECT name FROM results').all() as { name: string }[];
  
  const groups: { [key: string]: { name: string, count: number } } = {};
  
  for (const res of allResults) {
    if (isUnknown(res.name)) continue;
    
    const key = canonicalSlug(res.name);
    if (!groups[key]) {
      groups[key] = { name: res.name, count: 0 };
    }
    groups[key].count++;
  }

  return Object.entries(groups)
    .map(([key, data]) => ({
      name: data.name,
      raceCount: data.count,
      slug: key // Use canonical slug as the unique ID
    }))
    .sort((a, b) => b.raceCount - a.raceCount)
    .slice(0, limit);
};

export const getTopWinners = (limit = 5): { name: string, winCount: number, slug: string }[] => {
  // Fetch only victories
  const allVictories = db.prepare('SELECT name FROM results WHERE rank_overall = 1').all() as { name: string }[];
  
  const groups: { [key: string]: { name: string, count: number } } = {};
  
  for (const res of allVictories) {
    if (isUnknown(res.name)) continue;
    
    const key = canonicalSlug(res.name);
    if (!groups[key]) {
      groups[key] = { name: res.name, count: 0 };
    }
    groups[key].count++;
  }

  return Object.entries(groups)
    .map(([key, data]) => ({
      name: data.name,
      winCount: data.count,
      slug: key // Use canonical slug as the unique ID
    }))
    .sort((a, b) => b.winCount - a.winCount)
    .slice(0, limit);
};
