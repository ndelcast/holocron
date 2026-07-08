// Holocron Survivors — destinations, boss associés, sols procéduraux
import { rand } from './core.js';
import { TILE } from './background.js';

// ------------------------------ Niveaux ------------------------------
const RUN_TIME = 1200;        // 20 minutes, fin de partie
const FINAL_BOSS_TIME = 900;  // le boss du niveau surgit à 15:00
const LEVELS = {
  space:     { name: 'ESPACE PROFOND', icon: '🌌', desc: 'Conditions standard.<br>Boss : Dark Maul', stars: true, base: '#050810', dust: '#5f8299', boss: 'maul' },
  tatooine:  { name: 'TATOOINE', icon: '🏜️', desc: 'Ennemis +10 % rapides.<br>Boss : Jabba le Hutt', base: '#a87c4f', spdMult: 1.1, dust: '#d9b184', boss: 'jabba' },
  deathstar: { name: 'ÉTOILE DE LA MORT', icon: '⚫', desc: 'Vagues +15 % denses.<br>Boss : Dark Vador', base: '#14171c', spawnMult: 0.85, dust: '#5f6c7a', boss: 'vader' },
  hoth:      { name: 'HOTH', icon: '❄️', desc: 'Ennemis ralentis de 10 %.<br>Boss : Boba Fett', base: '#22303e', spdMult: 0.9, dust: '#dfe9f2', boss: 'boba' },
  endor:     { name: 'ENDOR', icon: '🌲', desc: 'Expérience +15 %.<br>Boss : l\'Empereur', base: '#182412', xpMult: 1.15, dust: '#5a7a42', boss: 'palpatine' },
};
const BOSSES = {
  maul:      { name: 'DARK MAUL', spr: 'maul', hp: 2400, spd: 100, dmg: 30, r: 21, xp: 160 },
  jabba:     { name: 'JABBA LE HUTT', spr: 'jabba', hp: 4000, spd: 30, dmg: 36, r: 30, xp: 160 },
  vader:     { name: 'DARK VADOR', spr: 'vader', hp: 3000, spd: 58, dmg: 32, r: 24, xp: 160 },
  boba:      { name: 'BOBA FETT', spr: 'boba', hp: 2200, spd: 85, dmg: 26, r: 19, xp: 160 },
  palpatine: { name: 'L\'EMPEREUR', spr: 'palpatine', hp: 2600, spd: 50, dmg: 30, r: 21, xp: 160 },
};
const groundTiles = {};
function getGroundTile(id) {
  if (!groundTiles[id]) groundTiles[id] = makeGroundTile(id);
  return groundTiles[id];
}
function makeGroundTile(id) {
  const c = document.createElement('canvas');
  c.width = c.height = TILE;
  const g = c.getContext('2d');
  // dessine chaque motif 9 fois pour que la tuile se raccorde sans couture
  const W9 = draw => {
    for (const dx of [-TILE, 0, TILE]) for (const dy of [-TILE, 0, TILE]) {
      g.save(); g.translate(dx, dy); draw(); g.restore();
    }
  };
  g.fillStyle = LEVELS[id].base;
  g.fillRect(0, 0, TILE, TILE);

  if (id === 'tatooine') {
    for (let i = 0; i < 500; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)';
      g.fillRect(rand(0, TILE), rand(0, TILE), rand(2, 5), rand(2, 5));
    }
    for (let i = 0; i < 26; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), r = rand(60, 180);
      const a0 = Math.PI * rand(0, 0.4), a1 = Math.PI * rand(0.6, 1), lw = rand(2, 4);
      W9(() => {
        g.strokeStyle = 'rgba(110,76,42,.45)'; g.lineWidth = lw;
        g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
        g.strokeStyle = 'rgba(235,195,135,.3)'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(x, y - 3, r, a0, a1); g.stroke();
      });
    }
    for (let i = 0; i < 14; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), rx = rand(6, 16), rot = rand(0, 3);
      W9(() => {
        g.fillStyle = '#6b4c2e';
        g.beginPath(); g.ellipse(x, y, rx, rx * 0.65, rot, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,235,200,.18)';
        g.beginPath(); g.ellipse(x - rx * 0.25, y - rx * 0.25, rx * 0.5, rx * 0.3, rot, 0, Math.PI * 2); g.fill();
      });
    }
  } else if (id === 'deathstar') {
    const step = 140;
    for (let x = 0; x < TILE; x += step) for (let y = 0; y < TILE; y += step) {
      g.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.04})`;
      g.fillRect(x + 3, y + 3, step - 6, step - 6);
    }
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 3;
    for (let v = 0; v <= TILE; v += step) {
      g.beginPath(); g.moveTo(v, 0); g.lineTo(v, TILE); g.stroke();
      g.beginPath(); g.moveTo(0, v); g.lineTo(TILE, v); g.stroke();
    }
    g.strokeStyle = 'rgba(120,150,180,.10)'; g.lineWidth = 1;
    for (let v = 0; v <= TILE; v += step) {
      g.beginPath(); g.moveTo(v + 2, 0); g.lineTo(v + 2, TILE); g.stroke();
      g.beginPath(); g.moveTo(0, v + 2); g.lineTo(TILE, v + 2); g.stroke();
    }
    for (let i = 0; i < 22; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), red = Math.random() < 0.4;
      W9(() => {
        if (red) {
          g.fillStyle = 'rgba(255,59,59,.14)'; g.fillRect(x - 7, y - 5, 14, 10);
          g.fillStyle = '#8a1f1f'; g.fillRect(x - 5, y - 2, 10, 4);
          g.fillStyle = '#ff3b3b'; g.fillRect(x - 3, y - 1, 6, 2);
        } else {
          g.fillStyle = 'rgba(180,220,255,.12)'; g.fillRect(x - 15, y - 3, 30, 6);
          g.fillStyle = 'rgba(200,230,255,.45)'; g.fillRect(x - 13, y - 1, 26, 2);
        }
      });
    }
    for (let i = 0; i < 6; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), r = rand(22, 40);
      W9(() => {
        g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = 'rgba(120,150,180,.08)'; g.lineWidth = 1;
        g.beginPath(); g.arc(x, y, r - 4, 0, Math.PI * 2); g.stroke();
      });
    }
  } else if (id === 'hoth') {
    for (let i = 0; i < 20; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), rx = rand(70, 190), ry = rx * rand(0.4, 0.7), rot = rand(0, 3);
      W9(() => {
        g.fillStyle = 'rgba(150,190,225,.09)';
        g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill();
      });
    }
    for (let i = 0; i < 16; i++) {
      const pts = [[rand(0, TILE), rand(0, TILE)]];
      for (let s2 = 0; s2 < 4; s2++) {
        const [px, py] = pts[pts.length - 1];
        pts.push([px + rand(-70, 70), py + rand(-70, 70)]);
      }
      W9(() => {
        g.strokeStyle = 'rgba(190,225,255,.16)'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let s2 = 1; s2 < pts.length; s2++) g.lineTo(pts[s2][0], pts[s2][1]);
        g.stroke();
      });
    }
    for (let i = 0; i < 24; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), r = rand(30, 90);
      const a0 = rand(0, Math.PI), a1 = a0 + rand(0.8, 1.6);
      W9(() => {
        g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = rand(2, 5);
        g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
      });
    }
    g.fillStyle = 'rgba(225,242,255,.25)';
    for (let i = 0; i < 140; i++) g.fillRect(rand(0, TILE), rand(0, TILE), rand(1, 2.4), rand(1, 2.4));
  } else if (id === 'endor') {
    for (let i = 0; i < 18; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), r = rand(80, 200);
      W9(() => {
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(0,0,0,.30)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
      });
    }
    for (let i = 0; i < 30; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), r = rand(18, 55), col = Math.random() < 0.5 ? 'rgba(46,72,34,.45)' : 'rgba(22,36,16,.55)';
      W9(() => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
    }
    for (let i = 0; i < 8; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), len = rand(50, 110), ang = rand(0, Math.PI);
      W9(() => {
        g.save(); g.translate(x, y); g.rotate(ang);
        g.fillStyle = '#3a2c1a'; g.fillRect(-len / 2, -7, len, 14);
        g.fillStyle = '#4d3a22'; g.fillRect(-len / 2, -7, len, 5);
        g.fillStyle = '#2a2014';
        g.beginPath(); g.arc(len / 2, 0, 7, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#54402a'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(len / 2, 0, 4, 0, Math.PI * 2); g.stroke();
        g.restore();
      });
    }
    for (let i = 0; i < 26; i++) {
      const x = rand(0, TILE), y = rand(0, TILE), s2 = rand(8, 16);
      W9(() => {
        g.strokeStyle = 'rgba(78,116,54,.5)'; g.lineWidth = 1.4;
        for (let f = -2; f <= 2; f++) {
          g.beginPath(); g.moveTo(x, y);
          g.quadraticCurveTo(x + f * s2 * 0.4, y - s2 * 0.7, x + f * s2 * 0.6, y - s2);
          g.stroke();
        }
      });
    }
  }
  return c;
}

export { RUN_TIME, FINAL_BOSS_TIME, LEVELS, BOSSES, getGroundTile };
