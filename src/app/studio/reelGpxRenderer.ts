export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
  distKm: number; // cumulative distance in km
  cumDplus: number; // cumulative D+ in meters
  gradePct: number; // local gradient %
}

export interface ParsedGpxTrack {
  points: GpxPoint[];
  totalDistKm: number;
  totalDplus: number;
  minEle: number;
  maxEle: number;
  summitIndex: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface GpxReelConfig {
  title: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
  overrideDistKm?: number | null;
  overrideDplus?: number | null;
  bgStyle: 'satellite' | 'darkmap' | 'topo' | 'photo';
  bgImage?: HTMLImageElement | null;
}

export interface GpxPresetItem {
  id: string;
  category: 'Course Officielle' | 'Itinéraire Trail 84';
  title: string;
  location: string;
  subtitle: string;
  gpxUrl: string;
  officialDistKm: number;
  officialDplus: number;
  imageUrl?: string;
}

export const GPX_PRESETS: GpxPresetItem[] = [
  // COURSES OFFICIELLES
  {
    id: 'tmv-valescure-43k',
    category: 'Course Officielle',
    title: 'TRAIL DES MONTS DE VAUCLUSE',
    location: 'Saumane-de-Vaucluse',
    subtitle: 'LES CRÊTES DE VALESCURE • SAUMANE',
    gpxUrl: '/itineraires/tmv-valescure-43km.gpx',
    officialDistKm: 43.0,
    officialDplus: 1550,
    imageUrl: '/images/tmv-2026.jpg'
  },
  {
    id: 'dentelles-42k',
    category: 'Course Officielle',
    title: 'MARATHON DES DENTELLES',
    location: 'Gigondas',
    subtitle: 'LA TRAVERSÉE DES DENTELLES • GIGONDAS',
    gpxUrl: '/itineraires/traversee-dentelles-42km-marathon.gpx',
    officialDistKm: 42.0,
    officialDplus: 2000
  },
  {
    id: 'dentelles-21k',
    category: 'Course Officielle',
    title: 'TRAVERSÉE DES DENTELLES 21K',
    location: 'Gigondas',
    subtitle: 'GIGONDAS • DENTELLES DE MONTMIRAIL',
    gpxUrl: '/itineraires/traversee-dentelles-21km.gpx',
    officialDistKm: 21.0,
    officialDplus: 600
  },
  {
    id: 'dentelles-11k',
    category: 'Course Officielle',
    title: 'LA GAMBADE DES DENTELLES',
    location: 'Gigondas',
    subtitle: 'PARCOURS 11 KM • GIGONDAS',
    gpxUrl: '/itineraires/traversee-dentelles-11km-gambade.gpx',
    officialDistKm: 11.0,
    officialDplus: 420
  },
  {
    id: 'dentelles-5k',
    category: 'Course Officielle',
    title: 'LA PETITE GAMBADE 5K',
    location: 'Gigondas',
    subtitle: 'TRAVERSÉE DES DENTELLES • GIGONDAS',
    gpxUrl: '/itineraires/traversee-dentelles-5km-petite-gambade.gpx',
    officialDistKm: 5.0,
    officialDplus: 210
  },
  {
    id: 'monts-de-mathias',
    category: 'Course Officielle',
    title: 'TRAIL LES MONTS DE MATHIAS',
    location: 'Saint-Didier',
    subtitle: 'SAINT-DIDIER • MONTS DE VAUCLUSE',
    gpxUrl: '/itineraires/les-monts-de-mathias.gpx',
    officialDistKm: 13.8,
    officialDplus: 400
  },
  {
    id: 'marathon-avignon',
    category: 'Course Officielle',
    title: "MARATHON D'AVIGNON",
    location: 'Avignon',
    subtitle: 'CITÉ DES PAPES • PARCOURS OFFICIEL 42.195 KM',
    gpxUrl: '/itineraires/marathon-avignon.gpx',
    officialDistKm: 42.2,
    officialDplus: 185
  },
  {
    id: 'semi-avignon',
    category: 'Course Officielle',
    title: "SEMI-MARATHON D'AVIGNON",
    location: 'Avignon',
    subtitle: 'AVIGNON • PARCOURS OFFICIEL 21.1 KM',
    gpxUrl: '/itineraires/semi-marathon-avignon.gpx',
    officialDistKm: 21.1,
    officialDplus: 95
  },

  // ITINÉRAIRES TRAIL 84
  {
    id: 'trail-du-paty',
    category: 'Itinéraire Trail 84',
    title: 'TRAIL DU LAC DU PATY',
    location: 'Caromb',
    subtitle: 'CAROMB • CRÊTES & PIÉMONT DU VENTOUX',
    gpxUrl: '/itineraires/Traildupaty.gpx',
    officialDistKm: 15.0,
    officialDplus: 650,
    imageUrl: '/itineraires/images/paty1.jpg'
  },
  {
    id: 'boucle-saint-didier',
    category: 'Itinéraire Trail 84',
    title: 'BOUCLE TRAIL SAINT-DIDIER',
    location: 'Saint-Didier',
    subtitle: 'SAINT-DIDIER • TERRITOIRE MOLLETS PÉTILLANTS',
    gpxUrl: '/itineraires/Boucle 12k Saint didier.gpx',
    officialDistKm: 12.0,
    officialDplus: 350,
    imageUrl: '/itineraires/images/saintdidier1.jpg'
  },
  {
    id: 'tour-de-venasque-20k',
    category: 'Itinéraire Trail 84',
    title: 'TOUR DE VENASQUE 20K',
    location: 'Venasque',
    subtitle: 'VENASQUE • COMBES & CRÊTES SAUVAGES',
    gpxUrl: '/itineraires/VENASQUE 20K.gpx',
    officialDistKm: 20.2,
    officialDplus: 720,
    imageUrl: '/itineraires/images/venasque1.jpg'
  },
  {
    id: 'montee-seche-ventoux',
    category: 'Itinéraire Trail 84',
    title: 'MONTÉE SÈCHE DU VENTOUX',
    location: 'Bédoin',
    subtitle: 'BÉDOIN ➔ SOMMET DU GÉANT DE PROVENCE',
    gpxUrl: '/itineraires/Bedoin-trail-montee-seche-du-ventoux.gpx',
    officialDistKm: 15.8,
    officialDplus: 1610
  },
  {
    id: 'grand-ventoux-bedoin',
    category: 'Itinéraire Trail 84',
    title: 'GRAND TOUR DU MONT VENTOUX',
    location: 'Bédoin',
    subtitle: 'BÉDOIN • ULTRA TOUR DU GÉANT (60 KM)',
    gpxUrl: '/itineraires/Bedoin-trail-grand-ventoux1.gpx',
    officialDistKm: 59.7,
    officialDplus: 2850
  },
  {
    id: 'methamis-mur-peste',
    category: 'Itinéraire Trail 84',
    title: 'TRAIL DU MUR DE LA PESTE',
    location: 'Méthamis',
    subtitle: 'MÉTHAMIS • GORGES DE LA NESQUE',
    gpxUrl: '/itineraires/Methamis_Trail_MurPeste.gpx',
    officialDistKm: 17.5,
    officialDplus: 680
  },
  {
    id: 'nesque-venasque',
    category: 'Itinéraire Trail 84',
    title: 'GORGES DE LA NESQUE & VENASQUE',
    location: 'Venasque',
    subtitle: 'MONTS DE VAUCLUSE • PARCOURS PANORAMIQUE',
    gpxUrl: '/itineraires/NEsque_venasque.gpx',
    officialDistKm: 22.8,
    officialDplus: 790
  },
  {
    id: 'saint-gens',
    category: 'Itinéraire Trail 84',
    title: 'TRAIL DE SAINT-GENS & LE BEAUCET',
    location: 'Le Beaucet',
    subtitle: 'ERMITAGE DE SAINT-GENS • MONTS DE VAUCLUSE',
    gpxUrl: '/itineraires/Saint _Gens.gpx',
    officialDistKm: 17.6,
    officialDplus: 640
  },
  {
    id: 'flassan-chapelle',
    category: 'Itinéraire Trail 84',
    title: 'TRAIL CHAPELLE SAINT-JEAN',
    location: 'Flassan',
    subtitle: 'FLASSAN • PIÉMONT DU MONT VENTOUX',
    gpxUrl: '/itineraires/Flassan_Trail_chapelleStJean.gpx',
    officialDistKm: 14.5,
    officialDplus: 620
  },
  {
    id: 'villes-sur-auzon',
    category: 'Itinéraire Trail 84',
    title: "COMBE DE L'ERMITAGE",
    location: 'Villes-sur-Auzon',
    subtitle: 'VILLES-SUR-AUZON • PIÉMONT DU VENTOUX',
    gpxUrl: '/itineraires/VillessurAuzon_Trail_CombeErmitage.gpx',
    officialDistKm: 12.2,
    officialDplus: 440
  },
  {
    id: 'mormoiron-limon',
    category: 'Itinéraire Trail 84',
    title: 'MORMOIRON LIMON TRAIL',
    location: 'Mormoiron',
    subtitle: 'MORMOIRON • OCRES & VENTOUX',
    gpxUrl: '/itineraires/Mormoiron Limon Trail.gpx',
    officialDistKm: 13.5,
    officialDplus: 360
  },
  {
    id: 'sault-lavandes',
    category: 'Itinéraire Trail 84',
    title: 'LAVANDES DES HAUTEURS',
    location: 'Sault',
    subtitle: 'SAULT • PLATEAU D’ALBION & VENTOUX',
    gpxUrl: '/itineraires/Sault_Trail_LavandesdesHauteurs.gpx',
    officialDistKm: 20.6,
    officialDplus: 520
  }
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGpxXml(xmlText: string, targetPointsCount = 360): ParsedGpxTrack | null {
  try {
    const rawPoints: { lat: number; lon: number; ele: number; distKm: number }[] = [];

    // Fast regex extraction that handles both <trkpt> and <rtept>
    const ptRegex = /<(?:trkpt|rtept)\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:trkpt|rtept)>/gi;
    let match: RegExpExecArray | null;
    let cumDist = 0;

    while ((match = ptRegex.exec(xmlText)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (isNaN(lat) || isNaN(lon)) continue;

      const inner = match[3] || '';
      const eleMatch = inner.match(/<ele>([^<]+)<\/ele>/i);
      const ele = eleMatch ? parseFloat(eleMatch[1]) : 0;

      if (rawPoints.length > 0) {
        const prev = rawPoints[rawPoints.length - 1];
        const d = haversineKm(prev.lat, prev.lon, lat, lon);
        // Skip duplicate stationary points
        if (d < 0.0005) continue;
        cumDist += d;
      }

      rawPoints.push({
        lat,
        lon,
        ele: isNaN(ele) ? 0 : ele,
        distKm: cumDist
      });
    }

    // Fallback for self-closing <trkpt lat="..." lon="..." /> without inner tags
    if (rawPoints.length < 2) {
      const selfClosingRegex = /<(?:trkpt|rtept)\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*\/?>/gi;
      cumDist = 0;
      while ((match = selfClosingRegex.exec(xmlText)) !== null) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (isNaN(lat) || isNaN(lon)) continue;
        if (rawPoints.length > 0) {
          const prev = rawPoints[rawPoints.length - 1];
          const d = haversineKm(prev.lat, prev.lon, lat, lon);
          if (d < 0.0005) continue;
          cumDist += d;
        }
        rawPoints.push({ lat, lon, ele: 100, distKm: cumDist });
      }
    }

    if (rawPoints.length < 2) return null;

    const totalDistKm = rawPoints[rawPoints.length - 1].distKm;

    // Resample evenly by distance into `targetPointsCount` points for silky-smooth animation
    const sampled: { lat: number; lon: number; ele: number; distKm: number }[] = [];
    let rawIdx = 0;

    for (let i = 0; i < targetPointsCount; i++) {
      const targetDist = (i / (targetPointsCount - 1)) * totalDistKm;
      while (rawIdx < rawPoints.length - 2 && rawPoints[rawIdx + 1].distKm < targetDist) {
        rawIdx++;
      }
      const p1 = rawPoints[rawIdx];
      const p2 = rawPoints[Math.min(rawPoints.length - 1, rawIdx + 1)];
      const span = p2.distKm - p1.distKm;
      const ratio = span > 0.00001 ? Math.max(0, Math.min(1, (targetDist - p1.distKm) / span)) : 0;

      sampled.push({
        lat: p1.lat + (p2.lat - p1.lat) * ratio,
        lon: p1.lon + (p2.lon - p1.lon) * ratio,
        ele: p1.ele + (p2.ele - p1.ele) * ratio,
        distKm: targetDist
      });
    }

    // Smooth elevation with a 5-point moving average to remove GPS vertical spikes
    const smoothedEle = sampled.map((_, idx) => {
      let sum = 0;
      let cnt = 0;
      for (let k = -3; k <= 3; k++) {
        const j = idx + k;
        if (j >= 0 && j < sampled.length) {
          sum += sampled[j].ele;
          cnt++;
        }
      }
      return sum / cnt;
    });

    // Compute cumulative D+, bounds, min/max elevation, summit index
    let cumDplus = 0;
    let minEle = Infinity;
    let maxEle = -Infinity;
    let summitIndex = 0;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;

    const finalPoints: GpxPoint[] = [];

    for (let i = 0; i < sampled.length; i++) {
      const ele = smoothedEle[i];
      if (i > 0) {
        const diff = ele - smoothedEle[i - 1];
        if (diff > 0) {
          cumDplus += diff;
        }
      }

      if (ele < minEle) minEle = ele;
      if (ele > maxEle) {
        maxEle = ele;
        summitIndex = i;
      }

      const { lat, lon, distKm } = sampled[i];
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;

      let gradePct = 0;
      if (i > 0) {
        const dMeters = (distKm - sampled[i - 1].distKm) * 1000;
        if (dMeters > 1) {
          gradePct = ((ele - smoothedEle[i - 1]) / dMeters) * 100;
        }
      }

      finalPoints.push({
        lat,
        lon,
        ele: Math.round(ele),
        distKm,
        cumDplus: Math.round(cumDplus),
        gradePct
      });
    }

    return {
      points: finalPoints,
      totalDistKm: Math.round(totalDistKm * 10) / 10,
      totalDplus: Math.round(cumDplus),
      minEle: Math.round(minEle),
      maxEle: Math.round(maxEle),
      summitIndex,
      bounds: { minLat, maxLat, minLon, maxLon }
    };
  } catch (err) {
    console.error('Failed to parse GPX XML:', err);
    return null;
  }
}

// Map Tile helper for Satellite / DarkMap background
function lon2tile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

function lat2tile(lat: number, zoom: number): number {
  return (
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, zoom)
  );
}

