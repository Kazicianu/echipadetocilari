# ServiceCard

The homepage service tile: the service icon, the name in orange and one line on what we do differently. The whole tile links to the service page.

Markup: `div.ect-service-grid` of `a.ect-service`, each with `img.ect-service__icon` (a `service-*.svg` from `assets/Icons`, 65px), `h3.ect-service__title` and `p.ect-service__text`.

- The tile is `white` with the leaf corner (`radius-card` on three corners, `radius-leaf` bottom left), `shadow-card` and 68px × 50px padding. Three per row, 20px apart; two from 1024px, one on phones.
- Title `h3-sm` (20/24, 500) in `orange`, capitalised; text `body` (16/22.4, 300).
- Hover and focus lift the tile 10px and swap to `shadow-card-hover`.
- Write the text as "what we do, not what others do": a plain promise, then a short "Nu ..." that names the usual disappointment.
- The homepage shows six (site, magazin, aplicații, SEO, Google Ads, Facebook Ads) and closes the grid with a `ServiceBand` for maintenance.
- Contrast: the `orange` title is 2.4:1 on `white`, below AA for 20px text; kept as the site has it. The body text passes (14.9:1).

Hand-written from the homepage Elementor icon boxes (section `#servicii`).
