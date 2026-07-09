// Holocron Survivors — crédits, sauvegarde localStorage, hangar (logique)
import { S, campaign } from './state.js';

// ------------------------------ Méta-progression (crédits persistants) ------------------------------
const META = {
  hull:     { name: 'Coque renforcée', icon: '💚', max: 5, base: 80,  desc: '+12 PV max par niveau' },
  power:    { name: 'Cristaux surcadencés', icon: '🔥', max: 5, base: 120, desc: '+4 % de dégâts par niveau' },
  boots:    { name: 'Servomoteurs', icon: '👢', max: 5, base: 90,  desc: '+3 % de vitesse par niveau' },
  magnet:   { name: 'Collecteur magnétique', icon: '🧲', max: 5, base: 70,  desc: '+12 % de rayon d\'aimant par niveau' },
  cooldown: { name: 'Condensateurs', icon: '⚡', max: 5, base: 130, desc: '-3 % de recharge par niveau' },
  xp:       { name: 'Mémoire d\'holocron', icon: '🔷', max: 5, base: 100, desc: '+5 % d\'expérience par niveau' },
  armor:    { name: 'Plaques de beskar', icon: '🛡️', max: 5, base: 120, desc: '-4 % de dégâts subis par niveau' },
  greed:    { name: 'Contacts au cartel', icon: '💰', max: 5, base: 100, desc: '+10 % de crédits gagnés par niveau' },
  revive:   { name: 'Esprit de la Force', icon: '✨', max: 1, base: 800, desc: 'Résurrection à 50 % des PV, une fois par partie' },
};
function loadMeta() {
  try {
    const d = JSON.parse(localStorage.getItem('holocron_meta'));
    if (d && typeof d.credits === 'number' && d.up) { d.weapons = Array.isArray(d.weapons) ? d.weapons : []; return d; }
  } catch (e) { /* sauvegarde corrompue : repart de zéro */ }
  return { credits: 0, up: {}, weapons: [] };
}
const META_STATE = loadMeta();
function saveMeta() { try { localStorage.setItem('holocron_meta', JSON.stringify(META_STATE)); } catch (e) {} }
function metaLvl(id) { return META_STATE.up[id] || 0; }
function metaCost(id) { return META[id].base * (metaLvl(id) + 1); }
// Bancarisation incrémentale : chaque écran de fin verse la différence entre
// le total mérité par la campagne (stats cumulées, 250 © par fragment) et ce
// qui a déjà été versé — les secteurs enchaînés ne comptent jamais double.
function bankRewards() {
  const minutes = (campaign.prevTime + S.time) / 60;
  let total = Math.floor(S.kills * 0.5 + S.level * 5 + minutes * 10 + campaign.fragments.length * 250);
  total = Math.floor(total * (1 + 0.10 * metaLvl('greed')));
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
