# VodaSure Funeral Cover Website Redesign 2026

This package contains the original responsive VodaSure funeral-cover journey source and image assets.

## Local preview

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

## Production build

Run:

```bash
npm run build
```

The deployable static website is generated in `dist/`. The ZIP also includes a prebuilt `dist/` folder so it can be manually uploaded to GitHub Pages without running the build.

## GitHub Pages

To replace an existing GitHub Pages subfolder:

1. Remove the old website files from that folder.
2. Upload the **contents** of `dist/` into the folder, not the `dist` directory itself.
3. Keep `index.html`, `assets/`, `figma/`, and `favicon.svg` together.

All generated asset paths are relative so the website can run from a repository subfolder.

## Adobe Target

Use the published GitHub Pages URL as the `src` of the Adobe Target full-page iframe experience.

This project is a front-end prototype. Do not submit real customer or banking information to it.
