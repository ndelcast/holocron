// Holocron Survivors — types, apparition, IA des boss
import { rand, irand, view } from './core.js';
import { S, session, players, nearestPlayer, teamCenter, enemies, ebullets, addRing, coopHpMult, coopBossMult, campaignMult } from './state.js';
import { LEVELS, BOSSES } from './levels.js';
import { sfx } from './audio.js';
import { addText, burst, flash, hurtPlayer } from './effects.js';
import { t } from './i18n.js';

// ------------------------------ Élites (sous-boss) ------------------------------
// Quatre ARCHÉTYPES d'IA aux gabarits distincts, débloqués avec le niveau
// d'équipe (minLvl) ; PV et dégâts grimpent avec le temps ET le niveau.
const ELITES = {
  sith:       { hp: 1, spd: 62, dmg: 26, r: 24, xp: 40, minLvl: 0, w: 10 },  // charge-frappe
  inquisitor: { hp: 0.8, spd: 55, dmg: 20, r: 22, xp: 45, minLvl: 6, w: 7 }, // lanceur à distance
  brute:      { hp: 1.9, spd: 40, dmg: 34, r: 30, xp: 55, minLvl: 12, w: 6 },// coup de zone
  adept:      { hp: 0.7, spd: 50, dmg: 16, r: 21, xp: 50, minLvl: 18, w: 6 },// caster kite
};
// Chaque destination incarne les 4 archétypes avec ses propres figures
// (sprites du bestiaire local, grossis par les rangs). Toujours 4 par niveau.
const ELITE_SETS = {
  space: {
    sith:       { spr: 'sith', name: 'SEIGNEUR SITH' },
    inquisitor: { spr: 'inquisitor', name: 'INQUISITEUR' },
    brute:      { spr: 'brute', name: 'COLOSSE SITH' },
    adept:      { spr: 'adept', name: 'ADEPTE OBSCUR' },
  },
  tatooine: {
    sith:       { spr: 'tusken', name: 'CHEF TUSKEN' },
    inquisitor: { spr: 'rodian', name: 'CHASSEUR RODIEN' },
    brute:      { spr: 'gamorrean', name: 'BRUTE GAMORRÉENNE' },
    adept:      { spr: 'jawa', name: 'SORCIER JAWA' },
  },
  deathstar: {
    sith:       { spr: 'royalguard', name: 'GARDE ROYAL' },
    inquisitor: { spr: 'inquisitor', name: 'INQUISITEUR' },
    brute:      { spr: 'brute', name: 'SENTINELLE POURPRE' },
    adept:      { spr: 'officer', name: 'OFFICIER ISB' },
  },
  hoth: {
    sith:       { spr: 'snowtrooper', name: 'COMMANDO DES NEIGES' },
    inquisitor: { spr: 'probe', name: 'SONDE ASSASSINE' },
    brute:      { spr: 'wampa', name: 'WAMPA ALPHA' },
    adept:      { spr: 'adept', name: 'ADEPTE DES GLACES' },
  },
  endor: {
    sith:       { spr: 'scout', name: 'COMMANDO SCOUT' },
    inquisitor: { spr: 'officer', name: 'OFFICIER DE GARNISON' },
    brute:      { spr: 'atst', name: 'AT-ST DE PATROUILLE' },
    adept:      { spr: 'adept', name: 'CHAMANE RENÉGAT' },
  },
};
function pickElite() {
  const pool = Object.entries(ELITES).filter(([, d]) => S.level >= d.minLvl);
  let total = 0; for (const [, d] of pool) total += d.w;
  let roll = Math.random() * total;
  for (const [id, d] of pool) { roll -= d.w; if (roll <= 0) return [id, d]; }
  return ['sith', ELITES.sith];
}

