# Holocron Survivors — Spécifications

Survivor-like (type *Vampire Survivors*) sur le thème Star Wars.
Vanilla JS + canvas, aucune dépendance runtime. Jouable sur
[ndelcast.github.io/holocron](https://ndelcast.github.io/holocron/).

## Sommaire

| Document | Contenu |
|---|---|
| [01-gameplay.md](01-gameplay.md) | Boucle de jeu, déroulé d'une partie, contrôles, HUD |
| [02-personnages.md](02-personnages.md) | Les 4 héros jouables |
| [03-armes.md](03-armes.md) | Les 10 armes et leurs paliers |
| [04-combos-et-passifs.md](04-combos-et-passifs.md) | 7 combos d'armes, 10 passifs |
| [05-destinations.md](05-destinations.md) | Les 5 niveaux, modificateurs, bestiaires |
| [06-ennemis.md](06-ennemis.md) | Paliers d'ennemis, apparition, montée en difficulté |
| [07-boss.md](07-boss.md) | Élite récurrente et les 5 boss finaux (patterns IA) |
| [08-ravitaillements.md](08-ravitaillements.md) | Bonus à récupérer sur la carte, minimap |
| [09-progression.md](09-progression.md) | XP, level-up, crédits, hangar (méta-progression) |
| [10-architecture.md](10-architecture.md) | Modules, état partagé, conventions de code |
| [11-rendu-et-da.md](11-rendu-et-da.md) | Pipeline de rendu, effets visuels, direction artistique |
| [12-deploiement.md](12-deploiement.md) | Dev local, build, GitHub Pages |

Convention : chaque document référence les fichiers sources qui font foi.
En cas de divergence entre la doc et le code, **le code fait foi** — merci
de mettre à jour la doc dans le même commit que le changement d'équilibrage.
