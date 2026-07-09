# Ennemis

Sources : `src/enemies.js` (`ETYPES`, `spawnEnemy`, `pickEnemyType`),
`src/update.js` (cadence d'apparition).

## Paliers

| Palier | Hitbox | PV base | Vitesse | Dégâts contact | XP | Apparaît à | Poids de tirage |
|---|---|---|---|---|---|---|---|
| Basique (trooper) | 12 | 12 | 52 | 8 | 1 | 0:00 | 10 |
| Rapide (droid) | 10 | 7 | 88 | 6 | 1 | 0:40 | 6 |
| Moyen (probe) | 13 | 30 | 42 | 11 | 3 | 1:50 | 3,5 |
| Tank (droideka) | 16 | 70 | 34 | 15 | 6 | 3:20 | 2 |

La vitesse individuelle varie de ±10 %, puis est multipliée par le
modificateur de la destination.

## Montée en difficulté

La difficulté suit **le temps et le niveau d'équipe** : monter haut (~45-55)
déclenche la horde, pour que les armes à 10 paliers aient de quoi faucher.

- **PV** : `PV base × (1 + t/30 × 0,16) × (1 + 0,035 × niveau)` × le facteur
  coop `1 + 0,25×(joueurs − 1)`. Au niveau 75 le facteur niveau vaut ×3,6.
- **Cadence** : un tick d'apparition toutes les `max(0,16 ; 1,15 − 0,0032×t)` s
  (× le modificateur de densité de la destination).
- **Quantité** : `(1 + floor(t/55)) × (1 + 0,5×(joueurs − 1)) × (1 + 0,03 × niveau)`
  ennemis par tick ; la fraction est reportée au tick suivant (`S.spawnAcc`).
- **Plafond** : `min(650 ; 230 + 4×niveau + 40×(joueurs − 1))` ennemis vivants
  simultanément (530 au niveau 75 en solo).

## Comportement

- Poursuite directe du joueur ; séparation approximative entre voisins
  (1 voisin aléatoire testé par frame, peu coûteux et suffisant).
- Dégâts au **contact** uniquement (invulnérabilité joueur de 0,5 s par coup).
- Knockback subi par la plupart des attaques (jamais par les boss).
- Ralentissements cumulables (champ ionique, Tempête de Force) : le plus
  fort s'applique (`e.slow`, minoré).
- Apparition sur un anneau **hors champ** : rayon `hypot(écran)/2/zoom + 80`.
