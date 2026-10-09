# HandwrittenNote

A short handwritten aside in Caveat, tilted, that adds a wink next to a heading or an illustration.

Markup: `p.ect-note` (add `ect-note--lg` for the 28px size), optionally followed by the hand-drawn arrow (`swipe-arrow.svg`, class `ect-note__arrow`). Set `--r` to change the tilt.

- One per section at most, three to six words, never information people need: "Și fără ședințe inutile!", "Da, numele ni se potrivește.", "Ideile bune cresc împreună."
- 23px at -7deg next to a section header (homepage), 28px at -3deg in a story block (About). The font is subset to ASCII and Romanian, so keep to those characters.
- On mobile the homepage uses it at 14px for the "Glisează și vezi mai mult" hint above the scrollable chart.

Hand-written from `ect-pages/home.css` (`.ect-process__scribble`, `.ect-process__swipe`) and `about.css` (`.ect-about-handwritten`).
