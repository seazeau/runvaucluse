const fs = require('fs');
const path = require('path');

const traces = [
  {
    id: '272218',
    url: 'https://tracedetrail.fr/fr/trace/272218',
    name: 'Marathon des Dentelles 42 KM',
    filename: 'traversee-dentelles-42km-marathon.gpx',
    distance: '42 km',
    dplus: '2 000 m D+'
  },
  {
    id: '186487',
    url: 'https://tracedetrail.fr/fr/trace/186487',
    name: 'La Traversée des Dentelles 21 KM',
    filename: 'traversee-dentelles-21km.gpx',
    distance: '21 km',
    dplus: '600 m D+'
  },
  {
    id: '272771',
    url: 'https://tracedetrail.fr/fr/trace/272771',
    name: 'La Gambade 11 KM',
    filename: 'traversee-dentelles-11km-gambade.gpx',
    distance: '11 km',
    dplus: '420 m D+'
  },
  {
    id: '273547',
    url: 'https://tracedetrail.fr/fr/trace/273547',
    name: 'La Petite Gambade 5 KM',
    filename: 'traversee-dentelles-5km-petite-gambade.gpx',
    distance: '5 km',
    dplus: '210 m D+'
  }
];

function mercatorToWgs84(x, y) {
  const R_MAJOR = 20037508.342789244;
  const lon = (x / R_MAJOR) * 180;
  let lat = (y / R_MAJOR) * 180;
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
  return { lon, lat };
}

function buildGpx(name, points) {
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RunVaucluse - TraceDeTrail" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${name}</name>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
`;

  for (const pt of points) {
    const { lon, lat } = mercatorToWgs84(pt.lon, pt.lat);
    const ele = pt.y !== undefined ? pt.y : (pt.y0 !== undefined ? pt.y0 : 0);
    gpx += `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>${ele}</ele></trkpt>\n`;
  }

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

async function processAll() {
  const outputDir = path.join(process.cwd(), 'public', 'itineraires');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const trace of traces) {
    console.log(`\nFetching trace ${trace.id} (${trace.name})...`);
    const res = await fetch(trace.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();

    // Find geometry:"..."
    const geomMatch = html.match(/geometry\s*:\s*"(\[[\s\S]*?\])"/);
    if (!geomMatch) {
      console.error(`❌ Could not find geometry for ${trace.id}`);
      continue;
    }

    const rawJson = geomMatch[1].replace(/\\"/g, '"');
    const points = JSON.parse(rawJson);
    console.log(`✅ Extracted ${points.length} points for ${trace.name}`);

    const gpxContent = buildGpx(trace.name, points);
    const filePath = path.join(outputDir, trace.filename);
    fs.writeFileSync(filePath, gpxContent, 'utf8');
    console.log(`💾 Saved GPX to ${filePath} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
  }
}

processAll();
