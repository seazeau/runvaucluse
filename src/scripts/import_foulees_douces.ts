import { PdfReader } from 'pdfreader';
import path from 'path';
import fs from 'fs';
import db from '../lib/db';

interface ParsedResult {
  race_slug: string;
  event_name: string;
  rank_overall: number;
  bib: string;
  name: string;
  rank_sex: string;
  rank_cat: string;
  time: string;
  speed: string | null;
  club: string | null;
  podium: string | null;
  race_date: string;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullText = '';
    new PdfReader({}).parseFileItems(filePath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(fullText);
      else if (item.text) fullText += item.text + ' ';
    });
  });
}

function cleanClub(raw: string, runnerName: string): string | null {
  if (!raw) return null;
  let c = raw
    .replace(/Page\s+\d+\/\d+[\s\S]*?(?:Club|$)/gi, '')
    .replace(/GmCAP[\s\S]*?(?:Club|$)/gi, '')
    .replace(/I:\d+\s+D:\d+[\s\S]*?(?:Club|$)/gi, '')
    .trim();
  c = c.replace(/^\[\d+\]\s*/, '').trim();

  const lower = c.toLowerCase();
  if (
    lower === 'non licencié' ||
    lower === 'non licencie' ||
    lower === 'aucun' ||
    lower === 'sans' ||
    lower === 'individuel' ||
    lower === 'inconnu' ||
    lower === runnerName.split(' ')[0].toLowerCase() ||
    c.length === 0
  ) {
    return null;
  }

  // Normalize known clubs
  if (c === '1000') return 'LES 1000 PATTES';
  if (c === 'MAISON SPORT SANTÉ GRAND AVIGNON') return 'MAISON SPORT SANTE GRAND AVIGNON';

  return c;
}

function formatRankSex(rawSx: string): string {
  const m = rawSx.match(/^(\d+)([MFX])$/i);
  if (m) {
    return `${m[1]}.(${m[2].toUpperCase()})`;
  }
  return rawSx;
}

function determinePodium(rankOverall: number, rankCat: string): string | null {
  if (rankOverall <= 3) return 'SCR';
  if (/^1[A-Za-z]/.test(rankCat)) return 'CATEG';
  return null;
}

async function parseRacePdf(filePath: string, slug: string, eventName: string, raceDate: string): Promise<ParsedResult[]> {
  const text = await extractTextFromPdf(filePath);
  const regex = /(\d+)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-'\.]+?)\s+([A-Z]{3})\s+n°(\d+)\s+(\d{2})\s+(\d+[A-Za-z0-9]+)\s+(\d+[MF])\s+(\d{1,2}:\d{2}:\d{2})\s+(\d+\.\d+)/g;
  
  let match;
  const matches: any[] = [];
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      rank: parseInt(match[1]),
      name: match[2].trim(),
      nat: match[3],
      bib: match[4],
      birth: match[5],
      cat: match[6],
      sexRank: match[7],
      time: match[8],
      speed: match[9],
      index: match.index,
      endIndex: regex.lastIndex
    });
  }

  const results: ParsedResult[] = [];
  for (let i = 0; i < matches.length; i++) {
    const rawClub = text.substring(matches[i].endIndex, matches[i + 1] ? matches[i + 1].index : matches[i].endIndex + 100);
    const club = cleanClub(rawClub, matches[i].name);
    const rankSex = formatRankSex(matches[i].sexRank);
    const podium = determinePodium(matches[i].rank, matches[i].cat);

    results.push({
      race_slug: slug,
      event_name: eventName,
      rank_overall: matches[i].rank,
      bib: matches[i].bib,
      name: matches[i].name,
      rank_sex: rankSex,
      rank_cat: matches[i].cat,
      time: matches[i].time,
      speed: matches[i].speed ? `${matches[i].speed} km/h` : null,
      club: club,
      podium: podium,
      race_date: raceDate
    });
  }

  return results;
}

async function main() {
  const slug = 'les-foulees-douces-montfavet';
  const raceDate = '2026-10-11';
  console.log(`Starting import for ${slug} (${raceDate})...`);

  const pdf10 = path.join(process.cwd(), 'résultats', 'foulees_douces_10km.pdf');
  const pdf5 = path.join(process.cwd(), 'résultats', 'foulees_douces_5km.pdf');

  if (!fs.existsSync(pdf10) || !fs.existsSync(pdf5)) {
    throw new Error('PDF files missing in résultats folder!');
  }

  const results10 = await parseRacePdf(pdf10, slug, '10 km', raceDate);
  const results5 = await parseRacePdf(pdf5, slug, '5 km', raceDate);

  console.log(`Parsed ${results10.length} runners for 10 km`);
  console.log(`Parsed ${results5.length} runners for 5 km`);

  const allResults = [...results10, ...results5];
  console.log(`Total to insert: ${allResults.length} records`);

  db.pragma('foreign_keys = OFF');
  db.prepare('DELETE FROM results WHERE race_slug = ?').run(slug);

  const stmt = db.prepare(`
    INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, speed, club, podium, race_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((data: ParsedResult[]) => {
    for (const res of data) {
      stmt.run(
        res.race_slug,
        res.event_name,
        res.rank_overall,
        res.bib,
        res.name,
        res.rank_sex,
        res.rank_cat,
        res.time,
        res.speed,
        res.club,
        res.podium,
        res.race_date
      );
    }
  });

  insertMany(allResults);
  console.log(`✅ Successfully saved ${allResults.length} results into database for ${slug}!`);
}

main().catch(console.error);
