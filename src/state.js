// Holocron Survivors — état global, joueur, entités
export const S = {
  scene: 'menu', // menu | play | levelup | victory | gameover
  paused: false,
  time: 0, kills: 0, level: 1, xp: 0, xpNext: 10,
  spawnT: 0, bossT: 90, shake: 0, freeze: 0, beamT: 0,
  zoomKick: 0, streak: 0, streakT: 0, afterT: 0,
};
export const player = { x: 0, y: 0, r: 13, hp: 100, maxHp: 100, speed: 175, magnet: 90, dmgMult: 1, cdMult: 1, invuln: 0, face: 1 };
// sélections du menu et compteurs de partie (objets pour rester mutables entre modules)
export const session = { char: 'jedi', level: 'space' };
export const runtime = { ionAura: null, waveId: 0, pendingLvls: 0 };
// entités : tableaux constants, vidés sur place à chaque partie
export const enemies = [], bullets = [], gems = [], particles = [], texts = [],
  waves = [], arcs = [], drones = [], booms = [], grenades = [], firePools = [],
  rings = [], ebullets = [], decals = [];
export const weapons = []; // instances : {id, lvl, t}
export const passives = {}; // id -> lvl
export function addRing(x, y, maxR, color, width = 3, life = 0.35) {
  if (rings.length > 40) rings.shift();
  rings.push({ x, y, maxR, color, width, life, maxLife: life });
}
