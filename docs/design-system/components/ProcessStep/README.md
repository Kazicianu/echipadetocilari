# ProcessStep

An orange step card with a white title, a short body and a round number badge, used for the homepage process.

Markup: `ol.ect-step-list` with `li.ect-step` items, each holding `h3.ect-step__title` and `p.ect-step__body`. The badge counts itself (CSS counter). The consumer supplies four to six steps.

- Titles are two or three words in the "noi" voice ("Ne scrii", "Vorbim 30 de minute", "Primești planul"); bodies one or two short sentences.
- One column on mobile, two from 768px. On the homepage the steps become a five-phase timeline from 1025px; that chart is built separately.
- The body uses weight 400 because thin text fades on orange. Contrast: `white` on `orange` is 2.4:1 and the `orange` number on its `white` badge is 2.4:1.

Hand-written from `ect-pages/home.css` (`.ect-step`).
