import { PdfReader } from 'pdfreader';
import db from '../lib/db';

interface Item {
  page: number;
  x: number;
  y: number;
  text: string;
}

interface ParsedRow {
  race_slug: string;
  event_name: string;
  rank_overall: number;
  bib: string | null;
  name: string;
  rank_sex: string;
  rank_cat: string;
  time: string;
  podium: string | null;
  speed: string | null;
  club: string | null;
}

function calculateSpeed(timeStr: string, distanceKm: number): string | null {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3) return null;
  const totalHours = parts[0] + parts[1] / 60 + parts[2] / 3600;
  if (totalHours <= 0) return null;
  const speed = (distanceKm / totalHours).toFixed(1);
  return `${speed} km/h`;
}

function formatSexRank(raw: string): string {
  const m = raw.match(/^(\d+)([MF])$/i);
  if (m) {
    return `${m[1]}.(${m[2].toUpperCase()})`;
  }
  return raw;
}

function formatCatRank(raw: string): string {
  // Format like "1 SEM" or "2M1F" or "1M"
  const m1 = raw.match(/^(\d+)\s*([A-Za-z0-9]+)$/);
  if (m1) {
    return `${m1[1]}.(${m1[2]})`;
  }
  return raw;
}

async function parseSorguesPdf(filePath: string): Promise<ParsedRow[]> {
  const items: Item[] = [];
  let currentPage = 0;

  await new Promise<void>((resolve, reject) => {
    new PdfReader({}).parseFileItems(filePath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve();
      else if (item.page) currentPage = item.page;
      else if (item.text) {
        items.push({
          page: currentPage,
          x: item.x,
          y: item.y,
          text: item.text.trim()
        });
      }
    });
  });

  const allResults: ParsedRow[] = [];

  for (let p = 1; p <= currentPage; p++) {
    const is7km = p <= 3;
    const event_name = is7km ? '7 km' : '13 km';
    const distKm = is7km ? 7 : 13;

    const pItems = items.filter(it => it.page === p && it.y > 3.5);
    // Group by line (y tolerance 0.25)
    const lineMap: { y: number; items: Item[] }[] = [];
    for (const it of pItems) {
      let l = lineMap.find(existing => Math.abs(existing.y - it.y) < 0.25);
      if (!l) {
        l = { y: it.y, items: [] };
        lineMap.push(l);
      }
      l.items.push(it);
    }
    lineMap.sort((a, b) => a.y - b.y);

    for (const line of lineMap) {
      const sorted = line.items.sort((a, b) => a.x - b.x);
      // Skip footer line (GmCAP, I:158 D:...)
      if (sorted.some(it => it.text.includes('GmCAP') || it.text.includes('DSQ:'))) {
        continue;
      }

      // First item must be rank
      const rank = parseInt(sorted[0].text, 10);
      if (isNaN(rank)) continue;

      // Find time item (format HH:MM:SS)
      const timeIdx = sorted.findIndex(it => /^\d{2}:\d{2}:\d{2}$/.test(it.text));
      if (timeIdx === -1) {
        console.warn(`Could not find time on page ${p}, row:`, sorted.map(it => it.text));
        continue;
      }

      const time = sorted[timeIdx].text;
      
      // Club is everything after time
      const clubTokens = sorted.slice(timeIdx + 1).map(it => it.text).filter(Boolean);
      const club = clubTokens.join(' ').trim() || null;

      // Between rank (index 0) and time (index timeIdx), we have:
      // - Name
      // - rank_sex (ends with M or F, e.g. 1M, 14F)
      // - rank_cat (e.g. "1 SEM" or "2M1F")
      const middleTokens = sorted.slice(1, timeIdx);
      
      // Find sex rank token (matches /^\d+[MF]$/i)
      const sexRankIdx = middleTokens.findIndex(it => /^\d+[MF]$/i.test(it.text));
      let name = '';
      let rank_sex = '';
      let rank_cat = '';

      if (sexRankIdx !== -1) {
        name = middleTokens.slice(0, sexRankIdx).map(it => it.text).join(' ').trim();
        rank_sex = formatSexRank(middleTokens[sexRankIdx].text);
        const catTokens = middleTokens.slice(sexRankIdx + 1).map(it => it.text);
        rank_cat = formatCatRank(catTokens.join(' ').trim());
      } else {
        // Fallback
        name = middleTokens.slice(0, -2).map(it => it.text).join(' ').trim();
        rank_sex = middleTokens[middleTokens.length - 2]?.text || '';
        rank_cat = middleTokens[middleTokens.length - 1]?.text || '';
      }

      const podium = rank <= 3 ? 'SCR' : null;
      const speed = calculateSpeed(time, distKm);

      allResults.push({
        race_slug: 'lenjambee-sorguaise-sorgues',
        event_name,
        rank_overall: rank,
        bib: null,
        name,
        rank_sex,
        rank_cat,
        time,
        podium,
        speed,
        club
      });
    }
  }

  return allResults;
}

async function run() {
  const results = await parseSorguesPdf('sorgues26.pdf');
  console.log(`Parsed ${results.length} total results from PDF.`);
  
  const count7 = results.filter(r => r.event_name === '7 km').length;
  const count13 = results.filter(r => r.event_name === '13 km').length;
  console.log(`7 km: ${count7} finishers (expected 146)`);
  console.log(`13 km: ${count13} finishers (expected 76)`);

  if (count7 !== 146 || count13 !== 76) {
    console.error("Warning: Count mismatch!");
  }

  // Insert into DB
  db.pragma('foreign_keys = OFF');
  db.prepare('DELETE FROM results WHERE race_slug = ?').run('lenjambee-sorguaise-sorgues');

  const stmt = db.prepare(`
    INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, podium, speed, club)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: ParsedRow[]) => {
    for (const r of rows) {
      stmt.run(r.race_slug, r.event_name, r.rank_overall, r.bib, r.name, r.rank_sex, r.rank_cat, r.time, r.podium, r.speed, r.club);
    }
  });

  insertMany(results);
  console.log(`✅ Successfully saved ${results.length} results into database for lenjambee-sorguaise-sorgues!`);
}

run().catch(console.error);
