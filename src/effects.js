// Holocron Survivors — particules, anneaux, flashs, dégâts
import { rand, dist2, pick, DEBUG } from './core.js';
import { S, session, runtime, players, alivePlayers, teamCenter, enemies, gems, particles, texts, waves, addRing } from './state.js';
import { WEAPONS, weaponLvl } from './gamedata.js';
import { sfx } from './audio.js';
import { metaLvl } from './meta.js';
import { victory, gameOver } from './lifecycle.js';
import { t } from './i18n.js';

// ------------------------------ Effets ------------------------------
function addText(x, y, str, color = '#fff', size = 13, life = 0.7) {
  if (texts.length > 90) texts.shift();
  texts.push({ x, y, str, color, size, life, maxLife: life });
}
function burst(x, y, color, n = 8, spd = 130) {
  for (let i = 0; i < n; i++) {
    if (particles.length > 600) break;
    const a = Math.random() * Math.PI * 2, v = rand(spd * 0.3, spd);
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.25, 0.55), color, size: rand(1.5, 3.5) });
  }
}
// traits incandescents (additifs, alignés sur la vitesse)
function sparks(x, y, rgb, n = 8, spd = 300) {
  for (let i = 0; i < n; i++) {
    if (particles.length > 600) break;
    const a = Math.random() * Math.PI * 2, v = rand(spd * 0.4, spd);
    particles.push({ type: 'streak', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.15, 0.35), max: 0.35, rgb, size: rand(1, 2.2) });
  }
}
// boule de feu : lueurs chaudes + fumée
function fireball(x, y, r) {
  for (let i = 0; i < 9; i++) {
    if (particles.length > 600) break;
    const a = Math.random() * Math.PI * 2, d = Math.random() * r * 0.4;
    const life = rand(0.2, 0.45);
    particles.push({ type: 'glow', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * rand(30, 90), vy: Math.sin(a) * rand(30, 90) - 20, life, max: life, rgb: pick(['255,170,80', '255,120,50', '255,220,150']), size: rand(r * 0.14, r * 0.3) });
  }
  for (let i = 0; i < 6; i++) {
    if (particles.length > 600) break;
    const a = Math.random() * Math.PI * 2, d = Math.random() * r * 0.5;
    const life = rand(0.5, 0.9);
    particles.push({ type: 'smoke', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: rand(-25, 25), vy: rand(-45, -10), life, max: life, size: rand(r * 0.15, r * 0.3) });
  }
}
// flash plein écran (additif), décroît dans frame()
const screenFlash = { rgb: '255,255,255', a: 0 };
function flash(rgb, a) { if (a > screenFlash.a) { screenFlash.rgb = rgb; screenFlash.a = a; } }
// fantômes lumineux des ennemis abattus
const ghosts = [];
function addGhost(e) {
  if (ghosts.length > 30) ghosts.shift();
  ghosts.push({ spr: e.spr, x: e.x, y: e.y, t: 0 });
}
function damageEnemy(e, dmg, knockA = null, knockF = 0, quiet = false, owner = null) {
  const o = owner || players[0];
  let crit = false;
  if (o) {
    dmg *= o.dmgMult;
    if (o.combos.has('ionSurge') && o.ionAura &&
        dist2(e.x, e.y, o.x, o.y) < (o.ionAura.radius + e.r) * (o.ionAura.radius + e.r)) dmg *= 1.3;
    if (o.crit > 0 && Math.random() < o.crit) { dmg *= 2; crit = true; }
  }
  e.hp -= dmg;
  e.flash = 0.1;
  if (knockA !== null && !e.boss) { e.kx += Math.cos(knockA) * knockF; e.ky += Math.sin(knockA) * knockF; }
  if (!quiet) addText(e.x + rand(-8, 8), e.y - e.r - 4, Math.round(dmg), crit ? '#ffd166' : e.boss ? '#ff8f6b' : '#cfeeff', (e.boss ? 15 : 12) + (crit ? 3 : 0));
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    S.kills++;
    sfx.die();
    S.streak++; S.streakT = 1.2;
    const MILESTONES = { 10: 'SÉRIE ×10 !', 25: 'CARNAGE ×25 !', 50: 'MASSACRE ×50 !', 100: 'LÉGENDE ×100 !', 200: 'ÉLU(E) DE LA FORCE ×200 !' };
    if (MILESTONES[S.streak]) {
      const tc = teamCenter();
      addText(tc.x, tc.y - 95, t(MILESTONES[S.streak]), '#ffd166', 24, 1.6);
      flash('255,209,102', 0.12);
      S.zoomKick = Math.max(S.zoomKick, 0.05);
      sfx.lvl();
    }
    burst(e.x, e.y, e.boss ? '#ff3b3b' : '#9fdcff', e.boss ? 40 : 10, e.boss ? 280 : 140);
    sparks(e.x, e.y, e.boss ? '255,120,90' : '150,225,255', e.boss ? 16 : 5, e.boss ? 420 : 260);
    addGhost(e);
    addRing(e.x, e.y, e.boss ? 170 : 42, e.boss ? '255,59,59' : '110,231,255', e.boss ? 5 : 2, e.boss ? 0.6 : 0.3);
    dropGems(e);
    if (e.final) {
      addRing(e.x, e.y, 500, '255,209,102', 6, 1.2);
      burst(e.x, e.y, '#ffd166', 40, 380);
      fireball(e.x, e.y, 130);
      flash('255,255,255', 0.5);
      S.freeze = 0.9;
      S.zoomKick = Math.max(S.zoomKick, 0.16);
      S.shake = 18;
      for (const pl of alivePlayers()) pl.hp = Math.min(pl.maxHp, pl.hp + 50);
      victory(e);
    } else if (e.boss) {
      for (const pl of alivePlayers()) pl.hp = Math.min(pl.maxHp, pl.hp + 30);
      addText(e.x, e.y - 30, t('SEIGNEUR SITH VAINCU  +30 PV'), '#ffd166', 18, 2);
      addRing(e.x, e.y, 340, '255,209,102', 4, 0.9);
      fireball(e.x, e.y, 80);
      flash('255,120,90', 0.28);
      S.freeze = 0.3;
      S.zoomKick = Math.max(S.zoomKick, 0.08);
      S.shake = 14;
    }
  } else {
    sfx.hit();
  }
}
function hurtPlayer(p, dmg) {
  if (DEBUG.stress) return; // benchmark : joueurs invincibles
  if (!p || p.dead || p.invuln > 0 || S.scene !== 'play') return;
  if (p.dodge > 0 && Math.random() < p.dodge) {
    p.invuln = 0.35;
    addText(p.x, p.y - 24, t('ESQUIVE'), '#6ee7ff', 12);
    return;
  }
  p.invuln = 0.5;
  p.hp -= dmg * (p.armor || 1);
  sfx.hurt();
  S.shake = Math.max(S.shake, 6);
  flash('255,50,40', 0.15);
  S.zoomKick = Math.max(S.zoomKick, 0.04);
  sparks(p.x, p.y, '255,120,110', 6, 240);
  const fl = document.getElementById('dmgflash');
  fl.style.opacity = 1; setTimeout(() => fl.style.opacity = 0, 90);
  // combo Voie du Jedi : onde de riposte
  if (p.combos.has('jediMaster') && p.comboWaveCd <= 0) {
    p.comboWaveCd = 3;
    const wst = WEAPONS.wave.stats(weaponLvl(p, 'wave'));
    waves.push({ x: p.x, y: p.y, r: 20, maxR: wst.radius, dmg: wst.dmg, id: ++runtime.waveId, owner: p.idx });
    sfx.wave();
  }
  if (p.hp <= 0) {
    // Esprit de la Force : une résurrection par partie et par joueur
    if (metaLvl('revive') > 0 && !p.reviveUsed) {
      p.reviveUsed = true;
      p.hp = p.maxHp * 0.5;
      p.invuln = 2;
      addText(p.x, p.y - 40, t('LA FORCE VEILLE SUR TOI'), '#6ee7ff', 20, 2.5);
      addRing(p.x, p.y, 320, '110,231,255', 5, 0.8);
      flash('150,230,255', 0.45);
      S.freeze = 0.5;
      for (const en of enemies) {
        const d = Math.hypot(en.x - p.x, en.y - p.y);
        if (d < 300 && !en.boss) {
          const a = Math.atan2(en.y - p.y, en.x - p.x);
          en.kx += Math.cos(a) * 700; en.ky += Math.sin(a) * 700;
        }
      }
      return;
    }
    p.hp = 0;
    p.dead = true;
    p.respawnT = 60; // réanimation automatique au bout d'une minute (coop)
    addGhost(p);
    addText(p.x, p.y - 30, t('JOUEUR {0} À TERRE', p.idx + 1), '#ff8f6b', 16, 2);
    flash('255,60,50', 0.3);
    if (alivePlayers().length === 0) gameOver();
  }
}
function dropGems(e) {
  let v = e.xp;
  while (v > 0) {
    const g = v >= 5 ? 5 : 1; v -= g;
    if (gems.length > 260) { const t = pick(gems); t.v += g; continue; }
    gems.push({ x: e.x + rand(-10, 10), y: e.y + rand(-10, 10), v: g, t: Math.random() * Math.PI * 2 });
  }
}

export { addText, burst, sparks, fireball, screenFlash, flash, ghosts, addGhost, damageEnemy, hurtPlayer, dropGems };
