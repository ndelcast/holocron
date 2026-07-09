# Boucle de jeu

Sources : `src/update.js`, `src/lifecycle.js`, `src/levels.js` (constantes).

## Structure d'une partie

Une partie est une **campagne** (voir [00-lore.md](00-lore.md)) : des
secteurs de **20 minutes maximum** chacun (`RUN_TIME = 1200`), enchaînés
par saut hyperespace en conservant build et niveau. Boss vaincu = fragment
d'holocron ; cinq fragments = vraie fin. Le déroulé d'un secteur :

| Instant | Événement |
|---|---|
| 0:00 | Début, arme de départ du héros équipée |
| toutes les 90 s | Élite « Seigneur Sith » (voir [07-boss.md](07-boss.md)) |
| ~0:12 puis toutes les 24 s (18 s en coop) | Largage de ravitaillement si moins de 3 actifs |
| 14:50 | Annonce « Une présence puissante approche… » |
| **15:00** | **Boss final du secteur** (`FINAL_BOSS_TIME = 900`) |
| boss vaincu | Écran SECTEUR LIBÉRÉ : **saut hyperespace** vers un secteur restant, poursuivre jusqu'à 20:00, ou abandonner la route |
| **20:00** | « SURVIE ACCOMPLIE » : saut possible si le fragment est acquis, sinon la route s'arrête |

La mort de l'équipe → écran TERRASSÉ (fragments perdus). Dans tous les cas,
les crédits sont bancarisés incrémentalement (voir [09-progression.md](09-progression.md)).

## Conditions de fin

- **Défaite** : PV à 0 (sauf résurrection « Esprit de la Force » disponible).
- **Secteur libéré** : boss vaincu (+50 PV, fragment n/5, saut disponible).
- **Vraie fin** : cinq fragments réunis — « L'HOLOCRON RENAÎT ».
- **Survie accomplie** : atteindre 20:00 en vie ; sans le fragment du
  secteur, la campagne s'arrête là.

## Contrôles

| Entrée | Déplacement | Pause | Son |
|---|---|---|---|
| Manette attitrée | pilote le joueur qui a rejoint le salon avec elle (stick gauche ou croix, zone morte 25 %) | Start | — |
| Clavier | ZQSD / WASD / flèches (mapping physique `e.code`, compatible AZERTY) — pilote **J1** ; à défaut J1 peut aussi utiliser la première **manette libre** | P / Échap | M |
| Mobile | joystick virtuel flottant (course 48 px, zone morte 12 %) — pilote J1 | bouton ⏸ | bouton ♪ |

Au level-up, **le joueur dont c'est le tour** navigue dans les cartes avec
sa manette (◄ ► puis A) ou au clavier (flèches + Entrée) s'il n'en a pas.
La modal de combo se ferme avec A / Entrée.

Les attaques sont **entièrement automatiques** : le seul input est le déplacement.

## Coop local (1 à 4 joueurs)

**Salon au menu** (`session.roster`) : J2-J4 rejoignent en appuyant sur
**A** (ou Start) sur leur manette, choisissent leur héros avec ◄ ► et
quittent avec **B**. J1 choisit le sien dans la grille CHAMPION (clavier,
souris ou tactile). Les **doublons de héros sont permis** (deux Jedi = deux
sabres). La taille d'équipe découle des manettes présentes dans le salon.

- Chaque joueur a ses **PV, armes, passifs et combos propres** ; l'XP, le
  niveau et les crédits sont partagés.
- À chaque niveau, **chaque joueur vivant choisit une amélioration à tour
  de rôle** (cartes étiquetées « JOUEUR n », couleur du joueur).
- Caméra au **centre de l'équipe** avec dézoom automatique pour cadrer
  tout le monde ; laisse de 480 px autour du groupe.
- Un joueur à 0 PV est **à terre** (la partie continue) ; le bonus **Bacta
  le réanime à 50 %**. Défaite quand toute l'équipe est à terre.
- Les ennemis et boss ciblent le joueur vivant **le plus proche** ; les
  soins de boss vaincus profitent à toute l'équipe.
- Couleurs : J1 cyan, J2 or, J3 vert, J4 rouge (barres de PV, halos, minimap).

### Équilibrage coop

Facteurs fixés au lancement d'après la taille d'équipe choisie au menu
(ils ne baissent pas si un joueur tombe) — voir `coop*Mult()` dans `src/state.js` :

| Joueurs | Densité de vagues | PV ennemis | PV élites et boss | Seuils d'XP | Plafond d'ennemis (base) |
|---|---|---|---|---|---|
| 1 | ×1 | ×1 | ×1 | ×1 | 230 |
| 2 | ×1,5 | ×1,25 | ×1,7 | ×1,5 | 270 |
| 3 | ×2 | ×1,5 | ×2,4 | ×2 | 310 |
| 4 | ×2,5 | ×1,75 | ×3,1 | ×2,5 | 350 |

Ces facteurs se composent avec la montée liée au **niveau d'équipe**
(densité, PV et plafond grimpent avec `S.level`, plafond max 650 —
voir [06-ennemis.md](06-ennemis.md)).

À 4 joueurs, la « masse » d'ennemis (densité × PV) vaut ≈ ×4,4 face à un DPS
d'équipe ≈ ×4. Les boss scalent plus fort que les vagues car ils encaissent le
burst concentré de toute l'équipe. Les seuils d'XP suivent la densité : l'afflux
de cristaux par minute augmente d'autant et chaque niveau distribue déjà un
choix par joueur vivant, donc chaque joueur progresse au rythme du solo.
Les ravitaillements passent de 24 s à **18 s** en coop (le Bacta sert de réanimation).

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
