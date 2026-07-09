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

- **PV** : `PV base × (1 + t/30 × 0,16)` → ×2,6 à 5 min, ×5,8 à 15 min, ×7,4 à 20 min.
- **Cadence** : un tick d'apparition toutes les `max(0,16 ; 1,15 − 0,0032×t)` s
  (× le modificateur de densité de la destination).
- **Quantité** : `1 + floor(t/55)` ennemis par tick (jusqu'à ~22 à 20 min).
- **Plafond** : 230 ennemis vivants simultanément.

## Comportement

- Poursuite directe du joueur ; séparation approximative entre voisins
  (1 voisin aléatoire testé par frame, peu coûteux et suffisant).
- Dégâts au **contact** uniquement (invulnérabilité joueur de 0,5 s par coup).
- Knockback subi par la plupart des attaques (jamais par les boss).
- Ralentissements cumulables (champ ionique, Tempête de Force) : le plus
  fort s'applique (`e.slow`, minoré).
- Apparition sur un anneau **hors champ** : rayon `hypot(écran)/2/zoom + 80`.
