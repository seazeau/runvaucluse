import path from 'path';
import fs from 'fs';
import { PdfReader } from 'pdfreader';
import db from '../lib/db';

const RACE_SLUG = 'les-jas-du-ventoux-bedoin';
const EVENT_NAME = '21 km';
const RACE_DATE = '2026-10-18';
const PDF_URL = 'https://ventouxmountainrunning.com/wp-content/uploads/2026/10/Classement-general-JDV-26.pdf';

function convertCategory(raw: string): string {
  const c = raw.trim();
  const mMatch = c.match(/Masters?\s+(\d+)\s+(Hommes|Femmes)/i);
  if (mMatch) {
    const num = mMatch[1];
    const sex = mMatch[2].toLowerCase().startsWith('h') ? 'H' : 'F';
    return `M${num}${sex}`;
  }
  if (c.toLowerCase().includes('senior') && c.toLowerCase().includes('homme')) return 'SEH';
  if (c.toLowerCase().includes('senior') && c.toLowerCase().includes('femme')) return 'SEF';
  if (c.toLowerCase().includes('espoir') && c.toLowerCase().includes('homme')) return 'ESH';
  if (c.toLowerCase().includes('espoir') && c.toLowerCase().includes('femme')) return 'ESF';
  if (c.toLowerCase().includes('junior') && c.toLowerCase().includes('homme')) return 'JUH';
  if (c.toLowerCase().includes('junior') && c.toLowerCase().includes('femme')) return 'JUF';
  if (c.toLowerCase().includes('cadet') && c.toLowerCase().includes('homme')) return 'CAH';
  if (c.toLowerCase().includes('cadet') && c.toLowerCase().includes('femme')) return 'CAF';
  return c;
}

function calculateSpeed(timeStr: string, distanceKm: number = 21): string | null {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (totalSeconds <= 0) return null;
  const speed = (distanceKm * 3600) / totalSeconds;
  return `${speed.toFixed(1)} km/h`;
}

async function importJasDuVentoux() {
  console.log(`🚀 Téléchargement des résultats des Jas du Ventoux depuis: ${PDF_URL}`);
  const tempPath = path.join(process.cwd(), 'temp_jdv_2026.pdf');
  
  if (!fs.existsSync(tempPath)) {
    const res = await fetch(PDF_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const buf = await res.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buf));
  }

  const rows: { [pageAndY: string]: any[] } = {};
  let currentPage = 1;

  await new Promise<void>((resolve, reject) => {
    new PdfReader({}).parseFileItems(tempPath, (err, item) => {
      if (err) resolve();
      else if (!item) resolve();
      else if (item.page) currentPage = item.page;
      else if (item.text) {
        const key = `${currentPage}_${item.y.toFixed(1)}`;
        if (!rows[key]) rows[key] = [];
        rows[key].push({ text: item.text.trim(), x: item.x, y: item.y });
      }
    });
  });

  const parsedResults: any[] = [];

  for (const [key, items] of Object.entries(rows)) {
    items.sort((a, b) => a.x - b.x);
    const first = items[0];
    if (!first || !first.text.match(/^\d+\.?$/)) continue;
    const rank = parseInt(first.text.replace('.', ''), 10);
    if (isNaN(rank)) continue;

    let bib = '';
    let name = '';
    let sex = '';
    let rawCat = '';
    let club = '';
    let time = '';

    for (let i = 1; i < items.length; i++) {
      const it = items[i];
      if (it.x >= 5 && it.x < 9) bib = it.text;
      else if (it.x >= 9 && it.x < 22) name += (name ? ' ' : '') + it.text;
      else if (it.x >= 25 && it.x < 28) sex = it.text.toUpperCase();
      else if (it.x >= 28 && it.x < 35) rawCat += (rawCat ? ' ' : '') + it.text;
      else if (it.x >= 35 && it.x < 46) club += (club ? ' ' : '') + it.text;
      else if (it.x >= 46) time = it.text;
    }

    if (!bib || !time) continue;

    let formattedName = name;
    if (name.includes(',')) {
      const parts = name.split(',').map(s => s.trim());
      formattedName = `${parts[0].toUpperCase()} ${parts[1]}`;
    }

    let formattedTime = time;
    if (formattedTime.length === 7) formattedTime = '0' + formattedTime;

    parsedResults.push({
      rank,
      bib,
      name: formattedName,
      sex: sex || 'M',
      cat: convertCategory(rawCat),
      club: club ? club.trim() : null,
      time: formattedTime,
      speed: calculateSpeed(formattedTime, 21)
    });
  }

  parsedResults.sort((a, b) => a.rank - b.rank);
  console.log(`✅ ${parsedResults.length} résultats extraits du PDF.`);

  // Compute category & sex ranks
  const sexRanks: { [key: string]: number } = {};
  const catRanks: { [key: string]: number } = {};

  const tableResults = parsedResults.map(res => {
    if (!sexRanks[res.sex]) sexRanks[res.sex] = 1;
    if (!catRanks[res.cat]) catRanks[res.cat] = 1;

    return {
      race_slug: RACE_SLUG,
      event_name: EVENT_NAME,
      rank_overall: res.rank,
      bib: res.bib,
      name: res.name,
      rank_sex: `${sexRanks[res.sex]++}.(${res.sex})`,
      rank_cat: `${catRanks[res.cat]++}.(${res.cat})`,
      time: res.time,
      podium: res.rank <= 3 ? 'SCR' : null,
      speed: res.speed,
      club: res.club,
      race_date: RACE_DATE
    };
  });

  db.pragma('foreign_keys = OFF');
  db.prepare('DELETE FROM results WHERE race_slug = ?').run(RACE_SLUG);

  const stmt = db.prepare(`
    INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, podium, speed, club, race_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((data) => {
    for (const r of data) {
      stmt.run(r.race_slug, r.event_name, r.rank_overall, r.bib, r.name, r.rank_sex, r.rank_cat, r.time, r.podium, r.speed, r.club, r.race_date);
    }
  });

  insertMany(tableResults);
  console.log(`🎉 Succès : ${tableResults.length} résultats importés pour ${RACE_SLUG} !`);

  // Remove temporary PDF file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
}

importJasDuVentoux().catch(console.error);
