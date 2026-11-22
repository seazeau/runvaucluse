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

function cleanClub(raw: string): string | null {
  if (!raw) return null;
  let c = raw
    .replace(/Page\s+\d+\/\d+[\s\S]*?(?:Club|$)/gi, '')
    .replace(/GmCAP[\s\S]*?(?:Club|$)/gi, '')
    .replace(/I:\d+\s+D:\d+[\s\S]*?(?:Club|$)/gi, '')
    .replace(/Classement[\s\S]*?(?:Club|$)/gi, '')
    .trim();
  c = c.replace(/^\[\d+\]\s*/, '').trim();
  if (
    c.toLowerCase() === 'non licencié' ||
    c.toLowerCase() === 'non licencie' ||
    c.toLowerCase() === 'nl' ||
    c.length === 0
  ) {
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

async function parseIndividualRace(
  filePath: string,
  slug: string,
  eventName: string,
  raceDate: string
): Promise<ParsedResult[]> {
  const rawText = await extractTextFromPdf(filePath);
  // Strip document header before the first table header, and strip exact repeating page headers
  const headerRe = /Clt\s+Nom\s*-\s*Prénom\s+Nat\s+Doss\.\s+Né\s+CltCat\s+CltSx\s+Temps\s+Moy\.\s+Club\s*/gi;
  const firstHeaderMatch = headerRe.exec(rawText);
  let text = firstHeaderMatch ? rawText.slice(firstHeaderMatch.index + firstHeaderMatch[0].length) : rawText;
  text = text.replace(headerRe, ' ');

  const regex =
    /(\d+)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-'\.\/]+?)\s+([A-Z]{3})\s+n°(\d+)\s+(\d{2})\s+(\d+[A-Za-z0-9]+)\s+(\d+[MFX])\s+(\d{1,2}:\d{2}:\d{2})\s+(\d+\.\d+)/g;

  let match;
  const matches: Array<{
    rank: number;
    name: string;
    bib: string;
    cat: string;
    sexRank: string;
    time: string;
    speed: string;
    index: number;
    endIndex: number;
  }> = [];

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      rank: parseInt(match[1], 10),
      name: match[2].replace(/\s+/g, ' ').trim(),
      bib: match[4],
      cat: match[6],
      sexRank: match[7],
      time: match[8],
      speed: match[9],
      index: match.index,
      endIndex: regex.lastIndex,
    });
  }

  if (matches.length === 0) {
    console.warn(`⚠️ 0 matches for ${filePath}. Sample text:\n`, text.slice(0, 800));
  }

  const results: ParsedResult[] = [];
  for (let i = 0; i < matches.length; i++) {
    const rawClub = text.substring(
      matches[i].endIndex,
      matches[i + 1] ? matches[i + 1].index : matches[i].endIndex + 100
    );
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
      club,
      podium,
      race_date: raceDate,
    });
  }

  return results;
}

async function main() {
  const slug = 'trail-nocturne-de-bonnieux-bonnieux';
  const raceDate = '2026-11-21';
  console.log(`Starting import for ${slug} (${raceDate})...`);

  const jobs = [
    { file: 'résultats/bonnieux_2026_12km.pdf', event: '12 km' },
    { file: 'résultats/bonnieux_2026_25km.pdf', event: '25 km' },
    { file: 'résultats/bonnieux_2026_43km.pdf', event: '43 km' },
  ];

  const allResults: ParsedResult[] = [];

  for (const job of jobs) {
    if (!fs.existsSync(job.file)) {
      console.error(`File missing: ${job.file}`);
      continue;
    }
    const results = await parseIndividualRace(job.file, slug, job.event, raceDate);
    const maxRank = results.length > 0 ? results[results.length - 1].rank_overall : 0;
    console.log(
      `✓ ${job.event}: ${results.length} classés (dernier rang: ${maxRank}) | 1er: ${results[0]?.name} (${results[0]?.time})`
    );
    allResults.push(...results);
  }

  if (allResults.length === 0) {
    throw new Error('No results parsed — aborting DB write.');
  }

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
  db.pragma('wal_checkpoint(TRUNCATE)');
  console.log(`\n✅ Base SQLite mise à jour avec ${allResults.length} résultats pour ${slug} !`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
