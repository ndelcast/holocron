// Holocron Survivors — expérience, choix d'améliorations, listes UI
import { S, session, runtime, players, alivePlayers, PLAYER_TINT, addRing } from './state.js';
import { MAXLVL, WEAPONS, PASSIVES, COMBOS, weaponLvl } from './gamedata.js';
import { LEVELS } from './levels.js';
import { sfx } from './audio.js';
import { addText, burst, sparks, flash } from './effects.js';
import { resetFrameClock } from './lifecycle.js';

// ------------------------------ Level up ------------------------------
function xpFor(level) { return Math.floor(8 * Math.pow(1.28, level - 1) + level * 2); }

function gainXp(v, owner = null) {
  const mult = ((owner && owner.xpMult) || 1) * (LEVELS[session.level].xpMult || 1);
  S.xp += v * mult;
  while (S.xp >= S.xpNext) {
    S.xp -= S.xpNext;
    S.level++;
    S.xpNext = xpFor(S.level);
    runtime.pendingLvls++;
    for (const p of alivePlayers()) {
      addRing(p.x, p.y, 240, '255,209,102', 4, 0.6);
      burst(p.x, p.y, '#ffd166', 14, 260);
      sparks(p.x, p.y, '255,220,140', 10, 320);
    }
    flash('255,209,102', 0.22);
    S.beamT = 0.7;
    S.zoomKick = Math.max(S.zoomKick, 0.06);
  }
  if (runtime.pendingLvls > 0 && S.scene === 'play') startLevelUpFlow();
}

// chaque niveau gagné offre un choix à chaque joueur vivant, à tour de rôle
function startLevelUpFlow() {
  while (runtime.pendingLvls > 0) {
    runtime.pendingLvls--;
    for (const p of alivePlayers()) runtime.lvlQueue.push(p.idx);
  }
  openLevelUp();
}

function buildChoices(p) {
  const opts = [];
  for (const id in WEAPONS) {
    const lvl = weaponLvl(p, id);
    if (lvl === 0 && p.weapons.length >= 4) continue; // 4 armes max par joueur
    if (lvl < MAXLVL) opts.push({ kind: 'weapon', id, lvl });
  }
  for (const id in PASSIVES) {
    const lvl = p.passives[id] || 0;
    if (lvl < PASSIVES[id].max) opts.push({ kind: 'passive', id, lvl });
  }
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const out = opts.slice(0, 3);
  if (!out.length) out.push({ kind: 'heal' });
  return out;
}

function currentChooser() {
  // saute les joueurs tombés entre-temps
  while (runtime.lvlQueue.length && players[runtime.lvlQueue[0]].dead) runtime.lvlQueue.shift();
  return runtime.lvlQueue.length ? players[runtime.lvlQueue[0]] : null;
}

function openLevelUp() {
  const p = currentChooser();
  if (!p) { closeLevelUp(); return; }
  S.scene = 'levelup';
  sfx.lvl();
  const h2 = document.querySelector('#levelup h2');
  h2.textContent = session.count > 1 ? `LA FORCE GRANDIT — JOUEUR ${p.idx + 1}` : 'LA FORCE GRANDIT';
  h2.style.color = session.count > 1 ? PLAYER_TINT[p.idx] : '';
  const cardsEl = document.getElementById('cards');
  cardsEl.innerHTML = '';
  for (const opt of buildChoices(p)) {
    const card = document.createElement('div');
    card.className = 'card';
    let icon, name, tag, desc;
    if (opt.kind === 'heal') {
      icon = '✨'; name = 'Sérénité'; tag = 'Bonus'; desc = 'Restaure entièrement tes PV.';
    } else if (opt.kind === 'weapon') {
      const d = WEAPONS[opt.id];
      icon = d.icon; name = d.name;
      tag = opt.lvl === 0 ? 'Nouveau — ' + d.tag : d.tag + ' · niv. ' + (opt.lvl + 1);
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
  const p = currentChooser();
  if (!p) { closeLevelUp(); return; }
  runtime.lvlQueue.shift();
  if (opt.kind === 'heal') p.hp = p.maxHp;
  else if (opt.kind === 'weapon') {
    const w = p.weapons.find(w => w.id === opt.id);
    if (w) w.lvl++;
    else p.weapons.push({ id: opt.id, lvl: 1, t: 0, angle: 0 });
  } else {
    p.passives[opt.id] = (p.passives[opt.id] || 0) + 1;
    PASSIVES[opt.id].apply(p);
  }
  checkCombos(p);
  renderWeaponSlots();
  if (runtime.lvlQueue.length > 0) { openLevelUp(); return; } // joueur suivant
  closeLevelUp();
}

function closeLevelUp() {
  document.getElementById('levelup').classList.remove('on');
  S.scene = 'play';
  resetFrameClock(); // évite un gros dt après la pause
}

function checkCombos(p) {
  for (const id in COMBOS) {
    const c = COMBOS[id];
    if (p.combos.has(id)) continue;
    if (c.parts.every(part => weaponLvl(p, part) > 0)) {
      p.combos.add(id);
      sfx.lvl();
      const tag = session.count > 1 ? `J${p.idx + 1} — ` : '';
      addText(p.x, p.y - 50, tag + 'COMBO : ' + c.name.toUpperCase(), '#ffd166', 18, 2.5);
    }
  }
}

function renderWeaponSlots() {
  const el = document.getElementById('weapons');
  el.innerHTML = '';
  for (const p of players) {
    const row = document.createElement('div');
    row.className = 'wrow';
    if (session.count > 1) row.style.borderColor = PLAYER_TINT[p.idx];
    for (const w of p.weapons) {
      const d = WEAPONS[w.id];
      row.innerHTML += `<div class="wslot" title="${d.name}">${d.icon}<small>${w.lvl}</small></div>`;
    }
    for (const id of p.combos) {
      const c = COMBOS[id];
      row.innerHTML += `<div class="wslot" style="border-color:var(--gold)" title="${c.name}">${c.icon}<small style="color:var(--gold)">✦</small></div>`;
    }
    el.appendChild(row);
  }
}

function buildComboList() {
  const el = document.getElementById('combolist');
  el.innerHTML = '';
  for (const id in COMBOS) {
    const c = COMBOS[id];
    // état le plus avancé au sein de l'équipe
    let best = 0; // 0 verrouillé, 1 partiel, 2 actif
    for (const p of players) {
      if (p.combos.has(id)) { best = 2; break; }
      if (c.parts.some(part => weaponLvl(p, part) > 0)) best = Math.max(best, 1);
    }
    const state = best === 2 ? 'active' : best === 1 ? 'partial' : 'locked';
    const label = state === 'active' ? 'ACTIF ✦' : state === 'partial' ? '1 / 2' : 'VERROUILLÉ';
    const req = c.parts.map(part => WEAPONS[part].name).join(' + ');
    const div = document.createElement('div');
    div.className = 'combo ' + state;
    div.innerHTML = `<div class="cico">${c.icon}</div><div class="cbody"><div class="cn">${c.name}</div><div class="req">${req}</div><div class="cdesc2">${c.desc}</div></div><div class="cstate ${state}">${label}</div>`;
    el.appendChild(div);
  }
}

export { xpFor, gainXp, openLevelUp, applyChoice, checkCombos, renderWeaponSlots, buildComboList };
