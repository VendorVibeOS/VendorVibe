# VendorVibe deployment

Upload these files together, keeping the folder layout:
index.html, sw.js, manifest.webmanifest, icons/icon-192.png, icons/icon-512.png

Host over HTTPS (GitHub Pages, Netlify, Firebase Hosting or Cloudflare Pages). Service workers and install do not work from file://.

## After deploying
1. Open the site once while online so the app caches itself.
2. Turn on airplane mode and reload. The app should still open and save records.
3. Install: Chrome/Android menu > Install app. iPhone Safari: Share > Add to Home Screen.
4. Updates: after you upload a new version, bump `V` in sw.js (now vendorvibe-v5; use v6 next). Users see "Update ready" and reload.
5. Make sure sw.js is not cached for a long time by your host (max-age=0 / no-cache).

## Notes
- Data is stored on each device (IndexedDB). Tell clients to export a backup weekly (Reports > Data Safety).
- Cloud sync is hidden from clients. Open the site with ?cloud=1 to show it. Before using it, set Firestore rules so users can only read/write vendors/{their uid}.
- "Estimated Business Cash" = starting capital + sales - cost of goods - expenses - owner draws. It is an estimate, not a till count.

- First launch: store setup, then a guided tour. The ? button replays it. Language (English/Filipino) is in Settings. Coach advice stays in English.
- Reset: Settings > Fix a mistake. Both options download a backup first; full reset also needs the word RESET.
