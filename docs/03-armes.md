# Armes

Source : `src/gamedata.js` (`WEAPONS`), tir dans `src/combat.js` (`tickWeapons`).

Règles générales :

- **4 armes maximum** par partie, **10 niveaux** chacune (`MAXLVL = 10`).
- Chaque palier est **conséquent** (+20-30 % sur une stat majeure) et tous
  les 3-4 niveaux apporte un **jalon spectaculaire** (lame, tir, droïde,
  roquette supplémentaires). Au palier 10 : 4 lames, 4 tirs, 4 droïdes…
- Croissance géométrique via `g(base, taux, l) = base × taux^(l−1)`.
- Toutes les recharges sont multipliées par `player.cdMult`, tous les dégâts
  par `player.dmgMult` (appliqué dans `damageEnemy`).
- Cibles : l'ennemi le plus proche (`nearestEnemy`), sauf mention contraire.

## Les 10 armes

Valeurs « niv 1 → niv 10 » (avant `dmgMult`/`cdMult`).

### ⚔️ Sabre laser (arme de départ Jedi)
Lame verte orbitale, dégâts au contact (fenêtre de 0,28 s par ennemi).
- Dégâts `g(9, ×1,22)` : 9 → 54 ; rotation 3,65 → 5,9 rad/s
- Longueur `60 × (1 + 0,25/niv)` : 60 → **195 px** (+25 % par palier)
- **+1 lame aux niveaux 3, 6 et 9** (réparties uniformément) : 4 lames

### 🔫 Blaster (arme de départ Contrebandier)
Tir automatique sur la cible la plus proche (portée 560).
- Dégâts `g(12, ×1,18)` : 12 → 53 ; recharge `g(0,85, ×0,92)` : 0,85 → 0,4 s
- **+1 tir aux niveaux 3, 6 et 9** : tir quadruple

### 🌀 Onde de Force
Anneau expansif centré joueur, un hit par ennemi par onde, fort knockback (420).
- Dégâts `g(15, ×1,22)` : 15 → 89 ; recharge `g(4,2, ×0,93)` : 4,2 → 2,2 s
- Rayon `140 × (1 + 0,15/niv)` : 140 → **329 px**

### ⚡ Éclairs de Force
Chaîne depuis l'ennemi le plus proche (portée 420, rebond max 190 px).
- Dégâts `g(18, ×1,18)` : 18 → 80 ; recharge `g(2,6, ×0,94)` : 2,6 → 1,5 s
- **+1 rebond à chaque niveau** : 2 → 11 rebonds

### 🛰️ Droïde de combat
Alliés orbitaux (rayon 52) qui tirent sur la cible la plus proche (portée 460).
- Dégâts `g(8, ×1,18)` : 8 → 35 ; cadence `g(1,1, ×0,91)` : 1,1 → 0,47 s
- **+1 droïde aux niveaux 3, 6 et 9** : escadrille de 4

### 🏹 Lances ewoks (arme de départ Ewok)
Projectiles perforants (un hit par ennemi traversé), portée de tir 520.
- Dégâts `g(11, ×1,18)` : 11 → 49 ; recharge `g(1,25, ×0,92)` : 1,25 → 0,59 s
- **+1 lance aux niveaux 3, 6 et 9** (éventail de 0,28 rad) : 4 lances

### 🚀 Roquettes (arme de départ Mandalorien)
Explosent au premier contact ou en fin de course (AoE).
- Dégâts `g(16, ×1,2)` : 16 → 83 ; recharge `g(2,1, ×0,94)` : 2,1 → 1,2 s
- Zone `65 × (1 + 0,12/niv)` : 65 → 135 ; **+1 roquette aux niveaux 4 et 8** : 3

### 💣 Détonateur thermique
Grenade lobée sur un ennemi aléatoire (portée plafonnée à 380), explose à l'atterrissage (0,55 s de vol).
- Dégâts `g(24, ×1,2)` : 24 → 124 ; recharge `g(2,9, ×0,93)` : 2,9 → 1,5 s
- Zone `80 × (1 + 0,12/niv)` : 80 → 166 ; **+1 grenade aux niveaux 4 et 8** : 3

### 🔥 Lance-flammes
Cône soutenu (±0,5 rad) vers la cible la plus proche, tick toutes les 0,18 s.
- Dégâts/tick `g(7, ×1,19)` : 7 → 33 ; recharge `g(2,4, ×0,94)` : 2,4 → 1,4 s
- Portée `130 × (1 + 0,13/niv)` : 130 → 282 ; durée du jet 0,9 → 1,55 s

### 🌐 Champ ionique
Aura permanente : dégâts toutes les 0,5 s + ralentissement continu.
- Dégâts/tick `g(4, ×1,2)` : 4 → 21 ; rayon `80 × (1 + 0,13/niv)` : 80 → **174 px**
- Ralentissement `25 % + 5 %/niv`, plafonné à **75 %**
