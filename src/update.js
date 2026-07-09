// Holocron Survivors — simulation par frame, HUD
import { rand, irand, dist2, clamp, pick, DEBUG } from './core.js';
import { keys, touch, padMove, firstFreePad } from './input.js';
import { S, session, runtime, campaign, vehicle, players, alivePlayers, nearestPlayer, teamCenter, enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, decals, bonuses, addRing, coopSpawnMult, campaignMult } from './state.js';
import { LEVELS, BOSSES, RUN_TIME, FINAL_BOSS_TIME } from './levels.js';
import { BONUSES } from './gamedata.js';
import { spawnEnemy, spawnFinalBoss, bossAI, pickEnemyType } from './enemies.js';
import { tickWeapons, explode, fireBolt, nearestEnemy } from './combat.js';
import { damageEnemy, hurtPlayer, addText, burst, sparks, flash, ghosts } from './effects.js';
import { gainXp } from './levelup.js';
import { sfx } from './audio.js';
import { endRun } from './lifecycle.js';
import { t } from './i18n.js';

// ------------------------------ Bonus de ravitaillement ------------------------------
function applyBonus(b, taker) {
  sfx.lvl();
  addRing(b.x, b.y, 170, BONUSES[b.type].rgb, 4, 0.5);
  burst(b.x, b.y, '#ffffff', 12, 230);
  S.zoomKick = Math.max(S.zoomKick, 0.05);
  switch (b.type) {
    case 'bacta':
      for (const p of players) {
        if (p.dead) {
          // le bacta réanime les équipiers tombés
          p.dead = false;
          p.hp = p.maxHp * 0.5;
          p.invuln = 2;
          addText(p.x, p.y - 30, t('RÉANIMÉ !'), '#52ff7a', 18, 2);
          addRing(p.x, p.y, 240, '82,255,122', 4, 0.6);
        } else {
          p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4);
        }
      }
      addText(b.x, b.y - 28, t('BACTA  +40 % PV'), '#52ff7a', 18, 1.6);
      break;
    case 'holo':
      addText(b.x, b.y - 28, t('HOLOCRON : NIVEAU SUPÉRIEUR'), '#6ee7ff', 17, 1.8);
      gainXp(Math.max(1, S.xpNext - S.xp + 0.5), taker);
      break;
    case 'ion':
      flash('165,130,255', 0.4);
      addRing(b.x, b.y, 700, '165,130,255', 6, 0.8);
      S.shake = Math.max(S.shake, 10);
      addText(b.x, b.y - 28, t('IMPULSION IONIQUE'), '#a582ff', 18, 1.6);
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if (d < 700) damageEnemy(e, e.boss ? 150 : 300, Math.atan2(e.y - b.y, e.x - b.x), e.boss ? 0 : 320, false, taker);
      }
      break;
    case 'magnet':
      addText(b.x, b.y - 28, t('AIMANT GALACTIQUE'), '#ffd166', 18, 1.6);
      for (const g of gems) g.mag = true;
      break;
  }
}

// ------------------------------ Assauts aléatoires ------------------------------
// Vague-surprise toutes les 40-80 s : encerclement, ruée rapide ou blindés.
// Taille liée au temps, à la coop et au secteur ; suspendu pendant le duel final.
function spawnSurge(tc) {
  const kind = pick(['ring', 'rush', 'heavy']);
  let n = Math.round((10 + S.time / 60 * 3) * coopSpawnMult() * campaignMult());
  n = Math.max(6, Math.min(n, 700 - enemies.length));
  if (n <= 0) return;
  const base = Math.random() * Math.PI * 2;
  if (kind === 'ring') {
    for (let i = 0; i < n; i++) spawnEnemy(pickEnemyType(), false, base + i / n * Math.PI * 2);
    addText(tc.x, tc.y - 80, t('ENCERCLEMENT !'), '#ff8f6b', 20, 2.2);
  } else if (kind === 'rush') {
    for (let i = 0; i < n; i++) spawnEnemy('droid', false, base + rand(-0.35, 0.35));
    addText(tc.x, tc.y - 80, t('RUÉE DE DROÏDES !'), '#ff8f6b', 20, 2.2);
  } else {
    for (let i = 0; i < Math.ceil(n / 2); i++) {
      const type = S.time >= 200 && Math.random() < 0.5 ? 'droideka' : 'probe';
      spawnEnemy(type, false, base + rand(-0.6, 0.6));
    }
    addText(tc.x, tc.y - 80, t('BLINDÉS EN APPROCHE !'), '#ff8f6b', 20, 2.2);
  }
  flash('255,110,60', 0.22);
  sfx.boss();
  S.shake = Math.max(S.shake, 8);
  const bw = document.getElementById('bosswarn');
  bw.classList.remove('on'); void bw.offsetWidth; bw.classList.add('on');
  setTimeout(() => bw.classList.remove('on'), 1600);
}

