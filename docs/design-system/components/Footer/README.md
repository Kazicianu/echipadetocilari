# Footer

The shared footer, in the Leedlime style: logo, tagline and social links, three link columns (Servicii, Companie, Contact), the opening hours with an orange dot, the legal line, and the coffee-cup signature. All of it sits on the sky of the Bucharest illustration (the Romanian Athenaeum), which is the footer background, anchored to the bottom and running across the full width of the screen.

Markup: `footer.ect-footer` (keeps the Elementor classes `elementor-3355 elementor-location-footer` so the fixed "back to top" widget keeps its position) with `.ect-footer__inner` (`.ect-footer__top` grid: `.ect-footer__brand`, two `nav.ect-footer__col` and `.ect-footer__col--contact` with an `address`; then `p.ect-footer__status` and `.ect-footer__bottom` with the company line and `ul.ect-footer__legal`) and `.ect-footer__art` (decorative `img`, `alt=""`, inside an `aria-hidden` container).

- Content is `contact-max` (1200px) wide with a 20px gutter; the background is the sky colour `#e1effa` (sampled from the top of `bucuresti-cer-*.webp`) and the illustration runs edge to edge. Fonts and colours: Montserrat, `ink`, `ink-muted` (#55555e), `orange` for hover and the status dot.
- Column labels are 12px uppercase paragraphs, not headings. Links are 15px on 44px rows; the legal links and the social icons are 44px targets too.
- Mobile first: brand on top, Servicii and Companie in two columns, Contact below, legal links above the company line, all centred. From 768px the columns sit in one row under the brand; from 1025px brand and the three columns share one row.
- The 1536x1024 illustration (files `bucuresti-cer-768/1152/1536.webp`) is pulled up behind the text: from 768px at its natural height with `margin-top: calc(32px - 35.33%)`; on phones `height: max(416px, 66.667vw)`, cropped around the Athenaeum (`object-position: 53% 100%`), with `margin-top: calc(24px - 0.53 * max(416px, 66.667vw))`. The first pixels that are not sky are at 53.3% of its height. `.ect-footer__inner` has `z-index: 1` and the footer has `overflow: clip`.
- The bottom wave of the contact section above the footer has the same colour (rule at the end of `site-footer.css`, IDs 9884c62, bc8091b, 466dc9d, 228851e); a new page with a different contact section must be added there.
- The signature pill is white on the sky, orange with white text on hover/focus.
- `button.ect-consent-open` ("Setări cookie-uri") is hidden until `consent.js` runs and then reopens the `CookieConsent` banner.

Source of truth: `legacy-mirror/wp-content/ect-pages/site-footer.css` and `scripts/lib/site-footer.mjs`; the approved previews and screenshots are in `docs/ui/footer/`. The preview here hides the fixed back-to-top widget (see `BackToTop`).
