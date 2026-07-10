# Destinations (niveaux)

Source : `src/levels.js` (`LEVELS`, `makeGroundTile`).

Cinq destinations sélectionnables au menu. Chacune définit : un décor
procédural, un étalonnage colorimétrique, un modificateur de gameplay,
un bestiaire (skins des paliers d'ennemis), un boss final et un thème
musical (`src/music.js`).

| Destination | Modificateur | Boss final | Décor | Musique (metal) |
|---|---|---|---|---|
| 🌌 Espace profond | aucun (référence) | Dark Maul | Étoiles en parallaxe 3 couches, nébuleuses | Doom pesant, la mineur, 100 bpm |
| 🏜️ Tatooine | Ennemis **+10 %** rapides | Jabba le Hutt | Dunes, rochers, soleils jumeaux à l'écran | Galop phrygien des sables, 126 bpm |
| ⚫ Étoile de la Mort | Vagues **+15 %** denses (intervalle ×0,85) | Dark Vador | Plaques métalliques, voyants, hublots | Écrasant, mi-temps, sol grave, 92 bpm |
| ❄️ Hoth | Ennemis **-10 %** lents | Boba Fett | Glace craquelée, congères, neige qui tombe | Metal froid et mélodique, 112 bpm |
| 🌲 Endor | XP **+15 %** | L'Empereur | Sous-bois, rondins, fougères, lucioles | Punk metal bondissant, pentatonique, 140 bpm |

## Musique

**Pistes orchestrales cinématiques de Luis Humanoide** (Pixabay, Pixabay
Content License — voir la page CRÉDITS du jeu), converties en M4A 128k
dans `public/music/` (0,8-2,2 Mo par destination) : Space Fleet (Espace),
Space Cantina (Tatooine), March of the Troopers (Étoile de la Mort),
Invasion March (Hoth), Star Wars Style Chase Music (Endor),
jouées en boucle via un élément `<audio>` (gain de base 0,55, volume du
curseur OPTIONS et touche <kbd>M</kbd> synchronisés en continu). Démarre au
lancement, s'arrête sur les écrans de fin. Si un fichier manque, le
**séquenceur metal WebAudio** d'origine (riff saturé + batterie synthétisée)
prend le relais — il reste dans `music.js` comme repli.

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
