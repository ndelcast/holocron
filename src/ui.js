// Holocron Survivors — menus : héros, destinations, hangar
import { S, session, PLAYER_TINT } from './state.js';
import { SPR } from './sprites.js';
import { CHARS, WEAPONS } from './gamedata.js';
import { LEVELS } from './levels.js';
import { tone, sfx, toggleMute, musicVol, sfxVol, setMusicVol, setSfxVol } from './audio.js';
import { META, META_STATE, saveMeta, metaLvl, metaCost, updateCreditsUI } from './meta.js';
import { startGame, resetFrameClock, togglePause } from './lifecycle.js';
import { startMusic } from './music.js';
import { t, getLang, setLang, applyStatics } from './i18n.js';

// ------------------------------ Sélection de personnage ------------------------------
function buildCharSelect() {
  const el = document.getElementById('chars');
  el.innerHTML = '';
  for (const id in CHARS) {
    const c = CHARS[id];
    const card = document.createElement('div');
    card.className = 'cchar' + (id === session.char ? ' sel' : '');
    const cv = document.createElement('canvas');
    cv.width = cv.height = 58;
    const g = cv.getContext('2d');
    const spr = SPR[c.spr];
    g.drawImage(spr, 0, 0, spr.width, spr.height, 0, 0, 58, 58);
    card.appendChild(cv);
    const name = document.createElement('div'); name.className = 'cname'; name.textContent = t(c.name);
    const desc = document.createElement('div'); desc.className = 'cdesc'; desc.innerHTML = t(c.desc);
    card.appendChild(name); card.appendChild(desc);
    card.onclick = () => {
      session.char = id;
      for (const el2 of document.querySelectorAll('.cchar')) el2.classList.remove('sel');
      card.classList.add('sel');
      buildLobby(); // reflète le héros de J1 dans le salon
      tone(700, 0.06, 'sine', 0.03, 200);
    };
    el.appendChild(card);
  }
}
buildCharSelect();

// ------------------------------ Hangar ------------------------------
function buildHangar() {
  const el = document.getElementById('metalist');
  el.innerHTML = '';
  for (const id in META) {
    const m = META[id];
    const lvl = metaLvl(id);
    const maxed = lvl >= m.max;
    const cost = metaCost(id);
    const row = document.createElement('div');
    row.className = 'meta' + (maxed ? ' maxed' : '');
    const pips = Array.from({ length: m.max }, (_, i) => `<div class="pip${i < lvl ? ' on' : ''}"></div>`).join('');
    row.innerHTML = `<div class="mico">${m.icon}</div>
      <div class="mbody"><div class="mn">${t(m.name)}</div><div class="md">${t(m.desc)}</div><div class="pips">${pips}</div></div>`;
    const btn = document.createElement('button');
    btn.className = 'buy';
    if (maxed) { btn.textContent = t('MAX'); btn.disabled = true; }
    else {
      btn.textContent = `${cost} ©`;
      btn.disabled = META_STATE.credits < cost;
      btn.onclick = () => {
        if (META_STATE.credits < cost) return;
        META_STATE.credits -= cost;
        META_STATE.up[id] = lvl + 1;
        saveMeta();
        updateCreditsUI();
        buildHangar();
        sfx.lvl();
      };
    }
    row.appendChild(btn);
    el.appendChild(row);
  }
  // ---- marché noir : armes légendaires, achat définitif pour tous les héros
  const divider = document.createElement('div');
  divider.className = 'sectlabel marketlabel';
  divider.textContent = t('MARCHÉ NOIR — ARMES LÉGENDAIRES');
  el.appendChild(divider);
  for (const id in WEAPONS) {
    const w = WEAPONS[id];
    if (!w.market) continue;
    const owned = META_STATE.weapons.includes(id);
    const row = document.createElement('div');
    row.className = 'meta market' + (owned ? ' maxed' : '');
    row.innerHTML = `<div class="mico">${w.icon}</div>
      <div class="mbody"><div class="mn">${t(w.name)}</div><div class="md">${t(w.desc(0))}<br><i>${t('Débloque cette arme pour tous les héros, définitivement.')}</i></div></div>`;
    const btn = document.createElement('button');
    btn.className = 'buy';
    if (owned) { btn.textContent = t('ACQUIS ✔'); btn.disabled = true; }
    else {
      btn.textContent = `${w.price} ©`;
      btn.disabled = META_STATE.credits < w.price;
      btn.onclick = () => {
        if (META_STATE.credits < w.price) return;
        META_STATE.credits -= w.price;
        META_STATE.weapons.push(id);
        saveMeta();
        updateCreditsUI();
        buildHangar();
        sfx.lvl();
      };
    }
    row.appendChild(btn);
    el.appendChild(row);
  }
}
document.getElementById('hangarBtn').onclick = () => { showScreen('hangar'); updateCreditsUI(); };
document.getElementById('hangarBack').onclick = () => showScreen('home');
updateCreditsUI();