export async function renderMapTilesCanvas(
  bounds: ParsedGpxTrack['bounds'],
  style: 'satellite' | 'darkmap',
  targetW = 920,
  targetH = 820
): Promise<HTMLCanvasElement | null> {
  if (typeof window === 'undefined') return null;

  try {
    const latSpan = Math.max(0.005, bounds.maxLat - bounds.minLat);
    const lonSpan = Math.max(0.005, bounds.maxLon - bounds.minLon);

    // Add 25% padding around track bounds
    const padLat = latSpan * 0.25;
    const padLon = lonSpan * 0.25;
    const minLat = bounds.minLat - padLat;
    const maxLat = bounds.maxLat + padLat;
    const minLon = bounds.minLon - padLon;
    const maxLon = bounds.maxLon + padLon;

    // Pick zoom level (typically 12 to 14) so track fits within ~3x3 tiles
    let zoom = 13;
    for (let z = 15; z >= 10; z--) {
      const x1 = lon2tile(minLon, z);
      const x2 = lon2tile(maxLon, z);
      const y1 = lat2tile(maxLat, z);
      const y2 = lat2tile(minLat, z);
      if (Math.abs(x2 - x1) <= 3.2 && Math.abs(y2 - y1) <= 3.2) {
        zoom = z;
        break;
      }
    }

    const xMinExact = lon2tile(minLon, zoom);
    const xMaxExact = lon2tile(maxLon, zoom);
    const yMinExact = lat2tile(maxLat, zoom);
    const yMaxExact = lat2tile(minLat, zoom);

    const tileXStart = Math.floor(xMinExact);
    const tileXEnd = Math.floor(xMaxExact);
    const tileYStart = Math.floor(yMinExact);
    const tileYEnd = Math.floor(yMaxExact);

    const tileSize = 256;
    const gridW = (tileXEnd - tileXStart + 1) * tileSize;
    const gridH = (tileYEnd - tileYStart + 1) * tileSize;

    const stitchCanvas = document.createElement('canvas');
    stitchCanvas.width = gridW;
    stitchCanvas.height = gridH;
    const sCtx = stitchCanvas.getContext('2d');
    if (!sCtx) return null;

    const loadTile = (tx: number, ty: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const url =
          style === 'satellite'
            ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${tx}`
            : `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${tx}/${ty}.png`;

        const timer = setTimeout(() => resolve(), 2500);
        img.onload = () => {
          clearTimeout(timer);
          sCtx.drawImage(
            img,
            (tx - tileXStart) * tileSize,
            (ty - tileYStart) * tileSize,
            tileSize,
            tileSize
          );
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
        img.src = url;
      });

    const promises: Promise<void>[] = [];
    for (let tx = tileXStart; tx <= tileXEnd; tx++) {
      for (let ty = tileYStart; ty <= tileYEnd; ty++) {
        promises.push(loadTile(tx, ty));
      }
    }
    await Promise.all(promises);

    // Output cropped canvas matching target aspect ratio
    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    const oCtx = outCanvas.getContext('2d');
    if (!oCtx) return null;

    oCtx.drawImage(stitchCanvas, 0, 0, gridW, gridH, 0, 0, targetW, targetH);
    return outCanvas;
  } catch {
    return null;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawGpxReelFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // 0.0 to 10.0 seconds
  track: ParsedGpxTrack,
  config: GpxReelConfig,
  mapTileCanvas?: HTMLCanvasElement | null
) {
  const duration = 10.0;
  const displayDistTotal =
    config.overrideDistKm && config.overrideDistKm > 0
      ? config.overrideDistKm
      : track.totalDistKm;
  const displayDplusTotal =
    config.overrideDplus && config.overrideDplus > 0
      ? config.overrideDplus
      : track.totalDplus;

  const distScale = track.totalDistKm > 0 ? displayDistTotal / track.totalDistKm : 1;
  const dplusScale = track.totalDplus > 0 ? displayDplusTotal / track.totalDplus : 1;

  // Animation progress of the runner along the GPX trace:
  // 0.0s -> 0.8s : Intro / Ready on Start Line (progress = 0)
  // 0.8s -> 8.2s : Smooth eased progression from 0% to 100%
  // 8.2s -> 10.0s : Finish reached (progress = 100%) + Final CTA
  let rawRunProg = 0;
  if (t <= 0.8) {
    rawRunProg = 0;
  } else if (t >= 8.2) {
    rawRunProg = 1;
  } else {
    const lin = (t - 0.8) / (8.2 - 0.8);
    // Smooth cubic ease-in-out mixed with linear so speed feels natural
    const eased = lin < 0.5 ? 2 * lin * lin : 1 - Math.pow(-2 * lin + 2, 2) / 2;
    rawRunProg = lin * 0.65 + eased * 0.35;
  }

  const pts = track.points;
  const maxIdx = pts.length - 1;
  const exactIdx = rawRunProg * maxIdx;
  const curIdx = Math.min(maxIdx, Math.floor(exactIdx));
  const nextIdx = Math.min(maxIdx, curIdx + 1);
  const subFrac = exactIdx - curIdx;

  const pCur = pts[curIdx];
  const pNext = pts[nextIdx];
  const curLat = pCur.lat + (pNext.lat - pCur.lat) * subFrac;
  const curLon = pCur.lon + (pNext.lon - pCur.lon) * subFrac;
  const curEle = Math.round(pCur.ele + (pNext.ele - pCur.ele) * subFrac);
  const curDistKm = (pCur.distKm + (pNext.distKm - pCur.distKm) * subFrac) * distScale;
  const curDplus = Math.round(
    (pCur.cumDplus + (pNext.cumDplus - pCur.cumDplus) * subFrac) * dplusScale
  );

  // ==========================================
  // 1. BACKGROUND LAYER
  // ==========================================
  const bgGrad = ctx.createRadialGradient(w / 2, h * 0.35, 80, w / 2, h / 2, h * 0.85);
  bgGrad.addColorStop(0, '#161D24');
  bgGrad.addColorStop(0.55, '#0D1115');
  bgGrad.addColorStop(1, '#07090B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Optional Full Background Photo with subtle Ken Burns zoom
  if (config.bgStyle === 'photo' && config.bgImage) {
    ctx.save();
    const zoom = 1.04 + (t / duration) * 0.08;
    const imgW = config.bgImage.width || 1080;
    const imgH = config.bgImage.height || 1920;
    const scale = Math.max(w / imgW, h / imgH) * zoom;
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    ctx.globalAlpha = 0.28;
    ctx.drawImage(config.bgImage, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
    ctx.restore();

    const darkOverlay = ctx.createLinearGradient(0, 0, 0, h);
    darkOverlay.addColorStop(0, 'rgba(7, 9, 11, 0.85)');
    darkOverlay.addColorStop(0.45, 'rgba(13, 17, 21, 0.55)');
    darkOverlay.addColorStop(1, 'rgba(7, 9, 11, 0.94)');
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, w, h);
  }

  // Ambient Neon Orbs
  ctx.save();
  const orb1 = ctx.createRadialGradient(w * 0.85, h * 0.14, 10, w * 0.85, h * 0.14, 460);
  orb1.addColorStop(0, 'rgba(246, 200, 59, 0.18)');
  orb1.addColorStop(1, 'rgba(246, 200, 59, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, w, h);

  const orb2 = ctx.createRadialGradient(w * 0.15, h * 0.78, 10, w * 0.15, h * 0.78, 500);
  orb2.addColorStop(0, 'rgba(235, 94, 40, 0.18)');
  orb2.addColorStop(1, 'rgba(235, 94, 40, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Topographic / Radar Grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(250, 247, 242, 0.03)';
  ctx.lineWidth = 1;
  const gridStep = 90;
  for (let x = gridStep; x < w; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridStep; y < h; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  // ==========================================
  // 2. TOP PROGRESS BAR & BRAND HEADER
  // ==========================================
  const progress = Math.min(1, t / duration);
  const pGrad = ctx.createLinearGradient(0, 0, w, 0);
  pGrad.addColorStop(0, '#EB5E28');
  pGrad.addColorStop(1, '#F6C83B');
  ctx.fillStyle = pGrad;
  ctx.fillRect(0, 0, w * progress, 12);

  ctx.save();
  ctx.fillStyle = '#FAF7F2';
  ctx.font = '900 46px "Bebas Neue", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⚡ RUNVAUCLUSE', 72, 102);

  // Top-right Badge
  const badgeText = config.badgeText || 'TRACÉ GPX OFFICIEL 🗺️';
  ctx.font = '800 20px system-ui, sans-serif';
  const badgeW = Math.max(300, ctx.measureText(badgeText).width + 54);
  const badgeH = 46;
  const badgeX = w - 72 - badgeW;
  const badgeY = 66;

  ctx.fillStyle = 'rgba(246, 200, 59, 0.14)';
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F6C83B';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 30);
  ctx.restore();

  // ==========================================
  // 3. TITLE & SUBTITLE BLOCK
  // ==========================================
  ctx.save();
  ctx.textAlign = 'center';

  // Subtitle pill
  ctx.fillStyle = '#EB5E28';
  ctx.font = '800 23px system-ui, sans-serif';
  ctx.fillText((config.subtitle || 'PARCOURS VAUCLUSE 84').toUpperCase(), w / 2, 168);

  // Main Race / Route Title (Auto-fit font size if long)
  const titleUpper = (config.title || 'TRACÉ GPX').toUpperCase();
  let titleFontSize = 82;
  if (titleUpper.length > 26) titleFontSize = 66;
  if (titleUpper.length > 34) titleFontSize = 56;

  ctx.fillStyle = '#FAF7F2';
  ctx.font = `italic 900 ${titleFontSize}px "Bebas Neue", Impact, sans-serif`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText(titleUpper, w / 2, 245);
  ctx.shadowBlur = 0;

  // Summary Pills Row (Total KM • Total D+ • Max Altitude)
  const pillsY = 274;
  const summaryText = `🏃 ${displayDistTotal.toFixed(1)} KM     ⛰️ +${displayDplusTotal} M D+     🏔️ MAX ${track.maxEle} M`;
  ctx.fillStyle = 'rgba(250, 247, 242, 0.08)';
  ctx.strokeStyle = 'rgba(250, 247, 242, 0.18)';
  ctx.lineWidth = 1.5;
  const sumW = 680;
  roundRect(ctx, (w - sumW) / 2, pillsY, sumW, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.fillText(summaryText, w / 2, pillsY + 32);
  ctx.restore();

  // ==========================================
  // 4. MAP BOX & ANIMATED GPX TRACE (CENTER)
  // ==========================================
  const mapX = 72;
  const mapY = 348;
  const mapW = w - 144; // 936px
  const mapH = 820;

  ctx.save();
  // Map Card Frame
  ctx.fillStyle = '#0B0E12';
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.35)';
  ctx.lineWidth = 3;
  roundRect(ctx, mapX, mapY, mapW, mapH, 28);
  ctx.fill();

  // Clip inside map card
  ctx.save();
  roundRect(ctx, mapX, mapY, mapW, mapH, 28);
  ctx.clip();

  // Draw Satellite / DarkMap tiles if available
  if (mapTileCanvas && (config.bgStyle === 'satellite' || config.bgStyle === 'darkmap')) {
    ctx.globalAlpha = config.bgStyle === 'satellite' ? 0.55 : 0.85;
    ctx.drawImage(mapTileCanvas, mapX, mapY, mapW, mapH);
    ctx.globalAlpha = 1;

    // Vignette inside map card for high contrast with neon trace
    const mapVig = ctx.createRadialGradient(
      mapX + mapW / 2,
      mapY + mapH / 2,
      mapW * 0.2,
      mapX + mapW / 2,
      mapY + mapH / 2,
      mapW * 0.65
    );
    mapVig.addColorStop(0, 'rgba(11, 14, 18, 0.1)');
    mapVig.addColorStop(1, 'rgba(11, 14, 18, 0.72)');
    ctx.fillStyle = mapVig;
    ctx.fillRect(mapX, mapY, mapW, mapH);
  } else {
    // Stylized Topographic Rings Background inside Map Card
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.05)';
    ctx.lineWidth = 1.5;
    for (let r = 80; r < 600; r += 65) {
      ctx.beginPath();
      ctx.ellipse(
        mapX + mapW * 0.52,
        mapY + mapH * 0.48,
        r * 1.15,
        r * 0.8,
        0.35,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // Coordinate projection from (lat, lon) to map box with aspect ratio preservation
  const { minLat, maxLat, minLon, maxLon } = track.bounds;
  const meanLatRad = (((minLat + maxLat) / 2) * Math.PI) / 180;
  const cosLat = Math.cos(meanLatRad);

  const worldW = Math.max(0.0005, (maxLon - minLon) * cosLat);
  const worldH = Math.max(0.0005, maxLat - minLat);

  const padPx = 95;
  const availW = mapW - padPx * 2;
  const availH = mapH - padPx * 2;
  const scale = Math.min(availW / worldW, availH / worldH);

  const projW = worldW * scale;
  const projH = worldH * scale;
  const offsetX = mapX + (mapW - projW) / 2;
  const offsetY = mapY + (mapH - projH) / 2;

  const toScreen = (lat: number, lon: number): [number, number] => {
    const sx = offsetX + (lon - minLon) * cosLat * scale;
    const sy = offsetY + (maxLat - lat) * scale;
    return [sx, sy];
  };

  // 4A. Draw Full Ghost Track (Unvisited path)
  ctx.beginPath();
  pts.forEach((p, idx) => {
    const [sx, sy] = toScreen(p.lat, p.lon);
    if (idx === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.strokeStyle = 'rgba(250, 247, 242, 0.18)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 4B. Draw Active Illuminated Track up to current runner position
  if (exactIdx > 0) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= curIdx; i++) {
      const [sx, sy] = toScreen(pts[i].lat, pts[i].lon);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    const [curSx, curSy] = toScreen(curLat, curLon);
    ctx.lineTo(curSx, curSy);

    // Outer Neon Glow
    ctx.shadowColor = '#EB5E28';
    ctx.shadowBlur = 24;
    const traceGrad = ctx.createLinearGradient(mapX, mapY, mapX + mapW, mapY + mapH);
    traceGrad.addColorStop(0, '#EB5E28');
    traceGrad.addColorStop(0.5, '#F6C83B');
    traceGrad.addColorStop(1, '#EB5E28');
    ctx.strokeStyle = traceGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner bright core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFF5D6';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }

  // 4C. Start Marker (Green Pill)
  const [startSx, startSy] = toScreen(pts[0].lat, pts[0].lon);
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(startSx, startSy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0B0E12';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4D. Summit Marker (Appears once runner reaches summit or during full preview)
  const summitPt = pts[track.summitIndex];
  if (summitPt && (curIdx >= track.summitIndex || t >= 8.0)) {
    const [sumSx, sumSy] = toScreen(summitPt.lat, summitPt.lon);
    ctx.save();
    ctx.fillStyle = '#EB5E28';
    ctx.beginPath();
    ctx.arc(sumSx, sumSy, 8, 0, Math.PI * 2);
    ctx.fill();

    const lbl = `⛰️ ${track.maxEle}m`;
    ctx.font = '800 18px system-ui, sans-serif';
    const lw = ctx.measureText(lbl).width + 22;
    const lx = Math.max(mapX + 16, Math.min(mapX + mapW - lw - 16, sumSx - lw / 2));
    const ly = Math.max(mapY + 16, sumSy - 42);

    ctx.fillStyle = 'rgba(13, 17, 21, 0.9)';
    ctx.strokeStyle = '#EB5E28';
    ctx.lineWidth = 2;
    roundRect(ctx, lx, ly, lw, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    ctx.textAlign = 'center';
    ctx.fillText(lbl, lx + lw / 2, ly + 21);
    ctx.restore();
  }

  // 4E. Finish Marker when near end
  if (rawRunProg >= 0.96) {
    const lastPt = pts[maxIdx];
    const [endSx, endSy] = toScreen(lastPt.lat, lastPt.lon);
    ctx.fillStyle = '#F6C83B';
    ctx.beginPath();
    ctx.arc(endSx, endSy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0B0E12';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 4F. Live GPS Beacon Head + Floating Telemetry Tag
  const [curSx, curSy] = toScreen(curLat, curLon);
  const pulseR = 18 + Math.sin(t * 10) * 6;
  ctx.fillStyle = 'rgba(246, 200, 59, 0.32)';
  ctx.beginPath();
  ctx.arc(curSx, curSy, pulseR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F6C83B';
  ctx.beginPath();
  ctx.arc(curSx, curSy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0B0E12';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Floating GPS Callout Pill next to runner
  if (t > 0.6 && t < 8.5) {
    const tagText = `${curDistKm.toFixed(1)} KM • ${curEle}m`;
    ctx.font = '800 20px system-ui, sans-serif';
    const tagW = ctx.measureText(tagText).width + 32;
    const tagH = 38;
    const tagX = Math.max(
      mapX + 20,
      Math.min(mapX + mapW - tagW - 20, curSx - tagW / 2)
    );
    const tagY = curSy > mapY + mapH * 0.3 ? curSy - 54 : curSy + 22;

    ctx.fillStyle = 'rgba(13, 17, 21, 0.92)';
    ctx.strokeStyle = '#F6C83B';
    ctx.lineWidth = 2;
    roundRect(ctx, tagX, tagY, tagW, tagH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F6C83B';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, tagX + tagW / 2, tagY + 26);
  }

  // Compass / Map Corner HUD
  ctx.fillStyle = 'rgba(250, 247, 242, 0.5)';
  ctx.font = '700 18px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GPS TRACK // VAUCLUSE 84', mapX + 28, mapY + 40);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#22C55E';
  ctx.fillText('● LIVE TELEMETRY', mapX + mapW - 28, mapY + 40);

  ctx.restore(); // unclip map

  // Outer Map Border Stroke
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.35)';
  ctx.lineWidth = 3;
  roundRect(ctx, mapX, mapY, mapW, mapH, 28);
  ctx.stroke();
  ctx.restore();

  // ==========================================
  // 5. LIVE TELEMETRY COUNTERS (3 HUD CARDS)
  // ==========================================
  const hudY = 1196;
  const hudW = w - 144;
  const gap = 18;
  const cardW = (hudW - gap * 2) / 3;
  const cardH = 150;

  const hudItems = [
    {
      label: 'DISTANCE PARCOURUE',
      value: `${curDistKm.toFixed(1)} KM`,
      sub: `SUR ${displayDistTotal.toFixed(1)} KM`,
      accent: '#FAF7F2'
    },
    {
      label: 'DÉNIVELÉ CUMULÉ',
      value: `+${curDplus} M`,
      sub: `TOTAL +${displayDplusTotal} M D+`,
      accent: '#F6C83B'
    },
    {
      label: 'ALTITUDE LIVE',
      value: `${curEle} M`,
      sub: `MIN ${track.minEle}M • MAX ${track.maxEle}M`,
      accent: '#EB5E28'
    }
  ];

  hudItems.forEach((item, i) => {
    const cx = mapX + i * (cardW + gap);
    ctx.save();
    ctx.fillStyle = 'rgba(250, 247, 242, 0.05)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.14)';
    ctx.lineWidth = 2;
    roundRect(ctx, cx, hudY, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(250, 247, 242, 0.6)';
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.fillText(item.label, cx + cardW / 2, hudY + 34);

    ctx.fillStyle = item.accent;
    ctx.font = '900 58px "Bebas Neue", system-ui, sans-serif';
    ctx.fillText(item.value, cx + cardW / 2, hudY + 95);

    ctx.fillStyle = 'rgba(250, 247, 242, 0.5)';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(item.sub, cx + cardW / 2, hudY + 128);
    ctx.restore();
  });

  // ==========================================
  // 6. ELEVATION PROFILE CHART (BOTTOM)
  // ==========================================
  const profX = 72;
  const profY = 1372;
  const profW = w - 144;
  const profH = 260;

  ctx.save();
  ctx.fillStyle = 'rgba(11, 14, 18, 0.9)';
  ctx.strokeStyle = 'rgba(250, 247, 242, 0.14)';
  ctx.lineWidth = 2;
  roundRect(ctx, profX, profY, profW, profH, 24);
  ctx.fill();
  ctx.stroke();

  // Profile Header
  ctx.fillStyle = 'rgba(250, 247, 242, 0.65)';
  ctx.font = '800 18px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⛰️ PROFIL ALTIMÉTRIQUE EN TEMPS RÉEL', profX + 26, profY + 36);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#F6C83B';
  ctx.fillText(`${Math.round(rawRunProg * 100)}% DU PARCOURS`, profX + profW - 26, profY + 36);

  const chartLeft = profX + 26;
  const chartRight = profX + profW - 26;
  const chartTop = profY + 62;
  const chartBottom = profY + profH - 28;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  const eleSpan = Math.max(30, track.maxEle - track.minEle);

  const toChartCoords = (idx: number): [number, number] => {
    const p = pts[idx];
    const x = chartLeft + (idx / maxIdx) * chartW;
    const normEle = (p.ele - track.minEle) / eleSpan;
    const y = chartBottom - normEle * chartH;
    return [x, y];
  };

  // Full ghost elevation profile
  ctx.beginPath();
  for (let i = 0; i <= maxIdx; i++) {
    const [cx, cy] = toChartCoords(i);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.strokeStyle = 'rgba(250, 247, 242, 0.2)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Filled active elevation profile up to curIdx
  if (exactIdx > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    for (let i = 0; i <= curIdx; i++) {
      const [cx, cy] = toChartCoords(i);
      ctx.lineTo(cx, cy);
    }
    const [lastCx, lastCy] = toChartCoords(curIdx);
    ctx.lineTo(lastCx, chartBottom);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    areaGrad.addColorStop(0, 'rgba(235, 94, 40, 0.65)');
    areaGrad.addColorStop(0.6, 'rgba(246, 200, 59, 0.3)');
    areaGrad.addColorStop(1, 'rgba(246, 200, 59, 0.02)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Top active elevation line
    ctx.beginPath();
    for (let i = 0; i <= curIdx; i++) {
      const [cx, cy] = toChartCoords(i);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = '#F6C83B';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // Vertical scanline & glowing dot on chart
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(lastCx, chartTop - 8);
    ctx.lineTo(lastCx, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#F6C83B';
    ctx.beginPath();
    ctx.arc(lastCx, lastCy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // ==========================================
  // 7. BOTTOM CALL TO ACTION & FOOTER
  // ==========================================
  const ctaY = 1662;
  const ctaH = 92;
  const ctaW = w - 144;

  ctx.save();
  const isFinalPhase = t >= 8.0;
  const ctaGrad = ctx.createLinearGradient(72, 0, 72 + ctaW, 0);
  if (isFinalPhase) {
    ctaGrad.addColorStop(0, '#F6C83B');
    ctaGrad.addColorStop(1, '#EB5E28');
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = 'rgba(246, 200, 59, 0.45)';
    ctx.shadowBlur = 30;
  } else {
    ctx.fillStyle = 'rgba(246, 200, 59, 0.12)';
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.4)';
    ctx.lineWidth = 2;
  }

  roundRect(ctx, 72, ctaY, ctaW, ctaH, 22);
  ctx.fill();
  if (!isFinalPhase) ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.fillStyle = isFinalPhase ? '#0B0E12' : '#F6C83B';
  ctx.font = '900 42px "Bebas Neue", system-ui, sans-serif';
  ctx.fillText(
    (config.ctaText || '📥 TÉLÉCHARGE LE GPX & INFOS SUR RUNVAUCLUSE.FR').toUpperCase(),
    w / 2,
    ctaY + 59
  );
  ctx.restore();

  // Footer Bar
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.14)';
  ctx.fillRect(72, h - 115, w - 144, 2);

  ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📍 WWW.RUNVAUCLUSE.FR', 72, h - 65);

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 24px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('LIEN EN BIO 🔗', w - 72, h - 65);
  ctx.restore();
}
