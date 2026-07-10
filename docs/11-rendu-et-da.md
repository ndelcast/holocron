# Rendu et direction artistique

Source : `src/render.js` ; styles UI dans `src/style.css`.

## Direction artistique

**Comics spatial** (couche « DA v4 » de `style.css`, qui écrase la v3) :
fond indigo **tramé de points** façon page de BD, panneaux **papier crème**
(`--paper`) à gros traits d'encre (`--inkline`, 3 px) et **ombres portées
franches** (offset plein, aucun glow néon), titres en **Bangers** avec
contour d'encre et ombre décalée, encadrés de narration inclinés (crawl,
descriptions), boutons pastilles pleines or à socle d'encre, rayons
d'action en éventail derrière la modal de combo. Accents : or `#ffd166`,
rouge `--red #ff4954`, violet BD pour les emphases. Typos : Bangers
(titres), Baloo 2 (UI), Rajdhani (texte courant). Les textes flottants
en jeu passent en Baloo 2 avec contour d'encre épais (BitmapFont).
Le chrome holo (scanlines, équerres, balayage) est retiré. Tous les
**sprites** reçoivent un **contour d'encre automatique** (`inkOutline` dans
`sprites.js` : silhouette à seuil d'alpha décalée en couronne, teintée
encre). Les 17 sprites principaux (héros, 4 ennemis, élite, 5 boss, drone,
cristaux) sont en outre **redessinés en proportions cartoon** : grosses
têtes expressives, cel-shading en aplats (base + ombre + reflet), traits
d'encre internes (`ink()`), regards et attitudes typés BD. Les skins de
bestiaire par destination conservent leurs dessins d'origine (avec le
contour automatique).

**Animation procédurale** (render.js, aucune frame supplémentaire) : les
ennemis marchent en **dandinement + rebond** (phase aléatoire `e.ph` par
individu, cadence ralentie pour les boss) et encaissent un **squash &
stretch élastique** à l'impact (piloté par `e.flash`, l'overlay blanc suit
la déformation) ; les héros ont un **cycle de course** (rebond, balancement,
squash au rythme des pas via `p.moving`) et une **respiration calme** à
l'arrêt.

Historique : v2 = chrome holographique, v3 = rondeurs cartoon (Baloo 2,
`popIn`, `wiggle` — les animations restent actives sous la v4).

## Pipeline PixiJS (une frame)

Le scene graph est **synchronisé depuis l'état** à chaque frame : pools de
sprites réutilisés (jamais de création/destruction par frame), `Graphics`
vidés et redessinés pour les primitives, `TilingSprite` pour les sols et
les couches d'étoiles, `BitmapText` pour les textes flottants.

Hiérarchie (dans l'ordre de rendu) :

1. `bgC` : nébuleuses + étoiles en parallaxe (espace) ou sol en tuiles
   (planètes, `tileScale` = zoom), soleils de Tatooine
2. `worldC` (scale = zoom écran × zoom punch) : brûlures, nappes de feu,
   aura ionique, ombres portées, cristaux, caisses + balises, ondes /
   explosions / anneaux, ennemis (+ flash additif, signatures de boss),
   sabre + sillage, fantômes, droïdes, colonne + rayons de level-up, halo,
   joueur, grenades, traînées + projectiles, projectiles ennemis, éclairs,
   particules (rects teintés, lueurs additives, traits), textes bitmap
3. Sprite d'étalonnage colorimétrique (dégradé pré-rendu par destination)
4. `fxC` (hors filtres) : météo, minimap, flèche de boss, flash plein écran

Filtres sur `bgC + worldC + étalonnage` : **AdvancedBloomFilter**
(threshold 0,72, scale 0,45) et **RGBSplitFilter** activé quand la
secousse dépasse 3 (écho chromatique).

## Effets clés

- **Bloom** : le flou d'interpolation du downscale/upscale fait office de halo.
- **Zoom punch** (`S.zoomKick`) : impulsion de caméra (level-up 0,06,
  élite 0,08, boss final 0,16), décroissance exponentielle.
- **Ralenti** (`S.freeze`) : dt ×0,15 (mort de boss 0,9 s, apparition 0,5 s).
- **Séries d'éliminations** : fenêtre glissante de 1,2 s ; annonces à
  ×10/×25/×50/×100/×200.
- Ombres elliptiques sous toutes les entités ; brûlures au sol 12 s après
  chaque explosion ; images rémanentes du joueur en mouvement.

## Budgets (performance)

| Ressource | Plafond |
|---|---|
| Particules | 600 |
| Ennemis vivants | 230 |
| Cristaux au sol | 260 (fusion au-delà) |
| Textes flottants | 90 |
| Anneaux | 40 |
| Fantômes / rémanences | 30 |
| Brûlures au sol | 30 |
| DPR | 2 desktop, **1,5 mobile** |
| Bundle | ~155 Ko gzip (PixiJS inclus) |

## Mobile

- Canvas calé sur `window.visualViewport` (barre d'URL) + taille CSS explicite.
- **Dézoom du monde** : `view.zoom = clamp(min(w,h)/760, 0,7, 1)` — le sol
  suit (repère monde), le rayon d'apparition des ennemis est corrigé.
- Media queries ≤ 640 px ou ≤ 520 px de haut.
