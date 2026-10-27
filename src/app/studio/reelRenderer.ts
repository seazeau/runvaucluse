export interface RecordItem {
  id: string;
  distance: string;
  distanceShort: string;
  gender: 'M' | 'F';
  genderLabel: string;
  time: string;
  athlete: string;
  club: string;
  clubCity: string;
  year: string;
}

export function drawReelFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // 0.0 to 12.0 seconds
  filter: 'mixed' | '10k' | 'semi' | 'marathon',
  records: RecordItem[]
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
  let badgeText = 'ARCHIVES 84';
  if (t >= 3 && t < 6.2) badgeText = 'BASE DE DONNÉES 🏆';
  else if (t >= 6.2 && t < 9.5) badgeText = 'RECORDS OFFICIELS ⏱️';
  else if (t >= 9.5) badgeText = 'REJOINS LE SITE 🔥';

  ctx.fillStyle = 'rgba(246, 200, 59, 0.15)';
  ctx.strokeStyle = 'rgba(246, 200, 59, 0.5)';
  ctx.lineWidth = 2;
  const badgeW = 280;
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

  // SCENE 1: HOOK (0.0 to 3.0s)
  if (t < 3.0) {
    const s1Prog = Math.min(1, t / 0.8);
    ctx.save();
    ctx.textAlign = 'center';
    
    // Pill
    ctx.fillStyle = '#EB5E28';
    roundRect(ctx, w / 2 - 200, h * 0.32, 400, 54, 27);
    ctx.fill();
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText('LE GRAND BILAN DÉPARTEMENTAL', w / 2, h * 0.32 + 36);

    // Big Title
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 96px "Bebas Neue", sans-serif';
    ctx.fillText('QUI DÉTIENT LES', w / 2, h * 0.44);
    
    // Highlight
    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 114px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.5)';
    ctx.shadowBlur = 40;
    ctx.fillText('RECORDS DU 84 ?', w / 2, h * 0.52);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = 'rgba(250, 247, 242, 0.85)';
    ctx.font = '700 32px system-ui, sans-serif';
    ctx.fillText('10 KM ROUTE • SEMI • MARATHON', w / 2, h * 0.60);

    ctx.fillStyle = 'rgba(246, 200, 59, 0.9)';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText('Les chronos officiels homologués FFA & World Athletics', w / 2, h * 0.64);
    ctx.restore();
  }

  // SCENE 2: 24K RUNNERS (3.0s to 6.2s)
  else if (t >= 3.0 && t < 6.2) {
    const s2Elapsed = t - 3.0;
    const countProg = Math.min(1, s2Elapsed / 1.6);
    const countVal = Math.round(countProg * 24655);

    ctx.save();
    ctx.textAlign = 'center';

    // Sub
    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('ARCHIVES DU RUNNING EN VAUCLUSE', w / 2, h * 0.30);

    // Big Animated Counter
    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 160px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.4)';
    ctx.shadowBlur = 35;
    ctx.fillText(countVal.toLocaleString('fr-FR'), w / 2, h * 0.43);
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 58px "Bebas Neue", sans-serif';
    ctx.fillText('COUREURS RÉPERTORIÉS DANS LE 84', w / 2, h * 0.50);

    // Box
    const boxW = 860;
    const boxH = 160;
    const boxX = (w - boxW) / 2;
    const boxY = h * 0.56;
    ctx.fillStyle = 'rgba(250, 247, 242, 0.06)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF7F2';
    ctx.font = '700 28px system-ui, sans-serif';
    ctx.fillText('📊 100+ courses et classements passés au crible', w / 2, boxY + 65);
    ctx.fillStyle = '#F6C83B';
    ctx.font = '800 28px system-ui, sans-serif';
    ctx.fillText('Ton nom est peut-être déjà inscrit dans l’histoire ! 👀', w / 2, boxY + 115);

    ctx.restore();
  }

  // SCENE 3: OFFICIAL RECORDS (6.2s to 9.5s)
  else if (t >= 6.2 && t < 9.5) {
    ctx.save();
    ctx.textAlign = 'left';

    // Title
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 64px "Bebas Neue", sans-serif';
    ctx.fillText('LES CHRONOS MYTHIQUES ⏱️', 100, h * 0.28);
    ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillText('Records départementaux officiels homologués', 100, h * 0.31);

    // Records to show
    const items = [
      { dist: '5 KM ROUTE • HOMME', time: "14'07''", name: 'Romain LEGENDRE', club: 'UA Carpentras' },
      { dist: '10 KM ROUTE • HOMME', time: "29'05''", name: 'Romain LEGENDRE', club: 'UA Carpentras' },
      { dist: '10 KM ROUTE • FEMME', time: "31'45''", name: 'Clara ENTRESANGLE', club: 'AS Cavaillon' },
      { dist: 'SEMI-MARATHON • HOMME', time: "1h04'27''", name: 'Khalid LABLAQ', club: 'CS Avignon Montfavet' }
    ];

    const cardW = 880;
    const cardH = 120;
    const startY = h * 0.36;
    const gap = 30;

    items.forEach((item, idx) => {
      const cardY = startY + idx * (cardH + gap);

      // Card BG
      ctx.fillStyle = 'rgba(250, 247, 242, 0.05)';
      ctx.strokeStyle = 'rgba(246, 200, 59, 0.3)';
      ctx.lineWidth = 2;
      roundRect(ctx, 100, cardY, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Left Accent Border
      ctx.fillStyle = '#F6C83B';
      roundRect(ctx, 100, cardY, 8, cardH, 4);
      ctx.fill();

      // Distance tag
      ctx.fillStyle = '#EB5E28';
      ctx.font = '800 20px system-ui, sans-serif';
      ctx.fillText(item.dist, 130, cardY + 38);

      // Athlete
      ctx.fillStyle = '#FAF7F2';
      ctx.font = '800 28px system-ui, sans-serif';
      ctx.fillText(item.name, 130, cardY + 74);

      // Club
      ctx.fillStyle = 'rgba(250, 247, 242, 0.65)';
      ctx.font = '600 20px system-ui, sans-serif';
      ctx.fillText(item.club, 130, cardY + 102);

      // Time Badge
      const timeW = 200;
      const timeH = 70;
      const timeX = 100 + cardW - timeW - 25;
      const timeY = cardY + (cardH - timeH) / 2;

      ctx.fillStyle = 'rgba(246, 200, 59, 0.12)';
      ctx.strokeStyle = 'rgba(246, 200, 59, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, timeX, timeY, timeW, timeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F6C83B';
      ctx.font = '900 46px "Bebas Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.time, timeX + timeW / 2, timeY + 50);
      ctx.textAlign = 'left';
    });

    ctx.restore();
  }

  // SCENE 4: OUTRO & CALL TO ACTION (9.5s to 12.0s)
  else {
    ctx.save();
    ctx.textAlign = 'center';

    // Hook
    ctx.fillStyle = '#EB5E28';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('ET TOI, QUEL EST TON CHRONO ?', w / 2, h * 0.32);

    // Title
    ctx.fillStyle = '#FAF7F2';
    ctx.font = '900 88px "Bebas Neue", sans-serif';
    ctx.fillText('REJOINS LE', w / 2, h * 0.42);
    ctx.fillStyle = '#F6C83B';
    ctx.font = '900 110px "Bebas Neue", sans-serif';
    ctx.shadowColor = 'rgba(246, 200, 59, 0.4)';
    ctx.shadowBlur = 40;
    ctx.fillText('WALL OF FAME', w / 2, h * 0.50);
    ctx.shadowBlur = 0;

    // Search Mockup
    const sW = 680;
    const sH = 74;
    const sX = (w - sW) / 2;
    const sY = h * 0.56;
    ctx.fillStyle = 'rgba(250, 247, 242, 0.08)';
    ctx.strokeStyle = 'rgba(250, 247, 242, 0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, sX, sY, sW, sH, 37);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText('🔍 Tape ton nom ou ton club sur le site...', w / 2, sY + 47);

    // CTA Pill
    const ctaW = 640;
    const ctaH = 90;
    const ctaX = (w - ctaW) / 2;
    const ctaY = h * 0.67;
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
    ctx.font = '900 46px "Bebas Neue", sans-serif';
    ctx.fillText('DÉCOUVRE TES STATS DÈS MAINTENANT', w / 2, ctaY + 60);

    ctx.restore();
  }

  // Footer URL
  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 242, 0.15)';
  ctx.fillRect(80, h - 140, w - 160, 2);

  ctx.fillStyle = 'rgba(250, 247, 242, 0.7)';
  ctx.font = '700 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📍 RUNVAUCLUSE.FR/RECORDS', 80, h - 80);

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
