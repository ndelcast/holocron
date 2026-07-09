// Holocron Survivors — renderer WebGL (PixiJS)
// Scene graph synchronisé chaque frame depuis l'état du jeu (pools de sprites,
// Graphics pour les primitives, filtres pour le bloom et l'écho chromatique).
import {
  Application, Container, Sprite, Texture, Graphics, TilingSprite,
  BitmapText, BitmapFont, TextStyle,
} from 'pixi.js';
import { AdvancedBloomFilter, RGBSplitFilter } from 'pixi-filters';
import { view } from './core.js';
import { SPR } from './sprites.js';
import { TILE, STAR_LAYERS, stars, nebula } from './background.js';
import { LEVELS, getGroundTile } from './levels.js';
import {
  S, session, players, alivePlayers, teamCenter, PLAYER_TINT, enemies, bullets,
  gems, particles, texts, waves, arcs, drones, booms, grenades, firePools,
  rings, ebullets, decals, bonuses, vehicle,
} from './state.js';
import { WEAPONS, CHARS, BONUSES } from './gamedata.js';
import { screenFlash, ghosts } from './effects.js';

// ------------------------------ Utilitaires couleur ------------------------------
const hexNum = h => parseInt(h.slice(1), 16);
const rgbNum = s => { const [r, g, b] = s.split(',').map(Number); return (r << 16) | (g << 8) | b; };

// ------------------------------ Pool générique ------------------------------
class Pool {
  constructor(parent, factory) { this.parent = parent; this.factory = factory; this.items = []; this.used = 0; }
  get() {
    let it = this.items[this.used];
    if (!it) { it = this.factory(); this.items.push(it); this.parent.addChild(it); }
    it.visible = true;
    this.used++;
    return it;
  }
  end() {
    for (let i = this.used; i < this.items.length; i++) this.items[i].visible = false;
    this.used = 0;
  }
}

// ------------------------------ Initialisation ------------------------------
let ready = false;
const app = new Application();
const TEX = {};
let bloomWrap, bgC, worldC, fxC;
let groundTS, nebulaTS = [], starTS = [], sunSpr = [];
let ambientSpr, flashSpr, rgbSplit;
let gDecals, gFire, gIon, gBeacon, gFx1, gFx2, gFx3, gTrail, gFx4, gSmoke, gWeather, gMini, gArrow;
let shadowPool, gemPool, bonusPool, enemyPool, flashPool, ghostPool, dronePool, bulletPool, ebulletPool, rectPool, glowPool, textPool;
let playerPool;
let zCam = 0; // zoom caméra lissé (cadrage de l'équipe)
let lastW = 0, lastH = 0, lastLevel = '', lastAmbKey = '';

function makeCanvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'));
  return Texture.from(c);
}

