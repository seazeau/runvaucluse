import { PdfReader } from 'pdfreader';
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

function cleanClub(raw: string): string | null {
  if (!raw) return null;
  let c = raw
    .replace(/Page\s+\d+\/\d+[\s\S]*?(?:Club|$)/gi, '')
    .replace(/GmCAP[\s\S]*?(?:Club|$)/gi, '')
    .replace(/I:\d+\s+D:\d+[\s\S]*?(?:Club|$)/gi, '')
    .trim();
  c = c.replace(/^\[\d+\]\s*/, '').trim();
  if (c.toLowerCase() === 'non licencié' || c.toLowerCase() === 'non licencie' || c.length === 0) {
    return null;
  }
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

async function parseIndividualRace(filePath: string, slug: string, eventName: string): Promise<ParsedResult[]> {
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
    const club = cleanClub(rawClub);
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
      podium: podium
    });
  }

  return results;
}

async function parseDuoRace(filePath: string, slug: string, eventName: string): Promise<ParsedResult[]> {
  const text = await extractTextFromPdf(filePath);
  const cleanText = text.replace(/^[\s\S]*?Clt Nom - Prénom Nat Doss\. Né CltCat CltSx Temps Moy\. Club\s*/, '');
  const duoRegex = /(\d+)\s+(.+?)\s+([A-Z]{3})\s+n°(\d+)\s+(\d+[A-Za-z]+)\s+(\d+[MFX])\s+(\d{1,2}:\d{2}:\d{2})\s+(\d+\.\d+)/g;
  
  let match;
  const matches: any[] = [];
  while ((match = duoRegex.exec(cleanText)) !== null) {
    matches.push({
      rank: parseInt(match[1]),
      name: match[2].trim(),
      bib: match[4],
      cat: match[5],
      sexRank: match[6],
      time: match[7],
      speed: match[8],
      endIndex: duoRegex.lastIndex,
      index: match.index
    });
  }

  const results: ParsedResult[] = [];
  for (let i = 0; i < matches.length; i++) {
    const rawClub = cleanText.substring(matches[i].endIndex, matches[i + 1] ? matches[i + 1].index : matches[i].endIndex + 100);
    const club = cleanClub(rawClub);
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
      podium: podium
    });
  }

  return results;
}

async function main() {
  const slug = 'trail-de-saint-didier-saint-didier';
  console.log(`Starting import for ${slug}...`);

  const jobs = [
    { file: 'résultats/st_didier_9_km.pdf', event: '9 km', isDuo: false },
    { file: 'résultats/st_didier_14_km.pdf', event: '14 km', isDuo: false },
    { file: 'résultats/st_didier_Duo_14_km.pdf', event: 'Duo 14 km', isDuo: true },
    { file: 'résultats/st_didier_27_km.pdf', event: '27 km', isDuo: false },
    { file: 'résultats/st_didier_44_km.pdf', event: '44 km', isDuo: false },
  ];

  const allResults: ParsedResult[] = [];

  for (const job of jobs) {
    if (!fs.existsSync(job.file)) {
      console.error(`File missing: ${job.file}`);
      continue;
    }
    console.log(`Processing ${job.file} (${job.event})...`);
    const results = job.isDuo 
      ? await parseDuoRace(job.file, slug, job.event)
      : await parseIndividualRace(job.file, slug, job.event);
    console.log(`Parsed ${results.length} rows for ${job.event}`);
    allResults.push(...results);
  }

  console.log(`\nTotal results parsed across all distances: ${allResults.length}`);

  db.pragma('foreign_keys = OFF');
  db.prepare('DELETE FROM results WHERE race_slug = ?').run(slug);

  const stmt = db.prepare(`
    INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, speed, club, podium)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        res.podium
      );
    }
  });

  insertMany(allResults);
  console.log(`✅ Database successfully updated with ${allResults.length} records!`);
}

main().catch(console.error);
