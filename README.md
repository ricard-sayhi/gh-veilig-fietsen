# GH Veilig Fietsen: website

Static, dependency-free site (HTML/CSS/JS). Dutch first, with an EN toggle.

## Build & preview
```bash
node build.mjs                                   # src/ → dist/
python3 -m http.server 4321 --directory dist     # http://localhost:4321
```
Upload the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, Strato…).

## Structure
- `src/pages/*.html`: page content (the `<!--meta …-->` header sets the title, description and active nav item)
- `src/partials/`: header, footer and icon sprite, shared by all pages
- `src/assets/js/config.js`: **all shop data**: hours, prices, bikes, reviews, socials, KVK
- `src/assets/js/main.js`: language toggle, open/closed status, filters, forms, map
- `src/assets/css/style.css`: design tokens at the top (black / white / sticker red)

Translations: each Dutch element carries its English text in `data-en="…"`.

## Logo & photos
- Logo: stacked lockup (G + bike over "GHVEILIG FIETSEN"), from Figma node `11:2` in https://www.figma.com/design/fS2YP4E5QXZ1iJ4g28aBcO
  - `src/assets/img/logo-figma.svg`: the SVG export, with the wordmark (Geom Medium) outlined. To update the logo, re-export that node and replace this file.
  - `build.mjs` generates `logo.svg`, `logo-white.svg`, `logo-icon.svg`, `favicon.svg` and inline `<symbol>`s from it (header and footer use `currentColor`)
  - The earlier logo (vectorized from the shop sign) is kept in `images/old-logo/`
- Typefaces: **Barlow Condensed** (headings, 500–800) + **Inter** (body), both from Google Fonts. Geom is used only inside the outlined logo, so it is not loaded on the site.
- Photos: originals in `images/`, used from `src/assets/img/photos/`. The link-preview image is `src/assets/img/og.jpg`.

## TODO before launch (confirm with the owner)
- [ ] **Opening hours**: taken from the board in the shop window (Mon–Sat 09–18, Sun 12–18). Google says 19:00, so confirm which is right
- [ ] **Repair prices**: only tyre, inner tube, brakes and chain are priced (`GH.repairs` in `config.js`), anchored on € 30 for patching a flat. Tyre, brakes and chain show the replacement price only; repairing them is mentioned but quoted in the shop. Everything else (`GH.services`) scrolls past in the carousel without prices. Confirm the prices with the owner
- [ ] **Rental prices**: placeholders in `config.js`
- [ ] **Bike stock**: example stock; add real bikes with `photo: "assets/img/bikes/…jpg"`
- [ ] **Reviews**: add real Google reviews to `GH.reviews`, with permission (dashed placeholders show until then)
- [ ] **Google "write a review" link** (`googleReviewUrl`, plus the links in `reviews.html`)
- [ ] Email, socials, KVK number, real domain (`SITE` in `build.mjs`)
- [ ] Confirm the WhatsApp number, what's included with a secondhand bike, the rental deposit/ID policy, turnaround times and the student-discount scope
- [ ] Forms: without `formEndpoint` they open WhatsApp with the message prefilled. For email delivery and photo uploads, set a Formspree/Basin URL.
- [ ] The van shows a second address (Californiedreef 33, 3565 BJ Utrecht). Warehouse? Add it to the site if customers can visit
- [ ] Address: the brief said "Lange Janss**s**traat"; the site uses the real street name, **Lange Jansstraat**
