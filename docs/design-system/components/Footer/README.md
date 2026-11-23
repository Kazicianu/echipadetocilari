# Footer

The shared footer uses a 2:1 illustration of two teammates on a balcony over a modern city. On desktop the image spans the footer edge to edge. The logo and four link groups sit on the pale sky to the left of the tree canopy.

## Content (same DOM order at every width)

1. `.ect-footer__brand`: only the logo (link to the home page of the language).
2. `nav` "Servicii" / "Services": the seven services from `routes` in RO, only the translated ones in EN.
3. `nav` "Companie" / "Company": Despre noi, Portofoliu.
4. "Contact" (`div` + `<address>`): phone (`0750 203 466` in RO, `+40 750 203 466` in EN) and email, then `ul.ect-footer__social` with Facebook and LinkedIn (`aria-label` "Facebook" / "LinkedIn").
5. `nav` "Legal" (same label in RO and EN): "Termeni și condiții" / "Terms and conditions", the privacy policy link (`data-ect-footer-privacy`) and `button.ect-consent-open` "Setări cookie-uri", hidden until `consent.js` runs and then reopening the `CookieConsent` banner (`li:has(> [hidden])` leaves no empty row).
6. The signature `p.ect-footer__madewith` ("Făcut cu [pahar] de Echipa de Tocilari"), after the grid and before the decorative `.ect-footer__art` layer, which is hidden from assistive technology.

Why only this (decided 23.11.2026): Law 365/2002 art. 5 and Law 31/1990 art. 74 ask for the company details (name, legal form, registered office, trade register number, CUI, share capital, contact, how prices read) to be easy to reach from every page, not to sit in the footer, so they live on the terms page that Legal links to. The privacy policy link (GDPR art. 12-13) and the cookie-settings button (Law 506/2004 art. 4, GDPR art. 7(3)) stay on every page. The tagline, the `© year · CUI · J40` line, the address, the opening hours and the Contact link under Company were removed; the hours stay on the contact page, where the JSON-LD `openingHours` is visible. No ANPC SAL/SOL pictograms: the agency sells only to companies and sole traders.

There are no headings in the footer: labels are `p.ect-footer__label` and the structure comes from the `nav` landmarks and their `aria-label`. `footer.ect-footer` keeps its Elementor classes for the fixed back-to-top control.

## Social icons

- A 44×44 solid `#fd8649` circle (`border-radius: 50%`, `box-shadow: 0 0 20px rgba(0,0,0,.05)`), 10px between the two, 10px under the email.
- The marks are the official solid Font Awesome Free 5 brands glyphs `facebook-f` (`0 0 320 512`) and `linkedin-in` (`0 0 448 512`), CC BY 4.0 (attribution comment in `site-footer.mjs`), `fill="currentColor"`, 18×18px in white, `aria-hidden="true"` and `focusable="false"`. The circle is the link's background, so the SVG has no frame of its own. Never hand-drawn letters.
- Hover and focus-visible keep the white mark and glow orange (`box-shadow: 0 0 20px rgba(253,134,73,.69)`, 0.2s); under `prefers-reduced-motion: no-preference` the circle also lifts `translateY(-2px)`. Focus adds a round 3px `#27272d` outline, 2px out.

## Layout

- The footer background uses `#f8f2eb`, sampled from the pale sky. A conditional mask blends the artwork into that background when the copy extends above it. From 640px, a subtle gradient softens the clouds behind the links and signature.
- The top-right canopy starts at roughly two-thirds of the image width. The QA script checks the background beneath every text line, icon and signature pill in both languages.
- Under 640px, the logo sits on the first row, with Services and Company side by side. Contact, Legal and the signature follow. The illustration is cropped around both teammates (`object-position: 88% 100%`). Labels 17px / 700, links 15px, 44px rows.
- 640-919px: the logo alone on top, Services on the left and Company, Contact and Legal stacked beside it, the signature below; the copy ends above the scene.
- At 920–1199px the logo sits above three columns, with Legal below Company. At least 170px of sky above the image keeps the signature above the skyline.
- From 1200px the logo, Services, Company, Contact and Legal share one row. The column gaps grow with the viewport so the row stays left of the canopy. The signature sits below the row with a 30px top margin.
- Labels are `#27272d`, 600 from 920px (15px, 16px from 1440px). Links are `#3d4459`, 400, 14px from 920px and 15px from 1440px, turning `#fd8649` on hover with a 3px `#27272d` focus outline. Rows are 28px with a fine pointer from 920px and 44px on touch screens (including the signature pill).
- Wide touch screens reserve extra sky below the taller link rows.
- The WebP sizes are `768×384`, `1152×576`, `1536×768` and `2048×1024` under `wp-content/ect-pages/footer/balcon-urban-v8-*.webp`. Below 640px the source size is 580px to account for the crop.
- The footer runs edge to edge with no gutter, border or rounded corners; the bottom wave of the contact form meets its near-white sky.
- The signature pill is `#f1f1f3` without a border on the sky, turning `#fd8649` with `#ffffff` text on hover/focus.

The [component preview](preview.html) uses the [shared footer stylesheet](../../../../legacy-mirror/wp-content/ect-pages/site-footer.css). The [build renderer](../../../../scripts/lib/site-footer.mjs) generates the Romanian and English footers, including their links. The fixed back-to-top widget has its own [preview](../BackToTop/preview.html).
