# BentoTile

Small tiles that sum up how we work in numbers, laid out as a two-column bento with a call-to-action tile at the end.

Markup: `div.ect-bento` of `div.ect-tile` with a colour modifier (`--orange`, `--ink`, `--peach`), holding `span.ect-tile__big` (the number, or `--word` for a short word), `span.ect-tile__unit` and `p.ect-tile__text`. The first tile is `ect-tile--tall` and carries two `span.ect-tile__ring`s. The last is `a.ect-tile.ect-tile--cta` with `span.ect-tile__kicker`, `span.ect-tile__action` and `span.ect-tile__foot` (`span.ect-tile__note` + `span.ect-tile__arrow`).

- Tiles: 22px × 22px × 24px padding, `radius-card` corners with a `radius-leaf-sm` bottom-left; 14px apart.
- Number `stat` (88px max, 900, -0.04em, 0.9 line height); a word in `stat-word` (40px max) and `orange` on `ink`; unit 17/1.2 700; text 14.5/1.5 400.
- Colours: `orange` with `field` text and two 40% white rings in the corner; `ink` with `white` text; `peach` with `ink` text.
- CTA tile: the `orange-logo` to `orange-hot` gradient at 135deg, `shadow-cta-hot`, `white` text: kicker `micro-caps` (11px, 700, 0.1em, uppercase), action `bento-action` (24px, 800), note 13px 600 and a 44px `white` disc with "→" in `ink`. It lifts 4px on hover and the arrow slides 4px right.
- Numbers must be true and specific to the offer: "30 de minute", "4 pași", "1 om de contact", "În scris prețul și termenul".
- Contrast: `field` on `orange` is 2.4:1 and `white` on the CTA gradient 2.8:1 to 3.2:1, below AA; `orange` on `ink` 6.1:1 and `white` on `ink` 14.9:1 pass. Kept as the site has them.

Hand-written from `creare-magazin-online.css` (`.mg-bento`).
