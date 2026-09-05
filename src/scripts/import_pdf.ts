import fs from 'fs';
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

function parseFelibres(text: string): ParsedResult[] {
    const results: ParsedResult[] = [];
    const regex = /(\d+)\s+(\d{2}:\d{2}:\d{2})\s+(\d+)\s+([A-Z\s\-']+(?:[A-Z][a-z]+)?)\s+([MF])\s+(\d+)\s+([A-Z0-9]+)\s+(\d+)(?:\s+(.*?))?\s+(\d+\.\d+)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        results.push({
            rank_overall: parseInt(match[1]),
            time: match[2],
            bib: match[3],
            name: match[4].trim(),
            rank_sex: match[6],
            rank_cat: match[7],
            speed: match[10] + " km/h",
            club: (match[9] || "").trim()
        });
    }
    return results;
}

function parseOcres(text: string): ParsedResult[] {
    const results: ParsedResult[] = [];
    // Standard Ocres
    const regex = /(\d+)\s+([^-]+?)\s+(\d+[A-Z0-9]+)\s+(\d+[MF])\s+(\d{2}:\d{2}:\d{2})\s+(\d+\.\d+)\s+n°(\d+)(?:\s+\[\d+\]\s+(.*?))?(?=\s+\d+\s+|$)/g;
    
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
            club: (match[8] || "").trim()
        });
    }

    // Duo Ocres (if empty)
    if (results.length === 0) {
        const duoRegex = /(\d+)\s+(.+?)\s+(\d+)\s*([A-Za-z]+)\s+(\d+)\s*([MFX])\s+(\d{2}:\d{2}:\d{2})\s+(\d+\.\d+)\s+n°(\d+)(?:\s+\[\d+\]\s+(.*?))?(?=\s+\d+\s+|$)/g;
        while ((match = duoRegex.exec(text)) !== null) {
            let name = match[2].trim();
            if (name.length > 100) name = name.substring(0, 100); // Safety limit

            results.push({
                rank_overall: parseInt(match[1]),
                name: name,
                rank_cat: match[4],
                rank_sex: match[6],
                time: match[7],
                speed: match[8] + " km/h",
                bib: match[9],
                club: (match[10] || "").trim()
            });
        }
    }

            return results;
            }

            function parseOrange(text: string): ParsedResult[] {
            const results: ParsedResult[] = [];
            // Example: 1 n°233 LABORIE Jordane 1M 1SE M RUNNING CONSEIL AVIGNON 00:40:55 17.60
            const regex = /(\d+)\s+n°(\d+)\s+(.+?)\s+(\d+[MF])\s+(\d+[A-Z0-9]+)\s+([MFX])\s+(.*?)\s+(\d{2}:\d{2}:\d{2})\s+(\d+\.\d+)/g;

            let match;
            while ((match = regex.exec(text)) !== null) {
            let name = match[3].trim();
            if (name.length > 100) name = name.substring(0, 100);

            results.push({
            rank_overall: parseInt(match[1]),
            bib: match[2],
            name: name,
            rank_sex: match[4],
            rank_cat: match[5],
            club: match[7].trim(),
            time: match[8],
            speed: match[9] + " km/h"
            });
            }
            return results;
            }
async function importPdf(filePath: string, slug: string, eventName: string) {
    console.log(`Processing ${filePath} for ${slug} (${eventName})...`);
    const text = await extractTextFromPdf(filePath);
    
    let parsed: ParsedResult[] = [];
    if (text.includes("foulée") && text.includes("félibres")) {
        parsed = parseFelibres(text);
    } else if (text.includes("OCRES ET LIMONS")) {
        parsed = parseOcres(text);
    } else if (text.includes("Orange")) {
        parsed = parseOrange(text);
    }

    if (parsed.length === 0) {
        console.log(`❌ No results parsed for ${filePath}. Check regex.`);
        return;
    }

    db.pragma('foreign_keys = OFF');
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
    console.log(`✅ Imported ${parsed.length} results.`);
}

async function main() {
    db.pragma('foreign_keys = OFF');
    const jobs = [
        { file: "résultats/La foulée des félibres  course 05Km Édition 2026.pdf", slug: "la-foulee-des-felibres-chateauneuf-de-gadagne", event: "5 km" },
        { file: "résultats/La foulée des félibres  course 13Km Édition 2026.pdf", slug: "la-foulee-des-felibres-chateauneuf-de-gadagne", event: "13 km" },
        { file: "résultats/orangetrail26.pdf", slug: "urban-trail-dorange-orange", event: "12 km" },
        { file: "résultats/resultats_13_km.pdf", slug: "terra-ventoux-ocres-et-limons-mormoiron", event: "13 km" },
        { file: "résultats/resultats_24_km.pdf", slug: "terra-ventoux-ocres-et-limons-mormoiron", event: "24 km" },
        { file: "résultats/resultats_Duo_13_km.pdf", slug: "terra-ventoux-ocres-et-limons-mormoiron", event: "Duo 13 km" }
    ];

    const slugsToClear = Array.from(new Set(jobs.map(j => j.slug)));
    for (const slug of slugsToClear) {
        db.prepare('DELETE FROM results WHERE race_slug = ?').run(slug);
    }

    for (const job of jobs) {
        if (fs.existsSync(job.file)) {
            await importPdf(job.file, job.slug, job.event);
        } else {
            console.log(`File not found: ${job.file}`);
        }
    }
}

main().catch(console.error);
