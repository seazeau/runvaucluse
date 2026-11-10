import path from 'path';
import fs from 'fs';
import { PdfReader } from 'pdfreader';
import db from '../lib/db';

const RACE_SLUG = 'trail-du-ventouret-bedoin';
const RACE_DATE = '2026-11-08';
const PDF_URL = 'https://ventouxtrailclub.com/wp-content/uploads/2026/11/Classement-general-34.pdf';

function formatName(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('Equipe,')) {
    cleaned = cleaned.replace(/^Equipe,\s*/i, '');
  }
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(s => s.trim());
    return `${parts[0].toUpperCase()} ${parts.slice(1).join(' ')}`.trim();
  }
  return cleaned;
}

function formatTime(raw: string): string {
  const t = raw.trim();
  const parts = t.split(':');
  if (parts.length === 2) {
    // MM:SS -> 00:MM:SS
    return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  }
  return t;
}

async function importVentouret() {
  console.log(`🚀 Import des résultats du Trail du Ventouret depuis ${PDF_URL}...`);
  const tempPath = path.join(process.cwd(), 'temp_ventouret_2026.pdf');

  if (!fs.existsSync(tempPath)) {
    const res = await fetch(PDF_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const buf = await res.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buf));
  }

  const rows: { [pageAndY: string]: any[] } = {};
  let currentPage = 1;

  await new Promise<void>((resolve) => {
    new PdfReader({}).parseFileItems(tempPath, (err, item) => {
      if (err || !item) resolve();
      else if (item.page) currentPage = item.page;
      else if (item.text) {
        const key = `${currentPage}_${item.y.toFixed(2)}`;
        if (!rows[key]) rows[key] = [];
        rows[key].push({ text: item.text.trim(), x: item.x, y: item.y });
      }
    });
  });

  let currentEvent = '12 km';
  const parsedResults: any[] = [];
  const eventCounters: { [event: string]: { [sex: string]: number } } = {};

  for (const [key, items] of Object.entries(rows)) {
    items.sort((a, b) => a.x - b.x);
    const lineText = items.map(i => i.text).join(' ');

    if (lineText.includes('Trail du Ventouret - 12 km')) {
      currentEvent = '12 km';
      continue;
    } else if (lineText.includes('Trail du Ventouret - 24 km')) {
      currentEvent = '24 km';
      continue;
    } else if (lineText.includes('Trail du Ventouret - Run & Bike 21 km')) {
      currentEvent = 'Run & Bike 21 km';
      continue;
    } else if (lineText.includes('Trail du Ventouret - Challenge 36 km')) {
      currentEvent = 'Challenge 36 km';
      continue;
    }

    const first = items[0];
    if (!first || !first.text.match(/^\d+\.?$/)) continue;
    const rank = parseInt(first.text.replace('.', ''), 10);
    if (isNaN(rank)) continue;

    let bib = '';
    let name = '';
    let time = '';
    let sex = 'M';
    let cat = '';
    let catRank = '';
    let speed = '';
    let club = '';

    for (const it of items.slice(1)) {
      const x = it.x;
      const text = it.text;

      if (x < 17.5) {
        // Name and bib: e.g. "GHIANDAI, Yoann (256)"
        const bibMatch = text.match(/\((\d+)\)/);
        if (bibMatch) {
          bib = bibMatch[1];
          name += (name ? ' ' : '') + text.replace(/\s*\(\d+\)/, '');
        } else {
          name += (name ? ' ' : '') + text;
        }
      } else if (x >= 17.5 && x < 21.0) {
        // Time
        if (text.includes(':')) {
          time = text;
        }
      } else if (x >= 21.0 && x < 23.5) {
        // Sex
        if (text === 'M' || text === 'F' || text === 'A' || text === 'X') {
          sex = text === 'F' ? 'F' : 'M';
        }
      } else if (x >= 23.5 && x < 31.5) {
        // Catégorie (class cat): e.g. "Cat 30-39 H (1)" or "(1)"
        const m = text.match(/Cat\s+(.+?)\s+\((\d+)\)/i);
        if (m) {
          cat = m[1].trim();
          catRank = `${m[2]}.(${cat})`;
        } else if (text.match(/\((\d+)\)/)) {
          const m2 = text.match(/\((\d+)\)/);
          catRank = `${m2![1]}.(Duo)`;
          cat = 'Duo';
        } else {
          cat = text;
        }
      } else if (x >= 31.5 && x < 37.0) {
        // Speed: e.g. "12.2 km/h"
        if (text.includes('km/h') || text.match(/^\d+(\.\d+)?$/)) {
          speed = text.includes('km/h') ? text : `${text} km/h`;
        }
      } else if (x >= 37.0) {
        // Club or team members
        club += (club ? ' ' : '') + text;
      }
    }

    if (!time) continue;

    // Handle team members in Run & Bike if in club
    let finalName = formatName(name);
    let finalClub = club ? club.trim() : null;

    if (currentEvent === 'Run & Bike 21 km' && club && club.includes(' et ')) {
      finalName = `${club.trim()} (${formatName(name)})`;
      finalClub = null;
    }

    if (!eventCounters[currentEvent]) {
      eventCounters[currentEvent] = { M: 0, F: 0 };
    }
    const currentSex = sex === 'F' ? 'F' : 'M';
    eventCounters[currentEvent][currentSex] = (eventCounters[currentEvent][currentSex] || 0) + 1;
    const sexRank = `${eventCounters[currentEvent][currentSex]}.(${currentSex})`;

    parsedResults.push({
      race_slug: RACE_SLUG,
      event_name: currentEvent,
      rank_overall: rank,
      bib: bib || null,
      name: finalName,
      rank_sex: sexRank,
      rank_cat: catRank || cat || null,
      time: formatTime(time),
      podium: rank <= 3 ? 'SCR' : null,
      speed: speed || null,
      club: finalClub,
      race_date: RACE_DATE
    });
  }

  console.log(`✅ Extrait ${parsedResults.length} résultats au total.`);
  const perEventCounts: { [e: string]: number } = {};
  for (const r of parsedResults) {
    perEventCounts[r.event_name] = (perEventCounts[r.event_name] || 0) + 1;
  }
  console.log('Répartition par épreuve :', perEventCounts);

  // Database operations
  db.pragma('foreign_keys = OFF');
  db.prepare('DELETE FROM results WHERE race_slug = ?').run(RACE_SLUG);

  const insertStmt = db.prepare(`
    INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, podium, speed, club, race_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((data: any[]) => {
    for (const r of data) {
      insertStmt.run(
        r.race_slug,
        r.event_name,
        r.rank_overall,
        r.bib,
        r.name,
        r.rank_sex,
        r.rank_cat,
        r.time,
        r.podium,
        r.speed,
        r.club,
        r.race_date
      );
    }
  });

  insertMany(parsedResults);
  console.log(`🎉 ${parsedResults.length} résultats insérés avec succès pour ${RACE_SLUG} !`);
}

importVentouret().catch(console.error);
