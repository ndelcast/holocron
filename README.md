# Holocron Survivors

Survivor-like (type *Vampire Survivors*) sur le thème Star Wars — vanilla JS + PixiJS (WebGL), sprites et sons 100 % procéduraux.

🎮 **Jouer : [ndelcast.github.io/holocron](https://ndelcast.github.io/holocron/)** (desktop et mobile)
📚 **Spécifications complètes : [docs/](docs/README.md)**

## Lancer

```bash
npm install
npm run dev        # serveur de dev Vite → http://localhost:5173
npm run build      # build de production dans dist/
npm run preview    # sert le build de production
```

## Jouer

- **ZQSD** ou flèches pour se déplacer, attaques automatiques
- **P** : pause + liste des combos d'armes · **M** : couper le son
- Partie de **20 minutes** ; le boss du niveau surgit à **15:00**
- Les crédits gagnés se dépensent au **Hangar** (améliorations permanentes, sauvegardées en `localStorage`)

## Architecture

```
index.html          markup (les overlays UI)
src/
├── main.js         point d'entrée, expose window.HS (debug/tests)
├── style.css
├── core.js         canvas, viewport (view), utilitaires
├── state.js        état mutable partagé : S, player, session, runtime, entités
├── gamedata.js     armes, passifs, combos, personnages
├── levels.js       destinations, boss associés, sols procéduraux
├── meta.js         crédits persistants, coûts du hangar
├── sprites.js      sprites pré-rendus en canvas
├── background.js   étoiles, nébuleuses
├── audio.js        sons synthétisés WebAudio
├── input.js        clavier
├── enemies.js      apparition, IA des boss
├── effects.js      particules, flashs, dégâts (damageEnemy / hurtPlayer)
├── combat.js       tick des armes, projectiles, explosions
├── levelup.js      XP, choix d'améliorations
├── update.js       simulation par frame, HUD
├── render.js       rendu de la scène
├── lifecycle.js    boucle rAF, début/fin de partie, pause
└── ui.js           menus (héros, destinations, hangar)
```

Convention : l'état mutable partagé vit dans des objets exportés (`S`, `player`, `session`, `runtime`) ou des tableaux constants vidés sur place — jamais de réassignation d'un binding importé.