// ------------------------------ Ennemis ------------------------------
const ETYPES = {
  trooper:  { spr: 'trooper', r: 12, hp: 12, spd: 52, dmg: 8, xp: 1, minT: 0 },
  droid:    { spr: 'droid', r: 10, hp: 7, spd: 88, dmg: 6, xp: 1, minT: 40 },
  probe:    { spr: 'probe', r: 13, hp: 30, spd: 42, dmg: 11, xp: 3, minT: 110 },
  droideka: { spr: 'droideka', r: 16, hp: 70, spd: 34, dmg: 15, xp: 6, minT: 200 },
};
function spawnEnemy(typeId, boss = false, fixedAng = null) {
  const et = ETYPES[typeId] || null;
  const tc = teamCenter();
  const ang = fixedAng != null ? fixedAng : Math.random() * Math.PI * 2;
  const spawnZoom = session.count > 1 ? Math.min(view.zoom || 1, 0.6) : (view.zoom || 1);
  const d = Math.hypot(view.w, view.h) / (2 * spawnZoom) + 80;
  // PV liés au temps, au niveau d'équipe et au secteur de campagne
  const hpScale = (1 + S.time / 30 * 0.16) * (1 + S.level * 0.035) * coopHpMult() * campaignMult();
  if (boss) {
    const [eid, def] = pickElite();
    const skin = (ELITE_SETS[session.level] || ELITE_SETS.space)[eid];
    // rang selon le niveau d'équipe : II à 15+, III à 30+ (plus gros, plus fort)
    const rank = S.level >= 30 ? 3 : S.level >= 15 ? 2 : 1;
    const rankMult = [1, 1.5, 2.2][rank - 1];
    const roman = ['', ' II', ' III'][rank - 1];
    const bossHp = 380 * def.hp * rankMult * (1 + S.time / 70) * (1 + S.level * 0.03) * coopBossMult() * campaignMult();
    enemies.push({
      type: eid, spr: skin.spr, boss: true, ename: skin.name + roman, rank,
      sc: (1 + (rank - 1) * 0.18) * 1.35, // les élites dominent la horde d'une tête
      x: tc.x + Math.cos(ang) * d, y: tc.y + Math.sin(ang) * d,
      ph: Math.random() * Math.PI * 2,
      r: def.r * (1 + (rank - 1) * 0.18), hp: bossHp, maxHp: bossHp,
      spd: def.spd * (LEVELS[session.level].spdMult || 1),
      dmg: def.dmg * rankMult * (1 + S.level * 0.02), xp: def.xp * rank,
      flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
      atk1T: 2.5, windup: 0, dash: 0,
    });
    sfx.boss();
    addText(tc.x, tc.y - 70, t('{0} APPROCHE', t(skin.name)) + roman, '#ff3b3b', 20 + rank * 2, 2.4);
    const bw = document.getElementById('bosswarn');
    bw.classList.remove('on'); void bw.offsetWidth; bw.classList.add('on');
    setTimeout(() => bw.classList.remove('on'), 1600);
    return;
  }
  const skin = (LEVELS[session.level].mobs || {})[typeId] || et.spr;
  enemies.push({
    type: typeId, spr: skin, boss: false, ph: Math.random() * Math.PI * 2,
    x: tc.x + Math.cos(ang) * d, y: tc.y + Math.sin(ang) * d,
    r: et.r, hp: et.hp * hpScale, maxHp: et.hp * hpScale,
    spd: et.spd * rand(0.9, 1.1) * (LEVELS[session.level].spdMult || 1), dmg: et.dmg, xp: et.xp, flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
  });
}
function spawnFinalBoss() {
  const tc = teamCenter();
  const bid = LEVELS[session.level].boss;
  const B = BOSSES[bid];
  const bossHp = B.hp * (1 + S.level * 0.03) * coopBossMult() * campaignMult();
  const ang = Math.random() * Math.PI * 2;
  const spawnZoom = session.count > 1 ? Math.min(view.zoom || 1, 0.6) : (view.zoom || 1);
  const d = Math.hypot(view.w, view.h) / (2 * spawnZoom) + 100;
  enemies.push({
    type: bid, spr: B.spr, boss: true, final: true, ph: Math.random() * Math.PI * 2,
    x: tc.x + Math.cos(ang) * d, y: tc.y + Math.sin(ang) * d,
    r: B.r, hp: bossHp, maxHp: bossHp, spd: B.spd, dmg: B.dmg, xp: B.xp,
    flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
    atk1T: 2.5, atk2T: 6, windup: 0, dash: 0, grip: 0,
  });
  sfx.boss();
  addText(tc.x, tc.y - 70, t('{0} VOUS DÉFIE', t(B.name)), '#ff3b3b', 22, 3);
  flash('255,59,59', 0.4);
  S.freeze = 0.5;
  addRing(tc.x, tc.y, 480, '255,59,59', 5, 1);
  const bw = document.getElementById('bosswarn');
  bw.classList.remove('on'); void bw.offsetWidth; bw.classList.add('on');
  setTimeout(() => bw.classList.remove('on'), 1600);
}
// IA des boss finaux — renvoie true si le déplacement par défaut doit être sauté
function bossAI(e, dt) {
  const tgt = nearestPlayer(e.x, e.y);
  if (!tgt) return false;
  const player = tgt; // le boss vise le joueur vivant le plus proche
  const distP = Math.hypot(player.x - e.x, player.y - e.y);
  const aTo = Math.atan2(player.y - e.y, player.x - e.x);
  switch (e.type) {
    // ---- élites (sous-boss) ----
    case 'sith': {
      // charge-frappe télégraphiée, sinon poursuite par défaut
      e.atk1T -= dt;
      if (e.dash > 0) {
        e.dash -= dt;
        e.x += e.dashVx * dt; e.y += e.dashVy * dt;
        if (Math.random() < 0.6) burst(e.x, e.y, '#ff3b3b', 1, 50);
        return true;
      }
      if (e.windup > 0) {
        e.windup -= dt;
        if (e.windup <= 0) {
          e.dash = 0.4;
          e.dashVx = Math.cos(aTo) * 480; e.dashVy = Math.sin(aTo) * 480;
          sfx.wave();
        }
        return true;
      }
      if (e.atk1T <= 0 && distP < 300) {
        e.atk1T = 3.5;
        e.windup = 0.45;
        addText(e.x, e.y - e.r - 16, '!', '#ff3b3b', 24, 0.5);
        return true;
      }
      return false;
    }
    case 'inquisitor': {
      // lance son sabre boomerang et garde ses distances
      e.atk1T -= dt;
      if (e.atk1T <= 0 && distP < 600) {
        e.atk1T = 3.5;
        sfx.zap();
        ebullets.push({ x: e.x, y: e.y, vx: Math.cos(aTo) * 320, vy: Math.sin(aTo) * 320, dmg: e.dmg * 0.9, life: 2.4, r: 13, saber: true, owner: e, t: 0 });
      }
      let mv;
      if (distP > 380) mv = aTo;
      else if (distP < 250) mv = aTo + Math.PI;
      else mv = aTo + Math.PI / 2;
      e.x += Math.cos(mv) * e.spd * e.slow * dt;
      e.y += Math.sin(mv) * e.spd * e.slow * dt;
      return true;
    }
    case 'brute': {
      // coup de masse en zone, longuement télégraphié
      e.atk1T -= dt;
      if (e.windup > 0) {
        e.windup -= dt;
        if (e.windup <= 0) {
          sfx.boom();
          flash('255,80,60', 0.2);
          addRing(e.x, e.y, 150, '255,73,84', 6, 0.5);
          burst(e.x, e.y, '#ff8f6b', 18, 260);
          for (const pl of players) {
            if (pl.dead) continue;
            if (Math.hypot(pl.x - e.x, pl.y - e.y) < 150 + pl.r) hurtPlayer(pl, e.dmg);
          }
        }
        return true; // immobile pendant qu'il arme son coup
      }
      if (e.atk1T <= 0 && distP < 140) {
        e.atk1T = 4.5;
        e.windup = 0.7;
        addRing(e.x, e.y, 150, '255,180,90', 3, 0.7);
        addText(e.x, e.y - e.r - 16, '!', '#ffd166', 26, 0.7);
        return true;
      }
      return false;
    }
    case 'adept': {
      // volées d'éclairs, kite à distance
      e.atk1T -= dt;
      if (e.atk1T <= 0 && distP < 550) {
        e.atk1T = 3;
        sfx.zap();
        for (let i = -1; i <= 1; i++) {
          const a = aTo + i * 0.16;
          ebullets.push({ x: e.x, y: e.y - 6, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, dmg: e.dmg * 0.8, life: 1.8, r: 5, zap: true, color: '165,130,255' });
        }
      }
      let mv;
      if (distP > 380) mv = aTo;
      else if (distP < 260) mv = aTo + Math.PI;
      else mv = aTo + Math.PI / 2;
      e.x += Math.cos(mv) * e.spd * e.slow * dt;
      e.y += Math.sin(mv) * e.spd * e.slow * dt;
      return true;
    }
    // ---- boss finaux ----
    case 'maul': {
      e.atk1T -= dt;
      if (e.dash > 0) {
        e.dash -= dt;
        e.x += e.dashVx * dt; e.y += e.dashVy * dt;
        if (Math.random() < 0.7) burst(e.x, e.y, '#ff3b3b', 1, 60);
        return true;
      }
      if (e.windup > 0) {
        e.windup -= dt;
        if (e.windup <= 0) {
          e.dash = 0.5;
          e.dashVx = Math.cos(aTo) * 640; e.dashVy = Math.sin(aTo) * 640;
          sfx.wave();
        }
        return true;
      }
      if (e.atk1T <= 0 && distP < 440) {
        e.atk1T = 4.2;
        e.windup = 0.55;
        addText(e.x, e.y - e.r - 16, '!', '#ff3b3b', 24, 0.6);
        return true;
      }
      return false;
    }
    case 'jabba': {
      e.atk1T -= dt; e.atk2T -= dt;
      if (e.atk1T <= 0 && distP < 700) {
        e.atk1T = 3.4;
        sfx.throw();
        for (let i = -1; i <= 1; i++) {
          const a = aTo + i * 0.24;
          ebullets.push({ x: e.x, y: e.y - 10, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, dmg: 18, life: 3, r: 7, color: '150,220,90' });
        }
      }
      if (e.atk2T <= 0) {
        e.atk2T = 9;
        for (let i = 0; i < 4; i++) spawnEnemy(Math.random() < 0.5 ? 'trooper' : 'droid');
        addText(e.x, e.y - e.r - 16, t('RENFORTS !'), '#ffd166', 14, 1.2);
      }
      return false;
    }
    case 'vader': {
      e.atk1T -= dt; e.atk2T -= dt;
      if (e.atk1T <= 0 && distP < 540) {
        e.atk1T = 5;
        sfx.zap();
        ebullets.push({ x: e.x, y: e.y, vx: Math.cos(aTo) * 340, vy: Math.sin(aTo) * 340, dmg: 24, life: 2.6, r: 15, saber: true, owner: e, t: 0 });
      }
      if (e.atk2T <= 0 && distP < 480 && distP > 130) {
        e.atk2T = 9;
        e.grip = 0.9;
        addText(player.x, player.y - 32, t('POIGNE DE LA FORCE'), '#ff3b3b', 14, 1);
      }
      if (e.grip > 0) {
        e.grip -= dt;
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        player.x += Math.cos(a) * 250 * dt;
        player.y += Math.sin(a) * 250 * dt;
      }
      return false;
    }
    case 'boba': {
      e.atk1T -= dt;
      if (e.atk1T <= 0 && distP < 640) {
        e.atk1T = 3.2;
        sfx.pew();
        for (let i = 0; i < 3; i++) {
          const a = aTo + rand(-0.22, 0.22);
          ebullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, dmg: 20, life: 2.3, r: 6, rocket: true, radius: 60, color: '255,170,90' });
        }
      }
      // orbite à distance de tir, jetpack
      let mv;
      if (distP > 330) mv = aTo;
      else if (distP < 230) mv = aTo + Math.PI;
      else mv = aTo + Math.PI / 2;
      e.x += Math.cos(mv) * e.spd * dt;
      e.y += Math.sin(mv) * e.spd * dt;
      if (Math.random() < 0.4) burst(e.x - 4, e.y + 10, '#ffb166', 1, 40);
      return true;
    }
    case 'palpatine': {
      e.atk1T -= dt;
      if (e.atk1T <= 0 && distP < 560) {
        e.atk1T = 3.4;
        sfx.zap();
        for (let i = -2; i <= 2; i++) {
          const a = aTo + i * 0.13;
          ebullets.push({ x: e.x, y: e.y - 8, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, dmg: 14, life: 1.8, r: 5, zap: true, color: '165,130,255' });
        }
      }
      let mv;
      if (distP > 320) mv = aTo;
      else if (distP < 210) mv = aTo + Math.PI;
      else mv = aTo + Math.PI / 2;
      e.x += Math.cos(mv) * e.spd * dt;
      e.y += Math.sin(mv) * e.spd * dt;
      return true;
    }
  }
  return false;
}
function pickEnemyType() {
  const pool = [];
  if (S.time >= 0) pool.push(['trooper', 10]);
  if (S.time >= ETYPES.droid.minT) pool.push(['droid', 6]);
  if (S.time >= ETYPES.probe.minT) pool.push(['probe', 3.5]);
  if (S.time >= ETYPES.droideka.minT) pool.push(['droideka', 2]);
  let total = 0; for (const p of pool) total += p[1];
  let roll = Math.random() * total;
  for (const [id, w] of pool) { roll -= w; if (roll <= 0) return id; }
  return 'trooper';
}

export { ETYPES, ELITES, ELITE_SETS, spawnEnemy, spawnFinalBoss, bossAI, pickEnemyType };
