// Holocron Survivors — crédits, sauvegarde localStorage, hangar (logique)
import { S, session, creditMult } from './state.js';
import { gi } from './gamedata.js';

// ------------------------------ Méta-progression (crédits persistants) ------------------------------
const META = {
  hull:     { name: 'Coque renforcée', icon: gi('m_hull'), max: 5, base: 80,  desc: '+12 PV max par niveau' },
  power:    { name: 'Cristaux surcadencés', icon: gi('m_power'), max: 5, base: 120, desc: '+4 % de dégâts par niveau' },
  boots:    { name: 'Servomoteurs', icon: gi('m_boots'), max: 5, base: 90,  desc: '+3 % de vitesse par niveau' },
  magnet:   { name: 'Collecteur magnétique', icon: gi('m_magnet'), max: 5, base: 70,  desc: '+12 % de rayon d\'aimant par niveau' },
  cooldown: { name: 'Condensateurs', icon: gi('m_cooldown'), max: 5, base: 130, desc: '-3 % de recharge par niveau' },
  xp:       { name: 'Mémoire d\'holocron', icon: gi('m_xp'), max: 5, base: 100, desc: '+5 % d\'expérience par niveau' },
  armor:    { name: 'Plaques de beskar', icon: gi('m_armor'), max: 5, base: 120, desc: '-4 % de dégâts subis par niveau' },
  greed:    { name: 'Contacts au cartel', icon: gi('m_greed'), max: 5, base: 100, desc: '+10 % de crédits gagnés par niveau' },
  revive:   { name: 'Esprit de la Force', icon: gi('m_revive'), max: 1, base: 800, desc: 'Résurrection à 50 % des PV, une fois par partie' },
};
function loadMeta() {
  try {
    const d = JSON.parse(localStorage.getItem('holocron_meta'));
    if (d && typeof d.credits === 'number' && d.up) {
      d.weapons = Array.isArray(d.weapons) ? d.weapons : [];
      d.fragments = Array.isArray(d.fragments) ? d.fragments : [];
      d.maxLevel = Math.max(1, +d.maxLevel || 1);
      return d;
    }
  } catch (e) { /* sauvegarde corrompue : repart de zéro */ }
  return { credits: 0, up: {}, weapons: [], fragments: [], maxLevel: 1 };
}
const META_STATE = loadMeta();
function saveMeta() { try { localStorage.setItem('holocron_meta', JSON.stringify(META_STATE)); } catch (e) {} }
function metaLvl(id) { return META_STATE.up[id] || 0; }
function metaCost(id) { return META[id].base * (metaLvl(id) + 1); }
// Bancarisation incrémentale : chaque écran de fin verse la différence entre
// le total mérité par la partie et le déjà-versé (victoire puis 25:00 ne
// comptent jamais double). Les crédits suivent la difficulté choisie.
function bankRewards() {
  let total = Math.floor(S.kills * 0.5 + S.level * 5 + (S.time / 60) * 10 + (S.bossDefeated ? 250 : 0));
  total = Math.floor(total * (1 + 0.10 * metaLvl('greed')) * creditMult());
  const c = Math.max(0, total - S.banked);
  S.banked = total;
  META_STATE.credits += c;
  saveMeta();
  updateCreditsUI();
  return c;
}
function updateCreditsUI() {
  document.getElementById('creditsLabel').textContent = META_STATE.credits;
  document.querySelector('#hangarcredits b').textContent = META_STATE.credits;
}

export { META, META_STATE, saveMeta, metaLvl, metaCost, bankRewards, updateCreditsUI };
