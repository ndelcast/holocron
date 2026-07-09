// Holocron Survivors — musiques metal par destination (séquenceur WebAudio)
import { audioCtx, isMuted, musicVol } from './audio.js';

// Thèmes originaux façon metal (riffs phrygiens, chugs palm-muted, batterie
// synthétisée) — pas de reprise : les thèmes du film sont protégés.
// Un thème = tempo + pistes bouclées sur 32 doubles-croches :
//   riff  : guitare saturée grave (demi-tons relatifs à root, null = silence)
//   lead  : mélodie une octave au-dessus (clean)
//   kick / snare / hat : 1 = frappe
const _ = null;
const THEMES = {
  space: { // doom pesant, la mineur
    bpm: 100, root: 55,
    riff: [0, _, 0, _, 0, _, 3, _, 0, _, 0, _, 1, _, 0, _,
           0, _, 0, _, 0, _, 3, 5, 0, _, 0, _, 1, _, _, _],
    lead: [_, _, _, _, 12, _, _, _, _, _, _, _, _, _, _, _,
           _, _, _, _, 15, _, 14, _, 12, _, _, _, _, _, _, _],
    kick: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0,
           1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
          1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
  },
  tatooine: { // galop phrygien des sables
    bpm: 126, root: 82.41,
    riff: [0, 0, 0, _, 0, 1, _, 0, 0, 0, 0, _, 4, _, 3, 1,
           0, 0, 0, _, 0, 1, _, 0, 5, _, 4, _, 1, _, 0, _],
    lead: [_, _, _, _, _, _, _, _, 13, _, 12, _, _, _, _, _,
           _, _, _, _, _, _, _, _, 16, _, 13, _, 12, _, _, _],
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0,
           1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  deathstar: { // écrasant, mi-temps, sol grave
    bpm: 92, root: 49,
    riff: [0, _, _, _, 0, _, 3, _, _, _, 0, _, 1, _, _, _,
           0, _, _, _, 0, _, 3, _, 6, _, 5, _, 1, _, 0, _],
    lead: [12, _, _, _, _, _, _, _, _, _, _, _, 10, _, _, _,
           _, _, _, _, _, _, _, _, 13, _, _, _, 12, _, _, _],
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
           1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
          1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  },
  hoth: { // metal froid et mélodique
    bpm: 112, root: 65.41,
    riff: [0, _, 0, 0, _, 0, _, _, -2, _, -2, -2, _, -2, _, _,
           -4, _, -4, -4, _, -4, _, _, 3, _, 3, 3, _, 1, _, _],
    lead: [_, _, _, _, 12, _, 15, _, _, _, _, _, 14, _, _, _,
           _, _, _, _, 12, _, 10, _, _, _, _, _, 8, _, _, _],
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0,
           1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
          1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  },
  endor: { // punk metal bondissant, pentatonique
    bpm: 140, root: 82.41,
    riff: [0, _, 0, _, 3, _, 0, _, 5, _, 3, _, 0, _, 3, _,
           0, _, 0, _, 3, _, 0, _, 7, _, 5, _, 3, _, 0, _],
    lead: [_, _, _, _, _, _, _, _, 12, _, 15, _, 17, _, _, _,
           _, _, _, _, _, _, _, _, 19, _, 17, _, 15, _, 12, _],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
           1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};

// nœuds partagés, créés paresseusement sur le contexte audio
let shaper = null, noiseBuf = null;
function getShaper(AC) {
  if (!shaper) {
    shaper = AC.createWaveShaper();
    const n = 256, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) curve[i] = Math.tanh(4 * (i * 2 / (n - 1) - 1));
    shaper.curve = curve;
    shaper.connect(AC.destination);
  }
  return shaper;
}
function getNoise(AC) {
  if (!noiseBuf) {
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.2, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

// guitare saturée : deux dents de scie désaccordées → distorsion, chug court
function guitar(AC, freq, t, dur, vol) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(getShaper(AC));
  for (const det of [0, 6]) {
    const o = AC.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq, t);
    o.detune.setValueAtTime(det, t);
    o.connect(g);
    o.start(t); o.stop(t + dur + 0.03);
  }
}
function lead(AC, freq, t, dur, vol) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'square'; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination);
  o.start(t); o.stop(t + dur + 0.03);
}
function kick(AC, t, mv = 1) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(0.11 * mv, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g).connect(AC.destination);
  o.start(t); o.stop(t + 0.2);
}
function snare(AC, t, mv = 1) {
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = getNoise(AC);
  f.type = 'highpass'; f.frequency.value = 1400;
  g.gain.setValueAtTime(0.055 * mv, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  src.connect(f).connect(g).connect(AC.destination);
  src.start(t); src.stop(t + 0.15);
  const o = AC.createOscillator(), g2 = AC.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(190, t);
  g2.gain.setValueAtTime(0.04 * mv, t);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(g2).connect(AC.destination);
  o.start(t); o.stop(t + 0.12);
}
function hat(AC, t, mv = 1) {
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = getNoise(AC);
  f.type = 'highpass'; f.frequency.value = 6500;
  g.gain.setValueAtTime(0.018 * mv, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  src.connect(f).connect(g).connect(AC.destination);
  src.start(t); src.stop(t + 0.06);
}

// séquenceur avec anticipation : le setInterval planifie les notes ~150 ms
// en avance sur l'horloge WebAudio, insensible aux à-coups de la frame
let cur = null; // { th, step, nextT, timer }

function tick() {
  const AC = audioCtx();
  if (!AC || !cur) return;
  const th = cur.th, step = 60 / th.bpm / 4;
  while (cur.nextT < AC.currentTime + 0.15) {
    const mv = musicVol();
    if (!isMuted() && mv > 0.01) {
      const i = cur.step % 32, t = cur.nextT;
      const r = th.riff[i], l = th.lead[i];
      if (r !== null) guitar(AC, th.root * Math.pow(2, r / 12), t, step * 1.6, 0.05 * mv);
      if (l !== null) lead(AC, th.root * 4 * Math.pow(2, l / 12), t, step * 2.4, 0.014 * mv);
      if (th.kick[i]) kick(AC, t, mv);
      if (th.snare[i]) snare(AC, t, mv);
      if (th.hat[i]) hat(AC, t, mv);
    }
    cur.nextT += step; cur.step++;
  }
}

function startMusic(levelId) {
  stopMusic();
  const AC = audioCtx();
  if (!AC) return; // pas de contexte audio (appel avant le premier geste utilisateur)
  cur = { th: THEMES[levelId] || THEMES.space, step: 0, nextT: AC.currentTime + 0.15, timer: setInterval(tick, 45) };
}

function stopMusic() {
  if (!cur) return;
  clearInterval(cur.timer);
  cur = null;
}

export { startMusic, stopMusic };
