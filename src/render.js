// Holocron Survivors — dessin de la scène
import { ctx, view, rand, clamp } from './core.js';
import { SPR } from './sprites.js';
import { TILE, STAR_LAYERS, stars, nebula } from './background.js';
import { LEVELS, getGroundTile } from './levels.js';
import { S, player, session, runtime, enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, weapons } from './state.js';
import { WEAPONS, CHARS } from './gamedata.js';
import { screenFlash, ghosts } from './effects.js';

// ------------------------------ Rendu ------------------------------
function drawSprite(spr, x, y, scale = 1, flip = 1) {
  const c = SPR[spr];
  const w = c.width / 2 * scale, h = c.height / 2 * scale;
  if (flip === -1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1);
    ctx.drawImage(c, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(c, x - w / 2, y - h / 2, w, h);
  }
}
function render() {
  const LV = LEVELS[session.level];
  const anim = performance.now() / 1000; // horloge d'ambiance (continue même en pause/menu)
  ctx.fillStyle = LV.base;
  ctx.fillRect(0, 0, view.w, view.h);

  const shx = S.shake ? rand(-S.shake, S.shake) * 0.5 : 0;
  const shy = S.shake ? rand(-S.shake, S.shake) * 0.5 : 0;
  const camX = player.x - view.w / 2 + shx, camY = player.y - view.h / 2 + shy;

  if (LV.stars) {
    // nébuleuses + étoiles (tuilées, parallaxe)
    for (const par of [0.12, 0.3]) {
      const ox = -((camX * par) % TILE), oy = -((camY * par) % TILE);
      for (let ix = -1; ix <= Math.ceil(view.w / TILE); ix++)
        for (let iy = -1; iy <= Math.ceil(view.h / TILE); iy++)
          ctx.drawImage(nebula, ox + ix * TILE, oy + iy * TILE);
    }
    const now = anim;
    for (let li = 0; li < STAR_LAYERS.length; li++) {
      const L = STAR_LAYERS[li];
      ctx.fillStyle = '#cfeeff';
      for (const st of stars[li]) {
        let sx = (st.x - camX * L.par) % TILE, sy = (st.y - camY * L.par) % TILE;
        if (sx < 0) sx += TILE; if (sy < 0) sy += TILE;
        for (let ix = 0; ix * TILE + sx < view.w + 4; ix++) {
          for (let iy = 0; iy * TILE + sy < view.h + 4; iy++) {
            ctx.globalAlpha = L.alpha * (0.55 + 0.45 * Math.sin(now * 1.7 + st.tw));
            ctx.fillRect(ix * TILE + sx, iy * TILE + sy, L.size, L.size);
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  } else {
    // sol thématique, défilement 1:1 avec la caméra
    const tile = getGroundTile(session.level);
    const ox = -(((camX % TILE) + TILE) % TILE), oy = -(((camY % TILE) + TILE) % TILE);
    for (let ix = 0; ix * TILE + ox < view.w; ix++)
      for (let iy = 0; iy * TILE + oy < view.h; iy++)
        ctx.drawImage(tile, ox + ix * TILE, oy + iy * TILE);
  }

  // soleils jumeaux de Tatooine (fixes à l'écran)
  if (session.level === 'tatooine') {
    for (const [sx, sy, sr, col] of [[view.w - 150, 110, 38, '255,236,180'], [view.w - 240, 64, 22, '255,180,110']]) {
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
      grd.addColorStop(0, `rgba(${col},.85)`); grd.addColorStop(0.35, `rgba(${col},.28)`); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6);
      ctx.fillStyle = `rgba(${col},1)`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(-camX, -camY);

  // nappes de feu
  for (const fp of firePools) {
    const a = clamp(fp.life, 0, 1) * (0.6 + 0.25 * Math.sin(anim * 18 + fp.x));
    ctx.fillStyle = `rgba(255,120,40,${a * 0.16})`;
    ctx.beginPath(); ctx.arc(fp.x, fp.y, fp.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255,160,80,${a * 0.45})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(fp.x, fp.y, fp.r, 0, Math.PI * 2); ctx.stroke();
  }

  // aura ionique
  if (runtime.ionAura && (S.scene === 'play' || S.scene === 'levelup')) {
    ctx.fillStyle = 'rgba(110,231,255,.045)';
    ctx.beginPath(); ctx.arc(player.x, player.y, runtime.ionAura.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(110,231,255,.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 9]);
    ctx.lineDashOffset = -anim * 40;
    ctx.beginPath(); ctx.arc(player.x, player.y, runtime.ionAura.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // cristaux (pulsation lumineuse)
  for (const g of gems) {
    const bob = Math.sin(g.t) * 2.5;
    const pulse = 1 + 0.1 * Math.sin(anim * 5 + g.t * 2);
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(anim * 6 + g.t);
    drawSprite(g.v >= 5 ? 'gemBig' : 'gem', g.x, g.y + bob, pulse);
  }
  ctx.globalAlpha = 1;

  // ondes de Force
  ctx.globalCompositeOperation = 'lighter';
  for (const wv of waves) {
    const alpha = 1 - wv.r / wv.maxR;
    ctx.fillStyle = `rgba(110,231,255,${alpha * 0.07})`;
    ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(110,231,255,${alpha * 0.85})`;
    ctx.lineWidth = 3 + alpha * 6;
    ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r * 0.9, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(110,231,255,${alpha * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r * 1.08, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // explosions
  ctx.globalCompositeOperation = 'lighter';
  for (const bm of booms) {
    const alpha = bm.life / 0.25;
    const rr2 = bm.r * (1.15 - alpha * 0.15);
    ctx.fillStyle = `rgba(255,160,80,${alpha * 0.25})`;
    ctx.beginPath(); ctx.arc(bm.x, bm.y, rr2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,240,210,${alpha * 0.55})`;
    ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.r * 0.35 * alpha, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255,200,130,${alpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bm.x, bm.y, rr2, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(bm.x, bm.y, rr2 * 0.8, 0, Math.PI * 2); ctx.stroke();
  }
  // anneaux de choc
  for (const rg of rings) {
    const p = clamp(1 - rg.life / rg.maxLife, 0, 1);
    const eased = 1 - (1 - p) * (1 - p);
    ctx.strokeStyle = `rgba(${rg.color},${rg.life / rg.maxLife * 0.85})`;
    ctx.lineWidth = rg.width * (1 - p * 0.6);
    ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.maxR * eased, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // ennemis
  for (const e of enemies) {
    const sc = e.boss ? 1 : 1;
    drawSprite(e.spr, e.x, e.y, sc);
    if (e.flash > 0) {
      ctx.globalAlpha = e.flash * 8;
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(e.spr, e.x, e.y, sc);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    if (e.boss && !e.final) {
      const w = 60;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 20, w, 5);
      ctx.fillStyle = '#ff3b3b';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 20, w * clamp(e.hp / e.maxHp, 0, 1), 5);
    }
    // signature visuelle des boss finaux
    if (e.final) {
      ctx.globalCompositeOperation = 'lighter';
      if (e.type === 'maul') {
        const ba = anim * 5;
        for (const [lw, col] of [[7, 'rgba(255,59,59,.25)'], [2.5, 'rgba(255,180,160,.85)']]) {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(ba) * 38, e.y + Math.sin(ba) * 38);
          ctx.lineTo(e.x - Math.cos(ba) * 38, e.y - Math.sin(ba) * 38);
          ctx.stroke();
        }
      } else if (e.type === 'vader') {
        const sa = -0.9 + Math.sin(anim * 2) * 0.12;
        const hx = e.x + 16, hy = e.y + 8;
        for (const [lw, col] of [[6, 'rgba(255,59,59,.25)'], [2, 'rgba(255,180,160,.9)']]) {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + Math.cos(sa) * 34, hy + Math.sin(sa) * 34);
          ctx.stroke();
        }
      } else if (e.type === 'palpatine' && Math.random() < 0.35) {
        ctx.strokeStyle = 'rgba(165,130,255,.7)'; ctx.lineWidth = 1.2;
        for (const side of [-1, 1]) {
          const hx = e.x + side * 14, hy = e.y + 6;
          ctx.beginPath(); ctx.moveTo(hx, hy);
          ctx.lineTo(hx + rand(-8, 8), hy + rand(-8, 8));
          ctx.lineTo(hx + rand(-12, 12), hy + rand(-12, 12));
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // sabre laser
  const saber = weapons.find(w => w.id === 'saber');
  if (saber) {
    const st = WEAPONS.saber.stats(saber.lvl);
    for (let b = 0; b < st.blades; b++) {
      const a = (saber.angle || 0) + b * Math.PI;
      const x1 = player.x + Math.cos(a) * 16, y1 = player.y + Math.sin(a) * 16;
      const x2 = player.x + Math.cos(a) * st.len, y2 = player.y + Math.sin(a) * st.len;
      ctx.globalCompositeOperation = 'lighter';
      // sillage : arcs fantômes derrière la lame
      ctx.lineCap = 'round';
      for (let k = 1; k <= 6; k++) {
        const ga = a - k * 0.11;
        ctx.strokeStyle = `rgba(82,255,122,${0.16 * (1 - k / 7)})`;
        ctx.lineWidth = 9 - k;
        ctx.beginPath();
        ctx.moveTo(player.x + Math.cos(ga) * 16, player.y + Math.sin(ga) * 16);
        ctx.lineTo(player.x + Math.cos(ga) * st.len, player.y + Math.sin(ga) * st.len);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(82,255,122,.22)'; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = 'rgba(82,255,122,.65)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = '#eaffef'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      // pointe incandescente
      const tipGrd = ctx.createRadialGradient(x2, y2, 0, x2, y2, 10);
      tipGrd.addColorStop(0, 'rgba(234,255,239,.9)'); tipGrd.addColorStop(1, 'rgba(82,255,122,0)');
      ctx.fillStyle = tipGrd;
      ctx.fillRect(x2 - 10, y2 - 10, 20, 20);
      ctx.globalCompositeOperation = 'source-over';
      // poignée
      ctx.strokeStyle = '#9aa7b5'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(player.x + Math.cos(a) * 8, player.y + Math.sin(a) * 8); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }

  // grenades en vol
  for (const gr of grenades) {
    const p = gr.t / gr.dur;
    const gx = gr.x + (gr.tx - gr.x) * p, gy = gr.y + (gr.ty - gr.y) * p - Math.sin(Math.PI * p) * 46;
    ctx.strokeStyle = 'rgba(255,120,80,.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(gr.tx, gr.ty, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#2a2f36';
    ctx.beginPath(); ctx.arc(gx, gy, 4.5, 0, Math.PI * 2); ctx.fill();
    if (Math.floor(gr.t * 12) % 2 === 0) {
      ctx.fillStyle = '#ff5a4a';
      ctx.beginPath(); ctx.arc(gx + 1.5, gy - 1.5, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  // fantômes lumineux des ennemis abattus
  ctx.globalCompositeOperation = 'lighter';
  for (const gh of ghosts) {
    const lr = 1 - gh.t / 0.22;
    ctx.globalAlpha = lr * 0.7;
    drawSprite(gh.spr, gh.x, gh.y, 1 + (1 - lr) * 0.8);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // droïdes alliés
  for (const dr of drones) drawSprite('drone', dr.x, dr.y);

  // colonne de lumière du level-up
  if (S.beamT > 0) {
    const lr = S.beamT / 0.7;
    ctx.globalCompositeOperation = 'lighter';
    const bw2 = 26 + (1 - lr) * 34;
    const grd = ctx.createLinearGradient(0, player.y - 300, 0, player.y + 16);
    grd.addColorStop(0, 'rgba(255,209,102,0)');
    grd.addColorStop(1, `rgba(255,209,102,${lr * 0.45})`);
    ctx.fillStyle = grd;
    ctx.fillRect(player.x - bw2 / 2, player.y - 300, bw2, 316);
    const grd2 = ctx.createLinearGradient(0, player.y - 220, 0, player.y + 12);
    grd2.addColorStop(0, 'rgba(255,246,221,0)');
    grd2.addColorStop(1, `rgba(255,246,221,${lr * 0.6})`);
    ctx.fillStyle = grd2;
    ctx.fillRect(player.x - bw2 / 6, player.y - 220, bw2 / 3, 232);
    ctx.globalCompositeOperation = 'source-over';
  }

  // halo au sol sous le joueur
  if (S.scene === 'play' || S.scene === 'levelup') {
    ctx.globalCompositeOperation = 'lighter';
    const ha = 0.14 + 0.05 * Math.sin(anim * 3);
    ctx.fillStyle = `rgba(110,231,255,${ha})`;
    ctx.beginPath(); ctx.ellipse(player.x, player.y + 12, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // joueur (clignote si invulnérable)
  if (player.invuln <= 0 || Math.floor(S.time * 18) % 2 === 0) {
    drawSprite(CHARS[session.char].spr, player.x, player.y, 1, player.face);
  }

  // traînées lumineuses des projectiles
  const TRAILS = { boltCyan: '110,231,255', boltRed: '255,110,90', spear: '255,210,150', rocket: '255,170,90' };
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const b of bullets) {
    const col = TRAILS[b.spr] || '110,231,255';
    const tx = b.x - b.vx * 0.07, ty = b.y - b.vy * 0.07;
    ctx.strokeStyle = `rgba(${col},0.18)`;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = `rgba(${col},0.55)`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // projectiles
  for (const b of bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.a + Math.PI / 2);
    const c = SPR[b.spr];
    ctx.drawImage(c, -c.width / 4, -c.height / 4, c.width / 2, c.height / 2);
    ctx.restore();
  }

  // projectiles ennemis
  ctx.globalCompositeOperation = 'lighter';
  for (const b of ebullets) {
    if (b.saber) {
      const rot = (b.t || 0) * 13;
      for (const [lw, col] of [[7, 'rgba(255,59,59,.3)'], [2.2, 'rgba(255,190,170,.9)']]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
        for (const off of [0, Math.PI / 2]) {
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(rot + off) * 20, b.y + Math.sin(rot + off) * 20);
          ctx.lineTo(b.x - Math.cos(rot + off) * 20, b.y - Math.sin(rot + off) * 20);
          ctx.stroke();
        }
      }
    } else if (b.rocket) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      const c = SPR.rocket;
      ctx.drawImage(c, -c.width / 4, -c.height / 4, c.width / 2, c.height / 2);
      ctx.restore();
    } else {
      const col = b.color || '255,59,59';
      ctx.fillStyle = `rgba(${col},.22)`;
      ctx.beginPath(); ctx.arc(b.x, b.y, (b.r || 5) * 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${col},.9)`;
      ctx.beginPath(); ctx.arc(b.x, b.y, (b.r || 5) * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(b.x, b.y, (b.r || 5) * 0.35, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // éclairs
  ctx.globalCompositeOperation = 'lighter';
  for (const arc of arcs) {
    const alpha = arc.life / 0.18;
    for (const [lw, col] of [[5, `rgba(110,231,255,${alpha * 0.3})`], [1.6, `rgba(235,250,255,${alpha})`]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      for (let i = 0; i < arc.pts.length - 1; i++) {
        const p1 = arc.pts[i], p2 = arc.pts[i + 1];
        ctx.moveTo(p1.x, p1.y);
        const segs = 4;
        for (let s2 = 1; s2 <= segs; s2++) {
          const t = s2 / segs;
          const jx = s2 === segs ? 0 : rand(-9, 9), jy = s2 === segs ? 0 : rand(-9, 9);
          ctx.lineTo(p1.x + (p2.x - p1.x) * t + jx, p1.y + (p2.y - p1.y) * t + jy);
        }
      }
      ctx.stroke();
    }
    // ramifications secondaires
    ctx.strokeStyle = `rgba(110,231,255,${alpha * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < arc.pts.length - 1; i++) {
      const p1 = arc.pts[i], p2 = arc.pts[i + 1];
      const mx2 = (p1.x + p2.x) / 2 + rand(-6, 6), my2 = (p1.y + p2.y) / 2 + rand(-6, 6);
      const ba = Math.atan2(p2.y - p1.y, p2.x - p1.x) + (Math.random() < 0.5 ? 1 : -1) * rand(0.7, 1.5);
      const bl = rand(12, 30);
      ctx.moveTo(mx2, my2);
      ctx.lineTo(mx2 + Math.cos(ba) * bl * 0.6 + rand(-4, 4), my2 + Math.sin(ba) * bl * 0.6 + rand(-4, 4));
      ctx.lineTo(mx2 + Math.cos(ba) * bl, my2 + Math.sin(ba) * bl);
    }
    ctx.stroke();
    // impacts lumineux aux points de chaîne
    for (let i = 1; i < arc.pts.length; i++) {
      ctx.fillStyle = `rgba(235,250,255,${alpha * 0.6})`;
      ctx.beginPath(); ctx.arc(arc.pts[i].x, arc.pts[i].y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // particules — passe 1 : rects et fumée
  for (const p of particles) {
    if (p.type === 'smoke') {
      const lr = p.life / p.max;
      ctx.globalAlpha = lr * 0.22;
      ctx.fillStyle = '#141210';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.8 - lr * 0.8), 0, Math.PI * 2); ctx.fill();
    } else if (!p.type) {
      ctx.globalAlpha = clamp(p.life * 2.5, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  // particules — passe 2 : lueurs et traits (additif)
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const p of particles) {
    if (p.type === 'glow') {
      const lr = p.life / p.max;
      ctx.fillStyle = `rgba(${p.rgb},${lr * 0.3})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${p.rgb},${lr * 0.75})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'streak') {
      ctx.globalAlpha = clamp(p.life * 4, 0, 1);
      ctx.strokeStyle = `rgb(${p.rgb})`;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // textes flottants
  ctx.textAlign = 'center';
  for (const t of texts) {
    ctx.globalAlpha = clamp(t.life / t.maxLife * 1.4, 0, 1);
    ctx.font = `700 ${t.size}px Rajdhani, sans-serif`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.str, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // flèche vers le boss final hors champ
  const fb = enemies.find(e => e.final);
  if (fb && S.scene === 'play') {
    const sx = fb.x - (player.x - view.w / 2), sy = fb.y - (player.y - view.h / 2);
    if (sx < -20 || sx > view.w + 20 || sy < -20 || sy > view.h + 20) {
      const a = Math.atan2(sy - view.h / 2, sx - view.w / 2);
      const ex = clamp(view.w / 2 + Math.cos(a) * (Math.min(view.w, view.h) / 2 - 46), 34, view.w - 34);
      const ey = clamp(view.h / 2 + Math.sin(a) * (Math.min(view.w, view.h) / 2 - 46), 34, view.h - 34);
      const pulse2 = 0.6 + 0.4 * Math.sin(anim * 7);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(a);
      ctx.fillStyle = `rgba(255,59,59,${pulse2})`;
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -9); ctx.lineTo(-4, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // météo d'ambiance (espace écran)
  if (session.level === 'hoth') {
    ctx.fillStyle = 'rgba(225,240,255,.55)';
    for (let i = 0; i < 70; i++) {
      const fx = (((i * 137.9 + anim * (14 + (i % 5) * 9) + Math.sin(anim + i) * 8) % view.w) + view.w) % view.w;
      const fy = (((i * 89.3 + anim * (50 + (i % 7) * 12)) % view.h) + view.h) % view.h;
      const fs = 1 + (i % 3);
      ctx.fillRect(fx, fy, fs, fs);
    }
  } else if (session.level === 'endor') {
    for (let i = 0; i < 18; i++) {
      const a = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(anim * 2 + i * 1.7));
      const fx = (((i * 173.3 + Math.sin(anim * 0.35 + i) * 70) % view.w) + view.w) % view.w;
      const fy = (((i * 111.7 + Math.cos(anim * 0.3 + i * 2) * 50) % view.h) + view.h) % view.h;
      ctx.fillStyle = `rgba(190,255,140,${a})`;
      ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  // poussières en suspension (premier plan, tous niveaux)
  ctx.fillStyle = 'rgba(190,225,255,.10)';
  for (let i = 0; i < 20; i++) {
    const mx2 = (((i * 211.7 + anim * (6 + (i % 4) * 3)) % (view.w + 40)) + (view.w + 40)) % (view.w + 40) - 20;
    const my2 = (((i * 149.3 + Math.sin(anim * 0.4 + i) * 30 + anim * 2.5) % (view.h + 40)) + (view.h + 40)) % (view.h + 40) - 20;
    ctx.beginPath(); ctx.arc(mx2, my2, 1.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }

  // flash plein écran
  if (screenFlash.a > 0.004) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${screenFlash.rgb},${Math.min(screenFlash.a, 0.6)})`;
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.globalCompositeOperation = 'source-over';
  }
}

export { render };
