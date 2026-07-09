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

- **Survivre 25 minutes** (4 challenges) = tenir le temps que l'hyperdrive recharge.
- **Le boss à 20:00** = le seigneur du secteur vient reprendre l'holocron.
- **Le vaincre** = lui arracher son fragment et libérer le secteur.
- **Les cristaux d'XP** = éclats de mémoire de l'holocron qui « se souvient ».
- **Le hangar** = la soute du vaisseau, améliorée entre deux campagnes.

## La reconquête secteur par secteur (macro-boucle)

La progression est **persistante** (`META_STATE`) : les secteurs se
**débloquent un par un** (terrasser le boss du secteur n débloque le n+1),
et chaque **fragment d'holocron conquis est conservé pour toujours**.

1. Écran d'accueil → **JOUER** → choix de la **destination débloquée** et
   de la **difficulté** (Padawan ×1, Chevalier ×1,5, Maître ×2,2 — crédits
   ×1 / ×1,4 / ×2) → écran ÉQUIPE (salon manettes) → partie de 25 minutes.
2. Boss vaincu → **splash de victoire** (fragment, secteur débloqué,
   stats) → retour au QG : améliorations au hangar, puis secteur suivant.
3. **Cinq fragments = l'holocron renaît** (vraie fin, affichée au splash).
4. La mort ne fait rien perdre : crédits bancarisés, fragments conservés.

Le HUD affiche les fragments (`◆◆◇◇◇`) en bas au centre, l'accueil aussi.

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
