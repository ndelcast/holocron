# Personnages

Source : `src/gamedata.js` (`CHARS`).

Quatre héros sélectionnables au menu. En coop, **chaque joueur choisit son
héros dans le salon** (J1 via la grille CHAMPION, J2-J4 avec ◄ ► sur leur
manette) ; les doublons sont permis. Chaque héros a un **arsenal exclusif
de 5 armes** et **2 combos propres** (voir [03-armes.md](03-armes.md) et
[04-combos-et-passifs.md](04-combos-et-passifs.md)).

| Héros | PV | Vitesse | Hitbox (r) | Arme de départ | Particularité |
|---|---|---|---|---|---|
| **Jedi** | 100 | 175 | 13 | Sabre laser | Recharge des armes ×0,9 |
| **Ewok** | 85 | 200 | 11 | Lances ewoks | Aimant ×1,4 ; le plus rapide, le plus fragile |
| **Mandalorien** | 140 | 158 | 14 | Roquettes | Armure : dégâts subis ×0,8 |
| **Contrebandier** | 95 | 188 | 13 | Blaster | Dégâts ×1,15 |

## Notes de design

- Le **Jedi** est le personnage d'apprentissage : sabre défensif, bonus discret.
- L'**Ewok** est le mode difficile assumé : hitbox réduite et mobilité contre
  une santé faible ; son aimant renforcé pousse au jeu de collecte.
- Le **Mandalorien** est le tank : il encaisse pour compenser des roquettes
  lentes en début de partie.
- Le **Contrebandier** est le DPS direct : multiplicateur global qui
  s'applique à toutes les armes, pas seulement au blaster.

Les améliorations permanentes du hangar (voir [09-progression.md](09-progression.md))
s'appliquent **après** les modificateurs du personnage.
