# HandwrittenNote

A short handwritten aside in Caveat, tilted, that adds the human voice next to a section title.

Markup: `p.ect-note` (add `aria-hidden="true"` when it repeats nearby text). Sizes: default `scribble` (23px), `--md` 24px, `--lg` `scribble-lg` (27px); `--hint` is the small "Glisează și vezi mai mult" with the drawn arrow (`svg.ect-note__arrow`). Tilt with `--r` (default -7deg; -5deg for the larger ones).

- One per section at most, in `ink`, beside the heading or at the edge of a card, never inside running text.
- Write it as a quick aside with an exclamation or a full stop: "Și fără ședințe inutile!", "Nimic nu pornește fără aprobarea ta!", "Noi ne ocupăm de toți pașii.", "Fără asteriscuri."
- The font is `hand` (Caveat ECT, 600, subset to ASCII and Romanian). Never set a heading or a button in it.
- The swipe hint shows only on phones, under a chart or a row that scrolls sideways.

Hand-written from `home.css` (`.ect-process__scribble`, `.ect-process__swipe`), `creare-magazin-online.css` (`.mg-scope__scribble`) and the Google Ads inline styles.
