const fs = require('fs');
const path = require('path');

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

function buildKml(name, points) {
  let coords = [];
  for (const pt of points) {
    const { lon, lat } = mercatorToWgs84(pt.lon, pt.lat);
    const ele = pt.y !== undefined ? pt.y : (pt.y0 !== undefined ? pt.y0 : 0);
    coords.push(`${lon.toFixed(6)},${lat.toFixed(6)},${ele}`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <Style id="trailLine">
      <LineStyle>
        <color>ff0055ff</color>
        <width>5</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>${name}</name>
      <styleUrl>#trailLine</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>clampToGround</altitudeMode>
        <coordinates>
          ${coords.join('\n          ')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
}

async function run() {
  const url = 'https://tracedetrail.fr/fr/trace/315288';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  const geomMatch = html.match(/geometry\s*:\s*"(\[[\s\S]*?\])"/);
  if (!geomMatch) {
    console.error('Geometry not found');
    return;
  }

  const points = JSON.parse(geomMatch[1].replace(/\\"/g, '"'));
  console.log(`Extracted ${points.length} points!`);

  const gpx = buildGpx('TMV - Les Crêtes de Valescure 43 KM', points);
  const kml = buildKml('TMV - Les Crêtes de Valescure 43 KM', points);

  const gpxPath = path.join('public', 'itineraires', 'tmv-valescure-43km.gpx');
  const kmlPath = path.join('public', 'itineraires', 'tmv-valescure-43km.kml');

  fs.writeFileSync(gpxPath, gpx, 'utf8');
  fs.writeFileSync(kmlPath, kml, 'utf8');

  console.log('Saved GPX:', gpxPath, `(${(fs.statSync(gpxPath).size / 1024).toFixed(1)} KB)`);
  console.log('Saved KML:', kmlPath, `(${(fs.statSync(kmlPath).size / 1024).toFixed(1)} KB)`);
}

run();
