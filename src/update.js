// Holocron Survivors — simulation par frame, HUD
import { rand, irand, dist2, clamp, pick } from './core.js';
import { keys, touch } from './input.js';
import { S, player, session, runtime, enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, decals, bonuses, weapons, addRing } from './state.js';
import { LEVELS, BOSSES, RUN_TIME, FINAL_BOSS_TIME } from './levels.js';
import { CHARS, BONUSES } from './gamedata.js';
import { spawnEnemy, spawnFinalBoss, bossAI, pickEnemyType } from './enemies.js';
import { tickWeapons, explode } from './combat.js';
import { damageEnemy, hurtPlayer, addText, burst, sparks, flash, ghosts } from './effects.js';
import { gainXp } from './levelup.js';
import { sfx } from './audio.js';
import { endRun } from './lifecycle.js';

// ------------------------------ Bonus de ravitaillement ------------------------------
function applyBonus(b) {
  sfx.lvl();
  addRing(b.x, b.y, 170, BONUSES[b.type].rgb, 4, 0.5);
  burst(b.x, b.y, '#ffffff', 12, 230);
  S.zoomKick = Math.max(S.zoomKick, 0.05);
  switch (b.type) {
    case 'bacta':
      player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.4);
      addText(b.x, b.y - 28, 'BACTA  +40 % PV', '#52ff7a', 18, 1.6);
      break;
    case 'holo':
      addText(b.x, b.y - 28, 'HOLOCRON : NIVEAU SUPÉRIEUR', '#6ee7ff', 17, 1.8);
      gainXp(Math.max(1, S.xpNext - S.xp + 0.5));
      break;
    case 'ion':
      flash('165,130,255', 0.4);
      addRing(b.x, b.y, 700, '165,130,255', 6, 0.8);
      S.shake = Math.max(S.shake, 10);
      addText(b.x, b.y - 28, 'IMPULSION IONIQUE', '#a582ff', 18, 1.6);
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if (d < 700) damageEnemy(e, e.boss ? 150 : 300, Math.atan2(e.y - b.y, e.x - b.x), e.boss ? 0 : 320);
      }
      break;
    case 'magnet':
      addText(b.x, b.y - 28, 'AIMANT GALACTIQUE', '#ffd166', 18, 1.6);
      for (const g of gems) g.mag = true;
      break;
  }
}

