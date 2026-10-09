# BackToTop

The round orange button fixed to the bottom-right corner that scrolls back to the top.

Markup: `a.ect-to-top` linking to `#top`, with the Font Awesome arrow-up icon and an accessible name (`aria-label="Înapoi sus"`). The site fixes it to the viewport corner.

- 54 × 52px, `orange` with `shadow-glow-strong`; the arrow is `white-warm`. It grows to 110% on hover, focus and press (0.3s).
- It covers the bottom-right corner: keep content and CTAs clear of it (the homepage band adds 90px of right padding between 768 and 1200px for this).
- Contrast: the `white-warm` arrow on `orange` is 2.4:1.

Hand-written from the Elementor footer template (button 78c37fa2, Elementor "grow" animation).