function buildLevelSelect() {
  const el = document.getElementById('levels');
  el.innerHTML = '';
  const order = Object.keys(LEVELS);
  // si la destination sélectionnée est verrouillée (nouvelle sauvegarde), repli
  if (order.indexOf(session.level) >= META_STATE.maxLevel) session.level = order[0];
  order.forEach((id, i) => {
    const lv = LEVELS[id];
    const locked = i >= META_STATE.maxLevel; // déblocage 1 par 1 (boss vaincu)
    const chip = document.createElement('div');
    chip.className = 'lvlchip' + (id === session.level ? ' sel' : '') + (locked ? ' locked' : '');
    chip.innerHTML = locked
      ? `<div class="lico">🔒</div><div class="lname">${t(lv.name)}</div><div class="ldesc">${t('Terrasse le boss du secteur précédent.')}</div>`
      : `<div class="lico">${lv.icon}</div><div class="lname">${t(lv.name)}</div><div class="ldesc">${t(lv.desc)}</div>`;
    if (!locked) {
      chip.onclick = () => {
        session.level = id;
        for (const el2 of document.querySelectorAll('.lvlchip')) el2.classList.remove('sel');
        chip.classList.add('sel');
        tone(560, 0.06, 'sine', 0.03, 160);
      };
    }
    el.appendChild(chip);
  });
}
buildLevelSelect();

// ------------------------------ Difficulté ------------------------------
const DIFFS = [
  { name: 'PADAWAN', desc: 'Ennemis ×1 · crédits ×1' },
  { name: 'CHEVALIER', desc: 'Ennemis ×1,5 · crédits ×1,4' },
  { name: 'MAÎTRE', desc: 'Ennemis ×2,2 · crédits ×2' },
];
function buildDiffSelect() {
  const el = document.getElementById('diffsel');
  el.innerHTML = '';
  DIFFS.forEach((d, i) => {
    const chip = document.createElement('div');
    chip.className = 'lvlchip diff' + (i === session.difficulty ? ' sel' : '');
    chip.innerHTML = `<div class="lico">${'⭐'.repeat(i + 1)}</div><div class="lname">${t(d.name)}</div><div class="ldesc">${t(d.desc)}</div>`;
    chip.onclick = () => {
      session.difficulty = i;
      for (const el2 of document.querySelectorAll('#diffsel .lvlchip')) el2.classList.remove('sel');
      chip.classList.add('sel');
      tone(600 + i * 90, 0.06, 'sine', 0.03, 160);
    };
    el.appendChild(chip);
  });
}
buildDiffSelect();

// ------------------------------ Écrans du menu ------------------------------
const SCREENS = ['home', 'levelselect', 'teamscreen', 'hangar', 'options', 'credits'];
function showScreen(id) {
  for (const sid of SCREENS) document.getElementById(sid).classList.remove('on');
  document.getElementById('victory').classList.remove('on');
  document.getElementById('gameover').classList.remove('on');
  document.getElementById(id).classList.add('on');
  S.scene = 'menu';
  if (id === 'home') {
    updateCreditsUI();
    const n = META_STATE.fragments.length;
    document.getElementById('fragline').textContent = '◆'.repeat(n) + '◇'.repeat(5 - n);
  }
  if (id === 'levelselect') { buildLevelSelect(); buildDiffSelect(); }
  if (id === 'teamscreen') { buildCharSelect(); buildLobby(); }
  if (id === 'hangar') buildHangar();
}
document.getElementById('playBtn').onclick = () => { showScreen('levelselect'); tone(700, 0.07, 'sine', 0.04, 200); };
document.getElementById('toTeamBtn').onclick = () => { showScreen('teamscreen'); tone(700, 0.07, 'sine', 0.04, 200); };
document.getElementById('backHome1').onclick = () => showScreen('home');
document.getElementById('backLevels').onclick = () => showScreen('levelselect');

