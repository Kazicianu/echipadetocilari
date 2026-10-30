# TypeCard

The bento of website types on /creare-site-web/: outlined cards with a big numbered title, an orange label tile and an illustration tile.

Markup: `.ect-types` with `.ect-types__main` (rows of `.ect-types__row`) and an `.ect-types__side` card. Each card is `a.ect-type` (or `div`) with `h3.ect-type__title` and `p.ect-type__text`; the label tile is `.ect-type.ect-type--label` holding an `h2.ect-type__title`; the picture tile is `.ect-type.ect-type--image` with an `img`.

- Cards: `white`, a 3px `orange` border, `radius-card`, 20px padding and 20px between title and text; title `h2` size (45/54, 500) in `orange`, numbered and capitalised ("1. Landing Page"); text `body` (16/22.4, 300).
- Label tile: solid `orange`, no border, the section name centred in `white` 36/43.2 600 ("Tipuri de creare site web"): it replaces the section heading.
- Image tile: same outline, a centred illustration (`work.png`).
- Hover lifts a card 10px with `shadow-glow`. Rows are 11px apart horizontally and 13px vertically; the side card spans both rows.
- Phones stack everything in one column, titles at 7.5vw.
- Contrast: `orange` titles and the `white` label on `orange` are 2.4:1; the 45px titles count as large text but still miss 3:1. Kept as the site has them.

Hand-written from the Elementor section "Tipuri de creare site web" on /creare-site-web/ (post 3471).
