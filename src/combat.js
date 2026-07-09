// Holocron Survivors — tir des armes, explosions
import { rand, irand, dist2, angleDiff, pick } from './core.js';
import { S, players, nearestPlayer, runtime, enemies, bullets, waves, arcs, grenades, drones, particles, booms, firePools, decals, addRing } from './state.js';
import { WEAPONS, weaponLvl } from './gamedata.js';
import { sfx, tone } from './audio.js';
import { damageEnemy, burst, sparks, fireball, flash, addText } from './effects.js';

// ------------------------------ Armes : tick ------------------------------
function nearestEnemy(x, y, maxD = 1e9) {
  let best = null, bd = maxD * maxD;
  for (const e of enemies) {
    const d = dist2(x, y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function fireBolt(x, y, tx, ty, dmg, spr = 'boltCyan', speed = 520, owner = 0) {
  const a = Math.atan2(ty - y, tx - x);
  bullets.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, a, dmg, life: 1.6, spr, owner });
  // flash de bouche
  if (particles.length < 600) {
    const life = 0.09;
    particles.push({ type: 'glow', x: x + Math.cos(a) * 12, y: y + Math.sin(a) * 12, vx: 0, vy: 0, life, max: life, rgb: spr === 'boltRed' ? '255,140,100' : '150,230,255', size: 9 });
  }
}
function explode(x, y, dmg, radius, owner = null) {
  sfx.boom();
  burst(x, y, '#ffb166', 12, 230);
  sparks(x, y, '255,200,120', 10, 430);
  fireball(x, y, radius);
  booms.push({ x, y, r: radius, life: 0.25 });
  addRing(x, y, radius * 1.3, '255,170,90', 4, 0.35);
  if (decals.length > 30) decals.shift();
  decals.push({ x, y, r: radius * 0.65, life: 12, max: 12 });
  const np = nearestPlayer(x, y);
  const dp = np ? Math.hypot(np.x - x, np.y - y) : 9999;
  if (dp < 800) flash('255,190,120', 0.05 + 0.14 * (1 - dp / 800));
  S.shake = Math.max(S.shake, 7);
  for (const e of enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < radius + e.r) damageEnemy(e, dmg, Math.atan2(e.y - y, e.x - x), e.boss ? 0 : 200, false, owner);
  }
  // combo Inferno : nappe de feu persistante
  if (owner && (owner.combos.has('inferno') || owner.combos.has('essaim'))) firePools.push({ x, y, r: radius * 0.7, life: 3, tick: 0, dmg: 6, owner: owner.idx });
}
function tickWeapons(dt) {
  for (const p of players) p.ionAura = null;
  for (const p of players) {
    if (p.dead) continue;
    tickPlayerWeapons(p, dt);
  }
}
function tickPlayerWeapons(p, dt) {
  const player = p; // armes ancrées sur leur porteur
  const activeCombos = p.combos;
  for (const w of p.weapons) {
    const def = WEAPONS[w.id];
    const st = def.stats(w.lvl);
    // les variantes d'arsenal (def.type) réutilisent la mécanique de leur arme de base
    switch (def.type || w.id) {
      case 'saber': {
        w.angle = (w.angle || 0) + st.spd * dt;
        const blades = st.blades;
        for (let b = 0; b < blades; b++) {
          const ba = w.angle + b * (Math.PI * 2 / blades);
          for (const e of enemies) {
            if (S.time - e.saberHit < 0.28) continue;
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < st.len + e.r && d > 6) {
              const ea = Math.atan2(e.y - player.y, e.x - player.x);
              if (Math.abs(angleDiff(ea, ba)) < 0.42) {
                e.saberHit = S.time;
                damageEnemy(e, st.dmg, ea, 190, false, p);
              }
            }
          }
        }
        break;
      }
      case 'blaster': {
        w.t -= dt;
        if (w.t <= 0) {
          const tgt = nearestEnemy(player.x, player.y, 560);
          if (tgt) {
            w.t = st.cd * player.cdMult;
            sfx.pew();
            for (let i = 0; i < st.shots; i++) {
              const jx = tgt.x + rand(-30, 30) * i, jy = tgt.y + rand(-30, 30) * i;
              fireBolt(player.x, player.y, jx, jy, st.dmg, 'boltCyan', 520, p.idx);
            }
            // combo Chasseur de primes : roquette bonus
            if (activeCombos.has('bountyHunter') && Math.random() < 0.2) {
              const rst = WEAPONS.rocket.stats(weaponLvl(p, 'rocket'));
              const ra = Math.atan2(tgt.y - player.y, tgt.x - player.x);
              bullets.push({ x: player.x, y: player.y, vx: Math.cos(ra) * 360, vy: Math.sin(ra) * 360, a: ra, dmg: rst.dmg, life: 1.9, spr: 'rocket', rocket: true, radius: rst.radius, owner: p.idx });
            }
          } else w.t = 0.1;
        }
        break;
      }
      case 'wave': {
        w.t -= dt;
        if (w.t <= 0 && enemies.length) {
          w.t = st.cd * player.cdMult;
          sfx.wave();
          waves.push({ x: player.x, y: player.y, r: 20, maxR: st.radius, dmg: st.dmg, id: ++runtime.waveId, owner: p.idx });
          S.shake = Math.max(S.shake, 5);
        }
        break;
      }
      case 'lightning': {
        w.t -= dt;
        if (w.t <= 0) {
          const first = nearestEnemy(player.x, player.y, 420);
          if (first) {
            w.t = st.cd * player.cdMult;
            sfx.zap();
            const chains = st.chains + (activeCombos.has('forceStorm') ? 3 : 0);
            const chainPts = [{ x: player.x, y: player.y }];
            const hitSet = new Set();
            let cur = first;
            for (let c = 0; c <= chains && cur; c++) {
              hitSet.add(cur);
              chainPts.push({ x: cur.x, y: cur.y });
              damageEnemy(cur, st.dmg, null, 0, false, p);
              if (activeCombos.has('forceStorm')) { cur.slowT = Math.max(cur.slowT, 2); cur.slow = Math.min(cur.slow, 0.5); }
              let next = null, bd = 190 * 190;
              for (const e of enemies) {
                if (hitSet.has(e) || e.dead) continue;
                const d = dist2(cur.x, cur.y, e.x, e.y);
                if (d < bd) { bd = d; next = e; }
              }
              cur = next;
            }
            arcs.push({ pts: chainPts, life: 0.18 });
          } else w.t = 0.15;
        }
        break;
      }
      case 'spear': {
        w.t -= dt;
        if (w.t <= 0) {
          const tgt = nearestEnemy(player.x, player.y, 520);
          if (tgt) {
            w.t = st.cd * player.cdMult;
            sfx.throw();
            const base = Math.atan2(tgt.y - player.y, tgt.x - player.x);
            // combo Guérilla d'Endor : les lances explosent en fin de course
            const endor = activeCombos.has('endor') || activeCombos.has('kyberheart'); // lances/sabres explosifs
            let edmg = 0, eradius = 0;
            if (endor) {
              const ds = WEAPONS.detonator.stats(weaponLvl(p, 'detonator'));
              edmg = ds.dmg * 0.6; eradius = ds.radius * 0.6;
            }
            for (let i = 0; i < st.count; i++) {
              const a = base + (i - (st.count - 1) / 2) * 0.28;
              bullets.push({ x: player.x, y: player.y, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, a, dmg: st.dmg, life: 1.3, spr: 'spear', pierce: true, hit: new Set(), endor, edmg, eradius, owner: p.idx });
            }
          } else w.t = 0.1;
        }
        break;
      }
      case 'rocket': {
        w.t -= dt;
        if (w.t <= 0) {
          const tgt = nearestEnemy(player.x, player.y, 540);
          if (tgt) {
            w.t = st.cd * player.cdMult;
            sfx.pew();
            for (let i = 0; i < st.count; i++) {
              const a = Math.atan2(tgt.y - player.y, tgt.x - player.x) + (i ? rand(-0.4, 0.4) : 0);
              bullets.push({ x: player.x, y: player.y, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, a, dmg: st.dmg, life: 1.9, spr: 'rocket', rocket: true, radius: st.radius, owner: p.idx });
            }
          } else w.t = 0.12;
        }
        break;
      }
      case 'detonator': {
        w.t -= dt;
        if (w.t <= 0 && enemies.length) {
          w.t = st.cd * player.cdMult;
          sfx.throw();
          for (let i = 0; i < st.count; i++) {
            const tgt = enemies[irand(0, enemies.length - 1)];
            const a = Math.atan2(tgt.y - player.y, tgt.x - player.x);
            const d = Math.min(Math.hypot(tgt.x - player.x, tgt.y - player.y), 380);
            grenades.push({ x: player.x, y: player.y, tx: player.x + Math.cos(a) * d, ty: player.y + Math.sin(a) * d, t: 0, dur: 0.55, dmg: st.dmg, radius: st.radius, owner: p.idx });
          }
        }
        break;
      }
      case 'flame': {
        if ((w.active || 0) > 0) {
          w.active -= dt;
          for (let i = 0; i < 3; i++) {
            if (particles.length > 500) break;
            const a = w.dir + rand(-0.4, 0.4), v = rand(180, 320);
            particles.push({ x: player.x + Math.cos(w.dir) * 14, y: player.y + Math.sin(w.dir) * 14, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.25, 0.45), color: pick(['#ffb166', '#ff8c42', '#ffd166']), size: rand(2, 4.5) });
          }
          w.tick -= dt;
          if (w.tick <= 0) {
            w.tick = 0.18;
            for (const e of enemies) {
              if (e.dead) continue;
              const d = Math.hypot(e.x - player.x, e.y - player.y);
              if (d < st.range + e.r && Math.abs(angleDiff(Math.atan2(e.y - player.y, e.x - player.x), w.dir)) < 0.5) {
                damageEnemy(e, st.dmg, w.dir, 40, false, p);
              }
            }
          }
        } else {
          w.t -= dt;
          if (w.t <= 0) {
            const tgt = nearestEnemy(player.x, player.y, st.range + 50);
            if (tgt) {
              w.t = st.cd * player.cdMult;
              w.active = st.dur; w.tick = 0;
              w.dir = Math.atan2(tgt.y - player.y, tgt.x - player.x);
              tone(85, st.dur, 'sawtooth', 0.025, 30);
            } else w.t = 0.1;
          }
        }
        break;
      }
      case 'ion': {
        p.ionAura = st;
        w.tick = (w.tick || 0) - dt;
        const doTick = w.tick <= 0;
        if (doTick) w.tick = 0.5;
        for (const e of enemies) {
          if (e.dead) continue;
          if (dist2(e.x, e.y, player.x, player.y) < (st.radius + e.r) * (st.radius + e.r)) {
            e.slow = e.slowT > 0 ? Math.min(e.slow, 1 - st.slow) : 1 - st.slow;
            e.slowT = Math.max(e.slowT, 0.15);
            if (doTick) damageEnemy(e, st.dmg, null, 0, true, p);
          }
        }
        break;
      }
      case 'drone': {
        // synchronise le nombre de droïdes de ce joueur
        const mine = drones.filter(d => d.owner === p.idx);
        while (mine.length < st.count) {
          const d = { t: rand(0, 1), a: Math.random() * Math.PI * 2, owner: p.idx };
          mine.push(d); drones.push(d);
        }
        while (mine.length > st.count) {
          const d = mine.pop();
          drones.splice(drones.indexOf(d), 1);
        }
        for (let i = 0; i < mine.length; i++) {
          const dr = mine[i];
          dr.a += 1.6 * dt;
          const off = (i / mine.length) * Math.PI * 2;
          dr.x = player.x + Math.cos(dr.a + off) * 52;
          dr.y = player.y + Math.sin(dr.a + off) * 52;
          dr.t -= dt;
          if (dr.t <= 0) {
            const tgt = nearestEnemy(dr.x, dr.y, 460);
            if (tgt) {
              dr.t = st.cd * player.cdMult;
              sfx.pew();
              const burstN = activeCombos.has('squadron') || activeCombos.has('ruse') || activeCombos.has('chasse') ? 3 : 1;
              for (let s = 0; s < burstN; s++) {
                fireBolt(dr.x, dr.y, tgt.x + rand(-16, 16) * s, tgt.y + rand(-16, 16) * s, st.dmg, 'boltRed', 560, p.idx);
              }
            } else dr.t = 0.1;
          }
        }
        break;
      }
    }
  }
}

export { nearestEnemy, fireBolt, explode, tickWeapons };