// ------------------------------ Salon coop (manettes) ------------------------------
// J2-J4 rejoignent depuis le menu : A (ou Start) pour entrer, ←/→ pour choisir
// son héros, B pour quitter. J1 choisit le sien dans la grille CHAMPION.
const CHAR_IDS = Object.keys(CHARS);
const lobbyPrev = {};

function heroCanvas(charId, size = 44) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const spr = SPR[CHARS[charId].spr];
  cv.getContext('2d').drawImage(spr, 0, 0, spr.width, spr.height, 0, 0, size, size);
  return cv;
}

function buildLobby() {
  const el = document.getElementById('teamsel');
  el.innerHTML = '';
  const slots = [{ char: session.char, pad: session.p1pad }, ...session.roster];
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    const s = slots[i];
    if (s) {
      slot.className = 'pslot filled';
      slot.style.borderColor = PLAYER_TINT[i];
      slot.innerHTML = `<div class="ptag" style="color:${PLAYER_TINT[i]}">J${i + 1} · ${i === 0 ? (session.p1pad != null ? t('MANETTE') : t('CLAVIER')) : t('MANETTE')}</div>` +
        `<div class="pname">${t(CHARS[s.char].name)}</div>` +
        `<div class="phint">${i === 0 ? t('héros via CHAMPION ci-dessus') : t('◄ ► héros · B quitte')}</div>`;
      slot.insertBefore(heroCanvas(s.char), slot.children[1]);
    } else {
      slot.className = 'pslot empty';
      slot.innerHTML = `<div class="ptag">J${i + 1}</div><div class="pjoin">🎮</div><div class="pname">${t('APPUIE SUR A')}</div>`;
    }
    el.appendChild(slot);
  }
}

// ------------------------------ Navigation manette des menus ------------------------------
// Toute manette hors salon navigue les menus : croix/stick = focus, A = valider,
// B = retour. Start (manette libre, écran ÉQUIPE visible) = rejoindre le salon.
let focusEl = null;

const overlayOn = id => document.getElementById(id).classList.contains('on');
const visibleEls = sel => [...document.querySelectorAll(sel)].filter(el => el.offsetParent !== null);

// grille de focus de l'overlay au premier plan : lignes d'éléments cliquables
function menuZones() {
  if (overlayOn('options')) return [visibleEls('#langsel .tchip'), [document.getElementById('musicRange')], [document.getElementById('sfxRange')], [document.getElementById('optionsBack')]];
  if (overlayOn('hangar')) return [...visibleEls('#metalist .buy:not(:disabled)').map(b => [b]), [document.getElementById('hangarBack')]];
  if (overlayOn('victory')) {
    const rows = [];
    const chips = visibleEls('#jumpchips .lvlchip');
    if (chips.length) rows.push(chips);
    for (const id of ['continueBtn', 'menuBtn3']) { const el = document.getElementById(id); if (el.offsetParent !== null) rows.push([el]); }
    return rows;
  }
  if (overlayOn('gameover')) return [[document.getElementById('retryBtn')], [document.getElementById('menuBtn')]];
  if (overlayOn('home')) return [
    [document.getElementById('playBtn')],
    [document.getElementById('hangarBtn')],
    [document.getElementById('optionsBtn')],
    [document.getElementById('creditsBtn')],
  ];
  if (overlayOn('credits')) return [[document.getElementById('creditsBack')]];
  if (overlayOn('levelselect')) return [
    visibleEls('#levels .lvlchip:not(.locked)'),
    visibleEls('#diffsel .lvlchip'),
    [document.getElementById('toTeamBtn')],
    [document.getElementById('backHome1')],
  ];
  if (overlayOn('teamscreen')) return [
    visibleEls('#chars .cchar'),
    [document.getElementById('startBtn')],
    [document.getElementById('backLevels')],
  ];
  return null;
}

