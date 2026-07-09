# Déploiement

## Développement local

```bash
npm install
npm run dev              # http://localhost:5173
npm run dev -- --host    # exposé sur le réseau local (test mobile)
npm run build            # build de production dans dist/
npm run preview          # sert le build (sous /holocron/)
```

## Production — GitHub Pages

- URL : **https://ndelcast.github.io/holocron/**
- Repo : `github.com/ndelcast/holocron` (public, requis pour Pages gratuit)
- `vite.config.js` : `base: '/holocron/'` **au build uniquement**
  (le dev reste à la racine)
- Workflow `.github/workflows/deploy.yml` : à chaque push sur `main`,
  build Node 22 puis publication via `actions/deploy-pages`
  (~1 min entre le push et la mise en ligne)

Toute page de test locale du build doit servir `dist/` **sous un
sous-chemin `/holocron/`**, sinon les assets renvoient 404.

## Poids

Bundle de production : ~155 Ko gzip (dont PixiJS ~120 Ko). Le jeu
lui-même reste ~30 Ko.

## Données joueurs

Aucun backend : la progression (crédits, hangar) est en `localStorage`,
propre à chaque navigateur/appareil. Vider le stockage du site réinitialise
la méta-progression.

## Autres cibles possibles

- **itch.io** : rebuilder avec `base: './'` puis zipper `dist/` (HTML5).
- **Serveur perso** : servir `dist/` tel quel (nginx/Caddy), ajuster `base`.
