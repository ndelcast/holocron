# Combos d'armes et passifs

Sources : `src/gamedata.js` (`COMBOS`, `PASSIVES`), effets câblés dans
`src/combat.js`, `src/effects.js`, `src/update.js`.

## Combos

Un combo s'active **automatiquement et définitivement** dès que les deux
armes requises sont possédées (peu importe leur niveau). Annonce à l'écran,
icône dorée dans le HUD, liste consultable en pause.

| Combo | Armes requises | Effet |
|---|---|---|
| ☯️ Voie du Jedi | Sabre + Onde | Subir un coup déclenche une onde de riposte (recharge 3 s) |
| 💰 Chasseur de primes | Blaster + Roquettes | Chaque tir de blaster a 20 % de chance de partir avec une roquette |
| 🌪️ Tempête de Force | Éclairs + Onde | Éclairs +3 rebonds ; les cibles foudroyées sont ralenties de 50 % pendant 2 s |
| 🛩️ Escadron rogue | Droïde + Blaster | Les droïdes tirent des rafales de 3 |
| 🪵 Guérilla d'Endor | Lances + Détonateur | Les lances explosent en fin de course (60 % des dégâts/zone du détonateur) |
| ☄️ Inferno | Lance-flammes + Roquettes | Toute explosion laisse une nappe de feu (6 dégâts/0,4 s pendant 3 s) |
| 💫 Surcharge ionique | Champ ionique + Éclairs | +30 % de dégâts (toutes sources) sur les ennemis dans l'aura |

Avec 4 slots d'armes, **2 combos maximum** par partie (3 si les paires
partagent une arme, ex. Blaster dans Chasseur de primes + Escadron rogue).

## Passifs

10 passifs, **5 niveaux** chacun, cumulables sans limite de slots.

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
