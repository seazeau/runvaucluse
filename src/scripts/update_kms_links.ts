import fs from 'fs';
import path from 'path';

const racesPath = path.join(process.cwd(), 'src/data/races.json');
const races = JSON.parse(fs.readFileSync(racesPath, 'utf-8'));

const batch2 = [
  {
    "url": "https://www.kms.fr/v5/public/courses/5375",
    "name": "LA FOULEE DU CEDRE",
    "date": "2026-06-07"
  }
];

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

let updatedCount = 0;

const updatedRaces = races.map((race: any) => {
  const normRaceName = normalize(race.name);
  
  for (const item of batch2) {
    const normItemName = normalize(item.name);
    
    if ((normRaceName.includes(normItemName) || normItemName.includes(normRaceName)) && race.date === item.date) {
      console.log(`Matching ${race.name} -> ${item.url}`);
      updatedCount++;
      return { 
        ...race, 
        registration_link: item.url,
        registration_platform: 'KMS',
        link: item.url
      };
    }
  }
  return race;
});

if (updatedCount > 0) {
  fs.writeFileSync(racesPath, JSON.stringify(updatedRaces, null, 2));
  console.log(`${updatedCount} races updated.`);
} else {
  console.log("No new matches found.");
}
