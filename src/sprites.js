// Holocron Survivors — sprites dessinés en canvas (héros, ennemis, boss, projectiles)

// ------------------------------ Sprites pré-rendus ------------------------------
function makeSprite(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size * 2; // rendu 2x pour la netteté
  const g = c.getContext('2d');
  g.scale(2, 2);
  g.translate(size / 2, size / 2);
  draw(g);
  return c;
}
// trait d'encre sur le chemin courant (DA comics)
function ink(g, w = 2) { g.strokeStyle = '#1b1430'; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); }
function glow(g, r, color) {
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, r);
  grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(-r, -r, r * 2, r * 2);
}

// ------------------------------ Contour d'encre (DA comics) ------------------------------
// Trace la silhouette du sprite (pixels d'alpha franc, les halos sont ignorés)
// décalée en couronne, teintée encre, sous le dessin original : tous les
// sprites gagnent le trait de contour des panneaux de l'UI.
function inkOutline(c, th = 4) {
  const w = c.width, h = c.height;
  const mask = document.createElement('canvas');
  mask.width = w; mask.height = h;
  const mg = mask.getContext('2d');
  mg.drawImage(c, 0, 0);
  const img = mg.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 110) { d[i] = 20; d[i + 1] = 16; d[i + 2] = 38; d[i + 3] = 255; }
    else d[i + 3] = 0;
  }
  mg.putImageData(img, 0, 0);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const og = out.getContext('2d');
  for (let a = 0; a < 16; a++) {
    og.drawImage(mask, Math.cos(a / 16 * Math.PI * 2) * th, Math.sin(a / 16 * Math.PI * 2) * th);
  }
  og.drawImage(c, 0, 0);
  return out;
}

