# Hamza Al-Faqeeh — Portfolio

Source code of my personal portfolio website: a fast, static, multi-page site that presents my web, AI, branding and AI-video work.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, selected work (NAQI Jo case study, NAQI AI Support, Elevate Training Center), skills, creator profiles, about, contact |
| `/ai-creation/` | AI video and visual creation |
| `/thoughts/` | Thoughts and updates (links to my X profile) |
| `/youtube/` | YouTube channel page |
| `/consultation/` | Multi-step project questionnaire that opens WhatsApp with a prefilled message |

## Tech stack

- [Vite](https://vite.dev/) 8 as the dev server and build tool (the only dependency)
- Plain HTML, CSS and JavaScript (ES modules); there is no UI framework
- Self-hosted fonts: Sora, IBM Plex Sans and IBM Plex Mono (SIL Open Font License, see `public/fonts/LICENSES.txt`)
- A custom Arabic wordmark (حمزة) drawn as SVG bars, with a small CSS-driven entrance animation that respects `prefers-reduced-motion`

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (developed on Node 24)
- npm

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # create the production build in dist/
npm run preview    # serve the production build locally (http://localhost:4173)
```

## Project structure

```
index.html, ai-creation/, thoughts/, youtube/, consultation/   One HTML entry per page
src/
  style.css           Design tokens and all styles
  main.js             Navigation, scroll highlighting, video handling
  wordmark.js         Arabic wordmark geometry, inline SVG builder and entrance animation
  protect.js          Light deterrents against dragging and saving artwork images
  consultation.js     Questionnaire logic and the WhatsApp message builder
public/
  brand/              Public SVG wordmark
  fonts/              Self-hosted WOFF2 fonts
  media/              Optimized WebP images and MP4 previews used by the site
  favicon*, apple-touch-icon.png
vite.config.js        Multi-page build configuration
```

## Notes

- **No backend.** The consultation form runs entirely in the browser. When submitted it opens `wa.me` with the answers prefilled; nothing is sent to or stored on a server. The WhatsApp number is set in `src/consultation.js`.
- **Artwork.** Images are display-size WebP copies, and the work shown for client projects is for portfolio presentation. The `brand-source/` folder holding original and master files is intentionally not part of this repository.
- **Image protection** in `src/protect.js` only discourages casual saving; it does not prevent anyone from downloading a file the page displays.

## License

All rights reserved. The source code, wordmark and artwork in this repository are published for viewing and are not licensed for reuse.
