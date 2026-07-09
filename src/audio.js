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
  pew:   () => tone(920, 0.09, 'square', 0.03, -640),
  hit:   () => tone(180, 0.06, 'sawtooth', 0.025, -60),
  die:   () => tone(140, 0.18, 'sawtooth', 0.04, -100),
  gem:   () => tone(1220, 0.07, 'sine', 0.03, 340),
  lvl:   () => { tone(523, 0.12, 'sine', 0.05); setTimeout(() => tone(659, 0.12, 'sine', 0.05), 110); setTimeout(() => tone(784, 0.2, 'sine', 0.05), 220); },
  hurt:  () => tone(90, 0.22, 'sawtooth', 0.06, -40),
  wave:  () => tone(70, 0.4, 'sine', 0.08, 60),
  zap:   () => tone(1600, 0.1, 'sawtooth', 0.02, -1200),
  boss:  () => { tone(65, 0.7, 'sawtooth', 0.09, -15); setTimeout(() => tone(62, 0.7, 'sawtooth', 0.09, -15), 500); },
  boom:  () => tone(110, 0.28, 'sawtooth', 0.06, -75),
  throw: () => tone(500, 0.08, 'triangle', 0.03, -220),
};
window.addEventListener('keydown', e => { if (e.code === 'KeyM') muted = !muted; });

function toggleMute() { muted = !muted; return muted; }
function audioResume() {
  audioInit();
  if (AC && AC.state === 'suspended') AC.resume();
}
// accès pour le séquenceur musical (music.js)
function audioCtx() { return AC; }
function isMuted() { return muted; }

export { tone, sfx, audioResume, toggleMute, audioCtx, isMuted, musicVol, sfxVol, setMusicVol, setSfxVol };
