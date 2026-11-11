import { parseDistanceList } from '@/lib/utils';

export interface ReelRunnerData {
  name: string;
  club: string;
  count: number;
  bestRank: number | string;
  totalKm: number;
  grade: string;
}

export function drawReelFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // 0.0 to 12.0 seconds
  runner: ReelRunnerData
) {
  // 1. Dark Gradient Background
  const bgGrad = ctx.createRadialGradient(w / 2, h * 0.3, 100, w / 2, h / 2, h * 0.8);
  bgGrad.addColorStop(0, '#1A2127');
  bgGrad.addColorStop(0.5, '#101417');
  bgGrad.addColorStop(1, '#090B0D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle glowing orbs
  ctx.save();
  const orb1Grad = ctx.createRadialGradient(w * 0.85, h * 0.15, 20, w * 0.85, h * 0.15, 450);
  orb1Grad.addColorStop(0, 'rgba(246, 200, 59, 0.22)');
  orb1Grad.addColorStop(1, 'rgba(246, 200, 59, 0)');
  ctx.fillStyle = orb1Grad;
  ctx.fillRect(0, 0, w, h);

  const orb2Grad = ctx.createRadialGradient(w * 0.15, h * 0.85, 20, w * 0.15, h * 0.85, 500);
  orb2Grad.addColorStop(0, 'rgba(235, 94, 40, 0.22)');
  orb2Grad.addColorStop(1, 'rgba(235, 94, 40, 0)');
  ctx.fillStyle = orb2Grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Grid pattern dots
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.04)';
  const step = 60;
  for (let x = step / 2; x < w; x += step) {
    for (let y = step / 2; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Top Progress Bar (0 to 12s)
  const progress = Math.min(1, t / 12);
  const pGrad = ctx.createLinearGradient(0, 0, w, 0);
  pGrad.addColorStop(0, '#EB5E28');
  pGrad.addColorStop(1, '#F6C83B');
  ctx.fillStyle = pGrad;
  ctx.fillRect(0, 0, w * progress, 12);

  // Brand Header
  ctx.save();
  ctx.fillStyle = '#FAF7F2';
  ctx.font = '900 48px "Bebas Neue", sans-serif';
  ctx.fillText('⚡ RUNVAUCLUSE', 80, 110);

  // Scene Badge
  let badgeText = 'RECHERCHE COUREUR 🔍';
  if (t >= 3.2 && t < 7.2) badgeText = 'CARTE OFFICIELLE 🪪';
  else if (t >= 7.2 && t < 9.5) badgeText = '24 655 COUREURS 📊';
  else if (t >= 9.5) badgeText = 'GÉNÈRE TA CARTE 🔥';

  ctx.fillStyle = 'rgba(246, 200, 59, 0.15)';
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.5)';
  ctx.lineWidth = 2;
  const badgeW = 320;
  const badgeH = 46;
  const badgeX = w - 80 - badgeW;
  const badgeY = 74;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 31);
  ctx.restore();

  // SCENE 1: HOOK & LIVE SEARCH SIMULATION (0.0s to 3.2s)
  if (t < 3.2) {
    ctx.save();
    ctx.textAlign = 'center';

    // Hook pill
    ctx.fillStyle = '#EB5E28';
    roundRect(ctx, w / 2 - 240, h * 0.22, 480, 54, 27);
    ctx.fill();
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText('BILAN OFFICIEL DE SAISON 2026/2027', w / 2, h * 0.22 + 36);

    // Main Title
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 92px "Bebas Neue", sans-serif';
    ctx.fillText('TU AS COURU DANS LE 84', w / 2, h * 0.33);

    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 108px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.5)';
    ctx.shadowBlur = 35;
    ctx.fillText('CETTE ANNÉE ?', w / 2, h * 0.40);
    ctx.shadowBlur = 0;

    // Search simulation box
    const boxW = 860;
    const boxH = 340;
    const boxX = (w - boxW) / 2;
    const boxY = h * 0.48;

    ctx.fillStyle = 'rgba(250, 247, 242, 0.06)';
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.35)';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Input row inside box
    const inputW = boxW - 80;
    const inputH = 80;
    const inputX = boxX + 40;
    const inputY = boxY + 40;

    ctx.fillStyle = 'rgba(13, 16, 19, 0.85)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, inputX, inputY, inputW, inputH, 16);
    ctx.fill();
    ctx.stroke();

    // Typing simulation
    const typeProg = Math.min(1, t / 1.8);
    const charsToShow = Math.floor(typeProg * runner.name.length);
    const typedStr = runner.name.slice(0, charsToShow);
    const cursor = (Math.floor(t * 3) % 2 === 0) ? '|' : '';

    ctx.textAlign = 'left';
    ctx.font = '700 36px monospace';
    ctx.fillStyle = '#F6C83B';
    ctx.fillText(`🔍  ${typedStr}${cursor}`, inputX + 30, inputY + 52);

    // Dropdown match after 2.0s
    if (t >= 2.0) {
      const dropY = inputY + inputH + 25;
      ctx.fillStyle = 'rgba(246, 200, 59, 0.12)';
      ctx.strokeStyle = 'rgba(246, 200, 59, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, inputX, dropY, inputW, 70, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 26px system-ui, sans-serif';
      ctx.fillStyle = '#FAF7F2';
      ctx.fillText(`✓ 1 profil trouvé : ${runner.name}`, inputX + 25, dropY + 44);

      ctx.font = '700 22px system-ui, sans-serif';
      ctx.fillStyle = '#F6C83B';
      ctx.textAlign = 'right';
      ctx.fillText(runner.club || 'Vaucluse', inputX + inputW - 25, dropY + 44);
    }

    // Call to action button at bottom of box
    if (t >= 2.6) {
      const btnW = 340;
      const btnH = 60;
      const btnX = boxX + (boxW - btnW) / 2;
      const btnY = boxY + boxH - 85;

      ctx.fillStyle = '#F6C83B';
      roundRect(ctx, btnX, btnY, btnW, btnH, 14);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0D1013';
      ctx.font = '900 28px "Bebas Neue", sans-serif';
      ctx.fillText('GÉNÉRER MA CARTE COUREUR ➔', btnX + btnW / 2, btnY + 40);
    }

    ctx.restore();
  }

  // SCENE 2: THE RUNNER CARD REVEAL (3.2s to 7.2s)
  else if (t >= 3.2 && t < 7.2) {
    ctx.save();
    ctx.textAlign = 'center';

    // Header above card
    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('TOUTES TES STATS RÉUNIES EN UN CLIC', w / 2, h * 0.20);

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 68px "Bebas Neue", sans-serif';
    ctx.fillText('TA CARTE OFFICIELLE DE SAISON 🪪', w / 2, h * 0.25);

    // The Big Collector Runner Card
    const cardW = 760;
    const cardH = 920;
    const cardX = (w - cardW) / 2;
    const cardY = h * 0.28;

    // Card Glow / Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(246, 200, 59, 0.35)';
    ctx.shadowBlur = 50;

    // Card Background
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGrad.addColorStop(0, '#1E252C');
    cardGrad.addColorStop(1, '#0E1114');
    ctx.fillStyle = cardGrad;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();

    // Golden Border
    ctx.strokeStyle = '#F6C83B';
    ctx.lineWidth = 4;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.stroke();
    ctx.restore();

    // Card Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 36px "Bebas Neue", sans-serif';
    ctx.fillText('⚡ RUNVAUCLUSE • CARTE COUREUR', cardX + 50, cardY + 70);

    // Grade Badge top right
    const gradeW = 260;
    const gradeH = 46;
    const gradeX = cardX + cardW - 50 - gradeW;
    const gradeY = cardY + 36;
    ctx.fillStyle = 'rgba(246, 200, 59, 0.15)';
    ctx.strokeStyle = '#F6C83B';
    ctx.lineWidth = 2;
    roundRect(ctx, gradeX, gradeY, gradeW, gradeH, 23);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#F6C83B';
    ctx.font = '800 20px system-ui, sans-serif';
    ctx.fillText(`👑 ${runner.grade.toUpperCase()}`, gradeX + gradeW / 2, gradeY + 31);

    // Avatar Circle
    const avatarR = 65;
    const avatarX = w / 2;
    const avatarY = cardY + 200;

    const avGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR);
    avGrad.addColorStop(0, '#F6C83B');
    avGrad.addColorStop(1, '#EB5E28');
    ctx.fillStyle = avGrad;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.fill();

    // Avatar Initials
    const initials = runner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    ctx.fillStyle = '#0D1013';
    ctx.font = '900 54px "Bebas Neue", sans-serif';
    ctx.fillText(initials, avatarX, avatarY + 18);

    // Athlete Name
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 76px "Bebas Neue", sans-serif';
    ctx.fillText(runner.name.toUpperCase(), w / 2, cardY + 330);

    // Club
    ctx.fillStyle = '#F6C83B';
    ctx.font = '700 28px system-ui, sans-serif';
    ctx.fillText(`📍 ${runner.club || 'Coureur Vaucluse'}`, w / 2, cardY + 375);

    // 3 Stats Grid (Nombre de courses, Meilleure place au scratch, Kilomètre en course)
    const gridY = cardY + 440;
    const gridW = 680;
    const gap = 14;
    const cellW = (gridW - 2 * gap) / 3;
    const cellH = 155;
    const gridX = (w - gridW) / 2;

    const formatRank = (r: number | string) => {
      if (!r || r === '-') return '-';
      if (typeof r === 'number') {
        return r === 1 ? '1ER' : `${r}E`;
      }
      return `${r}`.toUpperCase();
    };

    const stats = [
      { val: `${runner.count}`, labelTop: 'NOMBRE DE', labelBottom: 'COURSES', icon: '🏃' },
      { val: formatRank(runner.bestRank), labelTop: 'MEILLEURE PLACE', labelBottom: 'AU SCRATCH', icon: '🥇' },
      { val: `${runner.totalKm} KM`, labelTop: 'KILOMÈTRE', labelBottom: 'EN COURSE', icon: '📍' }
    ];

    stats.forEach((st, idx) => {
      const cx = gridX + idx * (cellW + gap);
      const cy = gridY;

      ctx.fillStyle = 'rgba(250, 247, 242, 0.05)';
      ctx.strokeStyle = 'rgba(250, 247, 242, 0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, cx, cy, cellW, cellH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F6C83B';
      ctx.font = '900 58px "Bebas Neue", sans-serif';
      ctx.fillText(st.val, cx + cellW / 2, cy + 66);

      ctx.fillStyle = 'rgba(250, 247, 242, 0.75)';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.fillText(`${st.icon} ${st.labelTop}`, cx + cellW / 2, cy + 104);
      ctx.fillText(st.labelBottom, cx + cellW / 2, cy + 126);
    });

    // Card Bottom Line
    ctx.fillStyle = 'rgba(250, 247, 242, 0.15)';
    ctx.fillRect(cardX + 40, cardY + cardH - 90, cardW - 80, 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(250, 247, 242, 0.6)';
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.fillText('RUNVAUCLUSE.FR/COUREUR', cardX + 45, cardY + cardH - 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#F6C83B';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('SAISON 2026/2027 ⚡', cardX + cardW - 45, cardY + cardH - 42);

    ctx.restore();
  }

  // SCENE 3: 24K RUNNERS & EVERYONE HAS A CARD (7.2s to 9.5s)
  else if (t >= 7.2 && t < 9.5) {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('DU DÉBUTANT AU TRAILEUR CONFIRMÉ', w / 2, h * 0.24);

    // Big Counter
    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 150px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.4)';
    ctx.shadowBlur = 35;
    ctx.fillText('24 655', w / 2, h * 0.38);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 68px "Bebas Neue", sans-serif';
    ctx.fillText('CARTES COUREURS GÉNÉRÉES DANS LE 84', w / 2, h * 0.45);

    // Explanatory Cards
    const boxW = 860;
    const boxH = 260;
    const boxX = (w - boxW) / 2;
    const boxY = h * 0.52;

    ctx.fillStyle = 'rgba(250, 247, 242, 0.05)';
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '700 30px system-ui, sans-serif';
    ctx.fillText('Que tu aies couru 1 course de village ou 20 trails...', w / 2, boxY + 70);

    ctx.fillStyle = 'rgba(250, 247, 242, 0.75)';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText('Toutes tes participations et allures sont sauvegardées !', w / 2, boxY + 125);

    ctx.fillStyle = '#F6C83B';
    ctx.font = '800 28px system-ui, sans-serif';
    ctx.fillText('📲 Prêt à être partagé en Story Instagram en 1 clic', w / 2, boxY + 185);

    ctx.restore();
  }

  // SCENE 4: CALL TO ACTION & SHARE IN STORY (9.5s to 12.0s)
  else {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('DISPONIBLE DÈS MAINTENANT', w / 2, h * 0.28);

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 90px "Bebas Neue", sans-serif';
    ctx.fillText('DÉCOUVRE TA', w / 2, h * 0.37);

    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 115px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.4)';
    ctx.shadowBlur = 40;
    ctx.fillText('CARTE COUREUR', w / 2, h * 0.46);
    ctx.shadowBlur = 0;

    // Search Mockup
    const sW = 720;
    const sH = 80;
    const sX = (w - sW) / 2;
    const sY = h * 0.54;
    ctx.fillStyle = 'rgba(250, 247, 242, 0.08)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, sX, sY, sW, sH, 40);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 247, 242, 0.75)';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText('🔍 Tape ton prénom et nom sur le site...', w / 2, sY + 52);

    // Action CTA Button
    const ctaW = 680;
    const ctaH = 95;
    const ctaX = (w - ctaW) / 2;
    const ctaY = h * 0.66;
    const ctaGrad = ctx.createLinearGradient(ctaX, 0, ctaX + ctaW, 0);
    ctaGrad.addColorStop(0, '#F6C83B');
    ctaGrad.addColorStop(1, '#EB5E28');
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = 'rgba(246, 200, 59, 0.4)';
    ctx.shadowBlur = 30;
    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0D1013';
    ctx.font = '900 48px "Bebas Neue", sans-serif';
    ctx.fillText('TÉLÉCHARGE & PARTAGE EN STORY', w / 2, ctaY + 63);

    ctx.restore();
  }

  // Footer URL
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.15)';
  ctx.fillRect(80, h - 140, w - 160, 2);

  ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
  ctx.font = '700 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📍 RUNVAUCLUSE.FR/COUREUR', 80, h - 80);

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 26px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('LIEN EN BIO 🔗', w - 80, h - 80);
  ctx.restore();
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

