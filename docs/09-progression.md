# Progression

Sources : `src/levelup.js` (XP, choix), `src/meta.js` (crédits, hangar).

## XP et level-up (dans la partie)

- Les ennemis lâchent des cristaux (1 XP, fusionnés en cristaux dorés de 5).
- Rayon d'aimant de base 90 (modifiable par passif/personnage/hangar).
- Seuil : `xpFor(n) = floor(8 × 1,28^(n−1) + 2n)` — 10, 12, 15, 18, 22, 26… ;
  multiplicateurs d'XP appliqués au gain (passif Fortune, hangar, Endor).
- Level-up : pause + **3 choix** tirés parmi les armes améliorables
  (4 slots max), nouvelles armes et passifs (< niv 5). File d'attente si
  plusieurs niveaux d'un coup. Si tout est au max : carte « Sérénité »
  (soin complet).

## Crédits (fin de partie)

Bancarisés une seule fois par partie, à la première fin atteinte
(victoire, survie 20 min ou mort) :

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
