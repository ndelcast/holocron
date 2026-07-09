# Armes

Source : `src/gamedata.js` (`WEAPONS`), tir dans `src/combat.js` (`tickWeapons`).

Règles générales :

- **4 armes maximum** par partie, **25 niveaux** chacune (`MAXLVL = 25`).
- Chaque niveau apporte une **croissance continue** (dégâts, cadence, portée)
  et tous les 5-6 niveaux un **jalon spectaculaire** (lame, tir, droïde,
  roquette supplémentaires). Au palier 25 : 6 lames, 6 tirs, 6 droïdes…
- Croissance géométrique via `g(base, taux, l) = base × taux^(l−1)`.
- Toutes les recharges sont multipliées par `player.cdMult`, tous les dégâts
  par `player.dmgMult` (appliqué dans `damageEnemy`).
- Cibles : l'ennemi le plus proche (`nearestEnemy`), sauf mention contraire.

## Les 10 armes

Valeurs « niv 1 → niv 25 » (avant `dmgMult`/`cdMult`).

### ⚔️ Sabre laser (arme de départ Jedi)
Lame verte orbitale, dégâts au contact (fenêtre de 0,28 s par ennemi).
- Dégâts `g(9, ×1,09)` : 9 → 71 ; rotation 3,5 → 5,9 rad/s
- Longueur `60 + 4×niv` : 64 → **160 px**
- **+1 lame tous les 5 niveaux** (réparties uniformément) : 6 lames au niv 25

### 🔫 Blaster (arme de départ Contrebandier)
Tir automatique sur la cible la plus proche (portée 560).
- Dégâts `g(12, ×1,07)` : 12 → 61 ; recharge `g(0,85, ×0,965)` : 0,85 → 0,37 s
- **+1 tir tous les 5 niveaux** : tir sextuple au niv 25

### 🌀 Onde de Force
Anneau expansif centré joueur, un hit par ennemi par onde, fort knockback (420).
- Dégâts `g(15, ×1,09)` : 15 → 118 ; recharge `g(4,2, ×0,97)` : 4,2 → 2,0 s
- Rayon `140 × (1 + 0,05/niv)` : 140 → **308 px**

### ⚡ Éclairs de Force
Chaîne depuis l'ennemi le plus proche (portée 420, rebond max 190 px).
- Dégâts `g(18, ×1,08)` : 18 → 114 ; recharge `g(2,6, ×0,97)` : 2,6 → 1,3 s
- **+1 rebond tous les 3 niveaux** : 2 → 10 rebonds

### 🛰️ Droïde de combat
Alliés orbitaux (rayon 52) qui tirent sur la cible la plus proche (portée 460).
- Dégâts `g(8, ×1,08)` : 8 → 51 ; cadence `g(1,1, ×0,96)` : 1,1 → 0,41 s
- **+1 droïde tous les 5 niveaux** : escadrille de 6 au niv 25

### 🏹 Lances ewoks (arme de départ Ewok)
Projectiles perforants (un hit par ennemi traversé), portée de tir 520.
- Dégâts `g(11, ×1,08)` : 11 → 70 ; recharge `g(1,25, ×0,97)` : 1,25 → 0,6 s
- **+1 lance tous les 5 niveaux** (éventail de 0,28 rad) : 6 lances au niv 25

### 🚀 Roquettes (arme de départ Mandalorien)
Explosent au premier contact ou en fin de course (AoE).
- Dégâts `g(16, ×1,08)` : 16 → 101 ; recharge `g(2,1, ×0,975)` : 2,1 → 1,15 s
- Zone `65 × (1 + 0,04/niv)` : 65 → 127 ; **+1 roquette tous les 6 niveaux** (5 au niv 24)

### 💣 Détonateur thermique
Grenade lobée sur un ennemi aléatoire (portée plafonnée à 380), explose à l'atterrissage (0,55 s de vol).
- Dégâts `g(24, ×1,08)` : 24 → 152 ; recharge `g(2,9, ×0,972)` : 2,9 → 1,47 s
- Zone `80 × (1 + 0,045/niv)` : 80 → 166 ; **+1 grenade tous les 6 niveaux**

### 🔥 Lance-flammes
Cône soutenu (±0,5 rad) vers la cible la plus proche, tick toutes les 0,18 s.
- Dégâts/tick `g(7, ×1,085)` : 7 → 49 ; recharge `g(2,4, ×0,975)` : 2,4 → 1,3 s
- Portée `130 × (1 + 0,045/niv)` : 130 → 270 ; durée du jet 0,9 → 1,55 s

### 🌐 Champ ionique
Aura permanente : dégâts toutes les 0,5 s + ralentissement continu.
- Dégâts/tick `g(4, ×1,09)` : 4 → 31 ; rayon `80 × (1 + 0,05/niv)` : 80 → **176 px**
- Ralentissement `28 % + 2 %/niv`, plafonné à **75 %**
