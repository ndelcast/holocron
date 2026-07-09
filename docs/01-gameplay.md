# Boucle de jeu

Sources : `src/update.js`, `src/lifecycle.js`, `src/levels.js` (constantes).

## Structure d'une partie

Une partie dure **20 minutes maximum** (`RUN_TIME = 1200`).

| Instant | Événement |
|---|---|
| 0:00 | Début, arme de départ du héros équipée |
| toutes les 90 s | Élite « Seigneur Sith » (voir [07-boss.md](07-boss.md)) |
| ~0:12 puis toutes les 24 s | Largage de ravitaillement si moins de 3 actifs |
| 14:50 | Annonce « Une présence puissante approche… » |
| **15:00** | **Boss final du niveau** (`FINAL_BOSS_TIME = 900`) |
| boss vaincu | Écran VICTOIRE : continuer jusqu'à 20:00 ou changer de destination |
| **20:00** | Fin de partie « SURVIE ACCOMPLIE » (victoire même sans avoir tué le boss) |

La mort du joueur → écran TERRASSÉ. Dans tous les cas, les crédits de la
partie sont bancarisés une seule fois (voir [09-progression.md](09-progression.md)).

## Conditions de fin

- **Défaite** : PV à 0 (sauf résurrection « Esprit de la Force » disponible).
- **Victoire totale** : boss final vaincu (+50 PV, choix de poursuivre).
- **Survie accomplie** : atteindre 20:00 en vie.

## Contrôles

| Plateforme | Déplacement | Pause | Son |
|---|---|---|---|
| Desktop | ZQSD / WASD / flèches (mapping physique `e.code`, compatible AZERTY) | P ou Échap | M |
| Mobile | joystick virtuel flottant (apparaît sous le pouce, course 48 px, zone morte 12 %) | bouton ⏸ | bouton ♪ |

Les attaques sont **entièrement automatiques** : le seul input est le déplacement.

## HUD

- Barre d'XP pleine largeur en haut, timer central en cartouche (doré sur la dernière minute).
- Éliminations à gauche, niveau à droite.
- Minimap radar en haut à gauche (voir [08-ravitaillements.md](08-ravitaillements.md)).
- Barre de vie graduée en bas à gauche avec valeur `PV / PV max`.
- Slots d'armes (niveau affiché) et icônes de combos actifs en bas à droite.
- Barre de vie géante du boss final en haut, flèche rouge pulsante vers lui s'il est hors champ.
- Vignette rouge pulsante sous 30 % de PV.

## Pause

La pause (P / ⏸) affiche la **liste des 7 combos** avec leur état :
actif (doré), 1/2 (cyan), verrouillé (grisé). C'est l'outil de planification
des choix de level-up.
