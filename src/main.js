// Holocron Survivors — point d'entrée
import './style.css';
import './input.js';
import './lifecycle.js';
import './ui.js';

// Poignée de debug pour la console et les tests automatisés
import { S, players, alivePlayers, nearestPlayer, teamCenter, session, runtime, campaign, vehicle, enemies, ebullets, bonuses } from './state.js';
import { WEAPONS, PASSIVES, CHARS, COMBOS, weaponLvl } from './gamedata.js';
import { LEVELS, BOSSES } from './levels.js';
import { startGame, togglePause, resetGame, jumpToSector, victory } from './lifecycle.js';
import { update, updateHud } from './update.js';
import { render } from './render.js';
import { touch } from './input.js';
import { spawnEnemy, spawnFinalBoss } from './enemies.js';
import { checkCombos, openComboModal, openLevelUp, gainXp } from './levelup.js';
import { META_STATE, metaLvl } from './meta.js';
import { buildHangar } from './ui.js';
import { audioCtx } from './audio.js';
import { startMusic, stopMusic } from './music.js';

window.HS = {
  S, players, alivePlayers, nearestPlayer, teamCenter, session, runtime, campaign, vehicle, enemies, ebullets, bonuses, touch,
  WEAPONS, PASSIVES, CHARS, COMBOS, weaponLvl,
  LEVELS, BOSSES, startGame, togglePause, resetGame, jumpToSector, victory, update, updateHud, render,
  spawnEnemy, spawnFinalBoss, checkCombos, openComboModal, openLevelUp, gainXp, META_STATE, metaLvl, buildHangar,
  audioCtx, startMusic, stopMusic,
};
