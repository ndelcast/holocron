// Holocron Survivors — clavier
import { togglePause } from './lifecycle.js';
import { S } from './state.js';

// ------------------------------ Entrées ------------------------------
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });



// ------------------------------ Joystick virtuel (tactile) ------------------------------
const touch = { active: false, dx: 0, dy: 0 };
let joyId = null, joyBaseX = 0, joyBaseY = 0;
const JOY_MAX = 48; // course du stick en pixels
function endJoy() {
  joyId = null;
  touch.active = false; touch.dx = 0; touch.dy = 0;
  document.getElementById('joy').style.display = 'none';
}
window.addEventListener('touchstart', e => {
  if (S.scene !== 'play' || S.paused) return;
  if (e.target.closest('button')) return;
  if (joyId !== null) return;
  const t = e.changedTouches[0];
  joyId = t.identifier; joyBaseX = t.clientX; joyBaseY = t.clientY;
  touch.active = true; touch.dx = 0; touch.dy = 0;
  const el = document.getElementById('joy');
  el.style.display = 'block';
  el.style.left = (joyBaseX - 55) + 'px';
  el.style.top = (joyBaseY - 55) + 'px';
  document.getElementById('joyStick').style.transform = 'translate(0px, 0px)';
  e.preventDefault();
}, { passive: false });
window.addEventListener('touchmove', e => {
  if (joyId === null) return;
  if (S.scene !== 'play') { endJoy(); return; }
  for (const t of e.changedTouches) {
    if (t.identifier !== joyId) continue;
    let dx = t.clientX - joyBaseX, dy = t.clientY - joyBaseY;
    const d = Math.hypot(dx, dy);
    if (d > JOY_MAX) { dx = dx / d * JOY_MAX; dy = dy / d * JOY_MAX; }
    touch.dx = dx / JOY_MAX; touch.dy = dy / JOY_MAX;
    document.getElementById('joyStick').style.transform = `translate(${dx}px, ${dy}px)`;
    e.preventDefault();
  }
}, { passive: false });
window.addEventListener('touchend', e => { for (const t of e.changedTouches) if (t.identifier === joyId) endJoy(); });
window.addEventListener('touchcancel', e => { for (const t of e.changedTouches) if (t.identifier === joyId) endJoy(); });

export { keys, touch };
