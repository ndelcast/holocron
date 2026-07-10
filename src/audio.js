// Holocron Survivors — sons synthétisés en WebAudio

// ------------------------------ Audio (synthétisé) ------------------------------
let AC = null, muted = false;
// volumes réglables (menu OPTIONS), persistés
const volumes = { music: 1, sfx: 1 };
try {
  const v = JSON.parse(localStorage.getItem('holocron_vol'));
  if (v) { volumes.music = Math.min(1, Math.max(0, +v.music || 0)); volumes.sfx = Math.min(1, Math.max(0, +v.sfx || 0)); }
} catch (e) { /* stockage indisponible */ }
function saveVolumes() { try { localStorage.setItem('holocron_vol', JSON.stringify(volumes)); } catch (e) {} }
function musicVol() { return volumes.music; }
function sfxVol() { return volumes.sfx; }
function setMusicVol(v) { volumes.music = Math.min(1, Math.max(0, v)); saveVolumes(); }
function setSfxVol(v) { volumes.sfx = Math.min(1, Math.max(0, v)); saveVolumes(); }
function audioInit() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } }

// ------------------------------ Échantillons (CC0, Kenney.nl) ------------------------------
// Chargés au premier geste utilisateur ; chaque événement pioche une variante
// au hasard avec une légère variation de hauteur. Repli : synthèse tone().
const SAMPLES = {
  pew:  ['laserSmall_000', 'laserSmall_001', 'laserSmall_002', 'laserSmall_003', 'laserSmall_004'],
  zap:  ['laserRetro_000', 'laserRetro_001', 'laserRetro_002', 'laserRetro_003', 'laserRetro_004'],
  wave: ['forceField_000', 'forceField_001', 'forceField_002'],
  boom: ['explosionCrunch_000', 'explosionCrunch_001', 'explosionCrunch_002', 'explosionCrunch_003', 'explosionCrunch_004'],
  boss: ['lowFrequency_explosion_000', 'lowFrequency_explosion_001'],
  hit:  ['impactGeneric_light_000', 'impactGeneric_light_001', 'impactGeneric_light_002', 'impactGeneric_light_003', 'impactGeneric_light_004'],
  die:  ['impactMetal_light_000', 'impactMetal_light_001', 'impactMetal_light_002', 'impactMetal_light_003', 'impactMetal_light_004'],
  hurt: ['impactMetal_medium_000', 'impactMetal_medium_001', 'impactMetal_medium_002'],
  gem:  ['impactGlass_light_000', 'impactGlass_light_001', 'impactGlass_light_002', 'impactGlass_light_003', 'impactGlass_light_004'],
};
const buffers = {};
let samplesRequested = false;
function loadSamples() {
  if (!AC || samplesRequested) return;
  samplesRequested = true;
  const base = import.meta.env.BASE_URL + 'sfx/';
  for (const key in SAMPLES) {
    buffers[key] = [];
    for (const name of SAMPLES[key]) {
      fetch(base + name + '.ogg')
        .then(r => r.arrayBuffer())
        .then(ab => AC.decodeAudioData(ab))
        .then(b => buffers[key].push(b))
        .catch(() => {}); // échantillon manquant : le repli synthé couvre
    }
  }
}
function sfxReady() { let n = 0; for (const k in buffers) n += buffers[k].length; return n; }
// anti-mitraille : les événements très fréquents ne se superposent pas à l'infini
const lastPlay = {};
function playSample(key, vol = 1, minGap = 0.03) {
  if (!AC || muted || volumes.sfx <= 0.01) return true; // coupé : ne pas déclencher le repli
  const list = buffers[key];
  if (!list || !list.length) return false;
  const now = AC.currentTime;
  if (lastPlay[key] && now - lastPlay[key] < minGap) return true;
  lastPlay[key] = now;
  const src = AC.createBufferSource();
  src.buffer = list[(Math.random() * list.length) | 0];
  src.playbackRate.value = 0.92 + Math.random() * 0.16;
  const g = AC.createGain();
  g.gain.value = vol * volumes.sfx;
  src.connect(g).connect(AC.destination);
  src.start();
  return true;
}
function tone(freq, dur, type = 'square', vol = 0.05, slide = 0) {
  if (!AC || muted || volumes.sfx <= 0.01) return;
  vol *= volumes.sfx;
  const t0 = AC.currentTime;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(AC.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
const sfx = {
  pew:   () => playSample('pew', 0.16, 0.04) || tone(920, 0.09, 'square', 0.03, -640),
  hit:   () => playSample('hit', 0.2, 0.04) || tone(180, 0.06, 'sawtooth', 0.025, -60),
  die:   () => playSample('die', 0.25, 0.05) || tone(140, 0.18, 'sawtooth', 0.04, -100),
  gem:   () => playSample('gem', 0.14, 0.05) || tone(1220, 0.07, 'sine', 0.03, 340),
  lvl:   () => { tone(523, 0.12, 'sine', 0.05); setTimeout(() => tone(659, 0.12, 'sine', 0.05), 110); setTimeout(() => tone(784, 0.2, 'sine', 0.05), 220); },
  hurt:  () => playSample('hurt', 0.5, 0.1) || tone(90, 0.22, 'sawtooth', 0.06, -40),
  wave:  () => playSample('wave', 0.35, 0.08) || tone(70, 0.4, 'sine', 0.08, 60),
  zap:   () => playSample('zap', 0.16, 0.05) || tone(1600, 0.1, 'sawtooth', 0.02, -1200),
  boss:  () => playSample('boss', 0.75, 0.2) || (tone(65, 0.7, 'sawtooth', 0.09, -15), setTimeout(() => tone(62, 0.7, 'sawtooth', 0.09, -15), 500)),
  boom:  () => playSample('boom', 0.3, 0.06) || tone(110, 0.28, 'sawtooth', 0.06, -75),
  throw: () => tone(500, 0.08, 'triangle', 0.03, -220),
};
window.addEventListener('keydown', e => { if (e.code === 'KeyM') muted = !muted; });

function toggleMute() { muted = !muted; return muted; }
function audioResume() {
  audioInit();
  if (AC && AC.state === 'suspended') AC.resume();
  loadSamples();
}
// accès pour le séquenceur musical (music.js)
function audioCtx() { return AC; }
function isMuted() { return muted; }

export { tone, sfx, audioResume, toggleMute, audioCtx, isMuted, musicVol, sfxVol, setMusicVol, setSfxVol, sfxReady };
