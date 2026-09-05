import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { canonicalSlug } from '../lib/utils';

const DB_PATH = path.join(process.cwd(), 'data', 'races.db');
const ALIASES_PATH = path.join(process.cwd(), 'src/data/aliases.json');

const db = new Database(DB_PATH);

// Simple Levenshtein distance to find similar names
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

async function detect() {
  console.log('🔍 Scanning database for potential name duplicates...');
  
  // 1. Get all unique names and their most common club
  const rows = db.prepare(`
    SELECT name, club, COUNT(*) as count 
    FROM results 
    WHERE name IS NOT NULL AND length(name) > 5
    GROUP BY name 
    ORDER BY count DESC
  `).all() as any[];

  const aliases: Record<string, string> = {};
  const processed = new Set();

  for (let i = 0; i < rows.length; i++) {
    const mainName = rows[i].name;
    const mainSlug = canonicalSlug(mainName);
    
    if (processed.has(mainSlug)) continue;

    for (let j = i + 1; j < rows.length; j++) {
      const otherName = rows[j].name;
      const otherSlug = canonicalSlug(otherName);

      if (processed.has(otherSlug)) continue;
      if (mainSlug === otherSlug) continue;

      // Distance check
      const dist = levenshtein(mainSlug, otherSlug);
      const maxLength = Math.max(mainSlug.length, otherSlug.length);
      
      // If names are very similar (only 1 or 2 chars difference for long names)
      // AND they share the same tokens (just one typo)
      if (dist <= 2 && maxLength > 10) {
        console.log(`✨ Potential match found: [${mainName}] <-> [${otherName}] (Dist: ${dist})`);
        
        // Use the more frequent name as the primary
        aliases[otherSlug] = mainSlug;
        processed.add(otherSlug);
      }
    }
    processed.add(mainSlug);
  }

  fs.writeFileSync(ALIASES_PATH, JSON.stringify(aliases, null, 2));
  console.log(`✅ Auto-detection complete. ${Object.keys(aliases).length} aliases saved to aliases.json`);
}

detect();
