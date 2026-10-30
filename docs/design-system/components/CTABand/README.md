# CTABand

The orange band that asks for the conversation in the middle of the homepage: a two-line title and the free consultation button.

Markup: `div.ect-cta-band` with `h2.ect-cta-band__title` (the second line in `b`) and `a.ect-btn.ect-btn--hero.ect-btn--on-brand`.

- Band: the `orange-logo` to `orange` gradient at 270deg, `radius-button` corners, `shadow-glow`, 40px padding, at most `content-max` wide; title on the left, button on the right.
- Title `cta-title` (35/42, 500) in `white`, the second line bold: who we are, then what we are to the reader ("Vorbește cu Echipa de Tocilari, <b>agenția ta de marketing digital</b>").
- Button: the hero button with a `white` border; it fills `orange` on hover.
- One per page, after the services, never next to the contact section.
- Below 1025px the button drops under the title.
- Contrast: `white` on the gradient is 2.4:1 to 2.8:1, below AA; kept as the site has it. The button label is `orange` on `white` (2.4:1).

Hand-written from the homepage Elementor CTA (post 3381).
