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

## Armement lourd (largages événement)

Toutes les **~3 minutes** (`S.vehT`, premier largage vers 2:10-3:10), une
caisse spéciale est larguée avec balise dorée (monde + minimap) : l'engin
**thématique de la destination**, actif **2 minutes** une fois enfourché
(arc doré de durée restante autour de l'engin). Un seul à la fois.

| Destination | Engin | Mécanique |
|---|---|---|
| 🌌 Espace profond | Tourelle laser | tourelle fixe, 2 tirs / 0,22 s |
| 🏜️ Tatooine | Landspeeder | véhicule rapide (350), lasers + écrasement |
| ⚫ Étoile de la Mort | Turbolaser | tourelle fixe, tir lourd (150) / 0,55 s |
| ❄️ Hoth | Snowspeeder | véhicule très rapide (370), lasers + écrasement |
| 🌲 Endor | AT-ST détourné | véhicule lent (135) mais dévastateur (95/tir, écrasement 85) |

- **Tourelle** : un seul joueur monte (contact), il est **immobile et
  invulnérable**, feu automatique à 360° dans la portée.
- **Véhicule** : le premier joueur au contact devient **conducteur** (vitesse
  de l'engin) ; les équipiers **embarquent au contact** et sont arrimés,
  tous invulnérables. Un laser automatique **par monteur**, plus des dégâts
  d'écrasement au contact du châssis.
- Les dégâts des engins suivent le niveau d'équipe (`× (1 + 0,04 × niveau)`).
- À expiration : « ARMEMENT ÉPUISÉ », les monteurs redescendent avec 1 s
  d'invulnérabilité.

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