// ------------------------------ Boucle principale ------------------------------
function update(dt) {
  S.time += dt;
  // --- déplacement joueur
  let mx = 0, my = 0;
  if (keys.KeyW || keys.ArrowUp) my -= 1;
  if (keys.KeyS || keys.ArrowDown) my += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (touch.active && Math.hypot(touch.dx, touch.dy) > 0.12) { mx = touch.dx; my = touch.dy; }
  if (mx || my) {
    const l = Math.hypot(mx, my);
    player.x += mx / l * player.speed * dt;
    player.y += my / l * player.speed * dt;
    if (mx) player.face = Math.sign(mx);
    // image rémanente
    S.afterT -= dt;
    if (S.afterT <= 0) {
      S.afterT = 0.09;
      if (ghosts.length > 30) ghosts.shift();
      ghosts.push({ spr: CHARS[session.char].spr, x: player.x, y: player.y, t: 0, kind: 'after', flip: player.face });
    }
    // poussière de déplacement
    if (Math.random() < 0.55 && particles.length < 500) {
      particles.push({
        x: player.x - mx / l * 10 + rand(-5, 5), y: player.y + 10 + rand(-3, 3),
        vx: -mx / l * rand(20, 55) + rand(-12, 12), vy: -my / l * rand(20, 55) - rand(4, 18),
        life: rand(0.25, 0.5), color: LEVELS[session.level].dust, size: rand(1.5, 3.2),
      });
    }
  }
  player.invuln = Math.max(0, player.invuln - dt);
  if (player.regen > 0) player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);

  // --- spawn
  S.spawnT -= dt;
  const interval = Math.max(0.16, (1.15 - S.time * 0.0032) * (LEVELS[session.level].spawnMult || 1));
  const perSpawn = 1 + Math.floor(S.time / 55);
  if (S.spawnT <= 0 && enemies.length < 230) {
    S.spawnT = interval;
    for (let i = 0; i < perSpawn; i++) spawnEnemy(pickEnemyType());
  }
  const finalAlive = enemies.some(e => e.final);
  S.bossT -= dt;
  if (S.bossT <= 0) {
    if (finalAlive) S.bossT = 15; // pas d'élite pendant le duel final
    else { S.bossT = 90; spawnEnemy(null, true); }
  }
  // boss de fin de niveau et limite de 20 minutes
  if (!S.finalWarn && S.time >= FINAL_BOSS_TIME - 10) {
    S.finalWarn = true;
    addText(player.x, player.y - 80, 'UNE PRÉSENCE PUISSANTE APPROCHE…', '#ff8f6b', 16, 3);
  }
  if (!S.finalSpawned && S.time >= FINAL_BOSS_TIME) {
    S.finalSpawned = true;
    spawnFinalBoss();
  }
  if (S.time >= RUN_TIME) { endRun(); return; }

  // --- ravitaillements largués sur la carte (3 max)
  S.bonusT -= dt;
  if (S.bonusT <= 0) {
    S.bonusT = 24;
    if (bonuses.length < 3) {
      const a = rand(0, Math.PI * 2), d = rand(700, 1300);
      bonuses.push({ x: player.x + Math.cos(a) * d, y: player.y + Math.sin(a) * d, type: pick(Object.keys(BONUSES)), t: 0 });
      addText(player.x, player.y - 70, 'RAVITAILLEMENT LARGUÉ — SUIS LA BALISE', '#ffd166', 14, 2.4);
      sfx.gem();
    }
  }
  for (let i = bonuses.length - 1; i >= 0; i--) {
    const b = bonuses[i];
    b.t += dt;
    if (dist2(b.x, b.y, player.x, player.y) < (player.r + 18) * (player.r + 18)) {
      bonuses.splice(i, 1);
      applyBonus(b);
      if (S.scene !== 'play') return; // holocron : le level-up a ouvert le choix
    }
  }

  // --- armes
  tickWeapons(dt);

  // --- ondes de Force
  for (let i = waves.length - 1; i >= 0; i--) {
    const wv = waves[i];
    wv.r += 620 * dt;
    for (const e of enemies) {
      if (e.waveId === wv.id || e.dead) continue;
      const d = Math.hypot(e.x - wv.x, e.y - wv.y);
      if (d < wv.r + e.r) {
        e.waveId = wv.id;
        const a = Math.atan2(e.y - wv.y, e.x - wv.x);
        damageEnemy(e, wv.dmg, a, e.boss ? 0 : 420);
      }
    }
    if (wv.r > wv.maxR) waves.splice(i, 1);
  }

  // --- ennemis
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) { enemies.splice(i, 1); continue; }
    e.flash = Math.max(0, e.flash - dt);
    e.slowT = Math.max(0, e.slowT - dt);
    if (e.boss && Math.random() < dt * 10 && particles.length < 600) {
      const life = rand(0.4, 0.8);
      particles.push({ type: 'glow', x: e.x + rand(-e.r, e.r), y: e.y + rand(-e.r * 0.5, e.r), vx: rand(-10, 10), vy: -rand(25, 55), life, max: life, rgb: '255,80,60', size: rand(2, 4) });
    }
    const skipMove = e.final ? bossAI(e, dt) : false;
    if (!skipMove) {
      const esp = e.spd * (e.slowT > 0 ? e.slow : 1);
      const a = Math.atan2(player.y - e.y, player.x - e.x);
      e.x += (Math.cos(a) * esp + e.kx) * dt;
      e.y += (Math.sin(a) * esp + e.ky) * dt;
    }
    e.kx *= Math.pow(0.002, dt); e.ky *= Math.pow(0.002, dt);
    // séparation grossière (1 voisin aléatoire, pas cher et suffisant)
    if (enemies.length > 1) {
      const o = enemies[irand(0, enemies.length - 1)];
      if (o !== e) {
        const d2 = dist2(e.x, e.y, o.x, o.y), min = (e.r + o.r) * 0.9;
        if (d2 < min * min && d2 > 0.01) {
          const d = Math.sqrt(d2), push = (min - d) * 0.5;
          e.x += (e.x - o.x) / d * push; e.y += (e.y - o.y) / d * push;
        }
      }
    }
    // contact joueur
    const pd = dist2(e.x, e.y, player.x, player.y);
    const rr = e.r + player.r;
    if (pd < rr * rr) {
      hurtPlayer(e.dmg);
      if (S.scene !== 'play') return;
    }
  }

  // --- projectiles
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) {
      if (b.rocket) explode(b.x, b.y, b.dmg, b.radius);
      else if (b.endor) explode(b.x, b.y, b.edmg, b.eradius);
      bullets.splice(i, 1); continue;
    }
    if (b.rocket && particles.length < 500 && Math.random() < 0.6) {
      particles.push({ x: b.x, y: b.y, vx: rand(-20, 20), vy: rand(-20, 20), life: rand(0.15, 0.3), color: '#ffb166', size: rand(1.5, 3) });
    }
    for (const e of enemies) {
      if (e.dead) continue;
      const rr = e.r + 5;
      if (dist2(b.x, b.y, e.x, e.y) < rr * rr) {
        if (b.rocket) { explode(b.x, b.y, b.dmg, b.radius); bullets.splice(i, 1); break; }
        if (b.pierce) { if (b.hit.has(e)) continue; b.hit.add(e); sparks(b.x, b.y, '255,226,176', 3, 200); damageEnemy(e, b.dmg, b.a, 120); continue; }
        sparks(b.x, b.y, b.spr === 'boltRed' ? '255,150,120' : '150,225,255', 4, 240);
        damageEnemy(e, b.dmg, b.a, 60);
        bullets.splice(i, 1);
        break;
      }
    }
  }

  // --- projectiles ennemis
  for (let i = ebullets.length - 1; i >= 0; i--) {
    const b = ebullets[i];
    if (b.saber) {
      b.t += dt;
      if (b.t > 1.05 && b.owner && !b.owner.dead) {
        const a = Math.atan2(b.owner.y - b.y, b.owner.x - b.x);
        b.vx = Math.cos(a) * 430; b.vy = Math.sin(a) * 430;
        if (dist2(b.owner.x, b.owner.y, b.x, b.y) < 26 * 26) { ebullets.splice(i, 1); continue; }
      }
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    const rr = (b.r || 5) + player.r;
    if (dist2(b.x, b.y, player.x, player.y) < rr * rr && player.invuln <= 0) {
      if (b.rocket) {
        booms.push({ x: b.x, y: b.y, r: b.radius, life: 0.25 });
        sfx.boom(); burst(b.x, b.y, '#ffb166', 10, 180);
      }
      hurtPlayer(b.dmg);
      if (!b.saber) ebullets.splice(i, 1);
      if (S.scene !== 'play') return;
      continue;
    }
    if (b.life <= 0) {
      if (b.rocket) {
        booms.push({ x: b.x, y: b.y, r: b.radius, life: 0.25 });
        sfx.boom(); burst(b.x, b.y, '#ffb166', 10, 180);
        if (dist2(b.x, b.y, player.x, player.y) < (b.radius + player.r) * (b.radius + player.r)) hurtPlayer(b.dmg);
        if (S.scene !== 'play') return;
      }
      ebullets.splice(i, 1);
    }
  }

  // --- explosions (visuel)
  for (let i = booms.length - 1; i >= 0; i--) {
    booms[i].life -= dt;
    if (booms[i].life <= 0) booms.splice(i, 1);
  }

  // --- grenades en vol
  for (let i = grenades.length - 1; i >= 0; i--) {
    const gr = grenades[i];
    gr.t += dt;
    if (gr.t >= gr.dur) { explode(gr.tx, gr.ty, gr.dmg, gr.radius); grenades.splice(i, 1); }
  }

  // --- nappes de feu
  for (let i = firePools.length - 1; i >= 0; i--) {
    const fp = firePools[i];
    fp.life -= dt; fp.tick -= dt;
    if (Math.random() < dt * 10 && particles.length < 500) {
      const a = Math.random() * Math.PI * 2, rr2 = Math.sqrt(Math.random()) * fp.r;
      particles.push({ x: fp.x + Math.cos(a) * rr2, y: fp.y + Math.sin(a) * rr2, vx: 0, vy: -rand(20, 60), life: rand(0.3, 0.6), color: pick(['#ffb166', '#ff8c42']), size: rand(1.5, 3.5) });
    }
    if (fp.tick <= 0) {
      fp.tick = 0.4;
      for (const e of enemies) {
        if (e.dead) continue;
        if (dist2(e.x, e.y, fp.x, fp.y) < (fp.r + e.r) * (fp.r + e.r)) damageEnemy(e, fp.dmg, null, 0, true);
      }
    }
    if (fp.life <= 0) firePools.splice(i, 1);
  }
  player.comboWaveCd = Math.max(0, (player.comboWaveCd || 0) - dt);

  // --- cristaux
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    g.t += dt * 3;
    const d = Math.hypot(g.x - player.x, g.y - player.y);
    if (g.mag || d < player.magnet) {
      const sp = g.mag ? 720 : 260 + (player.magnet - d) * 6;
      g.x += (player.x - g.x) / d * sp * dt;
      g.y += (player.y - g.y) / d * sp * dt;
      if (Math.random() < dt * 14 && particles.length < 600) {
        particles.push({ type: 'streak', x: g.x, y: g.y, vx: (player.x - g.x) / d * 90, vy: (player.y - g.y) / d * 90, life: 0.18, max: 0.18, rgb: '120,225,255', size: 1.4 });
      }
    }
    if (d < player.r + 10) {
      gems.splice(i, 1);
      sfx.gem();
      sparks(g.x, g.y, g.v >= 5 ? '255,220,140' : '140,235,255', 3, 150);
      gainXp(g.v);
      if (S.scene !== 'play') return; // level-up ouvert
    }
  }

  // --- particules / textes / arcs
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y -= 26 * dt; t.life -= dt;
    if (t.life <= 0) texts.splice(i, 1);
  }
  for (let i = arcs.length - 1; i >= 0; i--) {
    arcs[i].life -= dt;
    if (arcs[i].life <= 0) arcs.splice(i, 1);
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].life -= dt;
    if (rings[i].life <= 0) rings.splice(i, 1);
  }
  for (let i = ghosts.length - 1; i >= 0; i--) {
    ghosts[i].t += dt;
    if (ghosts[i].t > 0.22) ghosts.splice(i, 1);
  }
  S.beamT = Math.max(0, (S.beamT || 0) - dt);
  S.streakT -= dt;
  if (S.streakT <= 0) S.streak = 0;
  for (let i = decals.length - 1; i >= 0; i--) {
    decals[i].life -= dt;
    if (decals[i].life <= 0) decals.splice(i, 1);
  }
  S.shake = Math.max(0, S.shake - 40 * dt);

  updateHud();
}

function updateHud() {
  const left = Math.max(0, RUN_TIME - S.time);
  const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  const timerEl = document.getElementById('timer');
  timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  timerEl.style.color = left < 60 ? '#ffd166' : '';
  // barre de vie du boss final
  const fb = enemies.find(e => e.final);
  const bb = document.getElementById('bossbar');
  if (fb) {
    bb.style.display = 'block';
    document.getElementById('bossname').textContent = BOSSES[fb.type].name;
    document.getElementById('bosshpfill').style.width = clamp(fb.hp / fb.maxHp * 100, 0, 100) + '%';
  } else bb.style.display = 'none';
  document.getElementById('kills').textContent = S.kills;
  document.getElementById('lvl').textContent = S.level;
  document.getElementById('xpfill').style.width = (S.xp / S.xpNext * 100) + '%';
  document.getElementById('hpfill').style.width = clamp(player.hp / player.maxHp * 100, 0, 100) + '%';
  document.getElementById('hpnum').textContent = Math.max(0, Math.ceil(player.hp)) + ' / ' + Math.round(player.maxHp);
  document.getElementById('lowhp').classList.toggle('on', S.scene === 'play' && player.hp / player.maxHp < 0.3);
}

export { update, updateHud };
