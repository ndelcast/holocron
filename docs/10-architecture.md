# Architecture

Stack : vanilla JS (modules ES), **PixiJS (WebGL)** + pixi-filters, Vite.

## Modules (`src/`)

Chargés via `main.js` (point d'entrée, expose `window.HS` pour debug/tests).

| Module | Rôle |
|---|---|
| `core.js` | viewport (`view` : w/h/dpr/zoom, basé sur `visualViewport`), utilitaires (`rand`, `clamp`, `dist2`, `angleDiff`, `pick`) |
| `state.js` | **état mutable partagé** : `S` (partie), `players[]` (équipe 1-4, chacun avec armes/passifs/combos), `campaign` (fragments, secteur), helpers (`alivePlayers`, `nearestPlayer`, `teamCenter`), `session`, `runtime`, tableaux d'entités |
| `gamedata.js` | définitions : armes, passifs, combos, personnages, bonus |
| `levels.js` | destinations, boss, tuiles de sol procédurales, constantes de temps |
| `meta.js` | crédits persistants (`localStorage`), coûts du hangar |
| `i18n.js` | bilingue FR/EN : `t()` traduit à l'affichage (le français reste la source dans le code), textes statiques du menu, langue persistée |
| `sprites.js` | sprites pré-rendus en canvas (2× pour la netteté) |
| `background.js` | étoiles, nébuleuses, constante `TILE` (1400) |
| `audio.js` | effets : échantillons Kenney.nl (CC0) + Pixabay (sabre, laser, level-up, braam) dans `public/sfx/`, variantes + pitch aléatoire, anti-mitraille, repli synthé WebAudio ; volumes persistés |
| `music.js` | musiques par destination : pistes de Luis Humanoide (Pixabay, `public/music/`) en boucle, repli séquenceur WebAudio |
| `input.js` | clavier (`keys`) + joystick tactile (`touch`) |
| `enemies.js` | apparition, types, IA des boss |
| `effects.js` | particules, anneaux, flashs, fantômes, `damageEnemy`/`hurtPlayer` |
| `combat.js` | tick des armes, projectiles joueur, explosions |
| `levelup.js` | XP, choix d'améliorations, listes UI (combos, slots) |
| `update.js` | simulation par frame, projectiles ennemis, bonus, HUD |
| `render.js` | renderer PixiJS : scene graph synchronisé chaque frame depuis l'état (voir [11-rendu-et-da.md](11-rendu-et-da.md)) |
| `lifecycle.js` | boucle rAF, début/fin de partie, pause, ralenti (`S.freeze`) |
| `ui.js` | menus (héros, destinations, hangar), boutons tactiles |

## Conventions d'état

Les imports ES étant en lecture seule :

- L'état mutable partagé vit dans des **objets exportés** (`S`, `player`,
  `session`, `runtime`, `view`, `screenFlash`) dont on mute les propriétés.
- Les tableaux d'entités sont des **`const` vidés sur place**
  (`arr.length = 0`) au reset — jamais réassignés.
- Cycles d'import (`effects` ↔ `lifecycle`, etc.) : uniquement des appels
  de fonctions à l'exécution, jamais pendant l'évaluation des modules.

## Boucle principale (`lifecycle.js`)

```
frame(rawDt borné à [0, 50 ms])
├── décroissance : screenFlash, zoomKick
├── S.freeze > 0 → dt × 0,15 (ralenti dramatique)
├── scene === 'play' && !paused → update(dt)
└── render()  (toujours : le fond anime aussi les menus)
```

Scènes : `menu | play | levelup | combo | victory | gameover` (+ `paused`).

## Tests

Pas de framework : tests de régression **headless** (Chrome
`--headless=new` + `--virtual-time-budget`) pilotés via `window.HS`
(simulation d'updates, clics DOM, captures d'écran). Voir l'historique
des commits pour les harnais utilisés.

## Historique renderer

Le jeu a d'abord été rendu en canvas 2D immédiat (voir l'historique git,
`src/render.js` avant le merge de la branche `pixi`). Le passage à PixiJS
a été validé par benchmark (`?stress=N&fps=1`) : à parité de FPS sur
desktop, il a été retenu pour anticiper les évolutions (hordes plus
denses, shaders, éclairage). Le renderer expose la même API `render()` ;
la simulation ne connaît pas Pixi.
