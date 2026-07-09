# Boucle de jeu

Sources : `src/update.js`, `src/lifecycle.js`, `src/levels.js` (constantes).

## Structure d'une partie

Le menu est en **trois écrans** : ACCUEIL (Jouer / Hangar / Options),
DESTINATION (**secteurs débloqués un par un** + **difficulté** Padawan ×1 /
Chevalier ×1,5 / Maître ×2,2), puis ÉQUIPE (salon manettes, héros). Une
partie dure **25 minutes maximum** (`RUN_TIME = 1500`), découpée en **4
challenges annoncés** (bandeau HUD sous le timer, +25 PV et un
ravitaillement à chaque palier). Boss vaincu = **splash de victoire**
(fragment persistant, déblocage du secteur suivant) puis retour au QG.
Cinq fragments = vraie fin. Le déroulé d'un secteur :

| Instant | Challenge | Événement |
|---|---|---|
| 0:00 | **1/4 SURVIE** | montée classique ; élites toutes les 90 s (une à la fois) |
| 6:00 | **2/4 L'ASSAUT** | assauts aléatoires ×1,5 plus fréquents |
| 12:30 | **3/4 LA TRAQUE** | élites toutes les 60 s |
| 19:50 | | Annonce « Une présence puissante approche… » |
| **20:00** | **4/4 LE SEIGNEUR** | **boss final du secteur** (`FINAL_BOSS_TIME = 1200`) |
| boss vaincu | | **Splash SECTEUR LIBÉRÉ** : retour au QG ou poursuivre jusqu'à 25:00 |
| **25:00** | | « SURVIE ACCOMPLIE » : retour au QG |

Les ravitaillements suivent leur cadence habituelle (~0:12 puis toutes les
24 s, 18 s en coop, 3 actifs max).

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

## Menu OPTIONS

Accessible depuis le menu principal : **langue FR / EN**, **volume musique**
et **volume effets sonores** (curseurs 0-100 %, persistés en `localStorage`
via `audio.js`). La touche <kbd>M</kbd> / le bouton ♪ restent une coupure
totale indépendante des volumes.

## Langue

Sélecteur **FR / EN** dans le menu OPTIONS (`#langsel`), persisté en `localStorage`.
Le français est la langue source du code ; `src/i18n.js` traduit toutes les
chaînes au moment de l'affichage (`t()`, repli sur le français si une
traduction manque). Les textes statiques du menu sont réécrits par
`applyStatics()`, les menus dynamiques reconstruits au changement de langue,
et les textes en jeu traduits en direct.

## Coop local (1 à 4 joueurs)

**Salon au menu** (`session.p1pad` + `session.roster`) : **Start** sur une
manette libre prend la **première place disponible — J1 d'abord**, puis
J2-J4 ; re-Start sur la manette de J1 la fait passer dans le salon (J2),
**B** libère la place. Deux manettes = un Start chacune (J1 + J2) ; clavier
+ une manette = la manette presse Start deux fois (J2), le clavier pilote
J1. J1 garde toujours le **repli clavier/tactile**, même avec une manette
attitrée. J1 choisit son héros dans la grille CHAMPION, J2-J4 avec ◄ ►.
Les **doublons de héros sont permis** (deux Jedi = deux sabres).

- Chaque joueur a ses **PV, armes, passifs et combos propres** ; l'XP, le
  niveau et les crédits sont partagés.
- À chaque niveau, **chaque joueur vivant choisit une amélioration à tour
  de rôle** (cartes étiquetées « JOUEUR n », couleur du joueur).
- Caméra au **centre de l'équipe** avec dézoom automatique pour cadrer
  tout le monde ; laisse de 480 px autour du groupe.
- Un joueur à 0 PV est **à terre** (la partie continue). Il revient de deux
  façons : le bonus **Bacta** (immédiat, 50 % PV) ou la **réanimation
  automatique au bout de 60 s** (50 % PV, 2 s d'invulnérabilité, ramené au
  centre de l'équipe ; compte à rebours affiché sur sa barre de vie).
- **Défaite immédiate quand toute l'équipe est à terre** — la réanimation
  n'opère que s'il reste au moins un joueur debout.
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
