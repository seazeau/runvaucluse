import * as cheerio from 'cheerio';
import db from '../lib/db';

async function importWiclaxXML(claxUrl: string, race_slug: string) {
    const urlObj = new URL(claxUrl);
    const fParam = urlObj.searchParams.get('f');
    if (!fParam) {
        console.error("Invalid clax URL");
        return;
    }

    const pathPart = fParam.replace('../', '').substring(0, fParam.replace('../', '').lastIndexOf('/') + 1);
    const fileName = fParam.substring(fParam.lastIndexOf('/') + 1);
    
    // Default valid base
    const directClaxUrl = `https://sys04.kms.fr/live/${pathPart}${fileName}`;
    console.log(`Downloading .clax XML from: ${directClaxUrl}`);

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
    };

    db.pragma('foreign_keys = OFF');

    try {
        const res = await fetch(directClaxUrl, { headers });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        
        const xml = await res.text();
        console.log(`✅ Loaded XML (${xml.length} bytes). Parsing...`);

        // Wiclax uses XML format for .clax files
        const $ = cheerio.load(xml, { xmlMode: true });

        // 1. Extract distances
        const races: { [id: string]: string } = {};
        $('Parcours P').each((_, el) => {
            const id = $(el).attr('id') || $(el).attr('nom');
            const name = $(el).attr('nom');
            if (id && name) races[id] = name;
        });

        // Clear existing for this race
        db.prepare('DELETE FROM results WHERE race_slug = ?').run(race_slug);
        let totalImported = 0;
        const tableResults: any[] = [];

        // 2. Extract engagements (participants)
        const competitors: any = {};
        $('E').each((_, el) => {
            const $el = $(el);
            const bib = $el.attr('d');
            if (bib) {
                competitors[bib] = {
                    name: ($el.attr('n') || '').replace(/&#xa0;/g, ' ').replace(/\u00A0/g, ' ').trim(),
                    sex: $el.attr('xx') || $el.attr('x') || '',
                    cat: $el.attr('ca') || '',
                    club: $el.attr('c') || '',
                    parcours: $el.attr('p') || ''
                };
            }
        });

        // 3. Extract results and merge
        // R nodes seem to be ordered by rank, or we can order them by time if needed.
        // Usually, Wiclax groups <R> inside <ClassementsAnnexes> or <Etapes>.
        // Let's assume order of appearance within a specific race context is the rank.
        
        // Let's group results by parcours (race) to calculate ranks properly
        const resultsByParcours: { [p: string]: any[] } = {};

        $('R').each((_, el) => {
            const $el = $(el);
            const bib = $el.attr('d');
            if (!bib || !competitors[bib]) return;

            const comp = competitors[bib];
            const p = comp.parcours;
            if (!resultsByParcours[p]) resultsByParcours[p] = [];

            // Replace Wiclax time format "00h10'55" -> "00:10:55"
            let timeStr = $el.attr('t') || '';
            timeStr = timeStr.replace('h', ':').replace("'", ':');

            let speedStr = $el.attr('m') || '';
            speedStr = speedStr.replace(',', '.');

            resultsByParcours[p].push({
                bib,
                name: comp.name,
                sex: comp.sex,
                cat: comp.cat,
                club: comp.club,
                time: timeStr,
                speed: speedStr ? `${speedStr} km/h` : null,
                rawTime: $el.attr('b') || timeStr // fallback for sorting if needed
            });
        });

        // Insert into DB
        for (const [p, results] of Object.entries(resultsByParcours)) {
            const event_name = races[p] || p || 'Course';
            
            // Sort by time just in case they aren't ordered
            // (Assuming timeStr is sortable, but rawTime is better if present)
            results.sort((a, b) => a.time.localeCompare(b.time));

            // Calculate ranks
            let currentRank = 1;
            const catRanks: { [key: string]: number } = {};
            const sexRanks: { [key: string]: number } = {};

            for (const res of results) {
                if (!catRanks[res.cat]) catRanks[res.cat] = 1;
                if (!sexRanks[res.sex]) sexRanks[res.sex] = 1;

                tableResults.push({
                    race_slug,
                    event_name,
                    rank_overall: currentRank++,
                    bib: res.bib,
                    name: res.name,
                    rank_sex: `${sexRanks[res.sex]++}`,
                    rank_cat: `${catRanks[res.cat]++}`,
                    time: res.time,
                    speed: res.speed,
                    club: res.club,
                    podium: null
                });
            }
        }

        if (tableResults.length > 0) {
            const stmt = db.prepare(`
              INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, podium, speed, club)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const insertMany = db.transaction((data) => {
              for (const res of data) {
                stmt.run(res.race_slug, res.event_name, res.rank_overall, res.bib, res.name, res.rank_sex, res.rank_cat, res.time, res.podium, res.speed, res.club);
              }
            });
            insertMany(tableResults);
            totalImported = tableResults.length;
            console.log(`✅ ${totalImported} résultats importés pour ${race_slug}.`);
        } else {
            console.log("⚠️ Aucun résultat n'a pu être reconstitué.");
        }

    } catch (error) {
        console.error('Error during import:', error);
    }
}

const claxUrl = process.argv[2];
const slug = process.argv[3];
if (!claxUrl || !slug) {
  console.log("Usage: npx tsx src/scripts/import_wiclax_xml.ts <G-LIVE_URL> <race-slug>");
  process.exit(1);
}
importWiclaxXML(claxUrl, slug);
