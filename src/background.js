// Holocron Survivors — champ d'étoiles et nébuleuses
import { rand } from './core.js';

// ------------------------------ Fond étoilé ------------------------------
const STAR_LAYERS = [
  { n: 90, par: 0.15, size: 1, alpha: 0.5 },
  { n: 55, par: 0.35, size: 1.6, alpha: 0.75 },
  { n: 26, par: 0.6, size: 2.3, alpha: 1 },
];
const TILE = 1400;
const stars = STAR_LAYERS.map(l =>
  Array.from({ length: l.n }, () => ({ x: Math.random() * TILE, y: Math.random() * TILE, tw: Math.random() * Math.PI * 2 }))
);
// nébuleuses pré-rendues sur une grande tuile
const nebula = (() => {
  const c = document.createElement('canvas'); c.width = c.height = TILE;
  const g = c.getContext('2d');
  const blobs = [
    ['rgba(30,80,140,.10)', 8], ['rgba(90,40,120,.07)', 5], ['rgba(20,110,110,.06)', 5],
  ];
  for (const [col, n] of blobs) {
    for (let i = 0; i < n; i++) {
      const x = Math.random() * TILE, y = Math.random() * TILE, r = rand(120, 320);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  return c;
})();

export { STAR_LAYERS, TILE, stars, nebula };
