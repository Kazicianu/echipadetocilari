# ScopePanel

Two panels that say plainly what the price includes and what it does not, with the facts underneath.

Markup: `div.ect-scope` with `h2.ect-scope__title` (one `Highlight`, `ect-hl--wide`), `.ect-scope__row` of two `.ect-scope__panel`s, and `.ect-scope__notes` of `dl.ect-scope__facts`. The "in" panel (`--in`) has `.ect-scope__head` (`h3.ect-scope__name`, `p.ect-scope__for`), `ul.ect-scope__list` and `.ect-scope__you` (a `label-caps` heading, `ul.ect-chips` of `ect-chip--flat`, a note). The "out" panel (`--out`) has groups (`.ect-scope__group`: label + `ul.ect-scope__list--plus`), `p.ect-scope__promise` and `p.ect-scope__scribble`.

- Title: 58px 800, -0.035em, centred, `ink`, with the key words in an orange chip ("Ce intră în preț și ce nu").
- In: `orange` with `field` text, `radius-card` corners and a 70px bottom-left leaf; name `panel-title` (45px, 900, uppercase); list 16/1.5 400 with 24px `white` discs holding an `ink` check; bold the part that answers the question.
- Out: `white` with a 2px dashed `orange` border; name `orange`; labels `ink-muted`; `orange` plus discs; the promise in an `orange` bar (15px 600 `field`) and a `scribble-lg` note sitting on the dashed border ("Fără asteriscuri.").
- Facts: `label-caps` terms and 14 to 15px definitions, under a `line` rule.
- Contrast: `field` on `orange` is 2.4:1, below AA (the 45px name still misses 3:1); kept as the site has it. The `ink` check on `white` and the out panel text pass.

Hand-written from `creare-magazin-online.css` (`.mg-scope`).