async function init() {
  await app.init({
    width: view.w, height: view.h,
    resolution: view.dpr, autoDensity: true,
    backgroundColor: 0x050810, antialias: true,
  });
  app.ticker.stop(); // notre boucle rAF pilote le rendu
  app.canvas.id = 'game'; // récupère les styles CSS existants (position, filtre, tactile)
  document.body.prepend(app.canvas);

  // textures depuis les sprites canvas existants
  for (const k in SPR) TEX[k] = Texture.from(SPR[k]);
  TEX._shadow = makeCanvasTex(64, g => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    grd.addColorStop(0, 'rgba(0,0,0,.9)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  });
  TEX._glow = makeCanvasTex(64, g => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.45, 'rgba(255,255,255,.45)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  });
  TEX._sun1 = makeCanvasTex(256, g => {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 120);
    grd.addColorStop(0, 'rgba(255,236,180,1)'); grd.addColorStop(0.32, 'rgba(255,236,180,.85)');
    grd.addColorStop(0.42, 'rgba(255,236,180,.28)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  });
  TEX._sun2 = makeCanvasTex(160, g => {
    const grd = g.createRadialGradient(80, 80, 0, 80, 80, 76);
    grd.addColorStop(0, 'rgba(255,180,110,1)'); grd.addColorStop(0.3, 'rgba(255,180,110,.8)');
    grd.addColorStop(0.45, 'rgba(255,180,110,.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 160, 160);
  });
  // couches d'étoiles pré-rendues en tuiles
  TEX._nebula = Texture.from(nebula);
  for (let li = 0; li < STAR_LAYERS.length; li++) {
    const L = STAR_LAYERS[li];
    TEX['_stars' + li] = makeCanvasTex(TILE, g => {
      g.fillStyle = '#cfeeff';
      for (const st of stars[li]) g.fillRect(st.x, st.y, L.size, L.size);
    });
  }

  // police bitmap pour les textes flottants (mise à jour bon marché)
  try { await document.fonts.load('700 32px Rajdhani'); } catch (e) { /* fallback système */ }
  BitmapFont.install({
    name: 'holo',
    style: new TextStyle({
      fontFamily: 'Rajdhani, sans-serif', fontSize: 32, fontWeight: '700',
      fill: 0xffffff, stroke: { color: 0x04070e, width: 4, join: 'round' },
    }),
    chars: [['a', 'z'], ['A', 'Z'], ['0', '9'], ' ÉÈÊÀÇÙÔ×—…©%+-:!?/.,\'’´`'],
  });

  // ---------- hiérarchie ----------
  bloomWrap = new Container();
  bgC = new Container();
  worldC = new Container();
  fxC = new Container();
  app.stage.addChild(bloomWrap, fxC);
  rgbSplit = new RGBSplitFilter({ red: { x: 0, y: 0 }, green: { x: 0, y: 0 }, blue: { x: 0, y: 0 } });
  rgbSplit.enabled = false;
  bloomWrap.filters = [
    new AdvancedBloomFilter({ threshold: 0.72, bloomScale: 0.45, brightness: 1, blur: 4, quality: 3 }),
    rgbSplit,
  ];

  // fond : nébuleuses ×2 + étoiles ×3 (espace) ou sol en tuiles (planètes)
  for (let i = 0; i < 2; i++) {
    const ts = new TilingSprite({ texture: TEX._nebula, width: 8, height: 8 });
    nebulaTS.push(ts); bgC.addChild(ts);
  }
  for (let li = 0; li < STAR_LAYERS.length; li++) {
    const ts = new TilingSprite({ texture: TEX['_stars' + li], width: 8, height: 8 });
    starTS.push(ts); bgC.addChild(ts);
  }
  groundTS = new TilingSprite({ texture: Texture.WHITE, width: 8, height: 8 });
  bgC.addChild(groundTS);
  sunSpr = [new Sprite(TEX._sun1), new Sprite(TEX._sun2)];
  for (const sp of sunSpr) { sp.anchor.set(0.5); sp.blendMode = 'add'; bgC.addChild(sp); }

  // monde, dans l'ordre de rendu du renderer canvas
  gDecals = new Graphics();
  gFire = new Graphics();
  gIon = new Graphics(); gIon.blendMode = 'add';
  worldC.addChild(gDecals, gFire, gIon);
  shadowPool = new Pool(worldC, () => { const s2 = new Sprite(TEX._shadow); s2.anchor.set(0.5); s2.alpha = 0.4; return s2; });
  gemPool = new Pool(worldC, () => { const s2 = new Sprite(TEX.gem); s2.anchor.set(0.5); return s2; });
  gBeacon = new Graphics(); gBeacon.blendMode = 'add';
  worldC.addChild(gBeacon);
  bonusPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); return s2; });
  gFx1 = new Graphics(); gFx1.blendMode = 'add'; // ondes, explosions, anneaux
  worldC.addChild(gFx1);
  enemyPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); return s2; });
  flashPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); s2.blendMode = 'add'; return s2; });
  gFx2 = new Graphics(); gFx2.blendMode = 'add'; // sabre, signatures de boss
  worldC.addChild(gFx2);
  ghostPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); s2.blendMode = 'add'; return s2; });
  dronePool = new Pool(worldC, () => { const s2 = new Sprite(TEX.drone); s2.anchor.set(0.5); return s2; });
  gFx3 = new Graphics(); gFx3.blendMode = 'add'; // colonne + rayons de level-up, halo
  worldC.addChild(gFx3);
  playerPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); return s2; });
  gTrail = new Graphics(); gTrail.blendMode = 'add';
  worldC.addChild(gTrail);
  bulletPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); return s2; });
  ebulletPool = new Pool(worldC, () => { const s2 = new Sprite(TEX.rocket); s2.anchor.set(0.5); return s2; });
  gFx4 = new Graphics(); gFx4.blendMode = 'add'; // éclairs, orbes ennemis, traits
  gSmoke = new Graphics();
  worldC.addChild(gFx4, gSmoke);
  rectPool = new Pool(worldC, () => { const s2 = new Sprite(Texture.WHITE); s2.anchor.set(0.5); return s2; });
  glowPool = new Pool(worldC, () => { const s2 = new Sprite(TEX._glow); s2.anchor.set(0.5); s2.blendMode = 'add'; return s2; });
  textPool = new Pool(worldC, () => {
    const t = new BitmapText({ text: '', style: { fontFamily: 'holo', fontSize: 32 } });
    t.anchor.set(0.5);
    return t;
  });

  // grenades : petits cercles, dans le monde (au-dessus des drones)
  bloomWrap.addChild(bgC, worldC);

  // écran : étalonnage, météo, minimap, flèche, flash
  ambientSpr = new Sprite(Texture.WHITE);
  bloomWrap.addChild(ambientSpr);
  gWeather = new Graphics();
  gMini = new Graphics();
  gArrow = new Graphics();
  flashSpr = new Sprite(Texture.WHITE); flashSpr.blendMode = 'add'; flashSpr.alpha = 0;
  fxC.addChild(gWeather, gMini, gArrow, flashSpr);

  ready = true;
}
init();

