# Ravitaillements et minimap

Sources : `src/update.js` (largage, `applyBonus`), `src/render.js` (minimap,
balises), `src/gamedata.js` (`BONUSES`).

## Règles de largage

- **3 caisses maximum** simultanément sur la carte.
- Premier largage vers 0:12, puis tentative toutes les **24 s**.
- Position : anneau de **700 à 1300 px** autour du joueur — il faut
  traverser la horde pour aller les chercher.
- Annonce « RAVITAILLEMENT LARGUÉ — SUIS LA BALISE » ; les caisses
  persistent jusqu'au ramassage (rayon de collecte : hitbox + 18 px).

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