// ------------------------------ Armement lourd ------------------------------
// L'engin thématique est lâché par l'élite Sith vaincue (voir effects.js) :
// tourelle fixe (un joueur, invulnérable, feu 360°) ou véhicule (conducteur +
// équipiers, lasers automatiques et écrasement). Actif 1 minute, un seul à la fois.
function tickVehicle(dt, tc0) {
  const drop = vehicle.drop;
  if (drop) {
    drop.t += dt;
    for (const p of players) {
      if (p.dead) continue;
      if (dist2(drop.x, drop.y, p.x, p.y) < (p.r + 26) * (p.r + 26)) {
        vehicle.active = { def: drop.def, t: drop.def.dur, x: drop.x, y: drop.y, riders: [p.idx], fireT: 0, ramT: 0 };
        vehicle.drop = null;
        addText(p.x, p.y - 44, t('{0} — 1 MIN !', t(drop.def.name)), '#ffd166', 18, 2.5);
        flash('255,209,102', 0.25);
        sfx.boss();
        break;
      }
    }
  }
  const act = vehicle.active;
  if (!act) return;
  act.t -= dt;
  if (act.t <= 0) {
    for (const idx of act.riders) players[idx].invuln = 1;
    addText(act.x, act.y - 40, t('ARMEMENT ÉPUISÉ'), '#8fb8cc', 14, 2);
    vehicle.active = null;
    return;
  }
  if (act.def.ram) {
    // écrasement au contact (speeders, AT-ST)
    act.ramT -= dt;
    if (act.ramT <= 0) {
      act.ramT = 0.15;
      const driver = players[act.riders[0]];
      for (const e of enemies) {
        if (e.dead) continue;
        if (dist2(e.x, e.y, act.x, act.y) < (act.def.radius + e.r) * (act.def.radius + e.r)) {
          damageEnemy(e, act.def.ram * (1 + S.level * 0.04), Math.atan2(e.y - act.y, e.x - act.x), e.boss ? 0 : 380, false, driver);
        }
      }
    }
  }
  // feu automatique : gros bolts (un tir par monteur, deux pour les tourelles)
  act.fireT -= dt;
  if (act.fireT <= 0) {
    act.fireT = act.def.cd;
    const shots = act.def.shots || 1;
    const owner = players[act.riders[0]];
    let fired = false;
    for (let i = 0; i < shots; i++) {
      const tgt = nearestEnemy(act.x + rand(-40, 40), act.y + rand(-40, 40), act.def.range || 650);
      if (!tgt) break;
      fireBolt(act.x, act.y - 8, tgt.x + rand(-20, 20), tgt.y + rand(-20, 20), act.def.dmg * (1 + S.level * 0.04), 'boltRed', 680, owner.idx);
      fired = true;
    }
    if (fired) sfx.pew();
  }
}

