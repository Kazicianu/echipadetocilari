# CTAPanel

The orange call-to-action panel that closes a page section: eyebrow, title, one sentence, a white button and a small note.

Markup: `section.ect-cta-panel` with `p.ect-cta-panel__eyebrow`, `h2.ect-cta-panel__title`, `p.ect-cta-panel__text`, an `ect-btn ect-btn--on-brand` and `p.ect-cta-panel__note`. The consumer supplies the copy and the link (usually `/contact/` or the form anchor `#formular_contact_bottom`).

- One panel per page, before the contact section. Title in two short lines ("Tu ai ideea. Noi avem o mulțime de întrebări bune."), note as " · " separated facts ("Consultație gratuită · 30 de minute · Fără obligații").
- The gradient runs 270deg from `orange-logo` to `orange`, corners `radius-button`, glow `shadow-glow`.
- Contrast: `white` text on the gradient is 2.4 to 2.8:1; the button label `orange-hot` on `white` is 3.2:1.

Hand-written from `ect-pages/about.css` (`.ect-about-cta`).
