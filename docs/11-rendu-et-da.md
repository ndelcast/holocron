# Rendu et direction artistique

Source : `src/render.js` ; styles UI dans `src/style.css`.

## Direction artistique

**Hologramme cartoon** : cyan hologramme (`#6ee7ff`) sur fond spatial
sombre, or (`#ffd166`) pour le précieux (XP, crédits, victoires), rouge
(`#ff3b3b`) pour la menace, vert sabre (`#52ff7a`). Scanlines, équerres de
visée aux coins (arrondies), bande de balayage, flicker holo occasionnel.

La couche « DA v3 » de `style.css` apporte le ton cartoon : typographie
**Baloo 2** (remplace Orbitron sur tout le display), coins arrondis à la
place des découpes `clip-path`, boutons pastilles avec socle 3D qui
s'enfoncent au clic, cartes qui rebondissent et penchent au survol
(`popIn`, `wiggle`), titres légèrement inclinés. Rajdhani reste la typo
de texte courant.

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
