# Band

A full-width link card: icon, title and one line of text, with an orange call to action at the end.

Markup: `a.ect-band` containing `.ect-band__icon` (a service icon, 52px), `.ect-band__text` with `.ect-band__title` and `.ect-band__desc`, and `.ect-band__cta`, which appends " →" itself. The consumer supplies the link, icon, title, description and CTA words.

- Use it to point from one section to a related service, as the homepage does from the service grid to website maintenance.
- On hover it lifts 10px with the orange glow. Below 768px it wraps: the text takes a full row and the corner becomes 40px.
- The CTA is `orange` 15px/600 on `white` (2.4:1).

Hand-written from `ect-pages/home.css` (`.ect-band`).
