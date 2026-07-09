// Holocron Survivors — état global, équipe, entités
export const S = {
  scene: 'menu', // menu | play | levelup | victory | gameover
  paused: false,
  time: 0, kills: 0, level: 1, xp: 0, xpNext: 10,
  spawnT: 0, bossT: 90, shake: 0, freeze: 0, beamT: 0,
  zoomKick: 0, streak: 0, streakT: 0, afterT: 0, bonusT: 12,
};
// sélections du menu et compteurs de partie (objets pour rester mutables entre modules)
export const session = { char: 'jedi', level: 'space', count: 1 };
export const runtime = { waveId: 0, pendingLvls: 0, lvlQueue: [] };

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
