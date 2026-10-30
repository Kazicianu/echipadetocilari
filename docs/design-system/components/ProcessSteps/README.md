# ProcessSteps

The Google Ads launch process: four numbered circles on a dashed line, each with a card; the last, recurring step is the orange gradient.

Markup: `ol.ect-psteps` of `li`, each with `span.ect-psteps__num` and `.ect-psteps__card` (`h3`, `p`). Mark the recurring step `li.is-ongoing`: its card gets `.ect-psteps__head` (title + the `refresh` icon), the text and a `span.ect-psteps__tag` ("lună de lună"). Put a `HandwrittenNote` beside the section heading ("Nimic nu pornește fără aprobarea ta!").

- Circles: 64px `white` with a 2px `orange` border and the number in 24px 900 `orange`; joined by a 2px dashed `orange` line through their centres, from 12.5% to 87.5%.
- Cards: `white` leaf card (`radius-card`, `radius-leaf` bottom left), `shadow-card`, 24px × 22px × 30px; title 18/1.3 500; text 15/1.55 300.
- Recurring step: circle and card in the `orange-logo` to `orange` gradient with `shadow-glow`, `white` text at 400, and a `white` tag with an `orange` 12px 600 label.
- Below 900px the steps stack: 44px circles at the left (18px numbers), the dashed line vertical through them, cards to the right.
- Use it for a short, strictly ordered process where the order is the point (approval before spending).
- Contrast: `orange` numbers on `white` (2.4:1) and `white` text on the gradient (2.4:1 to 2.8:1) are below AA; kept as the site has them.

Hand-written from the Google Ads process section (inline styles) and `google-ads.css` (`.gads-process-steps`).
