// Holocron Survivors — état global, joueur, entités
'use strict';

// ------------------------------ État du jeu ------------------------------
const S = {
  scene: 'menu', // menu | play | levelup | gameover
  paused: false,
  time: 0, kills: 0, level: 1, xp: 0, xpNext: 10,
  spawnT: 0, bossT: 90, shake: 0, freeze: 0, beamT: 0,
};
const player = { x: 0, y: 0, r: 13, hp: 100, maxHp: 100, speed: 175, magnet: 90, dmgMult: 1, cdMult: 1, invuln: 0, face: 1 };
let enemies = [], bullets = [], gems = [], particles = [], texts = [], waves = [], arcs = [], drones = [], booms = [], grenades = [], firePools = [], rings = [], ebullets = [];
function addRing(x, y, maxR, color, width = 3, life = 0.35) {
  if (rings.length > 40) rings.shift();
  rings.push({ x, y, maxR, color, width, life, maxLife: life });
}
let weapons = []; // instances : {id, lvl, t}
const passives = {}; // id -> lvl
