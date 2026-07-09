# Boss

Sources : `src/enemies.js` (`spawnFinalBoss`, `bossAI`), `src/levels.js` (`BOSSES`).

## Élites récurrentes : les seigneurs (sous-boss)

Toutes les **90 s** (60 s pendant LA TRAQUE, challenge 3/4 ; suspendu
pendant le duel final), un sous-boss tiré au sort parmi ceux que le
**niveau d'équipe** a débloqués (`ELITES`, `pickElite`). **Un boss à la
fois** : tant que l'élite précédente vit, la suivante attend sa mort. PV `380 × mult × (1 + t/70) × (1 + 0,03 × niveau) × facteur
coop × secteur` ; dégâts `× (1 + 0,02 × niveau)` — de plus en plus
puissants à mesure que le build monte.

Quatre **archétypes d'IA** (`ELITES`), incarnés différemment sur chaque
destination (`ELITE_SETS` — toujours 4 figures par niveau, sprites du
bestiaire local grossis ×1,35) :

| Archétype | Dès le niv | PV | Comportement |
|---|---|---|---|
| ⚔️ Chargeur | 0 | ×1 | poursuite + **charge-frappe** télégraphiée (`!`, 480 px/s) |
| 🌀 Lanceur | 6 | ×0,8 | garde ses distances, **lance sa lame boomerang** (3,5 s) |
| 🔨 Colosse | 12 | ×1,9 | lent et massif, **coup de zone** (150 px, télégraphe 0,7 s) |
| ⚡ Caster | 18 | ×0,7 | kite à distance, **volées de 3 éclairs** (3 s) |

| Destination | Chargeur | Lanceur | Colosse | Caster |
|---|---|---|---|---|
| 🌌 Espace | Seigneur Sith | Inquisiteur | Colosse sith | Adepte obscur |
| 🏜️ Tatooine | Chef tusken | Chasseur rodien | Brute gamorréenne | Sorcier jawa |
| ⚫ Étoile de la Mort | Garde royal | Inquisiteur | Sentinelle pourpre | Officier ISB |
| ❄️ Hoth | Commando des neiges | Sonde assassine | Wampa alpha | Adepte des glaces |
| 🌲 Endor | Commando scout | Officier de garnison | AT-ST de patrouille | Chamane renégat |

**Rangs** : au niveau d'équipe **15+** les élites apparaissent en rang
**II** (×1,5 PV et dégâts, +18 % de taille, XP ×2), au niveau **30+** en
rang **III** (×2,2, +36 %, XP ×3) — le nom et l'annonce portent le rang.

À leur mort : **+30 PV** au joueur, ralenti dramatique court, anneau doré,
et le seigneur **lâche son arsenal** — l'armement lourd thématique du
secteur (voir [08-ravitaillements.md](08-ravitaillements.md)), si aucun
n'est déjà en jeu.

## Boss finaux (20:00 — challenge 4/4)

Annonce à 19:50, bannière + flash rouge + ralenti à l'apparition.
Barre de vie géante dans le HUD, flèche directionnelle si hors champ.
À la mort : +50 PV, 160 XP en cristaux, ralenti long, flash blanc, écran VICTOIRE.

PV de base ci-dessous, × le facteur coop `1 + 0,7×(joueurs − 1)`
(×1,7 / ×2,4 / ×3,1 à 2 / 3 / 4 joueurs) et × `1 + 0,03 × niveau d'équipe`
(un boss affronté au niveau 60 a ×2,8 PV) — vaut aussi pour l'élite Sith.

| Boss | Destination | PV | Vitesse | Dégâts | Hitbox |
|---|---|---|---|---|---|
| Dark Maul | Espace profond | 2400 | 100 | 30 | 21 |
| Jabba le Hutt | Tatooine | 4000 | 30 | 36 | 30 |
| Dark Vador | Étoile de la Mort | 3000 | 58 | 32 | 24 |
| Boba Fett | Hoth | 2200 | 85 | 26 | 19 |
| L'Empereur | Endor | 2600 | 50 | 30 | 21 |

## Patterns IA (`bossAI`)

- **Dark Maul** — mêlée rapide, sabre double rotatif (visuel). Toutes les
  4,2 s à moins de 440 px : télégraphe « ! » (0,55 s d'immobilité) puis
  **charge** à 640 px/s pendant 0,5 s.
- **Jabba** — tank lent. Toutes les 3,4 s : **crachat** de 3 glaires en
  éventail (18 dégâts, 260 px/s). Toutes les 9 s : **renforts** (4 troopers/droïdes).
- **Dark Vador** — toutes les 5 s : **lancer de sabre** boomerang (24 dégâts,
  340 px/s, revient vers lui après 1,05 s, traverse le joueur). Toutes les
  9 s (entre 130 et 480 px) : **Poigne de la Force**, attire le joueur à
  250 px/s pendant 0,9 s.
- **Boba Fett** — maintient la distance au jetpack (approche > 330 px,
  recule < 230 px, sinon orbite). Toutes les 3,2 s : **salve de 3 roquettes**
  (20 dégâts, zone 60, explosent au contact ou en fin de course).
- **L'Empereur** — garde ses distances (300/210 px). Toutes les 3,4 s :
  **éventail de 5 éclairs** (14 dégâts chacun, 420 px/s, écart 0,13 rad).

Les projectiles des boss sont gérés par `ebullets` (`src/update.js`) et
respectent l'esquive, l'armure et l'invulnérabilité du joueur.
