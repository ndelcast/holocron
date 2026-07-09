# Combos d'armes et passifs

Sources : `src/gamedata.js` (`COMBOS`, `PASSIVES`), effets câblés dans
`src/combat.js`, `src/effects.js`, `src/update.js`.

## Combos

Un combo s'active **automatiquement et définitivement** dès que les deux
armes requises sont possédées (peu importe leur niveau). L'activation ouvre
une **modal d'annonce** (`#combomodal`) : formule « arme + arme = combo »,
description de l'effet, bouton à exclamation aléatoire ; en coop la modal
porte la couleur du joueur concerné. Si un choix débloque deux combos d'un
coup (arme partagée), les modals s'enchaînent (`runtime.comboQueue`), puis
la file de level-up reprend. Icône dorée dans le HUD, liste consultable en
pause.

Chaque combo associe **deux armes du même arsenal** : deux combos par héros.
La liste en pause ne montre que les combos accessibles aux arsenaux de
l'équipe.

| Combo | Héros | Armes requises | Effet |
|---|---|---|---|
| ☯️ Voie du Jedi | Jedi | Sabre + Onde | Subir un coup déclenche une onde de riposte (recharge 3 s) |
| 🌪️ Tempête de Force | Jedi | Éclairs + Onde | Éclairs +3 rebonds ; cibles foudroyées ralenties de 50 % pendant 2 s |
| 💰 Chasseur de primes | Mandalorien | Gantelet + Roquettes | Chaque tir du gantelet a 20 % de chance de partir avec une roquette |
| ☄️ Inferno | Mandalorien | Lance-flammes + Roquettes | Toute explosion laisse une nappe de feu (6 dégâts/0,4 s pendant 3 s) |
| 🛩️ Escadron rogue | Contrebandier | Droïde + Blaster | Les droïdes tirent des rafales de 3 |
| 💫 Surcharge ionique | Contrebandier | Champ ionique + Arc électrique | +30 % de dégâts (toutes sources) sur les ennemis dans l'aura |
| 🪓 Guérilla d'Endor | Ewok | Lances + Tambours | Les lances explosent en fin de course (60 % des dégâts/zone du détonateur niv 0) |
| 🪤 Ruse ewok | Ewok | Fronde + Wisties | Les wisties crachent des rafales de 3 |

Avec 4 slots d'armes sur un arsenal de 5, les **2 combos du héros** sont
atteignables dans la même partie (les paires partagent souvent une arme).

## Passifs

10 passifs, **5 niveaux** chacun, **4 passifs différents maximum** par joueur
(symétrique des 4 slots d'armes) : au-delà, seuls les passifs déjà possédés
sont proposés au level-up.

| Passif | Effet par niveau |
|---|---|
| 👢 Bottes de pilote | Vitesse ×1,08 |
| 💚 Entraînement Jedi | +25 PV max et soigne 25 PV |
| 🧲 Cristal Kyber | Rayon d'aimant ×1,3 |
| 🔥 Colère maîtrisée | Dégâts ×1,12 |
| 🧘 Méditation | Recharge ×0,92 |
| 🛡️ Champ déflecteur | Dégâts subis ×0,93 |
| 💧 Bacta portatif | +0,6 PV/s de régénération |
| 🎲 Fortune du contrebandier | +10 % d'XP gagnée |
| 💨 Réflexes de pilote | +8 % d'esquive (plafond 40 %) |
| 🎯 Visée assistée | +8 % de chance de critique (dégâts ×2) |

Les multiplicatifs (vitesse, dégâts, recharge, armure) se composent entre
eux, avec le personnage et avec le hangar.
