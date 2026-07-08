// Holocron Survivors — expérience, choix d'améliorations, listes UI
import { S, player, session, runtime, weapons, passives, addRing } from './state.js';
import { MAXLVL, WEAPONS, PASSIVES, COMBOS, activeCombos, weaponLvl } from './gamedata.js';
import { LEVELS } from './levels.js';
import { sfx } from './audio.js';
import { addText, burst, sparks, flash } from './effects.js';
import { resetFrameClock } from './lifecycle.js';

// ------------------------------ Level up ------------------------------
function xpFor(level) { return Math.floor(8 * Math.pow(1.28, level - 1) + level * 2); }
function gainXp(v) {
  S.xp += v * (player.xpMult || 1) * (LEVELS[session.level].xpMult || 1);
  while (S.xp >= S.xpNext) {
    S.xp -= S.xpNext;
    S.level++;
    S.xpNext = xpFor(S.level);
    runtime.pendingLvls++;
    addRing(player.x, player.y, 240, '255,209,102', 4, 0.6);
    burst(player.x, player.y, '#ffd166', 18, 260);
    sparks(player.x, player.y, '255,220,140', 12, 320);
    flash('255,209,102', 0.22);
    S.beamT = 0.7;
  }
  if (runtime.pendingLvls > 0 && S.scene === 'play') openLevelUp();
}
function buildChoices() {
  const opts = [];
  for (const id in WEAPONS) {
    const lvl = weaponLvl(id);
    if (lvl === 0 && weapons.length >= 4 && !weapons.find(w => w.id === id)) continue; // 4 armes max
    if (lvl < MAXLVL) opts.push({ kind: 'weapon', id, lvl });
  }
  for (const id in PASSIVES) {
    const lvl = passives[id] || 0;
    if (lvl < PASSIVES[id].max) opts.push({ kind: 'passive', id, lvl });
  }
  // mélange de Fisher-Yates
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[opts[i], opts[j]] = [opts[j], opts[i]]; }
  const out = opts.slice(0, 3);
  if (!out.length) out.push({ kind: 'heal' });
  return out;
}
function openLevelUp() {
  S.scene = 'levelup';
  sfx.lvl();
  const cardsEl = document.getElementById('cards');
  cardsEl.innerHTML = '';
  for (const opt of buildChoices()) {
    const card = document.createElement('div');
    card.className = 'card';
    let icon, name, tag, desc;
    if (opt.kind === 'heal') {
      icon = '✨'; name = 'Sérénité'; tag = 'Bonus'; desc = 'Restaure entièrement tes PV.';
    } else if (opt.kind === 'weapon') {
      const d = WEAPONS[opt.id];
      icon = d.icon; name = d.name; tag = opt.lvl === 0 ? 'Nouveau — ' + d.tag : d.tag + ' · niv. ' + (opt.lvl + 1);
      desc = d.desc(opt.lvl);
    } else {
      const d = PASSIVES[opt.id];
      icon = d.icon; name = d.name; tag = d.tag + ' · niv. ' + (opt.lvl + 1); desc = d.desc();
    }
    card.innerHTML = `<div class="icon">${icon}</div><div class="name">${name}</div><div class="tag">${tag}</div><div class="desc">${desc}</div>`;
    card.onclick = () => applyChoice(opt);
    cardsEl.appendChild(card);
  }
  document.getElementById('levelup').classList.add('on');
}
function applyChoice(opt) {
  if (opt.kind === 'heal') player.hp = player.maxHp;
  else if (opt.kind === 'weapon') {
    const w = weapons.find(w => w.id === opt.id);
    if (w) w.lvl++;
    else weapons.push({ id: opt.id, lvl: 1, t: 0 });
  } else {
    passives[opt.id] = (passives[opt.id] || 0) + 1;
    PASSIVES[opt.id].apply();
  }
  checkCombos();
  renderWeaponSlots();
  runtime.pendingLvls = Math.max(0, runtime.pendingLvls - 1);
  if (runtime.pendingLvls > 0) { openLevelUp(); return; } // niveaux en attente
  document.getElementById('levelup').classList.remove('on');
  S.scene = 'play';
  resetFrameClock(); // évite un gros dt après la pause
}
function checkCombos() {
  for (const id in COMBOS) {
    const c = COMBOS[id];
    if (activeCombos.has(id)) continue;
    if (c.parts.every(p => weaponLvl(p) > 0)) {
      activeCombos.add(id);
      sfx.lvl();
      addText(player.x, player.y - 50, 'COMBO : ' + c.name.toUpperCase(), '#ffd166', 18, 2.5);
    }
  }
}
function renderWeaponSlots() {
  const el = document.getElementById('weapons');
  el.innerHTML = '';
  for (const w of weapons) {
    const d = WEAPONS[w.id];
    el.innerHTML += `<div class="wslot" title="${d.name}">${d.icon}<small>${w.lvl}</small></div>`;
  }
  for (const id of activeCombos) {
    const c = COMBOS[id];
    el.innerHTML += `<div class="wslot" style="border-color:var(--gold)" title="${c.name}">${c.icon}<small style="color:var(--gold)">✦</small></div>`;
  }
}
function buildComboList() {
  const el = document.getElementById('combolist');
  el.innerHTML = '';
  for (const id in COMBOS) {
    const c = COMBOS[id];
    const owned = c.parts.filter(p => weaponLvl(p) > 0).length;
    const state = activeCombos.has(id) ? 'active' : owned === 1 ? 'partial' : 'locked';
    const label = state === 'active' ? 'ACTIF ✦' : state === 'partial' ? '1 / 2' : 'VERROUILLÉ';
    const req = c.parts.map(p => WEAPONS[p].name).join(' + ');
    const div = document.createElement('div');
    div.className = 'combo ' + state;
    div.innerHTML = `<div class="cico">${c.icon}</div><div class="cbody"><div class="cn">${c.name}</div><div class="req">${req}</div><div class="cdesc2">${c.desc}</div></div><div class="cstate ${state}">${label}</div>`;
    el.appendChild(div);
  }
}

export { xpFor, gainXp, openLevelUp, applyChoice, checkCombos, renderWeaponSlots, buildComboList };
