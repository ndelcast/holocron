// Holocron Survivors — boucle rAF, début/fin de partie, pause
import { clamp, DEBUG } from './core.js';
import { S, session, runtime, vehicle, players, PLAYER_TINT, enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, decals, bonuses, slashes } from './state.js';
import { CHARS } from './gamedata.js';
import { LEVELS, BOSSES } from './levels.js';
import { META_STATE, saveMeta, metaLvl, bankRewards } from './meta.js';
import { audioResume, sfx } from './audio.js';
import { startMusic, stopMusic } from './music.js';
import { pollPadPause } from './input.js';
import { screenFlash, ghosts, addText, flash } from './effects.js';
import { xpFor, renderWeaponSlots, buildComboList } from './levelup.js';
import { t } from './i18n.js';
import { update, updateHud } from './update.js';
import { render } from './render.js';

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
  pollPadPause();
  S.zoomKick = S.zoomKick > 0.001 ? S.zoomKick * Math.pow(0.0005, rawDt) : 0;
  let dt = rawDt;
  if (S.freeze > 0) { S.freeze -= rawDt; dt = rawDt * 0.15; } // ralenti dramatique
  if (S.scene === 'play' && !S.paused) update(dt);
  render(); // le fond reste animé derrière les menus
}
requestAnimationFrame(frame);

function makePlayer(charId, idx, pad = null) {
  const c = CHARS[charId];
  const p = {
    idx, char: charId, spr: c.spr, pad, // pad : manette attitrée (null = clavier/tactile)
    x: idx * 46 - (session.count - 1) * 23, y: 0,
    r: c.r, hp: c.hp, maxHp: c.hp, speed: c.speed, armor: c.armor || 1,
    magnet: 90, dmgMult: 1, cdMult: 1, invuln: 0, face: 1,
    comboWaveCd: 0, regen: 0, xpMult: 1, dodge: 0, crit: 0,
    dead: false, reviveUsed: false, respawnT: 0, afterT: 0, ionAura: null,
    weapons: [{ id: c.weapon, lvl: 1, t: 0, angle: 0 }],
    passives: {}, combos: new Set(),
  };
  if (c.mods) c.mods(p);
  // améliorations permanentes du hangar (pour toute l'équipe)
  p.maxHp += 12 * metaLvl('hull');
  p.hp = p.maxHp;
  p.dmgMult *= 1 + 0.04 * metaLvl('power');
  p.speed *= 1 + 0.03 * metaLvl('boots');
  p.magnet *= 1 + 0.12 * metaLvl('magnet');
  p.cdMult *= Math.pow(0.97, metaLvl('cooldown'));
  p.xpMult += 0.05 * metaLvl('xp');
  p.armor *= Math.pow(0.96, metaLvl('armor'));
  return p;
}

// barres de PV du HUD, une par joueur
function buildHpBars() {
  const wrap = document.getElementById('hpwrap');
  wrap.innerHTML = '';
  for (const p of players) {
    const row = document.createElement('div');
    row.className = 'prow';
    const label = session.count > 1 ? `J${p.idx + 1} · ${t(CHARS[p.char].name)}` : t('INTÉGRITÉ');
    row.innerHTML = `<div class="plabel" style="color:${PLAYER_TINT[p.idx]}">${label} <span class="pnum"></span></div>
      <div class="pbar"><div class="pfill" style="background:linear-gradient(90deg, #d92b2b, ${PLAYER_TINT[p.idx]})"></div></div>`;
    wrap.appendChild(row);
  }
}

