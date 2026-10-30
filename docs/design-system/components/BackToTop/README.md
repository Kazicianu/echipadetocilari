# BackToTop

The round orange button fixed to the bottom-right corner of every page that scrolls back to the header.

Markup: `a.ect-to-top[href="#top"]` with the up arrow (`ui-arrow-up.svg`, inline, `currentColor`) and an `aria-label` ("Înapoi sus"). Add `ect-to-top--fixed` to pin it 50px from the right and bottom edges.

- 54 × 52, `orange` with `shadow-glow-strong`; the arrow is `white-warm` with a soft dark text shadow.
- It grows to 110% on hover, focus and press (none with reduced motion).
- Keep it clear of the cookie banner, which sits in the bottom-left corner.
- Contrast: the arrow is `white-warm` on `orange` (2.4:1), below the 3:1 a meaningful icon needs; kept as the site has it.

Hand-written from the Elementor footer (post 3355, the fixed button widget).