// dégradé d'étalonnage pré-rendu par destination
const AMBIENT = {
  space: ['rgba(70,40,140,0.09)', 'rgba(0,8,28,0.20)'],
  tatooine: ['rgba(255,190,90,0.13)', 'rgba(110,35,10,0.18)'],
  deathstar: ['rgba(90,130,170,0.08)', 'rgba(0,0,12,0.24)'],
  hoth: ['rgba(170,225,255,0.10)', 'rgba(8,28,70,0.22)'],
  endor: ['rgba(190,255,130,0.07)', 'rgba(4,22,10,0.24)'],
};
function refreshAmbient() {
  const key = session.level + ':' + view.w + 'x' + view.h;
  if (key === lastAmbKey) return;
  lastAmbKey = key;
  const c = document.createElement('canvas');
  c.width = Math.max(2, view.w >> 2); c.height = Math.max(2, view.h >> 2);
  const g = c.getContext('2d');
  const amb = AMBIENT[session.level];
  const grd = g.createLinearGradient(c.width, 0, 0, c.height);
  grd.addColorStop(0, amb[0]); grd.addColorStop(1, amb[1]);
  g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
  if (ambientSpr.texture !== Texture.WHITE) ambientSpr.texture.destroy(true);
  ambientSpr.texture = Texture.from(c);
  ambientSpr.width = view.w; ambientSpr.height = view.h;
}