function setFocus(el) {
  if (focusEl) focusEl.classList.remove('gfocus');
  focusEl = el;
  if (el) { el.classList.add('gfocus'); el.scrollIntoView({ block: 'nearest' }); }
}

function moveFocus(dr, dc) {
  const rows = menuZones();
  if (!rows || !rows.length) return;
  let r = rows.findIndex(row => row.includes(focusEl));
  let c = r >= 0 ? rows[r].indexOf(focusEl) : 0;
  if (r < 0) { r = rows.length - 1; c = 0; } // premier input : focus en bas (LANCER)
  else {
    // curseur focalisé : ◄ ► règle le volume au lieu de déplacer le focus
    if (dc !== 0 && focusEl && focusEl.type === 'range') {
      focusEl.value = +focusEl.value + dc * 5;
      focusEl.dispatchEvent(new Event('input'));
      return;
    }
    r = Math.min(rows.length - 1, Math.max(0, r + dr));
    c = Math.min(rows[r].length - 1, Math.max(0, c + dc));
  }
  setFocus(rows[r][c]);
  tone(520, 0.04, 'sine', 0.02, 120);
}

function backFocus() {
  if (overlayOn('credits')) document.getElementById('creditsBack').click();
  else if (overlayOn('options')) document.getElementById('optionsBack').click();
  else if (overlayOn('hangar')) document.getElementById('hangarBack').click();
  else if (overlayOn('levelselect')) document.getElementById('backHome1').click();
  else if (overlayOn('teamscreen')) document.getElementById('backLevels').click();
}

