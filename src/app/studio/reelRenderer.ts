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
