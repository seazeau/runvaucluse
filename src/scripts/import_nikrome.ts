import * as cheerio from 'cheerio';
import db from '../lib/db';

async function importNikrome(url: string, race_slug: string) {
  console.log(`Fetching results for ${race_slug} from: ${url}`);
  db.pragma('foreign_keys = OFF');
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Map distance names from the select options
    const distanceMap: { [key: string]: string } = {};
    $('#select-epreuve option').each((i, opt) => {
      const val = $(opt).attr('value');
      const name = $(opt).text().trim();
      if (val) distanceMap[val] = name;
    });

    if (Object.keys(distanceMap).length === 0) {
      console.log("No distances found with #select-epreuve, trying generic option...");
      $('option').each((i, opt) => {
        const val = $(opt).attr('value');
        const name = $(opt).text().trim();
        if (val && !isNaN(parseInt(val))) distanceMap[val] = name;
      });
    }

    console.log("Detected distances:", distanceMap);

    // Clear existing
    db.prepare('DELETE FROM results WHERE race_slug = ?').run(race_slug);

    let totalImported = 0;

    // Tables are id="table_epreuve_X"
    for (const [id, event_name] of Object.entries(distanceMap)) {
      const table = $(`#table_epreuve_${id}`);
      if (table.length === 0) {
        console.log(`Table not found for ID ${id} (${event_name})`);
        continue;
      }

      console.log(`Processing ${event_name} (ID: ${id})...`);

      const rows = table.find('tbody tr');
      const tableResults: any[] = [];

      rows.each((j, row) => {
        const cols = $(row).find('td');
        if (cols.length >= 6) {
          const rankText = $(cols[0]).text().trim();
          const rank = parseInt(rankText);
          if (isNaN(rank)) return;

          tableResults.push({
            race_slug,
            event_name,
            rank_overall: rank,
            bib: $(cols[1]).text().trim(),
            name: $(cols[2]).text().trim(),
            rank_sex: $(cols[3]).text().trim(),
            rank_cat: $(cols[4]).text().trim(),
            time: $(cols[5]).text().trim(),
            podium: $(cols[6]).text().trim() || null,
            speed: $(cols[7]).text().trim() || null,
            club: $(cols[8]).text().trim() || null,
            });
        }
      });

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
        totalImported += tableResults.length;
        console.log(`Imported ${tableResults.length} rows for ${event_name}`);
      }
    }

    console.log(`\nSUCCESS: Total ${totalImported} results imported for ${race_slug}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

const url = process.argv[2];
const slug = process.argv[3];
if (!url || !slug) {
  console.log("Usage: npx tsx src/scripts/import_nikrome.ts <URL> <race-slug>");
  process.exit(1);
}
importNikrome(url, slug);
