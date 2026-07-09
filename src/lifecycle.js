// Holocron Survivors — boucle rAF, début/fin de partie, pause
import { clamp, DEBUG } from './core.js';
import { S, player, session, runtime, enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, decals, bonuses, weapons, passives } from './state.js';
import { CHARS, activeCombos } from './gamedata.js';
import { BOSSES } from './levels.js';
import { metaLvl, bankRewards } from './meta.js';
import { audioResume, sfx } from './audio.js';
import { screenFlash, ghosts } from './effects.js';
import { xpFor, renderWeaponSlots, buildComboList } from './levelup.js';
import { update, updateHud } from './update.js';
import { render } from './render-pixi.js';

// ------------------------------ Cycle de vie ------------------------------
// compteur FPS (?fps=1)
let fpsAcc = 0, fpsCount = 0, fpsEl = null;
function tickFps(rawDt) {
  if (!DEBUG.fps) return;
  fpsAcc += rawDt; fpsCount++;
  if (fpsAcc >= 0.5) {
    if (!fpsEl) {
      fpsEl = document.createElement('div');
      fpsEl.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99;font:700 13px Rajdhani,monospace;color:#ffd166;background:rgba(0,0,0,.55);padding:2px 10px;pointer-events:none;letter-spacing:.1em';
      document.body.appendChild(fpsEl);
    }
    fpsEl.textContent = Math.round(fpsCount / fpsAcc) + ' FPS';
    fpsAcc = 0; fpsCount = 0;
  }
}
let lastT = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = clamp((now - lastT) / 1000, 0, 0.05);
  lastT = now;
  tickFps((now - (frame._p || now)) / 1000 || rawDt);
  frame._p = now;
  screenFlash.a = Math.max(0, screenFlash.a - rawDt * 2.4);
  S.zoomKick = S.zoomKick > 0.001 ? S.zoomKick * Math.pow(0.0005, rawDt) : 0;
  let dt = rawDt;
  if (S.freeze > 0) { S.freeze -= rawDt; dt = rawDt * 0.15; } // ralenti dramatique
  if (S.scene === 'play' && !S.paused) update(dt);
  render(); // le fond reste animé derrière les menus
}
requestAnimationFrame(frame);

function resetGame() {
  S.time = 0; S.kills = 0; S.level = 1; S.xp = 0; S.xpNext = xpFor(1);
  S.spawnT = 0; S.bossT = 90; S.shake = 0; S.paused = false; runtime.pendingLvls = 0;
  S.finalWarn = false; S.finalSpawned = false; S.bossDefeated = false;
  S.freeze = 0; S.beamT = 0; screenFlash.a = 0;
  S.zoomKick = 0; S.streak = 0; S.streakT = 0; S.afterT = 0; S.bonusT = 12;
  document.getElementById('levelup').classList.remove('on');
  document.getElementById('paused').classList.remove('on');
  document.getElementById('victory').classList.remove('on');
  const c = CHARS[session.char];
  Object.assign(player, { x: 0, y: 0, hp: c.hp, maxHp: c.hp, speed: c.speed, r: c.r, armor: c.armor || 1, magnet: 90, dmgMult: 1, cdMult: 1, invuln: 0, face: 1, comboWaveCd: 0, regen: 0, xpMult: 1, dodge: 0, crit: 0 });
  if (c.mods) c.mods(player);
  // améliorations permanentes du hangar
  player.maxHp += 12 * metaLvl('hull');
  player.hp = player.maxHp;
  player.dmgMult *= 1 + 0.04 * metaLvl('power');
  player.speed *= 1 + 0.03 * metaLvl('boots');
  player.magnet *= 1 + 0.12 * metaLvl('magnet');
  player.cdMult *= Math.pow(0.97, metaLvl('cooldown'));
  player.xpMult += 0.05 * metaLvl('xp');
  player.armor *= Math.pow(0.96, metaLvl('armor'));
  S.rewarded = false; S.reviveUsed = false;
  for (const arr of [enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, ghosts, decals, bonuses]) arr.length = 0;
  activeCombos.clear();
  runtime.ionAura = null;
  weapons.length = 0;
  weapons.push({ id: c.weapon, lvl: 1, t: 0, angle: 0 });
  for (const k in passives) delete passives[k];
  renderWeaponSlots();
  updateHud();
}
function startGame() {
  audioResume();
  resetGame();
  document.getElementById('menu').classList.remove('on');
  document.getElementById('gameover').classList.remove('on');
  document.getElementById('hud').classList.add('on');
  S.scene = 'play';
  lastT = performance.now();
}
function runStats() {
  const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  return `Temps : <b>${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</b><br>` +
    `Éliminations : <b>${S.kills}</b> · Niveau atteint : <b>${S.level}</b>`;
}
function victory(boss) {
  S.scene = 'victory';
  S.bossDefeated = true;
  const c = bankRewards();
  document.getElementById('victtitle').textContent = 'VICTOIRE';
  document.getElementById('victsub').textContent = BOSSES[boss.type].name + ' EST TOMBÉ';
  document.getElementById('victstats').innerHTML = runStats() +
    `<br>Crédits gagnés : <b style="color:var(--gold)">+${c} ©</b>`;
  document.getElementById('continueBtn').style.display = '';
  document.getElementById('victory').classList.add('on');
  document.getElementById('hud').classList.remove('on');
  document.getElementById('lowhp').classList.remove('on');
  sfx.lvl(); setTimeout(() => sfx.lvl(), 350);
}
function endRun() {
  S.scene = 'victory';
  const c = bankRewards();
  document.getElementById('victtitle').textContent = 'SURVIE ACCOMPLIE';
  document.getElementById('victsub').textContent = S.bossDefeated
    ? '20 MINUTES — LE SECTEUR EST LIBÉRÉ'
    : '20 MINUTES — MAIS LE BOSS RÔDE ENCORE';
  document.getElementById('victstats').innerHTML = runStats() +
    (c > 0 ? `<br>Crédits gagnés : <b style="color:var(--gold)">+${c} ©</b>` : '');
  document.getElementById('continueBtn').style.display = 'none';
  document.getElementById('victory').classList.add('on');
  document.getElementById('hud').classList.remove('on');
  document.getElementById('lowhp').classList.remove('on');
  sfx.lvl(); setTimeout(() => sfx.lvl(), 350);
}
function gameOver() {
  S.scene = 'gameover';
  const c = bankRewards();
  const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  document.getElementById('gostats').innerHTML =
    `Temps de survie : <b>${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</b><br>` +
    `Éliminations : <b>${S.kills}</b> · Niveau atteint : <b>${S.level}</b><br>` +
    `Crédits gagnés : <b style="color:var(--gold)">+${c} ©</b>`;
  document.getElementById('gameover').classList.add('on');
  document.getElementById('hud').classList.remove('on');
  document.getElementById('lowhp').classList.remove('on');
}
function togglePause() {
  if (S.scene !== 'play') return;
  S.paused = !S.paused;
  if (S.paused) buildComboList();
  document.getElementById('paused').classList.toggle('on', S.paused);
  if (!S.paused) lastT = performance.now();
}

function resetFrameClock() { lastT = performance.now(); }

export { resetGame, startGame, runStats, victory, endRun, gameOver, togglePause, resetFrameClock };
