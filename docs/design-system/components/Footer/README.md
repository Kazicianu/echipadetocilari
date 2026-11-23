# Footer

The shared footer is a full-width band with the extended office-balcony illustration (`1858×941`) spanning 100% of its surface edge to edge: the original 16:9 scene occupies the right 90% (two teammates on an office balcony above a tree-lined city), while seamlessly outpainted cityscape continues across the left 10% so there is zero left-edge fade. The copy sits on the open white sky in the Metricra layout: the logo top left with the two social discs stacked under it, then four short columns.

## Content (same DOM order at every width)

1. `.ect-footer__brand`: the logo (link to the home page of the language) and `ul.ect-footer__social` with Facebook and LinkedIn (`aria-label` "Facebook" / "LinkedIn").
2. `nav` "Servicii" / "Services": the seven services from `routes` in RO, only the translated ones in EN.
3. `nav` "Companie" / "Company": Despre noi, Portofoliu.
4. "Contact" (`div` + `<address>`): phone (`0750 203 466` in RO, `+40 750 203 466` in EN) and email.
5. `nav` "Legal" (same label in RO and EN): "Termeni și condiții" / "Terms and conditions", the privacy policy link (`data-ect-footer-privacy`) and `button.ect-consent-open` "Setări cookie-uri", hidden until `consent.js` runs and then reopening the `CookieConsent` banner (`li:has(> [hidden])` leaves no empty row).
6. The signature `p.ect-footer__madewith` ("Făcut cu [pahar] de Echipa de Tocilari"), after the grid and before the decorative `.ect-footer__art` layer, which is hidden from assistive technology.

Why only this (decided 23.11.2026): Law 365/2002 art. 5 and Law 31/1990 art. 74 ask for the company details (name, legal form, registered office, trade register number, CUI, share capital, contact, how prices read) to be easy to reach from every page, not to sit in the footer, so they live on the terms page that Legal links to. The privacy policy link (GDPR art. 12-13) and the cookie-settings button (Law 506/2004 art. 4, GDPR art. 7(3)) stay on every page. The tagline, the `© year · CUI · J40` line, the address, the opening hours and the Contact link under Company were removed; the hours stay on the contact page, where the JSON-LD `openingHours` is visible. No ANPC SAL/SOL pictograms: the agency sells only to companies and sole traders.

There are no headings in the footer: labels are `p.ect-footer__label` and the structure comes from the `nav` landmarks and their `aria-label`. `footer.ect-footer` keeps its Elementor classes for the fixed back-to-top control.

## Social icons

- A 40px white disc with a 2px `#fd8649` ring inside a 44×44 target (transparent 2px border, white `padding-box` background, inset ring).
- The marks are monoline "f" and "in" on a 24px grid (`fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, round caps and joins), shown at 20px in `#27272d`, `aria-hidden="true"` and `focusable="false"`. The disc is the frame, so the SVG has no square or circle of its own.
- Hover and focus fill the disc `#fd8649` with a white mark (0.2s, plus `scale(1.06)` only under `prefers-reduced-motion: no-preference`). Focus adds a round 3px `#27272d` outline, 2px out.

## Layout

- The footer background is `#fefefe`, the decoded colour of the illustration's flat sky, so the sky added above the image when the copy is taller than `1858:941` continues it without a seam. A conditional mask fades the top of the image only by that overflow (at most 14% on tablet, 18% on phones; 0px from 1200px), so the branches in the top right corner never show a cut edge.
- Free sky in the artwork (% of its width and height): `x 0-44%` down to `65%`, `46-52%` to `62%`, `54-57%` to `58%`, `59-64%` to `45%`, `66-80%` from `39%` to `28%` (the eaves), `x 82%` and beyond only below the branches (from the top edge to about `14%`). The QA script checks every text line, icon and the pill on pixels at 11 widths, RO and EN.
- Under 640px: the brand (80px logo, discs beside it), Services | Company in two columns, then Contact and Legal across the width, the signature, and the image cropped on the teammates (`object-position: 88% 100%`). Labels 17px / 700, links 15px, 44px rows.
- 640-919px: the brand on top, Services on the left and Company, Contact and Legal stacked beside it, the signature below; the copy ends above the scene.
- 920-1199px: the brand on top, the four columns in one row, the signature below. The sky is extended by 100px above the image in both languages, so Legal clears the eaves even with the shorter EN service list.
- 1200px and wider (Metricra): one row aligned at the top, an 84px brand column (logo, then the discs stacked under it on its axis) and Services, Company, Contact and Legal spread across 79% of the inner frame (ending at `x = 77.1%` of the footer, above the eaves and left of the branches). The signature follows under the row on the left. The footer is exactly as tall as the illustration.
- Labels are `#27272d`, 600 from 920px (15px, 16px from 1440px). Links are `#3d4459`, 400, 14px from 920px and 15px from 1440px, turning `#fd8649` on hover with a 3px `#27272d` focus outline. Rows are 28px with a fine pointer from 920px and 44px on touch screens (including the signature pill).
- The WebP comes in `768×389`, `1152×583`, `1536×778` and `1858×941` (native, so wide screens never upscale) under `wp-content/ect-pages/footer/balconul-tocilarilor-*.webp`; phones request the 580px candidate because the image is cropped wider than the screen.
- The footer runs edge to edge with no gutter, border or rounded corners; the bottom wave of the contact form meets its near-white sky.
- The signature pill is `#f1f1f3` without a border on the sky, turning `#fd8649` with `#ffffff` text on hover/focus.

The [component preview](preview.html) uses the [shared footer stylesheet](../../../../legacy-mirror/wp-content/ect-pages/site-footer.css). The [build renderer](../../../../scripts/lib/site-footer.mjs) generates the Romanian and English footers, including their links. The fixed back-to-top widget has its own [preview](../BackToTop/preview.html).