function pollPads() {
  const navScene = S.scene === 'menu' || S.scene === 'victory' || S.scene === 'gameover';
  if (!navScene) { setFocus(null); return; }
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const b0 = (gp, i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
  let dirty = false;
  for (const gp of pads) {
    if (!gp || !gp.connected) continue;
    const cur = {
      a: b0(gp, 0), quit: b0(gp, 1), start: b0(gp, 9),
      left: b0(gp, 14) || gp.axes[0] < -0.5, right: b0(gp, 15) || gp.axes[0] > 0.5,
      up: b0(gp, 12) || gp.axes[1] < -0.5, down: b0(gp, 13) || gp.axes[1] > 0.5,
    };
    const prev = lobbyPrev[gp.index] || cur; // pas de front sur la première lecture
    lobbyPrev[gp.index] = cur;
    const idx = session.roster.findIndex(r => r.pad === gp.index);
    const inMenu = S.scene === 'menu' && overlayOn('teamscreen');
    // Start : la manette prend la première place — J1 d'abord, puis J2-J4 ;
    // re-Start sur la manette de J1 la fait passer dans le salon (J2-J4)
    if (inMenu && cur.start && !prev.start && idx < 0) {
      if (session.p1pad === gp.index) {
        if (session.roster.length < 3) {
          session.p1pad = null;
          session.roster.push({ pad: gp.index, char: CHAR_IDS[session.roster.length + 1] });
          tone(700, 0.09, 'square', 0.04, 120);
          dirty = true;
        }
      } else if (session.p1pad == null) {
        session.p1pad = gp.index;
        tone(880, 0.09, 'square', 0.04, 160);
        dirty = true;
      } else if (session.roster.length < 3) {
        session.roster.push({ pad: gp.index, char: CHAR_IDS[session.roster.length + 1] });
        tone(760, 0.09, 'square', 0.04, 140);
        dirty = true;
      }
      lobbyPrev[gp.index] = cur;
      continue;
    }
    // B sur la manette de J1 : libère la place (retour clavier)
    if (inMenu && session.p1pad === gp.index && cur.quit && !prev.quit) {
      session.p1pad = null;
      tone(280, 0.12, 'square', 0.04, -80);
      dirty = true;
      continue;
    }
    if (inMenu && idx >= 0) {
      // manette du salon : choix de héros uniquement
      const r = session.roster[idx];
      if (cur.quit && !prev.quit) { session.roster.splice(idx, 1); tone(280, 0.12, 'square', 0.04, -80); dirty = true; }
      else {
        if (cur.right && !prev.right) { r.char = CHAR_IDS[(CHAR_IDS.indexOf(r.char) + 1) % CHAR_IDS.length]; tone(700, 0.06, 'sine', 0.03, 200); dirty = true; }
        if (cur.left && !prev.left) { r.char = CHAR_IDS[(CHAR_IDS.indexOf(r.char) + CHAR_IDS.length - 1) % CHAR_IDS.length]; tone(640, 0.06, 'sine', 0.03, 200); dirty = true; }
      }
      continue;
    }
    // navigation générique du menu au premier plan
    if (focusEl && !document.contains(focusEl)) setFocus(null); // élément reconstruit
    if (cur.up && !prev.up) moveFocus(-1, 0);
    if (cur.down && !prev.down) moveFocus(1, 0);
    if (cur.left && !prev.left) moveFocus(0, -1);
    if (cur.right && !prev.right) moveFocus(0, 1);
    if (cur.a && !prev.a && focusEl && document.contains(focusEl)) focusEl.click();
    if (cur.quit && !prev.quit) backFocus();
  }
  session.count = 1 + session.roster.length;
  if (dirty) buildLobby();
}
buildLobby();
setInterval(pollPads, 90);

document.getElementById('startBtn').onclick = startGame;
document.getElementById('retryBtn').onclick = startGame;
document.getElementById('menuBtn').onclick = () => showScreen('teamscreen');
document.getElementById('continueBtn').onclick = () => {
  document.getElementById('victory').classList.remove('on');
  document.getElementById('hud').classList.add('on');
  S.scene = 'play';
  startMusic(session.level);
  resetFrameClock();
};
document.getElementById('menuBtn3').onclick = () => showScreen('home');

export { buildHangar };

// ------------------------------ Contrôles tactiles ------------------------------
document.getElementById('pauseBtn').onclick = () => togglePause();
document.getElementById('resumeBtn').onclick = () => togglePause();
document.getElementById('muteBtn').onclick = function () { this.classList.toggle('off', toggleMute()); };

// ------------------------------ Menu OPTIONS ------------------------------
// Langue + volumes musique / effets (persistés via audio.js)
const musicRange = document.getElementById('musicRange');
const sfxRange = document.getElementById('sfxRange');
function syncOptions() {
  musicRange.value = Math.round(musicVol() * 100);
  sfxRange.value = Math.round(sfxVol() * 100);
  document.getElementById('musicVal').textContent = musicRange.value + ' %';
  document.getElementById('sfxVal').textContent = sfxRange.value + ' %';
}
musicRange.oninput = () => { setMusicVol(musicRange.value / 100); syncOptions(); };
sfxRange.oninput = () => { setSfxVol(sfxRange.value / 100); syncOptions(); tone(620, 0.08, 'square', 0.05, 120); };
document.getElementById('optionsBtn').onclick = () => { syncOptions(); showScreen('options'); };
document.getElementById('optionsBack').onclick = () => showScreen('home');
document.getElementById('creditsBtn').onclick = () => showScreen('credits');
document.getElementById('creditsBack').onclick = () => showScreen('home');
syncOptions();

// ------------------------------ Langue (FR / EN) ------------------------------
// Le français est la langue source ; le dictionnaire i18n traduit à l'affichage.
function applyLanguage() {
  applyStatics();
  if (window.matchMedia('(pointer: coarse)').matches) {
    document.querySelector('#home .hint').innerHTML =
      t('Glisse ton pouce sur l\'écran pour te déplacer · attaques automatiques · ⏸ pause et liste des combos');
  }
  document.querySelectorAll('#langsel .tchip').forEach(ch => ch.classList.toggle('sel', ch.dataset.lang === getLang()));
  buildCharSelect();
  buildLevelSelect();
  buildDiffSelect();
  buildLobby();
  buildHangar();
  updateCreditsUI();
}
document.querySelectorAll('#langsel .tchip').forEach(ch => {
  ch.onclick = () => {
    setLang(ch.dataset.lang);
    applyLanguage();
    tone(700, 0.06, 'sine', 0.03, 200);
  };
});
applyLanguage(); // applique la langue persistée au chargement
