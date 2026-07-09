# Architecture

Stack : vanilla JS (modules ES), canvas 2D, Vite. Aucune dépendance runtime.

## Modules (`src/`)

Chargés via `main.js` (point d'entrée, expose `window.HS` pour debug/tests).

| Module | Rôle |
|---|---|
| `core.js` | canvas, viewport (`view` : w/h/dpr/zoom, basé sur `visualViewport`), utilitaires (`rand`, `clamp`, `dist2`, `angleDiff`, `pick`) |
| `state.js` | **état mutable partagé** : `S` (partie), `player`, `session` (sélections menu), `runtime` (compteurs), tableaux d'entités |
| `gamedata.js` | définitions : armes, passifs, combos, personnages, bonus |
| `levels.js` | destinations, boss, tuiles de sol procédurales, constantes de temps |
| `meta.js` | crédits persistants (`localStorage`), coûts du hangar |
| `sprites.js` | sprites pré-rendus en canvas (2× pour la netteté) |
| `background.js` | étoiles, nébuleuses, constante `TILE` (1400) |
| `audio.js` | sons synthétisés WebAudio (aucun asset) |
| `input.js` | clavier (`keys`) + joystick tactile (`touch`) |
| `enemies.js` | apparition, types, IA des boss |
| `effects.js` | particules, anneaux, flashs, fantômes, `damageEnemy`/`hurtPlayer` |
| `combat.js` | tick des armes, projectiles joueur, explosions |
| `levelup.js` | XP, choix d'améliorations, listes UI (combos, slots) |
| `update.js` | simulation par frame, projectiles ennemis, bonus, HUD |
| `render.js` | rendu complet de la scène (voir [11-rendu-et-da.md](11-rendu-et-da.md)) |
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

Scènes : `menu | play | levelup | victory | gameover` (+ `paused`).

## Tests

Pas de framework : tests de régression **headless** (Chrome
`--headless=new` + `--virtual-time-budget`) pilotés via `window.HS`
(simulation d'updates, clics DOM, captures d'écran). Voir l'historique
des commits pour les harnais utilisés.
