# Lore — Le Dernier Holocron

Vision narrative et macro-boucle du jeu. Implémentation : `src/state.js`
(`campaign`), `src/lifecycle.js` (victoire, saut hyperespace, fins).

## L'histoire

La nuit de la chute du Temple, l'Empire a purgé les archives Jedi. Il ne
reste qu'un seul holocron, dérobé dans les flammes : il contient les
coordonnées d'un sanctuaire où la Force pourra renaître. Pour le neutraliser,
l'Empire l'a **brisé en cinq fragments**, confiés aux seigneurs de cinq
secteurs :

| Fragment | Secteur | Gardien |
|---|---|---|
| ◆ | 🌌 Espace profond | Dark Maul |
| ◆ | 🏜️ Tatooine | Jabba le Hutt |
| ◆ | ⚫ Étoile de la Mort | Dark Vador |
| ◆ | ❄️ Hoth | Boba Fett |
| ◆ | 🌲 Endor | L'Empereur |

Les héros sont les **derniers porteurs** : un padawan évadé (Jedi), un
éclaireur d'Endor (Ewok), un déserteur en armure (Mandalorien), une pilote
recherchée (Contrebandier). En coop, c'est l'équipage du même vaisseau.

Le lore recontextualise chaque système existant :

- **Survivre 20 minutes** = tenir le temps que l'hyperdrive recharge.
- **Le boss à 15:00** = le seigneur du secteur vient reprendre l'holocron.
- **Le vaincre** = lui arracher son fragment et libérer le secteur.
- **Les cristaux d'XP** = éclats de mémoire de l'holocron qui « se souvient ».
- **Le hangar** = la soute du vaisseau, améliorée entre deux campagnes.

## La Route de l'Hyperespace (macro-boucle)

Une **campagne** enchaîne les secteurs en conservant build, armes, passifs,
combos, niveau et XP :

1. Le menu choisit le **premier secteur**. Boss vaincu → écran « SECTEUR
   LIBÉRÉ », fragment n/5, et **saut hyperespace** vers un secteur restant
   (build conservé, équipe soignée et réanimée, timer remis à zéro).
2. Chaque saut augmente la **pression de la traque** : `campaignMult() =
   1 + 0,3 × (secteur − 1)` sur les PV des ennemis/boss et la densité de
   spawn — en plus de la montée liée au niveau d'équipe, qui est conservé.
3. **Cinq fragments = l'holocron renaît** : écran de vraie fin.
4. Atteindre 20:00 sans avoir vaincu le boss = le seigneur s'enfuit avec son
   fragment, la route s'arrête (fin honorable, crédits bancarisés).
   Mort de l'équipe = TERRASSÉ, les fragments retournent à l'Empire.

Les crédits sont bancarisés **de façon incrémentale** à chaque écran de fin
(`bankRewards`) : stats cumulées de la campagne + 250 © par fragment, moins
ce qui a déjà été versé. Perdre la route ne fait jamais perdre les crédits.

Le HUD affiche les fragments (`◆◆◇◇◇`) en bas au centre.

## Roadmap (non implémenté)

- **Reliques** : loot permanent lâché par les boss (une par seigneur),
  collection persistante, 1-2 équipables par campagne. Ex. *Lame de Maul*
  (2ᵉ lame de sabre au départ), *Carbonite de Fett* (survit au premier coup
  fatal), *Bague de l'Empereur* (+1 rebond d'éclairs par 10 niveaux).
  Les élites Sith pourraient lâcher des reliques mineures (taux faible).
  L'écran de collection est l'holocron lui-même qui se remplit.
- **Traques impériales I, II, III…** : NG+ à multiplicateurs croissants,
  débloquées par la première reconstitution de l'holocron.
- **Désaffiliation** : le prototype est un fan game non commercial. Pour
  une éventuelle publication, le lore survit tel quel en remplaçant
  holocron → artefact original, Empire → légion originale, et les noms.
