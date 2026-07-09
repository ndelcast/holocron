// Holocron Survivors — armes, passifs, combos, personnages


// ------------------------------ Définition des armes ------------------------------
const MAXLVL = 6;
const WEAPONS = {
  saber: {
    name: 'Sabre laser', icon: '⚔️', tag: 'Arme',
    desc: l => l === 0 ? 'Une lame verte orbite autour de toi.' : ['Dégâts +40 %', 'Rotation +30 %', 'Lame plus longue', 'Seconde lame', 'Dégâts +60 %'][l - 1],
    stats: l => ({ dmg: 9 * [1, 1.4, 1.4, 1.4, 1.4, 2.2][l - 1] * (1 + (l - 1) * 0.12), len: l >= 4 ? 88 : 68, spd: l >= 3 ? 4.6 : 3.5, blades: l >= 5 ? 2 : 1 }),
  },
  blaster: {
    name: 'Blaster', icon: '🔫', tag: 'Arme',
    desc: l => l === 0 ? 'Tire automatiquement sur l\'ennemi le plus proche.' : ['Cadence +25 %', 'Tir double', 'Dégâts +50 %', 'Tir triple', 'Cadence +35 %'][l - 1],
    stats: l => ({ dmg: 12 * (l >= 4 ? 1.5 : 1), cd: 0.85 * (l >= 2 ? 0.75 : 1) * (l >= 6 ? 0.65 : 1), shots: l >= 5 ? 3 : (l >= 3 ? 2 : 1) }),
  },
  wave: {
    name: 'Onde de Force', icon: '🌀', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Repousse et blesse tout autour de toi.' : ['Rayon +25 %', 'Dégâts +50 %', 'Recharge -25 %', 'Rayon +30 %', 'Dégâts +60 %'][l - 1],
    stats: l => ({ dmg: 15 * (l >= 3 ? 1.5 : 1) * (l >= 6 ? 1.6 : 1), cd: 4.2 * (l >= 4 ? 0.75 : 1), radius: 150 * (l >= 2 ? 1.25 : 1) * (l >= 5 ? 1.3 : 1) }),
  },
  lightning: {
    name: 'Éclairs de Force', icon: '⚡', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Foudroie un ennemi et se propage en chaîne.' : ['+1 rebond', 'Dégâts +40 %', '+2 rebonds', 'Recharge -30 %', 'Dégâts +70 %'][l - 1],
    stats: l => ({ dmg: 18 * (l >= 3 ? 1.4 : 1) * (l >= 6 ? 1.7 : 1), cd: 2.6 * (l >= 5 ? 0.7 : 1), chains: 2 + (l >= 2 ? 1 : 0) + (l >= 4 ? 2 : 0) }),
  },
  drone: {
    name: 'Droïde de combat', icon: '🛰️', tag: 'Allié',
    desc: l => l === 0 ? 'Un droïde orbite et mitraille tes ennemis.' : ['Cadence +30 %', 'Second droïde', 'Dégâts +50 %', 'Troisième droïde', 'Cadence +40 %'][l - 1],
    stats: l => ({ dmg: 8 * (l >= 4 ? 1.5 : 1), cd: 1.1 * (l >= 2 ? 0.7 : 1) * (l >= 6 ? 0.6 : 1), count: 1 + (l >= 3 ? 1 : 0) + (l >= 5 ? 1 : 0) }),
  },
  spear: {
    name: 'Lances ewoks', icon: '🏹', tag: 'Arme',
    desc: l => l === 0 ? 'Lance perforante qui traverse les rangs.' : ['Dégâts +30 %', 'Seconde lance', 'Cadence +25 %', 'Troisième lance', 'Dégâts +60 %'][l - 1],
    stats: l => ({ dmg: 11 * (l >= 2 ? 1.3 : 1) * (l >= 6 ? 1.6 : 1), cd: 1.25 * (l >= 4 ? 0.75 : 1), count: 1 + (l >= 3 ? 1 : 0) + (l >= 5 ? 1 : 0) }),
  },
  rocket: {
    name: 'Roquettes', icon: '🚀', tag: 'Arme',
    desc: l => l === 0 ? 'Roquette qui explose en zone.' : ['Zone +30 %', 'Dégâts +50 %', 'Recharge -25 %', 'Seconde roquette', 'Zone et dégâts +40 %'][l - 1],
    stats: l => ({ dmg: 16 * (l >= 3 ? 1.5 : 1) * (l >= 6 ? 1.4 : 1), cd: 2.1 * (l >= 4 ? 0.75 : 1), radius: 70 * (l >= 2 ? 1.3 : 1) * (l >= 6 ? 1.4 : 1), count: l >= 5 ? 2 : 1 }),
  },
  detonator: {
    name: 'Détonateur thermique', icon: '💣', tag: 'Arme',
    desc: l => l === 0 ? 'Lobe une grenade qui explose en zone.' : ['Dégâts +40 %', 'Zone +30 %', 'Recharge -25 %', 'Seconde grenade', 'Dégâts et zone +40 %'][l - 1],
    stats: l => ({ dmg: 24 * (l >= 2 ? 1.4 : 1) * (l >= 6 ? 1.4 : 1), cd: 2.9 * (l >= 4 ? 0.75 : 1), radius: 85 * (l >= 3 ? 1.3 : 1) * (l >= 6 ? 1.4 : 1), count: l >= 5 ? 2 : 1 }),
  },
  flame: {
    name: 'Lance-flammes', icon: '🔥', tag: 'Arme',
    desc: l => l === 0 ? 'Cône de feu soutenu vers l\'ennemi le plus proche.' : ['Dégâts +35 %', 'Portée +30 %', 'Durée +40 %', 'Recharge -25 %', 'Dégâts +60 %'][l - 1],
    stats: l => ({ dmg: 7 * (l >= 2 ? 1.35 : 1) * (l >= 6 ? 1.6 : 1), cd: 2.4 * (l >= 5 ? 0.75 : 1), range: 140 * (l >= 3 ? 1.3 : 1), dur: 0.9 * (l >= 4 ? 1.4 : 1) }),
  },
  ion: {
    name: 'Champ ionique', icon: '🌐', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Aura permanente qui électrocute et ralentit.' : ['Rayon +25 %', 'Dégâts +50 %', 'Ralentissement renforcé', 'Rayon +30 %', 'Dégâts +60 %'][l - 1],
    stats: l => ({ dmg: 4 * (l >= 3 ? 1.5 : 1) * (l >= 6 ? 1.6 : 1), radius: 85 * (l >= 2 ? 1.25 : 1) * (l >= 5 ? 1.3 : 1), slow: l >= 4 ? 0.45 : 0.3 }),
  },
};

