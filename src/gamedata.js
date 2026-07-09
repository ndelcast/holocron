// Holocron Survivors — armes, passifs, combos, personnages


// ------------------------------ Définition des armes ------------------------------
// 25 paliers par arme : croissance continue à chaque niveau (dégâts, cadence,
// portée) + jalon spectaculaire tous les 5-6 niveaux (lame, tir, droïde,
// roquette supplémentaires). Au palier 25 : 6 lames, 6 tirs, 6 droïdes…
const MAXLVL = 25;
const g = (base, rate, l) => base * Math.pow(rate, l - 1); // croissance géométrique
const ORD_F = ['Seconde', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième'];
const ORD_M = ['Second', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième'];
const WEAPONS = {
  saber: {
    name: 'Sabre laser', icon: '⚔️', tag: 'Arme',
    desc: l => l === 0 ? 'Une lame verte orbite autour de toi.'
      : (l + 1) % 5 === 0 ? ORD_F[(l + 1) / 5 - 1] + ' lame !'
      : 'Lame plus longue et plus vive · dégâts +9 %',
    stats: l => ({ dmg: g(9, 1.09, l), len: 60 + l * 4, spd: 3.4 + l * 0.1, blades: 1 + Math.floor(l / 5) }),
  },
  blaster: {
    name: 'Blaster', icon: '🔫', tag: 'Arme',
    desc: l => l === 0 ? 'Tire automatiquement sur l\'ennemi le plus proche.'
      : (l + 1) % 5 === 0 ? 'Tir ' + ['double', 'triple', 'quadruple', 'quintuple', 'sextuple'][(l + 1) / 5 - 1] + ' !'
      : 'Dégâts +7 % · cadence +3,5 %',
    stats: l => ({ dmg: g(12, 1.07, l), cd: g(0.85, 0.965, l), shots: 1 + Math.floor(l / 5) }),
  },
  wave: {
    name: 'Onde de Force', icon: '🌀', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Repousse et blesse tout autour de toi.' : 'Rayon +5 % · dégâts +9 % · recharge -3 %',
    stats: l => ({ dmg: g(15, 1.09, l), cd: g(4.2, 0.97, l), radius: 140 * (1 + 0.05 * (l - 1)) }),
  },
  lightning: {
    name: 'Éclairs de Force', icon: '⚡', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Foudroie un ennemi et se propage en chaîne.'
      : (l + 1) % 3 === 0 ? '+1 rebond · dégâts +8 %'
      : 'Dégâts +8 % · recharge -3 %',
    stats: l => ({ dmg: g(18, 1.08, l), cd: g(2.6, 0.97, l), chains: 2 + Math.floor(l / 3) }),
  },
  drone: {
    name: 'Droïde de combat', icon: '🛰️', tag: 'Allié',
    desc: l => l === 0 ? 'Un droïde orbite et mitraille tes ennemis.'
      : (l + 1) % 5 === 0 ? ORD_M[(l + 1) / 5 - 1] + ' droïde !'
      : 'Dégâts +8 % · cadence +4 %',
    stats: l => ({ dmg: g(8, 1.08, l), cd: g(1.1, 0.96, l), count: 1 + Math.floor(l / 5) }),
  },
  spear: {
    name: 'Lances ewoks', icon: '🏹', tag: 'Arme',
    desc: l => l === 0 ? 'Lance perforante qui traverse les rangs.'
      : (l + 1) % 5 === 0 ? ORD_F[(l + 1) / 5 - 1] + ' lance !'
      : 'Dégâts +8 % · cadence +3 %',
    stats: l => ({ dmg: g(11, 1.08, l), cd: g(1.25, 0.97, l), count: 1 + Math.floor(l / 5) }),
  },
  rocket: {
    name: 'Roquettes', icon: '🚀', tag: 'Arme',
    desc: l => l === 0 ? 'Roquette qui explose en zone.'
      : (l + 1) % 6 === 0 ? 'Roquette supplémentaire !'
      : 'Zone +4 % · dégâts +8 %',
    stats: l => ({ dmg: g(16, 1.08, l), cd: g(2.1, 0.975, l), radius: 65 * (1 + 0.04 * (l - 1)), count: 1 + Math.floor(l / 6) }),
  },
  detonator: {
    name: 'Détonateur thermique', icon: '💣', tag: 'Arme',
    desc: l => l === 0 ? 'Lobe une grenade qui explose en zone.'
      : (l + 1) % 6 === 0 ? 'Grenade supplémentaire !'
      : 'Zone +4,5 % · dégâts +8 %',
    stats: l => ({ dmg: g(24, 1.08, l), cd: g(2.9, 0.972, l), radius: 80 * (1 + 0.045 * (l - 1)), count: 1 + Math.floor(l / 6) }),
  },
  flame: {
    name: 'Lance-flammes', icon: '🔥', tag: 'Arme',
    desc: l => l === 0 ? 'Cône de feu soutenu vers l\'ennemi le plus proche.' : 'Portée +4,5 % · durée +3 % · dégâts +8,5 %',
    stats: l => ({ dmg: g(7, 1.085, l), cd: g(2.4, 0.975, l), range: 130 * (1 + 0.045 * (l - 1)), dur: 0.9 * (1 + 0.03 * (l - 1)) }),
  },
  ion: {
    name: 'Champ ionique', icon: '🌐', tag: 'Pouvoir',
    desc: l => l === 0 ? 'Aura permanente qui électrocute et ralentit.' : 'Rayon +5 % · dégâts +9 % · ralentissement renforcé',
    stats: l => ({ dmg: g(4, 1.09, l), radius: 80 * (1 + 0.05 * (l - 1)), slow: Math.min(0.75, 0.28 + l * 0.02) }),
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
