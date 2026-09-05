import { PdfReader } from "pdfreader";
import db from '../lib/db';

interface ParsedResult {
    rank_overall: number;
    bib: string;
    name: string;
    rank_sex: string;
    rank_cat: string;
    time: string;
    speed: string | null;
    club: string;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let fullText = "";
        new PdfReader({}).parseFileItems(filePath, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve(fullText);
            else if (item.text) fullText += item.text + " ";
        });
    });
}

function parseNesque(text: string): ParsedResult[] {
    const results: ParsedResult[] = [];
    // Pattern: 1 EUDIER Lilian 1SE 1M 01:15:50 16.62 n°205 [75] Non Licencié
    // It seems some entries don't have the [department] part, like #18
    const regex = /(\d+)\s+([A-Z\s\-']+(?:[A-Z][a-z]+)?)\s+([A-Z0-9]+)\s+([A-Z0-9]+)\s+(\d{2}:\d{2}:\d{2})\s+(\d+\.\d+)\s+n°(\d+)(?:\s+\[\d+\])?\s+(.*?)(?=\s+\d+\s+[A-Z]|$)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        results.push({
            rank_overall: parseInt(match[1]),
            name: match[2].trim(),
            rank_cat: match[3],
            rank_sex: match[4],
            time: match[5],
            speed: match[6] + " km/h",
            bib: match[7],
            club: match[8].trim()
        });
    }
    return results;
}

async function main() {
    const filePath = "résultats/resultats_semi_nesque_2026.pdf";
    const slug = "semi-marathon-des-gorges-de-la-nesque-villes-sur-auzon";
    const eventName = "21 km";

    console.log(`Processing ${filePath}...`);
    const text = await extractTextFromPdf(filePath);
    
    // Clean text a bit: remove Page X/Y and headers that might interfere
    const cleanedText = text.replace(/Page \d+\/\d+/g, "").replace(/Clt Nom - Prénom CltCat CltSx Temps Moy. Doss. Club/g, "");

    const parsed = parseNesque(cleanedText);

    if (parsed.length === 0) {
        console.log(`❌ No results parsed. Check regex.`);
        // Fallback or debug: log a bit of text
        console.log("Sample text:", cleanedText.substring(0, 500));
        return;
    }

    console.log(`Parsed ${parsed.length} results. First one:`, parsed[0]);

    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM results WHERE race_slug = ? AND event_name = ?').run(slug, eventName);

    const stmt = db.prepare(`
        INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, speed, club)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((data) => {
        for (const res of data) {
            stmt.run(slug, eventName, res.rank_overall, res.bib, res.name, res.rank_sex, res.rank_cat, res.time, res.speed, res.club);
        }
    });

    insertMany(parsed);
    console.log(`✅ Successfully updated ${parsed.length} results for Nesque.`);
}

main().catch(console.error);
