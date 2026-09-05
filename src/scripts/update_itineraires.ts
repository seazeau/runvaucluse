import fs from 'fs';
import path from 'path';
import gpxParser from 'gpxparser';

const gpxDir = path.join(process.cwd(), 'public', 'itineraires');
const jsonPath = path.join(process.cwd(), 'src', 'data', 'itineraires.json');

const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const existingSlugs = new Set(existingData.map((item: { slug: string }) => item.slug));

const gpxFiles = fs.readdirSync(gpxDir).filter(file => file.endsWith('.gpx'));

const newData = [...existingData];

gpxFiles.forEach(file => {
  const fileSlug = file.replace('.gpx', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (existingSlugs.has(fileSlug)) return;

  const gpxContent = fs.readFileSync(path.join(gpxDir, file), 'utf8');
  const gpx = new gpxParser();
  gpx.parse(gpxContent);

  const track = gpx.tracks[0];
  if (!track) return;

  const distance = (track.distance.total / 1000).toFixed(1);
  const elevation = Math.round(track.elevation.pos);

  // Extract simplified elevation profile (20 points) for preview
  const samplingRate = Math.max(1, Math.floor(track.points.length / 20));
  const elevationProfile = track.points
    .filter((_, i) => i % samplingRate === 0)
    .map(p => Math.round(p.ele))
    .slice(0, 20);

  const fileName = file.replace('.gpx', '');
  
  // Advanced title formatting
  let title = fileName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    // Split CamelCase (e.g., VillessurAuzon -> Villessur Auzon)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Capitalize each word
    .replace(/\b\w/g, l => l.toUpperCase());

  // Special cleanup for common duplicates or messy names
  if (title.toLowerCase().includes('traildupaty')) return; // Already exists as trail-du-paty
  if (title.toLowerCase() === 'venasque 20k') return; // Already exists as tour-de-venasque-20k

  const slug = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (existingSlugs.has(slug)) return;
  
  let location = 'Vaucluse';
  const parts = fileName.split(/[_-]/);
  if (parts.length > 0) {
    location = parts[0].replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  location = location.charAt(0).toUpperCase() + location.slice(1);

  newData.push({
    slug,
    title,
    location,
    distance: `${distance} km`,
    elevation: `${elevation}m D+`,
    difficulty: elevation > 800 ? 'Expert' : elevation > 400 ? 'Difficile' : 'Modéré',
    image: "", 
    allImages: [],
    elevationProfile, // Added for preview
    gpxLink: `/itineraires/${file}`,
    description: `Découvrez l'itinéraire "${title}". Un parcours de ${distance} km avec ${elevation}m de dénivelé positif à travers les paysages de ${location} et du Vaucluse.`,
    advice: "Prévoyez de l'eau et vérifiez la météo avant de partir."
  });
});

fs.writeFileSync(jsonPath, JSON.stringify(newData, null, 2));
console.log(`Updated ${jsonPath} with ${newData.length - existingData.length} new entries.`);