// ------------------------------ Rendu ------------------------------
function render() {
  if (!ready) return;
  const anim = performance.now() / 1000;
  const LV = LEVELS[session.level];

  // redimensionnement
  if (view.w !== lastW || view.h !== lastH) {
    lastW = view.w; lastH = view.h;
    app.renderer.resize(view.w, view.h);
  }
  app.renderer.background.color = hexNum(LV.base);

  // caméra : centre de l'équipe, dézoom pour cadrer tout le monde
  const shx = S.shake ? (Math.random() * 2 - 1) * S.shake * 0.5 : 0;
  const shy = S.shake ? (Math.random() * 2 - 1) * S.shake * 0.5 : 0;
  const alive = alivePlayers();
  const tc = teamCenter();
  let fit = view.zoom || 1;
  if (alive.length > 1) {
    let ex = 0, ey = 0;
    for (const pl of alive) {
      ex = Math.max(ex, Math.abs(pl.x - tc.x));
      ey = Math.max(ey, Math.abs(pl.y - tc.y));
    }
    fit = Math.min(fit, (view.w / 2 - 80) / (ex + 160), (view.h / 2 - 80) / (ey + 160));
    fit = Math.max(0.5, fit);
  }
  if (zCam === 0) zCam = fit;
  zCam += (fit - zCam) * 0.08;
  const z = (1 + S.zoomKick) * zCam;
  const vw = view.w / z, vh = view.h / z;
  const camX = tc.x - vw / 2 + shx, camY = tc.y - vh / 2 + shy;
  worldC.scale.set(z);
  worldC.position.set(-camX * z, -camY * z);

  // ---------- fond ----------
  const isSpace = !!LV.stars;
  for (let i = 0; i < 2; i++) {
    const ts = nebulaTS[i];
    ts.visible = isSpace;
    if (isSpace) {
      const par = i === 0 ? 0.12 : 0.3;
      ts.width = view.w; ts.height = view.h;
      ts.tilePosition.set(-camX * par, -camY * par);
    }
  }
  for (let li = 0; li < starTS.length; li++) {
    const ts = starTS[li];
    ts.visible = isSpace;
    if (isSpace) {
      const L = STAR_LAYERS[li];
      ts.width = view.w; ts.height = view.h;
      ts.tilePosition.set(-camX * L.par, -camY * L.par);
      ts.alpha = L.alpha * (0.55 + 0.45 * Math.sin(anim * 1.7 + li * 2));
    }
  }
  groundTS.visible = !isSpace;
  if (!isSpace) {
    if (lastLevel !== session.level) {
      lastLevel = session.level;
      groundTS.texture = Texture.from(getGroundTile(session.level));
    }
    groundTS.width = view.w; groundTS.height = view.h;
    groundTS.tileScale.set(z);
    groundTS.tilePosition.set(-camX * z, -camY * z);
  }
  const isTat = session.level === 'tatooine';
  sunSpr[0].visible = sunSpr[1].visible = isTat;
  if (isTat) {
    sunSpr[0].position.set(view.w - 150, 110);
    sunSpr[1].position.set(view.w - 240, 64);
  }

  // ---------- monde ----------
  refreshAmbient();

  // traces de brûlure
  gDecals.clear();
  for (const d of decals) {
    const a = Math.min(1, d.life / d.max * 2.5) * 0.4;
    gDecals.circle(d.x, d.y, d.r).fill({ color: 0x080604, alpha: a * 0.8 });
  }

  // nappes de feu
  gFire.clear();
  for (const fp of firePools) {
    const a = Math.max(0, Math.min(1, fp.life)) * (0.6 + 0.25 * Math.sin(anim * 18 + fp.x));
    gFire.circle(fp.x, fp.y, fp.r).fill({ color: 0xff7828, alpha: a * 0.16 })
      .circle(fp.x, fp.y, fp.r).stroke({ width: 2, color: 0xffa050, alpha: a * 0.45 });
  }

  // aura ionique
  gIon.clear();
  if (S.scene === 'play' || S.scene === 'levelup') {
    for (const pl of alive) {
      if (!pl.ionAura) continue;
      gIon.circle(pl.x, pl.y, pl.ionAura.radius)
        .fill({ color: 0x6ee7ff, alpha: 0.045 })
        .stroke({ width: 1.5, color: 0x6ee7ff, alpha: 0.35 });
    }
  }

  // ombres portées
  for (const e of enemies) {
    const sh = shadowPool.get();
    sh.position.set(e.x, e.y + e.r * 0.85);
    sh.scale.set(e.r * 2 / 64 * 1.4, e.r * 2 / 64 * 0.5);
  }
  for (const pl of alive) {
    const sh = shadowPool.get();
    sh.position.set(pl.x, pl.y + 13);
    sh.scale.set(0.42, 0.16);
  }
  for (const dr of drones) {
    const sh = shadowPool.get();
    sh.position.set(dr.x, dr.y + 9);
    sh.scale.set(0.18, 0.08);
  }
  shadowPool.end();

  // cristaux
  for (const g of gems) {
    const spr = gemPool.get();
    spr.texture = g.v >= 5 ? TEX.gemBig : TEX.gem;
    spr.position.set(g.x, g.y + Math.sin(g.t) * 2.5);
    const pulse = 1 + 0.1 * Math.sin(anim * 5 + g.t * 2);
    spr.scale.set(0.5 * pulse);
    spr.alpha = 0.85 + 0.15 * Math.sin(anim * 6 + g.t);
  }
  gemPool.end();

  // caisses de ravitaillement + balises
  gBeacon.clear();
  for (const b of bonuses) {
    const col = rgbNum(BONUSES[b.type].rgb);
    const pulse2 = 0.5 + 0.5 * Math.sin(b.t * 4);
    gBeacon.rect(b.x - 7, b.y - 190, 14, 196).fill({ color: col, alpha: 0.10 + pulse2 * 0.07 });
    gBeacon.ellipse(b.x, b.y + 9, 14 + pulse2 * 8, 6 + pulse2 * 3.5).stroke({ width: 2, color: col, alpha: 0.5 - pulse2 * 0.3 });
    const spr = bonusPool.get();
    spr.texture = TEX['b_' + b.type];
    spr.scale.set(0.5);
    spr.position.set(b.x, b.y + Math.sin(b.t * 2.5) * 3 - 4);
  }
  bonusPool.end();

  // armement lourd : sprite de l'engin (caisse au sol, puis actif) + balise
  const vd = vehicle.drop, va = vehicle.active;
  const vkey = 'v_' + (LEVELS[session.level].vehicle || 'turret');
  if (vd) {
    const pulse2 = 0.5 + 0.5 * Math.sin(vd.t * 4);
    gBeacon.rect(vd.x - 9, vd.y - 210, 18, 216).fill({ color: 0xffd166, alpha: 0.12 + pulse2 * 0.08 });
    gBeacon.circle(vd.x, vd.y + 12, 26 + pulse2 * 8).stroke({ width: 2.5, color: 0xffd166, alpha: 0.7 - pulse2 * 0.35 });
    const spr = bonusPool.get();
    spr.texture = TEX[vkey];
    spr.scale.set(0.5);
    spr.position.set(vd.x, vd.y + Math.sin(vd.t * 2.5) * 3 - 4);
  }
  if (va) {
    const def = va.def;
    const spr = bonusPool.get();
    spr.texture = TEX[vkey];
    spr.scale.set(0.5);
    if (def.kind === 'ride') {
      const drv = players[va.riders[0]];
      spr.scale.x = 0.5 * (drv && drv.face === -1 ? -1 : 1);
      spr.position.set(va.x, va.y + Math.sin(anim * 8) * 1.5);
    } else {
      spr.position.set(va.x, va.y);
    }
  }

  // ondes de Force, explosions, anneaux
  gFx1.clear();
  for (const wv of waves) {
    const alpha = 1 - wv.r / wv.maxR;
    gFx1.circle(wv.x, wv.y, wv.r).fill({ color: 0x6ee7ff, alpha: alpha * 0.07 })
      .circle(wv.x, wv.y, wv.r).stroke({ width: 3 + alpha * 6, color: 0x6ee7ff, alpha: alpha * 0.85 })
      .circle(wv.x, wv.y, wv.r * 0.9).stroke({ width: 1.4, color: 0xffffff, alpha: alpha * 0.5 });
  }
  for (const bm of booms) {
    const alpha = bm.life / 0.25;
    const rr = bm.r * (1.15 - alpha * 0.15);
    gFx1.circle(bm.x, bm.y, rr).fill({ color: 0xffa050, alpha: alpha * 0.25 })
      .circle(bm.x, bm.y, bm.r * 0.35 * alpha).fill({ color: 0xfff0d2, alpha: alpha * 0.55 })
      .circle(bm.x, bm.y, rr).stroke({ width: 3, color: 0xffc882, alpha: alpha * 0.9 });
  }
  for (const rg of rings) {
    const p = Math.max(0, Math.min(1, 1 - rg.life / rg.maxLife));
    const eased = 1 - (1 - p) * (1 - p);
    gFx1.circle(rg.x, rg.y, rg.maxR * eased)
      .stroke({ width: Math.max(0.5, rg.width * (1 - p * 0.6)), color: rgbNum(rg.color), alpha: rg.life / rg.maxLife * 0.85 });
  }

  // ennemis (+ flash de dégât, aura de boss)
  gFx2.clear();
  for (const e of enemies) {
    if (e.boss) {
      const pa = 0.14 + 0.06 * Math.sin(anim * 4);
      gFx2.ellipse(e.x, e.y + e.r * 0.8, e.r * 1.5, e.r * 0.55).fill({ color: 0xff3b3b, alpha: pa });
    }
    const spr = enemyPool.get();
    spr.texture = TEX[e.spr];
    spr.scale.set(0.5);
    spr.position.set(e.x, e.y);
    if (e.flash > 0) {
      const fl = flashPool.get();
      fl.texture = TEX[e.spr];
      fl.scale.set(0.5);
      fl.position.set(e.x, e.y);
      fl.alpha = Math.min(1, e.flash * 8);
    }
    if (e.final) {
      if (e.type === 'maul') {
        const ba = anim * 5;
        gFx2.moveTo(e.x + Math.cos(ba) * 38, e.y + Math.sin(ba) * 38)
          .lineTo(e.x - Math.cos(ba) * 38, e.y - Math.sin(ba) * 38)
          .stroke({ width: 2.5, color: 0xffb4a0, alpha: 0.85, cap: 'round' });
      } else if (e.type === 'vader') {
        const sa = -0.9 + Math.sin(anim * 2) * 0.12;
        gFx2.moveTo(e.x + 16, e.y + 8)
          .lineTo(e.x + 16 + Math.cos(sa) * 34, e.y + 8 + Math.sin(sa) * 34)
          .stroke({ width: 2, color: 0xffb4a0, alpha: 0.9, cap: 'round' });
      }
    }
  }
  enemyPool.end();
  flashPool.end();

  // armement lourd actif : canon de tourelle orienté + arc de durée restante
  if (vehicle.active) {
    const va2 = vehicle.active, def2 = va2.def;
    if (def2.kind === 'turret') {
      let na = anim * 1.5, bd = 1e9;
      for (const e of enemies) {
        const d = (e.x - va2.x) * (e.x - va2.x) + (e.y - va2.y) * (e.y - va2.y);
        if (d < bd) { bd = d; na = Math.atan2(e.y - va2.y, e.x - va2.x); }
      }
      gFx2.moveTo(va2.x + Math.cos(na) * 10, va2.y + Math.sin(na) * 10)
        .lineTo(va2.x + Math.cos(na) * (def2.r + 24), va2.y + Math.sin(na) * (def2.r + 24))
        .stroke({ width: 6, color: def2.color, alpha: 0.85, cap: 'round' });
    }
    const frac = Math.max(0, va2.t / def2.dur);
    const r2 = (def2.r || def2.radius) + 20;
    gFx2.moveTo(va2.x, va2.y - r2)
      .arc(va2.x, va2.y, r2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac)
      .stroke({ width: 3, color: 0xffd166, alpha: 0.75 });
  }

  // sabre laser + sillage
  if (S.scene === 'play' || S.scene === 'levelup') {
    for (const pl of alive) {
      const saber = pl.weapons.find(w => w.id === 'saber');
      if (!saber) continue;
      const st = WEAPONS.saber.stats(saber.lvl);
      for (let b = 0; b < st.blades; b++) {
        const a = (saber.angle || 0) + b * (Math.PI * 2 / st.blades);
        for (let k = 6; k >= 1; k--) {
          const ga = a - k * 0.11;
          gFx2.moveTo(pl.x + Math.cos(ga) * 16, pl.y + Math.sin(ga) * 16)
            .lineTo(pl.x + Math.cos(ga) * st.len, pl.y + Math.sin(ga) * st.len)
            .stroke({ width: 9 - k, color: 0x52ff7a, alpha: 0.16 * (1 - k / 7), cap: 'round' });
        }
        const x1 = pl.x + Math.cos(a) * 16, y1 = pl.y + Math.sin(a) * 16;
        const x2 = pl.x + Math.cos(a) * st.len, y2 = pl.y + Math.sin(a) * st.len;
        gFx2.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 11, color: 0x52ff7a, alpha: 0.22, cap: 'round' });
        gFx2.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 5, color: 0x52ff7a, alpha: 0.65, cap: 'round' });
        gFx2.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2, color: 0xeaffef, alpha: 1, cap: 'round' });
        gFx2.circle(x2, y2, 6).fill({ color: 0xeaffef, alpha: 0.5 });
      }
    }
  }

  // fantômes et rémanences
  for (const gh of ghosts) {
    const lr = 1 - gh.t / 0.22;
    const spr = ghostPool.get();
    spr.texture = TEX[gh.spr];
    spr.position.set(gh.x, gh.y);
    if (gh.kind === 'after') {
      spr.alpha = lr * 0.22;
      spr.scale.set(0.5 * (gh.flip || 1), 0.5);
    } else {
      spr.alpha = lr * 0.7;
      spr.scale.set(0.5 * (1 + (1 - lr) * 0.8));
    }
  }
  ghostPool.end();

  // droïdes alliés
  for (const dr of drones) {
    const spr = dronePool.get();
    spr.scale.set(0.5);
    spr.position.set(dr.x, dr.y);
  }
  dronePool.end();

  // colonne + rayons de level-up, halo au sol
  gFx3.clear();
  if (S.beamT > 0) {
    const lr = S.beamT / 0.7;
    const rot = anim * 1.5;
    for (const pl of alive) {
      for (let i = 0; i < 6; i++) {
        const a = rot + i * Math.PI / 3;
        gFx3.poly([
          pl.x + Math.cos(a) * 24, pl.y + Math.sin(a) * 24,
          pl.x + Math.cos(a + 0.22) * 175, pl.y + Math.sin(a + 0.22) * 175,
          pl.x + Math.cos(a - 0.22) * 175, pl.y + Math.sin(a - 0.22) * 175,
        ]).fill({ color: 0xffd166, alpha: lr * 0.07 });
      }
      const bw2 = 26 + (1 - lr) * 34;
      gFx3.rect(pl.x - bw2 / 2, pl.y - 300, bw2, 316).fill({ color: 0xffd166, alpha: lr * 0.22 });
      gFx3.rect(pl.x - bw2 / 6, pl.y - 220, bw2 / 3, 232).fill({ color: 0xfff6dd, alpha: lr * 0.3 });
    }
  }
  if (S.scene === 'play' || S.scene === 'levelup') {
    for (const pl of alive) {
      gFx3.ellipse(pl.x, pl.y + 12, 20, 8).fill({ color: hexNum(PLAYER_TINT[pl.idx]), alpha: 0.14 + 0.05 * Math.sin(anim * 3) });
    }
  }

  // équipe
  for (const pl of alive) {
    if (pl.invuln > 0 && Math.floor(S.time * 18) % 2 !== 0) continue; // clignote
    const spr = playerPool.get();
    spr.texture = TEX[pl.spr];
    spr.position.set(pl.x, pl.y);
    spr.scale.set(0.5 * pl.face, 0.5);
  }
  playerPool.end();

  // grenades en vol
  for (const gr of grenades) {
    const p = gr.t / gr.dur;
    const gx = gr.x + (gr.tx - gr.x) * p, gy = gr.y + (gr.ty - gr.y) * p - Math.sin(Math.PI * p) * 46;
    gFx3.circle(gr.tx, gr.ty, 10).stroke({ width: 1, color: 0xff7850, alpha: 0.3 });
    gSmoke.circle(gx, gy, 4.5).fill({ color: 0x2a2f36 });
    if (Math.floor(gr.t * 12) % 2 === 0) gFx3.circle(gx + 1.5, gy - 1.5, 1.6).fill({ color: 0xff5a4a });
  }

  // traînées + projectiles du joueur
  gTrail.clear();
  const TRAILS = { boltCyan: 0x6ee7ff, boltRed: 0xff6e5a, spear: 0xffd296, rocket: 0xffaa5a };
  for (const b of bullets) {
    const col = TRAILS[b.spr] || 0x6ee7ff;
    gTrail.moveTo(b.x - b.vx * 0.07, b.y - b.vy * 0.07).lineTo(b.x, b.y)
      .stroke({ width: 6, color: col, alpha: 0.18, cap: 'round' });
    gTrail.moveTo(b.x - b.vx * 0.07, b.y - b.vy * 0.07).lineTo(b.x, b.y)
      .stroke({ width: 2, color: col, alpha: 0.55, cap: 'round' });
    const spr = bulletPool.get();
    spr.texture = TEX[b.spr];
    spr.scale.set(0.5);
    spr.position.set(b.x, b.y);
    spr.rotation = b.a + Math.PI / 2;
  }
  bulletPool.end();

  // projectiles ennemis
  gSmoke.clear();
  gFx4.clear();
  for (const b of ebullets) {
    if (b.saber) {
      const rot = (b.t || 0) * 13;
      for (const off of [0, Math.PI / 2]) {
        gFx4.moveTo(b.x + Math.cos(rot + off) * 20, b.y + Math.sin(rot + off) * 20)
          .lineTo(b.x - Math.cos(rot + off) * 20, b.y - Math.sin(rot + off) * 20)
          .stroke({ width: 2.2, color: 0xffbeaa, alpha: 0.9, cap: 'round' });
      }
    } else if (b.rocket) {
      const spr = ebulletPool.get();
      spr.scale.set(0.5);
      spr.position.set(b.x, b.y);
      spr.rotation = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    } else {
      const col = rgbNum(b.color || '255,59,59');
      gFx4.circle(b.x, b.y, (b.r || 5) * 2.1).fill({ color: col, alpha: 0.22 })
        .circle(b.x, b.y, (b.r || 5) * 0.9).fill({ color: col, alpha: 0.9 })
        .circle(b.x, b.y, (b.r || 5) * 0.35).fill({ color: 0xffffff, alpha: 0.8 });
    }
  }
  ebulletPool.end();

  // éclairs ramifiés
  for (const arc of arcs) {
    const alpha = arc.life / 0.18;
    for (let i = 0; i < arc.pts.length - 1; i++) {
      const p1 = arc.pts[i], p2 = arc.pts[i + 1];
      let px = p1.x, py = p1.y;
      for (let s2 = 1; s2 <= 4; s2++) {
        const t = s2 / 4;
        const nx = s2 === 4 ? p2.x : p1.x + (p2.x - p1.x) * t + (Math.random() * 18 - 9);
        const ny = s2 === 4 ? p2.y : p1.y + (p2.y - p1.y) * t + (Math.random() * 18 - 9);
        gFx4.moveTo(px, py).lineTo(nx, ny).stroke({ width: 5, color: 0x6ee7ff, alpha: alpha * 0.3 });
        gFx4.moveTo(px, py).lineTo(nx, ny).stroke({ width: 1.6, color: 0xebfaff, alpha: alpha });
        px = nx; py = ny;
      }
    }
    for (let i = 1; i < arc.pts.length; i++) {
      gFx4.circle(arc.pts[i].x, arc.pts[i].y, 3.5).fill({ color: 0xebfaff, alpha: alpha * 0.6 });
    }
  }

  // particules
  for (const p of particles) {
    if (p.type === 'smoke') {
      const lr = p.life / p.max;
      gSmoke.circle(p.x, p.y, p.size * (1.8 - lr * 0.8)).fill({ color: 0x141210, alpha: lr * 0.22 });
    } else if (p.type === 'glow') {
      const lr = p.life / p.max;
      const spr = glowPool.get();
      spr.position.set(p.x, p.y);
      spr.scale.set(p.size / 22);
      spr.tint = rgbNum(p.rgb);
      spr.alpha = lr * 0.7;
    } else if (p.type === 'streak') {
      gFx4.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05).lineTo(p.x, p.y)
        .stroke({ width: p.size, color: rgbNum(p.rgb), alpha: Math.min(1, p.life * 4), cap: 'round' });
    } else {
      const spr = rectPool.get();
      spr.position.set(p.x, p.y);
      spr.width = p.size; spr.height = p.size;
      spr.tint = hexNum(p.color);
      spr.alpha = Math.min(1, p.life * 2.5);
    }
  }
  rectPool.end();
  glowPool.end();

  // textes flottants
  for (const t of texts) {
    const bt = textPool.get();
    if (bt.text !== t.str) bt.text = t.str;
    bt.position.set(t.x, t.y);
    bt.scale.set(t.size / 32);
    bt.tint = hexNum(t.color);
    bt.alpha = Math.min(1, t.life / t.maxLife * 1.4);
  }
  textPool.end();

  // ---------- espace écran ----------
  // minimap radar
  gMini.clear();
  if (S.scene === 'play' || S.scene === 'levelup') {
    const small = view.w < 640 || view.h < 520;
    const mmS = small ? 92 : 128;
    const mmX = 18, mmY = small && enemies.some(e => e.final) ? 104 : 56, half = mmS / 2;
    const cx = mmX + half, cy = mmY + half;
    const range = 1500, sc = (half - 6) / range;
    const mc = tc; // centre radar = centre d'équipe
    gMini.poly([mmX + 10, mmY, mmX + mmS, mmY, mmX + mmS, mmY + mmS - 10, mmX + mmS - 10, mmY + mmS, mmX, mmY + mmS, mmX, mmY + 10])
      .fill({ color: 0x060e18, alpha: 0.62 })
      .stroke({ width: 1, color: 0x6ee7ff, alpha: 0.3 });
    gMini.moveTo(cx, mmY).lineTo(cx, mmY + mmS).moveTo(mmX, cy).lineTo(mmX + mmS, cy)
      .stroke({ width: 1, color: 0x6ee7ff, alpha: 0.08 });
    const sweep = anim * 1.4;
    for (let k = 0; k < 5; k++) {
      gMini.moveTo(cx, cy)
        .lineTo(cx + Math.cos(sweep - k * 0.07) * half, cy + Math.sin(sweep - k * 0.07) * half)
        .stroke({ width: 1, color: 0x6ee7ff, alpha: 0.12 * (1 - k / 5) });
    }
    const cl = (v, m) => v < -m ? -m : v > m ? m : v;
    for (const e of enemies) {
      const dx = (e.x - mc.x) * sc, dy = (e.y - mc.y) * sc;
      if (e.boss) {
        gMini.circle(cx + cl(dx, half - 7), cy + cl(dy, half - 7), e.final ? 3.5 + Math.sin(anim * 6) : 3)
          .fill({ color: e.final ? 0xff3b3b : 0xff6e5a, alpha: 0.95 });
      } else if (Math.abs(dx) < half - 4 && Math.abs(dy) < half - 4) {
        gMini.rect(cx + dx - 1, cy + dy - 1, 2, 2).fill({ color: 0xff5a50, alpha: 0.7 });
      }
    }
    for (const b of bonuses) {
      const dx = cl((b.x - mc.x) * sc, half - 8), dy = cl((b.y - mc.y) * sc, half - 8);
      const pulse3 = 0.6 + 0.4 * Math.sin(anim * 5 + b.t);
      gMini.poly([cx + dx, cy + dy - 4, cx + dx + 4, cy + dy, cx + dx, cy + dy + 4, cx + dx - 4, cy + dy])
        .fill({ color: rgbNum(BONUSES[b.type].rgb), alpha: pulse3 });
    }
    const vwp = vehicle.drop || vehicle.active; // armement lourd : carré doré pulsant
    if (vwp) {
      const dx = cl((vwp.x - mc.x) * sc, half - 8), dy = cl((vwp.y - mc.y) * sc, half - 8);
      const pulse4 = 0.6 + 0.4 * Math.sin(anim * 6);
      gMini.rect(cx + dx - 3, cy + dy - 3, 6, 6).stroke({ width: 1.5, color: 0xffd166, alpha: pulse4 });
    }
    for (const pl of alive) {
      gMini.circle(cx + cl((pl.x - mc.x) * sc, half - 5), cy + cl((pl.y - mc.y) * sc, half - 5), 2.6)
        .fill({ color: hexNum(PLAYER_TINT[pl.idx]) });
    }
  }

  // flèche vers le boss final
  gArrow.clear();
  const fb = enemies.find(e => e.final);
  if (fb && S.scene === 'play') {
    const sx = view.w / 2 + (fb.x - tc.x) * z, sy = view.h / 2 + (fb.y - tc.y) * z;
    if (sx < -20 || sx > view.w + 20 || sy < -20 || sy > view.h + 20) {
      const a = Math.atan2(sy - view.h / 2, sx - view.w / 2);
      const m = Math.min(view.w, view.h) / 2 - 46;
      const ex = Math.max(34, Math.min(view.w - 34, view.w / 2 + Math.cos(a) * m));
      const ey = Math.max(34, Math.min(view.h - 34, view.h / 2 + Math.sin(a) * m));
      const pts = [[14, 0], [-8, -9], [-4, 0], [-8, 9]].map(([px, py]) => [
        ex + px * Math.cos(a) - py * Math.sin(a),
        ey + px * Math.sin(a) + py * Math.cos(a),
      ]).flat();
      gArrow.poly(pts).fill({ color: 0xff3b3b, alpha: 0.6 + 0.4 * Math.sin(anim * 7) });
    }
  }

  // météo simplifiée (espace écran)
  gWeather.clear();
  if (session.level === 'hoth') {
    for (let i = 0; i < 70; i++) {
      const fx = (((i * 137.9 + anim * (14 + (i % 5) * 9)) % view.w) + view.w) % view.w;
      const fy = (((i * 89.3 + anim * (50 + (i % 7) * 12)) % view.h) + view.h) % view.h;
      gWeather.rect(fx, fy, 1 + (i % 3), 1 + (i % 3)).fill({ color: 0xe1f0ff, alpha: 0.55 });
    }
  } else if (session.level === 'endor') {
    for (let i = 0; i < 18; i++) {
      const a = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(anim * 2 + i * 1.7));
      const fx = (((i * 173.3 + Math.sin(anim * 0.35 + i) * 70) % view.w) + view.w) % view.w;
      const fy = (((i * 111.7 + Math.cos(anim * 0.3 + i * 2) * 50) % view.h) + view.h) % view.h;
      gWeather.circle(fx, fy, 1.8).fill({ color: 0xbeff8c, alpha: a });
    }
  }
  for (let i = 0; i < 20; i++) {
    const mx2 = (((i * 211.7 + anim * (6 + (i % 4) * 3)) % (view.w + 40)) + view.w + 40) % (view.w + 40) - 20;
    const my2 = (((i * 149.3 + Math.sin(anim * 0.4 + i) * 30 + anim * 2.5) % (view.h + 40)) + view.h + 40) % (view.h + 40) - 20;
    gWeather.circle(mx2, my2, 1.5 + (i % 3)).fill({ color: 0xbee1ff, alpha: 0.1 });
  }

  // écho chromatique pendant les fortes secousses
  if (S.shake > 3) {
    const off = Math.min(5, S.shake * 0.35);
    rgbSplit.enabled = true;
    rgbSplit.red = { x: off, y: 0 };
    rgbSplit.blue = { x: -off, y: 0 };
  } else rgbSplit.enabled = false;

  // flash plein écran
  flashSpr.width = view.w; flashSpr.height = view.h;
  flashSpr.tint = rgbNum(screenFlash.rgb);
  flashSpr.alpha = Math.min(screenFlash.a, 0.6);

  app.renderer.render(app.stage);
}

export { render };
