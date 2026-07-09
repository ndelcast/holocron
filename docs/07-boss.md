# Boss

Sources : `src/enemies.js` (`spawnFinalBoss`, `bossAI`), `src/levels.js` (`BOSSES`).

## Élite récurrente : le Seigneur Sith

Toutes les **90 s** (suspendu pendant le duel final).
PV `380 × (1 + t/70)`, vitesse 62, dégâts 26, XP 40.
À sa mort : **+30 PV** au joueur, ralenti dramatique court, anneau doré.

## Boss finaux (15:00)

Annonce à 14:50, bannière + flash rouge + ralenti à l'apparition.
Barre de vie géante dans le HUD, flèche directionnelle si hors champ.
À la mort : +50 PV, 160 XP en cristaux, ralenti long, flash blanc, écran VICTOIRE.

| Boss | Destination | PV | Vitesse | Dégâts | Hitbox |
|---|---|---|---|---|---|
| Dark Maul | Espace profond | 2400 | 100 | 30 | 21 |
| Jabba le Hutt | Tatooine | 4000 | 30 | 36 | 30 |
| Dark Vador | Étoile de la Mort | 3000 | 58 | 32 | 24 |
| Boba Fett | Hoth | 2200 | 85 | 26 | 19 |
| L'Empereur | Endor | 2600 | 50 | 30 | 21 |

## Patterns IA (`bossAI`)

- **Dark Maul** — mêlée rapide, sabre double rotatif (visuel). Toutes les
  4,2 s à moins de 440 px : télégraphe « ! » (0,55 s d'immobilité) puis
  **charge** à 640 px/s pendant 0,5 s.
- **Jabba** — tank lent. Toutes les 3,4 s : **crachat** de 3 glaires en
  éventail (18 dégâts, 260 px/s). Toutes les 9 s : **renforts** (4 troopers/droïdes).
- **Dark Vador** — toutes les 5 s : **lancer de sabre** boomerang (24 dégâts,
  340 px/s, revient vers lui après 1,05 s, traverse le joueur). Toutes les
  9 s (entre 130 et 480 px) : **Poigne de la Force**, attire le joueur à
  250 px/s pendant 0,9 s.
- **Boba Fett** — maintient la distance au jetpack (approche > 330 px,
  recule < 230 px, sinon orbite). Toutes les 3,2 s : **salve de 3 roquettes**
  (20 dégâts, zone 60, explosent au contact ou en fin de course).
- **L'Empereur** — garde ses distances (300/210 px). Toutes les 3,4 s :
  **éventail de 5 éclairs** (14 dégâts chacun, 420 px/s, écart 0,13 rad).

Les projectiles des boss sont gérés par `ebullets` (`src/update.js`) et
respectent l'esquive, l'armure et l'invulnérabilité du joueur.
