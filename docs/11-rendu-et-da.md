# Rendu et direction artistique

Source : `src/render.js` ; styles UI dans `src/style.css`.

## Direction artistique

**Projection holographique militaire** : cyan hologramme (`#6ee7ff`) sur
fond spatial sombre, or (`#ffd166`) pour le précieux (XP, crédits,
victoires), rouge (`#ff3b3b`) pour la menace, vert sabre (`#52ff7a`).
Typographies : Orbitron (display) + Rajdhani (texte). Scanlines, équerres
de visée aux coins, bande de balayage, flicker holo occasionnel.

## Ordre de rendu (une frame)

1. Couleur de base de la destination
2. Fond : étoiles/nébuleuses en parallaxe (espace, écran) ou rien ; soleils de Tatooine
3. **Repère monde** (scale = zoom écran × zoom punch, translation caméra) :
   sol procédural, brûlures, nappes de feu, aura ionique, **ombres portées**,
   cristaux (pulsants), caisses + balises, ondes, explosions + anneaux,
   ennemis (aura boss, flash de dégât, signatures des boss finaux), sabre
   (+ sillage), fantômes, droïdes, rayons + colonne de level-up, halo, joueur,
   grenades, traînées + projectiles, projectiles ennemis, éclairs ramifiés,
   particules (2 passes : rects/fumée puis lueurs/traits additifs), textes détourés
4. **Espace écran** : étalonnage colorimétrique, minimap, flèche de boss,
   météo, poussières, flash plein écran
5. **Post-process** : bloom (copie ¼ ré-agrandie en additif, alpha 0,20),
   écho chromatique si secousse > 3

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

## Mobile

- Canvas calé sur `window.visualViewport` (barre d'URL) + taille CSS explicite.
- **Dézoom du monde** : `view.zoom = clamp(min(w,h)/760, 0,7, 1)` — le sol
  suit (repère monde), le rayon d'apparition des ennemis est corrigé.
- Media queries ≤ 640 px ou ≤ 520 px de haut.
