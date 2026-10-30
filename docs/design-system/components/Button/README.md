# Button

A pill-shaped link or button; each variant belongs to one place on the site.

Put `ect-btn` and one variant class on an `<a>` or `<button>`. The label is the content; an icon goes inline as `<svg>` (painted with `currentColor`) after the label, 10px away.

| Variant | Class | Where |
| --- | --- | --- |
| Filled | `ect-btn--primary` | "Despre noi" (homepage), "Primește o ofertă" (store price cards), "Comandă acum!" (site price boxes, with `ect-btn--ringed`, whose 3px `white-warm` ring disappears on the white card): `orange` fill, `white-warm` label, 3px border; hover swaps to `white` with an `orange` label and border |
| Hero | `ect-btn--hero` | The homepage hero and CTA band ("Participă la o consultație GRATUITĂ de 30 minute"): `white` with a 2px `orange` border, `button-hero` (18/21.6, 600), 20px × 100px padding; fills `orange` on hover. On an orange band add `ect-btn--on-brand` (white border) |
| Outline | `ect-btn--outline` | "Hai să vorbim" (FAQ) and "Vezi pachetele și prețurile ↓" (Google Ads, with `ect-btn--tall`): `white`, 2px `orange` border, 600 |
| Gradient | `ect-btn--gradient` | The Google Ads hero ("Consultație GRATUITĂ de 30 minute"): `orange-logo` to `orange` at 270deg with `shadow-glow`, 58px tall |
| Arrow chip | `ect-btn--chip` + `--main` or `--more` | The store hero: a 56px pill with a 40px round chip holding `arrow-right-line` or `arrow-down-line`; `--main` is `orange` with `shadow-cta`, `--more` is `white` with a `line-peach` border and a `peach` chip |
| Plan | `ect-btn--plan` | Google Ads plans ("Discută pachetul Silver"): `orange`, 3px `white` border, 52px |
| On orange | `ect-btn--on-orange` | "Întreabă-ne direct" on the orange FAQ card: `white` with an `orange` label, 50px |
| Submit | `ect-btn--submit` | The contact form ("Trimite"): `white`, 2px `orange` border at 82% |
| Header | `ect-btn--header` | "Ai o idee?": `orange-logo` at 89% with a 2px `orange-border`, Noto Sans (`button-cta`), 60px radius |

- One main action per view; pair it with an outline button or a `TextLink`, never with a second filled one.
- Labels invite in the "tu" form, verb first. Bold one word at most ("<b>GRATUITĂ</b>"). Arrows are "↓" for a jump down the page and "→" for another page; never a diagonal arrow.
- Keep every button at least 44px tall. Add `ect-btn--block` to fill a card. Press scales the gradient, chip, plan and on-orange buttons to 98%.
- Focus: a 3px `ink` ring 5px out (the header button uses 2px `orange-deep`).
- Contrast: `white-warm` or `white` on `orange` and `orange` on `white` are 2.4:1, and the header label on `orange-logo` at 89% is 2.55:1; all fail AA and are kept as the site has them. The arrow-chip `--more` label is `ink` on `white` (14.9:1).

Hand-written from the Elementor button rules (homepage post 3381, header post 3359, /creare-site-web/ post 3471), `creare-magazin-online.css`, `google-ads.css` and the inline styles of the Google Ads page.
