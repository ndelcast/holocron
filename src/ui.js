// Holocron Survivors — menus : héros, destinations, hangar
import { S, session, PLAYER_TINT } from './state.js';
import { SPR } from './sprites.js';
import { CHARS } from './gamedata.js';
import { LEVELS } from './levels.js';
import { tone, sfx, toggleMute } from './audio.js';
import { META, META_STATE, saveMeta, metaLvl, metaCost, updateCreditsUI } from './meta.js';
import { startGame, resetFrameClock, togglePause } from './lifecycle.js';
import { startMusic } from './music.js';

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
    const name = document.createElement('div'); name.className = 'cname'; name.textContent = c.name;
    const desc = document.createElement('div'); desc.className = 'cdesc'; desc.innerHTML = c.desc;
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
      <div class="mbody"><div class="mn">${m.name}</div><div class="md">${m.desc}</div><div class="pips">${pips}</div></div>`;
    const btn = document.createElement('button');
    btn.className = 'buy';
    if (maxed) { btn.textContent = 'MAX'; btn.disabled = true; }
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
}
document.getElementById('hangarBtn').onclick = () => {
  buildHangar();
  updateCreditsUI();
  document.getElementById('menu').classList.remove('on');
  document.getElementById('hangar').classList.add('on');
};
document.getElementById('hangarBack').onclick = () => {
  document.getElementById('hangar').classList.remove('on');
  document.getElementById('menu').classList.add('on');
};
updateCreditsUI();

function buildLevelSelect() {
  const el = document.getElementById('levels');
  el.innerHTML = '';
  for (const id in LEVELS) {
    const lv = LEVELS[id];
    const chip = document.createElement('div');
    chip.className = 'lvlchip' + (id === session.level ? ' sel' : '');
    chip.innerHTML = `<div class="lico">${lv.icon}</div><div class="lname">${lv.name}</div><div class="ldesc">${lv.desc}</div>`;
    chip.onclick = () => {
      session.level = id;
      for (const el2 of document.querySelectorAll('.lvlchip')) el2.classList.remove('sel');
      chip.classList.add('sel');
      tone(560, 0.06, 'sine', 0.03, 160);
    };
    el.appendChild(chip);
  }
}
buildLevelSelect();

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
  const slots = [{ char: session.char, pad: null }, ...session.roster];
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    const s = slots[i];
    if (s) {
      slot.className = 'pslot filled';
      slot.style.borderColor = PLAYER_TINT[i];
      slot.innerHTML = `<div class="ptag" style="color:${PLAYER_TINT[i]}">J${i + 1} · ${i === 0 ? 'CLAVIER' : 'MANETTE'}</div>` +
        `<div class="pname">${CHARS[s.char].name}</div>` +
        `<div class="phint">${i === 0 ? 'héros via CHAMPION ci-dessus' : '◄ ► héros · B quitte'}</div>`;
      slot.insertBefore(heroCanvas(s.char), slot.children[1]);
    } else {
      slot.className = 'pslot empty';
      slot.innerHTML = `<div class="ptag">J${i + 1}</div><div class="pjoin">🎮</div><div class="pname">APPUIE SUR A</div>`;
    }
    el.appendChild(slot);
  }
}

function pollLobby() {
  if (S.scene !== 'menu') return;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let dirty = false;
  for (const gp of pads) {
    if (!gp || !gp.connected) continue;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const cur = { a: b(0) || b(9), quit: b(1), left: b(14) || gp.axes[0] < -0.5, right: b(15) || gp.axes[0] > 0.5 };
    const prev = lobbyPrev[gp.index] || cur; // pas de front sur la première lecture
    lobbyPrev[gp.index] = cur;
    const idx = session.roster.findIndex(r => r.pad === gp.index);
    if (idx < 0) {
      if (cur.a && !prev.a && session.roster.length < 3) {
        session.roster.push({ pad: gp.index, char: CHAR_IDS[session.roster.length + 1] });
        tone(760, 0.09, 'square', 0.04, 140);
        dirty = true;
      }
    } else if (cur.quit && !prev.quit) {
      session.roster.splice(idx, 1);
      tone(280, 0.12, 'square', 0.04, -80);
      dirty = true;
    } else {
      const r = session.roster[idx];
      if (cur.right && !prev.right) { r.char = CHAR_IDS[(CHAR_IDS.indexOf(r.char) + 1) % CHAR_IDS.length]; tone(700, 0.06, 'sine', 0.03, 200); dirty = true; }
      if (cur.left && !prev.left) { r.char = CHAR_IDS[(CHAR_IDS.indexOf(r.char) + CHAR_IDS.length - 1) % CHAR_IDS.length]; tone(640, 0.06, 'sine', 0.03, 200); dirty = true; }
    }
  }
  session.count = 1 + session.roster.length;
  if (dirty) buildLobby();
}
buildLobby();
setInterval(pollLobby, 100);

document.getElementById('startBtn').onclick = startGame;
document.getElementById('retryBtn').onclick = startGame;
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('gameover').classList.remove('on');
  document.getElementById('menu').classList.add('on');
  S.scene = 'menu';
};
document.getElementById('continueBtn').onclick = () => {
  document.getElementById('victory').classList.remove('on');
  document.getElementById('hud').classList.add('on');
  S.scene = 'play';
  startMusic(session.level);
  resetFrameClock();
};
document.getElementById('menuBtn3').onclick = () => {
  document.getElementById('victory').classList.remove('on');
  document.getElementById('menu').classList.add('on');
  S.scene = 'menu';
};

export { buildHangar };

// ------------------------------ Contrôles tactiles ------------------------------
document.getElementById('pauseBtn').onclick = () => togglePause();
document.getElementById('resumeBtn').onclick = () => togglePause();
document.getElementById('muteBtn').onclick = function () { this.classList.toggle('off', toggleMute()); };
if (window.matchMedia('(pointer: coarse)').matches) {
  document.querySelector('#menu .hint').innerHTML =
    'Glisse ton pouce sur l\'écran pour te déplacer · attaques automatiques · ⏸ pause et liste des combos';
}