function resetGame() {
  S.time = 0; S.kills = 0; S.level = 1; S.xp = 0; S.xpNext = xpFor(1);
  S.spawnT = 0; S.spawnAcc = 0; S.bossT = 90; S.surgeT = 45 + Math.random() * 30; S.shake = 0; S.paused = false; runtime.pendingLvls = 0;
  vehicle.drop = null; vehicle.active = null;
  S.finalWarn = false; S.finalSpawned = false; S.bossDefeated = false;
  S.freeze = 0; S.beamT = 0; screenFlash.a = 0;
  S.zoomKick = 0; S.streak = 0; S.streakT = 0; S.afterT = 0; S.bonusT = 12;
  S.banked = 0; S.chal = 0;
  document.getElementById('levelup').classList.remove('on');
  document.getElementById('paused').classList.remove('on');
  document.getElementById('victory').classList.remove('on');
  // construit l'équipe depuis le salon : J1 (clavier/manette libre) + roster manettes
  players.length = 0;
  const lineup = [{ char: session.char, pad: session.p1pad }, ...session.roster];
  session.count = lineup.length;
  lineup.forEach((s, i) => players.push(makePlayer(s.char, i, s.pad)));
  runtime.lvlQueue.length = 0;
  runtime.comboQueue.length = 0;
  document.getElementById('combomodal').classList.remove('on');
  buildHpBars();
  for (const arr of [enemies, bullets, gems, particles, texts, waves, arcs, drones, booms, grenades, firePools, rings, ebullets, ghosts, decals, bonuses, slashes]) arr.length = 0;
  renderWeaponSlots();
  updateHud();
}
function startGame() {
  audioResume();
  startMusic(session.level);
  resetGame();
  for (const id of ['home', 'levelselect', 'teamscreen']) document.getElementById(id).classList.remove('on');
  document.getElementById('gameover').classList.remove('on');
  document.getElementById('hud').classList.add('on');
  S.scene = 'play';
  lastT = performance.now();
}
function runStats() {
  const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  const clock = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return t('Temps de campagne : <b>{0}</b>', clock) + '<br>' +
    t('Éliminations : <b>{0}</b> · Niveau atteint : <b>{1}</b>', S.kills, S.level) + '<br>' +
    t('Fragments d\'holocron : <b style="color:var(--gold)">{0} / 5</b>', META_STATE.fragments.length);
}
function victory(boss) {
  S.scene = 'victory';
  S.bossDefeated = true;
  stopMusic();
  // progression persistante : fragment conservé + secteur suivant débloqué
  const order = Object.keys(LEVELS);
  const idx = order.indexOf(session.level);
  let unlocked = null;
  if (!META_STATE.fragments.includes(session.level)) META_STATE.fragments.push(session.level);
  if (idx + 1 < order.length && idx + 2 > META_STATE.maxLevel) {
    META_STATE.maxLevel = idx + 2;
    unlocked = order[idx + 1];
  }
  saveMeta();
  const c = bankRewards();
  const n = META_STATE.fragments.length;
  const complete = n >= 5;
  document.getElementById('victtitle').textContent = complete ? t('L\'HOLOCRON RENAÎT') : t('SECTEUR LIBÉRÉ');
  document.getElementById('victsub').textContent = complete
    ? t('LES CINQ FRAGMENTS SONT RÉUNIS — LA FORCE REVIENT')
    : t('{0} EST TOMBÉ — FRAGMENT {1} / 5', t(BOSSES[boss.type].name), n);
  document.getElementById('victunlock').textContent = unlocked ? t('NOUVEAU SECTEUR DÉBLOQUÉ : {0}', t(LEVELS[unlocked].name)) : '';
  document.getElementById('victstats').innerHTML = runStats() + '<br>' + t('Crédits gagnés : <b style="color:var(--gold)">+{0} ©</b>', c);
  document.getElementById('continueBtn').style.display = '';
  document.getElementById('victory').classList.add('on');
  document.getElementById('hud').classList.remove('on');
  document.getElementById('lowhp').classList.remove('on');
  sfx.lvl(); setTimeout(() => sfx.lvl(), 350); setTimeout(() => sfx.boss(), 150);
}
function endRun() {
  S.scene = 'victory';
  stopMusic();
  const c = bankRewards();
  document.getElementById('victtitle').textContent = t('SURVIE ACCOMPLIE');
  document.getElementById('victsub').textContent = S.bossDefeated
    ? t('25 MINUTES — LE SECTEUR EST LIBÉRÉ, LA ROUTE CONTINUE')
    : t('25 MINUTES — MAIS LE SEIGNEUR S\'EST ENFUI AVEC SON FRAGMENT');
  document.getElementById('victunlock').textContent = '';
  document.getElementById('victstats').innerHTML = runStats() +
    (c > 0 ? '<br>' + t('Crédits gagnés : <b style="color:var(--gold)">+{0} ©</b>', c) : '');
  document.getElementById('continueBtn').style.display = 'none';
  document.getElementById('victory').classList.add('on');
  document.getElementById('hud').classList.remove('on');
  document.getElementById('lowhp').classList.remove('on');
  sfx.lvl(); setTimeout(() => sfx.lvl(), 350);
}
function gameOver() {
  S.scene = 'gameover';
  stopMusic();
  const c = bankRewards();
  document.getElementById('gostats').innerHTML = runStats() +
    '<br>' + t('Crédits gagnés : <b style="color:var(--gold)">+{0} ©</b>', c);
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
