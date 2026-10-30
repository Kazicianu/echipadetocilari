# ProcessGantt

The homepage "Cum lucrăm cu tine": the way we work drawn as a small Gantt chart, with phases on top and orange bars that overlap where tasks run in parallel.

Markup: `section.ect-process > .ect-process__inner` with `.ect-process__head` (`p.ect-process__eyebrow`, `h2.ect-process__title` with a `Highlight`, `p.ect-process__lead`, `ul.ect-process__chips` of `li.ect-chip`), an optional `p.ect-note.ect-process__scribble`, `p.ect-note.ect-note--hint.ect-process__swipe` for phones, then `div.ect-gantt[tabindex="0"][role="region"]` (`ul.ect-gantt__phases` + `ol.ect-gantt__steps` of `li.ect-step` with `h3.ect-step__title` and `p.ect-step__body`) and `p.ect-process__note`.

- Phases: five `peach-phase` labels with `radius-card`, 15/21 500, centred, 6px apart.
- Bars: `orange` with the leaf corner (`radius-card`, `radius-leaf-sm` bottom left), `shadow-card`; a 24px `white` disc with the step number in `orange` (CSS counter); title `step-title` (18/22, 500) and body 15/21 at 400 (not 300: thin strokes vanish on orange), both `white`.
- Lane rules every 20% in `ink-10`. The six bars are placed by `nth-child` (step 2 spans two phases and rises 68px into the first row): adding a step means re-cutting those rules.
- Below 1025px the chart turns into two columns of cards and the phases go; below 768px it becomes a 1198px strip that scrolls sideways, with the "Glisează și vezi mai mult" note above it.
- Under the chart, a 15/21 300 note in `ink-75` sets the expectation ("Proiectele au dată de livrare scrisă în ofertă.").
- The section sits on `BG-home-new4.png` (see `assets/Backgrounds`).
- Contrast: `white` on `orange` is 2.4:1, below AA; kept as the site has it.

Hand-written from `home.css` (`.ect-process`, `.ect-gantt`, `.ect-step`).