// ------------------------------ Boucle principale ------------------------------
function update(dt) {
  S.time += dt;
  // --- déplacements de l'équipe
  // chaque joueur du roster est piloté par sa manette attitrée (p.pad) ;
  // J1 (pad null) : clavier + tactile, ou la première manette libre
  const tc0 = teamCenter();
  const assignedPads = new Set(players.map(p => p.pad).filter(v => v != null));
  const veh = vehicle.active;
  for (const p of players) {
    if (p.dead) {
      p.invuln = 0;
      // l'Esprit de la Force ramène le joueur après 60 s, au centre de l'équipe
      p.respawnT -= dt;
      if (p.respawnT <= 0 && alivePlayers().length > 0) {
        p.dead = false;
        p.hp = p.maxHp * 0.5;
        p.invuln = 2;
        p.x = tc0.x + rand(-30, 30); p.y = tc0.y + rand(-30, 30);
        addText(p.x, p.y - 30, t('RÉANIMÉ !'), '#52ff7a', 18, 2);
        addRing(p.x, p.y, 240, '82,255,122', 4, 0.6);
        sfx.lvl();
      }
      continue;
    }
    // pilote d'armement lourd : invulnérable, vitesse de l'engin (plus bas)
    if (veh && veh.riders[0] === p.idx) p.invuln = Math.max(p.invuln, 0.3);
    let mx = 0, my = 0;
    if (p.pad != null) {
      const pm = padMove(p.pad);
      if (pm) { mx = pm.mx; my = pm.my; }
    } else {
      if (keys.KeyW || keys.ArrowUp) my -= 1;
      if (keys.KeyS || keys.ArrowDown) my += 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;
      if (touch.active && Math.hypot(touch.dx, touch.dy) > 0.12) { mx = touch.dx; my = touch.dy; }
      if (!mx && !my) {
        const free = firstFreePad(assignedPads);
        const pm = free != null ? padMove(free) : null;
        if (pm) { mx = pm.mx; my = pm.my; }
      }
    }
    if (mx || my) {
      const l = Math.hypot(mx, my);
      const spd = veh && veh.riders[0] === p.idx ? veh.def.speed : p.speed;
      p.x += mx / l * spd * dt;
      p.y += my / l * spd * dt;
      if (mx) p.face = Math.sign(mx);
      // laisse d'équipe : personne ne sème le groupe
      if (session.count > 1) {
        const dx = p.x - tc0.x, dy = p.y - tc0.y, d = Math.hypot(dx, dy);
        if (d > 480) { p.x = tc0.x + dx / d * 480; p.y = tc0.y + dy / d * 480; }
      }
      // image rémanente
      p.afterT -= dt;
      if (p.afterT <= 0) {
        p.afterT = 0.09;
        if (ghosts.length > 30) ghosts.shift();
        ghosts.push({ spr: p.spr, x: p.x, y: p.y, t: 0, kind: 'after', flip: p.face });
      }
      // poussière de déplacement
      if (Math.random() < 0.55 && particles.length < 500) {
        particles.push({
          x: p.x - mx / l * 10 + rand(-5, 5), y: p.y + 10 + rand(-3, 3),
          vx: -mx / l * rand(20, 55) + rand(-12, 12), vy: -my / l * rand(20, 55) - rand(4, 18),
          life: rand(0.25, 0.5), color: LEVELS[session.level].dust, size: rand(1.5, 3.2),
        });
      }
    }
    p.invuln = Math.max(0, p.invuln - dt);
    if (p.regen > 0) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
    p.comboWaveCd = Math.max(0, (p.comboWaveCd || 0) - dt);
  }

  // --- spawn (quantité × facteur coop × niveau d'équipe, fraction reportée au tick suivant)
  // La densité suit aussi S.level : monter haut (~45-55) déclenche la horde.
  S.spawnT -= dt;
  const interval = DEBUG.stress ? 0.05 : Math.max(0.16, (1.15 - S.time * 0.0032) * (LEVELS[session.level].spawnMult || 1));
  const cap = DEBUG.stress || Math.min(650, 230 + S.level * 4 + 40 * (session.count - 1));
  if (S.spawnT <= 0 && enemies.length < cap) {
    S.spawnT = interval;
    S.spawnAcc += DEBUG.stress ? 10 : (1 + Math.floor(S.time / 55)) * coopSpawnMult() * (1 + S.level * 0.03) * campaignMult();
    for (; S.spawnAcc >= 1; S.spawnAcc--) spawnEnemy(pickEnemyType());
  }
  const finalAlive = enemies.some(e => e.final);
  S.bossT -= dt;
  if (S.bossT <= 0) {
    if (finalAlive) S.bossT = 15; // pas d'élite pendant le duel final
    else { S.bossT = 90; spawnEnemy(null, true); }
  }
  // --- assaut aléatoire (voir spawnSurge)
  S.surgeT -= dt;
  if (S.surgeT <= 0) {
    S.surgeT = 40 + Math.random() * 40;
    if (!finalAlive) spawnSurge(tc0);
  }
  // boss de fin de niveau et limite de 20 minutes
  if (!S.finalWarn && S.time >= FINAL_BOSS_TIME - 10) {
    S.finalWarn = true;
    addText(tc0.x, tc0.y - 80, t('UNE PRÉSENCE PUISSANTE APPROCHE…'), '#ff8f6b', 16, 3);
  }
  if (!S.finalSpawned && S.time >= FINAL_BOSS_TIME) {
    S.finalSpawned = true;
    spawnFinalBoss();
  }
  if (S.time >= RUN_TIME) { endRun(); return; }

  // --- ravitaillements largués sur la carte (3 max)
  S.bonusT -= dt;
  if (S.bonusT <= 0) {
    S.bonusT = session.count > 1 ? 18 : 24; // le Bacta sert de réanimation en coop
    if (bonuses.length < 3) {
      const a = rand(0, Math.PI * 2), d = rand(700, 1300);
      bonuses.push({ x: tc0.x + Math.cos(a) * d, y: tc0.y + Math.sin(a) * d, type: pick(Object.keys(BONUSES)), t: 0 });
      addText(tc0.x, tc0.y - 70, t('RAVITAILLEMENT LARGUÉ — SUIS LA BALISE'), '#ffd166', 14, 2.4);
      sfx.gem();
    }
  }
  for (let i = bonuses.length - 1; i >= 0; i--) {
    const b = bonuses[i];
    b.t += dt;
    let taker = null;
    for (const p of players) {
      if (p.dead) continue;
      if (dist2(b.x, b.y, p.x, p.y) < (p.r + 18) * (p.r + 18)) { taker = p; break; }
    }
    if (taker) {
      bonuses.splice(i, 1);
      applyBonus(b, taker);
      if (S.scene !== 'play') return; // holocron : le level-up a ouvert le choix
    }
  }

  // --- armement lourd : l'engin suit son pilote
  if (vehicle.active) {
    const drv = players[vehicle.active.riders[0]];
    vehicle.active.x = drv.x; vehicle.active.y = drv.y;
  }
  tickVehicle(dt, tc0);

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
        damageEnemy(e, wv.dmg, a, e.boss ? 0 : 420, false, players[wv.owner || 0]);
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
      const tgt = nearestPlayer(e.x, e.y);
      const esp = e.spd * (e.slowT > 0 ? e.slow : 1);
      const a = tgt ? Math.atan2(tgt.y - e.y, tgt.x - e.x) : e.kx || e.ky ? 0 : Math.random() * Math.PI * 2;
      e.x += ((tgt ? Math.cos(a) * esp : 0) + e.kx) * dt;
      e.y += ((tgt ? Math.sin(a) * esp : 0) + e.ky) * dt;
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
    // contact avec les joueurs
    for (const p of players) {
      if (p.dead) continue;
      const rr = e.r + p.r;
      if (dist2(e.x, e.y, p.x, p.y) < rr * rr) {
        hurtPlayer(p, e.dmg);
        if (S.scene !== 'play') return;
      }
    }
  }

  // --- projectiles
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) {
      if (b.rocket) explode(b.x, b.y, b.dmg, b.radius, players[b.owner || 0]);
      else if (b.endor) explode(b.x, b.y, b.edmg, b.eradius, players[b.owner || 0]);
      bullets.splice(i, 1); continue;
    }
    if (b.rocket && particles.length < 500 && Math.random() < 0.6) {
      particles.push({ x: b.x, y: b.y, vx: rand(-20, 20), vy: rand(-20, 20), life: rand(0.15, 0.3), color: '#ffb166', size: rand(1.5, 3) });
    }
    for (const e of enemies) {
      if (e.dead) continue;
      const rr = e.r + 5;
      if (dist2(b.x, b.y, e.x, e.y) < rr * rr) {
        if (b.rocket) { explode(b.x, b.y, b.dmg, b.radius, players[b.owner || 0]); bullets.splice(i, 1); break; }
        if (b.pierce) { if (b.hit.has(e)) continue; b.hit.add(e); sparks(b.x, b.y, '255,226,176', 3, 200); damageEnemy(e, b.dmg, b.a, 120, false, players[b.owner || 0]); continue; }
        sparks(b.x, b.y, b.spr === 'boltRed' ? '255,150,120' : '150,225,255', 4, 240);
        damageEnemy(e, b.dmg, b.a, 60, false, players[b.owner || 0]);
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
    let hitP = null;
    for (const p of players) {
      if (p.dead || p.invuln > 0) continue;
      const rr = (b.r || 5) + p.r;
      if (dist2(b.x, b.y, p.x, p.y) < rr * rr) { hitP = p; break; }
    }
    if (hitP) {
      if (b.rocket) {
        booms.push({ x: b.x, y: b.y, r: b.radius, life: 0.25 });
        sfx.boom(); burst(b.x, b.y, '#ffb166', 10, 180);
      }
      hurtPlayer(hitP, b.dmg);
      if (!b.saber) ebullets.splice(i, 1);
      if (S.scene !== 'play') return;
      continue;
    }
    if (b.life <= 0) {
      if (b.rocket) {
        booms.push({ x: b.x, y: b.y, r: b.radius, life: 0.25 });
        sfx.boom(); burst(b.x, b.y, '#ffb166', 10, 180);
        for (const p of players) {
          if (p.dead) continue;
          if (dist2(b.x, b.y, p.x, p.y) < (b.radius + p.r) * (b.radius + p.r)) hurtPlayer(p, b.dmg);
        }
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
    if (gr.t >= gr.dur) { explode(gr.tx, gr.ty, gr.dmg, gr.radius, players[gr.owner || 0]); grenades.splice(i, 1); }
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
        if (dist2(e.x, e.y, fp.x, fp.y) < (fp.r + e.r) * (fp.r + e.r)) damageEnemy(e, fp.dmg, null, 0, true, players[fp.owner || 0]);
      }
    }
    if (fp.life <= 0) firePools.splice(i, 1);
  }

  // --- cristaux
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    g.t += dt * 3;
    const np = nearestPlayer(g.x, g.y);
    if (!np) continue;
    const d = Math.hypot(g.x - np.x, g.y - np.y);
    if (g.mag || d < np.magnet) {
      const sp = g.mag ? 720 : 260 + (np.magnet - d) * 6;
      g.x += (np.x - g.x) / d * sp * dt;
      g.y += (np.y - g.y) / d * sp * dt;
      if (Math.random() < dt * 14 && particles.length < 600) {
        particles.push({ type: 'streak', x: g.x, y: g.y, vx: (np.x - g.x) / d * 90, vy: (np.y - g.y) / d * 90, life: 0.18, max: 0.18, rgb: '120,225,255', size: 1.4 });
      }
    }
    if (d < np.r + 10) {
      gems.splice(i, 1);
      sfx.gem();
      sparks(g.x, g.y, g.v >= 5 ? '255,220,140' : '140,235,255', 3, 150);
      gainXp(g.v, np);
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
    document.getElementById('bossname').textContent = t(BOSSES[fb.type].name);
    document.getElementById('bosshpfill').style.width = clamp(fb.hp / fb.maxHp * 100, 0, 100) + '%';
  } else bb.style.display = 'none';
  document.getElementById('kills').textContent = S.kills;
  document.getElementById('lvl').textContent = S.level;
  const nf = campaign.fragments.length;
  document.getElementById('frags').textContent = '◆'.repeat(nf) + '◇'.repeat(5 - nf);
  document.getElementById('xpfill').style.width = (S.xp / S.xpNext * 100) + '%';
  const fills = document.querySelectorAll('#hpwrap .pfill');
  const nums = document.querySelectorAll('#hpwrap .pnum');
  const rows = document.querySelectorAll('#hpwrap .prow');
  players.forEach((p, i) => {
    if (fills[i]) fills[i].style.width = clamp(p.hp / p.maxHp * 100, 0, 100) + '%';
    if (nums[i]) nums[i].textContent = p.dead ? t('À TERRE') + ' · ' + Math.max(0, Math.ceil(p.respawnT)) + 's' : Math.max(0, Math.ceil(p.hp)) + ' / ' + Math.round(p.maxHp);
    if (rows[i]) rows[i].classList.toggle('dead', !!p.dead);
  });
  const anyLow = alivePlayers().some(p => p.hp / p.maxHp < 0.3);
  document.getElementById('lowhp').classList.toggle('on', S.scene === 'play' && anyLow);
}

export { update, updateHud };
