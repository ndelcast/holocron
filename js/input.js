// Holocron Survivors — clavier
'use strict';

// ------------------------------ Entrées ------------------------------
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
