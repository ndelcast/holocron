// Holocron Survivors — état global, équipe, entités
export const S = {
  scene: 'menu', // menu | play | levelup | combo | victory | gameover
  paused: false,
  time: 0, kills: 0, level: 1, xp: 0, xpNext: 10,
  spawnT: 0, spawnAcc: 0, bossT: 90, surgeT: 60, shake: 0, freeze: 0, beamT: 0,
  zoomKick: 0, streak: 0, streakT: 0, afterT: 0, bonusT: 12,
  banked: 0, // crédits déjà bancarisés cette campagne (bancarisation incrémentale)
};
// sélections du menu et compteurs de partie (objets pour rester mutables entre modules)
// roster : joueurs 2-4 du salon coop — { pad: index manette, char: id héros } ;
// chacun rejoint depuis le menu avec A sur sa manette. count = 1 + roster.length.
export const session = { char: 'jedi', level: 'space', count: 1, roster: [] };
export const runtime = { waveId: 0, pendingLvls: 0, lvlQueue: [], comboQueue: [] };

// ------------------------------ Campagne : la Route de l'Hyperespace ------------------------------
// Une campagne = enchaîner les secteurs en conservant build, niveau et XP.
// Chaque seigneur de secteur vaincu lâche son fragment d'holocron ;
// les cinq fragments réunis reconstituent l'holocron (vraie fin).
export const campaign = { sector: 1, fragments: [], prevTime: 0 };
// pression du secteur : chaque saut durcit la traque (×1,3 / ×1,6 / ×1,9 / ×2,2)
export function campaignMult() { return 1 + 0.3 * (campaign.sector - 1); }

// ------------------------------ Équilibrage coop ------------------------------
// Facteurs dérivés de la taille d'équipe choisie au menu (fixes toute la partie,
// pour ne pas punir une équipe dont un joueur tombe). À 4 joueurs : densité ×2,5
// et PV ×1,75, soit une « masse » d'ennemis ≈ ×4,4 face à un DPS d'équipe ≈ ×4.
// Les boss scalent plus fort que les vagues car ils meurent au burst concentré.
// La courbe d'XP suit la densité : le butin par minute augmente d'autant, et
// chaque niveau distribue déjà un choix par joueur vivant.
export function coopSpawnMult() { return 1 + 0.5 * (session.count - 1); }
export function coopHpMult() { return 1 + 0.25 * (session.count - 1); }
export function coopBossMult() { return 1 + 0.7 * (session.count - 1); }

// ------------------------------ Équipe (1 à 4 joueurs) ------------------------------
export const players = []; // rempli par resetGame (lifecycle.js)
export const PLAYER_TINT = ['#6ee7ff', '#ffd166', '#52ff7a', '#ff8f6b'];
export function alivePlayers() { return players.filter(p => !p.dead); }
export function nearestPlayer(x, y) {
  let best = null, bd = Infinity;
  for (const p of players) {
    if (p.dead) continue;
    const dx = p.x - x, dy = p.y - y, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
export function teamCenter() {
  let sx = 0, sy = 0, n = 0;
  for (const p of players) {
    if (p.dead) continue;
    sx += p.x; sy += p.y; n++;
  }
  return n ? { x: sx / n, y: sy / n } : (players[0] || { x: 0, y: 0 });
}

// entités : tableaux constants, vidés sur place à chaque partie
export const enemies = [], bullets = [], gems = [], particles = [], texts = [],
  waves = [], arcs = [], drones = [], booms = [], grenades = [], firePools = [],
  rings = [], ebullets = [], decals = [], bonuses = [];
export function addRing(x, y, maxR, color, width = 3, life = 0.35) {
  if (rings.length > 40) rings.shift();
  rings.push({ x, y, maxR, color, width, life, maxLife: life });
}
