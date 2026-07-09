# Progression

Sources : `src/levelup.js` (XP, choix), `src/meta.js` (crédits, hangar).

## XP et level-up (dans la partie)

- Les ennemis lâchent des cristaux (1 XP, fusionnés en cristaux dorés de 5).
- Rayon d'aimant de base 90 (modifiable par passif/personnage/hangar).
- Seuil : `xpFor(n) = floor((25 + 1,8 × n^1,8) × densité coop)` — courbe
  raide : un choix toutes les **~2 min**, soit le **niveau ~25-35 à
  20 min** ; le build complet (fusions comprises) se construit sur la
  campagne entière. En coop
  × `1 + 0,5×(joueurs − 1)` (suit l'afflux de cristaux, voir
  [01-gameplay.md](01-gameplay.md)) ; multiplicateurs d'XP appliqués au gain
  (passif Fortune, hangar, Endor).
- Level-up : pause + **3 choix** tirés parmi les armes améliorables
  (4 slots max, **10 niveaux** chacune), nouvelles armes et passifs
  (< niv 5, **4 passifs max**). File d'attente si plusieurs niveaux d'un
  coup. Si tout est au max : carte « Sérénité » (soin complet).
  **Navigation manette** : le joueur dont c'est le tour choisit avec sa
  manette (◄ ► puis A) ou au clavier (flèches + Entrée) s'il n'en a pas ;
  la modal de combo se ferme avec A / Entrée.

## Marché noir (hangar)

Sous les améliorations du hangar, **quatre armes légendaires** en achat
**unique et définitif** (`META_STATE.weapons`, persisté) : une fois acquise,
l'arme rejoint le **tirage de level-up de tous les héros**, en plus de leur
arsenal (toujours 4 slots max). Statistiquement au-dessus des armes de base
dès le palier 1, 10 paliers.

| Arme | Mécanique | Prix |
|---|---|---|
| 🗡️ Sabre noir | `saber` (2 lames de base, jusqu'à 4) | 6000 © |
| 🟢 Canon superlaser | `rocket` (45 dégâts, zone 120) | 4500 © |
| 🛫 Escorte de chasseurs | `drone` (2 de base, jusqu'à 4) | 4000 © |
| 🔻 Holocron sith | `lightning` (4+niv rebonds) | 3500 © |

## Crédits (fin de partie)

Bancarisation **incrémentale** à chaque écran de fin : le total mérité par
la partie (+250 © si le boss est vaincu), multiplié par la **difficulté**
(Padawan ×1, Chevalier ×1,4, Maître ×2), moins le déjà-versé (victoire puis
25:00 ne comptent jamais double). Le total :

```
crédits = floor(kills × 0,5 + niveau × 5 + minutes × 10 + 250 si boss vaincu)
         × (1 + 0,10 × niveau_Contacts_au_cartel)
```

Sauvegarde en `localStorage` (clé `holocron_meta`), donc **par navigateur**.

## Hangar (améliorations permanentes)

Coût d'un palier : `base × (niveau + 1)`. Appliquées au lancement de chaque partie.

| Amélioration | Effet/niveau | Max | Coût base |
|---|---|---|---|
| 💚 Coque renforcée | +12 PV max | 5 | 80 |
| 🔥 Cristaux surcadencés | +4 % dégâts | 5 | 120 |
| 👢 Servomoteurs | +3 % vitesse | 5 | 90 |
| 🧲 Collecteur magnétique | +12 % aimant | 5 | 70 |
| ⚡ Condensateurs | −3 % recharge | 5 | 130 |
| 🔷 Mémoire d'holocron | +5 % XP | 5 | 100 |
| 🛡️ Plaques de beskar | −4 % dégâts subis | 5 | 120 |
| 💰 Contacts au cartel | +10 % crédits | 5 | 100 |
| ✨ Esprit de la Force | Résurrection à 50 % PV, 1×/partie, repousse les assaillants | 1 | 800 |
