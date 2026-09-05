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
    eventName: string;
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

function cleanClub(text: string): string {
    if (!text) return "";
    // Remove page headers and numbers
    // Example: "2 Class Nom Prénom (dossard) Temps Année Sexe Catégorie Moy Club"
    return text
        .replace(/\d+\s+Class Nom Prénom \(dossard\) Temps Année Sexe Catégorie Moy Club/g, "")
        .replace(/Class Nom Prénom \(dossard\) Temps Année Sexe Catégorie Moy Club/g, "")
        .replace(/\d+$/g, "") // Remove trailing page number if any
        .trim();
}

async function importMazan(filePath: string) {
    const slug = "la-mazannaise-des-pompiers-mazan";
    console.log(`Processing ${filePath} for ${slug}...`);
    const text = await extractTextFromPdf(filePath);
    
    // We parse everything in one go
    // Regex captures up to speed. Club is handled after.
    const regex = /(\d+)\.\s+(.+?)\s+\((\d+)\)\s+([\d:]+)\s+\d{4}\s+([MF])\s+Catégorie\s+(.+?)\s+(\d+\.\d+\s+km\/h)/g;
    
    const results: ParsedResult[] = [];
    let match;
    const matches = [];
    while ((match = regex.exec(text)) !== null) {
        if (match[2].includes("Class Nom")) continue;
        matches.push(match);
    }

    let currentEvent = "6,5 km";
    const course145Index = text.indexOf("Course 14,5 km");

    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const index = m.index;

        if (course145Index !== -1 && index > course145Index) {
            currentEvent = "14,5 km";
        }

        // Club is between end of this match and start of next match or "Course 14,5 km"
        const start = m.index + m[0].length;
        let end = (i < matches.length - 1) ? matches[i+1].index : text.length;
        
        // If we are transitioning, don't include the "Course 14,5 km" label in club
        if (currentEvent === "6,5 km" && course145Index !== -1 && course145Index > start && course145Index < end) {
            end = course145Index;
        }

        const rawClub = text.substring(start, end);
        const club = cleanClub(rawClub);

        results.push({
            rank_overall: parseInt(m[1]),
            name: m[2].trim(),
            bib: m[3],
            time: m[4],
            rank_sex: m[5],
            rank_cat: m[6].trim(),
            speed: m[7].trim(),
            club: club,
            eventName: currentEvent
        });
    }

    const results65 = results.filter(r => r.eventName === "6,5 km");
    const results145 = results.filter(r => r.eventName === "14,5 km");

    console.log(`Found ${results65.length} results for 6,5 km`);
    console.log(`Found ${results145.length} results for 14,5 km`);

    if (results.length === 0) {
        console.log("❌ No results found.");
        return;
    }

    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM results WHERE race_slug = ?').run(slug);

    const stmt = db.prepare(`
        INSERT INTO results (race_slug, event_name, rank_overall, bib, name, rank_sex, rank_cat, time, speed, club)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((data) => {
        for (const res of data) {
            stmt.run(slug, res.eventName, res.rank_overall, res.bib, res.name, res.rank_sex, res.rank_cat, res.time, res.speed, res.club);
        }
    });

    insertMany(results);
    console.log(`✅ Success.`);
}

const file = process.argv[2] || "results_trail_world.pdf";
importMazan(file).catch(console.error);
