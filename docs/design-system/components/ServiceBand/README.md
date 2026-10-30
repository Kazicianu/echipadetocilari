# ServiceBand

A full-width card that closes the homepage service grid with the monthly maintenance offer.

Markup: `a.ect-band` holding `span.ect-band__icon` (the `service-maintenance.svg` mark, 52px), `span.ect-band__text` with `span.ect-band__title` and `span.ect-band__desc`, and `span.ect-band__cta` (the arrow is added by CSS).

- Same leaf card as `ServiceCard`: `white`, `radius-card` with a `radius-leaf` bottom-left corner, `shadow-card`, 26px × 34px padding; lifts 10px with `shadow-card-hover` on hover.
- Title 20/30 500 capitalised in `ink`; text `body`; the call to action 15px 600 `orange` with "→".
- Use it once, after a grid of tiles, for an offer that is ongoing rather than a project.
- On phones it wraps: icon and call to action share the first row, the text takes the full width.

Hand-written from `home.css` (`.ect-band`).
