# Déploiement Barua (simple, sans proxy)

## Principe

Le site (`baruaofficiel.com`) sert uniquement les fichiers **statiques** (`dist/`).  
L’API et l’auth appellent directement **`https://backend.baruaofficiel.com`** (configuré dans `.env.production`).

Pas besoin de Nginx, Cloudflare Functions ni proxy sur le même domaine.

## Étapes

1. Vérifier `.env.production` :
   ```env
   VITE_API_URL=https://backend.baruaofficiel.com/api/v1
   VITE_AUTH_URL=https://backend.baruaofficiel.com
   ```

2. Build :
   ```bash
   npm run build
   ```

3. Publier **tout le contenu de `dist/`** (FTP, Git → Pages, hébergeur web, etc.).

4. Purger le cache CDN (Cloudflare) après chaque déploiement.

## Vérification

Dans le navigateur (F12 → Réseau), un login doit appeler :

- `POST https://backend.baruaofficiel.com/auth/login`

et les services :

- `GET https://backend.baruaofficiel.com/api/v1/public/service/documentaires`

Si tu vois encore `baruaofficiel.com/api/v1/...`, c’est un **ancien build** : refais `npm run build` et redeploie `dist/`.

## Développement local

`npm run dev` utilise le proxy Vite (`vite.config.ts`) — comportement normal en local.

## Option avancée (proxy same-origin)

Uniquement si tu veux masquer l’URL backend : `deploy/nginx-baruaofficiel.conf` ou `functions/_middleware.js` + `VITE_API_URL=/api/v1`.
