# Ravitaillements et minimap

Sources : `src/update.js` (largage, `applyBonus`), `src/render.js` (minimap,
balises), `src/gamedata.js` (`BONUSES`).

## Règles de largage

- **3 caisses maximum** simultanément sur la carte.
- Premier largage vers 0:12, puis tentative toutes les **24 s**
  (**18 s** en coop : le Bacta y sert de réanimation).
- Position : anneau de **700 à 1300 px** autour du joueur — il faut
  traverser la horde pour aller les chercher.
- Annonce « RAVITAILLEMENT LARGUÉ — SUIS LA BALISE » ; les caisses
  persistent jusqu'au ramassage (rayon de collecte : hitbox + 18 px).

## Armement lourd (récompense d'élite)

Chaque **Seigneur Sith vaincu lâche son arsenal** à l'endroit de sa mort
(si aucun engin n'est déjà en jeu) : balise dorée (monde + minimap) vers
l'engin **thématique de la destination**, actif **1 minute** une fois
enfourché (arc doré de durée restante). Un seul à la fois — battre l'élite
toutes les ~90 s est le moyen de le gagner. Sprites dédiés (`v_*` dans
`sprites.js`).

| Destination | Engin | Mécanique |
|---|---|---|
| 🌌 Espace profond | Tourelle laser | tourelle fixe, 2 tirs / 0,22 s |
| 🏜️ Tatooine | Landspeeder | véhicule rapide (350), lasers + écrasement |
| ⚫ Étoile de la Mort | Turbolaser | tourelle fixe, tir lourd (150) / 0,55 s |
| ❄️ Hoth | Snowspeeder | véhicule très rapide (370), lasers + écrasement |
| 🌲 Endor | AT-ST détourné | véhicule lent (135) mais dévastateur (95/tir, écrasement 85) |

- **Un seul pilote** : le premier joueur au contact monte à bord —
  **invulnérable**, il se déplace à la **vitesse de l'engin** (tourelles
  lentes : 115/90 ; speeders rapides : 350/370 ; AT-ST : 135) avec un feu
  automatique à 360° (2 tirs par salve pour la tourelle et l'AT-ST).
- Les speeders et l'AT-ST infligent en plus des dégâts **d'écrasement**
  au contact du châssis.
- Les dégâts des engins suivent le niveau d'équipe (`× (1 + 0,04 × niveau)`).
- À expiration (60 s) : « ARMEMENT ÉPUISÉ », les monteurs redescendent avec
  1 s d'invulnérabilité.

## Les 4 bonus

| Bonus | Couleur | Effet |
|---|---|---|
| Bacta | vert | Soigne **40 % des PV max** |
| Holocron | cyan | **Niveau supérieur immédiat** (ouvre le choix d'amélioration) |
| Bombe ionique | violet | **300 dégâts** (150 aux boss) + knockback dans un rayon de **700 px** |
| Aimant galactique | doré | Tous les cristaux de la carte volent vers le joueur (720 px/s) |

Chaque caisse est signalée en jeu par une **colonne de lumière** colorée
et un anneau pulsant au sol.

## Minimap radar

Carré à coin coupé en haut à gauche (128 px, 92 px sur mobile, décalée
sous la barre de boss).

- Portée : **1500 px** autour du joueur (point cyan central).
- Ennemis : points rouges ; élites/boss : gros points (boss final pulsant,
  plaqué au bord s'il est loin).
- **Balises de bonus** : losanges clignotants de la couleur du bonus,
  **plaqués au bord du radar** quand la caisse est hors de portée — c'est
  l'outil de navigation principal.
- Ligne de balayage animée façon radar.
