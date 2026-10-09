# Card

The leaf card: a white card with three 15px corners and one 70px corner bottom-left, the shape the site is recognised by.

Markup: `article.ect-card` with an optional `.ect-card__head` (a `.ect-card__num` such as "01" and an `.ect-card__icon`), a title `.ect-card__title` and text `.ect-card__text`. The consumer supplies the icon (inline SVG from Icons), the title, one or two sentences and, if the card leads somewhere, a `TextLink` in `.ect-card__link`.

- Service card (homepage, About): `ect-card--interactive` lifts 10px with the orange glow on hover and focus-within; use `.ect-card__icon--service` for the 75 × 66 service icons and `.ect-card__title--brand` for the `orange`, capitalised 20px title.
- Feature card (Google Ads): number top left, 44px stroke icon top right, `ink` title at 21 to 22px, no hover.
- Lay cards out in a grid with a 20px gap on mobile (two columns from 640px, three from 960px, 24px gap).
- Keep one idea per card. `orange` titles on `white` read 2.4:1; the `ink` title of the feature card reads 14.9:1.

Hand-written from the homepage icon-box containers (Elementor, radius 15/15/15/70, shadow 0 0 20px 5% black, hover glow), `ect-pages/about.css` (`.ect-about-specialty`) and `google-ads.css` (`.gads-feature`).
