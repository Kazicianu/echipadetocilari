# LanguageSwitch

The RO | EN pill in the header that links each page to its translation.

Markup: `nav.ect-lang` with `aria-label="Language"` and two links carrying `hreflang`, `lang` and, on the current one, `aria-current="true"`. On the site the build injects it as `#ect-lang-switch` inside `.ect-lang-wrap`.

- Each half is at least 44 × 44px; labels are 12px/700 with 0.04em tracking.
- The current language is `white` on `orange`; the other is `orange` on `white` and turns `white` on `orange-logo` on hover. The halves are split by a 35% `orange` hairline.
- Always link to the matching page in the other language, never to the other homepage.
- Contrast: both states pair `orange` and `white` (2.4:1).

Hand-written from `scripts/i18n/lang-switcher.mjs`.
