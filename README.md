# VendorVibe

Offline-first PWA for micro and small vendors (sales, stock, utang, expenses, payroll, reports, coach, RPG habit sheet).
Plain static files: no build step.

## Files
- `index.html` — the whole app
- `manifest.webmanifest`, `sw.js`, `icons/` — installable, offline PWA
- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json` — Firebase Hosting + Firestore (project `vendorvibe-96980`)
- `.github/workflows/firebase-hosting.yml` — auto-deploy on push to `main`
- `.github/workflows/pages.yml` — optional manual GitHub Pages deploy

## One-time Firebase setup
1. Console > Authentication > Sign-in method: enable **Email/Password**.
2. Console > Authentication > Settings > Authorized domains: add your hosting domain (`vendorvibe-96980.web.app` is there by default; add GitHub Pages / custom domains if used).
3. Console > Firestore Database: create the database (production mode), then deploy the rules: `firebase deploy --only firestore:rules`.
4. GitHub repo > Settings > Secrets > Actions: add `FIREBASE_SERVICE_ACCOUNT` (JSON key of a service account with Firebase Hosting Admin; `firebase init hosting:github` creates it for you).

## Deploy
Push to `main`, or manually: `firebase deploy`.

## Cloud sync
Cloud buttons are hidden for regular users. Open the app with `?cloud=1` (e.g. `https://vendorvibe-96980.web.app/?cloud=1`) > More > Cloud + AI, create an account, then Sync Now. The Firebase web config is pre-filled.

## Releasing an update
Bump `CACHE_VERSION` in `sw.js` so installed apps pick up the new files.

## Security
- The Firebase web API key is safe to be public; access is enforced by `firestore.rules` (each user can only touch `vendors/{their uid}`).
- Never put a Gemini or other secret API key in this repo. Use a server-side gateway for AI.
