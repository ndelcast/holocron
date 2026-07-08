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
function glow(g, r, color) {
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, r);
  grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(-r, -r, r * 2, r * 2);
}

const SPR = {};
// Jedi (joueur) : robe sombre, capuche
SPR.player = makeSprite(48, g => {
  glow(g, 22, 'rgba(110,231,255,.16)');
  g.fillStyle = '#2a2118';
  g.beginPath(); g.moveTo(-11, 14); g.quadraticCurveTo(-14, -6, 0, -15); g.quadraticCurveTo(14, -6, 11, 14); g.closePath(); g.fill();
  g.fillStyle = '#4a3826';
  g.beginPath(); g.arc(0, -5, 7.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8c9a0';
  g.beginPath(); g.arc(0, -3.4, 4.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a2118';
  g.beginPath(); g.arc(0, -7.4, 6.4, Math.PI * 0.95, Math.PI * 2.05); g.fill();
  g.strokeStyle = '#6ee7ff'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-8, 8); g.lineTo(8, 8); g.stroke();
});
// Ewok : fourrure brune, capuche en cuir, lance dans le dos
SPR.ewok = makeSprite(44, g => {
  glow(g, 18, 'rgba(255,180,110,.12)');
  g.strokeStyle = '#8c6a3f'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(8, 12); g.lineTo(13, -12); g.stroke();
  g.fillStyle = '#d8dde3';
  g.beginPath(); g.moveTo(13.6, -14.5); g.lineTo(11.2, -8.8); g.lineTo(15, -9.6); g.closePath(); g.fill();
  g.fillStyle = '#6d4c2c';
  g.beginPath(); g.ellipse(0, 5, 8, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7d5a35';
  g.beginPath(); g.arc(0, -5, 7.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c07a3e';
  g.beginPath(); g.arc(0, -6, 7.8, Math.PI * 0.85, Math.PI * 2.15); g.fill();
  g.beginPath(); g.arc(-6.5, -10, 2.8, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(6.5, -10, 2.8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a2a16';
  g.beginPath(); g.arc(0, -3.5, 4.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffe2b0';
  g.beginPath(); g.arc(-1.8, -4, 1.1, 0, Math.PI * 2); g.arc(1.8, -4, 1.1, 0, Math.PI * 2); g.fill();
});
// Mandalorien : armure beskar, visière en T, jetpack
SPR.mando = makeSprite(46, g => {
  glow(g, 19, 'rgba(110,231,255,.10)');
  g.fillStyle = '#6e7a84';
  g.fillRect(-11.5, -3, 3.4, 9); g.fillRect(8.1, -3, 3.4, 9);
  g.fillStyle = '#3f5c49';
  g.beginPath(); g.moveTo(-9, 13); g.quadraticCurveTo(-11, -4, 0, -6); g.quadraticCurveTo(11, -4, 9, 13); g.closePath(); g.fill();
  g.fillStyle = '#8f9aa4';
  g.fillRect(-6.4, -2.4, 5.2, 4.4); g.fillRect(1.2, -2.4, 5.2, 4.4);
  g.fillStyle = '#b9c4cc';
  g.beginPath(); g.moveTo(-6.5, -5.5); g.quadraticCurveTo(-7.4, -16, 0, -16.5); g.quadraticCurveTo(7.4, -16, 6.5, -5.5); g.quadraticCurveTo(0, -3.8, -6.5, -5.5); g.closePath(); g.fill();
  g.fillStyle = '#0a0d12';
  g.fillRect(-5, -13.5, 10, 2.6);
  g.fillRect(-1.6, -12, 3.2, 6);
});
// Contrebandier : chemise claire, gilet noir, blaster au poing
SPR.smuggler = makeSprite(44, g => {
  glow(g, 18, 'rgba(255,209,102,.10)');
  g.fillStyle = '#26303c';
  g.fillRect(-6, 6, 4.6, 8); g.fillRect(1.4, 6, 4.6, 8);
  g.fillStyle = '#b33a3a';
  g.fillRect(-6, 6, 1.5, 8); g.fillRect(1.4, 6, 1.5, 8);
  g.fillStyle = '#e8e3d5';
  g.beginPath(); g.moveTo(-8, 7); g.quadraticCurveTo(-9, -4, 0, -5); g.quadraticCurveTo(9, -4, 8, 7); g.closePath(); g.fill();
  g.fillStyle = '#14171c';
  g.beginPath(); g.moveTo(-8, 7); g.quadraticCurveTo(-9, -4, -2.5, -5); g.lineTo(-2.5, 7); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(8, 7); g.quadraticCurveTo(9, -4, 2.5, -5); g.lineTo(2.5, 7); g.closePath(); g.fill();
  g.fillStyle = '#2a2f36';
  g.fillRect(7, -1, 7.5, 2.4); g.fillRect(7, -1, 2.4, 5.2);
  g.fillStyle = '#e3bd93';
  g.beginPath(); g.arc(0, -10, 5.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5d4426';
  g.beginPath(); g.arc(0, -11.5, 5.4, Math.PI * 0.95, Math.PI * 2.05); g.fill();
});
// Stormtrooper
SPR.trooper = makeSprite(40, g => {
  g.fillStyle = '#e9edf2';
  g.beginPath(); g.moveTo(-9, 10); g.quadraticCurveTo(-11, -9, 0, -11); g.quadraticCurveTo(11, -9, 9, 10); g.quadraticCurveTo(0, 13, -9, 10); g.closePath(); g.fill();
  g.fillStyle = '#0a0d12';
  g.beginPath(); g.moveTo(-7, -3); g.quadraticCurveTo(0, -7, 7, -3); g.quadraticCurveTo(7, 0, 4, 0.5); g.quadraticCurveTo(0, -2, -4, 0.5); g.quadraticCurveTo(-7, 0, -7, -3); g.closePath(); g.fill();
  g.fillStyle = '#3a4552';
  g.fillRect(-4, 4, 8, 3.4);
  g.fillStyle = '#0a0d12';
  g.fillRect(-8.4, 2, 2.4, 5); g.fillRect(6, 2, 2.4, 5);
});
// Droïde B1
SPR.droid = makeSprite(36, g => {
  g.fillStyle = '#b99a68';
  g.fillRect(-3.4, -2, 6.8, 13);
  g.beginPath(); g.ellipse(0, -6, 4.4, 6.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8c7147';
  g.fillRect(-4.6, -12.5, 9.2, 4);
  g.fillStyle = '#151005';
  g.beginPath(); g.arc(-2, -6.5, 1.5, 0, Math.PI * 2); g.arc(2, -6.5, 1.5, 0, Math.PI * 2); g.fill();
});
// Droïde sonde
SPR.probe = makeSprite(44, g => {
  glow(g, 19, 'rgba(255,59,59,.14)');
  g.fillStyle = '#3c434c';
  g.beginPath(); g.arc(0, -3, 9.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#20242a';
  g.beginPath(); g.arc(0, -3, 9.5, Math.PI * 0.1, Math.PI * 0.9); g.fill();
  g.strokeStyle = '#20242a'; g.lineWidth = 2;
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 5, 5); g.lineTo(i * 7, 14); g.stroke(); }
  g.fillStyle = '#ff3b3b';
  g.beginPath(); g.arc(0, -4, 2.6, 0, Math.PI * 2); g.fill();
});
// Droïdeka
SPR.droideka = makeSprite(52, g => {
  glow(g, 23, 'rgba(255,180,80,.12)');
  g.fillStyle = '#a4762e';
  g.beginPath(); g.arc(0, 0, 13, Math.PI, 0); g.lineTo(13, 9); g.lineTo(-13, 9); g.closePath(); g.fill();
  g.fillStyle = '#6e4c17';
  g.fillRect(-13, 5, 26, 4);
  g.fillStyle = '#1a1206';
  g.fillRect(-8, -5, 5, 2.6); g.fillRect(3, -5, 5, 2.6);
  g.strokeStyle = '#c89544'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-11, 12); g.lineTo(-4, 16); g.moveTo(11, 12); g.lineTo(4, 16); g.stroke();
});
// Seigneur Sith (boss)
SPR.sith = makeSprite(76, g => {
  glow(g, 36, 'rgba(255,59,59,.22)');
  g.fillStyle = '#0c0d12';
  g.beginPath(); g.moveTo(-19, 26); g.quadraticCurveTo(-24, -12, 0, -26); g.quadraticCurveTo(24, -12, 19, 26); g.quadraticCurveTo(0, 31, -19, 26); g.closePath(); g.fill();
  g.fillStyle = '#16181f';
  g.beginPath(); g.arc(0, -9, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000';
  g.beginPath(); g.arc(0, -7, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ff3b3b';
  g.beginPath(); g.arc(-3.4, -8, 1.7, 0, Math.PI * 2); g.arc(3.4, -8, 1.7, 0, Math.PI * 2); g.fill();
});
// ---- Boss de fin de niveau ----
// Dark Maul : peau rouge tatouée, couronne de cornes
SPR.maul = makeSprite(58, g => {
  glow(g, 26, 'rgba(255,59,59,.20)');
  g.fillStyle = '#14161c';
  g.beginPath(); g.moveTo(-14, 20); g.quadraticCurveTo(-17, -6, 0, -10); g.quadraticCurveTo(17, -6, 14, 20); g.closePath(); g.fill();
  g.fillStyle = '#3a2c22';
  for (const [hx, hy] of [[-7, -20], [-3.5, -22.5], [0, -23.5], [3.5, -22.5], [7, -20]]) {
    g.beginPath(); g.moveTo(hx - 1.6, hy + 4); g.lineTo(hx, hy); g.lineTo(hx + 1.6, hy + 4); g.closePath(); g.fill();
  }
  g.fillStyle = '#c22b1e';
  g.beginPath(); g.arc(0, -14, 8.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1a0c0a';
  g.fillRect(-1.3, -22, 2.6, 9);
  g.fillRect(-8.2, -15.5, 4.5, 2.2); g.fillRect(3.7, -15.5, 4.5, 2.2);
  g.beginPath(); g.arc(0, -8.5, 4, 0.2, Math.PI - 0.2); g.fill();
  g.fillStyle = '#ffd166';
  g.beginPath(); g.arc(-3.4, -14.5, 1.5, 0, Math.PI * 2); g.arc(3.4, -14.5, 1.5, 0, Math.PI * 2); g.fill();
});
// Jabba le Hutt : masse reptilienne
SPR.jabba = makeSprite(76, g => {
  glow(g, 34, 'rgba(180,200,90,.16)');
  g.fillStyle = '#6d6d38';
  g.beginPath(); g.ellipse(0, 12, 26, 15, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8a8a4a';
  g.beginPath(); g.ellipse(0, 2, 21, 15, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b0a86a';
  g.beginPath(); g.ellipse(0, 12, 13, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7d7d40';
  g.beginPath(); g.ellipse(0, -12, 17, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8b73a';
  g.beginPath(); g.ellipse(-7, -15, 3.6, 4.4, -0.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(7, -15, 3.6, 4.4, 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#20180a';
  g.fillRect(-7.8, -18, 1.8, 6); g.fillRect(6, -18, 1.8, 6);
  g.strokeStyle = '#4a4a26'; g.lineWidth = 2;
  g.beginPath(); g.arc(0, -8, 10, 0.3, Math.PI - 0.3); g.stroke();
  g.fillStyle = '#8a8a4a';
  g.beginPath(); g.ellipse(-19, 4, 6, 4, -0.5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(19, 4, 6, 4, 0.5, 0, Math.PI * 2); g.fill();
});
// Dark Vador : casque évasé, plastron
SPR.vader = makeSprite(66, g => {
  glow(g, 30, 'rgba(255,59,59,.22)');
  g.fillStyle = '#0a0b0f';
  g.beginPath(); g.moveTo(-18, 24); g.quadraticCurveTo(-23, -10, 0, -14); g.quadraticCurveTo(23, -10, 18, 24); g.closePath(); g.fill();
  g.fillStyle = '#16181f';
  g.beginPath();
  g.moveTo(-13, -5);
  g.quadraticCurveTo(-11, -8, -9, -9);
  g.quadraticCurveTo(-11, -23, 0, -24);
  g.quadraticCurveTo(11, -23, 9, -9);
  g.quadraticCurveTo(11, -8, 13, -5);
  g.quadraticCurveTo(0, -1, -13, -5);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(140,160,190,.3)'; g.lineWidth = 1.4;
  g.beginPath(); g.arc(0, -14, 8.5, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(-4, -13, 3.2, 2.6, -0.25, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(4, -13, 3.2, 2.6, 0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a2f38';
  g.beginPath(); g.moveTo(-4, -8.5); g.lineTo(4, -8.5); g.lineTo(0, -3.5); g.closePath(); g.fill();
  g.fillStyle = '#333a44';
  g.fillRect(-6, 2, 12, 8);
  g.fillStyle = '#ff3b3b'; g.fillRect(-4, 4, 2.4, 1.8);
  g.fillStyle = '#6ee7ff'; g.fillRect(1.6, 4, 2.4, 1.8);
  g.fillStyle = '#8f9aa4'; g.fillRect(-4, 7.4, 8, 1.4);
});
// Boba Fett : armure verte patinée, jetpack
SPR.boba = makeSprite(58, g => {
  glow(g, 24, 'rgba(150,220,140,.12)');
  g.fillStyle = '#7d6a3a';
  g.fillRect(-13.5, -6, 4, 13); g.fillRect(9.5, -6, 4, 13);
  g.fillStyle = '#4a5d43';
  g.beginPath(); g.moveTo(-10, 16); g.quadraticCurveTo(-12, -5, 0, -7); g.quadraticCurveTo(12, -5, 10, 16); g.closePath(); g.fill();
  g.fillStyle = '#6a7d5a';
  g.fillRect(-7, -3, 5.5, 5); g.fillRect(1.5, -3, 5.5, 5);
  g.fillStyle = '#8a3b2b';
  g.fillRect(-7, 4, 14, 2.4);
  g.fillStyle = '#5a6d4a';
  g.beginPath(); g.moveTo(-7, -6.5); g.quadraticCurveTo(-8, -18, 0, -18.5); g.quadraticCurveTo(8, -18, 7, -6.5); g.quadraticCurveTo(0, -4.5, -7, -6.5); g.closePath(); g.fill();
  g.fillStyle = '#0a0d12';
  g.fillRect(-5.4, -15.5, 10.8, 2.6);
  g.fillRect(-1.5, -14, 3, 6);
  g.strokeStyle = '#9aa78a'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-7.5, -17); g.lineTo(-9.5, -24); g.stroke();
});
// L'Empereur : capuche profonde, visage blafard
SPR.palpatine = makeSprite(62, g => {
  glow(g, 28, 'rgba(150,120,255,.22)');
  g.fillStyle = '#0c0c14';
  g.beginPath(); g.moveTo(-16, 22); g.quadraticCurveTo(-20, -8, 0, -12); g.quadraticCurveTo(20, -8, 16, 22); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(-12, -24, 0, -25); g.quadraticCurveTo(12, -24, 10, -6); g.quadraticCurveTo(0, -2, -10, -6); g.closePath(); g.fill();
  g.fillStyle = '#151522';
  g.beginPath(); g.ellipse(0, -12, 7.5, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#cfc3b8';
  g.beginPath(); g.ellipse(0, -11, 5.2, 6.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(30,25,45,.55)';
  g.beginPath(); g.ellipse(0, -14.5, 5.2, 3.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffd166';
  g.beginPath(); g.arc(-2.2, -13, 1.2, 0, Math.PI * 2); g.arc(2.2, -13, 1.2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(150,120,255,.7)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-13, 6); g.lineTo(-17, 2); g.moveTo(-13, 6); g.lineTo(-18, 7); g.stroke();
  g.beginPath(); g.moveTo(13, 6); g.lineTo(17, 2); g.moveTo(13, 6); g.lineTo(18, 7); g.stroke();
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
  g.beginPath(); g.moveTo(0, -5.5); g.lineTo(4.6, 0); g.lineTo(0, 5.5); g.lineTo(-4.6, 0); g.closePath(); g.fill();
  g.fillStyle = '#e5fbff';
  g.beginPath(); g.moveTo(0, -5.5); g.lineTo(4.6, 0); g.lineTo(0, 0); g.closePath(); g.fill();
});
SPR.gemBig = makeSprite(30, g => {
  glow(g, 14, 'rgba(255,209,102,.5)');
  g.fillStyle = '#ffd166';
  g.beginPath(); g.moveTo(0, -8); g.lineTo(6.6, 0); g.lineTo(0, 8); g.lineTo(-6.6, 0); g.closePath(); g.fill();
  g.fillStyle = '#fff2cc';
  g.beginPath(); g.moveTo(0, -8); g.lineTo(6.6, 0); g.lineTo(0, 0); g.closePath(); g.fill();
});
SPR.drone = makeSprite(30, g => {
  glow(g, 13, 'rgba(110,231,255,.3)');
  g.fillStyle = '#8fa8b8';
  g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#22303c';
  g.beginPath(); g.arc(0, 0, 6, Math.PI * 0.15, Math.PI * 0.85); g.fill();
  g.fillStyle = '#6ee7ff';
  g.beginPath(); g.arc(0, -1, 1.8, 0, Math.PI * 2); g.fill();
});

export { SPR };
