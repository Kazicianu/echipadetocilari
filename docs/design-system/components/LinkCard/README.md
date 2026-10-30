# LinkCard

A card that points to a related service: a short pitch and the way onward.

Markup, default: `article.ect-card.ect-card--interactive` with `.ect-card__head > span.ect-card__disc` (a 24px stroke icon, the `card-*.svg` set), `h3.ect-card__title`, `p.ect-card__text` and `p.ect-card__link > a.ect-link`. Outline: `a.ect-card.ect-card--outline` (the whole card is the link) with an inline service mark (`svg.ect-card__icon`, 64 × 56, `orange`), `span.ect-card__title`, `span.ect-card__text` and `span.ect-link.ect-link--cta` ("Vezi ce include →").

- Default (store, "După lansare"): `white` leaf card (`radius-card`, `radius-leaf` bottom left), `shadow-card`, 32px × 32px × 40px padding (28 × 28 × 34 below 960px); a 56px `peach` disc with the icon in `orange-deep`; title 22px 500 (21px narrow); text 16/1.5 300.
- Outline (Google Ads, "Merge bine împreună cu"): no shadow, a 2px `orange` border, 40px × 40px × 52px padding, title 22px 500, text 16/1.45.
- Both lift 10px with `shadow-card-hover` on hover (pointer devices); the default one also on focus inside.
- Lay them out three across (store) or in a responsive grid with a 360px minimum (Google Ads), 20px apart.
- Say what the service does for this reader, then what it costs or what is separate ("Bugetul de publicitate se plătește separat către Google.").

Hand-written from `creare-magazin-online.css` (`.ect-card`) and the Google Ads related-services section.
