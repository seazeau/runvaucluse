import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import racesData from '../data/races.json';
import clubsData from '../data/clubs.json';

const DB_PATH = path.join(process.cwd(), 'data', 'races.db');

const db = new Database(DB_PATH);

// Disable foreign keys to allow dropping/recreating tables without breaking results references
db.pragma('foreign_keys = OFF');

// Recreate tables
db.exec(`DROP TABLE IF EXISTS races`);
db.exec(`DROP TABLE IF EXISTS clubs`);

db.exec(`
  CREATE TABLE races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    distances TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_featured INTEGER DEFAULT 0,
    image_url TEXT,
    label TEXT,
    contact TEXT,
    description TEXT,
    facebook TEXT,
    instagram TEXT,
    registration_platform TEXT,
    registration_link TEXT,
    website TEXT,
    pdf_link TEXT,
    parcours_link TEXT,
    gpx_link TEXT,
    is_cancelled INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    website TEXT
  )
`);

// Insert Races
const insertRace = db.prepare(`
  INSERT INTO races (slug, date, name, city, distances, type, link, is_featured, image_url, label, contact, description, facebook, instagram, registration_platform, registration_link, website, pdf_link, parcours_link, gpx_link, is_cancelled)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Insert Clubs
const insertClub = db.prepare(`
  INSERT INTO clubs (name, image_url, website)
  VALUES (?, ?, ?)
`);

const syncDatabase = db.transaction(() => {
  for (const race of racesData) {
    insertRace.run(
        (race as any).slug,
        race.date, 
        race.name, 
        race.city, 
        race.distances, 
        race.type, 
        race.link || '', 
        race.is_featured || 0, 
        race.image_url || null,
        race.label || '',
        race.contact || '',
        race.description || '',
        race.facebook || null,
        race.instagram || null,
        race.registration_platform || null,
        race.registration_link || null,
        race.website || null,
        (race as any).pdf_link || null,
        (race as any).parcours_link || null,
        (race as any).gpx_link || null,
        (race as any).is_cancelled ? 1 : 0
    );
  }

  for (const club of clubsData) {
    insertClub.run(
        club.name,
        club.image_url,
        club.website || null
    );
  }
});

syncDatabase();
console.log(`Database synchronized with ${racesData.length} races and ${clubsData.length} clubs.`);