const SPR = {};
// Jedi (joueur) : robe sombre, capuche
SPR.player = makeSprite(48, g => {
  glow(g, 22, 'rgba(110,231,255,.16)');
  // sabre au poing, lame levée
  g.strokeStyle = '#52ff7a'; g.lineWidth = 3.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(12, 6); g.lineTo(19, -12); g.stroke();
  g.strokeStyle = '#eaffef'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(12, 6); g.lineTo(19, -12); g.stroke();
  // petit corps en robe
  g.fillStyle = '#8a6a3f';
  g.beginPath(); g.moveTo(-8, 16); g.quadraticCurveTo(-10, 1, 0, 0); g.quadraticCurveTo(10, 1, 8, 16); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#6d5330';
  g.beginPath(); g.moveTo(2, 0.5); g.quadraticCurveTo(9, 2, 7.6, 15.4); g.lineTo(2, 15.4); g.closePath(); g.fill();
  g.strokeStyle = '#ffd166'; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(-7, 9); g.lineTo(7, 9); g.stroke();
  // grosse tête encapuchonnée
  g.fillStyle = '#4a3626';
  g.beginPath(); g.arc(0, -7, 10.5, 0, Math.PI * 2); g.fill(); ink(g);
  g.fillStyle = '#ffd9a8';
  g.beginPath(); g.arc(0, -5.5, 6.8, 0, Math.PI * 2); g.fill(); ink(g, 1.6);
  g.fillStyle = '#4a3626';
  g.beginPath(); g.arc(0, -9.5, 8.6, Math.PI * 0.92, Math.PI * 2.08); g.fill();
  // grands yeux déterminés
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(-2.6, -5, 2, 2.5, 0, 0, Math.PI * 2); g.ellipse(2.6, -5, 2, 2.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-2.2, -4.6, 1.1, 0, Math.PI * 2); g.arc(3, -4.6, 1.1, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-4.6, -8.4); g.lineTo(-1, -7.6); g.moveTo(4.6, -8.4); g.lineTo(1, -7.6); g.stroke();
});
// Ewok : fourrure brune, capuche en cuir, lance dans le dos
SPR.ewok = makeSprite(44, g => {
  glow(g, 18, 'rgba(255,180,110,.12)');
  // lance dans le dos
  g.strokeStyle = '#8c6a3f'; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(9, 13); g.lineTo(14, -13); g.stroke();
  g.fillStyle = '#e8eef4';
  g.beginPath(); g.moveTo(14.8, -16); g.lineTo(11.8, -9.6); g.lineTo(16.4, -10.6); g.closePath(); g.fill(); ink(g, 1.5);
  // petit corps poilu
  g.fillStyle = '#8a5a2f';
  g.beginPath(); g.ellipse(0, 8, 7, 7.5, 0, 0, Math.PI * 2); g.fill(); ink(g);
  // très grosse tête
  g.fillStyle = '#b0763c';
  g.beginPath(); g.arc(0, -4.5, 10, 0, Math.PI * 2); g.fill(); ink(g);
  // capuche de cuir cousue
  g.fillStyle = '#d89a54';
  g.beginPath(); g.arc(0, -6, 10.2, Math.PI * 0.8, Math.PI * 2.2); g.fill(); ink(g, 1.6);
  g.beginPath(); g.arc(-8, -11, 3.4, 0, Math.PI * 2); g.fill(); ink(g, 1.5);
  g.beginPath(); g.arc(8, -11, 3.4, 0, Math.PI * 2); g.fill(); ink(g, 1.5);
  g.strokeStyle = '#8c5a28'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-5, -13.6); g.lineTo(-3, -12.4); g.moveTo(0, -14.4); g.lineTo(0, -12.8); g.moveTo(5, -13.6); g.lineTo(3, -12.4); g.stroke();
  // masque sombre et grands yeux
  g.fillStyle = '#2e1f10';
  g.beginPath(); g.ellipse(0, -3, 6, 4.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(-2.6, -3.4, 2.1, 2.6, 0, 0, Math.PI * 2); g.ellipse(2.6, -3.4, 2.1, 2.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-2.2, -3, 1.15, 0, Math.PI * 2); g.arc(3, -3, 1.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a2a16';
  g.beginPath(); g.ellipse(0, 0.6, 1.6, 1.1, 0, 0, Math.PI * 2); g.fill();
});
// Mandalorien : armure beskar, visière en T, jetpack
SPR.mando = makeSprite(46, g => {
  glow(g, 19, 'rgba(110,231,255,.10)');
  // jetpack
  g.fillStyle = '#6e7a84';
  g.beginPath(); g.roundRect(-12.5, -4, 4.2, 10, 2); g.fill(); ink(g, 1.6);
  g.beginPath(); g.roundRect(8.3, -4, 4.2, 10, 2); g.fill(); ink(g, 1.6);
  // petit corps blindé
  g.fillStyle = '#3f5c49';
  g.beginPath(); g.moveTo(-8, 15); g.quadraticCurveTo(-10, 0, 0, -1); g.quadraticCurveTo(10, 0, 8, 15); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#9fb0bc';
  g.beginPath(); g.roundRect(-6, 1.5, 5, 4.4, 1.5); g.fill(); ink(g, 1.4);
  g.beginPath(); g.roundRect(1, 1.5, 5, 4.4, 1.5); g.fill(); ink(g, 1.4);
  // gros casque de beskar
  g.fillStyle = '#dfe7ee';
  g.beginPath(); g.moveTo(-9.5, -2); g.quadraticCurveTo(-10.5, -17, 0, -17.5); g.quadraticCurveTo(10.5, -17, 9.5, -2); g.quadraticCurveTo(0, 1, -9.5, -2); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#aebccb';
  g.beginPath(); g.moveTo(3, -17); g.quadraticCurveTo(10.5, -15, 9.5, -2); g.quadraticCurveTo(5, -0.5, 2.5, -1); g.closePath(); g.fill();
  // visière en T
  g.fillStyle = '#12151c';
  g.beginPath(); g.roundRect(-7, -13.4, 14, 3.6, 1.6); g.fill();
  g.beginPath(); g.roundRect(-2, -12, 4, 8.4, 1.6); g.fill();
  g.strokeStyle = '#6ee7ff'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-5.4, -12.2); g.lineTo(-1.6, -12.2); g.stroke();
});
// Contrebandier : chemise claire, gilet noir, blaster au poing
SPR.smuggler = makeSprite(44, g => {
  glow(g, 18, 'rgba(255,209,102,.10)');
  // blaster au poing
  g.fillStyle = '#2a2f36';
  g.beginPath(); g.roundRect(8, 0, 8.5, 2.8, 1); g.fill(); ink(g, 1.5);
  g.beginPath(); g.roundRect(8, 0, 2.8, 5.6, 1); g.fill(); ink(g, 1.5);
  // petit corps : chemise + gilet
  g.fillStyle = '#f2ecd9';
  g.beginPath(); g.moveTo(-7.5, 14); g.quadraticCurveTo(-9, 1, 0, 0); g.quadraticCurveTo(9, 1, 7.5, 14); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#1d2027';
  g.beginPath(); g.moveTo(-7.5, 14); g.quadraticCurveTo(-9, 1, -2.5, 0.4); g.lineTo(-2.5, 14); g.closePath(); g.fill(); ink(g, 1.5);
  g.beginPath(); g.moveTo(7.5, 14); g.quadraticCurveTo(9, 1, 2.5, 0.4); g.lineTo(2.5, 14); g.closePath(); g.fill(); ink(g, 1.5);
  // grosse tête au sourire en coin
  g.fillStyle = '#ffd9a8';
  g.beginPath(); g.arc(0, -7, 9, 0, Math.PI * 2); g.fill(); ink(g);
  g.fillStyle = '#5d4426';
  g.beginPath(); g.moveTo(-9.4, -7); g.quadraticCurveTo(-10, -17.5, 0, -16.5); g.quadraticCurveTo(9, -16, 9.2, -9);
  g.quadraticCurveTo(4, -13.5, -2, -12.5); g.quadraticCurveTo(-8, -11.5, -9.4, -7); g.closePath(); g.fill(); ink(g, 1.6);
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(-2.8, -6, 2, 2.5, 0, 0, Math.PI * 2); g.ellipse(2.8, -6, 2, 2.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-2.4, -5.6, 1.1, 0, Math.PI * 2); g.arc(3.2, -5.6, 1.1, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0.5, -1.8); g.quadraticCurveTo(3, -1, 4.6, -2.6); g.stroke();
});
// Stormtrooper
SPR.trooper = makeSprite(40, g => {
  // petit corps
  g.fillStyle = '#e9edf2';
  g.beginPath(); g.ellipse(0, 9, 6.5, 5.5, 0, 0, Math.PI * 2); g.fill(); ink(g);
  // très gros casque cartoon
  g.fillStyle = '#f4f7fa';
  g.beginPath(); g.moveTo(-9.5, 4); g.quadraticCurveTo(-11.5, -12, 0, -12.5); g.quadraticCurveTo(11.5, -12, 9.5, 4); g.quadraticCurveTo(0, 7.5, -9.5, 4); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#c3cfda';
  g.beginPath(); g.moveTo(4, -12); g.quadraticCurveTo(11.5, -10, 9.5, 4) ; g.quadraticCurveTo(5, 6, 3, 5.6); g.closePath(); g.fill();
  // visière renfrognée
  g.fillStyle = '#12151c';
  g.beginPath(); g.moveTo(-7, -4.5); g.quadraticCurveTo(-3.5, -7.5, 0, -4.5); g.quadraticCurveTo(3.5, -7.5, 7, -4.5); g.quadraticCurveTo(7, -1.5, 4, -1); g.quadraticCurveTo(0, -3.5, -4, -1); g.quadraticCurveTo(-7, -1.5, -7, -4.5); g.closePath(); g.fill();
  // grille de bouche
  g.fillStyle = '#8f9aa4';
  g.beginPath(); g.roundRect(-3.6, 1.5, 7.2, 3, 1); g.fill(); ink(g, 1.3);
  g.strokeStyle = '#1b1430'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-1.2, 1.8); g.lineTo(-1.2, 4.2); g.moveTo(1.2, 1.8); g.lineTo(1.2, 4.2); g.stroke();
});
// Droïde B1
SPR.droid = makeSprite(36, g => {
  // corps maigrichon penché
  g.fillStyle = '#c9a86e';
  g.beginPath(); g.roundRect(-3.2, -1, 6.4, 13, 2.5); g.fill(); ink(g, 1.7);
  // tête allongée de B1
  g.fillStyle = '#c9a86e';
  g.beginPath(); g.ellipse(0, -7, 4.6, 6.8, 0, 0, Math.PI * 2); g.fill(); ink(g, 1.7);
  g.fillStyle = '#96784a';
  g.beginPath(); g.roundRect(-5.2, -14.5, 10.4, 4.6, 2); g.fill(); ink(g, 1.7);
  // grands yeux ahuris
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(-2.1, -7.5, 1.9, 0, Math.PI * 2); g.arc(2.1, -7.5, 1.9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-2.1, -7.2, 0.95, 0, Math.PI * 2); g.arc(2.1, -7.2, 0.95, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(-1.4, -2.6); g.lineTo(1.4, -2.6); g.stroke();
});
// Droïde sonde
SPR.probe = makeSprite(44, g => {
  glow(g, 19, 'rgba(255,59,59,.14)');
  // pattes pendantes
  g.strokeStyle = '#1b1430'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 5, 4); g.quadraticCurveTo(i * 7, 9, i * 7.5, 14); g.stroke(); }
  // grosse sphère mécanique
  g.fillStyle = '#464e66';
  g.beginPath(); g.arc(0, -3, 10, 0, Math.PI * 2); g.fill(); ink(g);
  g.fillStyle = '#2b3040';
  g.beginPath(); g.arc(0, -3, 10, Math.PI * 0.05, Math.PI * 0.95); g.fill();
  g.fillStyle = '#6a7490';
  g.beginPath(); g.arc(-3.6, -6.4, 3.2, 0, Math.PI * 2); g.fill();
  // gros œil rouge menaçant + optiques
  g.fillStyle = '#ff4954';
  g.beginPath(); g.arc(0.5, -3.5, 3.4, 0, Math.PI * 2); g.fill(); ink(g, 1.6);
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(-0.5, -4.6, 1.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(6.4, -1, 1.4, 0, Math.PI * 2); g.arc(-6.6, 0, 1.2, 0, Math.PI * 2); g.fill();
  // antenne
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(3, -12.4); g.lineTo(5.5, -17); g.stroke();
});
// Droïdeka
SPR.droideka = makeSprite(52, g => {
  glow(g, 23, 'rgba(255,180,80,.12)');
  // pattes arquées
  g.strokeStyle = '#1b1430'; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-10, 9); g.quadraticCurveTo(-14, 13, -6, 17); g.stroke();
  g.beginPath(); g.moveTo(10, 9); g.quadraticCurveTo(14, 13, 6, 17); g.stroke();
  // carapace bronze
  g.fillStyle = '#c08c3a';
  g.beginPath(); g.arc(0, 1, 13, Math.PI, 0); g.quadraticCurveTo(13, 9, 0, 10.5); g.quadraticCurveTo(-13, 9, -13, 1); g.closePath(); g.fill(); ink(g);
  g.fillStyle = '#8a6224';
  g.beginPath(); g.arc(0, 1, 13, -Math.PI * 0.35, 0); g.quadraticCurveTo(13, 9, 0, 10.5); g.lineTo(3, -11.4); g.closePath(); g.fill();
  g.fillStyle = '#e0b060';
  g.beginPath(); g.arc(-4, -5, 3.4, 0, Math.PI * 2); g.fill();
  // fente oculaire rouge + double canon
  g.fillStyle = '#1b1430';
  g.beginPath(); g.roundRect(-7, -3.6, 14, 3, 1.4); g.fill();
  g.fillStyle = '#ff4954';
  g.beginPath(); g.roundRect(-4.6, -3, 9.2, 1.8, 0.9); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.roundRect(-9.4, 3, 5.4, 2.4, 1); g.fill();
  g.beginPath(); g.roundRect(4, 3, 5.4, 2.4, 1); g.fill();
});
// Seigneur Sith (boss)
SPR.sith = makeSprite(76, g => {
  glow(g, 36, 'rgba(255,59,59,.22)');
  // sabre rouge au côté
  g.strokeStyle = '#ff4954'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(19, 8); g.lineTo(27, -16); g.stroke();
  g.strokeStyle = '#ffd7d7'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(19, 8); g.lineTo(27, -16); g.stroke();
  // grande cape déchiquetée
  g.fillStyle = '#17131f';
  g.beginPath(); g.moveTo(-19, 24); g.quadraticCurveTo(-24, -12, 0, -24); g.quadraticCurveTo(24, -12, 19, 24);
  g.lineTo(13, 20); g.lineTo(8, 27); g.lineTo(2, 21); g.lineTo(-4, 28); g.lineTo(-9, 21); g.lineTo(-14, 27); g.closePath(); g.fill(); ink(g, 2.4);
  g.fillStyle = '#241c33';
  g.beginPath(); g.moveTo(-16, 18); g.quadraticCurveTo(-19, -9, 0, -20); g.lineTo(0, 22); g.quadraticCurveTo(-10, 22, -16, 18); g.closePath(); g.fill();
  // capuche béante
  g.fillStyle = '#0c0a14';
  g.beginPath(); g.arc(0, -8, 10.5, 0, Math.PI * 2); g.fill(); ink(g, 2.2);
  // yeux rouges incandescents
  g.fillStyle = 'rgba(255,73,84,.35)';
  g.beginPath(); g.arc(-3.6, -8, 3.2, 0, Math.PI * 2); g.arc(3.6, -8, 3.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ff4954';
  g.beginPath(); g.moveTo(-6, -9.4); g.lineTo(-1.4, -8); g.lineTo(-6, -6.6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(6, -9.4); g.lineTo(1.4, -8); g.lineTo(6, -6.6); g.closePath(); g.fill();
});
// ---- Boss de fin de niveau ----
// Dark Maul : peau rouge tatouée, couronne de cornes
SPR.maul = makeSprite(58, g => {
  glow(g, 26, 'rgba(255,59,59,.20)');
  // corps sombre
  g.fillStyle = '#1d1a26';
  g.beginPath(); g.moveTo(-13, 20); g.quadraticCurveTo(-16, -3, 0, -6); g.quadraticCurveTo(16, -3, 13, 20); g.closePath(); g.fill(); ink(g, 2.2);
  // grosse tête rouge tatouée
  g.fillStyle = '#e03325';
  g.beginPath(); g.arc(0, -12, 10, 0, Math.PI * 2); g.fill(); ink(g, 2.2);
  g.fillStyle = '#a81f16';
  g.beginPath(); g.arc(0, -12, 10, -Math.PI * 0.35, Math.PI * 0.35); g.fill();
  // couronne de cornes
  g.fillStyle = '#efe0c8';
  for (const [hx, hy, a] of [[-8, -20, -0.5], [-4, -23, -0.2], [0, -24, 0], [4, -23, 0.2], [8, -20, 0.5]]) {
    g.save(); g.translate(hx, hy); g.rotate(a);
    g.beginPath(); g.moveTo(-1.8, 3.5); g.lineTo(0, -2.5); g.lineTo(1.8, 3.5); g.closePath(); g.fill(); ink(g, 1.4);
    g.restore();
  }
  // tatouages noirs
  g.fillStyle = '#1b1430';
  g.beginPath(); g.roundRect(-1.6, -22, 3.2, 8, 1.4); g.fill();
  g.beginPath(); g.roundRect(-9.6, -14.2, 5.4, 2.6, 1.2); g.fill();
  g.beginPath(); g.roundRect(4.2, -14.2, 5.4, 2.6, 1.2); g.fill();
  g.beginPath(); g.ellipse(0, -5.6, 4.2, 2.6, 0, 0, Math.PI); g.fill();
  // yeux jaunes furieux
  g.fillStyle = '#ffd166';
  g.beginPath(); g.ellipse(-3.6, -12.6, 2.2, 1.7, 0.2, 0, Math.PI * 2); g.ellipse(3.6, -12.6, 2.2, 1.7, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-3.2, -12.4, 0.9, 0, Math.PI * 2); g.arc(4, -12.4, 0.9, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-6.4, -15.6); g.lineTo(-1.6, -14.2); g.moveTo(6.4, -15.6); g.lineTo(1.6, -14.2); g.stroke();
});
// Jabba le Hutt : masse reptilienne
SPR.jabba = makeSprite(76, g => {
  glow(g, 34, 'rgba(180,200,90,.16)');
  // masse de limace repue
  g.fillStyle = '#9aa04e';
  g.beginPath(); g.moveTo(-26, 18); g.quadraticCurveTo(-24, -2, -14, -10);
  g.quadraticCurveTo(-10, -24, 0, -24); g.quadraticCurveTo(10, -24, 14, -10);
  g.quadraticCurveTo(24, -2, 26, 18); g.quadraticCurveTo(0, 28, -26, 18); g.closePath(); g.fill(); ink(g, 2.6);
  g.fillStyle = '#6f7436';
  g.beginPath(); g.moveTo(10, -22); g.quadraticCurveTo(24, -4, 25, 17); g.quadraticCurveTo(14, 23, 6, 24); g.quadraticCurveTo(16, 0, 10, -22); g.closePath(); g.fill();
  // ventre clair
  g.fillStyle = '#d8d29a';
  g.beginPath(); g.ellipse(-2, 12, 13, 10, 0, 0, Math.PI * 2); g.fill(); ink(g, 1.8);
  // petits bras
  g.fillStyle = '#9aa04e';
  g.beginPath(); g.ellipse(-21, 6, 6, 3.6, -0.5, 0, Math.PI * 2); g.fill(); ink(g, 1.8);
  g.beginPath(); g.ellipse(21, 6, 6, 3.6, 0.5, 0, Math.PI * 2); g.fill(); ink(g, 1.8);
  // gros yeux mi-clos
  g.fillStyle = '#ffd166';
  g.beginPath(); g.ellipse(-6.5, -15, 4, 4.6, -0.15, 0, Math.PI * 2); g.ellipse(6.5, -15, 4, 4.6, 0.15, 0, Math.PI * 2); g.fill(); ink(g, 1.8);
  g.fillStyle = '#1b1430';
  g.beginPath(); g.roundRect(-7.6, -17.5, 2.4, 6, 1.2); g.fill();
  g.beginPath(); g.roundRect(5.2, -17.5, 2.4, 6, 1.2); g.fill();
  g.fillStyle = '#9aa04e';
  g.beginPath(); g.ellipse(-6.5, -18.6, 4.4, 2.2, 0, 0, Math.PI); g.fill();
  g.beginPath(); g.ellipse(6.5, -18.6, 4.4, 2.2, 0, 0, Math.PI); g.fill();
  // large bouche satisfaite
  g.strokeStyle = '#1b1430'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-9, -7); g.quadraticCurveTo(0, -2.5, 9, -7); g.stroke();
});
// Dark Vador : casque évasé, plastron
SPR.vader = makeSprite(66, g => {
  glow(g, 30, 'rgba(255,59,59,.22)');
  // cape ample
  g.fillStyle = '#14121c';
  g.beginPath(); g.moveTo(-18, 24); g.quadraticCurveTo(-23, -8, 0, -12); g.quadraticCurveTo(23, -8, 18, 24); g.closePath(); g.fill(); ink(g, 2.4);
  g.fillStyle = '#221e30';
  g.beginPath(); g.moveTo(-15, 20); g.quadraticCurveTo(-18, -6, 0, -10); g.lineTo(0, 22); g.quadraticCurveTo(-9, 22, -15, 20); g.closePath(); g.fill();
  // plastron à boutons
  g.fillStyle = '#2b3040';
  g.beginPath(); g.roundRect(-7, 2, 14, 9, 2); g.fill(); ink(g, 1.8);
  g.fillStyle = '#ff4954'; g.beginPath(); g.roundRect(-4.6, 4, 3, 2.2, 0.8); g.fill();
  g.fillStyle = '#6ee7ff'; g.beginPath(); g.roundRect(1.6, 4, 3, 2.2, 0.8); g.fill();
  g.fillStyle = '#9fb0bc'; g.beginPath(); g.roundRect(-4.6, 7.6, 9.2, 1.6, 0.8); g.fill();
  // casque iconique surdimensionné
  g.fillStyle = '#1d2027';
  g.beginPath();
  g.moveTo(-14, -4); g.quadraticCurveTo(-12, -8, -9.5, -9.5);
  g.quadraticCurveTo(-11, -25, 0, -25.5); g.quadraticCurveTo(11, -25, 9.5, -9.5);
  g.quadraticCurveTo(12, -8, 14, -4); g.quadraticCurveTo(0, 0.5, -14, -4);
  g.closePath(); g.fill(); ink(g, 2.4);
  // reflet cel du dôme
  g.strokeStyle = '#4a5468'; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.arc(0, -13, 8.6, Math.PI * 1.2, Math.PI * 1.7); g.stroke();
  // lentilles et grille
  g.fillStyle = '#0a0810';
  g.beginPath(); g.ellipse(-4.4, -13, 3.6, 3, -0.3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(4.4, -13, 3.6, 3, 0.3, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a6478'; g.lineWidth = 1.4;
  g.beginPath(); g.ellipse(-4.4, -13, 3.6, 3, -0.3, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(4.4, -13, 3.6, 3, 0.3, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#2b3040';
  g.beginPath(); g.moveTo(-4.5, -8); g.lineTo(4.5, -8); g.lineTo(0, -2.5); g.closePath(); g.fill(); ink(g, 1.4);
  g.strokeStyle = '#5a6478'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-2.4, -6.8); g.lineTo(2.4, -6.8); g.moveTo(-1.4, -5); g.lineTo(1.4, -5); g.stroke();
});
// Boba Fett : armure verte patinée, jetpack
SPR.boba = makeSprite(58, g => {
  glow(g, 24, 'rgba(150,220,140,.12)');
  // jetpack
  g.fillStyle = '#7d6a3a';
  g.beginPath(); g.roundRect(-14, -7, 4.6, 14, 2); g.fill(); ink(g, 1.8);
  g.beginPath(); g.roundRect(9.4, -7, 4.6, 14, 2); g.fill(); ink(g, 1.8);
  // corps blindé compact
  g.fillStyle = '#55684a';
  g.beginPath(); g.moveTo(-9, 16); g.quadraticCurveTo(-11, -3, 0, -4); g.quadraticCurveTo(11, -3, 9, 16); g.closePath(); g.fill(); ink(g, 2.2);
  g.fillStyle = '#a04a2e';
  g.beginPath(); g.roundRect(-7.5, 6.5, 15, 3, 1.4); g.fill(); ink(g, 1.4);
  // gros casque vert
  g.fillStyle = '#6d8a5c';
  g.beginPath(); g.moveTo(-9, -3); g.quadraticCurveTo(-10.5, -19, 0, -19.5); g.quadraticCurveTo(10.5, -19, 9, -3); g.quadraticCurveTo(0, 0, -9, -3); g.closePath(); g.fill(); ink(g, 2.2);
  g.fillStyle = '#54704a';
  g.beginPath(); g.moveTo(3, -19.2); g.quadraticCurveTo(10.5, -17, 9, -3); g.quadraticCurveTo(5, -1.6, 3, -1.8); g.closePath(); g.fill();
  // mandibules latérales et visière en T
  g.fillStyle = '#a04a2e';
  g.beginPath(); g.roundRect(-9.4, -13.5, 2.6, 8, 1.2); g.fill(); ink(g, 1.3);
  g.beginPath(); g.roundRect(6.8, -13.5, 2.6, 8, 1.2); g.fill(); ink(g, 1.3);
  g.fillStyle = '#12151c';
  g.beginPath(); g.roundRect(-6, -16, 12, 3.2, 1.4); g.fill();
  g.beginPath(); g.roundRect(-1.8, -14.5, 3.6, 7.5, 1.4); g.fill();
  g.strokeStyle = '#6ee7ff'; g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(-4.4, -14.9); g.lineTo(-1.2, -14.9); g.stroke();
  // antenne articulée
  g.strokeStyle = '#1b1430'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-8.5, -18); g.lineTo(-11, -25); g.lineTo(-8, -25.5); g.stroke();
});
// L'Empereur : capuche profonde, visage blafard
SPR.palpatine = makeSprite(62, g => {
  glow(g, 28, 'rgba(150,120,255,.22)');
  // robe et capuche profonde
  g.fillStyle = '#201a2e';
  g.beginPath(); g.moveTo(-16, 22); g.quadraticCurveTo(-20, -8, 0, -12); g.quadraticCurveTo(20, -8, 16, 22); g.closePath(); g.fill(); ink(g, 2.4);
  g.beginPath(); g.moveTo(-10.5, -5); g.quadraticCurveTo(-13, -24, 0, -25); g.quadraticCurveTo(13, -24, 10.5, -5); g.quadraticCurveTo(0, -1, -10.5, -5); g.closePath(); g.fill(); ink(g, 2.2);
  // visage blafard mangé d'ombre
  g.fillStyle = '#0e0a18';
  g.beginPath(); g.ellipse(0, -12, 7.6, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ded2c4';
  g.beginPath(); g.ellipse(0, -10.5, 5.4, 6.6, 0, 0, Math.PI * 2); g.fill(); ink(g, 1.4);
  g.fillStyle = '#0e0a18';
  g.beginPath(); g.ellipse(0, -14.4, 5.6, 3.8, 0, 0, Math.PI); g.fill();
  // yeux jaunes luisants et rictus
  g.fillStyle = '#ffd166';
  g.beginPath(); g.arc(-2.4, -12.4, 1.5, 0, Math.PI * 2); g.arc(2.4, -12.4, 1.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1430';
  g.beginPath(); g.arc(-2.4, -12.4, 0.6, 0, Math.PI * 2); g.arc(2.4, -12.4, 0.6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8a7c6e'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-3, -7.6); g.quadraticCurveTo(0, -6.4, 3, -7.6); g.stroke();
  g.strokeStyle = '#1b1430'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-2.6, -5.6); g.quadraticCurveTo(0, -4.8, 2.6, -5.6); g.stroke();
  // éclairs bleus aux mains
  g.strokeStyle = '#9fdcff'; g.lineWidth = 2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-12, 7); g.lineTo(-15, 3); g.lineTo(-17.5, 6); g.lineTo(-20, 2); g.stroke();
  g.beginPath(); g.moveTo(12, 7); g.lineTo(15, 3); g.lineTo(17.5, 6); g.lineTo(20, 2); g.stroke();
});
// ---- Bestiaire par destination ----
// Jawa : robe brune, yeux jaunes luisants (Tatooine, basique)
SPR.jawa = makeSprite(36, g => {
  glow(g, 15, 'rgba(255,200,80,.12)');
  g.fillStyle = '#5a4228';
  g.beginPath(); g.moveTo(-8, 12); g.quadraticCurveTo(-10, -8, 0, -12); g.quadraticCurveTo(10, -8, 8, 12); g.closePath(); g.fill();
  g.fillStyle = '#6d5232';
  g.beginPath(); g.arc(0, -7, 6.5, Math.PI * 0.9, Math.PI * 2.1); g.fill();
  g.fillStyle = '#0a0805';
  g.beginPath(); g.arc(0, -5.5, 4.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffd84a';
  g.beginPath(); g.arc(-2, -6, 1.4, 0, Math.PI * 2); g.arc(2, -6, 1.4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3a2c18'; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 6); g.stroke();
});
// Tusken : bandelettes sable, yeux cylindriques, bâton gaffi (Tatooine, rapide)
SPR.tusken = makeSprite(40, g => {
  g.fillStyle = '#9c8a62';
  g.beginPath(); g.moveTo(-9, 12); g.quadraticCurveTo(-11, -8, 0, -12); g.quadraticCurveTo(11, -8, 9, 12); g.closePath(); g.fill();
  g.fillStyle = '#b5a276';
  g.beginPath(); g.arc(0, -6, 6.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8a7852'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-5, -9); g.lineTo(5, -7); g.moveTo(-5, -5); g.lineTo(5, -3); g.stroke();
  g.fillStyle = '#2a2318';
  g.beginPath(); g.arc(-2.6, -6.5, 1.9, 0, Math.PI * 2); g.arc(2.6, -6.5, 1.9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6a5c3a';
  g.beginPath(); g.arc(-2.6, -6.5, 0.8, 0, Math.PI * 2); g.arc(2.6, -6.5, 0.8, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a4a2c'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(9, 10); g.lineTo(13, -10); g.stroke();
  g.fillStyle = '#3a3020';
  g.beginPath(); g.moveTo(13, -13); g.lineTo(10.6, -8.6); g.lineTo(15, -9.4); g.closePath(); g.fill();
});
// Rodien : peau verte, museau, grands yeux (Tatooine, moyen)
SPR.rodian = makeSprite(40, g => {
  g.fillStyle = '#3a4a5c';
  g.beginPath(); g.moveTo(-9, 12); g.quadraticCurveTo(-11, -6, 0, -9); g.quadraticCurveTo(11, -6, 9, 12); g.closePath(); g.fill();
  g.fillStyle = '#4a8a4a';
  g.beginPath(); g.arc(0, -8, 6.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3d7440';
  g.beginPath(); g.ellipse(0, -4.5, 2.4, 3.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#10141c';
  g.beginPath(); g.ellipse(-3.4, -9.5, 2.6, 3, -0.3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(3.4, -9.5, 2.6, 3, 0.3, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#4a8a4a'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-2, -13.5); g.lineTo(-3.4, -16.5); g.moveTo(2, -13.5); g.lineTo(3.4, -16.5); g.stroke();
  g.fillStyle = '#4a8a4a';
  g.beginPath(); g.arc(-3.4, -16.5, 1.2, 0, Math.PI * 2); g.arc(3.4, -16.5, 1.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#22262c';
  g.fillRect(6, -1, 6.5, 2.2);
});
// Garde gamorréen : porcin vert en armure, hache (Tatooine, tank)
SPR.gamorrean = makeSprite(52, g => {
  glow(g, 22, 'rgba(140,190,90,.10)');
  g.fillStyle = '#5d7a3a';
  g.beginPath(); g.moveTo(-13, 14); g.quadraticCurveTo(-15, -6, 0, -8); g.quadraticCurveTo(15, -6, 13, 14); g.quadraticCurveTo(0, 17, -13, 14); g.closePath(); g.fill();
  g.fillStyle = '#4a3a26';
  g.fillRect(-8, 2, 16, 8);
  g.fillStyle = '#6d5a3c'; g.fillRect(-8, 2, 16, 2.6);
  g.fillStyle = '#6d8a48';
  g.beginPath(); g.ellipse(0, -10, 8, 6.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#597539';
  g.beginPath(); g.ellipse(0, -7.5, 3.6, 2.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#31461d';
  g.beginPath(); g.arc(-1.3, -7.5, 0.7, 0, Math.PI * 2); g.arc(1.3, -7.5, 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8e0c8';
  g.beginPath(); g.moveTo(-4.5, -6); g.lineTo(-6, -3.4); g.lineTo(-3, -4.6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(4.5, -6); g.lineTo(6, -3.4); g.lineTo(3, -4.6); g.closePath(); g.fill();
  g.fillStyle = '#1a1408';
  g.beginPath(); g.arc(-3.4, -11.5, 1.1, 0, Math.PI * 2); g.arc(3.4, -11.5, 1.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3f3120';
  g.beginPath(); g.moveTo(-7, -14); g.lineTo(-9, -18); g.lineTo(-5.4, -15.6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(7, -14); g.lineTo(9, -18); g.lineTo(5.4, -15.6); g.closePath(); g.fill();
  g.strokeStyle = '#4a3a26'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(11, 12); g.lineTo(16, -8); g.stroke();
  g.fillStyle = '#9aa4ac';
  g.beginPath(); g.moveTo(16, -12); g.quadraticCurveTo(21, -8, 16, -4); g.lineTo(14.6, -8); g.closePath(); g.fill();
});
// Officier impérial : uniforme gris-vert, casquette (Étoile de la Mort, rapide)
SPR.officer = makeSprite(40, g => {
  g.fillStyle = '#4a5248';
  g.beginPath(); g.moveTo(-8, 12); g.quadraticCurveTo(-10, -6, 0, -8); g.quadraticCurveTo(10, -6, 8, 12); g.closePath(); g.fill();
  g.fillStyle = '#1a1c1a'; g.fillRect(-8, 4, 16, 2.6);
  g.fillStyle = '#8a8f8a'; g.fillRect(-1.4, 4, 2.8, 2.6);
  g.fillStyle = '#e3c9a3';
  g.beginPath(); g.arc(0, -8, 4.8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3d453c';
  g.beginPath(); g.arc(0, -10.5, 5.4, Math.PI, 0); g.fill();
  g.fillRect(-5.4, -11, 10.8, 2.2);
  g.fillStyle = '#c0392b'; g.fillRect(-4, -3, 2.2, 1.4);
  g.fillStyle = '#2980b9'; g.fillRect(-1.4, -3, 2.2, 1.4);
});
// Garde royal : robe écarlate intégrale, pique (Étoile de la Mort, tank)
SPR.royalguard = makeSprite(52, g => {
  glow(g, 22, 'rgba(255,60,50,.14)');
  g.fillStyle = '#8f1d1d';
  g.beginPath(); g.moveTo(-11, 16); g.quadraticCurveTo(-14, -8, 0, -12); g.quadraticCurveTo(14, -8, 11, 16); g.quadraticCurveTo(0, 19, -11, 16); g.closePath(); g.fill();
  g.fillStyle = '#a92626';
  g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(-7, -19, 0, -19.5); g.quadraticCurveTo(7, -19, 6, -8); g.quadraticCurveTo(0, -5.5, -6, -8); g.closePath(); g.fill();
  g.fillStyle = '#12080a';
  g.fillRect(-4, -14.5, 8, 2);
  g.strokeStyle = '#5c5c66'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(10, 14); g.lineTo(14, -14); g.stroke();
  g.fillStyle = '#8a8f9a';
  g.fillRect(12.6, -18, 2.6, 5);
});
// Snowtrooper : casque à visière fendue, jupe thermique (Hoth, basique)
SPR.snowtrooper = makeSprite(40, g => {
  g.fillStyle = '#dfe4e8';
  g.beginPath(); g.moveTo(-9, 12); g.quadraticCurveTo(-11, -8, 0, -11); g.quadraticCurveTo(11, -8, 9, 12); g.closePath(); g.fill();
  g.fillStyle = '#c9d1d8';
  g.beginPath(); g.moveTo(-8, 6); g.lineTo(8, 6); g.lineTo(9.5, 13); g.lineTo(-9.5, 13); g.closePath(); g.fill();
  g.fillStyle = '#eef2f5';
  g.beginPath(); g.arc(0, -6.5, 6.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1a2027';
  g.fillRect(-5, -8, 10, 2.6);
  g.fillStyle = '#aab4bc';
  g.fillRect(-8.6, -2, 3, 7);
});
// Wampa : bête des neiges, cornes et gueule rouge (Hoth, tank)
SPR.wampa = makeSprite(54, g => {
  glow(g, 23, 'rgba(200,230,255,.12)');
  g.fillStyle = '#e8edf2';
  g.beginPath(); g.moveTo(-14, 14); g.quadraticCurveTo(-17, -8, 0, -11); g.quadraticCurveTo(17, -8, 14, 14); g.quadraticCurveTo(0, 18, -14, 14); g.closePath(); g.fill();
  g.strokeStyle = '#cbd6de'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-10, 2); g.lineTo(-12, 6); g.moveTo(-4, 4); g.lineTo(-5, 8); g.moveTo(6, 3); g.lineTo(8, 7); g.stroke();
  g.fillStyle = '#f2f6f9';
  g.beginPath(); g.ellipse(0, -8, 8.5, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8a7a5c';
  g.beginPath(); g.moveTo(-6.5, -12); g.lineTo(-11, -17); g.lineTo(-5.5, -14.5); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(6.5, -12); g.lineTo(11, -17); g.lineTo(5.5, -14.5); g.closePath(); g.fill();
  g.fillStyle = '#2c3a46';
  g.beginPath(); g.arc(-3, -10, 1.3, 0, Math.PI * 2); g.arc(3, -10, 1.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8f2a2a';
  g.beginPath(); g.ellipse(0, -4.5, 3.6, 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(-2.6, -5.5); g.lineTo(-1.6, -3.6); g.lineTo(-0.6, -5.5); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0.6, -5.5); g.lineTo(1.6, -3.6); g.lineTo(2.6, -5.5); g.closePath(); g.fill();
});
// Scout trooper : visière anguleuse, combinaison sombre (Endor, basique)
SPR.scout = makeSprite(40, g => {
  g.fillStyle = '#3a4038';
  g.beginPath(); g.moveTo(-8, 12); g.quadraticCurveTo(-10, -6, 0, -8); g.quadraticCurveTo(10, -6, 8, 12); g.closePath(); g.fill();
  g.fillStyle = '#e6eae6';
  g.fillRect(-6, -3, 12, 6);
  g.fillStyle = '#eef1ec';
  g.beginPath(); g.arc(0, -8, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#14181c';
  g.beginPath(); g.moveTo(-5.4, -9.5); g.lineTo(5.4, -9.5); g.lineTo(3, -5.8); g.lineTo(-3, -5.8); g.closePath(); g.fill();
  g.fillStyle = '#c9cfc7';
  g.fillRect(-2.4, -6.2, 4.8, 3);
});
// AT-ST : marcheur bipède impérial (Endor, tank)
SPR.atst = makeSprite(56, g => {
  glow(g, 24, 'rgba(160,180,200,.10)');
  g.strokeStyle = '#5c646c'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-7, 2); g.lineTo(-10, 9); g.lineTo(-8, 16); g.stroke();
  g.beginPath(); g.moveTo(7, 2); g.lineTo(10, 9); g.lineTo(8, 16); g.stroke();
  g.fillStyle = '#4c545c';
  g.fillRect(-11.5, 15, 7, 2.6); g.fillRect(4.5, 15, 7, 2.6);
  g.fillStyle = '#6d7680';
  g.beginPath(); g.moveTo(-11, -14); g.lineTo(11, -14); g.lineTo(13, -4); g.lineTo(9, 2); g.lineTo(-9, 2); g.lineTo(-13, -4); g.closePath(); g.fill();
  g.fillStyle = '#59626b';
  g.fillRect(-14.5, -10, 4, 7); g.fillRect(10.5, -10, 4, 7);
  g.fillStyle = '#14181e';
  g.fillRect(-7, -11, 5.5, 3.2); g.fillRect(1.5, -11, 5.5, 3.2);
  g.fillStyle = '#2c3238';
  g.fillRect(-2.4, 2, 1.8, 5); g.fillRect(0.6, 2, 1.8, 5);
});
// ---- Caisses de ravitaillement ----
function makeBonusSprite(rgb, glyph) {
  return makeSprite(36, g => {
    glow(g, 16, `rgba(${rgb},.35)`);
    // conteneur octogonal
    g.beginPath();
    const R = 10;
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4;
      const px = Math.cos(a) * R, py = Math.sin(a) * R;
      i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath();
    g.fillStyle = '#141e2a';
    g.fill();
    g.strokeStyle = `rgba(${rgb},.9)`;
    g.lineWidth = 1.6;
    g.stroke();
    g.strokeStyle = `rgba(${rgb},.35)`;
    g.lineWidth = 1;
    g.strokeRect(-6.5, -6.5, 13, 13);
    glyph(g, `rgb(${rgb})`);
  });
}
SPR.b_bacta = makeBonusSprite('82,255,122', (g, c) => {
  g.fillStyle = c;
  g.fillRect(-1.7, -5.5, 3.4, 11);
  g.fillRect(-5.5, -1.7, 11, 3.4);
});
SPR.b_holo = makeBonusSprite('110,231,255', (g, c) => {
  g.fillStyle = c;
  g.beginPath(); g.moveTo(0, -6); g.lineTo(5, 0); g.lineTo(0, 6); g.lineTo(-5, 0); g.closePath(); g.fill();
  g.fillStyle = '#e5fbff';
  g.beginPath(); g.moveTo(0, -6); g.lineTo(5, 0); g.lineTo(0, 0); g.closePath(); g.fill();
});
SPR.b_ion = makeBonusSprite('165,130,255', (g, c) => {
  g.strokeStyle = c; g.lineWidth = 1.6;
  g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.stroke();
  g.fillStyle = c;
  g.beginPath(); g.arc(0, 0, 2.2, 0, Math.PI * 2); g.fill();
});
SPR.b_magnet = makeBonusSprite('255,209,102', (g, c) => {
  g.strokeStyle = c; g.lineWidth = 2.6;
  g.beginPath(); g.arc(0, -1, 4.2, Math.PI, 0, false); g.stroke();
  g.fillStyle = c;
  g.fillRect(-5.4, -1.5, 2.6, 5); g.fillRect(2.8, -1.5, 2.6, 5);
});
// Éclats de particule laser (bolt)
SPR.boltRed = makeSprite(24, g => { glow(g, 11, 'rgba(255,80,60,.5)'); g.fillStyle = '#ffb3a0'; g.fillRect(-1.6, -5, 3.2, 10); });
SPR.boltCyan = makeSprite(24, g => { glow(g, 11, 'rgba(110,231,255,.5)'); g.fillStyle = '#d8f7ff'; g.fillRect(-1.6, -5, 3.2, 10); });
// Lance ewok (perforante)
SPR.spear = makeSprite(28, g => {
  glow(g, 9, 'rgba(255,200,140,.25)');
  g.strokeStyle = '#9c7443'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 10); g.lineTo(0, -5); g.stroke();
  g.fillStyle = '#d8dde3';
  g.beginPath(); g.moveTo(0, -11.5); g.lineTo(-2.6, -4.5); g.lineTo(2.6, -4.5); g.closePath(); g.fill();
});
// Roquette mandalorienne
SPR.rocket = makeSprite(26, g => {
  glow(g, 11, 'rgba(255,150,80,.4)');
  g.fillStyle = '#aeb6bf';
  g.fillRect(-2.2, -7, 4.4, 10);
  g.fillStyle = '#c0392b';
  g.beginPath(); g.moveTo(0, -10.5); g.lineTo(-2.2, -7); g.lineTo(2.2, -7); g.closePath(); g.fill();
  g.fillStyle = '#ffb166';
  g.beginPath(); g.moveTo(-2, 3); g.lineTo(0, 9.5); g.lineTo(2, 3); g.closePath(); g.fill();
});
// Cristal d'XP (holocron)
SPR.gem = makeSprite(22, g => {
  glow(g, 10, 'rgba(110,231,255,.4)');
  g.fillStyle = '#9feaff';
  g.beginPath(); g.moveTo(0, -5.8); g.lineTo(4.8, 0); g.lineTo(0, 5.8); g.lineTo(-4.8, 0); g.closePath(); g.fill(); ink(g, 1.5);
  g.fillStyle = '#e5fbff';
  g.beginPath(); g.moveTo(0, -5.8); g.lineTo(4.8, 0); g.lineTo(0, 0); g.closePath(); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(-1.4, -1.6, 0.9, 0, Math.PI * 2); g.fill();
});
SPR.gemBig = makeSprite(30, g => {
  glow(g, 14, 'rgba(255,209,102,.5)');
  g.fillStyle = '#ffd166';
  g.beginPath(); g.moveTo(0, -8.4); g.lineTo(7, 0); g.lineTo(0, 8.4); g.lineTo(-7, 0); g.closePath(); g.fill(); ink(g, 1.7);
  g.fillStyle = '#fff2cc';
  g.beginPath(); g.moveTo(0, -8.4); g.lineTo(7, 0); g.lineTo(0, 0); g.closePath(); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(-2, -2.4, 1.2, 0, Math.PI * 2); g.fill();
});
SPR.drone = makeSprite(30, g => {
  glow(g, 13, 'rgba(110,231,255,.3)');
  // petites ailettes
  g.fillStyle = '#5a6d7d';
  g.beginPath(); g.roundRect(-9.5, -1.4, 4, 2.8, 1.2); g.fill(); ink(g, 1.3);
  g.beginPath(); g.roundRect(5.5, -1.4, 4, 2.8, 1.2); g.fill(); ink(g, 1.3);
  // coque ronde
  g.fillStyle = '#e8eef4';
  g.beginPath(); g.arc(0, 0, 6.2, 0, Math.PI * 2); g.fill(); ink(g, 1.6);
  g.fillStyle = '#aebccb';
  g.beginPath(); g.arc(0, 0, 6.2, Math.PI * 0.15, Math.PI * 0.85); g.fill();
  // gros œil optique
  g.fillStyle = '#6ee7ff';
  g.beginPath(); g.arc(0.5, -1, 2.6, 0, Math.PI * 2); g.fill(); ink(g, 1.3);
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(-0.3, -1.8, 0.9, 0, Math.PI * 2); g.fill();
});

// ------------------------------ Armement lourd ------------------------------
// Tourelle laser : socle sombre, double canon cyan
SPR.v_turret = makeSprite(72, g => {
  glow(g, 32, 'rgba(110,231,255,.18)');
  g.fillStyle = '#0d1826'; g.beginPath(); g.ellipse(0, 12, 26, 10, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2a4a66'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#16283c'; g.beginPath(); g.arc(0, 0, 15, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6ee7ff'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#20364e';
  g.fillRect(-8, -26, 5, 22); g.fillRect(3, -26, 5, 22);
  g.fillStyle = '#6ee7ff'; g.fillRect(-8, -28, 5, 4); g.fillRect(3, -28, 5, 4);
  g.fillStyle = '#9feaff'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill();
});
// Turbolaser : plus massif, liserés rouges
SPR.v_turbo = makeSprite(80, g => {
  glow(g, 36, 'rgba(255,59,59,.18)');
  g.fillStyle = '#181114'; g.beginPath(); g.ellipse(0, 14, 30, 11, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a2430'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = '#241a20'; g.beginPath(); g.arc(0, 0, 18, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ff3b3b'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = '#33222b'; g.fillRect(-6, -32, 12, 28);
  g.fillStyle = '#ff3b3b'; g.fillRect(-6, -34, 12, 5);
  g.fillStyle = '#ff8f6b'; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill();
});
// Landspeeder : carlingue effilée sable, pare-brise, turbines arrière
SPR.v_speeder = makeSprite(84, g => {
  glow(g, 34, 'rgba(217,177,132,.15)');
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 16, 30, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c9a06a';
  g.beginPath(); g.moveTo(-30, 4); g.quadraticCurveTo(-32, -6, -18, -8);
  g.lineTo(20, -8); g.quadraticCurveTo(34, -6, 32, 2); g.quadraticCurveTo(30, 8, 18, 9);
  g.lineTo(-22, 9); g.quadraticCurveTo(-30, 8, -30, 4); g.closePath(); g.fill();
  g.strokeStyle = '#8a6a42'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#9fdcff'; g.beginPath(); g.moveTo(-2, -8); g.quadraticCurveTo(6, -15, 14, -8); g.closePath(); g.fill();
  g.fillStyle = '#6b4f30';
  g.beginPath(); g.arc(-26, -2, 5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(-24, 6, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffb166'; g.beginPath(); g.arc(-29, -2, 2, 0, Math.PI * 2); g.fill();
});
// Snowspeeder : coin blanc cassé, bandes oranges, volets arrière
SPR.v_snow = makeSprite(84, g => {
  glow(g, 34, 'rgba(223,233,242,.16)');
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 16, 30, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d8dfe6';
  g.beginPath(); g.moveTo(30, 0); g.lineTo(-14, -10); g.lineTo(-30, -6); g.lineTo(-30, 8); g.lineTo(-10, 10); g.closePath(); g.fill();
  g.strokeStyle = '#8895a2'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#ff8f3b'; g.fillRect(-24, -6, 6, 14); g.fillRect(-8, -8, 5, 17);
  g.fillStyle = '#9fdcff'; g.beginPath(); g.moveTo(16, -3); g.lineTo(26, 0); g.lineTo(14, 2); g.closePath(); g.fill();
  g.fillStyle = '#aab6c2'; g.fillRect(-32, -8, 4, 16);
});
// AT-ST détourné : tête carrée, viseurs, deux pattes
SPR.v_atst = makeSprite(96, g => {
  glow(g, 38, 'rgba(138,143,122,.16)');
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 34, 26, 6, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6a705c'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-10, 6); g.lineTo(-16, 20); g.lineTo(-13, 34); g.stroke();
  g.beginPath(); g.moveTo(10, 6); g.lineTo(16, 20); g.lineTo(13, 34); g.stroke();
  g.fillStyle = '#7c8268';
  g.beginPath(); g.moveTo(-16, -6); g.lineTo(-12, -22); g.lineTo(12, -22); g.lineTo(16, -6); g.lineTo(12, 6); g.lineTo(-12, 6); g.closePath(); g.fill();
  g.strokeStyle = '#4c523e'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#20260f'; g.fillRect(-9, -18, 7, 5); g.fillRect(2, -18, 7, 5);
  g.fillStyle = '#52ff7a'; g.fillRect(-8, -17, 5, 3); g.fillRect(3, -17, 5, 3);
  g.fillStyle = '#4c523e'; g.fillRect(-4, 2, 8, 6);
  g.fillStyle = '#33381f'; g.fillRect(-14, -10, 28, 3);
});

// DA comics : contour d'encre automatique sur l'ensemble des sprites
for (const k in SPR) SPR[k] = inkOutline(SPR[k]);

export { SPR };