export interface ReelRaceOpeningData {
  name: string;
  city: string;
  date: string;
  distances: string;
  description?: string;
  image_url?: string;
  slug: string;
  hookBadge?: string;
  hookTitle?: string;
  customSubtitle?: string;
}

function easeOutCubic(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - c, 3);
}

function drawImageContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  // Ambient subtle backdrop (dimmed cover) - zero ctx.filter overhead for fast MP4 export
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxRatio = w / Math.max(1, h);

  let bgW = w, bgH = h, bgX = x, bgY = y;
  if (imgRatio > boxRatio) {
    bgH = h;
    bgW = h * imgRatio;
    bgX = x - (bgW - w) / 2;
  } else {
    bgW = w;
    bgH = w / imgRatio;
    bgY = y - (bgH - h) / 2;
  }

  ctx.fillStyle = '#0D1013';
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.drawImage(img, bgX, bgY, bgW, bgH);
  ctx.restore();

  // Contained crisp image (exact aspect ratio preserved, never stretched or cropped)
  let drawW = w, drawH = h, drawX = x, drawY = y;
  if (imgRatio > boxRatio) {
    drawW = w;
    drawH = w / imgRatio;
    drawY = y + (h - drawH) / 2;
  } else {
    drawH = h;
    drawW = h * imgRatio;
    drawX = x + (w - drawW) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  ctx.restore();
}

function drawAutoSizedSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  startSize: number,
  minSize: number,
  fontWeight: number | string,
  fontFamily: string
) {
  let size = startSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }

  let output = text;
  if (ctx.measureText(output).width > maxWidth) {
    while (output.length > 3 && ctx.measureText(output + '…').width > maxWidth) {
      output = output.slice(0, -1);
    }
    output = output.trim() + '…';
  }
  ctx.fillText(output, x, y);
}

function drawMultiLineCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  firstLineY: number,
  maxWidth: number,
  startSize: number,
  minSize: number,
  fontWeight: number | string,
  fontFamily: string,
  maxLines = 2
): number {
  let size = startSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;

  // 1. If it fits comfortably on 1 line down to 76% of startSize, render single line
  while (size >= Math.max(minSize, Math.round(startSize * 0.76))) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, firstLineY);
      return firstLineY;
    }
    size -= 2;
  }

  // 2. Otherwise split cleanly across up to maxLines balanced lines
  const words = text.split(/\s+/).filter(Boolean);
  let lines: string[] = [];

  if (maxLines === 2 && words.length > 1) {
    // Find best split point near the middle so lines are balanced
    let bestSplit = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const l1 = words.slice(0, i).join(' ');
      const l2 = words.slice(i).join(' ');
      const diff = Math.abs(l1.length - l2.length);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSplit = i;
      }
    }
    lines = [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')];
  } else {
    lines = [text];
  }

  // Shrink font until all lines fit inside maxWidth
  size = Math.min(startSize, Math.round(startSize * 0.85));
  while (size > minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (widest <= maxWidth) break;
    size -= 2;
  }

  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  const lineStep = Math.round(size * 0.96);

  lines.forEach((line, idx) => {
    let out = line;
    if (ctx.measureText(out).width > maxWidth) {
      while (out.length > 3 && ctx.measureText(out + '…').width > maxWidth) {
        out = out.slice(0, -1);
      }
      out = out.trim() + '…';
    }
    ctx.fillText(out, x, firstLineY + idx * lineStep);
  });

  return firstLineY + (lines.length - 1) * lineStep;
}

function drawWrappedParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = current ? `${current} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width <= maxWidth) {
      current = testLine;
    } else {
      if (current) {
        lines.push(current);
        current = words[i];
      } else {
        // Single extra-long word
        lines.push(words[i]);
        current = '';
      }
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  // Add ellipsis on last line if truncated
  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumedWords < words.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last.length > 3 && ctx.measureText(last + '…').width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = last.trim() + '…';
  }

  lines.forEach((line, idx) => {
    ctx.fillText(line, x, startY + idx * lineHeight);
  });

  return startY + (lines.length - 1) * lineHeight;
}

export function drawOpeningReelFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // 0.0 to 10.0 seconds
  race: ReelRaceOpeningData,
  posterImg: HTMLImageElement | null
) {
  // 1. Dark Gradient Background
  const bgGrad = ctx.createRadialGradient(w / 2, h * 0.35, 120, w / 2, h / 2, h * 0.85);
  bgGrad.addColorStop(0, '#1C2329');
  bgGrad.addColorStop(0.5, '#101417');
  bgGrad.addColorStop(1, '#090B0D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle glowing ambient orbs (Warm Ocre / Yellow & Orange)
  ctx.save();
  const orb1Grad = ctx.createRadialGradient(w * 0.82, h * 0.18, 30, w * 0.82, h * 0.18, 520);
  orb1Grad.addColorStop(0, 'rgba(235, 94, 40, 0.28)');
  orb1Grad.addColorStop(1, 'rgba(235, 94, 40, 0)');
  ctx.fillStyle = orb1Grad;
  ctx.fillRect(0, 0, w, h);

  const orb2Grad = ctx.createRadialGradient(w * 0.18, h * 0.78, 30, w * 0.18, h * 0.78, 550);
  orb2Grad.addColorStop(0, 'rgba(246, 200, 59, 0.24)');
  orb2Grad.addColorStop(1, 'rgba(246, 200, 59, 0)');
  ctx.fillStyle = orb2Grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Grid pattern dots
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.04)';
  const step = 60;
  for (let x = step / 2; x < w; x += step) {
    for (let y = step / 2; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Top Progress Bar (0 to 10s)
  const maxDur = 10.0;
  const progress = Math.min(1, t / maxDur);
  const pGrad = ctx.createLinearGradient(0, 0, w, 0);
  pGrad.addColorStop(0, '#EB5E28');
  pGrad.addColorStop(1, '#F6C83B');
  ctx.fillStyle = pGrad;
  ctx.fillRect(0, 0, w * progress, 14);

  // Brand Header
  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FAF7F2';
  ctx.font = '900 48px "Bebas Neue", system-ui, sans-serif';
  ctx.fillText('⚡ RUNVAUCLUSE', 72, 110);

  // Dynamic Scene Badge on top-right
  let badgeText = '🚨 OUVERTURE DOSSARDS';
  if (t >= 3.2 && t < 7.0) badgeText = '🏃 LES PARCOURS';
  else if (t >= 7.0) badgeText = '🎟️ PRENDS TA PLACE';

  ctx.fillStyle = 'rgba(246, 200, 59, 0.15)';
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.5)';
  ctx.lineWidth = 2;
  const badgeW = 340;
  const badgeH = 48;
  const badgeX = w - 72 - badgeW;
  const badgeY = 74;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 32);
  ctx.restore();

  // SCENE 1: HOOK & BIG OPENING ANNOUNCEMENT (0.0s to 3.2s)
  if (t < 3.2) {
    const enterP = easeOutCubic(t / 0.45);
    const slideOffset = (1 - enterP) * 35;

    ctx.save();
    ctx.globalAlpha = enterP;
    ctx.textAlign = 'center';

    // Hook Pill
    const hookText = race.hookBadge || 'TOP DÉPART AUJOURD\'HUI 🔔';
    ctx.font = '800 24px system-ui, sans-serif';
    const hookW = Math.min(900, Math.max(460, ctx.measureText(hookText).width + 90));
    const hookY = 260 + slideOffset;

    ctx.fillStyle = '#EB5E28';
    roundRect(ctx, (w - hookW) / 2, hookY, hookW, 56, 28);
    ctx.fill();

    ctx.fillStyle = '#FAF7F2';
    drawAutoSizedSingleLine(ctx, hookText, w / 2, hookY + 37, hookW - 40, 24, 18, 800, 'system-ui, sans-serif');

    // Big Headline
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 88px "Bebas Neue", system-ui, sans-serif';
    ctx.fillText('INSCRIPTIONS', w / 2, 420 + slideOffset);

    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 116px "Bebas Neue", system-ui, sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.55)';
    ctx.shadowBlur = 35;
    ctx.fillText('OUVERTES !', w / 2, 535 + slideOffset);
    ctx.shadowBlur = 0;

    // Poster Card Frame in center (with pop animation)
    const cardPop = 0.94 + 0.06 * easeOutCubic(t / 0.55);
    const cardW = 700;
    const cardH = 870;
    const cardCx = w / 2;
    const cardCy = 580 + cardH / 2;

    ctx.save();
    ctx.translate(cardCx, cardCy);
    ctx.scale(cardPop, cardPop);
    ctx.translate(-cardCx, -cardCy);

    const cardX = (w - cardW) / 2;
    const cardY = 580;

    // Glowing border
    ctx.fillStyle = 'rgba(17, 20, 23, 0.94)';
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.45)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(235, 94, 40, 0.35)';
    ctx.shadowBlur = 40;
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Render Poster image cleanly preserved inside card
    const imgPad = 18;
    const footerAreaH = 155;
    const imgW = cardW - imgPad * 2;
    const imgH = cardH - imgPad * 2 - footerAreaH;

    if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
      drawImageContained(ctx, posterImg, cardX + imgPad, cardY + imgPad, imgW, imgH, 20);
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(246, 200, 59, 0.08)';
      roundRect(ctx, cardX + imgPad, cardY + imgPad, imgW, imgH, 20);
      ctx.fill();
      ctx.fillStyle = '#F6C83B';
      drawMultiLineCenteredText(
        ctx,
        race.name.toUpperCase(),
        w / 2,
        cardY + imgPad + imgH / 2 - 20,
        imgW - 40,
        58,
        36,
        900,
        '"Bebas Neue", system-ui, sans-serif',
        2
      );
      ctx.restore();
    }

    // Card Title Footer (wraps cleanly on 1-2 lines so zero clipping)
    ctx.fillStyle = '#FAF7F2';
    const titleStartY = cardY + cardH - footerAreaH + 46;
    const titleEndY = drawMultiLineCenteredText(
      ctx,
      race.name.toUpperCase(),
      w / 2,
      titleStartY,
      cardW - 60,
      44,
      28,
      900,
      '"Bebas Neue", system-ui, sans-serif',
      2
    );

    ctx.fillStyle = '#EB5E28';
    drawAutoSizedSingleLine(
      ctx,
      `📍 ${race.city.toUpperCase()} • VAUCLUSE`,
      w / 2,
      Math.min(cardY + cardH - 22, titleEndY + 38),
      cardW - 60,
      22,
      16,
      800,
      'system-ui, sans-serif'
    );

    ctx.restore();

    // Bottom action hint
    ctx.fillStyle = 'rgba(250, 247, 242, 0.85)';
    ctx.font = '700 24px system-ui, sans-serif';
    ctx.fillText('⚡ DÉCOUVRE LES DISTANCES AU PROGRAMME ⚡', w / 2, 1555);

    ctx.restore();
  }

  // SCENE 2: RACE DETAILS & DISTANCES (3.2s to 7.0s)
  else if (t >= 3.2 && t < 7.0) {
    const st = t - 3.2;
    const enterP = easeOutCubic(st / 0.45);
    const slideY = (1 - enterP) * 30;

    ctx.save();
    ctx.globalAlpha = enterP;
    ctx.textAlign = 'center';

    // Location tag
    ctx.fillStyle = '#F6C83B';
    drawAutoSizedSingleLine(
      ctx,
      `📍 ${race.city.toUpperCase()} • VAUCLUSE`,
      w / 2,
      245 + slideY,
      920,
      26,
      18,
      800,
      'system-ui, sans-serif'
    );

    // Big Race Title (auto-wrapped 1-2 balanced lines, zero horizontal clipping)
    ctx.fillStyle = '#FAF7F2';
    const titleBottomY = drawMultiLineCenteredText(
      ctx,
      race.name.toUpperCase(),
      w / 2,
      325 + slideY,
      920,
      78,
      46,
      900,
      '"Bebas Neue", system-ui, sans-serif',
      2
    );

    // Date Pill cleanly anchored right below title
    const dateFormatted = race.date ? new Date(race.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase() : 'DATE OFFICIELLE EN VAUCLUSE';

    const dateLabel = `📅 ${dateFormatted}`;
    ctx.font = '800 21px system-ui, sans-serif';
    const datePillW = Math.min(900, Math.max(520, ctx.measureText(dateLabel).width + 80));
    const datePillY = titleBottomY + 26;

    ctx.fillStyle = 'rgba(250, 247, 242, 0.12)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.3)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, (w - datePillW) / 2, datePillY, datePillW, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    drawAutoSizedSingleLine(ctx, dateLabel, w / 2, datePillY + 31, datePillW - 40, 21, 16, 800, 'system-ui, sans-serif');

    // Middle Grid: Contained Poster Left + Formats Right
    const gridY = datePillY + 84;
    const posterThumbW = 360;
    const posterThumbH = 470;
    const posterThumbX = 72;

    if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(246, 200, 59, 0.25)';
      ctx.shadowBlur = 30;
      roundRect(ctx, posterThumbX, gridY, posterThumbW, posterThumbH, 22);
      ctx.fillStyle = '#111417';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      drawImageContained(ctx, posterImg, posterThumbX, gridY, posterThumbW, posterThumbH, 22);

      // Clean border around poster frame
      ctx.save();
      ctx.strokeStyle = 'rgba(246, 200, 59, 0.35)';
      ctx.lineWidth = 2;
      roundRect(ctx, posterThumbX, gridY, posterThumbW, posterThumbH, 22);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(246, 200, 59, 0.1)';
      ctx.strokeStyle = 'rgba(246, 200, 59, 0.3)';
      ctx.lineWidth = 2;
      roundRect(ctx, posterThumbX, gridY, posterThumbW, posterThumbH, 22);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F6C83B';
      drawMultiLineCenteredText(
        ctx,
        race.city.toUpperCase(),
        posterThumbX + posterThumbW / 2,
        gridY + posterThumbH / 2,
        posterThumbW - 40,
        48,
        30,
        900,
        '"Bebas Neue", system-ui, sans-serif',
        2
      );
      ctx.restore();
    }

    // Right Column: Formats & Distances (properly parsed for French commas)
    const distColX = 468;
    const distColW = w - distColX - 72;
    const parsedDistances = parseDistanceList(race.distances);
    const distList = parsedDistances.length > 0 ? parsedDistances : ['Course Nature', 'Rando'];

    ctx.textAlign = 'left';
    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('FORMATS AU CHOIX :', distColX, gridY + 26);

    const visibleItems = distList.length > 4
      ? [...distList.slice(0, 3), `+ ${distList.length - 3} autres parcours`]
      : distList;

    const cardGap = 16;
    const cardH = visibleItems.length <= 3 ? 112 : 90;
    let distY = gridY + 48;

    visibleItems.forEach((dist, idx) => {
      const cardDelay = idx * 0.25;
      if (st >= cardDelay) {
        const itemP = easeOutCubic((st - cardDelay) / 0.35);
        const slideX = (1 - itemP) * 40;

        ctx.save();
        ctx.globalAlpha = enterP * itemP;

        ctx.fillStyle = 'rgba(250, 247, 242, 0.08)';
        ctx.strokeStyle = '#F6C83B';
        ctx.lineWidth = 2;
        roundRect(ctx, distColX + slideX, distY, distColW, cardH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FAF7F2';
        drawAutoSizedSingleLine(
          ctx,
          `⚡ ${dist}`,
          distColX + 24 + slideX,
          distY + cardH / 2 + 11,
          distColW - 48,
          36,
          20,
          900,
          '"Bebas Neue", system-ui, sans-serif'
        );

        ctx.restore();
      }
      distY += cardH + cardGap;
    });

    // Bottom Highlight Box with properly wrapped text (no edge overflow!)
    ctx.textAlign = 'center';
    const bannerY = gridY + posterThumbH + 45;
    const bannerW = w - 144;
    const bannerH = 265;

    ctx.fillStyle = 'rgba(246, 200, 59, 0.08)';
    ctx.strokeStyle = 'rgba(246, 200, 59, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, 72, bannerY, bannerW, bannerH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 36px "Bebas Neue", system-ui, sans-serif';
    ctx.fillText('LE DÉCOR & L\'ESPRIT DU PARCOURS', w / 2, bannerY + 48);

    ctx.fillStyle = 'rgba(250, 247, 242, 0.88)';
    ctx.font = '500 24px system-ui, sans-serif';
    const rawDesc = race.description || `Sentiers provençaux et panoramas exceptionnels au cœur du Vaucluse.`;
    drawWrappedParagraph(ctx, rawDesc, w / 2, bannerY + 96, bannerW - 70, 35, 3);

    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('⚠️ PLACES LIMITÉES • NE TARDE PAS À T\'INSCRIRE !', w / 2, bannerY + bannerH - 28);

    ctx.restore();
  }

  // SCENE 3: FINAL CALL TO ACTION (7.0s to 10.0s)
  else {
    const st = t - 7.0;
    const enterP = easeOutCubic(st / 0.45);
    const slideY = (1 - enterP) * 35;

    ctx.save();
    ctx.globalAlpha = enterP;
    ctx.textAlign = 'center';

    // Top Hook Pill
    const topHookY = 270 + slideY;
    ctx.fillStyle = '#EB5E28';
    roundRect(ctx, w / 2 - 260, topHookY, 520, 56, 28);
    ctx.fill();

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText('RÉSERVE TON DOSSARD MAINTENANT', w / 2, topHookY + 37);

    // Punchline Intro
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 84px "Bebas Neue", system-ui, sans-serif';
    ctx.fillText('PRÊT POUR', w / 2, 435 + slideY);

    // Big Gold Race Title (wrapped cleanly across 1-2 lines within 920px safe zone)
    ctx.fillStyle = '#F6C83B';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.45)';
    ctx.shadowBlur = 40;
    const titleBottomY = drawMultiLineCenteredText(
      ctx,
      race.name.toUpperCase(),
      w / 2,
      535 + slideY,
      920,
      98,
      52,
      900,
      '"Bebas Neue", system-ui, sans-serif',
      2
    );
    ctx.shadowBlur = 0;

    // Mini Summary Pill (dynamic width + auto-sized text so zero overflow!)
    const summaryText = `📍 ${race.city} • ${race.distances || 'Vaucluse'}`;
    ctx.font = '700 22px system-ui, sans-serif';
    const summaryPillW = Math.min(936, Math.max(560, ctx.measureText(summaryText).width + 80));
    const summaryPillY = titleBottomY + 38;

    ctx.fillStyle = 'rgba(250, 247, 242, 0.1)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.2)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, (w - summaryPillW) / 2, summaryPillY, summaryPillW, 54, 27);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    drawAutoSizedSingleLine(ctx, summaryText, w / 2, summaryPillY + 35, summaryPillW - 50, 22, 16, 700, 'system-ui, sans-serif');

    // Big Primary CTA Button with gentle glow pulse
    const ctaW = 780;
    const ctaH = 114;
    const ctaX = (w - ctaW) / 2;
    const ctaY = Math.max(890, summaryPillY + 100);
    const pulse = 0.8 + 0.2 * Math.sin(st * 5);

    const ctaGrad = ctx.createLinearGradient(ctaX, 0, ctaX + ctaW, 0);
    ctaGrad.addColorStop(0, '#F6C83B');
    ctaGrad.addColorStop(1, '#EB5E28');
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = `rgba(246, 200, 59, ${0.45 * pulse})`;
    ctx.shadowBlur = 35 * pulse;
    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 26);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0D1013';
    ctx.font = '900 54px "Bebas Neue", system-ui, sans-serif';
    ctx.fillText('🔗 WWW.RUNVAUCLUSE.FR', w / 2, ctaY + 73);

    // Secondary Bio Link Pill
    const bioY = ctaY + ctaH + 34;
    ctx.fillStyle = 'rgba(250, 247, 242, 0.08)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, (w - 720) / 2, bioY, 720, 72, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '800 25px system-ui, sans-serif';
    ctx.fillText('LIEN DIRECT D\'INSCRIPTION EN BIO INSTAGRAM ↗️', w / 2, bioY + 45);

    // Community engagement callout
    const commY = bioY + 108;
    ctx.fillStyle = 'rgba(246, 200, 59, 0.08)';
    roundRect(ctx, 100, commY, w - 200, 114, 22);
    ctx.fill();

    ctx.fillStyle = '#F6C83B';
    ctx.font = '800 25px system-ui, sans-serif';
    ctx.fillText('💬 Tague ton binôme de trail en commentaire ! 👇', w / 2, commY + 48);

    ctx.fillStyle = 'rgba(250, 247, 242, 0.72)';
    ctx.font = '500 21px system-ui, sans-serif';
    ctx.fillText('Qui vient relever le défi cette année ?', w / 2, commY + 86);

    ctx.restore();
  }

  // Persistent Footer URL
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.15)';
  ctx.fillRect(72, h - 140, w - 144, 2);

  ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
  ctx.font = '700 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📍 RUNVAUCLUSE.FR • CALENDRIER 84', 72, h - 80);

  ctx.fillStyle = '#F6C83B';
  ctx.font = '800 26px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('LIEN EN BIO 🔗', w - 72, h - 80);
  ctx.restore();
}
