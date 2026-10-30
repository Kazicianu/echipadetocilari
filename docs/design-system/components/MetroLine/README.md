# MetroLine

The store's "Linia Comenzii": what a store includes, drawn as a metro line with six stops that snakes from left to right and back.

Markup: `section.ect-metro > .ect-metro__inner` with `.ect-metro__head` (`.ect-metro__intro`: `p.ect-eyebrow.ect-eyebrow--deep` + `h2.ect-h2.ect-h2--sentence`; `.ect-metro__aside`: a paragraph and a `TextLink`), `.ect-metro__legend` (logo `img.ect-metro__badge`, `span.ect-metro__name`, `span.ect-metro__meta`), then `.ect-metro__rail` with four `div.ect-metro__track` pieces (`--top`, `--curve`, `--bottom`, `--v`) and `ol.ect-metro__line` of `li.ect-stop` (`span.ect-stop__dot` with a 24px stroke icon, `.ect-stop__card` with `span.ect-stop__num`, `h3.ect-stop__title`, `p.ect-stop__text`).

- Section: a `wash-turquoise` to `white` gradient (white from 72%).
- Track: a 22px `rail` band with a 2px dashed `white` line (85%) down its middle; on wide screens it runs along the top row, turns in a half-circle at the right and comes back along the second row.
- Stops: 40px discs with a 4px `white` ring and `shadow-station-dot`, one tint each in order: `peach`, `blob-turquoise-deep`, `blob-lavender-deep`, `cream`, `line-peach`, and `orange` (with a `white` icon) for the destination.
- Cards: `white` at 90% with 22px corners and `shadow-station`; the stop number in `micro-caps` `orange-deep` ("Oprirea 1", "Destinația"), title `station-title` (19/1.25, 600), text 14.5/1.55 300.
- Below 960px the line is vertical at the left and the cards stack.
- The live page also animates a delivery van along the track and draws clouds, trees and a box character; those are illustrations, not part of the component.
- Contrast: `orange-deep` numbers 5.9:1 and the card text 14.9:1 pass.

Hand-written from `creare-magazin-online.css` (`.mg-metro--play`, `.mg-st`, `.mg-track`).