// ------------------------------ Combos d'armes ------------------------------
const COMBOS = {
  jediMaster:   { name: 'Voie du Jedi', icon: '☯️', parts: ['saber', 'wave'], desc: 'Subir un coup déclenche une onde de Force vengeresse (toutes les 3 s max).' },
  bountyHunter: { name: 'Chasseur de primes', icon: '💰', parts: ['blaster', 'rocket'], desc: 'Chaque tir de blaster a 20 % de chance de partir avec une roquette.' },
  forceStorm:   { name: 'Tempête de Force', icon: '🌪️', parts: ['lightning', 'wave'], desc: 'Les éclairs gagnent +3 rebonds et ralentissent les ennemis foudroyés.' },
  squadron:     { name: 'Escadron rogue', icon: '🛩️', parts: ['drone', 'blaster'], desc: 'Les droïdes tirent des rafales de trois tirs.' },
  endor:        { name: 'Guérilla d\'Endor', icon: '🪵', parts: ['spear', 'detonator'], desc: 'Les lances explosent en fin de course.' },
  inferno:      { name: 'Inferno', icon: '☄️', parts: ['flame', 'rocket'], desc: 'Les explosions laissent une nappe de feu qui brûle pendant 3 s.' },
  ionSurge:     { name: 'Surcharge ionique', icon: '💫', parts: ['ion', 'lightning'], desc: 'Les ennemis dans le champ ionique subissent +30 % de dégâts, toutes sources confondues.' },
};

