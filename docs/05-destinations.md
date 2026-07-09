# Destinations (niveaux)

Source : `src/levels.js` (`LEVELS`, `makeGroundTile`).

Cinq destinations sélectionnables au menu. Chacune définit : un décor
procédural, un étalonnage colorimétrique, un modificateur de gameplay,
un bestiaire (skins des paliers d'ennemis), un boss final et un thème
musical (`src/music.js`).

| Destination | Modificateur | Boss final | Décor | Musique |
|---|---|---|---|---|
| 🌌 Espace profond | aucun (référence) | Dark Maul | Étoiles en parallaxe 3 couches, nébuleuses | Nappe mystérieuse, la mineur, 72 bpm |
| 🏜️ Tatooine | Ennemis **+10 %** rapides | Jabba le Hutt | Dunes, rochers, soleils jumeaux à l'écran | Marche des sables, couleur phrygienne, 92 bpm |
| ⚫ Étoile de la Mort | Vagues **+15 %** denses (intervalle ×0,85) | Dark Vador | Plaques métalliques, voyants, hublots | Marche menaçante, sol mineur, 104 bpm |
| ❄️ Hoth | Ennemis **-10 %** lents | Boba Fett | Glace craquelée, congères, neige qui tombe | Froid cristallin, lent et aérien, 64 bpm |
| 🌲 Endor | XP **+15 %** | L'Empereur | Sous-bois, rondins, fougères, lucioles | Groove forestier, pentatonique, 116 bpm |

## Musique

Thèmes **originaux synthétisés en WebAudio** (aucun asset, cohérent avec
`audio.js`) : séquenceur pas à pas avec anticipation de ~150 ms sur
l'horloge audio, deux voix (basse + lead) bouclées sur 2 mesures, mixées
bas sous les bruitages. Démarre au lancement de la partie, s'arrête sur
les écrans de fin ; continue pendant la pause et les choix de level-up.
La touche <kbd>M</kbd> / le bouton ♪ coupent musique et bruitages ensemble.

## Bestiaires

Les stats des paliers sont identiques partout (voir [06-ennemis.md](06-ennemis.md)) ;
seul le sprite change (`LEVELS[..].mobs`, repli sur le sprite par défaut).

| Palier | Espace | Tatooine | Étoile de la Mort | Hoth | Endor |
|---|---|---|---|---|---|
| Basique | Stormtrooper | Jawa | Stormtrooper | Snowtrooper | Scout trooper |
| Rapide | Droïde B1 | Tusken | Officier impérial | Droïde B1 | Droïde B1 |
| Moyen | Sonde | Rodien | Sonde | Sonde Viper | Sonde |
| Tank | Droïdeka | Garde gamorréen | Garde royal | Wampa | AT-ST |

## Décors techniques

- Les sols des planètes sont des **tuiles procédurales de 1400 px**
  (`makeGroundTile`), générées une fois puis mises en cache ; chaque motif
  est dessiné 9 fois pour un raccord sans couture. Dessinées dans le
  repère monde (elles suivent le zoom).
- L'espace utilise un fond en **parallaxe** (nébuleuses ×2 + 3 couches
  d'étoiles scintillantes) dessiné en espace écran, « à l'infini ».
- Météo d'ambiance en espace écran : neige sur Hoth, lucioles sur Endor,
  poussières en suspension partout.
- Étalonnage : dégradé diagonal (lumière haut-droite → ombre bas-gauche)
  aux couleurs de la destination, appliqué au-dessus du monde
  (`AMBIENT` dans `src/render.js`).
