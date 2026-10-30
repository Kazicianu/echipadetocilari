# Hero

The text block that opens a page: a kicker, the uppercase orange title, a lead and the main action.

Markup: `.ect-hero` with `p.ect-hero__kicker`, `h1.ect-hero__title`, then either `p.ect-hero__lead` (one 18px paragraph) or `p.ect-hero__offer` + `p.ect-hero__text` (store), `.ect-hero__actions` with the buttons and an optional `p.ect-hero__note`. Pick the page variant: `ect-hero--home`, the plain store version, `ect-hero--ads` (centred, wider) or `ect-hero--site`.

- Kicker `kicker` (21px, 400, `ink`) names the service in plain words ("Magazin online pentru afacerea ta"); the site page uses `kicker-lg` (41px).
- Title in `display` (45/54, 900, uppercase, `orange`): the keyword people search for ("Creare magazin online", "Agenție Google Ads pentru firme"). Google Ads uses `display-ads` (54px, -0.025em), /creare-site-web/ `display-site` (64px).
- Lead: `lead` (18/24) on the homepage and Google Ads; the store states the price first (`lead-strong`, "Magazin online cu plăți, livrare și facturare, de la 1.490 €.") then a 16px 300 paragraph.
- Actions: the homepage `ect-btn--hero`; the store two arrow chips; Google Ads the gradient and the tall outline button side by side.
- Note: `small` print in `ink-muted` with the reassurance ("Consultație gratuită · 30 de minute · Fără obligații").
- The illustration sits beside the text (the Lottie mascot on the homepage, `vr.webp` on /creare-site-web/, the store's phone mockup; Google Ads puts a search-results mockup under the hero): see `assets/Illustrations`. On /creare-site-web/ the kicker is the page's `h1` and the big title an `h2`.
- Contrast: the `orange` title is 2.4:1 on `white`; at 45px and 900 it counts as large text but still misses 3:1. Kept as the site has it.

Hand-written from the hero of each page (Elementor post 3381 and 3471, the store and Google Ads inline styles).
