# Armes

Source : `src/gamedata.js` (`WEAPONS`), tir dans `src/combat.js` (`tickWeapons`).

Règles générales :

- Chaque héros possède un **arsenal exclusif de 6 armes** (`CHARS[..].pool`) :
  seules celles-ci sont proposées à son level-up — plus les **armes évoluées**
  qu'il possède (voir Évolutions).
- **4 armes maximum** par partie, **10 niveaux** chacune (`MAXLVL = 10`).
- Chaque palier est **conséquent** (+20-30 % sur une stat majeure) et tous
  les 3-4 niveaux apporte un **jalon spectaculaire** (lame, tir, droïde,
  roquette supplémentaires). Au palier 10 : 4 lames, 4 tirs, 4 droïdes…
- Croissance géométrique via `g(base, taux, l) = base × taux^(l−1)`.
- Toutes les recharges sont multipliées par `player.cdMult`, tous les dégâts
  par `player.dmgMult` (appliqué dans `damageEnemy`).
- Cibles : l'ennemi le plus proche (`nearestEnemy`), sauf mention contraire.

## Arsenaux par héros

| Héros | Départ | Arsenal |
|---|---|---|
| **Jedi** | ⚔️ Sabre laser | 🌀 Onde de Force · ⚡ Éclairs de Force · 🪃 Sabre lancé · 💠 Emprise de la Force · 💎 Éclat kyber |
| **Ewok** | 🏹 Lances ewoks | 🪨 Fronde · 🧚 Nuée de wisties · 🥁 Tambours de guerre · 🪵 Tronc roulant · 🐝 Ruche piquante |
| **Mandalorien** | 🚀 Roquettes | 🔥 Lance-flammes · 🧤 Laser de gantelet · 🧿 Mines soniques · 🕊️ Oiseaux siffleurs · 🛸 Drone traqueur |
| **Contrebandier** | 🔫 Blaster | 🛰️ Droïde de combat · 💣 Détonateur thermique · 🌐 Champ ionique · 🔌 Arc électrique · 📡 Générateur de choc |

## Évolutions (fusions)

Quand un **combo est actif** et que ses **deux armes atteignent le palier
10**, le level-up propose une carte dorée **ÉVOLUTION — FUSION**
(garantie tant qu'elle n'est pas prise) : les deux armes fondent en une
**arme légendaire** qui démarre au palier 1 et se réaméliore jusqu'au 10 —
et libère un slot d'arme. Le combo reste actif. `EVOLUTIONS` dans
`src/gamedata.js` :

| Héros | Combo (palier 10 + 10) | Arme légendaire |
|---|---|---|
| Jedi | ☯️ Voie du Jedi (Sabre + Onde) | ☀️ **Avatar de la Force** — lames géantes (jusqu'à 7) |
| Ewok | 🪓 Guérilla d'Endor (Lances + Tambours) | 🌳 **Colère de la forêt** — jusqu'à 6 lances explosives |
| Mandalorien | ☄️ Inferno (Lance-flammes + Roquettes) | 🌋 **Tempête de feu** — jusqu'à 5 roquettes lourdes |
| Contrebandier | 🛩️ Escadron rogue (Droïde + Blaster) | 🪐 **Escadre rogue** — jusqu'à 7 drones en rafale |

## Variantes d'arsenal (`type`)

Les 10 nouvelles armes réutilisent la **mécanique** d'une arme de base via
le champ `type` (le switch de `tickPlayerWeapons` porte sur `def.type ||
w.id`), avec leurs propres stats :

| Variante | Mécanique | Nuance |
|---|---|---|
| 🪃 Sabre lancé (Jedi) | `spear` (perforant) | plus lent, plus lourd (13 dégâts, cd 1,6) |
| 💠 Emprise de la Force (Jedi) | `ion` (aura) | rayon réduit (70) mais emprise jusqu'à 80 % |
| 🪨 Fronde (Ewok) | `blaster` | tir un peu plus lent que le blaster (0,9) |
| 🧚 Nuée de wisties (Ewok) | `drone` | plus faibles (7) mais cadence vive (1,0) |
| 🥁 Tambours de guerre (Ewok) | `wave` | onde plus fréquente (3,8), rayon 130 |
| 🪵 Tronc roulant (Ewok) | `rocket` | 18 dégâts, zone 70 |
| 🧤 Laser de gantelet (Mando) | `blaster` | rapide (0,7) mais léger (10) |
| 🧿 Mines soniques (Mando) | `detonator` | 20 dégâts, zone 75, cd 2,5 |
| 🕊️ Oiseaux siffleurs (Mando) | `spear` | légers (9) et fréquents (1,1) |
| 🔌 Arc électrique (Contrebandier) | `lightning` | 15 dégâts, cd 2,2, +1 rebond/niv |
| 💎 Éclat kyber (Jedi) | `rocket` | cristal explosif (17, zone 68) |
| 🐝 Ruche piquante (Ewok) | `detonator` | 22 dégâts, zone 78 |
| 🛸 Drone traqueur (Mando) | `drone` | 9 dégâts, cadence 1,05 |
| 📡 Générateur de choc (Contrebandier) | `wave` | onde 135, cd 4,0 |

## Les 10 armes de base

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
