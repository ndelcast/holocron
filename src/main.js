// Holocron Survivors — point d'entrée
import './style.css';
import './input.js';
import './lifecycle.js';
import './ui.js';

// Poignée de debug pour la console et les tests automatisés
import { S, players, alivePlayers, nearestPlayer, teamCenter, session, runtime, enemies, ebullets, bonuses } from './state.js';
import { WEAPONS, PASSIVES, CHARS, COMBOS, weaponLvl } from './gamedata.js';
import { LEVELS, BOSSES } from './levels.js';
import { startGame, togglePause, resetGame } from './lifecycle.js';
import { update, updateHud } from './update.js';
import { render } from './render.js';
import { touch } from './input.js';
import { spawnEnemy, spawnFinalBoss } from './enemies.js';
import { checkCombos } from './levelup.js';
import { META_STATE, metaLvl } from './meta.js';
import { buildHangar } from './ui.js';

window.HS = {
  S, players, alivePlayers, nearestPlayer, teamCenter, session, runtime, enemies, ebullets, bonuses, touch,
  WEAPONS, PASSIVES, CHARS, COMBOS, weaponLvl,
  LEVELS, BOSSES, startGame, togglePause, resetGame, update, updateHud, render,
  spawnEnemy, spawnFinalBoss, checkCombos, META_STATE, metaLvl, buildHangar,
};
