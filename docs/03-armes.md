# Armes

Source : `src/gamedata.js` (`WEAPONS`), tir dans `src/combat.js` (`tickWeapons`).

Règles générales :

- **4 armes maximum** par partie, **6 niveaux** chacune (`MAXLVL = 6`).
- Le niveau 6 est pensé comme une « évolution » (gros palier).
- Toutes les recharges sont multipliées par `player.cdMult`, tous les dégâts
  par `player.dmgMult` (appliqué dans `damageEnemy`).
- Cibles : l'ennemi le plus proche (`nearestEnemy`), sauf mention contraire.

## Les 10 armes

### ⚔️ Sabre laser (arme de départ Jedi)
Lame verte orbitale, dégâts au contact (fenêtre de 0,28 s par ennemi).
- Dégâts : `9 × [1, 1.4, 1.4, 1.4, 1.4, 2.2] × (1 + 0,12/niv)`
- Longueur 68 → **88** (niv 4) ; rotation 3,5 → **4,6 rad/s** (niv 3)
- **Seconde lame** opposée au niveau 5

### 🔫 Blaster (arme de départ Contrebandier)
Tir automatique sur la cible la plus proche (portée 560).
- Dégâts 12 (×1,5 niv 4) ; recharge 0,85 s (×0,75 niv 2, ×0,65 niv 6)
- Tir **double** niv 3, **triple** niv 5

### 🌀 Onde de Force
Anneau expansif centré joueur, un hit par ennemi par onde, fort knockback (420).
- Dégâts 15 (×1,5 niv 3, ×1,6 niv 6) ; recharge 4,2 s (×0,75 niv 4)
- Rayon 150 (×1,25 niv 2, ×1,3 niv 5)

### ⚡ Éclairs de Force
Chaîne depuis l'ennemi le plus proche (portée 420, rebond max 190 px).
- Dégâts 18 (×1,4 niv 3, ×1,7 niv 6) ; recharge 2,6 s (×0,7 niv 5)
- Rebonds : 2, +1 niv 2, +2 niv 4

### 🛰️ Droïde de combat
Alliés orbitaux (rayon 52) qui tirent sur la cible la plus proche (portée 460).
- Dégâts 8 (×1,5 niv 4) ; cadence 1,1 s (×0,7 niv 2, ×0,6 niv 6)
- **2 droïdes** niv 3, **3 droïdes** niv 5

### 🏹 Lances ewoks (arme de départ Ewok)
Projectiles perforants (un hit par ennemi traversé), portée de tir 520.
- Dégâts 11 (×1,3 niv 2, ×1,6 niv 6) ; recharge 1,25 s (×0,75 niv 4)
- **2 lances** niv 3, **3 lances** niv 5 (éventail de 0,28 rad)

### 🚀 Roquettes (arme de départ Mandalorien)
Explosent au premier contact ou en fin de course (AoE).
- Dégâts 16 (×1,5 niv 3, ×1,4 niv 6) ; recharge 2,1 s (×0,75 niv 4)
- Zone 70 (×1,3 niv 2, ×1,4 niv 6) ; **2 roquettes** niv 5

### 💣 Détonateur thermique
Grenade lobée sur un ennemi aléatoire (portée plafonnée à 380), explose à l'atterrissage (0,55 s de vol).
- Dégâts 24 (×1,4 niv 2, ×1,4 niv 6) ; recharge 2,9 s (×0,75 niv 4)
- Zone 85 (×1,3 niv 3, ×1,4 niv 6) ; **2 grenades** niv 5

### 🔥 Lance-flammes
Cône soutenu (±0,5 rad) vers la cible la plus proche, tick toutes les 0,18 s.
- Dégâts/tick 7 (×1,35 niv 2, ×1,6 niv 6) ; recharge 2,4 s (×0,75 niv 5)
- Portée 140 (×1,3 niv 3) ; durée du jet 0,9 s (×1,4 niv 4)

### 🌐 Champ ionique
Aura permanente : dégâts toutes les 0,5 s + ralentissement continu.
- Dégâts/tick 4 (×1,5 niv 3, ×1,6 niv 6) ; rayon 85 (×1,25 niv 2, ×1,3 niv 5)
- Ralentissement 30 % (**45 %** niv 4)
