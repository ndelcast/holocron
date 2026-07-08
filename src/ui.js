// Holocron Survivors — menus : héros, destinations, hangar
import { S, session } from './state.js';
import { SPR } from './sprites.js';
import { CHARS } from './gamedata.js';
import { LEVELS } from './levels.js';
import { tone, sfx } from './audio.js';
import { META, META_STATE, saveMeta, metaLvl, metaCost, updateCreditsUI } from './meta.js';
import { startGame, resetFrameClock } from './lifecycle.js';

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
  resetFrameClock();
};
document.getElementById('menuBtn3').onclick = () => {
  document.getElementById('victory').classList.remove('on');
  document.getElementById('menu').classList.add('on');
  S.scene = 'menu';
};

export { buildHangar };
