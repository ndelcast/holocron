// Holocron Survivors — types, apparition, IA des boss
'use strict';

// ------------------------------ Ennemis ------------------------------
const ETYPES = {
  trooper:  { spr: 'trooper', r: 12, hp: 12, spd: 52, dmg: 8, xp: 1, minT: 0 },
  droid:    { spr: 'droid', r: 10, hp: 7, spd: 88, dmg: 6, xp: 1, minT: 40 },
  probe:    { spr: 'probe', r: 13, hp: 30, spd: 42, dmg: 11, xp: 3, minT: 110 },
  droideka: { spr: 'droideka', r: 16, hp: 70, spd: 34, dmg: 15, xp: 6, minT: 200 },
};
function spawnEnemy(typeId, boss = false) {
  const t = ETYPES[typeId] || null;
  const ang = Math.random() * Math.PI * 2;
  const d = Math.hypot(W, H) / 2 + 60;
  const hpScale = 1 + S.time / 30 * 0.16;
  if (boss) {
    enemies.push({
      type: 'sith', spr: 'sith', boss: true,
      x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d,
      r: 24, hp: 380 * (1 + S.time / 70), maxHp: 380 * (1 + S.time / 70),
      spd: 62 * (LEVELS[selectedLevel].spdMult || 1), dmg: 26, xp: 40, flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
    });
    sfx.boss();
    addText(player.x, player.y - 70, 'UN SEIGNEUR SITH APPROCHE', '#ff3b3b', 20, 2.4);
    const bw = document.getElementById('bosswarn');
    bw.classList.remove('on'); void bw.offsetWidth; bw.classList.add('on');
    setTimeout(() => bw.classList.remove('on'), 1600);
    return;
  }
  enemies.push({
    type: typeId, spr: t.spr, boss: false,
    x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d,
    r: t.r, hp: t.hp * hpScale, maxHp: t.hp * hpScale,
    spd: t.spd * rand(0.9, 1.1) * (LEVELS[selectedLevel].spdMult || 1), dmg: t.dmg, xp: t.xp, flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
  });
}
function spawnFinalBoss() {
  const bid = LEVELS[selectedLevel].boss;
  const B = BOSSES[bid];
  const ang = Math.random() * Math.PI * 2;
  const d = Math.hypot(W, H) / 2 + 80;
  enemies.push({
    type: bid, spr: B.spr, boss: true, final: true,
    x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d,
    r: B.r, hp: B.hp, maxHp: B.hp, spd: B.spd, dmg: B.dmg, xp: B.xp,
    flash: 0, kx: 0, ky: 0, saberHit: -9, waveId: -1, slowT: 0, slow: 1,
    atk1T: 2.5, atk2T: 6, windup: 0, dash: 0, grip: 0,
  });
  sfx.boss();
  addText(player.x, player.y - 70, B.name + ' VOUS DÉFIE', '#ff3b3b', 22, 3);
  flash('255,59,59', 0.4);
  S.freeze = 0.5;
  addRing(player.x, player.y, 480, '255,59,59', 5, 1);
  const bw = document.getElementById('bosswarn');
  bw.classList.remove('on'); void bw.offsetWidth; bw.classList.add('on');
  setTimeout(() => bw.classList.remove('on'), 1600);
}
// IA des boss finaux — renvoie true si le déplacement par défaut doit être sauté
function bossAI(e, dt) {
  const distP = Math.hypot(player.x - e.x, player.y - e.y);
  const aTo = Math.atan2(player.y - e.y, player.x - e.x);
  switch (e.type) {
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
        addText(e.x, e.y - e.r - 16, 'RENFORTS !', '#ffd166', 14, 1.2);
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
        addText(player.x, player.y - 32, 'POIGNE DE LA FORCE', '#ff3b3b', 14, 1);
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
