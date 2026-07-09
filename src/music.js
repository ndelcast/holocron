// Holocron Survivors — musiques d'ambiance par destination (séquenceur WebAudio)
import { audioCtx, isMuted } from './audio.js';

// Un thème = tempo + deux voix bouclées sur 2 mesures (32 doubles-croches).
// Les hauteurs sont des demi-tons relatifs à la fondamentale `root` (en Hz),
// null = silence ; le lead joue une octave au-dessus de la basse. Mélodies
// originales, mixées bas pour laisser la place aux bruitages.
const _ = null;
const THEMES = {
  space: { // nappe mystérieuse en la mineur
    bpm: 72, root: 110, bassType: 'triangle', leadType: 'sine', bassVol: 0.035, leadVol: 0.022,
    bass: [0, _, _, _, _, _, _, _, -5, _, _, _, _, _, _, _,
           -2, _, _, _, _, _, _, _, -4, _, _, _, _, _, _, _],
    lead: [_, _, 12, _, _, _, _, 15, _, _, _, _, 19, _, _, _,
           _, _, 17, _, _, _, _, _, 24, _, _, 19, _, _, _, _],
  },
  tatooine: { // marche des sables, couleur phrygienne
    bpm: 92, root: 87.31, bassType: 'triangle', leadType: 'square', bassVol: 0.04, leadVol: 0.013,
    bass: [0, _, 0, _, -5, _, 0, _, 0, _, 0, _, -4, _, -5, _,
           0, _, 0, _, -5, _, 0, _, 1, _, 0, _, -5, _, _, _],
    lead: [12, _, _, 13, _, _, 12, _, _, 16, _, _, 12, _, 13, _,
           _, _, 17, _, 16, _, 13, _, 12, _, _, _, _, _, _, _],
  },
  deathstar: { // marche menaçante en sol mineur
    bpm: 104, root: 98, bassType: 'sawtooth', leadType: 'square', bassVol: 0.026, leadVol: 0.011,
    bass: [0, _, 0, _, 0, _, _, 0, 0, _, 0, _, -4, _, -2, _,
           0, _, 0, _, 0, _, _, 0, 3, _, -4, _, 0, _, _, _],
    lead: [12, _, _, _, _, _, 10, _, 8, _, _, _, _, _, _, _,
           12, _, _, _, _, _, 15, _, 14, _, _, _, _, _, _, _],
  },
  hoth: { // froid cristallin, lent et aérien
    bpm: 64, root: 130.81, bassType: 'sine', leadType: 'sine', bassVol: 0.04, leadVol: 0.02,
    bass: [0, _, _, _, _, _, _, _, -5, _, _, _, _, _, _, _,
           -3, _, _, _, _, _, _, _, -5, _, _, _, _, _, _, _],
    lead: [_, _, _, 19, _, _, _, _, _, 24, _, _, _, _, 22, _,
           _, _, _, 19, _, _, _, _, _, 26, _, _, _, _, _, _],
  },
  endor: { // groove forestier, pentatonique bondissante
    bpm: 116, root: 82.41, bassType: 'triangle', leadType: 'square', bassVol: 0.04, leadVol: 0.012,
    bass: [0, _, _, 0, _, _, 0, _, 5, _, _, 5, _, _, 3, _,
           0, _, _, 0, _, _, 0, _, 7, _, 5, _, 3, _, _, _],
    lead: [12, _, 15, _, 17, _, _, 15, _, 12, _, _, 15, _, 17, _,
           19, _, 17, _, 15, _, 12, _, 10, _, 12, _, _, _, _, _],
  },
};

// séquenceur avec anticipation : le setInterval planifie les notes ~150 ms
// en avance sur l'horloge WebAudio, insensible aux à-coups de la frame
let cur = null; // { th, step, nextT, timer }

function note(freq, t, dur, type, vol) {
  const AC = audioCtx();
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination);
  o.start(t); o.stop(t + dur + 0.03);
}

function tick() {
  const AC = audioCtx();
  if (!AC || !cur) return;
  const th = cur.th, step = 60 / th.bpm / 4;
  while (cur.nextT < AC.currentTime + 0.15) {
    if (!isMuted()) {
      const b = th.bass[cur.step % th.bass.length];
      const l = th.lead[cur.step % th.lead.length];
      if (b !== null) note(th.root * Math.pow(2, b / 12), cur.nextT, step * 3.2, th.bassType, th.bassVol);
      if (l !== null) note(th.root * 2 * Math.pow(2, l / 12), cur.nextT, step * 1.8, th.leadType, th.leadVol);
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
