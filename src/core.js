// Holocron Survivors — canvas, redimensionnement, utilitaires
export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const view = { w: 0, h: 0, dpr: 1 };
export const isTouch = window.matchMedia('(pointer: coarse)').matches;
function resize() {
  // viewport visible (la barre d'URL mobile fausse innerHeight)
  const vp = window.visualViewport;
  view.w = Math.round(vp ? vp.width : window.innerWidth);
  view.h = Math.round(vp ? vp.height : window.innerHeight);
  view.dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2); // plafond plus bas sur mobile
  // dézoom du monde sur petits écrans : on voit plus de terrain
  view.zoom = Math.max(0.7, Math.min(1, Math.min(view.w, view.h) / 760));
  canvas.width = view.w * view.dpr;
  canvas.height = view.h * view.dpr;
  canvas.style.width = view.w + 'px';
  canvas.style.height = view.h + 'px';
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
}
window.addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

export const rand = (a, b) => a + Math.random() * (b - a);
export const irand = (a, b) => Math.floor(rand(a, b + 1));
export const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const angleDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