// ------------------------------ Personnages ------------------------------
const CHARS = {
  jedi:     { name: 'JEDI', spr: 'player', weapon: 'saber', hp: 100, speed: 175, r: 13, desc: 'Sabre laser<br>Recharge -10 %', mods: p => { p.cdMult = 0.9; } },
  ewok:     { name: 'EWOK', spr: 'ewok', weapon: 'spear', hp: 85, speed: 200, r: 11, desc: 'Lances perforantes<br>Agile · aimant +40 %', mods: p => { p.magnet *= 1.4; } },
  mando:    { name: 'MANDALORIEN', spr: 'mando', weapon: 'rocket', hp: 140, speed: 158, r: 14, armor: 0.8, desc: 'Roquettes · armure<br>Dégâts subis -20 %' },
  smuggler: { name: 'CONTREBANDIER', spr: 'smuggler', weapon: 'blaster', hp: 95, speed: 188, r: 13, desc: 'Blaster<br>Dégâts +15 % · véloce', mods: p => { p.dmgMult = 1.15; } },
};
const PASSIVES = {
  speed:  { name: 'Bottes de pilote', icon: '👢', tag: 'Passif', max: 5, desc: () => 'Vitesse de déplacement +8 %.', apply: p => { p.speed *= 1.08; } },
  vital:  { name: 'Entraînement Jedi', icon: '💚', tag: 'Passif', max: 5, desc: () => 'PV max +25 et soigne 25 PV.', apply: p => { p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
  magnet: { name: 'Cristal Kyber', icon: '🧲', tag: 'Passif', max: 5, desc: () => 'Rayon d\'attraction des fragments +30 %.', apply: p => { p.magnet *= 1.3; } },
  power:  { name: 'Colère maîtrisée', icon: '🔥', tag: 'Passif', max: 5, desc: () => 'Tous les dégâts +12 %.', apply: p => { p.dmgMult *= 1.12; } },
  haste:  { name: 'Méditation', icon: '🧘', tag: 'Passif', max: 5, desc: () => 'Recharge de toutes les armes -8 %.', apply: p => { p.cdMult *= 0.92; } },
  deflect: { name: 'Champ déflecteur', icon: '🛡️', tag: 'Passif', max: 5, desc: () => 'Dégâts subis -7 %.', apply: p => { p.armor *= 0.93; } },
  bacta:   { name: 'Bacta portatif', icon: '💧', tag: 'Passif', max: 5, desc: () => 'Régénère 0,6 PV par seconde.', apply: p => { p.regen += 0.6; } },
  fortune: { name: 'Fortune du contrebandier', icon: '🎲', tag: 'Passif', max: 5, desc: () => 'Expérience gagnée +10 %.', apply: p => { p.xpMult += 0.10; } },
  reflex:  { name: 'Réflexes de pilote', icon: '💨', tag: 'Passif', max: 5, desc: () => 'Chance d\'esquiver un coup +8 %.', apply: p => { p.dodge = Math.min(0.4, p.dodge + 0.08); } },
  crit:    { name: 'Visée assistée', icon: '🎯', tag: 'Passif', max: 5, desc: () => 'Chance de coup critique +8 % (dégâts ×2).', apply: p => { p.crit += 0.08; } },
};

function weaponLvl(p, id) { const w = p.weapons.find(w => w.id === id); return w ? w.lvl : 0; }

// ------------------------------ Bonus de ravitaillement ------------------------------
const BONUSES = {
  bacta:  { rgb: '82,255,122',  name: 'BACTA' },
  holo:   { rgb: '110,231,255', name: 'HOLOCRON' },
  ion:    { rgb: '165,130,255', name: 'BOMBE IONIQUE' },
  magnet: { rgb: '255,209,102', name: 'AIMANT GALACTIQUE' },
};

export { MAXLVL, WEAPONS, PASSIVES, COMBOS, CHARS, BONUSES, weaponLvl };
