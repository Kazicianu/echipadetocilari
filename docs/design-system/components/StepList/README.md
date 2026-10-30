# StepList

A short numbered list in white leaf cards: how something works, in three plain sentences.

Markup: `h2.ect-steplist__title`, then `ol.ect-steplist` of `li`, each with `span.ect-steplist__num` and `p`. A `HandwrittenNote` (`ect-note--md`) may close it.

- Items: `white` with the leaf corner (`radius-card`, `radius-leaf-sm` bottom left), `shadow-card`, 16px × 20px × 18px padding, 14px apart.
- Number: a 28px `orange` disc with the digit in 13px 700 `white`. Text 16/1.55 400 in `ink`.
- Title `h3-xl` (28/1.25, 500, -0.02em), 22px on phones.
- Three to five steps, one sentence each, in the reader's terms ("Clientul caută pe Google ce vinzi.").
- Contrast: the `white` digit on `orange` is 2.4:1 (below AA for 13px); the step text passes.

Hand-written from the Google Ads hero ("Cum funcționează promovarea Google Ads").
